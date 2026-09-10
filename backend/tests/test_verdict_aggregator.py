import pytest
from core.models import Chunk, PatternResult, SemanticResult, ContextResult
from core.verdict_aggregator import aggregate_verdict

def test_high_pattern_low_semantic_passes():
    # Semantic has more weight — pattern alone shouldn't flag if semantic says it's clean
    chunk = Chunk(id="1", text="test", start_char=0, end_char=4, index=0)
    pattern = PatternResult(chunk_id="1", matched_rules=["something"], confidence=0.6, threat_types=["ENCODING_TRICK"])
    semantic = SemanticResult(is_adversarial=False, confidence=0.2, threat_type=None, reason="")
    context = ContextResult(flagged_chunk_ids=[], confidence=0.0, reason="")
    
    # score = 0.3(0.6) + 0.5(0.2) + 0.2(0) = 0.18 + 0.10 = 0.28 (Below 0.65 threshold)
    verdict = aggregate_verdict(pattern, semantic, context, chunk)
    assert verdict.is_threat is False
    assert round(verdict.score, 2) == 0.28

def test_all_agents_agree_flags():
    chunk = Chunk(id="1", text="test", start_char=0, end_char=4, index=0)
    pattern = PatternResult(chunk_id="1", matched_rules=["something"], confidence=0.8, threat_types=["JAILBREAK"])
    semantic = SemanticResult(is_adversarial=True, confidence=0.9, threat_type="JAILBREAK", reason="")
    context = ContextResult(flagged_chunk_ids=["1"], confidence=0.7, reason="")
    
    # score = 0.3(0.8) + 0.5(0.9) + 0.2(0.7) = 0.24 + 0.45 + 0.14 = 0.83 (Above 0.65 threshold)
    verdict = aggregate_verdict(pattern, semantic, context, chunk)
    assert verdict.is_threat is True
    assert round(verdict.score, 2) == 0.83

