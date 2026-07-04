import { describe, it, expect } from "vitest";
import { weightTrajectory, detectPlateau, PLATEAU_SLOPE_KG } from "../trajectory";

const WEEK_MS = 7 * 24 * 3_600_000;
const NOW = Date.parse("2026-07-01T00:00:00.000Z");
const iso = (weeksAgo: number) => new Date(NOW - weeksAgo * WEEK_MS).toISOString();

/** Steady loss: 100kg → 90kg over 10 weeks (1 kg/week). Oldest first weeksAgo=10. */
const steadyLoss = Array.from({ length: 11 }, (_, i) => ({
  takenAt: iso(10 - i),
  weightKg: 100 - i,
}));

describe("weightTrajectory", () => {
  it("returns empty result with no weights", () => {
    const r = weightTrajectory({ weights: [], nowMs: NOW });
    expect(r.points).toEqual([]);
    expect(r.hasProjection).toBe(false);
    expect(r.paceKgPerWeek).toBeNull();
  });

  it("computes a negative pace when losing", () => {
    const r = weightTrajectory({ weights: steadyLoss, nowMs: NOW });
    expect(r.baselineKg).toBeCloseTo(100, 1);
    expect(r.currentKg).toBeCloseTo(90, 1);
    expect(r.paceKgPerWeek).toBeLessThan(0);
    expect(r.paceKgPerWeek).toBeCloseTo(-1, 1);
  });

  it("projects forward beyond the last weigh-in", () => {
    const r = weightTrajectory({ weights: steadyLoss, nowMs: NOW, projectWeeks: 4 });
    expect(r.hasProjection).toBe(true);
    const future = r.points.filter((p) => p.projectedKg != null && p.actualKg == null);
    expect(future.length).toBe(4);
    // ~1 kg/week continued → ~86kg four weeks out.
    expect(r.projectedKg).toBeCloseTo(86, 0);
    // Cone widens with the horizon.
    const first = future[0].band!;
    const last = future[future.length - 1].band!;
    expect(last[1] - last[0]).toBeGreaterThan(first[1] - first[0]);
  });

  it("adds a trial overlay only when a compound is given", () => {
    const withComp = weightTrajectory({ weights: steadyLoss, compound: "semaglutide", nowMs: NOW });
    const withoutComp = weightTrajectory({ weights: steadyLoss, compound: null, nowMs: NOW });
    expect(withComp.points.some((p) => p.trialKg != null)).toBe(true);
    expect(withoutComp.points.every((p) => p.trialKg == null)).toBe(true);
  });
});

describe("detectPlateau", () => {
  it("is insufficient with fewer than 3 weigh-ins", () => {
    expect(detectPlateau(steadyLoss.slice(0, 2), NOW).status).toBe("insufficient");
  });

  it("reports steady loss", () => {
    const r = detectPlateau(steadyLoss, NOW);
    expect(r.status).toBe("losing");
    expect(r.recentPaceKgPerWeek).toBeLessThan(-PLATEAU_SLOPE_KG);
  });

  it("flags a plateau after losing then going flat", () => {
    // Lose 1kg/week for 6 weeks, then flat for the last 4 weeks.
    const weights = [
      ...Array.from({ length: 6 }, (_, i) => ({ takenAt: iso(10 - i), weightKg: 100 - i })), // wk -10..-5
      ...Array.from({ length: 5 }, (_, i) => ({ takenAt: iso(4 - i), weightKg: 94.9 })), // wk -4..0 flat
    ];
    const r = detectPlateau(weights, NOW);
    expect(r.status).toBe("plateau");
    expect(r.weeksStalled).toBeGreaterThan(0);
    expect(r.plateauStartMs).not.toBeNull();
  });

  it("flags regaining when the recent trend rises", () => {
    const weights = [
      ...Array.from({ length: 5 }, (_, i) => ({ takenAt: iso(8 - i), weightKg: 95 })),
      ...Array.from({ length: 4 }, (_, i) => ({ takenAt: iso(3 - i), weightKg: 95 + i })),
    ];
    const r = detectPlateau(weights, NOW);
    expect(r.status).toBe("regaining");
    expect(r.recentPaceKgPerWeek).toBeGreaterThan(PLATEAU_SLOPE_KG);
  });
});
