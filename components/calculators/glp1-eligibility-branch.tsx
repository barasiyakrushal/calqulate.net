"use client";

import { useState } from "react";
import Link from "next/link";
import { Syringe, ArrowRight, CheckCircle2, AlertCircle, Info, LineChart } from "lucide-react";

/**
 * "Is a GLP-1 right for me?" branch.
 *
 * Connects a diagnosis / risk result to the GLP-1 path. Drop it into any risk
 * calculator's result section (or an answer page). It runs a tiny 2-input
 * eligibility self-check using the standard prescribing signals:
 *   - BMI >= 30, OR
 *   - BMI 27-29.9 WITH a weight-related condition (prediabetes, type 2 diabetes,
 *     high blood pressure, sleep apnea, etc.)
 *
 * When the calling calculator already knows the BMI and/or a weight-related
 * condition, pass them in and those inputs are prefilled instead of asked.
 */

type BmiBand = "lt27" | "27to30" | "ge30";

interface Glp1EligibilityBranchProps {
  /** Numeric BMI from the calculator, if known. Prefills the BMI input. */
  bmi?: number;
  /** A weight-related condition this result already established, if any. */
  condition?: { present: boolean; label: string };
  className?: string;
}

function bandFromBmi(bmi: number): BmiBand {
  if (bmi >= 30) return "ge30";
  if (bmi >= 27) return "27to30";
  return "lt27";
}

type Verdict = {
  tone: "good" | "maybe" | "no" | "pending";
  title: string;
  body: string;
};

function getVerdict(band: BmiBand | null, hasCondition: boolean | null, conditionLabel: string): Verdict {
  if (!band) {
    return {
      tone: "pending",
      title: "Answer the two questions above",
      body: "Pick your BMI range so we can show whether a GLP-1 typically fits your situation.",
    };
  }

  if (band === "lt27") {
    return {
      tone: "no",
      title: "A GLP-1 usually isn't indicated at your BMI",
      body: "Below a BMI of 27, GLP-1 medications for weight loss generally aren't prescribed. The lifestyle levers above are your highest-impact first move — track them and re-check if your numbers change.",
    };
  }

  if (band === "ge30") {
    return {
      tone: "good",
      title: "You likely meet the BMI threshold",
      body: "A BMI of 30 or above generally meets the criteria for GLP-1 therapy on its own. That doesn't mean it's the right choice for you — but it's a reasonable conversation to have with a clinician.",
    };
  }

  // band === "27to30"
  if (hasCondition === null) {
    return {
      tone: "maybe",
      title: "It depends on your other conditions",
      body: "At a BMI of 27–29.9, eligibility usually hinges on a weight-related condition. Answer the second question above to see where you land.",
    };
  }
  if (hasCondition) {
    return {
      tone: "good",
      title: "You may qualify",
      body: `A BMI of 27–29.9 combined with a weight-related condition${
        conditionLabel ? ` (${conditionLabel})` : ""
      } often meets prescribing criteria for GLP-1 therapy. Worth raising with a clinician.`,
    };
  }
  return {
    tone: "maybe",
    title: "Borderline — a related condition is usually needed",
    body: "At a BMI of 27–29.9 without a weight-related condition, GLP-1s for weight loss usually aren't prescribed yet. Keep working the levers above, and re-check if a condition like prediabetes or high blood pressure develops.",
  };
}

const TONE_STYLES: Record<Verdict["tone"], { wrap: string; icon: React.ReactNode }> = {
  good: {
    wrap: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200",
    icon: <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />,
  },
  maybe: {
    wrap: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-200",
    icon: <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />,
  },
  no: {
    wrap: "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300",
    icon: <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-slate-500" />,
  },
  pending: {
    wrap: "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300",
    icon: <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-slate-400" />,
  },
};

const Choice = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`w-full rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all ${
      selected
        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
        : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
    }`}
  >
    {label}
  </button>
);

export function Glp1EligibilityBranch({ bmi, condition, className = "" }: Glp1EligibilityBranchProps) {
  const knownBand = typeof bmi === "number" && isFinite(bmi) ? bandFromBmi(bmi) : null;
  const [pickedBand, setPickedBand] = useState<BmiBand | null>(null);
  const band = knownBand ?? pickedBand;

  const [pickedCondition, setPickedCondition] = useState<boolean | null>(null);
  // When the caller already knows a condition is present, honour it; otherwise ask.
  const hasCondition = condition ? condition.present : pickedCondition;
  const conditionLabel = condition?.label ?? "prediabetes, type 2 diabetes, high blood pressure, etc.";

  // The condition question only matters in the 27–29.9 band.
  const showConditionQuestion = band === "27to30" && !condition;

  const verdict = getVerdict(band, hasCondition, conditionLabel);
  const tone = TONE_STYLES[verdict.tone];

  return (
    <div
      className={`rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-white p-5 sm:p-7 shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 ${className}`}
    >
      {/* Heading */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
          <Syringe className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold leading-tight text-slate-900 dark:text-white sm:text-xl">
            Is a GLP-1 right for me?
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            GLP-1 medications (like semaglutide and tirzepatide) are one path for weight and metabolic
            risk. Here&apos;s a 10-second check of whether you&apos;d typically be a candidate.
          </p>
        </div>
      </div>

      {/* Self-check */}
      <div className="mt-5 space-y-4">
        {/* Question 1 — BMI */}
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Your BMI
          </p>
          {knownBand ? (
            <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm dark:border-indigo-800 dark:bg-indigo-900/20">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-indigo-600" />
              <span className="text-slate-700 dark:text-slate-200">
                From your result:{" "}
                <strong>
                  BMI {bmi!.toFixed(1)}
                  {knownBand === "ge30" ? " (30+)" : knownBand === "27to30" ? " (27–29.9)" : " (under 27)"}
                </strong>
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <Choice label="Under 27" selected={pickedBand === "lt27"} onClick={() => setPickedBand("lt27")} />
              <Choice label="27 – 29.9" selected={pickedBand === "27to30"} onClick={() => setPickedBand("27to30")} />
              <Choice label="30 or more" selected={pickedBand === "ge30"} onClick={() => setPickedBand("ge30")} />
            </div>
          )}
        </div>

        {/* Question 2 — weight-related condition (only relevant / asked in the 27–29.9 band) */}
        {condition?.present && band !== "lt27" && (
          <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm dark:border-indigo-800 dark:bg-indigo-900/20">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-indigo-600" />
            <span className="text-slate-700 dark:text-slate-200">
              From your result: <strong>weight-related condition present ({condition.label})</strong>
            </span>
          </div>
        )}
        {showConditionQuestion && (
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. A weight-related condition?
            </p>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
              Prediabetes, type&nbsp;2 diabetes, high blood pressure, high cholesterol, or sleep apnea.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Choice
                label="Yes, I have one"
                selected={pickedCondition === true}
                onClick={() => setPickedCondition(true)}
              />
              <Choice
                label="No / not sure"
                selected={pickedCondition === false}
                onClick={() => setPickedCondition(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Verdict */}
      <div className={`mt-5 flex items-start gap-3 rounded-xl border p-4 text-sm leading-relaxed ${tone.wrap}`}>
        {tone.icon}
        <span>
          <strong className="block">{verdict.title}</strong>
          <span className="mt-0.5 block">{verdict.body}</span>
        </span>
      </div>

      {/* CTAs into the GLP-1 path */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/health/glp-1-dose-calculator"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Syringe className="h-4 w-4" />
          Explore GLP-1 dosing
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/product/metabolic-health-tracker"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
        >
          <LineChart className="h-4 w-4" />
          Track my Metabolic Health Score
        </Link>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Educational screening only — not a prescription or medical advice. Only a licensed clinician can
        decide whether a GLP-1 medication is right for you.
      </p>
    </div>
  );
}

export default Glp1EligibilityBranch;
