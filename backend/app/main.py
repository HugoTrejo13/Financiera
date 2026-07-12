from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import traceback
from contextlib import asynccontextmanager
from app.database import settings, init_db
from app.routers import debts, categories, news, auth, spaces
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION, lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
    error_detail = str(exc)
    error_traceback = traceback.format_exc()
    
    print(f"❌ Error global capturado: {error_detail}")
    print(f"📍 Traceback completo:\n{error_traceback}")
    
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Ha ocurrido un error interno en el servidor.",
            "error": error_detail,
            "type": type(exc).__name__
        },
    )

# --- Rutas (Routers) ---
app.include_router(categories.router)
app.include_router(debts.router)
app.include_router(news.router)
app.include_router(auth.router)
app.include_router(spaces.router)

@app.get("/")
def read_root():
    return {"message": "Bienvenido a Financiera V2 API. Ve a /docs para ver la documentación."}
