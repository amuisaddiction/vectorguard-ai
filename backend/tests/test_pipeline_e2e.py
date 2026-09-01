import pytest
import os
from unittest.mock import AsyncMock, patch
from core.pipeline_orchestrator import run_pipeline

@pytest.mark.asyncio
@patch('agents.semantic_evaluator.os.getenv')
@patch('agents.context_analyzer.os.getenv')
async def test_poisoned_file_is_blocked(mock_ctx_getenv, mock_sem_getenv):
    mock_sem_getenv.return_value = "local"
    mock_ctx_getenv.return_value = "local"
    
    with open("../demo/poisoned_samples/injection_test.txt", "r") as f:
        text = f.read()

    # Mock both the semantic evaluator and the context analyzer httpx calls
    with patch('httpx.AsyncClient.post', new_callable=AsyncMock) as mock_post:
        # Side effect to return different mock results based on the payload 
        # (Very simplified mock for testing the orchestration logic)
        def side_effect(*args, **kwargs):
            mock = AsyncMock()
            if "split payload" in kwargs.get("json", {}).get("prompt", ""):
                # Mock context analyzer response
                mock.json.return_value = {"response": '{"is_split_attack": false, "confidence": 0.0, "flagged_chunk_ids": [], "reason": ""}'}
            else:
                # Mock semantic evaluator response
                mock.json.return_value = {"response": '{"is_adversarial": true, "confidence": 0.9, "threat_type": "ROLE_OVERRIDE", "reason": "Jailbreak detected"}'}
            return mock
            
        mock_post.side_effect = side_effect
        
        # We need to initialize the db for alerts to not fail
        from core.alert_logger import init_db
        await init_db()
        
        result = await run_pipeline(text, "injection_test.txt")
        
        assert result.status == "threat_detected"
        assert len(result.threats) > 0
        assert "[REDACTED" in result.sanitized_text


@pytest.mark.asyncio
@patch('agents.semantic_evaluator.os.getenv')
@patch('agents.context_analyzer.os.getenv')
async def test_clean_file_passes(mock_ctx_getenv, mock_sem_getenv):
    mock_sem_getenv.return_value = "local"
    mock_ctx_getenv.return_value = "local"
    
    with open("../demo/clean_samples/company_policy.txt", "r") as f:
        text = f.read()

    with patch('httpx.AsyncClient.post', new_callable=AsyncMock) as mock_post:
        def side_effect(*args, **kwargs):
            mock = AsyncMock()
            if "split payload" in kwargs.get("json", {}).get("prompt", ""):
                mock.json.return_value = {"response": '{"is_split_attack": false, "confidence": 0.0, "flagged_chunk_ids": [], "reason": ""}'}
            else:
                mock.json.return_value = {"response": '{"is_adversarial": false, "confidence": 0.0, "threat_type": null, "reason": "Clean"}'}
            return mock
            
        mock_post.side_effect = side_effect
        
        from core.alert_logger import init_db
        await init_db()
        
        result = await run_pipeline(text, "company_policy.txt")
        
        assert result.status == "clean"
        assert len(result.threats) == 0
        assert "[REDACTED" not in result.sanitized_text

