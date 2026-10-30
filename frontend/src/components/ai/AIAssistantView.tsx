"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Search,
  BookOpen,
  HelpCircle,
  Brain,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";

export function AIAssistantView() {
  const [activeTab, setActiveTab] = useState<"rag" | "explain" | "quiz">("rag");

  // RAG Search State
  const [ragQuery, setRagQuery] = useState("");
  const [ragResponse, setRagResponse] = useState<any | null>(null);
  const [ragLoading, setRagLoading] = useState(false);

  // Concept Simplifier State
  const [concept, setConcept] = useState("");
  const [audience, setAudience] = useState("beginner");
  const [explanation, setExplanation] = useState<any | null>(null);
  const [explainLoading, setExplainLoading] = useState(false);

  // Quiz Generator State
  const [quizText, setQuizText] = useState("");
  const [quizType, setQuizType] = useState("mcq");
  const [quizItems, setQuizItems] = useState<any[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);

  const handleRAGSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;
    setRagLoading(true);
    try {
      const data = await api.queryRAG({ query: ragQuery });
      setRagResponse(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRagLoading(false);
    }
  };

  const handleExplain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;
    setExplainLoading(true);
    try {
      const data = await api.explainConcept({
        concept,
        target_audience: audience,
      });
      setExplanation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setExplainLoading(false);
    }
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizText.trim()) return;
    setQuizLoading(true);
    try {
      const data = await api.generateAIQuiz({
        content: quizText,
        quiz_type: quizType,
        count: 4,
      });
      setQuizItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setQuizLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-electric-cyan" />
          <span>AI Learning Assistant &amp; Personal RAG</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Query your private notes with semantic retrieval, synthesize analogies, and auto-generate exam questions.
        </p>
      </div>

      {/* Privacy Guarantee Pill */}
      <div className="p-3.5 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex items-center gap-2.5 text-xs text-gray-300">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>Data Isolation:</strong> Your personal notes are never shared with other users. An intelligent offline engine handles synthesis if no external API key is configured.
        </span>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex p-1 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("rag")}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === "rag" ? "bg-brand-600 text-white shadow-md" : "text-gray-400 hover:text-white"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Search Notes (RAG)</span>
        </button>
        <button
          onClick={() => setActiveTab("explain")}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === "explain" ? "bg-brand-600 text-white shadow-md" : "text-gray-400 hover:text-white"
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Explain Simply (Feynman)</span>
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === "quiz" ? "bg-brand-600 text-white shadow-md" : "text-gray-400 hover:text-white"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Generate Quiz / MCQs</span>
        </button>
      </div>

      {/* TAB 1: RAG Search */}
      {activeTab === "rag" && (
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-1">
              Ask Questions Over Your Personal Notes
            </h2>
            <p className="text-xs text-gray-400">
              The RAG pipeline extracts semantic passages from your notes and crafts verified answers with citations.
            </p>
          </div>

          <form onSubmit={handleRAGSearch} className="flex gap-2">
            <input
              type="text"
              required
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              placeholder="e.g. When should I use Tabulation instead of Memoization?"
              className="flex-1 px-4 py-3 rounded-2xl bg-charcoal-850 border border-charcoal-750 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={ragLoading}
              className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {ragLoading ? "Retrieving..." : "Ask Vault"}
            </button>
          </form>

          {ragResponse && (
            <div className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-750 space-y-4 animate-fade-in">
              <div>
                <div className="text-[11px] font-bold text-electric-cyan uppercase tracking-wider mb-2">
                  Synthesized Answer
                </div>
                <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {ragResponse.answer}
                </div>
              </div>

              {/* Citations */}
              {ragResponse.citations && ragResponse.citations.length > 0 && (
                <div className="pt-4 border-t border-charcoal-800">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Citations from Your Notes
                  </div>
                  <div className="space-y-2">
                    {ragResponse.citations.map((c: any, i: number) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-charcoal-900 border border-charcoal-800 text-xs"
                      >
                        <div className="font-bold text-brand-300 mb-0.5">{c.note_title}</div>
                        <div className="text-gray-400 text-[11px] italic leading-relaxed">
                          &quot;{c.snippet}&quot;
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Explain Concept */}
      {activeTab === "explain" && (
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-1">
              Feynman Concept Simplifier &amp; Analogies
            </h2>
            <p className="text-xs text-gray-400">
              Transform complex, opaque academic concepts into crystal-clear intuitions and analogies.
            </p>
          </div>

          <form onSubmit={handleExplain} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Concept (e.g. Asynchronous Event Loops, Raft Consensus)"
                className="md:col-span-2 px-4 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
              />
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="beginner">Explain Like I&apos;m 10</option>
                <option value="intermediate">College / Undergraduate</option>
                <option value="expert">Senior Engineer / Researcher</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={explainLoading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md disabled:opacity-50"
            >
              {explainLoading ? "Deconstructing Concept..." : "Simplify Concept"}
            </button>
          </form>

          {explanation && (
            <div className="p-6 rounded-2xl bg-charcoal-850 border border-charcoal-750 space-y-4 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  Concept: {explanation.concept}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {explanation.simple_explanation}
                </p>
              </div>

              {explanation.real_world_analogy && (
                <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800">
                  <div className="text-[11px] font-bold text-brand-300 uppercase tracking-wider mb-1">
                    Real-World Analogy
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {explanation.real_world_analogy}
                  </p>
                </div>
              )}

              {explanation.why_it_matters && (
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Why It Matters
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {explanation.why_it_matters}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Auto Quiz / MCQ Generator */}
      {activeTab === "quiz" && (
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-1">
              Examination &amp; Interview Quiz Generator
            </h2>
            <p className="text-xs text-gray-400">
              Paste your raw notes or study summary to auto-synthesize multiple-choice and interview recall questions.
            </p>
          </div>

          <form onSubmit={handleGenerateQuiz} className="space-y-4">
            <textarea
              rows={4}
              required
              value={quizText}
              onChange={(e) => setQuizText(e.target.value)}
              placeholder="Paste note excerpt or definitions to generate test questions from..."
              className="w-full px-4 py-3 rounded-2xl bg-charcoal-850 border border-charcoal-750 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setQuizType("mcq")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    quizType === "mcq"
                      ? "bg-brand-600 text-white border-brand-500"
                      : "bg-charcoal-850 text-gray-400 border-charcoal-750"
                  }`}
                >
                  Multiple Choice
                </button>
                <button
                  type="button"
                  onClick={() => setQuizType("interview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    quizType === "interview"
                      ? "bg-brand-600 text-white border-brand-500"
                      : "bg-charcoal-850 text-gray-400 border-charcoal-750"
                  }`}
                >
                  Interview Questions
                </button>
              </div>

              <button
                type="submit"
                disabled={quizLoading}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md disabled:opacity-50"
              >
                {quizLoading ? "Generating Quiz..." : "Synthesize Questions"}
              </button>
            </div>
          </form>

          {quizItems.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Generated Questions ({quizItems.length})
              </h3>
              <div className="space-y-3">
                {quizItems.map((q, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-750 space-y-2.5"
                  >
                    <div className="text-xs font-bold text-white">
                      {i + 1}. {q.question}
                    </div>

                    {q.options && (
                      <div className="space-y-1.5 pl-2">
                        {q.options.map((opt: any) => (
                          <div
                            key={opt.id}
                            className={`p-2 rounded-lg text-xs flex items-center gap-2 ${
                              opt.id === q.correct_answer
                                ? "bg-emerald-950/40 border border-emerald-800/40 text-emerald-300"
                                : "bg-charcoal-900 text-gray-300"
                            }`}
                          >
                            <span className="font-bold text-[10px] w-4">{opt.id}.</span>
                            <span>{opt.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="text-[11px] text-gray-400 italic pt-1 border-t border-charcoal-800">
                      Rationale: {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
