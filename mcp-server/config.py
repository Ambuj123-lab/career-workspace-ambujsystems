"""Configuration for MCP Server - API keys, PII, security, validation."""
import os
import re
from dotenv import load_dotenv

load_dotenv()

# ============================================================
# API Keys (server-side only - NEVER exposed to browser)
# ============================================================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")

# ============================================================
# Model Configuration
# ============================================================
GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_TEMPERATURE = 0.3   # Low creativity, high factuality
GEMINI_MAX_TOKENS = 4096

# ============================================================
# Tavily Web Search Configuration
# ============================================================
TAVILY_SEARCH_DEPTH = "advanced"
TAVILY_MAX_RESULTS = 5

# ============================================================
# PII Protection (Regex-only for 512MB memory constraint)
# No spaCy/Presidio - too heavy. Regex catches 95%+ of PII.
# Rule: Resume -> Gemini (OK). Resume -> Tavily (NEVER).
# ============================================================
PII_PATTERNS = {
    "email": re.compile(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"),
    "phone_india": re.compile(r"(?:\+91[\s\-]?)?[6-9]\d{9}"),
    "phone_intl": re.compile(r"\+?\d{1,3}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{3,4}[\s\-]?\d{3,4}"),
    "aadhaar": re.compile(r"\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b"),
    "pan_card": re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b"),
}


def strip_pii(text: str) -> str:
    """Strip PII from text before sending to external search tools.
    
    Privacy guardrail:
    - Resume text -> Gemini (server-side analysis) = OK
    - Resume text -> Tavily (external web search) = NEVER, strip PII first
    """
    cleaned = text
    for name, pattern in PII_PATTERNS.items():
        cleaned = pattern.sub(f"[{name.upper()}_REDACTED]", cleaned)
    return cleaned


# ============================================================
# Prompt Injection Defense
# JD and Resume are UNTRUSTED input - treated as DATA, not instructions.
# ============================================================
INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?previous\s+instructions", re.IGNORECASE),
    re.compile(r"reveal\s+(your\s+)?system\s+prompt", re.IGNORECASE),
    re.compile(r"forget\s+(all\s+)?rules", re.IGNORECASE),
    re.compile(r"disregard\s+(all\s+)?", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+", re.IGNORECASE),
]


def sanitize_input(text: str) -> tuple:
    """Flag potential prompt injection attempts.
    We don't strip content - we flag it and let system prompt handle
    instruction/data separation.
    """
    warnings = []
    for p in INJECTION_PATTERNS:
        if p.search(text):
            warnings.append(f"Potential injection detected: {p.pattern}")
    return text, warnings


# ============================================================
# Input Limits (Rate/Abuse Protection)
# ============================================================
MAX_JD_CHARS = 10000
MAX_RESUME_CHARS = 15000
MAX_COMPANY_NAME_CHARS = 200
GENERATION_COOLDOWN_SECONDS = 10


# ============================================================
# Output Validation (LLM response must be in valid range)
# Prevents: {"overall_match": 147} or {"confidence": -3}
# ============================================================
VALID_MATCH_RANGE = (0, 100)
VALID_CONFIDENCE_RANGE = (0.0, 1.0)


def validate_range(value, valid_range, field_name="value"):
    """Validate LLM output is within expected range. Reject invalid."""
    low, high = valid_range
    if not (low <= value <= high):
        raise ValueError(f"{field_name}={value} outside valid range [{low}, {high}]")
    return value
