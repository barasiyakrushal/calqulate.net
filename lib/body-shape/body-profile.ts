/**
 * Measurements -> a parametric body silhouette.
 *
 * Instead of shipping GLB meshes with baked morph targets (which would snap the
 * user to one of nine canned shapes), the body is generated from their actual
 * numbers. Each anatomical level is an ellipse: a circumference plus a
 * depth-to-width ratio gives a (width, depth) pair. Stack the ellipses, loft a
 * surface through them, and you have a faceless, neutral-proportion body whose
 * silhouette IS their measurements.
 *
 * Morphing is then just interpolating two profiles, which is a genuine smooth
 * morph and costs nothing to download.
 *
 * All lengths are centimetres. y is measured up from the floor.
 */

import { ellipseCircumference } from "@/lib/bodyfat/pose-measure";
import type { Sex } from "./shapes";

export interface Level { y: number; w: number; d: number }
export interface BodyProfile {
  height: number;
  torso: Level[];  // crotch -> top of head
  leg: Level[];    // ankle -> crotch
  arm: Level[];    // shoulder -> wrist
  legOffsetX: number;
  armOffsetX: number;
}

/** Nominal heights, used only to place levels when no height is supplied. */
export const NOMINAL_HEIGHT: Record<Sex, number> = { female: 165, male: 178 };

/**
 * Ellipse perimeter is homogeneous of degree 1 in scale, so for a fixed
 * depth:width ratio the width is exactly proportional to the circumference.
 * That makes the inversion a single division rather than a numeric solve.
 */
export function widthFromCircumference(circumference: number, depthRatio: number): number {
  if (!(circumference > 0) || !(depthRatio > 0)) return 0;
  const unit = ellipseCircumference(0.5, depthRatio / 2); // perimeter when w = 1
  return circumference / unit;
}

/** Depth-to-width ratios by anatomical level. Shoulders are wide and flat. */
const RATIO = {
  ankle: 0.95, calf: 0.9, knee: 0.95, thigh: 0.9, crotch: 0.8,
  hip: 0.78, highHip: 0.76, waist: 0.72, ribs: 0.72, chest: 0.72,
  underarm: 0.65, shoulder: 0.55, neck: 0.95, jaw: 0.9, head: 0.85,
  arm: 0.95,
} as const;

/** Level heights as a fraction of total stature. */
const FRAC = {
  ankle: 0.045, calf: 0.14, knee: 0.28, thigh: 0.42, crotch: 0.47,
  hip: 0.515, highHip: 0.555, waist: 0.615, ribs: 0.665, chest: 0.72,
  underarm: 0.755, shoulder: 0.805, neck: 0.855, jaw: 0.885,
  headMid: 0.945, headTop: 1.0,
  wrist: 0.47,
} as const;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lvl = (y: number, w: number, ratio: number): Level => ({ y, w, d: w * ratio });

export interface ProfileInput {
  sex: Sex;
  /** bust (female) or chest (male) circumference */
  chest: number;
  waist: number;
  hips: number;
  /** male only; falls back to a chest-derived value */
  shoulders?: number;
  highHip?: number;
  height?: number;
}

export function buildProfile(input: ProfileInput): BodyProfile {
  const H = input.height && input.height > 0 ? input.height : NOMINAL_HEIGHT[input.sex];

  const chestW = widthFromCircumference(input.chest, RATIO.chest);
  const waistW = widthFromCircumference(input.waist, RATIO.waist);
  const hipW = widthFromCircumference(input.hips, RATIO.hip);
  const shoulderW = input.shoulders && input.shoulders > 0
    ? widthFromCircumference(input.shoulders, RATIO.shoulder)
    : chestW * 1.06;
  const highHipW = input.highHip && input.highHip > 0
    ? widthFromCircumference(input.highHip, RATIO.highHip)
    : lerp(waistW, hipW, 0.55);

  // Derived levels, proportioned off the measured anchors so the body reads as
  // a body rather than a stack of tubes.
  const thighW = hipW * 0.56;
  const kneeW = thighW * 0.62;
  const calfW = thighW * 0.68;
  const ankleW = thighW * 0.36;
  const crotchW = hipW * 0.9;
  const ribsW = lerp(waistW, chestW, 0.55);
  const underarmW = lerp(chestW, shoulderW, 0.55);
  const neckW = chestW * 0.36;
  const headW = neckW * 1.6;

  const y = (f: number) => f * H;

  const torso: Level[] = [
    lvl(y(FRAC.crotch), crotchW, RATIO.crotch),
    lvl(y(FRAC.hip), hipW, RATIO.hip),
    lvl(y(FRAC.highHip), highHipW, RATIO.highHip),
    lvl(y(FRAC.waist), waistW, RATIO.waist),
    lvl(y(FRAC.ribs), ribsW, RATIO.ribs),
    lvl(y(FRAC.chest), chestW, RATIO.chest),
    lvl(y(FRAC.underarm), underarmW, RATIO.underarm),
    lvl(y(FRAC.shoulder), shoulderW, RATIO.shoulder),
    lvl(y(FRAC.neck), neckW, RATIO.neck),
    lvl(y(FRAC.jaw), headW * 0.82, RATIO.jaw),
    lvl(y(FRAC.headMid), headW, RATIO.head),
    lvl(y(FRAC.headTop), headW * 0.22, RATIO.head),
  ];

  const leg: Level[] = [
    lvl(y(FRAC.ankle), ankleW, RATIO.ankle),
    lvl(y(FRAC.calf), calfW, RATIO.calf),
    lvl(y(FRAC.knee), kneeW, RATIO.knee),
    lvl(y(FRAC.thigh), thighW, RATIO.thigh),
    lvl(y(FRAC.crotch), thighW * 1.02, RATIO.thigh),
  ];

  const upperArmW = chestW * 0.17;
  const arm: Level[] = [
    lvl(y(FRAC.shoulder) - 1, upperArmW * 1.15, RATIO.arm),
    lvl(y(FRAC.chest), upperArmW, RATIO.arm),
    lvl(y(FRAC.waist), upperArmW * 0.82, RATIO.arm),
    lvl(y(FRAC.wrist), upperArmW * 0.6, RATIO.arm),
  ];

  return {
    height: H,
    torso,
    leg,
    arm,
    legOffsetX: hipW * 0.26,
    armOffsetX: shoulderW * 0.5 + upperArmW * 0.55,
  };
}

/** Element-wise interpolation between two profiles, for the morph animation. */
export function lerpProfile(a: BodyProfile, b: BodyProfile, t: number): BodyProfile {
  const mix = (xs: Level[], ys: Level[]): Level[] =>
    xs.map((l, i) => ({
      y: lerp(l.y, ys[i]?.y ?? l.y, t),
      w: lerp(l.w, ys[i]?.w ?? l.w, t),
      d: lerp(l.d, ys[i]?.d ?? l.d, t),
    }));
  return {
    height: lerp(a.height, b.height, t),
    torso: mix(a.torso, b.torso),
    leg: mix(a.leg, b.leg),
    arm: mix(a.arm, b.arm),
    legOffsetX: lerp(a.legOffsetX, b.legOffsetX, t),
    armOffsetX: lerp(a.armOffsetX, b.armOffsetX, t),
  };
}

/**
 * Resample a level list to `n` evenly spaced levels with a Catmull-Rom style
 * blend, so the lofted surface is smooth rather than faceted at each anchor.
 */
export function smoothLevels(levels: Level[], n: number): Level[] {
  if (levels.length < 2) return levels;
  const out: Level[] = [];
  const last = levels.length - 1;
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * last;
    const i0 = Math.min(last, Math.floor(t));
    const i1 = Math.min(last, i0 + 1);
    const f = t - i0;
    // smoothstep the blend so anchors are hit softly
    const s = f * f * (3 - 2 * f);
    const a = levels[i0];
    const b = levels[i1];
    out.push({ y: lerp(a.y, b.y, s), w: lerp(a.w, b.w, s), d: lerp(a.d, b.d, s) });
  }
  return out;
}
