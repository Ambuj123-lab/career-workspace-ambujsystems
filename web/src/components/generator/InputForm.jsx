"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

const MAX_JD = 10000;
const MAX_RESUME = 15000;

const SAMPLE_DATA = {
  name: "Ambuj Kumar Tripathi",
  email: "ambuj.tripathi@example.com",
  phone: "+91 9431801363",
  linkedin: "linkedin.com/in/ambuj-tripathi",
  role: "Senior AI Engineer (Agentic Systems)",
  company: "Google DeepMind",
  tone: "confident",
  resume: `Senior AI & Agentic Systems Engineer with 4+ years specializing in Agentic RAG, Model Context Protocol (MCP), and production LLM orchestration.

Key Highlights & Experience:
• Built Agentic Financial Parser processing complex 10-K reports with LangGraph, reducing query hallucination to zero with exact source citation grounding.
• Engineered official Model Context Protocol (MCP) servers supporting Streamable HTTP and stdio transports for autonomous AI tool use.
• Fine-tuned open-source LLMs (Llama 3, Mistral) using QLoRA, achieving 45% inference latency reduction on edge server environments.
• Architected hybrid vector retrieval pipelines (BM25 + Jina v3 MRL dense embeddings) with Cohere reranking, reaching 92% top-3 retrieval precision.
• Technologies: Python, FastAPI, Next.js, LangGraph, Tavily API, MCP SDK, PostgreSQL, Redis, Docker, GCP.`,
  jd: `Google DeepMind is looking for a Senior AI Engineer to join our Agentic Systems team.

Responsibilities:
• Design and implement autonomous agentic workflows and tool-calling infrastructure using MCP.
• Develop grounded retrieval-augmented generation (RAG) systems with strict zero-hallucination guardrails and source verification.
• Optimize LLM inference, embedding latency, and token efficiency for production workloads.
• Build reliable full-stack evaluation and monitoring for agent execution loops.

Qualifications:
• 3+ years experience building production LLM applications, RAG pipelines, or agentic frameworks.
• Deep understanding of Python, modern API protocols (REST, SSE, MCP), and vector search.
• Strong track record of shipping reliable, well-tested AI features with quantifiable impact.`,
};

export default function InputForm({ onGenerate }) {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    linkedin: "",
    role: "",
    company: "",
    resume: "",
    jd: "",
    tone: "professional",
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || session.user.name || "",
        email: prev.email || session.user.email || "",
      }));
    }
  }, [session]);

  const handleFillDemo = () => {
    setForm(SAMPLE_DATA);
  };

  const canSubmit = form.name && form.role && form.company && form.resume && form.jd;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onGenerate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
            {/* Demo Filler Toolbar & Auth */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2">
          {session?.user ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Signed in as <strong className="font-semibold text-emerald-300">{session.user.name || session.user.email}</strong></span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/generate" })}
              id="form-google-signin"
              className="flex items-center gap-2 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-all"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleFillDemo}
          id="fill-demo-data-btn"
          className="text-xs px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-500/10 to-orange-500/10 hover:from-rose-500/20 hover:to-orange-500/20 text-rose-300 border border-rose-500/20 font-semibold transition-all flex items-center gap-1.5 shadow-sm"
        >
          <span>⚡</span> Fill Sample Demo Data
        </button>
      </div>

      {/* Personal Info */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white text-xs font-black">
            1
          </span>
          Your Details
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Full Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ambuj Kumar Tripathi"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Phone
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+91 9431801363"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              LinkedIn URL
            </label>
            <input
              type="text"
              value={form.linkedin}
              onChange={(e) => update("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Target Position */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-xs font-black">
            2
          </span>
          Target Position
        </h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Target Role *
            </label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              placeholder="Senior AI Engineer"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
              Target Company *
            </label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              placeholder="Google DeepMind"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Tone Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Tone</label>
          <div className="flex gap-2">
            {[
              { id: "professional", label: "Professional", desc: "Balanced, executive, respectful" },
              { id: "confident", label: "Confident", desc: "Direct impact, achievement-focused" },
              { id: "conversational", label: "Conversational", desc: "Warm, engaging, storytelling" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => update("tone", t.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                  form.tone === t.id
                    ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                    : "bg-white/[0.02] border-white/5 text-gray-500 hover:text-gray-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Experience / Resume */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white text-xs font-black">
            3
          </span>
          Your Experience *
        </h3>
        <textarea
          rows={6}
          value={form.resume}
          onChange={(e) => update("resume", e.target.value.slice(0, MAX_RESUME))}
          placeholder="Paste your resume, key projects, achievements, and technical experience here..."
          className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all resize-y font-mono text-xs leading-relaxed"
        />
        <div className="flex justify-between items-center mt-2 text-[11px] text-gray-500">
          <span>Paste resume text or key experience points</span>
          <span className={form.resume.length > MAX_RESUME * 0.9 ? "text-amber-400" : ""}>
            {form.resume.length.toLocaleString()} / {MAX_RESUME.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Job Description */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-xs font-black">
            4
          </span>
          Job Description *
        </h3>
        <textarea
          rows={6}
          value={form.jd}
          onChange={(e) => update("jd", e.target.value.slice(0, MAX_JD))}
          placeholder="Paste the target job description here..."
          className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 outline-none transition-all resize-y font-mono text-xs leading-relaxed"
        />
        <div className="flex justify-between items-center mt-2 text-[11px] text-gray-500">
          <span>Full job description for skill matching</span>
          <span className={form.jd.length > MAX_JD * 0.9 ? "text-amber-400" : ""}>
            {form.jd.length.toLocaleString()} / {MAX_JD.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!canSubmit}
        className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 ${
          canSubmit
            ? "bg-gradient-to-r from-rose-500 via-rose-600 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white shadow-xl shadow-rose-500/20 cursor-pointer"
            : "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5"
        }`}
      >
        {canSubmit ? "⚡ Analyze Fit & Research Company" : "Fill in required fields (*)"}
      </button>

      <p className="text-center text-[11px] text-gray-600">
        Your data is processed server-side. Resume is never sent to external search APIs.
      </p>
    </form>
  );
}
