"""
MCP Tool: evidence_validator
Validates AI-generated claims against actual source data.
Implements the Claim Ledger pattern.

Pipeline:
    Claims (from Gemini) + Sources (from Tavily)
    -> Evidence check per claim
    -> Validated / Unsupported classification
    -> Confidence score (deterministic, not LLM-invented)

This is the evidence grounding & claim validation layer.
"""
import google.generativeai as genai
from config import GEMINI_API_KEY, GEMINI_MODEL, validate_range, VALID_CONFIDENCE_RANGE

genai.configure(api_key=GEMINI_API_KEY)


async def evidence_validator(claims: list[str], sources: list[dict]) -> dict:
    """
    Validate each claim against provided source data.
    
    Args:
        claims: List of text claims to validate
        sources: List of {"url": str, "content": str, "title": str}
    
    Returns:
        {
            "claim_ledger": [
                {
                    "claim": str,
                    "status": "VERIFIED" | "PARTIAL" | "UNSUPPORTED",
                    "source_url": str | None,
                    "evidence": str | None,
                    "action": "USE" | "FLAG" | "BLOCK"
                }
            ],
            "summary": {
                "verified": int,
                "partial": int,
                "unsupported": int,
                "total": int
            },
            "confidence": float  # Deterministic: verified_count / total_count
        }
    """
    if not claims:
        return {"claim_ledger": [], "summary": {"verified": 0, "partial": 0, "unsupported": 0, "total": 0}, "confidence": 0.0}
    
    # Build source context
    source_context = ""
    for i, s in enumerate(sources):
        source_context += f"\n[Source {i+1}] URL: {s.get('url', 'N/A')}\nTitle: {s.get('title', 'N/A')}\nContent: {s.get('content', s.get('snippet', ''))}\n---\n"
    
    # Format claims
    claims_text = "\n".join([f"Claim {i+1}: {c}" for i, c in enumerate(claims)])
    
    model = genai.GenerativeModel(
        GEMINI_MODEL,
        generation_config=genai.GenerationConfig(
            temperature=0.1,  # Very low - this is a factual verification task
            response_mime_type="application/json",
        ),
    )
    
    prompt = f"""You are an evidence validator. For EACH claim below, check if it is 
supported by the provided source data.

RULES:
1. A claim is VERIFIED only if the source data explicitly states the same fact
2. A claim is PARTIAL if the source data contains related but not exact information
3. A claim is UNSUPPORTED if no source data supports it
4. Be STRICT - do not give benefit of the doubt
5. Quote the specific source evidence for verified/partial claims

CLAIMS:
{claims_text}

SOURCE DATA:
{source_context}

Return JSON array:
[
    {{
        "claim_index": 1,
        "claim": "the claim text",
        "status": "VERIFIED" or "PARTIAL" or "UNSUPPORTED",
        "source_index": 1 or null,
        "evidence": "quoted text from source" or null,
        "reason": "brief explanation of verdict"
    }}
]"""
    
    try:
        response = model.generate_content(prompt)
        import json
        results = json.loads(response.text)
    except Exception as e:
        # Fallback: mark all as unsupported if validation fails
        results = [
            {"claim_index": i+1, "claim": c, "status": "UNSUPPORTED", 
             "source_index": None, "evidence": None, "reason": f"Validation error: {str(e)}"}
            for i, c in enumerate(claims)
        ]
    
    # Build claim ledger with action policy
    ledger = []
    verified = partial = unsupported = 0
    
    for r in results:
        status = r.get("status", "UNSUPPORTED")
        
        if status == "VERIFIED":
            action = "USE"
            verified += 1
        elif status == "PARTIAL":
            action = "FLAG"  # Show to user for approval
            partial += 1
        else:
            action = "BLOCK"  # Do not include in letter without user override
            unsupported += 1
        
        source_idx = r.get("source_index")
        source_url = None
        if source_idx and 0 < source_idx <= len(sources):
            source_url = sources[source_idx - 1].get("url")
        
        ledger.append({
            "claim": r.get("claim", ""),
            "status": status,
            "source_url": source_url,
            "evidence": r.get("evidence"),
            "reason": r.get("reason", ""),
            "action": action,
        })
    
    # Confidence is DETERMINISTIC (not LLM-invented)
    total = len(claims)
    confidence = round(verified / total, 2) if total > 0 else 0.0
    
    return {
        "claim_ledger": ledger,
        "summary": {
            "verified": verified,
            "partial": partial,
            "unsupported": unsupported,
            "total": total,
        },
        "confidence": confidence,
    }
