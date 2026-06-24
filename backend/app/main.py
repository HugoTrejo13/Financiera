from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from contextlib import asynccontextmanager
from app.database import settings, init_db
from app.routers import debts, categories, news

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION, lifespan=lifespan)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:5175", 
        "http://localhost:5176", 
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Manejador de Errores Centralizado ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Error global capturado: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Ha ocurrido un error interno en el servidor. Por favor, intenta más tarde."},
    )

# --- Rutas (Routers) ---
app.include_router(categories.router)
app.include_router(debts.router)
app.include_router(news.router)

@app.get("/")
def read_root():
    return {"message": "Bienvenido a Financiera V2 API. Ve a /docs para ver la documentación."}
