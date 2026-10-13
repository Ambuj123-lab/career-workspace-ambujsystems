"""
MCP Tool: evidence_validator
Validates AI-generated claims against actual source data.
Implements the Claim Ledger pattern with deterministic percentage/SLA checks,
numeric thresholds, strict stop-words, and word-boundary token matching.
"""
import re
import logging
from typing import List, Dict, Any, Union

logger = logging.getLogger(__name__)

STRICT_STOP_WORDS = {
    "a", "an", "the", "in", "on", "at", "to", "for", "of", "with", "from", "by", "as",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "built", "build", "building", "worked", "working", "work", "created", "create", "creating",
    "developed", "develop", "developing", "used", "using", "use", "implemented", "implement", "implementing",
    "designed", "design", "designing", "this", "that", "these", "those", "their", "his", "her", "its",
    "into", "about", "your", "more", "and", "or", "but", "so", "if", "then", "our", "all", "out", "over"
}


def _match_word_boundary(text: str, word: str) -> bool:
    if not text or not word:
        return False
    escaped = re.escape(word)
    pattern = rf"(?:^|[^a-zA-Z0-9_]){escaped}(?:[^a-zA-Z0-9_]|$)"
    return bool(re.search(pattern, text, re.IGNORECASE))


async def evidence_validator(claims: Union[List[str], str], sources: Union[List[Dict[str, Any]], Dict[str, Any], List[str]]) -> dict:
    if isinstance(claims, str):
        claims = [claims]
    if isinstance(sources, dict):
        sources = [sources]
    elif not isinstance(sources, list):
        sources = []

    if not claims:
        return {
            "claim_ledger": [],
            "summary": {"verified": 0, "partial": 0, "unsupported": 0, "total": 0},
            "confidence": 0.0,
            "audit_verdict": "NO_CLAIMS_PROVIDED"
        }

    # Normalize corpus
    corpus = []
    for s in sources:
        if isinstance(s, str):
            raw = s.lower()
            corpus.append({"src": s, "clean": raw.replace(",", ""), "raw": raw})
        elif isinstance(s, dict):
            raw = (str(s.get("content", s.get("snippet", s.get("text", "")))) + " " + str(s.get("title", ""))).lower()
            corpus.append({"src": s, "clean": raw.replace(",", ""), "raw": raw})

    claim_ledger = []
    verified_count = 0
    partial_count = 0
    unsupported_count = 0

    for claim in claims:
        claim_str = str(claim).strip()
        claim_lower = claim_str.lower()
        claim_clean = claim_lower.replace(",", "")

        # 1. Percentage / SLA metric check (e.g. "99.98% uptime", "99.9% uptime")
        pct_match = re.search(r"(\d+(?:\.\d+)?)\s*%", claim_lower)
        if pct_match:
            target_pct = pct_match.group(1)
            has_pct = any(
                f"{target_pct}%" in c["clean"] or f"{target_pct} %" in c["clean"] or f"{target_pct} percent" in c["clean"]
                for c in corpus
            )
            if not has_pct:
                unsupported_count += 1
                claim_ledger.append({
                    "claim": claim_str,
                    "status": "UNSUPPORTED",
                    "source_url": None,
                    "evidence": None,
                    "action": "BLOCK",
                    "note": f"Percentage/SLA metric ({target_pct}%) not found in provided evidence source."
                })
                continue

        # 2. Numeric metric guard (e.g. "100+ stars", "5000+ stars", "10,000+ downloads")
        claim_num_match = re.search(r"(\d+[\d,]*)(?:k)?\+?\s*(?:github\s*)?(stars?|downloads?|users?|likes?|models?)", claim_lower)
        claim_duration_match = re.search(r"(\d+(?:\.\d+)?)\+?\s*(years?|yrs?|months?)", claim_lower)

        is_numeric_mismatch = False
        mismatch_note = ""
        numeric_best_match = None
        numeric_found_val = None

        if claim_num_match:
            raw_val = int(claim_num_match.group(1).replace(",", ""))
            if claim_num_match.group(1) + "k" in claim_lower:
                raw_val *= 1000
            metric_name = claim_num_match.group(2).lower()

            found_metric = None
            for item in corpus:
                words = re.sub(r"[^a-z0-9\s]", " ", item["clean"]).split()
                for idx, w in enumerate(words):
                    if metric_name in w or (metric_name.endswith("s") and w == metric_name[:-1]):
                        if idx > 0:
                            prev = re.sub(r"[^0-9]", "", words[idx - 1])
                            prev2 = re.sub(r"[^0-9]", "", words[idx - 2]) if idx > 1 else ""
                            num_str = prev or prev2
                            if num_str:
                                src_val = int(num_str)
                                if (words[idx - 1].endswith("k")) or (idx > 1 and words[idx - 2].endswith("k")):
                                    src_val *= 1000
                                found_metric = {"src": item["src"], "val": src_val}
                                if raw_val <= src_val:
                                    numeric_best_match = item["src"]
                                    numeric_found_val = src_val
                                    break
                                else:
                                    is_numeric_mismatch = True
                                    mismatch_note = f"Numeric discrepancy: Claimed {raw_val} {metric_name} exceeds evidence value of {src_val} {metric_name}"
                if numeric_best_match:
                    break

            if is_numeric_mismatch and not numeric_best_match:
                unsupported_count += 1
                claim_ledger.append({
                    "claim": claim_str,
                    "status": "UNSUPPORTED",
                    "source_url": found_metric["src"].get("url") if isinstance(found_metric.get("src"), dict) else None,
                    "evidence": (found_metric["src"].get("content") or found_metric["src"].get("snippet") or "")[:200] if isinstance(found_metric.get("src"), dict) else str(found_metric.get("src"))[:200],
                    "action": "BLOCK",
                    "note": mismatch_note
                })
                continue

        # If numeric threshold directly satisfied (e.g. 100+ <= 108)
        if numeric_best_match and numeric_found_val is not None:
            verified_count += 1
            src_url = numeric_best_match.get("url", "source://provided") if isinstance(numeric_best_match, dict) else "source://provided"
            src_ev = (numeric_best_match.get("content") or numeric_best_match.get("snippet") or "")[:200] if isinstance(numeric_best_match, dict) else str(numeric_best_match)[:200]
            claim_ledger.append({
                "claim": claim_str,
                "status": "VERIFIED",
                "source_url": src_url,
                "evidence": src_ev,
                "action": "USE",
                "note": f"Verified metric threshold ({numeric_found_val} satisfies {claim_str})"
            })
            continue

        # 3. Temporal Guard
        if claim_duration_match and not numeric_best_match:
            has_career_src = any(
                claim_duration_match.group(0).lower() in c["clean"] or
                ("experience" in c["clean"] and claim_duration_match.group(1) in c["clean"])
                for c in corpus
            )
            if not has_career_src:
                partial_count += 1
                claim_ledger.append({
                    "claim": claim_str,
                    "status": "PARTIAL",
                    "source_url": None,
                    "evidence": None,
                    "action": "FLAG",
                    "note": "Duration/tenure claim cannot be proven from project snippet alone. Requires candidate career history."
                })
                continue

        # 4. Distinctive Token Extraction with STRICT Stop-Words
        claim_tokens = [
            w for w in re.sub(r"[^a-z0-9\s]", " ", claim_clean).split()
            if len(w) >= 2 and w not in STRICT_STOP_WORDS
        ]

        if not claim_tokens:
            unsupported_count += 1
            claim_ledger.append({
                "claim": claim_str,
                "status": "UNSUPPORTED",
                "source_url": None,
                "evidence": None,
                "action": "BLOCK",
                "note": "No verifiable distinctive tokens detected in claim."
            })
            continue

        max_matched = 0
        best_match = numeric_best_match

        for item in corpus:
            matched = sum(1 for t in claim_tokens if _match_word_boundary(item["clean"], t))
            if matched > max_matched:
                max_matched = matched
                best_match = item["src"]

        token_ratio = max_matched / len(claim_tokens)

        if token_ratio >= 0.70 and (max_matched >= 2 or len(claim_tokens) == 1) and best_match:
            verified_count += 1
            src_url = best_match.get("url", "source://provided") if isinstance(best_match, dict) else "source://provided"
            src_ev = (best_match.get("content") or best_match.get("snippet") or "")[:200] if isinstance(best_match, dict) else str(best_match)[:200]
            claim_ledger.append({
                "claim": claim_str,
                "status": "VERIFIED",
                "source_url": src_url,
                "evidence": src_ev,
                "action": "USE"
            })
        elif token_ratio >= 0.40 and max_matched >= 1 and best_match:
            partial_count += 1
            src_url = best_match.get("url", "source://provided") if isinstance(best_match, dict) else "source://provided"
            src_ev = (best_match.get("content") or best_match.get("snippet") or "")[:150] if isinstance(best_match, dict) else str(best_match)[:150]
            claim_ledger.append({
                "claim": claim_str,
                "status": "PARTIAL",
                "source_url": src_url,
                "evidence": src_ev,
                "action": "FLAG",
                "note": "Partial keyword overlap; requires candidate corroboration"
            })
        else:
            unsupported_count += 1
            claim_ledger.append({
                "claim": claim_str,
                "status": "UNSUPPORTED",
                "source_url": None,
                "evidence": None,
                "action": "BLOCK",
                "note": "No corroborating evidence detected in provided source corpus. Requires candidate corroboration."
            })

    total = len(claims)
    confidence = round(verified_count / total, 2) if total > 0 else 0.0
    audit_verdict = (
        "UNSUPPORTED_CLAIMS_DETECTED" if unsupported_count > 0
        else "PARTIALLY_SUPPORTED" if partial_count > 0
        else "EVIDENCE_SUPPORTED"
    )

    return {
        "confidence": confidence,
        "verified_claims_count": verified_count,
        "partial_claims_count": partial_count,
        "unsupported_claims_count": unsupported_count,
        "total_claims": total,
        "audit_verdict": audit_verdict,
        "claim_ledger": claim_ledger,
    }
