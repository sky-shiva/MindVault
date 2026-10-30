"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  BookOpen,
} from "lucide-react";
import { api } from "@/lib/api";

interface FlashcardsViewProps {
  initialNoteId?: string;
}

export function FlashcardsView({ initialNoteId }: FlashcardsViewProps) {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // Creation Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  // Manual Form
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [difficulty, setDifficulty] = useState("medium");

  // AI Generator Form
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNoteForAI, setSelectedNoteForAI] = useState(initialNoteId || "");
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    fetchFlashcards();
    api.getNotes().then(setNotes).catch(console.error);
    if (initialNoteId) {
      setShowAIModal(true);
    }
  }, [initialNoteId]);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const data = await api.getFlashcards();
      setFlashcards(data);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleReview = async (rating: "forgot" | "partial" | "well") => {
    const card = flashcards[currentIndex];
    if (!card) return;
    try {
      await api.reviewFlashcard(card.id, rating);
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
      } else {
        alert("Completed all flashcards in this deck!");
        fetchFlashcards();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    try {
      const created = await api.createFlashcard({
        front,
        back,
        difficulty,
      });
      setFlashcards([...flashcards, created]);
      setFront("");
      setBack("");
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateAI = async () => {
    if (!selectedNoteForAI) return;
    setAiGenerating(true);
    try {
      const generated = await api.generateAIFlashcards({
        note_id: selectedNoteForAI,
        count: 4,
      });

      // Save generated cards to database
      for (const c of generated) {
        await api.createFlashcard({
          front: c.front,
          back: c.back,
          difficulty: c.difficulty,
          note_id: selectedNoteForAI,
        });
      }
      setShowAIModal(false);
      fetchFlashcards();
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  const currentCard = flashcards[currentIndex];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-brand-400" />
            <span>Interactive Flashcard Studio</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Rapid-fire flip card revision with 3D memory mechanics and AI generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 border border-brand-500/40 text-brand-300 hover:text-white text-xs font-semibold shadow-sm transition-all hover:scale-102"
          >
            <Sparkles className="w-3.5 h-3.5 text-electric-cyan" />
            <span>AI Flashcards</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Create Card</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 bg-charcoal-900 rounded-3xl animate-pulse" />
      ) : flashcards.length > 0 && currentCard ? (
        /* 3D Flashcard Player */
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              Card {currentIndex + 1} of {flashcards.length}
            </span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-charcoal-800 text-brand-300">
              Difficulty: {currentCard.difficulty}
            </span>
          </div>

          {/* Interactive Card Stage */}
          <div
            onClick={handleFlip}
            className="perspective-1000 w-full min-h-[320px] cursor-pointer"
          >
            <div
              className={`relative w-full min-h-[320px] transition-transform duration-500 transform-style-3d rounded-3xl p-8 flex flex-col justify-between border shadow-2xl ${
                isFlipped
                  ? "rotate-y-180 bg-gradient-to-br from-charcoal-850 to-charcoal-900 border-brand-500/50"
                  : "bg-gradient-to-br from-charcoal-900 via-charcoal-850 to-charcoal-900 border-charcoal-750 hover:border-brand-500/40"
              }`}
            >
              {!isFlipped ? (
                /* Front */
                <div className="flex-1 flex flex-col justify-between">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-brand-400">
                    Question / Prompt (Click or Tap to Flip)
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white text-center my-auto py-6">
                    {currentCard.front}
                  </div>
                  <div className="text-center text-[11px] text-gray-500 flex items-center justify-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Click anywhere to reveal answer</span>
                  </div>
                </div>
              ) : (
                /* Back (Answer) */
                <div className="flex-1 flex flex-col justify-between rotate-y-180">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-electric-cyan">
                    Answer / Key Concept
                  </div>
                  <div className="text-base sm:text-lg font-medium text-gray-200 text-center my-auto py-6 leading-relaxed">
                    {currentCard.back}
                  </div>
                  <div className="text-center text-[11px] text-gray-400">
                    Select your recall rating below to queue next revision.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rating Controls (Shown when flipped) */}
          {isFlipped && (
            <div className="grid grid-cols-3 gap-3 animate-fade-in">
              <button
                onClick={() => handleReview("forgot")}
                className="py-3 px-4 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <XCircle className="w-4 h-4 text-red-400" />
                <span>Forgot (1d)</span>
              </button>
              <button
                onClick={() => handleReview("partial")}
                className="py-3 px-4 rounded-2xl bg-yellow-950/40 hover:bg-yellow-900/60 border border-yellow-800/40 text-yellow-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span>Partial (3d)</span>
              </button>
              <button
                onClick={() => handleReview("well")}
                className="py-3 px-4 rounded-2xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mastered (+7d)</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-charcoal-900 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-800 flex items-center justify-center mx-auto text-gray-500">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No Flashcards in Deck</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
              Create manual flashcards or generate them automatically from your notes using AI.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-charcoal-800 text-white text-xs font-semibold"
            >
              Create Manually
            </button>
            <button
              onClick={() => setShowAIModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30"
            >
              Generate with AI
            </button>
          </div>
        </div>
      )}

      {/* Manual Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-charcoal-900 border border-charcoal-750 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Create Flashcard</h3>
            <p className="text-xs text-gray-400 mb-4">
              Write a clear prompt on the front and a concise explanation on the back.
            </p>

            <form onSubmit={handleCreateManual} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                  Front (Question / Prompt)
                </label>
                <textarea
                  rows={3}
                  required
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="e.g. What is the CAP theorem in distributed databases?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                  Back (Answer / Benchmark)
                </label>
                <textarea
                  rows={4}
                  required
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="e.g. It states that a distributed system can only provide two of Consistency, Availability, and Partition Tolerance simultaneously."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-charcoal-900 border border-charcoal-750 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-electric-cyan" />
              <h3 className="text-base font-bold text-white">AI Flashcard Generator</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Select any saved note to automatically extract questions and key takeaways.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                  Source Note
                </label>
                <select
                  value={selectedNoteForAI}
                  onChange={(e) => setSelectedNoteForAI(e.target.value)}
                  className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">Select a note to extract cards from...</option>
                  {notes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-800">
                <button
                  type="button"
                  onClick={() => setShowAIModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedNoteForAI || aiGenerating}
                  onClick={handleGenerateAI}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-electric-blue text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {aiGenerating ? (
                    <span>Generating Cards...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Cards</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
