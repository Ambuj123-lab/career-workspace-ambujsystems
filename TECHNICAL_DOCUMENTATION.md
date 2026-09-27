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

CoverCraft features a fully compliant, production-grade Model Context Protocol (MCP) server (`/mcp-server/server.py`) supporting **Dual-Transport Architecture**: high-performance standard I/O (`stdio`) for local CLI & desktop agent runtimes (e.g. Claude Desktop), and Server-Sent Events (`SSE` / Streamable HTTP) via Starlette & Uvicorn for distributed agentic environments:
- **6 Production-Grade Registered MCP Tools:**
  1. `company_research`: Multi-source web intelligence via Tavily Advanced and Jina AI Deep Page Reader. Extracts strategic initiatives, tech stack signals, and workplace reviews across Naukri, AmbitionBox, and LinkedIn.
  2. `evidence_validator`: High-stakes Claim Ledger verification engine. Compares draft propositions against source data to output deterministic `VERIFIED`, `PARTIAL`, or `UNSUPPORTED` verdicts with verbatim proof snippets.
  3. `jd_analyzer`: Proof-anchored JD skill extraction. Maps requirements against parsed candidate achievements into four strict tiers: `STRONG_MATCH`, `PARTIAL_MATCH`, `TRANSFERABLE`, and `MISSING`.
  4. `ats_readiness`: Deterministic algorithmic readiness audit. Evaluates keyword density, structural formatting, proof metrics, and word counts without arbitrary randomness.
  5. `source_filter`: Algorithmic domain authority tiering, social spam suppression, and **Outdated News & Stale Tech Filter** (<9m strategic initiatives, <18m engineering stack).
  6. `cover_letter_generator`: Evidence-grounded synthesis tool that synthesizes defensible applications bound to exact resume anchors and verified company intel.
- **Dual Transport & Vercel Serverless Safety:**
  - **Stdio Mode (Default):** Standard I/O subprocess communication with zero network socket overhead or external attack surface.
  - **SSE / HTTP Mode (`--transport=sse`):** Activated optionally on port 8000 for network-based agent integrations.
  - **Vercel Free-Tier Isolation:** Vercel hosts Next.js serverless API routes that call Tavily/Jina/Groq directly over standard HTTP POST. Python MCP code does not run persistent background processes on Vercel, ensuring **100% zero risk of Vercel serverless execution timeouts, connection leaks, or billing charges**.
- **Execution Event Stream:**
  - Streams execution timestamps, input parameters, and expanded JSON payloads in the UI (`ResultsPanel.jsx` Tab 7) for complete operational transparency.

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
| **MCP Tool Trace** | 6 Registered tools with Dual Transport (Stdio + SSE) | Complete execution event ledger with copyable JSON trace |
| **Adversarial Red-Teamer** | Veracity Audit Gate checking senior verbs vs resume facts | Replaces unverified executive claims with safe defensible equivalents |
| **Outdated News & Stale Tech Filter** | Recency Verification (<9m initiatives, <18m tech stack) | Penalizes and tags stale web search articles (>18m/2y) as [Historical Context] |
| **In-Line Citations & Export** | Dual-mode [Resume Line X] [Source Y] with tooltips | Interactive badges for audit, auto-stripped for clean recruiter submission |
| **Live Progress Tracker** | 4-phase state machine with live millisecond timer | Real-time phase tracking (`LiveProgressTracker.jsx`) with active MCP tool readout |

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


---

## 13. Adversarial Seniority Overclaim Red-Teamer (Veracity Audit Gate)

One of the most dangerous failure modes in AI-assisted applications is **generative seniority overclaiming**: models inserting hyperbolic executive verbs (such as *"spearheaded"*, *"pioneered"*, *"solely architected"*, or *"headed the entire"*) that cannot be backed up during adversarial technical interviews.

| Detected Hyperbolic Trigger | Auto-Adjusted Veracity Verb | Audit Reasoning |
| :--- | :--- | :--- |
| `spearheaded` | `led implementation of` | Downgraded to verified collaborative leadership baseline |
| `pioneered` | `developed` | Replaced with authentic engineering deliverable |
| `solely architected` | `architected` | Eliminated non-defensible absolutist claim |
| `headed the entire` | `contributed to the` | Aligned with verified team scope |
| `commanded the` | `coordinated the` | Replaced with collaborative professional framing |

**Pipeline Placement (`/api/generate/route.js`):** Every generated paragraph is audited against the candidate's parsed resume baseline. Any unverified executive verb is logged in an `overclaimAudit` ledger and automatically replaced before rendering.

---

## 14. Outdated News & Stale Tech Filter (Strict Recency Verification: <9m / <18m)

Web search tools frequently hallucinate timeliness by surfacing legacy news articles from 2022 or 2023. Presenting an obsolete tech stack or past leadership initiative as an active strategic priority immediately discredits an applicant in front of a hiring team.

- **Strategic Company Initiatives (<9 Months):** Recent product launches, funding rounds, and executive priorities must fall within a 9-month recency window (2025–2026). Articles older than 9 months are strictly tagged as `[Historical Context]` and forbidden from being portrayed as active roadmaps.
- **Engineering Architecture & Tech Stack (<18 Months):** Technology migrations and framework citations must be verified within the past 18 months to prevent citing discarded legacy systems.
- **Algorithmic Score Penalization:** In both `source_filter.py` and `/api/research/route.js`, articles older than 18 months or from 2023 receive a **-15 trust score penalty** and are downranked below Tier-1 authoritative sources.

---

## 15. Dual-Mode Interactive Evidence Citations & Clean Recruiter Export

To eliminate hallucination while preserving recruitment-ready aesthetics, CoverCraft implements a decoupled dual-presentation paradigm:

- **Interactive Candidate Audit Mode:** In the application workspace, every generated claim displays interactive badges (e.g. `[Resume: Line 24]` and `[Source 2: TechBlog]`). Clicking or hovering reveals tooltips displaying the exact verbatim excerpt and source URL.
- **Deterministic Clean Recruiter Export:** When candidates click **Copy Letter**, **Download Markdown**, or **Export PDF**, the system invokes `cleanFullLetterText()`, which strips internal bracket citations via regex (`/\s*\[(?:Resume|Source|\d+)[^\]]*\]/gi`). The resulting document is 100% natural, polished prose without machine brackets.

---

## 16. Live Execution State Machine & Millisecond Progress Tracker

Rather than presenting a static spinner during multi-agent orchestration, CoverCraft features `LiveProgressTracker.jsx`, an interactive 4-phase deterministic state machine:

1. **01. Competency Match:** Extraction of JD core competencies and resume proof mapping.
2. **02. MCP Company Recon:** Real-time Tavily deep crawl, Jina reader extraction, and Outdated News & Stale Tech filtering.
3. **03. Human Approval Gate:** Human-in-the-loop audit pausing synthesis until candidate selects approved sources.
4. **04. Evidence Synthesis:** Adversarial Red-Teamer veracity audit and grounded cover letter generation.

Features a live elapsed millisecond timer (`⏱️ 00:04s`) and dynamic active MCP tool readout for complete operational visibility.
