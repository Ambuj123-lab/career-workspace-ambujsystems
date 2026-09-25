"use client";

import { useState } from "react";
import InputForm from "@/components/generator/InputForm";
import ResultsPanel from "@/components/generator/ResultsPanel";
import AuthButton from "@/components/AuthButton";

export default function GeneratePage() {
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

  // Initial trigger: Runs analysis & company research, then opens human approval gate
  const handleStartAnalysis = async (data) => {
    setFormData(data);
    setStep("researching");
    setError(null);

    try {
      // Step 1: Analyze Job Description & Resume
      setProgress("Analyzing Job Description against Resume...");
      const analysisRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd_text: data.jd, resume_text: data.resume }),
      });
      const analysis = await analysisRes.json();
      if (analysis.error) throw new Error(analysis.error);
      setAnalysisData(analysis);

      // Step 2: Research company via Tavily
      setProgress("Performing real-time web research on " + data.company + "...");
      const researchRes = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: data.company }),
      });
      const company = await researchRes.json();
      setCompanyData(company);

      // Initialize all sources as approved by default
      const initialApproved = {};
      (company.raw_sources || []).forEach((_, idx) => {
        initialApproved[idx] = true;
      });
      setApprovedSources(initialApproved);

      // Pause for Human Approval Gate!
      setStep("approval_gate");
      setProgress("");
    } catch (err) {
      setError(err.message || "Failed during initial analysis");
      setStep("input");
      setProgress("");
    }
  };

  // Human approves verified company facts, triggers generation & interview defense
  const handleProceedToGeneration = async () => {
    setStep("generating");
    setProgress("Synthesizing evidence-grounded cover letter...");

    try {
      // Filter company info based on approved sources
      const filteredSources = (companyData?.raw_sources || []).filter((_, idx) => approvedSources[idx]);
      const approvedCompanyInfo = {
        ...companyData,
        raw_sources: filteredSources,
        description: filteredSources.length > 0 ? companyData.description : "No external company claims approved.",
      };

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

      // Run ATS readiness audit
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

      // Run Interview Defense generation in parallel/background
      triggerDefense(fullText);

      setStep("results");
      setProgress("");
    } catch (err) {
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
    } catch (e) {
      console.error("Defense load failed:", e);
    } finally {
      setIsDefenseLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-gray-100">
      {/* Ambient background glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 glow-rose opacity-40" />
        <div className="absolute inset-0 glow-violet opacity-30" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white font-black text-xs">
              CL
            </div>
            <span className="text-base font-bold">
              Cover<span className="gradient-text-warm">Craft</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <AuthButton />
            {step === "results" && (
              <button
                onClick={() => {
                  setStep("input");
                  setLetterData(null);
                  setAnalysisData(null);
                  setCompanyData(null);
                  setDefenseData(null);
                }}
                className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 border border-white/10 rounded-lg hover:bg-white/5"
              >
                &#8634; New Letter
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

        {/* Loading Spinner */}
        {(step === "researching" || step === "generating") && (
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <div className="text-center p-8 glass-card max-w-md w-full">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full border-3 border-rose-500/30 border-t-rose-500 animate-spin" />
              <p className="text-lg font-semibold text-gray-200 mb-2">{progress}</p>
              <p className="text-xs text-gray-500">Checking resume evidence & verifying sources...</p>
            </div>
          </div>
        )}

        {/* Step 1: Input Form */}
        {step === "input" && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-3">
                <span>🛡️</span> ZERO-HALLUCINATION GENERATOR
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
                <span>👁️</span> HUMAN APPROVAL GATE
              </div>
              <h2 className="text-2xl font-bold text-white">Review Verified Company Sources</h2>
              <p className="text-xs text-gray-400 mt-1">
                To guarantee zero AI hallucinations, review the sources discovered for <strong>{formData.company}</strong>. Only approved claims will enter your cover letter.
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
            onRefreshDefense={() => triggerDefense()}
            isDefenseLoading={isDefenseLoading}
          />
        )}
      </main>
    </div>
  );
}
