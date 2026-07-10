/**
 * Ideal body weight and the surrounding health metrics.
 *
 * The four classic IBW equations (Devine, Robinson, Miller, Hamwi) are defined
 * for height in inches above 5 feet and return kilograms. We keep them exact,
 * average them for the headline estimate, and pin that estimate inside the
 * BMI-healthy range so the recommendation is never medically odd.
 *
 * Everything here is pure and unit-tested. No React, no formatting.
 */

export type Sex = "male" | "female"
export type Activity = "sedentary" | "light" | "moderate" | "active" | "athlete"
export type Goal = "maintain" | "loseFat" | "gainMuscle" | "improveHealth"

export interface IdealWeightInput {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  activity: Activity
  goal: Goal
}

export interface FormulaResult { key: string; name: string; kg: number }

export interface HealthMetrics {
  bmi: number
  bmiCategory: "Underweight" | "Healthy" | "Overweight" | "Obese"
  bsa: number          // m^2, Mosteller
  bmr: number          // kcal/day, Mifflin-St Jeor
  dailyCalories: number
  leanBodyMassKg: number
  bodyFatPct: number   // Deurenberg estimate
}

export interface TimelinePoint { week: number; kg: number; label: string }

export interface IdealWeightResult {
  formulas: FormulaResult[]
  recommendedKg: number
  healthyLowKg: number
  healthyHighKg: number
  targetKg: number
  changeKg: number         // target - current (negative = lose)
  withinHealthy: boolean
  metrics: HealthMetrics
  timeline: TimelinePoint[]
  insight: string
}

const IN_PER_CM = 1 / 2.54
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const round1 = (n: number) => Math.round(n * 10) / 10

const ACTIVITY_FACTOR: Record<Activity, number> = {
  sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, athlete: 1.9,
}

// ── the four classic IBW equations (kg; inchesOver5ft can be negative) ────────
export function devine(sex: Sex, inchesOver5ft: number): number {
  return (sex === "male" ? 50 : 45.5) + 2.3 * inchesOver5ft
}
export function robinson(sex: Sex, inchesOver5ft: number): number {
  return sex === "male" ? 52 + 1.9 * inchesOver5ft : 49 + 1.7 * inchesOver5ft
}
export function miller(sex: Sex, inchesOver5ft: number): number {
  return sex === "male" ? 56.2 + 1.41 * inchesOver5ft : 53.1 + 1.36 * inchesOver5ft
}
export function hamwi(sex: Sex, inchesOver5ft: number): number {
  return sex === "male" ? 48 + 2.7 * inchesOver5ft : 45.5 + 2.2 * inchesOver5ft
}

export function bmiOf(weightKg: number, heightCm: number): number {
  const m = heightCm / 100
  return m > 0 ? weightKg / (m * m) : 0
}

function bmiCategory(bmi: number): HealthMetrics["bmiCategory"] {
  if (bmi < 18.5) return "Underweight"
  if (bmi < 25) return "Healthy"
  if (bmi < 30) return "Overweight"
  return "Obese"
}

/** Weight (kg) at a given BMI for this height. */
export function weightAtBmi(bmi: number, heightCm: number): number {
  const m = heightCm / 100
  return bmi * m * m
}

export function healthMetrics(input: IdealWeightInput): HealthMetrics {
  const { sex, age, heightCm, weightKg, activity } = input
  const bmi = bmiOf(weightKg, heightCm)
  const bsa = Math.sqrt((heightCm * weightKg) / 3600)
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161)
  const dailyCalories = bmr * ACTIVITY_FACTOR[activity]
  const leanBodyMassKg =
    sex === "male"
      ? 0.407 * weightKg + 0.267 * heightCm - 19.2
      : 0.252 * weightKg + 0.473 * heightCm - 48.3
  // Deurenberg body-fat estimate from BMI, age and sex.
  const bodyFatPct = 1.2 * bmi + 0.23 * age - 10.8 * (sex === "male" ? 1 : 0) - 5.4

  return {
    bmi: round1(bmi),
    bmiCategory: bmiCategory(bmi),
    bsa: Math.round(bsa * 100) / 100,
    bmr: Math.round(bmr),
    dailyCalories: Math.round(dailyCalories),
    leanBodyMassKg: round1(Math.max(0, leanBodyMassKg)),
    bodyFatPct: round1(clamp(bodyFatPct, 2, 65)),
  }
}

/** A healthy, sustainable rate of change toward the target, in kg/week. */
function weeklyRate(changeKg: number): number {
  return changeKg < 0 ? 0.55 : 0.27 // fat loss faster than lean gain
}

function buildTimeline(currentKg: number, targetKg: number): TimelinePoint[] {
  const change = targetKg - currentKg
  if (Math.abs(change) < 0.5) {
    return [{ week: 0, kg: round1(currentKg), label: "Maintain" }]
  }
  const rate = weeklyRate(change)
  const totalWeeks = Math.abs(change) / rate
  const steps = 4
  const points: TimelinePoint[] = []
  for (let i = 0; i <= steps; i++) {
    const f = i / steps
    const kg = round1(currentKg + change * f)
    const week = Math.round(totalWeeks * f)
    points.push({ week, kg, label: i === 0 ? "Today" : i === steps ? "Target" : `Week ${week}` })
  }
  return points
}

export function computeIdealWeight(input: IdealWeightInput): IdealWeightResult {
  const { sex, heightCm, weightKg, goal } = input
  const inchesOver5ft = heightCm * IN_PER_CM - 60

  const formulas: FormulaResult[] = [
    { key: "devine", name: "Devine", kg: round1(devine(sex, inchesOver5ft)) },
    { key: "hamwi", name: "Hamwi", kg: round1(hamwi(sex, inchesOver5ft)) },
    { key: "robinson", name: "Robinson", kg: round1(robinson(sex, inchesOver5ft)) },
    { key: "miller", name: "Miller", kg: round1(miller(sex, inchesOver5ft)) },
  ]

  const healthyLowKg = round1(weightAtBmi(18.5, heightCm))
  const healthyHighKg = round1(weightAtBmi(24.9, heightCm))

  // Headline estimate: mean of the four formulas, pinned into the healthy band.
  const mean = formulas.reduce((s, f) => s + f.kg, 0) / formulas.length
  const recommendedKg = round1(clamp(mean, healthyLowKg, healthyHighKg))

  // Goal-aware target.
  let targetKg: number
  if (goal === "maintain") targetKg = round1(weightKg)
  else if (goal === "improveHealth") {
    targetKg = weightKg < healthyLowKg ? healthyLowKg : weightKg > healthyHighKg ? healthyHighKg : round1(weightKg)
  } else if (goal === "loseFat") {
    targetKg = weightKg > recommendedKg ? recommendedKg : round1(weightKg)
  } else {
    // gainMuscle
    targetKg = weightKg < recommendedKg ? recommendedKg : round1(weightKg)
  }

  const changeKg = round1(targetKg - weightKg)
  const bmi = bmiOf(weightKg, heightCm)
  const withinHealthy = bmi >= 18.5 && bmi < 25

  return {
    formulas,
    recommendedKg,
    healthyLowKg,
    healthyHighKg,
    targetKg,
    changeKg,
    withinHealthy,
    metrics: healthMetrics(input),
    timeline: buildTimeline(weightKg, targetKg),
    insight: buildInsight({ weightKg, recommendedKg, changeKg, withinHealthy, goal }),
  }
}

function buildInsight(a: {
  weightKg: number
  recommendedKg: number
  changeKg: number
  withinHealthy: boolean
  goal: Goal
}): string {
  const cur = round1(a.weightKg)
  const rec = a.recommendedKg
  const mag = Math.abs(a.changeKg)

  if (a.withinHealthy && mag < 1) {
    return `Your current weight of ${cur} kg already sits inside your healthiest long-term range. The goal now is to stay here and build strength, not to chase a smaller number.`
  }
  if (mag < 1) {
    return `Your current weight of ${cur} kg is very close to your estimated healthy weight of ${rec} kg. You are essentially there, so focus on how you feel and how you train.`
  }
  const dir = a.changeKg < 0 ? "lose" : "gain"
  const place = a.withinHealthy
    ? "You are already in a healthy range, so treat this as fine-tuning rather than a big change."
    : "Reaching it would move you into the healthiest long-term weight range for your height."
  return `Your current weight is ${cur} kg and your estimated healthy weight is ${rec} kg. Reaching your goal would mean about ${round1(mag)} kg to ${dir}, at a steady, sustainable pace. ${place}`
}
