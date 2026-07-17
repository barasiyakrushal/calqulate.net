import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import TDEECalculator from "@/components/calculators/tdee-calculator"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { ServiceCTA } from "@/components/seo/service-cta"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { RelatedCalculators } from "@/components/calculators/related-calculators"
import {
  Flame,
  Activity,
  Utensils,
  Zap,
  Dumbbell,
  Calculator as CalculatorIcon,
  AlertCircle,
  TrendingDown,
  Apple,
  Info,
  Scale,
  Stethoscope,
  Sparkles,
} from "lucide-react"

export const metadata: Metadata = {
  title: "TDEE Calculator – Understand Your Daily Energy, Not Just Calories",
  description:
    "Calculate your Total Daily Energy Expenditure (TDEE). Understand how your body uses energy through BMR, movement, food processing, and adaptation.",
  keywords:
    "TDEE calculator, total daily energy expenditure, calculate TDEE, energy expenditure, daily calories, metabolism tool, BMR calculator, calories burned, weight management",
  alternates: {
    canonical: "https://calqulate.net/health/tdee-calculator",
  },
  openGraph: {
    title: "TDEE Calculator – Understand Your Daily Energy, Not Just Calories",
    description: "Calculate your Total Daily Energy Expenditure (TDEE). Understand how your body uses energy through BMR, movement, food processing, and adaptation.",
    url: "https://calqulate.net/health/tdee-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TDEE Calculator – Understand Your Daily Energy, Not Just Calories",
    description: "Calculate your Total Daily Energy Expenditure (TDEE). Understand how your body uses energy through BMR, movement, food processing, and adaptation.",
  },
}

const faqs = [
  {
    question: "Why does my TDEE change even if my weight stays the same?",
    answer:
      "Your body is not a machine, so your energy use is not fixed. Even if your weight stays the same, your TDEE can change because of: Sleep quality, Stress levels, Daily movement (steps, standing, sitting), Diet history (long-term low calories), Muscle gain or muscle loss. That is why TDEE should be treated as a living number, not a permanent one. Rechecking every few weeks helps keep it realistic.",
  },
  {
    question: "Is TDEE the same as calories burned from exercise?",
    answer:
      "No, exercise calories are only one small part of TDEE. TDEE includes: Calories burned at rest (breathing, heartbeat), Calories used for daily movement, Calories burned during workouts, and Calories used to digest food. So even on a day without exercise, your body still burns a large amount of energy.",
  },
  {
    question: "Why do two people with the same height and weight have different TDEE?",
    answer:
      "Because bodies behave differently. TDEE can change due to: Muscle mass differences, Job type (sitting vs moving), Stress and recovery, Hormonal balance, and Daily habits like walking or standing. That’s why comparing your calories with others often leads to confusion. Your TDEE is personal.",
  },
  {
    question: "Should I eat exactly the number shown by the TDEE calculator?",
    answer:
      "No. The number is a starting point, not a strict rule. A smarter approach is to stay within a small range: Slightly below for fat loss, Slightly above for muscle gain, and Around the number for maintenance. Eating exactly the same calories every day is not required for good results.",
  },
  {
    question: "How do I know if my TDEE estimate is working for me?",
    answer:
      "Watch real-world results for 2–3 weeks: Weight stable → TDEE is close, Slow weight loss → small calorie deficit, Weight gain → calories are higher than TDEE. If needed, adjust slowly. No extreme cuts, no panic changes.",
  },
]

export default function TDEECalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <CalculatorSchema
        name="TDEE Calculator"
        description="Understand your daily energy expenditure. Not just a number, but a complete view of how your body uses energy."
        url="https://calqulate.net/health/tdee-calculator"
      />
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />

      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="bg-gradient-to-br from-emerald-50 via-white to-lime-50 border-b border-slate-200">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-700 mb-5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg>
              Free · Instant · No sign-up required
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-balance leading-tight text-slate-900">
              TDEE Calculator – Understand Your Daily Energy, Not Just Calories
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              Most calorie tools only give you a number. A good TDEE calculator should give you understanding.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href="#calculator"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Try the Calculator ↓
              </a>
            </div>
          </div>
        </section>

        {/* USP SUMMARY (TOFU) */}
        <section className="border-b border-emerald-100 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <p className="text-sm md:text-base leading-relaxed text-slate-700">
                Calqulate.net calculates total daily energy expenditure from your stats and activity using proven metabolic math. You get a reliable figure split into BMR, movement and digestion, with cut/maintain/bulk targets.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "TDEE", label: "kcal/day" },
              { value: "5", label: "Activity levels" },
              { value: "Free", label: "Price" },
              { value: "No", label: "Sign-up" },
              { value: "Instant", label: "Results" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-5 text-center">
                <p className="text-2xl md:text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CALCULATOR */}
        <section id="calculator" className="scroll-mt-20">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <TDEECalculator />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">

            <div className="prose prose-gray dark:prose-invert max-w-none mt-12 space-y-16">
              
              {/* What Does TDEE Really Mean? */}
              <section className="py-8">
                <h2 className="mb-4 text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  What Does TDEE Really Mean in Daily Life?
                </h2>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  TDEE (Total Daily Energy Expenditure) is the total energy your body uses in one full day. 
                </p>
                <p className="font-medium text-gray-800 mb-1">Not just workouts.</p>
                <p className="font-medium text-gray-800 mb-1">Not just walking.</p>
                <p className="font-medium text-gray-800 mb-1">Not just digestion.</p>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  It includes everything your body does to keep you alive and active, even when you are sitting, thinking, or sleeping.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                  <p className="text-blue-800 font-bold">In simple words:</p>
                  <p className="text-blue-700 italic">TDEE = Energy your body needs to live your normal day</p>
                </div>
              </section>

              {/* The 4 Hidden Places */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-800">
                  The 4 Hidden Places Where Your Body Spends Energy
                </h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  Most websites mention only BMR and exercise. That is incomplete. Your body actually spends energy in four silent areas:
                </p>

                <Card className="not-prose overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border px-4 py-3 text-left">Energy Area</th>
                          <th className="border px-4 py-3 text-left">What It Means</th>
                          <th className="border px-4 py-3 text-left">Example</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border px-4 py-3 font-medium">Rest Energy</td>
                          <td className="border px-4 py-3 text-gray-600">Energy to stay alive</td>
                          <td className="border px-4 py-3 text-gray-600">Breathing, heartbeat</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="border px-4 py-3 font-medium">Movement Energy</td>
                          <td className="border px-4 py-3 text-gray-600">Planned & unplanned movement</td>
                          <td className="border px-4 py-3 text-gray-600">Walking, cleaning</td>
                        </tr>
                        <tr>
                          <td className="border px-4 py-3 font-medium">Food Energy</td>
                          <td className="border px-4 py-3 text-gray-600">Energy to process food</td>
                          <td className="border px-4 py-3 text-gray-600">Digesting protein</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="border px-4 py-3 font-medium">Adaptation Energy</td>
                          <td className="border px-4 py-3 text-gray-600">Body adjustments</td>
                          <td className="border px-4 py-3 text-gray-600">Stress, sleep loss</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
                <p className="mt-4 text-sm font-medium text-orange-600 italic">
                  New insight: Two people with the same height and weight can have different TDEE because their adaptation energy is different.
                </p>
              </section>

              {/* Why TDEE Is Not the Same Every Day */}
              <section>
                <h2 className="mb-2 font-semibold text-2xl">
                  Why Your TDEE Is Not the Same Every Day
                </h2>
                <p className="mb-4">
                  Most calculators show one fixed number. But real human bodies do not work like machines.
                </p>
                <p className="mb-4">Your TDEE changes when:</p>
                <div className="grid md:grid-cols-2 gap-4 not-prose">
                  <div className="p-4 border rounded-xl bg-gray-50">
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex gap-2"><Info className="w-4 h-4 text-blue-500 shrink-0" /> You sleep less than usual</li>
                      <li className="flex gap-2"><Info className="w-4 h-4 text-blue-500 shrink-0" /> You eat very low calories for many days</li>
                      <li className="flex gap-2"><Info className="w-4 h-4 text-blue-500 shrink-0" /> You feel stressed for long periods</li>
                      <li className="flex gap-2"><Info className="w-4 h-4 text-blue-500 shrink-0" /> You move less without noticing</li>
                      <li className="flex gap-2"><Info className="w-4 h-4 text-blue-500 shrink-0" /> You gain or lose muscle</li>
                    </ul>
                  </div>
                  <div className="p-4 border border-orange-200 rounded-xl bg-orange-50/50">
                    <h4 className="font-bold flex items-center gap-2 mb-2 text-orange-800">
                      Reality Check:
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-orange-700 space-y-2">
                      <li>Your TDEE is a range, not a single perfect number.</li>
                      <li>This calculator gives you a starting point, not a rule.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How This Calculator Thinks */}
              <section>
                <h2 className="text-2xl font-bold mb-4">How This TDEE Calculator Thinks</h2>
                <p className="mb-6">This calculator follows a three-layer logic:</p>
                <div className="grid md:grid-cols-3 gap-6 not-prose">
                  <div className="text-center p-6 border rounded-2xl">
                    <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                    <h3 className="font-bold">Base Energy</h3>
                    <p className="text-sm text-gray-600 mt-2">Energy to exist (BMR)</p>
                  </div>
                  <div className="text-center p-6 border rounded-2xl">
                    <Activity className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                    <h3 className="font-bold">Daily Life Energy</h3>
                    <p className="text-sm text-gray-600 mt-2">Work, steps, chores</p>
                  </div>
                  <div className="text-center p-6 border rounded-2xl">
                    <Utensils className="w-8 h-8 text-green-500 mx-auto mb-3" />
                    <h3 className="font-bold">Food Processing</h3>
                    <p className="text-sm text-gray-600 mt-2">Digestion cost</p>
                  </div>
                </div>
                <p className="mt-6 text-center text-muted-foreground italic">
                  Instead of assuming perfection, it estimates normal human behavior, not athlete-level precision.
                </p>
              </section>

              {/* Activity Level Table */}
              <section>
                <h2 className="mb-4 text-2xl font-semibold">Activity Level: Choose What You Actually Do</h2>
                <p className="mb-4">Many people overestimate activity. That leads to wrong calorie targets. Use this table honestly:</p>
                
                <Card className="not-prose overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border px-4 py-3 text-left">Your Day Looks Like This</th>
                          <th className="border px-4 py-3 text-left">Choose This Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border px-4 py-3 text-gray-600">Desk job, little walking</td>
                          <td className="border px-4 py-3 font-medium">Sedentary</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="border px-4 py-3 text-gray-600">Some walking, light workouts</td>
                          <td className="border px-4 py-3 font-medium">Light</td>
                        </tr>
                        <tr>
                          <td className="border px-4 py-3 text-gray-600">Regular workouts + active day</td>
                          <td className="border px-4 py-3 font-medium">Moderate</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="border px-4 py-3 text-gray-600">Physically demanding job</td>
                          <td className="border px-4 py-3 font-medium">Active</td>
                        </tr>
                        <tr>
                          <td className="border px-4 py-3 text-gray-600">Hard training + physical work</td>
                          <td className="border px-4 py-3 font-medium">Very Active</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>
                <p className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm font-medium">
                  Tip: If confused between two levels, pick the lower one.
                </p>
              </section>

              {/* Why People Get Stuck */}
              <section>
                <Card className="not-prose border-l-4 border-l-red-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      TDEE vs{" "}
                      <Link
                        href="/health/macro-calculator"
                        className="no-underline hover:underline hover:text-blue-700"
                      >
                        Calories
                      </Link>{" "}
                      Eaten – Why People Get Stuck
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="italic text-gray-600">People say: “I eat less but don’t lose weight”</p>
                    <p className="text-gray-700">This usually happens because:</p>
                    <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <li className="flex items-center gap-2">• TDEE was overestimated</li>
                      <li className="flex items-center gap-2">• NEAT (small movements) reduced</li>
                      <li className="flex items-center gap-2">• Body adapted to low intake</li>
                      <li className="flex items-center gap-2">• Stress increased energy conservation</li>
                    </ul>
                    <p className="mt-4 font-bold text-gray-900">TDEE is not punishment. It is feedback.</p>
                  </CardContent>
                </Card>
              </section>

              {/* Calorie Zones */}
              <section>
                <h2 className="text-2xl font-bold mb-4">A Smarter Way to Use Your TDEE</h2>
                <p className="mb-4">Instead of strict numbers, use zones:</p>
                <Card className="not-prose">
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center p-4 rounded-xl border bg-gray-50">
                        <h4 className="font-bold text-gray-800 mb-1">Maintain</h4>
                        <p className="text-blue-600 font-mono">TDEE ± 100</p>
                      </div>
                      <div className="text-center p-4 rounded-xl border bg-green-50">
                        <h4 className="font-bold text-green-800 mb-1">Slow fat loss</h4>
                        <p className="text-green-600 font-mono">TDEE − 250</p>
                      </div>
                      <div className="text-center p-4 rounded-xl border bg-emerald-50">
                        <h4 className="font-bold text-emerald-800 mb-1">Sustainable fat loss</h4>
                        <p className="text-emerald-600 font-mono">TDEE − 350</p>
                      </div>
                      <div className="text-center p-4 rounded-xl border bg-orange-50">
                        <h4 className="font-bold text-orange-800 mb-1">Muscle gain</h4>
                        <p className="text-orange-600 font-mono">TDEE + 250</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <p className="mt-4 text-center text-muted-foreground text-sm">This approach reduces burnout and plateaus.</p>
              </section>

              {/* TDEE and Muscle */}
              <section>
                <h2 className="text-2xl font-bold mb-4">TDEE and Muscle: The Missing Explanation</h2>
                <p className="mb-4 text-gray-700">Most calculators ignore this fact: Muscle does not burn huge calories at rest — but it raises your energy floor.</p>
                <div className="grid md:grid-cols-3 gap-6 not-prose">
                  <Card className="bg-slate-50">
                    <CardHeader className="p-4"><CardTitle className="text-base">Increases efficiency</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 text-sm">Improves movement efficiency during any activity.</CardContent>
                  </Card>
                  <Card className="bg-slate-50">
                    <CardHeader className="p-4"><CardTitle className="text-base">Food Handling</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 text-sm">Improves food handling (how your body uses nutrients).</CardContent>
                  </Card>
                  <Card className="bg-slate-50">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">
                        Protects{" "}
                        <Link
                          href="/health/rfm-calculator"
                          className="no-underline hover:underline hover:text-blue-700"
                        >
                          Metabolism
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-sm">Protects metabolism during dieting and calorie restriction.</CardContent>
                  </Card>
                </div>
                <p className="mt-6 text-gray-800 font-medium">So higher muscle = more stable TDEE, not magic calorie burn.</p>
              </section>

              {/* Why Numbers Feel Wrong */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Why Online TDEE Numbers Often Feel “Wrong”</h2>
                <p className="mb-4">Because they ignore:</p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
                  <li>Sleep quality</li>
                  <li>Stress hormones</li>
                  <li>Job posture (standing vs sitting)</li>
                  <li>Diet history</li>
                  <li>Age-related adaptation</li>
                </ul>
                <p className="p-4 bg-gray-900 text-white rounded-xl text-center font-bold">This is why recalculating every 6–8 weeks matters.</p>
              </section>

              {/* Audience Groups */}
              <section className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-green-600">
                    Who Should Use a TDEE Calculator?
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                    <li>Want fat loss without extreme dieting</li>
                    <li>Want to maintain weight confidently</li>
                    <li>Are confused by calorie numbers</li>
                    <li>Want a logical food plan</li>
                    <li>Are learning nutrition basics</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-red-600">
                    Who Should Be Careful?
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">TDEE calculators are not medical tools. Extra guidance is needed for:</p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
                    <li>Pregnancy or breastfeeding</li>
                    <li>Medical metabolic conditions</li>
                    <li>Eating disorder recovery</li>
                    <li>Clinical weight management</li>
                  </ul>
                </div>
              </section>

              {/* Common Myths */}
              <section>
                <Card className="not-prose">
                  <CardHeader>
                    <CardTitle>Common Myths About TDEE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border px-4 py-2 text-left">Myth</th>
                            <th className="border px-4 py-2 text-left">Reality</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border px-4 py-2 italic">“Lower calories always works”</td>
                            <td className="border px-4 py-2 text-gray-600">Adaptation happens</td>
                          </tr>
                          <tr>
                            <td className="border px-4 py-2 italic">“Exercise fixes everything”</td>
                            <td className="border px-4 py-2 text-gray-600">Daily movement matters more</td>
                          </tr>
                          <tr>
                            <td className="border px-4 py-2 italic">“One TDEE fits forever”</td>
                            <td className="border px-4 py-2 text-gray-600">Bodies change</td>
                          </tr>
                          <tr>
                            <td className="border px-4 py-2 italic">“More cardio = higher TDEE”</td>
                            <td className="border px-4 py-2 text-gray-600">Not always</td>
                          </tr>
                          <tr>
                            <td className="border px-4 py-2 italic">“Starving boosts fat loss”</td>
                            <td className="border px-4 py-2 text-gray-600">It slows progress</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* How to Check */}
              <section className=" bg-gray-50 p-8 rounded-3xl shadow-xl">
                <h2 className="text-2xl font-bold mb-6">How to Check If Your TDEE Is Close to Reality</h2>
                <p className="mb-4">After 2–3 weeks:</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 bg-white/20 rounded-md flex items-center justify-center shrink-0">✓</div>
                      <p><b>Weight stable</b> → TDEE likely accurate</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 bg-white/20 rounded-md flex items-center justify-center shrink-0">✓</div>
                      <p><b>Weight drops slowly</b> → small deficit</p>
                    </li>
                  </ul>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 bg-white/20 rounded-md flex items-center justify-center shrink-0">✓</div>
                      <p><b>Weight rises</b> → intake &gt; TDEE</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="h-6 w-6 bg-white/20 rounded-md flex items-center justify-center shrink-0">✓</div>
                      <p><b>No panic.</b> Adjust calmly.</p>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Final Note */}
              <section className="text-center pb-12">
                <h2 className="text-3xl font-bold mb-4">Master Your Metabolism</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Understanding your Total{" "}
                  <Link
                    href="/health/heart-rate-calculator"
                    className="no-underline hover:underline hover:text-blue-700"
                  >
                    Daily Energy Expenditure
                  </Link>{" "}
                  is the first step toward lasting health changes. 
                  Don&apos;t treat the number as a rule—treat it as a map that guides your movement and nutrition choices.
                </p>
              </section>

            </div>

            {/* SERVICE CTA */}
            <ServiceCTA
              eyebrow="A target is only useful while it is current"
              title="Your TDEE changes as your body does"
              body="The number above is right for the body you have today. As you lose weight it falls, which is why a target that worked in month one quietly stops working in month three. Calqulate Vitals keeps your weight, meals and activity on one timeline so you can see when yours has moved."
              bullets={[
                "Log a weight or meal in seconds",
                "Everything you log on one timeline",
                "Protein check on your meals",
                "See when you will reach your goal (Premium)",
              ]}
              href="/signup?next=/dashboard/glp1"
              learnMoreHref="/product/glp1-progress-tracker"
              cta="Start tracking free"
            />

            <RelatedCalculators slug="tdee-calculator" />

            {/* Structured FAQ UI */}
            <div className="mt-12">
              <FAQSection faqs={faqs} />
            </div>
            <MedicalReviewerSection />
            <AuthorSection />
          </div>
        </div>
      </main>

      {/* Author Schema */}
      <AuthorSchema />

      <Footer />
    </div>
  )
}