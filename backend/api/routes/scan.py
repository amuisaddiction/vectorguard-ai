import io
from fastapi import APIRouter, File, UploadFile, HTTPException
from core.models import ScanResult
from core.pipeline_orchestrator import run_pipeline

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

router = APIRouter()

@router.post("/api/scan", response_model=ScanResult)
async def scan_file(file: UploadFile = File(...)):
    """
    Ingests a file, runs it through the security pipeline, and returns the sanitized result.
    """
    try:
        content = await file.read()
        text = ""
        
        # Handle PDF vs Plain text
        if file.filename.lower().endswith(".pdf"):
            if not PyPDF2:
                raise HTTPException(status_code=500, detail="PyPDF2 not installed")
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        else:
            text = content.decode("utf-8", errors="ignore")
            
        result = await run_pipeline(text, file.filename)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@router.get("/api/embeddings/{file_id}")
async def get_embedding(file_id: str):
    """
    Retrieve an embedding and its metadata from ChromaDB using the file_id.
    """
    from core.embedder import collection
    results = collection.get(where={"file_id": file_id})
    if not results["ids"]:
        raise HTTPException(status_code=404, detail="Embedding not found")
    return {"document_id": results["ids"][0], "metadata": results["metadatas"][0]}
