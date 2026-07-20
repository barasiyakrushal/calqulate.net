"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

const SHOW_DELAY_MS = 60_000; // 60 seconds
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // re-show dismissers after 3 days
const SUBMITTED_KEY = "cv_feedback_submitted";
const DISMISSED_AT_KEY = "cv_feedback_dismissed_at";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FeedbackPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  // Decide whether (and when) to show the popup.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(SUBMITTED_KEY)) return; // submitted before → never again
      const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY) ?? 0);
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return; // still in cooldown
    } catch {
      // private mode / storage blocked — fall through and just show once this session
    }
    const t = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // Focus the email field + lock body scroll + Escape to close, while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusT = setTimeout(() => emailRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(focusT);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    setOpen(false);
    if (status === "done") return;
    try {
      localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!EMAIL_RE.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (message.trim().length < 2) {
      setErrorMsg("Please share a little feedback.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
          company,
          sourceUrl: typeof window !== "undefined" ? window.location.pathname : "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("done");
      try {
        localStorage.setItem(SUBMITTED_KEY, "1");
        localStorage.removeItem(DISMISSED_AT_KEY);
      } catch {
        /* ignore */
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={dismiss}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-feedback-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close feedback dialog"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <X className="h-5 w-5" />
        </button>

        {status === "done" ? (
          <div className="py-2 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-3xl">
              🙏
            </div>
            <h2 id="cv-feedback-title" className="text-xl font-bold text-gray-900">
              Thank you so much!
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              We&apos;ve received your feedback and we genuinely read every word. We&apos;ll review your
              suggestions and roll the improvements into our <strong>next update</strong> — that&apos;s a promise.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Keep an eye on your inbox — we just sent you a little something. 💚
            </p>
            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              You&apos;re welcome!
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h2 id="cv-feedback-title" className="pr-8 text-xl font-bold text-gray-900">
              Help us improve Calqulate <span className="text-emerald-600">Vitals</span> 💚
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              We&apos;d love to hear what you think — what you love, what&apos;s missing, or what we could do
              better. Your feedback directly shapes our next update.
            </p>

            <label htmlFor="cv-fb-message" className="mt-5 block text-sm font-medium text-gray-700">
              Your feedback
            </label>
            <textarea
              id="cv-fb-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={4000}
              required
              placeholder="What would make Calqulate Vitals better for you?"
              className="mt-1.5 w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            />

            <label htmlFor="cv-fb-email" className="mt-4 block text-sm font-medium text-gray-700">
              Your email
            </label>
            <input
              id="cv-fb-email"
              ref={emailRef}
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            />
            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
              Why your email? So we can tell you when the improvements you suggested go live — and send the
              occasional health update. No spam, unsubscribe anytime.
            </p>

            {/* Honeypot — hidden from humans */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            {errorMsg && <p className="mt-3 text-sm text-red-600">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {status === "loading" ? "Sending…" : "Send feedback"}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="mt-2 w-full rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
            >
              Maybe later
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
