"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  TAPER_DRUGS,
  taperSchedule,
  TAPER_WEEKS_PER_STEP,
  type TaperDrug,
} from "@/lib/glp1/tapering";
import { TrendingDown, ArrowRight, CalendarCheck, Beef, Dumbbell, Info, Flag } from "lucide-react";

/**
 * Tapering Planner — builds a conservative down-titration schedule from the
 * user's current dose, plus the non-negotiables to hold during a taper. There is
 * no official taper protocol, so this is framed as a common approach a prescriber
 * personalizes — never a prescription.
 */
export function TaperingPlanner() {
  const [drugId, setDrugId] = useState(TAPER_DRUGS[0].id);
  const drug: TaperDrug = TAPER_DRUGS.find((d) => d.id === drugId) ?? TAPER_DRUGS[0];
  const [currentMg, setCurrentMg] = useState<number>(drug.ladder[drug.ladder.length - 1]);

  const schedule = useMemo(() => taperSchedule(drug, currentMg), [drug, currentMg]);
  const totalWeeks = schedule.length * TAPER_WEEKS_PER_STEP;

  const pickDrug = (id: string) => {
    setDrugId(id);
    const d = TAPER_DRUGS.find((x) => x.id === id)!;
    setCurrentMg(d.ladder[d.ladder.length - 1]);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">Tapering Planner</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              A gradual step-down beats stopping cold. Here&apos;s a common schedule to take to your prescriber.
            </p>
          </div>
        </div>

        {/* Drug */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-bold text-slate-900 dark:text-white">1. Your medication</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {TAPER_DRUGS.map((d) => {
              const active = d.id === drugId;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => pickDrug(d.id)}
                  aria-pressed={active}
                  className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${
                    active
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800"
                  }`}
                >
                  <span className="block font-bold text-slate-900 dark:text-white">{d.drug}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{d.brands}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current dose */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-bold text-slate-900 dark:text-white">2. Your current weekly dose</p>
          <div className="flex flex-wrap gap-2">
            {[...drug.ladder].sort((a, b) => a - b).map((mg) => {
              const active = mg === currentMg;
              return (
                <button
                  key={mg}
                  type="button"
                  onClick={() => setCurrentMg(mg)}
                  aria-pressed={active}
                  className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all ${
                    active
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {mg} mg
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white">Your step-down schedule</h3>
          <span className="text-xs font-semibold text-slate-500">
            ~{totalWeeks} weeks · {TAPER_WEEKS_PER_STEP} wks/step
          </span>
        </div>

        <ol className="mt-4 space-y-1">
          {schedule.map((s, i) => (
            <li key={s.doseMg} className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                    i === 0
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  }`}
                >
                  {i + 1}
                </div>
                {i < schedule.length && <div className="h-6 w-0.5 bg-slate-200 dark:bg-slate-700" />}
              </div>
              <div className="flex-1 pb-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {s.doseMg} mg{" "}
                  <span className="font-normal text-slate-500">
                    · weeks {s.startWeek}–{s.startWeek + TAPER_WEEKS_PER_STEP - 1}
                  </span>
                </p>
              </div>
            </li>
          ))}
          {/* Stop */}
          <li className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900">
              <Flag className="h-4 w-4" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              Off — week {totalWeeks + 1} onward{" "}
              <span className="font-normal text-slate-500">· maintain on habits</span>
            </p>
          </li>
        </ol>

        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
          {drug.note} Hold longer at any step where hunger surges or weight ticks up — and only continue down while
          things stay stable. There is no official manufacturer taper protocol; your prescriber sets the real plan.
        </p>
      </div>

      {/* Non-negotiables during taper */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-bold text-slate-900 dark:text-white">Hold these the whole way down</h3>
        <ul className="mt-3 space-y-3">
          {[
            { icon: Beef, text: "Protein first, every meal (about 1.2–1.6 g/kg). This is what holds onto muscle as appetite returns." },
            { icon: Dumbbell, text: "Resistance training 2–3×/week — the strongest protection against regain." },
            { icon: CalendarCheck, text: "Weigh in weekly. Catch drift early, while it's 2–3 lbs and easy to correct." },
            { icon: Info, text: "Expect appetite to come back at each step down. That's the taper working — plan meals so it doesn't run the show." },
          ].map((r, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <r.icon className="h-4 w-4" />
              </span>
              <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{r.text}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/health/glp-1-maintenance"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
        >
          Get your maintenance calories &amp; protein numbers <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-slate-400">
        Educational schedule only — a common, conservative approach, not a prescription. Doses, timing, and
        whether to stop at all are decisions for you and your prescriber.
      </p>
    </div>
  );
}

export default TaperingPlanner;
