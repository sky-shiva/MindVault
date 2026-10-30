"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";

interface RevisionPlannerViewProps {
  onStartRecall: (topicId: string) => void;
}

export function RevisionPlannerView({ onStartRecall }: RevisionPlannerViewProps) {
  const [dueRevisions, setDueRevisions] = useState<any[]>([]);
  const [upcomingRevisions, setUpcomingRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevisions();
  }, []);

  const fetchRevisions = async () => {
    setLoading(true);
    try {
      const [due, upcoming] = await Promise.all([
        api.getDueRevisions(),
        api.getUpcomingRevisions(),
      ]);
      setDueRevisions(due);
      setUpcomingRevisions(upcoming);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReview = async (topicId: string, rating: "forgot" | "partial" | "well") => {
    try {
      await api.submitTopicReview(topicId, rating);
      fetchRevisions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <CalendarCheck className="w-6 h-6 text-brand-400" />
          <span>Spaced Repetition &amp; Revision Planner</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Automated interval reviews based on Ebbinghaus forgetting curves. Never let a studied topic expire from memory.
        </p>
      </div>

      {/* Due Today Banner / Section */}
      <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Scheduled for Revision Today ({dueRevisions.length})</span>
          </div>
          {dueRevisions.length > 0 && (
            <span className="text-[11px] text-gray-400">
              Reviewing today preserves retention with minimum cognitive effort.
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3 py-2 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-charcoal-850 rounded-2xl" />
            ))}
          </div>
        ) : dueRevisions.length > 0 ? (
          <div className="space-y-3">
            {dueRevisions.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-750 hover:border-brand-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold text-brand-300 px-2 py-0.5 rounded bg-brand-950 border border-brand-800/40">
                      {item.subject_name || "General"}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Repetition #{item.repetitions} &bull; Interval: {item.interval_days}d
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.topic_title}</h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onStartRecall(item.topic_id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-electric-blue text-white text-xs font-semibold shadow-sm transition-all hover:scale-102"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>Launch Recall Drill</span>
                  </button>

                  {/* Fast rating shortcuts */}
                  <button
                    onClick={() => handleQuickReview(item.topic_id, "forgot")}
                    className="px-2.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-medium border border-red-800/40"
                    title="Forgot (Reset to Day 1)"
                  >
                    Forgot
                  </button>
                  <button
                    onClick={() => handleQuickReview(item.topic_id, "well")}
                    className="px-2.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 text-xs font-medium border border-emerald-800/40"
                    title="Remembered Well (Advance Interval)"
                  >
                    Mastered
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-charcoal-850/40 border border-charcoal-800/60 text-center text-xs text-emerald-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero overdue revisions! Your retention schedule is completely up-to-date.</span>
          </div>
        )}
      </div>

      {/* Upcoming Revisions Timeline */}
      <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Upcoming Revision Timeline ({upcomingRevisions.length})</span>
          </div>
          <span className="text-[11px] text-gray-500 font-mono">
            Next 1d &rarr; 3d &rarr; 7d &rarr; 14d &rarr; 30d
          </span>
        </div>

        {upcomingRevisions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingRevisions.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-charcoal-850 border border-charcoal-750 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-2">
                    <span className="text-brand-300 font-semibold">{item.subject_name}</span>
                    <span className="px-2 py-0.5 rounded bg-charcoal-800 font-mono">
                      Next: {new Date(item.next_review_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-2 line-clamp-1">
                    {item.topic_title}
                  </h4>
                </div>

                <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Current Interval: {item.interval_days} days</span>
                  <button
                    onClick={() => onStartRecall(item.topic_id)}
                    className="text-brand-400 hover:text-brand-300 font-semibold"
                  >
                    Drill Early &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-gray-500">
            No upcoming revisions queued. Create new topics and notes to initialize schedules.
          </div>
        )}
      </div>
    </div>
  );
}
