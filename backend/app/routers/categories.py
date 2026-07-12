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

from app.auth import get_current_user

@router.get("/reports/category-spending", response_model=List[models.CategorySpendingReport])
async def get_category_spending_report(
    month: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Obtener reporte de gastos por categoría para un mes específico"""
    user_id = current_user.id
    categories_result = await db.execute(select(models.Category))
    categories = categories_result.scalars().all()
    
    reports = []
    for category in categories:
        debts_result = await db.execute(
            select(models.Debt)
            .where(
                models.Debt.owner_id == user_id,
                models.Debt.category_id == category.id,
                models.Debt.purchase_date.startswith(month)
            )
        )
        debts = debts_result.scalars().all()
        
        total_spent = sum(d.price if d.payment_type == "contado" else d.monthly_payment for d in debts)
        
        report = models.CategorySpendingReport(
            category_id=category.id,
            category_name=category.name,
            category_icon=category.icon,
            category_color=category.color,
            total_spent=total_spent,
            budget_amount=0.0,
            percentage_used=0.0,
            is_over_budget=False,
            transaction_count=len(debts)
        )
        reports.append(report)
    
    reports.sort(key=lambda x: x.total_spent, reverse=True)
    return reports
