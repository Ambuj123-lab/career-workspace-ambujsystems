"""
Source Filter MCP Tool
Heuristic evaluation of domain credibility, tier ranking, and temporal freshness.
"""
from urllib.parse import urlparse
import re

TIER1_DOMAINS = {
    "github.com", "sec.gov", "greenhouse.io", "lever.co", "workday.com",
    "reuters.com", "techcrunch.com", "bloomberg.com", "forbes.com", "cnbc.com",
    "theinformation.com", "wsj.com", "ft.com"
}

NOISE_DOMAINS = {
    "pinterest.com", "quora.com", "facebook.com", "instagram.com", "tiktok.com"
}


async def source_filter(sources: list[dict], company_domain: str = "") -> dict:
    """Filter and rank retrieved sources based on domain authority and recency."""
    filtered = []
    dropped_count = 0

    for s in sources:
        url = s.get("url", "")
        if not url:
            continue

        try:
            hostname = urlparse(url).netloc.lower()
        except Exception:
            dropped_count += 1
            continue

        # Drop noise domains
        if any(noise in hostname for noise in NOISE_DOMAINS):
            dropped_count += 1
            continue

        tier = 2
        trust_score = 70
        category = "External Media"

        if company_domain and company_domain.lower() in hostname:
            tier = 1
            trust_score = 95
            category = "Official Company Domain"
        elif any(t1 in hostname for t1 in TIER1_DOMAINS):
            tier = 1
            trust_score = 90
            category = "Verified Newsroom / Primary Source"
        elif any(jb in hostname for jb in ["naukri.com", "ambitionbox.com", "indeed.com", "glassdoor.com", "linkedin.com"]):
            tier = 2
            trust_score = 75
            category = "Verified Job Board"
        else:
            tier = 3
            trust_score = 55
            category = "Supporting Context"

        # Temporal check
        blob = (s.get("title", "") + " " + s.get("snippet", "") + " " + s.get("content", "")).lower()
        old_match = re.search(r"\b(201[0-9]|202[0-3])\b", blob)
        recent_match = re.search(r"\b(202[4-6])\b", blob)

        freshness = "CURRENT (2024-2026)"
        if old_match and not recent_match:
            freshness = "HISTORICAL (>2y)"
            trust_score -= 10
        elif recent_match:
            trust_score += 5

        filtered.append({
            "url": url,
            "title": s.get("title", "Untitled Source"),
            "domain": hostname,
            "tier": tier,
            "trust_score": trust_score,
            "category": category,
            "freshness": freshness,
            "recommended_action": "RETAIN" if trust_score >= 60 else "OPTIONAL_SUPPORT"
        })

    # Sort descending by trust_score
    filtered.sort(key=lambda x: x["trust_score"], reverse=True)

    return {
        "status": "SUCCESS",
        "total_evaluated": len(sources),
        "retained_count": len(filtered),
        "dropped_noise_count": dropped_count,
        "ranked_sources": filtered
    }
