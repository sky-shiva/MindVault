"use client";

import React from "react";
import { Brain, Search, Zap, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenQuickRecall: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Navbar({ onOpenSearch, onOpenQuickRecall, activeTab, setActiveTab }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-charcoal-800 bg-charcoal-900/80 backdrop-blur-md px-6 flex items-center justify-between">
      {/* Brand & Left Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-electric-cyan p-0.5 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-charcoal-950 rounded-[10px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-brand-400 group-hover:text-electric-cyan transition-colors" />
            </div>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-brand-200 to-electric-cyan bg-clip-text text-transparent">
              MindVault
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-widest text-brand-400 font-semibold px-1.5 py-0.5 rounded bg-brand-950/60 border border-brand-800/40">
              Retention OS
            </span>
          </div>
        </button>
      </div>

      {/* Global Search Trigger */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-charcoal-850/80 border border-charcoal-800 hover:border-brand-500/40 text-gray-400 hover:text-gray-200 text-sm transition-all shadow-inner group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-gray-500 group-hover:text-brand-400 transition-colors" />
            <span>Search notes, subjects, flashcards...</span>
          </div>
          <kbd className="px-2 py-0.5 text-[11px] font-mono font-medium rounded bg-charcoal-800 border border-charcoal-700 text-gray-400">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Action Buttons & User Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenQuickRecall}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-electric-blue hover:from-brand-500 hover:to-electric-blue text-white text-xs font-semibold shadow-md shadow-brand-600/25 transition-all hover:scale-102"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span className="hidden sm:inline">Active Recall</span>
        </button>

        {user ? (
          <div className="flex items-center gap-2.5 pl-3 border-l border-charcoal-800">
            <div className="w-8 h-8 rounded-full bg-brand-900 border border-brand-500/40 flex items-center justify-center text-xs font-bold text-brand-200">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <div className="font-medium text-gray-200 leading-tight">{user.full_name}</div>
              <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{user.email}</div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-charcoal-800 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
