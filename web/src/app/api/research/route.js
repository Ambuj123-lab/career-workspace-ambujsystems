import { recordTrace } from "@/lib/langfuse";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { generateWithFallback } from "@/lib/gemini";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || "";

// Jina AI Reader: High-Fidelity Markdown Web Extractor (Free, zero-bloat)
async function extractWithJinaReader(url) {
  if (!url || !url.startsWith("http")) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s strict timeout
    const reqHeaders = {
      "Accept": "application/json",
      "X-No-Cache": "true",
    };
    if (process.env.JINA_API_KEY) {
      reqHeaders["Authorization"] = `Bearer ${process.env.JINA_API_KEY}`;
    }
    const res = await fetch(`https://r.jina.ai/${url}`, {
      headers: reqHeaders,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const markdown = data.data?.content || data.content || "";
      if (markdown && markdown.length > 100) {
        // Return first 1,500 clean characters
        return markdown.slice(0, 1500).replace(/\n{3,}/g, "\n\n").trim();
      }
    }
  } catch (err) {
    // Non-blocking fallback to standard snippet
  }
  return null;
}


export async function POST(req) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp, { limit: 12, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${rateCheck.resetSeconds}s before conducting company research.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetSeconds) } }
      );
    }

    const { company_name, role } = await req.json();
    if (!company_name) {
      return NextResponse.json({ error: "Company name required" }, { status: 400 });
    }

    const query = `${company_name} company overview tech stack engineering hiring jobs careers naukri ambitionbox indeed`;
    let rawResults = [];
    let searchProvider = "Tavily Advanced Search";

    // 1. Primary: Real-Time Tavily Search API
    if (TAVILY_API_KEY) {
      try {
        const tRes = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: TAVILY_API_KEY,
            query,
            search_depth: "advanced",
            include_answer: true,
            max_results: 8,
          }),
        });

        if (tRes.ok) {
          const tData = await tRes.json();
          rawResults = tData.results || [];
        }
      } catch (tErr) {
        console.warn("Tavily search failed, falling back to Gemini:", tErr.message);
      }
    }

    // Fallback: If Tavily returned no results, fallback to Gemini search grounding
    if (rawResults.length === 0) {
      searchProvider = "Gemini Google Grounding (Fallback)";
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-3.5-flash-lite",
          tools: [{ googleSearch: {} }],
          generationConfig: { temperature: 0.2 },
        });
        const gRes = await model.generateContent(`Find current facts, engineering tech stack, and hiring signals on Naukri, AmbitionBox, or official careers for ${company_name}.`);
        const candidate = gRes.response.candidates?.[0];
        const grounding = candidate?.groundingMetadata;
        if (grounding?.groundingChunks) {
          grounding.groundingChunks.forEach((chunk, i) => {
            if (chunk.web) {
              rawResults.push({
                title: chunk.web.title || `${company_name} Source ${i + 1}`,
                url: chunk.web.uri || "https://google.com",
                content: "Official search grounding citation.",
              });
            }
          });
        }
      } catch (gErr) {
        console.warn("Gemini grounding fallback error:", gErr.message);
      }
    }

    // 1.5. Deep Page Scraping via Jina AI Reader for Top Authoritative URLs
    let jinaEnrichedCount = 0;
    if (rawResults.length > 0) {
      const topUrls = rawResults.slice(0, 2);
      await Promise.allSettled(
        topUrls.map(async (r) => {
          if (r.url && (!r.content || r.content.length < 250)) {
            const deepContent = await extractWithJinaReader(r.url);
            if (deepContent) {
              r.content = deepContent;
              jinaEnrichedCount++;
            }
          }
        })
      );
    }

    // 2. Deterministic Source Credibility & Outdated News & Stale Tech Filter (MCP: source_filter)
    const TIER1_DOMAINS = [
      "github.com", "sec.gov", "greenhouse.io", "lever.co", "workday.com",
      "reuters.com", "techcrunch.com", "bloomberg.com", "forbes.com", "cnbc.com",
      "theinformation.com", "wsj.com", "ft.com"
    ];
    const NOISE_DOMAINS = ["pinterest.com", "quora.com", "facebook.com", "instagram.com", "tiktok.com"];

    const seenUrls = new Set();
    const scoredSources = [];
    const cleanComp = company_name.toLowerCase().replace(/[^a-z0-9]/g, "");

    rawResults.forEach((r) => {
      if (!r.url || seenUrls.has(r.url)) return;
      seenUrls.add(r.url);

      let hostname = "";
      try {
        hostname = new URL(r.url).hostname.toLowerCase();
      } catch {
        return;
      }

      // Discard social noise & scrapers
      if (NOISE_DOMAINS.some((nd) => hostname.includes(nd))) return;

      let tier = 2;
      let trustScore = 70;
      let category = "External News";

      if (
        hostname.includes(cleanComp) ||
        r.url.includes("/about") ||
        r.url.includes("/careers") ||
        r.url.includes("/press") ||
        r.url.includes("/blog")
      ) {
        tier = 1;
        trustScore = 95;
        category = "Official Company";
      } else if (TIER1_DOMAINS.some((td) => hostname.includes(td))) {
        tier = 1;
        trustScore = 90;
        category = "Verified Newsroom / Primary";
      } else if (
        hostname.includes("naukri") ||
        hostname.includes("ambitionbox") ||
        hostname.includes("indeed") ||
        hostname.includes("glassdoor") ||
        hostname.includes("linkedin") ||
        hostname.includes("greenhouse") ||
        hostname.includes("lever.co") ||
        hostname.includes("workday")
      ) {
        tier = 2;
        trustScore = 75;
        category = "Verified Job Board";
      } else {
        tier = 3;
        trustScore = 55;
        category = "Supporting Media";
      }

      // Outdated News & Stale Tech Filter (Strict Recency Verification: <9m Initiatives, <18m Tech Stack)
      const textBlob = (r.title + " " + (r.content || "")).toLowerCase();
      const oldYearMatch = textBlob.match(/\b(201[0-9]|202[0-3])\b/);
      const recentYearMatch = textBlob.match(/\b(202[4-6])\b/);

      let freshness = "CURRENT (<9m)";
      if (oldYearMatch && !recentYearMatch) {
        freshness = "HISTORICAL CONTEXT (>18m)";
        trustScore -= 15; // Downrank stale articles
      } else if (recentYearMatch) {
        freshness = "RECENT (<9m)";
        trustScore += 8; // Prioritize current engineering initiatives
      }

      scoredSources.push({
        title: r.title || `${company_name} Intelligence`,
        url: r.url,
        domain: hostname,
        snippet: r.content?.slice(0, 350) || "",
        category,
        tier,
        trustScore,
        freshness,
      });
    });

    // Sort by Trust Score descending and assign IDs
    scoredSources.sort((a, b) => b.trustScore - a.trustScore);
    const processedSources = scoredSources.map((s, idx) => ({
      ...s,
      id: idx + 1,
      relevance: s.tier === 1 ? "Tier-1 Authoritative" : s.tier === 2 ? "Tier-2 Verified" : "Supporting Context",
    }));

    const officialCount = processedSources.filter((s) => s.category === "Official").length;

    // 3. LLM Synthesis with Citations [1], [2]
    const sourcesText = processedSources
      .map(
        (s) =>
          `[Source ${s.id}] Title: ${s.title}\nURL: ${s.url}\nDomain: ${s.domain}\nCategory: ${s.category}\nExcerpt: ${s.snippet}`
      )
      .join("\n\n");

    const researchSystemInstruction = `You are CoverCraft's Company Intelligence Synthesis Engine.
Given verified web search sources about a target company, synthesize a structured research dossier with citations.

Rules:
1. ONLY make claims supported by the provided sources. Use citation markers like [1], [2] at the end of statements.
2. OUTDATED NEWS & STALE TECH FILTER (RECENCY GATE):
   - For company initiatives & news: STRICTLY prioritize developments from the last 9 months (2025-2026). If an article is older than 9 months or from 2023/earlier, explicitly tag it as '[Historical Context]' and never present it as an active current initiative.
   - For tech stack & engineering architecture: Only cite technologies confirmed within the last 18 months. Discard obsolete legacy migrations.
2. For company_snapshot: write 2-3 crisp sentences summarizing what the company does, their engineering mission, and technological scale.
3. For role_relevant_signals: extract 2 to 3 technical capability areas relevant to a "${role || "Software/AI Engineer"}" and explain "why_it_matters" for a candidate's application.
4. For recent_signals: extract 3 to 5 real publications, announcements, or product launches with date or source domain.
5. If no specific news is found, summarize the confirmed core products/missions. Never invent fake revenue or acquisitions.

Return JSON matching this schema:
{
  "company_snapshot": {
    "summary": "...",
    "sources_count": 3
  },
  "company_identity": {
    "industry": "e.g. IT Services & Software Consulting (or 'Not verified from available sources')",
    "company_type": "Product Company" | "Services / Consulting" | "Staffing / Recruitment" | "GCC / Captive Center" | "Startup" | "Not verified from available sources",
    "business_focus": "e.g. Cloud Platforms & Enterprise AI",
    "headquarters": "City, Country (e.g. Pune, India) or 'Not verified from available sources'",
    "founded": "Year string or null if not stated",
    "website": "Domain name or 'Not verified'"
  },
  "employer_type": {
    "category": "Direct Employer" | "Services Vendor" | "Staffing / Recruitment" | "Consulting" | "Product Company" | "GCC / Captive Center" | "Startup",
    "verification_status": "Verified from source" | "Not verified from available sources",
    "evidence_citation": "[1]"
  },
  "role_relevant_signals": [
    {
      "signal": "...",
      "detail": "... [1]",
      "why_it_matters": "..."
    }
  ],
  "recent_signals": [
    {
      "title": "...",
      "source_name": "...",
      "url": "...",
      "date": "...",
      "category": "Official" | "Research" | "News"
    }
  ]
}`;

    const synthPrompt = `Synthesize company intelligence for "${company_name}" applying for role "${role || "Software/AI Engineer"}".

<VERIFIED_WEB_SOURCES>
${sourcesText || "No external web sources retrieved."}
</VERIFIED_WEB_SOURCES>`;

    const { text: synthText } = await generateWithFallback(
      { temperature: 0.2, responseMimeType: "application/json" },
      synthPrompt,
      researchSystemInstruction
    );
    const synthData = JSON.parse(synthText);

    // Fallback description for cover letter generator
    const description =
      synthData.company_snapshot?.summary ||
      `${company_name} is an active technology organization. Real-time web intelligence identified ${processedSources.length} verified sources.`;

    // 3-Way Source Categorization (Company, Job, External)
    const companySourcesList = processedSources.filter((s) => s.category === "Company");
    const jobSourcesList = processedSources.filter((s) => s.category === "Job Board");
    const externalSourcesList = processedSources.filter((s) => s.category === "External News" || s.category === "News");

    return NextResponse.json({
      company_name,
      query_used: query,
      search_provider: searchProvider,
      reader_provider: jinaEnrichedCount > 0 ? "Jina AI Deep Reader (r.jina.ai)" : "Tavily Extractor",
      jina_deep_scraped_count: jinaEnrichedCount,
      sources_analyzed_count: rawResults.length,
      sources_cited_count: Math.min(processedSources.length, synthData.company_snapshot?.sources_count || processedSources.length),
      official_sources_count: companySourcesList.length,
      updated_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      company_snapshot: synthData.company_snapshot || {
        summary: description,
        sources_count: processedSources.length,
      },
      company_identity: synthData.company_identity || {
        industry: "IT & Software Services",
        company_type: "Services / Consulting",
        business_focus: "Cloud & Software Engineering",
        headquarters: "Not verified from available sources",
        founded: null,
        website: processedSources[0]?.domain || "Not verified",
      },
      employer_type: synthData.employer_type || {
        category: "Direct Employer",
        verification_status: processedSources.length > 0 ? "Verified from source" : "Not verified from available sources",
        evidence_citation: "[1]",
      },
      sources_categorized: {
        company_sources: companySourcesList,
        job_sources: jobSourcesList,
        external_sources: externalSourcesList,
        coverage: {
          company_count: companySourcesList.length,
          job_count: jobSourcesList.length,
          external_count: externalSourcesList.length,
          total_retrieved: rawResults.length,
          total_cited: Math.min(processedSources.length, 5),
        },
      },
      role_relevant_signals: synthData.role_relevant_signals || [],
      recent_signals: synthData.recent_signals || [],
      raw_sources: processedSources,
      description,
      confidence: processedSources.length >= 3 ? "HIGH" : processedSources.length >= 1 ? "MEDIUM" : "LOW",
    });
  } catch (err) {
    console.error("Research API error:", err);
    return NextResponse.json(
      {
        error: err.message,
        company_name: "",
        raw_sources: [],
        confidence: "LOW",
      },
      { status: 500 }
    );
  }
}
