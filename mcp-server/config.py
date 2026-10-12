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
HF_TOKEN = os.getenv("HF_TOKEN", "")

# ============================================================
# Model Configuration & Quota Failover
# ============================================================
GEMINI_PRIMARY_MODEL = os.getenv("GEMINI_PRIMARY_MODEL", "gemini-3.5-flash-lite")
GEMINI_FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-3.1-flash-lite-preview")
GEMINI_MODEL = GEMINI_PRIMARY_MODEL   # Backwards compatibility
GEMINI_TEMPERATURE = 0.3              # Low creativity, high factuality
GEMINI_MAX_TOKENS = 4096


async def generate_content_with_fallback(prompt: str, generation_config=None) -> str:
    """Generate LLM response with primary Gemini model, automatically failing over to secondary on 429/quota exhaustion."""
    import google.generativeai as genai
    import logging
    _log = logging.getLogger("covercraft-mcp")

    genai.configure(api_key=GEMINI_API_KEY)
    models = [GEMINI_PRIMARY_MODEL, GEMINI_FALLBACK_MODEL]
    last_err = None

    for m_name in models:
        try:
            model = genai.GenerativeModel(m_name, generation_config=generation_config)
            response = await model.generate_content_async(prompt)
            if response and hasattr(response, "text") and response.text:
                return response.text
        except Exception as e:
            last_err = e
            _log.warning(f"MCP Gemini model '{m_name}' execution issue: {e}")
            continue

    raise last_err or RuntimeError("All configured Gemini models exhausted.")

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
