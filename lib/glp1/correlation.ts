/**
 * Personal correlation engine — the "third derivative" moat (research #9).
 *
 * Everyone tracks weight (first derivative) and symptoms (second). This finds the
 * THIRD: which of the user's OWN behaviours and timing choices move their weekly
 * weight trajectory. It buckets history into weeks, then computes a Pearson
 * correlation between each factor (sleep, protein, exercise, food-noise, side
 * effects) and that week's weight change — surfacing the levers that actually
 * track with results *for this person*, plus how injection sites compare.
 *
 * ⚠️ CORRELATION, NOT CAUSATION. These are patterns in the user's own logs across
 * a handful of weeks — signal to explore with a clinician, never proof or a
 * prescription. Everything is clearly labelled as such in the UI. Pure &
 * deterministic so it is fully unit-testable and reusable by future mobile clients.
 */

import type { InjectionSite } from "./types";

const WEEK_MS = 7 * 24 * 3_600_000;
const LB = 2.2046226218;
const round2 = (n: number) => Math.round(n * 100) / 100;
const round1 = (n: number) => Math.round(n * 10) / 10;

// ─── inputs ────────────────────────────────────────────────────────────────────

export interface CorrWeight { takenAt: string; weightKg: number }
export interface CorrCheckIn { loggedAt: string; sleepHours: number | null; craving: number | null }
export interface CorrFood { loggedAt: string; proteinG: number }
export interface CorrExercise { loggedAt: string }
export interface CorrSideEffect { loggedAt: string; noSymptoms: boolean; severity: number | null }
export interface CorrDose { takenAt: string; injectionSite: InjectionSite | null; skipped: boolean }

export interface CorrelationArgs {
  weights: CorrWeight[];
  checkins?: CorrCheckIn[];
  foods?: CorrFood[];
  exercises?: CorrExercise[];
  sideEffects?: CorrSideEffect[];
  doses?: CorrDose[];
  nowMs: number;
}

// ─── outputs ───────────────────────────────────────────────────────────────────

export interface WeeklyBucket {
  weekIndex: number;
  startMs: number;
  /** Weight lost across the week (kg; positive = loss). Null if not interpolable. */
  lossKg: number | null;
  avgSleepHours: number | null;
  avgProteinG: number | null;
  exerciseSessions: number;
  avgCraving: number | null;
  sideEffectBurden: number | null;
  injectionSite: InjectionSite | null;
}

export type FactorKey = "sleep" | "protein" | "exercise" | "cravings" | "sideEffects";
export type CorrStrength = "none" | "weak" | "moderate" | "strong";

export interface CorrelationInsight {
  factor: FactorKey;
  label: string;
  /** Pearson r between the factor and weekly loss (−1..1). */
  r: number;
  /** Weeks with both the factor and a loss value. */
  n: number;
  strength: CorrStrength;
  /** True when the pattern is the "good" direction (more sleep → more loss, etc.). */
  favorable: boolean;
  message: string;
}

export interface SiteInsight {
  site: InjectionSite;
  weeks: number;
  avgLossLb: number;
}

export type CorrConfidence = "insufficient" | "low" | "medium" | "high";

export interface CorrelationResult {
  weeks: WeeklyBucket[];
  /** Weeks that actually carry a loss value — drives confidence. */
  usableWeeks: number;
  insights: CorrelationInsight[]; // ranked by |r|, meaningful only
  siteComparison: SiteInsight[]; // sorted by avg loss desc
  topInsight: CorrelationInsight | null;
  confidence: CorrConfidence;
  summary: string;
}

// ─── helpers ───────────────────────────────────────────────────────────────────

interface Sample { ms: number; value: number }

function series(points: { t: string; v: number }[]): Sample[] {
  return points
    .map((p) => ({ ms: Date.parse(p.t), value: p.v }))
    .filter((s) => Number.isFinite(s.ms) && Number.isFinite(s.value))
    .sort((a, b) => a.ms - b.ms);
}

/** Linear interpolation at `ms`; null outside the series range. */
function valueAt(s: Sample[], ms: number): number | null {
  if (s.length === 0 || ms < s[0].ms || ms > s[s.length - 1].ms) return null;
  for (let i = 1; i < s.length; i++) {
    if (ms <= s[i].ms) {
      const a = s[i - 1], b = s[i];
      if (b.ms === a.ms) return b.value;
      return a.value + ((ms - a.ms) / (b.ms - a.ms)) * (b.value - a.value);
    }
  }
  return s[s.length - 1].value;
}

function mean(xs: number[]): number | null {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

/** Pearson correlation over paired samples; null when undefined (n<3 or no variance). */
export function pearson(pairs: [number, number][]): number | null {
  const n = pairs.length;
  if (n < 3) return null;
  let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
  for (const [x, y] of pairs) {
    sx += x; sy += y; sxx += x * x; syy += y * y; sxy += x * y;
  }
  const cov = n * sxy - sx * sy;
  const dx = n * sxx - sx * sx;
  const dy = n * syy - sy * sy;
  if (dx <= 0 || dy <= 0) return null;
  return cov / Math.sqrt(dx * dy);
}

function strengthOf(r: number): CorrStrength {
  const a = Math.abs(r);
  if (a < 0.2) return "none";
  if (a < 0.4) return "weak";
  if (a < 0.7) return "moderate";
  return "strong";
}

// ─── core ──────────────────────────────────────────────────────────────────────

export function weeklyCorrelations(args: CorrelationArgs): CorrelationResult {
  const { nowMs } = args;
  const weightSeries = series(args.weights.map((w) => ({ t: w.takenAt, v: w.weightKg })));

  const empty: CorrelationResult = {
    weeks: [], usableWeeks: 0, insights: [], siteComparison: [], topInsight: null,
    confidence: "insufficient",
    summary: "Log your weight alongside sleep, food and workouts for a few weeks, and we'll surface which of your habits actually move your results.",
  };
  if (weightSeries.length < 2) return empty;

  const startMs = weightSeries[0].ms;
  const endMs = weightSeries[weightSeries.length - 1].ms;

  const inWeek = (iso: string, s: number) => {
    const ms = Date.parse(iso);
    return Number.isFinite(ms) && ms >= s && ms < s + WEEK_MS;
  };

  const weeks: WeeklyBucket[] = [];
  let weekIndex = 0;
  for (let s = startMs; s < endMs; s += WEEK_MS, weekIndex++) {
    const wStart = valueAt(weightSeries, s);
    const wEnd = valueAt(weightSeries, Math.min(s + WEEK_MS, endMs));
    const lossKg = wStart != null && wEnd != null ? round2(wStart - wEnd) : null;

    const ci = (args.checkins ?? []).filter((c) => inWeek(c.loggedAt, s));
    const avgSleepHours = mean(ci.map((c) => c.sleepHours).filter((v): v is number => v != null));
    const avgCraving = mean(ci.map((c) => c.craving).filter((v): v is number => v != null));

    const fd = (args.foods ?? []).filter((f) => inWeek(f.loggedAt, s));
    const avgProteinG = mean(fd.map((f) => f.proteinG).filter((v) => Number.isFinite(v)));

    const exerciseSessions = (args.exercises ?? []).filter((e) => inWeek(e.loggedAt, s)).length;

    const se = (args.sideEffects ?? []).filter((x) => inWeek(x.loggedAt, s));
    const sevs = se.map((x) => (x.noSymptoms ? 0 : x.severity)).filter((v): v is number => v != null);
    const sideEffectBurden = mean(sevs);

    // Dominant injection site logged this week.
    const sites = (args.doses ?? []).filter((d) => !d.skipped && d.injectionSite && inWeek(d.takenAt, s)).map((d) => d.injectionSite!);
    const injectionSite = dominant(sites);

    weeks.push({ weekIndex, startMs: s, lossKg, avgSleepHours, avgProteinG, exerciseSessions, avgCraving, sideEffectBurden, injectionSite });
  }

  const usableWeeks = weeks.filter((w) => w.lossKg != null).length;

  // Build correlations for each numeric factor against weekly loss.
  const insights: CorrelationInsight[] = [];
  const addFactor = (
    factor: FactorKey, label: string, pick: (w: WeeklyBucket) => number | null,
    favorableSign: 1 | -1, phrase: (favorable: boolean) => string,
  ) => {
    const pairs = weeks
      .filter((w) => w.lossKg != null && pick(w) != null)
      .map((w) => [pick(w)!, w.lossKg!] as [number, number]);
    const r = pearson(pairs);
    if (r == null) return;
    const strength = strengthOf(r);
    if (strength === "none") return;
    // Favorable when the correlation points the "good" way for this factor.
    const favorable = Math.sign(r) === favorableSign;
    insights.push({ factor, label, r: round2(r), n: pairs.length, strength, favorable, message: phrase(favorable) });
  };

  addFactor("sleep", "Sleep", (w) => w.avgSleepHours, 1, (fav) =>
    fav
      ? "Weeks you slept more, you tended to lose more. Protecting sleep looks like one of your levers."
      : "In your data, more sleep didn't track with more loss — likely a small-sample quirk. Keep logging.");
  addFactor("protein", "Protein", (w) => w.avgProteinG, 1, (fav) =>
    fav
      ? "Higher-protein weeks lined up with more loss (and better muscle protection). Worth keeping protein up."
      : "Protein and loss didn't move together in your logs yet — more weeks will sharpen this.");
  addFactor("exercise", "Exercise", (w) => (w.exerciseSessions > 0 ? w.exerciseSessions : 0), 1, (fav) =>
    fav
      ? "Weeks with more workouts showed more loss. Training frequency is tracking with your results."
      : "Workout frequency and loss weren't correlated in your data yet — keep building the streak.");
  addFactor("cravings", "Food noise", (w) => w.avgCraving, -1, (fav) =>
    fav
      ? "When food noise was higher, your loss slowed — the cravings signal is real for you. Watch the cycle trough."
      : "Cravings and loss didn't clearly track together yet in your logs.");
  addFactor("sideEffects", "Side effects", (w) => w.sideEffectBurden, -1, (fav) =>
    fav
      ? "Heavier side-effect weeks coincided with slower loss — a sign to smooth them (hydration, meal timing)."
      : "Side-effect burden didn't clearly track with your loss rate.");

  insights.sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  // Injection-site comparison (categorical → mean weekly loss).
  const siteAgg = new Map<InjectionSite, { total: number; weeks: number }>();
  for (const w of weeks) {
    if (w.injectionSite && w.lossKg != null) {
      const a = siteAgg.get(w.injectionSite) ?? { total: 0, weeks: 0 };
      a.total += w.lossKg;
      a.weeks += 1;
      siteAgg.set(w.injectionSite, a);
    }
  }
  const siteComparison: SiteInsight[] = [...siteAgg.entries()]
    .filter(([, a]) => a.weeks >= 1)
    .map(([site, a]) => ({ site, weeks: a.weeks, avgLossLb: round1((a.total / a.weeks) * LB) }))
    .sort((x, y) => y.avgLossLb - x.avgLossLb);

  const confidence: CorrConfidence =
    usableWeeks < 4 ? "insufficient" : usableWeeks < 7 ? "low" : usableWeeks < 12 ? "medium" : "high";

  const topInsight = insights[0] ?? null;
  const summary = buildSummary(confidence, topInsight, siteComparison);

  return { weeks, usableWeeks, insights, siteComparison, topInsight, confidence, summary };
}

function dominant<T>(xs: T[]): T | null {
  if (xs.length === 0) return null;
  const counts = new Map<T, number>();
  let best: T | null = null;
  let bestN = 0;
  for (const x of xs) {
    const n = (counts.get(x) ?? 0) + 1;
    counts.set(x, n);
    if (n > bestN) { bestN = n; best = x; }
  }
  return best;
}

function buildSummary(confidence: CorrConfidence, top: CorrelationInsight | null, sites: SiteInsight[]): string {
  if (confidence === "insufficient") {
    return "A few more weeks of logging and your personal correlations will appear — the habits that actually move your loss.";
  }
  const parts: string[] = [];
  if (top) {
    parts.push(
      top.favorable
        ? `Your strongest lever so far is ${top.label.toLowerCase()} (${strengthWord(top.strength)} link to faster loss).`
        : `${top.label} shows the strongest pattern in your data (${strengthWord(top.strength)}), though not in the usual direction — keep logging.`,
    );
  } else {
    parts.push("No habit stands out yet — keep logging and the strongest levers will surface.");
  }
  if (sites.length >= 2) {
    const best = sites[0];
    parts.push(`Weeks you injected ${prettySite(best.site)} averaged the most loss (${best.avgLossLb} lb/wk) — an association, not a rule.`);
  }
  const tail = confidence === "low" ? " Early read on limited weeks." : "";
  return parts.join(" ") + tail;
}

const strengthWord = (s: CorrStrength) => (s === "strong" ? "a strong" : s === "moderate" ? "a moderate" : "a mild");
export const prettySite = (s: InjectionSite) => s.replace(/-/g, " ");
