from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from typing import List
from datetime import datetime
from sqlalchemy.orm import selectinload

from app.database import get_db
from app import models

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])

# Simulacion auth
def get_current_user_id() -> int:
    return 1

@router.post("/", response_model=models.MonthlyBudgetResponse)
async def create_budget(
    budget: models.MonthlyBudgetCreate, 
    db: AsyncSession = Depends(get_db), 
    user_id: int = Depends(get_current_user_id)
):
    """Crear un presupuesto mensual para una categoría"""
    
    # Verificar si ya existe un presupuesto para esta categoría y mes
    result = await db.execute(
        select(models.MonthlyBudget).where(
            models.MonthlyBudget.owner_id == user_id,
            models.MonthlyBudget.category_id == budget.category_id,
            models.MonthlyBudget.month == budget.month
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="Ya existe un presupuesto para esta categoría en este mes"
        )
    
    db_budget = models.MonthlyBudget(
        **budget.model_dump(),
        owner_id=user_id
    )
    db.add(db_budget)
    await db.commit()
    await db.refresh(db_budget)
    
    # Cargar la categoría
    result = await db.execute(
        select(models.MonthlyBudget)
        .options(selectinload(models.MonthlyBudget.category))
        .where(models.MonthlyBudget.id == db_budget.id)
    )
    db_budget = result.scalar_one()
    
    # Calcular métricas
    response = models.MonthlyBudgetResponse.model_validate(db_budget)
    response.percentage_used = (db_budget.spent_amount / db_budget.budget_amount * 100) if db_budget.budget_amount > 0 else 0
    response.is_over_budget = db_budget.spent_amount > db_budget.budget_amount
    response.should_alert = response.percentage_used >= (db_budget.alert_threshold * 100)
    
    return response

@router.get("/", response_model=List[models.MonthlyBudgetResponse])
async def get_budgets(
    month: str = None,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Obtener todos los presupuestos del usuario, opcionalmente filtrados por mes"""
    
    query = select(models.MonthlyBudget).options(
        selectinload(models.MonthlyBudget.category)
    ).where(models.MonthlyBudget.owner_id == user_id)
    
    if month:
        query = query.where(models.MonthlyBudget.month == month)
    
    result = await db.execute(query)
    budgets = result.scalars().all()
    
    # Calcular métricas para cada presupuesto
    response_budgets = []
    for budget in budgets:
        # Calcular gasto real desde las deudas
        debts_result = await db.execute(
            select(models.Debt)
            .where(
                models.Debt.owner_id == user_id,
                models.Debt.category_id == budget.category_id,
                func.strftime('%Y-%m', models.Debt.purchase_date) == budget.month
            )
        )
        debts = debts_result.scalars().all()
        
        total_spent = 0.0
        for debt in debts:
            if debt.payment_type == "contado":
                total_spent += debt.price
            else:
                total_spent += debt.monthly_payment
        
        # Actualizar el spent_amount en la base de datos
        budget.spent_amount = total_spent
        
        # Crear respuesta con la categoría cargada
        budget_response = models.MonthlyBudgetResponse.model_validate(budget)
        budget_response.percentage_used = (total_spent / budget.budget_amount * 100) if budget.budget_amount > 0 else 0
        budget_response.is_over_budget = total_spent > budget.budget_amount
        budget_response.should_alert = budget_response.percentage_used >= (budget.alert_threshold * 100)
        response_budgets.append(budget_response)
    
    # Guardar los cambios en la base de datos
    await db.commit()
    
    # Refrescar los objetos para mantener las relaciones
    for budget in budgets:
        await db.refresh(budget)
    
    return response_budgets

@router.put("/{budget_id}", response_model=models.MonthlyBudgetResponse)
async def update_budget(
    budget_id: int,
    budget_update: models.MonthlyBudgetUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Actualizar un presupuesto mensual"""
    
    result = await db.execute(
        select(models.MonthlyBudget).where(
            models.MonthlyBudget.id == budget_id,
            models.MonthlyBudget.owner_id == user_id
        )
    )
    db_budget = result.scalar_one_or_none()
    
    if not db_budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    
    update_data = budget_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_budget, key, value)
    
    db_budget.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(db_budget)
    
    # Cargar la categoría
    result = await db.execute(
        select(models.MonthlyBudget)
        .options(selectinload(models.MonthlyBudget.category))
        .where(models.MonthlyBudget.id == db_budget.id)
    )
    db_budget = result.scalar_one()
    
    # Calcular métricas
    response = models.MonthlyBudgetResponse.model_validate(db_budget)
    response.percentage_used = (db_budget.spent_amount / db_budget.budget_amount * 100) if db_budget.budget_amount > 0 else 0
    response.is_over_budget = db_budget.spent_amount > db_budget.budget_amount
    response.should_alert = response.percentage_used >= (db_budget.alert_threshold * 100)
    
    return response

@router.delete("/{budget_id}")
async def delete_budget(
    budget_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Eliminar un presupuesto mensual"""
    
    result = await db.execute(
        select(models.MonthlyBudget).where(
            models.MonthlyBudget.id == budget_id,
            models.MonthlyBudget.owner_id == user_id
        )
    )
    db_budget = result.scalar_one_or_none()
    
    if not db_budget:
        raise HTTPException(status_code=404, detail="Presupuesto no encontrado")
    
    await db.delete(db_budget)
    await db.commit()
    
    return {"message": "Presupuesto eliminado"}

@router.get("/reports/category-spending", response_model=List[models.CategorySpendingReport])
async def get_category_spending_report(
    month: str,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Obtener reporte de gastos por categoría para un mes específico"""
    
    # Obtener todas las categorías
    categories_result = await db.execute(select(models.Category))
    categories = categories_result.scalars().all()
    
    reports = []
    
    for category in categories:
        # Calcular total gastado en esta categoría para el mes
        # Para compras de contado: usar el precio total
        # Para compras a meses: usar el monthly_payment
        debts_result = await db.execute(
            select(models.Debt)
            .where(
                models.Debt.owner_id == user_id,
                models.Debt.category_id == category.id,
                func.strftime('%Y-%m', models.Debt.purchase_date) == month
            )
        )
        debts = debts_result.scalars().all()
        
        total_spent = 0.0
        for debt in debts:
            if debt.payment_type == "contado":
                total_spent += debt.price
            else:
                total_spent += debt.monthly_payment
        
        transaction_count = len(debts)
        
        # Obtener presupuesto para esta categoría
        budget_result = await db.execute(
            select(models.MonthlyBudget).where(
                models.MonthlyBudget.owner_id == user_id,
                models.MonthlyBudget.category_id == category.id,
                models.MonthlyBudget.month == month
            )
        )
        budget = budget_result.scalar_one_or_none()
        budget_amount = budget.budget_amount if budget else 0.0
        
        percentage_used = (total_spent / budget_amount * 100) if budget_amount > 0 else 0
        
        report = models.CategorySpendingReport(
            category_id=category.id,
            category_name=category.name,
            category_icon=category.icon,
            category_color=category.color,
            total_spent=total_spent,
            budget_amount=budget_amount,
            percentage_used=percentage_used,
            is_over_budget=total_spent > budget_amount if budget_amount > 0 else False,
            transaction_count=transaction_count
        )
        reports.append(report)
    
    # Ordenar por gasto total descendente
    reports.sort(key=lambda x: x.total_spent, reverse=True)
    
    return reports

@router.get("/alerts", response_model=List[models.MonthlyBudgetResponse])
async def get_budget_alerts(
    month: str,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Obtener presupuestos que han alcanzado el umbral de alerta (80% por defecto)"""
    
    # Obtener todos los presupuestos del mes
    result = await db.execute(
        select(models.MonthlyBudget)
        .options(selectinload(models.MonthlyBudget.category))
        .where(
            models.MonthlyBudget.owner_id == user_id,
            models.MonthlyBudget.month == month
        )
    )
    budgets = result.scalars().all()
    
    alerts = []
    for budget in budgets:
        percentage_used = (budget.spent_amount / budget.budget_amount * 100) if budget.budget_amount > 0 else 0
        
        if percentage_used >= (budget.alert_threshold * 100):
            budget_response = models.MonthlyBudgetResponse.model_validate(budget)
            budget_response.percentage_used = percentage_used
            budget_response.is_over_budget = budget.spent_amount > budget.budget_amount
            budget_response.should_alert = True
            alerts.append(budget_response)
    
    return alerts

@router.post("/recalculate/{month}")
async def recalculate_spent_amounts(
    month: str,
    db: AsyncSession = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """Recalcular los montos gastados para todos los presupuestos de un mes"""
    
    # Obtener todos los presupuestos del mes
    budgets_result = await db.execute(
        select(models.MonthlyBudget).where(
            models.MonthlyBudget.owner_id == user_id,
            models.MonthlyBudget.month == month
        )
    )
    budgets = budgets_result.scalars().all()
    
    for budget in budgets:
        # Calcular total gastado en esta categoría para el mes
        debts_result = await db.execute(
            select(models.Debt)
            .where(
                models.Debt.owner_id == user_id,
                models.Debt.category_id == budget.category_id,
                func.strftime('%Y-%m', models.Debt.purchase_date) == month
            )
        )
        debts = debts_result.scalars().all()
        
        total_spent = 0.0
        for debt in debts:
            if debt.payment_type == "contado":
                total_spent += debt.price
            else:
                total_spent += debt.monthly_payment
        
        budget.spent_amount = total_spent
        budget.updated_at = datetime.utcnow()
    
    await db.commit()
    
    return {"message": f"Montos recalculados para {len(budgets)} presupuestos"}

# Made with Bob
