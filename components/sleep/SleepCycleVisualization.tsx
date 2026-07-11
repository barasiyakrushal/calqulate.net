"use client"

/**
 * Sleep Cycle Visualization: three connected figures that each answer a question
 * without the user reading a paragraph.
 *
 *   1. One 90-minute cycle, stage by stage.
 *   2. The full night: five cycles, deep sleep shrinking as REM expands.
 *   3. Sleep architecture: a smooth hypnogram with the ideal wake-up points.
 *
 * Mobile strategy (this matters more than it looks):
 *   - An SVG that scales to a 380px phone shrinks its own text to about 5px, so
 *     figure 1 becomes a VERTICAL timeline on phones instead of a squashed bar,
 *     with every stage description visible without hovering.
 *   - Figures 2 and 3 keep their true geometry and scroll horizontally, which
 *     keeps the labels legible instead of illegible.
 *   - All stage descriptions stay in the DOM (visible on mobile, screen-reader
 *     list on desktop) so search engines and AI Overviews can extract them.
 *
 * Timing matches the calculator on this page: in bed 10:00 PM, asleep 10:15 PM
 * (15 min latency), five 90-minute cycles, awake 5:45 AM.
 */

import { useEffect, useMemo, useRef, useState } from "react"

// ── one colour system ─────────────────────────────────────────────────────────
const C = {
  stage1: "#D1FAE5", // emerald-100
  light: "#A7F3D0",  // emerald-200
  rem: "#34D399",    // emerald-400
  deep: "#047857",   // emerald-700
  line: "#059669",   // emerald-600
  grid: "#E2E8F0",   // slate-200
  ink: "#0F172A",    // slate-900
  muted: "#64748B",  // slate-500
}

const CARD = "rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_40px_-24px_rgba(6,110,67,0.35)] sm:p-7"

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

/** False during SSR and first paint, so hydration always matches. */
function useIsPhone() {
  const [phone, setPhone] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    setPhone(mq.matches)
    const on = () => setPhone(mq.matches)
    mq.addEventListener?.("change", on)
    return () => mq.removeEventListener?.("change", on)
  }, [])
  return phone
}

function useInView<T extends Element>() {
  const ref = useRef<T | null>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setSeen(true)),
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [seen])
  return { ref, seen }
}

/** Horizontal scroller that keeps a chart legible on phones. */
function ScrollChart({ minWidth, children }: { minWidth: number; children: React.ReactNode }) {
  return (
    <>
      <div className="-mx-1 overflow-x-auto pb-1">
        <div style={{ minWidth }} className="px-1">{children}</div>
      </div>
      <p className="mt-1 text-center text-[11px] font-medium text-slate-400 sm:hidden">
        Swipe the chart sideways to explore
      </p>
    </>
  )
}

// ── SECTION 1 data ────────────────────────────────────────────────────────────
interface Stage {
  key: string; name: string; mins: number; icon: string
  color: string; onDark: boolean; what: string
}
const STAGES: Stage[] = [
  { key: "s1", name: "Stage 1", mins: 5, icon: "🌙", color: C.stage1, onDark: false,
    what: "The doze-off transition. Muscles relax and you drift out of wakefulness. You wake from this stage very easily." },
  { key: "s2a", name: "Stage 2", mins: 25, icon: "💤", color: C.light, onDark: false,
    what: "Light sleep. Heart rate and body temperature fall. You spend more of the night here than in any other stage." },
  { key: "deep", name: "Deep Sleep", mins: 30, icon: "🌊", color: C.deep, onDark: true,
    what: "Slow-wave sleep. The body repairs tissue and supports immune function. This is the hardest stage to wake from, and waking here is what causes grogginess." },
  { key: "s2b", name: "Stage 2", mins: 10, icon: "💤", color: C.light, onDark: false,
    what: "You rise back out of deep sleep and pass through light sleep again on the way to REM." },
  { key: "rem", name: "REM", mins: 20, icon: "🧠", color: C.rem, onDark: false,
    what: "Rapid eye movement sleep. The brain is highly active, dreaming happens and memories are consolidated. The cycle ends here, which is the easiest moment to wake." },
]
const TOTAL = STAGES.reduce((s, x) => s + x.mins, 0) // 90

// ── SECTION 2 data ────────────────────────────────────────────────────────────
const NIGHT = [
  { n: 1, from: "10:15 PM", deep: 62, light: 28, rem: 10 },
  { n: 2, from: "11:45 PM", deep: 50, light: 32, rem: 18 },
  { n: 3, from: "1:15 AM", deep: 32, light: 40, rem: 28 },
  { n: 4, from: "2:45 AM", deep: 16, light: 46, rem: 38 },
  { n: 5, from: "4:15 AM", deep: 6, light: 46, rem: 48 },
]

// ── SECTION 3 geometry ────────────────────────────────────────────────────────
const LAT = 15
const CYC = 90
const END = LAT + CYC * 5 // 465 min: 10:00 PM to 5:45 AM
const LEVEL = { awake: 34, rem: 92, light: 152, deep: 216 }
const CYCLE_SHAPE = [
  { deepY: 216, remLen: 10, arouse: false },
  { deepY: 206, remLen: 18, arouse: false },
  { deepY: 188, remLen: 26, arouse: false },
  { deepY: 168, remLen: 34, arouse: true },
  { deepY: 154, remLen: 42, arouse: true },
]

function smooth(pts: [number, number][]): string {
  if (pts.length < 2) return ""
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

export default function SleepCycleVisualization() {
  return (
    <div className="not-prose space-y-5 sm:space-y-6">
      <CycleTimeline />
      <NightProgression />
      <SleepArchitecture />
    </div>
  )
}

// ═══ SECTION 1 ════════════════════════════════════════════════════════════════
function CycleTimeline() {
  const reduced = useReducedMotion()
  const phone = useIsPhone()
  const { ref, seen } = useInView<HTMLDivElement>()
  const [active, setActive] = useState<string | null>(null)

  const W = 1000
  const H = 96
  const R = 14

  const segs = useMemo(() => {
    let x = 0
    return STAGES.map((s) => {
      const w = (s.mins / TOTAL) * W
      const seg = { ...s, x, w }
      x += w
      return seg
    })
  }, [])

  const current = segs.find((s) => s.key === active) ?? null

  return (
    <div ref={ref} className={CARD}>
      <header className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-base font-bold text-slate-900 sm:text-xl">One 90-minute sleep cycle</h3>
        <span className="hidden text-xs font-semibold uppercase tracking-wider text-slate-400 sm:inline">Hover a stage</span>
      </header>
      <p className="mb-4 text-sm text-slate-500 sm:mb-5">
        Every cycle runs the same sequence. You sink into deep sleep, then rise into REM. The cycle ends in REM, which is
        the easiest moment to wake.
      </p>

      {phone ? (
        /* ── PHONE: a vertical timeline. Readable, no hover needed. ────────── */
        <ol className="relative space-y-2">
          <li className="flex items-center gap-2 pl-1 text-xs font-bold text-slate-500">
            <span aria-hidden>🌙</span> Fall asleep
          </li>
          {STAGES.map((s, i) => (
            <li
              key={s.key}
              style={{
                opacity: seen || reduced ? 1 : 0,
                transform: seen || reduced ? "translateY(0)" : "translateY(10px)",
                transition: reduced ? "none" : `opacity 420ms ease ${i * 90}ms, transform 520ms cubic-bezier(.22,1,.36,1) ${i * 90}ms`,
              }}
            >
              <div className="flex items-stretch gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {/* height carries the proportion */}
                <div
                  className="w-2 flex-shrink-0"
                  style={{ backgroundColor: s.color, minHeight: 44 + s.mins * 1.9 }}
                  aria-hidden
                />
                <div className="min-w-0 flex-1 py-3 pr-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span aria-hidden>{s.icon}</span> {s.name}
                    </span>
                    <span className="flex-shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      {s.mins} min
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{s.what}</p>
                </div>
              </div>
            </li>
          ))}
          <li className="flex items-center gap-2 pl-1 text-xs font-bold text-emerald-800">
            <span aria-hidden>☀️</span> Cycle complete · 90 min · easiest moment to wake
          </li>
        </ol>
      ) : (
        /* ── DESKTOP: the horizontal SVG timeline with hover tooltips. ──────── */
        <>
          <div className="mb-3 min-h-[60px] rounded-2xl border border-slate-200 bg-slate-50 p-3">
            {current ? (
              <p className="text-sm leading-relaxed text-slate-700">
                <span className="mr-1.5" aria-hidden>{current.icon}</span>
                <strong className="text-slate-900">{current.name} · {current.mins} min.</strong>{" "}
                {current.what}
              </p>
            ) : (
              <p className="text-sm text-slate-400">Hover or focus a stage below to see what it does for your body.</p>
            )}
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
            aria-label="A 90 minute sleep cycle: Stage 1 five minutes, Stage 2 twenty-five minutes, deep sleep thirty minutes, Stage 2 ten minutes, REM twenty minutes.">
            <defs>
              <clipPath id="cyc-round"><rect x="0" y="0" width={W} height={H} rx={R} ry={R} /></clipPath>
              <clipPath id="cyc-wipe">
                <rect x="0" y="0" height={H} rx={R} ry={R}
                  width={reduced || seen ? W : 0}
                  style={{ transition: reduced ? "none" : "width 1100ms cubic-bezier(.22,1,.36,1)" }} />
              </clipPath>
            </defs>
            <g clipPath="url(#cyc-round)">
              <g clipPath="url(#cyc-wipe)">
                {segs.map((s) => {
                  const on = active === s.key
                  return (
                    <g key={s.key} tabIndex={0} role="button"
                      aria-label={`${s.name}, ${s.mins} minutes. ${s.what}`}
                      className="cursor-pointer outline-none"
                      onMouseEnter={() => setActive(s.key)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(s.key)}
                      onBlur={() => setActive(null)}
                    >
                      <rect x={s.x} y={0} width={s.w} height={H} fill={s.color}
                        style={{ opacity: active && !on ? 0.55 : 1, transition: "opacity 220ms ease" }} />
                      <text x={s.x + s.w / 2} y={38} textAnchor="middle" fontSize="20" aria-hidden>{s.icon}</text>
                      <text x={s.x + s.w / 2} y={62} textAnchor="middle" fontSize="13" fontWeight="700"
                        fill={s.onDark ? "#ECFDF5" : "#065F46"}>{s.mins} min</text>
                      {s.w > 90 && (
                        <text x={s.x + s.w / 2} y={80} textAnchor="middle" fontSize="11" fontWeight="600"
                          fill={s.onDark ? "#A7F3D0" : "#047857"} opacity={0.9}>{s.name}</text>
                      )}
                    </g>
                  )
                })}
              </g>
            </g>
          </svg>

          <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><span aria-hidden>🌙</span> Fall asleep</span>
            <span className="text-slate-400">Deepest point around 45 minutes in</span>
            <span className="flex items-center gap-1.5"><span aria-hidden>☀️</span> Cycle complete · 90 min</span>
          </div>

          {/* Descriptions stay crawlable and screen-reader accessible on desktop. */}
          <dl className="sr-only">
            {STAGES.map((s) => (
              <div key={s.key}>
                <dt>{s.name} ({s.mins} minutes)</dt>
                <dd>{s.what}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  )
}

// ═══ SECTION 2 ════════════════════════════════════════════════════════════════
function NightProgression() {
  const reduced = useReducedMotion()
  const { ref, seen } = useInView<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

  const W = 1000
  const H = 360
  const PAD = { top: 58, bottom: 62, left: 52, right: 14 }
  const plotH = H - PAD.top - PAD.bottom
  const bandW = (W - PAD.left - PAD.right) / NIGHT.length
  const barW = bandW * 0.56

  return (
    <div ref={ref} className={CARD}>
      <h3 className="mb-1 text-base font-bold text-slate-900 sm:text-xl">Your full night, cycle by cycle</h3>
      <p className="mb-4 text-sm text-slate-500 sm:mb-5">
        The cycles are not identical. Deep sleep dominates early and fades, while REM grows toward morning. That is why a
        short night costs you REM, not deep sleep.
      </p>

      <ScrollChart minWidth={880}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
          aria-label="Five sleep cycles from 10:15 PM to 5:45 AM. Deep sleep falls from 62 percent in cycle one to 6 percent in cycle five, while REM rises from 10 percent to 48 percent.">
          {[0, 25, 50, 75, 100].map((t) => {
            const y = PAD.top + plotH - (t / 100) * plotH
            return (
              <g key={t}>
                <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke={C.grid} strokeWidth={1} />
                <text x={PAD.left - 10} y={y + 5} textAnchor="end" fontSize="14" fill={C.muted}>{t}%</text>
              </g>
            )
          })}

          {/* phase annotations */}
          <rect x={PAD.left + 4} y={12} width={bandW * 2 - 8} height={30} rx={15} fill={C.deep} opacity={0.1} />
          <text x={PAD.left + bandW - 4} y={32} textAnchor="middle" fontSize="15" fontWeight="700" fill={C.deep}>
            Most physical recovery
          </text>
          <rect x={PAD.left + bandW * 3 + 4} y={12} width={bandW * 2 - 8} height={30} rx={15} fill={C.rem} opacity={0.2} />
          <text x={PAD.left + bandW * 4 - 4} y={32} textAnchor="middle" fontSize="15" fontWeight="700" fill="#047857">
            Most dreaming &amp; memory
          </text>

          {NIGHT.map((c, i) => {
            const cx = PAD.left + bandW * i + bandW / 2
            const x = cx - barW / 2
            const dh = (c.deep / 100) * plotH
            const lh = (c.light / 100) * plotH
            const rh = (c.rem / 100) * plotH
            const yDeep = PAD.top + plotH - dh
            const yLight = yDeep - lh
            const yRem = yLight - rh
            const dim = active !== null && active !== c.n
            const delay = reduced ? 0 : 120 * i

            return (
              <g key={c.n} tabIndex={0} role="button"
                aria-label={`Cycle ${c.n} starting ${c.from}. Deep sleep ${c.deep} percent, light sleep ${c.light} percent, REM ${c.rem} percent.`}
                className="cursor-pointer outline-none"
                onMouseEnter={() => setActive(c.n)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(c.n)}
                onBlur={() => setActive(null)}
                style={{
                  opacity: seen || reduced ? (dim ? 0.45 : 1) : 0,
                  transform: seen || reduced ? "translateY(0)" : "translateY(14px)",
                  transition: reduced ? "none" : `opacity 520ms ease ${delay}ms, transform 620ms cubic-bezier(.22,1,.36,1) ${delay}ms`,
                }}
              >
                <rect x={x} y={yRem} width={barW} height={rh} rx={6} fill={C.rem} />
                <rect x={x} y={yLight} width={barW} height={lh} fill={C.light} />
                <rect x={x} y={yDeep} width={barW} height={dh} rx={6} fill={C.deep} />
                <rect x={x} y={yLight - 6} width={barW} height={12} fill={C.light} />
                <rect x={x} y={yDeep - 6} width={barW} height={12} fill={C.deep} />

                <text x={cx} y={yRem - 9} textAnchor="middle" fontSize="15" fontWeight="700" fill="#047857">
                  {c.rem}% REM
                </text>
                <text x={cx} y={PAD.top + plotH - 12} textAnchor="middle" fontSize="15" fontWeight="700" fill="#ECFDF5">
                  {c.deep}%
                </text>
                <text x={cx} y={PAD.top + plotH + 26} textAnchor="middle" fontSize="15" fontWeight="700" fill={C.ink}>
                  Cycle {c.n}
                </text>
                <text x={cx} y={PAD.top + plotH + 46} textAnchor="middle" fontSize="13" fill={C.muted}>
                  {c.from}
                </text>
              </g>
            )
          })}

          <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} stroke={C.grid} strokeWidth={1.5} />
        </svg>
      </ScrollChart>

      <Legend />
    </div>
  )
}

// ═══ SECTION 3 ════════════════════════════════════════════════════════════════
function SleepArchitecture() {
  const reduced = useReducedMotion()
  const { ref, seen } = useInView<HTMLDivElement>()

  const W = 1000
  const H = 310
  const PAD = { left: 76, right: 18, top: 16, bottom: 62 }
  const x = (min: number) => PAD.left + (min / END) * (W - PAD.left - PAD.right)

  const { path, wakePoints } = useMemo(() => {
    const pts: [number, number][] = []
    pts.push([x(0), LEVEL.awake])
    pts.push([x(LAT - 4), LEVEL.awake])
    pts.push([x(LAT + 4), LEVEL.light])

    CYCLE_SHAPE.forEach((c, i) => {
      const s = LAT + i * CYC
      if (c.arouse) pts.push([x(s + 2), LEVEL.rem - 24])
      pts.push([x(s + 12), LEVEL.light])
      pts.push([x(s + 20), c.deepY])
      pts.push([x(s + 42), c.deepY])
      pts.push([x(s + 54), LEVEL.light])
      const remStart = s + CYC - c.remLen
      pts.push([x(remStart), LEVEL.light])
      pts.push([x(remStart + 5), LEVEL.rem])
      pts.push([x(s + CYC - 3), LEVEL.rem])
      pts.push([x(s + CYC), LEVEL.rem + 22])
    })
    pts.push([x(END), LEVEL.awake])

    const wake = CYCLE_SHAPE.map((_, i) => {
      const min = LAT + (i + 1) * CYC
      return { i: i + 1, cx: x(min), cy: LEVEL.rem + 22 }
    })
    return { path: smooth(pts), wakePoints: wake }
  }, [])

  const ticks = [
    { min: 0, label: "10 PM" },
    { min: 120, label: "12 AM" },
    { min: 240, label: "2 AM" },
    { min: 360, label: "4 AM" },
    { min: END, label: "5:45 AM" },
  ]

  return (
    <div ref={ref} className={CARD}>
      <h3 className="mb-1 text-base font-bold text-slate-900 sm:text-xl">Sleep architecture: the whole night</h3>
      <p className="mb-4 text-sm text-slate-500 sm:mb-5">
        This is a hypnogram, the shape sleep scientists use. Each dot marks the end of a cycle, which is the ideal moment
        for your alarm to ring.
      </p>

      <ScrollChart minWidth={900}>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
          aria-label="A hypnogram of one night. The line descends into deep sleep and rises into REM five times. Ideal wake-up points sit at the end of each cycle, with the best at 5:45 AM.">
          <rect x={PAD.left} y={LEVEL.light + 18} width={W - PAD.left - PAD.right} height={LEVEL.deep - LEVEL.light + 6}
            fill={C.deep} opacity={0.06} />
          <text x={W - PAD.right - 8} y={LEVEL.deep + 4} textAnchor="end" fontSize="13" fontWeight="700" fill={C.deep} opacity={0.8}>
            Waking here causes grogginess
          </text>

          {([["Awake", LEVEL.awake], ["REM", LEVEL.rem], ["Light", LEVEL.light], ["Deep", LEVEL.deep]] as const).map(([label, y]) => (
            <g key={label}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke={C.grid} strokeWidth={1} strokeDasharray="3 5" />
              <text x={PAD.left - 12} y={y + 5} textAnchor="end" fontSize="14" fontWeight="700" fill={C.muted}>{label}</text>
            </g>
          ))}

          <path d={path} fill="none" stroke={C.line} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: reduced || seen ? 0 : 1,
              transition: reduced ? "none" : "stroke-dashoffset 2200ms cubic-bezier(.4,0,.2,1)",
            }} />

          {wakePoints.map((p, i) => {
            const best = i === wakePoints.length - 1
            return (
              <g key={p.i} style={{
                opacity: reduced || seen ? 1 : 0,
                transition: reduced ? "none" : `opacity 400ms ease ${900 + i * 220}ms`,
              }}>
                <line x1={p.cx} x2={p.cx} y1={p.cy} y2={H - PAD.bottom + 6} stroke={best ? C.line : C.grid}
                  strokeWidth={best ? 1.5 : 1} strokeDasharray="2 4" />
                <circle cx={p.cx} cy={p.cy} r={best ? 9 : 6} fill="#fff" stroke={C.line} strokeWidth={best ? 3 : 2} />
                {best && <circle cx={p.cx} cy={p.cy} r={14} fill="none" stroke={C.line} strokeWidth={1.5} opacity={0.35} />}
              </g>
            )
          })}

          <line x1={PAD.left} x2={W - PAD.right} y1={H - PAD.bottom} y2={H - PAD.bottom} stroke={C.grid} strokeWidth={1.5} />
          {ticks.map((t) => (
            <text key={t.label} x={x(t.min)} y={H - PAD.bottom + 26} textAnchor="middle" fontSize="14" fontWeight="600" fill={C.muted}>
              {t.label}
            </text>
          ))}
          <text x={x(END)} y={H - PAD.bottom + 46} textAnchor="end" fontSize="13" fontWeight="700" fill={C.line}>
            Best wake-up, 5 full cycles
          </text>
        </svg>
      </ScrollChart>

      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
        <span className="mt-0.5 text-lg" aria-hidden>☀️</span>
        <p className="text-[13px] leading-relaxed text-slate-700 sm:text-sm">
          <strong className="text-slate-900">Why timing beats duration.</strong> An alarm that rings inside the shaded deep
          sleep band pulls you out of slow-wave sleep and triggers sleep inertia, the heavy grogginess that can blunt
          alertness for up to 30 minutes. Landing on a dot instead means waking from REM or light sleep, which feels
          dramatically easier even when you have slept the same number of hours.
        </p>
      </div>
    </div>
  )
}

function Legend() {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
      {([["Deep sleep", C.deep], ["Light sleep", C.light], ["REM sleep", C.rem]] as const).map(([label, color]) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm ring-1 ring-inset ring-black/5" style={{ backgroundColor: color }} />
          {label}
        </span>
      ))}
    </div>
  )
}
