"use client"

import { parseNumber } from "@/lib/utils";

/**
 * Ideal Body Weight — a guided health assessment, not a form.
 *
 * Flow: ASK (7 one-decision screens) -> AHA (a short personalizing reveal) ->
 * RESULT (hero number, four medical formulas, a plain-English insight, a health
 * dashboard, gauges + a goal timeline, and a soft, never-forced commit).
 *
 * Built without framer-motion/zustand (not in this project): premium spring feel
 * comes from CSS + tailwindcss-animate, state is local React, charts are Recharts.
 * Mobile-first, reduced-motion aware, keyboard + ARIA friendly.
 *
 * Brand: forest green #066E43, gold #FBBF24.
 */

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceArea,
} from "recharts"
import {
  computeIdealWeight, type IdealWeightInput, type Sex, type Activity, type Goal,
} from "@/lib/ideal-weight/formulas"
import {
  ArrowRight, ArrowLeft, Check, Sparkles, Activity as ActIcon, Ruler, Scale,
  Target, Heart, Flame, Dumbbell, Droplets, Gauge, Download, RotateCcw,
  User, UserRound, ShieldCheck, TrendingDown, TrendingUp, Minus, Loader2, Lock,
} from "lucide-react"

const GREEN = "#066E43"
const GOLD = "#FBBF24"
const LB = 2.2046226218
const IN = 2.54

type Phase = "intro" | "ask" | "aha" | "result"
type Units = "metric" | "imperial"

interface Draft {
  sex?: Sex
  age: number
  units: Units
  heightCm: string      // metric
  heightFt: string; heightIn: string // imperial
  weight: string        // kg or lb per units
  activity?: Activity
  goal?: Goal
}
const EMPTY: Draft = { age: 30, units: "metric", heightCm: "", heightFt: "", heightIn: "", weight: "" }

const ASK_STEPS = ["gender", "age", "height", "weight", "activity", "goal"] as const
type AskStep = (typeof ASK_STEPS)[number]

export default function IdealWeightExperience() {
  const [phase, setPhase] = useState<Phase>("intro")
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const reduced = usePrefersReducedMotion()
  const topRef = useRef<HTMLDivElement>(null)

  const units = draft.units
  const current: AskStep = ASK_STEPS[step]

  const heightCm = useMemo(() => {
    if (units === "metric") return parseFloat(draft.heightCm)
    const ft = parseFloat(draft.heightFt)
    const inch = parseFloat(draft.heightIn || "0") || 0
    return ft > 0 ? (ft * 12 + inch) * IN : NaN
  }, [units, draft.heightCm, draft.heightFt, draft.heightIn])

  const weightKg = useMemo(() => {
  const w = parseNumber(draft.weight)
    if (!(w > 0)) return NaN
    return units === "metric" ? w : w / LB
  }, [units, draft.weight])

  const result = useMemo(() => {
    if (phase !== "result" || !draft.sex || !draft.activity || !draft.goal) return null
    if (!(heightCm > 0) || !(weightKg > 0)) return null
    const input: IdealWeightInput = {
      sex: draft.sex, age: draft.age, heightCm, weightKg, activity: draft.activity, goal: draft.goal,
    }
    return computeIdealWeight(input)
  }, [phase, draft.sex, draft.age, draft.activity, draft.goal, heightCm, weightKg])

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" })

  const startAsk = () => { setPhase("ask"); setStep(0); scrollTop() }
  const nextStep = () => {
    if (step < ASK_STEPS.length - 1) { setStep((s) => s + 1); scrollTop() }
    else { setPhase("aha"); scrollTop() }
  }
  const back = () => {
    if (phase === "result") { setPhase("ask"); setStep(ASK_STEPS.length - 1); return }
    if (phase === "ask" && step > 0) setStep((s) => s - 1)
    else if (phase === "ask") setPhase("intro")
  }
  const restart = () => { setDraft(EMPTY); setStep(0); setPhase("intro"); scrollTop() }

  const canContinue = (): boolean => {
    switch (current) {
      case "gender": return Boolean(draft.sex)
      case "age": return draft.age >= 18 && draft.age <= 100
      case "height": return heightCm > 60 && heightCm < 260
      case "weight": return weightKg > 20 && weightKg < 400
      case "activity": return Boolean(draft.activity)
      case "goal": return Boolean(draft.goal)
    }
  }

  const displayWeightUnit = units === "metric" ? "kg" : "lb"
  const toDisplayW = (kg: number) => (units === "metric" ? kg : kg * LB)

  return (
    <div ref={topRef} className="mx-auto w-full max-w-3xl scroll-mt-24">
      {phase === "intro" && <IntroScreen onStart={startAsk} />}

      {phase === "ask" && (
        <AskShell step={step} total={ASK_STEPS.length} onBack={back}>
          {current === "gender" && <GenderStep draft={draft} setDraft={setDraft} onPick={nextStep} />}
          {current === "age" && <AgeStep draft={draft} setDraft={setDraft} />}
          {current === "height" && <HeightStep draft={draft} setDraft={setDraft} heightCm={heightCm} />}
          {current === "weight" && <WeightStep draft={draft} setDraft={setDraft} />}
          {current === "activity" && <ActivityStep draft={draft} setDraft={setDraft} onPick={nextStep} />}
          {current === "goal" && <GoalStep draft={draft} setDraft={setDraft} onPick={nextStep} />}

          {(current === "age" || current === "height" || current === "weight") && (
            <ContinueBar disabled={!canContinue()} onClick={nextStep} />
          )}
        </AskShell>
      )}

      {phase === "aha" && <AhaScreen reduced={reduced} onDone={() => { setPhase("result"); scrollTop() }} />}

      {phase === "result" && result && (
        <ResultView
          result={result}
          draft={draft}
          units={units}
          reduced={reduced}
          weightUnit={displayWeightUnit}
          toDisplayW={toDisplayW}
          onRestart={restart}
          onBack={back}
        />
      )}
    </div>
  )
}

// ── INTRO ─────────────────────────────────────────────────────────────────────
function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-[2rem] border border-slate-200/70 bg-white p-8 text-center shadow-[0_20px_60px_-25px_rgba(6,110,67,0.25)] sm:p-12">
      <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
        <Heart className="h-8 w-8" />
      </span>
      <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl">
        Let&apos;s find your ideal healthy weight
      </h2>
      <p className="mx-auto mt-4 max-w-md text-pretty text-base text-slate-500 sm:text-lg">
        We&apos;ll personalize everything using a few quick details. It takes about a minute, and nothing is saved.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#066E43] px-8 text-lg font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0 sm:w-auto"
      >
        Continue <ArrowRight className="h-5 w-5" />
      </button>
      <p className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Private · in-browser · no sign-up
      </p>
    </div>
  )
}

// ── ASK shell (progress + back) ────────────────────────────────────────────────
function AskShell({ step, total, onBack, children }: { step: number; total: number; onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="animate-in fade-in duration-300 rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(6,110,67,0.25)] sm:p-9">
      <div className="mb-7 flex items-center gap-3">
        <button type="button" onClick={onBack} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-[#066E43]" : "bg-slate-150 bg-slate-200"}`} />
          ))}
        </div>
        <span className="text-xs font-semibold tabular-nums text-slate-400">{step + 1}/{total}</span>
      </div>
      <div key={step} className="animate-in fade-in slide-in-from-right-3 duration-300">{children}</div>
    </div>
  )
}

function StepHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-7 text-center">
      <h2 className="text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
      {sub && <p className="mx-auto mt-2 max-w-sm text-pretty text-sm text-slate-500 sm:text-base">{sub}</p>}
    </div>
  )
}

function ContinueBar({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#066E43] px-8 text-lg font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
    >
      Continue <ArrowRight className="h-5 w-5" />
    </button>
  )
}

// ── steps ──────────────────────────────────────────────────────────────────────
function BigChoice({ selected, onClick, children, ariaLabel }: { selected?: boolean; onClick: () => void; children: React.ReactNode; ariaLabel?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={ariaLabel}
      className={`group flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all active:scale-[0.99] ${selected ? "border-[#066E43] bg-emerald-50/70 shadow-sm" : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30"}`}
    >
      {children}
    </button>
  )
}

function GenderStep({ draft, setDraft, onPick }: StepProps & { onPick: () => void }) {
  const pick = (sex: Sex) => { setDraft((d) => ({ ...d, sex })); setTimeout(onPick, 160) }
  return (
    <>
      <StepHead title="What's your biological sex?" sub="The medical formulas use a different equation for each." />
      <div className="grid grid-cols-2 gap-3">
        {([["male", "Male", User], ["female", "Female", UserRound]] as const).map(([v, label, Icon]) => (
          <button
            key={v}
            type="button"
            onClick={() => pick(v)}
            aria-pressed={draft.sex === v}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-7 transition-all active:scale-[0.98] ${draft.sex === v ? "border-[#066E43] bg-emerald-50/70" : "border-slate-200 hover:border-emerald-300"}`}
          >
            <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${draft.sex === v ? "bg-[#066E43] text-white" : "bg-slate-100 text-slate-500"}`}>
              <Icon className="h-7 w-7" />
            </span>
            <span className="text-lg font-semibold text-slate-900">{label}</span>
          </button>
        ))}
      </div>
    </>
  )
}

function AgeStep({ draft, setDraft }: StepProps) {
  return (
    <>
      <StepHead title="How old are you?" sub="Age refines your metabolism and body-fat estimate." />
      <div className="rounded-3xl bg-slate-50 py-8 text-center">
        <div className="text-6xl font-bold tabular-nums tracking-tight text-slate-900">{draft.age}</div>
        <div className="mt-1 text-sm font-medium uppercase tracking-wider text-slate-400">years</div>
        <input
          type="range"
          min={18}
          max={100}
          value={draft.age}
          onChange={(e) => setDraft((d) => ({ ...d, age: Number(e.target.value) }))}
          aria-label="Age"
          className="mt-6 w-[80%] accent-[#066E43]"
        />
        <div className="mx-auto mt-2 flex w-[80%] justify-between text-xs text-slate-400"><span>18</span><span>100</span></div>
      </div>
    </>
  )
}

function HeightStep({ draft, setDraft, heightCm }: StepProps & { heightCm: number }) {
  const set = (k: keyof Draft, v: string) => setDraft((d) => ({ ...d, [k]: v }))
  return (
    <>
      <StepHead title="How tall are you?" />
      <UnitToggle units={draft.units} onChange={(u) => setDraft((d) => ({ ...d, units: u }))} left="cm" right="ft / in" />
      <div className="mt-5 flex items-end justify-center gap-6">
        <HeightGlyph heightCm={heightCm} />
        <div className="flex-1">
          {draft.units === "metric" ? (
            <BigField value={draft.heightCm} onChange={(v) => set("heightCm", v)} suffix="cm" placeholder="178" autoFocus />
          ) : (
            <div className="flex gap-3">
              <BigField value={draft.heightFt} onChange={(v) => set("heightFt", v)} suffix="ft" placeholder="5" autoFocus />
              <BigField value={draft.heightIn} onChange={(v) => set("heightIn", v)} suffix="in" placeholder="10" />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function WeightStep({ draft, setDraft }: StepProps) {
  return (
    <>
      <StepHead title="What's your current weight?" sub="Your starting point. We only compare, never judge." />
      <UnitToggle units={draft.units} onChange={(u) => setDraft((d) => ({ ...d, units: u }))} left="kg" right="lb" />
      <div className="mt-6 flex flex-col items-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-800"><Scale className="h-8 w-8" /></span>
        <BigField value={draft.weight} onChange={(v) => setDraft((d) => ({ ...d, weight: v }))} suffix={draft.units === "metric" ? "kg" : "lb"} placeholder={draft.units === "metric" ? "82" : "180"} autoFocus center />
      </div>
    </>
  )
}

const ACTIVITIES: { v: Activity; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { v: "sedentary", label: "Sedentary", desc: "Mostly sitting, little exercise", icon: Minus },
  { v: "light", label: "Light", desc: "Light activity 1 to 3 days a week", icon: ActIcon },
  { v: "moderate", label: "Moderate", desc: "Exercise 3 to 5 days a week", icon: TrendingUp },
  { v: "active", label: "Active", desc: "Hard exercise 6 to 7 days a week", icon: Flame },
  { v: "athlete", label: "Athlete", desc: "Training twice a day or physical job", icon: Dumbbell },
]
function ActivityStep({ draft, setDraft, onPick }: StepProps & { onPick: () => void }) {
  const pick = (v: Activity) => { setDraft((d) => ({ ...d, activity: v })); setTimeout(onPick, 160) }
  return (
    <>
      <StepHead title="How active are you?" sub="This sets your daily calorie needs." />
      <div className="space-y-3">
        {ACTIVITIES.map((a) => (
          <BigChoice key={a.v} selected={draft.activity === a.v} onClick={() => pick(a.v)} ariaLabel={a.label}>
            <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${draft.activity === a.v ? "bg-[#066E43] text-white" : "bg-slate-100 text-slate-500"}`}><a.icon className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-slate-900">{a.label}</span>
              <span className="block text-sm text-slate-500">{a.desc}</span>
            </span>
            <ArrowRight className="h-5 w-5 flex-shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#066E43]" />
          </BigChoice>
        ))}
      </div>
    </>
  )
}

const GOALS: { v: Goal; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { v: "maintain", label: "Maintain", icon: Minus },
  { v: "loseFat", label: "Lose Fat", icon: TrendingDown },
  { v: "gainMuscle", label: "Gain Muscle", icon: Dumbbell },
  { v: "improveHealth", label: "Improve Health", icon: Heart },
]
function GoalStep({ draft, setDraft, onPick }: StepProps & { onPick: () => void }) {
  const pick = (v: Goal) => { setDraft((d) => ({ ...d, goal: v })); setTimeout(onPick, 160) }
  return (
    <>
      <StepHead title="What's your goal?" sub="We'll frame your result around this." />
      <div className="grid grid-cols-2 gap-3">
        {GOALS.map((g) => (
          <button
            key={g.v}
            type="button"
            onClick={() => pick(g.v)}
            aria-pressed={draft.goal === g.v}
            className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all active:scale-[0.98] ${draft.goal === g.v ? "border-[#066E43] bg-emerald-50/70" : "border-slate-200 hover:border-emerald-300"}`}
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${draft.goal === g.v ? "bg-[#066E43] text-white" : "bg-slate-100 text-slate-500"}`}><g.icon className="h-6 w-6" /></span>
            <span className="text-center font-semibold text-slate-900">{g.label}</span>
          </button>
        ))}
      </div>
    </>
  )
}

// ── AHA reveal ──────────────────────────────────────────────────────────────────
const AHA_LINES = [
  "Personalizing your body profile",
  "Calculating your healthy weight range",
  "Comparing multiple medical formulas",
  "Building your personalized report",
]
function AhaScreen({ onDone, reduced }: { onDone: () => void; reduced: boolean }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduced) { const t = setTimeout(onDone, 400); return () => clearTimeout(t) }
    const per = 520
    const ticks = AHA_LINES.map((_, idx) => setTimeout(() => setI(idx), idx * per))
    const done = setTimeout(onDone, AHA_LINES.length * per + 300)
    return () => { ticks.forEach(clearTimeout); clearTimeout(done) }
  }, [onDone, reduced])

  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center rounded-[2rem] border border-slate-200/70 bg-white p-10 text-center shadow-[0_20px_60px_-30px_rgba(6,110,67,0.25)]">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-200/50" />
        <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
          <Sparkles className="h-10 w-10" />
        </span>
      </div>
      <div className="mt-8 h-6">
        {AHA_LINES.map((line, idx) => (
          <p key={line} className={`text-lg font-medium text-slate-700 transition-opacity duration-300 ${idx === i ? "opacity-100" : "hidden opacity-0"}`}>
            {line}…
          </p>
        ))}
      </div>
      <div className="mt-6 h-1.5 w-56 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-[#066E43] to-emerald-400 transition-all duration-500" style={{ width: `${((i + 1) / AHA_LINES.length) * 100}%` }} />
      </div>
    </div>
  )
}

// ── RESULT ──────────────────────────────────────────────────────────────────────
function ResultView({
  result, draft, weightUnit, toDisplayW, reduced, onRestart, onBack,
}: {
  result: ReturnType<typeof computeIdealWeight>
  draft: Draft
  units: Units
  weightUnit: string
  toDisplayW: (kg: number) => number
  reduced: boolean
  onRestart: () => void
  onBack: () => void
}) {
  const rec = toDisplayW(result.recommendedKg)
  const lo = toDisplayW(result.healthyLowKg)
  const hi = toDisplayW(result.healthyHighKg)
  const animRec = useCountUp(rec, reduced)

  const changeAbs = Math.abs(toDisplayW(Math.abs(result.changeKg)))
  const dir = result.changeKg < 0 ? "to lose" : result.changeKg > 0 ? "to gain" : "to maintain"

  return (
    <div className="animate-in fade-in slide-in-from-bottom-3 space-y-5 duration-500">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-white p-8 text-center shadow-[0_20px_60px_-28px_rgba(6,110,67,0.3)] sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
          <Sparkles className="h-3.5 w-3.5" /> Your ideal weight
        </span>
        <div className="mt-4 flex items-baseline justify-center gap-2">
          <span className="text-6xl font-bold tabular-nums tracking-tight text-[#066E43] sm:text-7xl">{animRec.toFixed(1)}</span>
          <span className="text-2xl font-semibold text-emerald-700/70">{weightUnit}</span>
        </div>
        <p className="mt-3 text-slate-500">
          Healthy range <strong className="text-slate-800">{lo.toFixed(0)}–{hi.toFixed(0)} {weightUnit}</strong>
        </p>
        {Math.abs(result.changeKg) >= 0.5 && (
          <p className="mt-1 text-sm font-medium text-slate-500">
            About <strong className="text-slate-800">{changeAbs.toFixed(1)} {weightUnit}</strong> {dir} to reach your goal
          </p>
        )}
      </div>

      {/* INSIGHT */}
      <Card>
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Heart className="h-4 w-4 text-[#066E43]" /> What this means for you</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{result.insight}</p>
      </Card>

      {/* FORMULAS */}
      <Card>
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Ruler className="h-4 w-4 text-[#066E43]" /> Four medical formulas</h3>
        <p className="mt-1 text-sm text-slate-500">Each was derived on a different population, so we average them for your recommended estimate.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {result.formulas.map((f) => {
            const val = toDisplayW(f.kg)
            const near = Math.abs(f.kg - result.recommendedKg) <= 1.5
            return (
              <div key={f.key} className={`rounded-2xl border p-4 text-center transition-colors ${near ? "border-[#066E43] bg-emerald-50/60" : "border-slate-200 bg-slate-50/60"}`}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{f.name}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{val.toFixed(1)}</p>
                <p className="text-xs text-slate-400">{weightUnit}</p>
              </div>
            )
          })}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700"><span className="inline-block h-2.5 w-2.5 rounded-full bg-[#066E43]" /> Recommended estimate {rec.toFixed(1)} {weightUnit}</p>
      </Card>

      {/* GAUGES */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Card>
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Gauge className="h-4 w-4 text-[#066E43]" /> BMI</h3>
          <BmiGauge bmi={result.metrics.bmi} category={result.metrics.bmiCategory} reduced={reduced} />
        </Card>
        <Card>
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Target className="h-4 w-4 text-[#066E43]" /> Where you sit</h3>
          <HealthyZoneBar current={toDisplayW(draft.weight ? parseWeight(draft) : 0)} lo={lo} hi={hi} unit={weightUnit} reduced={reduced} />
        </Card>
      </div>

      {/* HEALTH DASHBOARD */}
      <Card>
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><ActIcon className="h-4 w-4 text-[#066E43]" /> Your health dashboard</h3>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric icon={<Gauge className="h-4 w-4" />} label="BMI" value={result.metrics.bmi.toFixed(1)} sub={result.metrics.bmiCategory} reduced={reduced} />
          <Metric icon={<Scale className="h-4 w-4" />} label="Healthy weight" value={`${lo.toFixed(0)}–${hi.toFixed(0)}`} sub={weightUnit} />
          <Metric icon={<Flame className="h-4 w-4" />} label="Daily calories" value={result.metrics.dailyCalories.toLocaleString()} sub="kcal to maintain" reduced={reduced} />
          <Metric icon={<Droplets className="h-4 w-4" />} label="BMR" value={result.metrics.bmr.toLocaleString()} sub="kcal at rest" reduced={reduced} />
          <Metric icon={<Dumbbell className="h-4 w-4" />} label="Lean mass" value={toDisplayW(result.metrics.leanBodyMassKg).toFixed(1)} sub={weightUnit} reduced={reduced} />
          <Metric icon={<Heart className="h-4 w-4" />} label="Body fat" value={`${result.metrics.bodyFatPct.toFixed(0)}%`} sub="estimate" reduced={reduced} />
          <Metric icon={<Ruler className="h-4 w-4" />} label="Body surface" value={result.metrics.bsa.toFixed(2)} sub="m² (BSA)" />
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-400">Estimates from validated equations (Mifflin-St Jeor, Boer, Mosteller, Deurenberg). Educational, not a diagnosis.</p>
      </Card>

      {/* TIMELINE */}
      {result.timeline.length > 1 && (
        <Card>
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><TrendingDown className="h-4 w-4 text-[#066E43]" /> Your healthy timeline</h3>
          <p className="mt-1 text-sm text-slate-500">A steady, sustainable path from today to your target.</p>
          <TimelineChart timeline={result.timeline} toDisplayW={toDisplayW} unit={weightUnit} />
          <div className="mt-3 flex flex-wrap gap-2">
            {result.timeline.map((p) => (
              <span key={p.week} className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                {p.label}: {toDisplayW(p.kg).toFixed(1)} {weightUnit}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* COMMIT */}
      <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#055536] to-[#066E43] p-8 text-white shadow-xl sm:p-9">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-100/70">This is just the start</p>
        <h3 className="mt-2 text-xl font-bold sm:text-2xl">Track your weight the way it should be tracked</h3>
        <p className="mt-2 text-sm leading-relaxed text-emerald-50/90">
          Save this assessment and watch fat versus muscle, not just the scale. It matters most on a GLP-1, where up to 40 percent of the weight lost can be muscle if you do not protect it.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href="/product/glp1-progress-tracker" className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#FBBF24] px-6 py-4 text-base font-bold text-[#1a1a1a] shadow-[0_10px_28px_rgba(245,158,11,0.4)] transition-transform hover:-translate-y-0.5">
            <Sparkles className="h-5 w-5" /> Track my progress <ArrowRight className="h-4 w-4" />
          </Link>
          <button type="button" onClick={() => downloadReport(result, draft, weightUnit, toDisplayW)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10">
            <Download className="h-4 w-4" /> Download report
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-emerald-50/80">
          <Link href="/pricing" className="inline-flex items-center gap-1 font-semibold underline underline-offset-2"><Lock className="h-3.5 w-3.5" /> Plans &amp; pricing</Link>
          <Link href="/health/body-fat-calculator" className="font-semibold underline underline-offset-2">Check body fat</Link>
          <Link href="/health/lean-body-mass-calculator" className="font-semibold underline underline-offset-2">Protein target</Link>
        </div>
        <p className="mt-4 text-xs text-emerald-100/60">No account required to see or download your result.</p>
      </div>

      <div className="flex items-center justify-between px-1 pb-2">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-700"><ArrowLeft className="h-4 w-4" /> Change answers</button>
        <button type="button" onClick={onRestart} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-700"><RotateCcw className="h-4 w-4" /> Start over</button>
      </div>
    </div>
  )
}

// ── charts ──────────────────────────────────────────────────────────────────────
function BmiGauge({ bmi, category, reduced }: { bmi: number; category: string; reduced: boolean }) {
  const pct = Math.min(100, Math.max(0, ((bmi - 12) / (40 - 12)) * 100))
  const color = bmi < 18.5 ? "#38bdf8" : bmi < 25 ? GREEN : bmi < 30 ? GOLD : "#ef4444"
  const data = [{ value: pct, fill: color }]
  return (
    <div className="relative mt-1 h-40">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="72%" outerRadius="100%" data={data} startAngle={210} endAngle={-30}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={12} background={{ fill: "#eef2f5" }} isAnimationActive={!reduced} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums text-slate-900">{bmi.toFixed(1)}</span>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>{category}</span>
      </div>
    </div>
  )
}

function HealthyZoneBar({ current, lo, hi, unit, reduced }: { current: number; lo: number; hi: number; unit: string; reduced: boolean }) {
  const min = Math.min(lo, current) * 0.9
  const max = Math.max(hi, current) * 1.1
  const pos = (v: number) => ((v - min) / (max - min)) * 100
  return (
    <div className="mt-5">
      <div className="relative h-3 w-full rounded-full bg-slate-100">
        <div className="absolute inset-y-0 rounded-full bg-emerald-200" style={{ left: `${pos(lo)}%`, right: `${100 - pos(hi)}%` }} />
        <div className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#066E43] shadow ${reduced ? "" : "transition-all duration-700"}`} style={{ left: `${Math.min(100, Math.max(0, pos(current)))}%` }} />
      </div>
      <div className="mt-3 flex justify-between text-xs font-medium text-slate-500">
        <span>{lo.toFixed(0)} {unit}</span>
        <span className="font-bold text-[#066E43]">You: {current.toFixed(1)} {unit}</span>
        <span>{hi.toFixed(0)} {unit}</span>
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">Green is the BMI-healthy zone for your height.</p>
    </div>
  )
}

function TimelineChart({ timeline, toDisplayW, unit }: { timeline: { week: number; kg: number }[]; toDisplayW: (kg: number) => number; unit: string }) {
  const data = timeline.map((p) => ({ week: p.week, weight: Math.round(toDisplayW(p.kg) * 10) / 10 }))
  const weights = data.map((d) => d.weight)
  const dmin = Math.floor(Math.min(...weights) - 1)
  const dmax = Math.ceil(Math.max(...weights) + 1)
  return (
    <div className="mt-4 h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="iw-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GREEN} stopOpacity={0.35} />
              <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="week" tickFormatter={(w) => (w === 0 ? "Now" : `${w}w`)} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis domain={[dmin, dmax]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
          <Tooltip formatter={(v: number) => [`${v} ${unit}`, "Weight"]} labelFormatter={(w) => (w === 0 ? "Today" : `Week ${w}`)} />
          <Area type="monotone" dataKey="weight" stroke={GREEN} strokeWidth={2.5} fill="url(#iw-grad)" dot={{ r: 3, fill: GREEN }} activeDot={{ r: 5 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── small building blocks ─────────────────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-5 shadow-[0_10px_40px_-28px_rgba(6,110,67,0.35)] sm:p-6">{children}</div>
}
function Metric({ icon, label, value, sub, reduced }: { icon: React.ReactNode; label: string; value: string; sub: string; reduced?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 transition-transform hover:-translate-y-0.5">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400"><span className="text-[#066E43]">{icon}</span>{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  )
}
function UnitToggle({ units, onChange, left, right }: { units: Units; onChange: (u: Units) => void; left: string; right: string }) {
  return (
    <div className="mx-auto flex w-fit gap-1 rounded-full border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Units">
      <button type="button" onClick={() => onChange("metric")} aria-pressed={units === "metric"} className={`min-h-[36px] rounded-full px-4 text-sm font-bold transition-colors ${units === "metric" ? "bg-[#066E43] text-white" : "text-slate-500"}`}>{left}</button>
      <button type="button" onClick={() => onChange("imperial")} aria-pressed={units === "imperial"} className={`min-h-[36px] rounded-full px-4 text-sm font-bold transition-colors ${units === "imperial" ? "bg-[#066E43] text-white" : "text-slate-500"}`}>{right}</button>
    </div>
  )
}
function BigField({ value, onChange, suffix, placeholder, autoFocus, center }: { value: string; onChange: (v: string) => void; suffix: string; placeholder: string; autoFocus?: boolean; center?: boolean }) {
  return (
    <div className={`flex items-stretch overflow-hidden rounded-2xl border-2 border-slate-200 focus-within:border-[#066E43] ${center ? "w-52" : "w-full"}`}>
      <input autoFocus={autoFocus} inputMode="decimal" type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-transparent px-4 py-4 text-center text-3xl font-bold tabular-nums text-slate-900 outline-none placeholder:text-slate-300" />
      <span className="flex items-center bg-slate-50 px-4 text-sm font-bold text-slate-400">{suffix}</span>
    </div>
  )
}
function HeightGlyph({ heightCm }: { heightCm: number }) {
  const h = Number.isFinite(heightCm) ? Math.min(1, Math.max(0.45, (heightCm - 140) / 80)) : 0.7
  return (
    <div className="flex h-40 w-14 items-end justify-center" aria-hidden>
      <div className="flex flex-col items-center transition-all duration-500" style={{ height: `${h * 100}%` }}>
        <span className="h-4 w-4 rounded-full bg-emerald-300" />
        <span className="mt-0.5 w-2.5 flex-1 rounded-full bg-emerald-200" />
      </div>
    </div>
  )
}

// ── hooks / utils ─────────────────────────────────────────────────────────────
interface StepProps { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener?.("change", on)
    return () => mq.removeEventListener?.("change", on)
  }, [])
  return reduced
}

function useCountUp(target: number, reduced: boolean, ms = 900) {
  const [v, setV] = useState(reduced ? target : 0)
  useEffect(() => {
    if (reduced) { setV(target); return }
    let raf = 0
    const start = performance.now()
    const from = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms)
      const e = 1 - Math.pow(1 - p, 3)
      setV(from + (target - from) * e)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, reduced, ms])
  return v
}

function parseWeight(draft: Draft): number {
  const w = parseNumber(draft.weight)
  if (!(w > 0)) return 0
  return draft.units === "metric" ? w : w / LB
}

function downloadReport(result: ReturnType<typeof computeIdealWeight>, draft: Draft, unit: string, toDisplayW: (kg: number) => number) {
  const lines = [
    "CALQULATE.NET — IDEAL WEIGHT ASSESSMENT",
    "",
    `Sex: ${draft.sex}   Age: ${draft.age}`,
    `Recommended ideal weight: ${toDisplayW(result.recommendedKg).toFixed(1)} ${unit}`,
    `Healthy range: ${toDisplayW(result.healthyLowKg).toFixed(1)}–${toDisplayW(result.healthyHighKg).toFixed(1)} ${unit}`,
    `Target for your goal: ${toDisplayW(result.targetKg).toFixed(1)} ${unit}`,
    "",
    "Formulas:",
    ...result.formulas.map((f) => `  ${f.name}: ${toDisplayW(f.kg).toFixed(1)} ${unit}`),
    "",
    "Health metrics:",
    `  BMI ${result.metrics.bmi} (${result.metrics.bmiCategory})`,
    `  BMR ${result.metrics.bmr} kcal | Daily calories ${result.metrics.dailyCalories} kcal`,
    `  Lean mass ${toDisplayW(result.metrics.leanBodyMassKg).toFixed(1)} ${unit} | Body fat ~${result.metrics.bodyFatPct}%`,
    `  Body surface area ${result.metrics.bsa} m²`,
    "",
    result.insight,
    "",
    "Educational estimate only, not medical advice.",
  ]
  const blob = new Blob([lines.join("\n")], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "ideal-weight-assessment.txt"
  a.click()
  URL.revokeObjectURL(url)
}
