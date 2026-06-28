import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import engine, AsyncSessionLocal
from app.models import Category

async def seed_categories():
    categories_data = [
        {"id": 1, "name": "Comida", "icon": "🍔", "color": "orange"},
        {"id": 2, "name": "Transporte", "icon": "🚌", "color": "blue"},
        {"id": 3, "name": "Salud", "icon": "🏥", "color": "green"},
        {"id": 4, "name": "Hogar", "icon": "🏠", "color": "purple"},
        {"id": 5, "name": "Entretenimiento", "icon": "🎬", "color": "yellow"},
        {"id": 6, "name": "Educación", "icon": "📚", "color": "cyan"},
        {"id": 7, "name": "Ropa", "icon": "👕", "color": "pink"},
        {"id": 8, "name": "Servicios", "icon": "💡", "color": "gray"},
        {"id": 9, "name": "Viajes", "icon": "✈️", "color": "teal"},
        {"id": 10, "name": "Mascotas", "icon": "🐶", "color": "brown"},
        {"id": 11, "name": "Regalos", "icon": "🎁", "color": "indigo"},
        {"id": 15, "name": "Gastos hormiga", "icon": "🐜", "color": "red"}
    ]

    async with AsyncSessionLocal() as db:
        for cat_data in categories_data:
            new_cat = Category(**cat_data)
            db.add(new_cat)
        try:
            await db.commit()
            print("Categories seeded successfully")
        except Exception as e:
            print("Error seeding categories:", e)
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(seed_categories())
