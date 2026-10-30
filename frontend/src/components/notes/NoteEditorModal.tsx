"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Sparkles,
  Layers,
  Check,
  Tag as TagIcon,
  FolderTree,
  Pin,
  Star,
  FileText,
  AlignLeft,
  List,
  Heading,
  Code,
  CheckSquare,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { api } from "@/lib/api";

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId?: string;
  onSaved: () => void;
  onGenerateFlashcards?: (noteId: string) => void;
}

export function NoteEditorModal({
  isOpen,
  onClose,
  noteId,
  onSaved,
  onGenerateFlashcards,
}: NoteEditorModalProps) {
  const [mode, setMode] = useState<"freeform" | "structured">("freeform");
  const [title, setTitle] = useState("Untitled Note");
  const [content, setContent] = useState("");
  const [structuredContent, setStructuredContent] = useState<Record<string, string>>({
    topic_name: "",
    definition: "",
    simple_explanation: "",
    why_it_matters: "",
    how_it_works: "",
    architecture: "",
    examples: "",
    code_snippets: "",
    important_points: "",
    my_understanding: "",
    questions_doubts: "",
    references: "",
  });

  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);

  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [activeTabStructured, setActiveTabStructured] = useState("core");

  useEffect(() => {
    if (isOpen) {
      loadSubjects();
      if (noteId) {
        loadNote(noteId);
      } else {
        resetForm();
      }
    }
  }, [isOpen, noteId]);

  useEffect(() => {
    if (subjectId) {
      api.getTopics(subjectId).then(setTopics).catch(console.error);
    } else {
      setTopics([]);
    }
  }, [subjectId]);

  const loadSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadNote = async (id: string) => {
    try {
      const n = await api.getNote(id);
      setTitle(n.title);
      setMode(n.mode as any);
      setContent(n.content || "");
      if (n.structured_content && Object.keys(n.structured_content).length > 0) {
        setStructuredContent((prev) => ({ ...prev, ...n.structured_content }));
      }
      setSubjectId(n.subject_id || "");
      setTopicId(n.topic_id || "");
      setTags(n.tag_names || []);
      setIsPinned(n.is_pinned);
      setIsFavorite(n.is_favorite);
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setTitle("Untitled Note");
    setMode("freeform");
    setContent("");
    setStructuredContent({
      topic_name: "",
      definition: "",
      simple_explanation: "",
      why_it_matters: "",
      how_it_works: "",
      architecture: "",
      examples: "",
      code_snippets: "",
      important_points: "",
      my_understanding: "",
      questions_doubts: "",
      references: "",
    });
    setSubjectId("");
    setTopicId("");
    setTags([]);
    setIsPinned(false);
    setIsFavorite(false);
    setLastSaved(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title,
        mode,
        content,
        structured_content: structuredContent,
        subject_id: subjectId || null,
        topic_id: topicId || null,
        is_pinned: isPinned,
        is_favorite: isFavorite,
        tags,
      };

      if (noteId) {
        await api.updateNote(noteId, payload);
      } else {
        const created = await api.createNote(payload);
        if (created?.id && onGenerateFlashcards) {
          // preserve note context
        }
      }
      setLastSaved(new Date().toLocaleTimeString());
      onSaved();
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().toLowerCase();
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  if (!isOpen) return null;

  const wordCount = (
    content +
    " " +
    Object.values(structuredContent).join(" ")
  ).trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl h-[92vh] bg-charcoal-900 border border-charcoal-750 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header Toolbar */}
        <div className="px-6 py-4 border-b border-charcoal-800 flex items-center justify-between bg-charcoal-850/80">
          <div className="flex items-center gap-3">
            {/* Mode Selector Pill */}
            <div className="flex p-1 rounded-xl bg-charcoal-900 border border-charcoal-750 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMode("freeform")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  mode === "freeform"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Free-form Note
              </button>
              <button
                type="button"
                onClick={() => setMode("structured")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  mode === "structured"
                    ? "bg-brand-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-electric-cyan" />
                <span>11-Field Retention Template</span>
              </button>
            </div>

            {/* Pin & Star buttons */}
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-xl border transition-all ${
                isPinned
                  ? "bg-brand-600/20 border-brand-500/40 text-brand-300"
                  : "bg-charcoal-900 border-charcoal-750 text-gray-400 hover:text-white"
              }`}
              title="Pin Note"
            >
              <Pin className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-xl border transition-all ${
                isFavorite
                  ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-300"
                  : "bg-charcoal-900 border-charcoal-750 text-gray-400 hover:text-white"
              }`}
              title="Favorite Note"
            >
              <Star className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-[11px] text-gray-400 hidden sm:inline">
                Saved at {lastSaved}
              </span>
            )}
            <span className="text-[11px] font-mono text-gray-400 px-2 py-1 rounded bg-charcoal-800 border border-charcoal-700">
              {wordCount} words
            </span>

            {noteId && onGenerateFlashcards && (
              <button
                type="button"
                onClick={() => {
                  onGenerateFlashcards(noteId);
                  onClose();
                }}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 border border-brand-500/30 text-xs font-semibold text-brand-300 hover:text-white transition-all"
              >
                <Layers className="w-3.5 h-3.5 text-electric-cyan" />
                <span>Gen Flashcards</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all hover:scale-102 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Note"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-charcoal-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Note Metadata Sub-bar (Subject, Topic, Tags) */}
        <div className="px-6 py-3 border-b border-charcoal-800 bg-charcoal-900 grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-xs">
          {/* Subject Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 shrink-0 font-medium">Subject:</span>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-brand-500"
            >
              <option value="">(None / General)</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 shrink-0 font-medium">Topic:</span>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              disabled={!subjectId}
              className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-brand-500 disabled:opacity-40"
            >
              <option value="">(None / Select Subject First)</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2">
            <TagIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <div className="flex flex-wrap gap-1.5 items-center flex-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-brand-950 border border-brand-800/40 text-[10px] text-brand-300 flex items-center gap-1"
                >
                  #{t}
                  <button onClick={() => removeTag(t)} className="hover:text-red-400">
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tag + Enter"
                className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none min-w-[90px]"
              />
            </div>
          </div>
        </div>

        {/* Note Title Input */}
        <div className="px-6 pt-5 pb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title (e.g., Dynamic Programming: Tabulation vs Memoization)"
            className="w-full text-2xl font-black bg-transparent text-white placeholder-gray-600 focus:outline-none"
          />
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {mode === "freeform" ? (
            /* Free-Form Rich Note Editor */
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 pb-2 mb-3 border-b border-charcoal-800 text-gray-400 text-xs">
                <span className="font-semibold text-gray-300">Format Toolbar:</span>
                <span className="px-2 py-1 rounded bg-charcoal-800 text-[11px] font-mono">**Bold**</span>
                <span className="px-2 py-1 rounded bg-charcoal-800 text-[11px] font-mono">*Italic*</span>
                <span className="px-2 py-1 rounded bg-charcoal-800 text-[11px] font-mono"># Heading</span>
                <span className="px-2 py-1 rounded bg-charcoal-800 text-[11px] font-mono">- Bullet</span>
                <span className="px-2 py-1 rounded bg-charcoal-800 text-[11px] font-mono">```code```</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your notes here. Use Markdown for headings, code blocks, bullet points, checklists, and bold key terms..."
                className="flex-1 w-full bg-charcoal-850/60 border border-charcoal-750 rounded-2xl p-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-500 font-sans leading-relaxed resize-none"
              />
            </div>
          ) : (
            /* Structured 11-Field Retention Template */
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-brand-950/40 border border-brand-800/40 text-xs text-brand-300">
                <span className="font-bold">MindVault Structured Retention Architecture:</span> Filling out these 11 targeted prompts forces cognitive encoding and prepares this topic for active recall testing.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Definition */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-brand-400" /> 1. Exact Definition
                  </label>
                  <textarea
                    rows={2}
                    value={structuredContent.definition}
                    onChange={(e) =>
                      setStructuredContent({ ...structuredContent, definition: e.target.value })
                    }
                    placeholder="Precise technical or academic definition..."
                    className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* 2. Simple Explanation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AlignLeft className="w-3.5 h-3.5 text-electric-cyan" /> 2. Simple Explanation (Feynman Technique)
                  </label>
                  <textarea
                    rows={2}
                    value={structuredContent.simple_explanation}
                    onChange={(e) =>
                      setStructuredContent({
                        ...structuredContent,
                        simple_explanation: e.target.value,
                      })
                    }
                    placeholder="Explain it in plain English like you are talking to a beginner..."
                    className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* 3. Why It Matters */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    3. Why It Matters
                  </label>
                  <textarea
                    rows={2}
                    value={structuredContent.why_it_matters}
                    onChange={(e) =>
                      setStructuredContent({ ...structuredContent, why_it_matters: e.target.value })
                    }
                    placeholder="What problem does it solve? Why is it on exams/interviews?"
                    className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* 4. How It Works */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    4. How It Works
                  </label>
                  <textarea
                    rows={2}
                    value={structuredContent.how_it_works}
                    onChange={(e) =>
                      setStructuredContent({ ...structuredContent, how_it_works: e.target.value })
                    }
                    placeholder="Underlying mechanics, step-by-step logic, or protocol..."
                    className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* 5. Architecture / Workflow */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    5. Architecture / Mental Model / Workflow
                  </label>
                  <textarea
                    rows={2}
                    value={structuredContent.architecture}
                    onChange={(e) =>
                      setStructuredContent({ ...structuredContent, architecture: e.target.value })
                    }
                    placeholder="Describe the mental model, system layers, or diagram flow..."
                    className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* 6. Concrete Examples */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    6. Concrete Examples
                  </label>
                  <textarea
                    rows={2}
                    value={structuredContent.examples}
                    onChange={(e) =>
                      setStructuredContent({ ...structuredContent, examples: e.target.value })
                    }
                    placeholder="Real-world case studies, numerical calculations, or questions..."
                    className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* 7. Code Snippets / Formula */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-purple-400" /> 7. Code Snippet / Key Formula
                  </label>
                  <textarea
                    rows={3}
                    value={structuredContent.code_snippets}
                    onChange={(e) =>
                      setStructuredContent({ ...structuredContent, code_snippets: e.target.value })
                    }
                    placeholder="def solve(n): ... or mathematical equations"
                    className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* 8. Important Points / Pitfalls */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    8. Important Points &amp; Common Pitfalls
                  </label>
                  <textarea
                    rows={3}
                    value={structuredContent.important_points}
                    onChange={(e) =>
                      setStructuredContent({
                        ...structuredContent,
                        important_points: e.target.value,
                      })
                    }
                    placeholder="Mistakes students make, edge cases, exceptions..."
                    className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* 9. My Understanding */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    9. My Personal Understanding (In My Own Words)
                  </label>
                  <textarea
                    rows={2}
                    value={structuredContent.my_understanding}
                    onChange={(e) =>
                      setStructuredContent({
                        ...structuredContent,
                        my_understanding: e.target.value,
                      })
                    }
                    placeholder="What clicked for me? My personal intuition..."
                    className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* 10. Questions and Doubts */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-yellow-400" /> 10. Questions &amp; Unresolved Doubts
                  </label>
                  <textarea
                    rows={2}
                    value={structuredContent.questions_doubts}
                    onChange={(e) =>
                      setStructuredContent({
                        ...structuredContent,
                        questions_doubts: e.target.value,
                      })
                    }
                    placeholder="Things to test myself on or ask my mentor/professor..."
                    className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* 11. References */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    11. References &amp; Citations
                  </label>
                  <input
                    type="text"
                    value={structuredContent.references}
                    onChange={(e) =>
                      setStructuredContent({ ...structuredContent, references: e.target.value })
                    }
                    placeholder="Textbook chapter, lecture URL, research paper..."
                    className="w-full bg-charcoal-850 border border-charcoal-750 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
