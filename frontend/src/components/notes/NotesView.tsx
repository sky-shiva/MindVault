"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  Pin,
  Star,
  Archive,
  Trash2,
  Tag,
  Zap,
  Filter,
  Layers,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

interface NotesViewProps {
  onOpenEditor: (noteId?: string) => void;
  onStartRecall: (topicId?: string) => void;
  onGenerateFlashcards: (noteId: string) => void;
}

export function NotesView({
  onOpenEditor,
  onStartRecall,
  onGenerateFlashcards,
}: NotesViewProps) {
  const [notes, setNotes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [filterPinned, setFilterPinned] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [filterArchived, setFilterArchived] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetadata();
    fetchNotes();
  }, [selectedSubject, selectedTag, filterPinned, filterFavorites, filterArchived, search]);

  const loadMetadata = async () => {
    try {
      const [subs, tgs] = await Promise.all([api.getSubjects(), api.getTags()]);
      setSubjects(subs);
      setTags(tgs);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (selectedSubject) params.subject_id = selectedSubject;
      if (selectedTag) params.tag = selectedTag;
      if (filterPinned) params.pinned_only = true;
      if (filterFavorites) params.favorites_only = true;
      if (filterArchived) params.include_archived = true;
      if (search) params.search = search;

      const data = await api.getNotes(params);
      setNotes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await api.deleteNote(id);
      setNotes(notes.filter((n) => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const togglePin = async (e: React.MouseEvent, note: any) => {
    e.stopPropagation();
    try {
      await api.updateNote(note.id, { is_pinned: !note.is_pinned });
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, note: any) => {
    e.stopPropagation();
    try {
      await api.updateNote(note.id, { is_favorite: !note.is_favorite });
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-brand-400" />
            <span>Digital Notebook</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Capture, structure, and tag concepts. Switch between free-form typing and 11-field structured templates.
          </p>
        </div>

        <button
          onClick={() => onOpenEditor()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Note</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter notes by title or content..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full md:w-48 bg-charcoal-850 border border-charcoal-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full md:w-40 bg-charcoal-850 border border-charcoal-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="">All Tags</option>
            {tags.map((t) => (
              <option key={t.id} value={t.name}>
                #{t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Toggles */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-charcoal-800 text-xs">
          <button
            onClick={() => setFilterPinned(!filterPinned)}
            className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
              filterPinned
                ? "bg-brand-600/20 border-brand-500/50 text-brand-300 font-semibold"
                : "bg-charcoal-850 border-charcoal-750 text-gray-400 hover:text-white"
            }`}
          >
            <Pin className="w-3.5 h-3.5" />
            <span>Pinned</span>
          </button>
          <button
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
              filterFavorites
                ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-300 font-semibold"
                : "bg-charcoal-850 border-charcoal-750 text-gray-400 hover:text-white"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Favorites</span>
          </button>
          <button
            onClick={() => setFilterArchived(!filterArchived)}
            className={`px-3 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
              filterArchived
                ? "bg-purple-500/20 border-purple-500/50 text-purple-300 font-semibold"
                : "bg-charcoal-850 border-charcoal-750 text-gray-400 hover:text-white"
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archived</span>
          </button>
          <span className="ml-auto text-[11px] text-gray-400 font-mono">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-charcoal-850 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => onOpenEditor(note.id)}
              className="p-5 rounded-2xl bg-charcoal-900 hover:bg-charcoal-850 border border-charcoal-750 hover:border-brand-500/40 transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-semibold text-brand-300 px-2 py-0.5 rounded bg-brand-950 border border-brand-800/40">
                    {note.subject_name || "General"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => togglePin(e, note)}
                      className={`p-1 rounded transition-colors ${
                        note.is_pinned
                          ? "text-brand-400"
                          : "text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100"
                      }`}
                      title="Pin"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => toggleFavorite(e, note)}
                      className={`p-1 rounded transition-colors ${
                        note.is_favorite
                          ? "text-yellow-400"
                          : "text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100"
                      }`}
                      title="Favorite"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, note.id)}
                      className="p-1 rounded text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1 mb-2">
                  {note.title}
                </h3>

                {/* Content Excerpt */}
                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed mb-3">
                  {note.mode === "structured" && note.structured_content?.simple_explanation
                    ? note.structured_content.simple_explanation
                    : note.content || "No content written yet."}
                </p>

                {/* Tag Pills */}
                {note.tag_names && note.tag_names.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tag_names.slice(0, 3).map((t: string) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono text-gray-400 px-1.5 py-0.5 rounded bg-charcoal-800"
                      >
                        #{t}
                      </span>
                    ))}
                    {note.tag_names.length > 3 && (
                      <span className="text-[10px] text-gray-500">
                        +{note.tag_names.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between text-[11px] text-gray-400">
                <span className="font-mono">{note.word_count || 0} words</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenerateFlashcards(note.id);
                    }}
                    className="p-1 rounded text-gray-400 hover:text-electric-cyan hover:bg-charcoal-800 transition-colors"
                    title="Generate Flashcards from Note"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartRecall(note.topic_id);
                    }}
                    className="p-1 rounded text-gray-400 hover:text-yellow-400 hover:bg-charcoal-800 transition-colors"
                    title="Test Recall"
                  >
                    <Zap className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-charcoal-900 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-800 flex items-center justify-center mx-auto text-gray-500">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No Notes Found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
              Start writing your thoughts, formulas, or technical architectures to begin your retention schedule.
            </p>
          </div>
          <button
            onClick={() => onOpenEditor()}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all hover:scale-102"
          >
            Create Your First Note
          </button>
        </div>
      )}
    </div>
  );
}
