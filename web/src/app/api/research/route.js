import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || "";

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

    const query = `${company_name} AI research engineering developments tech stack recent news 2026`;
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
            max_results: 6,
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
        const gRes = await model.generateContent(`Find current facts and engineering developments about ${company_name}.`);
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

    // 2. Classify & Deduplicate Sources
    const seenUrls = new Set();
    const processedSources = [];

    rawResults.forEach((r, idx) => {
      if (!r.url || seenUrls.has(r.url)) return;
      seenUrls.add(r.url);

      let category = "News";
      let hostname = "";
      try {
        hostname = new URL(r.url).hostname.toLowerCase();
        if (
          hostname.includes(company_name.toLowerCase().replace(/\s+/g, "")) ||
          hostname.includes("deepmind.google") ||
          hostname.includes("google.com") ||
          hostname.includes("official")
        ) {
          category = "Official";
        } else if (hostname.includes("research") || hostname.includes("arxiv") || hostname.includes("paper")) {
          category = "Research";
        }
      } catch (e) {
        hostname = r.url;
      }

      processedSources.push({
        id: processedSources.length + 1,
        title: r.title || `${company_name} Intelligence`,
        url: r.url,
        domain: hostname,
        snippet: r.content?.slice(0, 300) || "",
        category,
        relevance: processedSources.length < 2 ? "High relevance" : processedSources.length < 4 ? "Medium relevance" : "Supporting source",
      });
    });

    const officialCount = processedSources.filter((s) => s.category === "Official").length;

    // 3. LLM Synthesis with Citations [1], [2]
    const sourcesText = processedSources
      .map(
        (s) =>
          `[Source ${s.id}] Title: ${s.title}\nURL: ${s.url}\nDomain: ${s.domain}\nCategory: ${s.category}\nExcerpt: ${s.snippet}`
      )
      .join("\n\n");

    const synthesisModel = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      systemInstruction: `You are CoverCraft's Company Intelligence Synthesis Engine.
Given verified web search sources about a target company, synthesize a structured research dossier with citations.

Rules:
1. ONLY make claims supported by the provided sources. Use citation markers like [1], [2] at the end of statements.
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
}`,
    });

    const synthPrompt = `Synthesize company intelligence for "${company_name}" applying for role "${role || "Software/AI Engineer"}".

<VERIFIED_WEB_SOURCES>
${sourcesText || "No external web sources retrieved."}
</VERIFIED_WEB_SOURCES>`;

    const synthResult = await synthesisModel.generateContent(synthPrompt);
    const synthData = JSON.parse(synthResult.response.text());

    // Fallback description for cover letter generator
    const description =
      synthData.company_snapshot?.summary ||
      `${company_name} is an active technology organization. Real-time web intelligence identified ${processedSources.length} verified sources.`;

    return NextResponse.json({
      company_name,
      query_used: query,
      search_provider: searchProvider,
      sources_analyzed_count: rawResults.length,
      sources_cited_count: Math.min(processedSources.length, synthData.company_snapshot?.sources_count || processedSources.length),
      official_sources_count: officialCount,
      updated_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      company_snapshot: synthData.company_snapshot || {
        summary: description,
        sources_count: processedSources.length,
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
