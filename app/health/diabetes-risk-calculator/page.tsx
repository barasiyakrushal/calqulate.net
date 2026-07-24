import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ClickableImage } from "@/components/ui/image-lightbox"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import DiabetesRiskCalculator from "@/components/calculators/diabetes-risk-calculator"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Activity,
  Heart,
  Stethoscope,
  Users,
  Info,
  FileText,
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingDown,
  Globe,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { RelatedCalculators } from "@/components/calculators/related-calculators"

export const metadata: Metadata = {
  title: "Diabetes Risk Calculator: Type 2 Diabetes Screening | Fast & Free",
  description:
    "Assess your risk of developing type 2 diabetes with our free calculator. Based on lifestyle, family history, and body measurements. Fast, accurate, and private.",
  keywords:
    "diabetes risk calculator, type 2 diabetes risk, prediabetes screening, IDRS calculator, Indian diabetes risk score, gestational diabetes risk, calculate diabetes risk online",
  alternates: {
    canonical: "https://calqulate.net/health/diabetes-risk-calculator",
  },
  openGraph: {
    title: "Diabetes Risk Calculator: Type 2 Diabetes Screening | Fast & Free",
    description: "Assess your risk of developing type 2 diabetes with our free calculator. Based on lifestyle, family history, and body measurements. Fast, accurate, and private.",
    url: "https://calqulate.net/health/diabetes-risk-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diabetes Risk Calculator: Type 2 Diabetes Screening | Fast & Free",
    description: "Assess your risk of developing type 2 diabetes with our free calculator. Based on lifestyle, family history, and body measurements. Fast, accurate, and private.",
  },
}

const faqs = [
  {
    question: "What is a diabetes risk calculator?",
    answer:
      "A diabetes risk calculator is a screening tool that estimates your likelihood of developing type 2 diabetes based on factors like age, BMI, physical activity, and family history.",
  },
  {
    question: "Is the diabetes risk calculator accurate?",
    answer:
      "It is highly effective for screening and identifying high-risk individuals, but it is not a diagnostic tool. A blood test (HbA1c or Fasting Glucose) is required for a formal diagnosis.",
  },
  {
    question: "What is the Indian Diabetes Risk Score (IDRS)?",
    answer:
      "IDRS is a validated scoring system specifically designed for the Indian population, which considers waist circumference and activity levels more heavily due to different body compositions.",
  },
  {
    question: "Can I have high diabetes risk without symptoms?",
    answer:
      "Yes. Type 2 diabetes often develops silently for years. Most high-risk or prediabetic people feel completely normal until the condition progresses.",
  },
  {
    question: "How often should I check my diabetes risk?",
    answer:
      "It is recommended to check once a year, or sooner if you experience significant lifestyle changes, weight gain, or if you are over the age of 30.",
  },
]

export default function DiabetesRiskCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Diabetes Risk Calculator"
        description="Estimate your chance of developing type 2 diabetes based on lifestyle, body measurements, and health history."
        url="https://calqulate.net/health/diabetes-risk-calculator"
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
              Diabetes Risk Calculator
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              A diabetes risk calculator estimates your chance of developing type 2 diabetes based on lifestyle, body measurements, family history, and health factors.
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
                Calqulate.net assesses type-2 diabetes risk from lifestyle and body measurements using validated screening factors. You get a clear risk band, your top changeable factors and whether to get tested.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "Risk", label: "Score" },
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
            <DiabetesRiskCalculator />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">

            <div className="prose prose-gray dark:prose-invert max-w-none mt-12 space-y-12">
              
              {/* Importance Section */}
              <section className="py-8 border-b border-gray-100">
                <h2 className="mb-4 text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Activity className="w-6 h-6 text-green-600" />
                  Why This Calculator Is Important (Before Symptoms Start)
                </h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  More than <strong>50% of people</strong> with type 2 diabetes don’t know they have it. Diabetes develops silently for years before symptoms appear.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <p className="font-bold text-green-800 text-sm mb-1">Detect Prediabetes</p>
                    <p className="text-xs text-gray-600">Catch high blood sugar before it becomes chronic.</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <p className="font-bold text-green-800 text-sm mb-1">Insulin Resistance</p>
                    <p className="text-xs text-gray-600">Identify how your body processes energy.</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <p className="font-bold text-green-800 text-sm mb-1">Early Prevention</p>
                    <p className="text-xs text-gray-600">Early detection = prevention, not medication.</p>
                  </div>
                </div>
              </section>

              {/* How it works Card */}
              <section>
                <Card className="border-green-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="bg-green-50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-green-800">
                      <Info className="w-5 h-5" />
                      How Does the Diabetes Risk Score Work?
                    </CardTitle>
                    <CardDescription className="text-green-700/80">
                      We use validated scoring models based on population studies and clinical data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-700 mb-4 font-semibold uppercase tracking-wider text-sm">The Point-Based Scoring System:</p>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 font-bold">1</div>
                        <p className="text-gray-700"><strong>Demographics:</strong> Factors like age and gender are the baseline.</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 font-bold">2</div>
                        <p className="text-gray-700">
                          <strong>Measurements:</strong>{" "}
                          <Link
                            href="/health/waist-to-height-ratio-calculator"
                            className="font-medium hover:underline hover:text-green-700 transition-colors"
                          >
                            Waist circumference
                          </Link>{" "}
                          or BMI are measured.
                        </p>                      
                        </div>
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 font-bold">
                          3s
                        </div>

                        <p className="text-gray-700">
                          <strong>Lifestyle:</strong> Physical activity levels and{" "}
                          <Link
                            href="/health/blood-pressure-calculator"
                            className="font-medium hover:underline hover:text-green-700 transition-colors"
                          >
                            high blood pressure
                          </Link>{" "}
                          history.
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 font-bold">4</div>
                        <p className="text-gray-700"><strong>Family History:</strong> Genetic predisposition is added to the total.</p>
                      </div>
                    </div>
                    <p className="mt-6 text-sm italic text-gray-500 border-t pt-4">
                      Formula: Total Risk Score = Age + Waist/BMI + Activity + Family History + BP + Glucose History.
                    </p>
                  </CardContent>
                </Card>
              </section>

              {/* Indian Diabetes Risk Score (IDRS) */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-green-600" />
                  Indian Diabetes Risk Score (IDRS)
                </h2>
                <p className="mb-4 text-gray-700">
                  Indians develop diabetes at a lower BMI, younger ages, and with more abdominal fat. That’s why a separate IDRS calculator is essential for accurate screening in India.
                </p>
               
                <Card className="not-prose overflow-hidden border-green-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-green-600 text-white">
                        <th className="px-6 py-4 text-left font-bold">IDRS Score</th>
                        <th className="px-6 py-4 text-left font-bold">Risk Level</th>
                        <th className="px-6 py-4 text-left font-bold">Recommended Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-6 py-4 font-bold text-green-700">&lt; 30</td>
                        <td className="px-6 py-4">Low Risk</td>
                        <td className="px-6 py-4">Maintain healthy lifestyle</td>
                      </tr>
                      <tr className="bg-green-50/30">
                        <td className="px-6 py-4 font-bold text-yellow-600">30–50</td>
                        <td className="px-6 py-4">Moderate Risk</td>
                        <td className="px-6 py-4">Increase activity, watch diet</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-bold text-red-600">≥ 60</td>
                        <td className="px-6 py-4">High Risk</td>
                        <td className="px-6 py-4">See a doctor for a blood test</td>
                      </tr>
                    </tbody>
                  </table>
                </Card>
                <p className="mt-4 text-sm text-gray-600 italic">👉 This makes the "diabetes risk calculator India" far more accurate than Western tools.</p>
              </section>

              {/* Who Should Use It & Gestational */}
              <section className="grid md:grid-cols-2 gap-8">
                <div className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                    <Users className="text-green-600 w-5 h-5" /> Who Should Screen?
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-1 shrink-0" /> People over 30 years old</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-1 shrink-0" /> Family history of diabetes</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-1 shrink-0" /> Sedentary lifestyle (sitting long hours)</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-green-600 mt-1 shrink-0" /> Feeling frequent fatigue</li>
                  </ul>
                </div>
                <div className="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                    <Heart className="text-green-600 w-5 h-5" />
                    <Link
                      href="/health/pregnancy-weight-gain-calculator"
                      className="hover:underline hover:text-green-700 transition-colors"
                    >
                      Pregnancy
                    </Link>{" "}
                    & Gestational
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    A gestational diabetes risk calculator estimates risk during pregnancy. Risk factors include being over age 25, PCOS, or having a family history of diabetes. 
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Note: This highlights risk but does not replace glucose testing.</p>
                </div>
              </section>

              {/* Risk vs Test comparison */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Risk Calculator vs. Blood Sugar Test</h2>
                <div className="grid md:grid-cols-2 gap-6 not-prose">
                  <div className="p-5 border-l-4 border-green-600 bg-white shadow-sm">
                    <h4 className="font-bold text-gray-800">Diabetes Risk Calculator</h4>
                    <p className="text-sm text-gray-600">Predicts <strong>future risk</strong> based on behavior and body metrics. Non-invasive screening.</p>
                  </div>
                  <div className="p-5 border-l-4 border-blue-600 bg-white shadow-sm">
                    <h4 className="font-bold text-gray-800">
                      <Link
                        href="/health/estimated-average-glucose-calculator"
                        className="hover:underline hover:text-green-700 transition-colors"
                      >
                        Glucose / HbA1c Test
                      </Link>
                    </h4>
                    <p className="text-sm text-gray-600"><strong>Confirms diagnosis</strong> of current state. Clinical blood work required.</p>
                  </div>
                </div>
              </section>

               {/* How to Reduce Risk */}
                  <section className="bg-green-600 rounded-3xl p-8 text-white">
                    <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                      <TrendingDown className="w-6 h-6" />
                      How to Reduce Your Diabetes Risk
                    </h2>

                    {/* Image */}
                    <div className="mb-8 flex justify-center">
                      <ClickableImage
                        src="/diabetes-risk-calculator.webp"
                        alt="Lifestyle changes to reduce diabetes risk including walking, healthy diet, weight loss and proper sleep"
                        width={800}
                        height={450}
                        className="rounded-2xl shadow-xl border border-white/20"
                        priority
                      />
                    </div>

                    <p className="mb-6 opacity-90">
                      If your risk is moderate or high, these steps can reduce diabetes risk by 40–60%:
                    </p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-green-200" />
                        <span>Walk 30 minutes daily</span>
                      </div>

                      <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-green-200" />
                        <span>Reduce sugar & refined carbs</span>
                      </div>

                      <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-green-200" />
                        <span>Lose 5–7% body weight</span>
                      </div>

                      <div className="flex items-center gap-3 bg-white/10 p-4 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-green-200" />
                        <span>Manage stress & sleep 7–8 hours</span>
                      </div>
                    </div>
                  </section>
              {/* Myths and ASCVD */}
              <section className="space-y-8">
                <div className="border-2 border-dashed border-green-200 p-6 rounded-2xl bg-green-50/30">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-green-800 uppercase tracking-tight">
                    <Scale className="w-5 h-5" /> ASCVD & Cardiovascular Risk
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Diabetes is a major multiplier in{" "}
                    <Link
                      href="/health/ascvd-risk-calculator"
                      className="font-medium hover:underline hover:text-green-700 transition-colors"
                    >
                      ASCVD risk calculators
                    </Link>
                    . Having diabetes can double or triple heart disease risk, even with normal cholesterol. 
                    Diabetes prevention is also heart protection.
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Common Myths About Diabetes Risk</h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm text-gray-600 italic">"I'm thin, so I'm safe" — False</span>
                    <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm text-gray-600 italic">"It's genetic, nothing I can do" — False</span>
                    <span className="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm text-gray-600 italic">"No symptoms means no risk" — False</span>
                  </div>
                </div>
              </section>

              {/* Download & User First */}
              <section className="pt-8 border-t text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-green-600" />
                  Why Use Our Online Calculator?
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  While some search for a "diabetes risk score calculator download," online tools are safer and more accurate. Our calculator stays updated with the latest clinical standards, ensures no calculation errors, and protects your privacy by not storing health data.
                </p>
              </section>

              {/* CTA */}
              <section className="not-prose mt-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-gradient-to-r from-green-600 to-green-700 rounded-3xl text-white shadow-xl">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Know your exact age?</h3>
                    <p className="text-gray-300 max-w-md">
                      Accurate age is a key input for health risk assessments. Check your age in years, months, and days.
                    </p>
                  </div>
                  <Button asChild size="lg" variant="secondary" className="whitespace-nowrap">
                    <Link href="/health/age-calculator">
                      Try Age Calculator <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </section>

            </div>

            <RelatedCalculators slug="diabetes-risk-calculator" />

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