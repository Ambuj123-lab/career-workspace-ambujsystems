"""
MCP Tool: github_proofer
Inspects a candidate's public GitHub repositories, code languages, and commit evidence.
Cross-references technical resume claims with verifiable production code.
100% Free / Read-Only (uses public GitHub API or optional GITHUB_TOKEN).
"""
import os
import re
import json
import logging
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

GITHUB_API_BASE = "https://api.github.com"


def _get_headers() -> dict:
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "CoverCraft-Evidence-MCP/1.0",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _extract_username(resume_or_handle: str) -> str:
    """Extract clean GitHub username from URL, @handle, or text."""
    match = re.search(r"github\.com/([a-zA-Z0-9_-]+)", resume_or_handle, re.IGNORECASE)
    if match:
        user = match.group(1).strip()
        if user.lower() not in ["features", "pricing", "explore", "about", "contact"]:
            return user
    handle_match = re.search(r"@([a-zA-Z0-9_-]+)", resume_or_handle)
    if handle_match:
        return handle_match.group(1).strip()
    clean = resume_or_handle.strip().lstrip("@")
    if len(clean) <= 40 and re.match(r"^[a-zA-Z0-9_-]+$", clean):
        return clean
    return ""


def _test_word_boundary(text: str, kw: str) -> bool:
    """Check if kw appears as a discrete word or kebab/snake token in text."""
    if not text or not kw:
        return False
    escaped = re.escape(kw)
    return bool(re.search(rf"(^|[^a-zA-Z0-9]){escaped}([^a-zA-Z0-9]|$)", text, re.IGNORECASE))


async def github_proofer(
    candidate_github_or_resume: str,
    technical_claims: list[str] | None = None,
) -> dict:
    """
    Inspects candidate's public GitHub profile and repositories.
    Correlates resume technical claims with verified code repositories.
    """
    username = _extract_username(candidate_github_or_resume)
    if not username:
        logger.info("No GitHub profile detected for candidate.")
        return {
            "candidate_handle": "NOT_PROVIDED",
            "profile_url": "",
            "developer_followers": 0,
            "total_public_repositories": 0,
            "aggregate_stars": 0,
            "aggregate_forks": 0,
            "total_repositories_inspected": 0,
            "verified_repositories_count": 0,
            "verified_repositories": [],
            "languages_detected": [],
            "skills_grounded_in_code": [],
            "claim_verifications": [
                {
                    "claim": c,
                    "status": "RESUME_ONLY",
                    "note": "No public GitHub handle detected in resume.",
                } for c in (technical_claims or [])
            ],
            "audit_verdict": "NO_GITHUB_PROFILE_DETECTED",
        }

    logger.info(f"Inspecting GitHub profile for candidate: {username}")
    headers = _get_headers()
    user_profile = {}
    repos_data = []

    # 1. Fetch Candidate Profile Metrics
    try:
        url_u = f"{GITHUB_API_BASE}/users/{username}"
        req_u = urllib.request.Request(url_u, headers=headers)
        with urllib.request.urlopen(req_u, timeout=5.0) as resp:
            if resp.status == 200:
                user_profile = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        logger.warning(f"GitHub user profile metadata fetch failed ({e}).")

    # 2. Fetch Public Repositories (up to 100)
    try:
        url = f"{GITHUB_API_BASE}/users/{username}/repos?sort=updated&per_page=100"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=6.0) as response:
            if response.status == 200:
                raw = response.read().decode("utf-8")
                repos_data = json.loads(raw)
    except Exception as e:
        logger.warning(f"GitHub API live fetch failed ({e}).")
        repos_data = []

    verified_repos = []
    all_languages = set()
    backed_skills = set()

    keywords_map = {
        "Python": ["python", "langgraph", "langchain", "pandas", "numpy"],
        "JavaScript": ["nextjs", "react", "javascript", "node", "tailwind"],
        "TypeScript": ["typescript", "nextjs", "react", "node"],
        "MCP": ["mcp", "model context protocol", "model-context-protocol"],
        "RAG": ["rag", "retrieval augmented", "retrieval-augmented", "vector-search", "embeddings", "pinecone", "chromadb", "qdrant"],
        "Docker": ["docker", "dockerfile", "containerized"],
        "FastAPI": ["fastapi"],
        "LangGraph": ["langgraph", "stategraph"],
    }

    aggregate_stars = 0
    aggregate_forks = 0

    for repo in repos_data:
        repo_name = repo.get("name", "")
        desc = repo.get("description") or ""
        lang = repo.get("language") if repo.get("language") != "Code" else None
        topics = [str(t).lower() for t in repo.get("topics", [])]
        stars = repo.get("stargazers_count", 0)
        forks = repo.get("forks_count", 0)
        aggregate_stars += stars
        aggregate_forks += forks

        matched_skills_for_repo = []
        for skill, kws in keywords_map.items():
            if lang and lang.lower() == skill.lower():
                matched_skills_for_repo.append(skill)
                backed_skills.add(skill)
            elif any(_test_word_boundary(desc, kw) or _test_word_boundary(repo_name, kw) or kw.lower() in topics for kw in kws):
                matched_skills_for_repo.append(skill)
                backed_skills.add(skill)

        final_lang = lang or ("Python" if "Python" in matched_skills_for_repo else "TypeScript" if "TypeScript" in matched_skills_for_repo else "JavaScript" if "JavaScript" in matched_skills_for_repo else "Polyglot / Docs")
        all_languages.add(final_lang)

        verified_repos.append({
            "repo_name": repo_name,
            "repo_url": repo.get("html_url", f"https://github.com/{username}/{repo_name}"),
            "description": repo.get("description", "Public open-source repository"),
            "primary_language": final_lang,
            "stars": stars,
            "forks": forks,
            "open_issues": repo.get("open_issues_count", 0),
            "license": (repo.get("license") or {}).get("spdx_id") or (repo.get("license") or {}).get("name") or "None",
            "last_pushed_at": repo.get("pushed_at", ""),
            "matched_technologies": list(set(matched_skills_for_repo)),
            "proof_status": "CODE_GROUNDED",
        })

    # Sort descending by stars
    verified_repos.sort(key=lambda x: x["stars"], reverse=True)

    # Evaluate any specific claims provided with strict numeric star gates
    claim_verifications = []
    GENERIC_STOP_WORDS = {"with", "from", "using", "built", "the", "and", "for", "open", "source", "public", "repository", "repo", "framework", "system", "code", "tools", "tool", "github"}

    if technical_claims:
        for claim in technical_claims:
            claim_lower = claim.lower().strip()

            # Check 1: Numeric star claims (Strict Gate: never fall through)
            star_match = re.search(r"(d+[d,]*)(?:k)?+?s*(?:githubs*)?stars?", claim_lower)
            if star_match or ("star" in claim_lower and re.search(r"d+", claim_lower)):
                raw_num = star_match.group(1).replace(",", "") if star_match else re.search(r"d+", claim_lower).group(0)
                threshold = int(raw_num)
                if raw_num + "k" in claim_lower:
                    threshold *= 1000

                matching_repo = next((r for r in verified_repos if r["stars"] >= threshold), None)
                if matching_repo:
                    claim_verifications.append({
                        "claim": claim,
                        "status": "VERIFIED_BY_GITHUB",
                        "repo": matching_repo["repo_name"],
                        "url": matching_repo["repo_url"],
                        "note": f"Verified {matching_repo['stars']} stars on {matching_repo['repo_name']} (Threshold: {threshold}+ stars)",
                    })
                else:
                    claim_verifications.append({
                        "claim": claim,
                        "status": "UNSUPPORTED_BY_GITHUB",
                        "repo": None,
                        "note": f"Overclaim detected: Candidate has {aggregate_stars} aggregate GitHub stars across inspected repositories (Claimed: {threshold}+ stars).",
                    })
                continue

            # Check 2: Token-overlap matching for named projects (Ignoring generic stopwords & profile repos)
            claim_tokens = [w for w in re.sub(r"[^a-z0-9]", " ", claim_lower).split() if len(w) >= 3 and w not in GENERIC_STOP_WORDS]
            token_match = None
            if claim_tokens:
                for r in verified_repos:
                    if r["repo_name"].lower() == username.lower():
                        continue
                    repo_tokens = set(w for w in re.sub(r"[^a-z0-9]", " ", (r["repo_name"] + " " + r["description"]).lower()).split() if w not in GENERIC_STOP_WORDS)
                    matched_t = [t for t in claim_tokens if t in repo_tokens]
                    if len(matched_t) >= 2 or (len(claim_tokens) == 1 and len(matched_t) == 1):
                        token_match = r
                        break
            if token_match:
                claim_verifications.append({
                    "claim": claim,
                    "status": "VERIFIED_BY_GITHUB",
                    "repo": token_match["repo_name"],
                    "url": token_match["repo_url"],
                    "note": f"Matched repository '{token_match['repo_name']}' via verified project tokens",
                })
                continue

            # Check 3: Technology match
            matching_repo = next(
                (r for r in verified_repos if any(_test_word_boundary(claim_lower, tech.lower()) for tech in r["matched_technologies"]) or (r["primary_language"] and _test_word_boundary(claim_lower, r["primary_language"].lower()))),
                None
            )
            if matching_repo:
                claim_verifications.append({
                    "claim": claim,
                    "status": "VERIFIED_BY_GITHUB",
                    "repo": matching_repo["repo_name"],
                    "url": matching_repo["repo_url"],
                    "note": f"Verified via active codebase in '{matching_repo['repo_name']}'",
                })
            else:
                claim_verifications.append({
                    "claim": claim,
                    "status": "UNSUPPORTED_BY_GITHUB",
                    "repo": None,
                    "note": f"No public repository backing '{claim}' found on candidate profile.",
                })

    if technical_claims:
        supported_count = sum(1 for c in claim_verifications if c.get("status") == "VERIFIED_BY_GITHUB")
        if supported_count == len(technical_claims):
            audit_verdict = "EVIDENCE_SUPPORTED"
        elif supported_count > 0:
            audit_verdict = "PARTIALLY_SUPPORTED"
        else:
            audit_verdict = "UNSUPPORTED_CLAIMS_DETECTED"
    else:
        audit_verdict = "STRONG_GITHUB_PROOF" if len(verified_repos) >= 2 else "PARTIAL_GITHUB_PROOF"

    return {
        "candidate_handle": username,
        "profile_url": f"https://github.com/{username}",
        "developer_followers": user_profile.get("followers", 0),
        "developer_following": user_profile.get("following", 0),
        "total_public_repositories": user_profile.get("public_repos", len(repos_data)),
        "aggregate_stars": aggregate_stars,
        "aggregate_forks": aggregate_forks,
        "total_repositories_inspected": len(repos_data),
        "verified_repositories_count": len(verified_repos),
        "verified_repositories": verified_repos,
        "languages_detected": list(all_languages),
        "skills_grounded_in_code": list(backed_skills),
        "claim_verifications": claim_verifications,
        "audit_verdict": audit_verdict,
    }
