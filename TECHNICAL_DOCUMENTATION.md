# 🏛️ CoverCraft: Enterprise Evidence-Backed Application Intelligence Engine
## Comprehensive Technical Architecture & Engineering Documentation

> **Project:** CoverCraft (`ai-cover-letter`)  
> **Repository:** `d:\Ambuj\Projects\ai-cover-letter`  
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
$$\text{Evidence Coverage Score} = \left( \frac{\sum_{i=1}^{N} W(c_i)}{N} \right) \times 100$$

Where $N$ is total JD requirements, and the status weights are:
- $\mathbf{W(\text{STRONG\_MATCH})} = 1.0$ (Supported by direct verbatim resume quote)
- $\mathbf{W(\text{PARTIAL\_MATCH})} = 0.6$ (Related technology or foundational knowledge)
- $\mathbf{W(\text{TRANSFERABLE})} = 0.4$ (Adjacent skill from another domain)
- $\mathbf{W(\text{MISSING})} = 0.0$ (Not found in resume; gap honestly framed)

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

To ensure enterprise-grade safety:
- **File Type Support:** Native parser for PDF (`PDFParse` on `Uint8Array`), DOCX (`mammoth`), and TXT.
- **File Size Cap:** Enforced strictly at 5 MB.
- **Null-Byte & Unicode Sanitization:** Strips null bytes (`\x00`) and control characters.
- **Character Quotas:** Maximum 15,000 characters for resumes; 10,000 characters for job descriptions.
- **Prompt Injection Scanner:** Scans uploaded text for heuristic injection strings (`ignore all previous instructions`, `system prompt:`, `bypass`, `<|im_start|>`).
- **Live Document Audit Card:** Displays extracted word count, character count, parser status, and green verified security badges in the UI.

---

## 6. Model Context Protocol (MCP) Integration

The project includes an MCP Server (`/mcp-server/server.py`) and a real-time execution trace terminal in the UI (`ResultsPanel.jsx` Tab 7):
- **Registered Tools:**
  1. `jd_analyzer`: Parse target job description into competency vectors.
  2. `web_search`: Real-time Tavily search execution.
  3. `source_filter`: Deduplication, noise filtering, and domain verification.
  4. `company_intelligence`: Evidence-backed synthesis and citation attachment.
  5. `evidence_validator`: Quarantining candidate claims inside resume boundaries.
  6. `cover_letter_generator`: Evidence-grounded letter synthesis.
- **Execution Event Stream:**
  - Streams execution timestamps, input parameters, and expanded JSON payloads for complete transparency.

---

## 7. Google OAuth Authentication Setup Guide

### Why is Google Sign-In currently showing `redirect_uri_mismatch`?
When you click **"Sign in with Google"**, Google's OAuth server inspects where the user is being redirected to.
CoverCraft's NextAuth.js expects the callback at:
`http://localhost:3000/api/auth/callback/google`

Because the Google OAuth Client ID was originally created for another port (or project), Google rejects the request with:
> **Error 400: redirect_uri_mismatch**

### Exact Step-by-Step Fix in Google Cloud Console:
1. Open the **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Make sure your active project is selected in the top project dropdown.
3. In the left navigation menu, go to **APIs & Services** ➔ **Credentials** (or search "Credentials" in the search bar).
4. Under **OAuth 2.0 Client IDs**, find your client ID:
   `94468882796-m4104s54sor9a703b5jq6iivb41stlsm.apps.googleusercontent.com`
   Click on its name (or the pencil icon) to edit it.
5. In the **Authorized JavaScript origins** section:
   - Click **+ ADD URI**.
   - Enter: `http://localhost:3000`
6. In the **Authorized redirect URIs** section:
   - Click **+ ADD URI**.
   - Enter: `http://localhost:3000/api/auth/callback/google`
   *(Important: Do NOT omit `/api/auth/callback/google`; NextAuth strictly requires this path!)*
7. Click **SAVE** at the bottom of the page.
8. Wait ~60 seconds for Google's OAuth servers to propagate the change.
9. Return to `http://localhost:3000/generate` and click **"Sign in with Google"** — it will now log in smoothly!

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
| **MCP Tool Trace** | 6 Registered tools with streamable JSON payloads | Complete execution event ledger with copyable JSON trace |
