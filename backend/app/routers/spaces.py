from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from typing import List
from app.database import get_db
from app.models import Space, SpaceCreate, SpaceResponse, SpaceMember, User
from app.auth import get_current_user

router = APIRouter(prefix="/spaces", tags=["spaces"])

@router.post("/", response_model=SpaceResponse, status_code=status.HTTP_201_CREATED)
async def create_space(
    space_in: SpaceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_space = Space(name=space_in.name, owner_id=current_user.id)
    db.add(new_space)
    await db.commit()
    await db.refresh(new_space)

    member = SpaceMember(space_id=new_space.id, user_id=current_user.id, role="owner")
    db.add(member)
    await db.commit()

    return new_space

@router.get("/", response_model=List[SpaceResponse])
async def get_my_spaces(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    statement = select(Space).join(SpaceMember).where(SpaceMember.user_id == current_user.id)
    results = await db.execute(statement)
    spaces = results.scalars().all()
    return spaces

@router.post("/{space_id}/invite")
async def invite_to_space(
    space_id: int,
    email: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SpaceMember).where(SpaceMember.space_id == space_id, SpaceMember.user_id == current_user.id)
    res = await db.execute(stmt)
    if not res.scalars().first():
        raise HTTPException(status_code=403, detail="Not authorized to invite to this space")
    
    stmt_user = select(User).where(User.email == email)
    res_user = await db.execute(stmt_user)
    invited_user = res_user.scalars().first()
    
    if not invited_user:
        raise HTTPException(status_code=404, detail="User with this email not found")
        
    stmt_check = select(SpaceMember).where(SpaceMember.space_id == space_id, SpaceMember.user_id == invited_user.id)
    res_check = await db.execute(stmt_check)
    if res_check.scalars().first():
        raise HTTPException(status_code=400, detail="User is already a member of this space")
        
    new_member = SpaceMember(space_id=space_id, user_id=invited_user.id, role="member")
    db.add(new_member)
    await db.commit()
    
    return {"message": f"User {email} added to space successfully"}
