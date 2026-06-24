from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class CategoryBase(SQLModel):
    name: str = Field(unique=True, nullable=False)
    icon: str = Field(nullable=False)
    color: str = Field(nullable=False)

class Category(CategoryBase, table=True):
    __tablename__ = "categories"
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    debts: List["Debt"] = Relationship(back_populates="category")

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    debts: List["Debt"] = Relationship(back_populates="owner")
    investment_plans: List["InvestmentPlan"] = Relationship(back_populates="owner")

class DebtBase(SQLModel):
    description: str
    purchase_date: str
    payment_type: str
    price: float
    months: Optional[int] = None
    has_interest: Optional[bool] = None
    interest_rate: float = 0.0
    paid_months: int = 0
    category_id: Optional[int] = Field(default=None, foreign_key="categories.id")

class Debt(DebtBase, table=True):
    __tablename__ = "debts"
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: Optional[int] = Field(default=None, foreign_key="users.id")
    total_amount: float
    remaining_amount: float
    monthly_payment: float
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    owner: Optional[User] = Relationship(back_populates="debts")
    category: Optional[Category] = Relationship(back_populates="debts")

class InvestmentPlan(SQLModel, table=True):
    __tablename__ = "investment_plans"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    target_amount: float
    current_amount: float = 0.0
    monthly_contribution: float
    expected_return_rate: float
    target_date: str
    owner_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    owner: Optional[User] = Relationship(back_populates="investment_plans")

# --- Schemas ---
class DebtCreate(DebtBase):
    pass

class DebtUpdate(SQLModel):
    description: Optional[str] = None
    remaining_amount: Optional[float] = None
    interest_rate: Optional[float] = None
    monthly_payment: Optional[float] = None
    paid_months: Optional[int] = None

class DebtResponse(DebtBase):
    id: int
    total_amount: float
    remaining_amount: float
    monthly_payment: float
    category: Optional[CategoryBase] = None

class CategoryResponse(CategoryBase):
    id: int
