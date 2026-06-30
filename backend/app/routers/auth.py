from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from ..database import get_db
from ..models import User
from ..auth import verify_password, get_password_hash, create_access_token, get_current_user
from pydantic import BaseModel, field_validator
import re
from ..database import get_db, limiter

router = APIRouter(prefix="/auth", tags=["auth"])

class UserCreate(BaseModel):
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if "@" not in v:
            raise ValueError('El correo electrónico debe contener un símbolo de arroba (@).')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        errors = []
        if len(v) < 8:
            errors.append('mínimo 8 caracteres')
        if not re.search(r'[A-Z]', v):
            errors.append('una mayúscula')
        if not re.search(r'\d', v):
            errors.append('un número')
        if not re.search(r'[@$!%*?&]', v):
            errors.append('un símbolo especial (@$!%*?&)')
        
        if errors:
            raise ValueError('La contraseña debe incluir: ' + ', '.join(errors) + '.')
        return v

@router.post("/register", response_model=dict)
@limiter.limit("5/minute")
async def register(request: Request, user: UserCreate, db: AsyncSession = Depends(get_db)):
    statement = select(User).where(User.email == user.email)
    result = await db.execute(statement)
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    new_user = User(
        email=user.email,
        hashed_password=get_password_hash(user.password)
    )
    db.add(new_user)
    await db.commit()
    return {"message": "User created successfully"}

@router.post("/token")
@limiter.limit("5/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    statement = select(User).where(User.email == form_data.username)
    result = await db.execute(statement)
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {"id": current_user.id, "email": current_user.email}
