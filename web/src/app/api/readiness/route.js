import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { letter_text, resume_text, jd_text, matched_skills } = await req.json();

    const checks = [];
    
    // Check 1: Contact info completeness
    const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(letter_text || "");
    const hasPhone = /\+?\d[\d -]{8,}\d/.test(letter_text || "");
    checks.push({
      id: "contact_info",
      title: "Contact Headers",
      status: hasEmail && hasPhone ? "PASS" : "WARN",
      detail: hasEmail && hasPhone ? "Email & phone clearly detectable in header" : "Ensure phone number and email are both clearly present in the header",
    });

    // Check 2: Word Count & A4 Page Fit
    const words = (letter_text || "").trim().split(/\s+/).filter(Boolean).length;
    const wordStatus = words >= 280 && words <= 520 ? "PASS" : words < 280 ? "WARN" : "WARN";
    checks.push({
      id: "word_count",
      title: "Letter Length (A4 Target)",
      status: wordStatus,
      detail: `${words} words (ideal benchmark: 300 - 480 words for clean 1-page scanning)`,
    });

    // Check 3: Quantifiable Metrics
    const metricsCount = (letter_text?.match(/\d+[%kKmMbB]?|\$\d+/g) || []).length;
    checks.push({
      id: "quantifiable_impact",
      title: "Quantifiable Evidence",
      status: metricsCount >= 3 ? "PASS" : "WARN",
      detail: `${metricsCount} numeric metrics found in letter (target: 3+ verified numbers)`,
    });

    // Check 4: Hard Skill Keywords
    const matchedCount = (matched_skills || []).filter(s => s.status === "STRONG_MATCH" || s.status === "PARTIAL_MATCH").length;
    const totalSkills = (matched_skills || []).length || 1;
    const matchPct = Math.round((matchedCount / totalSkills) * 100);
    checks.push({
      id: "keyword_density",
      title: "JD Keyword Integration",
      status: matchPct >= 70 ? "PASS" : matchPct >= 50 ? "WARN" : "FAIL",
      detail: `${matchedCount}/${totalSkills} (${matchPct}%) required skills integrated with evidence`,
    });

    // Check 5: Formatting / Clean Typography
    const hasWeirdChars = /[^\x00-\x7F\u2010-\u2015\u2018-\u201F\u2022\u20AC\u20B9]/.test(letter_text || "");
    checks.push({
      id: "parseable_format",
      title: "Standard ATS Typography",
      status: !hasWeirdChars ? "PASS" : "WARN",
      detail: !hasWeirdChars ? "Clean standard fonts, no unparseable tables or canvas elements" : "Contains complex special characters that some legacy parsers may drop",
    });

    const passCount = checks.filter(c => c.status === "PASS").length;
    const score = Math.round((passCount / checks.length) * 100);

    return NextResponse.json({
      readiness_score: score,
      status: score >= 80 ? "STRONG_READINESS" : score >= 60 ? "MODERATE_READINESS" : "NEEDS_ATTENTION",
      checks,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
