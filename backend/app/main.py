from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, Field

from app.database import settings, get_db
from app import models

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---
class DebtBase(BaseModel):
    description: str = Field(..., min_length=1)
    total_amount: float = Field(..., gt=0)
    interest_rate: float = Field(..., ge=0)
    monthly_payment: float = Field(..., gt=0)
    due_date: str

class DebtCreate(DebtBase):
    pass

class DebtUpdate(BaseModel):
    description: str | None = None
    remaining_amount: float | None = None
    interest_rate: float | None = None
    monthly_payment: float | None = None
    due_date: str | None = None

class DebtResponse(DebtBase):
    id: int
    remaining_amount: float

    class Config:
        from_attributes = True

# --- Rutas ---
@app.get("/")
def read_root():
    return {"message": "Bienvenido a Financiera V2 API. Ve a /docs para ver la documentación."}

# Simulación de usuario logueado (hasta agregar Supabase Auth)
def get_current_user_id() -> int:
    return 1

@app.get("/api/debts/", response_model=List[DebtResponse], tags=["Debts"])
def get_debts(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    return db.query(models.Debt).filter(models.Debt.owner_id == user_id).all()

@app.post("/api/debts/", response_model=DebtResponse, tags=["Debts"])
def create_debt(debt: DebtCreate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_debt = models.Debt(
        **debt.model_dump(),
        remaining_amount=debt.total_amount,
        owner_id=user_id
    )
    db.add(db_debt)
    db.commit()
    db.refresh(db_debt)
    return db_debt

@app.put("/api/debts/{debt_id}", response_model=DebtResponse, tags=["Debts"])
def update_debt(debt_id: int, debt_update: DebtUpdate, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_debt = db.query(models.Debt).filter(models.Debt.id == debt_id, models.Debt.owner_id == user_id).first()
    if not db_debt:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    
    update_data = debt_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_debt, key, value)
        
    db.commit()
    db.refresh(db_debt)
    return db_debt

@app.delete("/api/debts/{debt_id}", tags=["Debts"])
def delete_debt(debt_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    db_debt = db.query(models.Debt).filter(models.Debt.id == debt_id, models.Debt.owner_id == user_id).first()
    if not db_debt:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    
    db.delete(db_debt)
    db.commit()
    return {"message": "Deuda eliminada"}
