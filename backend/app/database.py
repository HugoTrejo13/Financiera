import os
from pydantic_settings import BaseSettings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlmodel import SQLModel

class Settings(BaseSettings):
    PROJECT_NAME: str = "Financiera V2 API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    # PostgreSQL Connection
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://financiera_user:admin@localhost/financiera_db")
    NEWS_API_KEY: str = ""
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback_secret")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()

from slowapi import Limiter
from slowapi.util import get_remote_address
limiter = Limiter(key_func=get_remote_address)

engine = create_async_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# No WAL PRAGMA via event listener because asyncio drivers manage connections differently.
# But we can still do it via execution options if needed, but it's optional for async local dev.

AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

async def get_db():
    async with AsyncSessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()

async def init_db():
    async with engine.begin() as conn:
        # Crea las tablas (Alembic sería lo ideal para prod, pero esto recrea para dev si no existen)
        await conn.run_sync(SQLModel.metadata.create_all)
