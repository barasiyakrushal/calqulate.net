/**
 * Free vs. Premium feature registry — the SINGLE SOURCE OF TRUTH.
 *
 * Drives the marketing comparison tables (pricing / home / how-it-works / product
 * pages) AND the in-dashboard premium gating, so the split can never drift between
 * what we advertise and what we actually lock.
 *
 * Strategy (July 2026): the free tier is a competitive weapon — all logging,
 * reminders, the PK-curve teaser, the trial benchmark and the shareable scorecard
 * stay open (they feed the data flywheel and drive virality). Premium gates the
 * forward-looking, personalized, compute-heavy layer — forecasts, simulators, the
 * correlation engine, muscle-loss insight, multi-compound and unlimited history.
 */

export type FeatureTier = "free" | "premium";

/** Stable keys used to gate specific UI in the dashboard. */
export type FeatureKey =
  // Overview
  | "metabolicScore" | "longevityHero" | "bodyAvatar" | "trackerCards" | "trendChart"
  | "trajectoryPanel" | "nextLevers" | "addMeasurement" | "downloadReport"
  // GLP-1 tracker
  | "onboarding" | "coachBanner" | "todayForecast" | "pkCurve" | "progressChart"
  | "correlationEngine" | "benchmark" | "sweetSpot" | "journeyCoach" | "doctorReport"
  | "scorecard" | "muscleTrend" | "quickLog" | "multiCompound" | "trackMore"
  | "refillTracker" | "foodEstimator" | "foodEstimatorUnlimited" | "doseReminders"
  | "reconstitution" | "timeline" | "durableSave"
  // Future You / Autopilot
  | "trajectorySimulator" | "autopilot"
  // History / Settings / Help
  | "history90" | "historyUnlimited" | "helpGuide" | "settings" | "notificationSettings"
  | "billing" | "privacyExport";

export interface FeatureDef {
  key: FeatureKey;
  label: string;
  tier: FeatureTier;
  /** Dashboard section this belongs to (for grouping the comparison table). */
  area: "Overview" | "GLP-1 Tracker" | "Future You" | "Autopilot" | "History" | "Settings";
  /** Short qualifier shown in tables (e.g. "capped" / "rolling 90 days"). */
  note?: string;
}

/**
 * Labels are written as OUTCOMES, not features.
 *
 * Patients do not buy a "correlation engine". They buy knowing why their weight
 * loss stalled. Every label below answers "what does this do for me", because
 * that is what someone on Ozempic is actually shopping for. The `key` is what
 * gates the UI, so keys never change when copy does.
 */
export const FEATURES: FeatureDef[] = [
  // ── Overview ──
  { key: "metabolicScore", label: "See your whole metabolic health as one score", tier: "free", area: "Overview" },
  { key: "longevityHero", label: "See how your habits are shaping your lifespan", tier: "free", area: "Overview" },
  { key: "bodyAvatar", label: "Watch your body change in 3D", tier: "free", area: "Overview" },
  { key: "trackerCards", label: "Keep your key health numbers in one place", tier: "free", area: "Overview" },
  { key: "trendChart", label: "Watch your heart and diabetes risk fall over time", tier: "premium", area: "Overview" },
  { key: "trajectoryPanel", label: "See when you will reach your goal weight", tier: "premium", area: "Overview" },
  { key: "nextLevers", label: "Know the single change that will help you most", tier: "premium", area: "Overview" },
  { key: "addMeasurement", label: "Save full check-ins and build a real history", tier: "premium", area: "Overview" },
  { key: "downloadReport", label: "Download your full health report", tier: "premium", area: "Overview" },

  // ── GLP-1 Tracker ──
  { key: "onboarding", label: "Get set up in under two minutes", tier: "free", area: "GLP-1 Tracker" },
  { key: "coachBanner", label: "Be told what to do next, every time you open it", tier: "free", area: "GLP-1 Tracker" },
  { key: "pkCurve", label: "See how much medication is still working today", tier: "free", area: "GLP-1 Tracker" },
  { key: "benchmark", label: "Know if you are on track against the clinical trials", tier: "free", area: "GLP-1 Tracker" },
  { key: "journeyCoach", label: "See how far you have actually come", tier: "free", area: "GLP-1 Tracker" },
  { key: "scorecard", label: "Share a progress scorecard you are proud of", tier: "free", area: "GLP-1 Tracker" },
  { key: "quickLog", label: "Log a dose, weight, meal or symptom in seconds", tier: "free", area: "GLP-1 Tracker" },
  { key: "trackMore", label: "Track body composition, labs and workouts too", tier: "free", area: "GLP-1 Tracker" },
  { key: "foodEstimator", label: "Find out how much protein is really in your meal", tier: "free", area: "GLP-1 Tracker", note: "capped" },
  { key: "doseReminders", label: "Never miss an injection", tier: "free", area: "GLP-1 Tracker" },
  { key: "reconstitution", label: "Draw the right dose from a compounded vial", tier: "free", area: "GLP-1 Tracker" },
  { key: "timeline", label: "See everything you have logged, in one timeline", tier: "free", area: "GLP-1 Tracker" },
  { key: "durableSave", label: "Never lose an entry, and undo any delete", tier: "free", area: "GLP-1 Tracker" },
  { key: "todayForecast", label: "Know how today will feel before it happens", tier: "premium", area: "GLP-1 Tracker" },
  { key: "progressChart", label: "Watch your progress week by week, and see plateaus coming", tier: "premium", area: "GLP-1 Tracker" },
  { key: "correlationEngine", label: "Find out exactly why your weight loss slowed", tier: "premium", area: "GLP-1 Tracker" },
  { key: "sweetSpot", label: "Know when you are ready, or not ready, to increase your dose", tier: "premium", area: "GLP-1 Tracker" },
  { key: "doctorReport", label: "Bring organized progress reports to your appointments", tier: "premium", area: "GLP-1 Tracker" },
  { key: "muscleTrend", label: "Make sure you are losing fat, not the muscle that keeps weight off", tier: "premium", area: "GLP-1 Tracker" },
  { key: "multiCompound", label: "Track more than one medication at the same time", tier: "premium", area: "GLP-1 Tracker" },
  { key: "refillTracker", label: "Never run out of medication", tier: "premium", area: "GLP-1 Tracker" },
  { key: "foodEstimatorUnlimited", label: "Check the protein in as many meals as you like", tier: "premium", area: "GLP-1 Tracker" },

  // ── Future You / Autopilot ──
  { key: "trajectorySimulator", label: "See your best case, likely case and worst case", tier: "premium", area: "Future You" },
  { key: "autopilot", label: "Get a plan that adapts as your body changes", tier: "premium", area: "Autopilot" },

  // ── History / Settings / Help ──
  { key: "history90", label: "Look back over your last 90 days", tier: "free", area: "History" },
  { key: "historyUnlimited", label: "Keep your complete treatment history forever", tier: "premium", area: "History" },
  { key: "helpGuide", label: "Get help without leaving the app", tier: "free", area: "Settings" },
  { key: "settings", label: "Stay in control of your account", tier: "free", area: "Settings" },
  { key: "notificationSettings", label: "Choose how and when we remind you", tier: "free", area: "Settings" },
  { key: "billing", label: "Manage your subscription in one click", tier: "free", area: "Settings" },
  { key: "privacyExport", label: "Export or permanently delete your data, any time", tier: "free", area: "Settings" },
];

const BY_KEY: Record<FeatureKey, FeatureDef> = Object.fromEntries(FEATURES.map((f) => [f.key, f])) as Record<FeatureKey, FeatureDef>;

export function feature(key: FeatureKey): FeatureDef {
  return BY_KEY[key];
}
export function isPremium(key: FeatureKey): boolean {
  return BY_KEY[key].tier === "premium";
}
export function featureLabel(key: FeatureKey): string {
  return BY_KEY[key].label;
}

export const FREE_FEATURES = FEATURES.filter((f) => f.tier === "free");
export const PREMIUM_FEATURES = FEATURES.filter((f) => f.tier === "premium");

/** Grouped by area, preserving declaration order — for the comparison tables. */
export const FEATURE_AREAS: { area: FeatureDef["area"]; rows: FeatureDef[] }[] = (() => {
  const order: FeatureDef["area"][] = ["Overview", "GLP-1 Tracker", "Future You", "Autopilot", "History", "Settings"];
  return order
    .map((area) => ({ area, rows: FEATURES.filter((f) => f.area === area) }))
    .filter((g) => g.rows.length > 0);
})();
