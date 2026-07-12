/**
 * The positioning layer for the homepage.
 *
 * The old story was "here is our GLP-1 tracker", which sells a product nobody
 * searched for. The new story is "everything you need to succeed on a GLP-1",
 * and it walks the user down the journey they are actually on:
 *
 *   Calculate  ->  Track  ->  Understand  ->  Improve
 *
 * Someone Googling "semaglutide dose calculator" does not want an app. They want
 * today's answer. The tracker is what they need next, and premium is what they
 * need later. So free is framed as TODAY and premium as THE FUTURE, never as a
 * feature list.
 *
 * Server component, no client JS. Mobile-first. No em dashes.
 */

import Link from "next/link"
import {
  Calculator, ClipboardList, LineChart, Target, ArrowRight, Check,
  AlertTriangle, Sparkles, Lock,
} from "lucide-react"

/* ─── Why people fail ─────────────────────────────────────────────────────── */
const FAILURES = [
  { t: "They lose muscle, not just fat", d: "Up to 40 percent of the weight lost on a GLP-1 can be muscle. Muscle is what keeps your metabolism high, so losing it is how the weight finds its way back." },
  { t: "They do not eat enough protein", d: "The drug kills your appetite. That is the point. But it also makes protein the easiest thing in the world to under-eat, and protein is what protects your muscle." },
  { t: "They get blindsided by a plateau", d: "Progress stalls, they assume the drug stopped working, and they quit. Most plateaus are predictable weeks before they happen." },
  { t: "They mistime the dose", d: "Cravings return late in the cycle when the medication level drops. Knowing where you are in that curve changes how you plan your week." },
  { t: "They tough out side effects alone", d: "Nausea and fatigue spike after a dose increase. Knowing that is normal, and when it should pass, is the difference between staying on and giving up." },
  { t: "They stop, and regain", d: "Nobody prepared them for what happens after. The people who keep the weight off protected their muscle while they were losing it." },
]

export function WhyPeopleFail() {
  return (
    <section className="border-y border-line bg-surface py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-800 ring-1 ring-line">
            <AlertTriangle className="h-3.5 w-3.5" /> The real problem
          </span>
          <h2 className="mt-5 text-balance text-2xl font-extrabold tracking-tight text-ink sm:text-4xl">
            People do not fail on GLP-1s because the medicine does not work
          </h2>
          <p className="mt-4 text-pretty text-base text-copy sm:text-lg">
            The medicine works. It works extremely well. People fail because nobody tells them what to do around it.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FAILURES.map((f) => (
            <div key={f.t} className="rounded-3xl border border-line bg-white p-5 shadow-[0_10px_40px_-28px_rgba(6,110,67,0.35)]">
              <h3 className="font-bold text-ink">{f.t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-copy">{f.d}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-base font-semibold text-ink">
          Calqulate Vitals is the daily companion that handles all six.
        </p>
      </div>
    </section>
  )
}

/* ─── The journey ─────────────────────────────────────────────────────────── */
const JOURNEY = [
  {
    n: "01",
    icon: Calculator,
    step: "Calculate",
    line: "Get today's answer, free, no account.",
    items: [
      { label: "GLP-1 dose calculator", href: "/health/glp-1-dose-calculator" },
      { label: "Fat vs muscle check", href: "/health/glp-1-dose-calculator" },
      { label: "Weight loss percentage", href: "/health/weight-loss-percentage-calculator" },
      { label: "Protein and lean mass", href: "/health/lean-body-mass-calculator" },
      { label: "Body fat percentage", href: "/health/body-fat-calculator" },
      { label: "Daily calories", href: "/health/tdee-calculator" },
    ],
  },
  {
    n: "02",
    icon: ClipboardList,
    step: "Track",
    line: "Then you realize you need to do this every week.",
    items: [
      { label: "Every injection" }, { label: "Weight and body composition" },
      { label: "Protein, food and water" }, { label: "Side effects and energy" },
      { label: "Exercise" }, { label: "Refills and supply" },
    ],
  },
  {
    n: "03",
    icon: LineChart,
    step: "Understand",
    line: "Now the data starts telling you things.",
    items: [
      { label: "How much medication is active today" },
      { label: "Whether you are losing fat or muscle" },
      { label: "When a plateau is coming" },
      { label: "Why your progress slowed" },
      { label: "How you compare to the trials" },
      { label: "What to do next, every week" },
    ],
  },
  {
    n: "04",
    icon: Target,
    step: "Improve",
    line: "And you start making better decisions.",
    items: [
      { label: "A protein target you will actually hit" },
      { label: "Training that protects your muscle" },
      { label: "Dose timing around your life" },
      { label: "Reports your doctor can use" },
      { label: "A forecast of your goal date" },
      { label: "A plan for when you come off" },
    ],
  },
]

export function Glp1Journey() {
  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-2xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Calculate. Track. Understand. Improve.
          </h2>
          <p className="mt-4 text-pretty text-base text-copy sm:text-lg">
            Most people arrive here looking for one number. They stay because the number was only the beginning.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-4">
          {JOURNEY.map((s, i) => {
            const Icon = s.icon
            const isFirst = i === 0
            return (
              <div
                key={s.step}
                className={`relative rounded-3xl border p-6 ${
                  isFirst
                    ? "border-brand bg-brand-50/50 shadow-[0_16px_50px_-30px_rgba(6,110,67,0.5)]"
                    : "border-line bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${
                    isFirst ? "bg-brand text-white" : "bg-brand-50 text-brand-800"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-widest text-faint">{s.n}</span>
                    <h3 className="text-lg font-extrabold text-ink">{s.step}</h3>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-copy">{s.line}</p>

                <ul className="mt-4 space-y-1.5">
                  {s.items.map((it) => (
                    <li key={it.label} className="flex items-start gap-2 text-[13px] leading-snug text-copy">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand" />
                      {"href" in it && it.href ? (
                        <Link href={it.href} className="hover:text-brand-800 hover:underline">{it.label}</Link>
                      ) : (
                        <span>{it.label}</span>
                      )}
                    </li>
                  ))}
                </ul>

                {isFirst && (
                  <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-800 ring-1 ring-brand/30">
                    Free, no account
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ─── Free is today. Premium is the future. ───────────────────────────────── */
const FREE_TODAY = [
  "Log every injection, weight and meal",
  "See how much medication is still working today",
  "Never miss a dose, with reminders",
  "Track side effects and energy",
  "Know if you are on track against the clinical trials",
  "Share a progress scorecard you are proud of",
]
const PREMIUM_LATER = [
  "See when you will reach your goal weight",
  "Make sure you are losing fat, not the muscle that keeps weight off",
  "Find out exactly why your weight loss slowed",
  "Know when you are ready, or not ready, to increase your dose",
  "Bring organized progress reports to your appointments",
  "Keep your complete treatment history forever",
]

export function FreeThenPremium({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <section className="border-t border-line bg-surface py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-2xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Start free. Upgrade when the future matters.
          </h2>
          <p className="mt-4 text-pretty text-base text-copy sm:text-lg">
            Free answers today. Premium answers what happens next. You will know when you need it.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          {/* Today */}
          <div className="rounded-3xl border-2 border-brand bg-white p-6 shadow-[0_16px_50px_-30px_rgba(6,110,67,0.5)] sm:p-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-800">
              <Check className="h-3.5 w-3.5" /> Free forever
            </span>
            <h3 className="mt-4 text-xl font-extrabold text-ink">Everything you need to start</h3>
            <p className="mt-1 text-sm text-copy">No card. No trial timer. This does not expire.</p>
            <ul className="mt-5 space-y-2.5">
              {FREE_TODAY.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm leading-relaxed text-copy">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href={loggedIn ? "/dashboard/glp1" : "/signup?next=/dashboard/glp1"}
              className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-600"
            >
              {loggedIn ? "Open my tracker" : "Start free"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Later */}
          <div className="rounded-3xl border border-line bg-white p-6 sm:p-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
              <Sparkles className="h-3.5 w-3.5" /> When you are ready
            </span>
            <h3 className="mt-4 text-xl font-extrabold text-ink">Premium looks forward</h3>
            <p className="mt-1 text-sm text-copy">Most people upgrade around week six, when the questions change.</p>
            <ul className="mt-5 space-y-2.5">
              {PREMIUM_LATER.map((f) => (
                <li key={f} className="flex gap-2.5 text-sm leading-relaxed text-copy">
                  <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/pricing"
              className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-line px-6 font-bold text-ink transition hover:bg-surface"
            >
              See what Premium adds
            </Link>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-sm text-faint">
          You do not need to decide now. Get today&apos;s answer, build the habit, and upgrade only when you want to know
          what happens next.
        </p>
      </div>
    </section>
  )
}
