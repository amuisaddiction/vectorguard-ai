from fastapi import APIRouter
import os
from typing import Dict, Any

router = APIRouter()

@router.get("/api/health")
async def health_check() -> Dict[str, Any]:
    provider = os.getenv("LLM_PROVIDER", "openai").lower()
    return {
        "status": "healthy",
        "llm_provider": provider,
        "agents": {
            "pattern_scanner": "operational",
            "semantic_evaluator": f"operational ({provider})",
            "context_analyzer": f"operational ({provider})"
        }
    }

