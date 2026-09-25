# 🎯 CoverCraft — Evidence-Grounded AI Cover Letter Generator

> **Zero Hallucination. Source Attribution. Interview-Defense Ready.**  
> Built with Next.js 16 (App Router), Google Gemini API, Tavily Web Search, and Model Context Protocol (MCP).

---

## 🌟 Why CoverCraft?

Most AI cover letter generators hallucinate candidate achievements, praise companies with generic marketing fluff, and promise fake "99% ATS Scores" that don't exist in reality.

**CoverCraft takes a strictly honest, technically defensible approach:**
1. **Evidence-Grounded Resume Matching:** Every claim in the letter is strictly bounded by verifiable quotes from your resume. If a skill isn't in your resume, the model states your foundational transferrable experience rather than inventing qualifications.
2. **Human Approval Gate:** Real-time web intelligence (via Tavily and Google Search Grounding) pulls company developments and technology signals. **You review and approve** which cited sources enter your cover letter before generation begins.
3. **Interview Defense Engine:** For every strong claim in your letter, CoverCraft generates tough interview questions, maps them back to your resume evidence, and arms you with confident defense talking points.
4. **Honest ATS Readiness Audit:** No fake scores. A deterministic 6-point audit verifying structural integrity, quantifiable metrics, skill coverage, and formatting.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   NEXT.JS FRONTEND                     │
│  (NextAuth Google Sign-In · Input Form · Results UI)   │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
   POST /api/analyze            POST /api/research
 (JD vs Resume Skills)        (Tavily Real-Time Web)
             │                           │
             └─────────────┬─────────────┘
                           ▼
             ┌───────────────────────────┐
             │    HUMAN APPROVAL GATE    │
             │ (User checks/approves     │
             │  verified company facts)  │
             └─────────────┬─────────────┘
                           ▼
             ┌───────────────────────────┐
             │    POST /api/generate     │
             │ (Dual-Model Fallback:     │
             │  gemini-3.5-flash-lite    │
             │    ↳ gemini-3.8-flash)    │
             └─────────────┬─────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
   POST /api/readiness          POST /api/defense
  (Deterministic Heuristic)   (Claim Ledger & Defense)
```

---

## ✨ Key Features

- **Google OAuth Integration:** Sign in seamlessly with Google via NextAuth v4 to save sessions and auto-fill candidate profiles.
- **Dual-Model Resilient Architecture:**
  - **Primary:** `gemini-3.5-flash-lite` (Ultra-low latency, generous rate limits).
  - **Fallback:** `gemini-3.8-flash` (Deep reasoning, triggered automatically if 429/503 occurs).
- **Interactive Recharts Donut & Skill Breakdown:** Visual match analytics showing direct resume evidence quotes.
- **4 Professional Document Themes:**
  - `Executive Navy` (Modern corporate)
  - `Tech Minimal` (Clean engineering)
  - `Classic Formal` (Traditional serif)
  - `Warm Editorial` (Warm humanist)
- **Interactive Inline Editing:** Click to edit any generated paragraph with real-time word count tracking and 1-click clipboard copy.
- **Print / PDF Ready:** Custom `@media print` CSS cleanly formats A4 pages with zero UI clutter.

---

## 🔒 Security & Privacy Guardrails

- **Zero External Resume Leakage:** Candidate resumes are processed strictly within Google Gemini API boundaries; resumes are **never** passed to external web search providers. Only the target company name is queried.
- **Prompt Injection Defense:** Inputs are strictly quarantined in XML delimiters (`<user_resume>`, `<job_description>`) to resist jailbreak attempts.
- **PII Scrubbing:** Built-in regex detection sanitizes Aadhaar, PAN, phone numbers, and credentials.
- **Secret Protection:** All API keys (`GEMINI_API_KEY`, `TAVILY_API_KEY`, `GOOGLE_CLIENT_SECRET`) reside exclusively server-side.

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js 18+ & npm
- Google AI Studio API Key ([aistudio.google.com](https://aistudio.google.com/))
- Tavily API Key ([tavily.com](https://tavily.com/))
- Google Cloud OAuth Credentials (Client ID & Secret)

### 1. Installation

```bash
cd web
npm install
```

### 2. Environment Configuration

Create `web/.env.local`:

```env
# Gemini API Key (from Google AI Studio)
GEMINI_API_KEY="your-gemini-api-key"

# Tavily API Key for company research
TAVILY_API_KEY="your-tavily-api-key"

# NextAuth & Google OAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-random-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐍 MCP Server (Model Context Protocol)

For agentic CLI and Claude Desktop integration:

```bash
cd mcp-server
pip install -r requirements.txt
python server.py
```

### Registered MCP Tools:
1. `company_research` — Grounded Tavily web research
2. `evidence_validator` — Claim ledger validation
3. `jd_analyzer` — Evidence-backed skill matching
4. `ats_readiness` — Deterministic ATS criteria audit

---

## 📋 Master Checklist

Track detailed development status, architecture decisions, and audit items in [`MASTER_CHECKLIST.md`](./MASTER_CHECKLIST.md).

---

## 📄 License

MIT License — Created by [Ambuj Kumar Tripathi](https://github.com/Ambuj123-lab).
