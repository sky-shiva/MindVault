"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { LandingPage } from "@/components/landing/LandingPage";
import { AuthModal } from "@/components/auth/AuthModal";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { NotesView } from "@/components/notes/NotesView";
import { NoteEditorModal } from "@/components/notes/NoteEditorModal";
import { SubjectsView } from "@/components/subjects/SubjectsView";
import { RecallView } from "@/components/recall/RecallView";
import { RevisionPlannerView } from "@/components/revision/RevisionPlannerView";
import { FlashcardsView } from "@/components/flashcards/FlashcardsView";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { GoalsView } from "@/components/goals/GoalsView";
import { AIAssistantView } from "@/components/ai/AIAssistantView";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import { api } from "@/lib/api";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");

  // Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | undefined>(undefined);

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Active recall drill context
  const [recallTopicId, setRecallTopicId] = useState<string | undefined>(undefined);
  const [flashcardNoteId, setFlashcardNoteId] = useState<string | undefined>(undefined);

  // Revisions badge counter
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    if (user) {
      api
        .getDueRevisions()
        .then((items) => setDueCount(items.length))
        .catch(console.error);
    }
  }, [user, activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-mono tracking-widest uppercase">
            Loading MindVault...
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated -> Landing Page with Seamless Auth Modal
  if (!user) {
    return (
      <>
        <LandingPage
          onGetStarted={() => {
            setAuthMode("register");
            setAuthModalOpen(true);
          }}
          onExploreDemo={() => {
            setAuthMode("login");
            setAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode={authMode}
        />
      </>
    );
  }

  // Authenticated Application Core
  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col">
      <Navbar
        onOpenSearch={() => setSearchModalOpen(true)}
        onOpenQuickRecall={() => {
          setRecallTopicId(undefined);
          setActiveTab("recall");
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dueRevisionsCount={dueCount}
        />

        <main className="flex-1 min-w-0 bg-charcoal-950 overflow-y-auto">
          {activeTab === "dashboard" && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenNoteEditor={(noteId) => {
                setEditingNoteId(noteId);
                setNoteEditorOpen(true);
              }}
              onStartRecall={(topicId) => {
                setRecallTopicId(topicId);
                setActiveTab("recall");
              }}
            />
          )}

          {activeTab === "notes" && (
            <NotesView
              onOpenEditor={(noteId) => {
                setEditingNoteId(noteId);
                setNoteEditorOpen(true);
              }}
              onStartRecall={(topicId) => {
                setRecallTopicId(topicId);
                setActiveTab("recall");
              }}
              onGenerateFlashcards={(noteId) => {
                setFlashcardNoteId(noteId);
                setActiveTab("flashcards");
              }}
            />
          )}

          {activeTab === "subjects" && (
            <SubjectsView
              onStartRecall={(topicId) => {
                setRecallTopicId(topicId);
                setActiveTab("recall");
              }}
              onOpenNotesWithSubject={(subjectId) => {
                setActiveTab("notes");
              }}
            />
          )}

          {activeTab === "recall" && (
            <RecallView
              initialTopicId={recallTopicId}
              onFinishRecall={() => setActiveTab("dashboard")}
            />
          )}

          {activeTab === "revision" && (
            <RevisionPlannerView
              onStartRecall={(topicId) => {
                setRecallTopicId(topicId);
                setActiveTab("recall");
              }}
            />
          )}

          {activeTab === "flashcards" && (
            <FlashcardsView initialNoteId={flashcardNoteId} />
          )}

          {activeTab === "analytics" && <AnalyticsView />}

          {activeTab === "goals" && <GoalsView />}

          {activeTab === "ai" && <AIAssistantView />}
        </main>
      </div>

      {/* Persistent Note Editor Modal */}
      <NoteEditorModal
        isOpen={noteEditorOpen}
        onClose={() => setNoteEditorOpen(false)}
        noteId={editingNoteId}
        onSaved={() => {
          // Re-fetch or refresh current view
        }}
        onGenerateFlashcards={(noteId) => {
          setFlashcardNoteId(noteId);
          setActiveTab("flashcards");
        }}
      />

      {/* Global Cmd+K Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectNote={(noteId) => {
          setEditingNoteId(noteId);
          setNoteEditorOpen(true);
        }}
        onSelectSubject={(subjectId) => {
          setActiveTab("subjects");
        }}
      />
    </div>
  );
}
