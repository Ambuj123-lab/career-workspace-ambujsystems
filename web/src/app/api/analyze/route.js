import { recordTrace } from "@/lib/langfuse";
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

    // Deterministic Job Context & Hiring Route Fallbacks (Evidence-Grounded)
    const lowerJd = (jd_text || "").toLowerCase();
    
    // Check for explicit third-party staffing indicators
    const isVendorMentioned = 
      lowerJd.includes("payroll of") || 
      lowerJd.includes("on the payroll") ||
      lowerJd.includes("contract to hire") ||
      lowerJd.includes("c2h") ||
      lowerJd.includes("deployed at client") ||
      lowerJd.includes("third-party payroll") ||
      lowerJd.includes("third party payroll") ||
      lowerJd.includes("deputed at client");

    // Extract verbatim quote if vendor mentioned
    let vendorQuote = null;
    if (isVendorMentioned) {
      const match = jd_text.match(/(?:payroll of|on the payroll|contract to hire|c2h|deployed at client|third-party payroll|deputed at client)[^\.\n]*/i);
      if (match) vendorQuote = match[0].trim();
    }

    if (!data.job_context) {
      data.job_context = {};
    }
    data.job_context.role = data.job_context.role || data.role_title || "Target Engineering Role";
    data.job_context.work_model = data.job_context.work_model || (lowerJd.includes("remote") ? "Remote" : lowerJd.includes("hybrid") ? "Hybrid" : lowerJd.includes("on-site") || lowerJd.includes("onsite") ? "On-site" : "Not stated in job posting");
    data.job_context.experience_bracket = data.job_context.experience_bracket || (jd_text.match(/\b\d+\s*[-–to]+\s*\d+\s*(?:years?|yrs?)\b/i)?.[0] || "Not stated in job posting");
    data.job_context.employment_type = data.job_context.employment_type || (lowerJd.includes("full-time") || lowerJd.includes("full time") ? "Full-time" : lowerJd.includes("contract") ? "Contract" : "Not stated in job posting");
    data.job_context.salary_range = data.job_context.salary_range || (jd_text.match(/(?:₹|\$|inr|usd|lpa|ctc)[\s\d\.,\-–toLPAk]+/i)?.[0] || "Not disclosed in job posting");
    data.job_context.source_platform = data.job_context.source_platform || (lowerJd.includes("naukri") ? "Naukri.com" : lowerJd.includes("linkedin") ? "LinkedIn" : lowerJd.includes("indeed") ? "Indeed" : "Job Description Text");

    if (!data.hiring_context) {
      data.hiring_context = {
        is_third_party_vendor: isVendorMentioned,
        application_route: isVendorMentioned ? "Third-Party Recruiter / Contract Staffing" : "Direct Employer Posting",
        employer_of_record: isVendorMentioned ? (vendorQuote || "Third-party staffing agency stated in JD") : "Direct company payroll",
        client_company: isVendorMentioned ? "Client deployment" : "Direct posting",
        verbatim_evidence_quote: vendorQuote,
        verification_warning: isVendorMentioned ? "Verify contract terms, client perks, and payroll entity before applying." : null
      };
    }

    data._model_used = model;
    data._scoring_method = "deterministic_application_layer";

    
    // Asynchronously log JD Match analysis trace to Langfuse (non-blocking)
    recordTrace({
      name: "job-description-analysis",
      input: {
        jd_length: jd_text.length,
        resume_length: resume_text.length,
        target_role: data.job_context?.role || "Target Role",
      },
      output: {
        overall_match: data.overall_match,
        required_skills_count: skills.length,
        strong_matches: data.chart_data?.strong_match || 0,
        partial_matches: data.chart_data?.partial_match || 0,
        missing_skills: data.chart_data?.missing || 0,
      },
      model,
      metadata: {
        role: data.job_context?.role,
        work_model: data.job_context?.work_model,
        experience_bracket: data.job_context?.experience_bracket,
        source_platform: data.job_context?.source_platform,
        scoring_method: "deterministic_application_layer",
      },
      scores: [
        {
          name: "match_score",
          value: Math.round(data.overall_match) / 100,
          comment: `Deterministic match score based on ${skills.length} extracted competencies`,
        },
        {
          name: "skills_coverage",
          value: totalSkills > 0 ? Math.round(((data.chart_data?.strong_match + data.chart_data?.partial_match) / totalSkills) * 100) / 100 : 1.0,
          comment: "Ratio of matched skills to total JD requirements",
        },
      ],
    }).catch(() => {});

    return NextResponse.json(data);
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
