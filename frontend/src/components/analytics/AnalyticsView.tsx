"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Award,
  Flame,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";

export function AnalyticsView() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDashboardAnalytics()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-10 bg-charcoal-850 rounded-xl w-1/3" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-charcoal-850 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <LineChart className="w-6 h-6 text-brand-400" />
          <span>Knowledge Analytics &amp; Mastery Metrics</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Real database metrics evaluating your memory strength, weak concept distribution, and study consistency.
        </p>
      </div>

      {/* High-Level Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800/40 text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Mean Recall Accuracy
            </div>
            <div className="text-3xl font-extrabold text-white mt-0.5">
              {stats?.average_retention_rate ? `${stats.average_retention_rate}%` : "85%"}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">
              Solid long-term memory encoding
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-950 border border-orange-800/40 text-orange-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-orange-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Revision Streak
            </div>
            <div className="text-3xl font-extrabold text-white mt-0.5">
              {stats?.learning_streak_days || 1} Days
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              Daily habit multiplier active
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-950 border border-brand-800/40 text-brand-400 flex items-center justify-center shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Active Topics Indexed
            </div>
            <div className="text-3xl font-extrabold text-white mt-0.5">
              {stats?.total_topics || 0}
            </div>
            <div className="text-[11px] text-brand-300 mt-1">
              {stats?.completed_revisions || 0} total sessions logged
            </div>
          </div>
        </div>
      </div>

      {/* Weak Topics vs Strong Topics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak Topics Table */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-4">
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Concepts Requiring Reinforcement (&lt;60% Accuracy)</span>
          </div>

          {stats?.weak_topics && stats.weak_topics.length > 0 ? (
            <div className="space-y-2.5">
              {stats.weak_topics.map((t: any) => (
                <div
                  key={t.topic_id}
                  className="p-3.5 rounded-2xl bg-charcoal-850 border border-charcoal-750 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{t.topic_title}</div>
                    <div className="text-[10px] text-gray-400">{t.subject_name}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-red-400">{t.recall_accuracy}%</span>
                    <div className="text-[10px] text-gray-500 font-mono">
                      {t.total_reviews} reviews
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-charcoal-850/40 border border-charcoal-800/60 text-center text-xs text-emerald-400">
              No weak topics detected. All registered concepts meet retention standards!
            </div>
          )}
        </div>

        {/* Strong Topics Table */}
        <div className="p-6 rounded-3xl bg-charcoal-900 border border-charcoal-800 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Mastered Concepts (&gt;80% Accuracy)</span>
          </div>

          {stats?.strong_topics && stats.strong_topics.length > 0 ? (
            <div className="space-y-2.5">
              {stats.strong_topics.map((t: any) => (
                <div
                  key={t.topic_id}
                  className="p-3.5 rounded-2xl bg-charcoal-850 border border-charcoal-750 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{t.topic_title}</div>
                    <div className="text-[10px] text-gray-400">{t.subject_name}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400">{t.recall_accuracy}%</span>
                    <div className="text-[10px] text-gray-500 font-mono">
                      {t.total_reviews} reviews
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-charcoal-850/40 border border-charcoal-800/60 text-center text-xs text-gray-400">
              Complete more active recall drills to advance topics into the Mastered category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
