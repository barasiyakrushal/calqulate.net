"use client"

/**
 * The Calqulate.net Shopping Assistant.
 *
 * A size chart answers 5 percent of the question. The shopper is really asking
 * "will this Zara dress fit me, and should I order the 8 or the 10?" So this is
 * a conversation, not a form: occasion, fit preference, brand, fabric, then the
 * three measurements. It returns a shopping report that explains itself.
 *
 * All the decision logic lives in lib/dress-size/engine.ts and is unit-tested.
 * This file is presentation only.
 *
 * Mobile-first, one decision per screen, emerald + slate, no em dashes.
 */

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  buildReport, cmToIn, SHAPE_LABEL, BRAND_FIT, FABRIC_FIT,
  type AssistantInput, type Occasion, type FitPreference, type Brand, type Fabric,
} from "@/lib/dress-size/engine"
import {
  Sparkles, ArrowRight, ArrowLeft, RotateCcw, Check, ShieldCheck, Loader2,
  Shirt, Globe, Heart, AlertTriangle, ShoppingBag, Ruler, ThumbsUp,
} from "lucide-react"

type Phase = "ask" | "thinking" | "report"
type Units = "in" | "cm"

interface Draft {
  occasion?: Occasion
  fit?: FitPreference
  brand?: Brand
  fabric?: Fabric
  units: Units
  bust: string
  waist: string
  hips: string
}
const EMPTY: Draft = { units: "in", bust: "", waist: "", hips: "" }

const OCCASIONS: { v: Occasion; label: string; hint: string; icon: string }[] = [
  { v: "everyday", label: "Everyday", hint: "Casual, comfortable", icon: "👕" },
  { v: "office", label: "Office", hint: "Smart, structured", icon: "💼" },
  { v: "party", label: "Party", hint: "Going out", icon: "✨" },
  { v: "formal", label: "Formal", hint: "Black tie, gala", icon: "🥂" },
  { v: "wedding", label: "Wedding", hint: "Bridal or bridesmaid", icon: "💍" },
  { v: "vacation", label: "Vacation", hint: "Light and floaty", icon: "🌴" },
]
const FITS: { v: FitPreference; label: string; hint: string }[] = [
  { v: "fitted", label: "Fitted", hint: "Close to the body" },
  { v: "true", label: "True to size", hint: "As the designer intended" },
  { v: "relaxed", label: "Relaxed", hint: "Skims, does not cling" },
]
const BRANDS: { v: Brand; label: string }[] = [
  { v: "zara", label: "Zara" }, { v: "hm", label: "H&M" }, { v: "shein", label: "Shein" },
  { v: "asos", label: "ASOS" }, { v: "mango", label: "Mango" }, { v: "oldnavy", label: "Old Navy" },
  { v: "boohoo", label: "Boohoo" }, { v: "uniqlo", label: "Uniqlo" }, { v: "unknown", label: "Not sure" },
]
const FABRICS: { v: Fabric; label: string }[] = [
  { v: "stretch", label: "Stretch or jersey" }, { v: "cotton", label: "Cotton" },
  { v: "linen", label: "Linen" }, { v: "satin", label: "Satin or silk" },
  { v: "velvet", label: "Velvet" }, { v: "denim", label: "Denim" },
  { v: "chiffon", label: "Chiffon" }, { v: "unknown", label: "Not sure" },
]

const STEPS = ["occasion", "fit", "brand", "fabric", "bust", "waist", "hips"] as const
type Step = (typeof STEPS)[number]

const THINKING = [
  "Reading your measurements",
  "Checking how this brand grades",
  "Factoring in the fabric",
  "Matching your body shape",
  "Building your shopping report",
]

export default function DressSizeAssistant() {
  const [phase, setPhase] = useState<Phase>("ask")
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [num, setNum] = useState("")
  const topRef = useRef<HTMLDivElement>(null)

  const current: Step = STEPS[step]
  const toIn = (v: string) => (draft.units === "in" ? parseFloat(v) : cmToIn(parseFloat(v)))

  const report = useMemo(() => {
    if (phase !== "report") return null
    const b = toIn(draft.bust), w = toIn(draft.waist), h = toIn(draft.hips)
    if (!(b > 0) || !(w > 0) || !(h > 0)) return null
    const input: AssistantInput = {
      bust: b, waist: w, hips: h,
      occasion: draft.occasion ?? "everyday",
      fit: draft.fit ?? "true",
      brand: draft.brand ?? "unknown",
      fabric: draft.fabric ?? "unknown",
    }
    return buildReport(input)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, draft])

  const scroll = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })

  const next = () => {
    if (step < STEPS.length - 1) { setStep((s) => s + 1); setNum(""); scroll() }
    else { setPhase("thinking"); scroll() }
  }
  const back = () => {
    if (phase === "report") { setPhase("ask"); setStep(STEPS.length - 1); return }
    if (step > 0) { setStep((s) => s - 1); setNum("") }
  }
  const restart = () => { setDraft(EMPTY); setStep(0); setNum(""); setPhase("ask"); scroll() }

  const pick = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }))
    setTimeout(next, 150)
  }
  const submitNum = () => {
    const n = parseFloat(num)
    if (!(n > 0)) return
    setDraft((d) => ({ ...d, [current]: num }))
    next()
  }

  const isNumStep = current === "bust" || current === "waist" || current === "hips"
  const progress = Math.round(((step + 1) / STEPS.length) * 100)

  return (
    <div ref={topRef} className="mx-auto w-full max-w-2xl scroll-mt-24">
      {phase === "report" && report ? (
        <ShoppingReport report={report} draft={draft} onBack={back} onRestart={restart} />
      ) : phase === "thinking" ? (
        <Thinking onDone={() => { setPhase("report"); scroll() }} />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(6,110,67,0.35)]">
          {/* assistant header */}
          <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-5 py-4">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-700 text-white">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">Calqulate Shopping Assistant</p>
              <p className="text-xs text-slate-500">Step {step + 1} of {STEPS.length}</p>
            </div>
            <button onClick={back} disabled={step === 0}
              className="text-slate-400 transition hover:text-slate-700 disabled:opacity-0" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>
          <div className="h-1 w-full bg-slate-100">
            <div className="h-full bg-emerald-700 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="px-5 py-7 sm:px-7">
            {/* chat bubble */}
            <div className="mb-6 max-w-[92%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
              <p className="text-[15px] font-medium leading-relaxed text-slate-800">{prompt(current, draft)}</p>
            </div>

            {current === "occasion" && (
              <Grid cols={2}>
                {OCCASIONS.map((o) => (
                  <Choice key={o.v} active={draft.occasion === o.v} onClick={() => pick("occasion", o.v)}>
                    <span className="text-2xl" aria-hidden>{o.icon}</span>
                    <span className="block font-bold text-slate-900">{o.label}</span>
                    <span className="block text-xs text-slate-500">{o.hint}</span>
                  </Choice>
                ))}
              </Grid>
            )}

            {current === "fit" && (
              <div className="space-y-3">
                {FITS.map((f) => (
                  <Row key={f.v} active={draft.fit === f.v} onClick={() => pick("fit", f.v)}
                    title={f.label} sub={f.hint} />
                ))}
              </div>
            )}

            {current === "brand" && (
              <Grid cols={3}>
                {BRANDS.map((b) => (
                  <Choice key={b.v} active={draft.brand === b.v} onClick={() => pick("brand", b.v)}>
                    <span className="block text-sm font-bold text-slate-900">{b.label}</span>
                    {b.v !== "unknown" && (
                      <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        {BRAND_FIT[b.v].label}
                      </span>
                    )}
                  </Choice>
                ))}
              </Grid>
            )}

            {current === "fabric" && (
              <Grid cols={2}>
                {FABRICS.map((f) => (
                  <Choice key={f.v} active={draft.fabric === f.v} onClick={() => pick("fabric", f.v)}>
                    <span className="block text-sm font-bold text-slate-900">{f.label}</span>
                    {f.v !== "unknown" && (
                      <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        {FABRIC_FIT[f.v].label}
                      </span>
                    )}
                  </Choice>
                ))}
              </Grid>
            )}

            {isNumStep && (
              <form onSubmit={(e) => { e.preventDefault(); submitNum() }}>
                <div className="mx-auto mb-4 flex w-fit gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                  {(["in", "cm"] as const).map((u) => (
                    <button key={u} type="button" onClick={() => setDraft((d) => ({ ...d, units: u }))}
                      aria-pressed={draft.units === u}
                      className={`min-h-[36px] rounded-full px-5 text-sm font-bold transition ${
                        draft.units === u ? "bg-emerald-700 text-white" : "text-slate-500"
                      }`}>
                      {u}
                    </button>
                  ))}
                </div>
                <div className="mx-auto flex w-56 items-stretch overflow-hidden rounded-2xl border-2 border-slate-200 focus-within:border-emerald-700">
                  <input autoFocus inputMode="decimal" type="number" step="any" value={num}
                    onChange={(e) => setNum(e.target.value)}
                    placeholder={placeholder(current, draft.units)}
                    aria-label={current}
                    className="w-full bg-transparent px-4 py-4 text-center text-3xl font-bold tabular-nums text-slate-900 outline-none placeholder:text-slate-300" />
                  <span className="flex items-center bg-slate-50 px-4 text-sm font-bold text-slate-400">
                    {draft.units}
                  </span>
                </div>
                <button type="submit" disabled={!(parseFloat(num) > 0)}
                  className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 text-base font-bold text-white transition hover:bg-emerald-800 disabled:opacity-40">
                  {current === "hips" ? "Build my report" : "Continue"} <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-3 text-center text-xs text-slate-400">{tip(current)}</p>
              </form>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 px-5 py-3 text-xs font-medium text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Private. Nothing is stored or uploaded.
          </div>
        </div>
      )}
    </div>
  )
}

/* ── conversational copy ─────────────────────────────────────────────────── */
function prompt(s: Step, d: Draft): string {
  switch (s) {
    case "occasion": return "Hello. Let's find the size that will actually fit you. First, what are you shopping for?"
    case "fit": return `Got it, ${occasionWord(d.occasion)}. How do you like a dress to sit on you?`
    case "brand": return "Which brand are you buying from? This matters more than most people realise, because every brand grades differently."
    case "fabric": return `And what is it made of? ${d.brand && d.brand !== "unknown" ? `We already know ${brandName(d.brand)} runs ${BRAND_FIT[d.brand].label.toLowerCase()}.` : ""} Stretch changes everything.`
    case "bust": return "Now the measurements. Around the fullest part of your bust, tape level, wearing a non-padded bra."
    case "waist": return "Your natural waist, the narrowest part of your torso. Do not suck in."
    case "hips": return "Last one. The widest part of your hips and seat."
  }
}
function occasionWord(o?: Occasion) {
  const m: Record<Occasion, string> = {
    everyday: "something for everyday", office: "something for the office", party: "a party dress",
    formal: "something formal", wedding: "a wedding dress", vacation: "something for vacation",
  }
  return o ? m[o] : "noted"
}
function brandName(b: Brand) {
  const m: Partial<Record<Brand, string>> = {
    zara: "Zara", hm: "H&M", shein: "Shein", asos: "ASOS", mango: "Mango",
    oldnavy: "Old Navy", boohoo: "Boohoo", uniqlo: "Uniqlo",
  }
  return m[b] ?? "that brand"
}
const placeholder = (s: Step, u: Units) =>
  u === "in" ? { bust: "36", waist: "29", hips: "39" }[s as "bust"] ?? "36"
             : { bust: "91", waist: "74", hips: "99" }[s as "bust"] ?? "91"
const tip = (s: Step) => ({
  bust: "Keep the tape level across your back.",
  waist: "Bend to one side. The crease that forms is your waist.",
  hips: "Feet together, tape parallel to the floor.",
}[s as "bust"] ?? "")

/* ── small building blocks ───────────────────────────────────────────────── */
function Grid({ cols, children }: { cols: 2 | 3; children: React.ReactNode }) {
  return <div className={`grid gap-2.5 ${cols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>{children}</div>
}
function Choice({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={`min-h-[76px] rounded-2xl border-2 p-3 text-center transition-all active:scale-[0.98] ${
        active ? "border-emerald-700 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-300"
      }`}>
      {children}
    </button>
  )
}
function Row({ active, onClick, title, sub }: { active?: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={`group flex min-h-[64px] w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.99] ${
        active ? "border-emerald-700 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-300"
      }`}>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-slate-900">{title}</span>
        <span className="block text-sm text-slate-500">{sub}</span>
      </span>
      <ArrowRight className="h-5 w-5 flex-shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-700" />
    </button>
  )
}

/* ── thinking ────────────────────────────────────────────────────────────── */
function Thinking({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = THINKING.map((_, idx) => setTimeout(() => setI(idx), idx * 420))
    const done = setTimeout(onDone, THINKING.length * 420 + 300)
    return () => { t.forEach(clearTimeout); clearTimeout(done) }
  }, [onDone])
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_20px_60px_-30px_rgba(6,110,67,0.35)]">
      <span className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-200/60" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
          <Loader2 className="h-9 w-9 animate-spin" />
        </span>
      </span>
      <p className="mt-7 text-lg font-medium text-slate-700">{THINKING[i]}…</p>
      <div className="mt-5 h-1.5 w-56 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-emerald-700 transition-all duration-400"
          style={{ width: `${((i + 1) / THINKING.length) * 100}%` }} />
      </div>
    </div>
  )
}

/* ── the shopping report ─────────────────────────────────────────────────── */
const RISK_UI = {
  low: { label: "Low return risk", cls: "bg-emerald-50 text-emerald-800 border-emerald-300", icon: <ThumbsUp className="h-4 w-4" /> },
  medium: { label: "Medium return risk", cls: "bg-amber-50 text-amber-800 border-amber-300", icon: <AlertTriangle className="h-4 w-4" /> },
  high: { label: "High return risk", cls: "bg-rose-50 text-rose-700 border-rose-300", icon: <AlertTriangle className="h-4 w-4" /> },
} as const

function ShoppingReport({
  report, draft, onBack, onRestart,
}: {
  report: NonNullable<ReturnType<typeof buildReport>>
  draft: Draft
  onBack: () => void
  onRestart: () => void
}) {
  const r = report
  const risk = RISK_UI[r.risk]
  const brand = draft.brand ?? "unknown"
  const fabric = draft.fabric ?? "unknown"

  return (
    <div className="space-y-4">
      {/* HERO: the size */}
      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-white p-6 text-center shadow-[0_20px_60px_-28px_rgba(6,110,67,0.35)] sm:p-8">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
          <Sparkles className="h-3.5 w-3.5" /> Calqulate recommends
        </p>
        <div className="mt-4 flex items-baseline justify-center gap-2">
          <span className="text-2xl font-semibold text-slate-400">US</span>
          <span className="text-6xl font-bold tabular-nums text-emerald-800 sm:text-7xl">{r.size.us}</span>
        </div>
        <p className="mt-2 text-slate-500">
          UK {r.size.uk} · EU {r.size.eu} · AU {r.size.au} · JP {r.size.jp} · India {r.size.india}
        </p>

        {/* confidence */}
        <div className="mx-auto mt-6 max-w-sm">
          <div className="flex items-end justify-between">
            <span className="text-sm font-bold text-slate-700">Fit confidence</span>
            <span className="text-2xl font-extrabold tabular-nums text-slate-900">{r.confidence}%</span>
          </div>
          <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-emerald-600 transition-all duration-1000"
              style={{ width: `${r.confidence}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="flex gap-0.5" aria-label={`${r.stars} of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`h-3 w-3 rounded-sm ${i < r.stars ? "bg-emerald-600" : "bg-slate-200"}`} />
              ))}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${risk.cls}`}>
              {risk.icon} {risk.label}
            </span>
          </div>
        </div>
      </div>

      {/* WHY */}
      <Card icon={<Sparkles className="h-4 w-4" />} title="Why this size">
        <ul className="space-y-2">
          {r.reasons.map((x) => (
            <li key={x} className="flex gap-2.5 text-[14px] leading-relaxed text-slate-600">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" /> {x}
            </li>
          ))}
        </ul>
        {r.backup && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 p-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-extrabold text-slate-700">
              {r.backup.us}
            </span>
            <p className="text-[13px] leading-relaxed text-slate-600">
              <strong className="text-slate-900">Backup size US {r.backup.us}.</strong>{" "}
              {r.backupDirection === "up"
                ? "If returns are free, order this too. The risk here is the dress being too tight, and that is the failure you cannot fix."
                : "If you want it closer to the body, this is your alternative."}
            </p>
          </div>
        )}
      </Card>

      {/* BRAND + FABRIC INTELLIGENCE */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card icon={<ShoppingBag className="h-4 w-4" />} title="Brand intelligence">
          <p className="text-sm font-bold text-slate-900">
            {brandName(brand)}: {BRAND_FIT[brand].label}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{BRAND_FIT[brand].note}</p>
        </Card>
        <Card icon={<Shirt className="h-4 w-4" />} title="Fabric intelligence">
          <p className="text-sm font-bold text-slate-900">{FABRIC_FIT[fabric].label}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{FABRIC_FIT[fabric].note}</p>
        </Card>
      </div>

      {/* BODY SHAPE STYLING */}
      <Card icon={<Heart className="h-4 w-4" />} title={`Your shape: ${SHAPE_LABEL[r.bodyShape]}`}>
        <p className="text-[13px] leading-relaxed text-slate-600">
          Calqulate detected this from your measurements. It decides which cuts will actually flatter you, not just which
          size fits.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-emerald-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">Best styles</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {r.styles.best.map((s) => (
                <span key={s} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Approach with care</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {r.styles.avoid.map((s) => (
                <span key={s} className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-3 text-[13px] text-slate-500">
          Want to see this in 3D? Try the{" "}
          <Link href="/health/body-shape-calculator" className="font-bold text-emerald-700 underline underline-offset-2">
            Calqulate.net Body Shape Calculator
          </Link>
          .
        </p>
      </Card>

      {/* INTERNATIONAL */}
      <Card icon={<Globe className="h-4 w-4" />} title="Your size around the world">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {[
            ["US", r.size.us], ["UK", r.size.uk], ["EU", r.size.eu],
            ["AU", r.size.au], ["Japan", r.size.jp], ["India", r.size.india],
          ].map(([l, v]) => (
            <div key={String(l)} className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-2.5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">{l}</p>
              <p className="mt-0.5 text-lg font-extrabold text-slate-900">{v}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* CHECKLIST */}
      <Card icon={<Check className="h-4 w-4" />} title="Before you click buy">
        <ul className="space-y-2">
          {r.checklist.map((c) => (
            <li key={c} className="flex gap-2.5 text-[14px] leading-relaxed text-slate-600">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-600" /> {c}
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex items-center justify-between px-1 pb-2">
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> Change an answer
        </button>
        <button onClick={onRestart} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-700">
          <RotateCcw className="h-4 w-4" /> Start over
        </button>
      </div>

      <p className="px-2 text-center text-xs leading-relaxed text-slate-400">
        Calqulate.net compares your measurements against standard sizing and adjusts for brand grading, fabric and cut.
        No sizing standard is binding on brands, so always check the garment measurements on the product page.
      </p>
    </div>
  )
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_40px_-28px_rgba(6,110,67,0.35)] sm:p-6">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
        <span className="text-emerald-700">{icon}</span> {title}
      </h3>
      {children}
    </div>
  )
}
