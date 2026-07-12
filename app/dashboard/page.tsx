import { getAccess, hasPaidAccess } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TrackerCards } from "@/components/vitals/TrackerCards";
import { TrendChart, type TrendPoint } from "@/components/vitals/TrendChart";
import { MetricForm } from "@/components/vitals/MetricForm";
import { Paywall } from "@/components/vitals/Paywall";
import { DownloadReportButton } from "@/components/vitals/DownloadReportButton";
import { CheckoutStatus } from "@/components/payment/CheckoutStatus";
import { TrajectoryPanel, type TrajectorySummary } from "@/components/vitals/TrajectoryPanel";
import { NextLeversPanel } from "@/components/vitals/NextLeversPanel";
import { fitTrajectory, forecast, isRealChange, METRIC_NOISE, type SeriesPoint } from "@/lib/vitals/trajectory";
import { computeNextLevers, type LeverResult } from "@/lib/vitals/nextLever";
import { calcLongevityIndex, calcBiologicalAge, type HealthInput, type LongevityResult, type BioAgeResult } from "@/lib/healthCalculations";
import { LongevityHero } from "@/components/health/LongevityHero";
import { PremiumGate } from "@/components/vitals/PremiumGate";
import Link from "next/link";
import { BodyAvatarCard } from "@/components/health/BodyAvatarCard";
import type { VitalsReport } from "@/types/vitals";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const access = await getAccess();
  const paid = hasPaidAccess(access);
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("risk_results")
    .select("composite_score,composite_grade,ascvd_percent,diabetes_percent,heart_age,heart_age_delta,report_json,computed_at")
    .eq("user_id", access.userId!)
    .order("computed_at", { ascending: true });

  const history = rows ?? [];
  const latest = history[history.length - 1];

  const trend: TrendPoint[] = history.map((r) => ({
    date: new Date(r.computed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: r.composite_score,
    ascvd: r.ascvd_percent,
    diabetes: r.diabetes_percent,
    heartAgeDelta: r.heart_age_delta,
  }));

  // ── Trajectory engine: fit the Kalman model to the score history ──────────
  const series: SeriesPoint[] = [];
  if (history.length > 0) {
    const t0 = new Date(history[0].computed_at).getTime();
    for (const r of history) {
      if (r.composite_score == null) continue;
      series.push({ t: (new Date(r.computed_at).getTime() - t0) / 86_400_000, value: r.composite_score });
    }
  }
  let trajectory: TrajectorySummary = {
    count: series.length, direction: "holding", weeklyChange: 0, netSignalChange: 0,
    noiseShare: 0, forecast8wk: null, realNote: "", current: latest?.composite_score ?? null,
  };
  if (series.length >= 2) {
    const traj = fitTrajectory(series, { higherIsBetter: true, measurementNoiseSd: METRIC_NOISE.compositeScore });
    const f8 = forecast(traj, 8);
    trajectory = {
      count: series.length,
      direction: traj.direction,
      weeklyChange: traj.weeklyChange,
      netSignalChange: traj.netSignalChange,
      noiseShare: traj.noiseShare,
      forecast8wk: f8 ? f8.value : null,
      realNote: isRealChange(traj).note,
      current: traj.current?.level ?? null,
    };
  }

  // ── Counterfactual next-lever simulator on the latest saved measurement ───
  let levers: LeverResult[] = [];
  let longevity: LongevityResult | null = null;
  let bioAge: BioAgeResult | null = null;
  const latestReport = latest?.report_json as VitalsReport | undefined;
  if (latestReport?.input) {
    levers = computeNextLevers(latestReport.input, 4);
    longevity = calcLongevityIndex(latestReport.input as HealthInput);
    bioAge = calcBiologicalAge(latestReport.input as HealthInput);
  }

  return (
    <div className="space-y-8">
      <CheckoutStatus />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your metabolic health</h1>
          <p className="text-gray-600">Track the outcomes that matter, not just the scale.</p>
        </div>
        <DownloadReportButton enabled={access.isActive && access.tier === "pro"} />
      </div>

      {paid && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-3 text-sm">
          <span className="text-gray-700">
            📱 Get your weekly score on your phone. Turn on mobile notifications and the weekly email.
          </span>
          <a href="/dashboard/settings" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Set up notifications →
          </a>
        </div>
      )}

      {paid && longevity && bioAge && <LongevityHero longevity={longevity} bioAge={bioAge} />}

      {paid && latestReport && (
        <BodyAvatarCard
          score={latestReport.composite.score}
          bodyFatPct={latestReport.body.navyBodyFatPercent ?? latestReport.body.rfmPercent}
          waistToHeight={latestReport.body.waistToHeight}
          leanMassKg={latestReport.body.leanBodyMassKg}
          bmi={latestReport.body.bmi}
          sex={latestReport.input.sex}
        />
      )}

      {latest ? (
        <TrackerCards history={history} />
      ) : (
        <div className="rounded-2xl border bg-white p-6 text-sm text-gray-500">
          No measurements yet. Add one below to light up your trackers.
        </div>
      )}

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Your trend</h2>
        {paid ? (
          <TrendChart data={trend} />
        ) : (
          <Paywall feature="trend tracking" />
        )}
      </section>

      {/* Real engine output: trajectory + personalized next levers (Premium) */}
      {paid ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <TrajectoryPanel s={trajectory} />
          <NextLeversPanel levers={levers} />
        </div>
      ) : (
        <PremiumGate locked feature="See when you will reach your goal" description="Your 8-week forecast, plus the single change that will help you most." />
      )}

      <section className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Add a measurement</h2>
        {paid ? (
          <MetricForm persist />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-600">Saving a full biometric measurement and building your trend is a Premium feature.</p>
            <Link href="/pricing?feature=Add-a-measurement" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              Unlock with Premium
            </Link>
          </div>
        )}
      </section>

      <p className="text-center text-xs text-gray-400">
        Educational decision-support only — not medical advice. Consult a licensed clinician.
      </p>
    </div>
  );
}
