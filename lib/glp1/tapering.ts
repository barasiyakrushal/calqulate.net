// lib/glp1/tapering.ts
// Data for the "stopping a GLP-1" stage: down-titration (taper) ladders per
// medication, and the regain-risk factor model. Powers the Regain Risk
// Calculator and the Tapering Planner.
//
// Educational only. There is no official manufacturer taper protocol — any
// step-down or stop is a decision made with a prescriber.

export interface TaperDrug {
  id: string;
  drug: "Semaglutide" | "Tirzepatide";
  brands: string;
  /** Full weekly-dose ladder (mg), lowest → highest. Taper walks this downward. */
  ladder: number[];
  note: string;
}

export const TAPER_DRUGS: TaperDrug[] = [
  {
    id: "semaglutide",
    drug: "Semaglutide",
    brands: "Wegovy · Ozempic",
    ladder: [0.25, 0.5, 1.0, 1.7, 2.4],
    note: "Wegovy's own titration climbs 0.25 → 0.5 → 1.0 → 1.7 → 2.4 mg. A taper generally walks the same ladder back down, holding at each step.",
  },
  {
    id: "tirzepatide",
    drug: "Tirzepatide",
    brands: "Zepbound · Mounjaro",
    ladder: [2.5, 5, 7.5, 10, 12.5, 15],
    note: "Tirzepatide's ladder climbs 2.5 → 5 → 7.5 → 10 → 12.5 → 15 mg. A taper generally steps back down through the same doses.",
  },
];

export function getTaperDrug(id: string): TaperDrug | undefined {
  return TAPER_DRUGS.find((d) => d.id === id);
}

/** Weeks to hold at each step during a taper (a common, conservative default). */
export const TAPER_WEEKS_PER_STEP = 4;

/**
 * Build a downward taper schedule from a current dose: every ladder step at or
 * below the current dose, highest → lowest, then stop. Returns the dose and the
 * cumulative week it typically begins.
 */
export function taperSchedule(
  drug: TaperDrug,
  currentMg: number,
  weeksPerStep = TAPER_WEEKS_PER_STEP
): { doseMg: number; startWeek: number }[] {
  const steps = drug.ladder.filter((mg) => mg <= currentMg).sort((a, b) => b - a);
  return steps.map((doseMg, i) => ({ doseMg, startWeek: i * weeksPerStep + 1 }));
}

// ─── regain-risk factor model ─────────────────────────────────────────────────

export interface RegainFactor {
  key: string;
  /** The question shown to the user. */
  question: string;
  /** Label for the protective answer (lowers regain risk). */
  protectiveLabel: string;
  /** Label for the non-protective answer. */
  riskLabel: string;
  /** Relative weight — muscle/taper matter most. */
  weight: number;
  /** Actionable lever shown when the user lacks this protection. */
  lever: string;
}

// Ordered by importance; muscle protection and a gradual taper carry the most weight.
export const REGAIN_FACTORS: RegainFactor[] = [
  {
    key: "lifting",
    question: "Do you do resistance training 2–3 times a week?",
    protectiveLabel: "Yes, I lift regularly",
    riskLabel: "Not really",
    weight: 3,
    lever: "Start resistance training 2–3×/week now. Muscle is the single biggest predictor of keeping weight off — it keeps your metabolism higher after you stop.",
  },
  {
    key: "taper",
    question: "How are you planning to stop?",
    protectiveLabel: "Gradual taper with my prescriber",
    riskLabel: "Stop all at once",
    weight: 3,
    lever: "Taper gradually with your prescriber instead of stopping cold. A slow step-down lets appetite return in stages you can manage, and appears to beat abrupt stopping.",
  },
  {
    key: "protein",
    question: "Are you hitting a daily protein target (about 1.2–1.6 g/kg)?",
    protectiveLabel: "Yes, most days",
    riskLabel: "No / not tracking",
    weight: 2,
    lever: "Get protein to roughly 1.2–1.6 g per kg of body weight, every day. Protein is what protects the muscle that protects your metabolism.",
  },
  {
    key: "pace",
    question: "Did you lose weight at a controlled pace (about 1%/week or less)?",
    protectiveLabel: "Yes, fairly steady",
    riskLabel: "No, it came off fast",
    weight: 1,
    lever: "Fast loss usually costs more muscle. You can still rebuild it with protein and resistance training before and after you stop.",
  },
  {
    key: "habits",
    question: "Have your everyday eating and activity habits genuinely changed?",
    protectiveLabel: "Yes, I live differently now",
    riskLabel: "I mostly relied on the meds",
    weight: 2,
    lever: "Use the appetite-suppressed window to lock in real habits — the eating and movement patterns you keep are what outlast the prescription.",
  },
];

export const REGAIN_MAX_SCORE = REGAIN_FACTORS.reduce((s, f) => s + f.weight, 0);

export type RegainBand = "lower" | "moderate" | "higher";

export function regainBand(score: number): RegainBand {
  const pct = score / REGAIN_MAX_SCORE;
  if (pct >= 0.7) return "lower";
  if (pct >= 0.4) return "moderate";
  return "higher";
}

export const REGAIN_BAND_COPY: Record<
  RegainBand,
  { label: string; headline: string; body: string }
> = {
  lower: {
    label: "Lower regain risk",
    headline: "You've stacked the odds in your favor.",
    body: "You have the protections that separate the people who keep it off from the people who bounce back. Keep them up as you taper — especially muscle and habits.",
  },
  moderate: {
    label: "Moderate regain risk",
    headline: "Some regain is likely without a few changes.",
    body: "You have some protections but not all. The gaps below are exactly where regain tends to happen — closing even one or two meaningfully improves your odds.",
  },
  higher: {
    label: "Higher regain risk",
    headline: "Right now, significant regain is the likely path.",
    body: "In withdrawal trials, people who stopped without these protections regained much of their lost weight. The good news: every lever below is fixable, and starting before you stop matters most.",
  },
};
