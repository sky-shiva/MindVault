const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("mindvault_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("mindvault_token", token);
      } else {
        localStorage.removeItem("mindvault_token");
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("mindvault_token");
    }
    return this.token;
  }

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      this.setToken(null);
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        // window.location.href = "/auth/login";
      }
    }

    if (!res.ok) {
      let errorMsg = `API Error: ${res.statusText}`;
      try {
        const errorData = await res.json();
        errorMsg = errorData.detail || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return res.json();
  }

  // Auth
  register(data: any) {
    return this.request<any>("/auth/register", { method: "POST", body: JSON.stringify(data) });
  }
  forgotPassword(email: string) {
    return this.request<any>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
  }
  login(data: any) {
    return this.request<any>("/auth/login", { method: "POST", body: JSON.stringify(data) });
  }
  getMe() {
    return this.request<any>("/auth/me");
  }
  updateMe(data: any) {
    return this.request<any>("/auth/me", { method: "PUT", body: JSON.stringify(data) });
  }

  // Subjects
  getSubjects() {
    return this.request<any[]>("/subjects/");
  }
  createSubject(data: any) {
    return this.request<any>("/subjects/", { method: "POST", body: JSON.stringify(data) });
  }
  deleteSubject(id: string) {
    return this.request<void>(`/subjects/${id}`, { method: "DELETE" });
  }

  // Topics
  getTopics(subjectId?: string) {
    const q = subjectId ? `?subject_id=${subjectId}` : "";
    return this.request<any[]>(`/topics/${q}`);
  }
  createTopic(data: any) {
    return this.request<any>("/topics/", { method: "POST", body: JSON.stringify(data) });
  }
  deleteTopic(id: string) {
    return this.request<void>(`/topics/${id}`, { method: "DELETE" });
  }

  // Notes
  getNotes(params: Record<string, any> = {}) {
    const q = new URLSearchParams(params).toString();
    return this.request<any[]>(`/notes/${q ? `?${q}` : ""}`);
  }
  getNote(id: string) {
    return this.request<any>(`/notes/${id}`);
  }
  createNote(data: any) {
    return this.request<any>("/notes/", { method: "POST", body: JSON.stringify(data) });
  }
  updateNote(id: string, data: any) {
    return this.request<any>(`/notes/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }
  deleteNote(id: string) {
    return this.request<void>(`/notes/${id}`, { method: "DELETE" });
  }

  // Tags
  getTags() {
    return this.request<any[]>("/tags/");
  }

  // Active Recall
  startRecallSession(data: any) {
    return this.request<any>("/recall/session", { method: "POST", body: JSON.stringify(data) });
  }
  submitRecallAttempt(sessionId: string, data: any) {
    return this.request<any>(`/recall/session/${sessionId}/attempt`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  getRecallSessions() {
    return this.request<any[]>("/recall/sessions");
  }

  // Revision Planner
  getDueRevisions() {
    return this.request<any[]>("/revision/due");
  }
  getUpcomingRevisions() {
    return this.request<any[]>("/revision/upcoming");
  }
  submitTopicReview(topicId: string, rating: string, reflection?: string) {
    return this.request<any>(`/revision/${topicId}/review`, {
      method: "POST",
      body: JSON.stringify({ rating, user_reflection: reflection }),
    });
  }

  // Flashcards
  getFlashcards(dueOnly = false) {
    return this.request<any[]>(`/flashcards/${dueOnly ? "?due_only=true" : ""}`);
  }
  createFlashcard(data: any) {
    return this.request<any>("/flashcards/", { method: "POST", body: JSON.stringify(data) });
  }
  reviewFlashcard(id: string, rating: string) {
    return this.request<any>(`/flashcards/${id}/review`, {
      method: "POST",
      body: JSON.stringify({ rating }),
    });
  }
  deleteFlashcard(id: string) {
    return this.request<void>(`/flashcards/${id}`, { method: "DELETE" });
  }

  // Analytics
  getDashboardAnalytics() {
    return this.request<any>("/analytics/dashboard");
  }

  // Goals
  getGoals() {
    return this.request<any[]>("/goals/");
  }
  createGoal(data: any) {
    return this.request<any>("/goals/", { method: "POST", body: JSON.stringify(data) });
  }
  updateGoal(id: string, data: any) {
    return this.request<any>(`/goals/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }
  deleteGoal(id: string) {
    return this.request<void>(`/goals/${id}`, { method: "DELETE" });
  }

  // Global Search
  search(query: string) {
    return this.request<any>(`/search/?q=${encodeURIComponent(query)}`);
  }

  // AI Assistant, RAG & Configurable Settings
  getAISettings() {
    return this.request<any>("/ai/settings");
  }
  saveAISettings(data: { provider: string; model_name?: string; api_key?: string }) {
    return this.request<any>("/ai/settings", { method: "POST", body: JSON.stringify(data) });
  }
  testAIConnection(data: { provider: string; api_key?: string; model_name?: string }) {
    return this.request<any>("/ai/settings/test", { method: "POST", body: JSON.stringify(data) });
  }
  deleteAIKey() {
    return this.request<any>("/ai/settings/key", { method: "DELETE" });
  }
  sendAIChat(data: { message: string; history?: any[]; context_note_ids?: string[] }) {
    return this.request<any>("/ai/chat", { method: "POST", body: JSON.stringify(data) });
  }
  generateAIFlashcards(data: any) {
    return this.request<any[]>("/ai/flashcards", { method: "POST", body: JSON.stringify(data) });
  }
  generateAIQuiz(data: any) {
    return this.request<any[]>("/ai/quiz", { method: "POST", body: JSON.stringify(data) });
  }
  explainConcept(data: any) {
    return this.request<any>("/ai/explain", { method: "POST", body: JSON.stringify(data) });
  }
  queryRAG(data: any) {
    return this.request<any>("/ai/rag", { method: "POST", body: JSON.stringify(data) });
  }
}

export const api = new ApiClient();
