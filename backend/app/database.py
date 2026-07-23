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


AsyncSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)

async def get_db():
    async with AsyncSessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()

from sqlalchemy import inspect, text

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        
        # Auto-migración dinámica: inspecciona y agrega cualquier columna nueva de los modelos
        def auto_sync_schema(sync_conn):
            inspector = inspect(sync_conn)
            for table_name, table in SQLModel.metadata.tables.items():
                if inspector.has_table(table_name):
                    existing_cols = {col['name'] for col in inspector.get_columns(table_name)}
                    for column in table.columns:
                        if column.name not in existing_cols:
                            col_type = column.type.compile(sync_conn.dialect)
                            sql = f'ALTER TABLE "{table_name}" ADD COLUMN "{column.name}" {col_type};'
                            print(f"🛠️ Migración automática: añadiendo columna '{column.name}' a la tabla '{table_name}'")
                            sync_conn.execute(text(sql))

        try:
            await conn.run_sync(auto_sync_schema)
        except Exception as e:
            print(f"⚠️ Nota de migración de esquema: {e}")
