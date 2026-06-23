from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models
from app import schemas

router = APIRouter(prefix="/api/debts", tags=["Debts"])

# Simulacion auth
def get_current_user_id() -> int:
    return 1

@router.get("/", response_model=List[schemas.DebtResponse])
def get_debts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    return db.query(models.Debt).filter(models.Debt.owner_id == user_id).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.DebtResponse)
def create_debt(debt: schemas.DebtCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
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
        owner_id=user_id
    )
    db.add(db_debt)
    db.commit()
    db.refresh(db_debt)
    return db_debt

@router.put("/{debt_id}", response_model=schemas.DebtResponse)
def update_debt(debt_id: int, debt_update: schemas.DebtUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_debt = db.query(models.Debt).filter(models.Debt.id == debt_id, models.Debt.owner_id == user_id).first()
    if not db_debt:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    
    update_data = debt_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_debt, key, value)
        
    db.commit()
    db.refresh(db_debt)
    return db_debt

@router.delete("/{debt_id}")
def delete_debt(debt_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_debt = db.query(models.Debt).filter(models.Debt.id == debt_id, models.Debt.owner_id == user_id).first()
    if not db_debt:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    
    db.delete(db_debt)
    db.commit()
    return {"message": "Deuda eliminada"}
