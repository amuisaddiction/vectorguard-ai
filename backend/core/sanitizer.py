from typing import List
from core.models import Threat

def sanitize(original_text: str, threats: List[Threat]) -> str:
    """
    Sanitizes the original text by replacing adversarial blocks with a redaction message.
    Threats are sorted by start_char descending so string replacements do not shift offsets.
    """
    sorted_threats = sorted(threats, key=lambda t: t.start_char, reverse=True)
    sanitized = original_text
    
    for threat in sorted_threats:
        start = threat.start_char
        end = threat.end_char
        sanitized = sanitized[:start] + "[SECURITY BREACH BLOCKED - IP LOGGED BY VECTORGUARD]" + sanitized[end:]
        
    return sanitized

