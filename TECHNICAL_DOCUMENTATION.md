# 🏛️ CoverCraft: Enterprise Evidence-Backed Application Intelligence Engine
## Comprehensive Technical Architecture & Engineering Documentation

> **Project:** CoverCraft (`ai-cover-letter`)  
> **Repository:** [https://github.com/Ambuj123-lab/career-workspace-ambujsystems](https://github.com/Ambuj123-lab/career-workspace-ambujsystems)  
> **Frontend:** Next.js 16 (App Router, TailwindCSS, Recharts)  
> **Backend:** Next.js Serverless Edge/Node APIs + Python Model Context Protocol (MCP) Server  
> **AI Foundation:** Google Gemini (`gemini-3.5-flash-lite` primary, `gemini-3.8-flash` fallback) + Tavily Advanced Search API  

---

## 1. High-Level Architectural Vision: Beyond the "AI Wrapper"

Generic cover letter generators suffer from three critical flaws:
1. **Hallucinated Qualifications:** The LLM invents accomplishments, metrics, or years of experience not present in the candidate's resume.
2. **Black-Box Match Fabrication:** Scoring is computed by asking the LLM to output a random percentage (e.g., "Match: 95%"), with zero mathematical backing.
3. **Stale/Superficial Company Knowledge:** Generic flattery ("I admire your innovative culture") because the model has no real-time data about recent engineering publications or company initiatives.

### The Evidence Layer Architecture
CoverCraft solves this by decoupling the pipeline into an **Evidence-First Verification Topology**:

```
[Candidate Resume (Untrusted Raw Data)] ────┐
                                            │
[Job Description (Untrusted Raw Data)] ─────┼──► [Evidence Isolation Layer]
                                            │          │
[Live Web Search (Tavily Grounding)] ───────┘          ▼
                                                ┌─────────────────────────────────┐
                                                │   Strict XML Trust Boundaries   │
                                                │ <user_resume>  <job_description> │
                                                │ <verified_web_sources>          │
                                                └────────────────┬────────────────┘
                                                                 │
                                                                 ▼
                                                ┌─────────────────────────────────┐
                                                │ Deterministic Application Logic │
                                                │  - Classification Weighting     │
                                                │  - Provenance Ledger            │
                                                │  - Claim Verification           │
                                                └────────────────┬────────────────┘
                                                                 │
         ┌───────────────────────┬───────────────────────────────┼───────────────────────────────┐
         ▼                       ▼                               ▼                               ▼
 ┌──────────────┐        ┌──────────────┐                ┌──────────────┐                ┌──────────────┐
 │ Cover Letter │        │  Job Fit &   │                │ Company Intel│                │  Interview   │
 │   Dossier    │        │  Radar Chart │                │ 4-Card Suite │                │   Defense    │
 └──────────────┘        └──────────────┘                └──────────────┘                └──────────────┘
```

---

## 2. Decoupled Prompt Policy & Strict Trust Boundaries

### A. The Three-Tier Context Architecture
Prompts are separated into isolated layers to prevent prompt injection and hallucination:
1. **System Instruction Policy (`systemInstruction` parameter):** Immutable system-level developer instructions defining behavioral constraints (anti-flattery, strictly bounded claims, markdown tone).
2. **Untrusted Data Boundaries:** User inputs are wrapped in explicit boundary tags: `<user_resume>`, `<job_description>`, and `<verified_web_sources>`.
3. **Structured Schema Validation:** Strict JSON schema output enforcement (`responseMimeType: "application/json"`).

### B. Prompt Modules Built:
- `src/prompts/cover-letter.system.js`: Evidence-First policy, prohibition of flattering language ("I was thrilled to see..."), strict factual grounding.
- `src/prompts/job-analysis.system.js`: Rigid 4-state classification (`STRONG_MATCH`, `PARTIAL_MATCH`, `TRANSFERABLE`, `MISSING`) with verbatim resume quotations.
- `src/prompts/interview-defense.system.js`: Adversarial cross-examination engine assessing claim audit risk (`LOW`, `MEDIUM`, `HIGH`).

---

## 3. Deterministic Application-Layer Scoring Engine

Unlike standard applications where the LLM invents a match score, CoverCraft enforces **Technical Honesty**:
- The LLM's **only job** is to classify whether a requirement is directly evidenced in the resume.
- The **score is computed mathematically in application code** (`src/app/api/analyze/route.js`).

### Mathematical Formulation
$\text{Evidence Coverage Score} = \left( \frac{\sum_{i=1}^{N} W(c_i)}{N} \right) \times 100$

Where $N$ is total JD requirements, and the status weights $W(c_i)$ are:
- `W(STRONG_MATCH) = 1.0` (Supported by direct verbatim resume quote)
- `W(PARTIAL_MATCH) = 0.6` (Related technology or foundational knowledge)
- `W(TRANSFERABLE) = 0.4` (Adjacent skill from another domain)
- `W(MISSING) = 0.0` (Not found in resume; gap honestly framed)

### UI Transparency Box
In the **Generative Job Fit** tab, this formula is displayed openly with four live metric counters, ensuring zero black-box fabrication.

---

## 4. Real-Time Web Research & 4-Card Company Intel Architecture

### A. The Search & Grounding Pipeline (`/api/research`)
1. **Search Query Synthesis:** Automatically extracts company name and target role to query:
   `"${company_name} AI research engineering developments tech stack recent news 2026"`
2. **Primary Provider (Tavily Advanced Search):**
   - Calls `https://api.tavily.com/search` with `search_depth: "advanced"`.
   - Filters out duplicates, deduplicates domains, and tags sources into `Official`, `Research`, or `News`.
3. **Secondary Grounding Fallback (Google Grounding):**
   - If Tavily returns 0 results or fails, falls back seamlessly to Gemini's native Google Search Tool (`tools: [{ googleSearch: {} }]`).
4. **Structured Dossier Synthesis:**
   - Synthesizes 4 distinct structured sections with explicit citation anchors (`[1]`, `[2]`).

### B. The 4-Card UI Transformation:
- **Card 1: COMPANY SNAPSHOT**  
  Crisp 2-3 sentence overview of engineering mission and technological scale, tagged with total cited sources.
- **Card 2: ROLE-RELEVANT SIGNALS**  
  Specific technical capabilities (e.g., Multi-Agent Systems, TPU Infrastructure, Alignment Evaluation) relevant to the candidate's target role, with a dedicated callout: *"Why this matters for your application"*.
- **Card 3: RECENT COMPANY SIGNALS**  
  Recent product launches, arXiv papers, or announcements with date, domain, and direct `[Open ↗]` link.
- **Card 4: CITED SUPPORTING SOURCES**  
  All cited domains with badge attribution (`[1]`, `[2]`), category pills, and snippet excerpts.

### C. In-Text Interactive Citation Pills
- In-text citations (e.g., `[1]`, `[2]`) in snapshot and signals are parsed dynamically.
- Clicking any citation marker opens an interactive **Supporting Source Modal** showing the exact source title, category, relevance score, snippet quote, and direct link to the external web source.

### D. Sources Tab Filters
- Tab pill shows real-time count: `Sources (6)`.
- Features categorized filter pills: `[All]`, `[Official]`, `[Research]`, `[News]`.
- Displays honest relevance ratings (`High relevance`, `Medium relevance`, `Supporting source`) without fake percentages.

---

## 5. Security & Ingestion Engine (`/api/parse-resume`)

To guarantee rock-solid enterprise extraction and zero Vercel Serverless crashes:
- **Dual-Layer PDF Extraction Pipeline:**
  1. **Primary Layer (`unpdf`):** Pure JavaScript, worker-free, zero-native-binary parser running directly in Vercel Edge/Serverless runtimes. Extracts complete text streams (~15ms execution time for 15,000-character, 3-page resumes) with zero native compilation dependencies.
  2. **Secondary Fallback Layer (Gemini 2.5 Flash Multimodal OCR):** If a PDF contains scanned images or lacks selectable text, the file buffer is automatically routed to Gemini 2.5 Flash with multimodal vision instructions to transcribe the document verbatim.
- **DOCX & Plaintext Support:** DOCX extraction via `mammoth` (raw text array extraction) and UTF-8 stream decoding for TXT.
- **File Size Cap:** Enforced strictly at 5 MB before payload processing.
- **Null-Byte & Unicode Sanitization:** Strips null bytes (`\x00`) and malicious control characters.
- **Character Quotas:** Hard upper caps of 15,000 characters for resumes and 10,000 characters for job descriptions.
- **Prompt Injection Guardrails:** Heuristic scanning against adversarial prompt injections (`ignore all previous instructions`, `system prompt:`, `bypass`, `<|im_start|>`).
- **Live Document Audit Card:** Renders extracted word count, character count, parser status, and green verified security badges in the UI.

---

## 6. Model Context Protocol (MCP) Integration

The project includes an official MCP Server (`/mcp-server/server.py`) and a real-time execution trace terminal in the UI (`ResultsPanel.jsx` Tab 7):
- **4 Registered Tools:**
  1. `company_research`: Search the web for company information using Tavily. Returns grounded data with source citations. Every claim is traceable to a source URL.
  2. `evidence_validator`: Validate AI-generated claims against actual source data via Claim Ledger pattern. Returns `VERIFIED` / `PARTIAL` / `UNSUPPORTED` per claim.
  3. `jd_analyzer`: Evidence-backed JD matching. Extracts skills from JD, matches each against resume with actual proof anchors (`STRONG_MATCH`, `PARTIAL_MATCH`, `TRANSFERABLE`, `MISSING`).
  4. `ats_readiness`: Honest ATS readiness check (deterministic heuristic analysis of keyword coverage, skills, evidence, and length; not an arbitrary score).
- **Execution Event Stream:**
  - Streams execution timestamps, input parameters, and expanded JSON payloads for complete transparency.

---

## 7. Authentication Architecture & Local OAuth Configuration

### OAuth 2.0 Authorization Flow & Callback Resolution
When an applicant initiates authentication via **"Sign in with Google"**, Google's OAuth 2.0 authorization server verifies the calling origin and callback URI against registered credentials.

In production and local environments, NextAuth.js expects the callback endpoint at:
- **Local Development:** `http://localhost:3000/api/auth/callback/google`
- **Production Edge:** `https://career-workspace-ambujsystems.vercel.app/api/auth/callback/google`

If a request arrives from an unregistered origin or redirects to an unlisted callback, Google rejects the authorization flow with `Error 400: redirect_uri_mismatch`.

### Verification & Configuration Steps:
1. Open the **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Ensure your active project is selected in the top project dropdown.
3. Navigate to **APIs & Services** ➔ **Credentials**.
4. Under **OAuth 2.0 Client IDs**, locate your Web Client ID (`<YOUR_GOOGLE_CLIENT_ID>.apps.googleusercontent.com`) and click edit.
5. In **Authorized JavaScript origins**, register all authorized hosting origins:
   - `http://localhost:3000` (Local Development)
   - `https://career-workspace-ambujsystems.vercel.app` (Vercel Production)
6. In **Authorized redirect URIs**, configure the strict callback routes:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://career-workspace-ambujsystems.vercel.app/api/auth/callback/google`
7. Click **SAVE** to persist changes across Google's edge cache.

---

## 8. Summary of Completed Deliverables

| Module | Core Deliverable | Technical Guarantee |
|---|---|---|
| **Cover Letter** | Executive, Minimal, Classic, Warm editorial layouts | Direct markdown export, live inline editing, zero flattery |
| **Interview Defense** | 3 Predictive challenge questions | Risk analysis (`LOW`, `MEDIUM`, `HIGH`) with suggested high-integrity defenses |
| **ATS Audit** | Deterministic 6-point compatibility ledger | Honest heuristic disclaimer, format & keyword density audit |
| **Generative Job Fit** | Multi-axis Radar & Donut charts | Explicit deterministic formula box `(Strong×1.0 + Partial×0.6 + Transferable×0.4)/Total` |
| **Company Intel** | 4-Card dossier with live web research strip | Tavily Advanced Search + Gemini 3.5; clickable `[1]`, `[2]` citation drawer |
| **Sources Repository** | Search Sources ledger with category pills | `[All]`, `[Official]`, `[Research]`, `[News]` with verified domain attribution |
| **MCP Tool Trace** | 4 Registered tools with streamable JSON payloads | Complete execution event ledger with copyable JSON trace |

---

## 9. Interactive Evidence Engine Hero Showcase

The landing page features a live interactive inspection preview showcasing the platform's core algorithmic capabilities prior to user onboarding:
- **Tab 1: 5-Axis Competency Radar Chart:**
  - Built with Recharts pentagon visualization across 5 critical dimensions: *Technical Alignment*, *System Architecture*, *Tooling & Protocols*, *Quantified Impact*, and *Seniority Readiness*.
  - Compares candidate score against industry benchmark with 100% evidence coverage indicator.
  - Interactive Skill Inspector displaying verbatim resume quotes, match confidence badges, and framing strategy.
- **Tab 2: Adversarial Interview Defense Harness:**
  - Predictive cross-examination previewing 3 challenging questions interviewers will ask to test candidate claims.
  - Risk categorization (`LOW`, `MEDIUM`, `HIGH`) with evidence-grounded defense strategies.
- **Tab 3: Human Approval Gate & Evidence Grounding Policy:**
  - Mandatory human review modal for all external research before claims enter the generated letter.
  - Document redaction styling: Confidential client and platform entities masked with authentic dark blackout markers (`████████`), proving universal enterprise compatibility while preserving private IP.

---

## 10. OpenGraph (OG) Social Graph Architecture

Full social metadata configuration for high-signal professional distribution:
- **Custom 1200×630 HD Preview Banner:** Stored at `/public/og-image.png` featuring the obsidian dark theme, CoverCraft badge, radar fit visual, and verified engineering stamp.
- **Next.js Metadata Integration:** Configured in `layout.js` with `metadataBase: https://career-workspace-ambujsystems.vercel.app`, complete `openGraph` tags (title, description, URL, image, locale), and Twitter `summary_large_image` cards.
- **Universal Social Compatibility:** Tested and verified for instant card generation on LinkedIn, Twitter/X, WhatsApp, and Discord.

---

## 11. Production Mobile Viewport & Android Calibration

- **Zero-Overflow Layout:** Strict containment on mobile screens down to 360px width.
- **Responsive Padding Hierarchy:** Transitioned from static desktop `p-8` to fluid `p-4 sm:p-8` across all cards.
- **Avatar-Compact Mobile Navbar:** User names dynamically hidden on mobile viewports (`hidden sm:inline`) in `AuthButton.jsx`, reserving full space for the *↺ New Letter* action button with zero right-edge clipping.
- **Radar Chart Mobile Calibration:** Scaled chart radius to `52%` with 9px font size to guarantee label legibility without viewport boundary collisions.

---

## 12. Production Deployment & Privacy Ledger

- **Hosting Environment:** Vercel Edge Serverless Runtime.
- **Public Domain:** `https://career-workspace-ambujsystems.vercel.app`
- **Authentication:** Google OAuth 2.0 via NextAuth.js.
- **Privacy Standard:** Zero personal phone numbers or identifiable data in demo payloads; sample feed data utilizes mathematically invalid Indian telecom standard (`+91 00000 00000`).
