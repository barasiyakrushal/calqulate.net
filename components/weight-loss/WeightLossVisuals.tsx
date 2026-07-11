"use client"

/**
 * The visuals this page was missing.
 *
 * Search Console shows "weight loss percentage chart" ranking at position 3 with
 * no clicks, for the simple reason that the page had no chart. Same story for
 * the fat-versus-water-versus-muscle question and the weekly pace question.
 * These four figures exist to answer those queries at a glance.
 *
 *   1. MilestoneChart  -> the clinical milestone chart (0, 5, 10, 15, 20%)
 *   2. CompositionChart-> where the weight actually came from
 *   3. PaceGauge       -> is my weekly rate healthy, slow or too fast
 *   4. FormulaWalkthrough -> the maths, one step at a time
 *
 * Mobile-first: every figure reflows to a vertical, readable layout on phones
 * rather than shrinking SVG text to an illegible size. One colour family only
 * (emerald + slate). No em dashes.
 */

import { useEffect, useRef, useState } from "react"

const C = {
  deep: "#047857",   // emerald-700
  mid: "#10B981",    // emerald-500
  soft: "#6EE7B7",   // emerald-300
  pale: "#A7F3D0",   // emerald-200
  faint: "#D1FAE5",  // emerald-100
  grid: "#E2E8F0",
  muted: "#64748B",
}

const CARD =
  "rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_40px_-24px_rgba(6,110,67,0.35)] sm:p-6"

function useReducedMotion() {
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

function useInView<T extends Element>() {
  const ref = useRef<T | null>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return }
    const io = new IntersectionObserver(
      (e) => e.forEach((x) => x.isIntersecting && setSeen(true)),
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen])
  return { ref, seen }
}

// ── 1. CLINICAL MILESTONE CHART ───────────────────────────────────────────────
const MILESTONES = [
  { pct: 5, title: "Clinically meaningful", color: C.pale, onDark: false,
    benefit: "Blood pressure, blood sugar and triglycerides start to improve. This is the point doctors call a clinically significant weight loss." },
  { pct: 10, title: "Excellent", color: C.soft, onDark: false,
    benefit: "Meaningful drop in type 2 diabetes risk, better cholesterol, and improvements in sleep apnoea. This is the target most clinical guidelines aim for." },
  { pct: 15, title: "Major improvement", color: C.mid, onDark: false,
    benefit: "Large improvements in body composition and metabolic health. Type 2 diabetes remission becomes realistic for some people." },
  { pct: 20, title: "Obesity treatment target", color: C.deep, onDark: true,
    benefit: "The level newer obesity treatments aim for. Substantial change in long-term disease risk, but it needs medical support to reach and hold." },
]

export function MilestoneChart({ startWeightLb = 220 }: { startWeightLb?: number }) {
  const { ref, seen } = useInView<HTMLDivElement>()
  const reduced = useReducedMotion()

  return (
    <div ref={ref} className={CARD}>
      <h3 className="text-base font-bold text-slate-900 sm:text-xl">Weight loss percentage chart</h3>
      <p className="mt-1 text-sm text-slate-500">
        What each milestone actually does for your health. Percentages are of your <em>starting</em> weight, not your
        current weight.
      </p>

      <ol className="mt-5 space-y-3">
        {MILESTONES.map((m, i) => {
          const lb = Math.round((m.pct / 100) * startWeightLb)
          return (
            <li
              key={m.pct}
              className="overflow-hidden rounded-2xl border border-slate-200"
              style={{
                opacity: seen || reduced ? 1 : 0,
                transform: seen || reduced ? "translateY(0)" : "translateY(10px)",
                transition: reduced ? "none" : `opacity 450ms ease ${i * 110}ms, transform 550ms cubic-bezier(.22,1,.36,1) ${i * 110}ms`,
              }}
            >
              {/* the bar carries the proportion */}
              <div className="flex items-center">
                <div
                  className="flex h-14 flex-shrink-0 items-center justify-center px-3 sm:h-16 sm:px-4"
                  style={{
                    backgroundColor: m.color,
                    width: `${20 + m.pct * 2.2}%`,
                    minWidth: 78,
                    transition: reduced ? "none" : `width 900ms cubic-bezier(.22,1,.36,1) ${i * 110}ms`,
                  }}
                >
                  <span
                    className="text-lg font-extrabold tabular-nums sm:text-xl"
                    style={{ color: m.onDark ? "#ECFDF5" : "#065F46" }}
                  >
                    {m.pct}%
                  </span>
                </div>
                <div className="min-w-0 flex-1 px-3 py-2 sm:px-4">
                  <p className="text-sm font-bold text-slate-900 sm:text-base">{m.title}</p>
                  <p className="text-xs text-slate-500">
                    About {lb} lb if you started at {startWeightLb} lb
                  </p>
                </div>
              </div>
              <p className="border-t border-slate-100 bg-slate-50/70 px-3 py-2.5 text-[13px] leading-relaxed text-slate-600 sm:px-4">
                {m.benefit}
              </p>
            </li>
          )
        })}
      </ol>
      <p className="mt-3 text-xs text-slate-400">
        Health benefits follow CDC and NIH guidance. Individual results vary.
      </p>
    </div>
  )
}

// ── 2. WEIGHT COMPOSITION ─────────────────────────────────────────────────────
/**
 * Where the weight came from. Fast early loss is mostly water (glycogen holds
 * roughly 3 g of water per gram), which is why week one always looks dramatic.
 */
const COMPOSITION = [
  { key: "fast", label: "Fast loss", sub: "More than 1% a week", fat: 55, water: 30, muscle: 15 },
  { key: "steady", label: "Steady loss", sub: "About 0.5 to 1% a week", fat: 75, water: 15, muscle: 10 },
  { key: "protected", label: "Protected loss", sub: "Enough protein plus lifting", fat: 87, water: 8, muscle: 5 },
]
const PARTS = [
  { k: "fat", label: "Fat", color: C.deep, onDark: true },
  { k: "water", label: "Water", color: C.pale, onDark: false },
  { k: "muscle", label: "Muscle", color: C.mid, onDark: true },
] as const

export function CompositionChart() {
  const { ref, seen } = useInView<HTMLDivElement>()
  const reduced = useReducedMotion()
  const [active, setActive] = useState("steady")
  const row = COMPOSITION.find((r) => r.key === active)!
  const totalLb = 18

  return (
    <div ref={ref} className={CARD}>
      <h3 className="text-base font-bold text-slate-900 sm:text-xl">Did you lose fat, water, or muscle?</h3>
      <p className="mt-1 text-sm text-slate-500">
        The scale shows one number. It never says what that number was made of. How fast you lose changes the answer.
      </p>

      {/* selector: big tap targets */}
      <div className="mt-4 grid grid-cols-3 gap-2" role="tablist" aria-label="Rate of loss">
        {COMPOSITION.map((r) => (
          <button
            key={r.key}
            role="tab"
            aria-selected={active === r.key}
            onClick={() => setActive(r.key)}
            className={`min-h-[52px] rounded-2xl border-2 px-2 py-2 text-center transition-colors ${
              active === r.key
                ? "border-emerald-700 bg-emerald-50"
                : "border-slate-200 bg-white hover:border-emerald-300"
            }`}
          >
            <span className="block text-[13px] font-bold text-slate-900">{r.label}</span>
            <span className="block text-[10px] leading-tight text-slate-500">{r.sub}</span>
          </button>
        ))}
      </div>

      {/* stacked bar */}
      <div className="mt-5">
        <div className="flex h-12 w-full overflow-hidden rounded-2xl">
          {PARTS.map((p) => {
            const v = row[p.k] as number
            return (
              <div
                key={p.k}
                className="flex items-center justify-center"
                style={{
                  width: seen || reduced ? `${v}%` : "0%",
                  backgroundColor: p.color,
                  transition: reduced ? "none" : "width 800ms cubic-bezier(.22,1,.36,1)",
                }}
                title={`${p.label} ${v}%`}
              >
                {v >= 12 && (
                  <span className={`text-xs font-bold ${p.onDark ? "text-emerald-50" : "text-emerald-900"}`}>
                    {v}%
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* per-part detail, readable on a phone */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {PARTS.map((p) => {
            const v = row[p.k] as number
            return (
              <div key={p.k} className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-center">
                <span className="mx-auto mb-1 block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{p.label}</p>
                <p className="text-sm font-extrabold tabular-nums text-slate-900">
                  {((v / 100) * totalLb).toFixed(1)} lb
                </p>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Illustrative split of an <strong className="text-slate-700">18 lb</strong> loss. Losing quickly pulls far more
          from water and muscle. Enough protein and resistance training push the loss toward fat, which is the part you
          actually want gone.
        </p>
      </div>
    </div>
  )
}

// ── 3. WEEKLY PACE GAUGE ──────────────────────────────────────────────────────
const ZONES = [
  { label: "Too slow", range: "Under 0.25%", from: 0, to: 0.25, color: C.faint },
  { label: "Healthy", range: "0.5 to 1%", from: 0.25, to: 1, color: C.mid },
  { label: "Aggressive", range: "1 to 1.5%", from: 1, to: 1.5, color: C.soft },
  { label: "Too fast", range: "Over 1.5%", from: 1.5, to: 2.2, color: C.deep },
]
const MAX = 2.2

export function PaceGauge({ weeklyPct = 0.8 }: { weeklyPct?: number }) {
  const { ref, seen } = useInView<HTMLDivElement>()
  const reduced = useReducedMotion()
  const pos = Math.min(100, (weeklyPct / MAX) * 100)

  return (
    <div ref={ref} className={CARD}>
      <h3 className="text-base font-bold text-slate-900 sm:text-xl">How fast should you lose weight?</h3>
      <p className="mt-1 text-sm text-slate-500">
        The safe, sustainable range is about <strong className="text-slate-700">0.5 to 1 percent of your body weight a
        week</strong>. Faster than that and the loss starts coming from muscle.
      </p>

      <div className="mt-6">
        <div className="relative">
          <div className="flex h-5 w-full overflow-hidden rounded-full">
            {ZONES.map((z) => (
              <div
                key={z.label}
                style={{ width: `${((z.to - z.from) / MAX) * 100}%`, backgroundColor: z.color }}
                title={`${z.label}: ${z.range}`}
              />
            ))}
          </div>
          {/* marker */}
          <div
            className="absolute -top-1 flex -translate-x-1/2 flex-col items-center"
            style={{
              left: `${seen || reduced ? pos : 0}%`,
              transition: reduced ? "none" : "left 900ms cubic-bezier(.22,1,.36,1)",
            }}
          >
            <div className="h-7 w-1 rounded-full bg-slate-900 ring-2 ring-white" />
          </div>
        </div>

        {/* zone labels stack on phones */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ZONES.map((z) => (
            <div key={z.label} className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-center">
              <span className="mx-auto mb-1 block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: z.color }} />
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-700">{z.label}</p>
              <p className="text-[11px] tabular-nums text-slate-500">{z.range}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Example: at 200 lb, a healthy week is roughly 1 to 2 lb. Losing 4 lb a week at that size is over 1.5 percent,
          which is the zone where muscle loss climbs sharply.
        </p>
      </div>
    </div>
  )
}

// ── 4. FORMULA WALKTHROUGH ────────────────────────────────────────────────────
export function FormulaWalkthrough() {
  const { ref, seen } = useInView<HTMLDivElement>()
  const reduced = useReducedMotion()

  const steps = [
    { n: "1", label: "Starting weight", value: "220 lb" },
    { n: "2", label: "Current weight", value: "195 lb" },
    { n: "3", label: "Subtract", value: "25 lb lost" },
    { n: "4", label: "Divide by start", value: "25 ÷ 220" },
    { n: "5", label: "Times 100", value: "11.4%" },
  ]

  return (
    <div ref={ref} className={CARD}>
      <h3 className="text-base font-bold text-slate-900 sm:text-xl">How we calculate your progress</h3>
      <p className="mt-1 text-sm text-slate-500">
        The whole calculation, one step at a time. It works identically in kg, lb or stone, as long as both weights use
        the same unit.
      </p>

      <ol className="mt-5 space-y-2">
        {steps.map((s, i) => {
          const last = i === steps.length - 1
          return (
            <li
              key={s.n}
              className={`flex items-center gap-3 rounded-2xl border p-3 ${
                last ? "border-emerald-700 bg-emerald-50" : "border-slate-200 bg-white"
              }`}
              style={{
                opacity: seen || reduced ? 1 : 0,
                transform: seen || reduced ? "translateX(0)" : "translateX(-8px)",
                transition: reduced ? "none" : `opacity 400ms ease ${i * 130}ms, transform 500ms cubic-bezier(.22,1,.36,1) ${i * 130}ms`,
              }}
            >
              <span
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  last ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {s.n}
              </span>
              <span className="flex-1 text-sm font-medium text-slate-600">{s.label}</span>
              <span
                className={`tabular-nums text-base font-extrabold ${last ? "text-emerald-800" : "text-slate-900"}`}
              >
                {s.value}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">The formula</p>
        <p className="mt-1 font-mono text-sm font-bold text-white sm:text-base">
          ((Start <span className="text-emerald-400">-</span> Current) <span className="text-emerald-400">÷</span> Start)
          {" "}<span className="text-emerald-400">×</span> 100
        </p>
      </div>
    </div>
  )
}
