"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ComposedChart, Area, Line, ReferenceLine, ReferenceArea,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { LineChart as LineChartIcon, TrendingDown, AlertTriangle, Sparkles } from "lucide-react";
import type { TrajectoryPoint, PlateauResult } from "@/lib/glp1/trajectory";

const LB = 2.2046226218;
const GOAL_KEY = "glp1_goal_kg";
const kg2lb = (kg: number | null) => (kg == null ? null : Math.round(kg * LB * 10) / 10);

type PlateauView = Pick<PlateauResult, "status" | "message" | "plateauStartMs" | "weeksStalled">;

export interface ProgressChartProps {
  points: TrajectoryPoint[];
  currentKg: number | null;
  projectedKg: number | null;
  paceKgPerWeek: number | null;
  hasProjection: boolean;
  /** Trial label for the overlay legend, e.g. "STEP-1". Null hides the trial series. */
  trialLabel: string | null;
  plateau: PlateauView;
}

/**
 * The advanced-charts centerpiece: your real weigh-ins, a forward projection cone,
 * the pivotal-trial expected curve, your goal line, and shaded plateau windows —
 * all in one view. Goal weight is read from localStorage (never persisted).
 */
export function ProgressChart({
  points, currentKg, projectedKg, paceKgPerWeek, hasProjection, trialLabel, plateau,
}: ProgressChartProps) {
  const [goalLb, setGoalLb] = useState<number | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(GOAL_KEY) : null;
    if (saved) setGoalLb(kg2lb(Number(saved)));
  }, []);

  const data = useMemo(
    () =>
      points.map((p) => ({
        week: p.week,
        dateMs: p.dateMs,
        actual: kg2lb(p.actualKg),
        projected: kg2lb(p.projectedKg),
        trial: kg2lb(p.trialKg),
        band: p.band ? ([kg2lb(p.band[0])!, kg2lb(p.band[1])!] as [number, number]) : null,
      })),
    [points],
  );

  if (data.length < 2) return null;

  const paceLb = paceKgPerWeek != null ? Math.abs(Math.round(paceKgPerWeek * LB * 10) / 10) : null;
  const losing = paceKgPerWeek != null && paceKgPerWeek < 0;

  // Shade the plateau window (from stall start → last logged point).
  const plateauStartWeek =
    plateau.plateauStartMs != null
      ? points.find((p) => p.dateMs >= plateau.plateauStartMs!)?.week ?? null
      : null;
  const lastActualWeek = [...points].reverse().find((p) => p.actualKg != null)?.week ?? null;

  const fmtDate = (ms: number) =>
    new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const insight = PLATEAU_UI[plateau.status];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <LineChartIcon className="h-5 w-5 text-brand" />
          <h2 className="text-lg font-bold text-gray-900">Progress &amp; prediction</h2>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          {paceLb != null && (
            <span className="inline-flex items-center gap-1.5">
              <TrendingDown className={`h-4 w-4 ${losing ? "text-brand" : "text-amber-500"}`} />
              <b className="text-gray-900">{paceLb} lb/wk</b><span className="text-gray-400">{losing ? "trend" : "flat/up"}</span>
            </span>
          )}
          {hasProjection && projectedKg != null && (
            <span className="inline-flex items-center gap-1.5 text-gray-500">
              <Sparkles className="h-4 w-4 text-brand" /> Projected <b className="text-gray-900">{kg2lb(projectedKg)} lb</b>
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 -ml-2 sm:ml-0">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="dateMs"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={fmtDate}
              fontSize={11}
              stroke="#9ca3af"
              minTickGap={28}
            />
            <YAxis fontSize={11} stroke="#9ca3af" domain={["auto", "auto"]} width={38} unit=" lb" />
            <Tooltip
              contentStyle={{ background: "#0b1220", border: "none", borderRadius: 12, color: "#e5e7eb", fontSize: 12 }}
              labelFormatter={(l) => fmtDate(Number(l))}
              formatter={(val: any, name: string) => {
                if (val == null) return [null, null];
                if (Array.isArray(val)) return [`${val[0]}–${val[1]} lb`, "Projection range"];
                return [`${val} lb`, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />

            {/* Plateau shading */}
            {plateauStartWeek != null && lastActualWeek != null && plateau.status === "plateau" && (
              <ReferenceArea
                x1={points.find((p) => p.week === plateauStartWeek)?.dateMs}
                x2={points.find((p) => p.week === lastActualWeek)?.dateMs}
                fill="#f59e0b"
                fillOpacity={0.1}
                ifOverflow="extendDomain"
              />
            )}

            {/* Goal line */}
            {goalLb != null && (
              <ReferenceLine
                y={goalLb}
                stroke="#0e9355"
                strokeDasharray="5 4"
                label={{ value: `Goal ${goalLb} lb`, position: "insideTopRight", fill: "#0e9355", fontSize: 11 }}
              />
            )}

            {/* Projection cone */}
            <Area type="monotone" dataKey="band" name="Projection range" stroke="none" fill="#12b76a" fillOpacity={0.12} connectNulls />

            {/* Trial-expected overlay */}
            {trialLabel && (
              <Line type="monotone" dataKey="trial" name={`${trialLabel} average`} stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 4" dot={false} connectNulls />
            )}

            {/* Projected line */}
            <Line type="monotone" dataKey="projected" name="Projected" stroke="#12b76a" strokeWidth={2} strokeDasharray="4 3" dot={false} connectNulls />

            {/* Actual weigh-ins */}
            <Line type="monotone" dataKey="actual" name="Your weight" stroke="#0e9355" strokeWidth={2.5} dot={{ r: 2.5, fill: "#0e9355" }} activeDot={{ r: 4 }} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Plateau / trend insight */}
      {plateau.status !== "insufficient" && (
        <div className={`mt-4 flex gap-3 rounded-xl border p-3.5 ${insight.cls}`}>
          <insight.Icon className={`mt-0.5 h-5 w-5 shrink-0 ${insight.iconCls}`} />
          <div>
            <p className="text-sm font-semibold text-gray-900">{insight.title}</p>
            <p className="mt-0.5 text-sm text-gray-600">{plateau.message}</p>
          </div>
        </div>
      )}

      <p className="mt-3 text-[11px] text-gray-400">
        Projection and trial curves are estimates for guidance only — individual results vary, and your goal weight stays on this device. Not medical advice.
      </p>
    </div>
  );
}

const PLATEAU_UI: Record<PlateauResult["status"], { title: string; cls: string; iconCls: string; Icon: typeof TrendingDown }> = {
  insufficient: { title: "", cls: "", iconCls: "", Icon: TrendingDown },
  losing: { title: "Losing steadily", cls: "border-brand-50 bg-brand-50/50", iconCls: "text-brand", Icon: TrendingDown },
  slowing: { title: "Loss is slowing", cls: "border-amber-200 bg-amber-50/60", iconCls: "text-amber-500", Icon: TrendingDown },
  plateau: { title: "Plateau detected", cls: "border-amber-300 bg-amber-50/70", iconCls: "text-amber-600", Icon: AlertTriangle },
  regaining: { title: "Slight upward trend", cls: "border-amber-200 bg-amber-50/60", iconCls: "text-amber-500", Icon: AlertTriangle },
};
