"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Lock, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function passwordStrength(pw: string): { label: string; color: string; width: string } {
  if (!pw) return { label: "", color: "", width: "0%" };
  if (pw.length < 8) return { label: "Too short", color: "bg-red-500", width: "25%" };
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasNumber = /\d/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
  if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "33%" };
  if (score <= 2) return { label: "Fair", color: "bg-orange-500", width: "50%" };
  if (score <= 3) return { label: "Good", color: "bg-yellow-500", width: "75%" };
  return { label: "Strong", color: "bg-emerald-500", width: "100%" };
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const strength = passwordStrength(password);
  const matchError = confirm && password !== confirm ? "Passwords do not match." : null;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2500);
    } finally {
      setBusy(false);
    }
  }

  if (hasSession === null) {
    return (
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
        <p className="mt-3 text-sm text-gray-500">Checking your session…</p>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        <Lock className="mx-auto h-10 w-10 text-gray-300" />
        <h1 className="mt-4 text-xl font-bold">Invalid or expired link</h1>
        <p className="mt-2 text-sm text-gray-500">
          This password reset link is invalid or has expired. Request a new one.
        </p>
        <Link href="/forgot-password" className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <ShieldCheck className="h-6 w-6 text-emerald-600" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Password updated</h1>
        <p className="mt-2 text-sm text-gray-500">
          Your password has been reset successfully. Redirecting to your dashboard…
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Set a new password</h1>
      <p className="mt-1 text-sm text-gray-500">Choose a strong password you haven&apos;t used before.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          New password
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type={showPw ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 pl-9 pr-10 py-2 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className={`mt-1.5 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden ${password ? "" : "invisible"}`}>
            <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: strength.width }} />
          </div>
          <p className={`mt-0.5 text-xs ${password ? "text-gray-500" : "invisible"}`}>{strength.label}</p>
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Confirm new password
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full rounded-lg border pl-9 pr-3 py-2 text-base outline-none ${
                matchError ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              }`}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
            />
          </div>
          {matchError && <p className="mt-1 text-xs text-red-500">{matchError}</p>}
        </label>

        <ul className="space-y-1 text-xs text-gray-500">
          <li className={`flex items-center gap-1.5 ${password.length >= 8 ? "text-emerald-600" : ""}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${password.length >= 8 ? "bg-emerald-500" : "bg-gray-300"}`} />
            At least 8 characters
          </li>
          <li className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) ? "text-emerald-600" : ""}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(password) ? "bg-emerald-500" : "bg-gray-300"}`} />
            One uppercase letter
          </li>
          <li className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? "text-emerald-600" : ""}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${/[0-9]/.test(password) ? "bg-emerald-500" : "bg-gray-300"}`} />
            One number
          </li>
        </ul>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          disabled={busy || !!matchError}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
