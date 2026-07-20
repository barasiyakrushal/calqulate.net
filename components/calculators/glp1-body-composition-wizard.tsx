"use client"

/**
 * GLP-1 Body Composition Wizard — "Are you losing fat or muscle?"
 *
 * Conversational, one-question-per-screen flow built on the 3-step onboarding
 * framework:
 *   1. ASK    — a short set of questions that each change the result (no filler).
 *   2. AHA    — a real, personal win: an estimate of how much of THEIR weight
 *               loss is likely fat vs. muscle, with fixes tailored to answers.
 *   3. COMMIT — only after value is felt: push to the GLP-1 Progress Tracker
 *               product page, and route premium features to /pricing.
 *
 * Mobile-first: single column, big tap targets, choice questions auto-advance,
 * a progress bar makes the (short) flow feel even shorter.
 *
 * The fat/muscle split is an educational estimate from public research (fast
 * loss + low protein + no resistance training tilts loss toward lean mass),
 * NOT a body-composition measurement. Copy says so plainly.
 */

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { parseNumber } from "@/lib/utils"
import {
  Syringe,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Dumbbell,
  Beef,
  Target,
  ShieldCheck,
  Sparkles,
  Lock,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"

// ─── Answer model ─────────────────────────────────────────────────────────────
type Goal = "fat" | "muscle" | "both"
type Medication = "semaglutide" | "tirzepatide" | "other"
type Protein = "low" | "some" | "high"
type Training = "none" | "light" | "strong"

interface Answers {
  goal?: Goal
  medication?: Medication
  startWeight?: string
  currentWeight?: string
  weeks?: string
  protein?: Protein
  training?: Training
}

// ─── Titration reference shown in the result (general, not a prescription) ─────
const TITRATION: Record<Exclude<Medication, "other">, { label: string; steps: string[] }> = {
  semaglutide: {
    label: "Semaglutide (Wegovy / Ozempic)",
    steps: ["0.25 mg", "0.5 mg", "1.0 mg", "1.7 mg", "2.4 mg"],
  },
  tirzepatide: {
    label: "Tirzepatide (Zepbound / Mounjaro)",
    steps: ["2.5 mg", "5 mg", "7.5 mg", "10 mg", "12.5 mg", "15 mg"],
  },
}

// ─── Step definitions ─────────────────────────────────────────────────────────
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
  suffix?: string
  min?: number
  max?: number
}
type Step = ChoiceStep | NumberStep

const STEPS: Step[] = [
  {
    kind: "choice",
    key: "goal",
    title: "What matters most to you right now?",
    subtitle: "This shapes what we show you at the end.",
    options: [
      { value: "fat", label: "Lose fat", hint: "Drop the weight that's weighing me down", icon: <TrendingDown className="h-5 w-5" /> },
      { value: "muscle", label: "Keep my muscle", hint: "Stay strong, protect my metabolism", icon: <Dumbbell className="h-5 w-5" /> },
      { value: "both", label: "Both", hint: "Lose fat without losing strength", icon: <Target className="h-5 w-5" /> },
    ],
  },
  {
    kind: "choice",
    key: "medication",
    title: "Which GLP-1 are you on?",
    subtitle: "We'll match the right titration ladder to your result.",
    options: [
      { value: "semaglutide", label: "Semaglutide", hint: "Ozempic · Wegovy · Rybelsus" },
      { value: "tirzepatide", label: "Tirzepatide", hint: "Mounjaro · Zepbound" },
      { value: "other", label: "Other / not sure", hint: "Another GLP-1, or just exploring" },
    ],
  },
  {
    kind: "number",
    key: "startWeight",
    title: "What did you weigh when you started?",
    subtitle: "Roughly your weight the week you began your GLP-1.",
    placeholder: "e.g. 210",
    suffix: "lbs",
    min: 60,
    max: 800,
  },
  {
    kind: "number",
    key: "currentWeight",
    title: "And what do you weigh now?",
    subtitle: "Today's number, or your most recent weigh-in.",
    placeholder: "e.g. 188",
    suffix: "lbs",
    min: 60,
    max: 800,
  },
  {
    kind: "number",
    key: "weeks",
    title: "How many weeks have you been on it?",
    subtitle: "This tells us how fast the weight is coming off.",
    placeholder: "e.g. 12",
    suffix: "weeks",
    min: 1,
    max: 260,
  },
  {
    kind: "choice",
    key: "protein",
    title: "How's your protein most days?",
    subtitle: "Appetite drops hard on a GLP-1, so this is easy to miss.",
    options: [
      { value: "low", label: "Low", hint: "Barely eating, skipping meals", icon: <Beef className="h-5 w-5" /> },
      { value: "some", label: "Some", hint: "Protein at some meals", icon: <Beef className="h-5 w-5" /> },
      { value: "high", label: "On target", hint: "Protein at every meal, hitting my goal", icon: <Beef className="h-5 w-5" /> },
    ],
  },
  {
    kind: "choice",
    key: "training",
    title: "Are you doing any resistance training?",
    subtitle: "Lifting is the signal that tells your body to keep muscle.",
    options: [
      { value: "none", label: "None", hint: "No lifting right now", icon: <Dumbbell className="h-5 w-5" /> },
      { value: "light", label: "1–2× a week", hint: "A bit, here and there", icon: <Dumbbell className="h-5 w-5" /> },
      { value: "strong", label: "3+× a week", hint: "Consistent strength work", icon: <Dumbbell className="h-5 w-5" /> },
    ],
  },
]

// ─── Estimate model ───────────────────────────────────────────────────────────
interface Result {
  hasLoss: boolean
  totalLost: number
  fatLost: number
  muscleLost: number
  musclePct: number // % of total loss that is likely lean mass
  weeklyPct: number // rate of loss, % of start weight per week
  tooFast: boolean
  band: "good" | "watch" | "risk"
  fixes: string[]
}

function estimate(a: Answers): Result | null {
  const start = parseNumber(a.startWeight ?? "")
  const current = parseNumber(a.currentWeight ?? "")
  const weeks = parseNumber(a.weeks ?? "")
  if (!(start > 0) || !(current > 0) || !(weeks > 0)) return null

  const totalLost = Math.max(0, start - current)
  const hasLoss = totalLost > 0
  const weeklyPct = hasLoss ? (totalLost / start / weeks) * 100 : 0

  // Baseline: ~a third of GLP-1 weight loss is lean mass when nothing protects it.
  let musclePct = 0.33
  // Protein
  if (a.protein === "low") musclePct += 0.08
  else if (a.protein === "high") musclePct -= 0.1
  // Resistance training
  if (a.training === "none") musclePct += 0.07
  else if (a.training === "light") musclePct -= 0.02
  else if (a.training === "strong") musclePct -= 0.12
  // Rate of loss
  if (weeklyPct > 1.5) musclePct += 0.1
  else if (weeklyPct > 1.0) musclePct += 0.05
  else if (weeklyPct > 0 && weeklyPct < 0.5) musclePct -= 0.04

  musclePct = Math.min(0.5, Math.max(0.1, musclePct))

  const muscleLost = Math.round(totalLost * musclePct * 10) / 10
  const fatLost = Math.round((totalLost - muscleLost) * 10) / 10
  const tooFast = weeklyPct > 1.0

  const band: Result["band"] = musclePct >= 0.3 ? "risk" : musclePct >= 0.2 ? "watch" : "good"

  const fixes: string[] = []
  if (a.protein !== "high")
    fixes.push("Lift your protein toward ~1.6 g per kg of your goal weight — treat it as the one thing you don't skip on low-appetite days.")
  if (a.training !== "strong")
    fixes.push("Add resistance training 2–3× a week. It's the signal that tells your body to hold onto muscle while you're in a deficit.")
  if (tooFast)
    fixes.push(`You're losing about ${weeklyPct.toFixed(1)}% of your body weight a week — faster than ~1%/week tilts the loss toward muscle. Easing the pace protects lean mass.`)
  if (fixes.length === 0)
    fixes.push("You're doing the big things right. Keep protein and training consistent, and track lean mass so you catch any drift early.")

  return { hasLoss, totalLost, fatLost, muscleLost, musclePct, weeklyPct, tooFast, band, fixes }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function GLP1BodyCompositionWizard() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [done, setDone] = useState(false)
  const [numDraft, setNumDraft] = useState("")

  const total = STEPS.length
  const current = STEPS[step]
  const result = useMemo(() => (done ? estimate(answers) : null), [done, answers])

  const goNext = () => {
    if (step < total - 1) {
      setStep((s) => s + 1)
      setNumDraft("")
    } else {
      setDone(true)
    }
  }

  const goBack = () => {
    if (done) {
      setDone(false)
      return
    }
    if (step > 0) {
      setStep((s) => s - 1)
      setNumDraft(String((answers[STEPS[step - 1].key] as string) ?? ""))
    }
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

  const restart = () => {
    setAnswers({})
    setStep(0)
    setNumDraft("")
    setDone(false)
  }

  // ── RESULT (Aha + Commit) ──────────────────────────────────────────────────
  if (done && result) {
    return <ResultView answers={answers} result={result} onRestart={restart} onBack={goBack} />
  }

  const progress = Math.round(((step + (done ? 1 : 0)) / total) * 100)

  // ── ASK ─────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_10px_40px_-12px_rgba(6,110,67,0.18)]">
        {/* Progress */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-7">
          <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-800">
            <Syringe className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-semibold text-faint">
              <span>Fat vs. muscle check</span>
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

          {current.kind === "choice" ? (
            <div className="mt-6 space-y-3">
              {current.options.map((opt) => {
                const selected = answers[current.key] === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => pick(opt.value)}
                    className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.99] ${
                      selected
                        ? "border-brand bg-brand-50"
                        : "border-line bg-white hover:border-brand hover:bg-brand-50/50"
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
          ) : (
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
                {(current as NumberStep).suffix && (
                  <span className="flex items-center bg-surface px-4 text-sm font-semibold text-faint">
                    {(current as NumberStep).suffix}
                  </span>
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
            <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Private · nothing saved
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Result view ──────────────────────────────────────────────────────────────
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
  const musclePctDisplay = Math.round(result.musclePct * 100)
  const fatPctDisplay = 100 - musclePctDisplay

  const band = {
    good: {
      label: "Mostly fat — nice work",
      cls: "bg-brand-50 text-brand-800 border-brand",
      icon: <CheckCircle2 className="h-5 w-5" />,
    },
    watch: {
      label: "Worth watching",
      cls: "bg-amber-50 text-amber-800 border-amber-300",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    risk: {
      label: "High muscle-loss risk",
      cls: "bg-rose-50 text-rose-700 border-rose-300",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
  }[result.band]

  const med = answers.medication && answers.medication !== "other" ? TITRATION[answers.medication] : null

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_10px_40px_-12px_rgba(6,110,67,0.18)]">
        {/* Header */}
        <div className="border-b border-line bg-gradient-to-br from-brand-50 to-white px-5 py-6 sm:px-8 sm:py-8">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${band.cls}`}>
            {band.icon}
            {band.label}
          </span>

          {result.hasLoss ? (
            <>
              <h2 className="mt-4 text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
                About <span className="text-brand">{musclePctDisplay}%</span> of your loss is likely muscle
              </h2>
              <p className="mt-2 text-sm text-copy sm:text-base">
                Of the {result.totalLost.toFixed(0)} lbs you've lost in {answers.weeks} weeks, roughly{" "}
                <strong className="text-ink">{result.fatLost.toFixed(1)} lbs is fat</strong> and about{" "}
                <strong className="text-ink">{result.muscleLost.toFixed(1)} lbs is muscle</strong> — an educational
                estimate from your rate of loss, protein and training.
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-4 text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
                No weight change logged yet
              </h2>
              <p className="mt-2 text-sm text-copy sm:text-base">
                That's fine — the muscle-vs-fat question starts to matter the moment the scale moves. Here's how to make
                sure the weight you lose is the right kind.
              </p>
            </>
          )}
        </div>

        {/* Fat vs muscle split bar */}
        {result.hasLoss && (
          <div className="px-5 py-6 sm:px-8">
            <div className="flex items-end justify-between text-sm font-bold">
              <span className="text-brand-800">Fat · {result.fatLost.toFixed(1)} lbs</span>
              <span className="text-rose-600">Muscle · {result.muscleLost.toFixed(1)} lbs</span>
            </div>
            <div className="mt-2 flex h-5 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full bg-gradient-to-r from-brand to-brand-600"
                style={{ width: `${fatPctDisplay}%` }}
                aria-label={`Fat ${fatPctDisplay}%`}
              />
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-rose-500"
                style={{ width: `${musclePctDisplay}%` }}
                aria-label={`Muscle ${musclePctDisplay}%`}
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <Stat label="Total lost" value={`${result.totalLost.toFixed(0)} lbs`} />
              <Stat label="Per week" value={`${result.weeklyPct.toFixed(1)}%`} accent={result.tooFast} />
              <Stat label="Likely muscle" value={`${musclePctDisplay}%`} accent={result.band === "risk"} />
            </div>
          </div>
        )}

        {/* Personalized fixes */}
        <div className="border-t border-line px-5 py-6 sm:px-8">
          <h3 className="flex items-center gap-2 text-base font-bold text-ink">
            <Target className="h-5 w-5 text-brand" />
            {answers.goal === "fat"
              ? "Protect the fat loss you came for"
              : answers.goal === "muscle"
                ? "Here's how to hold your muscle"
                : "Your biggest levers right now"}
          </h3>
          <ul className="mt-4 space-y-3">
            {result.fixes.map((fix, i) => (
              <li key={i} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" />
                <span className="text-sm leading-relaxed text-copy">{fix}</span>
              </li>
            ))}
          </ul>

          {med && (
            <div className="mt-5 rounded-2xl border border-line bg-surface p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-faint">
                {med.label} — typical titration ladder
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {med.steps.map((s, i) => (
                  <React.Fragment key={s}>
                    <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-brand-800 ring-1 ring-line">
                      {s}
                    </span>
                    {i < med.steps.length - 1 && <ArrowRight className="h-3 w-3 text-faint" />}
                  </React.Fragment>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-faint">
                General reference from public prescribing info — not a prescription. Your clinician sets your dose.
              </p>
            </div>
          )}
        </div>

        {/* COMMIT — target the product page, route premium to pricing */}
        <div className="border-t border-line bg-gradient-to-br from-brand-900 to-brand-800 px-5 py-7 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-50/70">Keep this from happening quietly</p>
          <h3 className="mt-2 text-xl font-extrabold text-white sm:text-2xl">
            Track fat vs. muscle over time, not just the scale
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-brand-50/90">
            This snapshot is one moment. The GLP-1 Progress Tracker logs every shot and weigh-in, watches your lean mass
            trend, and flags the moment you start dropping weight too fast to be all fat.
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
              Plans &amp; pricing
            </Link>
          </div>

          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {[
              "Lean-mass trend, not just weight",
              "Adaptive titration + protein plan",
              "Every shot & side effect logged",
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
        This is an educational estimate, not a body-composition scan or medical advice. It infers a likely fat/muscle
        split from your rate of loss, protein and training. Always work with your prescriber on dose and health decisions.
      </p>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${accent ? "border-amber-300 bg-amber-50" : "border-line bg-surface"}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-faint">{label}</p>
      <p className={`mt-0.5 text-lg font-black ${accent ? "text-amber-700" : "text-ink"}`}>{value}</p>
    </div>
  )
}
