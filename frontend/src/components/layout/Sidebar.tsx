"use client";

import React from "react";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Zap,
  CalendarCheck,
  Layers,
  LineChart,
  Target,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dueRevisionsCount?: number;
}

export function Sidebar({ activeTab, setActiveTab, dueRevisionsCount = 0 }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "notes", label: "Digital Notes", icon: FileText },
    { id: "subjects", label: "Subjects & Topics", icon: FolderTree },
    {
      id: "recall",
      label: "Active Recall",
      icon: Zap,
      highlight: true,
    },
    {
      id: "revision",
      label: "Revision Planner",
      icon: CalendarCheck,
      badge: dueRevisionsCount > 0 ? dueRevisionsCount : undefined,
    },
    { id: "flashcards", label: "Flashcards", icon: Layers },
    { id: "analytics", label: "Analytics & Mastery", icon: LineChart },
    { id: "goals", label: "Learning Goals", icon: Target },
    { id: "ai", label: "AI Assistant & RAG", icon: Sparkles, extraClass: "text-electric-cyan" },
  ];

  return (
    <aside className="w-64 border-r border-charcoal-800 bg-charcoal-900/60 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation List */}
      <nav className="p-3.5 space-y-1 flex-1">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
          Core Workspaces
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? "bg-brand-600/15 text-white border border-brand-500/30 shadow-sm"
                  : "text-gray-400 hover:text-gray-200 hover:bg-charcoal-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? "text-brand-400"
                      : item.highlight
                      ? "text-yellow-400"
                      : item.extraClass || "text-gray-400 group-hover:text-gray-200"
                  }`}
                />
                <span className={isActive ? "font-semibold" : ""}>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Retention Science Callout Banner */}
      <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-b from-brand-950/40 to-charcoal-850 border border-brand-800/30">
        <div className="flex items-center gap-2 mb-1.5 text-brand-300 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>The Retention Rule</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Without spaced reviews, learners forget 70% of new information within 48 hours. Consistent active recall locks knowledge in long-term memory.
        </p>
      </div>
    </aside>
  );
}
