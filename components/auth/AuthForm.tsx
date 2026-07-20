"use client";
import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { TurnstileWidget } from "./TurnstileWidget";
import { toast } from "sonner";
import { track } from "@/lib/analytics/track";

const inputBase =
  "w-full rounded-lg border bg-white pl-9 pr-3 py-2 text-base outline-none transition-colors";
const inputNormal = "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const inputError = "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500";

function passwordStrength(pw: string): { label: string; color: string; width: string; score: number } {
  if (!pw) return { label: "", color: "", width: "0%", score: 0 };
  const checks = [/[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/];
  const score = checks.filter((r) => r.test(pw)).length;
  if (pw.length < 8) return { label: "Too short", color: "bg-red-500", width: "25%", score: 0 };
  if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "33%", score: 1 };
  if (score <= 2) return { label: "Fair", color: "bg-orange-500", width: "50%", score: 2 };
  if (score <= 3) return { label: "Good", color: "bg-yellow-500", width: "75%", score: 3 };
  return { label: "Strong", color: "bg-emerald-500", width: "100%", score: 4 };
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  // Both login and sign-up land on the GLP-1 tracker (the primary experience).
  // An explicit ?next= wins.
  const next = params.get("next") ?? "/dashboard/glp1";
  const reason = params.get("reason");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [consent, setConsent] = useState(false);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; consent?: string }>({});
  /** Set when Supabase requires email confirmation before the session starts. */
  const [confirmPending, setConfirmPending] = useState(false);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  const onToken = useCallback((t: string) => setToken(t), []);
  const strength = mode === "signup" ? passwordStrength(password) : null;

  function validate(): boolean {
    const errs: typeof fieldErrors = {};
    if (!email.includes("@") || !email.includes(".")) errs.email = "Enter a valid email address.";
    if (password.length < 8) errs.password = "Use at least 8 characters.";
    if (mode === "signup") {
      if (!/[A-Z]/.test(password)) errs.password = "Must include at least one uppercase letter.";
      else if (!/[a-z]/.test(password)) errs.password = "Must include at least one lowercase letter.";
      else if (!/\d/.test(password)) errs.password = "Must include at least one number.";
    }
    if (mode === "signup" && !consent) errs.consent = "You must accept the terms to continue.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    if (mode === "signup") track("signup_start", { method: "email", next });

    setBusy(true);
    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "signup"
            ? { email, password, consent, turnstileToken: token, next }
            : { email, password, turnstileToken: token },
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        if (mode === "signup") track("signup_error", { method: "email", reason: data.error ?? "unknown" });
        return;
      }
      if (mode === "signup" && data.needsConfirmation) {
        // The account exists but there is no session until the user clicks the
        // link in their email. Show a persistent panel (a toast disappears and
        // left people staring at the form wondering if it worked).
        track("signup_complete", { method: "email", needs_confirmation: true });
        setConfirmPending(true);
        return;
      }
      await fetch("/api/auth/register-session", { method: "POST" });
      if (mode === "signup") track("signup_complete", { method: "email", needs_confirmation: false, next });
      toast.success(mode === "login" ? "Welcome back!" : "Account created!");
      router.push(next);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function resendConfirmation() {
    setResendState("sending");
    try {
      const res = await fetch("/api/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not resend the email.");
        setResendState("idle");
        return;
      }
      setResendState("sent");
    } catch {
      setError("Network error. Please try again.");
      setResendState("idle");
    }
  }

  async function oauth(provider: "google" | "azure" | "apple") {
    setError(null);
    // OAuth leaves the site, so this is the last event we can fire here.
    // signup_complete for OAuth users is recorded on the callback landing.
    if (mode === "signup") track("signup_start", { method: provider, next });
    try {
      const res = await fetch("/api/auth/oauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, next }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error ?? "Could not start sign-in.");
    } catch {
      setError("Network error. Please try again.");
    }
  }

  // Account created, but Supabase is holding the session until the email is
  // confirmed. This replaces the form entirely so the next step is unmissable.
  if (confirmPending) {
    return (
      <div className="mx-auto w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50">
          <Mail className="h-6 w-6 text-emerald-600" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-gray-900">Confirm your email</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Your account is created. We sent a confirmation link to{" "}
          <strong className="text-gray-900">{email}</strong>. Click it and you will land straight in your
          dashboard.
        </p>
        <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-500">
          No email after a minute? Check your spam folder, and make sure the address above is spelled
          correctly.
        </p>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-left" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {resendState === "sent" ? (
          <p className="mt-4 text-sm font-medium text-emerald-700">
            Sent again. It can take a minute to arrive.
          </p>
        ) : (
          <button
            type="button"
            onClick={resendConfirmation}
            disabled={resendState === "sending"}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60 min-h-[44px]"
          >
            {resendState === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
            {resendState === "sending" ? "Sending…" : "Resend confirmation email"}
          </button>
        )}

        <button
          type="button"
          onClick={() => { setConfirmPending(false); setResendState("idle"); setError(null); }}
          className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          Use a different email address
        </button>
        <p className="mt-4 text-xs text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
            Log in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">
        {mode === "signup" ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {mode === "signup"
          ? "Start tracking your metabolic health."
          : "Sign in to your dashboard."}
      </p>

      {(reason === "device_limit" || reason === "logged_out_elsewhere") && mode === "login" && (
        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <span>
            You were signed out because your account was signed in on too many devices. Sign back in to continue,
            and this device will be reconnected.
          </span>
        </div>
      )}

      <div className="mt-5 space-y-2">
        <button
          type="button"
          onClick={() => oauth("google")}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-gray-300 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors min-h-[44px]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>
        <button
          type="button"
          onClick={() => oauth("azure")}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-gray-300 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors min-h-[44px]"
        >
          <svg className="h-5 w-5" viewBox="0 0 21 21" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="19" height="19" rx="2" fill="#00A4EF" />
            <path d="M10.4 11.5v4.5l4.5-1.5V11.5h-4.5zm0-5v4.5h4.5V5.5l-4.5 1zM5.5 11.5v4.5l4.5-1.5V11.5H5.5zm0-5v4.5H10V5.5L5.5 6.5z" fill="#fff" />
          </svg>
          Continue with Microsoft
        </button>
        <button
          type="button"
          onClick={() => oauth("apple")}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-gray-300 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors min-h-[44px]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M16.365 1.43c0 1.14-.42 2.2-1.12 3.02-.85.99-2.24 1.76-3.4 1.66-.13-1.1.42-2.26 1.08-3 .76-.85 2.1-1.55 3.44-1.68zM20.5 17.02c-.6 1.38-.88 1.99-1.65 3.2-1.08 1.7-2.6 3.81-4.48 3.83-1.67.01-2.1-1.09-4.37-1.08-2.27.01-2.74 1.1-4.41 1.09-1.88-.02-3.32-1.93-4.4-3.62C-1.8 15.9-2.13 9.5.9 6.1c1.08-1.22 2.79-1.99 4.4-1.99 1.64 0 2.67 1.1 4.03 1.1 1.32 0 2.12-1.1 4.02-1.1 1.43 0 2.94.78 4.02 2.12-3.53 1.94-2.96 6.98.13 8.79z" />
          </svg>
          Continue with Apple
        </button>
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-gray-400" role="separator" aria-orientation="horizontal">
        <div className="h-px flex-1 bg-gray-200" />
        <span>or continue with email</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={submit} className="space-y-3" noValidate>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Email
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                className={`${inputBase} ${fieldErrors.email ? inputError : inputNormal}`}
                placeholder="name@example.com"
                autoComplete="email"
                autoFocus
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
              />
            </div>
          </label>
          {fieldErrors.email && <p id="email-error" className="text-xs text-red-500">{fieldErrors.email}</p>}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            {mode === "login" && (
              <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Forgot?
              </Link>
            )}
          </div>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type={showPw ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
              className={`${inputBase} pr-10 ${fieldErrors.password ? inputError : inputNormal}`}
              placeholder={mode === "signup" ? "Min. 8 characters" : "Enter your password"}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.password && <p id="password-error" className="text-xs text-red-500">{fieldErrors.password}</p>}

          {mode === "signup" && (
            <div className={`mt-1.5 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden ${password ? "" : "invisible"}`}>
              <div className={`h-full rounded-full transition-all duration-300 ${strength?.color}`} style={{ width: strength?.width ?? "0%" }} />
            </div>
          )}
          {mode === "signup" && (
            <ul className="mt-1.5 space-y-1 text-xs text-gray-500" aria-label="Password requirements">
              {[
                { label: "At least 8 characters", check: password.length >= 8 },
                { label: "One uppercase letter", check: /[A-Z]/.test(password) },
                { label: "One lowercase letter", check: /[a-z]/.test(password) },
                { label: "One number", check: /\d/.test(password) },
              ].map((r) => (
                <li key={r.label} className={`flex items-center gap-1.5 ${r.check ? "text-emerald-600" : ""}`}>
                  <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${r.check ? "bg-emerald-500" : "bg-gray-300"}`} />
                  {r.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {mode === "signup" && (
          <div className="space-y-1">
            <label className="flex items-start gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => { setConsent(e.target.checked); setFieldErrors((p) => ({ ...p, consent: undefined })); }}
                className="mt-0.5"
                aria-invalid={!!fieldErrors.consent}
              />
              <span>
                I agree to the <Link href="/terms-and-conditions" className="text-blue-600 underline font-medium">Terms</Link> and{" "}
                <Link href="/privacy-policy" className="text-blue-600 underline font-medium">Privacy Policy</Link>, and understand this is educational, not medical advice.
              </span>
            </label>
            {fieldErrors.consent && <p className="text-xs text-red-500">{fieldErrors.consent}</p>}
          </div>
        )}

        <TurnstileWidget onToken={onToken} />

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors min-h-[44px]"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        {mode === "signup" ? (
          <>Already have an account? <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">Sign in</Link></>
        ) : (
          <>New here? <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700">Create an account</Link></>
        )}
      </p>

      {mode === "login" && (
        <p className="mt-2 text-center text-xs text-gray-400">
          <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">Forgot your password?</Link>
        </p>
      )}
    </div>
  );
}
