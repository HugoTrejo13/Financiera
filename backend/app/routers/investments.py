from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, or_
from typing import List
from app.database import get_db
from app.models import (
    InvestmentPlan, InvestmentPlanCreate, InvestmentPlanUpdate, InvestmentPlanResponse,
    InvestmentTransaction, InvestmentTransactionCreate, InvestmentTransactionResponse,
    User, SpaceMember, Space
)
from app.auth import get_current_user

router = APIRouter(prefix="/investments", tags=["investments"])

@router.post("/", response_model=InvestmentPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_investment_plan(
    plan_in: InvestmentPlanCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if plan_in.space_id:
        stmt = select(SpaceMember).where(SpaceMember.space_id == plan_in.space_id, SpaceMember.user_id == current_user.id)
        res = await db.execute(stmt)
        if not res.scalars().first():
            raise HTTPException(status_code=403, detail="Not authorized in this space")
    
    new_plan = InvestmentPlan(
        **plan_in.model_dump(),
        owner_id=current_user.id if not plan_in.space_id else None
    )
    db.add(new_plan)
    await db.commit()
    await db.refresh(new_plan)
    return new_plan

@router.get("/", response_model=List[InvestmentPlanResponse])
async def get_my_investment_plans(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Obtener metas personales o metas en espacios donde el usuario es miembro
    stmt_spaces = select(SpaceMember.space_id).where(SpaceMember.user_id == current_user.id)
    res_spaces = await db.execute(stmt_spaces)
    user_space_ids = res_spaces.scalars().all()

    stmt = select(InvestmentPlan).where(
        or_(
            InvestmentPlan.owner_id == current_user.id,
            InvestmentPlan.space_id.in_(user_space_ids) if user_space_ids else False
        )
    )
    res = await db.execute(stmt)
    plans = res.scalars().all()
    return plans

@router.post("/{plan_id}/contribute", response_model=InvestmentTransactionResponse)
async def contribute_to_plan(
    plan_id: int,
    tx_in: InvestmentTransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    plan = await db.get(InvestmentPlan, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
        
    if plan.space_id:
        stmt = select(SpaceMember).where(SpaceMember.space_id == plan.space_id, SpaceMember.user_id == current_user.id)
        res = await db.execute(stmt)
        if not res.scalars().first():
            raise HTTPException(status_code=403, detail="Not authorized to contribute to this space plan")
    elif plan.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to contribute to this plan")

    tx = InvestmentTransaction(
        plan_id=plan.id,
        user_id=current_user.id,
        amount=tx_in.amount
    )
    db.add(tx)
    
    plan.current_amount += tx_in.amount
    db.add(plan)
    
    await db.commit()
    await db.refresh(tx)
    
    return tx
