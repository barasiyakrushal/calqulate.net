"use client"

/**
 * Body Fat Wizard: Ask -> Aha -> Commit.
 *
 * Two ways in:
 *   - Tape measure: the classic U.S. Navy circumference inputs. Most accurate.
 *   - AI photo:     MediaPipe PoseLandmarker (in-browser, nothing uploaded) finds
 *                   your landmarks and a body segmentation mask; we measure real
 *                   circumferences off that and feed the same Navy formula.
 *
 * The photo path is an ESTIMATE, and it says so. A front photo alone has to
 * assume how deep your torso is front-to-back; adding a side photo measures it
 * instead, which is why the confidence badge changes. All the geometry lives in
 * lib/bodyfat/pose-measure.ts and is unit-tested.
 *
 * Mobile-first, one decision per screen, progress bar, everything skippable
 * except the aha moment. No em dashes in the copy.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision"
import { parseNumber } from "@/lib/utils"
import {
  measureFromPose,
  navyBodyFat,
  SMM_FRACTION_OF_LBM,
  LM,
  type Landmark,
  type Mask,
  type PoseMeasurement,
} from "@/lib/bodyfat/pose-measure"
import {
  Camera,
  Ruler,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Lock,
  ShieldCheck,
  Target,
  Dumbbell,
  Syringe,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Upload,
  Scale,
} from "lucide-react"

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task"
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"

const LB_PER_KG = 2.2046226218
const CM_PER_IN = 2.54

type Mode = "photo" | "tape"
type Goal = "loseFat" | "keepMuscle" | "glp1" | "number"
type Sex = "male" | "female"
type Units = "metric" | "imperial"

interface Answers {
  mode?: Mode
  goal?: Goal
  sex?: Sex
  units?: Units
  height?: string
  weight?: string
  neck?: string
  waist?: string
  hips?: string
}

interface Result {
  bfp: number
  fatMass: number
  leanMass: number
  smmPct: number
  unit: string
  category: { label: string; range: string; tone: "good" | "ok" | "warn" }
  targetBfp: number
  atTarget: boolean
  fatToLose: number
  weeksToTarget: number
  source: "photo" | "tape"
  measurement?: PoseMeasurement | null
}

// ── category bands ────────────────────────────────────────────────────────────
function categorize(bfp: number, sex: Sex): Result["category"] {
  const male = sex === "male"
  if (male) {
    if (bfp < 6) return { label: "Essential fat", range: "2 to 5%", tone: "warn" }
    if (bfp < 14) return { label: "Athlete", range: "6 to 13%", tone: "good" }
    if (bfp < 18) return { label: "Fitness", range: "14 to 17%", tone: "good" }
    if (bfp < 25) return { label: "Average", range: "18 to 24%", tone: "ok" }
    return { label: "Above healthy range", range: "25%+", tone: "warn" }
  }
  if (bfp < 14) return { label: "Essential fat", range: "10 to 13%", tone: "warn" }
  if (bfp < 21) return { label: "Athlete", range: "14 to 20%", tone: "good" }
  if (bfp < 25) return { label: "Fitness", range: "21 to 24%", tone: "good" }
  if (bfp < 32) return { label: "Average", range: "25 to 31%", tone: "ok" }
  return { label: "Above healthy range", range: "32%+", tone: "warn" }
}

function buildResult(args: {
  bfp: number
  weightKg: number
  sex: Sex
  units: Units
  source: "photo" | "tape"
  measurement?: PoseMeasurement | null
}): Result {
  const { bfp, weightKg, sex, units, source, measurement } = args
  const metric = units === "metric"
  const toDisp = (kg: number) => (metric ? kg : kg * LB_PER_KG)

  const fatKg = (bfp / 100) * weightKg
  const leanKg = weightKg - fatKg
  const smmKg = leanKg * SMM_FRACTION_OF_LBM[sex]

  const targetBfp = sex === "male" ? 17 : 24
  const atTarget = bfp <= targetBfp
  const weightAtTargetKg = leanKg / (1 - targetBfp / 100)
  const fatToLoseKg = Math.max(0, weightKg - weightAtTargetKg)
  const weeksToTarget = Math.max(0, Math.ceil(fatToLoseKg / 0.5))

  return {
    bfp,
    fatMass: toDisp(fatKg),
    leanMass: toDisp(leanKg),
    smmPct: (smmKg / weightKg) * 100,
    unit: metric ? "kg" : "lb",
    category: categorize(bfp, sex),
    targetBfp,
    atTarget,
    fatToLose: toDisp(fatToLoseKg),
    weeksToTarget,
    source,
    measurement,
  }
}

// ── step model ────────────────────────────────────────────────────────────────
type Step =
  | { kind: "choice"; key: keyof Answers; title: string; subtitle?: string; options: { value: string; label: string; hint?: string; icon?: React.ReactNode }[] }
  | { kind: "number"; key: keyof Answers; title: string; subtitle?: string; placeholder: string; suffix: "len" | "wt" | string; min?: number; max?: number; optional?: boolean }
  | { kind: "photo"; key: "photo"; title: string; subtitle?: string }

function buildSteps(a: Answers): Step[] {
  const steps: Step[] = [
    {
      kind: "choice",
      key: "mode",
      title: "How would you like to measure?",
      subtitle: "Both use the same validated Navy formula at the end.",
      options: [
        { value: "photo", label: "AI photo", hint: "Easiest. Nothing leaves your browser", icon: <Camera className="h-5 w-5" /> },
        { value: "tape", label: "Tape measure", hint: "Most accurate, needs a soft tape", icon: <Ruler className="h-5 w-5" /> },
      ],
    },
    {
      kind: "choice",
      key: "goal",
      title: "What are you here to do?",
      subtitle: "This shapes the plan we show you at the end.",
      options: [
        { value: "loseFat", label: "Lose body fat", hint: "Drop fat, keep strength", icon: <TrendingDown className="h-5 w-5" /> },
        { value: "glp1", label: "I am on a GLP-1", hint: "Ozempic, Wegovy, Mounjaro, Zepbound", icon: <Syringe className="h-5 w-5" /> },
        { value: "keepMuscle", label: "Keep or build muscle", hint: "Protect lean mass", icon: <Dumbbell className="h-5 w-5" /> },
        { value: "number", label: "Just get my number", hint: "Quick and simple", icon: <Scale className="h-5 w-5" /> },
      ],
    },
    {
      kind: "choice",
      key: "sex",
      title: "What is your biological sex?",
      subtitle: "The Navy formula uses a different equation for each.",
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
      ],
    },
    {
      kind: "choice",
      key: "units",
      title: "Which units do you use?",
      options: [
        { value: "metric", label: "Metric", hint: "cm and kg" },
        { value: "imperial", label: "Imperial", hint: "inches and lbs" },
      ],
    },
    { kind: "number", key: "height", title: "How tall are you?", subtitle: "We scale the photo against your real height, so this must be accurate.", placeholder: "175", suffix: "len", min: 100, max: 250 },
    { kind: "number", key: "weight", title: "What do you weigh?", subtitle: "Used to split your weight into fat and lean mass.", placeholder: "70", suffix: "wt", min: 25, max: 400 },
  ]

  if (a.mode === "tape") {
    steps.push(
      { kind: "number", key: "neck", title: "Neck circumference", subtitle: "Just below the Adam's apple, tape level.", placeholder: "38", suffix: "len", min: 20, max: 70 },
      { kind: "number", key: "waist", title: "Waist circumference", subtitle: a.sex === "female" ? "At the narrowest point, usually just above the navel." : "At navel level, relaxed. Do not suck in.", placeholder: "85", suffix: "len", min: 40, max: 200 },
    )
    if (a.sex === "female") {
      steps.push({ kind: "number", key: "hips", title: "Hip circumference", subtitle: "Around the widest part of the hips and buttocks.", placeholder: "95", suffix: "len", min: 50, max: 200 })
    }
  } else if (a.mode === "photo") {
    steps.push({ kind: "photo", key: "photo", title: "Add your photo", subtitle: "Processed entirely on your device. Nothing is uploaded." })
  }
  return steps
}

// ── component ─────────────────────────────────────────────────────────────────
export default function BodyFatWizard() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [numDraft, setNumDraft] = useState("")
  const [result, setResult] = useState<Result | null>(null)

  // photo mode
  const [frontUrl, setFrontUrl] = useState<string | null>(null)
  const [sideUrl, setSideUrl] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [poseError, setPoseError] = useState<string | null>(null)
  const [modelReady, setModelReady] = useState(false)
  const landmarkerRef = useRef<PoseLandmarker | null>(null)
  const overlayRef = useRef<HTMLCanvasElement | null>(null)

  const steps = useMemo(() => buildSteps(answers), [answers])
  const total = steps.length
  const current = steps[Math.min(step, total - 1)]
  const units = (answers.units ?? "metric") as Units

  // Load the pose model only when the user actually chooses photo mode.
  useEffect(() => {
    if (answers.mode !== "photo" || landmarkerRef.current) return
    let cancelled = false
    ;(async () => {
      try {
        const fileset = await FilesetResolver.forVisionTasks(WASM_URL)
        const lm = await PoseLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "IMAGE",
          numPoses: 1,
          outputSegmentationMasks: true,
        })
        if (cancelled) { lm.close?.(); return }
        landmarkerRef.current = lm
        setModelReady(true)
      } catch {
        if (!cancelled) setPoseError("The on-device model could not load. You can still use tape measure mode.")
      }
    })()
    return () => { cancelled = true }
  }, [answers.mode])

  useEffect(() => () => { landmarkerRef.current?.close?.() }, [])

  const goNext = () => {
    if (step < total - 1) { setStep((s) => s + 1); setNumDraft("") }
  }
  const goBack = () => {
    if (result) { setResult(null); return }
    if (step > 0) { setStep((s) => s - 1); setNumDraft("") }
  }
  const pick = (value: string) => {
    setAnswers((a) => ({ ...a, [current.kind === "choice" ? current.key : "mode"]: value }))
    goNext()
  }

  const suffixLabel = (s: string) => (s === "len" ? (units === "metric" ? "cm" : "in") : s === "wt" ? (units === "metric" ? "kg" : "lb") : s)

  // ── tape submit ────────────────────────────────────────────────────────────
  const submitNumber = () => {
    if (current.kind !== "number") return
    const n = parseNumber(numDraft)
    if (!(n > 0)) return
    const next = { ...answers, [current.key]: numDraft }
    setAnswers(next)
    if (step < total - 1) { setStep((s) => s + 1); setNumDraft("") }
    else computeTape(next)
  }

  const computeTape = (a: Answers) => {
    const metric = (a.units ?? "metric") === "metric"
    const toCm = (v: string) => (metric ? parseNumber(v) : parseNumber(v) * CM_PER_IN)
    const toKg = (v: string) => (metric ? parseNumber(v) : parseNumber(v) / LB_PER_KG)
    const sex = (a.sex ?? "male") as Sex
    const heightCm = toCm(a.height!)
    const weightKg = toKg(a.weight!)
    const bfp = navyBodyFat({
      sex,
      heightCm,
      neckCm: toCm(a.neck!),
      waistCm: toCm(a.waist!),
      hipCm: a.hips ? toCm(a.hips) : undefined,
    })
    if (bfp == null) { setPoseError("Those measurements do not work in the Navy formula. Your waist must be larger than your neck. Please re-check them."); return }
    setPoseError(null)
    setResult(buildResult({ bfp, weightKg, sex, units: a.units ?? "metric", source: "tape" }))
  }

  // ── photo analysis ─────────────────────────────────────────────────────────
  const loadImage = (url: string) =>
    new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => res(img)
      img.onerror = () => rej(new Error("image"))
      img.src = url
    })

  const runPose = useCallback(async (url: string): Promise<{ landmarks: Landmark[]; mask: Mask; img: HTMLImageElement } | null> => {
    const lm = landmarkerRef.current
    if (!lm) return null
    const img = await loadImage(url)
    const res = lm.detect(img)
    if (!res.landmarks?.length) return null
    const mp = res.segmentationMasks?.[0]
    if (!mp) return null
    const src = mp.getAsFloat32Array()
    const mask: Mask = { data: new Float32Array(src), width: mp.width, height: mp.height }
    mp.close()
    return { landmarks: res.landmarks[0] as Landmark[], mask, img }
  }, [])

  const analyze = async () => {
    if (!frontUrl) return
    setAnalyzing(true)
    setPoseError(null)
    try {
      const front = await runPose(frontUrl)
      if (!front) { setPoseError("We could not find a full body in that photo. Stand back so your whole body is visible, head to feet, in good light."); setAnalyzing(false); return }
      const side = sideUrl ? await runPose(sideUrl) : null

      const metric = units === "metric"
      const sex = (answers.sex ?? "male") as Sex
      const heightCm = metric ? parseNumber(answers.height!) : parseNumber(answers.height!) * CM_PER_IN
      const weightKg = metric ? parseNumber(answers.weight!) : parseNumber(answers.weight!) / LB_PER_KG

      const m = measureFromPose({
        front: { landmarks: front.landmarks, mask: front.mask },
        side: side ? { landmarks: side.landmarks, mask: side.mask } : null,
        heightCm,
        sex,
      })
      if (!m) { setPoseError("We found you, but could not get a clean torso outline. Try tighter clothing, a plain background, and hold your arms slightly away from your body."); setAnalyzing(false); return }

      const bfp = navyBodyFat({ sex, heightCm, neckCm: m.neckCm, waistCm: m.waistCm, hipCm: m.hipCm })
      if (bfp == null) { setPoseError("The outline we measured is not anatomically usable. Please retake the photo, or switch to tape measure mode."); setAnalyzing(false); return }

      drawOverlay(front.img, front.landmarks)
      setResult(buildResult({ bfp, weightKg, sex, units, source: "photo", measurement: m }))
    } catch {
      setPoseError("Something went wrong analysing that photo. You can retake it or switch to tape measure mode.")
    }
    setAnalyzing(false)
  }

  /** Draw the photo with the detected landmarks and the three measured rows. */
  const drawOverlay = (img: HTMLImageElement, lms: Landmark[]) => {
    const c = overlayRef.current
    if (!c) return
    const W = 320
    const H = Math.round((img.naturalHeight / img.naturalWidth) * W)
    c.width = W
    c.height = H
    const ctx = c.getContext("2d")
    if (!ctx) return
    ctx.drawImage(img, 0, 0, W, H)
    ctx.lineWidth = 2
    ctx.font = "600 11px system-ui, sans-serif"

    // The measured rows live in mask pixel space, so redraw them from the same
    // normalised landmark anchors and fractions the measurement used.
    ctx.strokeStyle = "rgba(18,183,106,0.95)"
    ctx.fillStyle = "rgba(18,183,106,0.95)"
    for (const i of [LM.shoulderL, LM.shoulderR, LM.hipL, LM.hipR, LM.earL, LM.earR]) {
      const p = lms[i]
      if (!p) continue
      ctx.beginPath()
      ctx.arc(p.x * W, p.y * H, 3.5, 0, Math.PI * 2)
      ctx.fill()
    }
    const shoulderY = ((lms[LM.shoulderL].y + lms[LM.shoulderR].y) / 2) * H
    const hipY = ((lms[LM.hipL].y + lms[LM.hipR].y) / 2) * H
    const earY = ((lms[LM.earL].y + lms[LM.earR].y) / 2) * H
    const torso = Math.max(1, hipY - shoulderY)
    const drawRow = (y: number, label: string) => {
      ctx.strokeStyle = "rgba(245,158,11,0.95)"
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
      ctx.fillStyle = "rgba(245,158,11,1)"
      ctx.fillText(label, 6, y - 4)
    }
    drawRow(shoulderY - 0.3 * (shoulderY - earY), "Neck")
    drawRow(hipY - 0.35 * torso, "Waist")
    drawRow(hipY + 0.08 * torso, "Hips")
  }

  const restart = () => {
    setAnswers({}); setStep(0); setNumDraft(""); setResult(null)
    setFrontUrl(null); setSideUrl(null); setPoseError(null)
  }

  if (result) return <ResultView answers={answers} result={result} overlayRef={overlayRef} onBack={goBack} onRestart={restart} />

  const progress = Math.round(((step + 1) / total) * 100)

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_10px_40px_-12px_rgba(6,110,67,0.18)]">
        {/* progress */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-7">
          <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-800">
            {answers.mode === "photo" ? <Camera className="h-4 w-4" /> : <Ruler className="h-4 w-4" />}
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-semibold text-faint">
              <span>Body fat check</span>
              <span>{step + 1} of {total}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-600 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

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
                    className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all active:scale-[0.99] ${selected ? "border-brand bg-brand-50" : "border-line bg-white hover:border-brand hover:bg-brand-50/50"}`}
                  >
                    {opt.icon && <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-800 group-hover:bg-white">{opt.icon}</span>}
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
            <form className="mt-6" onSubmit={(e) => { e.preventDefault(); submitNumber() }}>
              <div className="flex items-stretch overflow-hidden rounded-2xl border border-line focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
                <input
                  autoFocus
                  inputMode="decimal"
                  type="number"
                  step="any"
                  value={numDraft}
                  onChange={(e) => setNumDraft(e.target.value)}
                  placeholder={current.placeholder}
                  className="w-full bg-transparent px-4 py-4 text-lg font-semibold text-ink outline-none placeholder:font-normal placeholder:text-faint"
                />
                <span className="flex items-center bg-surface px-4 text-sm font-semibold text-faint">{suffixLabel(current.suffix)}</span>
              </div>
              {poseError && <p className="mt-3 text-sm font-medium text-rose-600">{poseError}</p>}
              <button type="submit" disabled={!(parseNumber(numDraft) > 0)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-4 text-base font-bold text-white transition-all hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40">
                {step === total - 1 ? "See my result" : "Continue"} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {current.kind === "photo" && (
            <div className="mt-6 space-y-4">
              <PhotoTips />
              <div className="grid gap-3 sm:grid-cols-2">
                <PhotoSlot label="Front photo" required url={frontUrl} onPick={setFrontUrl} />
                <PhotoSlot label="Side photo" hint="Optional, raises accuracy" url={sideUrl} onPick={setSideUrl} />
              </div>

              <canvas ref={overlayRef} className="hidden" />

              {poseError && (
                <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />
                  <div>
                    <p className="text-sm text-rose-800">{poseError}</p>
                    <button type="button" onClick={() => setAnswers((a) => ({ ...a, mode: "tape" }))} className="mt-1 text-sm font-bold text-rose-900 underline">
                      Switch to tape measure
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={analyze}
                disabled={!frontUrl || analyzing || !modelReady}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-4 text-base font-bold text-white transition-all hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {analyzing ? (<><Loader2 className="h-4 w-4 animate-spin" /> Analysing on your device</>)
                  : !modelReady ? (<><Loader2 className="h-4 w-4 animate-spin" /> Loading the model</>)
                  : (<>Analyse my photo <ArrowRight className="h-4 w-4" /></>)}
              </button>
              <p className="text-center text-xs text-faint">Everything runs in your browser. Your photo is never uploaded.</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-4 sm:px-7">
          <button type="button" onClick={goBack} disabled={step === 0} className="inline-flex items-center gap-1.5 text-sm font-semibold text-faint hover:text-copy disabled:opacity-0">
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

// ── photo helpers ─────────────────────────────────────────────────────────────
function PhotoTips() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="text-sm font-bold text-ink">For a good read</p>
      <ul className="mt-2 space-y-1 text-sm text-copy">
        {[
          "Whole body in frame, head to feet",
          "Tight clothing, plain background, good light",
          "Stand relaxed with arms slightly away from your body",
        ].map((t) => (
          <li key={t} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" /> {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

function PhotoSlot({ label, hint, required, url, onPick }: { label: string; hint?: string; required?: boolean; url: string | null; onPick: (u: string) => void }) {
  const ref = useRef<HTMLInputElement | null>(null)
  return (
    <div>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={`flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${url ? "border-brand bg-brand-50/40" : "border-line bg-white hover:border-brand"}`}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="h-full w-full object-cover" />
        ) : (
          <>
            <Upload className="h-6 w-6 text-faint" />
            <span className="px-2 text-center text-sm font-semibold text-ink">{label}{required && <span className="text-rose-500"> *</span>}</span>
            {hint && <span className="px-2 text-center text-xs text-faint">{hint}</span>}
          </>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onPick(URL.createObjectURL(f))
        }}
      />
    </div>
  )
}

// ── result (Aha) + Commit ─────────────────────────────────────────────────────
function ResultView({
  answers, result, overlayRef, onBack, onRestart,
}: {
  answers: Answers
  result: Result
  overlayRef: React.MutableRefObject<HTMLCanvasElement | null>
  onBack: () => void
  onRestart: () => void
}) {
  const conf = result.measurement?.confidence
  const tone = result.category.tone
  const bandCls = tone === "good" ? "bg-brand-50 text-brand-800 border-brand" : tone === "ok" ? "bg-amber-50 text-amber-800 border-amber-300" : "bg-rose-50 text-rose-700 border-rose-300"

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_10px_40px_-12px_rgba(6,110,67,0.18)]">
        {/* Aha */}
        <div className="border-b border-line bg-gradient-to-br from-brand-50 to-white px-5 py-6 sm:px-8 sm:py-8">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${bandCls}`}>
            <Target className="h-4 w-4" /> {result.category.label} · {result.category.range}
          </span>
          <h2 className="mt-4 text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
            Your body fat is about <span className="text-brand">{result.bfp.toFixed(1)}%</span>
          </h2>
          <p className="mt-2 text-sm text-copy sm:text-base">
            That is roughly <strong className="text-ink">{result.fatMass.toFixed(1)} {result.unit} of fat</strong> and{" "}
            <strong className="text-ink">{result.leanMass.toFixed(1)} {result.unit} of lean mass</strong>, of which an estimated{" "}
            <strong className="text-ink">{result.smmPct.toFixed(1)}%</strong> of your body weight is skeletal muscle.
          </p>
        </div>

        {/* photo overlay + confidence */}
        {result.source === "photo" && (
          <div className="border-b border-line px-5 py-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <canvas ref={overlayRef} className="w-full max-w-[220px] rounded-2xl border border-line" />
              <div className="flex-1">
                <p className="text-sm font-bold text-ink">What the model measured</p>
                <p className="mt-1 text-sm text-copy">
                  Neck {result.measurement!.neckCm.toFixed(1)} cm, waist {result.measurement!.waistCm.toFixed(1)} cm, hips {result.measurement!.hipCm.toFixed(1)} cm.
                </p>
                <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${conf === "high" ? "bg-brand-50 text-brand-800" : conf === "medium" ? "bg-amber-50 text-amber-800" : "bg-rose-50 text-rose-700"}`}>
                  {conf === "high" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  {conf === "high" ? "High confidence" : conf === "medium" ? "Medium confidence" : "Lower confidence"}
                </span>
                <ul className="mt-2 space-y-1">
                  {result.measurement!.confidenceNotes.map((n) => (
                    <li key={n} className="text-xs leading-relaxed text-faint">{n}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* goal gap */}
        <div className="border-b border-line px-5 py-6 sm:px-8">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Body fat" value={`${result.bfp.toFixed(1)}%`} />
            <Stat label="Fat mass" value={`${result.fatMass.toFixed(1)} ${result.unit}`} />
            <Stat label="Lean mass" value={`${result.leanMass.toFixed(1)} ${result.unit}`} />
          </div>
          <div className="mt-4 flex h-5 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full bg-gradient-to-r from-brand to-brand-600" style={{ width: `${100 - result.bfp}%` }} />
            <div className="h-full bg-rose-400" style={{ width: `${result.bfp}%` }} />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-copy">
            {result.atTarget ? (
              <>You are already at or below {result.targetBfp}%, the top of the healthy range for your sex. Hold your habits and re-check every 2 to 4 weeks.</>
            ) : (
              <>To reach a healthy <strong className="text-ink">{result.targetBfp}%</strong> while keeping every pound of lean mass, you would lose about{" "}
                <strong className="text-ink">{result.fatToLose.toFixed(1)} {result.unit}</strong> of fat, roughly{" "}
                <strong className="text-ink">{result.weeksToTarget} weeks</strong> at a sustainable pace.</>
            )}
          </p>
        </div>

        {/* Commit */}
        <div className="bg-gradient-to-br from-brand-900 to-brand-800 px-5 py-7 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-50/70">
            {answers.goal === "glp1" ? "You are on a GLP-1" : "Losing fat is the easy part"}
          </p>
          <h3 className="mt-2 text-xl font-extrabold text-white sm:text-2xl">
            {answers.goal === "glp1"
              ? "Make sure that weight is fat, not muscle"
              : "Keep your muscle while the fat comes off"}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-brand-50/90">
            {answers.goal === "glp1"
              ? "Up to 40 percent of the weight lost on Ozempic, Wegovy, Mounjaro or Zepbound can be muscle if you do not protect it. The GLP-1 Progress Tracker trends your fat and lean mass together and flags the weeks you drop weight too fast."
              : "One reading is a snapshot. The GLP-1 Progress Tracker trends your body fat and lean mass over time, builds a protein target from your numbers, and tells you when the scale is lying to you."}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link href="/product/glp1-progress-tracker" className="gold-shine relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-gold-light to-gold px-6 py-4 text-base font-bold text-gold-ink shadow-[0_10px_28px_rgba(245,158,11,0.4)] transition-transform hover:-translate-y-0.5">
              <Sparkles className="h-5 w-5" /> See the GLP-1 Progress Tracker <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10">
              <Lock className="h-4 w-4" /> Plans and pricing
            </Link>
          </div>

          <div className="mt-5 space-y-2 border-t border-white/15 pt-4">
            <p className="text-sm text-brand-50/90">
              Want to lose body fat?{" "}
              <Link href="/health/weight-loss-percentage-calculator" className="font-bold text-gold-light underline underline-offset-2">
                Check your weight loss percentage and pace
              </Link>
              , then{" "}
              <Link href="/health/lean-body-mass-calculator" className="font-bold text-gold-light underline underline-offset-2">
                set a protein target with the lean body mass calculator
              </Link>.
            </p>
            <p className="text-sm text-brand-50/90">
              Taking a GLP-1?{" "}
              <Link href="/health/glp-1-dose-calculator" className="font-bold text-gold-light underline underline-offset-2">
                Find out if you are losing fat or muscle with the GLP-1 Body Composition Tracker
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-faint hover:text-copy">
            <ArrowLeft className="h-4 w-4" /> Change an answer
          </button>
          <button type="button" onClick={onRestart} className="inline-flex items-center gap-1.5 text-sm font-semibold text-faint hover:text-copy">
            <RotateCcw className="h-4 w-4" /> Start over
          </button>
        </div>
      </div>

      <p className="mt-4 px-2 text-center text-xs leading-relaxed text-faint">
        {result.source === "photo"
          ? "AI photo mode is an educational estimate, not a medical device. It infers circumferences from a body outline and your stated height, then applies the U.S. Navy formula. A tape measure is more accurate, and a DEXA scan is the gold standard."
          : "The U.S. Navy formula is an educational estimate, accurate to within about 3 to 4 percent with consistent measurements. It is not medical advice."}
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-faint">{label}</p>
      <p className="mt-0.5 text-base font-black text-ink sm:text-lg">{value}</p>
    </div>
  )
}
