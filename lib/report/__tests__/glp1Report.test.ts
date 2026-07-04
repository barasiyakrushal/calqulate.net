import { describe, it, expect } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { Glp1ReportPdf, type Glp1ReportSummary } from "../Glp1ReportPdf";

const full: Glp1ReportSummary = {
  patientName: "Jane Doe",
  patientEmail: "jane@example.com",
  clinician: "Dr. Smith",
  generatedAt: "2026-07-04T12:00:00.000Z",
  medication: { name: "Zepbound", compound: "tirzepatide", currentDoseMg: 7.5, startDate: "2026-03-01T00:00:00.000Z", weeksOnTherapy: 18, doseIntervalDays: 7 },
  metabolicScore: { score: 78, grade: "B" },
  weight: { baselineLb: 220, currentLb: 194, changeLb: 26, changePct: 11.8 },
  bmi: { value: 27.4, category: "Overweight" },
  responseFlag: { level: "ok", label: "Responding", detail: "Down 11.8% of body weight." },
  plateauFlag: { level: "alert", label: "Plateau detected", detail: "Loss flattened over the last 3 weeks." },
  muscleFlag: { level: "watch", label: "Watch muscle", detail: "~28% of recent loss is lean mass." },
  bodyComp: { fatMassLb: 60, leanMassLb: 134, bodyFatPct: 31, waistToHeight: 0.54, leanLossPct: 28, message: "Keep protein up." },
  weightTrend: Array.from({ length: 18 }, (_, i) => ({ t: Date.parse("2026-03-01") + i * 7 * 86_400_000, lb: 220 - i * 1.4 })),
  trialBenchmark: { trial: "SURMOUNT-1", dose: "15 mg weekly", expectedPct: 13, actualPct: 11.8, status: "on-track", message: "Tracking with the trial average." },
  labs: [{ label: "A1c", value: "5.6 %" }, { label: "LDL", value: "98 mg/dL" }],
  medicationLevelPct: 72,
  adherence: { dosesLast30: 4, expectedDosesLast30: 4, missedApprox: 0, resistanceSessionsLast30: 6, siteRotation: [{ site: "abdomen-left", count: 2 }, { site: "thigh-right", count: 2 }], symptomDaysLast30: 5, noSymptomDaysLast30: 20 },
  symptoms: [{ type: "nausea", count: 3, avgSeverity: 2 }, { type: "constipation", count: 2, avgSeverity: 1.5 }],
  todayForecast: { phaseLabel: "Near peak", dayOfCycle: 3, cycleLengthDays: 7, metrics: [{ label: "Appetite & food noise", value: "Well suppressed" }, { label: "Side-effect likelihood", value: "Easing" }, { label: "Energy", value: "Steady" }] },
  correlations: [{ label: "Sleep", message: "Weeks you slept more, you tended to lose more.", favorable: true }, { label: "Protein", message: "Higher-protein weeks lined up with more loss.", favorable: true }],
  sweetSpot: { doseMg: 7.5, message: "7.5 mg gave the best loss-to-side-effect balance so far." },
  nextLevers: [{ label: "Reduce waist / weight", change: "Lose 5% body weight", action: "Aim for a gradual reduction while keeping protein high." }],
  maintenanceOutlook: { projectedLb: 188, note: "At the current trend, projected ~188 lb in 8 weeks. Plan a maintenance strategy before stopping." },
  clinicalImpression: "Plateauing",
  nextReviewSuggestion: "2–4 weeks (flagged items to review)",
  proteinTarget: { minG: 120, maxG: 150 },
};

const minimal: Glp1ReportSummary = {
  patientName: null,
  patientEmail: "new@example.com",
  clinician: null,
  generatedAt: "2026-07-04T12:00:00.000Z",
  medication: null,
  metabolicScore: null,
  weight: null,
  bmi: null,
  responseFlag: null,
  plateauFlag: null,
  muscleFlag: null,
  bodyComp: null,
  weightTrend: [],
  trialBenchmark: null,
  labs: [],
  medicationLevelPct: null,
  adherence: { dosesLast30: 0, expectedDosesLast30: 4, missedApprox: 4, resistanceSessionsLast30: 0, siteRotation: [], symptomDaysLast30: 0, noSymptomDaysLast30: 0 },
  symptoms: [],
  todayForecast: null,
  correlations: [],
  sweetSpot: null,
  nextLevers: [],
  maintenanceOutlook: { projectedLb: null, note: "Insufficient trend data." },
  clinicalImpression: "Early — insufficient data",
  nextReviewSuggestion: "4 weeks (dose-escalation phase)",
  proteinTarget: null,
};

describe("Glp1ReportPdf", () => {
  it("renders a full clinical report to a non-empty PDF", async () => {
    const buf = await renderToBuffer(React.createElement(Glp1ReportPdf, { summary: full }) as any);
    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-"); // valid PDF header
  });

  it("renders with a minimal (mostly empty) summary without throwing", async () => {
    const buf = await renderToBuffer(React.createElement(Glp1ReportPdf, { summary: minimal }) as any);
    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
  });
});
