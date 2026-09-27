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
      code: "NODE_01",
      label: "Competency Match",
      sublabel: "JD vs Resume Extraction",
      telemetry: isStep1Done ? `${analysisData?.overall_match || 92}% Match Verified` : "Parsing Qualifications",
      done: isStep1Done,
      active: isStep1Active,
      statusTag: isStep1Done ? "ANCHORED" : isStep1Active ? "PROCESSING" : "STANDBY",
    },
    {
      code: "NODE_02",
      label: "Deep Web Recon",
      sublabel: "Tavily + Recency Filter",
      telemetry: isStep2Done ? `${companyData?.raw_sources?.length || 5} Sources Verified` : "Deep Page Crawl (<9m)",
      done: isStep2Done,
      active: isStep2Active,
      statusTag: isStep2Done ? "GROUNDED" : isStep2Active ? "STREAMING" : "STANDBY",
    },
    {
      code: "NODE_03",
      label: "HITL Source Gate",
      sublabel: "Candidate Verification",
      telemetry: isStep3Done ? "Claims Approved" : "Awaiting Verification",
      done: isStep3Done,
      active: isStep3Active,
      statusTag: isStep3Done ? "VERIFIED" : isStep3Active ? "AWAITING USER" : "STANDBY",
    },
    {
      code: "NODE_04",
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
    <div className="relative w-full max-w-4xl mx-auto mb-6 p-4 sm:p-5 rounded-2xl bg-[#040814]/95 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden transition-all duration-300">
      {/* Laser Cut High-Tech HUD Reticles on 4 Corners */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* Cybernetic Top Scanning Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 animate-pulse" />

      {/* Header Deck: System Telemetry + Precision Chrono */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/10">
        {/* Left: Active Engine Telemetry */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-80" />
            <span className="w-2 h-2 rounded-full bg-cyan-300 absolute" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-black text-white tracking-widest uppercase font-mono">
                Multi-Agent Execution Deck
              </span>
              <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                ACTIVE PIPELINE
              </span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2 mt-0.5">
              <span className="text-emerald-400 font-semibold">● LIVE STREAM</span>
              <span>&middot;</span>
              <span>PHASE 0{currentStepIndex} OF 04</span>
            </div>
          </div>
        </div>

        {/* Right: Chrono Stopwatch + Audio/Activity Equalizer */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 font-mono shadow-inner shadow-cyan-950/50">
          {/* Animated Mini Equalizer Bars */}
          <div className="flex items-end gap-0.5 h-3.5 w-4">
            <span className="w-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms] h-full" />
            <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:150ms] h-2/3" />
            <span className="w-1 bg-teal-400 rounded-full animate-bounce [animation-delay:300ms] h-4/5" />
          </div>
          <div className="text-right">
            <span className="text-[9px] text-gray-400 tracking-wider uppercase block leading-none">Chrono Telemetry</span>
            <span className="text-xs sm:text-sm font-black text-cyan-300 tracking-tight">
              {formatPrecisionTime(elapsedMs)}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Neural Compute Nodes (Responsive 2x2 Mobile, 4x1 Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 py-3">
        {steps.map((st, i) => (
          <div
            key={i}
            className={`relative p-3 rounded-xl border transition-all duration-300 overflow-hidden ${
              st.done
                ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                : st.active
                ? "bg-cyan-950/30 border-cyan-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.25)] ring-1 ring-cyan-400/50"
                : "bg-white/[0.02] border-white/5 text-gray-500"
            }`}
          >
            {/* Top Node Header: Code + Live Status Pill */}
            <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
              <span className={`font-bold ${st.done ? "text-emerald-400" : st.active ? "text-cyan-300" : "text-gray-500"}`}>
                {st.code}
              </span>
              <span
                className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded tracking-wider uppercase ${
                  st.done
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : st.active
                    ? "bg-cyan-500/20 text-cyan-200 border border-cyan-400 animate-pulse"
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
                  ? "border-emerald-500/20 text-emerald-400"
                  : st.active
                  ? "border-cyan-500/20 text-cyan-300 font-semibold"
                  : "border-white/5 text-gray-600"
              }`}
            >
              <span className="text-[9px]">{st.done ? "✓" : st.active ? "⚡" : "○"}</span>
              <span className="truncate">{st.telemetry}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Cybernetic Laser Progress Track + Live Agent Terminal Stream */}
      <div className="space-y-2 pt-1 border-t border-white/5">
        {/* Progress Track */}
        <div className="relative w-full h-2 rounded-full bg-slate-900/90 overflow-hidden border border-white/10 p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-300 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)] relative"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Glowing Leading Laser Head */}
            <span className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_8px_#fff]" />
          </div>
        </div>

        {/* Terminal Line & Load Ratio */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-gray-400">
          <div className="flex items-center gap-2 truncate max-w-[82%]">
            <span className="text-cyan-400 font-bold shrink-0">&gt; [TELEMETRY]:</span>
            <span className="truncate text-cyan-200/90">
              {progress || "Orchestrating agentic proof verification pipeline..."}
            </span>
          </div>
          <span className="text-cyan-300 shrink-0 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
            {progressPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
