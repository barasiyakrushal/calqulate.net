"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ACTIVITY_LEVELS, maintenancePlan } from "@/lib/glp1/maintenance";
import { parseNumber } from "@/lib/utils";
import { Flame, Beef, ShieldCheck, CalendarCheck, ArrowRight, Target, LineChart } from "lucide-react";

type Unit = "kg" | "lbs";

export function MaintenancePlanner() {
  const [unit, setUnit] = useState<Unit>("lbs");
  const [sex, setSex] = useState<"male" | "female">("female");
  const [weight, setWeight] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [age, setAge] = useState("");
  const [activity, setActivity] = useState<number>(1.375);

  const heightCmNum = useMemo(() => {
    if (unit === "kg") return parseNumber(heightCm);
    const inches = parseNumber(heightFt) * 12 + parseNumber(heightIn);
    return inches * 2.54;
  }, [unit, heightCm, heightFt, heightIn]);

  const weightNum = parseNumber(weight);
  const ageNum = parseNumber(age);
  const valid = weightNum > 0 && heightCmNum > 0 && ageNum > 0;

  const plan = useMemo(
    () => (valid ? maintenancePlan(weightNum, unit, heightCmNum, ageNum, sex, activity) : null),
    [valid, weightNum, unit, heightCmNum, ageNum, sex, activity]
  );

  const guardHigh = plan ? Math.round((weightNum + plan.guardrailUp) * 10) / 10 : 0;

  return (
    <div className="mx-auto max-w-3xl">
      {/* INPUTS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">Weight Maintenance Planner</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your numbers for holding your weight — calories, protein, and a regain guardrail.
            </p>
          </div>
        </div>

        {/* Unit + sex */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
            {(["lbs", "kg"] as const).map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => setUnit(x)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  unit === x ? "bg-emerald-600 text-white" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {x}
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
            {(["female", "male"] as const).map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => setSex(x)}
                className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition ${
                  sex === x ? "bg-emerald-600 text-white" : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        {/* Weight / height / age */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Goal weight</span>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={unit === "lbs" ? "e.g. 165" : "e.g. 75"}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-10 text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{unit}</span>
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Age</span>
            <input
              type="number"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 42"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </label>

          <div className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Height</span>
            {unit === "lbs" ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    placeholder="ft"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-8 text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">ft</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    placeholder="in"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-8 text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">in</span>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="e.g. 170"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-10 text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">cm</span>
              </div>
            )}
          </div>
        </div>

        {/* Activity */}
        <div className="mt-4">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Activity level</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ACTIVITY_LEVELS.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => setActivity(a.value)}
                aria-pressed={activity === a.value}
                className={`rounded-xl border-2 px-2 py-2 text-center transition-all ${
                  activity === a.value
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                    : "border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800"
                }`}
              >
                <span className="block text-sm font-bold text-slate-900 dark:text-white">{a.label}</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">{a.hint}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULT */}
      {plan ? (
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-center dark:border-emerald-800 dark:bg-emerald-950/20">
              <Flame className="mx-auto h-6 w-6 text-emerald-600" />
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Maintenance calories</p>
              <p className="mt-1 text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                {plan.maintenanceCalories.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">kcal/day to hold your weight</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Beef className="mx-auto h-6 w-6 text-emerald-600" />
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Daily protein</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white">
                {plan.proteinGramsLow}–{plan.proteinGramsHigh}
                <span className="text-lg"> g</span>
              </p>
              <p className="text-xs text-slate-500">protects the muscle that holds it off</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 text-center dark:border-amber-800 dark:bg-amber-950/20">
              <ShieldCheck className="mx-auto h-6 w-6 text-amber-600" />
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Regain guardrail</p>
              <p className="mt-1 text-3xl font-extrabold text-amber-700 dark:text-amber-400">
                {guardHigh} {unit}
              </p>
              <p className="text-xs text-slate-500">act if you cross this</p>
            </div>
          </div>

          {/* The plan */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="font-bold text-slate-900 dark:text-white">Your maintenance rules</h4>
            <ul className="mt-3 space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <Flame className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                Eat around <strong>{plan.maintenanceCalories.toLocaleString()} kcal/day</strong>. Appetite returns as you lose the deficit — this is your new target, not your old intake.
              </li>
              <li className="flex items-start gap-2">
                <Beef className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                Keep protein at <strong>{plan.proteinGramsLow}–{plan.proteinGramsHigh} g/day</strong> and lift 2–3×/week. Muscle is your metabolism&apos;s insurance policy.
              </li>
              <li className="flex items-start gap-2">
                <CalendarCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                Weigh in <strong>weekly</strong>, same day and conditions. A trend beats any single number.
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                If you cross <strong>{guardHigh} {unit}</strong> and stay there for 2+ weeks, tighten up early — don&apos;t wait for a big regain. Discuss dose questions with your prescriber.
              </li>
            </ul>
          </div>

          {/* Premium forecasts CTA */}
          <div className="flex flex-col items-start gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <LineChart className="mt-0.5 h-7 w-7 flex-shrink-0" />
              <div>
                <p className="font-bold">Keep it off on autopilot.</p>
                <p className="mt-1 max-w-md text-sm text-emerald-50">
                  Calqulate forecasts your weight trajectory, catches drift before the guardrail, and keeps your
                  maintenance calories and protein current as your body changes.
                </p>
              </div>
            </div>
            <Link
              href="/signup?next=/dashboard/glp1"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            >
              See my forecast <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/40">
          Enter your goal weight, height, and age to build your maintenance plan.
        </div>
      )}

      <p className="mt-5 text-xs leading-relaxed text-slate-400">
        Estimates from the Mifflin-St Jeor equation — a starting point, not a prescription. Adjust based on your
        real trend over 2–3 weeks. Not medical or nutritional advice.
      </p>
    </div>
  );
}

export default MaintenancePlanner;
