"use client";

import React from "react";
import {
  Brain,
  Zap,
  CalendarCheck,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  LineChart,
  Layers,
  GraduationCap,
  Cpu,
  Stethoscope,
  Code2,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
}

export function LandingPage({ onGetStarted, onExploreDemo }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-charcoal-950 text-gray-100 selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-charcoal-850">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-electric-cyan p-0.5 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-charcoal-950 rounded-[10px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-brand-200 to-electric-cyan bg-clip-text text-transparent">
            MindVault
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onExploreDemo}
            className="text-xs font-semibold text-gray-300 hover:text-white px-4 py-2 rounded-xl hover:bg-charcoal-800 transition-colors"
          >
            Explore Live Demo
          </button>
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition-all hover:scale-102"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-electric-cyan/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950/80 border border-brand-800/50 text-brand-300 text-xs font-medium mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-electric-cyan" />
            <span>Transform Passive Notes into Permanent Mastery</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight sm:leading-none mb-6">
            Learn today. Remember tomorrow.{" "}
            <span className="bg-gradient-to-r from-brand-400 via-electric-violet to-electric-cyan bg-clip-text text-transparent">
              Master forever.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-400 leading-relaxed mb-10">
            Stop losing 70% of what you learn to the forgetting curve. MindVault pairs dual-mode
            digital notebooks with an automated active-recall scheduler and private AI knowledge retrieval.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-electric-blue hover:from-brand-500 hover:to-electric-blue text-white font-semibold text-sm shadow-xl shadow-brand-600/25 transition-all hover:scale-102 flex items-center justify-center gap-2"
            >
              <span>Create Your Vault Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-700 text-gray-300 hover:text-white font-medium text-sm transition-all"
            >
              Launch Interactive Demo
            </button>
          </div>

          {/* Interactive Preview Mockup */}
          <div className="rounded-2xl border border-charcoal-750 bg-charcoal-900/90 p-4 sm:p-6 shadow-2xl backdrop-blur-xl max-w-4xl mx-auto text-left">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal-800 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-xs text-gray-400 font-mono">mindvault.app/active-recall-drill</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                Interval: +7 Days
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 p-5 rounded-xl bg-charcoal-850 border border-charcoal-800">
                <div className="text-xs uppercase font-bold tracking-wider text-brand-400 mb-2">
                  Active Recall Prompt
                </div>
                <h3 className="text-base font-bold text-white mb-3">
                  Explain the trade-offs between Memoization and Tabulation in Dynamic Programming.
                </h3>
                <div className="p-3 rounded-lg bg-charcoal-900 border border-charcoal-800 text-xs text-gray-300 font-mono mb-4">
                  &gt; Memoization is top-down (recursive with caching); Tabulation is bottom-up (iterative table filling) avoiding call-stack overhead.
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium">Self-Reported Rating:</span>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Remembered Well
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-charcoal-850 border border-charcoal-800 flex flex-col justify-between">
                <div>
                  <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-2">
                    Retention Metric
                  </div>
                  <div className="text-3xl font-black text-white">92.4%</div>
                  <div className="text-xs text-emerald-400 mt-1">Topic Mastery: Strong</div>
                </div>
                <div className="mt-4 pt-4 border-t border-charcoal-800 text-[11px] text-gray-400">
                  Next scheduled revision: <span className="text-white font-medium">7 Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-16 px-6 border-t border-charcoal-850 bg-charcoal-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Built for Every Serious Learner
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              Not limited to coding or school curricula. MindVault empowers anyone who cannot afford to forget.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Engineering & CS", icon: Code2, desc: "Data structures, system design & complex algorithms." },
              { title: "Medical & Life Science", icon: Stethoscope, desc: "Anatomy, pharmacology & disease diagnostics." },
              { title: "Competitive Exams", icon: GraduationCap, desc: "UPSC, GRE, MCAT, GATE & entrance revisions." },
              { title: "AI & Tech Pros", icon: Cpu, desc: "Architectural blueprints, paper readings & frameworks." },
            ].map((persona, i) => {
              const Icon = persona.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-charcoal-850/60 border border-charcoal-800 hover:border-brand-500/40 transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-brand-400 group-hover:text-electric-cyan mb-3 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">{persona.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{persona.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-20 px-6 border-t border-charcoal-850">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              The Science of Long-Term Retention
            </h2>
            <p className="text-sm text-gray-400 max-w-xl mx-auto">
              Engineered according to cognitive psychology principles: active retrieval and spaced intervals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-7 rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-brand-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-950 border border-brand-800/50 flex items-center justify-center text-brand-400 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Active Recall Practice</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Instead of passively re-reading highlighting notes, test your memory. Hide the answers, produce your explanation, and benchmark against original notes.
              </p>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400" /> Free-text explanation & Q&amp;A drills
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400" /> Instant benchmark against your saved notes
                </li>
              </ul>
            </div>

            <div className="p-7 rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-brand-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-electric-blue/10 border border-electric-blue/30 flex items-center justify-center text-electric-blue mb-4">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Adaptive Spaced Repetition</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Automated revision intervals (1, 3, 7, 14, 30 days). Forgotten topics reappear tomorrow, while well-remembered topics advance to longer intervals.
              </p>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-electric-blue" /> Dynamic ease factors adjust to your performance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-electric-blue" /> Calendar views and due revision reminders
                </li>
              </ul>
            </div>

            <div className="p-7 rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-brand-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800/50 flex items-center justify-center text-purple-400 mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Dual-Mode Digital Notebook</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Write freely with rich text, tables, checklists, and code snippets, or utilize the 11-section structured template designed specifically for deep comprehension.
              </p>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" /> Freeform typing + 11-field structured template
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" /> Never lose a keystroke with reliable autosave
                </li>
              </ul>
            </div>

            <div className="p-7 rounded-2xl bg-charcoal-900 border border-charcoal-800 hover:border-brand-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">4. AI Knowledge Assistant &amp; RAG</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Generate flashcards and quizzes directly from your notes. Ask questions across your personal knowledge base with verifiable source citations.
              </p>
              <ul className="space-y-2 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> 100% private: notes never leak across accounts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Offline fallback ensures functionality without API keys
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-16 px-6 border-t border-charcoal-850 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
            Ready to master what you study?
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mb-8">
            Join students, researchers, and professionals turning notes into recallable expertise.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 transition-all hover:scale-102"
          >
            Launch MindVault Now
          </button>
          <div className="mt-12 text-xs text-gray-500">
            MindVault &copy; 2026 — Next-Generation Learning &amp; Knowledge Retention Platform.
          </div>
        </div>
      </footer>
    </div>
  );
}
