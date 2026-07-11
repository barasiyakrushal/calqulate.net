import { describe, it, expect } from "vitest"
import {
  buildReport, indexFor, detectShape, CHART, BRAND_FIT, FABRIC_FIT,
  type AssistantInput,
} from "../engine"

const base: AssistantInput = {
  bust: 35.5, waist: 28.5, hips: 38.5, // a clean US 8
  occasion: "everyday", fit: "true", brand: "asos", fabric: "cotton",
}

describe("indexFor", () => {
  it("maps a measurement to the smallest size that contains it", () => {
    expect(CHART[indexFor(35.5, "bust")].us).toBe(8)
    expect(CHART[indexFor(28.5, "waist")].us).toBe(8)
    expect(CHART[indexFor(38.5, "hips")].us).toBe(8)
  })
  it("rounds up when a measurement falls between bands", () => {
    // 36.5 bust is above the US 8 band (35 to 36), so it becomes a US 10.
    expect(CHART[indexFor(36.5, "bust")].us).toBe(10)
  })
  it("clamps at the extremes", () => {
    expect(CHART[indexFor(20, "waist")].us).toBe(0)
    expect(CHART[indexFor(70, "hips")].us).toBe(18)
  })
})

describe("detectShape", () => {
  it("hourglass: bust and hips balanced with a much smaller waist", () => {
    expect(detectShape(36, 27, 37)).toBe("hourglass")
  })
  it("pear: hips clearly wider than bust", () => {
    expect(detectShape(34, 28, 40)).toBe("pear")
  })
  it("inverted triangle: bust clearly wider than hips", () => {
    expect(detectShape(40, 30, 35)).toBe("invertedTriangle")
  })
  it("apple: waist close to the bust", () => {
    expect(detectShape(38, 37, 39)).toBe("apple")
  })
  it("rectangle: everything within a couple of inches, little waist definition", () => {
    expect(detectShape(36, 32, 37)).toBe("rectangle")
  })
})

describe("buildReport: the base recommendation", () => {
  const r = buildReport(base)

  it("recommends the clean size when all three agree and nothing needs adjusting", () => {
    expect(r.size.us).toBe(8)
    expect(r.spread).toBe(0)
    expect(r.adjustments).toHaveLength(0)
  })
  it("is highly confident and low risk when everything lines up", () => {
    expect(r.confidence).toBeGreaterThanOrEqual(85)
    expect(r.risk).toBe("low")
    expect(r.stars).toBeGreaterThanOrEqual(4)
  })
  it("explains itself", () => {
    expect(r.reasons.length).toBeGreaterThanOrEqual(2)
    expect(r.reasons.join(" ")).toMatch(/deciding measurement/i)
  })
  it("converts across every sizing system", () => {
    expect(r.size).toMatchObject({ us: 8, uk: 12, eu: 40, au: 12, jp: 11, india: "M" })
  })
})

describe("buildReport: it sizes to the LARGEST measurement", () => {
  it("a pear shape is sized to the hips, not the bust", () => {
    const r = buildReport({ ...base, bust: 34, waist: 28, hips: 42 }) // hips are a US 12
    expect(r.drivenBy).toBe("hips")
    expect(r.baseSize.us).toBe(12)
    expect(r.spread).toBeGreaterThan(0)
    expect(r.reasons.join(" ")).toMatch(/taken in/i)
  })
  it("a spread across sizes lowers confidence and raises risk", () => {
    const clean = buildReport(base)
    const spread = buildReport({ ...base, bust: 34, waist: 28, hips: 42 })
    expect(spread.confidence).toBeLessThan(clean.confidence)
    expect(spread.backupDirection).toBe("up")
  })
})

describe("buildReport: brand intelligence", () => {
  it("sizes UP for Zara, which runs small", () => {
    const r = buildReport({ ...base, brand: "zara" })
    expect(r.size.us).toBe(10)
    expect(r.adjustments.some((a) => a.source === "Zara" && a.step === 1)).toBe(true)
  })
  it("sizes up TWO for Shein", () => {
    const r = buildReport({ ...base, brand: "shein" })
    expect(r.size.us).toBe(12)
  })
  it("sizes DOWN for Old Navy, which runs large", () => {
    const r = buildReport({ ...base, brand: "oldnavy" })
    expect(r.size.us).toBe(6)
  })
  it("does not move for a true-to-size brand", () => {
    expect(buildReport({ ...base, brand: "asos" }).size.us).toBe(8)
  })
  it("an unknown brand costs confidence", () => {
    const known = buildReport({ ...base, brand: "asos" })
    const unknown = buildReport({ ...base, brand: "unknown" })
    expect(unknown.confidence).toBeLessThan(known.confidence)
    expect(unknown.checklist.join(" ")).toMatch(/runs small/i)
  })
})

describe("buildReport: fabric intelligence", () => {
  it("sizes DOWN for stretch", () => {
    expect(buildReport({ ...base, fabric: "stretch" }).size.us).toBe(6)
  })
  it("sizes UP for unforgiving satin and linen", () => {
    expect(buildReport({ ...base, fabric: "satin" }).size.us).toBe(10)
    expect(buildReport({ ...base, fabric: "linen" }).size.us).toBe(10)
  })
  it("a non-stretch fabric points the backup size upward", () => {
    const r = buildReport({ ...base, fabric: "satin" })
    expect(r.backupDirection).toBe("up")
  })
})

describe("buildReport: fit preference and occasion", () => {
  it("relaxed fit sizes up, fitted sizes down", () => {
    expect(buildReport({ ...base, fit: "relaxed" }).size.us).toBe(10)
    expect(buildReport({ ...base, fit: "fitted" }).size.us).toBe(6)
  })
  it("bridal sizes up, because wedding dresses are cut small", () => {
    const r = buildReport({ ...base, occasion: "wedding" })
    expect(r.size.us).toBe(10)
    expect(r.adjustments.some((a) => a.source === "Bridal sizing")).toBe(true)
    expect(r.checklist.join(" ")).toMatch(/four to six months/i)
  })
  it("bridal lowers confidence, because bridal grading varies", () => {
    expect(buildReport({ ...base, occasion: "wedding" }).confidence)
      .toBeLessThan(buildReport(base).confidence)
  })
})

describe("buildReport: adjustments stack", () => {
  it("a stretchy Zara dress cancels out to true size", () => {
    // Zara +1, stretch -1 => net zero
    const r = buildReport({ ...base, brand: "zara", fabric: "stretch" })
    expect(r.size.us).toBe(8)
    expect(r.adjustments).toHaveLength(2)
  })
  it("a satin Shein wedding dress stacks upward hard", () => {
    // Shein +2, satin +1, wedding +1 => +4 steps from US 8
    const r = buildReport({ ...base, brand: "shein", fabric: "satin", occasion: "wedding" })
    expect(r.size.us).toBe(16)
    expect(r.risk).not.toBe("low")
  })
  it("never runs off the end of the chart", () => {
    const huge = buildReport({ ...base, bust: 46, waist: 39, hips: 49, brand: "shein", fabric: "satin", occasion: "wedding", fit: "relaxed" })
    expect(huge.size.us).toBe(18)
    const tiny = buildReport({ ...base, bust: 31, waist: 24, hips: 34, brand: "oldnavy", fabric: "stretch", fit: "fitted" })
    expect(tiny.size.us).toBe(0)
  })
})

describe("buildReport: styling and checklist", () => {
  it("recommends styles that match the detected shape", () => {
    const pear = buildReport({ ...base, bust: 34, waist: 28, hips: 41 })
    expect(pear.bodyShape).toBe("pear")
    expect(pear.styles.best.join(" ")).toMatch(/A-line/i)
    expect(pear.styles.avoid.length).toBeGreaterThan(0)
  })
  it("always gives an actionable checklist", () => {
    expect(buildReport(base).checklist.length).toBeGreaterThanOrEqual(2)
  })
})

describe("data integrity", () => {
  it("every brand and fabric has a label and a note", () => {
    for (const v of Object.values(BRAND_FIT)) {
      expect(v.label).toBeTruthy()
      expect(v.note).toBeTruthy()
    }
    for (const v of Object.values(FABRIC_FIT)) {
      expect(v.label).toBeTruthy()
      expect(v.note).toBeTruthy()
    }
  })
  it("the chart ascends consistently across every sizing system", () => {
    for (let i = 1; i < CHART.length; i++) {
      expect(CHART[i].us).toBeGreaterThan(CHART[i - 1].us)
      expect(CHART[i].uk).toBeGreaterThan(CHART[i - 1].uk)
      expect(CHART[i].eu).toBeGreaterThan(CHART[i - 1].eu)
      expect(CHART[i].bust[0]).toBeGreaterThanOrEqual(CHART[i - 1].bust[0])
    }
  })
})
