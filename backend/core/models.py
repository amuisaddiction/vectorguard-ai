from pydantic import BaseModel
from typing import List, Optional

class Chunk(BaseModel):
    id: str
    text: str
    start_char: int
    end_char: int
    index: int

class PatternResult(BaseModel):
    chunk_id: str
    matched_rules: List[str]
    confidence: float
    threat_types: List[str]

class Alert(BaseModel):
    file_id: str
    chunk_id: str
    threat_types: List[str]
    confidence: float
    source: str

class Threat(BaseModel):
    chunk_id: str
    start_char: int
    end_char: int
    threat_types: List[str]
    confidence: float
    source: str

class ScanResult(BaseModel):
    file_id: str
    filename: str
    status: str
    threats: List[Threat]
    sanitized_text: str
    total_chunks: int
    flagged_chunks: int
    embedding_id: Optional[str] = None
    scan_duration_ms: int = 0

class SemanticResult(BaseModel):
    is_adversarial: bool
    confidence: float
    threat_type: Optional[str] = None
    reason: str = ""

class ContextResult(BaseModel):
    flagged_chunk_ids: List[str]
    confidence: float
    reason: str = ""

class FinalVerdict(BaseModel):
    chunk_id: str
    is_threat: bool
    score: float
    threat_types: List[str]


