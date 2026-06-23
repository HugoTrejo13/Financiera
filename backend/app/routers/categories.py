from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models
from app import schemas

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("/", response_model=List[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Obtener todas las categorías disponibles"""
    return db.query(models.Category).all()
