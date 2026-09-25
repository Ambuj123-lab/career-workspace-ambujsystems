"""
MCP Tool: ats_readiness
Honest ATS readiness check - NOT a fake "ATS Score".
Returns individual checks with PASS/WARN/FAIL + disclaimer.

IMPORTANT: Real ATS systems don't have one universal scoring formula.
This is a heuristic estimate, clearly labeled as such.
"""
import google.generativeai as genai
from config import GEMINI_API_KEY, GEMINI_MODEL

genai.configure(api_key=GEMINI_API_KEY)


async def ats_readiness(letter_text: str, jd_text: str) -> dict:
    """
    Check cover letter for ATS readiness against JD.
    Returns readiness level (HIGH/MEDIUM/LOW) with individual checks.
    
    Args:
        letter_text: Generated cover letter text
        jd_text: Job description text
    
    Returns:
        {
            "readiness_level": "HIGH" | "MEDIUM" | "LOW",
            "checks": {
                "keyword_coverage": {"value": int, "status": "PASS"|"WARN"|"FAIL", "detail": str},
                "required_skills": {"value": int, "status": str, "detail": str},
                "action_evidence": {"value": int, "status": str, "detail": str},
                "letter_length": {"status": str, "detail": str},
                "contact_info": {"status": str, "detail": str}
            },
            "suggestions": [str],
            "disclaimer": str
        }
    """
    model = genai.GenerativeModel(
        GEMINI_MODEL,
        generation_config=genai.GenerationConfig(
            temperature=0.2,
            response_mime_type="application/json",
        ),
    )
    
    prompt = f"""Analyze this cover letter for ATS readiness against the job description.

RULES:
1. Check keyword coverage: what % of JD keywords appear in the letter
2. Check required skills: how many JD-required skills are mentioned
3. Check action evidence: how many achievements have measurable metrics
4. Check letter length: should be 350-500 words
5. Check contact info: name, email, phone should be present
6. For each check, give PASS (good), WARN (acceptable), or FAIL (needs improvement)
7. Be honest - this is a heuristic, not an actual ATS

COVER LETTER:
{letter_text}

JOB DESCRIPTION:
{jd_text}

Return JSON:
{{
    "checks": {{
        "keyword_coverage": {{"value": 85, "status": "PASS", "detail": "17 of 20 JD keywords found"}},
        "required_skills": {{"value": 75, "status": "WARN", "detail": "9 of 12 required skills mentioned"}},
        "action_evidence": {{"value": 60, "status": "WARN", "detail": "3 of 5 achievements have metrics"}},
        "letter_length": {{"status": "PASS", "detail": "432 words (recommended: 350-500)"}},
        "contact_info": {{"status": "PASS", "detail": "Name, email, phone present"}}
    }},
    "suggestions": ["specific improvement suggestions"]
}}"""
    
    try:
        response = model.generate_content(prompt)
        import json
        data = json.loads(response.text)
    except Exception as e:
        return {"error": f"ATS analysis failed: {str(e)}"}
    
    checks = data.get("checks", {})
    
    # Determine overall readiness (deterministic)
    statuses = []
    for check_name, check_data in checks.items():
        if isinstance(check_data, dict):
            statuses.append(check_data.get("status", "WARN"))
    
    fail_count = statuses.count("FAIL")
    warn_count = statuses.count("WARN")
    
    if fail_count >= 2:
        readiness = "LOW"
    elif fail_count >= 1 or warn_count >= 3:
        readiness = "MEDIUM"
    else:
        readiness = "HIGH"
    
    return {
        "readiness_level": readiness,
        "checks": checks,
        "suggestions": data.get("suggestions", []),
        "disclaimer": "Heuristic analysis based on common ATS patterns. Not an actual score from an ATS vendor.",
    }
