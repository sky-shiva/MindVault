"use client";

import React, { useState, useEffect } from "react";
import { Search, X, FileText, FolderTree, Layers, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (noteId: string) => void;
  onSelectSubject: (subjectId: string) => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  onSelectNote,
  onSelectSubject,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        // toggle
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.search(query);
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-charcoal-900 border border-charcoal-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-charcoal-800 bg-charcoal-850">
          <Search className="w-5 h-5 text-brand-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all your notes, subjects, topics, and flashcards..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded text-gray-500 hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-3 px-2 py-1 text-xs rounded bg-charcoal-800 text-gray-400 hover:text-white"
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="text-center py-8 text-xs text-gray-400 animate-pulse">
              Searching knowledge vault...
            </div>
          )}

          {!loading && results && results.total_results === 0 && (
            <div className="text-center py-8 text-sm text-gray-400">
              No matching knowledge entries found for &quot;<span className="text-brand-300">{query}</span>&quot;.
            </div>
          )}

          {!loading && results && (
            <>
              {/* Notes */}
              {results.notes && results.notes.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-brand-400" /> Notes ({results.notes.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.notes.map((n: any) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          onSelectNote(n.id);
                          onClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-charcoal-850/60 hover:bg-brand-950/40 border border-charcoal-800 hover:border-brand-500/30 flex items-center justify-between group transition-all"
                      >
                        <div>
                          <div className="text-xs font-semibold text-gray-200 group-hover:text-brand-300">
                            {n.title}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate max-w-lg">
                            {n.preview}
                          </div>
                        </div>
                        <span className="text-[10px] text-brand-400 px-2 py-0.5 rounded bg-brand-950 border border-brand-800/40">
                          {n.subject_name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subjects */}
              {results.subjects && results.subjects.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-electric-cyan" /> Subjects ({results.subjects.length})
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {results.subjects.map((s: any) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onSelectSubject(s.id);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-charcoal-850/60 hover:bg-charcoal-800 border border-charcoal-800 text-left flex items-center gap-2.5"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: s.color || "#8B5CF6" }}
                        />
                        <span className="text-xs font-medium text-gray-200">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Flashcards */}
              {results.flashcards && results.flashcards.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-yellow-400" /> Flashcards ({results.flashcards.length})
                  </div>
                  <div className="space-y-1.5">
                    {results.flashcards.map((f: any) => (
                      <div
                        key={f.id}
                        className="p-2.5 rounded-xl bg-charcoal-850/60 border border-charcoal-800 text-xs"
                      >
                        <div className="text-gray-200 font-medium">{f.front}</div>
                        <div className="text-gray-400 text-[11px] mt-0.5">{f.back}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!query && (
            <div className="text-center py-10 text-xs text-gray-500">
              Type keywords to instantly search across all notes, topics, definitions, and flashcards.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
