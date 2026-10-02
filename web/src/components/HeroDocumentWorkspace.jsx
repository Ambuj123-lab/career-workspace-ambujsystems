"use client";

import { useState, useEffect, useRef } from "react";

export default function HeroDocumentWorkspace() {
  // 8-Second Cinematic Loop:
  // Phase 0 (0-2s): Idle 3D floating stack
  // Phase 1 (2-3s): Cyan laser scan line sweeps down Evidence Ledger
  // Phase 2 (3-4s): Indicators illuminate on Evidence Ledger & Company Intel
  // Phase 3 (4-5s): Front Cover Letter card glides 6-8px forward in 3D
  // Phase 4 (5-6s): [Resume Evidence] -> [JD Match] -> [Company Source] light up one-by-one
  // Phase 5 (6-7.2s): Green "✓ VERIFIED OUTPUT" seals with emerald glow
  // Phase 6 (7.2-8s): Smooth reset back to resting state
  const [phase, setPhase] = useState(0);
  const [stepSub, setStepSub] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    let t1, t2, t3, t4, t4b, t4c, t5, t6, tReset;

    const runSequence = () => {
      setPhase(0);
      setStepSub(0);

      // 2.0s: Cyan scan line sweeps Evidence Ledger
      t1 = setTimeout(() => {
        setPhase(1);
      }, 2000);

      // 3.0s: Evidence indicators illuminate
      t2 = setTimeout(() => {
        setPhase(2);
      }, 3000);

      // 4.0s: Front card glides forward
      t3 = setTimeout(() => {
        setPhase(3);
      }, 4000);

      // 5.0s: Proof tags on front card light up sequentially
      t4 = setTimeout(() => {
        setPhase(4);
        setStepSub(1); // Resume Evidence
      }, 5000);
      t4b = setTimeout(() => {
        setStepSub(2); // JD Match
      }, 5350);
      t4c = setTimeout(() => {
        setStepSub(3); // Company Source
      }, 5700);

      // 6.0s: Verified Output seals emerald
      t5 = setTimeout(() => {
        setPhase(5);
        setStepSub(4);
      }, 6000);

      // 7.2s: Reset smoothly
      t6 = setTimeout(() => {
        setPhase(6);
      }, 7200);

      // 8.0s: Cycle complete
      tReset = setTimeout(() => {
        setPhase(0);
        setStepSub(0);
      }, 8000);
    };

    runSequence();
    const interval = setInterval(runSequence, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t4b);
      clearTimeout(t4c);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(tReset);
    };
  }, []);

  // Desktop 3D parallax mouse tilt
  const handleMouseMove = (e) => {
    if (!containerRef.current || window.innerWidth < 1024) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    setTilt({ x: x * 4.5, y: y * 3.5 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[550px] h-[510px] sm:h-[535px] mx-auto flex items-center justify-center select-none"
      style={{ perspective: "1400px" }}
    >
      {/* Warm Ambient Backlight Blooms */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/4 w-60 h-60 bg-cyan-500/12 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/4 right-1/4 w-60 h-60 bg-violet-500/12 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 3D Stack Container */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
        style={{
          transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* ============================================================ */}
        {/* BACK CARD 1 (TOP-LEFT): EVIDENCE LEDGER                      */}
        {/* Dark Navy + Cyan Accent (Top 18-20% clearly visible)         */}
        {/* ============================================================ */}
        <div
          className="absolute w-[88%] sm:w-[90%] h-[415px] sm:h-[435px] rounded-xl border border-cyan-500/40 bg-[#040b17] text-cyan-200 p-5 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_24px_rgba(6,182,212,0.2)] transition-all duration-700 ease-out flex flex-col justify-between overflow-hidden"
          style={{
            transform: `translate3d(-34px, -36px, -35px) rotate(-3.5deg) scale(${phase === 1 ? 0.98 : 0.96})`,
            zIndex: 1,
            opacity: phase >= 1 && phase <= 5 ? 0.96 : 0.82,
          }}
        >
          {/* Animated Cyan Laser Scan Line (Sweeps down 2-3s) */}
          <div
            className={`absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none transition-all duration-1000 ease-in-out ${
              phase === 1
                ? "top-[85%] opacity-100 shadow-[0_0_16px_#22d3ee]"
                : "top-[6%] opacity-0"
            }`}
          />

          <div>
            {/* Header: Clearly visible at the top */}
            <div className="flex items-center justify-between pb-2 border-b border-cyan-900/40">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full bg-cyan-400 ${phase === 1 ? "animate-ping" : ""} shadow-[0_0_8px_#06b6d4]`} />
                <span className="text-[11px] font-mono tracking-wider text-cyan-100 uppercase font-bold">
                  EVIDENCE LEDGER
                </span>
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all duration-500 ${
                phase === 1
                  ? "bg-cyan-500/25 text-cyan-100 border-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                  : "bg-cyan-950/80 text-cyan-400 border-cyan-800/60"
              }`}>
                {phase === 1 ? "Scanning..." : "Audited"}
              </span>
            </div>

            {/* Indicators: Strong · Partial · Transferable · Missing (Dimmed, clearly legible in top 20%) */}
            <div className="mt-2.5 flex items-center gap-1.5 text-[9.5px] font-mono">
              <span
                className={`px-2 py-0.5 rounded border transition-all duration-500 ${
                  phase >= 2 && phase <= 5
                    ? "bg-emerald-500/25 text-emerald-300 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.35)] font-bold scale-105"
                    : "bg-cyan-950/70 text-cyan-300/80 border-cyan-800/50"
                }`}
              >
                Strong
              </span>
              <span className="text-cyan-700">&bull;</span>
              <span
                className={`px-2 py-0.5 rounded border transition-all duration-500 ${
                  phase >= 2 && phase <= 5
                    ? "bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.35)] font-bold scale-105"
                    : "bg-cyan-950/70 text-cyan-300/80 border-cyan-800/50"
                }`}
              >
                Partial
              </span>
              <span className="text-cyan-700">&bull;</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 text-cyan-400/80">
                Transferable
              </span>
              <span className="text-cyan-700">&bull;</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/50 text-cyan-400/80">
                Missing
              </span>
            </div>

            {/* Faded Background Artifact Details (Dimmed/Blurred) */}
            <div className="mt-4 space-y-1.5 text-[10px] font-mono opacity-50 blur-[0.3px]">
              <div className="flex items-center justify-between p-1.5 rounded bg-cyan-950/30 border border-cyan-900/30">
                <span>&bull; LangGraph Agentic Workflows</span>
                <span className="text-emerald-400">✓ Verified</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-cyan-950/30 border border-cyan-900/30">
                <span>&bull; FastMCP Server Telemetry</span>
                <span className="text-cyan-300">✓ Grounded</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-cyan-900/30 flex items-center justify-between text-[9.5px] font-mono text-cyan-400/60 opacity-60">
            <span>VERIFICATION ARTIFACT</span>
            <span className="text-emerald-400 font-semibold">Zero Overclaims</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* BACK CARD 2 (TOP-RIGHT): COMPANY INTELLIGENCE                */}
        {/* Dark Navy + Purple Accent (Top 18-20% clearly visible)       */}
        {/* ============================================================ */}
        <div
          className="absolute w-[88%] sm:w-[90%] h-[415px] sm:h-[435px] rounded-xl border border-violet-500/40 bg-[#080718] text-violet-200 p-5 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_24px_rgba(139,92,246,0.2)] transition-all duration-700 ease-out flex flex-col justify-between"
          style={{
            transform: `translate3d(34px, -30px, -45px) rotate(3deg) scale(${phase === 0 ? 0.96 : 0.95})`,
            zIndex: 2,
            opacity: phase >= 2 && phase <= 5 ? 0.95 : 0.80,
          }}
        >
          <div>
            {/* Header: Clearly visible at the top */}
            <div className="flex items-center justify-between pb-2 border-b border-violet-900/40">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_#8b5cf6]" />
                <span className="text-[11px] font-mono tracking-wider text-violet-100 uppercase font-bold">
                  COMPANY INTELLIGENCE
                </span>
              </div>
              <span className="text-[9px] font-mono text-violet-300 bg-violet-950/90 px-2 py-0.5 rounded border border-violet-800/60 font-semibold">
                MCP Grounded
              </span>
            </div>

            {/* Sub-indicators: Architecture · Priorities · Risks · Culture (Dimmed, clearly legible in top 20%) */}
            <div className="mt-2.5 flex items-center gap-1.5 text-[9.5px] font-mono">
              <span className="px-2 py-0.5 rounded bg-violet-950/70 border border-violet-800/50 text-violet-300">
                Architecture
              </span>
              <span className="text-violet-600">&bull;</span>
              <span className="px-2 py-0.5 rounded bg-violet-950/70 border border-violet-800/50 text-violet-300">
                Priorities
              </span>
              <span className="text-violet-600">&bull;</span>
              <span className="px-2 py-0.5 rounded bg-violet-950/70 border border-violet-800/50 text-violet-300">
                Risks
              </span>
              <span className="text-violet-600">&bull;</span>
              <span className="px-2 py-0.5 rounded bg-violet-950/70 border border-violet-800/50 text-violet-300">
                Culture
              </span>
            </div>

            {/* Faded Background Artifact Details (Dimmed/Blurred) */}
            <div className="mt-4 space-y-1.5 text-[10px] font-mono opacity-50 blur-[0.3px]">
              <div className="p-1.5 rounded bg-violet-950/30 border border-violet-900/30 leading-relaxed">
                <div>&bull; Microservices Topology: 12 Nodes</div>
                <div>&bull; Grounded Citations: Live British Telecom Telemetry</div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-violet-900/30 flex items-center justify-between text-[9.5px] font-mono text-violet-400/60 opacity-60">
            <span>SYNTHESIS ARTIFACT</span>
            <span className="text-violet-300 font-semibold">Active Telemetry</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* FRONT CARD: OFFICIAL CANDIDATE DOSSIER                       */}
        {/* The ONLY White Foreground Card (Dominant Hero Output)        */}
        {/* ============================================================ */}
        <div
          className="relative w-[92%] sm:w-[94%] h-[425px] sm:h-[445px] rounded-xl border border-slate-200/90 bg-white text-slate-900 p-5 sm:p-6 shadow-[0_25px_65px_-10px_rgba(0,0,0,0.88),0_0_25px_rgba(245,158,11,0.12)] transition-all duration-700 ease-out flex flex-col justify-between"
          style={{
            // At 4-5s (phase 3 to 5), front card glides 6-8px forward in 3D
            transform: `translate3d(0px, ${phase >= 3 && phase <= 5 ? "-6px" : "0px"}, ${phase >= 3 && phase <= 5 ? "18px" : "0px"})`,
            zIndex: 10,
          }}
        >
          {/* Executive Letterhead */}
          <div>
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold mb-0.5">
                  OFFICIAL CANDIDATE DOSSIER
                </div>
                <div className="text-lg sm:text-[21px] font-black tracking-tight text-slate-950 font-sans">
                  Ambuj Kumar Tripathi
                </div>
                <div className="text-xs sm:text-[13px] font-mono text-cyan-700 font-semibold mt-0.5">
                  GenAI &amp; Agentic AI Engineer
                </div>
              </div>

              {/* Dynamic Verification Seal (Flips green in phase 5) */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] sm:text-[10.5px] font-mono font-bold transition-all duration-500 ${
                  phase === 5
                    ? "bg-emerald-50 text-emerald-800 border-2 border-emerald-500 shadow-md shadow-emerald-500/25 scale-105"
                    : "bg-slate-100 text-slate-500 border border-slate-300"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    phase === 5 ? "bg-emerald-500 animate-pulse" : "bg-cyan-500 animate-pulse"
                  }`}
                />
                <span>{phase === 5 ? "AUDITED · 0 VULNERABILITIES" : "AUDITING CLAIMS..."}</span>
              </div>
            </div>

            {/* Formal Letter Body — Readable, High Contrast (~10% Larger) */}
            <div className="mt-3.5 text-[13.5px] sm:text-[14.5px] text-slate-900 leading-[1.62] font-sans space-y-2">
              <p className="text-slate-700 font-medium">
                Dear Hiring Team,
              </p>
              <p className="text-slate-900 font-normal">
                I architected an enterprise-grade agentic workspace using <span className="font-semibold text-slate-950">Next.js</span>, <span className="font-semibold text-slate-950">FastAPI</span>, and <span className="font-semibold text-slate-950">LangGraph</span>, with claims grounded in <span className="bg-emerald-50 text-emerald-800 font-semibold px-1.5 py-0.5 rounded border border-emerald-200">verified candidate evidence</span>.
              </p>

              {/* Evidence Tags Flow: ZERO Horizontal Scrollbar (Clean Inline Layout) */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2 overflow-hidden">
                <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] sm:text-[11.5px] font-mono text-slate-700 py-0.5">
                  {/* [Resume Evidence] */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded transition-all duration-300 ${
                      stepSub >= 1 || phase === 5
                        ? "bg-amber-100 text-amber-900 font-bold border border-amber-400 shadow-xs scale-105"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {(stepSub >= 1 || phase === 5) && <span className="text-amber-700 font-bold">✓</span>}
                    [Resume Evidence]
                  </span>

                  <span className="text-slate-300 font-bold">&bull;</span>

                  {/* [JD Match] */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded transition-all duration-300 ${
                      stepSub >= 2 || phase === 5
                        ? "bg-cyan-100 text-cyan-900 font-bold border border-cyan-400 shadow-xs scale-105"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {(stepSub >= 2 || phase === 5) && <span className="text-cyan-700 font-bold">✓</span>}
                    [JD Match]
                  </span>

                  <span className="text-slate-300 font-bold">&bull;</span>

                  {/* [Company Source] */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded transition-all duration-300 ${
                      stepSub >= 3 || phase === 5
                        ? "bg-violet-100 text-violet-900 font-bold border border-violet-400 shadow-xs scale-105"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {(stepSub >= 3 || phase === 5) && <span className="text-violet-700 font-bold">✓</span>}
                    [Company Source]
                  </span>
                </div>

                {/* Verified Output Destination Badge (Phase 5 Green Glow) */}
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs sm:text-[12.5px] font-mono font-bold transition-all duration-500 ${
                      phase === 5
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/35 scale-[1.04]"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    <span>&rarr;</span>
                    <span>{phase === 5 ? "✓ VERIFIED OUTPUT" : "VERIFIED OUTPUT"}</span>
                    {phase === 5 && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Letter Footer: Bottom Status (Strictly Single Line, Zero Overflow) */}
          <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs sm:text-[12.5px] font-mono">
            <span className="flex items-center gap-2 text-slate-700 font-semibold">
              <span className={`w-2.5 h-2.5 rounded-full ${phase === 5 ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-emerald-500"}`} />
              M8ven MCP Trust Verified
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 shadow-xs whitespace-nowrap">
              <span>Ready for Recruiter Export</span>
              <span className="text-emerald-600">&rarr;</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
