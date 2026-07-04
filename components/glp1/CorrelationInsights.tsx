import { Sparkles, Moon, Beef, Dumbbell, Brain, Activity, Syringe } from "lucide-react";
import type { CorrelationResult, CorrelationInsight, FactorKey } from "@/lib/glp1/correlation";
import { prettySite } from "@/lib/glp1/correlation";

const FACTOR_ICON: Record<FactorKey, typeof Moon> = {
  sleep: Moon,
  protein: Beef,
  exercise: Dumbbell,
  cravings: Brain,
  sideEffects: Activity,
};

const CONFIDENCE_LABEL: Record<CorrelationResult["confidence"], string> = {
  insufficient: "Not enough data yet",
  low: "Early read",
  medium: "Building confidence",
  high: "Strong sample",
};

/**
 * Personal correlation engine surface — which of the user's own habits track with
 * their weekly weight change, plus how their injection sites compare. Server
 * component: everything is derived on the page.
 */
export function CorrelationInsights({ result }: { result: CorrelationResult }) {
  if (result.confidence === "insufficient") return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-bold text-gray-900">What moves your results</h2>
        </div>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800">
          {CONFIDENCE_LABEL[result.confidence]} · {result.usableWeeks} wk
        </span>
      </div>

      <p className="mt-2 text-sm text-gray-600">{result.summary}</p>

      {/* Factor correlations */}
      {result.insights.length > 0 && (
        <div className="mt-4 space-y-2.5">
          {result.insights.map((ins) => (
            <FactorRow key={ins.factor} insight={ins} />
          ))}
        </div>
      )}

      {/* Injection-site comparison */}
      {result.siteComparison.length >= 2 && (
        <div className="mt-5">
          <div className="flex items-center gap-2 text-gray-500">
            <Syringe className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Loss by injection site</span>
          </div>
          <div className="mt-2 space-y-2">
            {result.siteComparison.map((s) => {
              const max = Math.max(...result.siteComparison.map((x) => Math.abs(x.avgLossLb)), 0.1);
              const pct = Math.max(4, Math.round((Math.abs(s.avgLossLb) / max) * 100));
              return (
                <div key={s.site} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-sm capitalize text-gray-700">{prettySite(s.site)}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div className={`h-full rounded-full ${s.avgLossLb >= 0 ? "bg-brand" : "bg-amber-400"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-20 shrink-0 text-right text-sm font-semibold text-gray-900">
                    {s.avgLossLb >= 0 ? "" : "+"}{Math.abs(s.avgLossLb)} lb/wk
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11px] text-gray-400">Sites you used in more weeks are more reliable. Rotate sites as your prescriber advises — this is an association, not a reason to change technique.</p>
        </div>
      )}

      <p className="mt-4 text-[11px] text-gray-400">
        These are correlations in your own logs across {result.usableWeeks} weeks — patterns to explore, not proof of cause and not medical advice.
      </p>
    </div>
  );
}

function FactorRow({ insight }: { insight: CorrelationInsight }) {
  const Icon = FACTOR_ICON[insight.factor];
  const pct = Math.round(Math.abs(insight.r) * 100);
  const tone = insight.favorable ? "text-brand-800" : "text-amber-700";
  const bar = insight.favorable ? "bg-brand" : "bg-amber-400";
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${insight.favorable ? "text-brand" : "text-amber-500"}`} />
          <span className="text-sm font-semibold text-gray-900">{insight.label}</span>
          <span className={`text-xs font-medium ${tone}`}>{insight.strength} link</span>
        </div>
        <span className="text-xs text-gray-400">r = {insight.r}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{insight.message}</p>
    </div>
  );
}
