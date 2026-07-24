"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  RefreshCw,
  CalendarClock,
  Syringe,
  Droplets,
  Beef,
  Dumbbell,
  LineChart,
  PartyPopper,
  Sparkles,
} from "lucide-react";

/**
 * "Your first 30 days on a GLP-1" — an interactive, self-saving checklist for
 * someone who has a prescription in hand and no plan. State persists to
 * localStorage so the list survives refreshes and return visits, which is what
 * makes it a natural signup trigger (the paid protocol picks up where this ends).
 *
 * Educational and general — it never replaces the dosing and instructions a
 * prescriber gives. Tasks link out to the free Calqulate GLP-1 tools.
 */

const STORAGE_KEY = "calqulate_glp1_first30_v1";

interface Task {
  id: string;
  title: string;
  detail: string;
  tool?: { label: string; href: string };
}

interface Phase {
  id: string;
  label: string;
  window: string;
  icon: React.ComponentType<{ className?: string }>;
  tasks: Task[];
}

const PHASES: Phase[] = [
  {
    id: "prep",
    label: "Before your first shot",
    window: "Day 0",
    icon: Syringe,
    tasks: [
      {
        id: "prep-dose",
        title: "Confirm your exact starting dose",
        detail:
          "Almost everyone starts at the lowest dose for the first 4 weeks — it's about tolerance, not speed. Match the number on your pen or vial to what your prescriber wrote.",
        tool: { label: "Check the dose schedule", href: "/health/semaglutide-dose-calculator" },
      },
      {
        id: "prep-store",
        title: "Store it correctly",
        detail:
          "Keep unused pens in the fridge (not the freezer). Once in use, most pens are fine at room temperature for a set number of days — check your leaflet.",
      },
      {
        id: "prep-supplies",
        title: "Get your supplies ready",
        detail:
          "Needles (if not built in), a sharps container, and alcohol wipes. If you're reconstituting from a vial, double-check your units before you draw.",
        tool: { label: "Unit / dose converter", href: "/health/glp-1-unit-converter" },
      },
      {
        id: "prep-day",
        title: "Pick your weekly injection day",
        detail:
          "Choose a consistent day you'll remember. A quieter day is smart in case of early side effects. Then set a recurring phone reminder.",
        tool: { label: "Plan my injection day", href: "/health/glp-1-injection-day-calculator" },
      },
      {
        id: "prep-baseline",
        title: "Capture your day-zero baseline",
        detail:
          "Weight, waist measurement, and a photo. Month 1 is where the scale can be noisy — a real baseline lets you see true progress later.",
      },
      {
        id: "prep-stock",
        title: "Stock protein and electrolytes",
        detail:
          "Appetite drops fast. Have easy protein (Greek yogurt, eggs, shakes) and electrolytes on hand so you don't under-eat protein or get dehydrated.",
      },
    ],
  },
  {
    id: "week1",
    label: "Week 1",
    window: "Days 1–7",
    icon: Droplets,
    tasks: [
      {
        id: "w1-inject",
        title: "Take your first dose",
        detail:
          "Inject into the fat of your abdomen, thigh, or upper arm, rotating sites each week. It's normal to feel nothing dramatic at first.",
      },
      {
        id: "w1-eat",
        title: "Eat smaller, slower meals",
        detail:
          "Your stomach empties more slowly now. Smaller portions, eaten slowly, and stopping at 'satisfied' prevents most nausea.",
      },
      {
        id: "w1-protein",
        title: "Hit a protein target every day",
        detail:
          "Aim for roughly 1.2–1.6 g of protein per kg of body weight to protect muscle while you lose fat. Protein first, at every meal.",
        tool: { label: "Find my protein target", href: "/health/macro-calculator" },
      },
      {
        id: "w1-hydrate",
        title: "Drink more water than feels necessary",
        detail:
          "Reduced appetite means less fluid from food. Aim for pale-yellow urine. Dehydration is behind a lot of week-1 headaches and fatigue.",
      },
      {
        id: "w1-log",
        title: "Log how you feel",
        detail:
          "Note any nausea, appetite change, or energy dips. Mild symptoms usually fade within days — tracking them tells you what's normal for you.",
      },
    ],
  },
  {
    id: "week2",
    label: "Week 2",
    window: "Days 8–14",
    icon: Beef,
    tasks: [
      {
        id: "w2-inject",
        title: "Second dose, same day, same dose",
        detail:
          "Staying at the starter dose is correct — don't rush up. Consistency on your chosen day matters more than anything else this month.",
      },
      {
        id: "w2-gut",
        title: "Get ahead of constipation",
        detail:
          "Fiber, water, and daily movement. Slowed digestion plus eating less is a common cause of week-2 constipation — prevention beats fixing it.",
      },
      {
        id: "w2-walk",
        title: "Add a 10–15 minute walk after meals",
        detail:
          "Post-meal walks blunt blood-sugar spikes and help digestion. Small and daily beats occasional and intense right now.",
      },
      {
        id: "w2-scale",
        title: "Stop weighing yourself daily",
        detail:
          "Water shifts make daily numbers meaningless and demoralising. Weigh once a week, same time, same conditions.",
      },
    ],
  },
  {
    id: "week3",
    label: "Week 3",
    window: "Days 15–21",
    icon: Dumbbell,
    tasks: [
      {
        id: "w3-strength",
        title: "Start resistance training",
        detail:
          "Two or three short strength sessions a week signal your body to keep muscle. On a GLP-1, muscle is the thing you most want to protect.",
      },
      {
        id: "w3-comp",
        title: "Check fat vs. muscle, not just weight",
        detail:
          "The scale can't tell fat loss from muscle loss. Estimate your body composition so you know your loss is coming from the right place.",
        tool: { label: "Fat-vs-muscle tracker", href: "/health/glp-1-dose-calculator" },
      },
      {
        id: "w3-plateau",
        title: "Expect the first stall — and don't panic",
        detail:
          "A flat week around now is normal, not failure. Appetite is still suppressed and fat is still coming off even when the scale pauses.",
      },
      {
        id: "w3-refill",
        title: "Check your refill timing",
        detail:
          "Pharmacy delays are the #1 reason people miss a dose. Confirm your next fill now so there's no gap that resets your tolerance.",
      },
    ],
  },
  {
    id: "week4",
    label: "Week 4",
    window: "Days 22–30",
    icon: LineChart,
    tasks: [
      {
        id: "w4-review",
        title: "Review your month-1 numbers",
        detail:
          "Compare today's weight, waist, and photo to your day-zero baseline. Look at the trend line, not any single day.",
      },
      {
        id: "w4-titration",
        title: "Prepare for the titration conversation",
        detail:
          "Most plans step up the dose after 4 weeks — but only if side effects are manageable. Bring your logged symptoms to your prescriber; the decision is theirs.",
      },
      {
        id: "w4-missed",
        title: "Know what to do if you miss a dose",
        detail:
          "Life happens. Knowing your medication's timing window ahead of time means a late or missed dose doesn't derail you.",
        tool: { label: "Half-life / missed-dose window", href: "/health/glp-1-half-life-calculator" },
      },
      {
        id: "w4-plan",
        title: "Set your month-2 plan with data",
        detail:
          "You now know your body's response. Decide your protein, movement, and tracking plan for the next month while it's fresh.",
        tool: { label: "Track progress over time", href: "/product/glp1-progress-tracker" },
      },
    ],
  },
];

const ALL_TASK_IDS = PHASES.flatMap((p) => p.tasks.map((t) => t.id));
const TOTAL = ALL_TASK_IDS.length;

export function First30DaysChecklist() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  // Load saved progress after mount to avoid SSR/hydration mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist on every change, once hydrated.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
    } catch {
      /* storage full or unavailable — non-fatal */
    }
  }, [done, hydrated]);

  const completedCount = useMemo(
    () => ALL_TASK_IDS.filter((id) => done[id]).length,
    [done]
  );
  const pct = Math.round((completedCount / TOTAL) * 100);
  const allDone = completedCount === TOTAL;

  const toggle = (id: string) => setDone((prev) => ({ ...prev, [id]: !prev[id] }));
  const reset = () => setDone({});

  return (
    <div className="mx-auto max-w-3xl">
      {/* Sticky progress header */}
      <div className="sticky top-16 z-10 -mx-4 mb-6 rounded-2xl border border-emerald-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:mx-0 sm:px-6 dark:border-emerald-900/50 dark:bg-slate-900/95">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Your 30-day progress</p>
            <p className="text-xs text-slate-500 dark:text-slate-400" suppressHydrationWarning>
              {completedCount} of {TOTAL} steps done
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-2xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400"
              suppressHydrationWarning
            >
              {pct}%
            </span>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* Completion banner → signup trigger */}
      {allDone && (
        <div className="mb-6 flex flex-col items-start gap-3 rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-800 dark:from-emerald-950/40 dark:to-teal-950/40">
          <div className="flex items-start gap-3">
            <PartyPopper className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">You made it through month one.</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Month two is where an adaptive plan pays off. Keep the momentum with your titration and
                protein dialed in automatically.
              </p>
            </div>
          </div>
          <Link
            href="/signup?next=/dashboard/glp1"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Build my month-2 plan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Phases */}
      <div className="space-y-5">
        {PHASES.map((phase) => {
          const phaseDone = phase.tasks.filter((t) => done[t.id]).length;
          const phaseComplete = phaseDone === phase.tasks.length;
          const PhaseIcon = phase.icon;
          return (
            <section
              key={phase.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Phase header */}
              <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-6 dark:border-slate-800 dark:bg-slate-800/40">
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                    phaseComplete
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  }`}
                >
                  {phaseComplete ? <Check className="h-5 w-5" /> : <PhaseIcon className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                      {phase.label}
                    </h3>
                    <span className="text-xs font-medium text-slate-400">{phase.window}</span>
                  </div>
                </div>
                <span
                  className="flex-shrink-0 text-xs font-semibold tabular-nums text-slate-400"
                  suppressHydrationWarning
                >
                  {phaseDone}/{phase.tasks.length}
                </span>
              </div>

              {/* Tasks */}
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {phase.tasks.map((task) => {
                  const checked = !!done[task.id];
                  return (
                    <li key={task.id}>
                      <div className="flex gap-3 px-4 py-4 sm:px-6">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          aria-label={task.title}
                          onClick={() => toggle(task.id)}
                          className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                            checked
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-300 bg-white hover:border-emerald-400 dark:border-slate-600 dark:bg-slate-800"
                          }`}
                        >
                          {checked && <Check className="h-4 w-4" strokeWidth={3} />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => toggle(task.id)}
                            className="block text-left"
                          >
                            <p
                              className={`font-semibold leading-snug transition-colors ${
                                checked
                                  ? "text-slate-400 line-through dark:text-slate-500"
                                  : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {task.title}
                            </p>
                            <p
                              className={`mt-1 text-sm leading-relaxed ${
                                checked
                                  ? "text-slate-300 dark:text-slate-600"
                                  : "text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {task.detail}
                            </p>
                          </button>
                          {task.tool && (
                            <Link
                              href={task.tool.href}
                              className="mt-2 inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300"
                            >
                              <Sparkles className="h-3 w-3" /> {task.tool.label}
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Persistent inline nudge (shown until finished) */}
      {!allDone && (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">Want this to run itself?</strong> Save your
              doses, weight, and side effects in one place and get an adaptive plan for month two and beyond.
            </p>
          </div>
          <Link
            href="/signup?next=/dashboard/glp1"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Start free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default First30DaysChecklist;
