"use client"

/**
 * Lean Body Mass / Muscle Retention Wizard.
 *
 * Conversational, one-question-per-screen flow built on the same 3-step
 * onboarding framework as the GLP-1 body composition wizard:
 *   1. ASK    - a short set of questions that each change the result.
 *   2. AHA    - a real, personal win: the user's lean body mass (averaged across
 *               the Boer, James and Hume formulas), their lean-mass band, a
 *               protein target, and a muscle-retention risk read.
 *   3. COMMIT - only after value: push to the GLP-1 Progress Tracker product
 *               page, route premium features to /pricing, and hand off to the
 *               GLP-1 fat-vs-muscle tool with a strong anchor.
 *
 * Mobile-first: single column, big tap targets, choice questions auto-advance,
 * a progress bar makes the short flow feel even shorter.
 *
 * Note: no em dashes anywhere in the copy, by request.
 */

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { parseNumber } from "@/lib/utils"
import {
  Scale,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Dumbbell,
  Beef,
  Target,
  ShieldCheck,
  Sparkles,
  Lock,
  Ruler,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Syringe,
} from "lucide-react"

// --- Answer model -------------------------------------------------------------
type Goal = "build" | "retain" | "number"
type Sex = "male" | "female"
type Units = "metric" | "imperial"
type Activity = "none" | "light" | "strong"

interface Answers {
  goal?: Goal
  sex?: Sex
  units?: Units
  weight?: string
  heightCm?: string
  heightFt?: string
  heightIn?: string
  bodyFat?: string
  age?: string
  activity?: Activity
}

// --- Step definitions ---------------------------------------------------------
type ChoiceStep = {
  kind: "choice"
  key: keyof Answers
  title: string
  subtitle?: string
  options: { value: string; label: string; hint?: string; icon?: React.ReactNode }[]
}
type NumberStep = {
  kind: "number"
  key: keyof Answers
  title: string
  subtitle?: string
  placeholder: string
  metricSuffix?: string
  imperialSuffix?: string
  optional?: boolean
  min?: number
  max?: number
}
type HeightStep = { kind: "height"; key: "heightCm"; title: string; subtitle?: string }
type Step = ChoiceStep | NumberStep | HeightStep

const STEPS: Step[] = [
  {
    kind: "choice",
    key: "goal",
    title: "What brings you here today?",
    subtitle: "This shapes the plan we show you at the end.",
    options: [
      { value: "retain", label: "Keep my muscle while losing fat", hint: "Protect lean mass in a deficit", icon: <Target className="h-5 w-5" /> },
      { value: "build", label: "Build muscle and get stronger", hint: "Add lean mass over time", icon: <Dumbbell className="h-5 w-5" /> },
      { value: "number", label: "Just get my lean body mass number", hint: "Quick and simple", icon: <Scale className="h-5 w-5" /> },
    ],
  },
  {
    kind: "choice",
    key: "sex",
    title: "What is your biological sex?",
    subtitle: "The lean-mass formulas use this, so it changes your result.",
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
    ],
  },
  {
    kind: "choice",
    key: "units",
    title: "Which units do you use?",
    subtitle: "Pick whatever you know your numbers in.",
    options: [
      { value: "metric", label: "Metric", hint: "kg and cm" },
      { value: "imperial", label: "Imperial", hint: "lbs and ft / in" },
    ],
  },
  {
    kind: "number",
    key: "weight",
    title: "What do you weigh right now?",
    subtitle: "Your current body weight.",
    placeholder: "e.g. 80",
    metricSuffix: "kg",
    imperialSuffix: "lbs",
    min: 25,
    max: 400,
  },
  {
    kind: "height",
    key: "heightCm",
    title: "How tall are you?",
    subtitle: "Height is a big driver of lean mass.",
  },
  {
    kind: "number",
    key: "bodyFat",
    title: "Do you know your body fat percentage?",
    subtitle: "Optional. If you have a DEXA, calipers or a smart scale number, it makes this far more accurate. If not, just skip.",
    placeholder: "e.g. 22",
    metricSuffix: "%",
    imperialSuffix: "%",
    optional: true,
    min: 3,
    max: 65,
  },
  {
    kind: "number",
    key: "age",
    title: "How old are you?",
    subtitle: "Muscle gets harder to hold with age, so this changes your plan.",
    placeholder: "e.g. 42",
    min: 14,
    max: 100,
  },
  {
    kind: "choice",
    key: "activity",
    title: "Are you doing any resistance training?",
    subtitle: "Lifting is the single strongest signal for keeping muscle.",
    options: [
      { value: "none", label: "None right now", hint: "No strength work", icon: <Dumbbell className="h-5 w-5" /> },
      { value: "light", label: "1 to 2 times a week", hint: "A bit, here and there", icon: <Dumbbell className="h-5 w-5" /> },
      { value: "strong", label: "3+ times a week", hint: "Consistent strength work", icon: <Dumbbell className="h-5 w-5" /> },
    ],
  },
]

// --- Estimate model -----------------------------------------------------------
interface Result {
  lbmKg: number
  lbmDisplay: number
  lowDisplay: number
  highDisplay: number
  fatMassDisplay: number
  lbmPct: number
  bmr: number
  proteinLow: number
  proteinHigh: number
  unitLabel: string
  band: "strong" | "healthy" | "low"
  bandLabel: string
  usedBodyFat: boolean
  fixes: string[]
}

function toKg(weight: number, units: Units) {
  return units === "imperial" ? weight / 2.2046226 : weight
}
function fromKg(kg: number, units: Units) {
  return units === "imperial" ? kg * 2.2046226 : kg
}

function estimate(a: Answers): Result | null {
  const units = a.units ?? "metric"
  const rawWeight = parseNumber(a.weight ?? "")
  if (!(rawWeight > 0)) return null

  // Normalise to kg / cm.
  const weightKg = toKg(rawWeight, units)
  let heightCm = 0
  if (units === "imperial") {
    const ft = parseNumber(a.heightFt ?? "")
    const inch = parseNumber(a.heightIn ?? "0") || 0
    if (!(ft > 0)) return null
    heightCm = (ft * 12 + inch) * 2.54
  } else {
    heightCm = parseNumber(a.heightCm ?? "")
  }
  if (!(heightCm > 0)) return null

  const sex = a.sex ?? "male"
  const age = parseNumber(a.age ?? "") || 35
  const bf = parseNumber(a.bodyFat ?? "")
  const usedBodyFat = bf > 0 && bf < 65

  // Boer, Hume, James (kg / cm).
  const boer =
    sex === "male"
      ? 0.407 * weightKg + 0.267 * heightCm - 19.2
      : 0.252 * weightKg + 0.473 * heightCm - 48.3
  const hume =
    sex === "male"
      ? 0.3281 * weightKg + 0.33929 * heightCm - 29.5336
      : 0.29569 * weightKg + 0.41813 * heightCm - 43.2933
  const ratio = weightKg / heightCm
  const james =
    sex === "male" ? 1.1 * weightKg - 128 * ratio * ratio : 1.07 * weightKg - 148 * ratio * ratio

  const formulaVals = [boer, hume, james].filter((v) => v > 0 && v < weightKg)
  const formulaAvg = formulaVals.reduce((s, v) => s + v, 0) / (formulaVals.length || 1)

  // Prefer the direct body-fat method when we have it.
  const lbmKg = usedBodyFat ? weightKg * (1 - bf / 100) : formulaAvg
  const low = usedBodyFat ? lbmKg : Math.min(...formulaVals)
  const high = usedBodyFat ? lbmKg : Math.max(...formulaVals)

  const lbmPct = (lbmKg / weightKg) * 100
  const bmr = Math.round(370 + 21.6 * lbmKg) // Katch-McArdle

  // Protein target: retention 1.6, building up to 2.2 g per kg body weight.
  const proteinLow = Math.round(weightKg * 1.6)
  const proteinHigh = Math.round(weightKg * 2.2)

  // Healthy lean-mass midpoint, nudged down slightly with age.
  const base = sex === "male" ? 80 : 70
  const midpoint = base - Math.max(0, age - 30) * 0.15
  let band: Result["band"]
  if (lbmPct >= midpoint + 3) band = "strong"
  else if (lbmPct >= midpoint - 3) band = "healthy"
  else band = "low"
  const bandLabel =
    band === "strong" ? "Strong lean mass" : band === "healthy" ? "Healthy range" : "Below typical"

  const fixes: string[] = []
  fixes.push(
    `Aim for roughly ${proteinLow} to ${proteinHigh} g of protein a day. Protein is what actually protects and builds lean tissue.`,
  )
  if (a.activity !== "strong")
    fixes.push(
      a.goal === "build"
        ? "Lift 3 to 5 times a week with progressive overload. That is the direct signal to add muscle."
        : "Add resistance training 2 to 3 times a week. It tells your body to hold muscle while you lose fat.",
    )
  if (age >= 45)
    fixes.push(
      "After 45, muscle is lost faster if you do nothing. Protein plus lifting is the only proven way to reverse that decline.",
    )
  if (a.goal === "retain")
    fixes.push(
      "Losing weight? Keep the pace at or under about 1 percent of body weight a week so the loss stays fat, not muscle.",
    )
  if (fixes.length < 3)
    fixes.push("Re-check your lean mass every 4 to 6 weeks. Muscle moves slowly, so a trend beats any single reading.")

  return {
    lbmKg,
    lbmDisplay: Math.round(fromKg(lbmKg, units) * 10) / 10,
    lowDisplay: Math.round(fromKg(low, units) * 10) / 10,
    highDisplay: Math.round(fromKg(high, units) * 10) / 10,
    fatMassDisplay: Math.round(fromKg(weightKg - lbmKg, units) * 10) / 10,
    lbmPct: Math.round(lbmPct * 10) / 10,
    bmr,
    proteinLow,
    proteinHigh,
    unitLabel: units === "imperial" ? "lbs" : "kg",
    band,
    bandLabel,
    usedBodyFat,
    fixes,
  }
}

// --- Component ----------------------------------------------------------------
export default function LeanBodyMassWizard() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [done, setDone] = useState(false)
  const [numDraft, setNumDraft] = useState("")
  const [ftDraft, setFtDraft] = useState("")
  const [inDraft, setInDraft] = useState("")

  const total = STEPS.length
  const current = STEPS[step]
  const units = (answers.units ?? "metric") as Units
  const result = useMemo(() => (done ? estimate(answers) : null), [done, answers])

  const goNext = () => {
    if (step < total - 1) {
      setStep((s) => s + 1)
      setNumDraft("")
      setFtDraft("")
      setInDraft("")
    } else {
      setDone(true)
    }
  }

  const goBack = () => {
    if (done) {
      setDone(false)
      return
    }
    if (step > 0) setStep((s) => s - 1)
  }

  const pick = (value: string) => {
    setAnswers((a) => ({ ...a, [current.key]: value }))
    goNext()
  }

  const submitNumber = () => {
    const s = current as NumberStep
    const n = parseNumber(numDraft)
    if (!(n > 0)) return
    if (s.min && n < s.min) return
    if (s.max && n > s.max) return
    setAnswers((a) => ({ ...a, [current.key]: numDraft }))
    goNext()
  }

  const submitHeight = () => {
    if (units === "imperial") {
      const ft = parseNumber(ftDraft)
      if (!(ft > 0)) return
      setAnswers((a) => ({ ...a, heightFt: ftDraft, heightIn: inDraft || "0" }))
    } else {
      const cm = parseNumber(numDraft)
      if (!(cm > 0)) return
      setAnswers((a) => ({ ...a, heightCm: numDraft }))
    }
    goNext()
  }

  const skipOptional = () => {
    setAnswers((a) => ({ ...a, [current.key]: "" }))
    goNext()
  }

  const restart = () => {
    setAnswers({})
    setStep(0)
    setNumDraft("")
    setFtDraft("")
    setInDraft("")
    setDone(false)
  }

  if (done && result) {
    return <ResultView answers={answers} result={result} onRestart={restart} onBack={goBack} />
  }

  const progress = Math.round(((step + (done ? 1 : 0)) / total) * 100)
  const suffix =
    current.kind === "number"
      ? units === "imperial"
        ? current.imperialSuffix
        : current.metricSuffix
      : undefined

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_10px_40px_-12px_rgba(6,110,67,0.18)]">
        {/* Progress */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-7">
          <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-800">
            <Scale className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-semibold text-faint">
              <span>Lean mass check</span>
              <span>
                {step + 1} of {total}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-brand-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="px-5 py-7 sm:px-7 sm:py-9">
          <h2 className="text-xl font-bold leading-snug text-ink sm:text-2xl">{current.title}</h2>
          {current.subtitle && <p className="mt-2 text-sm text-copy sm:text-base">{current.subtitle}</p>}

          {current.kind === "choice" && (
            <div className="mt-6 space-y-3">
              {current.options.map((opt) => {
                const selected = answers[current.key] === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => pick(opt.value)}
                    className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.99] ${
                      selected ? "border-brand bg-brand-50" : "border-line bg-white hover:border-brand hover:bg-brand-50/50"
                    }`}
                  >
                    {opt.icon && (
                      <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800 group-hover:bg-white">
                        {opt.icon}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-ink">{opt.label}</span>
                      {opt.hint && <span className="mt-0.5 block text-sm text-faint">{opt.hint}</span>}
                    </span>
                    <ArrowRight className="h-5 w-5 flex-shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                  </button>
                )
              })}
            </div>
          )}

          {current.kind === "number" && (
            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault()
                submitNumber()
              }}
            >
              <div className="flex items-stretch overflow-hidden rounded-2xl border border-line focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                <input
                  autoFocus
                  inputMode="decimal"
                  type="number"
                  step="any"
                  value={numDraft}
                  onChange={(e) => setNumDraft(e.target.value)}
                  placeholder={(current as NumberStep).placeholder}
                  className="w-full bg-transparent px-4 py-4 text-lg font-semibold text-ink outline-none placeholder:font-normal placeholder:text-faint"
                />
                {suffix && (
                  <span className="flex items-center bg-surface px-4 text-sm font-semibold text-faint">{suffix}</span>
                )}
              </div>
              <button
                type="submit"
                disabled={!(parseNumber(numDraft) > 0)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-4 text-base font-bold text-white shadow-sm transition-all hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
              {(current as NumberStep).optional && (
                <button
                  type="button"
                  onClick={skipOptional}
                  className="mt-3 w-full text-center text-sm font-semibold text-faint transition-colors hover:text-copy"
                >
                  I do not know it, skip this
                </button>
              )}
            </form>
          )}

          {current.kind === "height" && (
            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault()
                submitHeight()
              }}
            >
              {units === "imperial" ? (
                <div className="flex gap-3">
                  <div className="flex flex-1 items-stretch overflow-hidden rounded-2xl border border-line focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                    <input
                      autoFocus
                      inputMode="numeric"
                      type="number"
                      value={ftDraft}
                      onChange={(e) => setFtDraft(e.target.value)}
                      placeholder="5"
                      className="w-full bg-transparent px-4 py-4 text-lg font-semibold text-ink outline-none placeholder:font-normal placeholder:text-faint"
                    />
                    <span className="flex items-center bg-surface px-4 text-sm font-semibold text-faint">ft</span>
                  </div>
                  <div className="flex flex-1 items-stretch overflow-hidden rounded-2xl border border-line focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                    <input
                      inputMode="numeric"
                      type="number"
                      value={inDraft}
                      onChange={(e) => setInDraft(e.target.value)}
                      placeholder="10"
                      className="w-full bg-transparent px-4 py-4 text-lg font-semibold text-ink outline-none placeholder:font-normal placeholder:text-faint"
                    />
                    <span className="flex items-center bg-surface px-4 text-sm font-semibold text-faint">in</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-stretch overflow-hidden rounded-2xl border border-line focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                  <input
                    autoFocus
                    inputMode="decimal"
                    type="number"
                    step="any"
                    value={numDraft}
                    onChange={(e) => setNumDraft(e.target.value)}
                    placeholder="178"
                    className="w-full bg-transparent px-4 py-4 text-lg font-semibold text-ink outline-none placeholder:font-normal placeholder:text-faint"
                  />
                  <span className="flex items-center bg-surface px-4 text-sm font-semibold text-faint">cm</span>
                </div>
              )}
              <button
                type="submit"
                disabled={units === "imperial" ? !(parseNumber(ftDraft) > 0) : !(parseNumber(numDraft) > 0)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-4 text-base font-bold text-white shadow-sm transition-all hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between border-t border-line px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-faint transition-colors hover:text-copy disabled:opacity-0"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-faint">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Private, nothing saved
          </span>
        </div>
      </div>
    </div>
  )
}

// --- Result view --------------------------------------------------------------
function ResultView({
  answers,
  result,
  onRestart,
  onBack,
}: {
  answers: Answers
  result: Result
  onRestart: () => void
  onBack: () => void
}) {
  const band = {
    strong: { cls: "bg-brand-50 text-brand-800 border-brand", icon: <CheckCircle2 className="h-5 w-5" /> },
    healthy: { cls: "bg-brand-50 text-brand-800 border-brand", icon: <CheckCircle2 className="h-5 w-5" /> },
    low: { cls: "bg-amber-50 text-amber-800 border-amber-300", icon: <AlertTriangle className="h-5 w-5" /> },
  }[result.band]

  const lbmPctRounded = Math.round(result.lbmPct)
  const fatPct = Math.max(0, 100 - lbmPctRounded)

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_10px_40px_-12px_rgba(6,110,67,0.18)]">
        {/* Header */}
        <div className="border-b border-line bg-gradient-to-br from-brand-50 to-white px-5 py-6 sm:px-8 sm:py-8">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${band.cls}`}>
            {band.icon}
            {result.bandLabel}
          </span>
          <h2 className="mt-4 text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
            Your lean body mass is about{" "}
            <span className="text-brand">
              {result.lbmDisplay} {result.unitLabel}
            </span>
          </h2>
          <p className="mt-2 text-sm text-copy sm:text-base">
            That is roughly <strong className="text-ink">{lbmPctRounded}% of your body weight</strong>
            {result.usedBodyFat
              ? " from your body fat number"
              : `, estimated across the Boer, James and Hume formulas (range ${result.lowDisplay} to ${result.highDisplay} ${result.unitLabel})`}
            . The rest, about {result.fatMassDisplay} {result.unitLabel}, is fat mass.
          </p>
        </div>

        {/* Split bar */}
        <div className="px-5 py-6 sm:px-8">
          <div className="flex items-end justify-between text-sm font-bold">
            <span className="text-brand-800">Lean mass, {lbmPctRounded}%</span>
            <span className="text-slate-500">Fat mass, {fatPct}%</span>
          </div>
          <div className="mt-2 flex h-5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-gradient-to-r from-brand to-brand-600"
              style={{ width: `${lbmPctRounded}%` }}
              aria-label={`Lean mass ${lbmPctRounded}%`}
            />
            <div className="h-full bg-slate-300" style={{ width: `${fatPct}%` }} aria-label={`Fat mass ${fatPct}%`} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <Stat icon={<Ruler className="h-4 w-4" />} label="Lean mass" value={`${result.lbmDisplay} ${result.unitLabel}`} />
            <Stat icon={<Beef className="h-4 w-4" />} label="Protein / day" value={`${result.proteinLow}-${result.proteinHigh} g`} />
            <Stat icon={<Flame className="h-4 w-4" />} label="Resting burn" value={`${result.bmr} kcal`} />
          </div>
        </div>

        {/* Personalized plan */}
        <div className="border-t border-line px-5 py-6 sm:px-8">
          <h3 className="flex items-center gap-2 text-base font-bold text-ink">
            <Target className="h-5 w-5 text-brand" />
            {answers.goal === "build"
              ? "How to add lean mass from here"
              : answers.goal === "number"
                ? "Keep this number moving the right way"
                : "How to hold your muscle"}
          </h3>
          <ul className="mt-4 space-y-3">
            {result.fixes.map((fix, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" />
                <span className="text-sm leading-relaxed text-copy">{fix}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* GLP-1 tie-in with a strong anchor */}
        <div className="border-t border-line px-5 py-6 sm:px-8">
          <div className="flex items-start gap-3 rounded-2xl border border-brand/30 bg-brand-50/60 p-4 sm:p-5">
            <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-brand-800">
              <Syringe className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">On a GLP-1, or thinking about one?</p>
              <p className="mt-1 text-sm leading-relaxed text-copy">
                Up to 40 percent of the weight people lose on Ozempic, Wegovy, Mounjaro or Zepbound can be muscle, not
                fat. Find out where you stand with the{" "}
                <Link
                  href="/health/glp-1-dose-calculator"
                  className="font-bold text-brand-800 underline decoration-brand/40 underline-offset-2 hover:decoration-brand"
                >
                  GLP-1 Body Composition Tracker: are you losing fat or muscle?
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* COMMIT */}
        <div className="border-t border-line bg-gradient-to-br from-brand-900 to-brand-800 px-5 py-7 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-50/70">Muscle is your metabolism</p>
          <h3 className="mt-2 text-xl font-extrabold text-white sm:text-2xl">
            Track your lean mass over time, not just the scale
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-brand-50/90">
            One reading is a snapshot. The GLP-1 Progress Tracker trends your lean mass, keeps your protein and training
            on target, and flags the weeks you drop weight too fast to be all fat.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/product/glp1-progress-tracker"
              className="gold-shine relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-gold-light to-gold px-6 py-4 text-base font-bold text-gold-ink shadow-[0_10px_28px_rgba(245,158,11,0.4)] transition-transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-5 w-5" />
              See the GLP-1 Progress Tracker
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Lock className="h-4 w-4" />
              Plans and pricing
            </Link>
          </div>

          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {[
              "Lean-mass trend, not just weight",
              "Protein target built from your numbers",
              "Adaptive titration for GLP-1 users",
              "Rebound-risk view for tapering off",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-brand-50/90">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-gold-light" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-faint transition-colors hover:text-copy"
          >
            <ArrowLeft className="h-4 w-4" /> Change an answer
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-faint transition-colors hover:text-copy"
          >
            <RotateCcw className="h-4 w-4" /> Start over
          </button>
        </div>
      </div>

      <p className="mt-4 px-2 text-center text-xs leading-relaxed text-faint">
        This is an educational estimate from validated prediction formulas, not a DEXA scan or medical advice. Lean mass
        also includes water and can shift with hydration. Work with your clinician on health and dosing decisions.
      </p>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <p className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-faint">
        <span className="text-brand-800">{icon}</span>
        {label}
      </p>
      <p className="mt-0.5 text-base font-black text-ink sm:text-lg">{value}</p>
    </div>
  )
}
