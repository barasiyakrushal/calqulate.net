import { describe, it, expect } from "vitest"
import {
  computeIdealWeight, healthMetrics, devine, robinson, miller, hamwi,
  bmiOf, weightAtBmi, type IdealWeightInput,
} from "../formulas"

const base: IdealWeightInput = {
  sex: "male", age: 30, heightCm: 180, weightKg: 82, activity: "moderate", goal: "loseFat",
}

describe("classic IBW equations at 180cm male (~10.9 inches over 5ft)", () => {
  const over = 180 / 2.54 - 60
  it("Devine male matches the reference value", () => {
    expect(devine("male", over)).toBeCloseTo(50 + 2.3 * over, 6)
    expect(devine("male", over)).toBeGreaterThan(73)
    expect(devine("male", over)).toBeLessThan(76)
  })
  it("orders as Miller < Devine (Miller reads lower for tall people)", () => {
    expect(miller("male", over)).toBeLessThan(devine("male", over))
  })
  it("female estimates are lower than male at the same height", () => {
    expect(devine("female", over)).toBeLessThan(devine("male", over))
    expect(hamwi("female", over)).toBeLessThan(hamwi("male", over))
    expect(robinson("female", over)).toBeLessThan(robinson("male", over))
  })
})

describe("bmi helpers", () => {
  it("bmi is weight over height squared", () => {
    expect(bmiOf(81, 180)).toBeCloseTo(25, 5)
  })
  it("weightAtBmi inverts bmiOf", () => {
    const w = weightAtBmi(22, 175)
    expect(bmiOf(w, 175)).toBeCloseTo(22, 6)
  })
})

describe("healthMetrics", () => {
  const m = healthMetrics(base)
  it("computes a plausible BMI and category", () => {
    expect(m.bmi).toBeCloseTo(25.3, 1)
    expect(m.bmiCategory).toBe("Overweight")
  })
  it("Mosteller BSA is in the human range", () => {
    expect(m.bsa).toBeGreaterThan(1.5)
    expect(m.bsa).toBeLessThan(2.5)
  })
  it("Mifflin BMR then activity gives daily calories above BMR", () => {
    expect(m.bmr).toBeGreaterThan(1600)
    expect(m.dailyCalories).toBeGreaterThan(m.bmr)
  })
  it("female BMR is lower than male at identical size", () => {
    const male = healthMetrics(base)
    const female = healthMetrics({ ...base, sex: "female" })
    expect(female.bmr).toBeLessThan(male.bmr)
  })
  it("lean body mass and body fat are bounded sensibly", () => {
    expect(m.leanBodyMassKg).toBeGreaterThan(40)
    expect(m.leanBodyMassKg).toBeLessThan(base.weightKg)
    expect(m.bodyFatPct).toBeGreaterThan(2)
    expect(m.bodyFatPct).toBeLessThan(65)
  })
})

describe("computeIdealWeight", () => {
  const r = computeIdealWeight(base)

  it("returns all four formulas", () => {
    expect(r.formulas.map((f) => f.key).sort()).toEqual(["devine", "hamwi", "miller", "robinson"])
  })
  it("recommended weight sits inside the healthy BMI band", () => {
    expect(r.recommendedKg).toBeGreaterThanOrEqual(r.healthyLowKg)
    expect(r.recommendedKg).toBeLessThanOrEqual(r.healthyHighKg)
  })
  it("healthy range corresponds to BMI 18.5..24.9", () => {
    expect(bmiOf(r.healthyLowKg, base.heightCm)).toBeCloseTo(18.5, 1)
    expect(bmiOf(r.healthyHighKg, base.heightCm)).toBeCloseTo(24.9, 1)
  })

  it("loseFat target moves an overweight person down toward recommended", () => {
    expect(r.targetKg).toBeLessThan(base.weightKg)
    expect(r.changeKg).toBeLessThan(0)
  })
  it("maintain keeps the current weight", () => {
    const m = computeIdealWeight({ ...base, goal: "maintain" })
    expect(m.targetKg).toBeCloseTo(base.weightKg, 5)
    expect(Math.abs(m.changeKg)).toBeLessThan(0.5)
  })
  it("gainMuscle on an underweight person targets upward", () => {
    const light = computeIdealWeight({ ...base, weightKg: 60, goal: "gainMuscle" })
    expect(light.targetKg).toBeGreaterThan(60)
    expect(light.changeKg).toBeGreaterThan(0)
  })
  it("improveHealth pulls an obese person to the top of the healthy band", () => {
    const heavy = computeIdealWeight({ ...base, weightKg: 110, goal: "improveHealth" })
    expect(heavy.targetKg).toBeCloseTo(heavy.healthyHighKg, 1)
  })

  it("timeline starts today and ends at the target", () => {
    expect(r.timeline[0].label).toBe("Today")
    expect(r.timeline[0].kg).toBeCloseTo(base.weightKg, 1)
    const last = r.timeline[r.timeline.length - 1]
    expect(last.kg).toBeCloseTo(r.targetKg, 1)
    expect(last.week).toBeGreaterThan(0)
  })
  it("a maintain timeline collapses to a single point", () => {
    const m = computeIdealWeight({ ...base, weightKg: r.recommendedKg, goal: "maintain" })
    expect(m.timeline.length).toBe(1)
  })
  it("weeks increase monotonically along the timeline", () => {
    for (let i = 1; i < r.timeline.length; i++) {
      expect(r.timeline[i].week).toBeGreaterThanOrEqual(r.timeline[i - 1].week)
    }
  })
  it("produces an encouraging, non-empty insight", () => {
    expect(r.insight.length).toBeGreaterThan(40)
    expect(r.insight).toMatch(/healthy/i)
  })
})
