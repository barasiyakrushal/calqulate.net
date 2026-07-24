import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import EAGCalculator from "@/components/calculators/estimated-average-glucose-calculator"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Activity,
  Calculator,
  LineChart,
  ClipboardCheck,
  Info,
  Beaker,
  AlertTriangle,
  Stethoscope,
  CheckCircle2,
  Table,
  ArrowRight,
  Zap,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { RelatedCalculators } from "@/components/calculators/related-calculators"

export const metadata: Metadata = {
  title: "eAG Calculator: Convert HbA1c to Estimated Average Glucose",
  description:
    "Easily convert your HbA1c percentage into Estimated Average Glucose (eAG). Understand your daily blood sugar levels in mg/dL or mmol/L for better diabetes management.",
  keywords:
    "eAG calculator, estimated average glucose, HbA1c to glucose conversion, calculate average blood sugar, A1c to eAG formula, diabetes management tool",
  alternates: {
    canonical: "https://calqulate.net/health/estimated-average-glucose-calculator",
  },
  openGraph: {
    title: "eAG Calculator: Convert HbA1c to Estimated Average Glucose",
    description: "Easily convert your HbA1c percentage into Estimated Average Glucose (eAG). Understand your daily blood sugar levels in mg/dL or mmol/L for better diabetes management.",
    url: "https://calqulate.net/health/estimated-average-glucose-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "eAG Calculator: Convert HbA1c to Estimated Average Glucose",
    description: "Easily convert your HbA1c percentage into Estimated Average Glucose (eAG). Understand your daily blood sugar levels in mg/dL or mmol/L for better diabetes management.",
  },
}

const faqs = [
  {
    question: "What is estimated average glucose (eAG)?",
    answer:
      "Estimated Average Glucose (eAG) is a value calculated from your HbA1c percentage that represents your average blood sugar levels over the past 2–3 months in the same units used by daily glucometers (mg/dL or mmol/L).",
  },
  {
    question: "How accurate is the eAG calculator?",
    answer:
      "The eAG calculator is based on a clinically validated international study. While it provides a highly reliable estimate of long-term averages, it is not a replacement for daily finger-stick monitoring.",
  },
  {
    question: "Is eAG better than HbA1c?",
    answer:
      "Neither is 'better'; they work together. HbA1c is the laboratory standard, while eAG makes that number easier to understand by relating it to the daily readings you see on your sugar monitor.",
  },
  {
    question: "What is a normal estimated average glucose range?",
    answer:
      "A normal eAG is typically below 117 mg/dL (which corresponds to an HbA1c below 5.7%). Levels between 117 and 139 mg/dL indicate prediabetes.",
  },
  {
    question: "Can eAG be wrong?",
    answer:
      "Yes, eAG calculations can be less accurate in individuals with anemia, hemoglobin variants, kidney disease, or during pregnancy, as these conditions affect HbA1c levels.",
  },
]

export default function EAGCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Estimated Average Glucose (eAG) Calculator"
        description="Convert your HbA1c value into an average daily blood glucose level in mg/dL or mmol/L."
        url="https://calqulate.net/health/eag-calculator"
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
              Estimated Average Glucose (eAG) Calculator
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              Understand your HbA1c in daily sugar terms. This tool converts your long-term HbA1c percentage into the average daily blood glucose numbers you see on your meter.
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
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 md:p-6">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <p className="text-sm md:text-base leading-relaxed text-slate-700">
                Calqulate.net converts your HbA1c into estimated average glucose using the recognised ADAG formula. You get an accurate everyday glucose figure in both mg/dL and mmol/L with clear targets.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "A1C → eAG", label: "Convert" },
              { value: "Free", label: "Price" },
              { value: "No", label: "Sign-up" },
              { value: "Instant", label: "Results" },
              { value: "Private", label: "In-browser" },
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
            <EAGCalculator />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">

            <div className="prose prose-gray dark:prose-invert max-w-none mt-12 space-y-12">
              
              {/* Definition Section */}
              <section className="py-8 border-b border-gray-100">
                <h2 className="mb-4 text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Info className="w-6 h-6 text-green-600" />
                  What Is an Estimated Average Glucose (eAG) Calculator?
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  An Estimated Average Glucose (eAG) calculator converts your HbA1c value into an average daily blood glucose level. In simple words:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                    <span className="font-bold text-green-800 block mb-1">HbA1c</span>
                    <p className="text-sm text-gray-600">Long-term blood sugar average measured over 2–3 months.</p>
                  </div>
                  <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
                    <span className="font-bold text-green-800 block mb-1">eAG</span>
                    <p className="text-sm text-gray-600">What that HbA1c means in day-to-day glucose numbers (mg/dL or mmol/L).</p>
                  </div>
                </div>
              </section>

              {/* Why eAG Matters */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Why eAG Is More Understandable Than HbA1c</h2>
                <p className="text-gray-700 mb-4">HbA1c can feel abstract. Most people ask: <br /> 
                <span className="italic text-gray-500">“My HbA1c is 6.8… is that bad? What does this mean for my daily sugar levels?”</span></p>
                <p className="bg-white border-l-4 border-green-600 p-4 shadow-sm text-gray-700">
                  <strong>eAG makes it real and relatable.</strong> It answers the question: “On average, what has my blood sugar been every day?”
                </p>
              </section>

              {/* Formula Card */}
              <section>
                <Card className="border-green-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="bg-green-50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-green-800">
                      <Calculator className="w-5 h-5" />
                      eAG Calculator Formula (Clear & Honest)
                    </CardTitle>
                    <CardDescription className="text-green-700/80">
                      The standard formula used globally by major diabetes organizations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row justify-around gap-6 text-center">
                        <div className="p-4 bg-white border border-green-100 rounded-xl flex-1">
                          <p className="text-xs uppercase font-bold text-gray-400 mb-2">Formula for mg/dL</p>
                          <p className="text-xl font-mono font-bold text-green-700">eAG = (28.7 × HbA1c) − 46.7</p>
                        </div>
                        <div className="p-4 bg-white border border-green-100 rounded-xl flex-1">
                          <p className="text-xs uppercase font-bold text-gray-400 mb-2">Formula for mmol/L</p>
                          <p className="text-xl font-mono font-bold text-green-700">eAG = (1.59 × HbA1c) − 2.59</p>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" /> Example Calculation
                        </h4>
                        <p className="text-sm text-gray-700">
                          If your <strong>HbA1c = 7.0%</strong>:<br />
                          eAG = (28.7 × 7) − 46.7 = <strong>154 mg/dL</strong>. <br />
                          This means your average blood sugar over 2–3 months was approximately 154 mg/dL.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Range Table */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Table className="w-6 h-6 text-green-600" />
                  Estimated Average Glucose Range by HbA1c
                </h2>
                <Card className="not-prose overflow-hidden border-green-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-green-600 text-white">
                        <th className="px-6 py-4 text-left font-bold">HbA1c (%)</th>
                        <th className="px-6 py-4 text-left font-bold">eAG (mg/dL)</th>
                        <th className="px-6 py-4 text-left font-bold">Meaning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr><td className="px-6 py-3">5.0</td><td className="px-6 py-3">97</td><td className="px-6 py-3 font-medium text-green-600">Normal</td></tr>
                      <tr className="bg-green-50/30"><td className="px-6 py-3">5.5</td><td className="px-6 py-3">111</td><td className="px-6 py-3 font-medium text-green-600">Healthy</td></tr>
                      <tr><td className="px-6 py-3">5.7</td><td className="px-6 py-3">117</td><td className="px-6 py-3 font-medium text-yellow-600">Prediabetes starts</td></tr>
                      <tr className="bg-green-50/30">
                        <td className="px-6 py-3">6.0</td>
                        <td className="px-6 py-3">126</td>
                        <td className="px-6 py-3 font-medium text-yellow-600">
                          <Link
                            href="/health/diabetes-risk-calculator"
                            className="hover:underline hover:text-yellow-700 transition-colors"
                          >
                            Prediabetes
                          </Link>
                        </td>
                      </tr>
                      <tr><td className="px-6 py-3">6.5</td><td className="px-6 py-3">140</td><td className="px-6 py-3 font-medium text-red-600">Diabetes threshold</td></tr>
                      <tr className="bg-green-50/30"><td className="px-6 py-3">7.0</td><td className="px-6 py-3">154</td><td className="px-6 py-3 text-gray-600">Diabetes (controlled)</td></tr>
                      <tr><td className="px-6 py-3">8.0</td><td className="px-6 py-3">183</td><td className="px-6 py-3 text-gray-600">Poor control</td></tr>
                      <tr className="bg-green-50/30"><td className="px-6 py-3">9.0</td><td className="px-6 py-3">212</td><td className="px-6 py-3 font-bold text-red-700">High risk</td></tr>
                    </tbody>
                  </table>
                </Card>
              </section>

              {/* Comparison Section */}
              <section className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                    <LineChart className="text-green-600 w-5 h-5" /> eAG vs Finger-Stick
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p><strong>Finger-stick glucose:</strong> Sugar at one specific moment.</p>
                    <p><strong>eAG:</strong> The big picture 2–3 month average.</p>
                    <p><strong>HbA1c:</strong> The long-term chemical exposure percentage.</p>
                  </div>
                </div>
                <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-yellow-800">
                    <AlertTriangle className="w-5 h-5" /> Why they may differ
                  </h3>
                  <ul className="text-sm text-yellow-900/80 space-y-1 list-disc pl-4">
                    <li>Frequent post-meal spikes</li>
                    <li>Missed high readings during the day</li>
                    <li>Night-time glucose rises</li>
                    <li>Anemia or hemoglobin variants</li>
                  </ul>
                </div>
              </section>

              {/* Who Should Use / Pregnancy Note */}
              <section className="bg-green-600 rounded-3xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-6 text-white">Who Should Use This?</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <p className="opacity-90">Ideal for those who:</p>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-200" /> Have Diabetes or Prediabetes</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-200" /> Monitor HbA1c regularly</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-200" /> Want clear, relatable sugar data</li>
                    </ul>
                  </div>
                  <div className="bg-white/10 p-5 rounded-2xl">
                    <h4 className="font-bold mb-2 flex items-center gap-2"><Stethoscope className="w-5 h-5" /> Medical Note</h4>
                    <p className="text-xs leading-relaxed opacity-90">
                      eAG is valid for most adults. However, in children, pregnancy, anemia, or kidney disease, HbA1c may be misleading. Always interpret these results with medical context.
                    </p>
                  </div>
                </div>
              </section>

              {/* Practical Meaning Section */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">What to Do With Your eAG Result</h2>
                <div className="grid md:grid-cols-3 gap-6 not-prose">
                  <div className="p-5 border border-gray-100 rounded-2xl bg-white">
                    <h4 className="font-bold text-green-700 mb-2">Normal (&lt;117)</h4>
                    <p className="text-sm text-gray-600">Maintain your current lifestyle and schedule an annual HbA1c check.</p>
                  </div>
                  <div className="p-5 border border-gray-100 rounded-2xl bg-white">
                    <h4 className="font-bold text-yellow-600 mb-2">Prediabetes (117–139)</h4>
                    <p className="text-sm text-gray-600">Reduce sugar, increase activity, and recheck in 3–6 months.</p>
                  </div>
                  <div className="p-5 border border-gray-100 rounded-2xl bg-white">
                    <h4 className="font-bold text-red-600 mb-2">High (≥140)</h4>
                    <p className="text-sm text-gray-600">Consult a doctor for medication and lifestyle adjustments.</p>
                  </div>
                </div>
              </section>

              {/* Myths Section */}
              <section className="text-center pt-8 border-t">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Common Myths About eAG & HbA1c</h3>
                <div className="max-w-2xl mx-auto space-y-4">
                  <p className="text-sm text-muted-foreground italic">"HbA1c shows today's sugar" — False</p>
                  <p className="text-sm text-muted-foreground italic">"eAG replaces glucose testing" — False</p>
                  <p className="text-sm text-muted-foreground italic">"Normal fasting sugar means no diabetes" — False</p>
                </div>
              </section>

              {/* Internal Link CTA */}
              <section className="not-prose mt-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-gradient-to-r from-green-600 to-green-700 rounded-3xl text-white shadow-xl">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Worried about your risk?</h3>
                    <p className="text-gray-300 max-w-md">
                      If your eAG is high, use our Diabetes Risk Calculator to assess your overall risk level.
                    </p>
                  </div>
                  <Button asChild size="lg" variant="secondary" className="whitespace-nowrap">
                    <Link href="/health/diabetes-risk-calculator">
                      Assess Diabetes Risk <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </section>

            </div>

            <RelatedCalculators slug="estimated-average-glucose-calculator" />

            {/* Structured FAQ UI */}
            <div className="mt-12">
              <FAQSection faqs={faqs} />
            </div>

            {/* Author Badge Section */}
            <MedicalReviewerSection lastReviewed="July 24, 2026" />
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