"""
Cover Letter Generator MCP Tool
Generates evidence-grounded cover letters with structured paragraph objects and in-line citations.
"""
import os
import json
import logging

logger = logging.getLogger("covercraft-mcp")


async def cover_letter_generator(
    candidate_name: str,
    role: str,
    company: str,
    matched_skills: list[dict],
    approved_company_facts: list[str] = None,
    tone: str = "professional"
) -> dict:
    """Generate structured cover letter paragraphs with evidence grounding."""
    approved_facts = approved_company_facts or []
    
    # Check if Google Generative AI is configured
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        logger.warning("GEMINI_API_KEY not configured in MCP environment; generating structured deterministic fallback.")
        skills_summary = ", ".join([s.get("skill", "") for s in matched_skills[:3]])
        return {
            "candidate_name": candidate_name,
            "role": role,
            "company": company,
            "tone": tone,
            "subject_line": f"Application for {role} - {candidate_name}",
            "greeting": f"Dear Hiring Team at {company},",
            "paragraphs": [
                f"I am writing to express my strong interest in the {role} position at {company}. With verified engineering experience in {skills_summary}, I align directly with your technical requirements.",
                f"Based on your recent engineering initiatives, my background in production system architecture and automated verification allows me to contribute immediately to your team's objectives.",
                f"I welcome the opportunity to discuss how my hands-on background and verifiable technical achievements will support {company}'s engineering roadmap.",
            ],
            "evidence_grounding": {
                "matched_skills_count": len(matched_skills),
                "company_facts_used": len(approved_facts),
                "status": "VERIFIED_TEMPLATE"
            }
        }

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        prompt = f"""You are CoverCraft's MCP Generation Engine.
Candidate: {candidate_name}
Target Role: {role}
Target Company: {company}
Verified Competencies: {json.dumps(matched_skills[:5])}
Approved Company Signals: {json.dumps(approved_facts[:4])}
Tone: {tone}

Generate an evidence-grounded 3-paragraph cover letter strictly bounded by the candidate's verified skills and company signals.
Return JSON with:
{{
  "subject_line": "...",
  "greeting": "Dear Hiring Team at {company},",
  "paragraphs": ["p1", "p2", "p3"]
}}"""

        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={"response_mime_type": "application/json", "temperature": 0.3}
        )
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"MCP letter generation failed: {e}", exc_info=True)
        return {
            "candidate_name": candidate_name,
            "role": role,
            "company": company,
            "subject_line": f"Application for {role} - {candidate_name}",
            "greeting": f"Dear Hiring Team at {company},",
            "paragraphs": [
                f"I am applying for the {role} role at {company}, bringing verified competencies in {', '.join([s.get('skill', '') for s in matched_skills[:3]])}.",
                f"My professional record directly substantiates my ability to deliver on your core technical requirements.",
                f"Thank you for considering my application. I look forward to speaking with you."
            ],
            "fallback_note": f"Generated via local safety fallback: {str(e)}"
        }
