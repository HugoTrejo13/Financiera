import os
from pydantic_settings import BaseSettings
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

class Settings(BaseSettings):
    PROJECT_NAME: str = "Financiera V2 API"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    # Por defecto SQLite si no se define DATABASE_URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./financiera.db")
    NEWS_API_KEY: str = ""

    class Config:
        env_file = ".env"

settings = Settings()

# Configuración SQLAlchemy
from sqlalchemy import event

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if settings.DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
