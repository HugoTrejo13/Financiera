from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from decimal import Decimal

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
    spaces_owned: List["Space"] = Relationship(back_populates="owner")
    space_memberships: List["SpaceMember"] = Relationship(back_populates="user")
    investment_transactions: List["InvestmentTransaction"] = Relationship(back_populates="user")

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

class Space(SQLModel, table=True):
    __tablename__ = "spaces"
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    owner_id: int = Field(foreign_key="users.id")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    owner: Optional["User"] = Relationship(back_populates="spaces_owned")
    members: List["SpaceMember"] = Relationship(back_populates="space")
    investment_plans: List["InvestmentPlan"] = Relationship(back_populates="space")

class SpaceMember(SQLModel, table=True):
    __tablename__ = "space_members"
    id: Optional[int] = Field(default=None, primary_key=True)
    space_id: int = Field(foreign_key="spaces.id")
    user_id: int = Field(foreign_key="users.id")
    role: str = Field(default="member") # owner, admin, member
    joined_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    space: Optional[Space] = Relationship(back_populates="members")
    user: Optional["User"] = Relationship(back_populates="space_memberships")

class InvestmentPlanBase(SQLModel):
    name: str
    target_amount: float
    current_amount: float = 0.0
    monthly_contribution: float = 0.0
    expected_return_rate: float = 0.0
    target_date: str
    icon: str = "PiggyBank"
    color: str = "#10b981"
    space_id: Optional[int] = Field(default=None, foreign_key="spaces.id")

class InvestmentPlan(InvestmentPlanBase, table=True):
    __tablename__ = "investment_plans"
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    owner: Optional["User"] = Relationship(back_populates="investment_plans")
    space: Optional[Space] = Relationship(back_populates="investment_plans")
    transactions: List["InvestmentTransaction"] = Relationship(back_populates="plan")

class InvestmentTransaction(SQLModel, table=True):
    __tablename__ = "investment_transactions"
    id: Optional[int] = Field(default=None, primary_key=True)
    plan_id: int = Field(foreign_key="investment_plans.id")
    user_id: int = Field(foreign_key="users.id")
    amount: float
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    plan: Optional[InvestmentPlan] = Relationship(back_populates="transactions")
    user: Optional["User"] = Relationship(back_populates="investment_transactions")

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

class SpaceCreate(SQLModel):
    name: str

class SpaceResponse(SQLModel):
    id: int
    name: str
    owner_id: int
    created_at: datetime

class InvestmentPlanCreate(InvestmentPlanBase):
    pass

class InvestmentPlanUpdate(SQLModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class InvestmentPlanResponse(InvestmentPlanBase):
    id: int
    owner_id: Optional[int]
    created_at: datetime

class InvestmentTransactionCreate(SQLModel):
    amount: float

class InvestmentTransactionResponse(SQLModel):
    id: int
    plan_id: int
    user_id: int
    amount: float
    created_at: datetime

# --- Budget Models ---
class MonthlyBudgetBase(SQLModel):
    category_id: int = Field(foreign_key="categories.id")
    month: str  # Format: "YYYY-MM"
    budget_amount: float
    spent_amount: float = 0.0
    alert_threshold: float = 0.8  # 80% por defecto

class MonthlyBudget(MonthlyBudgetBase, table=True):
    __tablename__ = "monthly_budgets"
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: Optional[int] = Field(default=None, foreign_key="users.id")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    category: Optional[Category] = Relationship()

class MonthlyBudgetCreate(SQLModel):
    category_id: int
    month: str
    budget_amount: float
    alert_threshold: float = 0.8

class MonthlyBudgetUpdate(SQLModel):
    budget_amount: Optional[float] = None
    spent_amount: Optional[float] = None
    alert_threshold: Optional[float] = None

class MonthlyBudgetResponse(MonthlyBudgetBase):
    id: int
    owner_id: int
    category: Optional[CategoryBase] = None
    percentage_used: float = 0.0
    is_over_budget: bool = False
    should_alert: bool = False

class CategorySpendingReport(SQLModel):
    category_id: int
    category_name: str
    category_icon: str
    category_color: str
    total_spent: float
    budget_amount: float
    percentage_used: float
    is_over_budget: bool
    transaction_count: int
