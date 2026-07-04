import { describe, it, expect } from "vitest";
import { todayForecast } from "../forecast";

const HOUR_MS = 3_600_000;
const NOW = Date.parse("2026-07-01T12:00:00.000Z");
const hoursAgo = (h: number) => new Date(NOW - h * HOUR_MS).toISOString();

/** A steady weekly semaglutide history: doses every 168h for the last several weeks. */
const weeklyDoses = (lastDoseHoursAgo: number) =>
  Array.from({ length: 6 }, (_, i) => ({ takenAt: hoursAgo(lastDoseHoursAgo + i * 168), amountMg: 1 }));

describe("todayForecast", () => {
  it("is unavailable with no doses", () => {
    expect(todayForecast({ doses: [], compound: "semaglutide", intervalHours: 168, nowMs: NOW }).available).toBe(false);
  });

  it("flags elevated side effects and building phase right after a dose", () => {
    const f = todayForecast({ doses: weeklyDoses(12), compound: "semaglutide", intervalHours: 168, nowMs: NOW });
    expect(f.available).toBe(true);
    expect(f.dayOfCycle).toBe(1);
    expect(f.phase).toBe("rising");
    const se = f.metrics.find((m) => m.key === "sideEffects")!;
    expect(se.value).toBe("Elevated");
    expect(se.tone).toBe("watch");
  });

  it("shows suppressed appetite near the cycle peak", () => {
    // ~3 days after a weekly dose sits near the accumulated peak for semaglutide.
    const f = todayForecast({ doses: weeklyDoses(72), compound: "semaglutide", intervalHours: 168, nowMs: NOW });
    const appetite = f.metrics.find((m) => m.key === "appetite")!;
    expect(["Well suppressed", "Moderate"]).toContain(appetite.value);
    expect(f.levelPctOfPeak).toBeGreaterThan(60);
  });

  it("predicts returning food noise near the trough", () => {
    // ~6.5 days into a weekly cycle → near trough.
    const f = todayForecast({ doses: weeklyDoses(156), compound: "semaglutide", intervalHours: 168, nowMs: NOW });
    expect(f.phase).toBe("trough");
    const appetite = f.metrics.find((m) => m.key === "appetite")!;
    expect(appetite.value).toBe("Likely returning");
    expect(appetite.tone).toBe("watch");
  });

  it("marks the dose overdue when well past the interval", () => {
    const f = todayForecast({ doses: weeklyDoses(168 * 1.4), compound: "semaglutide", intervalHours: 168, nowMs: NOW });
    expect(f.phase).toBe("overdue");
    const se = f.metrics.find((m) => m.key === "sideEffects")!;
    expect(se.value).toBe("Low");
  });

  it("always returns exactly three metrics", () => {
    const f = todayForecast({ doses: weeklyDoses(48), compound: "tirzepatide", intervalHours: 168, nowMs: NOW });
    expect(f.metrics.map((m) => m.key).sort()).toEqual(["appetite", "energy", "sideEffects"]);
  });
});
