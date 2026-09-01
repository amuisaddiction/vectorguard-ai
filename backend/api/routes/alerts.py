from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

@router.get("/api/alerts")
async def get_alerts() -> Dict[str, Any]:
    # Stub response
    return {"alerts": []}

