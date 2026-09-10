import os
import json
import httpx
from typing import List
from core.models import Chunk, ContextResult

SYSTEM_PROMPT = """
You are a context analyzer for an AI security pipeline.
Review the following sequence of text chunks. Determine if there is a 'split payload' or multi-part adversarial attack spanning across multiple chunks.

Respond ONLY with valid JSON:
{
  "is_split_attack": boolean,
  "confidence": float between 0.0 and 1.0,
  "flagged_chunk_ids": ["id1", "id2"],
  "reason": "explanation"
}
"""

async def analyze_context(chunks: List[Chunk]) -> ContextResult:
    if not chunks:
        return ContextResult(flagged_chunk_ids=[], confidence=0.0)
        
    # Combine chunks for the prompt context
    combined_text = "\n\n".join([f"--- Chunk ID: {c.id} ---\n{c.text}" for c in chunks])
    
    provider = os.getenv("LLM_PROVIDER", "openai").lower()
    try:
        if provider == "openai":
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": combined_text}
                ],
                response_format={"type": "json_object"},
                temperature=0.0
            )
            content = response.choices[0].message.content
        elif provider == "openrouter":
            from openai import AsyncOpenAI
            client = AsyncOpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=os.getenv("OPENROUTER_API_KEY")
            )
            response = await client.chat.completions.create(
                model=os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3-8b-instruct:free"),
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": combined_text}
                ],
                response_format={"type": "json_object"},
                temperature=0.0
            )
            content = response.choices[0].message.content
        elif provider == "anthropic":
            from anthropic import AsyncAnthropic
            client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            response = await client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=300,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": combined_text}]
            )
            content = response.content[0].text
        else: # local
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://localhost:11434/api/generate",
                    json={
                        "model": "mistral",
                        "prompt": f"{SYSTEM_PROMPT}\n\n{combined_text}",
                        "stream": False,
                        "format": "json"
                    },
                    timeout=15.0
                )
                content = response.json().get("response", "{}")
        
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
            
        data = json.loads(content)
        if data.get("is_split_attack"):
            return ContextResult(
                flagged_chunk_ids=data.get("flagged_chunk_ids", []),
                confidence=float(data.get("confidence", 0.0)),
                reason=data.get("reason", "")
            )
        return ContextResult(flagged_chunk_ids=[], confidence=0.0)
    except Exception as e:
        print(f"Context Analyzer Error: {e}")
        return ContextResult(flagged_chunk_ids=[], confidence=0.0)

