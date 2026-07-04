import { describe, it, expect } from "vitest";
import { weeklyCorrelations, pearson } from "../correlation";

const WEEK_MS = 7 * 24 * 3_600_000;
const DAY_MS = 24 * 3_600_000;
const T0 = Date.parse("2026-01-01T00:00:00.000Z");
const NOW = T0 + 14 * WEEK_MS;
const at = (weeks: number, dayOffset = 0) => new Date(T0 + weeks * WEEK_MS + dayOffset * DAY_MS).toISOString();

describe("pearson", () => {
  it("returns 1 for a perfect positive line", () => {
    expect(pearson([[1, 2], [2, 4], [3, 6], [4, 8]])).toBeCloseTo(1, 5);
  });
  it("returns -1 for a perfect negative line", () => {
    expect(pearson([[1, 8], [2, 6], [3, 4], [4, 2]])).toBeCloseTo(-1, 5);
  });
  it("is null with no variance or too few points", () => {
    expect(pearson([[1, 5], [2, 5], [3, 5]])).toBeNull();
    expect(pearson([[1, 2], [2, 4]])).toBeNull();
  });
});

describe("weeklyCorrelations", () => {
  it("is insufficient with fewer than 4 usable weeks", () => {
    const weights = [
      { takenAt: at(0), weightKg: 100 },
      { takenAt: at(1), weightKg: 99 },
    ];
    const r = weeklyCorrelations({ weights, nowMs: NOW });
    expect(r.confidence).toBe("insufficient");
    expect(r.insights).toHaveLength(0);
  });

  it("detects that better sleep tracks with more weekly loss", () => {
    // 8 weeks: loss each week scales with that week's sleep.
    const weights = [{ takenAt: at(0), weightKg: 100 }];
    const checkins: { loggedAt: string; sleepHours: number | null; craving: number | null }[] = [];
    let w = 100;
    const sleepByWeek = [5, 8, 5.5, 7.5, 6, 8.5, 5, 7];
    for (let i = 0; i < sleepByWeek.length; i++) {
      const loss = (sleepByWeek[i] - 5) * 0.4 + 0.2; // more sleep → more loss
      w = Math.round((w - loss) * 100) / 100;
      weights.push({ takenAt: at(i + 1), weightKg: w });
      checkins.push({ loggedAt: at(i, 2), sleepHours: sleepByWeek[i], craving: null });
    }
    const r = weeklyCorrelations({ weights, checkins, nowMs: NOW });
    const sleep = r.insights.find((x) => x.factor === "sleep");
    expect(sleep).toBeTruthy();
    expect(sleep!.r).toBeGreaterThan(0.4);
    expect(sleep!.favorable).toBe(true);
    expect(["low", "medium", "high"]).toContain(r.confidence);
  });

  it("ranks the strongest factor first and compares injection sites", () => {
    const weights = [{ takenAt: at(0), weightKg: 100 }];
    const doses: { takenAt: string; injectionSite: any; skipped: boolean }[] = [];
    let w = 100;
    const proteinByWeek = [80, 160, 90, 170, 100, 150, 85, 165];
    const sites = ["abdomen-left", "thigh-right", "abdomen-left", "thigh-right", "abdomen-left", "thigh-right", "abdomen-left", "thigh-right"];
    for (let i = 0; i < proteinByWeek.length; i++) {
      const loss = (proteinByWeek[i] - 80) * 0.01 + 0.2;
      w = Math.round((w - loss) * 100) / 100;
      weights.push({ takenAt: at(i + 1), weightKg: w });
      doses.push({ takenAt: at(i, 1), injectionSite: sites[i], skipped: false });
    }
    const foods = proteinByWeek.map((p, i) => ({ loggedAt: at(i, 3), proteinG: p }));
    const r = weeklyCorrelations({ weights, foods, doses, nowMs: NOW });
    expect(r.topInsight?.factor).toBe("protein");
    expect(r.siteComparison.length).toBe(2);
    // thigh-right weeks had higher protein → more loss, so it should rank first.
    expect(r.siteComparison[0].site).toBe("thigh-right");
  });
});
