/**
 * Shareable weekly scorecard — the organic growth loop (research #2 + #10).
 *
 * Compresses the user's progress into a single, branded, screenshot-worthy card
 * (think Whoop Recovery / Oura Readiness) that they can post to a community or
 * hand to a doctor. This module is the PURE data + caption layer; the canvas
 * rendering and share plumbing live in the client component.
 *
 * Privacy by design: we surface change (lost, pace, weeks, vs-trial) — NOT the
 * user's absolute current weight — so a shared card never leaks a raw number the
 * user didn't mean to broadcast. Everything here is derived from data already on
 * the dashboard; nothing new is stored. Pure & deterministic (unit-testable).
 */

const LB = 2.2046226218;
const round1 = (n: number) => Math.round(n * 10) / 10;

export interface ScorecardStat {
  label: string;
  value: string;
  sub?: string;
}

export interface ScorecardData {
  title: string;
  /** e.g. "Week 12 · Semaglutide". */
  periodLabel: string;
  headlineValue: string; // e.g. "24.3 lb"
  headlineLabel: string; // e.g. "Lost so far"
  stats: ScorecardStat[];
  statusLine: string;
  /** Default post caption (editable in the UI). */
  caption: string;
  hashtags: string[];
}

export type ScorecardBenchStatus = "early" | "ahead" | "on-track" | "behind";
export type ScorecardPlateau = "insufficient" | "losing" | "slowing" | "plateau" | "regaining";

export interface ScorecardArgs {
  lostLb: number;
  paceKgPerWeek: number | null;
  weeksOnMed: number | null;
  medLabel: string; // "Semaglutide", "Mounjaro", etc.
  weeklyScore?: number | null; // 0–100
  benchmark?: { status: ScorecardBenchStatus; deltaPct: number; trial: string } | null;
  plateau?: ScorecardPlateau;
}

export function buildScorecard(a: ScorecardArgs): ScorecardData {
  const paceLb = a.paceKgPerWeek != null ? Math.abs(round1(a.paceKgPerWeek * LB)) : null;
  const losing = a.paceKgPerWeek != null && a.paceKgPerWeek < 0;

  const stats: ScorecardStat[] = [];
  if (paceLb != null) {
    stats.push({ label: "Weekly pace", value: `${paceLb} lb`, sub: losing ? "per week" : "holding" });
  }
  if (a.weeksOnMed != null) {
    stats.push({ label: "Weeks in", value: `${a.weeksOnMed}`, sub: "on treatment" });
  }
  if (a.benchmark && a.benchmark.status !== "early") {
    const d = Math.abs(a.benchmark.deltaPct);
    const word = a.benchmark.status === "ahead" ? `+${d}% ahead` : a.benchmark.status === "behind" ? `${d}% behind` : "on track";
    stats.push({ label: `vs ${a.benchmark.trial}`, value: word, sub: "trial average" });
  }
  if (a.weeklyScore != null && a.weeklyScore > 0) {
    stats.push({ label: "Health score", value: `${a.weeklyScore}%`, sub: "this week" });
  }

  return {
    title: "My GLP-1 progress",
    periodLabel: a.weeksOnMed != null ? `Week ${a.weeksOnMed} · ${a.medLabel}` : a.medLabel,
    headlineValue: `${Math.abs(round1(a.lostLb))} lb`,
    headlineLabel: a.lostLb > 0 ? "Lost so far" : "Tracking",
    stats: stats.slice(0, 4),
    statusLine: statusLine(a, losing, paceLb),
    caption: buildCaption(a, losing, paceLb),
    hashtags: ["GLP1", "WeightLoss", a.medLabel.replace(/\s+/g, "")],
  };
}

function statusLine(a: ScorecardArgs, losing: boolean, paceLb: number | null): string {
  if (a.plateau === "plateau") return "Working through a plateau — steady and consistent.";
  if (a.benchmark?.status === "ahead") return `Ahead of the ${a.benchmark.trial} trial average.`;
  if (a.plateau === "regaining") return "Holding the line and staying consistent.";
  if (losing && paceLb) return `Down about ${paceLb} lb a week and counting.`;
  return "One log at a time.";
}

function buildCaption(a: ScorecardArgs, losing: boolean, paceLb: number | null): string {
  const parts: string[] = [];
  if (a.weeksOnMed != null) parts.push(`${a.weeksOnMed} weeks into my GLP-1 journey`);
  if (a.lostLb > 0) parts.push(`down ${Math.abs(round1(a.lostLb))} lb`);
  if (a.benchmark?.status === "ahead") parts.push(`and ahead of the ${a.benchmark.trial} trial average 💪`);
  else if (losing && paceLb) parts.push(`— about ${paceLb} lb a week 💪`);

  const lead = parts.length ? capitalize(parts.join(" ")) : "My GLP-1 progress so far";
  return `${lead}. Tracking everything (dose curve, plateaus, body comp) with Calqulate.net.`;
}

const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
