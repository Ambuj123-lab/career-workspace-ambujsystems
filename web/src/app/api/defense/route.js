import { generateWithFallback } from "@/lib/gemini";
import { NextResponse } from "next/server";

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

    const prompt = `You are an expert technical interviewer preparing a candidate for a job interview.
Analyze the candidate's cover letter and resume for the role of ${role || "Candidate"} at ${company || "Target Company"}.
Extract 3 to 5 key claims made in the cover letter. For each claim:
1. Formulate a tough, realistic interview question an interviewer will ask to test if the candidate really did the work or exaggerated.
2. Identify the specific evidence / metric from the resume that proves this claim.
3. Provide a crisp 2-3 bullet point suggested defense answer that the candidate can use.

=== COVER LETTER ===
${letter_text}

=== RESUME (SOURCE OF TRUTH) ===
${resume_text}

Return JSON with this schema:
{
  "defense_items": [
    {
      "claim": "Direct quote or claim from the letter",
      "question": "Realistic interviewer follow-up question",
      "evidence": "Exact evidence or project from resume backing this up",
      "talking_points": [
        "Key architectural or technical decision made",
        "Quantifiable result or metric delivered",
        "Trade-off considered or obstacle overcome"
      ],
      "risk_level": "LOW" | "MEDIUM" | "HIGH"
    }
  ],
  "interview_tips": [
    "General strategic tip based on the matched profile"
  ]
}`;

    const { text, model } = await generateWithFallback(
      { temperature: 0.3, responseMimeType: "application/json" },
      prompt
    );

    const data = JSON.parse(text);
    data._model_used = model;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Defense generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
