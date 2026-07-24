"use client";

import { useState } from "react";
import Link from "next/link";
import { MAINT_DRUGS, MAINTENANCE_FACTS, type MaintDrug } from "@/lib/glp1/maintenance";
import { Pill, CheckCircle2, ArrowRight, Info, ArrowDownNarrowWide } from "lucide-react";

/**
 * Maintenance Dose Calculator — for someone who has reached their goal and wants
 * to know their maintenance dose options and the "lowest effective dose" idea.
 * It's a guide, not a numeric calc: dose choice is always a prescriber decision.
 */
export function MaintenanceDoseCalculator() {
  const [drugId, setDrugId] = useState(MAINT_DRUGS[0].id);
  const [currentMg, setCurrentMg] = useState<number>(MAINT_DRUGS[0].maintenanceDoses.at(-1)!.mg);

  const drug: MaintDrug = MAINT_DRUGS.find((d) => d.id === drugId) ?? MAINT_DRUGS[0];
  const doses = drug.maintenanceDoses;
  const lowest = doses[0];
  const highest = doses[doses.length - 1];
  const atLowest = currentMg === lowest.mg;
  const atHighest = currentMg === highest.mg;

  const pickDrug = (id: string) => {
    setDrugId(id);
    const d = MAINT_DRUGS.find((x) => x.id === id)!;
    setCurrentMg(d.maintenanceDoses.at(-1)!.mg);
  };

  const guidance = atLowest
    ? "You're already at the lowest maintenance dose. If your weight is stable here, many people simply stay put. If it isn't, your prescriber may adjust — don't change it on your own."
    : atHighest
      ? "You're at the top dose. Once your weight is where you want it, some people work with their prescriber to step down toward the lowest dose that still holds their weight, rather than staying at the maximum indefinitely."
      : "You're on a middle maintenance dose. If your weight is steady, this may be your maintenance level; if you'd like to try lower, that's a conversation to have with your prescriber.";

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <Pill className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">Maintenance Dose Calculator</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Reached your goal? See your maintenance dose options and the lowest-effective-dose idea.
          </p>
        </div>
      </div>

      {/* Drug */}
      <div className="mt-5">
        <p className="mb-2 text-sm font-bold text-slate-900 dark:text-white">1. Your medication</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {MAINT_DRUGS.map((d) => {
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

      {/* Dose ladder */}
      <div className="mt-5">
        <p className="mb-2 text-sm font-bold text-slate-900 dark:text-white">2. Your current dose</p>
        <div className="flex flex-wrap gap-2">
          {doses.map((d) => {
            const active = d.mg === currentMg;
            return (
              <button
                key={d.mg}
                type="button"
                onClick={() => setCurrentMg(d.mg)}
                aria-pressed={active}
                className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all ${
                  active
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Maintenance dose options */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <ArrowDownNarrowWide className="h-4 w-4 text-emerald-600" /> {drug.drug} maintenance doses
        </p>
        <ul className="mt-3 space-y-2">
          {doses.map((d) => (
            <li
              key={d.mg}
              className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
                d.mg === currentMg
                  ? "bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
              <span>
                <strong>{d.label}</strong>
                {d.note ? ` — ${d.note}` : ""}
                {d.mg === currentMg ? " (your dose)" : ""}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{drug.note}</p>
      </div>

      {/* Guidance */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
        <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          <p>{guidance}</p>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{MAINTENANCE_FACTS.lowestEffective}</p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-400">
        Educational guide only — dose changes, step-downs, and stopping are decisions for your prescriber, based
        on your response and health. This tool never recommends a specific dose for you.
      </p>
    </div>
  );
}

export default MaintenanceDoseCalculator;
