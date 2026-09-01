import os
import uuid
import chromadb
from typing import Dict, Any

# Initialize ChromaDB persistent client
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection_name = os.getenv("CHROMA_COLLECTION", "vectorguard_safe")
collection = chroma_client.get_or_create_collection(name=collection_name)

# Lazy load local model
_local_model = None

async def generate_embedding(text: str, metadata: Dict[str, Any]) -> str:
    """
    Generates an embedding for the sanitized text and stores it in ChromaDB.
    Supports both OpenAI text-embedding-ada-002 and local SentenceTransformers.
    """
    provider = os.getenv("EMBED_PROVIDER", "openai").lower()
    doc_id = str(uuid.uuid4())
    
    embedding_vector = None
    
    try:
        if provider == "openai":
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            response = await client.embeddings.create(
                input=[text],
                model="text-embedding-ada-002"
            )
            embedding_vector = response.data[0].embedding
        else: # local
            global _local_model
            if _local_model is None:
                from sentence_transformers import SentenceTransformer
                _local_model = SentenceTransformer("all-MiniLM-L6-v2")
            embedding_vector = _local_model.encode(text).tolist()
            
        collection.add(
            ids=[doc_id],
            embeddings=[embedding_vector],
            metadatas=[metadata],
            documents=[text]
        )
        return doc_id
    except Exception as e:
        print(f"Embedding error: {e}")
        return None

