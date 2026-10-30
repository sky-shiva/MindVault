"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  Clock,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

export function GoalsView() {
  const [goals, setGoals] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [progress, setProgress] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
    api.getSubjects().then(setSubjects).catch(console.error);
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const created = await api.createGoal({
        title,
        description,
        target_date: targetDate ? new Date(targetDate).toISOString() : null,
        subject_id: subjectId || null,
        progress_percentage: progress,
      });
      setGoals([created, ...goals]);
      setTitle("");
      setDescription("");
      setTargetDate("");
      setSubjectId("");
      setProgress(0);
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProgress = async (id: string, newProgress: number) => {
    try {
      const updated = await api.updateGoal(id, {
        progress_percentage: newProgress,
        status: newProgress >= 100 ? "completed" : "in_progress",
      });
      setGoals(goals.map((g) => (g.id === id ? updated : g)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this learning goal?")) return;
    try {
      await api.deleteGoal(id);
      setGoals(goals.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Target className="w-6 h-6 text-brand-400" />
            <span>Learning Milestones &amp; Examination Goals</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Define clear study deadlines, examination milestones, and track topic mastery progress.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-charcoal-850 rounded-2xl" />
          ))}
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => (
            <div
              key={g.id}
              className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-brand-300 px-2 py-0.5 rounded bg-brand-950 border border-brand-800/40">
                    {g.subject_name || "General Milestone"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        g.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                      }`}
                    >
                      {g.status === "completed" ? "Completed" : "In Progress"}
                    </span>
                    <button
                      onClick={() => handleDelete(g.id)}
                      className="text-gray-500 hover:text-red-400 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{g.title}</h3>
                {g.description && <p className="text-xs text-gray-400">{g.description}</p>}
              </div>

              {/* Slider & Metrics */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-400">Mastery Progress</span>
                  <span className="text-white">{g.progress_percentage || 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={g.progress_percentage || 0}
                  onChange={(e) => handleUpdateProgress(g.id, parseInt(e.target.value))}
                  className="w-full accent-brand-500 bg-charcoal-800 h-2 rounded-lg cursor-pointer"
                />
                {g.target_date && (
                  <div className="text-[11px] text-gray-500 flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-brand-400" />
                    <span>Target Date: {new Date(g.target_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-charcoal-900 rounded-3xl border border-charcoal-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-charcoal-800 flex items-center justify-center mx-auto text-gray-500">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">No Learning Goals Set</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
              Set deadlines for interviews, semester examinations, or certifications to stay on track.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md"
          >
            Create Your First Milestone
          </button>
        </div>
      )}

      {/* Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-charcoal-900 border border-charcoal-750 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Set Learning Goal</h3>
            <p className="text-xs text-gray-400 mb-4">
              e.g. Master System Design Patterns, Complete Organic Chemistry Exam Prep.
            </p>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Pass Cloud Architect Certification"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                  Associated Subject (Optional)
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="">(None / General)</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase mb-1">
                  Target Deadline
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
