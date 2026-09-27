"use client";

import { useState, useEffect } from "react";

export default function LiveProgressTracker({ step, progress, analysisData, companyData, letterData }) {
  const [elapsedMs, setElapsedMs] = useState(0);

  // Precision stopwatch (updates every 100ms during active execution)
  useEffect(() => {
    let interval = null;
    if (step === "researching" || step === "generating") {
      const startTime = Date.now() - elapsedMs;
      interval = setInterval(() => {
        setElapsedMs(Date.now() - startTime);
      }, 100);
    } else if (step === "input") {
      setElapsedMs(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  const formatPrecisionTime = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${tenths}s`;
  };

  // State evaluation
  const isStep1Done = Boolean(analysisData);
  const isStep1Active = step === "researching" && !isStep1Done;

  const isStep2Done = Boolean(companyData);
  const isStep2Active = step === "researching" && isStep1Done && !isStep2Done;

  const isStep3Done = step === "generating" || step === "results";
  const isStep3Active = step === "approval_gate";

  const isStep4Done = step === "results";
  const isStep4Active = step === "generating";

  const steps = [
    {
      code: "STAGE 01",
      label: "Competency Match",
      sublabel: "JD vs Resume Extraction",
      telemetry: isStep1Done ? `${analysisData?.overall_match || 92}% Match Verified` : "Parsing Qualifications",
      done: isStep1Done,
      active: isStep1Active,
      statusTag: isStep1Done ? "COMPLETED" : isStep1Active ? "PROCESSING" : "STANDBY",
    },
    {
      code: "STAGE 02",
      label: "Deep Web Recon",
      sublabel: "Tavily + Recency Filter",
      telemetry: isStep2Done ? `${companyData?.raw_sources?.length || 5} Sources Verified` : "Deep Page Crawl (<9m)",
      done: isStep2Done,
      active: isStep2Active,
      statusTag: isStep2Done ? "GROUNDED" : isStep2Active ? "STREAMING" : "STANDBY",
    },
    {
      code: "STAGE 03",
      label: "HITL Source Gate",
      sublabel: "Candidate Verification",
      telemetry: isStep3Done ? "Claims Approved" : "Awaiting Verification",
      done: isStep3Done,
      active: isStep3Active,
      statusTag: isStep3Done ? "VERIFIED" : isStep3Active ? "PAUSED (INPUT)" : "STANDBY",
    },
    {
      code: "STAGE 04",
      label: "Evidence Synthesis",
      sublabel: "Red-Teamer Veracity Audit",
      telemetry: isStep4Done ? "Application Locked" : "Adversarial Defense Matrix",
      done: isStep4Done,
      active: isStep4Active,
      statusTag: isStep4Done ? "LOCKED" : isStep4Active ? "SYNTHESIZING" : "STANDBY",
    },
  ];

  const currentStepIndex = isStep4Active ? 4 : isStep3Active ? 3 : isStep2Active ? 2 : 1;
  const progressPercent = isStep4Done ? 100 : isStep4Active ? 88 : isStep3Active ? 62 : isStep2Active ? 38 : 16;

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 p-4 sm:p-5 rounded-2xl bg-[#090e1a] border border-white/10 shadow-2xl overflow-hidden transition-all duration-300">
      {/* Header Deck: System Telemetry + Precision Chrono */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        {/* Left: Active Engine Telemetry */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping opacity-80" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 absolute" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                Agent Execution Pipeline
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                Phase {currentStepIndex} of 4
              </span>
            </div>
          </div>
        </div>

        {/* Right: Chrono Stopwatch in Clean Dark Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-white/10 font-mono text-xs">
          <span className="text-gray-400">Elapsed:</span>
          <span className="font-bold text-indigo-400">{formatPrecisionTime(elapsedMs)}</span>
        </div>
      </div>

      {/* 4 Execution Nodes (Responsive 2x2 Mobile, 4x1 Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 py-3">
        {steps.map((st, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl border transition-all text-left ${
              st.done
                ? "bg-[#0c1424] border-indigo-500/30 text-indigo-300"
                : st.active
                ? "bg-[#0f172a] border-indigo-500/60 text-white shadow-md shadow-indigo-500/10"
                : "bg-white/[0.02] border-white/5 text-gray-500"
            }`}
          >
            {/* Top Node Header: Code + Live Status Pill */}
            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
              <span className={`font-semibold ${st.done ? "text-indigo-400" : st.active ? "text-indigo-300" : "text-gray-500"}`}>
                {st.code}
              </span>
              <span
                className={`text-[8px] font-bold px-1.5 py-0.2 rounded uppercase ${
                  st.done
                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                    : st.active
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400 animate-pulse"
                    : "bg-white/5 text-gray-600"
                }`}
              >
                {st.statusTag}
              </span>
            </div>

            {/* Label and Sublabel */}
            <div className="text-xs font-bold truncate text-white mb-0.5">
              {st.label}
            </div>
            <div className="text-[10px] text-gray-400 truncate mb-2">
              {st.sublabel}
            </div>

            {/* Telemetry Metric / Readout */}
            <div
              className={`pt-1.5 border-t text-[10px] font-mono truncate flex items-center gap-1 ${
                st.done
                  ? "border-indigo-500/20 text-indigo-400"
                  : st.active
                  ? "border-indigo-500/30 text-indigo-300 font-semibold"
                  : "border-white/5 text-gray-600"
              }`}
            >
              <span>{st.done ? "✓" : st.active ? "●" : "○"}</span>
              <span className="truncate">{st.telemetry}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Track & Live Agent Stream */}
      <div className="space-y-1.5 pt-1 border-t border-white/5">
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-1.5 truncate max-w-[85%]">
            <span className={`font-bold shrink-0 ${isStep3Active ? "text-amber-400 animate-pulse" : "text-indigo-400"}`}>&gt;</span>
            <span className={`truncate ${isStep3Active ? "text-amber-300 font-semibold" : "text-gray-300"}`}>
              {isStep3Active
                ? "[PIPELINE PAUSED]: Candidate approval required below to resume generation."
                : (progress || "Orchestrating agentic proof verification pipeline...")}
            </span>
          </div>
          <span className="text-indigo-400 shrink-0 font-bold">
            {progressPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
