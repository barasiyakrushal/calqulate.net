"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  REGAIN_FACTORS,
  REGAIN_MAX_SCORE,
  regainBand,
  REGAIN_BAND_COPY,
} from "@/lib/glp1/tapering";
import {
  ShieldCheck,
  AlertTriangle,
  Minus,
  ArrowRight,
  Activity,
  CheckCircle2,
} from "lucide-react";

const BAND_STYLE: Record<string, { wrap: string; icon: React.ReactNode }> = {
  lower: {
    wrap: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200",
    icon: <ShieldCheck className="h-7 w-7 flex-shrink-0 text-emerald-600" />,
  },
  moderate: {
    wrap: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200",
    icon: <Minus className="h-7 w-7 flex-shrink-0 text-amber-600" />,
  },
  higher: {
    wrap: "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200",
    icon: <AlertTriangle className="h-7 w-7 flex-shrink-0 text-red-600" />,
  },
};

/**
 * Regain Risk Calculator — for someone deciding whether/how to stop a GLP-1.
 * They answer whether they have the evidence-based protections against regain;
 * the tool returns a risk band plus their specific, prioritized levers.
 */
export function RegainRiskCalculator() {
  // undefined = unanswered; true = protective; false = risk.
  const [answers, setAnswers] = useState<Record<string, boolean | undefined>>({});

  const answeredCount = REGAIN_FACTORS.filter((f) => answers[f.key] !== undefined).length;
  const allAnswered = answeredCount === REGAIN_FACTORS.length;

  const { score, band, gaps } = useMemo(() => {
    let s = 0;
    const g: typeof REGAIN_FACTORS = [];
    for (const f of REGAIN_FACTORS) {
      if (answers[f.key] === true) s += f.weight;
      else if (answers[f.key] === false) g.push(f);
    }
    return { score: s, band: regainBand(s), gaps: g.sort((a, b) => b.weight - a.weight) };
  }, [answers]);

  const copy = REGAIN_BAND_COPY[band];
  const style = BAND_STYLE[band];
  const pct = Math.round((score / REGAIN_MAX_SCORE) * 100);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Questions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">Will you gain it back?</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Answer honestly — these are the factors that actually predict who keeps the weight off.
        </p>

        <div className="mt-5 space-y-5">
          {REGAIN_FACTORS.map((f, i) => (
            <div key={f.key}>
              <p className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">
                {i + 1}. {f.question}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setAnswers((p) => ({ ...p, [f.key]: true }))}
                  aria-pressed={answers[f.key] === true}
                  className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                    answers[f.key] === true
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {f.protectiveLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setAnswers((p) => ({ ...p, [f.key]: false }))}
                  aria-pressed={answers[f.key] === false}
                  className={`rounded-xl border-2 px-3 py-2.5 text-left text-sm font-semibold transition-all ${
                    answers[f.key] === false
                      ? "border-slate-400 bg-slate-100 text-slate-700 dark:border-slate-500 dark:bg-slate-700 dark:text-slate-200"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {f.riskLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      {allAnswered ? (
        <div className="mt-6 space-y-5">
          <div className={`rounded-2xl border-2 p-5 sm:p-6 ${style.wrap}`}>
            <div className="flex items-start gap-3">
              {style.icon}
              <div>
                <span className="inline-block rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide dark:bg-black/20">
                  {copy.label}
                </span>
                <h3 className="mt-2 text-xl font-extrabold sm:text-2xl">{copy.headline}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-90">{copy.body}</p>
              </div>
            </div>
            {/* Protection meter */}
            <div className="mt-5">
              <div className="mb-1 flex justify-between text-xs font-semibold opacity-80">
                <span>Your protections</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/50 dark:bg-black/20">
                <div
                  className="h-full rounded-full bg-current opacity-70 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Levers (the gaps) */}
          {gaps.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Your biggest levers — fix these before you stop
              </h3>
              <ul className="mt-3 space-y-3">
                {gaps.map((f, i) => (
                  <li key={f.key} className="flex items-start gap-3">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{f.lever}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <p className="text-sm text-slate-700 dark:text-slate-300">
                You have every protection in place. Keep them going through the taper and beyond — that consistency
                is exactly what keeps the weight off.
              </p>
            </div>
          )}

          {/* Muscle-loss detection (premium) CTA */}
          <div className="flex flex-col items-start gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Activity className="mt-0.5 h-7 w-7 flex-shrink-0" />
              <div>
                <p className="font-bold">Muscle is your insurance. Know how much you have.</p>
                <p className="mt-1 max-w-md text-sm text-emerald-50">
                  Before you taper, catch muscle loss you can&apos;t see on the scale — it&apos;s the #1 thing that
                  decides whether the weight stays off.
                </p>
              </div>
            </div>
            <Link
              href="/signup?next=/dashboard/glp1"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            >
              Check my muscle <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Planning to step down?{" "}
            <a href="#taper" className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">
              Build your tapering schedule below →
            </a>
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/40">
          Answer all {REGAIN_FACTORS.length} questions to see your regain risk. ({answeredCount}/{REGAIN_FACTORS.length})
        </div>
      )}

      <p className="mt-5 text-xs leading-relaxed text-slate-400">
        Educational risk estimate based on the factors most linked to keeping weight off — not a prediction of
        your personal result, and not medical advice. Any decision to stop or taper is one to make with your
        prescriber.
      </p>
    </div>
  );
}

export default RegainRiskCalculator;
