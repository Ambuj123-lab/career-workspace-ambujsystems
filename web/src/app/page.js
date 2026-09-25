"use client";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ===== AMBIENT BACKGROUND ===== */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 glow-rose" />
        <div className="absolute inset-0 glow-orange" />
        <div className="absolute inset-0 glow-violet" />
      </div>

      {/* ===== NAV ===== */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white font-black text-sm">
              CL
            </div>
            <span className="text-lg font-bold tracking-tight">
              Cover<span className="gradient-text-warm">Craft</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
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
              className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:inline"
            >
              GitHub
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:inline"
            >
              How It Works
            </a>
            <AuthButton />
            <a
              href="/generate"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-orange-500 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
              <span className="status-dot" />
              <span className="text-xs font-medium text-gray-400 tracking-wide uppercase">
                Evidence-First AI
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
              Cover Letters That{" "}
              <span className="gradient-text">Prove</span>{" "}
              <br className="hidden md:block" />
              Your Fit
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Not another template filler.{" "}
              <span className="text-gray-300 font-medium">
                Every claim backed by evidence.
              </span>{" "}
              Company research grounded in cited sources. ATS readiness analyzed.
              Interview-defense ready.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/generate"
                className="pulse-glow px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 via-orange-500 to-rose-600 text-white font-bold text-lg hover:scale-[1.02] transition-transform shadow-2xl shadow-rose-500/20"
              >
                Generate Your Letter &rarr;
              </a>
              <Link
                href="/docs"
                className="px-8 py-4 rounded-xl border border-white/10 text-gray-300 font-semibold text-lg hover:bg-white/5 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2"
              >
                <span>🏛️</span>
                <span>Architecture &amp; Docs</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ===== TRUST BAR ===== */}
        <section className="border-y border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm text-gray-500">
            {["Evidence-backed matching", "Source-cited company research", "Claim validation layer", "Human-in-the-loop approval"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                {item}
              </span>
            ))}
          </div>
        </section>

        {/* ===== 3 KILLER FEATURES ===== */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24">
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
            <div className="glass-card p-8 group hover:border-rose-500/20 transition-colors">
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

            {/* Feature 2: Company Intelligence */}
            <div className="glass-card p-8 group hover:border-cyan-500/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Company Intelligence</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Real-time web research via Tavily. Every company claim is{" "}
                <span className="text-cyan-400 font-semibold">linked to its supporting source</span>.
                You approve what enters your application.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Source-Backed Research</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-emerald-400"><span>✓</span> Company overview</span>
                    <span className="text-gray-600 text-[10px]">Official</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-emerald-400"><span>✓</span> Recent development</span>
                    <span className="text-gray-600 text-[10px]">News</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-emerald-400"><span>✓</span> Technology signal</span>
                    <span className="text-gray-600 text-[10px]">Engineering</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-2 text-amber-400"><span>⚠</span> Unsupported claim</span>
                    <span className="text-gray-600 text-[10px]">No source</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-white/5 text-[10px] text-gray-500">
                  4 sources found &middot; 3 claims verified
                </div>
              </div>
            </div>

            {/* Feature 3: Interview Defense */}
            <div className="glass-card p-8 group hover:border-violet-500/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Interview Defense</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Every claim in your letter &rarr; predicted interview question &rarr;{" "}
                <span className="text-violet-400 font-semibold">evidence + suggested answer</span>.
                Don&apos;t just write it. Be ready to defend it.
              </p>
              <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs space-y-2">
                <div className="text-gray-500 italic">&ldquo;Walk me through the 75% vector reduction.&rdquo;</div>
                <div className="text-gray-300"><span className="text-violet-400 font-semibold">Evidence:</span> Jina v3 MRL, 1024&rarr;256 dims, Cohere reranker</div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== ARCHITECTURE PIPELINE ===== */}
        <section className="border-y border-white/5 bg-white/[0.01] py-24">
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
                { step: "1", label: "Your Resume + JD", color: "from-gray-500 to-gray-600", desc: "Paste your data" },
                { step: "2", label: "MCP: JD Analyzer", color: "from-rose-500 to-orange-500", desc: "Evidence matching" },
                { step: "3", label: "MCP: Company Research", color: "from-cyan-500 to-blue-500", desc: "Tavily + validation" },
                { step: "4", label: "Human Approval", color: "from-emerald-500 to-teal-500", desc: "You verify sources" },
                { step: "5", label: "Letter + Defense", color: "from-violet-500 to-purple-500", desc: "Gemini generation" },
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
              {["Next.js", "Gemini AI", "MCP Server", "Tavily Search", "Recharts", "Tailwind CSS", "Vercel"].map((tech) => (
                <span key={tech} className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-gray-400">{tech}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ===== GUARDRAILS ===== */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Security & <span className="gradient-text-warm">Trust Guardrails</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">Built for professional integrity. Not a toy.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { icon: "\ud83d\udee1\ufe0f", title: "PII Protection", desc: "Resume data stripped of PII via regex before any external API call. Never sent to web search." },
              { icon: "\ud83d\udd12", title: "Server-Side Keys", desc: "All API keys stored server-side in environment variables. Browser never contacts external APIs directly." },
              { icon: "\ud83e\uddea", title: "Claim Validation", desc: "Every company claim checked against web search sources via evidence validator. Unsupported claims flagged." },
              { icon: "\ud83d\udeab", title: "Injection Defense", desc: "JD and resume treated as untrusted data. Prompt injection patterns detected and flagged." },
              { icon: "\ud83d\udcca", title: "Output Validation", desc: "LLM JSON responses validated against schemas. Invalid ranges and malformed data rejected." },
              { icon: "\u26a1", title: "Rate Limiting", desc: "IP-based rate limits, max input sizes, generation cooldown. Google OAuth required." },
              { icon: "\ud83d\udc41\ufe0f", title: "Source Transparency", desc: "Every company research claim shows its source URL. User can verify independently." },
              { icon: "\u270b", title: "Human Approval Gate", desc: "Company research requires approval before inclusion in your letter. AI never auto-injects." },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors">
                <div className="text-2xl mb-3">{item.icon}</div>
                <div className="text-sm font-bold mb-1">{item.title}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="glass-card p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 glow-rose opacity-50" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                Ready to Write Letters That <span className="gradient-text">Mean Something</span>?
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-4">
                See the evidence before the letter. Every skill matched. Every company claim cited. Every interview question predicted.
              </p>
              <p className="text-sm text-gray-500 mb-8">Sign in with Google to get started &mdash; keeps your data secure and rate-limited.</p>
              <a href="/generate" className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-rose-600 via-orange-500 to-rose-600 text-white font-bold text-lg hover:scale-[1.02] transition-transform shadow-2xl shadow-rose-500/20 pulse-glow">
                Generate Your First Letter &rarr;
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FAT FOOTER ===== */}
      <footer className="border-t border-white/5 bg-[#020617]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
            <div className="col-span-2 md:col-span-4 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white font-black text-sm">CL</div>
                <span className="text-xl font-bold">Cover<span className="gradient-text-warm">Craft</span> AI</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm mb-6">
                Evidence-grounded AI cover letter generator. Powered by Gemini, grounded in Tavily web search, validated with MCP tools. Every claim traceable. Every source cited.
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="status-dot" /><span>⚠️</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                <li><a href="/generate" className="text-sm text-gray-500 hover:text-white transition-colors">Generate Letter</a></li>
                <li><Link href="/docs" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">Architecture Docs</Link></li>
                <li><a href="#how-it-works" className="text-sm text-gray-500 hover:text-white transition-colors">How It Works</a></li>
                <li><span className="text-sm text-gray-600">JD Analyzer</span></li>
                <li><span className="text-sm text-gray-600">Company Research</span></li>
                <li><span className="text-sm text-gray-600">Interview Defense</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Tech Stack</h4>
              <ul className="space-y-3">
                <li><span className="text-sm text-gray-500">Next.js 15</span></li>
                <li><span className="text-sm text-gray-500">Python MCP Server</span></li>
                <li><span className="text-sm text-gray-500">Gemini AI</span></li>
                <li><span className="text-sm text-gray-500">Tavily Search</span></li>
                <li><span className="text-sm text-gray-500">Recharts</span></li>
                <li><span className="text-sm text-gray-500">Tailwind CSS</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Builder</h4>
              <ul className="space-y-3">
                <li><a href="https://github.com/Ambuj123-lab" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  GitHub</a></li>
                <li><a href="https://www.linkedin.com/in/ambuj-tripathi-042b4a118/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn</a></li>
                <li><a href="https://ambuj-ai-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                  Portfolio</a></li>
                <li><a href="https://huggingface.co/invincibleambuj" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1.5">
                  \ud83e\udd17 HuggingFace</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs text-gray-600">
              <span>⚠️</span>
              <span className="hidden md:inline">&middot;</span>
              <span>⚠️</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1.5"><span className="status-dot" />Powered by Gemini AI</span>
              <span>&middot;</span>
              <span>MCP Server</span>
              <span>&middot;</span>
              <span>Deployed on Vercel</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
