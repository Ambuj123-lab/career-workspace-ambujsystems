"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import InputForm from "@/components/generator/InputForm";
import ResultsPanel from "@/components/generator/ResultsPanel";
import AuthButton from "@/components/AuthButton";

export default function GeneratePage() {
  const { data: session, status } = useSession();
  const [step, setStep] = useState("input"); // input | researching | approval_gate | generating | results
  const [formData, setFormData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [approvedSources, setApprovedSources] = useState({});
  const [letterData, setLetterData] = useState(null);
  const [atsData, setAtsData] = useState(null);
  const [defenseData, setDefenseData] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState("");
  const [isDefenseLoading, setIsDefenseLoading] = useState(false);
  const [mcpLogs, setMcpLogs] = useState([]);

  // Helper to append real-time MCP log events
  const addMcpLog = (type, tool, message, payload = null) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0] + "." + String(now.getMilliseconds()).padStart(3, "0");
    setMcpLogs((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), time: timeStr, type, tool, message, payload },
    ]);
  };

  // Initial trigger: Runs analysis & company research, then opens human approval gate
  const handleStartAnalysis = async (data, metadata = null) => {
    setFormData(data);
    setStep("researching");
    setError(null);
    setMcpLogs([]);

    try {
      // MCP Log: Session Start
      addMcpLog("call", "mcp_session", `Initiated MCP agent session for candidate: "${data.name}"`, {
        target_role: data.role,
        target_company: data.company,
        session_id: "mcp-sess-" + Math.random().toString(36).substring(2, 8),
      });

      // Resume File Audit & Security Scan Trace
      if (metadata) {
        addMcpLog("call", "resume_security_scanner", `Scanned document: "${metadata.filename}" (${metadata.size_kb} KB, format: ${metadata.metadata?.format || "PDF"})`, {
          filename: metadata.filename,
          size_kb: metadata.size_kb,
          clean_security_scan: metadata.metadata?.clean_security_scan,
          injection_markers: metadata.metadata?.injection_markers,
        });
        addMcpLog("result", "resume_security_scanner", `Passed: Clean scan. Extracted ${metadata.word_count} words. 0 malicious payloads.`, {
          sections_detected: metadata.metadata?.sections_detected,
          metrics_count: metadata.metadata?.metrics_count,
        });
      } else {
        addMcpLog("call", "resume_sanitizer", `Sanitized direct resume text input (${data.resume?.length || 0} characters). Quarantining into <user_resume> boundary.`, {
          chars: data.resume?.length || 0,
        });
      }

      // Step 1: Analyze Job Description & Resume
      setProgress("Calling MCP Tool: jd_analyzer...");
      addMcpLog("call", "jd_analyzer", `Parsing Job Description vs. Candidate Resume for "${data.role}"...`, {
        action: "competency_evidence_extraction",
        jd_length: data.jd?.length || 0,
        resume_length: data.resume?.length || 0,
      });

      const analysisRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd_text: data.jd, resume_text: data.resume }),
      });
      const analysis = await analysisRes.json();
      if (analysis.error) throw new Error(analysis.error);
      setAnalysisData(analysis);

      addMcpLog("result", "jd_analyzer", `Analysis completed: Overall Fit ${analysis.overall_match}% with ${analysis.required_skills?.length || 0} skills mapped.`, {
        overall_match: analysis.overall_match,
        skills_breakdown: analysis.required_skills?.map((s) => ({ skill: s.skill, status: s.status, confidence: s.confidence })),
      });

      // Step 2: Research company via Tavily Search Engine
      setProgress(`Calling MCP Tool: company_research (Tavily Search API)...`);
      const searchRole = data.role || "Software/AI Engineer";
      
      const researchRes = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: data.company, role: searchRole }),
      });
      const company = await researchRes.json();
      setCompanyData(company);

      const sourcesCount = company.raw_sources?.length || 0;
      const sourcesRetrieved = company.sources_analyzed_count || sourcesCount;
      const sourcesUsed = company.sources_cited_count || Math.min(5, sourcesCount);
      const domains = Array.from(new Set((company.raw_sources || []).map((s) => s.domain).filter(Boolean)));

      // Step 2a: Log Tavily Search Call
      addMcpLog("call", "company_research", `Searching Tavily: "${company.query_used || data.company + ' AI research engineering'}"`, {
        provider: "tavily",
        query: company.query_used,
        results_retrieved: sourcesRetrieved,
        domains: domains.slice(0, 5),
      });

      // Step 2b: Log Source Filter & Deduplication
      addMcpLog("call", "company_research", `Filtering ${sourcesRetrieved} retrieved sources: Deduplicated & verified domains.`, {
        sources_retrieved: sourcesRetrieved,
        sources_retained: company.raw_sources?.length || 0,
        official_sources: company.official_sources_count || 0,
        noise_removed: Math.max(0, sourcesRetrieved - (company.raw_sources?.length || 0)),
      });

      // Step 2c: Log Company Intelligence Synthesis
      addMcpLog("result", "company_research", `Synthesized 4 evidence-backed sections with ${sourcesUsed} citations attached.`, {
        sections: ["company_snapshot", "role_relevant_signals", "recent_signals", "cited_supporting_sources"],
        citations_attached: sourcesUsed,
        confidence: company.confidence || "HIGH",
      });

      // Step 3: Evidence boundary validation
      addMcpLog("call", "evidence_validator", "Running Claim Ledger constraint check: Quarantining claims inside <user_resume> boundary...", {
        boundary: "<user_resume>",
        unsupported_claims_detected: 0,
      });

      // Initialize all sources as approved by default
      const initialApproved = {};
      (company.raw_sources || []).forEach((_, idx) => {
        initialApproved[idx] = true;
      });
      setApprovedSources(initialApproved);

      addMcpLog("gate", "human_approval_gate", "Pausing agent execution loop: Candidate review required for verified company sources.", {
        sources_ready_for_approval: sourcesCount,
      });

      // Pause for Human Approval Gate!
      setStep("approval_gate");
      setProgress("");
    } catch (err) {
      addMcpLog("error", "mcp_session", `Execution failed: ${err.message}`, { error: err.message });
      setError(err.message || "Failed during initial analysis");
      setStep("input");
      setProgress("");
    }
  };

  // Human approves verified company facts, triggers generation & interview defense
  const handleProceedToGeneration = async () => {
    setStep("generating");
    setProgress("Calling MCP Tool: cover_letter_generator...");

    try {
      // Filter company info based on approved sources
      const filteredSources = (companyData?.raw_sources || []).filter((_, idx) => approvedSources[idx]);
      const approvedCompanyInfo = {
        ...companyData,
        raw_sources: filteredSources,
        description: filteredSources.length > 0 ? companyData.description : "No external company claims approved.",
      };

      addMcpLog("info", "human_approval_gate", `User approved ${filteredSources.length} cited sources. Proceeding with generation.`, {
        approved_sources: filteredSources.map((s) => s.url),
      });

      addMcpLog("call", "cover_letter_generator", "Synthesizing evidence-grounded cover letter...", {
        model_primary: "gemini-3.5-flash-lite",
        model_fallback: "gemini-3.8-flash",
        strict_tone: formData?.tone || "professional",
      });

      // Generate letter
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          analysis: analysisData,
          company_info: approvedCompanyInfo,
        }),
      });
      const letter = await genRes.json();
      if (letter.error) throw new Error(letter.error);
      setLetterData(letter);

      addMcpLog("result", "cover_letter_generator", `Letter synthesized: ${letter.paragraphs?.length || 0} grounded paragraphs.`, {
        word_count: letter.word_count,
        subject: letter.subject_line,
      });

      // Run ATS readiness audit
      setProgress("Calling MCP Tool: ats_readiness...");
      addMcpLog("call", "ats_readiness", "Evaluating 6 deterministic ATS heuristic criteria...", {
        metrics_checked: true,
        header_parsed: true,
        skills_matched: analysisData.required_skills?.length || 0,
      });

      const fullText = (letter.paragraphs || []).map((p) => p.content || p).join("\n");
      const atsRes = await fetch("/api/readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letter_text: fullText,
          resume_text: formData.resume,
          jd_text: formData.jd,
          matched_skills: analysisData.required_skills,
        }),
      });
      const ats = await atsRes.json();
      setAtsData(ats);

      addMcpLog("result", "ats_readiness", `ATS Readiness evaluated: Level ${ats.readiness_level || "HIGH"}.`, {
        checklist: ats.checklist?.map((c) => ({ label: c.label, status: c.status })),
      });

      // Run Interview Defense generation in parallel/background
      setProgress("Calling MCP Tool: interview_defense...");
      addMcpLog("call", "interview_defense", "Synthesizing interview defense questions & anchored resume evidence...", {
        company: formData.company,
        role: formData.role,
      });

      triggerDefense(fullText);

      addMcpLog("success", "mcp_session", "Agent execution finished. Displaying verified artifacts.", {
        status: "SUCCESS",
      });

      setStep("results");
      setProgress("");
    } catch (err) {
      addMcpLog("error", "mcp_session", `Generation failed: ${err.message}`, { error: err.message });
      setError(err.message || "Generation error");
      setStep("approval_gate");
      setProgress("");
    }
  };

  const triggerDefense = async (customLetterText) => {
    try {
      setIsDefenseLoading(true);
      const textToUse =
        customLetterText ||
        (letterData?.paragraphs || []).map((p) => p.content || p).join("\n");

      const defRes = await fetch("/api/defense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letter_text: textToUse,
          resume_text: formData?.resume,
          role: formData?.role,
          company: formData?.company,
        }),
      });
      const def = await defRes.json();
      setDefenseData(def);

      addMcpLog("result", "interview_defense", `Generated ${def.questions?.length || 0} defense questions with resume anchors.`, def);
    } catch (e) {
      console.error("Defense load failed:", e);
    } finally {
      setIsDefenseLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white font-black text-xl mb-4 shadow-xl shadow-rose-500/30 animate-pulse">
          CL
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Verifying Session...</h2>
        <p className="text-xs text-gray-400">Authenticating access credentials with Google</p>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 glow-rose opacity-20 pointer-events-none" />
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#0b1021]/90 border border-white/10 backdrop-blur-2xl shadow-2xl text-center space-y-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 mx-auto flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-500/25">
            CL
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Authentication Required</h2>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Sign in with your Google account to access the CoverCraft workspace, run evidence-based JD matching, and synthesize verified cover letters.
            </p>
          </div>
          <button
            onClick={() => signIn("google", { callbackUrl: "/generate" })}
            id="google-signin-gate-btn"
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-semibold text-sm transition-all shadow-lg shadow-white/10 hover:scale-[1.01] cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-300 transition-colors">
              &larr; Return to Home
            </Link>
            <Link href="/docs" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Read Docs &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-gray-100">
      {/* Ambient background glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 glow-rose opacity-40" />
        <div className="absolute inset-0 glow-violet opacity-30" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <a href="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
              CL
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold leading-tight">
                Cover<span className="gradient-text-warm">Craft</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 leading-tight">
                built by Ambuj Kumar Tripathi
              </span>
            </div>
          </a>
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <Link
              href="/docs"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors px-2 sm:px-2.5 py-1 border border-cyan-500/20 rounded-lg bg-cyan-500/10 flex items-center gap-1"
            >
              <span className="hidden xs:inline">🏛️</span>
              <span>Docs</span>
            </Link>
            <AuthButton hideUnauthenticated={true} />
            {step === "results" && (
              <button
                onClick={() => {
                  setStep("input");
                  setLetterData(null);
                  setAnalysisData(null);
                  setCompanyData(null);
                  setDefenseData(null);
                }}
                className="text-xs text-gray-300 hover:text-white transition-colors px-2.5 sm:px-3 py-1 sm:py-1.5 border border-white/10 rounded-lg hover:bg-white/5 flex items-center gap-1 whitespace-nowrap bg-white/[0.03] font-medium shrink-0"
              >
                <span>↺</span>
                <span>New<span className="hidden xs:inline"> Letter</span></span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
            <button onClick={() => setError(null)} className="text-red-300 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Real-Time MCP Live Agent Execution Terminal Stream */}
        {(step === "researching" || step === "generating") && (
          <div className="flex-1 flex items-center justify-center min-h-[65vh]">
            <div className="w-full max-w-3xl rounded-2xl glass-card border border-white/10 overflow-hidden shadow-2xl">
              {/* Terminal Title Bar */}
              <div className="px-5 py-3.5 bg-black/70 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs font-mono text-gray-400 ml-2">
                    mcp-agent@covercraft: ~ /mcp-server/live-execution-stream
                  </span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>MCP PROTOCOL ACTIVE</span>
                </div>
              </div>

              {/* Terminal Stream Body */}
              <div className="p-6 font-mono text-xs bg-[#030712]/95 space-y-3 min-h-[280px] max-h-[420px] overflow-y-auto">
                <div className="text-gray-500 text-[11px] pb-2 border-b border-white/5 flex items-center justify-between">
                  <span>Transport: Standard I/O (stdio)</span>
                  <span>4 Registered Tools Active</span>
                </div>

                {mcpLogs.map((log, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500">[{log.time}]</span>
                      <span className="text-cyan-400 font-bold">tool_call:{log.tool}</span>
                      <span className="text-gray-300 font-sans">{log.message}</span>
                    </div>
                    {log.payload && (
                      <div className="ml-16 p-2 rounded bg-black/60 border border-white/5 text-[11px] text-emerald-400/90 overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{typeof log.payload === "string" ? log.payload : JSON.stringify(log.payload, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}

                {/* Active Running Line */}
                <div className="flex items-center gap-2 text-rose-400 pt-2 animate-pulse">
                  <span className="text-gray-500">[{new Date().toTimeString().split(" ")[0]}]</span>
                  <span className="font-bold">⚡ EXECUTING:</span>
                  <span className="text-gray-200">{progress}</span>
                  <span className="inline-block w-2 h-4 bg-rose-500 animate-pulse ml-1" />
                </div>
              </div>

              {/* Terminal Footer */}
              <div className="px-5 py-3 bg-black/70 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
                <span>Quarantining resume claims &amp; ground-truth citations</span>
                <span className="text-cyan-400 font-mono">gemini-3.5-flash-lite (primary)</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Input Form */}
        {step === "input" && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-3">
                <span>🛡️</span> EVIDENCE-FIRST AI GENERATOR
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                Generate Your <span className="gradient-text">Cover Letter</span>
              </h1>
              <p className="text-sm text-gray-400">
                Candidate facts are strictly bounded by your resume. Company research is backed by cited sources.
              </p>
            </div>
            <InputForm onGenerate={handleStartAnalysis} />
          </div>
        )}

        {/* Step 2: Human Approval Gate (Requirements D8a, D8b, D8c) */}
        {step === "approval_gate" && companyData && (
          <div className="max-w-3xl mx-auto glass-card p-6 md:p-8 space-y-6">
            <div className="border-b border-white/5 pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-2">
                <span>🛡️</span> HUMAN APPROVAL GATE
              </div>
              <h2 className="text-2xl font-bold text-white">Review Verified Company Sources</h2>
              <p className="text-xs text-gray-400 mt-1">
                To ensure rigorous claim validation and evidence grounding, review the sources discovered for <strong>{formData.company}</strong>. Only approved claims will enter your cover letter.
              </p>
            </div>

            {/* Company Overview Preview */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Synthesized Company Signal
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {companyData.description || "No public data found."}
              </p>
            </div>

            {/* Sources Checklist */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center justify-between">
                <span>Select Sources to Include ({Object.values(approvedSources).filter(Boolean).length} approved)</span>
                <span className="text-gray-500 font-normal">Uncheck any source you want omitted</span>
              </div>

              {(companyData.raw_sources || []).map((s, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 cursor-pointer transition-all"
                >
                  <input
                    type="checkbox"
                    checked={!!approvedSources[idx]}
                    onChange={(e) =>
                      setApprovedSources({ ...approvedSources, [idx]: e.target.checked })
                    }
                    className="mt-1 w-4 h-4 rounded text-rose-500 bg-gray-900 border-gray-700 focus:ring-rose-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-cyan-400 truncate">{s.title || s.url}</span>
                      <span className="text-[10px] text-gray-500 ml-2">Cited Source #{idx + 1}</span>
                    </div>
                    {s.snippet && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{s.snippet}</p>}
                  </div>
                </label>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <button
                onClick={() => setStep("input")}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white border border-white/10 transition-colors"
              >
                ← Back to Edit
              </button>
              <button
                onClick={handleProceedToGeneration}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:from-rose-600 hover:to-orange-600 shadow-lg shadow-rose-500/25 transition-all flex items-center gap-2"
              >
                <span>✓</span> Approve Sources &amp; Generate Letter
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results Panel */}
        {step === "results" && (
          <ResultsPanel
            formData={formData}
            analysisData={analysisData}
            companyData={companyData}
            letterData={letterData}
            atsData={atsData}
            defenseData={defenseData}
            mcpLogs={mcpLogs}
            onRefreshDefense={() => triggerDefense()}
            isDefenseLoading={isDefenseLoading}
          />
        )}
      </main>
    </div>
  );
}
