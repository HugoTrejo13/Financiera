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
    alias: Optional[str] = Field(default=None)
    photo_url: Optional[str] = Field(default=None)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    debts: List["Debt"] = Relationship(back_populates="owner")
    spaces_owned: List["Space"] = Relationship(back_populates="owner")
    space_memberships: List["SpaceMember"] = Relationship(back_populates="user")

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

class SpaceMember(SQLModel, table=True):
    __tablename__ = "space_members"
    id: Optional[int] = Field(default=None, primary_key=True)
    space_id: int = Field(foreign_key="spaces.id")
    user_id: int = Field(foreign_key="users.id")
    role: str = Field(default="member") # owner, admin, member
    joined_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    space: Optional[Space] = Relationship(back_populates="members")
    user: Optional["User"] = Relationship(back_populates="space_memberships")



# --- Schemas ---
class DebtCreate(DebtBase):
    pass

class UserProfileUpdate(SQLModel):
    alias: Optional[str] = None
    photo_url: Optional[str] = None

class UserPasswordUpdate(SQLModel):
    current_password: str
    new_password: str

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
