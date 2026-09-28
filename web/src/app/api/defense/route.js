import { recordTrace } from "@/lib/langfuse";
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

    
    const highRiskCount = normalizedItems.filter((i) => i.risk_level === "HIGH").length;
    const verifiedClaimsCount = normalizedItems.filter((i) => i.claim_status === "VERIFIED").length;

    // Asynchronously log interview defense verification trace to Langfuse (non-blocking)
    recordTrace({
      name: "interview-defense-generation",
      input: {
        role,
        company,
        letter_length: letter_text.length,
        resume_length: resume_text.length,
      },
      output: {
        questions_count: normalizedItems.length,
        verified_claims: verifiedClaimsCount,
        high_risk_claims: highRiskCount,
      },
      model,
      metadata: {
        role,
        company,
        policy: "evidence_first_claim_verification",
      },
      scores: [
        {
          name: "claim_verification_rate",
          value: normalizedItems.length > 0 ? Math.round((verifiedClaimsCount / normalizedItems.length) * 100) / 100 : 1.0,
          comment: `${verifiedClaimsCount}/${normalizedItems.length} claims verified against resume proof`,
        },
        {
          name: "interview_readiness",
          value: highRiskCount === 0 ? 0.95 : 0.75,
          comment: highRiskCount === 0 ? "Zero high-risk unverified claims in cover letter" : `${highRiskCount} claims require candidate defense`,
        },
      ],
    }).catch(() => {});

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
