"use client";

import { useState } from "react";
import Link from "next/link";
import { SIDE_EFFECTS, timingAtWeek, type SideEffect } from "@/lib/glp1/sideEffects";
import { CalendarClock, ArrowRight } from "lucide-react";

const AXIS_WEEKS = 24;

// Only symptoms that follow a start-and-fade arc appear on the timeline.
const TIMELINE_EFFECTS = SIDE_EFFECTS.filter((s) => s.timeline);

function pct(week: number) {
  return Math.min(100, Math.max(0, (week / AXIS_WEEKS) * 100));
}

/**
 * Interactive Side Effect Timeline — drag the week marker and see which GLP-1
 * side effects typically start, peak, and fade at each point. Each symptom's bar
 * spans its onset → settles window, with a dot at its usual peak.
 */
export function SideEffectTimeline() {
  const [week, setWeek] = useState(2);

  const activeNow = TIMELINE_EFFECTS.filter((s) => {
    const t = timingAtWeek(s, week);
    return t === "starting" || t === "peak" || t === "easing";
  });

  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <CalendarClock className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">Side Effect Timeline</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Move the slider to your week and see what&apos;s typical now — and what should be fading.
          </p>
        </div>
      </div>

      {/* Week control */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-900 dark:text-white">Your week on the medication</span>
          <span className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            Week {week}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={AXIS_WEEKS}
          value={week}
          onChange={(e) => setWeek(Number(e.target.value))}
          className="w-full accent-emerald-600"
          aria-label="Your week on the medication"
        />
      </div>

      {/* Chart */}
      <div className="relative mt-6">
        {/* "You are here" vertical line across the whole chart */}
        <div className="pointer-events-none absolute inset-y-0 z-10" style={{ left: `${pct(week)}%` }}>
          <div className="h-full w-0.5 bg-emerald-500/70" />
        </div>

        <div className="space-y-2.5">
          {TIMELINE_EFFECTS.map((s) => {
            const t = s.timeline!;
            const left = pct(t.onsetWeek);
            const width = pct(t.easesWeek) - pct(t.onsetWeek);
            const peakLeft = pct(t.peakWeek);
            const status = timingAtWeek(s, week);
            const active = status === "starting" || status === "peak" || status === "easing";
            return (
              <div key={s.slug} className="grid grid-cols-[5.5rem_1fr] items-center gap-2 sm:grid-cols-[8rem_1fr] sm:gap-3">
                <span
                  className={`truncate text-xs font-semibold sm:text-sm ${
                    active ? "text-slate-900 dark:text-white" : "text-slate-400"
                  }`}
                >
                  {s.short}
                </span>
                <div className="relative h-4 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`absolute top-0 h-full rounded-full transition-opacity ${
                      active
                        ? "bg-gradient-to-r from-amber-300 to-emerald-300 opacity-100 dark:from-amber-500/50 dark:to-emerald-500/50"
                        : "bg-slate-200 opacity-70 dark:bg-slate-700"
                    }`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                  {/* peak dot */}
                  <div
                    className={`absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white ${
                      active ? "bg-red-500" : "bg-slate-400"
                    }`}
                    style={{ left: `${peakLeft}%` }}
                    title="Usual peak"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Axis labels */}
        <div className="mt-2 grid grid-cols-[5.5rem_1fr] gap-2 sm:grid-cols-[8rem_1fr] sm:gap-3">
          <span />
          <div className="flex justify-between text-[10px] text-slate-400 sm:text-xs">
            <span>Wk 1</span>
            <span>Wk 6</span>
            <span>Wk 12</span>
            <span>Wk 18</span>
            <span>Wk 24</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500" /> Usual peak
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-5 rounded-full bg-gradient-to-r from-amber-300 to-emerald-300" /> Onset → fades
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-0.5 bg-emerald-500" /> You are here
        </span>
      </div>

      {/* What's active now */}
      <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          Typical around week {week}:
        </p>
        {activeNow.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {activeNow.map((s) => (
              <Link
                key={s.slug}
                href={`/health/glp-1-side-effects/${s.slug}`}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300"
              >
                {s.short} <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Most early GI side effects have usually settled by now. New or worsening symptoms this late are worth
            raising with your prescriber.
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        A general pattern, not a rule — timing shifts with your drug, dose, and how fast it was raised. Bars reset
        somewhat after each dose increase.
      </p>
    </div>
  );
}

export default SideEffectTimeline;
