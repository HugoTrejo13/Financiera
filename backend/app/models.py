from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    debts = relationship("Debt", back_populates="owner")
    investment_plans = relationship("InvestmentPlan", back_populates="owner")

class Debt(Base):
    __tablename__ = "debts"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    remaining_amount = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)
    monthly_payment = Column(Float, nullable=False)
    due_date = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="debts")

class InvestmentPlan(Base):
    __tablename__ = "investment_plans"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    monthly_contribution = Column(Float, nullable=False)
    expected_return_rate = Column(Float, nullable=False)
    target_date = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="investment_plans")
