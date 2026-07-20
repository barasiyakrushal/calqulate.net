"use client"

import { parseNumber } from "@/lib/utils";

/**
 * The story layer.
 *
 * The homepage used to sell features. This sells a trajectory: who you become,
 * and the fact that the scale cannot see it. Everything here revolves around one
 * owned idea, HEALTH TRAJECTORY, because a brand needs one thing to own and a
 * feature list is not it.
 *
 * Order on the page: problem -> transformation -> trajectory -> proof -> promise.
 * Mobile-first, brand tokens only, no em dashes.
 */

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, X, Sparkles, TrendingUp } from "lucide-react"

function useInView<T extends Element>() {
  const ref = useRef<T | null>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return }
    const io = new IntersectionObserver((e) => e.forEach((x) => x.isIntersecting && setSeen(true)), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [seen])
  return { ref, seen }
}

/* ═══ 1. THE PROBLEM: one unforgettable number ═══════════════════════════════ */
export function MuscleStat() {
  const { ref, seen } = useInView<HTMLDivElement>()
  return (
    <section ref={ref} className="border-y border-line bg-ink py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="text-[5rem] font-extrabold leading-none tracking-tighter text-white sm:text-[9rem]"
            style={{
              opacity: seen ? 1 : 0,
              transform: seen ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 700ms ease, transform 900ms cubic-bezier(.22,1,.36,1)",
            }}
          >
            40<span className="text-brand">%</span>
          </p>
          <p className="mt-2 text-balance text-xl font-semibold text-white/90 sm:text-3xl">
            of the weight you lose on a GLP-1 can be muscle.
          </p>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-white/50 sm:text-lg">
            Muscle is what keeps the weight off. Lose it, and your metabolism slows, and the weight finds its way back
            the moment you stop.
          </p>

          {/* the bar that makes it land */}
          <div className="mx-auto mt-10 max-w-lg">
            <div className="flex h-14 w-full overflow-hidden rounded-2xl">
              <div
                className="flex items-center justify-center bg-brand"
                style={{
                  width: seen ? "60%" : "100%",
                  transition: "width 1200ms cubic-bezier(.22,1,.36,1) 300ms",
                }}
              >
                <span className="text-sm font-bold text-white">Fat</span>
              </div>
              <div
                className="flex items-center justify-center bg-rose-500"
                style={{
                  width: seen ? "40%" : "0%",
                  transition: "width 1200ms cubic-bezier(.22,1,.36,1) 300ms",
                }}
              >
                <span className="text-sm font-bold text-white">Muscle</span>
              </div>
            </div>
            <p className="mt-3 text-sm text-white/40">
              The scale shows one number. It never tells you which half is which.
            </p>
            <p className="mt-6 text-xs leading-relaxed text-white/40">
              Across published GLP-1 trials, lean mass accounted for roughly 25 to 39 percent of the total weight lost,
              a higher share than diet alone typically produces. Prado CM, Phillips SM, Gonzalez MC, Heymsfield SB.
              &ldquo;Muscle matters: the effects of medically induced weight loss on skeletal muscle.&rdquo;{" "}
              <em>The Lancet Diabetes &amp; Endocrinology</em>, 2024.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══ 2. INTERACTIVE: what are you actually losing? ══════════════════════════ */
export function WhatAreYouLosing() {
  const [protein, setProtein] = useState(40)   // percent of target hit
  const [training, setTraining] = useState(1)  // days per week

  const { muscleFrac, fatLb, muscleLb, score } = useMemo(() => {
    const TOTAL = 30
    let frac = 0.4 - (protein / 100) * 0.14 - (training / 5) * 0.15
    frac = Math.min(0.4, Math.max(0.1, frac))
    const m = TOTAL * frac
    return {
      muscleFrac: frac,
      muscleLb: m,
      fatLb: TOTAL - m,
      score: Math.round(100 - ((frac - 0.1) / 0.3) * 55),
    }
  }, [protein, training])

  const musclePct = Math.round(muscleFrac * 100)

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-2xl font-extrabold tracking-tight text-ink sm:text-4xl">
            You lost 30 pounds. But what did you actually lose?
          </h2>
          <p className="mt-4 text-pretty text-base text-copy sm:text-lg">
            Move the sliders. This is the difference between weight you keep off and weight that comes back.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* controls */}
          <div className="rounded-3xl border border-line bg-white p-6">
            <label className="block">
              <span className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-ink">Protein target hit</span>
                <span className="text-lg font-extrabold tabular-nums text-brand-800">{protein}%</span>
              </span>
              <input
                type="range" min={0} max={100} value={protein}
                onChange={(e) => setProtein(parseNumber(e.target.value))}
                aria-label="Percent of protein target hit"
                className="mt-3 h-2 w-full accent-brand"
              />
            </label>

            <label className="mt-7 block">
              <span className="flex items-baseline justify-between">
                <span className="text-sm font-bold text-ink">Resistance training</span>
                <span className="text-lg font-extrabold tabular-nums text-brand-800">
                  {training} {training === 1 ? "day" : "days"}
                </span>
              </span>
              <input
                type="range" min={0} max={5} value={training}
                onChange={(e) => setTraining(parseNumber(e.target.value))}
                aria-label="Resistance training days per week"
                className="mt-3 h-2 w-full accent-brand"
              />
            </label>

            <p className="mt-7 rounded-2xl bg-surface p-4 text-sm leading-relaxed text-copy">
              {musclePct >= 30
                ? "At this rate you are burning the muscle that protects your metabolism. This is how people regain."
                : musclePct >= 20
                  ? "Better. You are protecting some muscle, but there is real room to improve."
                  : "This is what protected weight loss looks like. Almost all of it is fat, and it is far more likely to stay off."}
            </p>
          </div>

          {/* result */}
          <div className="rounded-3xl border border-line bg-white p-6">
            <div className="flex h-16 w-full overflow-hidden rounded-2xl">
              <div
                className="flex items-center justify-center bg-brand transition-all duration-500"
                style={{ width: `${100 - musclePct}%` }}
              >
                <span className="text-sm font-bold text-white">{fatLb.toFixed(0)} lb fat</span>
              </div>
              <div
                className="flex items-center justify-center bg-rose-500 transition-all duration-500"
                style={{ width: `${musclePct}%` }}
              >
                {musclePct >= 14 && (
                  <span className="text-sm font-bold text-white">{muscleLb.toFixed(0)} lb</span>
                )}
              </div>
            </div>
            <div className="mt-2 flex justify-between text-xs font-semibold text-faint">
              <span>Fat lost</span>
              <span className="text-rose-600">{muscleLb.toFixed(1)} lb of muscle lost</span>
            </div>

            <div className="mt-7">
              <div className="flex items-end justify-between">
                <span className="text-sm font-bold text-ink">Chance you keep it off</span>
                <span className="text-3xl font-extrabold tabular-nums text-brand-800">{score}</span>
              </div>
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand to-brand-600 transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>

            <Link
              href="/health/glp-1-dose-calculator"
              className="mt-7 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-600"
            >
              Check your own split, free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-faint">
          This is a simulation, not a measurement of you. It starts from the published GLP-1 range above, where lean
          mass made up roughly 25 to 39 percent of the weight lost, and lowers that share as protein intake and
          resistance training go up, because both are shown to blunt lean mass loss during energy restriction. Your real
          split depends on your rate of loss, your protein, your training and your starting composition, and only a body
          composition measurement can tell you what it actually is. Cava E, Yeat NC, Mittendorfer B. &ldquo;Preserving
          healthy muscle during weight loss.&rdquo; <em>Advances in Nutrition</em>, 2017.
        </p>
      </div>
    </section>
  )
}

/* ═══ 3. THE TRANSFORMATION ══════════════════════════════════════════════════ */
const BEFORE = [
  "You track your weight.",
  "That is it. That is the whole picture.",
]
const AFTER = [
  "How much medication is still working today",
  "How much of your loss is fat, and how much is muscle",
  "Whether a plateau is coming",
  "Why your progress slowed",
  "What to eat, and when to train",
  "When you will reach your goal",
  "How your heart is ageing",
  "A report your doctor can actually use",
]

export function Transformation() {
  return (
    <section className="border-y border-line bg-surface py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-2xl font-extrabold tracking-tight text-ink sm:text-4xl">
            From one number to your whole trajectory
          </h2>
          <p className="mt-4 text-pretty text-base text-copy sm:text-lg">
            Most people on a GLP-1 are flying blind with a bathroom scale. Here is what changes.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          {/* before */}
          <div className="rounded-3xl border border-line bg-white/60 p-7">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
              Before
            </span>
            <div className="mt-6 space-y-3">
              {BEFORE.map((b) => (
                <p key={b} className="flex gap-2.5 text-base leading-relaxed text-faint">
                  <X className="mt-1 h-4 w-4 flex-shrink-0 text-slate-300" /> {b}
                </p>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-slate-50 p-6 text-center">
              <p className="text-4xl font-extrabold tabular-nums text-slate-300">184.2</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">lb</p>
            </div>
          </div>

          {/* after */}
          <div className="rounded-3xl border-2 border-brand bg-white p-7 shadow-[0_20px_60px_-30px_rgba(6,110,67,0.5)]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-800">
              <Sparkles className="h-3.5 w-3.5" /> With Calqulate
            </span>
            <div className="mt-6 space-y-2.5">
              {AFTER.map((a) => (
                <p key={a} className="flex gap-2.5 text-[15px] leading-relaxed text-ink">
                  <Check className="mt-1 h-4 w-4 flex-shrink-0 text-brand" /> {a}
                </p>
              ))}
            </div>
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-lg font-semibold text-ink">
          You are not just losing weight. You are changing your trajectory.
        </p>
      </div>
    </section>
  )
}

/* ═══ 4. THE TRAJECTORY TIMELINE ═════════════════════════════════════════════ */
const TIMELINE = [
  { when: "Today", head: "You get an answer", body: "Your dose, your fat-versus-muscle split, your numbers. Free, no account, thirty seconds." },
  { when: "Week 2", head: "You start logging", body: "Every injection, every weigh-in. The medication curve starts to mean something." },
  { when: "Month 2", head: "Patterns appear", body: "You can see why some weeks work and some do not. Cravings, sleep, protein, dose day." },
  { when: "6 months", head: "You are ahead of it", body: "Plateaus stop surprising you. You know when to hold a dose and when to push." },
  { when: "1 year", head: "You kept it off", body: "Because you protected the muscle that keeps your metabolism running. That was the whole game." },
]

export function TrajectoryTimeline() {
  const { ref, seen } = useInView<HTMLDivElement>()
  return (
    <section ref={ref} className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-800">
            <TrendingUp className="h-3.5 w-3.5" /> Your trajectory
          </span>
          <h2 className="mt-5 text-balance text-2xl font-extrabold tracking-tight text-ink sm:text-4xl">
            It starts with one number. It ends with keeping the weight off.
          </h2>
        </div>

        <ol className="mx-auto mt-12 max-w-2xl">
          {TIMELINE.map((t, i) => {
            const last = i === TIMELINE.length - 1
            return (
              <li
                key={t.when}
                className="relative flex gap-5 pb-8 last:pb-0"
                style={{
                  opacity: seen ? 1 : 0,
                  transform: seen ? "translateY(0)" : "translateY(12px)",
                  transition: `opacity 500ms ease ${i * 120}ms, transform 650ms cubic-bezier(.22,1,.36,1) ${i * 120}ms`,
                }}
              >
                {/* rail */}
                <div className="flex flex-col items-center">
                  <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                    last ? "bg-brand text-white" : "bg-brand-50 text-brand-800 ring-1 ring-brand/20"
                  }`}>
                    {i + 1}
                  </span>
                  {!last && <span className="mt-1 w-0.5 flex-1 rounded-full bg-line" />}
                </div>

                <div className={`flex-1 rounded-3xl border p-5 ${last ? "border-brand bg-brand-50/40" : "border-line bg-white"}`}>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-faint">{t.when}</span>
                  <h3 className="mt-0.5 text-lg font-extrabold text-ink">{t.head}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-copy">{t.body}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

/* ═══ 5. THE FOUNDER STORY ═══════════════════════════════════════════════════ */
export function FoundersStory() {
  return (
    <section className="border-y border-line bg-surface py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-faint">Why we built this</span>
          <div className="mt-6 space-y-5 text-xl font-medium leading-relaxed text-ink sm:text-2xl">
            <p>We watched people lose forty pounds.</p>
            <p>And lose their muscle with it.</p>
            <p className="text-copy">Nobody warned them. Nobody was measuring it. They found out a year later, when the weight came back and would not leave again.</p>
            <p className="font-bold">So we built Calqulate.</p>
          </div>
          <p className="mt-8 text-base leading-relaxed text-copy">
            Not another weight app. The one thing the scale cannot do: tell you what you are actually losing, and whether
            you will still be here in a year.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ═══ 6. THE FINAL PROMISE ═══════════════════════════════════════════════════ */
export function FinalPromise({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <section className="bg-ink py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            This is the last time you will wonder whether your medication is working.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-white/50">
            Lose fat. Keep muscle. Stay healthy. Start with today&apos;s answer, free.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={loggedIn ? "/dashboard/glp1" : "/signup?next=/dashboard/glp1"}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-brand px-8 text-base font-bold text-white transition hover:-translate-y-0.5 hover:bg-brand-600 sm:w-auto"
            >
              {loggedIn ? "Open my tracker" : "Start free"} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/health/glp-1-dose-calculator"
              className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl border border-white/20 px-8 text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Get today&apos;s answer first
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/30">No card. The calculators are free forever.</p>
        </div>
      </div>
    </section>
  )
}
