/**
 * Pure weight-analytics helpers for the Weight Tracker. All math is in kg; the UI
 * converts to the user's display unit. No I/O — fully testable.
 */

export interface WeightPoint {
  t: number; // epoch ms
  kg: number;
}

export const LB_PER_KG = 2.2046226218;
export const kgToLb = (kg: number) => kg * LB_PER_KG;

const DAY = 86_400_000;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Ascending-by-time copy. */
export function sortByTime(points: WeightPoint[]): WeightPoint[] {
  return [...points].sort((a, b) => a.t - b.t);
}

export interface TrendLine {
  /** kg change per day (negative = losing). */
  slopePerDay: number;
  /** kg at the first point's time. */
  intercept: number;
  t0: number;
}

/** Ordinary least-squares fit of kg vs. day-offset. Needs >= 2 points. */
export function linearTrend(points: WeightPoint[]): TrendLine | null {
  const pts = sortByTime(points);
  if (pts.length < 2) return null;
  const t0 = pts[0].t;
  const xs = pts.map((p) => (p.t - t0) / DAY);
  const ys = pts.map((p) => p.kg);
  const n = xs.length;
  const sx = xs.reduce((a, b) => a + b, 0);
  const sy = ys.reduce((a, b) => a + b, 0);
  const sxx = xs.reduce((a, b) => a + b * b, 0);
  const sxy = xs.reduce((a, b, i) => a + b * ys[i], 0);
  const denom = n * sxx - sx * sx;
  if (denom === 0) return null;
  const slopePerDay = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slopePerDay * sx) / n;
  return { slopePerDay, intercept, t0 };
}

export interface WeightSummary {
  count: number;
  currentKg: number | null;
  currentAt: number | null;
  startKg: number | null;
  startAt: number | null;
  totalChangeKg: number | null;
  pctChange: number | null;
  /** kg/week from an OLS fit over the last 30 days (falls back to all data). */
  weeklyAvgKg: number | null;
}

export function summarize(points: WeightPoint[]): WeightSummary {
  const pts = sortByTime(points);
  if (pts.length === 0) {
    return { count: 0, currentKg: null, currentAt: null, startKg: null, startAt: null, totalChangeKg: null, pctChange: null, weeklyAvgKg: null };
  }
  const start = pts[0];
  const current = pts[pts.length - 1];
  const totalChangeKg = current.kg - start.kg;
  const pctChange = start.kg !== 0 ? (totalChangeKg / start.kg) * 100 : null;

  const cutoff = current.t - 30 * DAY;
  const recent = pts.filter((p) => p.t >= cutoff);
  const trend = linearTrend(recent.length >= 2 ? recent : pts);
  const weeklyAvgKg = trend ? trend.slopePerDay * 7 : null;

  return {
    count: pts.length,
    currentKg: current.kg,
    currentAt: current.t,
    startKg: start.kg,
    startAt: start.t,
    totalChangeKg,
    pctChange,
    weeklyAvgKg,
  };
}

export interface GoalProgress {
  pct: number;
  lostKg: number;
  toGoKg: number;
  reached: boolean;
}

/** Progress from the starting weight toward the goal (0–100). */
export function goalProgress(startKg: number, currentKg: number, goalKg: number): GoalProgress {
  const totalToLose = startKg - goalKg;
  const lostKg = startKg - currentKg;
  const toGoKg = currentKg - goalKg;
  const reached = currentKg <= goalKg;
  const pct = totalToLose > 0 ? clamp((lostKg / totalToLose) * 100, 0, 100) : reached ? 100 : 0;
  return { pct: Math.round(pct), lostKg, toGoKg, reached };
}

/** Projected epoch-ms to reach the goal at the current weekly pace, or null. */
export function projectGoalDate(currentKg: number, currentAt: number, weeklyKg: number, goalKg: number): number | null {
  const remaining = currentKg - goalKg;
  if (remaining <= 0) return null; // already at/under goal
  if (weeklyKg >= -0.01) return null; // not losing meaningfully
  const weeks = remaining / -weeklyKg;
  if (!Number.isFinite(weeks) || weeks > 520) return null; // > ~10y is not useful
  return currentAt + weeks * 7 * DAY;
}

export interface WeightInsights {
  trendingDown: boolean;
  weeklyAvgKg: number | null;
  maxKg: number | null;
  maxAt: number | null;
  minKg: number | null;
  minAt: number | null;
  biggestDropKg: number | null;
  biggestDropFromAt: number | null;
  biggestDropToAt: number | null;
}

export function insights(points: WeightPoint[]): WeightInsights {
  const pts = sortByTime(points);
  const empty: WeightInsights = {
    trendingDown: false, weeklyAvgKg: null, maxKg: null, maxAt: null, minKg: null, minAt: null,
    biggestDropKg: null, biggestDropFromAt: null, biggestDropToAt: null,
  };
  if (pts.length === 0) return empty;

  let max = pts[0], min = pts[0];
  for (const p of pts) {
    if (p.kg > max.kg) max = p;
    if (p.kg < min.kg) min = p;
  }

  let bestDrop = 0, dropFrom: WeightPoint | null = null, dropTo: WeightPoint | null = null;
  for (let i = 1; i < pts.length; i++) {
    const drop = pts[i - 1].kg - pts[i].kg; // positive = lost weight
    if (drop > bestDrop) {
      bestDrop = drop;
      dropFrom = pts[i - 1];
      dropTo = pts[i];
    }
  }

  const trend = linearTrend(pts);
  const weeklyAvgKg = trend ? trend.slopePerDay * 7 : null;

  return {
    trendingDown: (weeklyAvgKg ?? 0) < 0,
    weeklyAvgKg,
    maxKg: max.kg, maxAt: max.t,
    minKg: min.kg, minAt: min.t,
    biggestDropKg: bestDrop > 0 ? bestDrop : null,
    biggestDropFromAt: dropFrom?.t ?? null,
    biggestDropToAt: dropTo?.t ?? null,
  };
}
