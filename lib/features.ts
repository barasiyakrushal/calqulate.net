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

export const FEATURES: FeatureDef[] = [
  // ── Overview ──
  { key: "metabolicScore", label: "Metabolic health score", tier: "free", area: "Overview" },
  { key: "longevityHero", label: "Longevity Hero (headline number)", tier: "free", area: "Overview" },
  { key: "bodyAvatar", label: "3D Body Avatar", tier: "free", area: "Overview" },
  { key: "trackerCards", label: "Tracker cards", tier: "free", area: "Overview" },
  { key: "trendChart", label: "Trend chart (score / ASCVD / diabetes / heart-age)", tier: "premium", area: "Overview" },
  { key: "trajectoryPanel", label: "Trajectory panel (8-week forecast)", tier: "premium", area: "Overview" },
  { key: "nextLevers", label: "Next-levers simulator", tier: "premium", area: "Overview" },
  { key: "addMeasurement", label: "Add-a-measurement form (full biometric, durable save)", tier: "premium", area: "Overview" },
  { key: "downloadReport", label: "Download PDF report", tier: "premium", area: "Overview" },

  // ── GLP-1 Tracker ──
  { key: "onboarding", label: "6-step onboarding wizard", tier: "free", area: "GLP-1 Tracker" },
  { key: "coachBanner", label: "Contextual coach banner", tier: "free", area: "GLP-1 Tracker" },
  { key: "pkCurve", label: "PK curve (simplified, “today’s %”)", tier: "free", area: "GLP-1 Tracker" },
  { key: "benchmark", label: "Clinical-study benchmark (simple verdict)", tier: "free", area: "GLP-1 Tracker" },
  { key: "journeyCoach", label: "Journey coach", tier: "free", area: "GLP-1 Tracker" },
  { key: "scorecard", label: "Shareable scorecard", tier: "free", area: "GLP-1 Tracker" },
  { key: "quickLog", label: "Quick log (dose, weight, food, symptoms)", tier: "free", area: "GLP-1 Tracker" },
  { key: "trackMore", label: "Track more (body comp, labs, exercise)", tier: "free", area: "GLP-1 Tracker" },
  { key: "foodEstimator", label: "Smart food estimator", tier: "free", area: "GLP-1 Tracker", note: "capped" },
  { key: "doseReminders", label: "Dose reminders", tier: "free", area: "GLP-1 Tracker" },
  { key: "reconstitution", label: "Reconstitution calculator", tier: "free", area: "GLP-1 Tracker" },
  { key: "timeline", label: "Recent-entries timeline", tier: "free", area: "GLP-1 Tracker" },
  { key: "durableSave", label: "Durable save + soft-delete/restore", tier: "free", area: "GLP-1 Tracker" },
  { key: "todayForecast", label: "Today’s forecast (appetite/energy/side-effects)", tier: "premium", area: "GLP-1 Tracker" },
  { key: "progressChart", label: "Progress & prediction chart (projection + plateau)", tier: "premium", area: "GLP-1 Tracker" },
  { key: "correlationEngine", label: "“What moves your results” correlation engine", tier: "premium", area: "GLP-1 Tracker" },
  { key: "sweetSpot", label: "Dosing sweet-spot", tier: "premium", area: "GLP-1 Tracker" },
  { key: "doctorReport", label: "Doctor PDF report", tier: "premium", area: "GLP-1 Tracker" },
  { key: "muscleTrend", label: "Fat-vs-muscle trend + muscle-loss flag", tier: "premium", area: "GLP-1 Tracker" },
  { key: "multiCompound", label: "Multi-compound support (GLP-1/peptide/TRT)", tier: "premium", area: "GLP-1 Tracker" },
  { key: "refillTracker", label: "Refill tracker (supply, copay, prior-auth)", tier: "premium", area: "GLP-1 Tracker" },
  { key: "foodEstimatorUnlimited", label: "Unlimited smart food estimator", tier: "premium", area: "GLP-1 Tracker" },

  // ── Future You / Autopilot ──
  { key: "trajectorySimulator", label: "Trajectory simulator (optimistic/realistic/pessimistic)", tier: "premium", area: "Future You" },
  { key: "autopilot", label: "Adaptive protocol builder (Autopilot)", tier: "premium", area: "Autopilot" },

  // ── History / Settings / Help ──
  { key: "history90", label: "Measurement history (rolling 90 days)", tier: "free", area: "History" },
  { key: "historyUnlimited", label: "Unlimited measurement history", tier: "premium", area: "History" },
  { key: "helpGuide", label: "In-app help guide", tier: "free", area: "Settings" },
  { key: "settings", label: "Settings panel", tier: "free", area: "Settings" },
  { key: "notificationSettings", label: "Notification settings", tier: "free", area: "Settings" },
  { key: "billing", label: "Subscription status / manage billing", tier: "free", area: "Settings" },
  { key: "privacyExport", label: "Privacy & data export", tier: "free", area: "Settings" },
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
