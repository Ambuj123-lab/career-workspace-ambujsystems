"use client";

import { useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";

const SAMPLE_RADAR = [
  { dimension: "Technical Alignment", Candidate: 96, Benchmark: 85 },
  { dimension: "System Architecture", Candidate: 92, Benchmark: 80 },
  { dimension: "Tooling & Protocols", Candidate: 98, Benchmark: 82 },
  { dimension: "Quantified Impact", Candidate: 88, Benchmark: 78 },
  { dimension: "Seniority Readiness", Candidate: 90, Benchmark: 82 },
];

const SAMPLE_SKILLS = [
  {
    name: "Agentic AI / AI Agents",
    status: "STRONG MATCH",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    quote:
      '"Architected an Agentic AI workspace using Next.js, FastAPI, and LangGraph, implementing a ReAct agent capable of autonomous reasoning, multi-step tool orchestration"',
    strategy:
      "Framed directly with quantifiable performance metrics to prove authentic day-1 execution capability.",
  },
  {
    name: "Model Context Protocol (MCP)",
    status: "STRONG MATCH",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    quote:
      '"Engineered official Model Context Protocol (MCP) servers using standard stdio transport for autonomous agentic tool orchestration."',
    strategy:
      "Demonstrates rare early-adopter protocol expertise for enterprise agentic integration.",
  },
  {
    name: "Evidence-Grounded RAG",
    status: "STRONG MATCH",
    badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    quote:
      '"Built Agentic Financial Parser processing complex 10-K reports with LangGraph, enforcing strict source citation grounding with zero unverified claims."',
    strategy:
      "Positions candidate as a high-reliability engineer who builds auditable AI systems, not fragile wrappers.",
  },
  {
    name: "FastAPI & Microservices",
    status: "STRONG MATCH",
    badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    quote:
      '"Designed low-latency asynchronous Python API endpoints with Pydantic validation and Redis caching layers."',
    strategy:
      "Anchors full-stack production deployment capabilities alongside model engineering.",
  },
];

const SAMPLE_DEFENSE = [
  {
    id: 1,
    title: "PREDICTIVE CHALLENGE #1",
    question:
      "Your resume indicates professional roles from Jan 2022 to Aug 2024 at British Telecom (2.5 years) and earlier IT roles, but your recent GenAI work is listed as 'Independent GenAI Developer' starting December 2025. How do you reconcile the timeline and enterprise context for '2.5+ years of dedicated experience' in production LLMs?",
    why: "Recruiters and hiring managers spot timeline ambiguities immediately. They will test whether your LLM experience is hands-on production or personal hobby research.",
    defense:
      "Clarify enterprise telecom foundations: at BT, architected backend microservices and telemetry pipelines that now directly inform high-throughput LLM orchestration, while the dedicated LLM production work was shipped through rigorous end-to-end client applications.",
  },
  {
    id: 2,
    title: "PREDICTIVE CHALLENGE #2",
    question:
      "Walk me through the exact state machine design of your 11-Node LangGraph agent. How do you handle state persistence and cyclic routing loops across 11 nodes without hitting recursion limits?",
    why: "Senior technical interviewers will stress-test complex architecture claims. Anyone can build a 2-step chain; 11-node cyclic graphs require explicit recursion depth checks and memory checkpointing.",
    defense:
      "Explain the exact MemorySaver checkpointer implementation, conditional edge guardrails with recursion_limit=25, and deterministic fallback exit nodes if tool convergence stalls.",
  },
];


function RedactedMarker({ chars = "████████", className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-600 border border-zinc-800/80 font-mono text-[10px] tracking-widest select-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] align-middle ${className}`}
      title="[Entity Redacted]"
    >
      {chars}
    </span>
  );
}

export default function LandingHeroPreview() {
  const [activeTab, setActiveTab] = useState("radar"); // radar | defense | company
  const [selectedSkill, setSelectedSkill] = useState(SAMPLE_SKILLS[0]);

  return (
    <div className="w-full max-w-6xl mx-auto mt-10 sm:mt-16 text-left">
      {/* Outer Glow Container */}
      <div className="relative rounded-3xl p-1 bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-[0_0_50px_-12px_rgba(244,63,94,0.18)]">
        <div className="rounded-[22px] bg-[#070b14]/95 border border-white/10 backdrop-blur-2xl overflow-hidden shadow-2xl">
          
          {/* Top Window Bar with Interactive Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 sm:px-5 py-3 sm:py-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs font-mono text-gray-400 ml-2 hidden sm:inline">
                covercraft-engine // verified_inspection_workspace
              </span>
            </div>

            {/* Tab Controls */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs overflow-x-auto max-w-full">
              <button
                onClick={() => setActiveTab("radar")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "radar"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span>⚡</span>
                <span>Evidence Radar</span>
              </button>

              <button
                onClick={() => setActiveTab("defense")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "defense"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span>🛡️</span>
                <span>Adversarial Defense</span>
              </button>

              <button
                onClick={() => setActiveTab("company")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "company"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span>🔍</span>
                <span>Company Approval Gate</span>
              </button>
            </div>
          </div>

          {/* TAB 1: RADAR CHART & SKILL INSPECTOR */}
          {activeTab === "radar" && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      LIVE AUDIT ENGINE
                    </span>
                    <span className="text-xs text-gray-400">Grounded Against Target Senior AI Engineer JD</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Candidate Fit vs. Target JD Benchmark
                  </h3>
                </div>

                <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-400 flex items-center justify-center text-emerald-400 font-black text-xs">
                    ✓
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">100% EVIDENCE COVERAGE</div>
                    <div className="text-[10px] text-emerald-400 font-medium">Zero unsupported claims detected</div>
                  </div>
                </div>
              </div>

              {/* Grid: Radar Chart + Skill Inspector */}
              <div className="grid lg:grid-cols-12 gap-6 items-stretch">
                {/* Left: Recharts Pentagon Radar */}
                <div className="lg:col-span-6 p-2.5 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-center min-h-[290px] sm:min-h-[320px]">
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="52%" data={SAMPLE_RADAR}>
                        <PolarGrid stroke="#374151" strokeDasharray="3 3" />
                        <PolarAngleAxis
                          dataKey="dimension"
                          stroke="#9ca3af"
                          tick={{ fontSize: 9, fill: "#e5e7eb", fontWeight: 600 }}
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4b5563" />
                        <Radar
                          name="Candidate Evidence"
                          dataKey="Candidate"
                          stroke="#f43f5e"
                          fill="#f43f5e"
                          fillOpacity={0.45}
                        />
                        <Radar
                          name="Target JD Benchmark"
                          dataKey="Benchmark"
                          stroke="#38bdf8"
                          fill="#38bdf8"
                          fillOpacity={0.15}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right: Interactive Skill Inspector */}
                <div className="lg:col-span-6 flex flex-col justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                        <span>⚡</span> Interactive Skill Inspector
                      </span>
                      <span className="text-[11px] text-gray-400">Click any skill below to inspect</span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">{selectedSkill.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedSkill.badgeColor}`}>
                        {selectedSkill.status}
                      </span>
                    </div>

                    <div className="mt-3 p-3.5 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                        CANDIDATE RESUME EVIDENCE QUOTE:
                      </div>
                      <p className="text-xs text-gray-300 italic leading-relaxed">
                        {selectedSkill.quote}
                      </p>
                    </div>

                    <div className="mt-3 p-3.5 rounded-xl bg-rose-500/[0.04] border border-rose-500/10">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
                        COVER LETTER STRATEGY:
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {selectedSkill.strategy}
                      </p>
                    </div>
                  </div>

                  {/* Clickable Skill Pills */}
                  <div className="pt-2 border-t border-white/5">
                    <div className="text-[10px] uppercase font-bold text-gray-500 mb-2">
                      VERIFIABLE COMPETENCIES ({SAMPLE_SKILLS.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_SKILLS.map((skill) => (
                        <button
                          key={skill.name}
                          onClick={() => setSelectedSkill(skill)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            selectedSkill.name === skill.name
                              ? "bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20"
                              : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
                          }`}
                        >
                          {skill.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADVERSARIAL INTERVIEW DEFENSE */}
          {activeTab === "defense" && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      ADVERSARIAL DEFENSE HARNESS
                    </span>
                    <span className="text-xs text-gray-400">Predictive Cross-Examination Before Your Interview</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Interview Defense &amp; Claim Verification
                  </h3>
                </div>
                <div className="text-xs text-gray-400 max-w-sm">
                  Rigorous cross-examination predicting questions interviewers will ask to test your letter&apos;s claims.
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {SAMPLE_DEFENSE.map((d) => (
                  <div key={d.id} className="p-3.5 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-rose-400 tracking-wider">
                        {d.title}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        AUDITED
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                      {d.question}
                    </p>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-400">
                      <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                        WHY THE INTERVIEWER WILL CHALLENGE THIS:
                      </span>
                      {d.why}
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/15 text-xs text-emerald-300">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                        RECOMMENDED HIGH-INTEGRITY DEFENSE:
                      </span>
                      {d.defense}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HUMAN APPROVAL GATE */}
          {activeTab === "company" && (
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    HUMAN APPROVAL GATE
                  </span>
                  <span className="text-xs text-gray-400">Evidence Grounding Policy</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Review Verified Company Sources
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  To enforce strict evidence grounding and claim validation, review the sources discovered for target enterprise <RedactedMarker chars="████████" />. Only approved claims enter your cover letter.
                </p>
              </div>

              {/* Synthesized Signal Box */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-rose-400">
                  <span>SYNTHESIZED COMPANY SIGNAL</span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-950 text-zinc-500 border border-zinc-800 font-mono lowercase text-[10px] tracking-wider">entity: <RedactedMarker chars="██████" /></span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  <RedactedMarker chars="████████" /> is a global digital services and solutions provider that fuses deep domain expertise with emerging technology to deliver real-world business impact <span className="text-rose-400 font-mono font-bold">[7]</span>. The company offers proprietary enterprise platforms such as <RedactedMarker chars="████████" />, an intelligent document management system, and <RedactedMarker chars="██████" />, a unified delivery platform <span className="text-rose-400 font-mono font-bold">[4]</span>. Their technological focus spans digital services, artificial intelligence, and product engineering-led solutions.
                </p>
              </div>

              {/* Verified Sources Checkbox list */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-semibold text-gray-300">SELECT SOURCES TO INCLUDE (VERIFIED &amp; APPROVED)</span>
                  <span className="text-[11px] text-gray-500">Uncheck any source you want omitted</span>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 sm:gap-3">
                  <input type="checkbox" defaultChecked className="mt-1 accent-rose-500 rounded" />
                  <div className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-400"><RedactedMarker chars="████████" className="mr-1" /> Jobs &mdash; 128,424 Vacancies in September 2026 &mdash; Naukri.com</span>
                      <span className="text-[10px] text-gray-500 font-mono shrink-0">Cited Source #1</span>
                    </div>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      Title: <RedactedMarker chars="████████" className="mr-1" /> Jobs &mdash; Research company profiles, enterprise AI platform adoption, and technical vacancy requirements.
                    </p>
                  </div>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 sm:gap-3">
                  <input type="checkbox" defaultChecked className="mt-1 accent-rose-500 rounded" />
                  <div className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-400"><RedactedMarker chars="████████" className="mr-1" /> Unified Delivery Platform Whitepaper</span>
                      <span className="text-[10px] text-gray-500 font-mono shrink-0">Cited Source #2</span>
                    </div>
                    <p className="text-gray-400 text-[11px] mt-0.5">
                      Architecture breakdown of proprietary GenAI agent delivery workflows and enterprise governance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
