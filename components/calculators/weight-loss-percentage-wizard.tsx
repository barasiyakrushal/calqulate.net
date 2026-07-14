"use client"

/**
 * Weight Loss Percentage Wizard.
 *
 * Conversational, one-question-per-screen flow built on the same 3-step
 * onboarding framework as the GLP-1 and lean-mass wizards:
 *   1. ASK          - a short set of questions that each change the result.
 *   2. AHA          - a real, personal win: the exact percentage of body weight
 *                     lost, the milestone it hits, the weekly pace, and progress
 *                     to goal.
 *   3. PERSONALIZED - the read changes with context (GLP-1 vs diet vs post-op),
 *                     and a fast pace surfaces the muscle-loss warning with a
 *                     strong anchor to the GLP-1 body composition tool.
 *   4. COMMIT       - only after value: push to the GLP-1 Progress Tracker, and
 *                     route premium features to /pricing.
 *
 * Mobile-first, big tap targets, choice questions auto-advance. No em dashes.
 */

import React, { useMemo, useState } from "react"
import Link from "next/link"
import {
  TrendingDown,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  Syringe,
  Salad,
  Stethoscope,
  HelpCircle,
  Target,
  ShieldCheck,
  Sparkles,
  Lock,
  Gauge,
  Flag,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Trophy,
} from "lucide-react"

// --- Answer model -------------------------------------------------------------
type Context = "glp1" | "diet" | "surgery" | "other"
type Units = "lbs" | "kg"

/** Roughly how long a question takes, used for the "about N sec left" promise. */
const SECONDS_PER_STEP = 4

/** What the user gets at the end. Shown up front so they know why they are answering. */
const PROMISES = [
  "Percent of body weight lost",
  "Your average weekly pace",
  "Healthy, or too fast",
  "Muscle-loss risk",
]

interface Answers {
  context?: Context
  units?: Units
  start?: string
  current?: string
  weeks?: string
  goal?: string
}

// --- Steps --------------------------------------------------------------------
type ChoiceStep = {
  kind: "choice"
  key: keyof Answers
  title: string
  subtitle?: string
  options: { value: string; label: string; hint?: string; icon?: React.ReactNode; badge?: string }[]
}
type NumberStep = {
  kind: "number"
  key: keyof Answers
  title: string
  subtitle?: string
  placeholder: string
  suffixUnits?: boolean // show lbs/kg suffix
  suffix?: string
  optional?: boolean
  min?: number
  max?: number
}
type Step = ChoiceStep | NumberStep

const STEPS: Step[] = [
  {
    kind: "choice",
    key: "context",
    title: "What caused your weight loss?",
    subtitle: "This changes how we read your numbers.",
    options: [
      {
        value: "glp1",
        label: "GLP-1 medication",
        hint: "Ozempic · Wegovy · Mounjaro · Zepbound",
        icon: <Syringe className="h-5 w-5" />,
        badge: "Most popular",
      },
      { value: "diet", label: "Diet and exercise", hint: "Food, training, lifestyle", icon: <Salad className="h-5 w-5" /> },
      { value: "surgery", label: "Surgery", hint: "Post-op weight loss", icon: <Stethoscope className="h-5 w-5" /> },
      { value: "other", label: "Other", hint: "A medical reason, or not sure", icon: <HelpCircle className="h-5 w-5" /> },
    ],
  },
  {
    kind: "choice",
    key: "units",
    title: "Pounds or kilograms?",
    subtitle: "Use whichever you weigh in. The percentage is the same either way.",
    options: [
      { value: "lbs", label: "Pounds", hint: "lbs" },
      { value: "kg", label: "Kilograms", hint: "kg" },
    ],
  },
  {
    kind: "number",
    key: "start",
    title: "What was your starting weight?",
    subtitle: "Your true weight when you began. Lock in the original number.",
    placeholder: "e.g. 210",
    suffixUnits: true,
    min: 40,
    max: 800,
  },
  {
    kind: "number",
    key: "current",
    title: "And what do you weigh now?",
    subtitle: "Today's number, or your most recent weigh-in.",
    placeholder: "e.g. 188",
    suffixUnits: true,
    min: 40,
    max: 800,
  },
  {
    kind: "number",
    key: "weeks",
    title: "How long have you been at it?",
    subtitle: "Optional. This lets us check your weekly pace, which is where muscle is won or lost.",
    placeholder: "e.g. 12",
    suffix: "weeks",
    optional: true,
    min: 1,
    max: 520,
  },
  {
    kind: "number",
    key: "goal",
    title: "Do you have a goal weight?",
    subtitle: "Optional. Add it and we will show how far along you are.",
    placeholder: "e.g. 170",
    suffixUnits: true,
    optional: true,
    min: 40,
    max: 800,
  },
]

// --- Result model -------------------------------------------------------------
interface Result {
  gained: boolean
  pct: number
  totalLost: number
  unit: string
  weeklyPct: number | null
  pace: "healthy" | "aggressive" | "fast" | null
  milestone: "start" | "five" | "ten" | "fifteen"
  milestoneLabel: string
  progressPct: number | null
  remaining: number | null
  fixes: string[]
  showMuscleWarning: boolean
}

function estimate(a: Answers): Result | null {
  const start = parseFloat(a.start ?? "")
  const current = parseFloat(a.current ?? "")
  if (!(start > 0) || !(current > 0)) return null
  const unit = a.units ?? "lbs"

  const diff = start - current
  const gained = diff < 0
  const totalLost = Math.round(Math.abs(diff) * 10) / 10
  const pct = Math.round((Math.abs(diff) / start) * 1000) / 10

  const weeks = parseFloat(a.weeks ?? "")
  const weeklyPct = weeks > 0 && !gained ? Math.round((pct / weeks) * 100) / 100 : null

  let pace: Result["pace"] = null
  if (weeklyPct !== null) {
    if (weeklyPct <= 1) pace = "healthy"
    else if (weeklyPct <= 2) pace = "aggressive"
    else pace = "fast"
  }

  const goal = parseFloat(a.goal ?? "")
  let progressPct: number | null = null
  let remaining: number | null = null
  if (goal > 0 && goal < start) {
    progressPct = Math.max(0, Math.min(100, Math.round(((start - current) / (start - goal)) * 100)))
    remaining = Math.round((current - goal) * 10) / 10
  }

  let milestone: Result["milestone"] = "start"
  if (!gained) {
    if (pct >= 15) milestone = "fifteen"
    else if (pct >= 10) milestone = "ten"
    else if (pct >= 5) milestone = "five"
  }
  const milestoneLabel = gained
    ? "Weight is up so far"
    : milestone === "fifteen"
      ? "Transformative"
      : milestone === "ten"
        ? "Major milestone"
        : milestone === "five"
          ? "Health wins begin"
          : "Getting started"

  // A fast pace matters most on a GLP-1, where loss can come from muscle.
  const showMuscleWarning = !gained && (pace === "fast" || (pace === "aggressive" && a.context === "glp1"))

  const fixes: string[] = []
  if (gained) {
    fixes.push("The scale is up over this window. That is often water, food timing or muscle gain, not fat. Give it a couple of weeks and re-check the trend before changing anything.")
  } else {
    if (pct >= 5)
      fixes.push("You have passed the 5 percent mark, where most people start seeing real improvements in blood pressure, blood sugar and cholesterol. This counts.")
    else
      fixes.push("Every percent counts, and 5 percent is the first milestone where health markers start to move. You are on your way there.")
    if (showMuscleWarning)
      fixes.push("Your pace is on the fast side. Faster than about 1 percent of body weight a week tilts the loss toward muscle, so protein and resistance training matter more than ever right now.")
    else if (pace === "healthy")
      fixes.push("Your pace is in the healthy range of about 1 percent a week or less, which is exactly where the loss tends to stay fat rather than muscle.")
    if (a.context === "glp1")
      fixes.push("On a GLP-1, the scale only tells half the story. What decides whether the weight stays off is how much of it is fat versus muscle.")
  }

  return {
    gained,
    pct,
    totalLost,
    unit,
    weeklyPct,
    pace,
    milestone,
    milestoneLabel,
    progressPct,
    remaining,
    fixes,
    showMuscleWarning,
  }
}

// --- Component ----------------------------------------------------------------
export default function WeightLossPercentageWizard() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [done, setDone] = useState(false)
  const [numDraft, setNumDraft] = useState("")

  const total = STEPS.length
  const current = STEPS[step]
  const units = (answers.units ?? "lbs") as Units
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
    if (step > 0) setStep((s) => s - 1)
  }

  const pick = (value: string) => {
    setAnswers((a) => ({ ...a, [current.key]: value }))
    goNext()
  }

  const submitNumber = () => {
    const s = current as NumberStep
    const n = parseFloat(numDraft)
    if (!(n > 0)) return
    if (s.min && n < s.min) return
    if (s.max && n > s.max) return
    setAnswers((a) => ({ ...a, [current.key]: numDraft }))
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
    setDone(false)
  }

  if (done && result) {
    return <ResultView answers={answers} result={result} onRestart={restart} onBack={goBack} />
  }

  const suffix =
    current.kind === "number" ? ((current as NumberStep).suffixUnits ? units : (current as NumberStep).suffix) : undefined

  const secondsLeft = Math.max(5, (total - step) * SECONDS_PER_STEP)

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_10px_40px_-12px_rgba(6,110,67,0.18)]">
        {/* Calculator bar: says what this is, on every step */}
        <div className="border-b border-line bg-gradient-to-r from-brand-50 to-white px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand text-white">
              <TrendingDown className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-ink sm:text-base">Weight Loss Percentage Calculator</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-brand-800">
                <Zap className="h-3 w-3" /> Instant result · Free · No sign-up
              </p>
            </div>
          </div>

          {/* Segmented progress: you can see how short this is */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    i < step ? "bg-brand" : i === step ? "bg-brand/60" : "bg-line"
                  }`}
                />
              ))}
            </div>
            <span className="flex-shrink-0 text-[11px] font-bold text-faint">
              Step {step + 1} of {total}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] font-medium text-faint">About {secondsLeft} seconds left</p>
        </div>

        {/* Question */}
        <div className="px-5 py-6 sm:px-7 sm:py-8">
          {/* Step 1 doubles as the launch screen: what you get, and a nudge to tap */}
          {step === 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-copy">
                Answer {total} quick questions and you will see:
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
                {PROMISES.map((p) => (
                  <li key={p} className="flex items-center gap-1.5 text-sm text-copy">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-brand" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h2 className="text-xl font-bold leading-snug text-ink sm:text-2xl">{current.title}</h2>
          {current.subtitle && <p className="mt-2 text-sm text-copy sm:text-base">{current.subtitle}</p>}

          {current.kind === "choice" ? (
            <>
              {step === 0 && (
                <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800">
                  <ArrowRight className="h-3.5 w-3.5" /> Tap one option to begin
                </p>
              )}
              <div className="mt-5 space-y-3">
                {current.options.map((opt) => {
                  const selected = answers[current.key] === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => pick(opt.value)}
                      className={`group flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.99] ${
                        selected
                          ? "border-brand bg-brand-50"
                          : "border-line bg-white hover:border-brand hover:bg-brand-50/60"
                      }`}
                    >
                      {opt.icon && (
                        <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800 transition-colors group-hover:bg-brand group-hover:text-white">
                          {opt.icon}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-ink">{opt.label}</span>
                          {opt.badge && (
                            <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              {opt.badge}
                            </span>
                          )}
                        </span>
                        {opt.hint && <span className="mt-0.5 block text-sm text-faint">{opt.hint}</span>}
                      </span>
                      <span className="flex flex-shrink-0 items-center gap-1 text-brand">
                        <span className="hidden text-sm font-bold sm:inline">Select</span>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 transition-colors group-hover:bg-brand group-hover:text-white">
                          <ChevronRight className="h-5 w-5" />
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
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
                {suffix && (
                  <span className="flex items-center bg-surface px-4 text-sm font-semibold text-faint">{suffix}</span>
                )}
              </div>
              <button
                type="submit"
                disabled={!(parseFloat(numDraft) > 0)}
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
                  Skip this
                </button>
              )}
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
  const band = result.gained
    ? { cls: "bg-amber-50 text-amber-800 border-amber-300", icon: <AlertTriangle className="h-5 w-5" /> }
    : result.showMuscleWarning
      ? { cls: "bg-amber-50 text-amber-800 border-amber-300", icon: <AlertTriangle className="h-5 w-5" /> }
      : { cls: "bg-brand-50 text-brand-800 border-brand", icon: <Trophy className="h-5 w-5" /> }

  const paceLabel =
    result.pace === "healthy"
      ? "Healthy pace"
      : result.pace === "aggressive"
        ? "Aggressive"
        : result.pace === "fast"
          ? "Very fast"
          : null

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_10px_40px_-12px_rgba(6,110,67,0.18)]">
        {/* Header */}
        <div className="border-b border-line bg-gradient-to-br from-brand-50 to-white px-5 py-6 sm:px-8 sm:py-8">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${band.cls}`}>
            {band.icon}
            {result.milestoneLabel}
          </span>
          {result.gained ? (
            <h2 className="mt-4 text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
              Your weight is up {result.totalLost} {result.unit} so far
            </h2>
          ) : (
            <h2 className="mt-4 text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
              You have lost <span className="text-brand">{result.pct}%</span> of your body weight
            </h2>
          )}
          {!result.gained && (
            <p className="mt-2 text-sm text-copy sm:text-base">
              That is <strong className="text-ink">{result.totalLost} {result.unit}</strong> down from your starting
              weight
              {result.weeklyPct !== null ? `, about ${result.weeklyPct}% a week` : ""}.
            </p>
          )}
        </div>

        {/* Stats */}
        {!result.gained && (
          <div className="px-5 py-6 sm:px-8">
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat icon={<TrendingDown className="h-4 w-4" />} label="Lost" value={`${result.pct}%`} />
              <Stat
                icon={<Gauge className="h-4 w-4" />}
                label="Per week"
                value={result.weeklyPct !== null ? `${result.weeklyPct}%` : "Add weeks"}
                accent={result.showMuscleWarning}
              />
              <Stat
                icon={<Flag className="h-4 w-4" />}
                label="To goal"
                value={result.progressPct !== null ? `${result.progressPct}%` : "Add goal"}
              />
            </div>

            {/* Progress to goal bar */}
            {result.progressPct !== null && (
              <div className="mt-5">
                <div className="flex items-center justify-between text-sm font-bold text-brand-800">
                  <span>{result.progressPct}% of the way there</span>
                  <span className="text-faint">
                    {result.remaining} {result.unit} to go
                  </span>
                </div>
                <div className="mt-2 h-4 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-brand-600 transition-all"
                    style={{ width: `${result.progressPct}%` }}
                  />
                </div>
              </div>
            )}

            {paceLabel && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-bold ${
                    result.pace === "healthy" ? "bg-brand-50 text-brand-800" : "bg-amber-50 text-amber-800"
                  }`}
                >
                  <Gauge className="h-3.5 w-3.5" /> {paceLabel}
                </span>
                <span className="text-faint">
                  {result.pace === "healthy" ? "about 1% a week or less" : "faster than 1% a week"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Personalized read */}
        <div className="border-t border-line px-5 py-6 sm:px-8">
          <h3 className="flex items-center gap-2 text-base font-bold text-ink">
            <Target className="h-5 w-5 text-brand" />
            {answers.context === "glp1"
              ? "What this means on a GLP-1"
              : answers.context === "surgery"
                ? "What this means for you"
                : "What your number is telling you"}
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

        {/* Muscle warning + strong anchor to GLP-1 tool */}
        {result.showMuscleWarning && (
          <div className="border-t border-line px-5 py-6 sm:px-8">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5">
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-amber-900">Losing fast? Check what you are losing.</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-900/90">
                  At this pace, some of the drop can be muscle rather than fat, especially on a GLP-1. See your split with
                  the{" "}
                  <Link
                    href="/health/glp-1-dose-calculator"
                    className="font-bold text-amber-900 underline decoration-amber-500/50 underline-offset-2 hover:decoration-amber-700"
                  >
                    GLP-1 Body Composition Tracker: are you losing fat or muscle?
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* COMMIT */}
        <div className="border-t border-line bg-gradient-to-br from-brand-900 to-brand-800 px-5 py-7 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-50/70">A number is not a plan</p>
          <h3 className="mt-2 text-xl font-extrabold text-white sm:text-2xl">
            Turn this percentage into progress that lasts
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-brand-50/90">
            One reading is a snapshot. The GLP-1 Progress Tracker trends your loss and your lean mass together, projects
            your goal date, and flags the weeks you drop weight too fast to be all fat.
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
              "Loss and lean mass on one timeline",
              "Projected goal date from your pace",
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
        This tool measures the percentage of total body weight lost, which can include fat, water and muscle. It is
        educational, not medical advice. For infant weight loss, always see a pediatrician.
      </p>
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className={`rounded-xl border p-3 ${accent ? "border-amber-300 bg-amber-50" : "border-line bg-surface"}`}>
      <p className="flex items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider text-faint">
        <span className={accent ? "text-amber-700" : "text-brand-800"}>{icon}</span>
        {label}
      </p>
      <p className={`mt-0.5 text-base font-black sm:text-lg ${accent ? "text-amber-700" : "text-ink"}`}>{value}</p>
    </div>
  )
}
