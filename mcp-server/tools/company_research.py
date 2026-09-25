"""
MCP Tool: company_research
Searches the web for company information using Tavily API.
Returns grounded, cited results - NO hallucination.
Gemini summarizes ONLY from search results.
"""
from tavily import TavilyClient
import google.generativeai as genai
from config import (
    TAVILY_API_KEY, GEMINI_API_KEY, GEMINI_MODEL,
    GEMINI_TEMPERATURE, TAVILY_SEARCH_DEPTH, TAVILY_MAX_RESULTS,
    MAX_COMPANY_NAME_CHARS, validate_range, VALID_CONFIDENCE_RANGE,
)

genai.configure(api_key=GEMINI_API_KEY)
tavily_client = TavilyClient(api_key=TAVILY_API_KEY)


async def company_research(company_name: str, focus_areas: list[str] | None = None) -> dict:
    """
    Search web for company info. Returns grounded data with source citations.
    
    Pipeline:
        Tavily web search -> Raw results -> Gemini summarization (from results ONLY) -> Output
    
    Args:
        company_name: Target company name (max 200 chars)
        focus_areas: Optional list of focus areas ["tech_stack", "culture", "recent_news"]
    
    Returns:
        {
            "company": str,
            "description": str,
            "tech_stack": list[str],
            "recent_news": list[str],
            "culture_notes": str,
            "raw_sources": [{"url": str, "title": str, "snippet": str}],
            "confidence": "HIGH" | "MEDIUM" | "LOW"
        }
    """
    # Input validation
    if len(company_name) > MAX_COMPANY_NAME_CHARS:
        return {"error": f"Company name exceeds {MAX_COMPANY_NAME_CHARS} chars"}
    
    if not company_name.strip():
        return {"error": "Company name is required"}
    
    # Build search query
    focus = " ".join(focus_areas) if focus_areas else "overview tech stack engineering culture recent news"
    query = f"{company_name} company {focus}"
    
    # Step 1: Tavily web search (grounded, real-time)
    try:
        search_results = tavily_client.search(
            query=query,
            search_depth=TAVILY_SEARCH_DEPTH,
            max_results=TAVILY_MAX_RESULTS,
        )
    except Exception as e:
        return {
            "company": company_name,
            "error": f"Web search failed: {str(e)}",
            "raw_sources": [],
            "confidence": "LOW",
        }
    
    # Extract source data
    sources = []
    source_texts = []
    for r in search_results.get("results", []):
        sources.append({
            "url": r.get("url", ""),
            "title": r.get("title", ""),
            "snippet": r.get("content", "")[:500],
        })
        source_texts.append(f"Source: {r.get('title', '')}\nURL: {r.get('url', '')}\nContent: {r.get('content', '')}")
    
    if not sources:
        return {
            "company": company_name,
            "description": "No information found via web search.",
            "tech_stack": [],
            "recent_news": [],
            "culture_notes": "",
            "raw_sources": [],
            "confidence": "LOW",
        }
    
    # Step 2: Gemini summarizes ONLY from search results
    combined_sources = "\n\n---\n\n".join(source_texts)
    
    model = genai.GenerativeModel(
        GEMINI_MODEL,
        generation_config=genai.GenerationConfig(
            temperature=GEMINI_TEMPERATURE,
            response_mime_type="application/json",
        ),
    )
    
    prompt = f"""You are a research assistant. Summarize information about "{company_name}" 
STRICTLY from the search results below. 

CRITICAL RULES:
1. ONLY state facts found in the provided search results
2. If information is not in the results, say "Not found in sources"
3. NEVER invent or assume information
4. Tag each claim with which source it came from

Search Results:
{combined_sources}

Return JSON:
{{
    "description": "Brief company description from sources",
    "tech_stack": ["list", "of", "technologies", "mentioned"],
    "recent_news": ["recent developments mentioned in sources"],
    "culture_notes": "Any culture/work info from sources, or 'Not found in sources'"
}}"""
    
    try:
        response = model.generate_content(prompt)
        import json
        data = json.loads(response.text)
    except Exception as e:
        data = {
            "description": f"Summary generation failed: {str(e)}",
            "tech_stack": [],
            "recent_news": [],
            "culture_notes": "",
        }
    
    # Determine confidence
    num_sources = len(sources)
    confidence = "HIGH" if num_sources >= 3 else ("MEDIUM" if num_sources >= 1 else "LOW")
    
    return {
        "company": company_name,
        "description": data.get("description", ""),
        "tech_stack": data.get("tech_stack", []),
        "recent_news": data.get("recent_news", []),
        "culture_notes": data.get("culture_notes", ""),
        "raw_sources": sources,
        "confidence": confidence,
    }
