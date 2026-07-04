import { describe, it, expect } from "vitest";
import { buildScorecard } from "../scorecard";

describe("buildScorecard", () => {
  it("builds a headline from pounds lost", () => {
    const s = buildScorecard({ lostLb: 24.3, paceKgPerWeek: -0.5, weeksOnMed: 12, medLabel: "Semaglutide" });
    expect(s.headlineValue).toBe("24.3 lb");
    expect(s.headlineLabel).toBe("Lost so far");
    expect(s.periodLabel).toBe("Week 12 · Semaglutide");
  });

  it("does not expose absolute current weight anywhere", () => {
    const s = buildScorecard({ lostLb: 20, paceKgPerWeek: -0.4, weeksOnMed: 8, medLabel: "Mounjaro" });
    const blob = JSON.stringify(s).toLowerCase();
    expect(blob).not.toContain("current");
    // stats are all deltas/rates, never a standalone bodyweight
    expect(s.stats.every((st) => !/^\d{2,3}\s*lb$/.test(st.value) || st.label === "")).toBe(true);
  });

  it("includes a vs-trial stat only once past the early window", () => {
    const ahead = buildScorecard({ lostLb: 30, paceKgPerWeek: -0.6, weeksOnMed: 24, medLabel: "Semaglutide", benchmark: { status: "ahead", deltaPct: 2.4, trial: "STEP-1" } });
    expect(ahead.stats.some((st) => st.label === "vs STEP-1")).toBe(true);
    expect(ahead.caption).toContain("ahead of the STEP-1 trial average");

    const early = buildScorecard({ lostLb: 3, paceKgPerWeek: -0.4, weeksOnMed: 2, medLabel: "Semaglutide", benchmark: { status: "early", deltaPct: 0, trial: "STEP-1" } });
    expect(early.stats.some((st) => st.label.startsWith("vs "))).toBe(false);
  });

  it("caps at four stats", () => {
    const s = buildScorecard({ lostLb: 30, paceKgPerWeek: -0.6, weeksOnMed: 24, medLabel: "Semaglutide", weeklyScore: 82, benchmark: { status: "ahead", deltaPct: 2.4, trial: "STEP-1" } });
    expect(s.stats.length).toBeLessThanOrEqual(4);
  });

  it("reflects a plateau in the status line", () => {
    const s = buildScorecard({ lostLb: 30, paceKgPerWeek: 0, weeksOnMed: 20, medLabel: "Semaglutide", plateau: "plateau" });
    expect(s.statusLine.toLowerCase()).toContain("plateau");
  });

  it("always carries hashtags including the compound", () => {
    const s = buildScorecard({ lostLb: 10, paceKgPerWeek: -0.3, weeksOnMed: 5, medLabel: "Zepbound" });
    expect(s.hashtags).toContain("Zepbound");
    expect(s.hashtags).toContain("GLP1");
  });
});
