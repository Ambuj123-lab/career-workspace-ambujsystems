import { generateWithFallback } from "@/lib/gemini";
import { NextResponse } from "next/server";
import {
  INTERVIEW_DEFENSE_SYSTEM_INSTRUCTION,
  buildInterviewDefenseUserContent,
} from "@/prompts/interview-defense.system";

export async function POST(req) {
  try {
    const body = await req.json();
    const { letter_text, resume_text, role, company } = body;

    if (!letter_text || !resume_text) {
      return NextResponse.json(
        { error: "Missing letter_text or resume_text" },
        { status: 400 }
      );
    }

    const userContent = buildInterviewDefenseUserContent(letter_text, resume_text, role, company);

    // Call Gemini with strict systemInstruction
    const { text, model } = await generateWithFallback(
      { temperature: 0.25, responseMimeType: "application/json" },
      userContent,
      INTERVIEW_DEFENSE_SYSTEM_INSTRUCTION
    );

    const data = JSON.parse(text);

    // Standardize defense items format for UI
    const items = data.defense_items || data.questions || [];
    const normalizedItems = items.map((item) => ({
      claim: item.claim || "Letter achievement claim",
      claim_status: item.claim_status || "VERIFIED",
      question: item.question || "Can you elaborate on this technical implementation?",
      evidence: item.evidence || "Resume verified project reference",
      talking_points: item.talking_points || [
        "Detail the technical architecture and tools used",
        "Explain quantifiable outcomes and latency metrics",
      ],
      risk_level: item.risk_level || (item.claim_status === "UNSUPPORTED" ? "HIGH" : item.claim_status === "PARTIAL" ? "MEDIUM" : "LOW"),
    }));

    return NextResponse.json({
      success: true,
      questions: normalizedItems,
      defense_items: normalizedItems,
      _model_used: model,
      _policy: "evidence_first_claim_verification",
    });
  } catch (err) {
    console.error("Defense generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
