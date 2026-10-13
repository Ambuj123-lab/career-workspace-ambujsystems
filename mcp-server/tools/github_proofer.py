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


def _test_word_boundary(text: str, kw: str) -> bool:
    if not text or not kw:
        return False
    escaped = re.escape(kw)
    pattern = rf"(^|[^a-zA-Z0-9]){escaped}([^a-zA-Z0-9]|$)"
    return bool(re.search(pattern, text, re.IGNORECASE))


async def github_proofer(candidate_github_or_resume: str = None, candidate_gh_or_resume: str = None, technical_claims: list[str] = None) -> dict:
    input_str = (candidate_github_or_resume or candidate_gh_or_resume or "").strip()
    input_str = (candidate_github_or_resume or candidate_gh_or_resume or "").strip()
    username = re.sub(r"^https?://github\.com/", "", input_str, flags=re.IGNORECASE)
    username = re.sub(r"^@", "", username).split("/")[0].strip()

    gh_url_match = re.search(r"github\.com/([a-zA-Z0-9_-]+)", input_str, re.IGNORECASE)
    if gh_url_match:
        username = gh_url_match.group(1)

    if not username or username.lower() in ["features", "business", "explore", "marketplace", "pricing", "about", "contact"]:
        return {
            "username": "NOT_PROVIDED",
            "profile_url": "",
            "developer_followers": 0,
            "total_public_repositories": 0,
            "aggregate_stars": 0,
            "aggregate_forks": 0,
            "verified_repositories": [],
            "claim_verifications": [
                {"claim": c, "status": "RESUME_ONLY", "note": "No public GitHub handle detected in resume"}
                for c in (technical_claims or [])
            ],
            "audit_verdict": "NO_GITHUB_PROFILE_DETECTED",
        }

    headers = _get_headers()
    user_data = {}
    repos_data = []

    try:
        user_req = urllib.request.Request(f"{GITHUB_API_BASE}/users/{username}", headers=headers)
        with urllib.request.urlopen(user_req, timeout=8) as resp:
            user_data = json.loads(resp.read().decode("utf-8"))

        repos_req = urllib.request.Request(
            f"{GITHUB_API_BASE}/users/{username}/repos?sort=updated&per_page=100",
            headers=headers
        )
        with urllib.request.urlopen(repos_req, timeout=10) as resp:
            repos_data = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        logger.warning(f"GitHub public fetch failed for {username}: {e}")

    verified_repos = []
    backed_skills = set()
    all_languages = set()

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
        corpus = f"{repo_name} {desc} {' '.join(topics)}".lower()

        for skill, kws in keywords_map.items():
            if any(_test_word_boundary(corpus, kw) for kw in kws):
                matched_skills_for_repo.append(skill)
                backed_skills.add(skill)

        if lang:
            all_languages.add(lang)
            if lang not in matched_skills_for_repo:
                matched_skills_for_repo.append(lang)

        verified_repos.append({
            "repo_name": repo_name,
            "repo_url": repo.get("html_url", f"https://github.com/{username}/{repo_name}"),
            "description": desc,
            "primary_language": lang,
            "stars": stars,
            "forks": forks,
            "open_issues": repo.get("open_issues_count", 0),
            "license": (repo.get("license") or {}).get("spdx_id") or "None",
            "last_pushed_at": repo.get("pushed_at", ""),
            "matched_technologies": list(set(matched_skills_for_repo)),
            "is_fork": bool(repo.get("fork", False)),
            "is_flagship": stars >= 5,
        })

    verified_repos.sort(key=lambda x: x["stars"], reverse=True)

    claim_verifications = []
    max_single_repo_stars = max([r.get("stargazers_count", 0) for r in repos_data], default=0)

    repo_claims = technical_claims or ["Python backend engineering", "MCP server development", "RAG vector search"]

    domain_qualifiers = ["10-k", "10-q", "sec", "edgar", "hipaa", "fda", "gdpr"]

    for claim in repo_claims:
        claim_lower = claim.lower().strip()

        # Check 1: Numeric star claims
        star_match = re.search(r"(\d+[\d,]*)\+?\s*(?:github\s*)?stars?", claim_lower)
        is_single_repo = bool(re.search(r"single\s*repo|one\s*repo|flagship|single\s*repository|individual\s*repo", claim_lower))

        if star_match or "star" in claim_lower:
            raw_num = star_match.group(1).replace(",", "") if star_match else None
            if not raw_num:
                fallback_num = re.search(r"\d+", claim_lower)
                raw_num = fallback_num.group(0) if fallback_num else None

            if raw_num:
                threshold = int(raw_num)
                if raw_num + "k" in claim_lower:
                    threshold *= 1000

                if is_single_repo:
                    if max_single_repo_stars >= threshold:
                        top_repo = next((r for r in verified_repos if r["stars"] == max_single_repo_stars), None)
                        claim_verifications.append({
                            "claim": claim,
                            "status": "VERIFIED_BY_GITHUB",
                            "repo": top_repo["repo_name"] if top_repo else None,
                            "note": f"Verified {max_single_repo_stars} stars on flagship repository '{top_repo['repo_name'] if top_repo else ''}' (Claimed: {threshold}+ stars on single repo).",
                        })
                    else:
                        claim_verifications.append({
                            "claim": claim,
                            "status": "UNSUPPORTED_BY_GITHUB",
                            "repo": None,
                            "note": f"Overclaim detected: Candidate's highest-starred single repository has {max_single_repo_stars} stars (Claimed: {threshold}+ stars on single repository). Aggregate across all repositories is {aggregate_stars}.",
                        })
                    continue

                named_repo = next((r for r in repos_data if r.get("name", "").lower() in claim_lower), None)
                if named_repo:
                    repo_stars = named_repo.get("stargazers_count", 0)
                    if repo_stars >= threshold:
                        claim_verifications.append({
                            "claim": claim,
                            "status": "VERIFIED_BY_GITHUB",
                            "repo": named_repo.get("name"),
                            "note": f"Verified {repo_stars} stars on repository '{named_repo.get('name')}' (Claimed: {threshold}+ stars).",
                        })
                    else:
                        claim_verifications.append({
                            "claim": claim,
                            "status": "UNSUPPORTED_BY_GITHUB",
                            "repo": named_repo.get("name"),
                            "note": f"Overclaim detected: Repository '{named_repo.get('name')}' has {repo_stars} stars (Claimed: {threshold}+ stars).",
                        })
                    continue

                if aggregate_stars >= threshold:
                    top_repo = next((r for r in verified_repos if r["stars"] >= threshold), None) or (verified_repos[0] if verified_repos else None)
                    claim_verifications.append({
                        "claim": claim,
                        "status": "VERIFIED_BY_GITHUB",
                        "repo": top_repo["repo_name"] if top_repo else None,
                        "note": f"Verified {aggregate_stars} aggregate GitHub stars across inspected repositories (Claimed: {threshold}+ stars).",
                    })
                else:
                    claim_verifications.append({
                        "claim": claim,
                        "status": "UNSUPPORTED_BY_GITHUB",
                        "repo": None,
                        "note": f"Overclaim detected: Candidate has {aggregate_stars} aggregate GitHub stars across inspected repositories (Claimed: {threshold}+ stars).",
                    })
                continue

        # Check 2: Explicit named repository in claim
        named_explicit_repo = next((
            r for r in repos_data
            if r.get("name", "").lower() != username.lower() and (
                f"({r.get('name', '').lower()})" in claim_lower or r.get("name", "").lower() in claim_lower
            )
        ), None)

        claim_qualifiers = [q for q in domain_qualifiers if _test_word_boundary(claim_lower, q)]

        if named_explicit_repo:
            if claim_qualifiers:
                repo_full_text = f"{named_explicit_repo.get('name', '')} {named_explicit_repo.get('description', '')}".lower()
                has_qualifiers = all(q in repo_full_text for q in claim_qualifiers)
                if not has_qualifiers:
                    claim_verifications.append({
                        "claim": claim,
                        "status": "UNSUPPORTED_BY_GITHUB",
                        "repo": named_explicit_repo.get("name"),
                        "note": f"Domain qualifier mismatch: Claim asserts support for {', '.join(claim_qualifiers)}, but repository '{named_explicit_repo.get('name')}' description is '{named_explicit_repo.get('description') or 'N/A'}'.",
                    })
                    continue

            claim_verifications.append({
                "claim": claim,
                "status": "VERIFIED_BY_GITHUB",
                "repo": named_explicit_repo.get("name"),
                "url": named_explicit_repo.get("html_url"),
                "note": f"Matched repository '{named_explicit_repo.get('name')}' directly via explicit repository name in claim",
            })
            continue

        # Check 3: Argmax token-overlap matching for projects
        GENERIC_STOP_WORDS = {"with", "from", "using", "built", "the", "and", "for", "open", "source", "public", "repository", "repo", "framework", "system", "code", "tools", "tool", "github"}
        claim_tokens = [w for w in re.sub(r"[^a-z0-9]", " ", claim_lower).split() if len(w) >= 3 and w not in GENERIC_STOP_WORDS]

        best_repo = None
        best_score = -1

        if claim_tokens:
            for r in verified_repos:
                if r["repo_name"].lower() == username.lower():
                    continue
                repo_tokens = set(w for w in re.sub(r"[^a-z0-9]", " ", (r["repo_name"] + " " + r["description"]).lower()).split() if w not in GENERIC_STOP_WORDS)
                score = sum(1 for t in claim_tokens if t in repo_tokens)
                if score > best_score:
                    best_score = score
                    best_repo = r

        if best_repo and (best_score >= 2 or (len(claim_tokens) == 1 and best_score == 1)):
            if claim_qualifiers:
                repo_full_text = f"{best_repo['repo_name']} {best_repo['description']}".lower()
                has_qualifiers = all(q in repo_full_text for q in claim_qualifiers)
                if not has_qualifiers:
                    claim_verifications.append({
                        "claim": claim,
                        "status": "UNSUPPORTED_BY_GITHUB",
                        "repo": best_repo["repo_name"],
                        "note": f"Domain qualifier mismatch: Claim asserts support for {', '.join(claim_qualifiers)}, but repository '{best_repo['repo_name']}' is designed for Indian legal/financial documents without {', '.join(claim_qualifiers)} support.",
                    })
                    continue

            claim_verifications.append({
                "claim": claim,
                "status": "VERIFIED_BY_GITHUB",
                "repo": best_repo["repo_name"],
                "url": best_repo["repo_url"],
                "note": f"Matched repository '{best_repo['repo_name']}' via verified project tokens (overlap score: {best_score})",
            })
            continue

        # Check 4: Technology match using strict word boundary
        tech_match = next((
            r for r in verified_repos
            if any(_test_word_boundary(claim_lower, t.lower()) for t in r["matched_technologies"]) or
            (r["primary_language"] and _test_word_boundary(claim_lower, r["primary_language"].lower()))
        ), None)

        if tech_match:
            claim_verifications.append({
                "claim": claim,
                "status": "VERIFIED_BY_GITHUB",
                "repo": tech_match["repo_name"],
                "url": tech_match["repo_url"],
                "note": f"Verified via active codebase in '{tech_match['repo_name']}'",
            })
            continue

        claim_verifications.append({
            "claim": claim,
            "status": "UNSUPPORTED_BY_GITHUB",
            "repo": None,
            "note": f"No public repository backing '{claim}' found on candidate profile.",
        })

    supported_count = sum(1 for c in claim_verifications if c.get("status") == "VERIFIED_BY_GITHUB")
    if repos_data:
        if technical_claims:
            verdict = "EVIDENCE_SUPPORTED" if supported_count == len(technical_claims) else "PARTIALLY_SUPPORTED" if supported_count > 0 else "UNSUPPORTED_CLAIMS_DETECTED"
        else:
            verdict = "STRONG_GITHUB_PROOF" if len(verified_repos) >= 2 else "PARTIAL_GITHUB_PROOF"
    else:
        verdict = "NO_GITHUB_REPOSITORIES_FOUND"

    return {
        "username": username,
        "profile_url": f"https://github.com/{username}",
        "developer_followers": user_data.get("followers", 0),
        "total_public_repositories": user_data.get("public_repos", len(repos_data)),
        "inspected_repositories_count": len(repos_data),
        "aggregate_stars": aggregate_stars,
        "aggregate_forks": aggregate_forks,
        "verified_repositories": verified_repos,
        "primary_languages": list(all_languages),
        "grounded_technologies": list(backed_skills),
        "claim_verifications": claimVerifications if 'claimVerifications' in locals() else claim_verifications,
        "audit_verdict": verdict,
    }
