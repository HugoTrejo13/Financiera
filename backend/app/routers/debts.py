from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List
from sqlalchemy.orm import selectinload

from app.database import get_db
from app import models
from app.auth import get_current_user

from typing import List, Optional

router = APIRouter(prefix="/api/debts", tags=["Debts"])

@router.get("/", response_model=List[models.DebtResponse])
async def get_debts(
    skip: int = 0,
    limit: int = 100,
    month: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = (
        select(models.Debt)
        .options(selectinload(models.Debt.category))
        .where(models.Debt.owner_id == current_user.id)
    )
    if month:
        query = query.where(models.Debt.purchase_date.startswith(month))

    result = await db.execute(query.offset(skip).limit(limit))
    debts = result.scalars().all()
    return debts

@router.get("/monthly-recap")
async def get_monthly_recap(
    month: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    result = await db.execute(
        select(models.Debt)
        .options(selectinload(models.Debt.category))
        .where(models.Debt.owner_id == current_user.id)
        .where(models.Debt.purchase_date.startswith(month))
    )
    debts = result.scalars().all()

    total_spent = sum(d.price for d in debts)
    total_count = len(debts)
    impulsive_count = sum(1 for d in debts if d.is_impulsive)

    highest_purchase = max(debts, key=lambda d: d.price) if debts else None

    category_totals = {}
    for d in debts:
        cat_name = d.category.name if d.category else "Sin categoría"
        cat_icon = d.category.icon if d.category else "📌"
        if cat_name not in category_totals:
            category_totals[cat_name] = {"total": 0.0, "icon": cat_icon}
        category_totals[cat_name]["total"] += d.price

    top_category = max(category_totals.items(), key=lambda item: item[1]["total"]) if category_totals else None

    return {
        "month": month,
        "total_spent": total_spent,
        "total_count": total_count,
        "impulsive_count": impulsive_count,
        "impulsive_percentage": round((impulsive_count / total_count * 100), 1) if total_count > 0 else 0,
        "highest_purchase": {
            "description": highest_purchase.description,
            "price": highest_purchase.price
        } if highest_purchase else None,
        "top_category": {
            "name": top_category[0],
            "icon": top_category[1]["icon"],
            "total": top_category[1]["total"],
            "percentage": round((top_category[1]["total"] / total_spent * 100), 1) if total_spent > 0 else 0
        } if top_category else None
    }

@router.post("/", response_model=models.DebtResponse)
async def create_debt(debt: models.DebtCreate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):

    if debt.payment_type == "contado":
        total_amount = debt.price
        monthly_payment = 0.0
    else:
        if debt.has_interest and debt.interest_rate > 0:
            total_amount = debt.price + (debt.price * (debt.interest_rate / 100.0))
        else:
            total_amount = debt.price
            
        months = debt.months if (debt.months and debt.months > 0) else 1
        monthly_payment = total_amount / months

    db_debt = models.Debt(
        **debt.model_dump(),
        total_amount=total_amount,
        remaining_amount=total_amount,
        monthly_payment=monthly_payment,
        owner_id=current_user.id
    )
    db.add(db_debt)
    await db.commit()
    await db.refresh(db_debt)
    
    # Cargar la relación de categoría si existe
    if db_debt.category_id:
        result = await db.execute(
            select(models.Debt)
            .options(selectinload(models.Debt.category))
            .where(models.Debt.id == db_debt.id)
        )
        db_debt = result.scalar_one()
    
    return db_debt

@router.put("/{debt_id}", response_model=models.DebtResponse)
async def update_debt(debt_id: int, debt_update: models.DebtUpdate, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):

    result = await db.execute(select(models.Debt).where(models.Debt.id == debt_id, models.Debt.owner_id == current_user.id))
    db_debt = result.scalar_one_or_none()
    if not db_debt:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    
    update_data = debt_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_debt, key, value)
        
    await db.commit()
    await db.refresh(db_debt)
    
    # Cargar la relación de categoría si existe
    if db_debt.category_id:
        result = await db.execute(
            select(models.Debt)
            .options(selectinload(models.Debt.category))
            .where(models.Debt.id == db_debt.id)
        )
        db_debt = result.scalar_one()
    
    return db_debt

@router.delete("/{debt_id}")
async def delete_debt(debt_id: int, db: AsyncSession = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    result = await db.execute(select(models.Debt).where(models.Debt.id == debt_id, models.Debt.owner_id == current_user.id))
    db_debt = result.scalar_one_or_none()
    if not db_debt:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    
    await db.delete(db_debt)
    await db.commit()
    return {"message": "Deuda eliminada"}
