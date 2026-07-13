/**
 * Central catalog of every Calqulate health calculator.
 * Used to power consistent, category-based internal linking across calculator
 * pages (see components/calculators/related-calculators.tsx).
 *
 * `slug` is the folder name under app/health/<slug>; the public URL is
 * /health/<slug>. Keep this in sync when adding or renaming a calculator.
 */
export type CalculatorCategory =
  | "Body Composition"
  | "Appearance"
  | "Disease Risk"
  | "Cardio Health"
  | "Nutrition & Weight"
  | "Fitness Performance"
  | "Women's Health"
  | "Mental Wellness";

export interface CatalogEntry {
  slug: string;
  name: string;
  category: CalculatorCategory;
}

export const CALCULATORS: CatalogEntry[] = [
  { slug: "absi-calculator", name: "ABSI Calculator", category: "Body Composition" },
  { slug: "adjusted-body-weight-calculator", name: "Adjusted Body Weight Calculator", category: "Body Composition" },
  { slug: "age-calculator", name: "Age Calculator", category: "Body Composition" },
  { slug: "ai-attractiveness-test", name: "AI Attractiveness Test", category: "Appearance" },
  { slug: "ascvd-risk-calculator", name: "ASCVD Risk Calculator", category: "Disease Risk" },
  { slug: "blood-pressure-calculator", name: "Blood Pressure Calculator", category: "Cardio Health" },
  { slug: "body-shape-calculator", name: "Body Shape Calculator", category: "Appearance" },
  { slug: "body-fat-calculator", name: "Body Fat Calculator", category: "Body Composition" },
  { slug: "bmi-calculator", name: "BMI Calculator", category: "Body Composition" },
  { slug: "bmr-calculator", name: "BMR Calculator", category: "Nutrition & Weight" },
  { slug: "calorie-deficit-calculator", name: "Calorie Deficit Calculator", category: "Nutrition & Weight" },
  { slug: "breast-cancer-risk-calculator", name: "Breast Cancer Risk Calculator", category: "Disease Risk" },
  { slug: "cholesterol-ratio-calculator", name: "Cholesterol Ratio Calculator", category: "Cardio Health" },
  { slug: "calories-burned-calculator", name: "Calories Burned Calculator", category: "Nutrition & Weight" },
  { slug: "creatinine-clearance-calculator", name: "Creatinine Clearance Calculator", category: "Disease Risk" },
  { slug: "draw-length-calculator", name: "Draw Length Calculator", category: "Fitness Performance" },
  { slug: "daily-water-intake-calculator", name: "Daily Water Intake Calculator", category: "Nutrition & Weight" },
  { slug: "diabetes-risk-calculator", name: "Diabetes Risk Calculator", category: "Disease Risk" },
  { slug: "dress-size-calculator", name: "Dress Size Calculator", category: "Appearance" },
  { slug: "face-shape-calculator", name: "Face Shape Calculator", category: "Appearance" },
  { slug: "estimated-average-glucose-calculator", name: "eAG Calculator", category: "Disease Risk" },
  { slug: "fat-intake-calculator", name: "Fat Intake Calculator", category: "Nutrition & Weight" },
  { slug: "framingham-risk-score-calculator", name: "Framingham Risk Calculator", category: "Disease Risk" },
  { slug: "glp-1-dose-calculator", name: "GLP-1 Dose Calculator", category: "Disease Risk" },
  { slug: "semaglutide-dose-calculator", name: "Semaglutide Dose Calculator", category: "Disease Risk" },
  { slug: "tirzepatide-dose-calculator", name: "Tirzepatide Dose Calculator", category: "Disease Risk" },
  { slug: "glp-1-half-life-calculator", name: "GLP-1 Half-Life Calculator", category: "Disease Risk" },
  { slug: "glp-1-unit-converter", name: "GLP-1 Unit Converter", category: "Disease Risk" },
  { slug: "glp-1-injection-day-calculator", name: "GLP-1 Injection Day Calculator", category: "Disease Risk" },
  { slug: "heart-age-calculator", name: "Heart Age Calculator", category: "Cardio Health" },
  { slug: "golden-ratio-face-calculator", name: "Golden Ratio Face Calculator", category: "Appearance" },
  { slug: "ideal-body-weight-calculator", name: "Ideal Body Weight Calculator", category: "Body Composition" },
  { slug: "macro-calculator", name: "Macro Calculator", category: "Nutrition & Weight" },
  { slug: "lean-body-mass-calculator", name: "Lean Body Mass Calculator", category: "Body Composition" },
  { slug: "heart-rate-calculator", name: "Heart Rate Calculator", category: "Cardio Health" },
  { slug: "ivf-pregnancy-due-date-calculator", name: "IVF Pregnancy Due Date Calculator", category: "Women's Health" },
  { slug: "karvonen-formula-calculator", name: "Karvonen Formula Calculator", category: "Fitness Performance" },
  { slug: "obesity-risk-calculator", name: "Obesity Risk Calculator", category: "Disease Risk" },
  { slug: "ovulation-calculator", name: "Ovulation Calculator", category: "Women's Health" },
  { slug: "one-rep-max-calculator", name: "One Rep Max Calculator", category: "Fitness Performance" },
  { slug: "mean-arterial-pressure-calculator", name: "Mean Arterial Pressure Calculator", category: "Cardio Health" },
  { slug: "ponderal-index-calculator", name: "Ponderal Index Calculator", category: "Body Composition" },
  { slug: "pulse-pressure-calculator", name: "Pulse Pressure Calculator", category: "Cardio Health" },
  { slug: "sleep-debt-calculator", name: "Sleep Debt Calculator", category: "Mental Wellness" },
  { slug: "period-cycle-calculator", name: "Period Cycle Calculator", category: "Women's Health" },
  { slug: "pregnancy-weight-gain-calculator", name: "Pregnancy Weight Gain Calculator", category: "Women's Health" },
  { slug: "rfm-calculator", name: "RFM Calculator", category: "Body Composition" },
  { slug: "qrisk3-calculator", name: "QRISK3 Calculator", category: "Disease Risk" },
  { slug: "running-pace-calculator", name: "Running Pace Calculator", category: "Fitness Performance" },
  { slug: "sleep-cycle-calculator", name: "Sleep Cycle Calculator", category: "Mental Wellness" },
  { slug: "resting-heart-rate-calculator", name: "Resting Heart Rate Calculator", category: "Cardio Health" },
  { slug: "stress-level-calculator", name: "Stress Level Calculator", category: "Mental Wellness" },
  { slug: "tdee-calculator", name: "TDEE Calculator", category: "Nutrition & Weight" },
  { slug: "vo2-max-calculator", name: "VO2 Max Calculator", category: "Fitness Performance" },
  { slug: "waist-to-height-ratio-calculator", name: "Waist to Height Ratio Calculator", category: "Body Composition" },
  { slug: "wilks-calculator", name: "Wilks Calculator", category: "Fitness Performance" },
  { slug: "waist-to-hip-ratio-calculator", name: "Waist to Hip Ratio Calculator", category: "Body Composition" },
  { slug: "weight-loss-percentage-calculator", name: "Weight Loss Percentage Calculator", category: "Body Composition" },
];

/** All calculators in the same category as `slug`, excluding `slug` itself. */
export function getRelatedCalculators(slug: string, limit?: number): CatalogEntry[] {
  const current = CALCULATORS.find((c) => c.slug === slug);
  if (!current) return [];
  const siblings = CALCULATORS.filter(
    (c) => c.category === current.category && c.slug !== slug,
  );
  return typeof limit === "number" ? siblings.slice(0, limit) : siblings;
}

export function getCategory(slug: string): CalculatorCategory | null {
  return CALCULATORS.find((c) => c.slug === slug)?.category ?? null;
}
