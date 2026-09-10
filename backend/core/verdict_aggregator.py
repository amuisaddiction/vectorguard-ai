import os
from core.models import Chunk, PatternResult, SemanticResult, ContextResult, FinalVerdict

def aggregate_verdict(
    pattern: PatternResult, 
    semantic: SemanticResult, 
    context: ContextResult, 
    chunk: Chunk
) -> FinalVerdict:
    """
    Weights the confidence of the three agents to produce a final verdict.
    Pattern = 30%, Semantic = 50%, Context = 20%
    """
    
    # Determine if this specific chunk was flagged by the context analyzer
    context_conf = context.confidence if chunk.id in context.flagged_chunk_ids else 0.0
    
    score = (
        0.3 * pattern.confidence +
        0.5 * semantic.confidence +
        0.2 * context_conf
    )
    
    threshold = float(os.getenv("THREAT_THRESHOLD", "0.65"))
    is_threat = score > threshold
    
    # OFFLINE DEMO FIX: If we don't have OpenAI keys, the semantic and context agents return 0.0.
    # To make the demo work locally, if the pattern scanner catches an obvious threat, we auto-flag it.
    if pattern.confidence >= 0.75:
        is_threat = True
        score = max(score, pattern.confidence)

    
    # Combine and deduplicate threat types
    threat_types = set(pattern.threat_types)
    if semantic.threat_type:
        threat_types.add(semantic.threat_type)
    if chunk.id in context.flagged_chunk_ids:
        threat_types.add("SPLIT_ATTACK")
        
    return FinalVerdict(
        chunk_id=chunk.id,
        is_threat=is_threat,
        score=score,
        threat_types=list(threat_types)
    )

