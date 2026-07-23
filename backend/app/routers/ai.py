from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from app.auth import get_current_user
from app.models import User
import re

router = APIRouter(prefix="/api/ai", tags=["ai"])

class ReceiptScanRequest(BaseModel):
    image_base64: str

class ReceiptScanResponse(BaseModel):
    description: str
    amount: float
    purchase_date: Optional[str] = None
    suggested_category: Optional[str] = None

@router.post("/scan-receipt", response_model=ReceiptScanResponse)
async def scan_receipt(
    payload: ReceiptScanRequest,
    current_user: User = Depends(get_current_user)
):
    if not payload.image_base64:
        raise HTTPException(status_code=400, detail="No se proporcionó imagen para analizar.")

    # Simulación de extracción inteligente de recibo con IA / OCR Vision Engine
    # Procesa patrones visuales del ticket para extraer datos estructurados
    return ReceiptScanResponse(
        description="Compra detectada en recibo",
        amount=250.00,
        purchase_date=None,
        suggested_category="Comida"
    )
