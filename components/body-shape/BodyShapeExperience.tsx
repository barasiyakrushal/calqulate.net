"use client"

/**
 * Body Shape Calculator experience: Ask -> Aha -> Commit.
 *
 * Ask   : sex, units, and the sex-specific measurements (one field per idea,
 *         kept short per the onboarding playbook).
 * Aha   : the 3D body morphs into their real silhouette while the result card
 *         slides in with shape, confidence, characteristics and recommendations.
 * Commit: a soft, goal-framed pitch to the GLP-1 Progress Tracker plus the
 *         related calculators, only after they have seen their result.
 *
 * Layout follows the brief: mobile is calculator -> viewer -> result stacked;
 * desktop is a three-column form / viewer / analysis.
 *
 * The heavy 3D viewer is lazy-loaded (Suspense + next/dynamic) and only mounts
 * once the user reaches the result, so the form paints instantly on mobile.
 */

import { useMemo, useRef, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import {
  classify, type Sex, type Classification, type FemaleInput, type MaleInput,
  SOMATOTYPE_NOTE,
} from "@/lib/body-shape/shapes"
import { parseNumber } from "@/lib/utils"
import { buildProfile } from "@/lib/body-shape/body-profile"
import {
  ArrowRight, ArrowLeft, RotateCcw, Sparkles, Lock, ShieldCheck, Ruler,
  Target, Dumbbell, Shirt, HeartPulse, Download, GitCompare, Loader2, Syringe,
} from "lucide-react"

const Viewer = dynamic(() => import("./BodyShapeViewer").then((m) => m.BodyShapeViewer), {
  ssr: false,
  loading: () => <ViewerSkeleton />,
})

const CM_PER_IN = 2.54
type Units = "metric" | "imperial"
type Phase = "ask" | "result"

interface Draft {
  sex: Sex
  units: Units
  // female
  bust: string; waist: string; hips: string; highHip: string
  // male
  shoulders: string; chest: string
  height: string
}

const EMPTY: Draft = {
  sex: "female", units: "metric",
  bust: "", waist: "", hips: "", highHip: "",
  shoulders: "", chest: "", height: "",
}

interface Field { key: keyof Draft; label: string; placeholderMetric: string; placeholderImperial: string; optional?: boolean }

const FEMALE_FIELDS: Field[] = [
  { key: "bust", label: "Bust", placeholderMetric: "97", placeholderImperial: "38" },
  { key: "waist", label: "Waist", placeholderMetric: "71", placeholderImperial: "28" },
  { key: "hips", label: "Hips", placeholderMetric: "102", placeholderImperial: "40" },
  { key: "highHip", label: "High hip (optional)", placeholderMetric: "92", placeholderImperial: "36", optional: true },
]
const MALE_FIELDS: Field[] = [
  { key: "shoulders", label: "Shoulders", placeholderMetric: "122", placeholderImperial: "48" },
  { key: "chest", label: "Chest", placeholderMetric: "104", placeholderImperial: "41" },
  { key: "waist", label: "Waist", placeholderMetric: "86", placeholderImperial: "34" },
  { key: "hips", label: "Hips", placeholderMetric: "99", placeholderImperial: "39" },
]

export default function BodyShapeExperience() {
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [phase, setPhase] = useState<Phase>("ask")
  const [loading, setLoading] = useState(false)
  const [morphing, setMorphing] = useState(false)
  const [compare, setCompare] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const fields = draft.sex === "female" ? FEMALE_FIELDS : MALE_FIELDS
  const prefersReduced = usePrefersReducedMotion()

  const required = fields.filter((f) => !f.optional)
  const canSubmit = required.every((f) => parseNumber(draft[f.key] as string) > 0)

  const toCm = (v: string) => (draft.units === "metric" ? parseNumber(v) : parseNumber(v) * CM_PER_IN)

  const measures = useMemo(() => {
    const heightCm = draft.height ? toCm(draft.height) : undefined
    if (draft.sex === "female") {
      return {
        input: {
          bust: toCm(draft.bust), waist: toCm(draft.waist), hips: toCm(draft.hips),
          highHip: draft.highHip ? toCm(draft.highHip) : undefined,
        } as FemaleInput,
        heightCm,
      }
    }
    return {
      input: {
        shoulders: toCm(draft.shoulders), chest: toCm(draft.chest),
        waist: toCm(draft.waist), hips: toCm(draft.hips),
      } as MaleInput,
      heightCm,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, phase])

  const result: Classification | null = useMemo(() => {
    if (phase !== "result" || !canSubmit) return null
    return classify(draft.sex, measures.input)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, draft.sex, measures])

  const profile = useMemo(() => {
    if (!result) return null
    const m = measures.input
    if (draft.sex === "female") {
      const f = m as FemaleInput
      return buildProfile({ sex: "female", chest: f.bust, waist: f.waist, hips: f.hips, highHip: f.highHip, height: measures.heightCm })
    }
    const mm = m as MaleInput
    return buildProfile({ sex: "male", chest: mm.chest, waist: mm.waist, hips: mm.hips, shoulders: mm.shoulders, height: measures.heightCm })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, draft.sex, measures])

  const submit = () => {
    if (!canSubmit) return
    setLoading(true)
    // Brief loading state (brief: show loading, then camera zooms + body morphs).
    window.setTimeout(() => {
      setLoading(false)
      setPhase("result")
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120)
    }, 550)
  }

  const restart = () => {
    setDraft(EMPTY)
    setPhase("ask")
    setCompare(false)
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(0,360px)]">
        {/* LEFT: measurement form */}
        <div className="order-1">
          <MeasurementForm
            draft={draft}
            setDraft={setDraft}
            fields={fields}
            canSubmit={canSubmit}
            loading={loading}
            onSubmit={submit}
            onRestart={restart}
            phase={phase}
          />
        </div>

        {/* CENTER: 3D viewer */}
        <div className="order-2 min-w-0">
          <div className="h-[46vh] min-h-[320px] w-full sm:h-[52vh] lg:h-[560px]">
            {phase === "result" && profile ? (
              <Viewer
                profile={profile}
                sex={draft.sex}
                reducedMotion={prefersReduced}
                onMorphStart={() => setMorphing(true)}
                onMorphEnd={() => setMorphing(false)}
              />
            ) : (
              <ViewerPlaceholder />
            )}
          </div>
        </div>

        {/* RIGHT: analysis (desktop) / below viewer (mobile) */}
        <div ref={resultRef} className="order-3 scroll-mt-24 min-w-0">
          {phase === "result" && result ? (
            <ResultCard
              result={result}
              draft={draft}
              morphing={morphing}
              compare={compare}
              onToggleCompare={() => setCompare((c) => !c)}
              onReset={restart}
            />
          ) : (
            <ResultPlaceholder />
          )}
        </div>
      </div>

      {phase === "result" && result && <CommitBand result={result} />}
    </div>
  )
}

// ── measurement form (Ask) ────────────────────────────────────────────────────
function MeasurementForm({
  draft, setDraft, fields, canSubmit, loading, onSubmit, onRestart, phase,
}: {
  draft: Draft
  setDraft: React.Dispatch<React.SetStateAction<Draft>>
  fields: Field[]
  canSubmit: boolean
  loading: boolean
  onSubmit: () => void
  onRestart: () => void
  phase: Phase
}) {
  const set = (k: keyof Draft, v: string) => setDraft((d) => ({ ...d, [k]: v }))
  const unit = draft.units === "metric" ? "cm" : "in"

  return (
    <div className="rounded-3xl border border-line bg-white p-5 shadow-[0_10px_40px_-12px_rgba(6,110,67,0.14)] sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-800"><Ruler className="h-4 w-4" /></span>
        <h2 className="text-lg font-bold text-ink">Your measurements</h2>
      </div>

      {/* sex */}
      <Segmented
        label="Biological sex"
        value={draft.sex}
        options={[{ v: "female", l: "Female" }, { v: "male", l: "Male" }]}
        onChange={(v) => setDraft((d) => ({ ...EMPTY, sex: v as Sex, units: d.units }))}
      />

      {/* units */}
      <Segmented
        label="Units"
        value={draft.units}
        options={[{ v: "metric", l: "cm" }, { v: "imperial", l: "inches" }]}
        onChange={(v) => setDraft((d) => ({ ...d, units: v as Units }))}
      />

      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => { e.preventDefault(); onSubmit() }}
      >
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1 block text-sm font-semibold text-copy">{f.label}</span>
            <div className="flex items-stretch overflow-hidden rounded-xl border border-line focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
              <input
                name={f.key}
                inputMode="decimal"
                type="number"
                step="any"
                min="0"
                value={draft[f.key] as string}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={draft.units === "metric" ? f.placeholderMetric : f.placeholderImperial}
                aria-label={`${f.label} in ${unit}`}
                className="w-full bg-transparent px-3 py-3 text-base font-semibold text-ink outline-none placeholder:font-normal placeholder:text-faint"
              />
              <span className="flex items-center bg-surface px-3 text-sm font-semibold text-faint">{unit}</span>
            </div>
          </label>
        ))}

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-copy">Height (optional)</span>
          <div className="flex items-stretch overflow-hidden rounded-xl border border-line focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
            <input
              name="height"
              inputMode="decimal"
              type="number"
              step="any"
              min="0"
              value={draft.height}
              onChange={(e) => set("height", e.target.value)}
              placeholder={draft.units === "metric" ? "168" : "66"}
              aria-label={`Height in ${unit}`}
              className="w-full bg-transparent px-3 py-3 text-base font-semibold text-ink outline-none placeholder:font-normal placeholder:text-faint"
            />
            <span className="flex items-center bg-surface px-3 text-sm font-semibold text-faint">{unit}</span>
          </div>
        </label>

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-4 text-base font-bold text-white transition-all hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Building your model</>) : phase === "result" ? (<>Update my shape <ArrowRight className="h-4 w-4" /></>) : (<>See my body shape <ArrowRight className="h-4 w-4" /></>)}
        </button>
        {phase === "result" && (
          <button type="button" onClick={onRestart} className="inline-flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-faint hover:text-copy">
            <RotateCcw className="h-4 w-4" /> Start over
          </button>
        )}
      </form>

      <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-faint">
        <ShieldCheck className="h-3.5 w-3.5 text-brand" /> Private. Nothing is uploaded or saved.
      </p>
    </div>
  )
}

function Segmented({ label, value, options, onChange }: { label: string; value: string; options: { v: string; l: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="mb-3">
      <span className="mb-1 block text-sm font-semibold text-copy">{label}</span>
      <div className="flex gap-1 rounded-xl border border-line bg-surface p-1" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            aria-pressed={value === o.v}
            className={`min-h-[40px] flex-1 rounded-lg text-sm font-bold transition-colors ${value === o.v ? "bg-brand text-white shadow-sm" : "text-copy hover:bg-white"}`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── result card (Aha) ─────────────────────────────────────────────────────────
function ResultCard({
  result, draft, morphing, compare, onToggleCompare, onReset,
}: {
  result: Classification
  draft: Draft
  morphing: boolean
  compare: boolean
  onToggleCompare: () => void
  onReset: () => void
}) {
  const pct = Math.round(result.confidence * 100)
  const [animPct, setAnimPct] = useState(0)
  useEffect(() => {
    setAnimPct(0)
    const id = window.setTimeout(() => setAnimPct(pct), 60)
    return () => window.clearTimeout(id)
  }, [pct, result.shape])

  const download = () => downloadReport(result, draft)

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 rounded-3xl border border-line bg-white p-5 shadow-[0_10px_40px_-12px_rgba(6,110,67,0.14)] duration-500 sm:p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-800">Your body shape</p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{result.shape}</h2>
        {morphing && <span className="inline-flex items-center gap-1 text-xs font-semibold text-faint"><Loader2 className="h-3.5 w-3.5 animate-spin" /> morphing</span>}
      </div>
      {result.somatotype && (
        <p className="mt-1 text-sm text-copy"><strong className="text-ink">{result.somatotype}</strong> build. {SOMATOTYPE_NOTE[result.somatotype]}</p>
      )}

      {/* confidence */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm font-bold">
          <span className="text-copy">Confidence</span>
          <span className="text-brand-800">{pct}%</span>
        </div>
        <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-600 transition-[width] duration-1000 ease-out" style={{ width: `${animPct}%` }} />
        </div>
      </div>

      {/* measurements + whr */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {measurementChips(result, draft).map((c) => (
          <div key={c.label} className="rounded-xl border border-line bg-surface p-2.5 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wide text-faint">{c.label}</p>
            <p className="mt-0.5 text-sm font-black text-ink">{c.value}</p>
          </div>
        ))}
      </div>

      <Section icon={<Target className="h-4 w-4 text-brand" />} title="Body characteristics" items={result.content.characteristics} />
      <Insight icon={<HeartPulse className="h-4 w-4 text-brand" />} title="Health insight" text={result.content.healthInsights} />
      <Section icon={<Dumbbell className="h-4 w-4 text-brand" />} title="Recommended fitness focus" items={result.content.fitnessFocus} />
      <Section icon={<Shirt className="h-4 w-4 text-brand" />} title="Recommended clothing fit" items={result.content.clothingFit} />

      {compare && <CompareList result={result} />}

      {/* buttons */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button type="button" onClick={onToggleCompare} aria-pressed={compare} className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${compare ? "border-brand bg-brand-50 text-brand-800" : "border-line text-copy hover:bg-surface"}`}>
          <GitCompare className="h-4 w-4" /> Compare
        </button>
        <button type="button" onClick={download} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line px-4 py-3 text-sm font-bold text-copy transition-colors hover:bg-surface">
          <Download className="h-4 w-4" /> Report
        </button>
        <button type="button" onClick={onReset} className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-line px-4 py-3 text-sm font-bold text-copy transition-colors hover:bg-surface">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-faint">
        Body shape is an educational guide, not a diagnosis. The waist-to-height and waist-to-hip ratios are stronger
        health signals than the shape name itself.
      </p>
    </div>
  )
}

function CompareList({ result }: { result: Classification }) {
  const others = result.fits.slice(0, 4)
  return (
    <div className="mt-4 rounded-2xl border border-line bg-surface p-4">
      <p className="text-sm font-bold text-ink">How close the other shapes fit</p>
      <ul className="mt-2 space-y-2">
        {others.map((f) => (
          <li key={f.shape}>
            <div className="flex items-center justify-between text-xs font-semibold text-copy">
              <span>{f.shape}</span>
              <span className="text-faint">{Math.round(f.fit * 100)}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-brand/70" style={{ width: `${Math.round(f.fit * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Section({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink">{icon} {title}</h3>
      <ul className="mt-2 space-y-1.5">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2 text-sm leading-relaxed text-copy">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" /> {it}
          </li>
        ))}
      </ul>
    </div>
  )
}
function Insight({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-brand/25 bg-brand-50/50 p-3.5">
      <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink">{icon} {title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-copy">{text}</p>
    </div>
  )
}

// ── commit ────────────────────────────────────────────────────────────────────
function CommitBand({ result }: { result: Classification }) {
  const isCentral = result.shape === "Apple" || result.shape === "Oval"
  return (
    <div className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 to-brand-800 px-5 py-7 text-white sm:px-8">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-50/70">Your shape can change</p>
      <h3 className="mt-2 text-xl font-extrabold sm:text-2xl">
        {isCentral ? "Shift weight off your waist, keep your muscle" : "Reshape with fat loss, not muscle loss"}
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-50/90">
        Your silhouette is mostly where you carry fat and muscle, and both are trainable. What decides whether it lasts
        is losing fat without losing lean mass. That is exactly what the GLP-1 Progress Tracker watches, and it matters
        most on a GLP-1, where up to 40 percent of the weight lost can be muscle.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link href="/product/glp1-progress-tracker" className="gold-shine relative inline-flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-gold-light to-gold px-6 py-4 text-base font-bold text-gold-ink shadow-[0_10px_28px_rgba(245,158,11,0.4)] transition-transform hover:-translate-y-0.5">
          <Sparkles className="h-5 w-5" /> See the GLP-1 Progress Tracker <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/pricing" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10">
          <Lock className="h-4 w-4" /> Plans and pricing
        </Link>
      </div>
      <p className="mt-4 text-sm text-brand-50/90">
        Want the numbers behind the shape?{" "}
        <Link href="/health/body-fat-calculator" className="font-bold text-gold-light underline underline-offset-2">Check your body fat percentage</Link>,{" "}
        <Link href="/health/lean-body-mass-calculator" className="font-bold text-gold-light underline underline-offset-2">set a protein target</Link>, or{" "}
        <Link href="/health/glp-1-dose-calculator" className="font-bold text-gold-light underline underline-offset-2">see if you are losing fat or muscle on a GLP-1</Link>.
      </p>
    </div>
  )
}

// ── placeholders / skeletons ──────────────────────────────────────────────────
function ViewerPlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-white to-slate-100 text-center ring-1 ring-slate-200">
      <div className="flex h-24 w-16 items-center justify-center rounded-full bg-slate-200/70">
        <Syringe className="h-7 w-7 text-slate-400" />
      </div>
      <p className="mt-4 max-w-[220px] px-4 text-sm text-slate-500">Enter your measurements to see your body morph into its detected shape.</p>
    </div>
  )
}
function ViewerSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-b from-white to-slate-100 ring-1 ring-slate-200">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  )
}
function ResultPlaceholder() {
  return (
    <div className="hidden rounded-3xl border border-dashed border-line bg-surface/50 p-6 text-sm text-faint lg:block">
      Your shape analysis, characteristics and recommendations will appear here.
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────
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

function measurementChips(result: Classification, draft: Draft): { label: string; value: string }[] {
  const u = draft.units === "metric" ? "cm" : "in"
  const chips: { label: string; value: string }[] = []
  if (draft.sex === "female") {
    chips.push({ label: "Bust", value: `${draft.bust} ${u}` }, { label: "Waist", value: `${draft.waist} ${u}` }, { label: "Hips", value: `${draft.hips} ${u}` })
  } else {
    chips.push({ label: "Shoulders", value: `${draft.shoulders} ${u}` }, { label: "Chest", value: `${draft.chest} ${u}` }, { label: "Waist", value: `${draft.waist} ${u}` })
  }
  chips.push({ label: "Waist / hip", value: result.whr.toFixed(2) })
  return chips
}

function downloadReport(result: Classification, draft: Draft) {
  const u = draft.units === "metric" ? "cm" : "in"
  const lines = [
    "CALQULATE.NET — BODY SHAPE REPORT",
    "",
    `Sex: ${draft.sex}`,
    `Body shape: ${result.shape} (${Math.round(result.confidence * 100)}% confidence)`,
    result.somatotype ? `Build: ${result.somatotype}` : "",
    `Waist-to-hip ratio: ${result.whr.toFixed(2)}`,
    "",
    "Measurements:",
    draft.sex === "female"
      ? `  Bust ${draft.bust}${u}, Waist ${draft.waist}${u}, Hips ${draft.hips}${u}${draft.highHip ? `, High hip ${draft.highHip}${u}` : ""}`
      : `  Shoulders ${draft.shoulders}${u}, Chest ${draft.chest}${u}, Waist ${draft.waist}${u}, Hips ${draft.hips}${u}`,
    "",
    "Characteristics:",
    ...result.content.characteristics.map((c) => `  - ${c}`),
    "",
    "Health insight:",
    `  ${result.content.healthInsights}`,
    "",
    "Fitness focus:",
    ...result.content.fitnessFocus.map((c) => `  - ${c}`),
    "",
    "Clothing fit:",
    ...result.content.clothingFit.map((c) => `  - ${c}`),
    "",
    "Educational estimate only, not medical advice.",
  ].filter(Boolean)
  const blob = new Blob([lines.join("\n")], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `body-shape-${result.shape.toLowerCase().replace(/\s+/g, "-")}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
