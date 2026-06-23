from pydantic import BaseModel, Field

class CategoryResponse(BaseModel):
    id: int
    name: str
    icon: str
    color: str
    
    class Config:
        from_attributes = True

class DebtBase(BaseModel):
    description: str = Field(..., min_length=1)
    purchase_date: str = Field(..., min_length=1)  # YYYY-MM-DD
    payment_type: str = Field(..., pattern="^(contado|meses)$")
    price: float = Field(..., gt=0)
    months: int | None = Field(default=None, gt=0)
    has_interest: bool | None = Field(default=None)
    interest_rate: float = Field(default=0.0, ge=0)
    paid_months: int | None = Field(default=0, ge=0)
    category_id: int | None = Field(default=None)

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
    category: CategoryResponse | None = None

    class Config:
        from_attributes = True
