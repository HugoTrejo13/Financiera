"""
Script para crear un usuario de prueba en la base de datos.
Ejecutar una sola vez después de crear la base de datos.
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.database import AsyncSessionLocal
from app.models import User


async def init_user():
    """Crea un usuario de prueba si no existe."""
    
    async with AsyncSessionLocal() as db:
        # Verificar si ya existe el usuario con ID 1
        result = await db.execute(
            select(User).where(User.id == 1)
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            user = User(
                id=1,
                email="demo@financiera.app",
                hashed_password="demo_password_hash"  # En producción usar bcrypt
            )
            db.add(user)
            await db.commit()
            print("✅ Usuario de prueba creado: demo@financiera.app (ID: 1)")
        else:
            print("⏭️  Usuario de prueba ya existe")
        
        print("\n🎉 Inicialización de usuario completada!")


if __name__ == "__main__":
    asyncio.run(init_user())

# Made with Bob
