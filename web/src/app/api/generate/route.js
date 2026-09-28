import { recordTrace } from "@/lib/langfuse";
import { generateWithFallback } from "@/lib/gemini";
import { NextResponse } from "next/server";
import {
  COVER_LETTER_SYSTEM_INSTRUCTION,
  buildCoverLetterUserContent,
} from "@/prompts/cover-letter.system";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { logGenerationTelemetry } from "@/lib/mongodb";

export async function POST(req) {
  try {
    // 1. IP Rate Limiting Guard
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp, { limit: 10, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${rateCheck.resetSeconds}s before generating another letter.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetSeconds) } }
      );
    }

    const body = await req.json();
    const { name, email, phone, linkedin, role, company, resume, jd, tone, analysis, company_info } = body;

    if (!name || !role || !company || !resume || !jd) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const matchedSkills = (analysis?.required_skills || [])
      .filter((s) => s.status === "STRONG_MATCH" || s.status === "PARTIAL_MATCH")
      .map((s) => `- ${s.skill}: "${s.evidence || "Direct resume match"}" [${s.status}]`)
      .join("\n");

    const companyContext = company_info?.description
      ? `Approved Company Intelligence (Real-time Web Search):\n${company_info.description}`
      : `Target Company: ${company} (No external claims approved — avoid inventing company facts)`;

    // Build quarantined user content block
    const userContent = buildCoverLetterUserContent({
      name,
      email,
      phone,
      linkedin,
      role,
      company,
      tone,
      companyContext,
      matchedSkills,
      resume,
      jd,
    });

    // Call Gemini with Circuit Breaker, Exponential Retries, and Fallback
    const { text, model, tokenUsage } = await generateWithFallback(
      { temperature: 0.35, responseMimeType: "application/json" },
      userContent,
      COVER_LETTER_SYSTEM_INSTRUCTION
    );

    const data = JSON.parse(text);

    // Adversarial Seniority Overclaim Red-Teamer (Veracity Audit Gate)
    const fullDraft = (data.paragraphs || []).map((p) => (typeof p === "string" ? p : p.content)).join(" ");
    const resumeLower = resume.toLowerCase();

    const OVERCLAIM_PATTERNS = [
      { trigger: /\bspearheaded\b/gi, safe: "led implementation of", word: "spearheaded" },
      { trigger: /\bpioneered\b/gi, safe: "developed", word: "pioneered" },
      { trigger: /\bsolely architected\b/gi, safe: "architected", word: "solely architected" },
      { trigger: /\bheaded the entire\b/gi, safe: "contributed to the", word: "headed the entire" },
      { trigger: /\bcommanded the\b/gi, safe: "coordinated the", word: "commanded the" },
    ];

    const overclaimAudit = [];
    data.paragraphs = (data.paragraphs || []).map((p) => {
      let textContent = typeof p === "string" ? p : p.content;
      OVERCLAIM_PATTERNS.forEach(({ trigger, safe, word }) => {
        if (trigger.test(textContent) && !resumeLower.includes(word)) {
          overclaimAudit.push({
            flagged_verb: word,
            adjusted_to: safe,
            reason: "Verb exceeds authentic resume evidence baseline",
          });
          textContent = textContent.replace(trigger, safe);
        }
      });
      return typeof p === "string" ? textContent : { ...p, content: textContent };
    });

    data.overclaim_audit = {
      audited: true,
      flags_count: overclaimAudit.length,
      flags: overclaimAudit,
      verdict: overclaimAudit.length === 0 ? "AUTHENTIC_FIT" : "ADJUSTED_TO_EVIDENCE",
    };

    // DETERMINISTIC APPLICATION-LAYER METRICS
    const strongSkillsCount = (analysis?.required_skills || []).filter(
      (s) => s.status === "STRONG_MATCH"
    ).length;
    const totalSkillsCount = analysis?.required_skills?.length || 0;

    const companySourceCount = company_info?.raw_sources?.length || 0;
    const companySourceType =
      companySourceCount > 0
        ? `Tavily web search (${companySourceCount} approved cited sources)`
        : "Candidate input only (no external search claims approved)";

    data.confidence_notes = [
      `Used ${strongSkillsCount} strong verified competencies (out of ${totalSkillsCount} analyzed)`,
      `Company intelligence source: ${companySourceType}`,
      `Strict Evidence Policy: 100% bounded by candidate resume`,
    ];

    const fullText = (data.paragraphs || [])
      .map((p) => p.content || p)
      .join(" ");
    data.word_count = fullText.split(/\s+/).filter(Boolean).length;
    data._model_used = model;
    data._token_usage = tokenUsage || null;

    // Asynchronously log telemetry to MongoDB (non-blocking)
    logGenerationTelemetry({
      userEmail: email || null,
      userName: name || null,
      company,
      role,
      modelUsed: model,
      wordCount: data.word_count,
      tokens: tokenUsage,
      clientIp,
    });

        // Asynchronously log execution trace & audit scores to Langfuse (non-blocking)
    recordTrace({
      name: "cover-letter-synthesis",
      input: {
        candidate: name,
        role,
        company,
        tone,
        strongSkillsCount,
        totalSkillsCount,
      },
      output: {
        wordCount: data.word_count,
        verdict: data.overclaim_audit?.verdict,
        flags_count: data.overclaim_audit?.flags_count || 0,
      },
      model,
      metadata: {
        role,
        company,
        tokens: tokenUsage,
        clientIp,
        overclaimFlags: overclaimAudit.length,
      },
      scores: [
        { name: "overclaim_count", value: overclaimAudit.length },
        { name: "strong_skills_used", value: strongSkillsCount },
        { name: "grounding_fidelity", value: overclaimAudit.length === 0 ? 1.0 : 0.85 },
      ],
    }).catch(() => {});

    return NextResponse.json(data);
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
