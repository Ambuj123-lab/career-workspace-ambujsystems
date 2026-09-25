import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { generateWithFallback } from "@/lib/gemini";
import { NextResponse } from "next/server";
import {
  JOB_ANALYSIS_SYSTEM_INSTRUCTION,
  buildJobAnalysisUserContent,
} from "@/prompts/job-analysis.system";

export async function POST(req) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(clientIp, { limit: 15, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${rateCheck.resetSeconds}s before analyzing another job.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetSeconds) } }
      );
    }

    const { jd_text, resume_text } = await req.json();

    if (!jd_text || !resume_text) {
      return NextResponse.json({ error: "Missing jd_text or resume_text" }, { status: 400 });
    }

    const userContent = buildJobAnalysisUserContent(jd_text, resume_text);

    // Call Gemini with strict systemInstruction policy
    const { text, model } = await generateWithFallback(
      { temperature: 0.2, responseMimeType: "application/json" },
      userContent,
      JOB_ANALYSIS_SYSTEM_INSTRUCTION
    );

    const data = JSON.parse(text);
    const skills = data.required_skills || [];
    const totalSkills = Math.max(skills.length, 1);

    // DETERMINISTIC APPLICATION-LAYER SCORING
    // LLM classifies evidence; Application layer calculates the final score
    const weights = {
      STRONG_MATCH: 1.0,
      PARTIAL_MATCH: 0.6,
      TRANSFERABLE: 0.4,
      MISSING: 0.0,
    };

    const rawScore =
      skills.reduce((sum, item) => sum + (weights[item.status] ?? 0), 0) / totalSkills;
    data.overall_match = Math.round(rawScore * 100);

    // Deterministic chart distribution
    data.chart_data = {
      strong_match: skills.filter((s) => s.status === "STRONG_MATCH").length,
      partial_match: skills.filter((s) => s.status === "PARTIAL_MATCH").length,
      transferable: skills.filter((s) => s.status === "TRANSFERABLE").length,
      missing: skills.filter((s) => s.status === "MISSING").length,
    };

    // Deterministic confidence mapping from evidence_strength
    skills.forEach((s) => {
      if (s.evidence_strength === "HIGH" || s.status === "STRONG_MATCH") {
        s.confidence = 0.95;
      } else if (s.evidence_strength === "MEDIUM" || s.status === "PARTIAL_MATCH") {
        s.confidence = 0.65;
      } else if (s.status === "TRANSFERABLE") {
        s.confidence = 0.45;
      } else {
        s.confidence = 0.0;
      }
    });

    data._model_used = model;
    data._scoring_method = "deterministic_application_layer";

    return NextResponse.json(data);
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
