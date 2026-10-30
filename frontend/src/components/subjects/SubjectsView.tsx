"use client";

import React, { useState, useEffect } from "react";
import {
  FolderTree,
  Plus,
  Trash2,
  BookOpen,
  Zap,
  Layers,
  ChevronRight,
  FolderPlus,
  Clock,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

interface SubjectsViewProps {
  onStartRecall: (topicId?: string) => void;
  onOpenNotesWithSubject: (subjectId: string) => void;
}

export function SubjectsView({ onStartRecall, onOpenNotesWithSubject }: SubjectsViewProps) {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [topics, setTopics] = useState<any[]>([]);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);

  const [newSubName, setNewSubName] = useState("");
  const [newSubDesc, setNewSubDesc] = useState("");
  const [newSubColor, setNewSubColor] = useState("#8B5CF6");

  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicDesc, setNewTopicDesc] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadTopics(selectedSubject.id);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await api.getSubjects();
      setSubjects(data);
      if (data.length > 0 && !selectedSubject) {
        setSelectedSubject(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async (subjectId: string) => {
    try {
      const data = await api.getTopics(subjectId);
      setTopics(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    try {
      const created = await api.createSubject({
        name: newSubName,
        description: newSubDesc,
        color: newSubColor,
      });
      setSubjects([...subjects, created]);
      setSelectedSubject(created);
      setNewSubName("");
      setNewSubDesc("");
      setShowSubjectModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !selectedSubject) return;
    try {
      const created = await api.createTopic({
        subject_id: selectedSubject.id,
        title: newTopicTitle,
        description: newTopicDesc,
      });
      setTopics([...topics, created]);
      setNewTopicTitle("");
      setNewTopicDesc("");
      setShowTopicModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this subject and all associated topics?")) return;
    try {
      await api.deleteSubject(id);
      const remaining = subjects.filter((s) => s.id !== id);
      setSubjects(remaining);
      if (selectedSubject?.id === id) {
        setSelectedSubject(remaining[0] || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTopic = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this topic?")) return;
    try {
      await api.deleteTopic(id);
      setTopics(topics.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const colors = ["#8B5CF6", "#06B6D4", "#3B82F6", "#10B981", "#F59E0B", "#EC4899"];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-brand-400" />
            <span>Subjects &amp; Knowledge Categories</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Organize topics into structured subject hierarchies. Create topics to trigger automated spaced repetition schedules.
          </p>
        </div>

        <button
          onClick={() => setShowSubjectModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>New Subject</span>
        </button>
      </div>

      {/* Main Dual-Pane Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Subjects List */}
        <div className="p-5 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-charcoal-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Your Subjects ({subjects.length})</span>
          </div>

          {loading ? (
            <div className="space-y-2 py-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-charcoal-850 rounded-xl" />
              ))}
            </div>
          ) : subjects.length > 0 ? (
            <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
              {subjects.map((s) => {
                const isSelected = selectedSubject?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSubject(s)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? "bg-brand-950/60 border-brand-500/50 shadow-md"
                        : "bg-charcoal-850/60 hover:bg-charcoal-800 border-charcoal-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: s.color || "#8B5CF6" }}
                      />
                      <div>
                        <div
                          className={`text-xs font-bold leading-tight ${
                            isSelected ? "text-white" : "text-gray-300 group-hover:text-white"
                          }`}
                        >
                          {s.name}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {s.topic_count || 0} topics &bull; {s.note_count || 0} notes
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleDeleteSubject(e, s.id)}
                        className="p-1 rounded text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? "text-brand-400 translate-x-0.5" : "text-gray-600"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-500">
              No subjects yet. Create your first subject above!
            </div>
          )}
        </div>

        {/* Right: Topics under Selected Subject */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between">
          {selectedSubject ? (
            <div>
              {/* Selected Subject Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-charcoal-800 mb-6 gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: selectedSubject.color || "#8B5CF6" }}
                  />
                  <div>
                    <h2 className="text-lg font-black text-white">{selectedSubject.name}</h2>
                    <p className="text-xs text-gray-400">
                      {selectedSubject.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenNotesWithSubject(selectedSubject.id)}
                    className="px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                  >
                    View Notes ({selectedSubject.note_count || 0})
                  </button>
                  <button
                    onClick={() => setShowTopicModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Topic</span>
                  </button>
                </div>
              </div>

              {/* Topics List */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Active Recall Topics ({topics.length})
                </div>

                {topics.length > 0 ? (
                  <div className="space-y-2.5">
                    {topics.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-750 hover:border-brand-500/40 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                            {t.title}
                          </div>
                          {t.description && (
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              {t.description}
                            </div>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-brand-400" />
                              Next Revision:{" "}
                              {t.next_review_at
                                ? new Date(t.next_review_at).toLocaleDateString()
                                : "Scheduled"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onStartRecall(t.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-600/20 text-brand-300 hover:bg-brand-600 hover:text-white border border-brand-500/30 text-xs font-semibold transition-all"
                            title="Start Active Recall on this Topic"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Drill Recall</span>
                          </button>
                          <button
                            onClick={(e) => handleDeleteTopic(e, t.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete Topic"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-charcoal-850/40 rounded-2xl border border-charcoal-800/60 text-xs text-gray-400 space-y-2">
                    <p>No topics added under &quot;{selectedSubject.name}&quot; yet.</p>
                    <button
                      onClick={() => setShowTopicModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-brand-600 text-white font-semibold text-xs"
                    >
                      Create First Topic
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-xs text-gray-400">
              Select or create a subject on the left to view its topics.
            </div>
          )}
        </div>
      </div>

      {/* New Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-charcoal-900 border border-charcoal-750 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Create New Subject</h3>
            <p className="text-xs text-gray-400 mb-4">
              e.g. Distributed Systems, Biochemistry, Constitutional Law, Machine Learning.
            </p>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Microservices & Distributed Architecture"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  placeholder="Short summary of this study category..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1.5">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewSubColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newSubColor === c ? "scale-110 ring-2 ring-white" : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-800">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-charcoal-900 border border-charcoal-750 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Add Topic to {selectedSubject?.name}</h3>
            <p className="text-xs text-gray-400 mb-4">
              Creating a topic immediately attaches it to the automated Spaced Repetition engine.
            </p>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  required
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="e.g. Raft Consensus Algorithm & Leader Election"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                  Brief Overview
                </label>
                <textarea
                  rows={2}
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  placeholder="Key concepts or exam relevance..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-800">
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
                >
                  Create Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
