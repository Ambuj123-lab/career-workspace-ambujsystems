# Indian Legal LLMs on Hugging Face: Usage Metrics

**Author:** [Ambuj Kumar Tripathi](https://huggingface.co/invincibleambuj) · **Profile:** [huggingface.co/invincibleambuj](https://huggingface.co/invincibleambuj) · **Snapshot date:** October 11, 2026

Six public models: Llama 3.x (1B, 3B, 8B) fine-tuned with 4-bit QLoRA on Indian legal Q&A, with GGUF (Q4_K_M) builds for CPU-first local inference.

---

## At a Glance

| Models published | All-time downloads | Downloads, last 30 days | Likes |
|:---:|:---:|:---:|:---:|
| **6** | **18,026** | **925** | **39** |

Flagship: the 1B GGUF build, with **16,486** all-time downloads and **744** in the last 30 days.

---

## Models

| # | Model | Type | All-time | 30 days | Likes |
|:-:|---|---|:-:|:-:|:-:|
| 1 | [Ambuj-Tripathi-Indian-Legal-Llama-GGUF](https://huggingface.co/invincibleambuj/Ambuj-Tripathi-Indian-Legal-Llama-GGUF) | Llama 3.2 1B, GGUF Q4_K_M | 16,486 | 744 | 38 |
| 2 | [Ambuj-Tripathi-Indian-Legal-Llama-3B-GGUF](https://huggingface.co/invincibleambuj/Ambuj-Tripathi-Indian-Legal-Llama-3B-GGUF) | Llama 3.2 3B, GGUF Q4_K_M | 649 | 66 | 1 |
| 3 | [Ambuj-Tripathi-Llama-3.1-8B-IndianLegal-GGUF](https://huggingface.co/invincibleambuj/Ambuj-Tripathi-Llama-3.1-8B-IndianLegal-GGUF) | Llama 3.1 8B, GGUF Q4_K_M | 609 | 101 | 0 |
| 4 | [Ambuj-Tripathi-Llama-8B-LoRA](https://huggingface.co/invincibleambuj/Ambuj-Tripathi-Llama-8B-LoRA) | Llama 3.1 8B, LoRA weights | 176 | 4 | 0 |
| 5 | [llama-3.2-3b-legal-india-qlora-v2](https://huggingface.co/invincibleambuj/llama-3.2-3b-legal-india-qlora-v2) | Llama 3.2 3B, QLoRA adapter | 106 | 10 | 0 |
| 6 | [llama-3.2-1b-legal-india-qlora](https://huggingface.co/invincibleambuj/llama-3.2-1b-legal-india-qlora) | Llama 3.2 1B, QLoRA adapter | 0 | 0 | 0 |
| | **Total** | | **18,026** | **925** | **39** |

---

## How This Was Built

| Stage | Detail |
|---|---|
| Base models | Llama 3.2 1B, Llama 3.2 3B, Llama 3.1 8B |
| Training data | 14,543 Indian legal Q&A pairs |
| Fine-tuning | 4-bit QLoRA (Unsloth), plus a LoRA variant for 8B |
| Quantization | GGUF Q4_K_M via `llama.cpp` |
| Runs on | LM Studio, Ollama, `llama.cpp` (GGUF); PEFT / Transformers / Unsloth (adapters) |
| Goal | Local, offline inference on low-RAM machines without a high-end GPU |

---

## Verify It Yourself

Anyone can check these numbers without a Hugging Face account.

**1. In the browser.** Open the [profile page](https://huggingface.co/invincibleambuj) to see all six model cards with their 30-day downloads and likes. The [flagship model page](https://huggingface.co/invincibleambuj/Ambuj-Tripathi-Indian-Legal-Llama-GGUF) shows the same for the 1B build.

**2. With Python 3 (public API).**

Flagship model, 30-day and all-time:

```bash
python -c "import json,urllib.request as u; r=json.load(u.urlopen('https://huggingface.co/api/models/invincibleambuj/Ambuj-Tripathi-Indian-Legal-Llama-GGUF?expand[]=downloads&expand[]=downloadsAllTime')); print('30-day:', r['downloads'], '| all-time:', r['downloadsAllTime'])"
```

Output on the snapshot date: `30-day: 744 | all-time: 16486`

All six models, total all-time downloads:

```bash
python -c "import json,urllib.request as u; d=json.load(u.urlopen('https://huggingface.co/api/models?author=invincibleambuj&expand[]=downloadsAllTime')); print('Models:', len(d), '| Total all-time downloads:', sum(m['downloadsAllTime'] for m in d))"
```

Output on the snapshot date: `Models: 6 | Total all-time downloads: 18026`

The commands read live data, so a later run will show different numbers than this snapshot. All-time downloads only go up, while the 30-day figure rises and falls with recent activity. If more models are published later, the model count and totals will grow too.

---

## Notes and Limitations

- **What "downloads" means:** these are Hugging Face's file-download counts for each repository. They measure usage of the repositories, not the number of unique people.
- **Concentration:** most downloads come from one model (the 1B GGUF build). The other five are early or niche releases.
- **Scope:** research and educational use only. Not legal advice.
- **Legal currency:** the training data uses IPC/CrPC-era terminology. These statutes were replaced by BNS/BNSS from July 2024, so the models may answer with outdated section references.
- **License:** built on Llama 3.1 / 3.2 under the Llama Community License.