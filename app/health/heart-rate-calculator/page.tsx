import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import HeartRateCalculator from "@/components/calculators/heart-rate-calculator"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import {
  Activity,
  Flame,
  Heart,
  Timer,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react"
import { RelatedCalculators } from "@/components/calculators/related-calculators"

export const metadata: Metadata = {
  title: "Target & Max Heart Rate Calculator: Zones, Karvonen & MHR",
  description:
    "Free target and max heart rate calculator. Get your maximum heart rate (MHR), target heart rate, heart rate reserve (HRR), and personalized training zones using the Karvonen, Tanaka, and standard formulas.",
  keywords:
    "target heart rate calculator, max heart rate calculator, heart rate zone calculator, karvonen calculator, heart rate reserve, zone 2 heart rate, tanaka formula, resting heart rate, heart rate chart by age",
  alternates: {
    canonical: "https://calqulate.net/health/heart-rate-calculator",
  },
  openGraph: {
    title: "Target & Max Heart Rate Calculator: Zones, Karvonen & MHR",
    description:
      "Get your maximum heart rate, target heart rate, heart rate reserve, and personalized training zones using the Karvonen, Tanaka, and standard formulas.",
    url: "https://calqulate.net/health/heart-rate-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Target & Max Heart Rate Calculator: Zones, Karvonen & MHR",
    description:
      "Get your maximum heart rate, target heart rate, heart rate reserve, and personalized training zones instantly.",
  },
}

const faqs = [
  {
    question: "What is my maximum heart rate?",
    answer:
      "Your maximum heart rate is the highest number of beats per minute your heart can reach during all-out effort. A quick estimate is 220 minus your age, so a 40-year-old has an estimated max of 180 bpm. The Tanaka formula (208 minus 0.7 times age) is often more accurate for adults over 40.",
  },
  {
    question: "How do I calculate target heart rate?",
    answer:
      "Multiply your maximum heart rate by the intensity you want, such as 60 to 70% for Zone 2. For a more personal result, the Karvonen method uses your heart rate reserve: target = (max HR minus resting HR) times intensity, plus resting HR.",
  },
  {
    question: "What is Zone 2 heart rate?",
    answer:
      "Zone 2 is about 60 to 70% of your maximum heart rate. At this comfortable intensity your body burns fat efficiently and builds aerobic endurance, which is why endurance athletes spend most of their training here.",
  },
  {
    question: "What is the Karvonen formula?",
    answer:
      "The Karvonen formula calculates personalized target zones by combining your maximum heart rate and resting heart rate (your heart rate reserve), which makes it more accurate than age-only formulas.",
  },
  {
    question: "Which heart rate formula is most accurate?",
    answer:
      "A supervised stress test is the most accurate. Among formulas, Karvonen is best for personalized training, Tanaka is best for adults over 40, and 220 minus age is a fast general estimate.",
  },
  {
    question: "Should I use 220 minus age or Tanaka?",
    answer:
      "Use 220 minus age for a quick estimate. Use Tanaka (208 minus 0.7 times age) if you are over 40, since 220 minus age tends to underestimate maximum heart rate in older adults.",
  },
  {
    question: "What is heart rate reserve (HRR)?",
    answer:
      "Heart rate reserve is your maximum heart rate minus your resting heart rate. It represents the working range of your heart and is the basis of the Karvonen method for setting training zones.",
  },
  {
    question: "What is a normal resting heart rate?",
    answer:
      "A normal resting heart rate for adults is 60 to 100 bpm. Active and fit people often sit between 40 and 60 bpm, because a stronger heart pumps more blood per beat.",
  },
  {
    question: "Can medications affect target heart rate?",
    answer:
      "Yes. Beta blockers and some other heart medications lower your heart rate, so formula-based zones may be too high. If you take these medications, ask your doctor for zones based on your actual response to exercise.",
  },
  {
    question: "How often should I recalculate my heart rate zones?",
    answer:
      "Recalculate every few months, or whenever your resting heart rate changes noticeably with fitness, or after a birthday changes your age-based maximum.",
  },
]

/** Heart rate training zones, shown as cards. */
const zones = [
  { zone: 1, name: "Recovery", intensity: "50-60%", best: "Warm-ups, cool-downs, walking", icon: Activity, accent: "text-slate-600" },
  { zone: 2, name: "Fat loss & endurance", intensity: "60-70%", best: "Easy jog, brisk walk, steady cycling", icon: Flame, accent: "text-emerald-700", highlight: true },
  { zone: 3, name: "Cardio fitness", intensity: "70-80%", best: "Steady runs, cardio classes, swimming", icon: Heart, accent: "text-blue-700" },
  { zone: 4, name: "Threshold", intensity: "80-90%", best: "Tempo intervals, hill repeats", icon: Timer, accent: "text-orange-700" },
  { zone: 5, name: "Maximum effort", intensity: "90-100%", best: "Sprints, short HIIT bursts", icon: Zap, accent: "text-red-700" },
]

/** Goal to best zone, decision table. */
const goalToZone = [
  { goal: "Weight loss", zone: "Zone 2" },
  { goal: "Marathon and long distance", zone: "Zone 2 to 3" },
  { goal: "General fitness", zone: "Zone 2 to 3" },
  { goal: "HIIT and speed", zone: "Zone 4 to 5" },
  { goal: "Recovery days", zone: "Zone 1" },
]

/** Which formula is most accurate. */
const formulaAccuracy = [
  { formula: "220 minus Age", best: "Quick estimate" },
  { formula: "Tanaka (208 - 0.7 x Age)", best: "Adults 40+" },
  { formula: "Karvonen (HRR)", best: "Personalized training" },
  { formula: "Clinical stress test", best: "Clinical accuracy" },
]

/** Heart rate chart by age (standard formula). */
const ageChart = [
  { age: "20", zone2: "120-140", zone3: "140-160", zone4: "160-180", max: "200" },
  { age: "30", zone2: "114-133", zone3: "133-152", zone4: "152-171", max: "190" },
  { age: "40", zone2: "108-126", zone3: "126-144", zone4: "144-162", max: "180" },
  { age: "50", zone2: "102-119", zone3: "119-136", zone4: "136-153", max: "170" },
  { age: "60", zone2: "96-112", zone3: "112-128", zone4: "128-144", max: "160" },
  { age: "70", zone2: "90-105", zone3: "105-120", zone4: "120-135", max: "150" },
]

const rhrRanges = [
  { range: "40-60 bpm", label: "Athlete or very fit" },
  { range: "60-100 bpm", label: "Normal adult range" },
  { range: "Over 100 bpm", label: "Elevated, worth checking" },
]

const trustPoints = [
  "Aligned with American Heart Association (AHA) exercise guidance.",
  "Uses the Karvonen heart rate reserve method for personalized zones.",
  "Includes the Tanaka equation, supported by peer-reviewed exercise physiology research.",
  "Educational only, not a replacement for a stress test or medical evaluation.",
]

const notAccurateFor = [
  "Beta blockers and rate-limiting heart medication",
  "Known heart disease",
  "Arrhythmias such as atrial fibrillation",
  "Elite athletes with unusually high or low max rates",
  "Pregnancy",
  "Cardiac rehabilitation",
]

/** One-sentence lead answer for AI Overviews and quick scanning. */
function Answer({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-base font-medium leading-relaxed text-slate-800 sm:text-lg">{children}</p>
}

export default function HeartRateCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Target & Max Heart Rate Calculator"
        description="Calculate maximum heart rate, target heart rate, heart rate reserve, and personalized training zones using the Karvonen, Tanaka, and standard formulas."
        url="https://calqulate.net/health/heart-rate-calculator"
      />
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />

      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 md:py-16">
            <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
              Target &amp; Max Heart Rate Calculator
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              Calculate your Maximum Heart Rate (MHR), Target Heart Rate, Heart Rate Reserve (HRR), and personalized
              training zones using the Karvonen, Tanaka, and standard formulas.
            </p>

            <ul className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2">
              {["Max Heart Rate", "Target Heart Rate", "Zone 2 Calculator", "Karvonen Method", "Free & Instant"].map(
                (chip) => (
                  <li
                    key={chip}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    {chip}
                  </li>
                ),
              )}
            </ul>

            <div className="mt-8">
              <a
                href="#calculator"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                Calculate my zones
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* CALCULATOR (and dynamic 'Understand your results') */}
        <section id="calculator" className="scroll-mt-20">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 md:py-14">
            <HeartRateCalculator />
          </div>
        </section>

        <div className="container mx-auto px-4 pb-8">
          <div className="mx-auto max-w-3xl space-y-14">
            {/* WHAT IS TARGET HEART RATE */}
            <section id="what-is-target-hr" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">What is target heart rate?</h2>
              <Answer>
                Target heart rate is the heart rate range where exercise gives the greatest benefit for your fitness
                goal, usually set as a percentage of your maximum heart rate.
              </Answer>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Training below your target range does too little to improve fitness, while staying above it for too long
                leads to fatigue. Most goals are met by training in a target zone between 60 and 85% of your maximum
                heart rate.
              </p>
            </section>

            {/* TRAINING ZONES */}
            <section id="training-zones" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Heart rate training zones</h2>
              <Answer>
                There are five heart rate zones, from Zone 1 for recovery to Zone 5 for maximum effort, each set as a
                percentage of your maximum heart rate.
              </Answer>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {zones.map((z) => (
                  <div
                    key={z.zone}
                    className={`rounded-2xl border bg-white p-5 ${z.highlight ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 font-bold text-slate-900">
                        <z.icon className={`h-5 w-5 ${z.accent}`} aria-hidden="true" />
                        Zone {z.zone}: {z.name}
                      </span>
                      <span className="text-sm font-semibold text-slate-500">{z.intensity}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{z.best}</p>
                    {z.highlight && (
                      <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        <Flame className="h-3 w-3" /> Fat-burning zone
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* WHICH ZONE */}
            <section id="which-zone" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Which heart rate zone should you train in?</h2>
              <Answer>
                Train in Zone 2 for weight loss and endurance, Zone 2 to 3 for general fitness, Zone 4 to 5 for HIIT and
                speed, and Zone 1 for recovery.
              </Answer>
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Goal</th>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Best zone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goalToZone.map((row) => (
                      <tr key={row.goal} className="odd:bg-white even:bg-slate-50/60">
                        <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-800">{row.goal}</td>
                        <td className="border-b border-slate-100 px-4 py-3 font-semibold text-emerald-700">{row.zone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* MAX HEART RATE */}
            <section id="max-heart-rate" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Maximum heart rate calculator</h2>
              <Answer>
                Your maximum heart rate is estimated as 220 minus your age, or more accurately for adults over 40 as
                Tanaka: 208 minus 0.7 times your age.
              </Answer>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">Standard formula</p>
                  <p className="mt-3 font-mono text-lg font-bold text-slate-900">Max HR = 220 - Age</p>
                  <p className="mt-2 text-sm text-slate-600">Age 40: 220 - 40 = 180 bpm. Best for a quick estimate.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">Tanaka formula</p>
                  <p className="mt-3 font-mono text-lg font-bold text-slate-900">Max HR = 208 - (0.7 x Age)</p>
                  <p className="mt-2 text-sm text-slate-600">Age 40: 208 - 28 = 180 bpm. More accurate for adults over 40.</p>
                </div>
              </div>
            </section>

            {/* KARVONEN */}
            <section id="karvonen" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Karvonen formula and heart rate reserve</h2>
              <Answer>
                The Karvonen formula calculates your target heart rate using both your maximum and resting heart rate,
                making it more personalized than age-based formulas.
              </Answer>
              <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="font-mono text-sm text-slate-800">Heart rate reserve (HRR) = Max HR - Resting HR</p>
                <p className="font-mono text-sm text-slate-800">Target HR = (HRR x intensity %) + Resting HR</p>
                <div className="border-t border-slate-200 pt-3 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Example</p>
                  <p>Age 40, resting HR 60. Max HR 180, so HRR = 120.</p>
                  <p>Zone 2 at 60%: (120 x 0.60) + 60 = 132 bpm.</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Use Karvonen when you know your resting heart rate and want zones matched to your fitness level. Enter
                your resting heart rate in the calculator above to switch to this method automatically.
              </p>
            </section>

            {/* FORMULA ACCURACY */}
            <section id="formula-accuracy" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Which formula is most accurate?</h2>
              <Answer>
                A clinical stress test is the most accurate. Among formulas, Karvonen is best for personalized training,
                Tanaka for adults over 40, and 220 minus age for a quick estimate.
              </Answer>
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Formula</th>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Best for</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formulaAccuracy.map((row) => (
                      <tr key={row.formula} className="odd:bg-white even:bg-slate-50/60">
                        <td className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-900">{row.formula}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-slate-700">{row.best}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* AGE CHART */}
            <section id="age-chart" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Heart rate chart by age</h2>
              <Answer>
                This heart rate chart shows the target zones and maximum heart rate by age, using the standard 220 minus
                age formula.
              </Answer>
              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Age</th>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Zone 2</th>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Zone 3</th>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Zone 4</th>
                      <th scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">Max HR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ageChart.map((row) => (
                      <tr key={row.age} className="odd:bg-white even:bg-slate-50/60">
                        <td className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-900">{row.age}</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-slate-700">{row.zone2} bpm</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-slate-700">{row.zone3} bpm</td>
                        <td className="border-b border-slate-100 px-4 py-3 text-slate-700">{row.zone4} bpm</td>
                        <td className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-900">{row.max} bpm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* RESTING HEART RATE GUIDE */}
            <section id="resting-heart-rate" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Resting heart rate guide</h2>
              <Answer>
                A normal resting heart rate for adults is 60 to 100 bpm, and fit people are often between 40 and 60 bpm.
              </Answer>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {rhrRanges.map((r) => (
                  <div key={r.range} className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
                    <p className="text-2xl font-bold text-slate-900">{r.range}</p>
                    <p className="mt-1 text-sm text-slate-600">{r.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* HOW TO MEASURE RHR */}
            <section id="measure-rhr" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">How to measure resting heart rate</h2>
              <Answer>
                Measure your resting heart rate first thing in the morning, before getting up, by counting your pulse for
                60 seconds.
              </Answer>
              <ol className="mt-6 space-y-3">
                {[
                  "Measure in the morning, while still lying down and fully rested.",
                  "Find your pulse on your wrist (thumb side) or the side of your neck.",
                  "Count the beats for a full 60 seconds, or count 15 seconds and multiply by four.",
                  "Repeat on a few mornings and take the average for a reliable number.",
                ].map((step, i) => (
                  <li key={i} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                      {i + 1}
                    </span>
                    <span className="text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* WHY TRUST */}
            <section id="why-trust" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Why trust these calculations?</h2>
              <Answer>
                These calculations use established, peer-reviewed formulas and align with American Heart Association
                exercise guidance.
              </Answer>
              <ul className="mt-6 space-y-3">
                {trustPoints.map((point) => (
                  <li key={point} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span className="text-sm leading-relaxed text-slate-700">{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* WHEN NOT ACCURATE */}
            <section id="when-not-accurate" className="scroll-mt-20">
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">When these calculations may not apply</h2>
              <Answer>
                Age-based heart rate formulas may not be accurate if you take heart medication or have a heart condition,
                so get medical guidance in these cases.
              </Answer>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {notAccurateFor.map((item) => (
                  <li key={item} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                This tool is educational and does not replace a stress test or medical evaluation. Talk to your doctor
                before starting an intense program, especially if you take beta blockers.
              </p>
            </section>

            {/* FAQ */}
            <section id="faqs" className="scroll-mt-20">
              <h2 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">Frequently asked questions</h2>
              <FAQSection faqs={faqs} />
            </section>
          </div>

          <div className="mx-auto max-w-3xl">
            <RelatedCalculators slug="heart-rate-calculator" />
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
