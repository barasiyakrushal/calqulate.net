import { describe, it, expect } from "vitest";
import {
  ellipseCircumference,
  circumferenceFrom,
  navyBodyFat,
  bodyVerticalExtent,
  torsoRunWidth,
  measureFromPose,
  LM,
  type Mask,
  type Landmark,
} from "../pose-measure";

/**
 * A realistically tapered body silhouette in a 200x400 mask: narrow neck,
 * broad shoulders, a waist, wider hips, then legs. Matches the landmark fixture
 * below. `scale` shrinks every half-width to stand in for a side view, since a
 * body is thinner front-to-back than side-to-side.
 */
function bodyMask(scale = 1): Mask {
  const w = 200, h = 400, centre = 100;
  const data = new Float32Array(w * h);
  const halfAt = (y: number): number => {
    if (y < 55) return 14;   // head
    if (y < 72) return 12;   // neck        (neckY ≈ 63)
    if (y < 100) return 45;  // shoulders
    if (y < 190) return 28;  // torso/waist (male waistY ≈ 171)
    if (y < 262) return 36;  // hips        (widest, searched 213..251)
    return 20;               // legs
  };
  for (let y = 10; y <= 390; y++) {
    const half = Math.max(2, Math.round(halfAt(y) * scale));
    for (let x = centre - half; x <= centre + half; x++) {
      if (x >= 0 && x < w) data[y * w + x] = 1;
    }
  }
  return { data, width: w, height: h };
}

/** A plain rectangle body, for the low-level row-scanning tests. */
function synthMask(opts: {
  w: number; h: number;
  top: number; bottom: number;      // body vertical extent
  torsoHalf: number;                // torso half-width in px
  centre: number;
  arms?: { gap: number; width: number }; // detached arms either side
}): Mask {
  const { w, h, top, bottom, torsoHalf, centre, arms } = opts;
  const data = new Float32Array(w * h);
  for (let y = top; y <= bottom; y++) {
    for (let x = centre - torsoHalf; x <= centre + torsoHalf; x++) {
      if (x >= 0 && x < w) data[y * w + x] = 1;
    }
    if (arms) {
      for (let d = 0; d < arms.width; d++) {
        const lx = centre - torsoHalf - arms.gap - d;
        const rx = centre + torsoHalf + arms.gap + d;
        if (lx >= 0) data[y * w + lx] = 1;
        if (rx < w) data[y * w + rx] = 1;
      }
    }
  }
  return { data, width: w, height: h };
}

describe("ellipse geometry", () => {
  it("reduces to a circle's circumference when width === depth", () => {
    // a = b = 5  ->  2*pi*5
    expect(ellipseCircumference(5, 5)).toBeCloseTo(2 * Math.PI * 5, 6);
  });

  it("circumferenceFrom(10,10) is a circle of diameter 10", () => {
    expect(circumferenceFrom(10, 10)).toBeCloseTo(Math.PI * 10, 6);
  });

  it("a flatter cross-section has a smaller perimeter than a circle of the same width", () => {
    expect(circumferenceFrom(30, 20)).toBeLessThan(circumferenceFrom(30, 30));
  });
});

describe("navyBodyFat", () => {
  // Reference values from the standard U.S. Navy metric formula.
  it("matches a known male case", () => {
    // 180cm, neck 38, waist 85
    const bf = navyBodyFat({ sex: "male", heightCm: 180, neckCm: 38, waistCm: 85 })!;
    expect(bf).toBeGreaterThan(15);
    expect(bf).toBeLessThan(20);
  });

  it("matches a known female case", () => {
    // 165cm, neck 32, waist 75, hip 95
    const bf = navyBodyFat({ sex: "female", heightCm: 165, neckCm: 32, waistCm: 75, hipCm: 95 })!;
    expect(bf).toBeGreaterThan(26);
    expect(bf).toBeLessThan(34);
  });

  it("rejects impossible geometry (waist <= neck for men)", () => {
    expect(navyBodyFat({ sex: "male", heightCm: 180, neckCm: 40, waistCm: 40 })).toBeNull();
  });

  it("a bigger waist yields a higher body fat percentage", () => {
    const lean = navyBodyFat({ sex: "male", heightCm: 180, neckCm: 38, waistCm: 78 })!;
    const heavy = navyBodyFat({ sex: "male", heightCm: 180, neckCm: 38, waistCm: 100 })!;
    expect(heavy).toBeGreaterThan(lean);
  });
});

describe("mask scanning", () => {
  const mask = synthMask({ w: 200, h: 400, top: 20, bottom: 380, torsoHalf: 30, centre: 100 });

  it("finds the vertical extent of the body", () => {
    expect(bodyVerticalExtent(mask)).toEqual({ top: 20, bottom: 380 });
  });

  it("returns null for an empty mask", () => {
    expect(bodyVerticalExtent({ data: new Float32Array(100), width: 10, height: 10 })).toBeNull();
  });

  it("measures the torso width at a row", () => {
    const run = torsoRunWidth(mask, 200, 100);
    expect(run!.width).toBe(61); // 30 left + 30 right + centre pixel
  });

  it("EXCLUDES detached arms from the torso width", () => {
    const withArms = synthMask({
      w: 200, h: 400, top: 20, bottom: 380, torsoHalf: 30, centre: 100,
      arms: { gap: 8, width: 6 },
    });
    const run = torsoRunWidth(withArms, 200, 100);
    // Arms sit in their own runs across the background gap, so width is unchanged.
    expect(run!.width).toBe(61);
  });

  it("recovers when the centre pixel falls on a background gap", () => {
    const m = synthMask({ w: 200, h: 400, top: 20, bottom: 380, torsoHalf: 30, centre: 100 });
    m.data[200 * 200 + 100] = 0; // punch a hole at the centre
    const run = torsoRunWidth(m, 200, 100);
    expect(run).not.toBeNull();
    expect(run!.width).toBeGreaterThan(50);
  });
});

describe("measureFromPose", () => {
  // A 400px-tall body in a 400px mask, person is 180cm => 0.5 cm/px roughly.
  function landmarks(): Landmark[] {
    const l: Landmark[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));
    // normalised coords against a 200x400 mask
    l[LM.earL] = { x: 0.46, y: 0.06, visibility: 1 };
    l[LM.earR] = { x: 0.54, y: 0.06, visibility: 1 };
    l[LM.shoulderL] = { x: 0.42, y: 0.20, visibility: 1 };
    l[LM.shoulderR] = { x: 0.58, y: 0.20, visibility: 1 };
    l[LM.hipL] = { x: 0.45, y: 0.55, visibility: 1 };
    l[LM.hipR] = { x: 0.55, y: 0.55, visibility: 1 };
    return l;
  }

  const front = { landmarks: landmarks(), mask: bodyMask() };

  it("produces anatomically plausible circumferences", () => {
    const m = measureFromPose({ front, heightCm: 180, sex: "male" })!;
    expect(m).not.toBeNull();
    // Neck must be narrower than the waist, or the Navy formula is meaningless.
    expect(m.waistCm).toBeGreaterThan(m.neckCm);
    // Sanity-bound against real human ranges for a 180cm adult.
    expect(m.neckCm).toBeGreaterThan(25);
    expect(m.neckCm).toBeLessThan(50);
    expect(m.waistCm).toBeGreaterThan(55);
    expect(m.waistCm).toBeLessThan(130);
    expect(m.hipCm).toBeGreaterThan(m.waistCm); // hips are wider in this fixture
  });

  it("feeds a usable body fat number into the Navy formula", () => {
    const m = measureFromPose({ front, heightCm: 180, sex: "male" })!;
    const bf = navyBodyFat({ sex: "male", heightCm: 180, neckCm: m.neckCm, waistCm: m.waistCm })!;
    expect(bf).not.toBeNull();
    expect(bf).toBeGreaterThan(2);
    expect(bf).toBeLessThan(50);
  });

  it("rejects a uniform cylinder, where the neck is as wide as the waist", () => {
    const cylinder = { landmarks: landmarks(), mask: synthMask({ w: 200, h: 400, top: 10, bottom: 390, torsoHalf: 30, centre: 100 }) };
    expect(measureFromPose({ front: cylinder, heightCm: 180, sex: "male" })).toBeNull();
  });

  it("front-only is at best medium confidence and says depth was assumed", () => {
    const m = measureFromPose({ front, heightCm: 180, sex: "male" })!;
    expect(m.confidence).not.toBe("high");
    expect(m.confidenceNotes.join(" ")).toMatch(/depth is assumed/i);
  });

  it("a side photo raises confidence to high and measures depth", () => {
    const side = { landmarks: landmarks(), mask: bodyMask(0.65) };
    const m = measureFromPose({ front, side, heightCm: 180, sex: "male" })!;
    expect(m.confidence).toBe("high");
    expect(m.confidenceNotes.join(" ")).not.toMatch(/depth is assumed/i);
  });

  it("a measured side depth gives a smaller waist than the assumed ratio here", () => {
    const frontOnly = measureFromPose({ front, heightCm: 180, sex: "male" })!;
    const withSide = measureFromPose({ front, side: { landmarks: landmarks(), mask: bodyMask(0.5) }, heightCm: 180, sex: "male" })!;
    // side scale 0.5 => depth ratio 0.5, thinner than the assumed 0.72
    expect(withSide.waistCm).toBeLessThan(frontOnly.waistCm);
  });

  it("returns null when the person is too small in frame", () => {
    const tiny = { landmarks: landmarks(), mask: synthMask({ w: 200, h: 400, top: 100, bottom: 120, torsoHalf: 5, centre: 100 }) };
    expect(measureFromPose({ front: tiny, heightCm: 180, sex: "male" })).toBeNull();
  });

  it("scaling is anchored to real height: a taller person yields bigger circumferences", () => {
    const short = measureFromPose({ front, heightCm: 150, sex: "male" })!;
    const tall = measureFromPose({ front, heightCm: 200, sex: "male" })!;
    expect(tall.waistCm).toBeGreaterThan(short.waistCm);
  });

  it("female mode finds the narrowest torso row as the waist", () => {
    const m = measureFromPose({ front, heightCm: 165, sex: "female" })!;
    expect(m).not.toBeNull();
    const bf = navyBodyFat({ sex: "female", heightCm: 165, neckCm: m.neckCm, waistCm: m.waistCm, hipCm: m.hipCm });
    expect(bf).not.toBeNull();
  });
});
