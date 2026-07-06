import Link from "next/link";
import { getAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { listRecords } from "@/lib/glp1/repository";
import type { WeightLog } from "@/lib/glp1";
import { summarize, insights, goalProgress, projectGoalDate, kgToLb, type WeightPoint } from "@/lib/weight/analytics";
import { WeightTrackerChart } from "@/components/weight/WeightTrackerChart";
import { GoalEditor, ExportPdfButton } from "@/components/weight/GoalEditor";
import {
  Scale, ArrowDown, ArrowUp, Percent, CalendarDays, TrendingDown, TrendingUp,
  Trophy, Lightbulb, CheckCircle2, ChevronRight, HelpCircle, LineChart,
} from "lucide-react";

export const dynamic = "force-dynamic";

const lb = (kg: number) => kgToLb(kg);
const f1 = (n: number) => n.toFixed(1);
function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function WeightTrackerPage() {
  const access = await getAccess();
  const supabase = await createClient();
  const userId = access.userId!;

  const weights = await listRecords<WeightLog>(supabase, "weightLog", userId, { limit: 365 });

  // Goal weight (kg) — defensive: null if the column/row is missing.
  const { data: prof } = await supabase.from("profiles").select("goal_weight_kg").eq("id", userId).maybeSingle();
  const goalKg = (prof as { goal_weight_kg?: number | null } | null)?.goal_weight_kg ?? null;

  const points: WeightPoint[] = weights.map((w) => ({ t: Date.parse(w.takenAt), kg: w.weightKg }));
  const s = summarize(points);
  const ins = insights(points);
  const nowMs = Date.now();

  const gp = goalKg != null && s.startKg != null && s.currentKg != null ? goalProgress(s.startKg, s.currentKg, goalKg) : null;
  const projMs =
    goalKg != null && s.currentKg != null && s.currentAt != null && s.weeklyAvgKg != null
      ? projectGoalDate(s.currentKg, s.currentAt, s.weeklyAvgKg, goalKg)
      : null;
  const projectionNote = projMs != null ? `You're projected to reach your goal weight around ${fmtDate(projMs)} if you keep this pace.` : null;

  // Recent weigh-ins (newest first) with change vs. the previous entry.
  const recent = weights.slice(0, 8).map((w, i) => {
    const prev = weights[i + 1];
    return {
      at: Date.parse(w.takenAt),
      kg: w.weightKg,
      changeKg: prev ? w.weightKg - prev.weightKg : null,
      notes: w.notes,
    };
  });

  const totalDown = (s.totalChangeKg ?? 0) < 0;
  const weeklyDown = (s.weeklyAvgKg ?? 0) < 0;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white"><LineChart className="h-5 w-5" /></span>
            <h1 className="text-2xl font-bold text-gray-900">Weight Tracker</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">Track your weight over time and see your progress.</p>
          <p className="text-sm font-medium text-emerald-700">Consistency beats intensity. Small steps, tracked daily, lead to big changes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/answers/boost-sluggish-metabolism" className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
            <HelpCircle className="h-4 w-4" /> Learn more
          </Link>
          <ExportPdfButton />
        </div>
      </div>

      {weights.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <Scale className="mx-auto h-8 w-8 text-gray-300" />
          <h2 className="mt-3 text-lg font-bold text-gray-900">No weigh-ins yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">Log your weight in the GLP-1 Tracker and it will show up here with trends, insights and progress to your goal.</p>
          <Link href="/dashboard/glp1#log" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            Log a weigh-in <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* ── KPI cards ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            <Kpi
              icon={<Scale className="h-4 w-4" />}
              label="Current Weight"
              value={s.currentKg != null ? `${f1(lb(s.currentKg))} lb` : "—"}
              sub={s.currentAt != null ? fmtDate(s.currentAt) : ""}
            />
            <Kpi
              icon={totalDown ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
              label="Total Change"
              value={s.totalChangeKg != null ? `${s.totalChangeKg > 0 ? "+" : ""}${f1(lb(s.totalChangeKg))} lb` : "—"}
              sub={s.startAt != null ? `Since ${fmtDate(s.startAt)}` : ""}
              tone={totalDown ? "good" : "warn"}
            />
            <Kpi
              icon={<Percent className="h-4 w-4" />}
              label="Percent Change"
              value={s.pctChange != null ? `${s.pctChange > 0 ? "+" : ""}${s.pctChange.toFixed(1)}%` : "—"}
              sub={s.startAt != null ? `Since ${fmtDate(s.startAt)}` : ""}
              tone={totalDown ? "good" : "warn"}
            />
            <Kpi
              icon={<CalendarDays className="h-4 w-4" />}
              label="Weekly Average Change"
              value={s.weeklyAvgKg != null ? `${s.weeklyAvgKg > 0 ? "+" : ""}${lb(s.weeklyAvgKg).toFixed(2)} lb / week` : "—"}
              sub="Past 30 days"
              tone={weeklyDown ? "good" : "warn"}
            />
            <GoalEditor goalKg={goalKg} unit="lb" />
          </div>

          {/* ── Main + right rail ─────────────────────────────────────────── */}
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <WeightTrackerChart points={points} nowMs={nowMs} goalKg={goalKg} unit="lb" projectionNote={projectionNote} defaultPeriod="1Y" />

              {/* Recent weigh-ins */}
              <div className="rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-5 py-4">
                  <h2 className="text-base font-bold text-gray-900">Recent Weigh-ins</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-gray-400">
                        <th className="px-5 py-2 font-medium">Date</th>
                        <th className="px-5 py-2 font-medium">Weight</th>
                        <th className="px-5 py-2 font-medium">Change</th>
                        <th className="px-5 py-2 font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recent.map((r, i) => {
                        const down = (r.changeKg ?? 0) < 0;
                        return (
                          <tr key={i}>
                            <td className="whitespace-nowrap px-5 py-3">
                              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500 align-middle" />
                              {fmtDate(r.at)}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 font-semibold text-gray-900">{f1(lb(r.kg))} lb</td>
                            <td className="whitespace-nowrap px-5 py-3">
                              {r.changeKg == null ? (
                                <span className="text-gray-400">—</span>
                              ) : (
                                <span className={down ? "text-emerald-600" : "text-amber-600"}>
                                  {r.changeKg > 0 ? "+" : ""}{f1(lb(r.changeKg))} lb {down ? "↓" : "↑"}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-gray-500">{r.notes || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT RAIL */}
            <div className="space-y-5">
              {/* Progress to goal */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h2 className="text-base font-bold text-gray-900">Progress to Goal</h2>
                {gp ? (
                  <div className="mt-4 flex items-center gap-5">
                    <ProgressRing pct={gp.pct} />
                    <div className="min-w-0 text-sm">
                      <p className="text-gray-700">You&apos;ve lost <span className="font-bold text-emerald-600">{f1(lb(Math.abs(gp.lostKg)))} lb</span></p>
                      {gp.toGoKg > 0
                        ? <p className="mt-1 text-gray-500">{f1(lb(gp.toGoKg))} lb to go</p>
                        : <p className="mt-1 font-semibold text-emerald-600">Goal reached! 🎉</p>}
                      <p className="mt-1 text-gray-500">Goal: {f1(lb(goalKg!))} lb</p>
                      {s.startAt != null && <p className="mt-2 text-xs text-gray-400">Started: {fmtDate(s.startAt)}</p>}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-gray-500">Set a goal weight above to see your progress ring and projected finish date.</p>
                )}
              </div>

              {/* Weight insights */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h2 className="text-base font-bold text-gray-900">Weight Insights</h2>
                <ul className="mt-4 space-y-4">
                  <InsightRow
                    icon={ins.trendingDown ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                    tone={ins.trendingDown ? "good" : "warn"}
                    title={ins.trendingDown ? "Your weight is trending down" : "Your weight is trending up"}
                    body={ins.weeklyAvgKg != null ? `${ins.trendingDown ? "Great job! " : ""}Your average weekly change is ${lb(Math.abs(ins.weeklyAvgKg)).toFixed(2)} lb.` : "Keep logging to reveal your trend."}
                  />
                  {ins.maxKg != null && ins.maxAt != null && (
                    <InsightRow icon={<ArrowUp className="h-4 w-4" />} tone="violet" title="Most you've weighed" body={`${f1(lb(ins.maxKg))} lb on ${fmtDate(ins.maxAt)}`} />
                  )}
                  {ins.minKg != null && ins.minAt != null && (
                    <InsightRow icon={<ArrowDown className="h-4 w-4" />} tone="sky" title="Least you've weighed" body={`${f1(lb(ins.minKg))} lb on ${fmtDate(ins.minAt)}`} />
                  )}
                  {ins.biggestDropKg != null && ins.biggestDropFromAt != null && ins.biggestDropToAt != null && (
                    <InsightRow icon={<Trophy className="h-4 w-4" />} tone="amber" title="Biggest drop" body={`${f1(lb(ins.biggestDropKg))} lb between ${fmtDate(ins.biggestDropFromAt)} – ${fmtDate(ins.biggestDropToAt)}`} />
                  )}
                </ul>
              </div>

              {/* Tips for success */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <h2 className="text-base font-bold text-gray-900">Tips for success</h2>
                </div>
                <ul className="mt-3 space-y-2">
                  {[
                    "Weigh in at the same time each day.",
                    "Focus on the trend, not daily fluctuations.",
                    "Stay consistent with your plan.",
                    "Progress takes time. Keep going!",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Presentational helpers ────────────────────────────────────────────────────
function Kpi({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone?: "good" | "warn" }) {
  const valCls = tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : "text-gray-900";
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-1.5 text-gray-400">
        <span className="text-gray-400">{icon}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className={`mt-2 text-xl font-extrabold sm:text-2xl ${valCls}`}>{value}</div>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const R = 34;
  const C = 2 * Math.PI * R;
  const dash = C * Math.max(0, Math.min(1, pct / 100));
  return (
    <div className="relative h-20 w-20 flex-shrink-0">
      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
        <circle cx="40" cy="40" r={R} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="40" cy="40" r={R} fill="none" stroke="#059669" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${dash} ${C}`} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="text-lg font-extrabold text-gray-900">{pct}%</span>
      </div>
    </div>
  );
}

function InsightRow({ icon, title, body, tone }: { icon: React.ReactNode; title: string; body: string; tone: "good" | "warn" | "violet" | "sky" | "amber" }) {
  const map: Record<string, string> = {
    good: "bg-emerald-50 text-emerald-600",
    warn: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    sky: "bg-sky-50 text-sky-600",
    amber: "bg-amber-50 text-amber-600",
  };
  const titleCls: Record<string, string> = {
    good: "text-emerald-700", warn: "text-amber-700", violet: "text-violet-700", sky: "text-sky-700", amber: "text-amber-700",
  };
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg ${map[tone]}`}>{icon}</span>
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${titleCls[tone]}`}>{title}</p>
        <p className="text-sm text-gray-500">{body}</p>
      </div>
    </li>
  );
}
