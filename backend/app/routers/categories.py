from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List

from app.database import get_db
from app import models

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("/", response_model=List[models.CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Obtener todas las categorías disponibles"""
    result = await db.execute(select(models.Category))
    return result.scalars().all()
