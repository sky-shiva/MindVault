"use client";

import React, { useState } from "react";
import {
  Brain,
  FolderPlus,
  FileEdit,
  Sparkles,
  CalendarCheck,
  ArrowRight,
  Check,
  X,
  BookOpen,
} from "lucide-react";
import { api } from "@/lib/api";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onSubjectCreated?: (subject: any) => void;
}

export function OnboardingModal({
  isOpen,
  onClose,
  onNavigate,
  onSubjectCreated,
}: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Step 2 Form
  const [subjectName, setSubjectName] = useState("");
  const [subjectColor, setSubjectColor] = useState("#8B5CF6");
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [createdSubject, setCreatedSubject] = useState<any | null>(null);

  // Step 3 Form
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [createdNote, setCreatedNote] = useState<any | null>(null);

  // Step 4 Form (AI)
  const [aiProvider, setAiProvider] = useState("gemini");
  const [aiKey, setAiKey] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSaved, setAiSaved] = useState(false);

  if (!isOpen) return null;

  const handleFinish = () => {
    localStorage.setItem("mindvault_onboarding_completed", "true");
    onClose();
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    setSubjectLoading(true);
    try {
      const res = await api.createSubject({
        name: subjectName.trim(),
        description: "Created during initial setup",
        color: subjectColor,
      });
      setCreatedSubject(res);
      if (onSubjectCreated) onSubjectCreated(res);
      setStep(3);
    } catch (err) {
      console.error(err);
      setStep(3);
    } finally {
      setSubjectLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    setNoteLoading(true);
    try {
      const res = await api.createNote({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        subject_id: createdSubject?.id || null,
        mode: "freeform",
      });
      setCreatedNote(res);
      setStep(4);
    } catch (err) {
      console.error(err);
      setStep(4);
    } finally {
      setNoteLoading(false);
    }
  };

  const handleSaveAI = async () => {
    if (!aiKey.trim()) {
      setStep(5);
      return;
    }
    setAiLoading(true);
    try {
      await api.saveAISettings({
        provider: aiProvider,
        api_key: aiKey.trim(),
      });
      setAiSaved(true);
      setStep(5);
    } catch (err) {
      console.error(err);
      setStep(5);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-charcoal-900 border border-charcoal-750 rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col justify-between min-h-[460px]">
        {/* Top Header & Progress */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">
                Quick Setup &bull; Step {step} of {totalSteps}
              </span>
            </div>
            <button
              onClick={handleFinish}
              className="text-xs text-gray-500 hover:text-gray-300 font-medium transition-colors"
            >
              Skip setup
            </button>
          </div>

          {/* Progress Indicator Bar */}
          <div className="w-full h-1 bg-charcoal-800 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-electric-cyan transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          {/* STEP 1: Welcome */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-950 border border-brand-800/40 flex items-center justify-center text-brand-400 mb-2">
                <Brain className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Welcome to MindVault
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed">
                MindVault is designed around one core truth:{" "}
                <span className="text-white font-medium">
                  taking notes is only half the battle — remembering them is what matters.
                </span>
              </p>
              <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-800 space-y-2">
                <div className="text-xs font-semibold text-brand-300 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>The 3-Step MindVault Workflow</span>
                </div>
                <ul className="text-xs text-gray-400 space-y-1.5 pl-1">
                  <li>&bull; <strong className="text-gray-200">Capture:</strong> Write clean notes or use the 11-field template.</li>
                  <li>&bull; <strong className="text-gray-200">Revise:</strong> MindVault schedules reviews at optimal forgetting intervals.</li>
                  <li>&bull; <strong className="text-gray-200">Recall:</strong> Test your memory before peeking at the answers.</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 2: Create First Subject */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-800/40 flex items-center justify-center text-electric-cyan mb-2">
                <FolderPlus className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Create Your First Subject
              </h2>
              <p className="text-xs text-gray-400">
                Subjects group your topics and notes (e.g., Computer Systems, Organic Chemistry, or European History).
              </p>

              <form onSubmit={handleCreateSubject} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="e.g. Distributed Systems & Cloud Architecture"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1.5">
                    Color Accent
                  </label>
                  <div className="flex gap-2">
                    {["#8B5CF6", "#06B6D4", "#3B82F6", "#10B981", "#F59E0B"].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setSubjectColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          subjectColor === c ? "scale-125 ring-2 ring-white" : ""
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={subjectLoading || !subjectName.trim()}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all disabled:opacity-50 mt-2"
                >
                  {subjectLoading ? "Saving..." : "Save Subject & Continue"}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: Add First Note */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-800/40 flex items-center justify-center text-purple-400 mb-2">
                <FileEdit className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Add Your First Note
              </h2>
              <p className="text-xs text-gray-400">
                Jot down a concept or formula you are studying right now.
              </p>

              <form onSubmit={handleCreateNote} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                    Note Title
                  </label>
                  <input
                    type="text"
                    required
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. Raft Consensus Algorithm: Leader Election"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                    Quick Key Takeaway
                  </label>
                  <textarea
                    rows={3}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Briefly state what it is and why it matters..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={noteLoading || !noteTitle.trim()}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all disabled:opacity-50 mt-2"
                >
                  {noteLoading ? "Saving..." : "Save Note & Continue"}
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: AI Settings (Optional) */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-950 border border-brand-800/40 flex items-center justify-center text-brand-400 mb-2">
                <Sparkles className="w-6 h-6 text-electric-cyan" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Connect Your AI Provider (Optional)
              </h2>
              <p className="text-xs text-gray-400">
                You can configure Google Gemini or OpenAI to summarize your notes and generate flashcards. Keys are encrypted at rest.
              </p>

              <div className="space-y-3 pt-1">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAiProvider("gemini")}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      aiProvider === "gemini"
                        ? "bg-brand-600/20 border-brand-500 text-brand-300"
                        : "bg-charcoal-850 border-charcoal-750 text-gray-400"
                    }`}
                  >
                    Google Gemini
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiProvider("openai")}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      aiProvider === "openai"
                        ? "bg-brand-600/20 border-brand-500 text-brand-300"
                        : "bg-charcoal-850 border-charcoal-750 text-gray-400"
                    }`}
                  >
                    OpenAI
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={aiKey}
                    onChange={(e) => setAiKey(e.target.value)}
                    placeholder={
                      aiProvider === "gemini"
                        ? "AIzaSy..."
                        : "sk-..."
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    You can also configure or change this anytime in Settings &rarr; AI Settings.
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="flex-1 py-2.5 rounded-xl bg-charcoal-800 text-gray-300 hover:text-white text-xs font-medium"
                  >
                    Skip for Now
                  </button>
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={handleSaveAI}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
                  >
                    {aiLoading ? "Saving..." : aiKey ? "Save Key & Next" : "Continue"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Revision Explanation & Completion */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mb-2">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                You&apos;re Ready to Master Your Studies
              </h2>
              <p className="text-xs text-gray-300 leading-relaxed">
                MindVault will automatically track your review schedule:
              </p>
              <div className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-800 text-xs text-gray-400 space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Spaced Repetition Schedule Configured</span>
                </div>
                <p className="leading-relaxed">
                  Topics are reviewed on day 1, 3, 7, 14, and 30. Whenever a topic comes due, it appears right on your Dashboard under <strong>Today&apos;s Revision</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-charcoal-800 flex items-center justify-between">
          {step > 1 && step < 5 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs text-gray-400 hover:text-white"
            >
              &larr; Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="ml-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 5 && (
            <button
              onClick={handleFinish}
              className="ml-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-electric-blue hover:from-brand-500 text-white text-xs font-bold shadow-md flex items-center gap-2"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
