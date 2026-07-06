"use client";

import { useMemo, useState } from "react";
import { LineChart } from "lucide-react";

/**
 * Real per-user weight-trend chart with 7D/30D/90D/1Y/All range toggles.
 * Points come straight from the signed-in user's durable weightLog rows (the
 * page reads them per-request with `force-dynamic`), so logging a new weigh-in
 * changes this chart on the next load. `nowMs` is passed from the server so the
 * range filter is deterministic (no SSR/client hydration drift).
 */

type Pt = { t: number; kg: number };

const PERIODS = [
  { key: "7D", days: 7 },
  { key: "30D", days: 30 },
  { key: "90D", days: 90 },
  { key: "1Y", days: 365 },
  { key: "All", days: Number.POSITIVE_INFINITY },
] as const;
type PeriodKey = (typeof PERIODS)[number]["key"];

const LB_PER_KG = 2.2046226218;

export function WeightTrendChart({
  points,
  nowMs,
  unit = "lb",
}: {
  points: Pt[];
  nowMs: number;
  unit?: "lb" | "kg";
}) {
  const [period, setPeriod] = useState<PeriodKey>("30D");

  const toDisplay = (kg: number) => (unit === "lb" ? kg * LB_PER_KG : kg);

  const all = useMemo(() => [...points].sort((a, b) => a.t - b.t), [points]);

  const series = useMemo(() => {
    const days = PERIODS.find((p) => p.key === period)!.days;
    const inRange = Number.isFinite(days) ? all.filter((p) => p.t >= nowMs - days * 86_400_000) : all;
    return inRange.map((p) => ({ t: p.t, v: toDisplay(p.kg) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, period, nowMs, unit]);

  // ── Chart geometry ─────────────────────────────────────────────────────────
  const W = 720, H = 220, padL = 46, padR = 16, padT = 16, padB = 26;
  const innerW = W - padL - padR, innerH = H - padT - padB;

  const hasData = series.length >= 2;
  const vals = series.map((s) => s.v);
  const minV = hasData ? Math.min(...vals) : 0;
  const maxV = hasData ? Math.max(...vals) : 0;
  const padV = Math.max(0.5, (maxV - minV) * 0.15);
  const yMin = minV - padV, yMax = maxV + padV;
  const tMin = series[0]?.t ?? 0, tMax = series[series.length - 1]?.t ?? 1;
  const tSpan = Math.max(1, tMax - tMin);

  const x = (t: number) => padL + ((t - tMin) / tSpan) * innerW;
  const y = (v: number) => padT + (1 - (v - yMin) / Math.max(1e-6, yMax - yMin)) * innerH;

  const linePts = series.map((s) => `${x(s.t)},${y(s.v)}`).join(" ");
  const areaPts = hasData ? `${padL},${padT + innerH} ${linePts} ${padL + innerW},${padT + innerH}` : "";

  const latest = series[series.length - 1]?.v ?? null;
  const first = series[0]?.v ?? null;
  const change = latest != null && first != null ? latest - first : null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
            <LineChart className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-gray-900">Weight Trend</h2>
            <p className="text-xs text-gray-500">Your weight progress over time</p>
          </div>
        </div>
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
      </div>

      {hasData ? (
        <>
          <div className="mt-3 flex items-end gap-3">
            <div className="text-2xl font-extrabold text-gray-900">
              {latest!.toFixed(1)} <span className="text-sm font-medium text-gray-400">{unit}</span>
            </div>
            {change != null && (
              <span
                className={`mb-1 text-xs font-semibold ${
                  change < 0 ? "text-emerald-600" : change > 0 ? "text-amber-600" : "text-gray-400"
                }`}
              >
                {change > 0 ? "+" : ""}
                {change.toFixed(1)} {unit} this period
              </span>
            )}
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label="Weight trend over time">
            <defs>
              <linearGradient id="wt-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 0.5, 1].map((f) => {
              const yy = padT + f * innerH;
              const v = yMax - f * (yMax - yMin);
              return (
                <g key={f}>
                  <line x1={padL} y1={yy} x2={W - padR} y2={yy} stroke="#f1f5f9" strokeWidth="1" />
                  <text x={padL - 8} y={yy + 3} textAnchor="end" fontSize="10" className="fill-gray-400">
                    {v.toFixed(0)} {unit}
                  </text>
                </g>
              );
            })}
            <polygon points={areaPts} fill="url(#wt-fill)" />
            <polyline points={linePts} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {series.map((s, i) => (
              <circle key={i} cx={x(s.t)} cy={y(s.v)} r="3" fill="#059669" />
            ))}
          </svg>
        </>
      ) : (
        <div className="mt-5 flex h-40 items-center justify-center rounded-xl bg-gray-50 px-4 text-center text-sm text-gray-500">
          {all.length === 0
            ? "No weight logged yet — add a weigh-in to see your trend."
            : "Not enough weigh-ins in this range. Try a longer period."}
        </div>
      )}
    </div>
  );
}
