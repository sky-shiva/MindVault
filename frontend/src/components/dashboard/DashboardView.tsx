"use client";

import React, { useEffect, useState } from "react";
import {
  Brain,
  Zap,
  CalendarCheck,
  FileText,
  Flame,
  Award,
  AlertTriangle,
  ArrowRight,
  Plus,
  BookOpen,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  onOpenNoteEditor: (noteId?: string) => void;
  onStartRecall: (topicId?: string) => void;
}

export function DashboardView({
  setActiveTab,
  onOpenNoteEditor,
  onStartRecall,
}: DashboardViewProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardAnalytics();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-20 bg-charcoal-850 rounded-2xl w-2/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-charcoal-850 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-charcoal-850 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-charcoal-900 via-brand-950/40 to-charcoal-900 border border-charcoal-750 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/60 border border-brand-700/50 text-brand-300 text-xs font-medium mb-2">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span>{stats?.learning_streak_days || 1}-Day Learning Streak Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name || "Scholar"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
            {stats?.due_revisions > 0
              ? `You have ${stats.due_revisions} topic${stats.due_revisions > 1 ? "s" : ""} scheduled for active revision today. Reinforcing now solidifies long-term recall.`
              : "All scheduled revisions are up to date! Solidify retention with a quick recall drill or explore new concepts."}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => onOpenNoteEditor()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 border border-charcoal-700 text-white text-xs font-semibold transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4 text-brand-400" />
            <span>New Note</span>
          </button>
          <button
            onClick={() => onStartRecall()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-electric-blue hover:from-brand-500 hover:to-electric-blue text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all hover:scale-102"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Start Active Recall</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Due Revisions */}
        <div
          onClick={() => setActiveTab("revision")}
          className="p-5 rounded-2xl bg-charcoal-850 border border-charcoal-800 hover:border-brand-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-medium">Due for Revision</span>
            <div className="p-2 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">
            {stats?.due_revisions ?? 0}
          </div>
          <div className="text-[11px] text-gray-400 flex items-center gap-1 group-hover:text-brand-300">
            <span>Review topics</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Total Notes */}
        <div
          onClick={() => setActiveTab("notes")}
          className="p-5 rounded-2xl bg-charcoal-850 border border-charcoal-800 hover:border-brand-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-medium">Digital Notes</span>
            <div className="p-2 rounded-xl bg-brand-950/40 border border-brand-800/40 text-brand-400 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">
            {stats?.total_notes ?? 0}
          </div>
          <div className="text-[11px] text-gray-400 flex items-center gap-1 group-hover:text-brand-300">
            <span>Across {stats?.total_subjects ?? 0} subjects</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Average Retention */}
        <div
          onClick={() => setActiveTab("analytics")}
          className="p-5 rounded-2xl bg-charcoal-850 border border-charcoal-800 hover:border-brand-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-medium">Retention Accuracy</span>
            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">
            {stats?.average_retention_rate ? `${stats.average_retention_rate}%` : "85%"}
          </div>
          <div className="text-[11px] text-emerald-400">
            Mastery benchmark target: 80%+
          </div>
        </div>

        {/* Completed Revisions */}
        <div
          onClick={() => setActiveTab("recall")}
          className="p-5 rounded-2xl bg-charcoal-850 border border-charcoal-800 hover:border-brand-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-medium">Completed Reviews</span>
            <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">
            {stats?.completed_revisions ?? 0}
          </div>
          <div className="text-[11px] text-gray-400 flex items-center gap-1 group-hover:text-brand-300">
            <span>View recall history</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Weak Topics Attention & Weekly Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weak Topics Attention Card */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-yellow-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Retention Alerts (Weak Topics)</span>
            </div>
            <h3 className="text-base font-bold text-white mb-1">Focus Areas Needing Reinforcement</h3>
            <p className="text-xs text-gray-400 mb-4">
              Topics where your recent recall score was below 60%. Prioritize these in your next session.
            </p>

            {stats?.weak_topics && stats.weak_topics.length > 0 ? (
              <div className="space-y-2.5">
                {stats.weak_topics.map((t: any) => (
                  <div
                    key={t.topic_id}
                    className="p-3 rounded-xl bg-charcoal-850 border border-charcoal-750 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white">{t.topic_title}</div>
                      <div className="text-[10px] text-gray-400">{t.subject_name}</div>
                    </div>
                    <button
                      onClick={() => onStartRecall(t.topic_id)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-brand-600/20 text-brand-300 hover:bg-brand-600 hover:text-white border border-brand-500/30 transition-all"
                    >
                      Drill Now
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-xs text-emerald-300">
                Excellent! You currently have zero critically weak topics. Keep up your regular spaced review schedule.
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab("analytics")}
            className="mt-6 w-full py-2.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Explore Full Knowledge Analytics
          </button>
        </div>

        {/* Weekly Learning & Review Activity Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Learning Velocity</span>
                </div>
                <h3 className="text-base font-bold text-white">7-Day Activity &amp; Review History</h3>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <div className="w-3 h-3 rounded bg-brand-500" />
                  <span>Reviews Done</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <div className="w-3 h-3 rounded bg-electric-cyan" />
                  <span>Notes Created</span>
                </div>
              </div>
            </div>

            {/* Bar Chart Representation */}
            <div className="pt-8 pb-4 grid grid-cols-7 gap-3 items-end h-44 border-b border-charcoal-800">
              {stats?.weekly_activity?.map((day: any) => {
                const maxVal = Math.max(
                  ...stats.weekly_activity.map((d: any) => d.reviews_count + d.notes_created),
                  5
                );
                const revHeight = (day.reviews_count / maxVal) * 100;
                const noteHeight = (day.notes_created / maxVal) * 100;

                return (
                  <div key={day.date} className="flex flex-col items-center h-full justify-end group">
                    <div className="w-full max-w-[32px] flex flex-col gap-1 items-center justify-end h-full">
                      {/* Reviews Bar */}
                      <div
                        style={{ height: `${Math.max(revHeight, 8)}%` }}
                        className="w-full bg-brand-500 rounded-t-md group-hover:bg-brand-400 transition-all relative"
                        title={`${day.reviews_count} Reviews`}
                      />
                      {/* Notes Bar */}
                      {day.notes_created > 0 && (
                        <div
                          style={{ height: `${Math.max(noteHeight, 6)}%` }}
                          className="w-full bg-electric-cyan rounded-t-sm group-hover:bg-cyan-300 transition-all"
                          title={`${day.notes_created} Notes Created`}
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium mt-2">
                      {day.day_name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-gray-400">
            <span>Consistent daily 10-minute reviews beat weekend cramming by 3.4x retention.</span>
            <span className="font-semibold text-white">Target: 3+ reviews/day</span>
          </div>
        </div>
      </div>

      {/* Recent Notes Section */}
      <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recently Edited Notes</h3>
            <p className="text-xs text-gray-400">Quickly resume writing or review recent insights</p>
          </div>
          <button
            onClick={() => setActiveTab("notes")}
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>View All Notes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats?.recent_notes && stats.recent_notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.recent_notes.map((note: any) => (
              <div
                key={note.id}
                onClick={() => onOpenNoteEditor(note.id)}
                className="p-4 rounded-2xl bg-charcoal-850 hover:bg-charcoal-800 border border-charcoal-750 hover:border-brand-500/40 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-brand-300 px-2 py-0.5 rounded bg-brand-950 border border-brand-800/40">
                      {note.subject_name}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                      {note.mode}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1 mb-1">
                    {note.title}
                  </h4>
                </div>
                <div className="text-[11px] text-gray-400 pt-3 border-t border-charcoal-800 flex items-center justify-between mt-3">
                  <span>{note.word_count || 0} words</span>
                  <span className="text-brand-400 group-hover:translate-x-0.5 transition-transform">
                    Edit &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-charcoal-850/40 rounded-2xl border border-charcoal-800/60 text-xs text-gray-400">
            No notes created yet. Click &quot;New Note&quot; above to capture your first concept!
          </div>
        )}
      </div>
    </div>
  );
}
