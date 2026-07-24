import type { Metadata } from "next";
import Image from "next/image";
import { ClickableImage } from "@/components/ui/image-lightbox";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import ObesityRiskCalculator from "@/components/calculators/obesity-risk-calculator";
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data";
import { FAQSection } from "@/components/seo/faq-section";import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { ServiceCTA } from "@/components/seo/service-cta"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, HeartPulse, Scale, Shield, Stethoscope, AlertTriangle, ArrowRight, Apple, Sparkles } from "lucide-react";
import { RelatedCalculators } from "@/components/calculators/related-calculators";

export const metadata: Metadata = {
  title: "Obesity Risk Calculator: Assess Your Health Profile Instantly",
  description: "Check your obesity and metabolic risk instantly. Our advanced Obesity Risk Calculator goes beyond BMI by analyzing your Waist-to-Height Ratio (WHtR) and lifestyle for accurate health insights.",
  keywords: "obesity risk calculator, BMI calculator, metabolic risk calculator, waist to height ratio calculator, health risk assessment, visceral fat calculator, overweight health risk, calculate obesity level",
  alternates: {
    canonical: "https://calqulate.net/health/obesity-risk-calculator",
  },
  openGraph: {
    title: "Obesity Risk Calculator: Assess Your Health Profile Instantly",
    description: "Check your obesity and metabolic risk instantly. Our advanced Obesity Risk Calculator goes beyond BMI by analyzing your Waist-to-Height Ratio (WHtR) and lifestyle for accurate health insights.",
    url: "https://calqulate.net/health/obesity-risk-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Obesity Risk Calculator: Assess Your Health Profile Instantly",
    description: "Check your obesity and metabolic risk instantly. Our advanced Obesity Risk Calculator goes beyond BMI by analyzing your Waist-to-Height Ratio (WHtR) and lifestyle for accurate health insights.",
  },
};

const faqs = [
  {
    question: "Why does this calculator use waist size and not just BMI?",
    answer: "BMI (Body Mass Index) only measures your weight relative to your height, which means it can't tell the difference between fat and muscle. By adding your waist circumference, we calculate your Waist-to-Height Ratio (WHtR). This helps us measure visceral fat (belly fat), which is a much more accurate predictor of heart disease, diabetes, and overall obesity risk.",
  },
  {
    question: "How accurate is the Obesity Risk Calculator?",
    answer: "Our calculator uses guidelines from the World Health Organization (WHO) and modern metabolic research. While it is highly accurate for educational and lifestyle planning purposes, it is not a medical diagnostic tool. Always consult with a healthcare provider for a complete medical evaluation.",
  },
  {
    question: "What is a healthy Waist-to-Height Ratio (WHtR)?",
    answer: "A general rule of thumb for both men and women is to keep your waist circumference to less than half of your height. This means a WHtR of 0.50 or lower is considered healthy and indicates a lower risk of obesity-related complications.",
  },
  {
    question: "What happens if my risk level is high?",
    answer: "A 'High' or 'Very High' risk level indicates that your current weight and fat distribution may be putting strain on your cardiovascular and metabolic systems. The good news is that even a 5-10% reduction in body weight can drastically lower your health risks. Our calculator provides personalized actionable steps to help you get started.",
  },
  {
    question: "Is obesity risk the same for men and women?",
    answer: "While the BMI scale is the same for both, men and women store fat differently. Men are more prone to visceral (belly) fat, which carries a higher metabolic risk. Women often store fat in the hips and thighs (pear shape), which carries lower immediate cardiovascular risks. Our calculator adjusts its waist circumference risk thresholds based on your gender.",
  },
  {
    question: "How does my body shape relate to my obesity risk?",
    answer: "Your body shape directly impacts your health risk. 'Apple' shapes (carrying weight around the middle) have a higher risk of metabolic issues compared to 'Pear' shapes (carrying weight in the lower body). You can use our Body Shape Calculator alongside this tool for a complete body profile.",
  }
];

export default function ObesityRiskCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <CalculatorSchema
        name="Obesity Risk Calculator"
        description="Assess your obesity and metabolic health risk using advanced BMI, waist-to-height ratio, and lifestyle metrics."
        url="https://calqulate.net/health/obesity-risk-calculator"
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
              Obesity Risk Calculator
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              Discover your true metabolic health profile. Unlike standard calculators, our tool combines Body Mass Index (BMI), Waist-to-Height Ratio ( <Link href="/health/waist-to-height-ratio-calculator" className="font-medium hover:underline hover:text-green-700 transition-colors" > WHtR </Link> ), and lifestyle factors to give you a highly accurate, personalized obesity risk assessment.
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
                Calqulate.net scores your metabolic risk beyond BMI using a validated waist-and-lifestyle composite. You get a clear risk tier and the top factors to improve.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "BMI +", label: "Factors" },
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
            <ObesityRiskCalculator />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">

            {/* SEO Content & Article */}
            <div className="prose prose-gray dark:prose-invert max-w-none mt-16 space-y-16">
              
              <section>
                <h2 className="mb-4 text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Why Standard BMI Calculators Aren't Enough
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For decades, Body Mass Index (BMI) has been the standard for determining if someone is underweight, normal weight, overweight, or obese. While it is a helpful baseline, <strong>BMI has a major flaw: it cannot distinguish between fat mass and muscle mass</strong>, nor does it know <em>where</em> your fat is stored.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our advanced <strong>Obesity Risk Calculator</strong> goes a step further by utilizing the <strong>Waist-to-Height Ratio (WHtR)</strong>. 
                  Research shows that measuring waist circumference relative to height is vastly superior at detecting visceral fat—the dangerous fat that wraps around your internal organs and drives up the risk for heart disease,{" "}
                  <Link
                    href="/health/diabetes-risk-calculator"
                    className="font-medium text-blue-700 hover:underline hover:text-blue-900 transition-colors"
                  >
                    type 2 diabetes
                  </Link>
                  , and{" "}
                  <Link
                    href="/health/blood-pressure-calculator"
                    className="font-medium text-red-700 hover:underline hover:text-red-900 transition-colors"
                  >
                    hypertension (blood pressure)
                  </Link>.
                </p>

                {/* Cross-linking Promo Card */}
                <Card className="mt-8 bg-blue-50/50 border-blue-100 shadow-sm hover:shadow-md transition-all">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="bg-blue-100 p-4 rounded-full flex-shrink-0">
                      <Scale className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 m-0 mb-1">Curious about your body proportions?</h3>
                      <p className="text-gray-600 text-sm m-0 mb-3">
                        Knowing your obesity risk is step one. Knowing how to dress and train for your unique silhouette is step two.
                      </p>
                      <Link href="/health/body-fat-calculator" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800">
                        Try our Body Fat Calculator <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Core Metrics Explained */}
              <section>
                <h2 className="font-semibold mb-6">The 3 Pillars of Your Health Risk Assessment</h2>
                <div className="grid md:grid-cols-3 gap-6 not-prose">
                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <Activity className="w-8 h-8 text-emerald-500 mb-2" />
                      <CardTitle className="text-lg">1. BMI Category</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600">
                      Calculates your weight-to-height ratio. It places you into standard WHO categories (Underweight, Normal, Overweight, Obese) to establish a baseline of your overall body mass.
                    </CardContent>
                  </Card>

                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <HeartPulse className="w-8 h-8 text-rose-500 mb-2" />
                      <CardTitle className="text-lg">2. Visceral Fat (WHtR)</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600">
                      By comparing your waist to your height, we assess your visceral fat levels. A WHtR over 0.5 indicates increased metabolic and cardiovascular danger, regardless of BMI.
                    </CardContent>
                  </Card>

                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <Apple className="w-8 h-8 text-amber-500 mb-2" />
                      <CardTitle className="text-lg">3. Lifestyle Modifiers</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-600">
                      Your activity level plays a massive role in risk mitigation. A highly active overweight person often has a better metabolic profile than a sedentary person of normal weight.
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Health Risk Matrix Chart */}
              <section>
                <Card className="not-prose shadow-sm border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      The Obesity Risk Matrix Guidelines
                    </CardTitle>
                    <CardDescription>
                      How we determine your overall risk level based on standard medical guidelines.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border px-4 py-3 text-left font-semibold">BMI Category</th>
                            <th className="border px-4 py-3 text-left font-semibold">Waist Circumference Risk</th>
                            <th className="border px-4 py-3 text-left font-semibold">Overall Disease Risk</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border px-4 py-3 font-medium">18.5 - 24.9 (Normal)</td>
                            <td className="border px-4 py-3">Low</td>
                            <td className="border px-4 py-3 text-green-600 font-semibold">Low</td>
                          </tr>
                          <tr>
                            <td className="border px-4 py-3 font-medium">25.0 - 29.9 (Overweight)</td>
                            <td className="border px-4 py-3">Low</td>
                            <td className="border px-4 py-3 text-yellow-600 font-semibold">Increased</td>
                          </tr>
                          <tr>
                            <td className="border px-4 py-3 font-medium">25.0 - 29.9 (Overweight)</td>
                            <td className="border px-4 py-3">High</td>
                            <td className="border px-4 py-3 text-orange-600 font-semibold">High</td>
                          </tr>
                          <tr>
                            <td className="border px-4 py-3 font-medium">30.0 - 34.9 (Obese Class I)</td>
                            <td className="border px-4 py-3">Any</td>
                            <td className="border px-4 py-3 text-red-500 font-semibold">High to Very High</td>
                          </tr>
                          <tr>
                            <td className="border px-4 py-3 font-medium">35.0+ (Obese Class II/III)</td>
                            <td className="border px-4 py-3">Any</td>
                            <td className="border px-4 py-3 text-red-700 font-bold">Extremely High</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* How to measure accurately */}
              <section>
                <h2 className="mb-2"><b>How to Measure for Accurate Results</b></h2>
                <p>Garbage in, garbage out! To get the most accurate obesity risk assessment, make sure you take your measurements correctly:</p>
                <ul className="list-disc pl-5 space-y-2 mt-4">
                  <li><strong>Height & Weight:</strong> Measure yourself in the morning, barefoot, wearing light clothing.</li>
                  <li><strong>Waist Circumference:</strong> Find the top of your hip bone and the bottom of your ribs. Place the tape measure midway between these points (usually just above the belly button). Breathe out naturally before taking the measurement. Do not pull the tape too tight!</li>
                  <li><strong>Activity Level:</strong> Be honest! "Active" means you intentionally exercise to the point of sweating at least 3-4 times a week.</li>
                </ul>
              </section>
              
              {/* Disclaimer */}
              <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-500 m-0 flex items-start gap-3">
                  <Shield className="w-6 h-6 flex-shrink-0 text-gray-400" />
                  <span>
                    <strong>Medical Disclaimer:</strong> This obesity risk assessment calculator is designed for educational and informational purposes only. It is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                  </span>
                </p>
              </section>

            </div>

            {/* SERVICE CTA */}
            <ServiceCTA
              eyebrow="Risk moves when your numbers move"
              title="A risk score today is worth more as a trend"
              body="This score reflects where you are now. What changes it is the direction your weight and waist travel over the coming months. Calqulate Vitals keeps those numbers on one timeline so you can see your risk moving rather than re-running a calculator and hoping."
              bullets={[
                "Log a weight or measurement in seconds",
                "Everything you log on one timeline",
                "See your metabolic health as one score",
                "Watch your risk fall over time (Premium)",
              ]}
              href="/signup?next=/dashboard/glp1"
              learnMoreHref="/product/glp1-progress-tracker"
              cta="Start tracking free"
            />

            <RelatedCalculators slug="obesity-risk-calculator" />

            {/* Structured FAQ UI */}
            <div className="mt-16">
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
  );
}