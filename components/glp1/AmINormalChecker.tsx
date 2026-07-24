"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  SIDE_EFFECTS,
  FREQUENCY_LABEL,
  timingAtWeek,
  TIMING_COPY,
  type SideEffect,
} from "@/lib/glp1/sideEffects";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Stethoscope,
  HeartPulse,
} from "lucide-react";

const TONE: Record<string, string> = {
  amber: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200",
  red: "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200",
  slate: "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300",
};

/**
 * "Am I Normal?" cohort checker — pick a symptom and your week on the
 * medication, get a straight answer on how common it is, whether now is when
 * it typically peaks or eases, what helps, and when it's a red flag.
 */
export function AmINormalChecker() {
  const [slug, setSlug] = useState<string>(SIDE_EFFECTS[0].slug);
  const [week, setWeek] = useState<number>(2);

  const se: SideEffect = useMemo(
    () => SIDE_EFFECTS.find((s) => s.slug === slug) ?? SIDE_EFFECTS[0],
    [slug]
  );

  const status = timingAtWeek(se, week);
  const timing = TIMING_COPY[status];
  const isFoodDrink = se.category === "food-drink";

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <HeartPulse className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">Am I normal?</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tell us your symptom and how far in you are — we&apos;ll tell you if it&apos;s expected.
          </p>
        </div>
      </div>

      {/* Symptom */}
      <div className="mt-5">
        <label htmlFor="se-symptom" className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
          1. What are you experiencing?
        </label>
        <select
          id="se-symptom"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          {SIDE_EFFECTS.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.short}
            </option>
          ))}
        </select>
      </div>

      {/* Week */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="se-week" className="text-sm font-bold text-slate-900 dark:text-white">
            2. How long have you been on it?
          </label>
          <span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            Week {week}
          </span>
        </div>
        <input
          id="se-week"
          type="range"
          min={1}
          max={24}
          value={week}
          onChange={(e) => setWeek(Number(e.target.value))}
          className="w-full accent-emerald-600"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>Week 1</span>
          <span>Week 12</span>
          <span>Week 24+</span>
        </div>
      </div>

      {/* Verdict */}
      <div className="mt-6 space-y-4">
        {/* Headline chips */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Info className="h-3.5 w-3.5" /> {FREQUENCY_LABEL[se.frequency]}
          </span>
          {!isFoodDrink && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${TONE[timing.tone]}`}>
              {timing.label}
            </span>
          )}
        </div>

        {/* Reassurance */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
            <span>
              <strong>Yes, this is {se.howCommon}.</strong> {se.tldr}
              {!isFoodDrink && status === "peak" && " Right now is typically when it's at its worst — for most people it improves from here."}
              {!isFoodDrink && status === "settled" && " If it's newly appearing or getting worse this late, mention it to your prescriber."}
            </span>
          </p>
        </div>

        {/* What helps preview */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Stethoscope className="h-4 w-4 text-emerald-600" /> What helps
          </p>
          <ul className="space-y-1.5">
            {se.whatHelps.slice(0, 3).map((h) => (
              <li key={h} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Red flags */}
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900/50 dark:bg-red-950/20">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-red-800 dark:text-red-300">
            <AlertTriangle className="h-4 w-4" /> Call your doctor if
          </p>
          <ul className="space-y-1.5">
            {se.redFlags.map((r) => (
              <li key={r} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href={`/health/glp-1-side-effects/${se.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
        >
          Read the full guide on {se.short.toLowerCase()} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-slate-400">
        Educational guidance based on common patterns — not a diagnosis. Everyone responds differently; when in
        doubt, contact your prescriber.
      </p>
    </div>
  );
}

export default AmINormalChecker;
