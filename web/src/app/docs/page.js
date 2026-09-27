"use client";

import { useState, useRef } from "react";
import Link from "next/link";

function ZoomableDiagram({ title, subtitle, badge = "ARCHITECTURE DIAGRAM", children }) {
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 2.5));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.6));
  const resetZoom = () => setScale(1);

  return (
    <div className="p-4 sm:p-6 rounded-2xl faang-card glow-card-aurora space-y-3 relative group">
      {/* Top Header & Zoom Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <span>🏛️</span> {badge}: {title}
          </span>
          {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Zoom Controls Bar */}
        <div className="flex items-center gap-1 self-end sm:self-auto p-1 rounded-xl bg-black/60 border border-white/10 text-xs">
          <button
            onClick={zoomOut}
            title="Zoom Out"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all font-bold text-sm"
          >
            −
          </button>
          <span className="px-2 font-mono text-[11px] text-cyan-300 select-none min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            title="Zoom In"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all font-bold text-sm"
          >
            +
          </button>
          <button
            onClick={resetZoom}
            title="Reset Zoom"
            className="px-2 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-[11px] text-gray-400 hover:text-white transition-all"
          >
            Reset
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            title="Fullscreen Modal"
            className="px-2.5 h-7 flex items-center gap-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-[11px] text-cyan-300 border border-cyan-500/30 transition-all font-medium"
          >
            <span>⛶</span>
            <span className="hidden sm:inline">Expand</span>
          </button>
        </div>
      </div>

      {/* Diagram Container with strict mobile viewport isolation */}
      <div className="w-full max-w-full overflow-x-auto py-3 bg-black/40 rounded-xl border border-white/5 cursor-grab active:cursor-grabbing scrollbar-thin">
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: "top left sm:top center", transition: "transform 0.2s ease-out" }}
          className="w-[740px] max-w-none py-2 px-1"
        >
          {children}
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
        <span>Tip: Use zoom controls above or expand to inspect nodes on mobile/laptop.</span>
        <span className="hidden sm:inline">Vector Scalable SVG</span>
      </div>

      {/* Fullscreen Expand Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col p-4 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="text-rose-400">🏛️</span> {title}
              </h3>
              <p className="text-xs text-gray-400">Fullscreen High-Resolution Architectural Inspection</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/10 text-xs">
                <button
                  onClick={zoomOut}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-200 font-bold"
                >
                  −
                </button>
                <span className="px-2 font-mono text-xs text-cyan-300 min-w-[45px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={zoomIn}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-200 font-bold"
                >
                  +
                </button>
                <button
                  onClick={resetZoom}
                  className="px-2.5 h-8 rounded-lg hover:bg-white/10 text-xs text-gray-300"
                >
                  Reset
                </button>
              </div>

              <button
                onClick={() => setIsFullscreen(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-base transition-all"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
            <div
              style={{ transform: `scale(${scale * 1.2})`, transformOrigin: "center center", transition: "transform 0.15s ease-out" }}
              className="max-w-5xl w-full"
            >
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Interactive Live Formula Calculator state for Chapter 4
  const [calcStrong, setCalcStrong] = useState(5);
  const [calcPartial, setCalcPartial] = useState(1);
  const [calcTransferable, setCalcTransferable] = useState(1);
  const [calcMissing, setCalcMissing] = useState(1);

  // Calculate live score in docs
  const calcTotal = Math.max(1, calcStrong + calcPartial + calcTransferable + calcMissing);
  const calcScore = Math.round(
    ((calcStrong * 1.0 + calcPartial * 0.6 + calcTransferable * 0.4 + calcMissing * 0.0) / calcTotal) * 100
  );

  const navItems = [
    { id: "overview", label: "1. Architectural Vision" },
    { id: "anti-patterns", label: "2. The AI Wrapper Fallacy" },
    { id: "trust-boundaries", label: "3. Context Isolation & Security" },
    { id: "deterministic-math", label: "4. Deterministic Scoring Engine" },
    { id: "company-intelligence", label: "5. Real-Time Web Grounding" },
    { id: "mcp-protocol", label: "6. Model Context Protocol (MCP)" },
    { id: "interview-defense", label: "7. Adversarial Interview Defense" },
    { id: "generative-ui", label: "8. Generative UI Architecture" },
    { id: "code-audit", label: "9. Codebase & File Verification" },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-gray-200 selection:bg-rose-500/30 selection:text-rose-200">
      {/* Ambient background glows */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030712]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300"
              aria-label="Toggle Chapters Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-rose-500/20 shrink-0">
                CL
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight leading-tight">CoverCraft</span>
                <span className="text-[10px] font-mono text-gray-400 leading-tight">built by Ambuj Kumar Tripathi</span>
              </div>
            </Link>
            <span className="text-gray-600 text-sm hidden sm:inline">/</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 hidden sm:inline">
              Docs &amp; Architecture
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live UptimeRobot Status Badge at TOP */}
            <a
              href="https://stats.uptimerobot.com/4tYmSQnuBE?utm_source=status_badge&utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:opacity-90 transition-opacity"
              title="Ambuj's Cloud Environment Live Uptime Status"
            >
              <img
                src="https://badge.uptimerobot.com/psp/6d03dcfe5d5c495465fe9a459d7f778b.svg?style=logo&theme=dark"
                alt="Ambuj's Cloud Environment: Up"
                className="h-4 sm:h-6 w-auto max-w-[90px] sm:max-w-none"
              />
            </a>
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-white transition-colors hidden sm:block"
            >
              Home
            </Link>
            <Link
              href="/generate"
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white text-[11px] sm:text-xs font-semibold shadow-md shadow-rose-500/20 transition-all flex items-center gap-1 shrink-0"
            >
              <span className="hidden sm:inline">Launch App</span>
              <span className="sm:hidden">App</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Slide-out */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-4/5 max-w-xs bg-[#0b0f19] border-r border-white/10 p-5 space-y-4 flex flex-col z-10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Chapters Index</span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <nav className="space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileDrawerOpen(false);
                  }}
                  className={`block px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    activeSection === item.id
                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="pt-3 border-t border-white/5 text-[11px] text-gray-500">
              CoverCraft v2.4 Architecture
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Sidebar (Desktop & Tablet Landscape) */}
        <aside className="lg:col-span-3 sticky top-20 hidden lg:block space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
          <div className="text-[11px] uppercase tracking-wider font-bold text-gray-400 px-3 pb-2 border-b border-white/5">
            Architecture Index
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeSection === item.id
                    ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pt-4 border-t border-white/5 text-[11px] text-gray-500 space-y-1">
            <div>Engine Version: 2.4-Production</div>
            <div>Code Audit: 100% Verifiable</div>
          </div>
        </aside>

        {/* Main Document Body */}
        <main className="lg:col-span-9 space-y-12 sm:space-y-16 min-w-0 max-w-full overflow-hidden">
          {/* Header Banner */}
          <div className="space-y-4 border-b border-white/10 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>PRODUCTION TECHNICAL DOCUMENTATION</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              CoverCraft Architecture: From Naive GenAI to Evidence-Grounded Application Intelligence
            </h1>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-3xl">
              An architectural deep dive into technical honesty, evidence-grounded trust boundaries,
              deterministic application-layer scoring, real-time web grounding, and Model Context Protocol (MCP) orchestration.
            </p>
          </div>

          {/* SECTION 1: Architectural Vision */}
          <section id="overview" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="text-rose-400 font-mono text-sm font-bold">01</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">The High-Level Architectural Vision</h2>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              Standard generative AI tools treat job applications as creative writing exercises. When a candidate uploads their resume and a target job description, conventional tools pass them as raw prompt text to an LLM with instructions like <em>"Write an impressive cover letter highlighting why I am a 95% match."</em>
            </p>

            <p className="text-sm text-gray-300 leading-relaxed">
              In reality, hiring managers, senior engineering reviewers, and automated screening systems evaluate applications through the lens of <strong>verifiable evidence</strong>. CoverCraft was designed from the ground up to replace creative text generation with an <strong>Evidence-Backed Application Intelligence Topology</strong>.
            </p>

            {/* DIAGRAM 1: Zoomable High Level Context & Evidence Isolation Topology */}
            <ZoomableDiagram
              title="Evidence Layer & Isolation Boundary Topology"
              subtitle="Strict Context Pipeline with Quarantined Ingestion"
              badge="DIAGRAM 1"
            >
              <svg viewBox="0 0 880 340" className="w-full font-sans select-none">
                <defs>
                  <linearGradient id="gradInput" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="gradPolicy" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#881337" stopColorOpacity="0.4" />
                    <stop offset="100%" stopColor="#030712" />
                  </linearGradient>
                  <linearGradient id="gradEngine" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#064e3b" stopColorOpacity="0.5" />
                    <stop offset="100%" stopColor="#030712" />
                  </linearGradient>
                  <linearGradient id="gradOutput" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0c4a6e" stopColorOpacity="0.5" />
                    <stop offset="100%" stopColor="#030712" />
                  </linearGradient>
                </defs>

                {/* Level 1: Untrusted Ingestion Layer */}
                <rect x="20" y="20" width="250" height="50" rx="8" fill="url(#gradInput)" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
                <text x="145" y="42" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">Candidate Resume (Raw PDF/DOCX)</text>
                <text x="145" y="58" fill="#94a3b8" fontSize="10" textAnchor="middle">Quarantined · 5MB Limit · Null-Byte Sanitized</text>

                <rect x="315" y="20" width="250" height="50" rx="8" fill="url(#gradInput)" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" />
                <text x="440" y="42" fill="#f43f5e" fontSize="12" fontWeight="bold" textAnchor="middle">Job Description (Raw Text)</text>
                <text x="440" y="58" fill="#94a3b8" fontSize="10" textAnchor="middle">Competency Vector Extractor · 10K Char Cap</text>

                <rect x="610" y="20" width="250" height="50" rx="8" fill="url(#gradInput)" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 3" />
                <text x="735" y="42" fill="#c084fc" fontSize="12" fontWeight="bold" textAnchor="middle">Live Web Search (Tavily Search API)</text>
                <text x="735" y="58" fill="#94a3b8" fontSize="10" textAnchor="middle">Grounding · Official Domains · Recent News</text>

                {/* Connecting Arrows */}
                <path d="M 145 70 L 145 105 L 440 105 L 440 125" fill="none" stroke="#64748b" strokeWidth="1.5" />
                <path d="M 440 70 L 440 125" fill="none" stroke="#64748b" strokeWidth="1.5" />
                <path d="M 735 70 L 735 105 L 440 105 L 440 125" fill="none" stroke="#64748b" strokeWidth="1.5" />

                {/* Level 2: Strict XML Boundary Layer */}
                <rect x="60" y="125" width="760" height="55" rx="10" fill="url(#gradPolicy)" stroke="#f43f5e" strokeWidth="1.5" />
                <text x="440" y="148" fill="#fda4af" fontSize="12" fontWeight="bold" textAnchor="middle">TIER 1: IMMUTABLE SYSTEM INSTRUCTION &amp; STRICT TRUST BOUNDARIES</text>
                <text x="440" y="166" fill="#cbd5e1" fontSize="11" textAnchor="middle">&lt;user_resume&gt; [Evidence Grounding Quarantine] &middot; &lt;job_description&gt; &middot; &lt;verified_web_sources&gt; [Citations Bound]</text>

                {/* Connecting Arrow */}
                <path d="M 440 180 L 440 210" fill="none" stroke="#64748b" strokeWidth="1.5" />

                {/* Level 3: Deterministic Application Scoring Engine */}
                <rect x="60" y="210" width="760" height="50" rx="10" fill="url(#gradEngine)" stroke="#10b981" strokeWidth="1.5" />
                <text x="440" y="232" fill="#6ee7b7" fontSize="12" fontWeight="bold" textAnchor="middle">TIER 2: DETERMINISTIC APPLICATION-LAYER ENGINE (Next.js Edge / Node)</text>
                <text x="440" y="248" fill="#a7f3d0" fontSize="10" textAnchor="middle">Mathematical Weighted Summation: (Strong&times;1.0 + Partial&times;0.6 + Transferable&times;0.4) / Total &middot; Verbatim Quote Verification</text>

                {/* Connecting Arrow */}
                <path d="M 440 260 L 440 285" fill="none" stroke="#64748b" strokeWidth="1.5" />

                {/* Level 4: Output Dossiers */}
                <rect x="40" y="285" width="180" height="42" rx="8" fill="url(#gradOutput)" stroke="#38bdf8" strokeWidth="1" />
                <text x="130" y="311" fill="#bae6fd" fontSize="11" fontWeight="bold" textAnchor="middle">Evidence Cover Letter</text>

                <rect x="250" y="285" width="180" height="42" rx="8" fill="url(#gradOutput)" stroke="#38bdf8" strokeWidth="1" />
                <text x="340" y="311" fill="#bae6fd" fontSize="11" fontWeight="bold" textAnchor="middle">Job Fit Radar &amp; Donut</text>

                <rect x="460" y="285" width="180" height="42" rx="8" fill="url(#gradOutput)" stroke="#38bdf8" strokeWidth="1" />
                <text x="550" y="311" fill="#bae6fd" fontSize="11" fontWeight="bold" textAnchor="middle">4-Card Company Dossier</text>

                <rect x="670" y="285" width="180" height="42" rx="8" fill="url(#gradOutput)" stroke="#38bdf8" strokeWidth="1" />
                <text x="760" y="311" fill="#bae6fd" fontSize="11" fontWeight="bold" textAnchor="middle">Interview Defense Ledger</text>
              </svg>
            </ZoomableDiagram>
          </section>

          {/* SECTION 2: The AI Wrapper Fallacy */}
          <section id="anti-patterns" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="text-rose-400 font-mono text-sm font-bold">02</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">The Naive AI Wrapper Fallacy vs. Enterprise Evidence Architecture</h2>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              When software engineers evaluate generative AI products, the primary question is: <em>"Is this an ungrounded prompt wrapper around an OpenAI or Gemini endpoint, or is there an authentic software and verification architecture?"</em>
            </p>

            {/* Comparison Table */}
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.01]">
              <table className="w-full text-xs text-left min-w-[600px]">
                <thead className="bg-white/5 text-gray-300 uppercase tracking-wider font-semibold border-b border-white/10">
                  <tr>
                    <th className="p-3.5">Architecture Dimension</th>
                    <th className="p-3.5 text-red-400">Typical Naive AI Wrapper</th>
                    <th className="p-3.5 text-emerald-400">CoverCraft Enterprise Architecture</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  <tr>
                    <td className="p-3.5 font-bold text-white">Match Scoring</td>
                    <td className="p-3.5 text-red-300/80">LLM asked to guess a percentage ("Match: 92%"). Non-deterministic, unrepeatable, hallucinates high scores.</td>
                    <td className="p-3.5 text-emerald-300/90 font-medium">Deterministic formula computed in application layer. LLM only categorizes evidence; math is calculated in code.</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-white">Candidate Claims</td>
                    <td className="p-3.5 text-red-300/80">Model invents accomplishments ("Led team of 25", "Built scalable Kubernetes infra") not present in resume.</td>
                    <td className="p-3.5 text-emerald-300/90 font-medium">Strict &lt;user_resume&gt; quarantine. Every claim must have a verbatim quote. Unsupported claims are flagged as HIGH RISK.</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-white">Company Intel</td>
                    <td className="p-3.5 text-red-300/80">Generic flattery ("I admire your innovative culture and passion for excellence"). Stale training data cutoff.</td>
                    <td className="p-3.5 text-emerald-300/90 font-medium">Real-time Tavily search engine integration. 4 structured cards with clickable [1], [2] citation pills to original web sources.</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-white">ATS Audit</td>
                    <td className="p-3.5 text-red-300/80">Claims proprietary ATS score (e.g., "94/100 ATS Score"), which is deceptive since no ATS exposes private scoring algorithms.</td>
                    <td className="p-3.5 text-emerald-300/90 font-medium">Deterministic 6-point heuristic check (keyword density, format parseability, contact presence) with explicit technical disclaimer.</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-white">Tool Transparency</td>
                    <td className="p-3.5 text-red-300/80">Black box opaque spinner. No visibility into system prompts, tool calls, or failure fallbacks.</td>
                    <td className="p-3.5 text-emerald-300/90 font-medium">Model Context Protocol (MCP) stream terminal. 4 registered tools logging execution events with expandable JSON schema payloads.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 3: Context Isolation & Security Boundaries */}
          <section id="trust-boundaries" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="text-rose-400 font-mono text-sm font-bold">03</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Context Isolation, Sanitization &amp; Prompt Security</h2>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              CoverCraft decouples prompt logic into isolated policy files stored in <code className="text-rose-400 bg-white/5 px-1.5 py-0.5 rounded">src/prompts/</code>. The architecture enforces three distinct context layers:
            </p>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Layer 1: Immutable Policy</span>
                <h4 className="text-sm font-bold text-white">System Instructions</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Passed strictly into the LLM's <code className="text-cyan-300">systemInstruction</code> parameter. Developer rules: Anti-flattery, strict evidence requirement, JSON schema enforcement.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Layer 2: Untrusted Data</span>
                <h4 className="text-sm font-bold text-white">XML Boundary Quarantine</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Raw candidate resumes and job descriptions are treated as untrusted inputs. They are wrapped in explicit boundary tags: <code className="text-amber-300">&lt;user_resume&gt;</code> and <code className="text-amber-300">&lt;job_description&gt;</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2 sm:col-span-2 md:col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Layer 3: Schema Validation</span>
                <h4 className="text-sm font-bold text-white">Structured Output Enforcement</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Enforces <code className="text-emerald-300">responseMimeType: "application/json"</code>. Raw unparseable text is rejected, preventing prompt injection bypasses.
                </p>
              </div>
            </div>

            {/* Document Ingestion Engine Details */}
            <div className="p-5 rounded-2xl faang-card glow-card-cyan hover-jiggle space-y-3 cursor-default">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🛡️</span> Document Ingestion &amp; Sanitization Engine (<code className="text-cyan-400 text-xs">/api/parse-resume</code>)
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Before parsing reaches the AI engine, uploaded files pass through a multi-stage security pipeline:
              </p>
              <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-5">
                <li><strong>Strict 5 MB Size Gate:</strong> Files exceeding 5,242,880 bytes are rejected immediately at the HTTP boundary.</li>
                <li><strong>Multi-Format Parser:</strong> Native PDF extraction using <code className="text-cyan-300">pdf-parse</code> on <code className="text-cyan-300">Uint8Array</code> buffers; DOCX extraction using <code className="text-cyan-300">mammoth</code>; raw UTF-8 text decoding for TXT.</li>
                <li><strong>Null-Byte &amp; Control Character Stripping:</strong> Eradicates null bytes (<code className="text-rose-400"> </code>) and malicious control characters that cause buffer exploits or database parse errors.</li>
                <li><strong>Prompt Injection Heuristic Scanner:</strong> Automatically scans for adversarial injection patterns (e.g., <em>"ignore all previous instructions"</em>, <em>"system prompt:"</em>, <em>"&lt;|im_start|&gt;"</em>) and flags suspicious documents with a security warning.</li>
                <li><strong>Character Quotas:</strong> Maximum 15,000 characters for resumes and 10,000 characters for job descriptions to prevent token exhaustion denial-of-service.</li>
              </ul>
            </div>
          </section>

          {/* SECTION 4: Deterministic Scoring Engine */}
          <section id="deterministic-math" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="text-rose-400 font-mono text-sm font-bold">04</span>
              <h2 className="text-lg sm:text-2xl font-bold text-white break-words">Technical Honesty: Deterministic Application-Layer Scoring</h2>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              One of the most critical engineering decisions in CoverCraft is eliminating <strong>Black-Box LLM Score Fabrication</strong>. When an LLM is asked to output an overall fit percentage, it generates an impressionistic, non-reproducible number. CoverCraft removes scoring authority from the LLM entirely.
            </p>

            {/* DIAGRAM 2: Zoomable Deterministic Scoring Engine Flowchart */}
            <ZoomableDiagram
              title="Deterministic Scoring Flowchart"
              subtitle="Categorical Classification to Mathematical Summation"
              badge="DIAGRAM 2"
            >
              <svg viewBox="0 0 880 260" className="w-full font-sans select-none">
                {/* Step 1 */}
                <rect x="20" y="20" width="840" height="40" rx="8" fill="#111827" stroke="#374151" strokeWidth="1" />
                <text x="440" y="44" fill="#f3f4f6" fontSize="12" fontWeight="bold" textAnchor="middle">
                  STEP 1: Target JD Requirements Parsed into Discrete Competencies (N Total)
                </text>

                {/* 4 Classification Boxes */}
                <rect x="20" y="90" width="195" height="70" rx="8" fill="#064e3b" fillOpacity="0.3" stroke="#10b981" strokeWidth="1.5" />
                <text x="117" y="115" fill="#34d399" fontSize="12" fontWeight="bold" textAnchor="middle">STRONG_MATCH</text>
                <text x="117" y="133" fill="#a7f3d0" fontSize="11" textAnchor="middle">Weight: 1.0x</text>
                <text x="117" y="148" fill="#6ee7b7" fontSize="10" textAnchor="middle">Verbatim Resume Quote Required</text>

                <rect x="235" y="90" width="195" height="70" rx="8" fill="#78350f" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="332" y="115" fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle">PARTIAL_MATCH</text>
                <text x="332" y="133" fill="#fde68a" fontSize="11" textAnchor="middle">Weight: 0.6x</text>
                <text x="332" y="148" fill="#fcd34d" fontSize="10" textAnchor="middle">Related Tooling / Tech Stack</text>

                <rect x="450" y="90" width="195" height="70" rx="8" fill="#1e3a8a" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="1.5" />
                <text x="547" y="115" fill="#60a5fa" fontSize="12" fontWeight="bold" textAnchor="middle">TRANSFERABLE</text>
                <text x="547" y="133" fill="#bfdbfe" fontSize="11" textAnchor="middle">Weight: 0.4x</text>
                <text x="547" y="148" fill="#93c5fd" fontSize="10" textAnchor="middle">Foundational Adjacent Competency</text>

                <rect x="665" y="90" width="195" height="70" rx="8" fill="#7f1d1d" fillOpacity="0.3" stroke="#ef4444" strokeWidth="1.5" />
                <text x="762" y="115" fill="#f87171" fontSize="12" fontWeight="bold" textAnchor="middle">MISSING</text>
                <text x="762" y="133" fill="#fecaca" fontSize="11" textAnchor="middle">Weight: 0.0x</text>
                <text x="762" y="148" fill="#fca5a5" fontSize="10" textAnchor="middle">Requirement Honestly Framed as Gap</text>

                {/* Connectors */}
                <path d="M 440 60 L 440 85" fill="none" stroke="#6b7280" strokeWidth="1.5" />

                {/* Step 3: Application Code Math */}
                <rect x="20" y="190" width="840" height="55" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
                <text x="440" y="213" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                  STEP 2: Deterministic Calculation in Application Code (src/app/api/analyze/route.js)
                </text>
                <text x="440" y="232" fill="#bae6fd" fontSize="11" textAnchor="middle">
                  Score = Math.round( ((Strong &times; 1.0) + (Partial &times; 0.6) + (Transferable &times; 0.4) + (Missing &times; 0.0)) / Total &times; 100 )
                </text>
              </svg>
            </ZoomableDiagram>

            {/* Interactive Live Formula Calculator Widget */}
            <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-black/40 to-black/60 border border-cyan-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">⚡</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Interactive Live Calculator Demo: Test the Deterministic Equation
                  </span>
                </div>
                <div className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
                  Calculated Coverage: <strong className="text-emerald-400 text-sm">{calcScore}%</strong> ({calcStrong + calcPartial + calcTransferable}/{calcTotal} Requirements)
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-emerald-400 font-semibold block">Strong (1.0x): {calcStrong}</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={calcStrong}
                    onChange={(e) => setCalcStrong(parseInt(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-amber-400 font-semibold block">Partial (0.6x): {calcPartial}</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={calcPartial}
                    onChange={(e) => setCalcPartial(parseInt(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-blue-400 font-semibold block">Transferable (0.4x): {calcTransferable}</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={calcTransferable}
                    onChange={(e) => setCalcTransferable(parseInt(e.target.value))}
                    className="w-full accent-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-red-400 font-semibold block">Missing (0.0x): {calcMissing}</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={calcMissing}
                    onChange={(e) => setCalcMissing(parseInt(e.target.value))}
                    className="w-full accent-red-400"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-black/60 border border-white/5 font-mono text-[11px] text-gray-300 overflow-x-auto">
                Formula: (({calcStrong} &times; 1.0) + ({calcPartial} &times; 0.6) + ({calcTransferable} &times; 0.4) + ({calcMissing} &times; 0.0)) / {calcTotal} &times; 100 = <strong className="text-emerald-400">{calcScore}%</strong>
              </div>
            </div>
          </section>

          {/* SECTION 5: Real-Time Web Grounding & 4-Card Intelligence */}
          <section id="company-intelligence" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="text-rose-400 font-mono text-sm font-bold">05</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Real-Time Web Grounding &amp; The 4-Card Company Intel Dossier</h2>
            </div>

            <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
              <p>
                Static LLMs suffer from knowledge cutoffs and cannot know a company&apos;s live hiring status, engineering priorities, or workplace reputation in 2026. CoverCraft integrates a deep real-time web retrieval and intelligence pipeline in <code className="text-cyan-400 bg-white/5 px-1.5 py-0.5 rounded">src/app/api/research/route.js</code>.
              </p>

              {/* 3 Highlights Grid */}
              <div className="grid sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-cyan-500/20 space-y-1">
                  <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <span>🌐</span> Tavily 8-Page Live Crawl
                  </div>
                  <p className="text-xs text-gray-400">
                    Deep multi-page crawl targeting company engineering, tech stack, and portal postings.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-emerald-500/20 space-y-1">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>⚡</span> Jina AI Deep Reader
                  </div>
                  <p className="text-xs text-gray-400">
                    High-fidelity markdown scraping via <code className="text-[10px] text-emerald-300">r.jina.ai</code> with zero JavaScript, cookie, or ad bloat.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-amber-500/20 space-y-1">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span>🛡️</span> Vendor &amp; Staffing Shield
                  </div>
                  <p className="text-xs text-gray-400">
                    Detects third-party staffing payrolls (C2H/agencies) with strict verbatim JD quotation proof.
                  </p>
                </div>
              </div>
            </div>

            {/* DIAGRAM 3: Zoomable Real-Time Web Grounding Flowchart */}
            <ZoomableDiagram
              title="Tavily Search & 4-Card Synthesis Flowchart"
              subtitle="Live Grounding to In-Text Interactive Citations"
              badge="DIAGRAM 3"
            >
              <svg viewBox="0 0 880 230" className="w-full font-sans select-none">
                {/* Query */}
                <rect x="20" y="20" width="260" height="50" rx="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                <text x="150" y="42" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">Target Company + Role</text>
                <text x="150" y="58" fill="#94a3b8" fontSize="10" textAnchor="middle">"Google DeepMind AI research 2026"</text>

                {/* Search Engine */}
                <rect x="320" y="20" width="240" height="50" rx="8" fill="#082f49" stroke="#0284c7" strokeWidth="1.5" />
                <text x="440" y="42" fill="#7dd3fc" fontSize="11" fontWeight="bold" textAnchor="middle">Tavily Advanced Search Engine</text>
                <text x="440" y="58" fill="#bae6fd" fontSize="10" textAnchor="middle">Fallback: Gemini Google Grounding</text>

                {/* Filter */}
                <rect x="600" y="20" width="260" height="50" rx="8" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
                <text x="730" y="42" fill="#c7d2fe" fontSize="11" fontWeight="bold" textAnchor="middle">Deduplication &amp; Categorizer</text>
                <text x="730" y="58" fill="#a5b4fc" fontSize="10" textAnchor="middle">Official &middot; Research &middot; News Domains</text>

                {/* Connector */}
                <path d="M 280 45 L 320 45" fill="none" stroke="#64748b" strokeWidth="1.5" />
                <path d="M 560 45 L 600 45" fill="none" stroke="#64748b" strokeWidth="1.5" />
                <path d="M 730 70 L 730 100 L 440 100 L 440 120" fill="none" stroke="#64748b" strokeWidth="1.5" />

                {/* 4 Cards Output */}
                <rect x="20" y="120" width="195" height="85" rx="8" fill="#111827" stroke="#f43f5e" strokeWidth="1" />
                <text x="117" y="142" fill="#fda4af" fontSize="11" fontWeight="bold" textAnchor="middle">CARD 1: SNAPSHOT</text>
                <text x="117" y="160" fill="#94a3b8" fontSize="9" textAnchor="middle">2-3 Sentence Mission Scale</text>
                <text x="117" y="176" fill="#94a3b8" fontSize="9" textAnchor="middle">Tagged Sources Count</text>
                <text x="117" y="192" fill="#f43f5e" fontSize="9" textAnchor="middle">In-Text Citation Markers [1]</text>

                <rect x="235" y="120" width="195" height="85" rx="8" fill="#111827" stroke="#38bdf8" strokeWidth="1" />
                <text x="332" y="142" fill="#7dd3fc" fontSize="11" fontWeight="bold" textAnchor="middle">CARD 2: ROLE SIGNALS</text>
                <text x="332" y="160" fill="#94a3b8" fontSize="9" textAnchor="middle">Technical Capability Areas</text>
                <text x="332" y="176" fill="#94a3b8" fontSize="9" textAnchor="middle">Aligned to Target Role</text>
                <text x="332" y="192" fill="#38bdf8" fontSize="9" textAnchor="middle">"Why this matters" Callout</text>

                <rect x="450" y="120" width="195" height="85" rx="8" fill="#111827" stroke="#f59e0b" strokeWidth="1" />
                <text x="547" y="142" fill="#fde68a" fontSize="11" fontWeight="bold" textAnchor="middle">CARD 3: RECENT SIGNALS</text>
                <text x="547" y="160" fill="#94a3b8" fontSize="9" textAnchor="middle">Latest 2026 Announcements</text>
                <text x="547" y="176" fill="#94a3b8" fontSize="9" textAnchor="middle">arXiv Papers &amp; Launches</text>
                <text x="547" y="192" fill="#f59e0b" fontSize="9" textAnchor="middle">Direct [Open ↗] External Links</text>

                <rect x="665" y="120" width="195" height="85" rx="8" fill="#111827" stroke="#10b981" strokeWidth="1" />
                <text x="762" y="142" fill="#6ee7b7" fontSize="11" fontWeight="bold" textAnchor="middle">CARD 4: CITED SOURCES</text>
                <text x="762" y="160" fill="#94a3b8" fontSize="9" textAnchor="middle">Domain Attribution</text>
                <text x="762" y="176" fill="#94a3b8" fontSize="9" textAnchor="middle">Snippet Verbatim Quotations</text>
                <text x="762" y="192" fill="#10b981" fontSize="9" textAnchor="middle">Interactive Modal Drawer</text>
              </svg>
            </ZoomableDiagram>

            {/* In-Text Interactive Citation Pills */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] text-cyan-400">
                Interactive Citation Engine:
              </span>
              <p className="text-gray-300 leading-relaxed">
                Whenever the model asserts a fact (e.g., <em>"Google DeepMind developed the AMIE multi-agent clinical reasoning system [3]"</em>), the citation token <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] border border-cyan-500/40 font-bold">[3]</span> is rendered as an interactive button. Clicking it opens a floating modal with the exact source title, category, relevance rating, snippet quote, and direct external URL.
              </p>
            </div>
          </section>

          {/* SECTION 6: Model Context Protocol (MCP) */}
          <section id="mcp-protocol" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="text-rose-400 font-mono text-sm font-bold">06</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Model Context Protocol (MCP) &amp; Execution Transparency</h2>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              CoverCraft implements the open <strong>Model Context Protocol (MCP)</strong> standard, exposing an extensible tool server in <code className="text-purple-400 bg-white/5 px-1.5 py-0.5 rounded">mcp-server/server.py</code> and a streamable execution trace terminal in the frontend.
            </p>

            {/* The 4 Registered Tools */}
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { tool: "company_research", desc: "Executes real-time Tavily search queries for company developments and engineering initiatives with verifiable source citations and domain filtering." },
                { tool: "evidence_validator", desc: "Claim Ledger gatekeeper: Quarantines statements inside <user_resume> boundary and validates candidate claims against source data (VERIFIED / PARTIAL / UNSUPPORTED)." },
                { tool: "jd_analyzer", desc: "Evidence-backed JD matching: Extracts required competency vectors from JD and matches each against resume with actual evidence." },
                { tool: "ats_readiness", desc: "Deterministic heuristic audit: Evaluates keyword coverage, skills presence, and length without fake commercial ATS vendor scores." },
              ].map((t, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">{idx + 1}. {t.tool}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 7: Adversarial Interview Defense */}
          <section id="interview-defense" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3">
              <span className="text-rose-400 font-mono text-sm font-bold">07</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Adversarial Interview Defense Harness</h2>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              Writing an impressive cover letter is only half the battle. If a candidate cannot defend the claims during a grueling technical or behavioral interview, the application fails. CoverCraft introduces an <strong>Adversarial Cross-Examination Engine</strong> (<code className="text-rose-400 bg-white/5 px-1.5 py-0.5 rounded">src/prompts/interview-defense.system.js</code>).
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Pre-Emptive Machine Cross-Examination</span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  The model assumes the role of an adversarial senior interviewer interrogating every claim in the generated cover letter. For each potential vulnerability:
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 space-y-1">
                    <span className="font-bold text-red-400">HIGH RISK</span>
                    <p className="text-gray-300">Skills marked as transferable or partial where the candidate lacks direct production tenure.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <span className="font-bold text-amber-400">MEDIUM RISK</span>
                    <p className="text-gray-300">Quantified metrics that an interviewer will probe for architecture details and individual contribution.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <span className="font-bold text-emerald-400">LOW RISK</span>
                    <p className="text-gray-300">Well-established baseline qualifications verified by multiple resume projects.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 8: Generative UI Architecture */}
          <section id="generative-ui" className="space-y-6 scroll-mt-24 border-t border-white/10 pt-8">
            <div className="flex items-center gap-3">
              <span className="text-rose-400 font-mono text-sm font-bold">08</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Generative UI Architecture &amp; Component Hydration</h2>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              Legacy AI applications suffer from the <span className="text-white font-semibold">"Markdown Wall" anti-pattern</span> — returning unstructured text blocks that force users to copy-paste into an external editor. CoverCraft rejects this paradigm by implementing a full <span className="text-rose-400 font-semibold">Generative UI Architecture</span>. Instead of raw prose, the LLM emits structured telemetry payloads that the Next.js frontend dynamically compiles into interactive, stateful React components on the fly.
            </p>

            {/* The 4 Generative UI Primitives */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <span className="p-1 rounded bg-cyan-500/10">01</span>
                  <span>Interactive In-Text Citation Badges</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Footnote tags like <code className="text-cyan-300 font-mono bg-cyan-950/40 px-1 py-0.5 rounded">[1]</code> and <code className="text-cyan-300 font-mono bg-cyan-950/40 px-1 py-0.5 rounded">[2]</code> within the synthesized letter are not plain text. The client-side parser parses regex tokens and mounts clickable interactive badges that trigger an Evidence Drawer displaying domain attribution, publication dates, and verbatim source quotations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-rose-500/30 transition-colors">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <span className="p-1 rounded bg-rose-500/10">02</span>
                  <span>Human-in-the-Loop Approval Gate</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Before synthesis begins, the pipeline renders live curation checkboxes across 4 intelligence cards. Users can inspect extracted Tavily search signals, veto any hallucinated or irrelevant company facts, and dictate exactly what evidence the letter synthesizer is permitted to cite.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-emerald-500/30 transition-colors">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <span className="p-1 rounded bg-emerald-500/10">03</span>
                  <span>Editable Paragraph Accordion &amp; Live PDF Engine</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Generated paragraphs hydrate into individual modular sections with real-time word counting, inline rich-text editing, and instant LaTeX-formatted PDF compilation via <code className="text-emerald-300 font-mono text-[11px]">react-to-print</code>. Candidates can customize tone sentence-by-sentence with zero layout shift.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                  <span className="p-1 rounded bg-purple-500/10">04</span>
                  <span>Collapsible Adversarial Defense Flashcards</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  The interview defense harness generates reactive flashcards equipped with risk tier badges (HIGH, MEDIUM, LOW), recruiter psychological intent analysis, and expandable "Anchored Resume Proof" snippets so candidates can rehearse live interview answers before walking into the room.
                </p>
              </div>
            </div>

            {/* Architecture Pipeline Callout */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-transparent border border-white/10 text-xs text-gray-300 flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <span className="font-bold text-white">Full Stack React 19 Client Hydration:</span> Structured JSON schemas emitted by Gemini &rarr; Client-side state machine (<code className="text-rose-400 font-mono">step: approval_gate &rarr; generating &rarr; results</code>) &rarr; Interactive Generative UI components. Zero page refreshes.
              </div>
            </div>
          </section>

          {/* SECTION 9: Codebase & File Verification */}
          <section id="code-audit" className="space-y-6 scroll-mt-24 border-t border-white/10 pt-8">
            <div className="flex items-center gap-3">
              <span className="text-rose-400 font-mono text-sm font-bold">09</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Codebase Audit &amp; Technical Verification Directory</h2>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              Every system, formula, boundary, and protocol described in this documentation maps directly to production code files in the repository:
            </p>

            <div className="grid sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-rose-400 font-bold">System Prompts:</div>
                <div className="text-gray-300 truncate">src/prompts/cover-letter.system.js</div>
                <div className="text-gray-300 truncate">src/prompts/job-analysis.system.js</div>
                <div className="text-gray-300 truncate">src/prompts/interview-defense.system.js</div>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-cyan-400 font-bold">API Routes &amp; Engine:</div>
                <div className="text-gray-300 truncate">src/app/api/analyze/route.js</div>
                <div className="text-gray-300 truncate">src/app/api/research/route.js</div>
                <div className="text-gray-300 truncate">src/app/api/parse-resume/route.js</div>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-purple-400 font-bold">MCP Protocol Server:</div>
                <div className="text-gray-300 truncate">mcp-server/server.py</div>
                <div className="text-gray-300 truncate">mcp-server/requirements.txt</div>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-emerald-400 font-bold">UI &amp; Visualization Suite:</div>
                <div className="text-gray-300 truncate">src/components/generator/ResultsPanel.jsx</div>
                <div className="text-gray-300 truncate">src/components/generator/InputForm.jsx</div>
              </div>
            </div>

            {/* Architect & Creator Spotlight Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-500/[0.08] via-white/[0.02] to-transparent border border-emerald-500/25 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Architect Spotlight &middot; Featured by UptimeRobot</span>
                </div>
                <a
                  href="https://uptimerobot.com/blog/community-spotlight-ambuj-kumar-tripathi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center gap-1"
                >
                  <span>Read Official Feature Article</span>
                  <span>↗</span>
                </a>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Engineered by Ambuj Kumar Tripathi
                  </h3>
                  <a
                    href="https://stats.uptimerobot.com/4tYmSQnuBE?utm_source=status_badge&utm_medium=referral"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ambuj's Cloud Environment Live Status"
                  >
                    <img
                      src="https://badge.uptimerobot.com/psp/6d03dcfe5d5c495465fe9a459d7f778b.svg?style=logo&theme=dark"
                      alt="Ambuj's Cloud Environment: Up"
                      className="h-5 w-auto"
                    />
                  </a>
                </div>
                <p className="text-xs text-gray-400 font-mono">
                  Independent GenAI Engineer &middot; Ex-British Telecom Automation &middot; Gorakhpur, India
                </p>
              </div>

              <blockquote className="text-xs sm:text-sm text-gray-300 italic border-l-2 border-emerald-400 pl-3 leading-relaxed">
                &ldquo;The LLM is the least reliable part of your entire stack. That is why CoverCraft was engineered with deterministic ATS scoring, circuit breakers, and MCP tool verification instead of trusting raw generative models.&rdquo;
              </blockquote>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1 border-t border-white/5">
                <a href="https://github.com/Ambuj123-lab" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>GitHub: @Ambuj123-lab</span>
                  <span>↗</span>
                </a>
                <span>&middot;</span>
                <a href="https://www.linkedin.com/in/ambuj-tripathi-042b4a118/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>LinkedIn</span>
                  <span>↗</span>
                </a>
                <span>&middot;</span>
                <a href="https://ambuj-ai-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>AI Portfolio</span>
                  <span>↗</span>
                </a>
                <span>&middot;</span>
                <a href="https://github.com/Ambuj123-lab/agentic-rag-financial-parser" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <span>Agentic Financial Parser (Spotlighted Project)</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            {/* Launch CTA */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-rose-500/20 via-orange-500/10 to-transparent border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Experience CoverCraft in Action</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Upload your resume, analyze real job requirements, and inspect the live MCP trace.
                </p>
              </div>
              <Link
                href="/generate"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white text-xs font-bold shadow-lg shadow-rose-500/25 transition-all flex items-center gap-2 shrink-0"
              >
                <span>Launch CoverCraft</span>
                <span>→</span>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
