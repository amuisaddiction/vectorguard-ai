import uuid
from typing import List
from core.models import Chunk

def chunk_text(text: str) -> List[Chunk]:
    """
    Splits text into sliding window chunks of 512 characters with 50-character overlap.
    """
    WINDOW_SIZE = 512
    OVERLAP = 50
    chunks = []
    
    if not text:
        return chunks
        
    start = 0
    index = 0
    text_length = len(text)
    
    while start < text_length:
        end = min(start + WINDOW_SIZE, text_length)
        chunk_text_content = text[start:end]
        
        chunk = Chunk(
            id=str(uuid.uuid4()),
            text=chunk_text_content,
            start_char=start,
            end_char=end,
            index=index
        )
        chunks.append(chunk)
        
        if end == text_length:
            break
            
        start += (WINDOW_SIZE - OVERLAP)
        index += 1
        
    return chunks

