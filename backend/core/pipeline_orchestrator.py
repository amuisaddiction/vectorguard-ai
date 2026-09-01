import os
import time
import uuid
import asyncio
from typing import List
from core.models import ScanResult, Threat, Alert
from core.chunker import chunk_text
from agents.pattern_scanner import scan_chunk
from agents.semantic_evaluator import evaluate_chunk
from agents.context_analyzer import analyze_context
from core.sanitizer import sanitize
from core.alert_logger import log_alert
from core.verdict_aggregator import aggregate_verdict
from core.embedder import generate_embedding

async def run_pipeline(text: str, filename: str) -> ScanResult:
    """
    Phase 3 Full Pipeline: Includes Vector Embeddings
    """
    file_id = str(uuid.uuid4())
    start_time = time.time()
    chunks = chunk_text(text)
    
    pattern_results = [scan_chunk(c) for c in chunks]
    semantic_results = await asyncio.gather(*[evaluate_chunk(c) for c in chunks])
    context_result = await analyze_context(chunks)
    
    threats: List[Threat] = []
    
    for i, chunk in enumerate(chunks):
        verdict = aggregate_verdict(pattern_results[i], semantic_results[i], context_result, chunk)
        
        if verdict.is_threat:
            threat = Threat(
                chunk_id=chunk.id,
                start_char=chunk.start_char,
                end_char=chunk.end_char,
                threat_types=verdict.threat_types,
                confidence=verdict.score,
                source="aggregated_pipeline"
            )
            threats.append(threat)
            
            alert = Alert(
                file_id=file_id,
                chunk_id=chunk.id,
                threat_types=verdict.threat_types,
                confidence=verdict.score,
                source="aggregated_pipeline"
            )
            await log_alert(alert)
            
    sanitized_text = sanitize(text, threats)
    status = "threat_detected" if threats else "clean"
    elapsed = int((time.time() - start_time) * 1000)
    
    # Phase 3: Generate Embedding
    embedding_id = await generate_embedding(
        sanitized_text, 
        metadata={"file_id": file_id, "filename": filename, "is_sanitized": bool(threats)}
    )
    
    return ScanResult(
        file_id=file_id,
        filename=filename,
        status=status,
        threats=threats,
        sanitized_text=sanitized_text,
        total_chunks=len(chunks),
        flagged_chunks=len(threats),
        embedding_id=embedding_id,
        scan_duration_ms=elapsed
    )
