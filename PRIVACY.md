# Privacy Policy for CoverCraft AI

**Effective Date:** October 3, 2026  
**Publisher:** Ambuj Kumar Tripathi ([Ambuj123-lab](https://github.com/Ambuj123-lab))  
**Repository:** [career-workspace-ambujsystems](https://github.com/Ambuj123-lab/career-workspace-ambujsystems)  

CoverCraft AI ("we", "our", or "the application") is committed to protecting candidate privacy, intellectual property, and personal data. This Privacy Policy details how CoverCraft AI processes, protects, and handles information across the web studio and the Model Context Protocol (MCP) server, designed in compliance with Anthropic Claude Desktop and OpenAI directory standards.

---

## 1. Data Ingestion & Processing Principles

CoverCraft AI operates under a **strict data minimization and ephemeral processing architecture**:

- **Candidate Resumes & Dossiers:** Resumes and experience descriptions provided by applicants are processed strictly **in-memory** for the duration of the analysis and cover letter generation cycle. We do not retain, index, or store unencrypted resume contents.
- **Job Descriptions:** Target job postings and role specifications are parsed ephemerally to extract matching qualifications and ATS keywords.
- **No Model Training on User Data:** Candidate resumes, work histories, and generated letters are **never** used to fine-tune, train, or improve any public or proprietary machine learning models.

---

## 2. Third-Party Service Integrations

CoverCraft AI communicates with specific third-party APIs solely to fulfill requested user actions:

| Service | Data Sent | Purpose & Safeguards |
| :--- | :--- | :--- |
| **Google Gemini API** | In-memory resume excerpts & role descriptions | LLM synthesis & reasoning. Subject to Google Cloud enterprise data privacy terms. |
| **Tavily Search API** | Company name & target industry keywords only | Live company research and culture grounding. **Candidate PII is never sent to search crawlers.** |
| **GitHub Public API** | Public GitHub username & repository names | Read-only candidate portfolio and commit proofing (verifies technical claims). |
| **Hugging Face API** | Public model or space identifiers | Read-only verification of open-source ML artifacts. |
| **Jina AI Reader** | Target company careers URL | Markdown extraction of public company landing pages. |

---

## 3. Data Storage & Retention

- **Zero Resale Policy:** We do not sell, rent, monetize, or broker candidate data to any third parties, advertisers, or data brokers.
- **Local Browser Storage:** Saved drafts, export history, and user preferences are stored client-side in the user's browser `localStorage`. Users can permanently delete this data at any time by clearing their browser data or clicking "Reset Workspace".
- **Authentication:** When Google OAuth is utilized, we only receive the standard profile identity (name, email) necessary to maintain secure authenticated sessions via encrypted NextAuth JWT tokens.

---

## 4. Model Context Protocol (MCP) Server Security

The CoverCraft Python FastMCP server adheres to the following supply-chain safety standards:
- **Zero Ingress Command Execution:** Tool invocations are constrained to deterministic read-only audits and prompt formatting.
- **Secret Isolation:** Environment API keys (`GEMINI_API_KEY`, `TAVILY_API_KEY`) remain strictly local to the runtime environment and are never echoed back in tool logs, shell outputs, or network responses.

---

## 5. Security & Infrastructure Safeguards

- **Container Hardening:** Production Docker containers run as an unprivileged, non-root user (`nextjs:nodejs`).
- **Prompt Injection Guardrails:** Incoming user inputs pass through structural sanitization layers to neutralize adversarial prompt injections before reaching LLM inference endpoints.

---

## 6. Contact & Data Subject Rights

If you have questions regarding this Privacy Policy or wish to exercise data subject rights (access, deletion, portability), please reach out via GitHub Issues:
- **GitHub:** [https://github.com/Ambuj123-lab/career-workspace-ambujsystems](https://github.com/Ambuj123-lab/career-workspace-ambujsystems)
- **Maintainer:** Ambuj Kumar Tripathi
