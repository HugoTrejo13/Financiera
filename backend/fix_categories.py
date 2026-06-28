"""
Script para eliminar categorías duplicadas
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, delete
from app.database import AsyncSessionLocal
from app.models import Category

async def fix_duplicate_categories():
    """Eliminar categorías duplicadas manteniendo solo las originales"""
    
    # IDs de categorías duplicadas a eliminar
    duplicate_ids = [12, 13, 14]  # Comida y Restaurantes, Hogar y Servicios, Ropa y Accesorios
    
    async with AsyncSessionLocal() as db:
        print("🔍 Buscando categorías duplicadas...")
        
        for cat_id in duplicate_ids:
            result = await db.execute(
                select(Category).where(Category.id == cat_id)
            )
            category = result.scalar_one_or_none()
            
            if category:
                print(f"❌ Eliminando: {category.name} (ID: {cat_id})")
                await db.delete(category)
            else:
                print(f"⏭️  Categoría ID {cat_id} no encontrada")
        
        await db.commit()
        print("\n✅ Categorías duplicadas eliminadas!")
        
        # Mostrar categorías restantes
        print("\n📋 Categorías actuales:")
        result = await db.execute(select(Category).order_by(Category.id))
        categories = result.scalars().all()
        
        for cat in categories:
            print(f"   {cat.id}: {cat.name} {cat.icon}")
        
        print(f"\n✅ Total: {len(categories)} categorías")

if __name__ == "__main__":
    asyncio.run(fix_duplicate_categories())

# Made with Bob
