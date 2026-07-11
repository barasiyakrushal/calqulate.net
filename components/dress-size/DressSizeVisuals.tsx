"use client"

/**
 * Dress size: the interactive pieces.
 *
 * Search Console says users are not asking "how does a dress size calculator
 * work". They are asking "what size dress am I", "what size am I based on height
 * and weight", "US to UK size", "what if I am between sizes". Each component
 * here answers one of those, visually, without a wall of text.
 *
 * IllustrationSlot renders an <img> from /public and degrades to a labelled
 * placeholder showing the exact path to drop the file at, so the layout is
 * finished before the artwork exists.
 *
 * Mobile-first, emerald + slate only, no em dashes.
 */

import { useState } from "react"
import Link from "next/link"
import {
  Ruler, ArrowRight, ArrowDown, ImageIcon, Check, X, ShoppingBag,
  Sparkles, RotateCcw, AlertTriangle,
} from "lucide-react"

const CARD =
  "rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_40px_-24px_rgba(6,110,67,0.35)] sm:p-6"

/* ─────────────────────────────────────────────────────────────────────────────
   Image slot: shows the real image once you drop it in /public, otherwise a
   clean placeholder that names the exact file path required.
   ───────────────────────────────────────────────────────────────────────────── */
export function IllustrationSlot({
  src, alt, caption, aspect = "aspect-[4/5]",
}: { src: string; alt: string; caption?: string; aspect?: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <figure className="w-full">
      <div className={`relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 ${aspect}`}>
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 p-3 text-center">
            <ImageIcon className="h-7 w-7 text-slate-300" />
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Illustration</p>
            <code className="max-w-full break-all rounded bg-white px-2 py-1 text-[10px] text-slate-500 ring-1 ring-slate-200">
              {src}
            </code>
            <p className="px-2 text-[11px] leading-snug text-slate-400">{alt}</p>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      {caption && <figcaption className="mt-2 text-center text-xs text-slate-500">{caption}</figcaption>}
    </figure>
  )
}

/* ─── 1. THE JOURNEY: bust -> waist -> hips -> brand -> shape -> size ──────── */
export function SizeJourney() {
  const steps = [
    { t: "Bust", d: "Fullest point" },
    { t: "Waist", d: "Narrowest point" },
    { t: "Hips", d: "Widest point" },
    { t: "Brand", d: "Every label differs" },
    { t: "Body shape", d: "Where you carry width" },
  ]
  return (
    <div className={CARD}>
      <h3 className="text-base font-bold text-slate-900 sm:text-xl">How your dress size is decided</h3>
      <p className="mt-1 text-sm text-slate-500">
        A size chart uses three numbers. A good recommendation uses five inputs.
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        {steps.map((s, i) => (
          <div key={s.t} className="flex flex-1 items-center gap-2 sm:flex-col">
            <div className="flex w-full flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:flex-col sm:gap-1 sm:text-center">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-slate-900">{s.t}</span>
                <span className="block text-[11px] leading-tight text-slate-500">{s.d}</span>
              </span>
            </div>
            <ArrowDown className="h-4 w-4 flex-shrink-0 text-emerald-600 sm:hidden" />
            {i < steps.length - 1 && <ArrowRight className="hidden h-4 w-4 flex-shrink-0 text-emerald-600 sm:block sm:-mt-6" />}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 p-4 text-white">
        <Sparkles className="h-5 w-5 text-emerald-200" />
        <span className="text-base font-bold">Your recommended dress size</span>
      </div>
    </div>
  )
}

/* ─── 2. ACCURACY: measurements beat height and weight ────────────────────── */
export function AccuracyComparison() {
  const rows = [
    { m: "Bust, waist and hips", stars: 5, why: "Measures the body the size chart is actually built around." },
    { m: "Bust, waist, hips plus body shape", stars: 5, why: "Adds where your width sits, which decides fit far more than totals." },
    { m: "Height and weight", stars: 3, why: "A reasonable estimate, but blind to your proportions." },
    { m: "Weight only", stars: 2, why: "Two women at the same weight routinely wear sizes two apart." },
    { m: "Guessing from your last purchase", stars: 1, why: "Only reliable within one brand, and only until they re-grade." },
  ]
  return (
    <div className={CARD}>
      <h3 className="text-base font-bold text-slate-900 sm:text-xl">What actually predicts your dress size</h3>
      <ul className="mt-4 space-y-2">
        {rows.map((r) => (
          <li key={r.m} className="rounded-2xl border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm font-bold text-slate-900">{r.m}</span>
              <span className="flex flex-shrink-0 gap-0.5" aria-label={`${r.stars} out of 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-2.5 w-2.5 rounded-sm ${i < r.stars ? "bg-emerald-600" : "bg-slate-200"}`}
                  />
                ))}
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{r.why}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─── 3. MEASUREMENT GUIDE (image slots) ──────────────────────────────────── */
const MEASURE = [
  {
    t: "Bust",
    src: "/images/dress-size/measure-bust.webp",
    alt: "Tape measure around the fullest part of the bust, level under the arms and across the back",
    how: "Wrap the tape around the fullest part of your chest, keeping it level under your arms and across your shoulder blades. Wear a non-padded bra and breathe normally. Do not pull tight.",
  },
  {
    t: "Waist",
    src: "/images/dress-size/measure-waist.webp",
    alt: "Tape measure around the natural waist, the narrowest part of the torso above the navel",
    how: "Find your natural waist, the narrowest part of your torso, usually just above the navel. Bend to one side and the crease that forms is your waist. Keep the tape snug, not tight, and do not suck in.",
  },
  {
    t: "Hips",
    src: "/images/dress-size/measure-hips.webp",
    alt: "Tape measure around the widest part of the hips and seat",
    how: "Stand with your feet together and measure around the widest part of your hips and seat, usually about 7 to 9 inches below your natural waist. Keep the tape parallel to the floor.",
  },
]

export function MeasurementGuide() {
  return (
    <div className={CARD}>
      <h3 className="text-base font-bold text-slate-900 sm:text-xl">How to measure yourself in 3 steps</h3>
      <p className="mt-1 text-sm text-slate-500">
        Use a soft fabric tape. Measure over bare skin or thin clothing, and take each measurement twice.
      </p>
      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        {MEASURE.map((m, i) => (
          <div key={m.t}>
            <IllustrationSlot src={m.src} alt={m.alt} />
            <div className="mt-3">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-xs text-white">
                  {i + 1}
                </span>
                {m.t}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{m.how}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-2xl bg-emerald-50 p-3 text-[13px] leading-relaxed text-emerald-900">
        <strong>The rule that saves returns:</strong> if your three measurements land in different sizes, buy for your{" "}
        <strong>largest</strong> measurement and have the rest taken in. Letting a seam out is much harder than taking one
        in.
      </p>
    </div>
  )
}

/* ─── 4. COUNTRY CONVERTER (interactive) ──────────────────────────────────── */
interface SizeRow {
  us: number; uk: number; eu: number; au: number; india: string; indiaNum: number
  bust: string; waist: string; hips: string
}
const SIZES: SizeRow[] = [
  { us: 0, uk: 4, eu: 32, au: 4, india: "XS", indiaNum: 30, bust: "31 to 32", waist: "24 to 25", hips: "34 to 35" },
  { us: 2, uk: 6, eu: 34, au: 6, india: "XS", indiaNum: 32, bust: "32 to 33", waist: "25 to 26", hips: "35 to 36" },
  { us: 4, uk: 8, eu: 36, au: 8, india: "S", indiaNum: 34, bust: "33 to 34", waist: "26 to 27", hips: "36 to 37" },
  { us: 6, uk: 10, eu: 38, au: 10, india: "S", indiaNum: 36, bust: "34 to 35", waist: "27 to 28", hips: "37 to 38" },
  { us: 8, uk: 12, eu: 40, au: 12, india: "M", indiaNum: 38, bust: "35 to 36", waist: "28 to 29", hips: "38 to 39" },
  { us: 10, uk: 14, eu: 42, au: 14, india: "M", indiaNum: 40, bust: "36 to 38", waist: "29 to 31", hips: "39 to 41" },
  { us: 12, uk: 16, eu: 44, au: 16, india: "L", indiaNum: 42, bust: "38 to 40", waist: "31 to 33", hips: "41 to 43" },
  { us: 14, uk: 18, eu: 46, au: 18, india: "L", indiaNum: 44, bust: "40 to 42", waist: "33 to 35", hips: "43 to 45" },
  { us: 16, uk: 20, eu: 48, au: 20, india: "XL", indiaNum: 46, bust: "42 to 44", waist: "35 to 37", hips: "45 to 47" },
  { us: 18, uk: 22, eu: 50, au: 22, india: "XXL", indiaNum: 48, bust: "44 to 46", waist: "37 to 39", hips: "47 to 49" },
]

export function CountryConverter() {
  const [i, setI] = useState(4) // default US 8
  const s = SIZES[i]

  return (
    <div className={CARD}>
      <h3 className="text-base font-bold text-slate-900 sm:text-xl">Dress size converter: US, UK, EU, AU and India</h3>
      <p className="mt-1 text-sm text-slate-500">
        Pick the size you normally wear and see it in every system, along with the measurements it is built around.
      </p>

      {/* size picker: horizontal scroll on phones, big tap targets */}
      <div className="mt-4 -mx-1 overflow-x-auto pb-1">
        <div className="flex gap-2 px-1">
          {SIZES.map((row, idx) => (
            <button
              key={row.us}
              onClick={() => setI(idx)}
              aria-pressed={i === idx}
              className={`min-h-[48px] min-w-[58px] flex-shrink-0 rounded-2xl border-2 text-sm font-bold transition-colors ${
                i === idx
                  ? "border-emerald-700 bg-emerald-700 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
              }`}
            >
              US {row.us}
            </button>
          ))}
        </div>
      </div>

      {/* the conversion */}
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {[
          { l: "US", v: String(s.us) },
          { l: "UK", v: String(s.uk) },
          { l: "EU", v: String(s.eu) },
          { l: "Australia", v: String(s.au) },
          { l: "India", v: `${s.india} / ${s.indiaNum}` },
        ].map((c) => (
          <div key={c.l} className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">{c.l}</p>
            <p className="mt-0.5 text-xl font-extrabold text-slate-900">{c.v}</p>
          </div>
        ))}
      </div>

      {/* the measurements behind it */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { l: "Bust", v: s.bust },
          { l: "Waist", v: s.waist },
          { l: "Hips", v: s.hips },
        ].map((c) => (
          <div key={c.l} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{c.l}</p>
            <p className="mt-0.5 text-sm font-extrabold tabular-nums text-slate-900">{c.v}&quot;</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        These are standard conversions. Individual brands still grade their own way, which is why the same US 8 can fit
        differently at two shops on the same street.
      </p>
    </div>
  )
}

/* ─── 5. BETWEEN SIZES: decision tree ─────────────────────────────────────── */
type Node =
  | { kind: "q"; text: string; hint?: string; yes: Node; no: Node }
  | { kind: "a"; verdict: "up" | "down" | "true"; text: string }

const TREE: Node = {
  kind: "q",
  text: "Does the fabric have stretch?",
  hint: "Look for elastane, spandex, jersey or knit on the label.",
  yes: {
    kind: "q",
    text: "Is it a fitted or bodycon style?",
    hint: "Close to the body, rather than loose or flowing.",
    yes: {
      kind: "a", verdict: "true",
      text: "Stay true to size. Stretch fabric on a bodycon shape is designed to cling, and sizing up removes the structure it relies on. Only size up if you want a looser drape.",
    },
    no: {
      kind: "a", verdict: "down",
      text: "Size down. A stretchy, relaxed style will give as you wear it, so the smaller size is likely to sit better rather than swamp you.",
    },
  },
  no: {
    kind: "q",
    text: "Is it structured or fitted?",
    hint: "Think tailored, corseted, satin, linen, or bridal.",
    yes: {
      kind: "a", verdict: "up",
      text: "Size up. Woven fabric with no stretch has no give at all, and a structured dress will pull at the bust and zip. Size up and have it taken in, which is a cheap and easy alteration.",
    },
    no: {
      kind: "a", verdict: "true",
      text: "Stay true to size, and buy for your largest measurement. A loose, non-stretch style has room built in, so the risk of a smaller size is mostly at the bust and hips.",
    },
  },
}

const VERDICT = {
  up: { label: "Size up", cls: "bg-emerald-700 text-white", icon: <ArrowRight className="h-5 w-5" /> },
  down: { label: "Size down", cls: "bg-emerald-600 text-white", icon: <ArrowRight className="h-5 w-5 rotate-180" /> },
  true: { label: "Stay true to size", cls: "bg-slate-900 text-white", icon: <Check className="h-5 w-5" /> },
} as const

export function BetweenSizesTree() {
  const [node, setNode] = useState<Node>(TREE)
  const [path, setPath] = useState<string[]>([])

  const answer = (yes: boolean) => {
    if (node.kind !== "q") return
    setPath((p) => [...p, `${node.text} ${yes ? "Yes" : "No"}`])
    setNode(yes ? node.yes : node.no)
  }
  const reset = () => { setNode(TREE); setPath([]) }

  return (
    <div className={CARD}>
      <h3 className="text-base font-bold text-slate-900 sm:text-xl">Between two sizes? Answer two questions.</h3>
      <p className="mt-1 text-sm text-slate-500">
        There is no universal rule. The right answer depends entirely on the fabric and the cut.
      </p>

      {path.length > 0 && (
        <ol className="mt-4 space-y-1">
          {path.map((p) => (
            <li key={p} className="flex items-start gap-2 text-[13px] text-slate-500">
              <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-600" /> {p}
            </li>
          ))}
        </ol>
      )}

      {node.kind === "q" ? (
        <div className="mt-4">
          <p className="text-lg font-bold text-slate-900">{node.text}</p>
          {node.hint && <p className="mt-1 text-sm text-slate-500">{node.hint}</p>}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => answer(true)}
              className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-emerald-700 text-base font-bold text-white transition hover:bg-emerald-800"
            >
              <Check className="h-5 w-5" /> Yes
            </button>
            <button
              onClick={() => answer(false)}
              className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 text-base font-bold text-slate-700 transition hover:border-slate-300"
            >
              <X className="h-5 w-5" /> No
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className={`flex items-center gap-2 rounded-2xl p-4 ${VERDICT[node.verdict].cls}`}>
            {VERDICT[node.verdict].icon}
            <span className="text-lg font-extrabold">{VERDICT[node.verdict].label}</span>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-700">{node.text}</p>
          <button
            onClick={reset}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800"
          >
            <RotateCcw className="h-4 w-4" /> Start over
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── 6. WHY DRESSES GET RETURNED ─────────────────────────────────────────── */
const RETURN_REASONS = [
  { r: "Bust did not fit", weight: 100, d: "The most common single failure. Bust is the hardest area to alter and the first place a dress pulls." },
  { r: "Waist did not fit", weight: 70, d: "Often because the buyer sized to their bust and ignored a smaller waist." },
  { r: "Brand ran small or large", weight: 52, d: "The size on the label matched, but that brand grades differently." },
  { r: "Fabric had no give", weight: 45, d: "A woven, non-stretch dress in a size that would have worked in jersey." },
  { r: "Length was wrong", weight: 30, d: "Especially midi and maxi dresses on petite and tall frames." },
]

export function ReturnRisk() {
  return (
    <div className={CARD}>
      <h3 className="text-base font-bold text-slate-900 sm:text-xl">Why dresses actually get returned</h3>
      <p className="mt-1 text-sm text-slate-500">
        Fit is the single biggest reason clothing goes back. These are the causes, ranked by how often they come up.
      </p>
      <ul className="mt-5 space-y-3">
        {RETURN_REASONS.map((x, i) => (
          <li key={x.r}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-sm font-bold text-slate-900">{x.r}</span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {i === 0 ? "Most common" : ""}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-700"
                style={{ width: `${x.weight}%` }}
              />
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{x.d}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
        Ranked by how frequently each cause is reported in apparel fit research and retailer returns guidance. Treat the
        bars as a relative ranking, not exact percentages.
      </p>
    </div>
  )
}

/* ─── 7. SAME HEIGHT, SAME WEIGHT, DIFFERENT SIZE ─────────────────────────── */
export function SameSizeDifferentBody() {
  const women = [
    {
      name: "Woman A", shape: "Hourglass", size: "US 8",
      m: { bust: '36"', waist: '28"', hips: '38"' },
      src: "/images/dress-size/same-stats-hourglass.webp",
      alt: "Hourglass silhouette, bust and hips balanced with a defined waist",
    },
    {
      name: "Woman B", shape: "Rectangle", size: "US 10",
      m: { bust: '35"', waist: '32"', hips: '36"' },
      src: "/images/dress-size/same-stats-rectangle.webp",
      alt: "Rectangle silhouette, bust waist and hips close in measurement",
    },
  ]
  return (
    <div className={CARD}>
      <h3 className="text-base font-bold text-slate-900 sm:text-xl">
        Same height. Same weight. Different dress size.
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Both women are 165 cm and 60 kg. A height and weight calculator would hand them the same answer. It would be wrong
        for one of them.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {women.map((w) => (
          <div key={w.name} className="rounded-2xl border border-slate-200 p-3">
            <IllustrationSlot src={w.src} alt={w.alt} aspect="aspect-[3/4]" />
            <div className="mt-3">
              <div className="flex items-baseline justify-between">
                <p className="font-bold text-slate-900">{w.name}</p>
                <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 text-xs font-bold text-white">{w.size}</span>
              </div>
              <p className="text-xs text-slate-500">{w.shape} · 165 cm · 60 kg</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {Object.entries(w.m).map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-slate-50 p-1.5 text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400">{k}</p>
                    <p className="text-xs font-extrabold text-slate-900">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
        <p className="text-sm font-bold text-emerald-900">Why the sizes differ</p>
        <ul className="mt-2 space-y-1.5">
          {[
            "Waist is the deciding measurement on most fitted dresses, and there is a 4 inch gap between them.",
            "Woman A's bust to waist difference gives her a defined waist a dress can be cut to.",
            "Woman B carries her width more evenly, so a size 8 pulls at the waist even though the bust fits.",
            "Muscle sits denser than fat, so identical weight can mean a smaller frame.",
            "Brand grading then moves both of them again, by up to a full size.",
          ].map((l) => (
            <li key={l} className="flex gap-2 text-[13px] leading-relaxed text-emerald-900/90">
              <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" /> {l}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[13px] text-emerald-900/80">
          Not sure which you are? Start with the{" "}
          <Link href="/health/body-shape-calculator" className="font-bold underline underline-offset-2">
            Calqulate.net Body Shape Calculator
          </Link>
          , then come back and size with confidence.
        </p>
      </div>
    </div>
  )
}

/* ─── 8. BRAND FIT ────────────────────────────────────────────────────────── */
const BRANDS = [
  { b: "Zara", fit: "Runs small", advice: "Size up, especially in dresses and anything tailored." },
  { b: "H&M", fit: "Runs small", advice: "Size up. Their EU grading is narrow through the waist." },
  { b: "Shein", fit: "Runs very small", advice: "Size up one, sometimes two. Always check the item's own measurements, not the label." },
  { b: "ASOS Design", fit: "True to size", advice: "Their own label is consistent. Third-party brands on ASOS are not." },
  { b: "Mango", fit: "Runs small", advice: "Size up if you are between sizes or busty." },
  { b: "Old Navy, Gap", fit: "Runs large", advice: "Often size down. Vanity sizing is common in US high street." },
  { b: "Boohoo, PrettyLittleThing", fit: "Runs small", advice: "Size up, and expect heavy variation between individual items." },
]

export function BrandFit() {
  return (
    <div className={CARD}>
      <h3 className="text-base font-bold text-slate-900 sm:text-xl">Why the same size fits differently at every brand</h3>
      <p className="mt-1 text-sm text-slate-500">
        There is no legal standard for a dress size. Each brand grades to its own fit model, which is why your wardrobe
        holds three different sizes that all fit.
      </p>
      <ul className="mt-5 space-y-2">
        {BRANDS.map((x) => {
          const small = x.fit.includes("small")
          const large = x.fit.includes("large")
          return (
            <li key={x.b} className="flex flex-col gap-1 rounded-2xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:gap-4">
              <span className="w-full flex-shrink-0 font-bold text-slate-900 sm:w-40">{x.b}</span>
              <span
                className={`w-fit flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  small ? "bg-emerald-700 text-white" : large ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-700"
                }`}
              >
                {x.fit}
              </span>
              <span className="text-[13px] leading-relaxed text-slate-600">{x.advice}</span>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
        <ShoppingBag className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
        Guidance based on published brand size charts and widely reported shopper experience. Brands re-grade regularly,
        so always check the garment measurements on the product page.
      </p>
    </div>
  )
}

/* ─── 9. DRESS LENGTH BY HEIGHT ───────────────────────────────────────────── */
const LENGTHS = [
  { h: "Under 5'2\" (petite)", mini: "31 to 33\"", midi: "41 to 43\"", maxi: "52 to 54\"", note: "Midi often reads as maxi. Look for petite ranges." },
  { h: "5'2\" to 5'5\"", mini: "33 to 35\"", midi: "43 to 45\"", maxi: "55 to 57\"", note: "Standard sizing usually works as designed." },
  { h: "5'6\" to 5'8\"", mini: "34 to 36\"", midi: "45 to 47\"", maxi: "57 to 59\"", note: "The height most brands cut their samples for." },
  { h: "5'9\" and over (tall)", mini: "36 to 38\"", midi: "47 to 49\"", maxi: "60 to 62\"", note: "Standard maxi often lands at the ankle. Seek tall ranges." },
]

export function DressLength() {
  return (
    <div className={CARD}>
      <h3 className="text-base font-bold text-slate-900 sm:text-xl">Dress length by height</h3>
      <p className="mt-1 text-sm text-slate-500">
        Size controls the fit. Height controls where the hem lands. A midi on a 5 foot frame is a maxi on someone else.
      </p>
      <div className="mt-4 space-y-2">
        {LENGTHS.map((l) => (
          <div key={l.h} className="rounded-2xl border border-slate-200 p-3">
            <p className="text-sm font-bold text-slate-900">{l.h}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[["Mini", l.mini], ["Midi", l.midi], ["Maxi", l.maxi]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-emerald-50/70 p-2 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">{k}</p>
                  <p className="text-xs font-extrabold tabular-nums text-slate-900">{v}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-slate-500">{l.note}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Lengths are measured shoulder to hem, the way most brands list them on the product page.
      </p>
    </div>
  )
}
