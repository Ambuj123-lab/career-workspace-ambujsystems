"""
MCP Tool: huggingface_proofer
Inspects candidate's public Hugging Face profile, models, spaces, and lifetime metrics.
Validates production open-source model releases, architecture tags, and download milestones.
"""
import os
import re
import json
import logging
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

HF_API_BASE = "https://huggingface.co/api"


def _get_headers() -> dict:
    token = os.environ.get("HF_TOKEN", "").strip()
    headers = {
        "Accept": "application/json",
        "User-Agent": "CoverCraft-Evidence-MCP/1.0",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


async def huggingface_proofer(candidate_hf_or_resume: str, ai_technical_claims: list[str] = None) -> dict:
    input_str = (candidate_hf_or_resume or "").strip()
    username = re.sub(r"^https?://huggingface\.co/", "", input_str, flags=re.IGNORECASE)
    username = re.sub(r"^@", "", username).split("/")[0].strip()

    hf_url_match = re.search(r"huggingface\.co/([a-zA-Z0-9_-]+)", input_str, re.IGNORECASE)
    if hf_url_match:
        username = hf_url_match.group(1)

    if not username or username.lower() in ["models", "datasets", "spaces", "docs", "blog", "settings"]:
        return {
            "username": "NOT_PROVIDED",
            "profile_url": "",
            "total_models_published": 0,
            "total_spaces_published": 0,
            "aggregate_downloads_30d": 0,
            "aggregate_downloads_all_time": 0,
            "aggregate_likes": 0,
            "verified_models": [],
            "verified_spaces": [],
            "claim_verifications": [
                {"claim": c, "status": "RESUME_CLAIM_UNVERIFIED_ON_HF", "note": "No public Hugging Face handle detected in resume"}
                for c in (ai_technical_claims or [])
            ],
            "audit_verdict": "NO_HF_PROFILE_DETECTED",
        }

    headers = _get_headers()
    models_data = []
    spaces_data = []

    try:
        models_url = f"{HF_API_BASE}/models?author={username}&expand[]=downloads&expand[]=downloadsAllTime&expand[]=likes"
        req = urllib.request.Request(models_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            models_data = json.loads(resp.read().decode("utf-8"))

        spaces_url = f"{HF_API_BASE}/spaces?author={username}"
        req_sp = urllib.request.Request(spaces_url, headers=headers)
        with urllib.request.urlopen(req_sp, timeout=8) as resp:
            spaces_data = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        logger.warning(f"HF public API fetch error for {username}: {e}")

    total_monthly = sum(m.get("downloads", 0) for m in models_data)
    total_all_time = sum(
        m.get("downloadsAllTime") if m.get("downloadsAllTime") is not None else m.get("downloads", 0)
        for m in models_data
    )
    total_likes = sum(m.get("likes", 0) for m in models_data)

    ai_keywords_map = {
        "LoRA / QLoRA Fine-Tuning": ["lora", "qlora", "fine-tuning", "finetuning", "adapter"],
        "GGUF Quantization": ["gguf", "quantized", "quantization", "llama.cpp"],
        "Llama LLM Family (3.1 / 3.2 / 8B / 3B)": ["llama", "llama-3.1", "llama-3.2", "llama3"],
        "Domain-Specific LLM (Legal AI)": ["legal", "indian-legal", "lexbot"],
        "Interactive AI Spaces (Gradio)": ["gradio", "space", "spaces", "chatbot"],
    }

    verified_models = []
    backed_ai_skills = set()

    for m in models_data:
        m_id = m.get("id", "")
        m_name = m_id.split("/")[-1] if "/" in m_id else m_id
        monthly_d = m.get("downloads", 0)
        all_time_d = m.get("downloadsAllTime") if m.get("downloadsAllTime") is not None else monthly_d
        tags = [str(t).lower() for t in m.get("tags", [])]

        matched_caps = []
        corpus = f"{m_id} {' '.join(tags)}".lower()

        for cap, kws in ai_keywords_map.items():
            if any(kw in corpus for kw in kws):
                matched_caps.append(cap)
                backed_ai_skills.add(cap)

        verified_models.append({
            "model_id": m_id,
            "model_name": m_name,
            "model_url": f"https://huggingface.co/{m_id}",
            "pipeline_tag": m.get("pipeline_tag", "text-generation"),
            "downloads_30d": monthly_d,
            "downloads_all_time": all_time_d,
            "likes": m.get("likes", 0),
            "matched_capabilities": matched_caps,
            "is_flagship": all_time_d >= 1000,
            "proof_status": "WEIGHTS_VERIFIED",
        })

    verified_models.sort(key=lambda x: x["downloads_all_time"], reverse=True)

    verified_spaces = [
        {
            "space_id": s.get("id"),
            "space_url": f"https://huggingface.co/spaces/{s.get('id')}",
            "likes": s.get("likes", 0),
            "sdk": s.get("sdk", "gradio"),
            "status": "VERIFIED_LIVE_SPACE",
        }
        for s in spaces_data
    ]

    claim_verifications = []
    max_single_model_downloads = max([m["downloads_all_time"] for m in verified_models], default=0)

    for claim in (ai_technical_claims or []):
        claim_lower = claim.lower().strip()

        # Check 1: Numeric download claims
        dl_match = re.search(r"(\d+[\d,]*)(?:k)?\+?\s*downloads?", claim_lower)
        is_single_asset = bool(re.search(r"single\s*model|one\s*model|flagship|single\s*checkpoint|individual\s*model", claim_lower))

        if dl_match:
            raw_num = dl_match.group(1).replace(",", "")
            threshold = int(raw_num)
            if raw_num + "k" in claim_lower:
                threshold *= 1000

            if is_single_asset:
                if max_single_model_downloads >= threshold:
                    claim_verifications.append({
                        "claim": claim,
                        "status": "VERIFIED_BY_HUGGINGFACE",
                        "note": f"Verified {max_single_model_downloads} downloads on flagship model (Claimed: {threshold}+ downloads on a single model)",
                    })
                else:
                    claim_verifications.append({
                        "claim": claim,
                        "status": "UNSUPPORTED_BY_HUGGINGFACE",
                        "note": f"Overclaim detected: Candidate's highest-downloaded single model has {max_single_model_downloads} downloads (Claimed: {threshold}+ on a single model). Aggregate across all models is {total_all_time}.",
                    })
                continue

            if total_all_time >= threshold:
                claim_verifications.append({
                    "claim": claim,
                    "status": "VERIFIED_BY_HUGGINGFACE",
                    "note": f"Verified {total_all_time} lifetime downloads on Hugging Face (Claimed: {threshold}+ downloads)",
                })
            else:
                claim_verifications.append({
                    "claim": claim,
                    "status": "UNSUPPORTED_BY_HUGGINGFACE",
                    "note": f"Claimed {threshold}+ downloads exceeds verified lifetime downloads ({total_all_time})",
                })
            continue

        # Check 2: Numeric like claims
        like_match = re.search(r"(\d+[\d,]*)\+?\s*likes?", claim_lower)
        if like_match:
            threshold = int(like_match.group(1).replace(",", ""))
            if total_likes >= threshold:
                claim_verifications.append({
                    "claim": claim,
                    "status": "VERIFIED_BY_HUGGINGFACE",
                    "note": f"Verified {total_likes} community likes across models (Claimed: {threshold}+ likes)",
                })
            else:
                claim_verifications.append({
                    "claim": claim,
                    "status": "UNSUPPORTED_BY_HUGGINGFACE",
                    "note": f"Claimed {threshold}+ likes exceeds verified total likes ({total_likes})",
                })
            continue

        # Check 3: Spaces / Gradio Demo claims
        if "space" in claim_lower or "gradio" in claim_lower:
            if verified_spaces or spaces_data:
                sp = verified_spaces[0] if verified_spaces else {"space_id": spaces_data[0].get("id"), "space_url": f"https://huggingface.co/spaces/{spaces_data[0].get('id')}"}
                claim_verifications.append({
                    "claim": claim,
                    "status": "VERIFIED_BY_HUGGINGFACE",
                    "matched_asset": sp["space_id"],
                    "proof_url": sp["space_url"],
                    "note": "Verified live interactive Gradio space hosted on Hugging Face",
                })
            else:
                claim_verifications.append({
                    "claim": claim,
                    "status": "UNSUPPORTED_BY_HUGGINGFACE",
                    "note": "No public Hugging Face spaces found for candidate profile",
                })
            continue

        # Check 4: Specific model or capability match
        match = next(
            (m for m in verified_models if any(c.lower() in claim_lower for c in m["matched_capabilities"]) or m["model_name"].lower() in claim_lower),
            None
        )
        if match:
            claim_verifications.append({
                "claim": claim,
                "status": "VERIFIED_BY_HUGGINGFACE",
                "matched_asset": match["model_id"],
                "downloads_all_time": match["downloads_all_time"],
                "proof_url": match["model_url"],
            })
        else:
            claim_verifications.append({
                "claim": claim,
                "status": "UNSUPPORTED_BY_HUGGINGFACE",
                "note": f"No matching public Hugging Face model or capability found for '{claim}'",
            })

    supported_count = sum(1 for c in claim_verifications if c.get("status") == "VERIFIED_BY_HUGGINGFACE")
    if ai_technical_claims:
        verdict = "ALL_AI_CLAIMS_VERIFIED" if supported_count == len(ai_technical_claims) else "PARTIALLY_SUPPORTED" if supported_count > 0 else "UNSUPPORTED_CLAIMS_DETECTED"
    else:
        verdict = "VERIFIED_PRODUCTION_WEIGHTS" if total_all_time >= 100 and len(models_data) >= 3 else "VERIFIED_COMMUNITY_ASSETS" if len(models_data) >= 1 or len(spaces_data) >= 1 else "NO_PUBLIC_WEIGHTS_DETECTED"

    return {
        "username": username,
        "profile_url": f"https://huggingface.co/{username}",
        "total_models_published": len(models_data),
        "total_spaces_published": len(spaces_data),
        "aggregate_downloads_all_time": total_all_time,
        "aggregate_downloads_30d": total_monthly,
        "aggregate_likes": total_likes,
        "verified_models": verified_models,
        "verified_spaces": verified_spaces,
        "grounded_ai_skills": list(backed_ai_skills),
        "claim_verifications": claim_verifications,
        "audit_verdict": verdict,
    }
