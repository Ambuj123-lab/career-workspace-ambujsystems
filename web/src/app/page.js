"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";
import LandingHeroPreview from "@/components/LandingHeroPreview";
import { useSession, signIn } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== AMBIENT BACKGROUND ===== */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 glow-rose" />
        <div className="absolute inset-0 glow-orange" />
        <div className="absolute inset-0 glow-violet" />
      </div>

      {/* ===== NAV ===== */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030712]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md shadow-rose-500/20 shrink-0">
              CL
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight leading-tight">
                Cover<span className="gradient-text-warm">Craft</span> <span className="text-[10px] sm:text-xs font-mono font-medium text-rose-400/90 ml-0.5">AI</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-gray-400 leading-tight">
                built by <a href="https://ambuj-ai-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors underline decoration-dotted underline-offset-2 font-medium">Ambuj Kumar Tripathi</a>
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5">
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
                className="h-6 w-auto"
              />
            </a>

            <Link
              href="/docs"
              className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
            >
              <span>🏛️</span>
              <span>Docs</span>
            </Link>
            <a
              href="https://github.com/Ambuj123-lab"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <AuthButton />
            {status === "authenticated" && session?.user && (
              <Link
                href="/generate"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-xs font-semibold text-white transition-all shadow-md shadow-rose-500/25 flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>⚡</span>
                <span>Open Generator &rarr;</span>
              </Link>
            )}
          </div>

          {/* Mobile Right Controls & Hamburger */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href="https://stats.uptimerobot.com/4tYmSQnuBE?utm_source=status_badge&utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center"
              title="Ambuj's Cloud Environment Live Uptime Status"
            >
              <img
                src="https://badge.uptimerobot.com/psp/6d03dcfe5d5c495465fe9a459d7f778b.svg?style=logo&theme=dark"
                alt="UptimeRobot Status"
                className="h-5 w-auto"
              />
            </a>
            <AuthButton />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300"
              aria-label="Toggle Mobile Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 px-4 py-4 space-y-3 bg-[#030712]/95 backdrop-blur-2xl animate-in slide-in-from-top-2 duration-150">
            <Link
              href="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-cyan-400 hover:bg-white/5 flex items-center gap-2"
            >
              <span>🏛️</span>
              <span>Architecture &amp; Docs</span>
            </Link>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5"
            >
              How It Works
            </a>
            <a
              href="https://github.com/Ambuj123-lab"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center justify-between"
            >
              <span>GitHub Repository</span>
              <span>↗</span>
            </a>
            {status === "authenticated" && session?.user ? (
              <Link
                href="/generate"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-orange-500 text-sm font-semibold text-white shadow-md shadow-rose-500/20"
              >
                Open Generator →
              </Link>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signIn("google", { callbackUrl: "/generate" });
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-sm transition-all shadow-md shadow-white/10 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google &rarr;</span>
              </button>
            )}
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-28">
          {/* Subtle Minimal Small Square Grid Pattern (Original ambient gradients preserved) */}
          <div 
            className="absolute inset-0 pointer-events-none -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_35%,#000_30%,transparent_100%)]" 
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
              <span className="status-dot" />
              <span className="text-xs font-medium text-gray-400 tracking-wide uppercase">
                Evidence-First AI
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6">
              <span className="gradient-text">Evidence-Grounded AI</span>{" "}
              <br className="hidden sm:block" />
              for High-Stakes Career Applications
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              An <span className="text-gray-200 font-medium">engineering-first workspace</span> designed to eliminate generative hallucinations. Every qualification is audited against verified resume quotes, grounded with cited MCP company research, and prepared for adversarial interview defense.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
              {status === "authenticated" && session?.user ? (
                <Link
                  href="/generate"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 sm:px-9 py-4 rounded-xl sm:rounded-2xl bg-white hover:bg-gray-50 text-gray-950 font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.05),0_8px_24px_-4px_rgba(255,255,255,0.12)] border border-white/80 text-center whitespace-nowrap cursor-pointer group"
                >
                  <span className="text-gray-950 text-lg">⚡</span>
                  <span className="tracking-tight">Launch Generator</span>
                  <span className="text-gray-950 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              ) : (
                <button
                  onClick={() => signIn("google", { callbackUrl: "/generate" })}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-9 py-4 rounded-xl sm:rounded-2xl bg-white hover:bg-gray-50 text-gray-950 font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.05),0_8px_24px_-4px_rgba(255,255,255,0.12)] border border-white/80 text-center whitespace-nowrap cursor-pointer group"
                >
                  <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="tracking-tight text-gray-950 font-bold">Sign in with Google</span>
                  <span className="text-gray-400 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                </button>
              )}
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-7 sm:px-8 py-4 rounded-xl sm:rounded-2xl border border-white/15 hover:border-white/30 text-gray-200 hover:text-white font-semibold text-base bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2.5 whitespace-nowrap group shadow-sm active:scale-[0.98]"
              >
                <span>See How It Works</span>
                <span className="text-gray-400 group-hover:translate-y-0.5 transition-transform">&darr;</span>
              </a>
            </div>
          </div>

          {/* Interactive Evidence Engine Showcase */}
          <LandingHeroPreview />
          </div>
        </section>

        {/* ===== TRUST BAR ===== */}
        <section className="border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-4 text-xs sm:text-sm text-gray-400">
            {[
              "6 Production MCP Tools",
              "Outdated News & Stale Tech Filter",
              "Adversarial Overclaim Red-Teamer",
              "In-Line Evidence Citations",
              "Clean Recruiter Export",
              "Human-in-the-Loop Gate"
            ].map((item) => (
              <span key={item} className="flex items-center gap-2 font-medium">
                <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* ===== 3 KILLER FEATURES ===== */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Three Features. <span className="gradient-text-warm">Zero Fluff.</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Every feature earns its place. No vanity metrics. No overclaiming.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1: Evidence Job Fit */}
            <div className="faang-card glow-card-rose hover-jiggle p-5 sm:p-8 group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Evidence-Backed Job Fit</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Each skill from the JD matched against your resume with{" "}
                <span className="text-rose-400 font-semibold">actual evidence</span>.
                STRONG_MATCH, PARTIAL, TRANSFERABLE, or MISSING &mdash; with proof.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-gray-800 overflow-hidden"><div className="h-full w-[95%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400" /></div>
                  <span className="text-emerald-400 font-mono w-16">Python</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-gray-800 overflow-hidden"><div className="h-full w-[55%] rounded-full bg-gradient-to-r from-amber-500 to-amber-400" /></div>
                  <span className="text-amber-400 font-mono w-16">Docker</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-gray-800 overflow-hidden"><div className="h-full w-[20%] rounded-full bg-gradient-to-r from-red-500 to-red-400" /></div>
                  <span className="text-red-400 font-mono w-16">K8s</span>
                </div>
              </div>
            </div>

            {/* Feature 2: Multi-Source Recon & Deep Reader */}
            <div className="faang-card glow-card-cyan hover-jiggle p-5 sm:p-8 group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Deep Web Recon &amp; Portal Intel</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Deep 8-page crawl via <span className="text-cyan-400 font-semibold">Tavily Advanced</span> + <span className="text-emerald-400 font-semibold">Jina AI Reader</span>. Live workplace signals across{" "}
                <span className="text-cyan-300 font-semibold">Naukri, AmbitionBox, Indeed &amp; LinkedIn</span> with 3-way categorized evidence.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">3-Way Evidence Distribution</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-cyan-400"><span>🏢</span> Company official sources</span>
                    <span className="text-cyan-300 font-mono text-[10px]">Domain &middot; Careers</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-emerald-400"><span>💼</span> Job portals &amp; reviews</span>
                    <span className="text-emerald-300 font-mono text-[10px]">Naukri &middot; AmbitionBox</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-purple-400"><span>🌐</span> External industry news</span>
                    <span className="text-purple-300 font-mono text-[10px]">TechCrunch &middot; Research</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-2 text-cyan-300"><span>⚡</span> Jina AI Deep Page Reader</span>
                    <span className="text-emerald-400 font-mono text-[10px]">Markdown (No Ads)</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-gray-500">
                  8 pages crawled &middot; Top 5 cited in synthesis
                </div>
              </div>
            </div>

            {/* Feature 3: Interview Defense & Vendor Shield */}
            <div className="faang-card glow-card-violet hover-jiggle p-5 sm:p-8 group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Interview Defense &amp; Vendor Shield</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Audits your vacancy with the <span className="text-violet-400 font-semibold">Job Seeker Reality Check</span>. Flags{" "}
                <span className="text-amber-400 font-semibold">third-party staffing payrolls</span> with verbatim quotes, detects hidden salaries, and generates adversarial interview defenses.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] pb-1 border-b border-white/5">
                  <span className="text-amber-400 font-semibold">⚠️ Staffing Route Detected</span>
                  <span className="text-gray-400 font-mono">Quoted from JD</span>
                </div>
                <div className="text-gray-400 text-[11px] italic truncate">&ldquo;Selected candidate on payroll of XYZ Staffing for client...&rdquo;</div>
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-emerald-400 font-semibold">✓ Interview Defense Ready</span>
                  <span className="text-gray-400 font-mono">Verbatim Evidence</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ARCHITECTURE PIPELINE ===== */}
        <section className="border-y border-white/5 bg-white/[0.01] py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Built Different. <span className="gradient-text">Architecturally.</span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Not a prompt wrapper. A full evidence pipeline with MCP Server, web search grounding, and claim validation.
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-3 max-w-4xl mx-auto">
              {[
                { step: "1", label: "Your Resume + JD", color: "from-gray-500 to-gray-600", desc: "Regex PII stripping" },
                { step: "2", label: "MCP: JD Analyzer", color: "from-rose-500 to-orange-500", desc: "Skill evidence matching" },
                { step: "3", label: "MCP: Recon & Filter", color: "from-cyan-500 to-blue-500", desc: "Tavily + Stale Tech Filter" },
                { step: "4", label: "Human Approval", color: "from-emerald-500 to-teal-500", desc: "Candidate audits sources" },
                { step: "5", label: "Synthesis & Red-Team", color: "from-violet-500 to-purple-500", desc: "Overclaim veracity check" },
              ].map((item) => (
                <div key={item.step} className="glass-card p-5 text-center group hover:scale-105 transition-transform">
                  <div className={`w-10 h-10 mx-auto rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-black text-sm mb-3`}>
                    {item.step}
                  </div>
                  <div className="text-sm font-bold mb-1">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 justify-center mt-12">
              {["Next.js 15", "Gemini 2.5 Flash", "6 MCP Tools", "Tavily Advanced", "Jina Reader", "Overclaim Red-Teamer", "Stale Tech Filter", "Recharts", "Tailwind CSS", "Vercel Edge"].map((tech) => (
                <span key={tech} className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-gray-400">{tech}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ===== GUARDRAILS ===== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Security & <span className="gradient-text-warm">Trust Guardrails</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">Built for professional integrity. Not a toy.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "⚔️", title: "Adversarial Overclaim Red-Teamer", desc: "Audits draft senior verbs against actual resume facts. Flags and safely adjusts unbacked assertions to prevent interview defense failure.", glow: "glow-card-rose" },
              { icon: "⏳", title: "Outdated News & Stale Tech Filter", desc: "Strict recency filter: <9 months for company initiatives, <18 months for tech stack. Suppresses obsolete 2022-2023 articles or tags them as [Historical Context].", glow: "glow-card-amber" },
              { icon: "📑", title: "Dual-Mode Citations & Clean Export", desc: "Interactive [Resume Anchor] and [Source] badges for candidate verification, automatically stripped for clean recruiter export.", glow: "glow-card-cyan" },
              { icon: "⏱️", title: "Live State Machine Tracker", desc: "4-phase execution tracker with live millisecond elapsed timer and dynamic MCP execution status readout.", glow: "glow-card-violet" },
              { icon: "🛡️", title: "Deterministic PII Protection", desc: "Resume data stripped of emails, phone numbers, and addresses via regex before any external web search or research call.", glow: "glow-card-emerald" },
              { icon: "🔒", title: "Server-Side Zero-Leak Keys", desc: "All API keys stored strictly server-side in environment variables. Browser client never communicates with LLM APIs directly.", glow: "glow-card-cyan" },
              { icon: "🧪", title: "Claim Ledger Validation", desc: "Every extracted company claim checked against web search sources via evidence validator. Unsupported claims marked UNSUPPORTED.", glow: "glow-card-violet" },
              { icon: "🚫", title: "Prompt Injection Defense", desc: "JD and resume treated as untrusted data. Adversarial prompt injection attacks detected and neutralized before model reasoning.", glow: "glow-card-rose" },
              { icon: "✋", title: "Human-in-the-Loop Gate", desc: "Company research findings require explicit human review and approval before inclusion in the final synthesis. AI never auto-injects.", glow: "glow-card-emerald" },
            ].map((item) => (
              <div key={item.title} className={`faang-card ${item.glow} hover-jiggle p-5 cursor-default`}>
                <div className="text-2xl mb-3">{item.icon}</div>
                <div className="text-sm font-bold mb-1 text-white">{item.title}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== CREATOR & ENGINEERING SPOTLIGHT ===== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
          <div className="p-5 sm:p-12 rounded-3xl bg-[#080d1a] border border-white/10 backdrop-blur-xl relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Creator Identity & UptimeRobot Feature */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide uppercase">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Featured by UptimeRobot &middot; Global Community Spotlight</span>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Architected by Ambuj Kumar Tripathi
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 font-mono">
                    Independent GenAI Engineer &middot; Ex-British Telecom Automation &middot; Gorakhpur, India
                  </p>
                </div>

                <blockquote className="p-4 rounded-xl bg-black/40 border-l-2 border-emerald-400 text-xs sm:text-sm text-gray-300 italic leading-relaxed">
                  &ldquo;The LLM is the least reliable part of your entire stack. That is why CoverCraft was engineered with deterministic ATS keyword math, circuit breakers, and MCP tool verification instead of trusting raw generative models.&rdquo;
                </blockquote>

                <p className="text-xs text-gray-400 leading-relaxed">
                  CoverCraft was developed as an open-source, evidence-grounded alternative to superficial AI wrappers. Ambuj&apos;s architectural work on production GenAI reliability, agentic RAG workflows, and multi-stage verification has been officially featured in UptimeRobot&apos;s global engineering spotlight.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href="https://uptimerobot.com/blog/community-spotlight-ambuj-kumar-tripathi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                  >
                    <span>Read UptimeRobot Feature Article</span>
                    <span>↗</span>
                  </a>
                  <a
                    href="https://github.com/Ambuj123-lab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-semibold transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    <span>GitHub Profile</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/ambuj-tripathi-042b4a118/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-semibold transition-colors"
                  >
                    <span>LinkedIn</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Live Ecosystem Stats & Badges */}
              <div className="lg:col-span-5 space-y-3">
                <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Ecosystem &amp; Featured Projects
                  </div>
                  <div className="space-y-2.5">
                    <a
                      href="https://github.com/Ambuj123-lab/agentic-rag-financial-parser"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-xl faang-card glow-card-emerald hover-jiggle group transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-emerald-400">
                        <span>Agentic Financial Parser</span>
                        <span>↗</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                        Featured in UptimeRobot Spotlight. Multi-agent hybrid RAG system designed for complex Indian financial &amp; tax circulars.
                      </p>
                    </a>

                    <a
                      href="https://ambuj-ai-portfolio.vercel.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-xl faang-card glow-card-cyan hover-jiggle group transition-all"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-cyan-400">
                        <span>Personal AI Portfolio</span>
                        <span>↗</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                        Production micro-frontends, LLM evals, agentic workflows, and live interactive AI demonstrations.
                      </p>
                    </a>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </section>

        {/* ===== INTEGRITY & NO-HYPE DISCLAIMER ===== */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="p-5 sm:p-10 rounded-3xl faang-card glow-card-amber backdrop-blur-xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                  <span>⚖️</span>
                  <span>Engineering Integrity &amp; Transparency Disclaimer</span>
                </div>
                <span className="text-xs font-mono text-gray-400">Zero Commercial Charges &middot; No Snake-Oil Claims</span>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Column 1: Zero Service Charge */}
                <div className="space-y-2 p-4 sm:p-5 rounded-2xl faang-card glow-card-emerald hover-jiggle cursor-default">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <span className="text-emerald-400 font-mono">01.</span>
                    <span>100% Free &middot; Zero Service Fees</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    This platform charges <span className="text-gray-200 font-semibold">$0.00</span>. There are no paid tier upsells, no monthly subscription traps, and no credit card required. Developed strictly as public AI infrastructure by Ambuj Kumar Tripathi.
                  </p>
                </div>

                {/* Column 2: Anti-Hype on ATS Ranking */}
                <div className="space-y-2 p-4 sm:p-5 rounded-2xl faang-card glow-card-amber hover-jiggle cursor-default">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <span className="text-amber-400 font-mono">02.</span>
                    <span>No "ATS Ranking" Snake-Oil</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    We make <span className="text-gray-200 font-semibold">zero false claims</span> about &ldquo;ranking your CV #1 on ATS&rdquo; or &ldquo;gaming recruitment algorithms.&rdquo; Anyone selling &ldquo;guaranteed interviews&rdquo; is peddling snake-oil. Hiring decisions are made by humans based on real engineering merit.
                  </p>
                </div>

                {/* Column 3: What It Actually Does */}
                <div className="space-y-2 p-4 sm:p-5 rounded-2xl faang-card glow-card-cyan hover-jiggle cursor-default">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <span className="text-cyan-400 font-mono">03.</span>
                    <span>What We Actually Deliver</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Pure, honest, evidence-grounded writing assistance. We analyze the job description, cross-reference your actual resume, research real company developments with Tavily, and prepare you for adversarial interview questions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="p-6 sm:p-12 md:p-16 rounded-2xl sm:rounded-3xl bg-[#050814]/90 border border-white/10 backdrop-blur-2xl text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/8 via-transparent to-violet-500/8 pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-3 sm:mb-4">
                Ready to Write Letters That <span className="gradient-text">Mean Something</span>?
              </h2>
              <p className="text-sm sm:text-base text-gray-400 max-w-lg mx-auto mb-3 leading-relaxed">
                See the evidence before the letter. Every skill matched. Every company claim cited. Every interview question predicted.
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">Sign in with Google to get started &mdash; keeps your data secure and rate-limited.</p>
              {status === "authenticated" && session?.user ? (
                <Link
                  href="/generate"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 sm:px-10 sm:py-4.5 rounded-xl sm:rounded-2xl bg-white hover:bg-gray-50 text-gray-950 font-bold text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.05),0_8px_24px_-4px_rgba(255,255,255,0.12)] border border-white/80 whitespace-nowrap cursor-pointer group"
                >
                  <span className="text-gray-950 text-lg">⚡</span>
                  <span>Launch Generator</span>
                  <span className="text-gray-950 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              ) : (
                <button
                  onClick={() => signIn("google", { callbackUrl: "/generate" })}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 sm:px-10 sm:py-4.5 rounded-xl sm:rounded-2xl bg-white hover:bg-gray-50 text-gray-950 font-bold text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.05),0_8px_24px_-4px_rgba(255,255,255,0.12)] border border-white/80 whitespace-nowrap cursor-pointer group"
                >
                  <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span className="tracking-tight text-gray-950 font-bold">Sign in with Google</span>
                  <span className="text-gray-400 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ===== FAT FOOTER ===== */}
      <footer className="border-t border-white/5 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
            {/* Col 1 & 2: Brand & Mission */}
            <div className="sm:col-span-2 lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-rose-500/20 shrink-0">
                  CL
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-tight leading-tight">
                    Cover<span className="gradient-text-warm">Craft</span> AI
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    Engineered by <a href="https://ambuj-ai-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:underline">Ambuj Kumar Tripathi</a>
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                Evidence-grounded AI career workspace. Powered by Gemini, grounded in Tavily deep web search, verified via Python MCP stdio tools. Every claim traceable, every source cited.
              </p>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Systems Operational &middot; Production Ready</span>
              </div>
            </div>

            {/* Col 3: Product */}
            <div>
              <h4 className="text-xs font-bold text-gray-300 mb-4 uppercase tracking-wider font-mono">Product</h4>
              <ul className="space-y-2.5">
                <li>
                  {status === "authenticated" && session?.user ? (
                    <Link href="/generate" className="text-sm text-gray-400 hover:text-white transition-colors">Generate Letter</Link>
                  ) : (
                    <button onClick={() => signIn("google", { callbackUrl: "/generate" })} className="text-sm text-gray-400 hover:text-white transition-colors text-left cursor-pointer">Generate Letter</button>
                  )}
                </li>
                <li><Link href="/docs" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">Architecture Docs</Link></li>
                <li><a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><span className="text-sm text-gray-500">JD Analyzer</span></li>
                <li><span className="text-sm text-gray-500">Company Intelligence</span></li>
                <li><span className="text-sm text-gray-500">Adversarial Defense</span></li>
              </ul>
            </div>

            {/* Col 4: Tech Stack */}
            <div>
              <h4 className="text-xs font-bold text-gray-300 mb-4 uppercase tracking-wider font-mono">Tech Stack</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><span>Next.js 15 &middot; Turbopack</span></li>
                <li><span>Python 3.11 MCP Server</span></li>
                <li><span>Gemini 3.5 &amp; 3.8 Flash</span></li>
                <li><span>Tavily Deep Search API</span></li>
                <li><span>Recharts Telemetry</span></li>
                <li><span>Tailwind CSS</span></li>
              </ul>
            </div>

            {/* Col 5: Builder */}
            <div>
              <h4 className="text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider font-mono">Builder</h4>
              <div className="mb-3 text-xs font-semibold text-rose-400 font-mono">
                Ambuj Kumar Tripathi
              </div>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="https://uptimerobot.com/blog/community-spotlight-ambuj-kumar-tripathi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 font-semibold"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>UptimeRobot Spotlight</span>
                    <svg className="w-3 h-3 text-emerald-400 shrink-0 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                  </a>
                </li>
                <li>
                  <a href="https://github.com/Ambuj123-lab" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                    <span>GitHub</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.linkedin.com/in/ambuj-tripathi-042b4a118/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    <span>LinkedIn</span>
                  </a>
                </li>
                <li>
                  <a href="https://ambuj-ai-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                    <span>Portfolio</span>
                  </a>
                </li>
                <li>
                  <a href="https://huggingface.co/invincibleambuj" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                    <span className="text-base leading-none">🤗</span>
                    <span>Hugging Face</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 bg-[#01040f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3 text-xs">
              <span className="font-semibold text-gray-200">
                &copy; {new Date().getFullYear()} Ambuj Kumar Tripathi. All rights reserved.
              </span>
              <span className="hidden sm:inline text-gray-600">&middot;</span>
              <span className="text-gray-400">
                Evidence-Grounded AI &middot; MCP Stdio Architecture
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs text-gray-500 font-mono">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />Powered by Gemini AI</span>
              <span>&middot;</span>
              <span>MCP Server</span>
              <span>&middot;</span>
              <span>Deployed on Vercel</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ===== BACK TO TOP FLOATING BUTTON ===== */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        title="Scroll back to top"
        className={`fixed bottom-6 right-6 z-40 p-3 sm:p-3.5 rounded-2xl bg-[#0b1021]/90 hover:bg-[#151c38] text-white border border-white/15 hover:border-rose-500/50 shadow-2xl shadow-black/80 backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 group cursor-pointer ${
          showScrollTop
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="relative flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-300 group-hover:text-rose-400 transition-colors transform group-hover:-translate-y-0.5 duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </div>
      </button>
    </div>
  );
}
