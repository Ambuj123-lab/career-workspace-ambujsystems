"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";

const MAX_JD = 10000;
const MAX_RESUME = 15000;

const SAMPLE_DATA = {
  name: "Ambuj Kumar Tripathi",
  email: "ambuj.tripathi@example.com",
  github: "https://github.com/Ambuj123-lab",
  linkedin: "linkedin.com/in/ambuj-tripathi",
  role: "Senior AI Engineer (Agentic Systems)",
  company: "Google DeepMind",
  tone: "confident",
  resume: `Senior AI & Agentic Systems Engineer with 4+ years specializing in Agentic RAG, Model Context Protocol (MCP), and production LLM orchestration.

Key Highlights & Experience:
• Built Agentic Financial Parser processing complex 10-K reports with LangGraph, enforcing strict source citation grounding and eliminating unverified claims.
• Engineered official Model Context Protocol (MCP) servers using standard stdio transport for autonomous agentic tool orchestration.
• Fine-tuned open-source LLMs (Llama 3, Mistral) using QLoRA, achieving 45% inference latency reduction on edge server environments.
• Architected hybrid vector retrieval pipelines (BM25 + Jina v3 MRL dense embeddings) with Cohere reranking, reaching 92% top-3 retrieval precision.
• Technologies: Python, FastAPI, Next.js, LangGraph, Tavily API, MCP SDK, PostgreSQL, Redis, Docker, GCP.`,
  jd: `Google DeepMind is looking for a Senior AI Engineer to join our Agentic Systems team.

Responsibilities:
• Design and implement autonomous agentic workflows and tool-calling infrastructure using MCP.
• Develop grounded retrieval-augmented generation (RAG) systems with strict evidence-grounded guardrails and source verification.
• Optimize LLM inference, embedding latency, and token efficiency for production workloads.
• Build reliable full-stack evaluation and monitoring for agent execution loops.

Qualifications:
• 3+ years experience building production LLM applications, RAG pipelines, or agentic frameworks.
• Deep understanding of Python, modern API protocols (REST, SSE, MCP), and vector search.
• Strong track record of shipping reliable, well-tested AI features with quantifiable impact.`,
};

export default function InputForm({ onGenerate }) {
  const { data: session } = useSession();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    github: "",
    linkedin: "",
    role: "",
    company: "",
    resume: "",
    jd: "",
    tone: "professional",
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const [dragActive, setDragActive] = useState(false);

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
    setFileMeta({
      filename: "Ambuj_Tripathi_Resume.pdf",
      size_kb: 142,
      word_count: 850,
      char_count: 5120,
      metadata: {
        format: "PDF",
        clean_security_scan: true,
        sections_detected: ["Work Experience", "Key Projects", "Technical Skills"],
        metrics_count: 5,
      },
    });
    setUploadError(null);
  };

  const processFile = async (file) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);

    // Client-side quick size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds 5MB limit. Please upload a smaller document.");
      setUploading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: data,
      });

      let result;
      try {
        result = await res.json();
      } catch (jsonErr) {
        throw new Error(`Failed to parse server response (${res.status}). Please try pasting text directly or re-uploading.`);
      }

      if (!res.ok || result?.error) {
        throw new Error(result?.error || `Failed to process document (${res.status})`);
      }

      update("resume", result.text);
      setFileMeta(result);

      // Auto-extract candidate contact & profile details from uploaded resume
      if (result.entities) {
        setForm((prev) => ({
          ...prev,
          name: prev.name || result.entities.name || "",
          email: prev.email || result.entities.email || "",
          github: prev.github || result.entities.github || "",
          linkedin: prev.linkedin || result.entities.linkedin || "",
        }));
      }
    } catch (err) {
      setUploadError(err.message || "Failed to process resume file");
    } finally {
      setUploading(false);
    }
  };

    const handleJdChange = (val) => {
    update("jd", val);
    if (val && val.length > 20) {
      setForm((prev) => {
        let newRole = prev.role;
        let newCompany = prev.company;

        if (!newCompany) {
          const compMatch = val.match(/(?:at\s+|company:\s*|welcome to\s+|join\s+)([A-Z][a-zA-Z0-9&.\s]{2,22})/i);
          if (compMatch && compMatch[1]) newCompany = compMatch[1].trim();
        }

        if (!newRole) {
          const roleMatch = val.match(/(?:looking for an?\s+|role:\s*|position:\s*|title:\s*|hiring an?\s+)([A-Z][a-zA-Z0-9\s-]{3,30})/i);
          if (roleMatch && roleMatch[1]) newRole = roleMatch[1].trim();
        }

        return { ...prev, jd: val, role: newRole, company: newCompany };
      });
    }
  };

  const resumeOverLimit = form.resume.length > MAX_RESUME;
  const jdOverLimit = form.jd.length > MAX_JD;
  const canSubmit = form.name && form.role && form.company && form.resume && form.jd && !resumeOverLimit && !jdOverLimit;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onGenerate(form, fileMeta);
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
              className="flex items-center gap-2 text-xs font-semibold text-gray-900 bg-white hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-all shadow-sm whitespace-nowrap"
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

      {/* 1. Personal Info */}
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
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide flex items-center justify-between">
              <span>GitHub Profile</span>
              <span className="text-[10px] text-cyan-400 font-normal font-mono">Auto-Verified by MCP</span>
            </label>
            <input
              type="text"
              value={form.github}
              onChange={(e) => update("github", e.target.value)}
              placeholder="https://github.com/your-username"
              className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all"
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

      {/* 2. Target Position */}
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

      {/* 3. Experience / Resume with Secure File Upload */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white text-xs font-black">
              3
            </span>
            Your Experience / Resume *
          </h3>
          <span className="text-[11px] text-gray-400">PDF, DOCX, TXT (Max 5MB &middot; Single File Only)</span>
        </div>

        {/* Drag & Drop File Upload Box */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 1) {
              setUploadError("Single document only. Multiple files (Ctrl+Click selection) are blocked for security.");
              return;
            }
            processFile(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center faang-card glow-card-emerald hover-jiggle ${
            dragActive
              ? "border-emerald-500 bg-emerald-500/10"
              : fileMeta
              ? "border-emerald-500/40 bg-emerald-500/[0.03]"
              : "border-white/10 hover:border-white/20 bg-white/[0.01]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={false}
            accept=".pdf,.docx,.txt,.md"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 1) {
                setUploadError("Single document only. Multiple files (Ctrl+Click selection) are blocked for security.");
                e.target.value = "";
                return;
              }
              processFile(e.target.files[0]);
              e.target.value = "";
            }}
            className="hidden"
          />

          {uploading ? (
            <div className="py-2 flex flex-col items-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
              <p className="text-xs text-gray-300 font-medium">Parsing &amp; running security scan on document...</p>
            </div>
          ) : fileMeta ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                  {fileMeta.metadata?.format || "DOC"}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{fileMeta.filename}</span>
                    <span className="text-[10px] text-gray-400">({fileMeta.size_kb} KB)</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-0.5 flex flex-wrap gap-2">
                    <span>🛡️ Clean security scan</span>
                    <span>•</span>
                    <span>{fileMeta.word_count?.toLocaleString()} words</span>
                    <span>•</span>
                    <span>{fileMeta.metadata?.sections_detected?.length || 0} sections</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-xs border border-white/10"
                >
                  Change File
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFileMeta(null); update("resume", ""); }}
                  className="px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs border border-red-500/20"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="py-2 flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg mb-1">
                📄
              </div>
              <p className="text-xs font-semibold text-gray-200">
                <span className="text-rose-400 underline">Upload your Resume</span> or drag &amp; drop here
              </p>
              <p className="text-[11px] text-gray-500">
                Supports PDF, DOCX, or TXT · Strictly parsed client/server-side with zero data leakage
              </p>
            </div>
          )}
        </div>

        {uploadError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <span>⚠️</span> {uploadError}
          </div>
        )}

        <div className="relative">
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5 font-medium">
            <span>Or edit / paste resume text directly:</span>
            <span className={form.resume.length > MAX_RESUME ? "text-red-400 font-bold" : form.resume.length > MAX_RESUME * 0.9 ? "text-amber-400 font-semibold" : "text-gray-500"}>
              {form.resume.length.toLocaleString()} / {MAX_RESUME.toLocaleString()} chars ({form.resume.split(/\s+/).filter(Boolean).length} words)
            </span>
          </div>

          <textarea
            rows={6}
            value={form.resume}
            onChange={(e) => update("resume", e.target.value)}
            placeholder="Paste your resume, key projects, achievements, and technical experience here..."
            className={`w-full px-4 py-3 bg-white/[0.04] border rounded-xl text-sm text-white placeholder-gray-600 focus:ring-1 outline-none transition-all resize-y font-mono text-xs leading-relaxed ${
              form.resume.length > MAX_RESUME
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-white/10 focus:border-rose-500/50 focus:ring-rose-500/20"
            }`}
          />
          {form.resume.length > MAX_RESUME && (
            <p className="text-[11px] text-red-400 mt-1">
              ⚠️ Resume exceeds {MAX_RESUME.toLocaleString()} characters. Please trim non-essential items.
            </p>
          )}
        </div>
      </div>

      {/* 4. Job Description */}
      <div className="glass-card p-6 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-black">
              4
            </span>
            Target Job Description *
          </h3>
          <span className={form.jd.length > MAX_JD ? "text-red-400 font-bold text-[11px]" : "text-gray-500 text-[11px]"}>
            {form.jd.length.toLocaleString()} / {MAX_JD.toLocaleString()} chars ({form.jd.split(/\s+/).filter(Boolean).length} words)
          </span>
        </div>

        <textarea
          rows={6}
          value={form.jd}
          onChange={(e) => handleJdChange(e.target.value)}
          placeholder="Paste the target job description here..."
          className={`w-full px-4 py-3 bg-white/[0.04] border rounded-xl text-sm text-white placeholder-gray-600 focus:ring-1 outline-none transition-all resize-y font-mono text-xs leading-relaxed ${
            form.jd.length > MAX_JD
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-white/10 focus:border-rose-500/50 focus:ring-rose-500/20"
          }`}
        />
        {form.jd.length > MAX_JD && (
          <p className="text-[11px] text-red-400">
            ⚠️ Job Description exceeds {MAX_JD.toLocaleString()} characters. Please remove company boilerplate / legal terms.
          </p>
        )}
      </div>

      {/* Submit Action */}
      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          id="analyze-submit-btn"
          className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
            canSubmit
              ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:from-rose-600 hover:to-orange-600 shadow-lg shadow-rose-500/25 cursor-pointer hover:scale-[1.01]"
              : "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
          }`}
        >
          <span>⚡</span>
          <span>Analyze Fit &amp; Research Company</span>
        </button>
      </div>
    </form>
  );
}
