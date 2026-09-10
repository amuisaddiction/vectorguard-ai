import json
import re
import os
from pathlib import Path
from core.models import Chunk, PatternResult

# Load rules globally
RULES_PATH = Path(__file__).parent.parent / "data" / "rules" / "injection_patterns.json"

try:
    with open(RULES_PATH, "r") as f:
        RULES = json.load(f)
except FileNotFoundError:
    RULES = {}

def scan_chunk(chunk: Chunk) -> PatternResult:
    """
    Scans a chunk of text against predefined injection rules and regex patterns.
    """
    matched_rules = []
    threat_types = set()
    
    # 1. Check loaded rules
    for category, patterns in RULES.items():
        for pattern in patterns:
            # Simple substring or regex check
            if re.search(re.escape(pattern), chunk.text, re.IGNORECASE):
                matched_rules.append(pattern)
                threat_types.add(category)
                
    # 2. Check for base64 blobs (heuristic: > 50 chars of valid base64)
    base64_pattern = r'[A-Za-z0-9+/]{50,}={0,2}'
    if re.search(base64_pattern, chunk.text):
        matched_rules.append("base64_blob")
        threat_types.add("ENCODING_TRICK")
        
    # 3. Check for unicode direction override (Right-to-Left Override)
    if "\u202e" in chunk.text:
        matched_rules.append("unicode_rlo")
        threat_types.add("ENCODING_TRICK")
        
    # Compute confidence
    confidence = min(1.0, len(matched_rules) * 0.3)
    
    return PatternResult(
        chunk_id=chunk.id,
        matched_rules=matched_rules,
        confidence=confidence,
        threat_types=list(threat_types)
    )

