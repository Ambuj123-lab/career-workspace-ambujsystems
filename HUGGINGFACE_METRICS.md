# Hugging Face Model Telemetry & Deployment Metrics
**Author:** [Ambuj Kumar Tripathi (@invincibleambuj)](https://huggingface.co/invincibleambuj)  
**Domain Focus:** Domain-Specific LLM Fine-Tuning, Quantization (GGUF), & CPU-First Edge Inference  
**Last Verified Date:** October 11, 2026

---

## 1. Executive Summary

| Metric | Verified Value | Source / Methodology |
|---|:---:|---|
| **Total All-Time Downloads** | **18,026+** | Hugging Face Metadata (`downloadsAllTime`) |
| **Active Monthly Downloads (30D)** | **925** | Hugging Face Public Web Badge |
| **Total Community Likes / Stars** | **39** | Hugging Face Public Repository Hearts |
| **Total Published Models** | **6** | Verified Public Hugging Face Repositories |
| **Primary Domain Specialization** | **Indian Legal LLM** | Fine-Tuned Llama-3.x (1B, 3B, 8B architectures) |
| **Primary Deployment Formats** | **GGUF (Q4_K_M)** / QLoRA | Optimized for LM Studio, Ollama, & llama.cpp |

---

## 2. Complete Model-by-Model Breakdown

| # | Model Name & Public Link | Architecture / Type | All-Time Downloads | Monthly (30D) | Likes | Inference Engines |
|---|---|---|:---:|:---:|:---:|---|
| **1** | [Ambuj-Tripathi-Indian-Legal-Llama-GGUF](https://huggingface.co/invincibleambuj/Ambuj-Tripathi-Indian-Legal-Llama-GGUF) | **Llama 3.2 1B (GGUF Q4_K_M)** | **16,486** | **744** | **38** ⭐ | LM Studio, Ollama, llama.cpp |
| **2** | [Ambuj-Tripathi-Indian-Legal-Llama-3B-GGUF](https://huggingface.co/invincibleambuj/Ambuj-Tripathi-Indian-Legal-Llama-3B-GGUF) | **Llama 3.2 3B (GGUF Q4_K_M)** | **649** | **66** | **1** | LM Studio, Ollama, llama.cpp |
| **3** | [Ambuj-Tripathi-Llama-3.1-8B-IndianLegal-GGUF](https://huggingface.co/invincibleambuj/Ambuj-Tripathi-Llama-3.1-8B-IndianLegal-GGUF) | **Llama 3.1 8B (GGUF Q4_K_M)** | **609** | **101** | **0** | LM Studio, Ollama, llama.cpp |
| **4** | [Ambuj-Tripathi-Llama-8B-LoRA](https://huggingface.co/invincibleambuj/Ambuj-Tripathi-Llama-8B-LoRA) | **Llama 3.1 8B (LoRA Weights)** | **176** | **4** | **0** | Hugging Face PEFT / Transformers |
| **5** | [llama-3.2-3b-legal-india-qlora-v2](https://huggingface.co/invincibleambuj/llama-3.2-3b-legal-india-qlora-v2) | **Llama 3.2 3B (QLoRA Adapter)** | **106** | **10** | **0** | Unsloth, Transformers |
| **6** | [llama-3.2-1b-legal-india-qlora](https://huggingface.co/invincibleambuj/llama-3.2-1b-legal-india-qlora) | **Llama 3.2 1B (Base Adapter)** | **0** | **0** | **0** | Unsloth, Transformers |
| **TOTAL** | **Across All 6 Repositories** | **Domain-Specific Model Suite** | **18,026+** | **925** | **39** | **Multi-Runtime Deployment** |

---

## 3. How Anyone Can Verify Live (Zero Trust / 100% Deterministic)

Koi bhi recruiter, engineer, ya community member bina kisi login ya API key ke apne terminal (Windows CMD, PowerShell, Mac, ya Linux) me ye do official Hugging Face API commands run karke real-time live telemetry verify kar sakta hai:

### Verification 1: Flagship Model (30-Day Monthly & All-Time Total)
Run this single command to fetch the live metrics for the flagship legal model directly from the Hugging Face API:
```bash
python -c "import json,urllib.request as u; r=json.load(u.urlopen('https://huggingface.co/api/models/invincibleambuj/Ambuj-Tripathi-Indian-Legal-Llama-GGUF?expand[]=downloads&expand[]=downloadsAllTime')); print('30-day:', r['downloads'], '| all-time:', r['downloadsAllTime'])"
```
* **Live Server Output:** `30-day: 744 | all-time: 16486`

---

### Verification 2: Grand Total Across All 6 Models (All-Time Total)
Run this single command to query all models published by `@invincibleambuj` and aggregate total lifetime downloads:
```bash
python -c "import json,urllib.request as u; d=json.load(u.urlopen('https://huggingface.co/api/models?author=invincibleambuj&expand[]=downloadsAllTime')); print('Models:', len(d), '| Total all-time downloads:', sum(m['downloadsAllTime'] for m in d))"
```
* **Live Server Output:** `Models: 6 | Total all-time downloads: 18026`

---

### Direct Browser Verification (No Terminal Required)
Kisi bhi browser (Chrome / Edge / Safari) me bina command chalaye direct verify karne ke liye:
* **Flagship Model Web Page:** [huggingface.co/invincibleambuj/Ambuj-Tripathi-Indian-Legal-Llama-GGUF](https://huggingface.co/invincibleambuj/Ambuj-Tripathi-Indian-Legal-Llama-GGUF) (Displays 744 monthly downloads & 38 likes)
* **Official API JSON Endpoint:** [https://huggingface.co/api/models/invincibleambuj/Ambuj-Tripathi-Indian-Legal-Llama-GGUF?expand[]=downloads&expand[]=downloadsAllTime](https://huggingface.co/api/models/invincibleambuj/Ambuj-Tripathi-Indian-Legal-Llama-GGUF?expand[]=downloads&expand[]=downloadsAllTime)

## 4. Key Engineering Milestones & Architectural Takeaways

1. **Quantization Efficiency (Edge & CPU-First):**
   * Quantized 1B, 3B, and 8B models to `Q4_K_M` GGUF formats using `llama.cpp`.
   * Enables local offline inference on resource-constrained consumer hardware (low RAM / no high-end GPU required).
2. **Fine-Tuning Methodology:**
   * Trained on Indian Legal QA pairs using 4-bit QLoRA via Unsloth.
   * Parameter-efficient fine-tuning maintaining base reasoning capabilities while specializing in IPC/CrPC legal domain terminology.
3. **Community Impact:**
   * Sustained organic adoption with over **700+ recurring monthly downloads** and **16.4K+ cumulative all-time downloads** on the flagship model.
