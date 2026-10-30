"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
  Check,
  Award,
} from "lucide-react";
import { api } from "@/lib/api";

interface RecallViewProps {
  initialTopicId?: string;
  onFinishRecall?: () => void;
}

export function RecallView({ initialTopicId, onFinishRecall }: RecallViewProps) {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState(initialTopicId || "");
  const [mode, setMode] = useState<"free_text" | "qa" | "flashcard">("free_text");

  // Active Session State
  const [session, setSession] = useState<any | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<any | null>(null);
  const [userAttempt, setUserAttempt] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [userReflection, setUserReflection] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Completion State
  const [completedResults, setCompletedResults] = useState<any | null>(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      api.getTopics(selectedSubjectId).then(setTopics).catch(console.error);
    } else {
      setTopics([]);
    }
  }, [selectedSubjectId]);

  const loadSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (e) {
      console.error(e);
    }
  };

  const startSession = async () => {
    try {
      const newSession = await api.startRecallSession({
        subject_id: selectedSubjectId || null,
        topic_id: selectedTopicId || null,
        mode,
      });
      setSession(newSession);

      // Load reference notes for the prompt
      let referenceText = "Describe core definitions, mechanism, and real-world examples.";
      let promptTitle = "Active Recall Practice";

      if (selectedTopicId) {
        const notes = await api.getNotes({ topic_id: selectedTopicId });
        if (notes.length > 0) {
          const n = notes[0];
          promptTitle = n.title;
          referenceText =
            n.mode === "structured" && n.structured_content?.simple_explanation
              ? `${n.structured_content.definition}\n\nExplanation:\n${n.structured_content.simple_explanation}\n\nKey Points:\n${n.structured_content.important_points}`
              : n.content;
        }
      } else {
        const allNotes = await api.getNotes({ limit: 5 });
        if (allNotes.length > 0) {
          const randNote = allNotes[Math.floor(Math.random() * allNotes.length)];
          promptTitle = randNote.title;
          referenceText = randNote.content || "Key note concepts.";
        }
      }

      setCurrentPrompt({
        title: promptTitle,
        referenceText,
        topicId: selectedTopicId || null,
      });
      setUserAttempt("");
      setRevealed(false);
      setUserReflection("");
      setCompletedResults(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRateAttempt = async (rating: "forgot" | "partial" | "well") => {
    if (!session || !currentPrompt) return;
    setSubmitting(true);
    try {
      await api.submitRecallAttempt(session.id, {
        prompt: currentPrompt.title,
        user_attempt: userAttempt,
        revealed_reference: currentPrompt.referenceText,
        rating,
        user_reflection: userReflection,
        topic_id: currentPrompt.topicId,
      });

      setCompletedResults({
        rating,
        ratingText:
          rating === "well"
            ? "Remembered Well (+Interval Extended)"
            : rating === "partial"
            ? "Partially Remembered (Modest Interval)"
            : "Forgot (Reset to Day 1)",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Zap className="w-6 h-6 text-yellow-400" />
          <span>Active Recall Testing Studio</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          The core differentiator of MindVault. Retrieval practice forces your brain to reconstruct memory traces, converting short-term information into permanent recall.
        </p>
      </div>

      {!session ? (
        /* Configuration Screen */
        <div className="p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-950/40 border border-brand-800/40 text-xs text-brand-300">
            <Sparkles className="w-4 h-4 text-electric-cyan shrink-0" />
            <span>
              <strong>Scientific Retrieval Rule:</strong> Original notes will be hidden. Try to explain the concept from memory without looking, then reveal and rate your accuracy.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">
                Target Subject (Optional)
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="">All Subjects (Comprehensive Drill)</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">
                Specific Topic (Optional)
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                disabled={!selectedSubjectId}
                className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500 disabled:opacity-40"
              >
                <option value="">Randomized Topic Drill</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-2">
              Select Retrieval Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "free_text", title: "Free-Text Explanation", desc: "Write out concept in your own words" },
                { id: "qa", title: "Q&A Drill", desc: "Direct question prompts & answers" },
                { id: "flashcard", title: "Flashcard Rapid Flip", desc: "Quick active review" },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setMode(m.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    mode === m.id
                      ? "bg-brand-950/60 border-brand-500 text-white shadow-md"
                      : "bg-charcoal-850/60 border-charcoal-750 text-gray-400 hover:text-white"
                  }`}
                >
                  <div className="text-xs font-bold mb-1">{m.title}</div>
                  <div className="text-[11px] text-gray-400">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startSession}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-electric-blue hover:from-brand-500 hover:to-electric-blue text-white font-bold text-xs shadow-xl shadow-brand-600/30 transition-all hover:scale-101 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Begin Active Recall Drill</span>
          </button>
        </div>
      ) : completedResults ? (
        /* Results Screen */
        <div className="p-8 rounded-3xl bg-charcoal-900 border border-charcoal-800 text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">Recall Session Recorded!</h2>
            <p className="text-xs text-gray-400 mt-1">
              Your self-reported memory rating: <span className="text-emerald-300 font-bold">{completedResults.ratingText}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Spaced repetition intervals and dashboard retention curves have been updated.
            </p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setSession(null);
                setCompletedResults(null);
              }}
              className="px-5 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-white text-xs font-semibold"
            >
              Back to Studio
            </button>
            <button
              onClick={startSession}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30"
            >
              Test Next Concept
            </button>
          </div>
        </div>
      ) : (
        /* Active Drill Interactive Stage */
        <div className="space-y-6">
          {/* Prompt Banner */}
          <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800">
            <div className="flex items-center justify-between text-xs font-bold text-brand-400 uppercase tracking-wider mb-2">
              <span>Active Retrieval Prompt</span>
              <span className="text-gray-500 font-mono">Original notes hidden</span>
            </div>
            <h2 className="text-lg font-black text-white">{currentPrompt?.title}</h2>
          </div>

          {/* User Attempt Input Area */}
          <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
              <span>1. Explain this concept from memory:</span>
              <span className="text-[11px] text-gray-500">Do not cheat! Honest attempts build memory.</span>
            </div>

            <textarea
              rows={5}
              value={userAttempt}
              onChange={(e) => setUserAttempt(e.target.value)}
              placeholder="Type your explanation here. What is the definition? How does it work? What are the key points?..."
              className="w-full bg-charcoal-850 border border-charcoal-750 rounded-2xl p-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 leading-relaxed resize-none"
            />

            {!revealed && (
              <button
                onClick={() => setRevealed(true)}
                className="w-full py-3 rounded-2xl bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Eye className="w-4 h-4 text-brand-400" />
                <span>Reveal Original Notes &amp; Benchmark</span>
              </button>
            )}
          </div>

          {/* Revealed Benchmark & Side-by-Side Comparison */}
          {revealed && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 rounded-3xl bg-charcoal-850 border border-charcoal-750 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-electric-cyan uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>2. Original Notes Benchmark</span>
                </div>
                <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 text-xs text-gray-300 font-sans leading-relaxed whitespace-pre-wrap">
                  {currentPrompt?.referenceText}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                    Optional Self-Reflection: What did you miss or remember incorrectly?
                  </label>
                  <input
                    type="text"
                    value={userReflection}
                    onChange={(e) => setUserReflection(e.target.value)}
                    placeholder="e.g. Forgot the space complexity nuance; remembered definition well."
                    className="w-full px-3.5 py-2 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Rating Buttons */}
              <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-3">
                <div className="text-xs font-bold text-gray-300 uppercase text-center">
                  3. Rate Your Recall Performance
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    disabled={submitting}
                    onClick={() => handleRateAttempt("forgot")}
                    className="p-4 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 font-bold text-xs mb-1">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span>Forgot</span>
                    </div>
                    <div className="text-[10px] text-red-400/80">
                      Could not recall core points. Returns to Day 1 revision interval.
                    </div>
                  </button>

                  <button
                    disabled={submitting}
                    onClick={() => handleRateAttempt("partial")}
                    className="p-4 rounded-2xl bg-yellow-950/40 hover:bg-yellow-900/60 border border-yellow-800/40 text-yellow-300 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 font-bold text-xs mb-1">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <span>Partially Remembered</span>
                    </div>
                    <div className="text-[10px] text-yellow-400/80">
                      Got main idea, but missed crucial details. Modest interval increase.
                    </div>
                  </button>

                  <button
                    disabled={submitting}
                    onClick={() => handleRateAttempt("well")}
                    className="p-4 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-300 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 font-bold text-xs mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Remembered Well</span>
                    </div>
                    <div className="text-[10px] text-emerald-400/80">
                      Confident and accurate recall. Advances to next spaced interval (e.g. 7 or 14 days).
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
