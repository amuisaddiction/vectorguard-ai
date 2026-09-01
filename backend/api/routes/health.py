from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter()

@router.get("/api/health")
async def health_check() -> Dict[str, Any]:
    # Stub response
    return {"status": "healthy", "agents": {"pattern": "ok", "semantic": "ok", "context": "ok"}}

