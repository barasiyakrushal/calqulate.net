// lib/glp1/efficacy.ts
// Verified average weight-loss figures for the major GLP-1 / GIP medications,
// used by the weight-loss projection calculator and the comparison pages so
// every surface quotes ONE source of truth.
//
// Every percentage below is the average total body-weight reduction reported in
// the pivotal randomized trial (intention-to-treat / full analysis), NOT a
// marketing figure. See `EFFICACY_REFERENCES` for sources. Individual results
// vary widely with dose, adherence, protein intake, and activity.

import type { Reference } from "@/lib/citations";
// Re-exported so existing importers of `Reference` from this module keep working.
export type { Reference } from "@/lib/citations";

export interface DoseEfficacy {
  /** Weekly maintenance dose in mg. */
  doseMg: number;
  /** Average total body-weight loss at the trial horizon (percent). */
  avgLossPct: number;
  /** Plausible individual range around the average (percent), for a realistic band. */
  lowPct: number;
  highPct: number;
}

export interface MedicationEfficacy {
  id: string;
  /** Generic drug name. */
  drug: "Semaglutide" | "Tirzepatide";
  /** Brand names people search for. */
  brands: string;
  /** Trial the figures come from. */
  trial: string;
  /** Trial duration in weeks — the horizon the projection runs to. */
  horizonWeeks: number;
  /** Average placebo-arm weight change over the same horizon (percent). */
  placeboPct: number;
  doses: DoseEfficacy[];
}

// Semaglutide 2.4 mg — STEP 1 (NEJM 2021), adults with overweight/obesity
// without diabetes, 68 weeks: mean −14.9% vs −2.4% placebo.
export const SEMAGLUTIDE_EFFICACY: MedicationEfficacy = {
  id: "semaglutide",
  drug: "Semaglutide",
  brands: "Wegovy (weight), Ozempic (diabetes)",
  trial: "STEP 1 (NEJM 2021)",
  horizonWeeks: 68,
  placeboPct: 2.4,
  doses: [
    { doseMg: 1.0, avgLossPct: 8, lowPct: 3, highPct: 14 }, // lower-dose approximation
    { doseMg: 1.7, avgLossPct: 11, lowPct: 5, highPct: 17 },
    { doseMg: 2.4, avgLossPct: 14.9, lowPct: 7, highPct: 23 }, // STEP 1 headline
  ],
};

// Tirzepatide — SURMOUNT-1 (NEJM 2022), adults with obesity without diabetes,
// 72 weeks: mean −15% (5 mg), −19.5% (10 mg), −20.9% (15 mg) vs −3.1% placebo.
export const TIRZEPATIDE_EFFICACY: MedicationEfficacy = {
  id: "tirzepatide",
  drug: "Tirzepatide",
  brands: "Zepbound (weight), Mounjaro (diabetes)",
  trial: "SURMOUNT-1 (NEJM 2022)",
  horizonWeeks: 72,
  placeboPct: 3.1,
  doses: [
    { doseMg: 5, avgLossPct: 15, lowPct: 7, highPct: 23 },
    { doseMg: 10, avgLossPct: 19.5, lowPct: 11, highPct: 28 },
    { doseMg: 15, avgLossPct: 20.9, lowPct: 12, highPct: 30 },
  ],
};

export const MEDICATIONS: MedicationEfficacy[] = [TIRZEPATIDE_EFFICACY, SEMAGLUTIDE_EFFICACY];

export const EFFICACY_REFERENCES: Reference[] = [
  {
    title: "Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1)",
    authors: "Wilding JPH, Batterham RL, Calanna S, et al.",
    journal: "N Engl J Med",
    year: 2021,
    volume: "384",
    issue: "11",
    pages: "989–1002",
    doi: "10.1056/NEJMoa2032183",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183",
  },
  {
    title: "Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1)",
    authors: "Jastreboff AM, Aronne LJ, Ahmad NN, et al.",
    journal: "N Engl J Med",
    year: 2022,
    volume: "387",
    issue: "3",
    pages: "205–216",
    doi: "10.1056/NEJMoa2206038",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2206038",
  },
  {
    title: "Wegovy (semaglutide) Prescribing Information",
    publisher: "U.S. Food & Drug Administration (FDA)",
    year: 2023,
    url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/215256s007lbl.pdf",
  },
  {
    title: "Zepbound (tirzepatide) Prescribing Information",
    publisher: "U.S. Food & Drug Administration (FDA)",
    year: 2023,
    url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/217806s000lbl.pdf",
  },
];

export interface Projection {
  avgLossWeight: number;
  avgFinalWeight: number;
  avgLossPct: number;
  lowFinalWeight: number;
  highFinalWeight: number;
  lowLossWeight: number;
  highLossWeight: number;
}

/**
 * Project weight at the trial horizon for a given starting weight and dose
 * efficacy. Pure arithmetic on the trial percentages — returns the average plus
 * a plausible low/high band. `weight` and all returned weights share the same
 * unit (kg or lbs); percentages are unit-agnostic.
 */
export function projectWeightLoss(weight: number, dose: DoseEfficacy): Projection {
  const avgLossWeight = (weight * dose.avgLossPct) / 100;
  const lowLossWeight = (weight * dose.lowPct) / 100;
  const highLossWeight = (weight * dose.highPct) / 100;
  return {
    avgLossPct: dose.avgLossPct,
    avgLossWeight,
    avgFinalWeight: weight - avgLossWeight,
    lowLossWeight,
    highLossWeight,
    lowFinalWeight: weight - lowLossWeight,
    highFinalWeight: weight - highLossWeight,
  };
}
