/**
 * Photo -> body circumferences, for the AI photo mode of the body fat calculator.
 *
 * MediaPipe PoseLandmarker gives 33 skeletal landmarks but no circumferences.
 * So we also ask it for a segmentation mask and do the geometry ourselves:
 *
 *   1. Find the person's pixel height (top of head to feet) from the mask, and
 *      scale it against the real height the user typed. That gives cm-per-pixel.
 *   2. Pick anatomical rows from the landmarks (neck, waist, hips).
 *   3. Measure the body WIDTH at each row from the mask, walking outward from the
 *      torso centre so detached arms are excluded (hence "arms slightly out").
 *   4. Get the DEPTH at each row: measured from an optional side photo, or
 *      assumed from a width ratio when only a front photo is supplied.
 *   5. Treat the cross-section as an ellipse and convert (width, depth) into a
 *      circumference with Ramanujan's approximation.
 *
 * Those circumferences then go into the same U.S. Navy formula the tape mode
 * uses. This is an estimate, not a measurement: front-only mode assumes a depth
 * ratio, and the mask boundary is only as good as the lighting and clothing.
 * The confidence score exists to say so out loud.
 *
 * All maths is pure and unit-testable. Nothing here imports MediaPipe.
 */

// ── MediaPipe pose landmark indices we rely on ────────────────────────────────
export const LM = {
  nose: 0,
  earL: 7,
  earR: 8,
  shoulderL: 11,
  shoulderR: 12,
  hipL: 23,
  hipR: 24,
  ankleL: 27,
  ankleR: 28,
} as const;

export interface Landmark {
  x: number; // normalised 0..1
  y: number; // normalised 0..1
  visibility?: number;
}

/** A person-probability mask, row-major, values 0..1. */
export interface Mask {
  data: Float32Array;
  width: number;
  height: number;
}

export interface Circumferences {
  neckCm: number;
  waistCm: number;
  hipCm: number;
}

export interface PoseMeasurement extends Circumferences {
  confidence: "high" | "medium" | "low";
  confidenceNotes: string[];
  /** Rows used, in mask pixel space, for drawing the overlay. */
  rows: { neckY: number; waistY: number; hipY: number };
  cmPerPx: number;
}

const PERSON_THRESHOLD = 0.5;

// ── mask helpers ──────────────────────────────────────────────────────────────

function isBody(mask: Mask, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= mask.width || y >= mask.height) return false;
  return mask.data[y * mask.width + x] >= PERSON_THRESHOLD;
}

/** Topmost and bottommost rows containing any body pixel. */
export function bodyVerticalExtent(mask: Mask): { top: number; bottom: number } | null {
  let top = -1;
  let bottom = -1;
  for (let y = 0; y < mask.height; y++) {
    let found = false;
    for (let x = 0; x < mask.width; x++) {
      if (mask.data[y * mask.width + x] >= PERSON_THRESHOLD) {
        found = true;
        break;
      }
    }
    if (found) {
      if (top === -1) top = y;
      bottom = y;
    }
  }
  if (top === -1 || bottom <= top) return null;
  return { top, bottom };
}

/**
 * Width of the body run that contains centreX on row y.
 *
 * Walking outward from the torso centre means an arm held away from the body
 * sits beyond a wide background gap and is excluded (hence "arms slightly out").
 * Small gaps are bridged, though: real segmentation masks are pocked with
 * one- and two-pixel holes from shadows, belts and clothing, and stopping at
 * the first hole would silently halve the measured torso. The bridge is capped
 * at 1% of the frame width, far narrower than any arm gap.
 */
export function torsoRunWidth(mask: Mask, y: number, centreX: number): { left: number; right: number; width: number } | null {
  const yy = Math.round(y);
  const cx = Math.round(centreX);

  // Seed on a body pixel: the exact centre can land on a hole.
  let seed = -1;
  if (isBody(mask, cx, yy)) {
    seed = cx;
  } else {
    for (let d = 1; d <= Math.round(mask.width * 0.04); d++) {
      if (isBody(mask, cx - d, yy)) { seed = cx - d; break; }
      if (isBody(mask, cx + d, yy)) { seed = cx + d; break; }
    }
  }
  if (seed === -1) return null;

  const maxGap = Math.max(2, Math.round(mask.width * 0.01));

  const walk = (dir: -1 | 1): number => {
    let edge = seed;
    for (;;) {
      if (isBody(mask, edge + dir, yy)) { edge += dir; continue; }
      // Peek across a small gap; jump it only if the body resumes.
      let jumped = -1;
      for (let g = 2; g <= maxGap + 1; g++) {
        if (isBody(mask, edge + dir * g, yy)) { jumped = edge + dir * g; break; }
      }
      if (jumped === -1) return edge;
      edge = jumped;
    }
  };

  const left = walk(-1);
  const right = walk(1);
  return { left, right, width: right - left + 1 };
}

// ── anatomical rows ───────────────────────────────────────────────────────────

function avgY(a: Landmark, b: Landmark) { return (a.y + b.y) / 2; }
function avgX(a: Landmark, b: Landmark) { return (a.x + b.x) / 2; }

/**
 * Rows (in mask pixels) for neck, waist and hips.
 * Neck sits just above the shoulders, toward the ears.
 * Waist: men measure at the navel, so we use a fixed fraction up from the hips.
 * Women measure at the narrowest point, so we search for the minimum width.
 * Hips: the widest row at or just below the hip landmarks.
 */
export function anatomicalRows(
  lms: Landmark[],
  mask: Mask,
  sex: "male" | "female",
): { neckY: number; waistY: number; hipY: number; centreX: number } {
  const H = mask.height;
  const W = mask.width;

  const shoulderY = avgY(lms[LM.shoulderL], lms[LM.shoulderR]) * H;
  const hipY = avgY(lms[LM.hipL], lms[LM.hipR]) * H;
  const earY = avgY(lms[LM.earL], lms[LM.earR]) * H;
  const centreX = avgX(lms[LM.shoulderL], lms[LM.shoulderR]) * W;
  const hipCentreX = avgX(lms[LM.hipL], lms[LM.hipR]) * W;

  const torso = Math.max(1, hipY - shoulderY);

  // Neck: 30% of the way from the shoulders up toward the ears.
  const neckY = Math.max(0, shoulderY - 0.3 * (shoulderY - earY));

  // Waist
  let waistY: number;
  if (sex === "female") {
    // narrowest torso row between shoulders and hips
    let best = Infinity;
    let bestY = hipY - 0.35 * torso;
    const from = Math.round(shoulderY + 0.25 * torso);
    const to = Math.round(hipY - 0.05 * torso);
    for (let y = from; y <= to; y++) {
      const run = torsoRunWidth(mask, y, centreX);
      if (run && run.width < best) { best = run.width; bestY = y; }
    }
    waistY = bestY;
  } else {
    // navel level: ~35% up from the hips toward the shoulders
    waistY = hipY - 0.35 * torso;
  }

  // Hips: widest row from just above to a little below the hip landmarks.
  let widest = -1;
  let hipsY = hipY;
  const from = Math.round(hipY - 0.05 * torso);
  const to = Math.round(hipY + 0.22 * torso);
  for (let y = from; y <= to; y++) {
    const run = torsoRunWidth(mask, y, hipCentreX);
    if (run && run.width > widest) { widest = run.width; hipsY = y; }
  }

  return { neckY, waistY, hipY: hipsY, centreX };
}

// ── geometry ──────────────────────────────────────────────────────────────────

/** Ramanujan's approximation for the perimeter of an ellipse with semi-axes a, b. */
export function ellipseCircumference(a: number, b: number): number {
  if (a <= 0 || b <= 0) return 0;
  const h = ((a - b) * (a - b)) / ((a + b) * (a + b));
  return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

/** Convert a measured width and depth (cm) into a circumference (cm). */
export function circumferenceFrom(widthCm: number, depthCm: number): number {
  return ellipseCircumference(widthCm / 2, depthCm / 2);
}

/**
 * Depth-to-width ratios used when only a front photo is available.
 * The neck is near-circular; the torso is flatter front-to-back than side-to-side.
 * These are population averages, which is exactly why front-only is "medium"
 * confidence at best.
 */
export const ASSUMED_DEPTH_RATIO = { neck: 0.95, waist: 0.72, hip: 0.75 } as const;

// ── main entry ────────────────────────────────────────────────────────────────

export interface MeasureArgs {
  front: { landmarks: Landmark[]; mask: Mask };
  /** Optional side photo. When present, depth is measured instead of assumed. */
  side?: { landmarks: Landmark[]; mask: Mask } | null;
  heightCm: number;
  sex: "male" | "female";
}

export function measureFromPose(args: MeasureArgs): PoseMeasurement | null {
  const { front, side, heightCm, sex } = args;
  if (!front.landmarks?.length || heightCm <= 0) return null;

  const extent = bodyVerticalExtent(front.mask);
  if (!extent) return null;
  const pixelHeight = extent.bottom - extent.top;
  if (pixelHeight < 40) return null; // person too small in frame to measure
  const cmPerPx = heightCm / pixelHeight;

  const rows = anatomicalRows(front.landmarks, front.mask, sex);

  const neckRun = torsoRunWidth(front.mask, rows.neckY, rows.centreX);
  const waistRun = torsoRunWidth(front.mask, rows.waistY, rows.centreX);
  const hipRun = torsoRunWidth(front.mask, rows.hipY, rows.centreX);
  if (!neckRun || !waistRun || !hipRun) return null;

  const neckW = neckRun.width * cmPerPx;
  const waistW = waistRun.width * cmPerPx;
  const hipW = hipRun.width * cmPerPx;

  // Depth: measured from the side photo when we have one, else assumed.
  let neckD = neckW * ASSUMED_DEPTH_RATIO.neck;
  let waistD = waistW * ASSUMED_DEPTH_RATIO.waist;
  let hipD = hipW * ASSUMED_DEPTH_RATIO.hip;
  let measuredDepth = false;

  if (side?.landmarks?.length) {
    const sExtent = bodyVerticalExtent(side.mask);
    if (sExtent && sExtent.bottom - sExtent.top >= 40) {
      const sCmPerPx = heightCm / (sExtent.bottom - sExtent.top);
      const sRows = anatomicalRows(side.landmarks, side.mask, sex);
      const sNeck = torsoRunWidth(side.mask, sRows.neckY, sRows.centreX);
      const sWaist = torsoRunWidth(side.mask, sRows.waistY, sRows.centreX);
      const sHip = torsoRunWidth(side.mask, sRows.hipY, sRows.centreX);
      if (sNeck && sWaist && sHip) {
        neckD = sNeck.width * sCmPerPx;
        waistD = sWaist.width * sCmPerPx;
        hipD = sHip.width * sCmPerPx;
        measuredDepth = true;
      }
    }
  }

  const neckCm = circumferenceFrom(neckW, neckD);
  const waistCm = circumferenceFrom(waistW, waistD);
  const hipCm = circumferenceFrom(hipW, hipD);

  // The Navy formula needs waist > neck (and waist+hip > neck for women).
  if (!(waistCm > 0) || !(neckCm > 0) || waistCm <= neckCm) return null;

  // ── confidence ──────────────────────────────────────────────────────────────
  const notes: string[] = [];
  const key = [LM.shoulderL, LM.shoulderR, LM.hipL, LM.hipR];
  const minVis = Math.min(...key.map((i) => front.landmarks[i]?.visibility ?? 1));
  const framing = pixelHeight / front.mask.height; // how much of the frame the body fills

  let score = 2; // start at medium
  if (measuredDepth) { score += 1; } else { notes.push("Front photo only, so torso depth is assumed from population averages. Add a side photo for a better estimate."); }
  if (minVis < 0.7) { score -= 1; notes.push("Some shoulder or hip points were hard to see. Try better lighting and tighter clothing."); }
  if (framing < 0.6) { score -= 1; notes.push("Your body filled only part of the frame. Stand so your whole body fits, head to feet."); }
  // Arms fused to the torso inflate the waist relative to the hips.
  if (waistRun.width > hipRun.width * 1.35) { score -= 1; notes.push("Your arms may be touching your torso. Hold them slightly away from your body and retake."); }

  const confidence: PoseMeasurement["confidence"] = score >= 3 ? "high" : score === 2 ? "medium" : "low";
  if (notes.length === 0) notes.push("Good pose, lighting and framing detected.");

  return {
    neckCm,
    waistCm,
    hipCm,
    confidence,
    confidenceNotes: notes,
    rows: { neckY: rows.neckY, waistY: rows.waistY, hipY: rows.hipY },
    cmPerPx,
  };
}

// ── U.S. Navy body fat, shared by tape mode and photo mode ────────────────────

export function navyBodyFat(args: {
  sex: "male" | "female";
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number;
}): number | null {
  const { sex, heightCm, neckCm, waistCm } = args;
  const hipCm = args.hipCm ?? 0;
  if (heightCm <= 0 || neckCm <= 0 || waistCm <= 0) return null;

  let bfp: number;
  if (sex === "male") {
    if (waistCm <= neckCm) return null;
    bfp = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(heightCm)) - 450;
  } else {
    if (waistCm + hipCm <= neckCm) return null;
    bfp = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipCm - neckCm) + 0.221 * Math.log10(heightCm)) - 450;
  }
  if (!Number.isFinite(bfp)) return null;
  return Math.min(70, Math.max(2, bfp));
}

/**
 * Rough skeletal-muscle share of lean mass. Lean mass is muscle plus bone,
 * organs and water, so skeletal muscle is only about half of it. Sex-specific
 * averages; a genuine estimate, not a measurement.
 */
export const SMM_FRACTION_OF_LBM = { male: 0.52, female: 0.46 } as const;
