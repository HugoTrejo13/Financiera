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
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:5175", 
        "http://localhost:5176", 
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schemas ---
class DebtBase(BaseModel):
    description: str = Field(..., min_length=1)
    purchase_date: str = Field(..., min_length=1)  # YYYY-MM-DD
    payment_type: str = Field(..., pattern="^(contado|meses)$")
    price: float = Field(..., gt=0)
    months: int | None = Field(default=None, gt=0)
    has_interest: bool | None = Field(default=None)
    interest_rate: float = Field(default=0.0, ge=0)
    paid_months: int | None = Field(default=0, ge=0)

class DebtCreate(DebtBase):
    pass

class DebtUpdate(BaseModel):
    description: str | None = None
    remaining_amount: float | None = None
    interest_rate: float | None = None
    monthly_payment: float | None = None
    paid_months: int | None = None

class DebtResponse(DebtBase):
    id: int
    total_amount: float
    remaining_amount: float
    monthly_payment: float

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

# ─── Noticias ────────────────────────────────────────────────────────────────
@app.get("/api/news/", tags=["News"])
async def get_news(page: int = 1, page_size: int = 6, q: str | None = None):
    """Proxy de noticias financieras con caché de 30 min."""
    from app.news import fetch_news
    return await fetch_news(page=page, page_size=page_size, q=q)
