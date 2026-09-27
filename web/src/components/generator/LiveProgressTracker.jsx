"use client";

import { useState, useEffect } from "react";

export default function LiveProgressTracker({ step, progress, analysisData, companyData, letterData }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Active elapsed timer while in processing states
  useEffect(() => {
    let interval = null;
    if (step === "researching" || step === "generating") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (step === "input") {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}s`;
  };

  // Determine stage status
  // 1: JD & Resume
  const isStep1Done = Boolean(analysisData);
  const isStep1Active = step === "researching" && !isStep1Done;

  // 2: Company Research
  const isStep2Done = Boolean(companyData);
  const isStep2Active = step === "researching" && isStep1Done && !isStep2Done;

  // 3: Human Approval Gate
  const isStep3Done = step === "generating" || step === "results";
  const isStep3Active = step === "approval_gate";

  // 4: Synthesis & Defense
  const isStep4Done = step === "results";
  const isStep4Active = step === "generating";

  const steps = [
    {
      num: "01",
      label: "Competency Match",
      desc: isStep1Done ? `${analysisData?.overall_match || 90}% Match Found` : "Parsing JD vs Resume",
      done: isStep1Done,
      active: isStep1Active,
    },
    {
      num: "02",
      label: "Company Research",
      desc: isStep2Done ? `${companyData?.raw_sources?.length || 5} Sources Verified` : "Tavily + Jina Scraping",
      done: isStep2Done,
      active: isStep2Active,
    },
    {
      num: "03",
      label: "Human Approval",
      desc: isStep3Done ? "Sources Approved" : "Candidate Verification",
      done: isStep3Done,
      active: isStep3Active,
    },
    {
      num: "04",
      label: "Evidence Synthesis",
      desc: isStep4Done ? "Letter & Defense Ready" : "Gemini + Defense Matrix",
      done: isStep4Done,
      active: isStep4Active,
    },
  ];

  const currentStepIndex = isStep4Active ? 4 : isStep3Active ? 3 : isStep2Active ? 2 : 1;
  const progressPercent = isStep4Done ? 100 : isStep4Active ? 85 : isStep3Active ? 60 : isStep2Active ? 35 : 15;

  return (
    <div className="w-full max-w-3xl mx-auto mb-6 p-4 sm:p-5 rounded-2xl bg-[#080d1a]/95 border border-white/10 backdrop-blur-xl shadow-2xl space-y-4 animate-in fade-in duration-300">
      {/* Top Header: Current Step Title + Elapsed Timer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute" />
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Live Agent Execution Pipeline
            </span>
            <span className="text-[11px] text-gray-400 ml-2 font-mono">
              [Phase {currentStepIndex} of 4]
            </span>
          </div>
        </div>

        {/* Live Elapsed Timer */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-cyan-300">
          <span className="text-gray-400">Elapsed:</span>
          <span className="font-bold text-white">{formatTime(elapsedSeconds)}</span>
        </div>
      </div>

      {/* 4-Step Pipeline Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {steps.map((st, i) => (
          <div
            key={i}
            className={`p-2.5 rounded-xl border transition-all text-left ${
              st.done
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : st.active
                ? "bg-cyan-500/10 border-cyan-400/50 text-white shadow-md shadow-cyan-500/10 animate-pulse"
                : "bg-white/[0.02] border-white/5 text-gray-500"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono font-bold mb-1">
              <span>{st.num}</span>
              {st.done ? (
                <span className="text-emerald-400 text-xs font-bold">✓</span>
              ) : st.active ? (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              ) : null}
            </div>
            <div className="text-xs font-semibold truncate">{st.label}</div>
            <div className="text-[10px] text-gray-400 truncate mt-0.5">{st.desc}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar & Real Current Action */}
      <div className="space-y-1.5 pt-1">
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-rose-500 to-emerald-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span className="truncate max-w-[80%] text-cyan-300/90">
            &gt; {progress || "Processing evidence pipeline..."}
          </span>
          <span className="text-gray-500 shrink-0 font-bold">{progressPercent}%</span>
        </div>
      </div>
    </div>
  );
}
