import { describe, it, expect } from "vitest";
import {
  classifyFemale, classifyMale, atLeast, atMost, confidenceFrom, somatotypeOf,
  FEMALE_SHAPES, MALE_SHAPES,
} from "../shapes";

const IN = 2.54;
const inches = (n: number) => n * IN;

describe("soft constraints", () => {
  it("atLeast is 0.5 exactly at the threshold and monotonic", () => {
    expect(atLeast(10, 10)).toBeCloseTo(0.5, 6);
    expect(atLeast(10, 10) < atLeast(11, 10)).toBe(true);
    expect(atLeast(0, 10)).toBe(0);
    expect(atLeast(100, 10)).toBe(1);
  });
  it("atMost mirrors atLeast", () => {
    expect(atMost(10, 10)).toBeCloseTo(0.5, 6);
    expect(atMost(9, 10)).toBeGreaterThan(0.5);
  });
});

describe("confidence", () => {
  it("stays within 50..97%", () => {
    expect(confidenceFrom(1, 0)).toBeLessThanOrEqual(0.97);
    expect(confidenceFrom(0, 0)).toBe(0.5);
    expect(confidenceFrom(0.5, 0.5)).toBeGreaterThanOrEqual(0.5);
  });
  it("a bigger margin over the runner-up means higher confidence", () => {
    expect(confidenceFrom(1, 0)).toBeGreaterThan(confidenceFrom(1, 0.9));
  });
});

describe("classifyFemale", () => {
  // measurements in inches -> cm
  const F = (b: number, w: number, h: number, hh?: number) =>
    classifyFemale({ bust: inches(b), waist: inches(w), hips: inches(h), highHip: hh ? inches(hh) : undefined });

  it("classic hourglass: balanced bust/hip, deep waist", () => {
    expect(F(38, 27, 38).shape).toBe("Hourglass");
  });
  it("pear: hips much bigger than bust, softer waist", () => {
    const r = F(34, 30, 42);
    expect(["Pear", "Bottom Hourglass", "Spoon"]).toContain(r.shape);
  });
  it("apple: waist is the widest point", () => {
    expect(F(38, 40, 38).shape).toBe("Apple");
  });
  it("inverted triangle: bust much bigger than hips", () => {
    expect(F(42, 34, 34).shape).toBe("Inverted Triangle");
  });
  it("rectangle: all similar, weak waist", () => {
    const r = F(36, 33, 36);
    expect(["Rectangle", "Banana"]).toContain(r.shape);
  });
  it("banana: all three nearly identical", () => {
    expect(F(35, 34, 35).shape).toBe("Banana");
  });
  it("always returns a valid shape and 50..97% confidence", () => {
    const r = F(36, 28, 40);
    expect(FEMALE_SHAPES).toContain(r.shape as never);
    expect(r.confidence).toBeGreaterThanOrEqual(0.5);
    expect(r.confidence).toBeLessThanOrEqual(0.97);
    expect(r.fits.length).toBe(FEMALE_SHAPES.length);
  });
  it("waist-to-hip ratio is computed", () => {
    const r = F(38, 30, 40);
    expect(r.whr).toBeCloseTo(inches(30) / inches(40), 5);
  });
  it("the high hip enables Spoon vs Bottom Hourglass", () => {
    const shelf = F(34, 28, 40, 37);   // pronounced high-hip shelf
    const smooth = F(34, 28, 40, 32);  // no shelf
    expect(shelf.shape).toBe("Spoon");
    expect(smooth.shape).toBe("Bottom Hourglass");
  });
});

describe("classifyMale", () => {
  const M = (s: number, c: number, w: number, h: number) =>
    classifyMale({ shoulders: inches(s), chest: inches(c), waist: inches(w), hips: inches(h) });

  it("inverted triangle: broad shoulders, deep chest taper, narrow hips", () => {
    expect(M(50, 46, 32, 36).shape).toBe("Inverted Triangle");
  });
  it("oval: waist leads", () => {
    expect(M(44, 44, 46, 42).shape).toBe("Oval");
  });
  it("trapezoid: modestly broader shoulders than hips", () => {
    expect(M(44, 42, 36, 40).shape).toBe("Trapezoid");
  });
  it("rectangle: straight up and down", () => {
    expect(M(42, 40, 38, 41).shape).toBe("Rectangle");
  });
  it("triangle: hips wider than shoulders", () => {
    expect(M(40, 40, 40, 44).shape).toBe("Triangle");
  });
  it("reports a somatotype alongside the shape", () => {
    const r = M(50, 46, 32, 36);
    expect(["Ectomorph", "Mesomorph", "Endomorph"]).toContain(r.somatotype);
    expect(MALE_SHAPES).toContain(r.shape as never);
  });
});

describe("somatotype", () => {
  const S = (s: number, c: number, w: number, h: number) =>
    somatotypeOf({ shoulders: inches(s), chest: inches(c), waist: inches(w), hips: inches(h) });
  it("high waist-to-hip reads as endomorph", () => {
    expect(S(44, 42, 44, 42)).toBe("Endomorph");
  });
  it("big taper and frame reads as mesomorph", () => {
    expect(S(50, 46, 32, 36)).toBe("Mesomorph");
  });
  it("lean and narrow reads as ectomorph", () => {
    expect(S(40, 38, 33, 40)).toBe("Ectomorph");
  });
});
