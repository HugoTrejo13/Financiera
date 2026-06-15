"""
news.py — Proxy de noticias financieras para Financiera.
Consulta NewsAPI.org si hay API key configurada; si no, devuelve noticias de demostración.
Caché en memoria de 30 minutos para no exceder el límite gratuito.
"""

import time
import httpx
from typing import Any
from .database import settings

# ─── Caché simple en memoria ─────────────────────────────────────────────────
_cache: dict[str, Any] = {}
_CACHE_TTL = 30 * 60  # 30 minutos en segundos

NEWS_API_KEY = settings.NEWS_API_KEY
NEWS_API_URL = "https://newsapi.org/v2/everything"

# ─── Artículos de demostración (se usan si no hay API key o falla la llamada) ─
DEMO_ARTICLES = [
    {
        "title": "El peso mexicano se fortalece frente al dólar",
        "description": "La moneda mexicana ganó terreno ante el billete verde impulsada por la estabilidad de los mercados emergentes y buenos datos de exportaciones.",
        "url": "https://www.eleconomista.com.mx",
        "urlToImage": None,
        "publishedAt": "2025-06-07T10:00:00Z",
        "source": "El Economista",
        "category": "TIPO DE CAMBIO",
    },
    {
        "title": "Banxico mantiene tasa de interés en 9.50%",
        "description": "El Banco de México decidió por unanimidad mantener su tasa de referencia ante la moderación de la inflación y señales positivas en la economía interna.",
        "url": "https://www.banxico.org.mx",
        "urlToImage": None,
        "publishedAt": "2025-06-06T14:30:00Z",
        "source": "Banco de México",
        "category": "POLÍTICA MONETARIA",
    },
    {
        "title": "Inflación en México baja a 4.2% anual en mayo",
        "description": "El INEGI reportó que el índice de precios al consumidor registró una desaceleración respecto al mes previo, acercándose al objetivo del banco central.",
        "url": "https://www.inegi.org.mx",
        "urlToImage": None,
        "publishedAt": "2025-06-05T09:00:00Z",
        "source": "INEGI",
        "category": "INFLACIÓN",
    },
    {
        "title": "Remesas a México rompen récord histórico en 2025",
        "description": "Los envíos de dinero de mexicanos en el exterior superaron los 68 mil millones de dólares en el primer cuatrimestre del año, según Banxico.",
        "url": "https://www.gob.mx",
        "urlToImage": None,
        "publishedAt": "2025-06-04T11:15:00Z",
        "source": "Gobierno de México",
        "category": "REMESAS",
    },
    {
        "title": "Bolsa Mexicana de Valores sube 1.3% impulsada por sector financiero",
        "description": "El IPC alcanzó nuevos máximos de la sesión gracias al avance de grupos bancarios y empresas del sector energético.",
        "url": "https://www.bmv.com.mx",
        "urlToImage": None,
        "publishedAt": "2025-06-03T17:00:00Z",
        "source": "BMV",
        "category": "MERCADOS",
    },
    {
        "title": "SAT amplía plazo para declaración anual de personas físicas",
        "description": "El Servicio de Administración Tributaria anunció una extensión de 30 días adicionales para la presentación de la declaración fiscal 2024.",
        "url": "https://www.sat.gob.mx",
        "urlToImage": None,
        "publishedAt": "2025-06-02T08:45:00Z",
        "source": "SAT",
        "category": "FISCALIDAD",
    },
]


def _fmt_date(iso: str) -> str:
    """Convierte '2025-06-07T10:00:00Z' → '07 Jun 2025'."""
    months = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
    try:
        date_part = iso[:10]
        y, m, d = date_part.split("-")
        return f"{d} {months[int(m)-1]} {y}"
    except Exception:
        return iso[:10]


async def fetch_news(page: int = 1, page_size: int = 6, q: str | None = None) -> dict:
    """
    Devuelve artículos paginados. Primero intenta NewsAPI; si no hay key
    o falla, devuelve los artículos de demostración.
    """
    cache_key = f"news_{page}_{page_size}_{q}"
    now = time.time()

    # ── Revisar caché ─────────────────────────────────────────────────────────
    if cache_key in _cache:
        cached_at, data = _cache[cache_key]
        if now - cached_at < _CACHE_TTL:
            return data

    # ── Intentar NewsAPI ──────────────────────────────────────────────────────
    if NEWS_API_KEY:
        try:
            params = {
                "domains": "eleconomista.com.mx,elfinanciero.com.mx,forbes.com.mx",
                "language": "es",
                "sortBy": "publishedAt",
                "pageSize": page_size,
                "page": page,
                "apiKey": NEWS_API_KEY,
            }
            if q:
                params["q"] = q
            async with httpx.AsyncClient(timeout=8) as client:
                resp = await client.get(NEWS_API_URL, params=params)
                resp.raise_for_status()
                raw = resp.json()

            articles = []
            for a in raw.get("articles", []):
                articles.append({
                    "title": a.get("title", "Sin título"),
                    "description": a.get("description") or "",
                    "url": a.get("url", "#"),
                    "urlToImage": a.get("urlToImage"),
                    "publishedAt": _fmt_date(a.get("publishedAt", "")),
                    "source": a.get("source", {}).get("name", ""),
                    "category": "NOTICIAS",
                })

            result = {
                "articles": articles,
                "total": raw.get("totalResults", len(articles)),
                "demo": False,
            }
            _cache[cache_key] = (now, result)
            return result
        except Exception as e:
            print("Error al obtener noticias:", e)

    # ── Fallback: demostración ─────────────────────────────────────────────────
    start = (page - 1) * page_size
    end = start + page_size
    page_articles = DEMO_ARTICLES[start:end]

    result = {
        "articles": page_articles,
        "total": len(DEMO_ARTICLES),
        "demo": True,
    }
    _cache[cache_key] = (now, result)
    return result
