/**
 * "Today" dose-cycle forecast — the daily-open hook (research #1).
 *
 * A weight chart only pays off on days the scale moves. This card pays off every
 * day: it reads where the user sits on their own medication-decay curve (from the
 * PK model) and predicts what that day of the cycle usually feels like —
 * appetite/food-noise, energy, and side-effect likelihood — BEFORE it happens.
 *
 * The physiology it encodes (population-typical, not individual):
 *   • Nausea / GI side effects cluster in the ~day or two after an injection.
 *   • Appetite suppression is strongest near the drug's peak and eases toward the
 *     trough, where "food noise" and cravings return before the next dose.
 *   • Energy can dip alongside early side effects and swing near the trough.
 *
 * ⚠️ Population-average estimates for guidance only — everyone responds
 * differently, and this is never dosing or medical advice. Pure & deterministic
 * so it is fully unit-testable and reusable by future mobile clients.
 */

import { drugLevelAt, PK_PARAMS, type PkDose } from "./pk";
import type { Glp1Compound } from "./types";

const HOUR_MS = 3_600_000;

export type ForecastTone = "good" | "neutral" | "watch";
export type CyclePhase = "rising" | "peak" | "declining" | "trough" | "overdue";

export interface ForecastMetric {
  key: "appetite" | "energy" | "sideEffects";
  label: string;
  /** Short qualitative value, e.g. "Well suppressed", "Returning", "Elevated". */
  value: string;
  tone: ForecastTone;
  detail: string;
}

export interface TodayForecast {
  available: boolean;
  /** 1-based day within the dose cycle (day 1 = injection day). */
  dayOfCycle: number;
  cycleLengthDays: number;
  hoursSinceLastDose: number;
  /** Current active level as a % of this cycle's peak (0–100). */
  levelPctOfPeak: number;
  /** Fraction through the cycle (0 at dose, 1 at next due; can exceed 1 if overdue). */
  cycleFraction: number;
  phase: CyclePhase;
  phaseLabel: string;
  summary: string;
  metrics: ForecastMetric[];
}

const UNAVAILABLE: TodayForecast = {
  available: false,
  dayOfCycle: 0,
  cycleLengthDays: 0,
  hoursSinceLastDose: 0,
  levelPctOfPeak: 0,
  cycleFraction: 0,
  phase: "trough",
  phaseLabel: "",
  summary: "",
  metrics: [],
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export interface TodayForecastArgs {
  /** Non-skipped doses (ISO takenAt + amountMg). */
  doses: PkDose[];
  compound: Glp1Compound;
  /** The medication's dose cadence in hours (weekly = 168, daily = 24). */
  intervalHours: number;
  nowMs: number;
}

export function todayForecast({ doses, compound, intervalHours, nowMs }: TodayForecastArgs): TodayForecast {
  const valid = doses.filter((d) => Number.isFinite(Date.parse(d.takenAt)) && d.amountMg > 0);
  if (valid.length === 0) return UNAVAILABLE;

  const interval = intervalHours > 0 ? intervalHours : PK_PARAMS[compound].defaultIntervalH;
  const lastDoseMs = valid.reduce((m, d) => Math.max(m, Date.parse(d.takenAt)), 0);
  const hoursSince = (nowMs - lastDoseMs) / HOUR_MS;
  if (hoursSince < 0) return UNAVAILABLE; // last dose is in the future — nothing to forecast

  const cycleFraction = round1(hoursSince / interval);
  const dayOfCycle = Math.floor(hoursSince / 24) + 1;
  const cycleLengthDays = Math.max(1, Math.round(interval / 24));

  // This cycle's peak level, sampled from the user's real accumulated curve.
  let cyclePeak = 0;
  for (let h = 0; h <= interval; h += 3) {
    cyclePeak = Math.max(cyclePeak, drugLevelAt(valid, lastDoseMs + h * HOUR_MS, compound));
  }
  const levelNow = drugLevelAt(valid, nowMs, compound);
  const levelPctOfPeak = cyclePeak > 0 ? Math.round((100 * levelNow) / cyclePeak) : 0;

  const f = hoursSince / interval;
  const { phase, phaseLabel } = classifyPhase(f, levelPctOfPeak);

  const metrics: ForecastMetric[] = [
    appetiteMetric(levelPctOfPeak, phase),
    sideEffectMetric(f, phase),
    energyMetric(f, phase),
  ];

  return {
    available: true,
    dayOfCycle,
    cycleLengthDays,
    hoursSinceLastDose: round1(hoursSince),
    levelPctOfPeak,
    cycleFraction,
    phase,
    phaseLabel,
    summary: summaryFor(phase, dayOfCycle, cycleLengthDays),
    metrics,
  };
}

// ─── phase ─────────────────────────────────────────────────────────────────────

function classifyPhase(f: number, pctOfPeak: number): { phase: CyclePhase; phaseLabel: string } {
  if (f > 1.15) return { phase: "overdue", phaseLabel: "Dose overdue" };
  if (f < 0.22) return { phase: "rising", phaseLabel: "Building up" };
  if (pctOfPeak >= 82 && f < 0.5) return { phase: "peak", phaseLabel: "Near peak" };
  if (pctOfPeak < 60 || f >= 0.8) return { phase: "trough", phaseLabel: "Toward trough" };
  return { phase: "declining", phaseLabel: "Tapering" };
}

// ─── metrics ─────────────────────────────────────────────────────────────────

function appetiteMetric(pctOfPeak: number, phase: CyclePhase): ForecastMetric {
  const base = { key: "appetite" as const, label: "Appetite & food noise" };
  // Food noise tracks the *decline*, not the absolute level: long-half-life drugs
  // (e.g. semaglutide) keep a high trough, yet cravings still return end-of-cycle.
  if (phase === "overdue" || phase === "trough" || pctOfPeak < 55) {
    return {
      ...base,
      value: "Likely returning",
      tone: "watch",
      detail: "You're near the trough of your cycle — hunger and 'food noise' commonly return here. Plan protein-forward meals and water ahead of your next dose.",
    };
  }
  if (pctOfPeak >= 80) {
    return {
      ...base,
      value: "Well suppressed",
      tone: "good",
      detail: "Drug level is near its peak, so hunger is usually lowest today. A good day to lock in protein and hit your targets.",
    };
  }
  return {
    ...base,
    value: "Moderate",
    tone: "neutral",
    detail: "Appetite control is easing off its peak — still solid, but cravings may creep in later this cycle.",
  };
}

function sideEffectMetric(f: number, phase: CyclePhase): ForecastMetric {
  const base = { key: "sideEffects" as const, label: "Side-effect likelihood" };
  if (phase === "overdue") {
    return { ...base, value: "Low", tone: "good", detail: "Well past your last dose, GI side effects are usually minimal. They can return after your next injection." };
  }
  if (f < 0.22) {
    return {
      ...base,
      value: "Elevated",
      tone: "watch",
      detail: "Nausea and GI upset are most common in the day or two after a shot. Eat light, bland and slow, and keep hydrating.",
    };
  }
  if (f < 0.55) {
    return { ...base, value: "Easing", tone: "neutral", detail: "The early side-effect window is passing. Symptoms typically settle from here through the cycle." };
  }
  return { ...base, value: "Low", tone: "good", detail: "Late in the cycle, side effects are usually at their lowest. Enjoy the steadier stretch." };
}

function energyMetric(f: number, phase: CyclePhase): ForecastMetric {
  const base = { key: "energy" as const, label: "Energy" };
  if (phase === "overdue") {
    return { ...base, value: "Variable", tone: "neutral", detail: "With the drug low, appetite and energy can swing — keep meals regular until your next dose." };
  }
  if (f < 0.22) {
    return { ...base, value: "May dip", tone: "neutral", detail: "Fatigue can tag along with the first day or two after a dose — don't over-schedule, and prioritise sleep." };
  }
  if (f < 0.72) {
    return { ...base, value: "Steady", tone: "good", detail: "Mid-cycle is usually your steadiest stretch for energy and focus." };
  }
  return { ...base, value: "Variable", tone: "neutral", detail: "As the drug tapers toward your next dose, energy can swing with returning appetite — keep meals and sleep regular." };
}

function summaryFor(phase: CyclePhase, day: number, cycleDays: number): string {
  const dayStr = `Day ${day} of ${cycleDays}`;
  switch (phase) {
    case "rising":
      return `${dayStr} · your dose is building up — side effects are most likely today, and appetite control is about to peak.`;
    case "peak":
      return `${dayStr} · you're near your medication's peak — hunger is usually lowest. Make it count.`;
    case "declining":
      return `${dayStr} · mid-cycle — your steadiest stretch. Appetite control is strong and side effects are easing.`;
    case "trough":
      return `${dayStr} · nearing the trough — food noise often returns here. Plan ahead for your next dose.`;
    case "overdue":
      return `Your dose looks overdue — appetite typically returns and side effects fade until you take it. Any timing change is your prescriber's call.`;
  }
}
