from fastapi import APIRouter, File, UploadFile
from typing import Dict, Any

router = APIRouter()

@router.post("/api/scan")
async def scan_file(file: UploadFile = File(...)) -> Dict[str, Any]:
    # 1. Read file bytes -> decode text (handle pdf with pypdf2)
    # 2. Call pipeline_orchestrator.run_pipeline(text, filename)
    # 3. Return ScanResult
    
    # Stub response for now
    return {
        "status": "success",
        "message": f"Received {file.filename}, but scanning is not yet implemented"
    }

