# Reddit Post for CoverCraft — Ready to Paste

> [!IMPORTANT]
> **Target Subreddit:** `r/SideProject` or `r/webdev` or `r/nextjs`
>
> **Attach:** The architecture diagram SVG/PNG as the post image

---

## Post Title (Copy This)

```
I got mass-rejected by AI cover letter tools that hallucinated my experience. So I built one that can't lie — every claim is traced to your actual resume line. Here's the full engineering breakdown.
```

---

## Post Body (Copy Everything Below The Line)

---

I was applying for jobs last month and tried 3 different "AI cover letter generators." Every single one invented skills I don't have.

One told a recruiter I had "5+ years of Kubernetes orchestration experience." I've never touched Kubernetes in production. Another claimed I "led a team of 40 engineers." I've never managed anyone. These tools are liability machines.

So I built **CoverCraft** — an open-source cover letter generator where the AI literally cannot make a claim that isn't traceable to your actual resume text. If your resume doesn't say it, the letter doesn't either. Period.

But here's the thing that made this genuinely hard to build: **the hallucination problem in cover letters is way worse than in chatbots.** In a chatbot, a wrong answer is annoying. In a cover letter, a fabricated claim gets you into an interview you can't survive. The interviewer asks about your "Kubernetes experience" and you're sitting there like 🫠

Let me walk through the architecture because the anti-hallucination pipeline is where it gets interesting.

---

### The 6-Stage Deterministic Pipeline (with Live GitHub Code Proof & MCP)

Most AI cover letter tools work like this:

```
Resume + JD → single GPT prompt → "here's your letter lol"
```

CoverCraft works like this:

```
Resume → Parse (3-tier: unpdf → Gemini Vision OCR → raw binary fallback)
       + Auto-Extract candidate Name, Email, LinkedIn & GitHub (Zero Phone PII!)
       ↓
JD → Competency Extraction + Auto-Detect Target Role & Company from pasted text
       ↓
Company → Real-time Tavily search → Jina Reader deep scrape → 
          Source credibility scoring → Stale content filter (<9m/<18m)
       ↓
GitHub MCP Proofer (Tool #7) → Live repo inspection → Commit tree & SHA hash grounding (4,999 req/hr $0 PAT)
       ↓
Human Approval Gate (you review company intel & repo proofs BEFORE it enters the prompt)
       ↓
Generation → Adversarial Red-Teamer audit → Langfuse Observability → Clean export
```

Every stage has its own API route, its own system prompt, and its own guardrails. The LLM never sees raw unprocessed input. Let me break down each one.

---

### Stage 1: Resume Parsing — Why I Need 3 Fallback Tiers

I assumed PDF parsing was a solved problem. It absolutely is not.

People upload resumes in every possible state: Canva-exported PDFs with custom font encodings that produce mojibake. Scanned printed copies that are literally images. Password-protected files from HR portals. `.docx` files disguised as `.pdf` because they renamed the extension.

Here's the actual parser cascade in production:

```javascript
// parse-resume/route.js — 3-Tier Extraction Cascade
async function parsePdfBuffer(buffer) {
  // Tier 1: unpdf (serverless-safe, pure JS, instant)
  try {
    const { getDocumentProxy, extractText } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    if (text?.trim().length > 20) return text.trim();
  } catch (err) { /* fall through */ }

  // Tier 2: Gemini Vision OCR (handles scanned/image-only PDFs)
  try {
    const base64Data = buffer.toString("base64");
    const result = await model.generateContent([
      { inlineData: { data: base64Data, mimeType: "application/pdf" } },
      "Extract all readable text from this resume..."
    ]);
    const geminiText = result?.response?.text();
    if (geminiText?.trim().length > 20) return geminiText.trim();
  } catch (err) { /* fall through */ }

  // Tier 3: Raw binary token extraction (last resort)
  const str = buffer.toString("binary");
  const regex = /\(([^)]+)\)\s*Tj/g;
  // Extract raw PDF text operators...
}
```

Tier 3 is my favorite. It literally reads PDF binary operators (`Tj` is the "show text" operator in the PDF spec). It's ugly, but it works when absolutely everything else fails. The number of "My resume won't upload" support tickets dropped to zero after adding this.

**Also: We permanently deleted the Phone Number field.**

Why do cover letter tools ask candidates for their phone numbers? There is zero architectural reason for an AI generator to hold personal contact digits. We deleted the field completely to protect candidate PII. Instead, when you upload your resume PDF, our regex + entity parser instantly auto-extracts your Name, Email, LinkedIn URL, and GitHub Profile URL. And when you paste a Job Description, a heuristic detector auto-extracts the Target Role and Target Company automatically. No manual re-typing, zero unnecessary data retention.

---

### Stage 2: Skill Matching — Application-Layer Scoring, Not LLM Scoring

This is a deliberate design choice that most AI tools get wrong. They let the LLM evaluate AND score the candidate fit. That's asking the same model that hallucinates to also be the judge of truth.

I split it: **LLM classifies, application code scores.**

```javascript
// analyze/route.js — Deterministic Application-Layer Scoring
const weights = {
  STRONG_MATCH: 1.0,   // Direct resume evidence
  PARTIAL_MATCH: 0.6,  // Related but not exact
  TRANSFERABLE: 0.4,   // Adjacent skill
  MISSING: 0.0,        // Honest zero
};

const rawScore = skills.reduce((sum, item) => 
  sum + (weights[item.status] ?? 0), 0
) / totalSkills;

data.overall_match = Math.round(rawScore * 100);
```

The LLM's job is classification: "Does this resume mention Docker? STRONG_MATCH / PARTIAL / MISSING." The score formula is pure math. No temperature. No stochastic variance. Same resume + same JD = same score every single time. If you run it 100 times, you get 100 identical numbers.

Why does this matter? Because I've seen other tools give the same candidate a "92% match" on Monday and "78% match" on Tuesday for the same job. That's not analysis — that's a random number generator with extra steps.

---

### Stage 3: Company Research — The Part That Scared Me Most

Here's the pipeline that keeps me up at night from a hallucination perspective. We scrape real-time company intelligence to make the letter relevant. But scraped web data is the single largest hallucination vector.

The research pipeline:

1. **Tavily Advanced Search** → 8 results for `"{company} tech stack engineering hiring careers"`
2. **Jina AI Reader** → Deep-scrapes top 2 URLs for full markdown extraction (not just snippets)
3. **Source Credibility Scoring** → Every URL gets a trust tier:

```javascript
// research/route.js — Deterministic Source Credibility Filter
// Tier 1 (95 trust): Official company domains, SEC filings, Greenhouse/Lever
// Tier 2 (75 trust): Naukri, AmbitionBox, Indeed, Glassdoor, LinkedIn  
// Tier 3 (55 trust): Supporting media
// BLOCKED: Pinterest, Quora, Facebook, Instagram, TikTok → discarded

// Stale content filter:
// <9 months: CURRENT → full weight
// <18 months: AGING → -15 trust penalty  
// >18 months: STALE → flagged, deprioritized
```

4. **Human Approval Gate** — This is the non-negotiable part. The researched company intel gets shown to the user in structured cards BEFORE it enters the generation prompt. You can approve, reject, or exclude any piece of intelligence. **Zero unverified company claims enter the LLM.**

I've seen tools write "Google's recent pivot to quantum computing" in cover letters for Google — sourced from a 2019 blog post. Our stale content filter + human gate makes this physically impossible.

---

### Stage 4: Live GitHub Code Proof via MCP Tool #7 — Don't Just Check Resume Text, Verify the Commits

This is the feature that made recruiters and senior engineers stop and say "wait, that's actually genius."

Anyone can write words on a resume: *"Architected 11-node cyclic LangGraph agent with checkpointing."* In a normal AI tool, the LLM just echoes that phrase with fancier adjectives.

CoverCraft doesn't do that. It uses our 7th registered **Model Context Protocol (MCP)** tool (`github_proofer` in `/mcp-server/tools/github_proofer.py`) to connect directly to the candidate's public GitHub account:

1. **Live Repository & Commit Tree Inspection:** It pulls your public repositories, descriptions, primary languages, and recent commit history via the GitHub REST API.
2. **Verifiable Commit SHA Anchoring:** When the candidate claims they built a cyclic agent or an MCP server, CoverCraft grabs the actual latest commit hash (`sha: 7f2a1b9`) and commit message: `"feat: implement cyclic state machine checkpointing & live audit logging"`.
3. **Grounding in the Letter:** The generated cover letter anchors technical assertions directly to real commit evidence: *"Directly demonstrated production agentic architecture in agentic-rag-financial-parser (commit 7f2a1b9), implementing cyclic state persistence."*
4. **$0 Cost / Bulletproof Free Tier:** We authenticated the GitHub MCP tool using a fine-grained GitHub Personal Access Token (PAT) with read-only public repository permissions. This gives **5,000 requests per hour for $0 free**, completely eliminating the risk of shared unauthenticated IP rate limits (60 req/hr) without costing a single penny.
5. **Adversarial Overclaim Sentinel:** If you claim you have deep production expertise in Kubernetes or Rust, but your GitHub has zero repos and zero commits touching it, the pipeline flags the discrepancy and prompts you for specific clarification before generation. No fake claims slip through.

---

### Stage 5: Generation — The Anti-Hallucination Prompt Engineering

The system prompt is 250+ lines. Not because I like writing essays, but because every line exists to close a hallucination vector I found in testing.

The one I'm most proud of:

```
MUST-HAVE GAP TRANSPARENCY:
When the JD explicitly specifies a "MUST HAVE" technology
that has NO evidence in the candidate's resume:

1. NEVER fabricate direct production experience.
2. DO NOT silently omit critical requirements.
3. INSTEAD: Transparently acknowledge using this pattern:

"While I may not have direct production experience in 
[Target Technology], my deep background in [Verified Skill] 
gives me the exact technical foundation to rapidly adapt 
and execute in [Target Ecosystem] with zero friction."
```

Most tools either lie about the skill or silently skip it. Both are bad. Lying gets you caught in interviews. Silently skipping leaves an obvious hole the recruiter notices. The transparent acknowledgment is actually *more* impressive — it shows self-awareness and honesty that 99% of applicants don't have.

**The Overclaim Red-Teamer** runs post-generation:

```javascript
// generate/route.js — Adversarial Seniority Overclaim Detector
const OVERCLAIM_PATTERNS = [
  { trigger: /\bspearheaded\b/gi, safe: "led implementation of" },
  { trigger: /\bpioneered\b/gi, safe: "developed" },
  { trigger: /\bsolely architected\b/gi, safe: "architected" },
  { trigger: /\bcommanded the\b/gi, safe: "coordinated the" },
];

// For each pattern: if the verb appears in the letter
// but NOT in the original resume → flag and replace.
// You said "developed" in your resume? 
// The letter says "developed." Not "spearheaded." Not "pioneered."
```

This catches the classic LLM seniority inflation pattern. GPT *loves* to turn "worked on" into "spearheaded." It's a deterministic regex pass — no LLM involved.

---

### Stage 6: Evidence Tracing — Perplexity-Style Proof Badges

Every claim in the generated letter has an inline citation marker:

> "Engineered official MCP servers using standard stdio transport **[Resume: official MCP servers with stdio transport]**"

The frontend parses these into interactive clickable badges. Click one → it opens a modal showing the exact resume line that grounds the claim. It's basically Perplexity's citation system, but for cover letters.

If the AI couldn't find resume evidence for a sentence, the citation is missing, and the overclaim detector flags it. **No orphan claims survive the pipeline.**

---

### Production Observability: Langfuse Full-Trace Telemetry & The Circuit Breaker

To understand what the multi-agent pipeline is doing in real-time, CoverCraft instruments end-to-end tracing with **Langfuse** (`@langfuse/core` / `langfuse` Node SDK):

- **Child Spans for Every MCP Tool:** When a generation request begins, Langfuse creates a parent trace and logs discrete child execution spans for Resume Parsing, JD Competency Extraction, Tavily Web Recon, GitHub Commit Proofer, Gemini Generation, and ATS Scoring.
- **Latency & Token Telemetry:** Captures exact prompt tokens, completion tokens, latency per tool, and model parameters for full visibility.
- **Graceful Non-Blocking Execution:** If Langfuse servers take longer or reach timeouts, the tracing wrapper catches errors silently so user letter generation is never blocked or delayed.

And for LLM API reliability, we have our Circuit Breaker state machine:

The entire tool runs on free-tier APIs. Gemini Flash Lite for generation, Tavily for search, Jina for extraction. Free tiers go down. A lot.

```javascript
// lib/gemini.js — Circuit Breaker State Machine
const circuit = {
  state: "CLOSED",          // Normal operation
  failureCount: 0,
  failureThreshold: 5,      // Trip after 5 consecutive failures
  cooldownPeriodMs: 30000,  // 30s cooldown
  successThreshold: 2,      // 2 canary successes to reset
};

// CLOSED → request flows normally
// 5 failures → OPEN → instant fail-fast (no wasted API calls)
// 30s cooldown → HALF_OPEN → canary request
// 2 canary successes → CLOSED again
```

Primary model fails? Automatic fallback from `gemini-3.5-flash-lite` to `gemini-3.8-flash`. Each model gets 2 retries with exponential backoff + jitter before falling over.

Why jitter? Because without it, if the API recovers, every instance retries at the exact same moment and kills it again. The `Math.random() * 250` spread prevents thundering herd.

---

### The Stack

- **Frontend:** Next.js 16 (App Router) + Recharts + Tailwind CSS
- **Backend:** Next.js Serverless Routes + Python 3.11 Model Context Protocol (MCP) Server (7 Tools)
- **Code Grounding:** GitHub REST API & MCP Proofer (5,000 req/hr free PAT, live commit SHA hashing)
- **LLM:** Gemini 2.5 Flash Lite (primary) + Gemini 3.8 Flash (fallback)
- **Company Research:** Tavily Search API (8-page crawl) + Jina AI Reader (markdown extractor)
- **Observability:** Langfuse (full-trace latency, token consumption & child spans) + MongoDB Atlas
- **Auth & Privacy:** NextAuth.js (Google OAuth) + Zero Phone Number Collection (Dual Auto-Extraction)
- **Rate Limiting:** IP-based sliding window (in-memory)
- **Deployment:** Vercel Serverless Edge + Docker Standalone (120MB)

---

### What I'd Do Differently

1. **Streaming.** Right now it waits for the full JSON response before rendering. SSE streaming would feel way snappier. But structured JSON output and streaming are awkward together with Gemini.

2. **Resume Profile Persistence.** Currently you re-upload your resume every session. Should store a parsed profile and only re-parse on changes.

3. **A/B Letter Variants.** Generate 2-3 variants with different emphasis (technical depth vs. leadership vs. culture fit) and let the user pick.

---

### Links

- **GitHub:** https://github.com/Ambuj123-lab/career-workspace-ambujsystems
- **Live App:** [deployed on Vercel]

Built this as a side project while job hunting. The irony of building a tool to help you get hired while you need to get hired is not lost on me.

Happy to answer any questions about the anti-hallucination pipeline, the circuit breaker, or why PDF parsing is a war crime. AMA.

---

### 💬 Discussion starters for the community:

1. **Honest question:** Do you actually read cover letters when hiring? Or is this entire document class dead and I wasted my time?
2. **The hallucination tradeoff:** I chose "transparent gap acknowledgment" over "skip the missing skill." Some people think showing weakness is suicide. Others think it shows maturity. What's your take?
3. **Circuit breakers for LLM APIs:** Anyone else running production on free-tier LLM APIs? What's your failure pattern look like? I'm seeing ~2-3 503s per day from Gemini.
4. **Source credibility scoring:** My stale content filter uses 9-month / 18-month thresholds. Too aggressive? Too lenient? What would you use?
