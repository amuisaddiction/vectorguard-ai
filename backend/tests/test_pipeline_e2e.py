import pytest
import os
from unittest.mock import AsyncMock, patch
from core.pipeline_orchestrator import run_pipeline

@pytest.mark.asyncio
@patch.dict(os.environ, {"LLM_PROVIDER": "local"})
async def test_poisoned_file_is_blocked():
    
    with open("../demo/poisoned_samples/injection_test.txt", "r") as f:
        text = f.read()

    # Mock both the semantic evaluator and the context analyzer httpx calls
    with patch('httpx.AsyncClient.post', new_callable=AsyncMock) as mock_post:
        # Side effect to return different mock results based on the payload 
        # (Very simplified mock for testing the orchestration logic)
        def side_effect(*args, **kwargs):
            from unittest.mock import MagicMock
            mock = MagicMock()
            if "split payload" in kwargs.get("json", {}).get("prompt", ""):
                # Mock context analyzer response
                mock.json.return_value = {"response": '{"is_split_attack": true, "confidence": 0.8, "flagged_chunk_ids": ["bc08fe8b-9d7b-403f-b241-2d7c9817d09c"], "reason": "split"}'}
            else:
                # Mock semantic evaluator response
                mock.json.return_value = {"response": '{"is_adversarial": true, "confidence": 1.0, "threat_type": "ROLE_OVERRIDE", "reason": "Jailbreak detected"}'}
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
@patch.dict(os.environ, {"LLM_PROVIDER": "local"})
async def test_clean_file_passes():
    
    with open("../demo/clean_samples/company_policy.txt", "r") as f:
        text = f.read()

    with patch('httpx.AsyncClient.post', new_callable=AsyncMock) as mock_post:
        def side_effect(*args, **kwargs):
            from unittest.mock import MagicMock
            mock = MagicMock()
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

