"use client";

import React, { useState } from "react";
import { Brain, X, Lock, Mail, User, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await api.login({ email, password });
        login(res.access_token, res.user);
        onClose();
      } else if (mode === "register") {
        const res = await api.register({ email, password, full_name: fullName });
        login(res.access_token, res.user);
        onClose();
      } else {
        const res = await api.forgotPassword(email);
        setMessage(res.message || "Reset link dispatched.");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // Login with standard demo credentials
      const res = await api.login({ email: "scholar@mindvault.edu", password: "RetentionMastery2026!" });
      login(res.access_token, res.user);
      onClose();
    } catch (err) {
      // If doesn't exist, register it automatically
      try {
        const reg = await api.register({
          email: "scholar@mindvault.edu",
          password: "RetentionMastery2026!",
          full_name: "Ada Lovelace",
        });
        login(reg.access_token, reg.user);
        onClose();
      } catch (regErr: any) {
        setError("Demo login could not be initiated.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-charcoal-900 border border-charcoal-750 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-charcoal-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-electric-cyan p-0.5 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-5">
          <div className="w-full h-full bg-charcoal-950 rounded-[14px] flex items-center justify-center">
            <Brain className="w-6 h-6 text-brand-400" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">
          {mode === "login"
            ? "Welcome back to MindVault"
            : mode === "register"
            ? "Start Your Knowledge Vault"
            : "Reset Your Password"}
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          {mode === "login"
            ? "Access your structured notes, review schedules, and recall drill."
            : mode === "register"
            ? "Build long-term retention with spaced repetition and active recall."
            : "Enter your registered email to receive reset instructions."}
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-800/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-xs">
            {message}
          </div>
        )}

        {/* 1-Click Demo Button */}
        {mode === "login" && (
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mb-5 py-2.5 px-4 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 border border-brand-500/30 text-xs font-semibold text-brand-300 flex items-center justify-center gap-2 hover:border-brand-500/60 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-electric-cyan" />
            <span>1-Click Test Drive (Demo Account)</span>
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Richard Feynman"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@mindvault.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-charcoal-850 border border-charcoal-750 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 transition-all hover:scale-101 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>
                  {mode === "login"
                    ? "Sign In to Vault"
                    : mode === "register"
                    ? "Create My Account"
                    : "Send Reset Link"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 pt-5 border-t border-charcoal-800 text-center text-xs text-gray-400">
          {mode === "login" ? (
            <div className="space-y-2">
              <div>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-brand-400 hover:text-brand-300 font-semibold"
                >
                  Sign Up
                </button>
              </div>
              <div>
                <button
                  onClick={() => setMode("forgot")}
                  className="text-gray-500 hover:text-gray-300 text-[11px]"
                >
                  Forgot your password?
                </button>
              </div>
            </div>
          ) : (
            <div>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-brand-400 hover:text-brand-300 font-semibold"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
