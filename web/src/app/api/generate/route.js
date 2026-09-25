import { generateWithFallback } from "@/lib/gemini";
import { NextResponse } from "next/server";
import {
  COVER_LETTER_SYSTEM_INSTRUCTION,
  buildCoverLetterUserContent,
} from "@/prompts/cover-letter.system";

export async function POST(req) {
  try {
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

    // Call Gemini with strict systemInstruction
    const { text, model } = await generateWithFallback(
      { temperature: 0.35, responseMimeType: "application/json" },
      userContent,
      COVER_LETTER_SYSTEM_INSTRUCTION
    );

    const data = JSON.parse(text);

    // DETERMINISTIC APPLICATION-LAYER METRICS
    // Calculate metrics and confidence notes in code, not LLM imagination
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

    return NextResponse.json(data);
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
