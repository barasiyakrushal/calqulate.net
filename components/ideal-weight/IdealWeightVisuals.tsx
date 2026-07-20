"use client"

import { parseNumber } from "@/lib/utils";

/**
 * The visuals this page was missing, driven by Search Console.
 *
 * The highest-value queries are not "ideal weight calculator" (position ~45).
 * They are the raw Devine constants, sitting at position 8 to 10 with hundreds
 * of impressions:
 *
 *   "ideal body weight formula" male 50 kg 2.3 kg each inch over 5 feet
 *   "ideal body weight formula" female 45.5 2.3
 *
 * People are typing the formula itself into Google. So FormulaExplorer shows
 * that exact arithmetic, step by step, for a height they choose.
 *
 * Mobile-first: everything reflows to a vertical, readable layout on phones.
 * One colour family (emerald + slate). No em dashes.
 */

import { useMemo, useState } from "react"
import { devine, hamwi, robinson, miller, weightAtBmi, type Sex } from "@/lib/ideal-weight/formulas"

const C = {
  deep: "#047857",
  mid: "#10B981",
  soft: "#6EE7B7",
  pale: "#A7F3D0",
}
const CARD =
  "rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_40px_-24px_rgba(6,110,67,0.35)] sm:p-6"

const LB = 2.2046226218
const r1 = (n: number) => Math.round(n * 10) / 10

/** 178 cm -> 5 ft 10 in */
function toFtIn(cm: number) {
  const totalIn = cm / 2.54
  const ft = Math.floor(totalIn / 12)
  const inch = Math.round(totalIn - ft * 12)
  return inch === 12 ? { ft: ft + 1, inch: 0 } : { ft, inch }
}

// ── 1. FORMULA EXPLORER ───────────────────────────────────────────────────────
const FORMULAS = [
  { key: "devine", name: "Devine", base: { male: 50, female: 45.5 }, per: { male: 2.3, female: 2.3 },
    fn: devine, note: "The clinical standard, used for drug dosing." },
  { key: "robinson", name: "Robinson", base: { male: 52, female: 49 }, per: { male: 1.9, female: 1.7 },
    fn: robinson, note: "A 1983 revision, usually reads a little lower." },
  { key: "miller", name: "Miller", base: { male: 56.2, female: 53.1 }, per: { male: 1.41, female: 1.36 },
    fn: miller, note: "Rises most slowly with height, so it is lowest for tall people." },
  { key: "hamwi", name: "Hamwi", base: { male: 48, female: 45.5 }, per: { male: 2.7, female: 2.2 },
    fn: hamwi, note: "From 1964, still common in dietetics." },
] as const

export function FormulaExplorer() {
  const [sex, setSex] = useState<Sex>("male")
  const [cm, setCm] = useState(178)
  const [unit, setUnit] = useState<"kg" | "lb">("kg")

  const inches = cm / 2.54
  const over = inches - 60
  const { ft, inch } = toFtIn(cm)

  const rows = useMemo(
    () =>
      FORMULAS.map((f) => {
        const kg = Math.max(0, f.fn(sex, over))
        return { ...f, kg, shown: unit === "kg" ? kg : kg * LB }
      }),
    [sex, over, unit],
  )
  const max = Math.max(...rows.map((r) => r.shown))
  const devineRow = rows[0]
  const base = FORMULAS[0].base[sex]
  const per = FORMULAS[0].per[sex]

  return (
    <div className={CARD}>
      <h3 className="text-base font-bold text-slate-900 sm:text-xl">Formula explorer</h3>
      <p className="mt-1 text-sm text-slate-500">
        Change your height and sex, and watch all four medical formulas recalculate live.
      </p>

      {/* controls */}
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {(["male", "female"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSex(s)}
              aria-pressed={sex === s}
              className={`min-h-[48px] rounded-2xl border-2 text-sm font-bold capitalize transition-colors ${
                sex === s ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-200 text-slate-600 hover:border-emerald-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Height</span>
            <span className="text-lg font-extrabold tabular-nums text-slate-900">
              {cm} cm · {ft}&apos;{inch}&quot;
            </span>
          </div>
          <input
            type="range"
            min={140}
            max={210}
            value={cm}
            onChange={(e) => setCm(parseNumber(e.target.value))}
            aria-label="Height in centimetres"
            className="mt-3 h-2 w-full accent-emerald-700"
          />
          <div className="mt-1 flex justify-between text-[11px] text-slate-400">
            <span>140 cm</span>
            <span>210 cm</span>
          </div>
        </div>

        <div className="flex justify-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 w-fit mx-auto">
          {(["kg", "lb"] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              aria-pressed={unit === u}
              className={`min-h-[36px] rounded-full px-5 text-sm font-bold transition-colors ${
                unit === u ? "bg-emerald-700 text-white" : "text-slate-500"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* the Devine walkthrough: the exact arithmetic people search for */}
      <div className="mt-6 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Devine formula, step by step
        </p>
        <ol className="mt-3 space-y-2">
          {[
            { l: "Your height in inches", v: `${r1(inches)} in` },
            { l: "Inches above 5 feet (60 in)", v: `${r1(over)} in` },
            { l: `Multiply by ${per} kg per inch`, v: `${r1(over * per)} kg` },
            { l: `Add the ${sex} base of ${base} kg`, v: `${r1(base)} + ${r1(over * per)}` },
          ].map((s, i) => (
            <li key={s.l} className="flex items-center gap-3 rounded-xl bg-white p-2.5">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                {i + 1}
              </span>
              <span className="flex-1 text-[13px] font-medium text-slate-600">{s.l}</span>
              <span className="tabular-nums text-sm font-bold text-slate-900">{s.v}</span>
            </li>
          ))}
          <li className="flex items-center gap-3 rounded-xl bg-emerald-700 p-3">
            <span className="flex-1 text-sm font-bold text-emerald-50">Ideal body weight</span>
            <span className="tabular-nums text-lg font-extrabold text-white">
              {r1(unit === "kg" ? devineRow.kg : devineRow.kg * LB)} {unit}
            </span>
          </li>
        </ol>
        <p className="mt-3 text-xs leading-relaxed text-emerald-900/80">
          The Devine formula is <strong>{base} kg</strong> plus <strong>{per} kg for every inch above 5 feet</strong> for
          a {sex}. That is the equation clinicians actually use.
        </p>
      </div>

      {/* all four, compared */}
      <div className="mt-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">All four formulas compared</p>
        <ul className="space-y-2">
          {rows.map((f, i) => {
            const pct = max > 0 ? (f.shown / max) * 100 : 0
            const tone = [C.deep, C.mid, C.soft, C.pale][i]
            return (
              <li key={f.key}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm font-bold text-slate-900">{f.name}</span>
                  <span className="tabular-nums text-sm font-extrabold text-slate-900">
                    {r1(f.shown)} {unit}
                  </span>
                </div>
                <div className="h-6 w-full overflow-hidden rounded-lg bg-slate-100">
                  <div
                    className="h-full rounded-lg transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: tone }}
                  />
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">{f.note}</p>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          They disagree by a few kilograms, and that is normal. Each was derived on a different population for a different
          clinical purpose. Treat the spread as a healthy range, not a contradiction.
        </p>
      </div>
    </div>
  )
}

// ── 2. HEIGHT CHART ───────────────────────────────────────────────────────────
const HEIGHTS_CM = [150, 155, 160, 165, 170, 175, 180, 185, 190, 195]

export function HeightChart() {
  const [sex, setSex] = useState<Sex>("female")
  const [unit, setUnit] = useState<"kg" | "lb">("kg")

  const rows = HEIGHTS_CM.map((cm) => {
    const { ft, inch } = toFtIn(cm)
    const over = cm / 2.54 - 60
    const ibw = Math.max(0, devine(sex, over))
    const lo = weightAtBmi(18.5, cm)
    const hi = weightAtBmi(24.9, cm)
    const conv = (kg: number) => (unit === "kg" ? kg : kg * LB)
    return {
      cm,
      ftin: `${ft}'${inch}"`,
      ibw: Math.round(conv(ibw)),
      lo: Math.round(conv(lo)),
      hi: Math.round(conv(hi)),
    }
  })

  return (
    <div className={CARD}>
      <h3 className="text-base font-bold text-slate-900 sm:text-xl">Healthy weight by height</h3>
      <p className="mt-1 text-sm text-slate-500">
        Ideal weight is a single formula estimate. The healthy range is the broader medical band you should actually aim
        to sit inside.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
          {(["female", "male"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSex(s)}
              aria-pressed={sex === s}
              className={`min-h-[36px] rounded-full px-4 text-sm font-bold capitalize transition-colors ${
                sex === s ? "bg-emerald-700 text-white" : "text-slate-500"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
          {(["kg", "lb"] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              aria-pressed={unit === u}
              className={`min-h-[36px] rounded-full px-4 text-sm font-bold transition-colors ${
                unit === u ? "bg-emerald-700 text-white" : "text-slate-500"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      {/* Rows, not a squashed table: reads on a phone. */}
      <ul className="mt-4 space-y-2">
        {rows.map((r) => (
          <li
            key={r.cm}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
          >
            <div className="w-20 flex-shrink-0">
              <p className="text-sm font-extrabold text-slate-900">{r.cm} cm</p>
              <p className="text-[11px] text-slate-400">{r.ftin}</p>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Healthy range</span>
                <span className="tabular-nums text-sm font-bold text-slate-900">
                  {r.lo} to {r.hi} {unit}
                </span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: "100%" }} />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Ideal weight (Devine): <strong className="text-emerald-800">{r.ibw} {unit}</strong>
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-400">
        Healthy range is BMI 18.5 to 24.9 at that height. Ideal weight uses the Devine formula.
      </p>
    </div>
  )
}
