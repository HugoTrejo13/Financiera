from fastapi import APIRouter

router = APIRouter(prefix="/api/news", tags=["News"])

@router.get("/")
async def get_news(page: int = 1, page_size: int = 6, q: str | None = None):
    """Proxy de noticias financieras con caché de 30 min."""
    from app.news import fetch_news
    return await fetch_news(page=page, page_size=page_size, q=q)
