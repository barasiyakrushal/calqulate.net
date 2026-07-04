"use client"

/**
 * AI Attractiveness & Facial Harmony Test  —  Calqulate.net
 * ----------------------------------------------------------------------------
 * A single-file, drop-in React/Next.js component that performs an advanced,
 * client-side facial harmony analysis using MediaPipe's 468-point
 * FaceLandmarker. Nothing is uploaded — the photo never leaves the browser.
 *
 * What it measures (all real geometry, not "AI vibes"):
 *   • Golden Ratio score    (face length / width vs φ ≈ 1.618)
 *   • Facial Thirds         (forehead, midface, lower-face balance)
 *   • Facial Fifths         (horizontal eye-width balance)
 *   • Symmetry              (mirror-distance of paired landmarks)
 *   • Eye spacing           (interocular vs eye-width, "1-eye rule")
 *   • Jaw definition        (jaw angle sharpness)
 *   • Lip fullness          (upper+lower lip / face length)
 *   • Nose-to-lip harmony   (philtrum + nose width balance)
 *   • Cheekbone prominence  (zygomatic width vs jaw width)
 *   • Face shape            (oval / round / square / rectangle / heart / diamond / triangle)
 *
 * From those signals it computes a transparent, weighted Harmony Score (0–100)
 * — explicitly framed as "facial harmony / geometric balance", NOT a judgment
 * of a person's worth. Every sub-score is shown so the result feels honest.
 *
 * UX:
 *   • Gender step  → Upload step  → Animated multi-stage "AI scan" → Dashboard
 *   • Live scanning overlay (sweeping line, pulsing landmark grid, stage log)
 *   • Animated radial score, per-metric progress bars, recommendations
 *
 * Setup:
 *   npm i @mediapipe/tasks-vision
 *   (uses shadcn/ui: Card, Button, RadioGroup, Label, Progress + lucide-react)
 *
 * Drop this file anywhere in /components and render <AiAttractivenessTest />.
 * ----------------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from "@mediapipe/tasks-vision"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  ScanFace,
  Upload,
  RefreshCw,
  Loader2,
  Sparkles,
  Info,
  ShieldCheck,
  Scissors,
  Glasses,
  Smile,
  Eye,
  Ruler,
  Sigma,
  Activity,
  ImageIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  User2,
  UserRound,
} from "lucide-react"

/* ─────────────────────────────────────────────────────────────────────────── */
/* Types                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

type Gender = "male" | "female"
type Step = "gender" | "upload" | "analyzing" | "result"
type FaceShapeKey =
  | "oval"
  | "round"
  | "square"
  | "rectangle"
  | "heart"
  | "diamond"
  | "triangle"

interface PhotoQuality {
  ok: boolean
  brightness: number
  sharpness: number
  note: string
}

interface Metric {
  key: string
  label: string
  value: number      // raw measured ratio
  score: number      // 0–100 normalized
  ideal: string      // human description of the "ideal" target
  detail: string     // short interpretation for the user
  weight: number     // contribution to overall score
}

interface AnalysisResult {
  shape: FaceShapeKey
  confidence: number
  overall: number          // 0–100 harmony score
  beauty: number           // 0–100 attractiveness-weighted beauty score
  potential: number        // 0–100 with photo / pose corrections
  metrics: Metric[]
  quality: PhotoQuality
  ratios: {
    lengthToWidth: number
    foreheadToCheek: number
    jawToCheek: number
    goldenRatio: number
    symmetry: number
  }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Constants                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

const PHI = 1.6180339887

// MediaPipe 468-landmark indices we use repeatedly.
const IDX = {
  forehead: 10,
  chin: 152,
  leftFaceEdge: 234,
  rightFaceEdge: 454,
  leftCheek: 116,
  rightCheek: 345,
  leftJaw: 172,
  rightJaw: 397,
  jawCornerL: 150,
  jawCornerR: 379,
  noseTip: 1,
  noseLeft: 129,
  noseRight: 358,
  noseBridge: 6,
  leftEyeOuter: 33,
  leftEyeInner: 133,
  rightEyeInner: 362,
  rightEyeOuter: 263,
  upperLipTop: 13,
  lowerLipBot: 14,
  lipLeft: 61,
  lipRight: 291,
  browLeft: 70,
  browRight: 300,
  eyebrowsCenter: 9,
}

// Pairs of landmarks (left, right) used for symmetry scoring.
const SYMMETRY_PAIRS: Array<[number, number]> = [
  [33, 263],   // eye outers
  [133, 362],  // eye inners
  [61, 291],   // mouth corners
  [129, 358],  // nostrils
  [116, 345],  // cheeks
  [234, 454],  // face edges
  [172, 397],  // jaw
  [150, 379],  // jaw corners
  [70, 300],   // brows
]

/* ─────────────────────────────────────────────────────────────────────────── */
/* Math helpers                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */

type Pt = { x: number; y: number; z?: number }

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)
const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n))

/** Score from how close `value` is to `ideal`. `tol` = ratio tolerance for full score. */
const closenessScore = (value: number, ideal: number, tol: number) => {
  const diff = Math.abs(value - ideal) / ideal
  return clamp(100 * (1 - diff / tol))
}

/** Score that rewards values inside [lo, hi] and decays outside. */
const bandScore = (value: number, lo: number, hi: number, decay: number) => {
  if (value >= lo && value <= hi) return 100
  const d = value < lo ? lo - value : value - hi
  return clamp(100 - (d / decay) * 100)
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Face shape classifier (kept from original, slightly tuned)                   */
/* ─────────────────────────────────────────────────────────────────────────── */

function classifyShape(
  lengthToWidth: number,
  foreheadToCheek: number,
  jawToCheek: number,
): { shape: FaceShapeKey; confidence: number } {
  let shape: FaceShapeKey = "oval"
  let conf = 70

  if (lengthToWidth >= 1.5) {
    shape = jawToCheek > 0.92 ? "rectangle" : "oval"
    conf = 78
  } else if (lengthToWidth <= 1.15) {
    shape = jawToCheek > 0.92 ? "square" : "round"
    conf = 80
  } else {
    if (foreheadToCheek > 1.02 && jawToCheek < 0.85) {
      shape = "heart"
      conf = 82
    } else if (foreheadToCheek < 0.92 && jawToCheek < 0.9) {
      shape = "diamond"
      conf = 78
    } else if (jawToCheek > 1.0 && foreheadToCheek < 0.95) {
      shape = "triangle"
      conf = 75
    } else {
      shape = "oval"
      conf = 85
    }
  }
  return { shape, confidence: conf }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Photo-quality check                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */

function checkPhotoQuality(img: HTMLImageElement): PhotoQuality {
  const c = document.createElement("canvas")
  const W = 220
  const H = Math.round((img.naturalHeight / img.naturalWidth) * W)
  c.width = W
  c.height = H
  const ctx = c.getContext("2d")!
  ctx.drawImage(img, 0, 0, W, H)
  const data = ctx.getImageData(0, 0, W, H).data

  let sum = 0
  const gray = new Float32Array(W * H)
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const v = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    gray[p] = v
    sum += v
  }
  const brightness = sum / (W * H)

  // Edge energy (proxy for sharpness) via simple Sobel-X magnitude average.
  let edge = 0
  let count = 0
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x
      const gx =
        -gray[i - W - 1] - 2 * gray[i - 1] - gray[i + W - 1] +
        gray[i - W + 1] + 2 * gray[i + 1] + gray[i + W + 1]
      const gy =
        -gray[i - W - 1] - 2 * gray[i - W] - gray[i - W + 1] +
        gray[i + W - 1] + 2 * gray[i + W] + gray[i + W + 1]
      edge += Math.hypot(gx, gy)
      count++
    }
  }
  const sharpness = edge / count

  let note = "Good lighting and sharpness."
  let ok = true
  if (brightness < 70) {
    note = "Photo looks dark — natural light gives more accurate results."
    ok = false
  } else if (brightness > 220) {
    note = "Photo looks overexposed — softer light improves accuracy."
    ok = false
  } else if (sharpness < 12) {
    note = "Image looks soft — a sharper photo improves accuracy."
    ok = false
  }
  return { ok, brightness, sharpness, note }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Core analysis                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

function analyzeFace(
  result: FaceLandmarkerResult,
  img: HTMLImageElement,
  gender: Gender,
): AnalysisResult | null {
  const lms = result.faceLandmarks?.[0]
  if (!lms || lms.length < 400) return null

  const W = img.naturalWidth
  const H = img.naturalHeight
  const px = (i: number): Pt => ({ x: lms[i].x * W, y: lms[i].y * H })

  // Core measurements
  const faceLen = dist(px(IDX.forehead), px(IDX.chin))
  const faceWid = dist(px(IDX.leftFaceEdge), px(IDX.rightFaceEdge))
  const foreheadWid = dist(px(IDX.browLeft), px(IDX.browRight)) * 1.45
  const cheekWid = dist(px(IDX.leftCheek), px(IDX.rightCheek))
  const jawWid = dist(px(IDX.leftJaw), px(IDX.rightJaw))

  const lengthToWidth = faceLen / faceWid
  const foreheadToCheek = foreheadWid / cheekWid
  const jawToCheek = jawWid / cheekWid

  // ── Symmetry: mirror left landmarks across vertical midline, compare to right
  const midX =
    (px(IDX.forehead).x + px(IDX.chin).x +
     px(IDX.leftFaceEdge).x + px(IDX.rightFaceEdge).x) / 4
  let symErr = 0
  for (const [l, r] of SYMMETRY_PAIRS) {
    const L = px(l), R = px(r)
    const mirroredX = 2 * midX - L.x
    symErr += Math.hypot(mirroredX - R.x, L.y - R.y)
  }
  const symAvg = symErr / SYMMETRY_PAIRS.length
  const symmetryRatio = 1 - clamp((symAvg / faceWid) * 100, 0, 100) / 100  // 0..1
  const symmetryScore = clamp(symmetryRatio * 100)

  // ── Golden ratio (face length / face width target φ)
  const goldenScore = closenessScore(lengthToWidth, PHI, 0.35)

  // ── Facial thirds (forehead, midface, lower-face)
  const t1 = dist(px(IDX.forehead), px(IDX.eyebrowsCenter))
  const t2 = dist(px(IDX.eyebrowsCenter), px(IDX.noseTip))
  const t3 = dist(px(IDX.noseTip), px(IDX.chin))
  const thirdsTotal = t1 + t2 + t3
  const thirdsDev =
    Math.abs(t1 / thirdsTotal - 1 / 3) +
    Math.abs(t2 / thirdsTotal - 1 / 3) +
    Math.abs(t3 / thirdsTotal - 1 / 3)
  const thirdsScore = clamp(100 - (thirdsDev / 0.4) * 100)

  // ── Facial fifths (horizontal): outer face → outer eye → inner eye → inner eye → outer eye → outer face
  const f1 = dist(px(IDX.leftFaceEdge), px(IDX.leftEyeOuter))
  const f2 = dist(px(IDX.leftEyeOuter), px(IDX.leftEyeInner))
  const f3 = dist(px(IDX.leftEyeInner), px(IDX.rightEyeInner))
  const f4 = dist(px(IDX.rightEyeInner), px(IDX.rightEyeOuter))
  const f5 = dist(px(IDX.rightEyeOuter), px(IDX.rightFaceEdge))
  const fifths = [f1, f2, f3, f4, f5]
  const fifthsTotal = fifths.reduce((a, b) => a + b, 0)
  const fifthsDev =
    fifths.reduce((acc, v) => acc + Math.abs(v / fifthsTotal - 0.2), 0)
  const fifthsScore = clamp(100 - (fifthsDev / 0.5) * 100)

  // ── Eye spacing — interocular distance should ≈ 1 eye width
  const eyeWid = (f2 + f4) / 2
  const interocular = f3
  const eyeSpacingRatio = interocular / eyeWid
  const eyeSpacingScore = closenessScore(eyeSpacingRatio, 1.0, 0.4)

  // ── Jaw definition (angle at jaw corner, sharper = higher up to a point)
  const jL = px(IDX.jawCornerL), eL = px(IDX.leftJaw), cL = px(IDX.chin)
  const v1 = { x: eL.x - jL.x, y: eL.y - jL.y }
  const v2 = { x: cL.x - jL.x, y: cL.y - jL.y }
  const cosA =
    (v1.x * v2.x + v1.y * v2.y) /
    (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y) + 1e-6)
  const jawAngleDeg = (Math.acos(clamp(cosA, -1, 1)) * 180) / Math.PI
  // Male ideal ≈ 120°, female ideal ≈ 130°.
  const jawIdeal = gender === "male" ? 120 : 130
  const jawScore = closenessScore(jawAngleDeg, jawIdeal, 0.25)

  // ── Lip fullness
  const lipHeight = dist(px(IDX.upperLipTop), px(IDX.lowerLipBot))
  const lipRatio = lipHeight / faceLen
  // Female ideal ~0.10, male ~0.07
  const lipIdeal = gender === "female" ? 0.10 : 0.07
  const lipScore = closenessScore(lipRatio, lipIdeal, 0.5)

  // ── Nose-to-lip / nose-to-face harmony
  const noseWid = dist(px(IDX.noseLeft), px(IDX.noseRight))
  const mouthWid = dist(px(IDX.lipLeft), px(IDX.lipRight))
  const noseMouthRatio = mouthWid / noseWid  // target ~ 1.5
  const noseMouthScore = closenessScore(noseMouthRatio, 1.5, 0.35)

  // ── Cheekbone prominence (zygomatic vs jaw)
  const cheekProm = cheekWid / jawWid
  const cheekScore = bandScore(cheekProm, 1.05, 1.20, 0.25)

  // ── Face-length-to-width balance (independent of golden, broader band)
  const proportionScore = bandScore(lengthToWidth, 1.3, 1.55, 0.5)

  // Shape
  const { shape, confidence } = classifyShape(
    lengthToWidth, foreheadToCheek, jawToCheek
  )

  // Photo quality
  const quality = checkPhotoQuality(img)

  const metrics: Metric[] = [
    { key: "golden",   label: "Golden Ratio",         value: lengthToWidth,  score: goldenScore,    ideal: "≈ 1.618 (φ)", detail: describeGolden(lengthToWidth), weight: 1.3 },
    { key: "symmetry", label: "Facial Symmetry",      value: symmetryRatio,  score: symmetryScore,  ideal: "Perfect mirror",  detail: describeSymmetry(symmetryScore), weight: 1.6 },
    { key: "thirds",   label: "Facial Thirds",        value: 1 - thirdsDev,  score: thirdsScore,    ideal: "Equal thirds",    detail: describeThirds(thirdsScore), weight: 1.1 },
    { key: "fifths",   label: "Facial Fifths",        value: 1 - fifthsDev,  score: fifthsScore,    ideal: "Equal fifths",    detail: describeFifths(fifthsScore), weight: 1.0 },
    { key: "eyes",     label: "Eye Spacing",          value: eyeSpacingRatio,score: eyeSpacingScore,ideal: "1 eye-width gap", detail: describeEyes(eyeSpacingRatio), weight: 1.0 },
    { key: "jaw",      label: "Jaw Definition",       value: jawAngleDeg,    score: jawScore,       ideal: `${jawIdeal}° angle`, detail: describeJaw(jawAngleDeg, gender), weight: 1.2 },
    { key: "lips",     label: "Lip Fullness",         value: lipRatio,       score: lipScore,       ideal: `${(lipIdeal*100).toFixed(0)}% of face`, detail: describeLips(lipRatio, lipIdeal), weight: 0.9 },
    { key: "noseMouth",label: "Nose–Mouth Harmony",   value: noseMouthRatio, score: noseMouthScore, ideal: "Mouth ≈ 1.5× nose",  detail: describeNoseMouth(noseMouthRatio), weight: 0.9 },
    { key: "cheek",    label: "Cheekbone Prominence", value: cheekProm,      score: cheekScore,     ideal: "5–20% > jaw",        detail: describeCheek(cheekProm), weight: 1.0 },
    { key: "balance",  label: "Length–Width Balance", value: lengthToWidth,  score: proportionScore,ideal: "1.30–1.55",          detail: describeBalance(lengthToWidth), weight: 1.0 },
  ]

  const weightSum = metrics.reduce((a, m) => a + m.weight, 0)
  const overall = clamp(
    metrics.reduce((a, m) => a + m.score * m.weight, 0) / weightSum
  )

  // Beauty score — an attractiveness-weighted blend. Where the harmony score
  // weights every geometric metric evenly, the beauty score emphasizes the
  // features research links most strongly to perceived attractiveness
  // (symmetry, golden proportion, eyes, lips & cheekbones) with mild
  // sexual-dimorphism weighting (jaw for male, lips/cheeks for female).
  const beauty = computeBeautyScore(metrics, gender)

  // Potential = bump weakest metrics if photo quality were perfect
  const qualityBonus = quality.ok ? 2 : 6
  const potential = clamp(overall + qualityBonus + (100 - overall) * 0.08)

  return {
    shape,
    confidence,
    overall: Math.round(overall),
    beauty: Math.round(beauty),
    potential: Math.round(potential),
    metrics,
    quality,
    ratios: {
      lengthToWidth,
      foreheadToCheek,
      jawToCheek,
      goldenRatio: lengthToWidth / PHI,
      symmetry: symmetryRatio,
    },
  }
}

/* Attractiveness-weighted beauty score (0–100).
   Distinct from the harmony score: it over-weights the features most tied to
   perceived attractiveness and applies a gentle curve so the scale spreads
   realistically across faces. */
function computeBeautyScore(metrics: Metric[], gender: Gender): number {
  const byKey: Record<string, number> = {}
  for (const m of metrics) byKey[m.key] = m.score

  const weights: Record<string, number> = {
    symmetry:  2.2,                          // strongest attractiveness driver
    golden:    1.6,
    thirds:    1.3,
    fifths:    1.1,
    eyes:      1.4,
    lips:      gender === "female" ? 1.5 : 1.0,
    noseMouth: 1.0,
    cheek:     gender === "female" ? 1.4 : 1.1,
    jaw:       gender === "male" ? 1.6 : 1.1,
    balance:   1.0,
  }

  let num = 0
  let den = 0
  for (const key in weights) {
    if (byKey[key] != null) {
      num += byKey[key] * weights[key]
      den += weights[key]
    }
  }
  const raw = den ? num / den : 0
  // Gentle S-curve around the midpoint so averages feel natural and the
  // distribution spreads a little wider than the flat weighted mean.
  const curved = 50 + (raw - 50) * 1.08
  return clamp(curved)
}

/* Plain-English describers (used in the dashboard) */
function describeGolden(v: number) {
  const d = v - PHI
  if (Math.abs(d) < 0.06) return "Your face length-to-width ratio is remarkably close to the golden ratio (φ)."
  return d > 0
    ? "Your face is slightly longer than the classical φ ratio — a lean, elongated look."
    : "Your face is slightly wider than the classical φ ratio — a softer, rounder look."
}
function describeSymmetry(s: number) {
  if (s > 85) return "Excellent left/right symmetry — paired features mirror cleanly."
  if (s > 70) return "Strong symmetry with only minor natural asymmetries."
  return "Noticeable asymmetry — partly real, partly photo angle/lighting."
}
function describeThirds(s: number) {
  if (s > 80) return "Forehead, midface and lower-face are well balanced into equal thirds."
  if (s > 60) return "One of the three vertical sections is slightly larger than the others."
  return "Vertical thirds are uneven — usually a longer forehead or lower-face."
}
function describeFifths(s: number) {
  if (s > 80) return "Horizontal fifths balance is strong — classic proportional spacing."
  return "Eye placement or face-edge spacing deviates from equal fifths."
}
function describeEyes(r: number) {
  if (Math.abs(r - 1) < 0.1) return "Interocular distance ≈ one eye width — the classical ideal."
  return r > 1 ? "Eyes are spaced slightly wider than one eye-width apart." : "Eyes sit slightly closer together than one eye-width."
}
function describeJaw(a: number, g: Gender) {
  const ideal = g === "male" ? 120 : 130
  if (Math.abs(a - ideal) < 6) return "Jaw angle is in the ideal definition range."
  return a < ideal ? "Sharper, more angular jaw than average." : "Softer, more rounded jaw line."
}
function describeLips(r: number, ideal: number) {
  if (Math.abs(r - ideal) < 0.015) return "Lip volume is in the harmonious range for face length."
  return r > ideal ? "Fuller-than-average lips relative to face length." : "Thinner-than-average lips relative to face length."
}
function describeNoseMouth(r: number) {
  if (Math.abs(r - 1.5) < 0.15) return "Mouth-to-nose width is in the classical 1.5× harmony."
  return r > 1.5 ? "Mouth is wider than the classical nose-width ratio." : "Mouth is narrower than the classical nose-width ratio."
}
function describeCheek(r: number) {
  if (r >= 1.05 && r <= 1.20) return "Cheekbones project beautifully past the jawline."
  return r > 1.20 ? "Strong cheekbone projection — sculpted upper-face." : "Soft cheek-to-jaw transition — less angular contour."
}
function describeBalance(r: number) {
  if (r >= 1.3 && r <= 1.55) return "Length-to-width sits in the most photogenic range."
  return r > 1.55 ? "Face reads as elongated in photos." : "Face reads as wide/round in photos."
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Recommendations                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

const SHAPE_TIPS: Record<FaceShapeKey, {
  desc: string
  hair: string[]
  glasses: string[]
  styling: string[]
}> = {
  oval:      { desc: "The most versatile shape — proportions are naturally balanced.", hair: ["Almost any style works", "Soft layers", "Side-swept fringe"], glasses: ["Square, geometric, aviator"], styling: ["Avoid covering the forehead entirely"] },
  round:     { desc: "Soft curves with similar length and width.", hair: ["High volume on top", "Long layers", "Side parts"], glasses: ["Rectangular, angular frames"], styling: ["Contour cheekbones to add structure"] },
  square:    { desc: "Strong jaw with forehead and jaw of similar width.", hair: ["Soft waves", "Side-swept layers", "Texture at the crown"], glasses: ["Round / oval frames"], styling: ["Soften jaw with rounded styling lines"] },
  rectangle: { desc: "Longer than wide with a strong jaw.", hair: ["Width at the sides", "Fringe to shorten face", "Curls / waves"], glasses: ["Round, deep frames"], styling: ["Avoid very long straight styles"] },
  heart:     { desc: "Wider forehead tapering to a narrow chin.", hair: ["Chin-length layers", "Side-swept fringe"], glasses: ["Bottom-heavy, light-rimmed frames"], styling: ["Add volume around the jaw"] },
  diamond:   { desc: "Narrow forehead and jaw with wide cheekbones.", hair: ["Side-swept fringe", "Chin-length styles"], glasses: ["Cat-eye, oval, rimless"], styling: ["Highlight eyes & brows"] },
  triangle:  { desc: "Wider jaw narrowing toward the forehead.", hair: ["Volume at the crown", "Layers above the jaw"], glasses: ["Top-heavy, browline frames"], styling: ["Draw attention upward"] },
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"

const ANALYSIS_STAGES = [
  "Fetching your photo…",
  "Detecting your face…",
  "Mapping 468 facial landmarks…",
  "Measuring golden-ratio proportions…",
  "Scoring your facial symmetry…",
  "Analyzing thirds, fifths & features…",
  "Evaluating jaw, eyes & lips…",
  "Determining your beauty score…",
]

export default function AiAttractivenessTest() {
  const [step, setStep] = useState<Step>("gender")
  const [gender, setGender] = useState<Gender>("female")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [stage, setStage] = useState(0)
  const [progress, setProgress] = useState(0)
  const [animOverall, setAnimOverall] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null!)
  const imgRef = useRef<HTMLImageElement>(null!)
  const overlayRef = useRef<HTMLCanvasElement>(null!)
  const landmarkerRef = useRef<FaceLandmarker>(null!)

  /* Load landmarker once */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const fileset = await FilesetResolver.forVisionTasks(WASM_URL)
        const lm = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
          runningMode: "IMAGE",
          numFaces: 1,
        })
        if (!cancelled) landmarkerRef.current = lm
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      cancelled = true
      landmarkerRef.current?.close?.()
    }
  }, [])

  /* Animated overall score on result */
  useEffect(() => {
    if (step !== "result" || !result) return
    setAnimOverall(0)
    const start = performance.now()
    const dur = 1400
    let raf = 0
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - k, 3)
      setAnimOverall(result.overall * eased)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [step, result])

  /* File handler */
  const onFile = useCallback(async (file: File) => {
    setError(null)
    setResult(null)
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setStep("analyzing")
    setStage(0)
    setProgress(0)

    // Kick off staged UI animation in parallel with real work
    const stageTimer = setInterval(() => {
      setStage((s) => Math.min(s + 1, ANALYSIS_STAGES.length - 1))
    }, 550)
    const progTimer = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 6 + 2, 92))
    }, 180)

    try {
      // Wait until landmarker is ready (max 10s)
      const t0 = Date.now()
      while (!landmarkerRef.current && Date.now() - t0 < 10000) {
        await new Promise((r) => setTimeout(r, 100))
      }
      if (!landmarkerRef.current) throw new Error("Model failed to load")

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = url
      await new Promise<void>((res, rej) => {
        img.onload = () => res()
        img.onerror = () => rej(new Error("Could not read image"))
      })
      imgRef.current = img

      const det = landmarkerRef.current.detect(img)
      if (!det.faceLandmarks?.length) {
        throw new Error("No face detected. Try a clearer, front-facing photo.")
      }
      const analysis = analyzeFace(det, img, gender)
      if (!analysis) throw new Error("Could not analyze face geometry.")

      // Let the staged animation finish for credibility
      const minWait = 2400 - (Date.now() - t0)
      if (minWait > 0) await new Promise((r) => setTimeout(r, minWait))

      setProgress(100)
      setStage(ANALYSIS_STAGES.length - 1)
      setResult(analysis)
      setStep("result")

      // Draw overlay after result mount
      requestAnimationFrame(() => drawOverlay(det, img))
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong")
      setStep("upload")
    } finally {
      clearInterval(stageTimer)
      clearInterval(progTimer)
    }
  }, [gender])

  const drawOverlay = (det: FaceLandmarkerResult, img: HTMLImageElement) => {
    const c = overlayRef.current
    if (!c) return
    const W = 520
    const H = Math.round((img.naturalHeight / img.naturalWidth) * W)
    c.width = W
    c.height = H
    const ctx = c.getContext("2d")!
    ctx.drawImage(img, 0, 0, W, H)
    const lms = det.faceLandmarks[0]
    ctx.fillStyle = "rgba(168, 85, 247, 0.85)"
    for (const p of lms) {
      ctx.beginPath()
      ctx.arc(p.x * W, p.y * H, 1.1, 0, Math.PI * 2)
      ctx.fill()
    }
    // Key connections
    ctx.strokeStyle = "rgba(236, 72, 153, 0.9)"
    ctx.lineWidth = 1.4
    const line = (a: number, b: number) => {
      ctx.beginPath()
      ctx.moveTo(lms[a].x * W, lms[a].y * H)
      ctx.lineTo(lms[b].x * W, lms[b].y * H)
      ctx.stroke()
    }
    line(IDX.forehead, IDX.chin)
    line(IDX.leftFaceEdge, IDX.rightFaceEdge)
    line(IDX.leftCheek, IDX.rightCheek)
    line(IDX.leftJaw, IDX.rightJaw)
  }

  const reset = () => {
    setStep("gender")
    setResult(null)
    setImageUrl(null)
    setError(null)
    setStage(0)
    setProgress(0)
  }

  /* ──────────────────────────── Render ──────────────────────────── */

  return (
    <div className="w-full">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-purple-50/40 dark:from-zinc-950 dark:via-zinc-950 dark:to-purple-950/20 overflow-hidden">
        <CardHeader className="relative">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-md">
              <ScanFace className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                AI Facial Harmony Test
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                100% private — your photo never leaves your browser.
              </CardDescription>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-5 flex items-center gap-2 text-xs font-medium">
            {(["gender","upload","analyzing","result"] as Step[]).map((s, i) => {
              const active = step === s
              const done =
                ["gender","upload","analyzing","result"].indexOf(step) > i
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`h-7 px-3 grid place-items-center rounded-full border transition
                    ${active ? "bg-purple-600 text-white border-purple-600" :
                      done   ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300"
                             : "bg-muted/40 text-muted-foreground border-border"}`}>
                    {i+1}. {s === "gender" ? "Profile" : s === "upload" ? "Photo" : s === "analyzing" ? "Scan" : "Result"}
                  </div>
                  {i < 3 && <div className="h-px w-4 bg-border" />}
                </div>
              )
            })}
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {step === "gender" && (
            <GenderStep
              gender={gender}
              onChange={setGender}
              onNext={() => setStep("upload")}
            />
          )}

          {step === "upload" && (
            <UploadStep
              error={error}
              onBack={() => setStep("gender")}
              onPick={() => fileInputRef.current?.click()}
              fileInputRef={fileInputRef}
              onFile={onFile}
            />
          )}

          {step === "analyzing" && (
            <AnalyzingStep
              imageUrl={imageUrl}
              stage={stage}
              progress={progress}
            />
          )}

          {step === "result" && result && (
            <ResultStep
              result={result}
              overlayRef={overlayRef}
              gender={gender}
              animOverall={animOverall}
              onReset={reset}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Sub-views                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

function GenderStep({
  gender, onChange, onNext,
}: { gender: Gender; onChange: (g: Gender) => void; onNext: () => void }) {
  return (
    <div className="space-y-6 py-3">
      <p className="text-sm text-muted-foreground">
        Choose your profile so we can calibrate the ideal ranges accurately.
      </p>
      <RadioGroup
        value={gender}
        onValueChange={(v) => onChange(v as Gender)}
        className="grid grid-cols-2 gap-3"
      >
        {([
          { v: "female", label: "Female", Icon: UserRound },
          { v: "male",   label: "Male",   Icon: User2 },
        ] as const).map(({ v, label, Icon }) => (
          <Label
            key={v}
            htmlFor={`g-${v}`}
            className={`group cursor-pointer rounded-xl border-2 p-5 flex flex-col items-center gap-3 transition
              ${gender === v
                ? "border-purple-500 bg-purple-50/60 dark:bg-purple-950/20 shadow-sm"
                : "border-border hover:border-purple-300"}`}
          >
            <RadioGroupItem id={`g-${v}`} value={v} className="sr-only" />
            <div className={`h-12 w-12 grid place-items-center rounded-full
              ${gender === v ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground"}`}>
              <Icon className="h-6 w-6" />
            </div>
            <span className="font-semibold">{label}</span>
          </Label>
        ))}
      </RadioGroup>
      <Button onClick={onNext} className="w-full h-11 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white hover:opacity-95">
        Continue <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  )
}

function UploadStep({
  error, onBack, onPick, fileInputRef, onFile,
}: {
  error: string | null
  onBack: () => void
  onPick: () => void
  fileInputRef: React.RefObject<HTMLInputElement>
  onFile: (f: File) => void
}) {
  const [drag, setDrag] = useState(false)
  return (
    <div className="space-y-4 py-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault(); setDrag(false)
          const f = e.dataTransfer.files?.[0]
          if (f) onFile(f)
        }}
        onClick={onPick}
        className={`group cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition
          ${drag ? "border-purple-500 bg-purple-50/60 dark:bg-purple-950/30"
                 : "border-border hover:border-purple-400 hover:bg-purple-50/30 dark:hover:bg-purple-950/20"}`}
      >
        <div className="mx-auto h-14 w-14 grid place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white shadow-md group-hover:scale-105 transition">
          <Upload className="h-7 w-7" />
        </div>
        <p className="mt-4 font-semibold">Drop a clear, front-facing photo</p>
        <p className="text-xs text-muted-foreground mt-1">JPG / PNG · best results: neutral expression, even lighting, hair off forehead</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]; if (f) onFile(f)
          }}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 p-3 text-sm text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <Tip icon={<ImageIcon className="h-3.5 w-3.5" />} text="High resolution" />
        <Tip icon={<Eye className="h-3.5 w-3.5" />} text="Face camera" />
        <Tip icon={<Sparkles className="h-3.5 w-3.5" />} text="Soft, even light" />
      </div>

      <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
    </div>
  )
}

function Tip({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2 py-1.5">
      {icon}<span>{text}</span>
    </div>
  )
}

function AnalyzingStep({
  imageUrl, stage, progress,
}: { imageUrl: string | null; stage: number; progress: number }) {
  return (
    <div className="py-2">
      <div className="relative mx-auto w-full max-w-[280px] sm:max-w-md overflow-hidden rounded-2xl border bg-black/5 dark:bg-white/5">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Analyzing your photo" className="block w-full aspect-[3/4] object-cover sm:aspect-auto sm:object-contain" />
        )}

        {/* Live stage caption pinned to the photo */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-3 pt-8">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white">
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-fuchsia-300" />
            <span className="truncate">{ANALYSIS_STAGES[stage]}</span>
          </div>
        </div>

        {/* Sweep line */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-0 right-0 h-1/3 -top-1/3 animate-[sweep_2.4s_linear_infinite] bg-gradient-to-b from-transparent via-fuchsia-400/40 to-transparent" />
          {/* Pulsing landmark grid */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-70">
            {Array.from({ length: 60 }).map((_, i) => {
              const cx = 12 + (i * 7) % 76
              const cy = 12 + Math.floor((i * 7) / 76) * 8 + (i % 3) * 2
              return (
                <circle
                  key={i} cx={cx} cy={cy} r={0.6}
                  fill="rgba(217,70,239,0.95)"
                  style={{ animation: `pulseDot 1.6s ${i * 30}ms ease-in-out infinite` }}
                />
              )
            })}
          </svg>
          {/* Corner brackets */}
          {[
            "top-2 left-2 border-l-2 border-t-2",
            "top-2 right-2 border-r-2 border-t-2",
            "bottom-2 left-2 border-l-2 border-b-2",
            "bottom-2 right-2 border-r-2 border-b-2",
          ].map((c, i) => (
            <div key={i} className={`absolute h-6 w-6 ${c} border-fuchsia-400 rounded-sm`} />
          ))}
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-md space-y-3">
        <Progress value={progress} className="h-2" />
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
          <span className="font-medium">{ANALYSIS_STAGES[stage]}</span>
          <span className="ml-auto tabular-nums text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <ul className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
          {ANALYSIS_STAGES.slice(0, stage + 1).map((s, i) => (
            <li key={i} className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {s}
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        @keyframes sweep { 0% { transform: translateY(0); } 100% { transform: translateY(420%); } }
        @keyframes pulseDot { 0%,100% { opacity:.2; r:.5 } 50% { opacity:1; r:1 } }
      `}</style>
    </div>
  )
}

function ResultStep({
  result, overlayRef, gender, animOverall, onReset,
}: {
  result: AnalysisResult
  overlayRef: React.RefObject<HTMLCanvasElement>
  gender: Gender
  animOverall: number
  onReset: () => void
}) {
  const tips = SHAPE_TIPS[result.shape]
  const grade = useMemo(() => gradeFor(result.overall), [result.overall])
  const beautyGrade = useMemo(() => beautyGradeFor(result.beauty), [result.beauty])

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="grid gap-6 md:grid-cols-[260px_1fr] items-start">
        <div className="relative">
          <canvas
            ref={overlayRef}
            className="block w-full rounded-2xl border shadow-sm"
          />
          <div className="absolute -bottom-3 -right-3 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white text-xs font-semibold px-3 py-1 shadow-lg">
            468-pt scan
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <RadialScore value={animOverall} label="Harmony Score" sublabel={grade.label} accent={grade.color} />
          <RadialScore value={result.beauty} label="Beauty Score" sublabel={beautyGrade.label} accent={beautyGrade.color} outOf={10} />
          <RadialScore value={result.potential} label="Potential Score" sublabel="with optimal photo & styling" accent="from-emerald-400 to-emerald-600" />

          <StatCard
            icon={<Sigma className="h-4 w-4" />}
            label="Face Shape"
            value={cap(result.shape)}
            sub={`${result.confidence}% confidence`}
          />
          <StatCard
            icon={<Ruler className="h-4 w-4" />}
            label="Golden Ratio (φ)"
            value={result.ratios.lengthToWidth.toFixed(3)}
            sub={`target ${PHI.toFixed(3)}`}
          />
        </div>
      </div>

      {/* Photo quality banner */}
      <div className={`rounded-xl border p-3 text-sm flex items-start gap-2
        ${result.quality.ok
          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/60 text-emerald-800 dark:text-emerald-200"
          : "bg-amber-50 dark:bg-amber-950/20 border-amber-200/60 text-amber-800 dark:text-amber-200"}`}>
        {result.quality.ok
          ? <CheckCircle2 className="h-4 w-4 mt-0.5" />
          : <AlertTriangle className="h-4 w-4 mt-0.5" />}
        <div>
          <div className="font-semibold">Photo quality: {result.quality.ok ? "Good" : "Could be better"}</div>
          <div className="opacity-80">{result.quality.note}</div>
        </div>
      </div>

      {/* METRICS GRID */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-purple-600" /> Detailed Metrics
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {result.metrics.map((m) => (
            <MetricRow key={m.key} metric={m} />
          ))}
        </div>
      </div>

      {/* USP #1 — FEATURE-BY-FEATURE BREAKDOWN ─────────────────────────── */}
      <FeatureBreakdownCard result={result} />

      {/* USP #2 — WHAT THIS CAN & CAN'T MEASURE ────────────────────────── */}
      <MeasureScopeCard />

      {/* SHAPE + RECOMMENDATIONS */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-purple-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sigma className="h-4 w-4 text-purple-600" />
              Your Face Shape: {cap(result.shape)}
            </CardTitle>
            <CardDescription>{tips.desc}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <RecBlock icon={<Scissors className="h-4 w-4" />} title="Hair" items={tips.hair} />
            <RecBlock icon={<Glasses className="h-4 w-4" />} title="Glasses" items={tips.glasses} />
            <RecBlock icon={<Smile className="h-4 w-4" />}   title={gender === "female" ? "Styling & makeup framing" : "Styling & grooming"} items={tips.styling} />
          </CardContent>
        </Card>

        <Card className="border-fuchsia-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-fuchsia-600" />
              Improve Your Score
            </CardTitle>
            <CardDescription>Small changes with the biggest impact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {improvementTips(result).map((t, i) => (
              <div key={i} className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 max-w-[60%]">
          <Info className="h-3.5 w-3.5" />
          This test measures geometric harmony, not personal worth. Beauty is multi-dimensional, cultural, and personal.
        </p>
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Test another photo
        </Button>
      </div>
    </div>
  )
}

/* ── Small UI pieces ────────────────────────────────────────────────────────── */

function RadialScore({
  value, label, sublabel, accent, outOf = 100,
}: { value: number; label: string; sublabel: string; accent: string; outOf?: number }) {
  const v = clamp(value)
  // Arc geometry always runs on the 0–100 scale; `outOf` only rescales the
  // displayed number (e.g. an 84/100 beauty score reads as 8.4 / 10).
  const display = outOf === 100 ? Math.round(v) : (v / 100 * outOf).toFixed(1)
  const r = 42
  const C = 2 * Math.PI * r
  const dash = (v / 100) * C
  return (
    <div className="rounded-2xl border bg-card p-4 flex items-center gap-4">
      <div className="relative h-[110px] w-[110px] shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" className="stroke-muted" />
          <defs>
            <linearGradient id={`g-${label}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor="rgb(217 70 239)" />
              <stop offset="100%" stopColor="rgb(124 58 237)" />
            </linearGradient>
          </defs>
          <circle
            cx="50" cy="50" r={r} fill="none" strokeWidth="9" strokeLinecap="round"
            stroke={`url(#g-${label})`}
            strokeDasharray={`${dash} ${C}`}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className={`text-2xl font-extrabold bg-gradient-to-br ${accent ?? "from-fuchsia-500 to-purple-600"} bg-clip-text text-transparent tabular-nums`}>
              {display}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">/ {outOf}</div>
          </div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{sublabel}</div>
      </div>
    </div>
  )
}

function StatCard({
  icon, label, value, sub,
}: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}<span>{label}</span>
      </div>
      <div className="mt-1 text-xl font-bold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  )
}

function MetricRow({ metric }: { metric: Metric }) {
  const color =
    metric.score >= 80 ? "from-emerald-400 to-emerald-600"
    : metric.score >= 60 ? "from-amber-400 to-orange-500"
    : "from-rose-400 to-rose-600"
  return (
    <div className="rounded-xl border p-3 bg-card">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{metric.label}</div>
        <div className="text-sm tabular-nums font-bold">{Math.round(metric.score)}</div>
      </div>
      <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${metric.score}%` }}
        />
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground">
        Ideal: <span className="font-medium text-foreground/80">{metric.ideal}</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{metric.detail}</div>
    </div>
  )
}

function RecBlock({
  icon, title, items,
}: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div>
      <div className="flex items-center gap-2 font-semibold text-sm">{icon}{title}</div>
      <ul className="mt-1 list-disc pl-8 text-muted-foreground space-y-0.5">
        {items.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  )
}

/* ── USP #1: Feature-by-feature breakdown ────────────────────────────────────
   Reuses the sub-scores the calculator already derives and presents each one as
   a labelled component of the overall harmony score — with its own bar and its
   weighted contribution — so feedback feels specific and fair rather than a
   single opaque number. */
function FeatureBreakdownCard({ result }: { result: AnalysisResult }) {
  const weightSum = result.metrics.reduce((a, m) => a + m.weight, 0)
  // Each metric's share of the overall score (its weighted points out of 100).
  const rows = result.metrics
    .map((m) => ({
      key: m.key,
      label: m.label,
      score: Math.round(m.score),
      contribution: (m.score * m.weight) / weightSum, // points toward overall
      sharePct: Math.round(((m.weight) / weightSum) * 100), // weight share
    }))
    .sort((a, b) => b.score - a.score)

  return (
    <Card className="border shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-700" />
          Feature-by-Feature Breakdown
        </CardTitle>
        <CardDescription className="text-sm">
          Your overall harmony score of{" "}
          <span className="font-semibold text-emerald-700">{result.overall}</span> isn&apos;t one
          guess — it&apos;s built from these {result.metrics.length} measured components. Stronger
          features sit at the top so you can see exactly what lifts or lowers the result.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((r) => {
          const color =
            r.score >= 80 ? "from-emerald-400 to-emerald-600"
            : r.score >= 60 ? "from-amber-400 to-orange-500"
            : "from-rose-400 to-rose-600"
          return (
            <div key={r.key}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-200">{r.label}</span>
                <span className="tabular-nums font-bold text-slate-800 dark:text-slate-100">
                  {r.score}
                  <span className="ml-1 text-[11px] font-normal text-muted-foreground">
                    · {r.sharePct}% of score
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
                  style={{ width: `${r.score}%` }}
                />
              </div>
            </div>
          )
        })}
        <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
          Each component is weighted by how strongly research links it to overall facial harmony,
          then blended into the single score above — a transparent breakdown, never a black box.
        </p>
      </CardContent>
    </Card>
  )
}

/* ── USP #2: What this can & can't measure ───────────────────────────────────
   An honest trust-building disclaimer: it measures geometric ratios & symmetry,
   not real-world attractiveness, worth, or health. */
function MeasureScopeCard() {
  const can = [
    "Geometric ratios (golden ratio, facial thirds & fifths)",
    "Left/right symmetry of paired landmarks",
    "Proportions like eye spacing, jaw angle and lip balance",
    "Your face shape and photogenic styling tips",
  ]
  const cannot = [
    "Whether you are attractive — beauty is subjective & cultural",
    "Your worth, confidence, charisma or personality",
    "Anything about your health or wellbeing",
    "How a real person will actually perceive you",
  ]
  return (
    <Card className="border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2 text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          What this can — and can&apos;t — measure
        </CardTitle>
        <CardDescription className="text-sm">
          We&apos;d rather be honest than flatter you. Here&apos;s exactly what these numbers mean.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid sm:grid-cols-2 gap-5 text-sm">
        <div>
          <div className="flex items-center gap-1.5 font-semibold text-emerald-700 mb-2">
            <CheckCircle2 className="h-4 w-4" /> What it measures
          </div>
          <ul className="space-y-1.5">
            {can.map((t, i) => (
              <li key={i} className="flex gap-2 text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center gap-1.5 font-semibold text-rose-600 mb-2">
            <AlertTriangle className="h-4 w-4" /> What it can&apos;t
          </div>
          <ul className="space-y-1.5">
            {cannot.map((t, i) => (
              <li key={i} className="flex gap-2 text-slate-600 dark:text-slate-300">
                <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="sm:col-span-2 text-[11px] text-muted-foreground leading-relaxed border-t border-emerald-200/60 pt-3">
          This is a measurement of facial geometry for entertainment and styling guidance only. It
          is not a verdict on real-world attractiveness, your value as a person, or your health.
          Beauty is multi-dimensional, deeply personal and varies across cultures.
        </p>
      </CardContent>
    </Card>
  )
}

/* ── helpers ───────────────────────────────────────────────────────────────── */

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }

function gradeFor(v: number) {
  if (v >= 90) return { label: "Exceptional harmony", color: "from-emerald-400 to-emerald-600" }
  if (v >= 80) return { label: "Highly harmonious",   color: "from-emerald-400 to-teal-500" }
  if (v >= 70) return { label: "Above average",       color: "from-sky-400 to-indigo-500" }
  if (v >= 60) return { label: "Balanced",            color: "from-fuchsia-500 to-purple-600" }
  if (v >= 50) return { label: "Average",             color: "from-amber-400 to-orange-500" }
  return       { label: "Distinctive",                color: "from-rose-400 to-rose-600" }
}

function beautyGradeFor(v: number) {
  if (v >= 90) return { label: "Strikingly beautiful",   color: "from-rose-400 to-fuchsia-600" }
  if (v >= 80) return { label: "Very attractive",        color: "from-fuchsia-400 to-purple-600" }
  if (v >= 70) return { label: "Attractive",             color: "from-pink-400 to-rose-500" }
  if (v >= 60) return { label: "Pleasant & balanced",    color: "from-violet-400 to-purple-500" }
  if (v >= 50) return { label: "Naturally average",      color: "from-amber-400 to-orange-500" }
  return       { label: "Uniquely distinctive",          color: "from-sky-400 to-indigo-500" }
}

function improvementTips(r: AnalysisResult): string[] {
  const tips: string[] = []
  const weakest = [...r.metrics].sort((a, b) => a.score - b.score).slice(0, 3)
  for (const m of weakest) {
    switch (m.key) {
      case "symmetry":  tips.push("Slightly tilt your head and shoot straight-on; cameras exaggerate asymmetry from angles."); break
      case "thirds":    tips.push("Forehead-balancing hairstyles or brow shaping can visually re-balance facial thirds."); break
      case "fifths":    tips.push("Brow framing and side-styled hair can correct the perception of facial fifths."); break
      case "eyes":      tips.push("Eye makeup, brow shaping, or frames can visually adjust perceived eye spacing."); break
      case "jaw":       tips.push("Posture, head tilt and lighting from above sculpt jaw definition in photos."); break
      case "lips":      tips.push("Lip liner / subtle gloss adjusts perceived lip fullness without overdoing it."); break
      case "noseMouth": tips.push("Contouring along the nose bridge harmonizes nose-to-mouth ratio."); break
      case "cheek":     tips.push("Cheek contouring or highlight on the cheekbone enhances upper-face structure."); break
      case "golden":    tips.push("Hairstyles that lengthen or shorten the visual face length nudge you toward φ."); break
      case "balance":   tips.push("Volume on top vs sides reshapes perceived length-to-width balance."); break
    }
  }
  if (!r.quality.ok) tips.unshift("Retake the photo in soft daylight, front-facing, with a sharp focus — the score will be more accurate.")
  tips.push("Sleep, hydration and posture have a real, measurable effect on facial structure photos.")
  return tips
}