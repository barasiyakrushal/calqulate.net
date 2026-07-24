// lib/glp1/maintenance.ts
// Data for the GLP-1 maintenance stage: maintenance dose options per medication,
// the "how long / stopping" evidence, and a maintenance-calorie helper. Powers
// the Maintenance Dose Calculator and the Weight Maintenance Planner.
//
// Educational only. Dose and duration decisions belong to a prescriber.

import type { Reference } from "@/lib/citations";

export interface MaintDose {
  mg: number;
  label: string;
  note?: string;
}

export interface MaintDrug {
  id: string;
  drug: "Semaglutide" | "Tirzepatide";
  brands: string;
  /** Doses used for ongoing maintenance (weight management), lowest → highest. */
  maintenanceDoses: MaintDose[];
  note: string;
}

export const MAINT_DRUGS: MaintDrug[] = [
  {
    id: "tirzepatide",
    drug: "Tirzepatide",
    brands: "Zepbound (weight) · Mounjaro (diabetes)",
    maintenanceDoses: [
      { mg: 5, label: "5 mg", note: "Lowest recommended maintenance dose" },
      { mg: 10, label: "10 mg" },
      { mg: 15, label: "15 mg", note: "Maximum dose" },
    ],
    note: "For weight management (Zepbound), the recommended maintenance doses are 5, 10, or 15 mg once weekly. Many people maintain on whichever dose held their weight steady — not necessarily the maximum.",
  },
  {
    id: "semaglutide",
    drug: "Semaglutide",
    brands: "Wegovy (weight) · Ozempic (diabetes)",
    maintenanceDoses: [
      { mg: 1.7, label: "1.7 mg", note: "Accepted maintenance dose if 2.4 mg isn't tolerated" },
      { mg: 2.4, label: "2.4 mg", note: "Standard weight-management maintenance dose" },
    ],
    note: "For weight management (Wegovy), 2.4 mg once weekly is the standard maintenance dose, with 1.7 mg an accepted alternative if the top dose isn't tolerated. Ozempic (for diabetes) maintains at up to 2.0 mg.",
  },
];

export function getMaintDrug(id: string): MaintDrug | undefined {
  return MAINT_DRUGS.find((d) => d.id === id);
}

// ─── how long / stopping evidence ─────────────────────────────────────────────

export const MAINTENANCE_FACTS = {
  duration:
    "GLP-1 medications for weight management are designed as long-term, chronic-use treatments — there is no official manufacturer taper protocol, because the intended use is ongoing.",
  stopping:
    "In withdrawal trials, stopping led to meaningful regain: in STEP 4, people switched to placebo regained about two-thirds of their lost weight over roughly a year, while those who continued semaglutide kept losing. The SURMOUNT-4 trial showed a similar pattern for tirzepatide.",
  realWorld:
    "It isn't all-or-nothing: real-world data suggests just over half of people (roughly 52–56%, depending on the drug) kept off some or all of their loss at 24 months. The keepers tend to share two things — they protected muscle on the way down, and they built durable nutrition and activity habits while on the drug.",
  lowestEffective:
    "Once you reach your goal, the aim shifts from losing to holding. Some people work with their prescriber to step down toward the lowest dose that maintains their weight, rather than staying at the maximum. This is individual and always a clinician's call.",
};

export const MAINTENANCE_REFERENCES: Reference[] = [
  {
    title:
      "Effect of Continued Weekly Subcutaneous Semaglutide vs Placebo on Weight Loss Maintenance in Adults With Overweight or Obesity: The STEP 4 Randomized Clinical Trial",
    authors: "Rubino D, Abrahamsson N, Davies M, et al.",
    journal: "JAMA",
    year: 2021,
    volume: "325",
    issue: "14",
    pages: "1414–1425",
    doi: "10.1001/jama.2021.3224",
    url: "https://jamanetwork.com/journals/jama/fullarticle/2777886",
  },
  {
    title:
      "Continued Treatment With Tirzepatide for Maintenance of Weight Reduction in Adults With Obesity: The SURMOUNT-4 Randomized Clinical Trial",
    authors: "Aronne LJ, Sattar N, Horn DB, et al.",
    journal: "JAMA",
    year: 2024,
    volume: "331",
    issue: "1",
    pages: "38–48",
    doi: "10.1001/jama.2023.24945",
    url: "https://jamanetwork.com/journals/jama/fullarticle/2812936",
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

// ─── maintenance-calorie helper (Mifflin-St Jeor → TDEE) ──────────────────────

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: "Sedentary", hint: "Little exercise" },
  { value: 1.375, label: "Light", hint: "1–2 days/week" },
  { value: 1.55, label: "Moderate", hint: "3–5 days/week" },
  { value: 1.725, label: "Active", hint: "6–7 days/week" },
] as const;

export interface MaintenancePlan {
  maintenanceCalories: number;
  proteinGramsLow: number;
  proteinGramsHigh: number;
  /** Weight above goal (same unit in) at which to actively course-correct. */
  guardrailUp: number;
}

/**
 * Maintenance calories to hold a goal weight, plus a protein band and a regain
 * guardrail. `weight`/returned guardrail share the same unit; heightCm and age
 * are metric/absolute. Protein uses 1.2–1.6 g per kg of body weight.
 */
export function maintenancePlan(
  weight: number,
  unit: "kg" | "lbs",
  heightCm: number,
  age: number,
  sex: "male" | "female",
  activity: number
): MaintenancePlan {
  const weightKg = unit === "lbs" ? weight * 0.45359237 : weight;
  const bmr =
    10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);
  const maintenanceCalories = Math.round((bmr * activity) / 10) * 10;
  return {
    maintenanceCalories,
    proteinGramsLow: Math.round(weightKg * 1.2),
    proteinGramsHigh: Math.round(weightKg * 1.6),
    // ~3% of body weight, a common "act now" threshold, min 3 units.
    guardrailUp: Math.max(3, Math.round(weight * 0.03 * 10) / 10),
  };
}
