import { describe, it, expect } from "vitest";
import { buildProfile, widthFromCircumference, lerpProfile, smoothLevels, NOMINAL_HEIGHT } from "../body-profile";
import { ellipseCircumference } from "@/lib/bodyfat/pose-measure";

describe("widthFromCircumference", () => {
  it("inverts the ellipse perimeter exactly", () => {
    const w = widthFromCircumference(90, 0.72);
    // rebuild the perimeter from the width and the ratio
    const perimeter = ellipseCircumference(w / 2, (w * 0.72) / 2);
    expect(perimeter).toBeCloseTo(90, 6);
  });
  it("a circle of circumference C has width C/pi", () => {
    expect(widthFromCircumference(Math.PI * 10, 1)).toBeCloseTo(10, 6);
  });
  it("a bigger circumference gives a bigger width", () => {
    expect(widthFromCircumference(100, 0.72)).toBeGreaterThan(widthFromCircumference(80, 0.72));
  });
  it("guards against zero and negative input", () => {
    expect(widthFromCircumference(0, 0.72)).toBe(0);
    expect(widthFromCircumference(90, 0)).toBe(0);
  });
});

describe("buildProfile", () => {
  const pear = buildProfile({ sex: "female", chest: 86, waist: 71, hips: 104 });
  const apple = buildProfile({ sex: "female", chest: 96, waist: 102, hips: 96 });

  it("uses the nominal height when none is given", () => {
    expect(pear.height).toBe(NOMINAL_HEIGHT.female);
    expect(buildProfile({ sex: "male", chest: 100, waist: 85, hips: 98 }).height).toBe(NOMINAL_HEIGHT.male);
  });

  it("honours a supplied height", () => {
    expect(buildProfile({ sex: "female", chest: 86, waist: 71, hips: 104, height: 150 }).height).toBe(150);
  });

  it("torso levels ascend from crotch to head", () => {
    for (let i = 1; i < pear.torso.length; i++) {
      expect(pear.torso[i].y).toBeGreaterThan(pear.torso[i - 1].y);
    }
  });

  it("legs ascend from ankle to crotch and meet the torso base", () => {
    const leg = pear.leg;
    for (let i = 1; i < leg.length; i++) expect(leg[i].y).toBeGreaterThan(leg[i - 1].y);
    expect(leg[leg.length - 1].y).toBeCloseTo(pear.torso[0].y, 6);
  });

  it("a pear silhouette really is wider at the hip than the waist", () => {
    const waist = pear.torso[3];
    const hip = pear.torso[1];
    expect(hip.w).toBeGreaterThan(waist.w);
  });

  it("an apple silhouette is wider at the waist than the hip", () => {
    const waist = apple.torso[3];
    const hip = apple.torso[1];
    expect(waist.w).toBeGreaterThan(hip.w);
  });

  it("every level has positive width and depth", () => {
    for (const part of [pear.torso, pear.leg, pear.arm]) {
      for (const l of part) {
        expect(l.w).toBeGreaterThan(0);
        expect(l.d).toBeGreaterThan(0);
      }
    }
  });

  it("shoulders are wider than the waist for a typical male taper", () => {
    const m = buildProfile({ sex: "male", chest: 105, waist: 82, hips: 96, shoulders: 122 });
    const shoulder = m.torso[7];
    const waist = m.torso[3];
    expect(shoulder.w).toBeGreaterThan(waist.w);
  });

  it("shoulders are flatter than they are wide (low depth ratio)", () => {
    const m = buildProfile({ sex: "male", chest: 105, waist: 82, hips: 96, shoulders: 122 });
    const shoulder = m.torso[7];
    expect(shoulder.d).toBeLessThan(shoulder.w);
  });
});

describe("lerpProfile", () => {
  const a = buildProfile({ sex: "female", chest: 80, waist: 65, hips: 90 });
  const b = buildProfile({ sex: "female", chest: 100, waist: 95, hips: 100 });

  it("t=0 returns the first profile", () => {
    expect(lerpProfile(a, b, 0).torso[3].w).toBeCloseTo(a.torso[3].w, 6);
  });
  it("t=1 returns the second profile", () => {
    expect(lerpProfile(a, b, 1).torso[3].w).toBeCloseTo(b.torso[3].w, 6);
  });
  it("t=0.5 sits exactly halfway", () => {
    const mid = lerpProfile(a, b, 0.5).torso[3].w;
    expect(mid).toBeCloseTo((a.torso[3].w + b.torso[3].w) / 2, 6);
  });
  it("keeps the same level counts, so the mesh topology never changes", () => {
    const m = lerpProfile(a, b, 0.37);
    expect(m.torso.length).toBe(a.torso.length);
    expect(m.leg.length).toBe(a.leg.length);
    expect(m.arm.length).toBe(a.arm.length);
  });
});

describe("smoothLevels", () => {
  const a = buildProfile({ sex: "female", chest: 86, waist: 71, hips: 104 });

  it("resamples to exactly n levels", () => {
    expect(smoothLevels(a.torso, 48).length).toBe(48);
  });
  it("keeps the first and last anchors", () => {
    const s = smoothLevels(a.torso, 48);
    expect(s[0].y).toBeCloseTo(a.torso[0].y, 4);
    expect(s[47].y).toBeCloseTo(a.torso[a.torso.length - 1].y, 4);
  });
  it("stays monotonic in y", () => {
    const s = smoothLevels(a.torso, 64);
    for (let i = 1; i < s.length; i++) expect(s[i].y).toBeGreaterThanOrEqual(s[i - 1].y);
  });
  it("handles degenerate input", () => {
    expect(smoothLevels([], 10)).toEqual([]);
  });
});
