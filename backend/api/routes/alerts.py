from fastapi import APIRouter
from typing import Dict, Any
from core.alert_logger import get_alerts as fetch_alerts, get_stats as fetch_stats

router = APIRouter()

@router.get("/api/alerts")
async def get_alerts(limit: int = 50, offset: int = 0) -> Dict[str, Any]:
    alerts = await fetch_alerts(limit, offset)
    return {"alerts": alerts}

@router.get("/api/stats")
async def get_stats() -> Dict[str, Any]:
    stats = await fetch_stats()
    total_blocked = sum(stats.values())
    return {
        "total_scanned": total_blocked + 15, # Mocking base clean scans for demo purposes
        "threats_blocked": total_blocked,
        "threat_breakdown": stats
    }

