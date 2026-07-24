"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  detectPlateau,
  type TrajectoryWeight,
  type PlateauStatus,
} from "@/lib/glp1/trajectory";
import { parseNumber } from "@/lib/utils";
import {
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  LineChart,
  Activity,
  Beef,
  Dumbbell,
  Info,
} from "lucide-react";

type Unit = "kg" | "lbs";
const LB_TO_KG = 0.45359237;
const WEEK_MS = 7 * 24 * 3_600_000;

interface Row {
  id: number;
  date: string; // YYYY-MM-DD
  weight: string;
}

// Status → presentation. The engine's message is authoritative; this adds tone,
// a headline, and the tailored "what to do" levers per status.
const STATUS_UI: Record<
  PlateauStatus,
  {
    label: string;
    headline: string;
    tone: string;
    icon: React.ComponentType<{ className?: string }>;
    levers: { icon: React.ComponentType<{ className?: string }>; text: string }[];
  }
> = {
  plateau: {
    label: "Plateau",
    headline: "Yes — this looks like a real plateau.",
    tone: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200",
    icon: Minus,
    levers: [
      { icon: Activity, text: "Ask your prescriber whether a dose step-up is due — plateaus often mean your current dose has done its job. Any change is their call." },
      { icon: Beef, text: "Tighten protein (about 1.2–1.6 g/kg). Under-eating protein lets metabolism-lowering muscle loss creep in." },
      { icon: Dumbbell, text: "Add or increase resistance training 2–3×/week to protect the muscle that keeps your metabolism up." },
      { icon: Info, text: "Audit hidden calories and check you're not eating so little that your body adapted. A stall is common — not failure." },
    ],
  },
  slowing: {
    label: "Slowing",
    headline: "You're still losing — but it's slowing down.",
    tone: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200",
    icon: TrendingDown,
    levers: [
      { icon: Beef, text: "This often precedes a plateau. Tighten protein now, before it flattens." },
      { icon: Dumbbell, text: "Add resistance training to defend your metabolism." },
      { icon: Activity, text: "If you're between dose steps, some slowing is expected — keep logging." },
    ],
  },
  losing: {
    label: "Losing",
    headline: "Good news — you're still losing steadily.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200",
    icon: TrendingDown,
    levers: [
      { icon: Beef, text: "Keep protein high to make sure the loss is fat, not muscle." },
      { icon: Dumbbell, text: "Keep up resistance training to protect lean mass." },
    ],
  },
  regaining: {
    label: "Ticking up",
    headline: "Your recent trend is slightly up.",
    tone: "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200",
    icon: TrendingUp,
    levers: [
      { icon: Info, text: "A small week-to-week regain is normal and often water. Look at the trend, not one weigh-in." },
      { icon: Beef, text: "If it continues, review protein, dose timing, and sleep — and mention it to your prescriber." },
    ],
  },
  insufficient: {
    label: "Need more data",
    headline: "Add a few more weigh-ins to analyze.",
    tone: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300",
    icon: Info,
    levers: [],
  },
};

export function PlateauAnalyzer() {
  const [unit, setUnit] = useState<Unit>("lbs");
  const [rows, setRows] = useState<Row[]>([
    { id: 1, date: "", weight: "" },
    { id: 2, date: "", weight: "" },
    { id: 3, date: "", weight: "" },
    { id: 4, date: "", weight: "" },
    { id: 5, date: "", weight: "" },
    { id: 6, date: "", weight: "" },
  ]);
  const [nextId, setNextId] = useState(7);

  // Prefill weekly-spaced dates (oldest → newest, newest = today) after mount so
  // the user only types weights. Done in an effect to avoid SSR/date mismatch.
  useEffect(() => {
    const today = new Date();
    setRows((prev) =>
      prev.map((r, i) => {
        const d = new Date(today.getTime() - (prev.length - 1 - i) * WEEK_MS);
        return { ...r, date: d.toISOString().slice(0, 10) };
      })
    );
  }, []);

  const update = (id: number, field: "date" | "weight", value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const addRow = () => {
    setRows((prev) => {
      const last = prev[prev.length - 1];
      const base = last?.date ? new Date(last.date).getTime() : Date.now();
      const d = new Date(base + WEEK_MS).toISOString().slice(0, 10);
      return [...prev, { id: nextId, date: d, weight: "" }];
    });
    setNextId((n) => n + 1);
  };

  const removeRow = (id: number) => setRows((prev) => prev.filter((r) => r.id !== id));

  // Build the trajectory in kg and run the shared plateau engine.
  const { result, points, filledCount } = useMemo(() => {
    const weights: TrajectoryWeight[] = [];
    const pts: { ms: number; kg: number }[] = [];
    for (const r of rows) {
      const w = parseNumber(r.weight);
      const ms = Date.parse(r.date);
      if (w > 0 && Number.isFinite(ms)) {
        const kg = unit === "lbs" ? w * LB_TO_KG : w;
        weights.push({ takenAt: new Date(ms).toISOString(), weightKg: kg });
        pts.push({ ms, kg });
      }
    }
    pts.sort((a, b) => a.ms - b.ms);
    const nowMs = pts.length ? pts[pts.length - 1].ms : Date.now();
    return { result: detectPlateau(weights, nowMs, 3), points: pts, filledCount: weights.length };
  }, [rows, unit]);

  const ui = STATUS_UI[result.status];
  const StatusIcon = ui.icon;

  const toDisplay = (kg: number) => (unit === "lbs" ? kg / LB_TO_KG : kg);
  const fmt = (n: number) => Math.round(n * 10) / 10;

  // Sparkline geometry
  const spark = useMemo(() => {
    if (points.length < 2) return null;
    const kgs = points.map((p) => p.kg);
    const min = Math.min(...kgs);
    const max = Math.max(...kgs);
    const span = max - min || 1;
    const W = 100;
    const H = 32;
    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = H - ((p.kg - min) / span) * H;
      return { x, y };
    });
    return { coords, path: coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ") };
  }, [points]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* INPUT */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your weigh-ins</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Enter at least 3–4 weekly weights. Same time of day is best.</p>
          </div>
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
        </div>

        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={r.id} className="flex items-center gap-2">
              <span className="w-6 flex-shrink-0 text-center text-xs font-bold text-slate-400">{i + 1}</span>
              <input
                type="date"
                value={r.date}
                onChange={(e) => update(r.id, "date", e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <div className="relative w-24 flex-shrink-0">
                <input
                  type="number"
                  inputMode="decimal"
                  value={r.weight}
                  onChange={(e) => update(r.id, "weight", e.target.value)}
                  placeholder="wt"
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 pr-8 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {unit}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeRow(r.id)}
                disabled={rows.length <= 3}
                aria-label={`Remove weigh-in ${i + 1}`}
                className="flex-shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-500 disabled:opacity-30 dark:hover:bg-slate-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300"
        >
          <Plus className="h-4 w-4" /> Add a weigh-in
        </button>
      </div>

      {/* RESULT */}
      <div className="mt-6">
        {filledCount < 3 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800/40">
            Enter at least 3 weigh-ins with dates to analyze your trend.
          </div>
        ) : (
          <div className="space-y-5">
            {/* Verdict */}
            <div className={`rounded-2xl border-2 p-5 sm:p-6 ${ui.tone}`}>
              <div className="flex items-start gap-3">
                <StatusIcon className="mt-0.5 h-7 w-7 flex-shrink-0" />
                <div>
                  <span className="inline-block rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide dark:bg-black/20">
                    {ui.label}
                  </span>
                  <h3 className="mt-2 text-xl font-extrabold sm:text-2xl">{ui.headline}</h3>
                  <p className="mt-2 text-sm leading-relaxed opacity-90">{result.message}</p>
                </div>
              </div>

              {/* Pace + sparkline */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-black/20">
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Recent pace</p>
                  <p className="mt-0.5 text-lg font-extrabold">
                    {result.recentPaceKgPerWeek === null
                      ? "—"
                      : `${fmt(toDisplay(result.recentPaceKgPerWeek))} ${unit}/wk`}
                  </p>
                </div>
                <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-black/20">
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Earlier pace</p>
                  <p className="mt-0.5 text-lg font-extrabold">
                    {result.priorPaceKgPerWeek === null
                      ? "—"
                      : `${fmt(toDisplay(result.priorPaceKgPerWeek))} ${unit}/wk`}
                  </p>
                </div>
                <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-black/20">
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Weeks flat</p>
                  <p className="mt-0.5 text-lg font-extrabold">{result.weeksStalled || 0}</p>
                </div>
                <div className="rounded-xl bg-white/60 p-3 dark:bg-black/20">
                  <p className="mb-1 text-center text-[11px] font-bold uppercase tracking-wider opacity-70">Trend</p>
                  {spark ? (
                    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-8 w-full">
                      <path d={spark.path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    </svg>
                  ) : (
                    <p className="text-center text-xs opacity-60">—</p>
                  )}
                </div>
              </div>
            </div>

            {/* Levers */}
            {ui.levers.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="font-bold text-slate-900 dark:text-white">What actually moves a GLP-1 plateau</h3>
                <ul className="mt-3 space-y-3">
                  {ui.levers.map((l, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        <l.icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{l.text}</span>
                    </li>
                  ))}
                </ul>
                {(result.status === "plateau" || result.status === "slowing") && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>
                      A flat scale can still hide fat loss if you&apos;re gaining muscle.{" "}
                      <Link href="/health/glp-1-dose-calculator" className="font-semibold text-emerald-700 underline-offset-2 hover:underline">
                        Check fat vs. muscle
                      </Link>{" "}
                      before you assume it&apos;s stalled.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* LOGIN GATE — history unlocks continuous detection */}
            <div className="flex flex-col items-start gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <LineChart className="mt-0.5 h-7 w-7 flex-shrink-0" />
                <div>
                  <p className="font-bold">This is a one-time snapshot.</p>
                  <p className="mt-1 max-w-md text-sm text-emerald-50">
                    Log your weight weekly and Calqulate flags a plateau the moment it starts, tells you the single
                    highest-impact lever, and tracks whether your fix is working.
                  </p>
                </div>
              </div>
              <Link
                href="/signup?next=/dashboard/glp1"
                className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              >
                Track my trend free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs leading-relaxed text-slate-400">
        Educational analysis of your weight trend — not medical advice. It can&apos;t see your dose, diet, or
        health, and any change to your medication is a decision for your prescriber.
      </p>
    </div>
  );
}

export default PlateauAnalyzer;
