import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import PonderalIndexCalculator from "@/components/calculators/ponderal-index-calculator"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { ServiceCTA } from "@/components/seo/service-cta"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Scale,
  Baby,
  Calculator,
  ShieldCheck,
  UserCheck,
  Info,
  FileText,
  Activity,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  BookOpen,
  HeartPulse,
  Stethoscope,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { RelatedCalculators } from "@/components/calculators/related-calculators"

// ─────────────────────────────────────────────
// METADATA
// Primary cluster (124 imp): "ponderal index normal range 11–15 adults"
// Secondary: "ponderal index calculator" (pos 65), "rohrer index" (pos 20–23)
// Gaps: "fetal ponderal index", "ponderal index chart", "corpulence index"
// ─────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Ponderal Index Calculator: More Accurate Than BMI?",
  description:
    "Is your Ponderal Index more accurate than BMI for your build? Free calculator for adults, kids, and newborn IUGR screening, with normal ranges.",
  keywords:
    "ponderal index calculator, ponderal index normal range, ponderal index normal range adults 11 15, rohrer index normal values, corpulence index, ponderal index formula, ponderal index chart, fetal ponderal index, ponderal index newborn, ponderal index vs bmi, what is ponderal index, rohrer index, ponderal index definition",
  alternates: {
    canonical: "https://calqulate.net/health/ponderal-index-calculator",
  },
  openGraph: {
    title: "Ponderal Index Calculator: More Accurate Than BMI?",
    description: "Is your Ponderal Index more accurate than BMI for your build? Free calculator for adults, kids, and newborn IUGR screening, with normal ranges.",
    url: "https://calqulate.net/health/ponderal-index-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ponderal Index Calculator – Normal Range 11–15 for Adults & Children | Rohrer's Index",
    description: "Calculate your Ponderal Index (Corpulence Index / Rohrer's Index) free. Normal range for adults is 11–15 kg/m³. Includes adult, child, and newborn/fetal PI formulas with reference charts.",
  },
}

// ─────────────────────────────────────────────
// FAQ — mapped to real GSC queries
// "what is ponderal index" (pos 65), "ponderal index formula" (pos 53)
// "ponderal index normal range" (pos 36), "rohrer index normal values" (pos 11)
// "fetal ponderal index" (pos 56), "corpulence index formula" (pos 40)
// ─────────────────────────────────────────────
const faqs = [
  {
    question: "What is the Ponderal Index?",
    answer:
      "The Ponderal Index (PI), also called the Corpulence Index or Rohrer's Index, is a measure of body composition that compares weight to the cube of height (weight ÷ height³). Unlike BMI which uses height squared, PI accounts for the three-dimensional volume of the body, making it more accurate for very tall, very short, or lean individuals.",
  },
  {
    question: "What is the Ponderal Index formula?",
    answer:
      "For adults: PI = Weight (kg) ÷ Height³ (m³). For infants and children: PI = Weight (g) ÷ Height³ (cm³). Note that the adult and infant formulas use different units and produce numerically different results — do not compare adult PI values to infant PI values directly.",
  },
  {
    question: "How do you manually calculate the Ponderal Index?",
    answer:
      "Example for a 70 kg adult who is 1.75 m tall: Height³ = 1.75 × 1.75 × 1.75 = 5.359 m³. PI = 70 ÷ 5.359 = 13.06 kg/m³. Since 13.06 falls within 11–15, this person is in the normal range. For a newborn: divide weight in grams by height in cm cubed. A result between 2.32 and 2.85 g/cm³ is normal.",
  },
  {
    question: "What is the normal Ponderal Index range for adults?",
    answer:
      "The normal Ponderal Index range for adults is 11–15 kg/m³. A PI below 11 kg/m³ indicates underweight. A PI above 15 kg/m³ indicates overweight. These thresholds are used in clinical and research settings and are consistently referenced across medical literature.",
  },
  {
    question: "What are normal Rohrer Index values?",
    answer:
      "Rohrer's Index is another name for the Ponderal Index, named after the German physiologist Fritz Rohrer. Normal Rohrer Index values for adults are 11–15 kg/m³. For neonates and infants, normal values using the pediatric formula (g/cm³) are typically 2.32–2.85 g/cm³. Values outside this range in newborns may indicate intrauterine growth restriction (IUGR) or macrosomia.",
  },
  {
    question: "What is the fetal and newborn Ponderal Index?",
    answer:
      "The fetal Ponderal Index (FPI) is used by obstetricians and neonatologists to assess intrauterine growth. It is calculated as: Fetal PI = Weight (g) ÷ Crown-heel length³ (cm³). A normal neonatal PI is 2.32–2.85 g/cm³. A low FPI (< 2.2) may indicate symmetric intrauterine growth restriction (IUGR). A high FPI (> 3.0) may indicate macrosomia.",
  },
  {
    question: "Is the Ponderal Index more accurate than BMI?",
    answer:
      "For very tall, very short, and lean individuals, yes — PI is more accurate than BMI because it uses height cubed rather than height squared, approximating body volume rather than area. BMI systematically overestimates adiposity in tall people and underestimates it in short people. However, like BMI, PI does not distinguish muscle from fat, so muscular individuals may still be misclassified.",
  },
  {
    question: "What does my Ponderal Index result mean?",
    answer:
      "For adults: PI < 11 kg/m³ = underweight; 11–15 = normal healthy range; > 15 = overweight. These thresholds apply to the standard adult formula (kg/m³). For infants and children using the pediatric formula (g/cm³), the normal range is approximately 2.2–3.0 g/cm³ — do not apply adult thresholds to infant results.",
  },
]

export default function PonderalIndexCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Ponderal Index Calculator"
        description="Is your Ponderal Index more accurate than BMI for your build? Free calculator for adults, kids, and newborn IUGR screening, with normal ranges."
        url="https://calqulate.net/health/ponderal-index-calculator"
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
              Ponderal Index Calculator
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              Is your Ponderal Index more accurate than BMI for your build? Free calculator for adults, kids, and newborn IUGR screening — with normal ranges.
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
                Calqulate.net computes your Corpulence Index from height and weight, more reliable than BMI for very tall or short builds. You get an accurate score with adult, child and infant references.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "kg/m³", label: "Index" },
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
            <PonderalIndexCalculator />
          </div>
        </section>

        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto">

            <div className="prose prose-gray dark:prose-invert max-w-none mt-12 space-y-12">

              {/* ── WHAT IS PI ── */}
              <section className="py-8 border-b border-gray-100">
                <h2 className="mb-4 text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-teal-600" />
                  What Is the Ponderal Index? Definition & Background
                </h2>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  The <strong>Ponderal Index (PI)</strong> — also known as the <strong>Corpulence Index</strong>,
                  <strong> Rohrer's Index</strong>, or in French as <em>indice pondéral</em> and in German
                  as <em>Rohrer'scher Index</em> — is a clinical measure of body composition defined as
                  the ratio of body weight to the <strong>cube</strong> of height.
                </p>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  It was developed by the German physiologist <strong>Fritz Rohrer</strong> in 1921 as
                  an improvement over simpler height-weight ratios. By using height³ rather than height²,
                  PI approximates three-dimensional body <em>volume</em> rather than two-dimensional body
                  <em>area</em> — a fundamentally more geometrically accurate approach.
                </p>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  Today it is used across three distinct clinical populations: <strong>adults</strong>
                  (fitness and obesity assessment), <strong>infants and children</strong> (growth monitoring),
                  and <strong>fetuses and newborns</strong> (intrauterine growth assessment and IUGR detection).
                </p>

                <div className="grid md:grid-cols-3 gap-4 not-prose mt-5">
                  {[
                    { icon: "📐", title: "Rohrer's Index (Adults)", desc: "Standard clinical measure for adult body composition. Normal range: 11–15 kg/m³." },
                    { icon: "👶", title: "Pediatric PI", desc: "Adapted formula for infants and children using g/cm³. Normal range: 2.2–3.0 g/cm³." },
                    { icon: "🏥", title: "Fetal PI", desc: "Used by obstetricians to detect IUGR and macrosomia in utero and at birth." },
                  ].map((item) => (
                    <div key={item.title} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <h4 className="font-bold text-teal-800 mb-1 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── FORMULA SECTION ── */}
              <section>
                <Card className="border-teal-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="bg-teal-50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-teal-800">
                      <Calculator className="w-5 h-5" />
                      Ponderal Index Formula — Adults, Children & Newborns
                    </CardTitle>
                    <CardDescription className="text-teal-700/80">
                      Each population uses a distinct formula. Never apply adult thresholds to infant results.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">

                    {/* Adult formula */}
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                        Adult Formula (Rohrer's Index)
                      </p>
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 font-bold text-sm">A</div>
                        <div className="flex-1">
                          <p className="font-mono text-sm bg-gray-50 px-3 py-2 rounded border">
                            PI = Weight (kg) ÷ Height³ (m³)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Used for adults. Result in kg/m³. Normal range: 11–15.</p>
                        </div>
                      </div>
                    </div>

                    {/* Child formula */}
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                        Infant & Child Formula
                      </p>
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 font-bold text-sm">C</div>
                        <div className="flex-1">
                          <p className="font-mono text-sm bg-gray-50 px-3 py-2 rounded border">
                            PI = Weight (g) ÷ Height³ (cm³)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Used for infants/children. Result in g/cm³. Normal range: 2.2–3.0.</p>
                        </div>
                      </div>
                    </div>

                    {/* Fetal formula */}
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">
                        Fetal / Newborn Formula
                      </p>
                      <div className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0 font-bold text-sm">N</div>
                        <div className="flex-1">
                          <p className="font-mono text-sm bg-gray-50 px-3 py-2 rounded border">
                            Fetal PI = Birth Weight (g) ÷ Crown-heel length³ (cm³)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Used at birth for IUGR screening. Normal range: 2.32–2.85 g/cm³.</p>
                        </div>
                      </div>
                    </div>

                    {/* Worked examples */}
                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 space-y-4">
                      <p className="text-sm font-bold text-teal-800">Worked Examples — Step by Step</p>

                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Adult Example</p>
                        <p className="text-sm text-gray-700 mb-1">70 kg adult · 1.75 m tall:</p>
                        <div className="font-mono text-sm space-y-0.5 text-gray-600">
                          <p>Height³ = 1.75 × 1.75 × 1.75 = 5.359 m³</p>
                          <p>PI = 70 ÷ 5.359 = <span className="font-bold text-teal-700">13.06 kg/m³ → Normal</span></p>
                        </div>
                      </div>

                      <div className="border-t border-teal-100 pt-3">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Newborn Example</p>
                        <p className="text-sm text-gray-700 mb-1">Newborn · 3,200 g · 50 cm crown-heel length:</p>
                        <div className="font-mono text-sm space-y-0.5 text-gray-600">
                          <p>Height³ = 50 × 50 × 50 = 125,000 cm³</p>
                          <p>PI = 3,200 ÷ 125,000 = <span className="font-bold text-teal-700">2.56 g/cm³ → Normal</span></p>
                        </div>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </section>

              {/* ── NORMAL RANGE CHART ── */}
              <section className="py-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-teal-600" />
                  Ponderal Index Normal Range — Adult Reference Chart
                </h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  The <strong>Ponderal Index normal range for adults is 11–15 kg/m³</strong>. This is the
                  clinically accepted threshold used in research literature, sports science, and health
                  assessments. Below is the full reference chart with interpretation:
                </p>

                <Card className="not-prose overflow-hidden border-teal-200 mb-5">
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="bg-teal-600 text-white">
                        <th className="px-5 py-3 text-left font-bold whitespace-nowrap">PI Value (kg/m³)</th>
                        <th className="px-5 py-3 text-left font-bold whitespace-nowrap">Category</th>
                        <th className="px-5 py-3 text-left font-bold whitespace-nowrap">Clinical Interpretation</th>
                        <th className="px-5 py-3 text-left font-bold whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-5 py-3 font-mono font-bold text-blue-600 whitespace-nowrap">&lt; 11</td>
                        <td className="px-5 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap">Underweight</span></td>
                        <td className="px-5 py-3 text-gray-600">Body weight is low relative to height volume</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">Consult a healthcare provider</td>
                      </tr>
                      <tr className="bg-teal-50/30">
                        <td className="px-5 py-3 font-mono font-bold text-teal-700 whitespace-nowrap">11 – 15</td>
                        <td className="px-5 py-3"><span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap">Normal Weight ✓</span></td>
                        <td className="px-5 py-3 text-gray-600">Healthy body weight for your height and volume</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">Maintain current habits</td>
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-mono font-bold text-orange-600 whitespace-nowrap">&gt; 15</td>
                        <td className="px-5 py-3"><span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap">Overweight</span></td>
                        <td className="px-5 py-3 text-gray-600">Body weight is high relative to height volume</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">Review diet and activity level</td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                </Card>

                <p className="text-sm text-gray-500 italic">
                  <strong>Note:</strong> Like BMI, PI does not distinguish muscle from fat. A highly
                  muscular individual may score above 15 while having low body fat. Always interpret
                  PI alongside other measures such as waist-to-height ratio or body fat percentage.
                </p>

                {/* Rohrer normal values */}
                <h3 className="text-xl font-bold text-gray-800 mt-8 mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" />
                  Rohrer Index Normal Values — Adults
                </h3>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  <strong>Rohrer's Index</strong> is the historical name for the Ponderal Index,
                  named after Fritz Rohrer who formalized the formula in 1921. The terms are
                  interchangeable in modern literature. <strong>Normal Rohrer Index values for
                  adults are identical to PI: 11–15 kg/m³.</strong>
                </p>
                <p className="text-gray-700 leading-relaxed">
                  In German-language clinical literature, the Rohrer Index (<em>Rohrerscher Index</em> or
                  <em> Rohrer Körperbauindex</em>) is the standard term used. In French literature,
                  <em> indice pondéral de Rohrer</em> is the accepted term. Regardless of name, the
                  formula and normal value thresholds are identical.
                </p>
              </section>

              {/* ── FETAL / NEWBORN SECTION ── */}
              <section className="py-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Baby className="w-6 h-6 text-teal-600" />
                  Fetal & Newborn Ponderal Index — Clinical Reference
                </h2>
                <p className="mb-3 text-gray-700 leading-relaxed">
                  The <strong>fetal Ponderal Index</strong> (FPI) is a specialized clinical tool used by
                  obstetricians, neonatologists, and pediatricians to assess fetal growth quality —
                  not just size. While birth weight alone cannot distinguish a constitutionally small
                  baby from one suffering intrauterine growth restriction (IUGR), the FPI provides
                  a proportionality assessment that standard weight percentiles cannot.
                </p>

                <Card className="not-prose overflow-hidden border-teal-200 mb-5">
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="bg-teal-600 text-white">
                        <th className="px-5 py-3 text-left font-bold whitespace-nowrap">Neonatal PI (g/cm³)</th>
                        <th className="px-5 py-3 text-left font-bold whitespace-nowrap">Category</th>
                        <th className="px-5 py-3 text-left font-bold whitespace-nowrap">Clinical Significance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-5 py-3 font-mono font-bold text-orange-600 whitespace-nowrap">&lt; 2.2</td>
                        <td className="px-5 py-3"><span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap">Low — IUGR risk</span></td>
                        <td className="px-5 py-3 text-gray-600">Possible intrauterine growth restriction; asymmetric IUGR common</td>
                      </tr>
                      <tr className="bg-teal-50/30">
                        <td className="px-5 py-3 font-mono font-bold text-teal-700 whitespace-nowrap">2.32 – 2.85</td>
                        <td className="px-5 py-3"><span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap">Normal ✓</span></td>
                        <td className="px-5 py-3 text-gray-600">Proportionate growth; healthy fetal nutrition assumed</td>
                      </tr>
                      <tr>
                        <td className="px-5 py-3 font-mono font-bold text-red-600 whitespace-nowrap">&gt; 3.0</td>
                        <td className="px-5 py-3"><span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap">High — Macrosomia risk</span></td>
                        <td className="px-5 py-3 text-gray-600">Excess fetal weight for length; associated with gestational diabetes</td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-6 not-prose mt-4">
                  <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm">
                    <h4 className="font-bold text-teal-800 mb-2 text-sm">Why FPI matters clinically</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {[
                        "Detects asymmetric IUGR that weight alone misses",
                        "Identifies disproportionate growth from symmetric IUGR",
                        "Correlates with neonatal adiposity and metabolic risk",
                        "Used in NICU assessment alongside weight percentiles",
                        "Predictive of neurodevelopmental outcomes in preterm infants",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm">
                    <h4 className="font-bold text-teal-800 mb-2 text-sm">Ponderal Index calculator for newborns — worked example</h4>
                    <p className="text-sm text-gray-600 mb-3">Term newborn · 2,800 g · 49 cm:</p>
                    <div className="font-mono text-sm space-y-1 text-gray-600 bg-gray-50 p-3 rounded border">
                      <p>Height³ = 49³ = 117,649 cm³</p>
                      <p>FPI = 2,800 ÷ 117,649</p>
                      <p className="font-bold text-teal-700">= 2.38 g/cm³ → Normal range</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 italic">
                      Measurement taken at birth using crown-heel length.
                    </p>
                  </div>
                </div>
              </section>

              {/* ── ADULT REFERENCE TABLE ── */}
              <section className="py-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-teal-600" />
                  Ponderal Index Chart — Adults by Height & Weight
                </h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  Use this <strong>Ponderal Index chart</strong> as a quick reference. Values shown are PI
                  in kg/m³ using the adult formula. The green-shaded range (11–15) represents the
                  normal weight category.
                </p>

                <Card className="not-prose overflow-hidden border-teal-200">
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="bg-teal-600 text-white">
                        <th className="px-4 py-3 text-left font-bold whitespace-nowrap">Height</th>
                        <th className="px-4 py-3 text-left font-bold whitespace-nowrap">55 kg</th>
                        <th className="px-4 py-3 text-left font-bold whitespace-nowrap">65 kg</th>
                        <th className="px-4 py-3 text-left font-bold whitespace-nowrap">75 kg</th>
                        <th className="px-4 py-3 text-left font-bold whitespace-nowrap">90 kg</th>
                        <th className="px-4 py-3 text-left font-bold whitespace-nowrap">105 kg</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      {[
                        ["1.60 m", 13.4, 15.9, 18.3, 22.0, 25.6],
                        ["1.65 m", 12.3, 14.5, 16.7, 20.1, 23.4],
                        ["1.70 m", 11.2, 13.2, 15.3, 18.3, 21.4],
                        ["1.75 m", 10.3, 12.2, 14.0, 16.8, 19.6],
                        ["1.80 m", 9.5, 11.2, 12.9, 15.4, 18.0],
                        ["1.85 m", 8.7, 10.3, 11.9, 14.3, 16.6],
                      ].map((row, i) => (
                        <tr key={i} className={i % 2 === 1 ? "bg-teal-50/20" : ""}>
                          <td className="px-4 py-2 font-semibold whitespace-nowrap">{row[0]}</td>
                          {(row.slice(1) as number[]).map((val, j) => (
                            <td
                              key={j}
                              className={`px-4 py-2 font-mono whitespace-nowrap ${
                                val >= 11 && val <= 15
                                  ? "text-teal-700 font-bold bg-teal-50"
                                  : val < 11
                                  ? "text-blue-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {val.toFixed(1)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </Card>
                <p className="mt-3 text-xs text-gray-400 italic">
                  Green = normal (11–15 kg/m³) · Blue = underweight (&lt;11) · Orange = overweight (&gt;15)
                </p>
              </section>

              {/* ── PI vs BMI ── */}
              <section className="py-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-teal-600" />
                  Ponderal Index vs BMI — Key Differences
                </h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  Both PI and BMI measure weight relative to height — but the mathematical difference
                  between height² and height³ has real clinical consequences, especially at the extremes
                  of height distribution.
                </p>

                <Card className="not-prose overflow-hidden border-teal-200 mb-5">
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="bg-teal-600 text-white">
                        <th className="px-5 py-3 text-left font-bold whitespace-nowrap">Feature</th>
                        <th className="px-5 py-3 text-left font-bold whitespace-nowrap">Ponderal Index (PI)</th>
                        <th className="px-5 py-3 text-left font-bold whitespace-nowrap">BMI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr><td className="px-5 py-3 font-medium whitespace-nowrap">Formula</td><td className="px-5 py-3 font-mono text-xs whitespace-nowrap">Weight ÷ Height³</td><td className="px-5 py-3 font-mono text-xs whitespace-nowrap">Weight ÷ Height²</td></tr>
                      <tr className="bg-teal-50/20"><td className="px-5 py-3 font-medium whitespace-nowrap">Dimensionality</td><td className="px-5 py-3 whitespace-nowrap">3D (volume-based)</td><td className="px-5 py-3 whitespace-nowrap">2D (area-based)</td></tr>
                      <tr><td className="px-5 py-3 font-medium whitespace-nowrap">Accuracy for tall individuals</td><td className="px-5 py-3 text-teal-700 font-semibold whitespace-nowrap">✓ More accurate</td><td className="px-5 py-3 text-orange-600 whitespace-nowrap">Overestimates adiposity</td></tr>
                      <tr className="bg-teal-50/20"><td className="px-5 py-3 font-medium whitespace-nowrap">Accuracy for short individuals</td><td className="px-5 py-3 text-teal-700 font-semibold whitespace-nowrap">✓ More accurate</td><td className="px-5 py-3 text-orange-600 whitespace-nowrap">Underestimates adiposity</td></tr>
                      <tr><td className="px-5 py-3 font-medium whitespace-nowrap">Used for newborns/infants</td><td className="px-5 py-3 text-teal-700 font-semibold whitespace-nowrap">✓ Yes (pediatric formula)</td><td className="px-5 py-3 text-gray-400 whitespace-nowrap">Rarely used</td></tr>
                      <tr className="bg-teal-50/20"><td className="px-5 py-3 font-medium whitespace-nowrap">Muscle vs fat distinction</td><td className="px-5 py-3 text-orange-500 whitespace-nowrap">✗ Does not distinguish</td><td className="px-5 py-3 text-orange-500 whitespace-nowrap">✗ Does not distinguish</td></tr>
                      <tr><td className="px-5 py-3 font-medium whitespace-nowrap">Clinical adoption</td><td className="px-5 py-3 whitespace-nowrap">Neonatology, research</td><td className="px-5 py-3 whitespace-nowrap">Primary care, population screening</td></tr>
                      <tr className="bg-teal-50/20"><td className="px-5 py-3 font-medium whitespace-nowrap">Normal range (adults)</td><td className="px-5 py-3 font-semibold whitespace-nowrap">11–15 kg/m³</td><td className="px-5 py-3 font-semibold whitespace-nowrap">18.5–24.9 kg/m²</td></tr>
                    </tbody>
                  </table>
                  </div>
                </Card>

                <p className="text-gray-700 font-medium bg-teal-50 p-3 rounded-lg border-l-4 border-teal-600">
                  <strong>Key takeaway:</strong> PI is the superior metric for anyone at the height
                  extremes (&lt;160 cm or &gt;185 cm) or for neonatal assessment. For the general adult
                  population, both metrics give clinically similar results — use them together for the
                  most complete picture.
                </p>
              </section>

              {/* ── TOPIC AUTHORITY: CLINICAL USES ── */}
              <section className="py-8 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <HeartPulse className="w-6 h-6 text-teal-600" />
                  Clinical & Research Applications of the Ponderal Index
                </h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  The Ponderal Index is used across multiple clinical disciplines. Understanding its
                  specific use cases helps you interpret your result in the right context.
                </p>

                <div className="grid md:grid-cols-2 gap-5 not-prose">
                  {[
                    {
                      title: "Neonatology & IUGR Detection",
                      desc: "The fetal Ponderal Index is used routinely in NICUs to classify newborns as symmetric IUGR (whole-body small), asymmetric IUGR (brain-sparing, low FPI), or macrosomic. This guides nutritional and metabolic management in the first days of life.",
                      tag: "Primary clinical use",
                    },
                    {
                      title: "Pediatric Growth Monitoring",
                      desc: "Pediatricians use PI to monitor whether children are growing proportionally — not just tracking weight or height in isolation. A sustained low PI may indicate nutritional insufficiency; a rising PI may indicate early-onset obesity.",
                      tag: "Ongoing monitoring",
                    },
                    {
                      title: "Sports Science & Lean Athletes",
                      desc: "BMI frequently misclassifies lean, tall athletes as normal-weight or even underweight due to the height² limitation. PI provides a more stable measure for this population, where volume-based assessment better reflects actual body mass distribution.",
                      tag: "Athletic populations",
                    },
                    {
                      title: "Epidemiological Research",
                      desc: "PI is used in large-scale population studies comparing body composition across different height distributions — particularly useful in global health research where population height varies significantly between regions.",
                      tag: "Research use",
                    },
                    {
                      title: "Obstetric Screening",
                      desc: "During prenatal care, serial fetal biometry can estimate FPI before birth. A low estimated FPI at 36–40 weeks may prompt closer monitoring for IUGR, early delivery decisions, or nutritional interventions.",
                      tag: "Prenatal care",
                    },
                    {
                      title: "Complementary Health Tracking",
                      desc: "PI works best alongside BMI, waist-to-height ratio, body fat percentage, and lean body mass calculations. No single metric captures the full picture of metabolic health — PI is one informed piece of a larger assessment.",
                      tag: "Combined use",
                    },
                  ].map((item) => (
                    <div key={item.title} className="p-5 border border-gray-100 rounded-2xl bg-white hover:border-teal-300 transition-colors shadow-sm">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-teal-800 text-sm">{item.title}</h4>
                        <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded shrink-0">{item.tag}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── RELIABILITY ── */}
              <section className="bg-teal-600 rounded-3xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6" />
                  Limitations of the Ponderal Index
                </h2>
                <p className="mb-5 opacity-90">
                  PI is a powerful screening tool — but like all anthropometric indices,
                  it has well-documented limitations that every user should understand:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    ["Does not distinguish muscle from fat", "A 90 kg bodybuilder and a 90 kg sedentary person of the same height get identical PI scores despite vastly different health profiles."],
                    ["Not validated for all ethnic populations", "Normal range thresholds (11–15) were developed primarily on European adult populations. Some Asian populations may have different healthy ranges."],
                    ["Adult formula cannot be applied to children", "The adult (kg/m³) and pediatric (g/cm³) formulas use different units and produce numerically incomparable results. Never use adult thresholds for infant results."],
                    ["Not a diagnostic tool", "PI is a screening index, not a diagnosis. Any result outside the normal range should be discussed with a healthcare professional for proper clinical evaluation."],
                  ].map(([title, desc]) => (
                    <div key={title} className="flex gap-3 bg-white/10 p-4 rounded-xl">
                      <span className="text-yellow-200 font-bold shrink-0 mt-0.5">⚠</span>
                      <div>
                        <p className="font-semibold text-sm mb-1">{title}</p>
                        <p className="text-white/70 text-sm">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── WHO BUILT ── */}
              <section className="text-center pt-8 border-t">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                  <UserCheck className="w-6 h-6 text-teal-600" />
                  A more geometrically honest measure of your body
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  The <strong>Ponderal Index</strong> has been used in clinical settings for over
                  100 years — from Fritz Rohrer's original 1921 publication to modern neonatal
                  intensive care units. Whether you're assessing adult body composition or monitoring
                  infant growth, PI provides a volumetrically grounded perspective that BMI alone cannot.
                </p>
              </section>

              {/* ── CTA ── */}
              <section className="not-prose mt-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-gradient-to-r from-teal-600 to-teal-700 rounded-3xl text-white shadow-xl">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">Want a fuller picture of your body composition?</h3>
                    <p className="text-teal-100 max-w-md">
                      Complement your Ponderal Index with a Lean Body Mass calculation —
                      see exactly how much of your weight is muscle vs fat.
                    </p>
                  </div>
                  <Button asChild size="lg" variant="secondary" className="whitespace-nowrap">
                    <Link href="/health/lean-body-mass-calculator">
                      Lean Body Mass Calculator <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </section>

            </div>

            {/* SERVICE CTA */}
            <ServiceCTA
              eyebrow="One index today, or the direction over months"
              title="An index is a snapshot. Your body is a trend."
              body="The Ponderal Index, like BMI, is built from height and weight alone, so it cannot see what your weight is made of. Calqulate Vitals keeps your weight, waist and body composition on one timeline so you can watch what is really changing."
              bullets={[
                "Log a weight or measurement in seconds",
                "Everything you log on one timeline",
                "Track body composition, labs and workouts",
                "Fat vs muscle trend (Premium)",
              ]}
              href="/signup?next=/dashboard/glp1"
              learnMoreHref="/product/glp1-progress-tracker"
              cta="Start tracking free"
            />

            <RelatedCalculators slug="ponderal-index-calculator" />

            {/* ── FAQ ── */}
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
