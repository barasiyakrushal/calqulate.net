"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MEDICATIONS,
  projectWeightLoss,
  type MedicationEfficacy,
  type DoseEfficacy,
} from "@/lib/glp1/efficacy";
import { parseNumber } from "@/lib/utils";
import { TrendingDown, Scale, Info, ArrowRight, Sparkles } from "lucide-react";

type Unit = "kg" | "lbs";

export default function Glp1WeightLossProjectionCalculator() {
  const [unit, setUnit] = useState<Unit>("lbs");
  const [weight, setWeight] = useState("");
  const [medId, setMedId] = useState(MEDICATIONS[0].id);
  const [doseMg, setDoseMg] = useState(MEDICATIONS[0].doses[MEDICATIONS[0].doses.length - 1].doseMg);

  const med: MedicationEfficacy =
    MEDICATIONS.find((m) => m.id === medId) ?? MEDICATIONS[0];
  const dose: DoseEfficacy =
    med.doses.find((d) => d.doseMg === doseMg) ?? med.doses[med.doses.length - 1];

  const weightNum = parseNumber(weight);
  const valid = weightNum > 0;

  const projection = useMemo(
    () => (valid ? projectWeightLoss(weightNum, dose) : null),
    [weightNum, dose, valid]
  );

  const months = Math.round(med.horizonWeeks / 4.345);
  const u = unit;

  const fmt = (n: number) => (Math.round(n * 10) / 10).toLocaleString();

  const onPickMed = (id: string) => {
    setMedId(id);
    const m = MEDICATIONS.find((x) => x.id === id)!;
    // Default to the top maintenance dose of the newly-selected medication.
    setDoseMg(m.doses[m.doses.length - 1].doseMg);
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* INPUT CARD */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        {/* Medication */}
        <div>
          <p className="mb-2 text-sm font-bold text-slate-900 dark:text-white">1. Medication</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {MEDICATIONS.map((m) => {
              const active = m.id === medId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onPickMed(m.id)}
                  aria-pressed={active}
                  className={`rounded-xl border-2 px-4 py-3 text-left transition-all ${
                    active
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800"
                  }`}
                >
                  <span className="block font-bold text-slate-900 dark:text-white">{m.drug}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{m.brands}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dose */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-bold text-slate-900 dark:text-white">2. Weekly maintenance dose</p>
          <div className="flex flex-wrap gap-2">
            {med.doses.map((d) => {
              const active = d.doseMg === doseMg;
              return (
                <button
                  key={d.doseMg}
                  type="button"
                  onClick={() => setDoseMg(d.doseMg)}
                  aria-pressed={active}
                  className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all ${
                    active
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {d.doseMg} mg
                </button>
              );
            })}
          </div>
        </div>

        {/* Weight */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900 dark:text-white">3. Your current weight</p>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
              {(["lbs", "kg"] as const).map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => setUnit(x)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                    unit === x
                      ? "bg-emerald-600 text-white"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
                >
                  {x}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={unit === "lbs" ? "e.g. 220" : "e.g. 100"}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-lg font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
              {unit}
            </span>
          </div>
        </div>
      </div>

      {/* RESULT */}
      {projection ? (
        <div className="mt-6 space-y-5">
          {/* Headline */}
          <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 sm:p-8 dark:border-emerald-800 dark:from-emerald-950/40 dark:to-teal-950/40">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Projected at {months} months ({med.horizonWeeks} weeks)
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Average weight loss</p>
                <p className="text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 sm:text-5xl">
                  {fmt(projection.avgLossWeight)}
                  <span className="ml-1 text-2xl">{u}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">That&apos;s about</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                  −{fmt(projection.avgLossPct)}%
                </p>
              </div>
            </div>

            {/* From → To bar */}
            <div className="mt-6 flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <Scale className="h-4 w-4" /> {fmt(weightNum)} {u}
              </div>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                  style={{ width: `${Math.min(100, projection.avgLossPct * 3)}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                <TrendingDown className="h-4 w-4" /> {fmt(projection.avgFinalWeight)} {u}
              </div>
            </div>
          </div>

          {/* Realistic range */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <Info className="h-5 w-5 text-slate-400" /> Your realistic range
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Trials report a wide spread around the average. Most people who reach and tolerate this dose land
              somewhere in this band:
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Modest responder</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  −{fmt(projection.lowLossWeight)} {u}
                </p>
                <p className="text-xs text-slate-500">to {fmt(projection.lowFinalWeight)} {u}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-900/20">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Strong responder</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  −{fmt(projection.highLossWeight)} {u}
                </p>
                <p className="text-xs text-emerald-600/80">to {fmt(projection.highFinalWeight)} {u}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Based on average total body-weight loss in <strong>{med.trial}</strong>. Placebo groups lost
              about {med.placeboPct}% over the same period, so a large share of this is the medication — but
              protein, resistance training, and sticking with it strongly influence where you land.
            </p>
          </div>

          {/* Nudge */}
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong className="text-slate-900 dark:text-white">A projection is only a target.</strong>{" "}
                Track your real trajectory — and make sure you&apos;re losing fat, not muscle — as you go.
              </p>
            </div>
            <Link
              href="/signup?next=/dashboard/glp1"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Track my progress <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/40">
          Enter your current weight to see your projected loss.
        </div>
      )}

      <p className="mt-5 text-xs leading-relaxed text-slate-400">
        Educational estimate only, based on published trial averages — not a prediction of your personal
        result, and not medical advice. Weight loss depends on your dose, how long you stay on it, side-effect
        tolerance, diet, and activity. Discuss any medication with a licensed clinician.
      </p>
    </div>
  );
}
