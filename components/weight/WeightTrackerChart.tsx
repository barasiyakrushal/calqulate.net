"use client";

import { useMemo, useState } from "react";
import { Calendar, TrendingDown } from "lucide-react";
import { linearTrend, kgToLb, sortByTime, type WeightPoint } from "@/lib/weight/analytics";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY = 86_400_000;

const PERIODS = [
  { key: "7D", days: 7 },
  { key: "30D", days: 30 },
  { key: "90D", days: 90 },
  { key: "1Y", days: 365 },
  { key: "All", days: Number.POSITIVE_INFINITY },
] as const;
type PeriodKey = (typeof PERIODS)[number]["key"];

/**
 * Full weight-over-time chart: your solid weight line (with per-point labels),
 * a dashed OLS trend line, a dashed goal line, legend and range toggles. Data is
 * the signed-in user's real weigh-ins (kg); `nowMs` is server-passed so range
 * filtering is deterministic across SSR/hydration.
 */
export function WeightTrackerChart({
  points,
  nowMs,
  goalKg,
  unit = "lb",
  projectionNote,
  defaultPeriod = "1Y",
}: {
  points: WeightPoint[];
  nowMs: number;
  goalKg: number | null;
  unit?: "lb" | "kg";
  projectionNote?: string | null;
  defaultPeriod?: PeriodKey;
}) {
  const [period, setPeriod] = useState<PeriodKey>(defaultPeriod);
  const conv = (kg: number) => (unit === "lb" ? kgToLb(kg) : kg);

  const all = useMemo(() => sortByTime(points), [points]);
  const filtered = useMemo(() => {
    const days = PERIODS.find((p) => p.key === period)!.days;
    return Number.isFinite(days) ? all.filter((p) => p.t >= nowMs - days * DAY) : all;
  }, [all, period, nowMs]);

  const series = filtered.map((p) => ({ t: p.t, v: conv(p.kg) }));
  const goalV = goalKg != null ? conv(goalKg) : null;
  const trend = useMemo(() => linearTrend(filtered), [filtered]);
  const hasData = series.length >= 2;

  // ── Geometry ────────────────────────────────────────────────────────────────
  const W = 900, H = 380, padL = 50, padR = 22, padT = 34, padB = 40;
  const innerW = W - padL - padR, innerH = H - padT - padB;

  const vals = series.map((s) => s.v);
  const domainVals = goalV != null ? [...vals, goalV] : vals;
  const minV = hasData ? Math.min(...domainVals) : 0;
  const maxV = hasData ? Math.max(...domainVals) : 0;
  const padV = Math.max(2, (maxV - minV) * 0.18);
  const yMin = minV - padV, yMax = maxV + padV;
  const tMin = series[0]?.t ?? nowMs, tMax = series[series.length - 1]?.t ?? nowMs;
  const tSpan = Math.max(1, tMax - tMin);

  const x = (t: number) => padL + ((t - tMin) / tSpan) * innerW;
  const y = (v: number) => padT + (1 - (v - yMin) / Math.max(1e-6, yMax - yMin)) * innerH;

  const linePts = series.map((s) => `${x(s.t)},${y(s.v)}`).join(" ");
  const areaPts = hasData ? `${padL},${padT + innerH} ${linePts} ${padL + innerW},${padT + innerH}` : "";
  const showLabels = series.length > 0 && series.length <= 16;

  // Trend endpoints (kg → display unit)
  const trendKgAt = (t: number) => (trend ? trend.intercept + trend.slopePerDay * ((t - trend.t0) / DAY) : null);
  const trendA = trend ? { x: x(tMin), y: y(conv(trendKgAt(tMin)!)) } : null;
  const trendB = trend ? { x: x(tMax), y: y(conv(trendKgAt(tMax)!)) } : null;

  // y ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ f, v: yMax - f * (yMax - yMin), yy: padT + f * innerH }));
  // x ticks (month labels — fixed array to avoid locale/hydration drift)
  const xTickCount = Math.min(8, Math.max(2, series.length));
  const xTicks = hasData
    ? Array.from({ length: xTickCount }, (_, i) => {
        const t = tMin + (tSpan * i) / (xTickCount - 1);
        const d = new Date(t);
        return { x: x(t), label: `${MONTHS[d.getUTCMonth()]} '${String(d.getUTCFullYear()).slice(2)}` };
      })
    : [];

  const fmtV = (v: number) => v.toFixed(1);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Weight over time</h2>
          <p className="text-xs text-gray-500">Daily weigh-ins</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                aria-pressed={period === p.key}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                  period === p.key ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p.key}
              </button>
            ))}
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-400">
            <Calendar className="h-4 w-4" />
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-5 rounded bg-emerald-600" /> Your weight</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0 w-5 border-t-2 border-dashed border-gray-400" /> Trend line</span>
        {goalV != null && (
          <span className="inline-flex items-center gap-1.5"><span className="h-0 w-5 border-t-2 border-dashed border-emerald-500" /> Goal weight ({fmtV(goalV)} {unit})</span>
        )}
      </div>

      {hasData ? (
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="Weight over time chart">
          <defs>
            <linearGradient id="wt-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* y gridlines + labels */}
          {yTicks.map((t) => (
            <g key={t.f}>
              <line x1={padL} y1={t.yy} x2={W - padR} y2={t.yy} stroke="#f1f5f9" strokeWidth="1" />
              <text x={padL - 8} y={t.yy + 3} textAnchor="end" fontSize="11" className="fill-gray-400">{t.v.toFixed(0)}</text>
            </g>
          ))}
          <text x={14} y={padT - 12} fontSize="11" className="fill-gray-400">Weight ({unit})</text>

          {/* Goal line */}
          {goalV != null && (
            <line x1={padL} y1={y(goalV)} x2={W - padR} y2={y(goalV)} stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 5" opacity="0.8" />
          )}

          {/* Trend line */}
          {trendA && trendB && (
            <line x1={trendA.x} y1={trendA.y} x2={trendB.x} y2={trendB.y} stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="6 5" />
          )}

          {/* Area + weight line */}
          <polygon points={areaPts} fill="url(#wt-area)" />
          <polyline points={linePts} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points + labels */}
          {series.map((s, i) => (
            <g key={i}>
              <circle cx={x(s.t)} cy={y(s.v)} r="3.5" fill="#fff" stroke="#059669" strokeWidth="2" />
              {showLabels && (
                <text x={x(s.t)} y={y(s.v) - 10} textAnchor="middle" fontSize="10.5" className="fill-gray-700 font-semibold">{fmtV(s.v)}</text>
              )}
            </g>
          ))}

          {/* x labels */}
          {xTicks.map((t, i) => (
            <text key={i} x={t.x} y={H - 14} textAnchor="middle" fontSize="11" className="fill-gray-400">{t.label}</text>
          ))}
        </svg>
      ) : (
        <div className="mt-4 flex h-52 items-center justify-center rounded-xl bg-gray-50 px-4 text-center text-sm text-gray-500">
          {all.length === 0 ? "No weight logged yet — add a weigh-in to see your trend." : "Not enough weigh-ins in this range. Try a longer period."}
        </div>
      )}

      {/* Projection banner */}
      {projectionNote && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
          <span className="mt-0.5 grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
            <TrendingDown className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-emerald-800">You&apos;re on track!</p>
            <p className="text-sm text-emerald-700">{projectionNote}</p>
          </div>
        </div>
      )}
    </div>
  );
}
