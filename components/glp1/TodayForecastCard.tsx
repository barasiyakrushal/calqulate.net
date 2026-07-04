import { Utensils, BatteryMedium, Activity, Sunrise } from "lucide-react";
import type { TodayForecast, ForecastMetric, ForecastTone } from "@/lib/glp1/forecast";

const METRIC_ICON: Record<ForecastMetric["key"], typeof Utensils> = {
  appetite: Utensils,
  energy: BatteryMedium,
  sideEffects: Activity,
};

const TONE: Record<ForecastTone, { chip: string; dot: string; text: string }> = {
  good: { chip: "bg-brand-50 text-brand-800", dot: "bg-brand", text: "text-brand-800" },
  neutral: { chip: "bg-amber-50 text-amber-700", dot: "bg-amber-400", text: "text-amber-700" },
  watch: { chip: "bg-amber-100 text-amber-800", dot: "bg-amber-500", text: "text-amber-800" },
};

/**
 * The daily-open hook: a forecast of appetite, energy and side-effect likelihood
 * for *today's* place in the dose cycle, read from the user's own decay curve.
 * Server-rendered (no interactivity) — everything is derived on the page.
 */
export function TodayForecastCard({ forecast }: { forecast: TodayForecast }) {
  if (!forecast.available) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand-50/70 via-white to-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
            <Sunrise className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-gray-900">Today’s forecast</h2>
            <p className="text-xs text-gray-500">
              Day {forecast.dayOfCycle} of {forecast.cycleLengthDays} · {forecast.phaseLabel}
            </p>
          </div>
        </div>
        {/* Cycle position dial */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-28 overflow-hidden rounded-full bg-brand-50 sm:w-36">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${Math.min(100, Math.round(forecast.cycleFraction * 100))}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-brand-800">{forecast.levelPctOfPeak}%</span>
        </div>
      </div>

      <p className="px-5 pt-3 text-sm text-gray-700 sm:px-6">{forecast.summary}</p>

      <div className="mt-4 grid gap-px bg-brand-50 sm:grid-cols-3">
        {forecast.metrics.map((m) => {
          const Icon = METRIC_ICON[m.key];
          const tone = TONE[m.tone];
          return (
            <div key={m.key} className="bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2 text-gray-400">
                <Icon className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">{m.label}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                <span className={`text-lg font-extrabold ${tone.text}`}>{m.value}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{m.detail}</p>
            </div>
          );
        })}
      </div>

      <p className="px-5 py-3 text-[11px] text-gray-400 sm:px-6">
        Population-average estimates from your dose timing — everyone responds differently. Not medical advice.
      </p>
    </div>
  );
}
