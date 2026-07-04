/**
 * Weight trajectory + prediction — the advanced-charts moat engine.
 *
 * Turns raw weigh-ins into a chart-ready series with three overlays no competitor
 * combines in one view:
 *   1. a smoothed TREND through the noisy daily numbers,
 *   2. a forward PROJECTION cone (pace ± variance) so the user sees where they're
 *      heading, not just where they've been, and
 *   3. the pivotal-trial EXPECTED curve for their compound (from `benchmark.ts`),
 *      so "am I on track?" is visual, not just a number.
 *
 * It also runs PLATEAU DETECTION — comparing a recent-window slope against an
 * earlier-window slope — which is the "third derivative" insight the product is
 * built around: telling a user their loss is stalling *before* the scale makes it
 * obvious, and marking where the stall began on the chart.
 *
 * ⚠️ Everything here is an ESTIMATE for guidance, clearly labelled as such in the
 * UI — never a guarantee or medical advice. Pure & deterministic so it is fully
 * unit-testable and reusable by future mobile clients.
 */

import { expectedLossPct } from "./benchmark";
import type { Glp1Compound } from "./types";

const WEEK_MS = 7 * 24 * 3_600_000;
const LB = 2.2046226218;

export interface TrajectoryWeight {
  takenAt: string; // ISO datetime
  weightKg: number;
}

/** One row on the chart. Future rows carry projection/band; past rows carry actual/trend. */
export interface TrajectoryPoint {
  /** Weeks since the first weigh-in (x-axis, fractional). */
  week: number;
  dateMs: number;
  /** Logged weight, if a weigh-in falls on this row (kg). */
  actualKg: number | null;
  /** Smoothed trend through the logged points (kg). */
  trendKg: number | null;
  /** Forward projection beyond the last weigh-in (kg). */
  projectedKg: number | null;
  /** Projection confidence cone [low, high] (kg) — widens with the horizon. */
  band: [number, number] | null;
  /** Pivotal-trial expected weight for this week (kg); null when no compound. */
  trialKg: number | null;
}

// ─── linear regression (least squares) ────────────────────────────────────────

interface Fit {
  slope: number; // kg per week (negative = losing)
  intercept: number; // kg at week 0
  n: number;
}

/** Least-squares fit of weightKg against week. Null when fewer than 2 points. */
function linearFit(points: { week: number; weightKg: number }[]): Fit | null {
  const n = points.length;
  if (n < 2) return null;
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const p of points) {
    sx += p.week;
    sy += p.weightKg;
    sxx += p.week * p.week;
    sxy += p.week * p.weightKg;
  }
  const denom = n * sxx - sx * sx;
  if (denom === 0) return null; // all points at the same week
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  return { slope, intercept, n };
}

/** Residual standard deviation of a fit — drives the projection cone width. */
function residualStd(points: { week: number; weightKg: number }[], fit: Fit): number {
  if (points.length < 3) return 0;
  let ss = 0;
  for (const p of points) {
    const pred = fit.intercept + fit.slope * p.week;
    ss += (p.weightKg - pred) ** 2;
  }
  return Math.sqrt(ss / (points.length - 2));
}

const round1 = (n: number) => Math.round(n * 10) / 10;

// ─── trajectory series ─────────────────────────────────────────────────────────

export interface TrajectoryArgs {
  weights: TrajectoryWeight[];
  /** GLP-1 compound → draws the trial-expected overlay. Null/undefined omits it. */
  compound?: Glp1Compound | null;
  /** Weeks to project beyond the last weigh-in (default 8). */
  projectWeeks?: number;
  nowMs: number;
}

export interface TrajectoryResult {
  points: TrajectoryPoint[];
  baselineKg: number | null;
  currentKg: number | null;
  /** Fitted pace, kg/week (negative = losing). */
  paceKgPerWeek: number | null;
  /** Projected weight `projectWeeks` out (kg). */
  projectedKg: number | null;
  hasProjection: boolean;
}

/**
 * Build the chart series. Weeks are indexed from the first weigh-in so the x-axis
 * is stable regardless of how sparsely the user logs.
 */
export function weightTrajectory(args: TrajectoryArgs): TrajectoryResult {
  const { compound, nowMs, projectWeeks = 8 } = args;

  const sorted = [...args.weights]
    .map((w) => ({ ms: Date.parse(w.takenAt), weightKg: w.weightKg }))
    .filter((w) => Number.isFinite(w.ms) && Number.isFinite(w.weightKg))
    .sort((a, b) => a.ms - b.ms);

  if (sorted.length === 0) {
    return { points: [], baselineKg: null, currentKg: null, paceKgPerWeek: null, projectedKg: null, hasProjection: false };
  }

  const startMs = sorted[0].ms;
  const baselineKg = sorted[0].weightKg;
  const lastMs = sorted[sorted.length - 1].ms;
  const currentKg = sorted[sorted.length - 1].weightKg;

  const withWeek = sorted.map((w) => ({ week: (w.ms - startMs) / WEEK_MS, weightKg: w.weightKg, ms: w.ms }));

  const fit = linearFit(withWeek);
  const std = fit ? residualStd(withWeek, fit) : 0;
  const paceKgPerWeek = fit ? round1(fit.slope) : null;

  const trialWeightAt = (weekAbs: number): number | null => {
    if (!compound) return null;
    const pct = expectedLossPct(compound, weekAbs);
    return round1(baselineKg * (1 - pct / 100));
  };

  const points: TrajectoryPoint[] = withWeek.map((w) => ({
    week: round1(w.week),
    dateMs: w.ms,
    actualKg: round1(w.weightKg),
    trendKg: fit ? round1(fit.intercept + fit.slope * w.week) : round1(w.weightKg),
    projectedKg: null,
    band: null,
    trialKg: trialWeightAt(w.week),
  }));

  // Forward projection — only when we have a real trend and are still losing/flat.
  const lastWeek = withWeek[withWeek.length - 1].week;
  let projectedKg: number | null = null;
  let hasProjection = false;
  if (fit && fit.n >= 2) {
    hasProjection = true;
    // Anchor the projection at the current weight (not the fitted value) so the
    // future line joins the last real point cleanly.
    const anchor = { projectedKg: currentKg, band: [currentKg, currentKg] as [number, number] };
    // Seed row at the last weigh-in so the projected line connects to actual.
    const seedIdx = points.length - 1;
    points[seedIdx].projectedKg = round1(anchor.projectedKg);
    points[seedIdx].band = [round1(currentKg), round1(currentKg)];

    for (let i = 1; i <= projectWeeks; i++) {
      const weekAbs = lastWeek + i;
      const proj = currentKg + fit.slope * i;
      // Cone widens with sqrt(horizon); floor a little uncertainty even when std≈0.
      const spread = (std || 0.3) * Math.sqrt(i) + 0.15 * i;
      points.push({
        week: round1(weekAbs),
        dateMs: lastMs + i * WEEK_MS,
        actualKg: null,
        trendKg: null,
        projectedKg: round1(proj),
        band: [round1(proj - spread), round1(proj + spread)],
        trialKg: trialWeightAt(weekAbs),
      });
      if (i === projectWeeks) projectedKg = round1(proj);
    }
  }

  return {
    points,
    baselineKg: round1(baselineKg),
    currentKg: round1(currentKg),
    paceKgPerWeek,
    projectedKg,
    hasProjection,
  };
}

// ─── plateau detection ("third derivative" moat) ──────────────────────────────

export type PlateauStatus = "insufficient" | "losing" | "slowing" | "plateau" | "regaining";

export interface PlateauResult {
  status: PlateauStatus;
  /** Slope over the recent window (kg/week; negative = losing). */
  recentPaceKgPerWeek: number | null;
  /** Slope over the prior window, for the "was losing, now flat" contrast. */
  priorPaceKgPerWeek: number | null;
  /** Consecutive recent weeks essentially flat. */
  weeksStalled: number;
  /** ms where the stall began — used to shade the chart. */
  plateauStartMs: number | null;
  message: string;
}

/** Below this magnitude (kg/week) counts as "flat". ~0.1 kg ≈ 0.22 lb/week. */
export const PLATEAU_SLOPE_KG = 0.1;

/**
 * Detect a stall by comparing the most-recent `windowWeeks` of weigh-ins against
 * the window before it. A plateau is "recent slope ~flat, and you were losing
 * before" — the early-warning the whole advanced-charts story is built around.
 */
export function detectPlateau(weights: TrajectoryWeight[], nowMs: number, windowWeeks = 3): PlateauResult {
  const sorted = [...weights]
    .map((w) => ({ ms: Date.parse(w.takenAt), weightKg: w.weightKg }))
    .filter((w) => Number.isFinite(w.ms) && Number.isFinite(w.weightKg))
    .sort((a, b) => a.ms - b.ms);

  const none: PlateauResult = {
    status: "insufficient",
    recentPaceKgPerWeek: null,
    priorPaceKgPerWeek: null,
    weeksStalled: 0,
    plateauStartMs: null,
    message: "Log a few weeks of weigh-ins and we'll flag a plateau the moment your loss starts to stall.",
  };
  if (sorted.length < 3) return none;

  const lastMs = sorted[sorted.length - 1].ms;
  const winMs = windowWeeks * WEEK_MS;
  const recent = sorted.filter((w) => w.ms >= lastMs - winMs);
  const prior = sorted.filter((w) => w.ms < lastMs - winMs && w.ms >= lastMs - 2 * winMs);

  const toFit = (arr: typeof sorted) =>
    linearFit(arr.map((w) => ({ week: (w.ms - sorted[0].ms) / WEEK_MS, weightKg: w.weightKg })));

  const recentFit = recent.length >= 2 ? toFit(recent) : null;
  const priorFit = prior.length >= 2 ? toFit(prior) : null;
  if (!recentFit) return none;

  const recentPace = round1(recentFit.slope);
  const priorPace = priorFit ? round1(priorFit.slope) : null;

  // Consecutive most-recent weeks whose week-over-week change is essentially flat.
  let weeksStalled = 0;
  let plateauStartMs: number | null = null;
  for (let i = sorted.length - 1; i > 0; i--) {
    const dW = (sorted[i].ms - sorted[i - 1].ms) / WEEK_MS;
    if (dW <= 0) continue;
    const perWeek = (sorted[i].weightKg - sorted[i - 1].weightKg) / dW;
    if (Math.abs(perWeek) <= PLATEAU_SLOPE_KG) {
      weeksStalled += dW;
      plateauStartMs = sorted[i - 1].ms;
    } else {
      break;
    }
  }
  weeksStalled = round1(weeksStalled);

  let status: PlateauStatus;
  let message: string;
  const recentLb = Math.abs(round1(recentPace * LB));

  if (recentPace > PLATEAU_SLOPE_KG) {
    status = "regaining";
    message = `Your recent trend is up about ${recentLb} lb/week. A small regain is normal week to week — worth watching protein, dose timing and sleep if it continues.`;
  } else if (recentPace >= -PLATEAU_SLOPE_KG) {
    // Flat. Distinguish a true plateau (was losing before) from a slow start.
    if (priorPace != null && priorPace < -PLATEAU_SLOPE_KG) {
      status = "plateau";
      message = `Heads up — your loss has flattened over the last ${weeksStalled || windowWeeks} weeks after losing about ${Math.abs(round1(priorPace * LB))} lb/week before. Plateaus are common; a dose-titration, protein or resistance-training review is the usual lever. Any change is your prescriber's call.`;
    } else {
      status = "slowing";
      message = "Your weight is roughly flat right now. If you're between dose steps this is expected; keep logging and the trend will sharpen.";
    }
  } else if (priorPace != null && recentPace > priorPace + PLATEAU_SLOPE_KG) {
    status = "slowing";
    message = `Still losing, but slower than before (${recentLb} lb/week now vs ${Math.abs(round1(priorPace * LB))} lb/week earlier). This often precedes a plateau — a good moment to tighten protein and resistance training.`;
  } else {
    status = "losing";
    message = `You're losing steadily at about ${recentLb} lb/week. Keep going — protect muscle with protein and resistance training.`;
  }

  return { status, recentPaceKgPerWeek: recentPace, priorPaceKgPerWeek: priorPace, weeksStalled, plateauStartMs, message };
}
