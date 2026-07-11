import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import SleepCycleCalculator from "@/components/calculators/sleep-cycle-calculator"
import SleepCycleVisualization from "@/components/sleep/SleepCycleVisualization"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { SourcesSection } from "@/components/seo/sources-section"
import {
  Moon,
  Info,
  AlertTriangle,
  CheckCircle2,
  Sun,
  BedDouble,
  Brain,
  Activity,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { RelatedCalculators } from "@/components/calculators/related-calculators"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"

const TITLE = "Sleep Cycle Calculator: What Time Should I Sleep or Wake Up?"
const DESCRIPTION =
  "Free sleep cycle calculator. Find the best bedtime or wake up time using complete 90-minute sleep cycles, so your alarm rings at the end of a cycle instead of during deep sleep. Includes bedtime charts, a REM cycle chart, and answers for waking at 5, 6, 7 or 8 AM."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "sleep cycle calculator, sleep calculator, rem sleep calculator, sleep cycle chart, 90 minute sleep cycle calculator, bedtime calculator, wake up time calculator, what time should i sleep, what time should i wake up, wake up at 6 what time to sleep, sleep schedule planner, circadian rhythm calculator, how many sleep cycles do i need, sleep cycle graph",
  alternates: { canonical: "https://calqulate.net/health/sleep-cycle-calculator" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://calqulate.net/health/sleep-cycle-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

// ── Data used by the tables. Cycle = 90 min, sleep latency = 15 min, matching
// the calculator exactly: bedtime = wake - (cycles x 90) - 15.
const WAKE_TABLE: { wake: string; c6: string; c5: string; c4: string }[] = [
  { wake: "5:00 AM", c6: "7:45 PM", c5: "9:15 PM", c4: "10:45 PM" },
  { wake: "6:00 AM", c6: "8:45 PM", c5: "10:15 PM", c4: "11:45 PM" },
  { wake: "6:30 AM", c6: "9:15 PM", c5: "10:45 PM", c4: "12:15 AM" },
  { wake: "7:00 AM", c6: "9:45 PM", c5: "11:15 PM", c4: "12:45 AM" },
  { wake: "7:30 AM", c6: "10:15 PM", c5: "11:45 PM", c4: "1:15 AM" },
  { wake: "8:00 AM", c6: "10:45 PM", c5: "12:15 AM", c4: "1:45 AM" },
]

// wake = bedtime + 15 min latency + (cycles x 90)
const BEDTIME_TABLE: { bed: string; c4: string; c5: string; c6: string }[] = [
  { bed: "9:00 PM", c4: "3:15 AM", c5: "4:45 AM", c6: "6:15 AM" },
  { bed: "10:00 PM", c4: "4:15 AM", c5: "5:45 AM", c6: "7:15 AM" },
  { bed: "11:00 PM", c4: "5:15 AM", c5: "6:45 AM", c6: "8:15 AM" },
  { bed: "12:00 AM", c4: "6:15 AM", c5: "7:45 AM", c6: "9:15 AM" },
  { bed: "1:00 AM", c4: "7:15 AM", c5: "8:45 AM", c6: "10:15 AM" },
]

const CYCLE_HOURS = [
  { cycles: "3 cycles", hours: "4.5 hours", verdict: "Emergency minimum, not sustainable" },
  { cycles: "4 cycles", hours: "6 hours", verdict: "Short night, workable occasionally" },
  { cycles: "5 cycles", hours: "7.5 hours", verdict: "The sweet spot for most adults" },
  { cycles: "6 cycles", hours: "9 hours", verdict: "Ideal for teens, athletes and recovery" },
]

const STAGES = [
  { stage: "Stage 1 (light)", length: "About 5 minutes", purpose: "The doze-off transition between waking and sleeping" },
  { stage: "Stage 2 (light)", length: "About 25 minutes", purpose: "Heart rate and body temperature fall. Most of your night is spent here" },
  { stage: "Stage 3 (deep)", length: "About 30 minutes", purpose: "Tissue repair, immune function and physical recovery" },
  { stage: "REM sleep", length: "10 to 30 minutes", purpose: "Dreaming, memory consolidation and emotional processing" },
]

const AGE_TABLE = [
  { group: "Teens (14 to 17)", sleep: "8 to 10 hours", cycles: "6 cycles", note: "Cycles can run slightly longer, around 90 to 100 minutes" },
  { group: "Adults (18 to 64)", sleep: "7 to 9 hours", cycles: "5 to 6 cycles", note: "The standard 90-minute cycle applies" },
  { group: "Older adults (65+)", sleep: "7 to 8 hours", cycles: "5 cycles", note: "Lighter, more fragmented sleep with more night waking" },
]

const faqs = [
  {
    question: "What is a sleep cycle calculator?",
    answer:
      "A sleep cycle calculator estimates the best bedtime or wake up time by counting complete 90-minute sleep cycles. Instead of waking you during deep sleep, it recommends alarm times that land at the end of a cycle, which helps reduce morning grogginess, also called sleep inertia.",
  },
  {
    question: "What time should I sleep to wake up at 6 AM?",
    answer:
      "To wake at 6:00 AM, go to bed at 8:45 PM for 6 cycles, 10:15 PM for 5 cycles, or 11:45 PM for 4 cycles. Each option includes about 15 minutes to fall asleep. Five cycles, meaning a 10:15 PM bedtime, gives you 7.5 hours of sleep and suits most adults.",
  },
  {
    question: "What time should I wake up if I sleep at 11 PM?",
    answer:
      "If you get into bed at 11:00 PM and fall asleep by around 11:15 PM, set your alarm for 5:15 AM after 4 cycles, 6:45 AM after 5 cycles, or 8:15 AM after 6 cycles.",
  },
  {
    question: "How long is a sleep cycle?",
    answer:
      "A full sleep cycle lasts about 90 minutes on average, moving through light sleep, deep sleep and REM sleep. Individual cycles vary between roughly 80 and 110 minutes, and they tend to get longer and more REM heavy toward morning.",
  },
  {
    question: "How many sleep cycles do I need?",
    answer:
      "Most healthy adults complete four to six sleep cycles a night. Five cycles equals 7.5 hours and is the practical target for most people, which sits inside the CDC recommendation of seven or more hours a night for adults.",
  },
  {
    question: "Is 7.5 hours of sleep better than 8 hours?",
    answer:
      "It can be. 7.5 hours is exactly five 90-minute cycles, so your alarm is likely to ring in light sleep. Eight hours lands you about 30 minutes into a sixth cycle, which can mean waking from deep sleep and feeling groggy even though you slept longer. If 8 hours leaves you foggy, try 7.5 or 9 hours.",
  },
  {
    question: "How many REM cycles do you get in 8 hours?",
    answer:
      "In roughly eight hours of sleep you pass through about five REM periods, one at the end of each cycle. Early REM periods are short, around 10 minutes, while the last one before waking can run 30 minutes or more, which is why you often remember dreams from the morning.",
  },
  {
    question: "Does age change sleep cycle recommendations?",
    answer:
      "Total sleep need changes with age, but cycle length stays broadly similar. Teenagers need 8 to 10 hours, so 6 cycles suits them. Adults need 7 to 9 hours, so 5 to 6 cycles. Older adults often experience lighter sleep and more night waking, and may find 5 cycles with a consistent schedule works best.",
  },
  {
    question: "If I sleep now, what time should I wake up?",
    answer:
      "Add about 15 minutes to fall asleep, then add 90-minute blocks. From the moment you get into bed, 6 hours later is 4 cycles, 7.5 hours later is 5 cycles, and 9 hours later is 6 cycles. The calculator above does this instantly from your current time.",
  },
  {
    question: "Why do I feel tired after sleeping 8 hours?",
    answer:
      "You most likely woke in the middle of a cycle, during deep sleep, which produces sleep inertia and can leave you groggy for up to 30 minutes. Sleep quality, alcohol, stress and an irregular schedule also matter, so total hours alone do not guarantee feeling rested.",
  },
  {
    question: "How long does it take to fall asleep?",
    answer:
      "A healthy adult typically falls asleep in 10 to 20 minutes. Sleep medicine calls this sleep latency. The calculator uses 15 minutes by default, and you can adjust it if you know you drift off faster or slower.",
  },
  {
    question: "Is 90 minutes always one full sleep cycle?",
    answer:
      "No. 90 minutes is the widely used average. Real cycles range from about 80 to 110 minutes and change through the night, with more deep sleep early and more REM later. Treat the times as a close guide and fine-tune by 15 minutes if you still wake groggy.",
  },
]

// HowTo structured data: the numbered steps below are snippet eligible.
const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to use a sleep cycle calculator",
  description:
    "Find the best bedtime or wake up time by counting complete 90-minute sleep cycles and allowing time to fall asleep.",
  totalTime: "PT1M",
  step: [
    { "@type": "HowToStep", position: 1, name: "Choose your direction", text: "Decide whether you know your wake up time and need a bedtime, or you are going to bed now and need an alarm time." },
    { "@type": "HowToStep", position: 2, name: "Enter your time", text: "Enter the time you must wake up, or the time you are getting into bed." },
    { "@type": "HowToStep", position: 3, name: "Set how long you take to fall asleep", text: "The default is 15 minutes of sleep latency. Increase it if you usually lie awake longer." },
    { "@type": "HowToStep", position: 4, name: "Pick a full cycle", text: "Choose an option that completes 4, 5 or 6 whole 90-minute cycles so your alarm rings at the end of a cycle rather than during deep sleep." },
  ],
}

export default function SleepCycleCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Sleep Cycle Calculator"
        description="Find the best bedtime or wake up time using complete 90-minute sleep cycles, so you wake at the end of a cycle instead of during deep sleep."
        url="https://calqulate.net/health/sleep-cycle-calculator"
      />
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />

      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 border-b border-slate-200">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-700 mb-5">
              <Moon className="h-3.5 w-3.5" />
              Wake up at the end of a cycle, not in the middle of one
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-balance leading-tight text-slate-900">
              Sleep Cycle Calculator: What Time Should I Sleep or Wake Up?
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              Find the best bedtime or wake up time using complete 90-minute sleep cycles. Sleeping eight hours and still
              feeling exhausted usually means your alarm went off in the middle of deep sleep, not that you slept too little.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href="#calculator" className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-800">
                Calculate my sleep times ↓
              </a>
            </div>
          </div>
        </section>

        {/* 30-SECOND ANSWER (featured snippet / AI Overview target) */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-8">
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-6 md:p-7">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Sparkles className="h-4 w-4" /> The 30-second answer
              </p>
              <p className="text-base md:text-lg leading-relaxed text-slate-800">
                A sleep cycle calculator estimates the best bedtime or wake up time by counting complete 90-minute sleep
                cycles. Instead of waking you during deep sleep, it recommends alarm times that align with the end of a
                cycle, which helps reduce sleep inertia, the groggy feeling that can last up to 30 minutes after waking.
                Most adults need four to six full cycles a night. Five cycles equals 7.5 hours and is the practical target
                for most people.
              </p>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "90 min", label: "One cycle", sub: "Light, deep, REM" },
              { value: "4 to 6", label: "Cycles a night", sub: "Adult range" },
              { value: "7.5 h", label: "Sweet spot", sub: "Five cycles" },
              { value: "15 min", label: "To fall asleep", sub: "Sleep latency" },
              { value: "100%", label: "Private", sub: "In-browser" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-5 text-center">
                <p className="text-2xl md:text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CALCULATOR */}
        <section id="calculator" className="scroll-mt-20 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <SleepCycleCalculator />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-slate max-w-none mt-8 space-y-14">

              {/* HOW TO READ YOUR RESULT */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <Info className="h-6 w-6 text-emerald-700" />
                  How to read your result
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  Each time the calculator gives you is the end of a complete 90-minute cycle, with about 15 minutes added
                  for falling asleep. Any of the times will work, but they are not equal. Pick the option that gives you
                  five or six cycles if you can. Four cycles will get you through a short night, and three is an emergency
                  minimum rather than a plan.
                </p>
                <div className="not-prose mt-5 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-sm border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">Sleep cycles</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">Total sleep</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">What it means</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {CYCLE_HOURS.map((r, i) => (
                        <tr key={r.cycles} className={i % 2 ? "bg-slate-50/60" : "bg-white"}>
                          <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{r.cycles}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{r.hours}</td>
                          <td className="px-4 py-3 text-slate-600">{r.verdict}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* CLUSTER: what time to sleep to wake up at X */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <Sun className="h-6 w-6 text-emerald-700" />
                  What time should I sleep to wake up at 6 AM?
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  If you plan to wake up at 6:00 AM, work backwards in complete 90-minute cycles and add about 15 minutes
                  to fall asleep. That gives three sensible bedtimes: <strong>8:45 PM</strong> for six cycles,{" "}
                  <strong>10:15 PM</strong> for five cycles, and <strong>11:45 PM</strong> for four cycles. For most adults
                  the 10:15 PM option is the one to aim for, because five cycles is 7.5 hours of sleep.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  The same method works for any alarm time. Here are the bedtimes for the most common wake up times.
                </p>
                <div className="not-prose mt-5 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">Wake up at</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">6 cycles (9 h)</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">5 cycles (7.5 h)</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">4 cycles (6 h)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {WAKE_TABLE.map((r, i) => (
                        <tr key={r.wake} className={i % 2 ? "bg-slate-50/60" : "bg-white"}>
                          <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{r.wake}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{r.c6}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-800 whitespace-nowrap">{r.c5}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{r.c4}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-xs text-slate-500">
                    All bedtimes include 15 minutes to fall asleep. The highlighted column is the five-cycle option most
                    adults should target.
                  </p>
                </div>
              </section>

              {/* CLUSTER: if I sleep at X, when do I wake */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <BedDouble className="h-6 w-6 text-emerald-700" />
                  What time should I wake up if I sleep at 11 PM?
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  If you know when you are getting into bed, count forward instead. Assume about 15 minutes to fall asleep,
                  then add 90-minute blocks. Getting into bed at 11:00 PM means you are likely asleep by 11:15 PM, so set
                  your alarm for <strong>5:15 AM</strong> after four cycles, <strong>6:45 AM</strong> after five cycles, or{" "}
                  <strong>8:15 AM</strong> after six cycles.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  This is also the answer to the question people ask at midnight: if I sleep now, when should I wake up?
                  Take the time you get into bed, add 15 minutes, then add 6 hours, 7.5 hours or 9 hours.
                </p>
                <div className="not-prose mt-5 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">In bed at</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">4 cycles (6 h)</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">5 cycles (7.5 h)</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">6 cycles (9 h)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {BEDTIME_TABLE.map((r, i) => (
                        <tr key={r.bed} className={i % 2 ? "bg-slate-50/60" : "bg-white"}>
                          <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{r.bed}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{r.c4}</td>
                          <td className="px-4 py-3 font-semibold text-emerald-800 whitespace-nowrap">{r.c5}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{r.c6}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* HOW TO USE (numbered, HowTo schema) */}
              <section className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-0">How to use the sleep cycle calculator</h2>
                <ol className="not-prose mt-5 space-y-4">
                  {[
                    { t: "Choose your direction", d: "Decide whether you know your wake up time and need a bedtime, or you are going to bed now and need an alarm time." },
                    { t: "Enter your time", d: "Enter the time you must wake up, or the time you are getting into bed." },
                    { t: "Set how long you take to fall asleep", d: "The default is 15 minutes. Increase it if you usually lie awake longer, because that shifts every recommendation." },
                    { t: "Pick a full cycle", d: "Choose an option that completes 4, 5 or 6 whole cycles, so your alarm rings at the end of a cycle rather than in the middle of deep sleep." },
                  ].map((s, i) => (
                    <li key={s.t} className="flex gap-4">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">{i + 1}</span>
                      <span>
                        <span className="block font-bold text-slate-900">{s.t}</span>
                        <span className="block text-sm text-slate-600 leading-relaxed">{s.d}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* FORMULA */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">The formula behind the calculator</h2>
                <p className="text-slate-700 leading-relaxed">
                  The calculator counts backward or forward in 90-minute sleep cycles and adds about 15 minutes of sleep
                  latency, the time it takes to actually fall asleep. There is no complicated maths, only consistent timing.
                </p>
                <div className="not-prose mt-5 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">To find your bedtime</p>
                  <p className="font-mono text-base md:text-lg font-bold text-slate-900">
                    Bedtime = Wake time <span className="text-emerald-700">-</span> (Cycles <span className="text-emerald-700">x</span> 90 min) <span className="text-emerald-700">-</span> Sleep latency
                  </p>
                  <p className="mt-5 mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">To find your wake up time</p>
                  <p className="font-mono text-base md:text-lg font-bold text-slate-900">
                    Wake time = Bedtime <span className="text-emerald-700">+</span> Sleep latency <span className="text-emerald-700">+</span> (Cycles <span className="text-emerald-700">x</span> 90 min)
                  </p>
                </div>
              </section>

              {/* SLEEP CYCLE VISUALIZATION: one cycle, the full night, and the
                  hypnogram. Interactive, SVG, and consistent with the tables above. */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="h-6 w-6 text-emerald-700" />
                  Sleep cycle graph: see a full night at a glance
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  Every cycle runs the same sequence, but the cycles are not identical to each other. Deep sleep dominates
                  the first half of the night and fades, while REM grows toward morning. That is why cutting your night
                  short costs you most of your REM sleep rather than your deep sleep, and why the end of a cycle is the
                  easiest moment to wake.
                </p>
                <div className="mt-6">
                  <SleepCycleVisualization />
                </div>
              </section>

              {/* WHAT IS A SLEEP CYCLE */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">What is a sleep cycle?</h2>
                <p className="text-slate-700 leading-relaxed">
                  A sleep cycle is one complete pass through the stages of sleep, lasting about 90 minutes in adults. It
                  begins in light non-REM sleep, descends into deep slow-wave sleep, then moves into REM sleep, the phase
                  where most vivid dreaming happens. You repeat this loop four to six times a night. Sleep is not a flat
                  state you sink into for eight hours, it is a rhythm you cycle through.
                </p>
                <div className="not-prose mt-5 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">Stage</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">Typical length</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">What it does for you</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {STAGES.map((s, i) => (
                        <tr key={s.stage} className={i % 2 ? "bg-slate-50/60" : "bg-white"}>
                          <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{s.stage}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{s.length}</td>
                          <td className="px-4 py-3 text-slate-600">{s.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* REM CLUSTER */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-emerald-700" />
                  REM sleep: how many REM cycles do you actually get?
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  REM, or rapid eye movement sleep, sits at the end of every cycle, so you get one REM period per cycle.
                  Across a normal eight-hour night that means about five REM periods. They are not equal in length. Your
                  first REM period may last only 10 minutes, while the final one before you wake can run 30 minutes or
                  longer. REM makes up roughly 20 to 25 percent of total sleep in a healthy adult.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  This is why a REM sleep calculator and a sleep cycle calculator give you the same answer. You cannot time
                  REM directly, but because REM reliably closes each cycle, landing your alarm at the end of a 90-minute
                  block usually means waking from or just after REM, which is the easiest moment to get up. It also explains
                  why cutting your night from 7.5 hours to 6 hours costs you the longest REM period of the night, and with
                  it much of the memory consolidation that happens toward morning.
                </p>
              </section>

              {/* HOW MANY CYCLES / 7.5 vs 8 */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">How many sleep cycles do I need?</h2>
                <p className="text-slate-700 leading-relaxed">
                  Most healthy adults need four to six complete cycles a night. Five cycles, which is 7.5 hours, is the
                  practical target for the majority of people, and it sits comfortably inside the recommendation from the
                  Centers for Disease Control and Prevention that adults get seven or more hours of sleep a night. Six
                  cycles, or nine hours, is a better target if you are a teenager, training hard, or recovering from illness.
                </p>
                <h3 className="text-xl font-bold text-slate-900 mt-6">Is 7.5 hours better than 8 hours?</h3>
                <p className="text-slate-700 leading-relaxed">
                  Often, yes, and this surprises people. 7.5 hours is exactly five 90-minute cycles, so your alarm is likely
                  to catch you in light sleep. Eight hours places you roughly 30 minutes into a sixth cycle, which can be
                  deep sleep, and waking from deep sleep is what produces heavy grogginess. If you routinely sleep eight
                  hours and still feel awful, try 7.5 hours or a full 9 hours for a week and compare how you feel on waking.
                </p>
              </section>

              {/* AGE CLUSTER */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Does age change sleep cycle recommendations?</h2>
                <p className="text-slate-700 leading-relaxed">
                  Total sleep need changes with age, but the length of a single cycle stays broadly similar. Adults usually
                  complete four to six cycles each night, while children and teenagers require more total sleep because their
                  brains and bodies are still developing. Older adults often experience lighter sleep and more nighttime
                  awakenings, which can make a consistent schedule matter more than squeezing in an extra cycle.
                </p>
                <div className="not-prose mt-5 overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">Age group</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">Recommended sleep</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">Target cycles</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-800">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {AGE_TABLE.map((r, i) => (
                        <tr key={r.group} className={i % 2 ? "bg-slate-50/60" : "bg-white"}>
                          <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{r.group}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{r.sleep}</td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{r.cycles}</td>
                          <td className="px-4 py-3 text-slate-600">{r.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-xs text-slate-500">
                    Sleep duration guidance follows the American Academy of Sleep Medicine and the CDC.
                  </p>
                </div>
              </section>

              {/* SLEEP SCHEDULE PLANNER CLUSTER */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Build your ideal sleep schedule</h2>
                <p className="text-slate-700 leading-relaxed">
                  A calculator gives you tonight&apos;s answer. A schedule gives you every night&apos;s answer. The strongest
                  predictor of how rested you feel is not a single perfectly timed alarm, it is going to bed and waking up at
                  roughly the same time every day, including weekends, because that keeps your circadian rhythm stable.
                </p>
                <div className="not-prose mt-5 grid gap-4 md:grid-cols-2">
                  {[
                    { t: "Anchor your wake time first", d: "Fix the time you get up, even on weekends. Your body clock anchors to light and wake time far more than to bedtime." },
                    { t: "Count back five cycles", d: "From your wake time, subtract 7.5 hours plus 15 minutes to fall asleep. That is your target bedtime." },
                    { t: "Protect the last cycle", d: "Cutting your night short mostly costs REM, which happens toward morning. An hour lost at the end is not the same as an hour lost at the start." },
                    { t: "Adjust by 15 minutes, not 90", d: "If you still wake groggy on a 7.5-hour schedule, shift your alarm 15 minutes either way until it clicks. Real cycles vary from 80 to 110 minutes." },
                  ].map((c) => (
                    <div key={c.t} className="rounded-2xl border border-slate-200 bg-white p-5">
                      <h3 className="flex items-start gap-2 font-bold text-slate-900">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-700" /> {c.t}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.d}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* WHY IT MATTERS */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Why sleep cycle timing matters</h2>
                <p className="text-slate-700 leading-relaxed">
                  Waking in the middle of deep sleep triggers sleep inertia, a state of impaired alertness and slowed
                  reaction time that can persist for up to 30 minutes after you get out of bed. That is the mechanism behind
                  the strange experience of sleeping longer and feeling worse. Timing your alarm to the end of a cycle does
                  not add sleep, it changes the stage you wake from.
                </p>
                <div className="not-prose mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { t: "Memory", d: "REM sleep supports learning and memory consolidation." },
                    { t: "Recovery", d: "Deep sleep drives tissue repair and immune function." },
                    { t: "Mood", d: "Fragmented sleep is strongly linked to irritability and low mood." },
                    { t: "Focus", d: "Sleep inertia blunts alertness and reaction time on waking." },
                  ].map((c) => (
                    <div key={c.t} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <h3 className="font-bold text-slate-900">{c.t}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{c.d}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* SCIENTIFIC EXPLANATION */}
              <section className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-0">What the research actually says</h2>
                <p className="text-slate-700 leading-relaxed">
                  Research consistently shows that adults cycle through sleep roughly every 90 minutes and complete four to
                  six cycles a night. The American Academy of Sleep Medicine and the Sleep Research Society recommend that
                  adults regularly obtain at least seven hours of sleep per night for optimal health, and the Centers for
                  Disease Control and Prevention repeats that seven-hour floor in its public guidance.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  The stages are not interchangeable. Deep slow-wave sleep, which is concentrated in the first half of the
                  night, supports physical restoration and immune function. REM sleep, which lengthens toward morning,
                  supports memory consolidation and emotional processing. Sleep inertia, the grogginess after waking, is
                  strongest when you are roused from slow-wave sleep, which is the specific problem a cycle-aware alarm time
                  is designed to avoid.
                </p>
              </section>

              {/* LIMITATIONS (EEAT honesty) */}
              <section>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-emerald-700" />
                  Limitations you should know about
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  This calculator is a well-informed guide, not a medical measurement. Being honest about where it breaks
                  down is more useful than pretending it is exact.
                </p>
                <ul className="not-prose mt-4 space-y-3">
                  {[
                    "90 minutes is an average. Real cycles run from about 80 to 110 minutes, and they are not identical to each other across one night.",
                    "Sleep latency varies. If stress means you lie awake for 45 minutes, every recommended time shifts by half an hour.",
                    "Cycles change through the night. Early cycles carry more deep sleep, later ones more REM, so the maths is a simplification.",
                    "Sleep disorders change everything. Insomnia, sleep apnoea and shift work can disrupt cycle structure entirely, and no calculator can account for that.",
                    "Total sleep still matters. Five perfectly timed cycles will not undo months of chronic sleep restriction.",
                  ].map((l) => (
                    <li key={l} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-slate-700 leading-relaxed mt-4">
                  If you consistently wake unrefreshed despite a good schedule, that is worth raising with a doctor rather
                  than solving with an alarm time.
                </p>
              </section>

              {/* HOW WE CALCULATED THIS (EEAT) */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-0 flex items-center gap-2">
                  <Info className="h-5 w-5 text-emerald-700" /> How we calculated this
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  We model one sleep cycle as 90 minutes, the widely accepted adult average, and add a default sleep latency
                  of 15 minutes, the midpoint of the normal 10 to 20 minute range. Recommended options are limited to whole
                  cycles (3, 4, 5 and 6) so that every suggested alarm time falls at the end of a cycle. Sleep duration
                  guidance follows the American Academy of Sleep Medicine and the CDC. We do not store your times, and no
                  data leaves your browser.
                </p>
              </section>

              {/* SCIENTIFIC REFERENCES */}
              <SourcesSection
                items={[
                  { label: "CDC: How much sleep do I need?", href: "https://www.cdc.gov/sleep/about/index.html" },
                  { label: "American Academy of Sleep Medicine and Sleep Research Society: Recommended amount of sleep for a healthy adult", href: "https://aasm.org/resources/pdf/pressroom/adult-sleep-duration-consensus.pdf" },
                  { label: "NIH, National Heart, Lung, and Blood Institute: Sleep phases and stages", href: "https://www.nhlbi.nih.gov/health/sleep/stages-of-sleep" },
                  { label: "National Sleep Foundation: Sleep duration recommendations", href: "https://www.sleepfoundation.org/how-sleep-works/sleep-facts-statistics" },
                  { label: "Harvard Medical School, Division of Sleep Medicine: Natural patterns of sleep", href: "https://healthysleep.med.harvard.edu/healthy/science/what/sleep-patterns-rem-nrem" },
                ]}
              />

              {/* MEDICAL DISCLAIMER */}
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm leading-relaxed text-slate-600">
                  <strong className="text-slate-900">Medical disclaimer:</strong> This sleep cycle calculator is for
                  educational purposes only and does not diagnose or treat any condition. Sleep needs vary between
                  individuals. If you have persistent insomnia, loud snoring, daytime sleepiness or suspect a sleep disorder,
                  speak to a qualified healthcare professional.
                </p>
              </section>
            </div>

            {/* FAQ */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 text-center">Common sleep time questions</h2>
              <FAQSection faqs={faqs} />
            </div>

            {/* RELATED */}
            <div className="mt-12">
              <h2 className="text-xl font-bold text-slate-900 mb-4">You may also like</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { href: "/health/sleep-debt-calculator", label: "Sleep Debt Calculator", desc: "See how many hours of sleep you owe your body" },
                  { href: "/health/stress-level-calculator", label: "Stress Level Calculator", desc: "Stress is one of the biggest disruptors of sleep quality" },
                  { href: "/health/heart-rate-calculator", label: "Heart Rate Calculator", desc: "Resting heart rate is a strong marker of recovery" },
                  { href: "/health/bmr-calculator", label: "BMR Calculator", desc: "Your metabolic baseline at complete rest" },
                ].map((r) => (
                  <Link key={r.href} href={r.href} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-700" />
                    <span>
                      <span className="block font-semibold text-slate-900">{r.label}</span>
                      <span className="block text-sm text-slate-500">{r.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <RelatedCalculators slug="sleep-cycle-calculator" />

            <MedicalReviewerSection />
            <AuthorSection />
          </div>
        </div>
      </main>

      <AuthorSchema />
      <Footer />
    </div>
  )
}
