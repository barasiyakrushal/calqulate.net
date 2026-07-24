"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { search } from "@/lib/search/engine";

/**
 * Ava — Calqulate's on-site health guide.
 * A real-time, intent-matching assistant: it routes users straight to the right
 * calculator or tracker (via the site's own Trie + fuzzy search), answers the
 * common questions, surfaces pricing, and hands off to email for anything specific.
 * Fully client-side — instant, no API cost.
 */

const BOT_NAME = "Ava";
const SUPPORT_EMAIL = "krushal.barasiya@calqulate.net";

interface Action {
  label: string;
  href: string;
  /** external = mailto/new tab; internal links navigate in-app. */
  external?: boolean;
}
interface Msg {
  role: "bot" | "user";
  text: string;
  actions?: Action[];
  chips?: string[];
}

const GREETING: Msg = {
  role: "bot",
  text: `Hi, I'm ${BOT_NAME} 👋 your Calqulate health guide. Tell me what you're trying to figure out — a number you got, a calculator you need, or how the tracker works — and I'll point you to the right place.`,
  chips: ["Pricing", "Heart age", "GLP-1 & muscle", "Prediabetes / A1c", "Install the app", "Talk to a human"],
};

function has(text: string, ...words: string[]) {
  return words.some((w) => text.includes(w));
}

/** The brain: map a user message to a helpful reply + navigation actions. */
function respond(raw: string): Msg {
  const t = raw.toLowerCase().trim();

  if (!t) {
    return { role: "bot", text: "Ask me anything — or tap one of the options below.", chips: GREETING.chips };
  }

  // Greeting
  if (has(t, "hi", "hello", "hey", "yo ") || t === "hey" || t === "hi") {
    return { role: "bot", text: `Hey! I'm ${BOT_NAME}. What can I help you find today?`, chips: GREETING.chips };
  }

  // Pricing
  if (has(t, "price", "pricing", "cost", "how much", "subscribe", "subscription", "plan", "free", "pay", "trial")) {
    return {
      role: "bot",
      text: "Calqulate Vitals is one simple plan — $9.99/mo or $79/yr (save ~34%). The calculators and your first metabolic snapshot are completely free, no account needed. Cancel anytime, and you can export or delete your data whenever you like.",
      actions: [
        { label: "See plans & how it works", href: "/how-it-works#pricing" },
        { label: "Get my free score", href: "/product/metabolic-health-tracker" },
      ],
      chips: ["What do I get for paying?", "Heart age", "Talk to a human"],
    };
  }

  // Human / email / support
  if (has(t, "human", "email", "contact", "support", "talk to", "real person", "help me", "agent")) {
    return {
      role: "bot",
      text: `Happy to get you a real answer. For anything specific, email Krushal directly at ${SUPPORT_EMAIL} — you'll hear back personally.`,
      actions: [
        { label: `Email ${SUPPORT_EMAIL}`, href: `mailto:${SUPPORT_EMAIL}?subject=Calqulate%20question`, external: true },
        { label: "Open contact form", href: "/contact-us" },
      ],
    };
  }

  // How it works
  if (has(t, "how it works", "how does it work", "what is calqulate", "what is vitals", "explain", "what do you do")) {
    return {
      role: "bot",
      text: "Calqulate turns your numbers into a tracked health score plus your 10-year heart and diabetes risk, then tells you the single highest-impact change to make next. Snapshot → Track → Act → Reverse. Here's the full walkthrough:",
      actions: [{ label: "How Calqulate Vitals works", href: "/how-it-works" }],
      chips: ["Pricing", "Heart age", "Prediabetes / A1c"],
    };
  }

  // Heart age
  if (has(t, "heart age", "vascular age", "how old is my heart", "framingham")) {
    return {
      role: "bot",
      text: "Let's find out how old your heart really is — and track it getting younger. Use the free calculator for a snapshot, or the tracker to watch it over time.",
      actions: [
        { label: "Heart Age Tracker", href: "/product/heart-age-tracker" },
        { label: "Free Heart Age Calculator", href: "/health/heart-age-calculator" },
      ],
    };
  }

  // GLP-1 / muscle
  if (has(t, "glp", "ozempic", "wegovy", "zepbound", "semaglutide", "tirzepatide", "muscle", "mounjaro")) {
    return {
      role: "bot",
      text: "On a GLP-1, what matters is losing fat without losing muscle — and not bouncing back when you stop. The GLP-1 Progress Tracker is built for exactly that.",
      actions: [
        { label: "GLP-1 Progress Tracker", href: "/product/glp1-progress-tracker" },
        { label: "Am I losing muscle? (answer)", href: "/answers/losing-muscle-on-ozempic" },
        { label: "Lean Body Mass Calculator", href: "/health/lean-body-mass-calculator" },
      ],
    };
  }

  // Prediabetes / A1c / blood sugar
  if (has(t, "a1c", "prediabetes", "pre-diabetes", "blood sugar", "glucose", "diabetes")) {
    return {
      role: "bot",
      text: "A borderline A1c is one of the most reversible numbers in medicine if you act early. Check your risk free, and here's a plain-English answer on what a 5.7 means and what to do.",
      actions: [
        { label: "A1c 5.7 — what to do", href: "/answers/a1c-5-7-what-to-do" },
        { label: "Diabetes Risk Calculator", href: "/health/diabetes-risk-calculator" },
        { label: "Metabolic Health Tracker", href: "/product/metabolic-health-tracker" },
      ],
    };
  }

  // Heart risk / ASCVD / cholesterol
  if (has(t, "ascvd", "heart risk", "heart attack", "heart disease", "stroke", "cholesterol", "statin", "calcium score")) {
    return {
      role: "bot",
      text: "Let's get you a real 10-year heart risk number instead of guessing — then I can show you what lowers it most.",
      actions: [
        { label: "What does my ASCVD risk mean?", href: "/answers/what-does-ascvd-risk-mean" },
        { label: "ASCVD Risk Calculator", href: "/health/ascvd-risk-calculator" },
        { label: "Cholesterol Ratio Calculator", href: "/health/cholesterol-ratio-calculator" },
      ],
    };
  }

  // Face shape (direct route, as requested)
  if (has(t, "face shape", "face calculator", "jawline", "golden ratio", "hairstyle")) {
    return {
      role: "bot",
      text: "Here you go — the Face Shape Detector will identify your structure and suggest styles that suit you:",
      actions: [
        { label: "Face Shape Calculator", href: "/health/face-shape-calculator" },
        { label: "Golden Ratio Face Calculator", href: "/health/golden-ratio-face-calculator" },
      ],
    };
  }

  // Otherwise: use the site search engine to route them to the best calculator(s).
  const results = search(raw, 4);
  if (results.length > 0) {
    return {
      role: "bot",
      text: "Here's what matches — tap one to jump straight there:",
      actions: results.map((r) => ({ label: r.title, href: r.url })),
      chips: ["Pricing", "Talk to a human"],
    };
  }

  // Fallback
  return {
    role: "bot",
    text: `I couldn't find a match for that. You can browse every calculator, read our health answers, or email Krushal at ${SUPPORT_EMAIL} for anything specific.`,
    actions: [
      { label: "Browse all calculators", href: "/search" },
      { label: "Health questions, answered", href: "/answers" },
      { label: `Email ${SUPPORT_EMAIL}`, href: `mailto:${SUPPORT_EMAIL}?subject=Calqulate%20question`, external: true },
    ],
  };
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  function send(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setMessages((m) => [...m, { role: "user", text: clean }]);
    setInput("");
    setTyping(true);
    // Small delay so it feels like a real reply, not an instant dump.
    setTimeout(() => {
      setMessages((m) => [...m, respond(clean)]);
      setTyping(false);
    }, 450);
  }

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat with Ava, the Calqulate health guide"
          className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-colors min-h-[44px]"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-semibold">Ask {BOT_NAME}</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Chat with Ava"
          className="fixed z-50 flex flex-col bg-white shadow-2xl ring-1 ring-black/5
                     inset-x-0 bottom-0 top-16 rounded-t-2xl
                     sm:inset-auto sm:bottom-5 sm:right-5 sm:top-auto sm:h-[600px] sm:w-[390px] sm:rounded-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="leading-tight">
                <div className="font-bold">{BOT_NAME}</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300" /> Calqulate health guide · online
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-md p-1.5 hover:bg-white/15">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-gray-50 px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={m.role === "user" ? "max-w-[80%]" : "max-w-[88%]"}>
                  <div
                    className={`whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-emerald-600 text-white rounded-br-sm"
                        : "bg-white text-gray-800 ring-1 ring-gray-100 rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Action buttons (navigate / email) */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2">
                      {m.actions.map((a) =>
                        a.external ? (
                          <a
                            key={a.href}
                            href={a.href}
                            className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            {a.label} <span aria-hidden>↗</span>
                          </a>
                        ) : (
                          <Link
                            key={a.href}
                            href={a.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            {a.label} <span aria-hidden>→</span>
                          </Link>
                        ),
                      )}
                    </div>
                  )}

                  {/* Quick-reply chips */}
                  {m.chips && m.chips.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.chips.map((c) => (
                        <button
                          key={c}
                          onClick={() => send(c)}
                          className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white px-3.5 py-3 ring-1 ring-gray-100">
                  <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 py-2.5 sm:py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a calculator, your numbers, pricing\u2026"
              className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 sm:py-2 text-sm focus:border-emerald-500 focus:outline-none"
              aria-label="Type your message"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send"
              className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="bg-white pb-2 text-center text-[10px] text-gray-400">
            Educational guidance only — not medical advice.
          </p>
        </div>
      )}
    </>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: delay }} />;
}
