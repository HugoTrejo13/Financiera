"""
Script para inicializar categorías predeterminadas en la base de datos.
Ejecutar una sola vez después de crear la base de datos.
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.database import AsyncSessionLocal
from app.models import Category


async def init_categories():
    """Inicializa las categorías predeterminadas si no existen."""
    
    default_categories = [
        {"name": "Comida", "icon": "🍔", "color": "#f59e0b"},
        {"name": "Transporte", "icon": "🚗", "color": "#3b82f6"},
        {"name": "Entretenimiento", "icon": "🎮", "color": "#8b5cf6"},
        {"name": "Salud", "icon": "💊", "color": "#10b981"},
        {"name": "Educación", "icon": "📚", "color": "#06b6d4"},
        {"name": "Hogar", "icon": "🏠", "color": "#f97316"},
        {"name": "Ropa", "icon": "👕", "color": "#ec4899"},
        {"name": "Tecnología", "icon": "💻", "color": "#6366f1"},
        {"name": "Viajes", "icon": "✈️", "color": "#14b8a6"},
        {"name": "Servicios", "icon": "🔧", "color": "#84cc16"},
        {"name": "Gastos hormiga", "icon": "🐜", "color": "#ef4444"},
        {"name": "Otros", "icon": "💰", "color": "#64748b"},
    ]
    
    async with AsyncSessionLocal() as db:
        for cat_data in default_categories:
            # Verificar si la categoría ya existe
            result = await db.execute(
                select(Category).where(Category.name == cat_data["name"])
            )
            existing = result.scalar_one_or_none()
            
            if not existing:
                category = Category(**cat_data)
                db.add(category)
                print(f"✅ Categoría creada: {cat_data['name']} {cat_data['icon']}")
            else:
                print(f"⏭️  Categoría ya existe: {cat_data['name']}")
        
        await db.commit()
        print("\n🎉 Inicialización de categorías completada!")


if __name__ == "__main__":
    asyncio.run(init_categories())

# Made with Bob
