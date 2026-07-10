import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import IdealWeightExperience from "@/components/ideal-weight/IdealWeightExperience"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Scale,
  Ruler,
  ShieldCheck,
  UserCheck,
  Info,
  FileText,
  Activity,
  HeartPulse,
  CheckCircle2,
  ArrowRight,
  Calculator,
  ClipboardList,
  Stethoscope,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { RelatedCalculators } from "@/components/calculators/related-calculators"

export const metadata: Metadata = {
  title: "Ideal Body Weight Calculator – Free IBW Tool for Men & Women",
  description:
    "Use our free ideal body weight calculator to find your healthy weight by height and gender. Supports metric & imperial with Devine formula results in kg and lbs.",
  keywords:
    "ideal body weight calculator, ideal weight calculator, weight calculator, healthy weight calculator, body weight calculator, calculate ideal body weight, ideal body weight formula, weight calculator for men, ideal weight calculator female, ideal weight calculator in kg, height weight calculator, age and weight calculator",
  alternates: {
    canonical: "https://calqulate.net/health/ideal-body-weight-calculator",
    },
  openGraph: {
    title: "Ideal Body Weight Calculator – Free IBW Tool for Men & Women",
    description: "Use our free ideal body weight calculator to find your healthy weight by height and gender. Supports metric & imperial with Devine formula results in kg and lbs.",
    url: "https://calqulate.net/health/ideal-body-weight-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ideal Body Weight Calculator – Free IBW Tool for Men & Women",
    description: "Use our free ideal body weight calculator to find your healthy weight by height and gender. Supports metric & imperial with Devine formula results in kg and lbs.",
  },
}

const faqs = [
  {
    question: "What is my ideal weight for my height?",
    answer:
      "Your ideal weight depends on your height and gender. Using the Devine formula: for women, IBW = 45.5 kg + 2.3 kg per inch over 5 feet; for men, IBW = 50 kg + 2.3 kg per inch over 5 feet. Enter your height above to get your exact result instantly.",
  },
  {
    question: "How accurate is ideal body weight?",
    answer:
      "IBW formulas are accurate as population-level screening tools validated across large clinical datasets. They are less accurate for athletes, individuals with high muscle mass, or specific medical conditions. Always treat IBW as a directional target within a ±10% healthy range.",
  },
  {
    question: "What is the ideal body weight calculation formula?",
    answer:
      "The most widely used formula is the Devine Formula. For men: IBW = 50 kg + 2.3 kg per inch over 5 feet. For women: IBW = 45.5 kg + 2.3 kg per inch over 5 feet. Our calculator also runs the Robinson and Miller formulas for a complete clinical picture.",
  },
  {
    question: "Can women use the same formula as men?",
    answer:
      "No. The ideal weight calculator for females uses a 45.5 kg baseline vs. 50 kg for men, reflecting real physiological differences in body composition, essential fat, and bone density. Always use a gender-specific formula for accurate results.",
  },
  {
    question: "Is ideal body weight better than BMI?",
    answer:
      "Neither is better — they answer different questions. IBW tells you what you should weigh (a goal). BMI tells you how your current weight is classified relative to your height. Best practice: use both together, not one alone.",
  },
  {
    question: "Does age affect ideal body weight?",
    answer:
      "The standard IBW formula doesn't adjust for age, but body composition changes significantly after 50. An age and weight approach acknowledges that older adults may have slightly higher fat percentages while still being metabolically healthy. For those 60+, always combine IBW with clinical guidance.",
  },
  {
    question: "What is the ideal weight calculator in kg vs lbs?",
    answer:
      "All standard IBW formulas produce results in kilograms. To convert to pounds, multiply kg × 2.2046. Our ideal weight calculator in kg and lbs modes use identical formulas — only the display unit changes. Select your preferred unit in the calculator toggle.",
  },
  {
    question: "What is the ideal body weight for a 6-foot male?",
    answer:
      "Using the Devine formula: 6 feet = 72 inches = 12 inches over 5 feet. IBW = 50 + (12 × 2.3) = 77.6 kg (~171 lbs). Healthy range: approximately 70–85 kg.",
  },
]

export default function IdealBodyWeightCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Ideal Body Weight Calculator"
        description="Calculate your ideal body weight by height and gender using medically accepted formulas including Devine, Robinson, and Miller. Supports metric and imperial units."
        url="https://calqulate.net/health/ideal-body-weight-calculator"
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
              Your healthiest weight, personalized in a minute
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-balance leading-tight text-slate-900">
              Ideal Body Weight Calculator
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              Use our free <strong>ideal body weight calculator</strong> to find your healthy weight range by height and gender — using the same scientific formulas doctors actually use, not social media trends.
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
                Calqulate.net finds your healthy weight range using the Devine, Robinson, Miller and Hamwi formulas for a fair spread. You get realistic targets in your chosen units, not one rigid number.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "4", label: "Formulas", sub: "Medical standard" },
              { value: "Ideal", label: "Weight range", sub: "Personalized" },
              { value: "BMI", label: "Health status", sub: "Instant" },
              { value: "Goal", label: "Weight plan", sub: "Safe target" },
              { value: "100%", label: "Private", sub: "In-browser" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-5 text-center">
                <p className="text-2xl md:text-3xl font-bold text-slate-900">{s.value}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {s.label}
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CALCULATOR — a guided ideal-weight health assessment */}
        <section id="calculator" className="scroll-mt-20 bg-slate-50/60">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
            <IdealWeightExperience />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">

            <div className="prose prose-gray dark:prose-invert max-w-none mt-12 space-y-12">

              {/* ── WHAT IS IBW ── */}
              <section className="py-8 border-b border-gray-100">
                <h2 className="mb-4 text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-green-600" />
                  What Is an Ideal Body Weight Calculator?
                </h2>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  An <strong>ideal body weight calculator</strong> is a clinical tool that estimates the healthy weight range for a person based on <strong>height and gender</strong>. Unlike a general <em>weight calculator by height</em> that plots you on a chart, an IBW calculator uses medically validated formulas developed for hospitals, drug dosing, and nutrition planning.
                </p>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  Think of it as a <strong>healthy weight calculator</strong> grounded in physiology — not aesthetics. It answers four practical questions:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-6 not-prose">
                  <div className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                    <h4 className="font-bold text-green-800 mb-1">🩺 Health Status Check</h4>
                    <p className="text-sm text-gray-600">Am I underweight, in a healthy range, or overweight for my height right now?</p>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                    <h4 className="font-bold text-green-800 mb-1">🎯 Weight Goal Setting</h4>
                    <p className="text-sm text-gray-600">What is the target number I should work toward — in kg or lbs?</p>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                    <h4 className="font-bold text-green-800 mb-1">📊 Safe Progress Tracking</h4>
                    <p className="text-sm text-gray-600">How far am I from my healthy range, and how fast should I move?</p>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                    <h4 className="font-bold text-green-800 mb-1">💊 Medical Reference</h4>
                    <p className="text-sm text-gray-600">Used by clinicians for medication dosing, anesthesia, and nutrition therapy.</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-700 font-medium bg-green-50 p-3 rounded-lg border-l-4 border-green-600">
                  A <em>body weight calculator</em> based on IBW gives you a <strong>target</strong> weight, while a BMI calculator classifies your <strong>current</strong> weight. Both serve different purposes — and the smartest users run both.
                </p>
              </section>

              {/* ── HOW TO CALCULATE ── */}
              <section>
                <Card className="border-green-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="bg-green-50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-green-800">
                      <Info className="w-5 h-5" />
                      How to Calculate Ideal Body Weight
                    </CardTitle>
                    <CardDescription className="text-green-700/80">
                      Doctors don't use just one formula — they compare multiple methods to get a realistic range.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-700 mb-4 font-semibold uppercase tracking-wider text-sm">
                      The most commonly used ideal body weight calculation formula is the Devine Formula:
                    </p>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 font-bold">♂</div>
                        <div>
                          <p className="font-semibold text-gray-800">For Men</p>
                          <p className="text-gray-700 font-mono text-sm bg-gray-50 px-3 py-1 rounded mt-1">IBW = 50 kg + 2.3 kg per inch over 5 feet</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 font-bold">♀</div>
                        <div>
                          <p className="font-semibold text-gray-800">For Women</p>
                          <p className="text-gray-700 font-mono text-sm bg-gray-50 px-3 py-1 rounded mt-1">IBW = 45.5 kg + 2.3 kg per inch over 5 feet</p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-6 text-sm italic text-gray-500 border-t pt-4">
                      This formula is widely used in hospitals, medical dosing, and nutrition planning. Our calculator also runs the Robinson and Miller formulas, giving you three reference points for a complete body weight calculation.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* ── IBW OUTPUT TABLE ── */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-green-600" />
                  Ideal Body Weight Calculation — Output Reference
                </h2>
                <p className="mb-4 text-gray-700">
                  Our <strong>body weight calculator</strong> doesn't just give you one number. You get three clinically validated formula results plus a healthy range:
                </p>

                <Card className="not-prose overflow-hidden border-green-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="bg-green-600 text-white">
                          <th className="px-6 py-4 text-left font-bold sticky top-0 bg-green-600">Formula</th>
                          <th className="px-6 py-4 text-left font-bold sticky top-0 bg-green-600">Used For</th>
                          <th className="px-6 py-4 text-left font-bold sticky top-0 bg-green-600">Clinical Context</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr>
                          <td className="px-6 py-4 font-bold text-green-700">✅ Devine Formula</td>
                          <td className="px-6 py-4">Drug dosing, ventilation</td>
                          <td className="px-6 py-4">Most widely used in hospitals</td>
                        </tr>
                        <tr className="bg-green-50/30">
                          <td className="px-6 py-4 font-bold text-green-700">✅ Robinson Formula</td>
                          <td className="px-6 py-4">Nutritional assessment</td>
                          <td className="px-6 py-4">Commonly used in dietetics</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-bold text-green-700">✅ Miller Formula</td>
                          <td className="px-6 py-4">General fitness reference</td>
                          <td className="px-6 py-4">Lower estimates, used in fitness</td>
                        </tr>
                        <tr className="bg-green-50/30">
                          <td className="px-6 py-4 font-bold text-green-700">✅ Healthy Range</td>
                          <td className="px-6 py-4">Goal setting</td>
                          <td className="px-6 py-4">IBW ± 10% is clinically accepted</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>

                <p className="mt-4 text-gray-700 italic">
                  This is especially useful for fitness tracking, medical reference, nutrition planning, and setting realistic weight goals.
                </p>
              </section>

              {/* ── FEMALE SECTION ── */}
              <section className="py-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <HeartPulse className="w-6 h-6 text-green-600" />
                  Ideal Weight Calculator — Female Focus
                </h2>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  Women naturally carry higher essential body fat (12–15% vs. 2–5% for men), have different hormonal profiles, and different lean mass distributions. This is precisely why an <strong>ideal weight calculator for female</strong> uses a lower baseline (45.5 kg vs. 50 kg for men) in the Devine formula. A generic <em>women weight calculator</em> that ignores gender-specific physiology will systematically overestimate female ideal weight.
                </p>

                <p className="mb-4 text-gray-700 font-semibold">Female Healthy Weight Chart by Height:</p>

                <Card className="not-prose overflow-hidden border-green-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[600px]">
                      <thead>
                        <tr className="bg-green-600 text-white">
                          <th className="px-6 py-4 text-left font-bold sticky top-0 bg-green-600">Height</th>
                          <th className="px-6 py-4 text-left font-bold sticky top-0 bg-green-600">Ideal Weight (kg)</th>
                          <th className="px-6 py-4 text-left font-bold sticky top-0 bg-green-600">Healthy Range (±10%)</th>
                          <th className="px-6 py-4 text-left font-bold sticky top-0 bg-green-600">IBW in lbs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-4">5'0" (152 cm)</td><td className="px-6 py-4 font-semibold text-green-700">~45.5 kg</td><td className="px-6 py-4">41–50 kg</td><td className="px-6 py-4">~100 lbs</td></tr>
                        <tr className="bg-green-50/30"><td className="px-6 py-4">5'2" (157 cm)</td><td className="px-6 py-4 font-semibold text-green-700">~50.1 kg</td><td className="px-6 py-4">45–55 kg</td><td className="px-6 py-4">~110 lbs</td></tr>
                        <tr><td className="px-6 py-4">5'4" (163 cm)</td><td className="px-6 py-4 font-semibold text-green-700">~54.6 kg</td><td className="px-6 py-4">49–60 kg</td><td className="px-6 py-4">~120 lbs</td></tr>
                        <tr className="bg-green-50/30"><td className="px-6 py-4">5'6" (168 cm)</td><td className="px-6 py-4 font-semibold text-green-700">~59.1 kg</td><td className="px-6 py-4">53–65 kg</td><td className="px-6 py-4">~130 lbs</td></tr>
                        <tr><td className="px-6 py-4">5'8" (173 cm)</td><td className="px-6 py-4 font-semibold text-green-700">~63.6 kg</td><td className="px-6 py-4">57–70 kg</td><td className="px-6 py-4">~140 lbs</td></tr>
                        <tr className="bg-green-50/30"><td className="px-6 py-4">5'10" (178 cm)</td><td className="px-6 py-4 font-semibold text-green-700">~68.2 kg</td><td className="px-6 py-4">61–75 kg</td><td className="px-6 py-4">~150 lbs</td></tr>
                      </tbody>
                    </table>
                  </div>
                </Card>

                <p className="mt-4 text-gray-700 font-medium bg-green-50 p-3 rounded-lg border-l-4 border-green-600">
                  <strong>Example — 5'2" Female:</strong> 45.5 + (2 × 2.3) = <strong>50.1 kg</strong> ideal body weight. Healthy range: 45–55 kg.
                </p>
              </section>

              {/* ── MALE SECTION ── */}
              <section className="py-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Ruler className="w-6 h-6 text-green-600" />
                  Weight Calculator for Men — Including 6-Foot Reference
                </h2>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  The <strong>weight calculator for men</strong> starts at a 50 kg baseline for 5 feet and adds 2.3 kg per inch. Men have greater muscle mass potential, denser bones, and lower essential fat percentages — all of which justify the higher starting point in the <em>ideal body weight formula</em>.
                </p>

                <Card className="not-prose overflow-hidden border-green-200 mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[600px]">
                      <thead>
                        <tr className="bg-green-600 text-white">
                          <th className="px-6 py-4 text-left font-bold sticky top-0 bg-green-600">Height</th>
                          <th className="px-6 py-4 text-left font-bold sticky top-0 bg-green-600">Ideal Weight (kg)</th>
                          <th className="px-6 py-4 text-left font-bold sticky top-0 bg-green-600">Healthy Range (±10%)</th>
                          <th className="px-6 py-4 text-left font-bold sticky top-0 bg-green-600">IBW in lbs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-4">5'6" (168 cm)</td><td className="px-6 py-4 font-semibold text-green-700">~63.8 kg</td><td className="px-6 py-4">57–70 kg</td><td className="px-6 py-4">~141 lbs</td></tr>
                        <tr className="bg-green-50/30"><td className="px-6 py-4">5'8" (173 cm)</td><td className="px-6 py-4 font-semibold text-green-700">~68.4 kg</td><td className="px-6 py-4">62–75 kg</td><td className="px-6 py-4">~151 lbs</td></tr>
                        <tr><td className="px-6 py-4">5'10" (178 cm)</td><td className="px-6 py-4 font-semibold text-green-700">~73.0 kg</td><td className="px-6 py-4">66–80 kg</td><td className="px-6 py-4">~161 lbs</td></tr>
                        <tr className="bg-green-50/30"><td className="px-6 py-4">5'11" (180 cm)</td><td className="px-6 py-4 font-semibold text-green-700">~75.3 kg</td><td className="px-6 py-4">68–83 kg</td><td className="px-6 py-4">~166 lbs</td></tr>
                        <tr><td className="px-6 py-4 font-bold">6'0" (183 cm)</td><td className="px-6 py-4 font-bold text-green-700">~77.6 kg</td><td className="px-6 py-4 font-bold">70–85 kg</td><td className="px-6 py-4 font-bold">~171 lbs</td></tr>
                        <tr className="bg-green-50/30"><td className="px-6 py-4">6'2" (188 cm)</td><td className="px-6 py-4 font-semibold text-green-700">~82.1 kg</td><td className="px-6 py-4">74–90 kg</td><td className="px-6 py-4">~181 lbs</td></tr>
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card className="border-green-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="bg-green-50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-green-800">
                      <ClipboardList className="w-5 h-5" />
                      Ideal Weight for 6 Feet Male — Step by Step
                    </CardTitle>
                    <CardDescription className="text-green-700/80">
                      One of the most searched <em>calculate ideal weight</em> queries — solved here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 font-bold">1</div>
                      <p className="text-gray-700">Height = 72 inches → <strong>12 inches over 5 feet</strong></p>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 font-bold">2</div>
                      <p className="text-gray-700">IBW = 50 + (12 × 2.3) = 50 + 27.6</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 font-bold">✅</div>
                      <p className="text-gray-700 font-bold text-green-700">Ideal Weight = 77.6 kg (~171 lbs) · Healthy Range: 70–85 kg</p>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* ── AGE & WEIGHT ── */}
              <section className="py-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-green-600" />
                  Age and Weight Calculator — Does Age Change Your IBW?
                </h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  The core <strong>ideal body weight formula</strong> does not adjust for age — but your body's composition, tolerance, and goals absolutely shift with age. An <em>age and weight calculator</em> that only outputs one number for a 22-year-old and a 65-year-old is missing important clinical nuance.
                </p>

                <div className="grid md:grid-cols-3 gap-6 not-prose">
                  <div className="p-5 border border-gray-100 rounded-2xl bg-white hover:border-green-300 transition-colors shadow-sm text-center">
                    <p className="text-2xl font-bold text-green-700 mb-2">18 – 30</p>
                    <p className="text-sm text-gray-600 leading-relaxed">Peak muscle-building potential. IBW is a fair target. Focus on lean muscle, not just the scale number.</p>
                  </div>
                  <div className="p-5 border border-gray-100 rounded-2xl bg-white hover:border-green-300 transition-colors shadow-sm text-center">
                    <p className="text-2xl font-bold text-green-700 mb-2">30 – 50</p>
                    <p className="text-sm text-gray-600 leading-relaxed">Gradual sarcopenia begins. Maintaining muscle while managing fat percentage becomes the priority.</p>
                  </div>
                  <div className="p-5 border border-gray-100 rounded-2xl bg-white hover:border-green-300 transition-colors shadow-sm text-center">
                    <p className="text-2xl font-bold text-green-700 mb-2">50+</p>
                    <p className="text-sm text-gray-600 leading-relaxed">Bone density decreases, fat distribution shifts. IBW may need clinical adjustment for this age group.</p>
                  </div>
                </div>

                <p className="mt-4 text-gray-700 font-medium bg-green-50 p-3 rounded-lg border-l-4 border-green-600">
                  Use this <em>body weight average calculator</em> as your baseline, then layer in your age context. A 55-year-old woman at 55 kg and a 25-year-old woman at 55 kg have very different health pictures.
                </p>
              </section>

              {/* ── IBW vs BMI ── */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-green-600" />
                  Ideal Body Weight vs BMI Calculator
                </h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  Both are tools in the same toolbox — but they answer completely different questions. Knowing when to <em>calculate weight</em> via IBW vs. BMI is what separates informed health tracking from guesswork.
                </p>

                <Card className="not-prose overflow-hidden border-green-200 mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="bg-green-600 text-white">
                          <th className="px-6 py-4 text-left font-bold sticky top-0 bg-green-600">Factor</th>
                          <th className="px-6 py-4 text-left font-bold sticky top-0 bg-green-600">Ideal Body Weight</th>
                          <th className="px-6 py-4 text-left font-bold sticky top-0 bg-green-600">BMI Calculator</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr><td className="px-6 py-4">Uses height</td><td className="px-6 py-4 text-green-600 font-semibold">✅ Yes</td><td className="px-6 py-4 text-green-600 font-semibold">✅ Yes</td></tr>
                        <tr className="bg-green-50/30"><td className="px-6 py-4">Uses current weight</td><td className="px-6 py-4 text-gray-400">❌ No</td><td className="px-6 py-4 text-green-600 font-semibold">✅ Yes</td></tr>
                        <tr><td className="px-6 py-4">Gives a target weight</td><td className="px-6 py-4 text-green-600 font-semibold">✅ Yes</td><td className="px-6 py-4 text-gray-400">❌ No</td></tr>
                        <tr className="bg-green-50/30"><td className="px-6 py-4">Classifies obesity</td><td className="px-6 py-4 text-gray-400">❌ No</td><td className="px-6 py-4 text-green-600 font-semibold">✅ Yes</td></tr>
                        <tr><td className="px-6 py-4">Used in medical dosing</td><td className="px-6 py-4 text-green-600 font-semibold">✅ Yes</td><td className="px-6 py-4 text-gray-400">❌ No</td></tr>
                        <tr className="bg-green-50/30"><td className="px-6 py-4">Gender-adjusted</td><td className="px-6 py-4 text-green-600 font-semibold">✅ Yes</td><td className="px-6 py-4 text-gray-400">❌ No</td></tr>
                        <tr><td className="px-6 py-4">Best use case</td><td className="px-6 py-4">Goal-setting, dosing</td><td className="px-6 py-4">Population screening</td></tr>
                      </tbody>
                    </table>
                  </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                      <Calculator className="text-green-600 w-5 h-5" /> How to Calculate BMI for Women
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      For users who also want to run a <em>healthy body weight calculator</em> using BMI:
                    </p>
                    <p className="font-mono text-sm bg-gray-50 px-3 py-2 rounded border mb-3">BMI = Weight (kg) ÷ Height² (m²)</p>
                    <ul className="space-y-1 text-sm text-gray-700 list-none pl-0">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Underweight: &lt; 18.5</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Normal: 18.5 – 24.9</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-yellow-500" /> Overweight: 25 – 29.9</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-red-500" /> Obese: 30+</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                      <HeartPulse className="text-green-600 w-5 h-5" /> Why IBW is Not One Fixed Number
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      Your real healthy weight depends on more than height. Four factors regularly push a person's optimal weight outside the standard IBW range:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-700 list-none pl-0">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Bone structure & frame size</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Muscle mass & lean body tissue</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Activity level & training history</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Medical conditions & medications</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* ── WHO SHOULD NOT RELY ONLY ON IBW ── */}
              <section className="border-2 border-dashed border-green-200 p-6 rounded-2xl bg-green-50/30">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-green-800 uppercase tracking-tight">
                  <Activity className="w-5 h-5" /> Who Should NOT Rely Only on Ideal Body Weight?
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  IBW is a <strong>screening tool, not a diagnosis</strong>. Use caution if you fall into these groups — always combine IBW with clinical guidance:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 list-none pl-0">
                  <div className="bg-white border border-green-200 p-3 rounded-xl text-center text-sm font-medium text-gray-700">🏋️ Athletes</div>
                  <div className="bg-white border border-green-200 p-3 rounded-xl text-center text-sm font-medium text-gray-700">🤰 Pregnant</div>
                  <div className="bg-white border border-green-200 p-3 rounded-xl text-center text-sm font-medium text-gray-700">👴 Elderly (60+)</div>
                  <div className="bg-white border border-green-200 p-3 rounded-xl text-center text-sm font-medium text-gray-700">🏥 Chronic Illness</div>
                </div>
              </section>

              {/* ── RELIABILITY ── */}
              <section className="bg-green-600 rounded-3xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6" />
                  Practical Use of Your IBW Result
                </h2>
                <p className="mb-6 opacity-90">Knowing how to use your <em>find ideal weight</em> result correctly is as important as the number itself.</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-green-200 mb-3">✅ Use IBW For</p>
                    <div className="space-y-2">
                      {["Setting realistic, science-backed weight goals", "Medical and clinical reference", "Nutrition and calorie planning", "Long-term fitness tracking"].map((item) => (
                        <div key={item} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-200 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-red-200 mb-3">❌ Don't Use IBW For</p>
                    <div className="space-y-2">
                      {["Comparing yourself to others", "Crash dieting or extreme restriction", "Body image judgment or self-criticism", "Overriding a doctor's recommendation"].map((item) => (
                        <div key={item} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl text-sm">
                          <span className="text-red-300 shrink-0">✗</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* ── USE CASES ── */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-green-600" />
                  Calculate My Ideal Weight – Common Use Cases
                </h2>
                <div className="grid md:grid-cols-3 gap-6 not-prose">
                  <div className="p-5 border border-gray-100 rounded-2xl bg-white hover:border-green-300 transition-colors shadow-sm">
                    <h4 className="font-bold text-green-800 mb-2">Medical Reference</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Used by doctors for drug dosing calculations, anesthesia planning, and nutritional assessments in clinical settings.</p>
                  </div>
                  <div className="p-5 border border-gray-100 rounded-2xl bg-white hover:border-green-300 transition-colors shadow-sm">
                    <h4 className="font-bold text-green-800 mb-2">Fitness & Nutrition</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Set a science-backed target weight for your training program, calorie deficit, or meal plan — not based on trends.</p>
                  </div>
                  <div className="p-5 border border-gray-100 rounded-2xl bg-white hover:border-green-300 transition-colors shadow-sm">
                    <h4 className="font-bold text-green-800 mb-2">Personal Health Check</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">Quick self-assessment for anyone who wants to know where they stand relative to a healthy body weight range.</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-700 italic">
                  If you've ever searched "what's my ideal body weight" or "calculate your ideal weight" — this tool is built exactly for you.
                </p>
              </section>

              {/* ── WHO BUILT THIS ── */}
              <section className="text-center pt-8 border-t">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                  <UserCheck className="w-6 h-6 text-green-600" />
                  Your Health Is Unique
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Ideal Body Weight is a helpful compass, not a final destination. Every body is shaped by daily habits, strength, genetics, and how you feel — not just a single number on a scale. Use this <strong>ideal body weight calculator</strong> as your starting point, then build from there.
                </p>
              </section>

              {/* ── CTA ── */}
              <section className="not-prose mt-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-gradient-to-r from-green-600 to-green-700 rounded-3xl text-white shadow-xl">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Checking your health metrics?</h3>
                    <p className="text-gray-300 max-w-md">
                      Now that you know your ideal body weight, see how your body measurements compare. Try our BMI Calculator next.
                    </p>
                  </div>
                  <Button asChild size="lg" variant="secondary" className="whitespace-nowrap">
                    <Link href="/health/bmi-calculator">
                      Check BMI <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </section>

            </div>

            <RelatedCalculators slug="ideal-body-weight-calculator" />

            {/* ── FAQ SECTION ── */}
            <div className="mt-12">
              <FAQSection faqs={faqs} />
            </div>

            {/* Author Badge Section */}
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
