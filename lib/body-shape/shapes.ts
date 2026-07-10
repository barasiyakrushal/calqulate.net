/**
 * Body shape classification.
 *
 * The canonical female rules (hourglass, spoon, triangle and friends) are hard
 * thresholds in inches. Hard thresholds have two problems: a millimetre either
 * side flips your shape, and they give you no honest way to say how sure you
 * are. So every rule here is expressed as a SOFT constraint: a value crossing
 * its threshold scores 0.5, and it ramps smoothly to 0 or 1 across a tolerance
 * band. A shape's fit is the weakest of its constraints, and confidence comes
 * from how far the winner beat the runner-up.
 *
 * All measurements are centimetres.
 */

// Canonical thresholds, converted from the inch-based literature.
const IN = 2.54;
const T = {
  one: 1 * IN,        // 2.54
  two: 2 * IN,        // 5.08
  threeSix: 3.6 * IN, // 9.144
  seven: 7 * IN,      // 17.78
  nine: 9 * IN,       // 22.86
  ten: 10 * IN,       // 25.4
  five: 5 * IN,       // 12.7
  highHipRatio: 1.193,
} as const;

/** Tolerance band for the soft constraints, in cm. */
const TOL = 2.5;

/**
 * When two shapes fit equally well, the more specific one should win. Banana is
 * a stricter Rectangle; Spoon is a Bottom Hourglass with a shelf. Higher wins.
 */
const SPECIFICITY: Record<string, number> = {
  Banana: 5, Spoon: 5,
  "Bottom Hourglass": 4, "Top Hourglass": 4,
  Hourglass: 3, Pear: 3, "Inverted Triangle": 3, Apple: 3, Oval: 3, Triangle: 3,
  Trapezoid: 2,
  Rectangle: 1,
};

function byFitThenSpecificity(
  a: { shape: BodyShape; fit: number },
  b: { shape: BodyShape; fit: number },
): number {
  if (Math.abs(b.fit - a.fit) > 1e-6) return b.fit - a.fit;
  return (SPECIFICITY[b.shape] ?? 0) - (SPECIFICITY[a.shape] ?? 0);
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** 0 when well below `threshold`, 0.5 exactly at it, 1 when well above. */
export function atLeast(value: number, threshold: number, tol = TOL): number {
  return clamp01((value - threshold + tol) / (2 * tol));
}
/** 1 when well below `threshold`, 0.5 exactly at it, 0 when well above. */
export function atMost(value: number, threshold: number, tol = TOL): number {
  return 1 - atLeast(value, threshold, tol);
}

// ── shape catalogues ──────────────────────────────────────────────────────────
export const FEMALE_SHAPES = [
  "Hourglass", "Top Hourglass", "Bottom Hourglass", "Pear", "Apple",
  "Rectangle", "Banana", "Spoon", "Inverted Triangle",
] as const;
export type FemaleShape = (typeof FEMALE_SHAPES)[number];

export const MALE_SHAPES = [
  "Rectangle", "Oval", "Triangle", "Inverted Triangle", "Trapezoid",
] as const;
export type MaleShape = (typeof MALE_SHAPES)[number];

export const SOMATOTYPES = ["Ectomorph", "Mesomorph", "Endomorph"] as const;
export type Somatotype = (typeof SOMATOTYPES)[number];

export type BodyShape = FemaleShape | MaleShape;
export type Sex = "female" | "male";

export interface FemaleInput { bust: number; waist: number; hips: number; highHip?: number }
export interface MaleInput { shoulders: number; chest: number; waist: number; hips: number }

export interface ShapeContent {
  characteristics: string[];
  healthInsights: string;
  fitnessFocus: string[];
  clothingFit: string[];
}

export interface Classification {
  shape: BodyShape;
  confidence: number;      // 0..1
  fits: { shape: BodyShape; fit: number }[]; // sorted, for the compare view
  somatotype?: Somatotype; // male only
  whr: number;             // waist-to-hip ratio
  content: ShapeContent;
}

// ── female ────────────────────────────────────────────────────────────────────
export function classifyFemale(m: FemaleInput): Classification {
  const { bust: B, waist: W, hips: H } = m;
  // The high hip is optional; when it's missing assume it sits midway between
  // waist and hip, which is the population norm and keeps Spoon reachable.
  const HH = m.highHip ?? (W + H) / 2;
  const hhRatio = W > 0 ? HH / W : 0;

  const min = (...xs: number[]) => Math.min(...xs);

  const fits: Record<FemaleShape, number> = {
    Hourglass: min(
      atMost(Math.abs(B - H), T.one),
      Math.max(atLeast(B - W, T.nine), atLeast(H - W, T.ten)),
    ),
    "Bottom Hourglass": min(
      atLeast(H - B, T.one),
      atMost(H - B, T.ten),
      atLeast(H - W, T.nine),
      atMost(hhRatio, T.highHipRatio, 0.05),
    ),
    "Top Hourglass": min(
      atLeast(B - H, T.one),
      atMost(B - H, T.ten),
      atLeast(B - W, T.nine),
    ),
    Spoon: min(
      atLeast(H - B, T.two),
      atLeast(H - W, T.seven),
      atLeast(hhRatio, T.highHipRatio, 0.05),
    ),
    Pear: min(
      atLeast(H - B, T.threeSix),
      atMost(H - W, T.nine),
    ),
    "Inverted Triangle": min(
      atLeast(B - H, T.threeSix),
      atMost(B - W, T.nine),
    ),
    // Apple: the waist is the widest point (at least as wide as bust and hip).
    Apple: min(
      atLeast(W, B),
      atLeast(W, H),
    ),
    Rectangle: min(
      atMost(Math.abs(B - H), T.threeSix),
      atMost(B - W, T.nine),
      atMost(H - W, T.ten),
    ),
    // Banana: a rectangle so straight that all three are within ~5cm.
    Banana: min(
      atMost(Math.abs(B - H), T.two),
      atMost(Math.abs(B - W), T.two),
      atMost(Math.abs(H - W), T.two),
    ),
  };

  const ranked = (Object.entries(fits) as [FemaleShape, number][])
    .map(([shape, fit]) => ({ shape: shape as BodyShape, fit }))
    .sort(byFitThenSpecificity);

  const shape = ranked[0].shape as FemaleShape;
  return {
    shape,
    confidence: confidenceFrom(ranked[0].fit, ranked[1]?.fit ?? 0),
    fits: ranked,
    whr: H > 0 ? W / H : 0,
    content: FEMALE_CONTENT[shape],
  };
}

// ── male ──────────────────────────────────────────────────────────────────────
export function classifyMale(m: MaleInput): Classification {
  const { shoulders: S, chest: C, waist: W, hips: H } = m;
  const min = (...xs: number[]) => Math.min(...xs);

  const fits: Record<MaleShape, number> = {
    // Oval: the belly is the widest point, at or above chest and clearly at
    // or beyond the hips.
    Oval: min(atLeast(W, C - T.one), atLeast(W, H - T.two)),
    "Inverted Triangle": min(atLeast(S - H, T.five), atLeast(C - W, T.seven)),
    Trapezoid: min(atLeast(S - H, T.one), atMost(S - H, T.five), atLeast(C - W, T.five)),
    Triangle: atLeast(H - S, T.two),
    Rectangle: min(atMost(Math.abs(S - H), T.two), atMost(C - W, T.five)),
  };

  const ranked = (Object.entries(fits) as [MaleShape, number][])
    .map(([shape, fit]) => ({ shape: shape as BodyShape, fit }))
    .sort(byFitThenSpecificity);

  const shape = ranked[0].shape as MaleShape;
  return {
    shape,
    confidence: confidenceFrom(ranked[0].fit, ranked[1]?.fit ?? 0),
    fits: ranked,
    somatotype: somatotypeOf(m),
    whr: H > 0 ? W / H : 0,
    content: MALE_CONTENT[shape],
  };
}

/**
 * Somatotype is a build tendency, not a circumference shape, so it is reported
 * alongside the geometric shape rather than instead of it.
 */
export function somatotypeOf({ shoulders, chest, waist, hips }: MaleInput): Somatotype {
  const whr = hips > 0 ? waist / hips : 1;
  const taper = chest - waist;
  const frame = shoulders - waist;
  if (whr >= 0.95 || taper <= 0) return "Endomorph";
  if (taper >= T.seven && frame >= T.seven) return "Mesomorph";
  if (taper < T.five && whr < 0.85) return "Ectomorph";
  return "Mesomorph";
}

/** Never claims certainty: bounded to 50..97%. */
export function confidenceFrom(best: number, second: number): number {
  if (best <= 0) return 0.5;
  const margin = Math.min(1, Math.max(0, (best - second) / 0.25));
  return Math.min(0.97, Math.max(0.5, best * (0.65 + 0.35 * margin)));
}

export function classify(sex: Sex, m: FemaleInput | MaleInput): Classification {
  return sex === "female" ? classifyFemale(m as FemaleInput) : classifyMale(m as MaleInput);
}

// ── content ───────────────────────────────────────────────────────────────────
const FEMALE_CONTENT: Record<FemaleShape, ShapeContent> = {
  Hourglass: {
    characteristics: ["Bust and hips are balanced", "Clearly defined waist", "Weight distributes evenly"],
    healthInsights: "Balanced fat distribution usually means a lower waist-to-hip ratio, which is associated with lower cardiometabolic risk. Keep an eye on the waist number rather than the scale.",
    fitnessFocus: ["Full-body strength twice a week", "Keep the waist strong with anti-rotation core work", "Steady cardio for heart health"],
    clothingFit: ["Wrap dresses and belted waists", "Fitted, not boxy", "Avoid shapeless silhouettes"],
  },
  "Top Hourglass": {
    characteristics: ["Bust is larger than hips", "Waist is still well defined", "Fuller upper body"],
    healthInsights: "Upper-body weight can sit closer to the organs, so the waist measurement is the number worth tracking over time.",
    fitnessFocus: ["Back and posterior chain to balance the front", "Lower-body strength", "Core stability"],
    clothingFit: ["A-line and flared skirts", "V-necks to lengthen", "Structured shoulders"],
  },
  "Bottom Hourglass": {
    characteristics: ["Hips are larger than bust", "Waist is clearly defined", "Fuller lower body"],
    healthInsights: "Fat carried on the hips and thighs is metabolically safer than fat carried at the waist. This is a favourable distribution.",
    fitnessFocus: ["Upper-body pulling and pressing", "Glute and hamstring strength", "Mobility for hips"],
    clothingFit: ["Fitted tops with fuller bottoms", "Boot-cut and straight legs", "Define the waist"],
  },
  Pear: {
    characteristics: ["Hips noticeably wider than bust", "Waist narrower than hips", "Weight sits low"],
    healthInsights: "Lower-body fat storage is linked to a lower cardiovascular risk than abdominal storage. Track your waist-to-hip ratio, not just weight.",
    fitnessFocus: ["Build the upper back and shoulders", "Glute strength, not just cardio", "Protein to hold lean mass"],
    clothingFit: ["Wider necklines and detailed tops", "Straight or boot-cut legs", "Darker bottoms"],
  },
  Apple: {
    characteristics: ["Waist is the widest or near-widest point", "Less waist definition", "Weight sits around the middle"],
    healthInsights: "Abdominal fat is the pattern most strongly linked to insulin resistance, blood pressure and heart risk. Reducing waist circumference matters more here than reducing weight.",
    fitnessFocus: ["Walk after meals to blunt glucose", "Resistance training 2 to 3 times a week", "Prioritise protein and sleep"],
    clothingFit: ["Empire and A-line", "Open necklines", "Avoid tight waistbands"],
  },
  Rectangle: {
    characteristics: ["Bust, waist and hips are close in size", "Little waist definition", "Straight silhouette"],
    healthInsights: "A straight silhouette says little on its own. Waist-to-height ratio is the better health signal, so keep your waist under half your height.",
    fitnessFocus: ["Build shoulders and glutes to create shape", "Compound lifts", "Core work for definition"],
    clothingFit: ["Belts and peplums to create a waist", "Layering", "Ruffles and texture"],
  },
  Banana: {
    characteristics: ["All three measurements nearly equal", "Very straight up and down", "Minimal curve"],
    healthInsights: "A very straight frame often carries less lean mass. Resistance training matters more than cardio here, for bone density as much as shape.",
    fitnessFocus: ["Progressive strength training", "Eat enough protein to build", "Glute and shoulder emphasis"],
    clothingFit: ["Create curves with volume", "Belted waists", "Avoid straight, boxy cuts"],
  },
  Spoon: {
    characteristics: ["Hips clearly wider than bust", "A shelf at the high hip", "Defined waist above the hips"],
    healthInsights: "A pronounced high hip is a lower-body storage pattern, generally a favourable one. Watch the waist rather than the hip number.",
    fitnessFocus: ["Upper-body strength to balance", "Hip mobility", "Glute and hamstring work"],
    clothingFit: ["Structured tops", "Flared and A-line bottoms", "Avoid clingy hip fabric"],
  },
  "Inverted Triangle": {
    characteristics: ["Bust or shoulders wider than hips", "Narrow hips", "Athletic upper body"],
    healthInsights: "Upper-body dominance is common in athletes. If the waist is also large, that is the number to act on rather than the shoulders.",
    fitnessFocus: ["Lower-body strength, especially glutes", "Balance pressing with pulling", "Hip and hamstring mobility"],
    clothingFit: ["Fuller skirts and wide legs", "V-necks", "Avoid shoulder padding"],
  },
};

const MALE_CONTENT: Record<MaleShape, ShapeContent> = {
  Rectangle: {
    characteristics: ["Shoulders, chest and waist are close in width", "Straight torso", "Little taper"],
    healthInsights: "A straight torso is neutral on its own. Keep your waist under half your height, which is the strongest simple predictor of metabolic risk.",
    fitnessFocus: ["Build shoulders and lats to create a V", "Compound lifts three times a week", "Enough protein to add lean mass"],
    clothingFit: ["Slim, not skinny", "Structured shoulders", "Layering adds depth"],
  },
  Oval: {
    characteristics: ["Waist is the widest point", "Weight sits around the middle", "Chest is less defined than the belly"],
    healthInsights: "Central adiposity is the pattern most strongly tied to insulin resistance, blood pressure and heart disease. Waist circumference is the number to move.",
    fitnessFocus: ["Walk after meals", "Resistance training to protect muscle in a deficit", "Sleep and protein before anything fancy"],
    clothingFit: ["Straight cuts, single-breasted", "Vertical lines", "Avoid clingy knits at the waist"],
  },
  Triangle: {
    characteristics: ["Hips wider than shoulders", "Weight sits low", "Narrow upper body"],
    healthInsights: "Lower-body storage is metabolically safer than abdominal storage. Building upper-body mass is a shape goal, not a health one.",
    fitnessFocus: ["Overhead and horizontal pressing", "Lat and delt volume", "Progressive overload"],
    clothingFit: ["Structured shoulders", "Straight-leg trousers", "Darker bottoms, lighter tops"],
  },
  "Inverted Triangle": {
    characteristics: ["Shoulders and chest clearly wider than hips", "Strong taper to the waist", "Narrow hips"],
    healthInsights: "A strong chest-to-waist taper usually reflects good lean mass. Keep the waist in check as you add size.",
    fitnessFocus: ["Do not skip legs", "Balance pressing with rowing", "Hip and thoracic mobility"],
    clothingFit: ["Avoid extra shoulder structure", "Straight or relaxed legs", "Simple necklines"],
  },
  Trapezoid: {
    characteristics: ["Shoulders modestly wider than hips", "Chest tapers to the waist", "Balanced athletic build"],
    healthInsights: "This is the balanced, athletic distribution. Maintain it with consistent training and keep tracking waist rather than weight.",
    fitnessFocus: ["Maintain with full-body strength", "Zone 2 cardio for the heart", "Protein at every meal"],
    clothingFit: ["Most cuts work", "Tailored and fitted", "Avoid boxy oversizing"],
  },
};

export const SOMATOTYPE_NOTE: Record<Somatotype, string> = {
  Ectomorph: "Lean, narrow frame that gains muscle slowly. Eat enough and lift heavy.",
  Mesomorph: "Muscular, taper-friendly frame that responds quickly to training.",
  Endomorph: "Softer, wider frame that stores fat readily. Protein and resistance work matter most.",
};
