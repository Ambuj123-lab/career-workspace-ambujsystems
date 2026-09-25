import { generateWithFallback } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { jd_text, resume_text } = await req.json();

    if (!jd_text || !resume_text) {
      return NextResponse.json({ error: "Missing jd_text or resume_text" }, { status: 400 });
    }

    const prompt = `Analyze this job description against the candidate's resume.
For each required skill in the JD, determine if the candidate has:
- STRONG_MATCH (directly demonstrated with evidence)
- PARTIAL_MATCH (related but not exact)
- TRANSFERABLE (different domain but applicable skill)
- MISSING (not found in resume)

=== JOB DESCRIPTION ===
${jd_text}

=== RESUME ===
${resume_text}

Return JSON:
{
  "role_title": "Extracted role title from JD",
  "overall_match": 75,
  "required_skills": [
    {
      "skill": "Skill name",
      "status": "STRONG_MATCH",
      "confidence": 0.9,
      "evidence": "Exact quote or reference from resume"
    }
  ],
  "chart_data": {
    "strong_match": 3,
    "partial_match": 2,
    "transferable": 1,
    "missing": 1
  }
}`;

    const { text, model } = await generateWithFallback(
      { temperature: 0.2, responseMimeType: "application/json" },
      prompt
    );

    const data = JSON.parse(text);
    data._model_used = model;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
