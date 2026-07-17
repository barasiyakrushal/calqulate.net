import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import BMICalculator from "@/components/calculators/bmi-calculator"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { ClickableImage } from "@/components/ui/image-lightbox"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

import {
  Scale, Info, Calculator as CalculatorIcon, User, Users,
  Utensils, Clock, AlertTriangle, CheckCircle2, Footprints,
  TrendingDown, Activity, Heart, Brain, Stethoscope, Sparkles
} from "lucide-react"
import { RelatedCalculators } from "@/components/calculators/related-calculators"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"

import { ServiceCTA } from "@/components/seo/service-cta"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema, MedicalWebPageSchema } from "@/components/seo/medical-reviewer-schema"

export const metadata: Metadata = {
  title: "BMI Calculator for Men & Women – Accurate Body Mass Index by Age, Height & Weight (kg/lbs)",
  description:
    "Free accurate BMI calculator for women and men. Calculate body mass index by age in kg or lbs. Includes BMI chart, healthy BMI ranges, walking plan by BMI, and what your number means for your real life.",
  keywords:
    "bmi calculator, bmi calculator women, bmi chart, bmi calculator female, bmi scale, body mass index calculator, bmi calculator men, bmi chart women, bmi test, bmi index, my bmi, bmi calculator male, bmi calculator kg, bmi calculator by age, calculate my bmi, bmi for women, bmi checker, bmi calculator weight loss, healthy bmi for women, healthy bmi, bmi formula, new bmi calculator, walking plan according to bmi",
  alternates: {
    canonical: "https://calqulate.net/health/bmi-calculator",
  },
  openGraph: {
    title: "BMI Calculator for Men & Women – Accurate Body Mass Index by Age, Height & Weight (kg/lbs)",
    description: "Free accurate BMI calculator for women and men. Calculate body mass index by age in kg or lbs. Includes BMI chart, healthy BMI ranges, walking plan by BMI, and what your number means for your real life.",
    url: "https://calqulate.net/health/bmi-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BMI Calculator for Men & Women – Accurate Body Mass Index by Age, Height & Weight (kg/lbs)",
    description: "Free accurate BMI calculator for women and men. Calculate body mass index by age in kg or lbs. Includes BMI chart, healthy BMI ranges, walking plan by BMI, and what your number means for your real life.",
  },
}

const faqs = [
  {
    question: "Is BMI accurate for men who go to the gym?",
    answer:
      "Not always. Muscle is denser than fat, so a man with a BMI of 27–28 might actually have 12% body fat and be in excellent health. The BMI scale was designed for sedentary populations. If you lift weights regularly, combine BMI with waist circumference and body fat percentage for a more complete picture. A waist under 35 inches with a BMI of 25–28 often indicates muscle, not fat.",
  },
  {
    question: "What is a healthy BMI for women by age?",
    answer:
      "The standard healthy BMI range is 18.5–24.9 for all adults. However, women over 50 may carry slightly more fat due to hormonal changes — some research suggests a BMI of up to 26–27 carries no additional health risk post-menopause. Women under 30 benefit most from staying between 20–24. For women with PCOS or thyroid conditions, BMI alone is insufficient — consult your doctor.",
  },
  {
    question: "Why is my BMI normal but I still have belly fat?",
    answer:
      "This is called 'normal weight obesity' or 'skinny fat.' BMI only measures total weight relative to height — it cannot detect where fat is stored. Visceral fat around the abdomen is metabolically more dangerous than fat stored elsewhere. Even at a normal BMI, a waist above 35 inches (women) or 40 inches (men) signals elevated health risk. A body fat percentage test gives you the real picture.",
  },
  {
    question: "How do I calculate BMI in kg?",
    answer:
      "The BMI formula in metric units is: BMI = weight (kg) ÷ height² (meters). For example, if you weigh 70 kg and are 1.70 m tall: 70 ÷ (1.70 × 1.70) = 70 ÷ 2.89 = 24.2 BMI. That falls in the Normal Weight category. Our calculator does this instantly — just enter your weight in kg and height in cm.",
  },
  {
    question: "Is the new BMI formula more accurate than the old one?",
    answer:
      "The new BMI formula proposed by Oxford mathematician Nick Trefethen (BMI = 1.3 × weight(kg) ÷ height(m)^2.5) corrects the traditional formula's known bias — it tends to overestimate BMI for tall people and underestimate it for shorter individuals. The AMA in 2023 also acknowledged that traditional BMI should not be used as the sole diagnostic criterion. Our calculator uses the standard WHO formula, but also shows the Ponderal Index as an additional metric.",
  },
  {
    question: "How often should I check my BMI?",
    answer:
      "Once every 2–3 months is ideal for most adults. Daily or weekly checks add anxiety without useful information — body composition changes happen over weeks, not days. Our save-results feature lets you track your BMI over time without logging in, so you can see real progress across your visits.",
  },
  {
    question: "What BMI is considered obese for women?",
    answer:
      "A BMI of 30 or higher is classified as obesity for adult women. This is further broken down: BMI 30–34.9 is Class I (moderate obesity), BMI 35–39.9 is Class II (severe obesity), and BMI 40+ is Class III (morbid obesity). A woman who is 5'4\" and weighs 174 lbs has a BMI of approximately 30. Health risks rise significantly above BMI 35.",
  },
  {
    question: "Does BMI differ for women after 40?",
    answer:
      "The BMI formula is the same, but what it means changes. After 40, metabolism slows, lean muscle declines, and hormonal shifts (especially perimenopause) often increase fat storage — particularly around the abdomen. Women over 40 may see their BMI drift upward even without major dietary changes. Strength training 2–3x per week and adequate protein intake (0.7–1g per pound of bodyweight) are the most evidence-backed ways to counteract this.",
  },
]

export default function BMICalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="BMI Calculator"
        description="Free accurate BMI calculator for women and men. Calculate body mass index by age in kg or lbs with personalized insights and progress tracking."
        url="https://calqulate.net/health/bmi-calculator"
      />
      <MedicalWebPageSchema
        name="BMI Calculator – Medically Reviewed"
        description="Free accurate BMI calculator for women and men. Medically reviewed by Dr. Jaydeep Sanghani, MD Anaesthesiology & Critical Care."
        url="https://calqulate.net/health/bmi-calculator"
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
              BMI Calculator — Free, Accurate & Personalized for Men and Women
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              Calculate your Body Mass Index (BMI) instantly in kg or lbs. See your BMI scale result, understand what it means for your age and sex, and get a personalized walking plan and action steps — no signup needed.
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
                Calqulate.net calculates your Body Mass Index from height and weight, cross-checked with waist data and a muscle-vs-fat caveat for fairness. You get an honest result and the exact amount to gain or lose.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "WHO", label: "Standard" },
              { value: "2", label: "Unit systems" },
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
            <BMICalculator />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">

            {/* ── CONTENT ───────────────────────────────────────────────────── */}
            <div className="max-w-none mt-12 space-y-14">

              {/* 1. WHAT IS BMI ──────────────────────────────────────────────── */}
              <section className="pb-10 border-b border-gray-100">
                <h2 className="mb-4 text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Info className="w-6 h-6 text-green-600" />
                  What Is BMI? The Body Mass Index Explained Simply
                </h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  BMI — or Body Mass Index — is a number calculated from your height and weight. It was developed in the 1830s by Belgian mathematician Adolphe Quetelet and later adopted by the WHO as a population-level screening tool. Today, the CDC adult BMI calculator and NHLBI both use the same formula to classify adults into four weight categories.
                </p>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  Here's the honest truth most websites skip: <strong>BMI is a starting point, not a verdict.</strong> In 2023, the American Medical Association (AMA) updated its official policy to clarify that BMI should not be used as a sole diagnostic measure — especially considering differences across gender, age, and ethnicity, including documented differences in African American BMI chart interpretation versus Asian populations. What BMI does well is give you a fast, free, and reasonably reliable signal about your weight category so you can take the right next step.
                </p>

                <Card className="mt-6 border border-green-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardHeader className="bg-green-50 pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-green-800">
                      <CalculatorIcon className="w-5 h-5" />
                      BMI Formula — How to Calculate BMI in kg and lbs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
                    <div className="text-gray-700 text-sm leading-relaxed space-y-3">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2 uppercase tracking-wide text-xs">Metric Formula (kg/cm):</h3>
                        <p className="bg-gray-100 p-4 rounded-lg font-mono text-center text-base border-l-4 border-green-600">
                          BMI = Weight (kg) ÷ Height² (m)
                        </p>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-2 uppercase tracking-wide text-xs">Imperial Formula (lbs/inches):</h3>
                        <p className="bg-gray-100 p-4 rounded-lg font-mono text-center text-base border-l-4 border-green-600">
                          BMI = [Weight (lbs) ÷ Height² (in)] × 703
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">The 703 factor converts pounds/inches to the metric equivalent. This is why the CDC BMI calculator and NHLBI BMI calculator produce identical results to our tool.</p>
                    </div>
                    <div className="flex flex-col justify-center bg-white border border-green-100 rounded-xl p-5 space-y-4">
                      <div>
                        <h3 className="text-green-800 font-bold mb-3 text-sm">Example — Calculate my BMI in kg:</h3>
                        <div className="space-y-1 text-sm text-gray-700">
                          <p><strong>Weight:</strong> 70 kg · <strong>Height:</strong> 1.70 m</p>
                          <p><strong>Math:</strong> 70 ÷ (1.70²) = 70 ÷ 2.89</p>
                          <p className="text-lg font-bold text-green-700">BMI = 24.2 → Normal Weight</p>
                        </div>
                      </div>
                      <div className="border-t pt-3">
                        <h3 className="text-green-800 font-bold mb-2 text-sm">Example — 5'4" female, 155 lbs:</h3>
                        <div className="space-y-1 text-sm text-gray-700">
                          <p><strong>Math:</strong> [155 ÷ (64²)] × 703</p>
                          <p className="text-lg font-bold text-yellow-600">BMI = 26.6 → Overweight</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* 2. BMI CHART ────────────────────────────────────────────────── */}
              <section className="pb-10 border-b border-gray-100">
                <div className="mb-6 flex justify-center">
                  <ClickableImage
                    src="/bmi-chart.webp"
                    alt="BMI chart showing weight categories for men and women by height"
                    width={900}
                    height={500}
                    className="rounded-xl shadow-sm border border-gray-100"
                  />
                </div>

                <h2 className="mb-4 text-2xl font-bold text-gray-800">
                  BMI Chart for Men and Women — What Your Number Actually Means
                </h2>
                <p className="mb-6 text-gray-700 leading-relaxed">
                  The BMI scale ranges from underweight to severe obesity. Here's what each category means in real life — not just clinical terms — plus the health risks the CDC and NIH associate with each range.
                </p>

                <Card className="not-prose border-green-200 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-green-600 text-white">
                            <th className="px-5 py-4 text-left font-bold">BMI Range</th>
                            <th className="px-5 py-4 text-left font-bold">Category</th>
                            <th className="px-5 py-4 text-left font-bold">What It Feels Like</th>
                            <th className="px-5 py-4 text-left font-bold">Health Risk</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="px-5 py-4 font-medium">Below 18.5</td>
                            <td className="px-5 py-4 text-blue-600 font-semibold">Underweight</td>
                            <td className="px-5 py-4 text-gray-600">Fatigue, frequent illness, poor stamina, difficulty gaining muscle</td>
                            <td className="px-5 py-4"><span className="text-blue-700 font-semibold">Moderate</span> — nutritional deficiencies, bone loss</td>
                          </tr>
                          <tr className="bg-green-50/40">
                            <td className="px-5 py-4 font-medium">18.5 – 24.9</td>
                            <td className="px-5 py-4 text-green-600 font-semibold">Normal Weight</td>
                            <td className="px-5 py-4 text-gray-600">Good energy, lower doctor visits, clothes fit consistently, easier physical activity</td>
                            <td className="px-5 py-4"><span className="text-green-700 font-semibold">Low</span> — maintain with consistent habits</td>
                          </tr>
                          <tr>
                            <td className="px-5 py-4 font-medium">25.0 – 29.9</td>
                            <td className="px-5 py-4 text-orange-600 font-semibold">Overweight</td>
                            <td className="px-5 py-4 text-gray-600">Sluggish after meals, slight joint discomfort, clothes getting tighter, tired faster during cardio</td>
                            <td className="px-5 py-4"><span className="text-orange-700 font-semibold">Increased</span> — high blood pressure, prediabetes</td>
                          </tr>
                          <tr className="bg-red-50/20">
                            <td className="px-5 py-4 font-medium">30.0 – 34.9</td>
                            <td className="px-5 py-4 text-red-600 font-semibold">Obese (Class I)</td>
                            <td className="px-5 py-4 text-gray-600">Breathlessness on stairs, joint pain, sleep disturbances, lower energy throughout day</td>
                            <td className="px-5 py-4"><span className="text-red-700 font-semibold">High</span> — type 2 diabetes, sleep apnea, heart disease</td>
                          </tr>
                          <tr className="bg-red-50/30">
                            <td className="px-5 py-4 font-medium">35.0 – 39.9</td>
                            <td className="px-5 py-4 text-red-700 font-semibold">Obese (Class II)</td>
                            <td className="px-5 py-4 text-gray-600">Significant physical limitations, chronic fatigue, higher medication dependence</td>
                            <td className="px-5 py-4"><span className="text-red-700 font-semibold">Very High</span> — medical intervention often needed</td>
                          </tr>
                          <tr className="bg-red-50/40">
                            <td className="px-5 py-4 font-medium">40+</td>
                            <td className="px-5 py-4 text-red-800 font-semibold">Obese (Class III)</td>
                            <td className="px-5 py-4 text-gray-600">Severe mobility issues, multiple comorbidities, highest cardiovascular burden</td>
                            <td className="px-5 py-4"><span className="text-red-800 font-semibold">Extreme</span> — consult bariatric specialist</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
                <p className="mt-4 text-sm text-center italic text-gray-500">
                  Source: CDC Adult BMI Categories · WHO Global Database on Body Mass Index · NHLBI Clinical Guidelines
                </p>
              </section>

              {/* 3. HEIGHT-WEIGHT QUICK REFERENCE ───────────────────────────── */}
              <section className="pb-10 border-b border-gray-100">
                <h2 className="mb-4 text-2xl font-bold text-gray-800">
                  BMI Chart by Height — Quick Reference for Common US Heights
                </h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  One of the most searched questions on this topic is "what does my BMI mean at my exact height?" Here are the healthy weight ranges, overweight thresholds, and obesity cutoffs for the most common US heights — for both women and men. These numbers match the NHLBI BMI table exactly.
                </p>

                <Card className="not-prose border-green-100 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-green-50 text-green-900">
                            <th className="px-5 py-3 text-left font-bold">Height</th>
                            <th className="px-5 py-3 text-left font-bold text-green-700">Healthy (BMI 18.5–24.9)</th>
                            <th className="px-5 py-3 text-left font-bold text-yellow-700">Overweight (BMI 25–29.9)</th>
                            <th className="px-5 py-3 text-left font-bold text-red-700">Obese (BMI 30+)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700">
                          {[
                            ["5'0\" (152 cm)", "97–127 lbs", "128–152 lbs", "153+ lbs"],
                            ["5'2\" (157 cm)", "104–135 lbs", "136–163 lbs", "164+ lbs"],
                            ["5'3\" (160 cm)", "107–140 lbs", "141–168 lbs", "169+ lbs"],
                            ["5'4\" (163 cm)", "110–144 lbs", "145–173 lbs", "174+ lbs"],
                            ["5'5\" (165 cm)", "114–149 lbs", "150–179 lbs", "180+ lbs"],
                            ["5'6\" (168 cm)", "118–154 lbs", "155–185 lbs", "186+ lbs"],
                            ["5'7\" (170 cm)", "121–158 lbs", "159–190 lbs", "191+ lbs"],
                            ["5'9\" (175 cm)", "128–168 lbs", "169–202 lbs", "203+ lbs"],
                            ["6'0\" (183 cm)", "140–183 lbs", "184–220 lbs", "221+ lbs"],
                            ["6'1\" (185 cm)", "144–188 lbs", "189–226 lbs", "227+ lbs"],
                            ["6'5\" (196 cm)", "160–209 lbs", "210–251 lbs", "252+ lbs"],
                          ].map(([h, healthy, over, obese]) => (
                            <tr key={h}>
                              <td className="px-5 py-3 font-semibold">{h}</td>
                              <td className="px-5 py-3 text-green-700">{healthy}</td>
                              <td className="px-5 py-3 text-yellow-700">{over}</td>
                              <td className="px-5 py-3 text-red-600">{obese}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
                <p className="mt-3 text-xs text-gray-500 text-center">
                  Calculated using standard WHO BMI formula. Values apply to adults 20+. Source: NHLBI.
                </p>

                <div className="mt-6 p-5 bg-blue-50 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-2 text-sm">Common specific BMI questions — answered:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                    <p><strong>5'2" female, 170 lbs:</strong> BMI ≈ 31.1 → Obese Class I</p>
                    <p><strong>5'7" male, 180 lbs:</strong> BMI ≈ 28.2 → Overweight</p>
                    <p><strong>5'4" female, 130 lbs:</strong> BMI ≈ 22.3 → Normal Weight ✓</p>
                    <p><strong>5'3" female, 155 lbs:</strong> BMI ≈ 27.4 → Overweight</p>
                    <p><strong>6'1" male, 220 lbs:</strong> BMI ≈ 29.0 → Overweight</p>
                    <p><strong>5'5" female, 180 lbs:</strong> BMI ≈ 30.0 → Obese Class I</p>
                  </div>
                </div>
              </section>

              {/* 4. BMI FOR WOMEN ────────────────────────────────────────────── */}
              <section className="pb-10 border-b border-gray-100">
                <h2 className="mb-5 text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Users className="w-6 h-6 text-green-600" />
                  BMI Calculator for Women — What No One Tells You
                </h2>

                <p className="mb-4 text-gray-700 leading-relaxed">
                  Women checking their BMI face a unique challenge: the standard BMI chart was built primarily on male population data. While the categories apply equally, <strong>what those numbers mean in your body is different.</strong>
                </p>

                <p className="mb-4 text-gray-700 leading-relaxed">
                  Women naturally carry 6–11% more body fat than men at the same BMI — this is biological and normal, driven by estrogen, reproductive function, and fat distribution patterns. This means a woman with a BMI of 24 may have a higher body fat percentage than a man with the same BMI, yet still be in excellent metabolic health.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                    <h3 className="font-bold text-green-800 mb-3">Healthy BMI for Women by Age</h3>
                    <table className="w-full text-sm text-gray-700">
                      <thead>
                        <tr className="text-green-700 font-semibold border-b border-green-200">
                          <th className="text-left py-1">Age Group</th>
                          <th className="text-left py-1">Healthy BMI Range</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-green-100">
                        {[
                          ["20–29", "18.5 – 23.5"],
                          ["30–39", "18.5 – 24.9"],
                          ["40–49", "19.0 – 25.5"],
                          ["50–59", "19.5 – 26.5"],
                          ["60+", "20.0 – 27.0"],
                        ].map(([age, range]) => (
                          <tr key={age}>
                            <td className="py-2">{age}</td>
                            <td className="py-2 font-semibold text-green-700">{range}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-xs text-gray-500 mt-2">Note: These are evidence-informed ranges, not official CDC thresholds. Consult your doctor for individual guidance.</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-800">BMI for Women — Situations Where It's Misleading:</h3>
                    {[
                      {
                        title: "PCOS & Thyroid Conditions",
                        desc: "Both conditions directly alter fat storage and weight. Women with PCOS may have a higher BMI at the same calorie intake as unaffected women. Your BMI number is not a reflection of effort or willpower."
                      },
                      {
                        title: "Hormonal Weight Fluctuations",
                        desc: "Your weight can vary 2–5 lbs across your menstrual cycle due to water retention. A BMI test taken during your period may read 0.5–1 point higher — this is temporary and normal."
                      },
                      {
                        title: "Post-Pregnancy Weight",
                        desc: "It takes the average woman 6–18 months to return to pre-pregnancy weight. BMI during this period should be interpreted with extra context, not urgency."
                      },
                      {
                        title: "Menopause & After 50",
                        desc: "Estrogen decline shifts fat from hips to abdomen. Even with a normal BMI, waist circumference above 35 inches signals elevated metabolic risk post-menopause."
                      }
                    ].map((item) => (
                      <div key={item.title} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{item.title}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-5 bg-orange-50 rounded-xl border border-orange-100">
                  <h3 className="font-bold text-orange-800 mb-2">Obesity Scale for Women — Understanding BMI 30–45+</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    {[
                      { bmi: "30–34.9", label: "BMI 33–35 female", risk: "Class I — Actionable with lifestyle change" },
                      { bmi: "35–39.9", label: "BMI 35–36 female", risk: "Class II — Medical guidance recommended" },
                      { bmi: "40–44.9", label: "BMI 40–44 female", risk: "Class III — Consult bariatric specialist" },
                      { bmi: "45+", label: "BMI 45 female", risk: "Class III Severe — Urgent medical support" },
                    ].map((item) => (
                      <div key={item.bmi} className="bg-white rounded-lg p-3 border border-orange-100">
                        <p className="font-bold text-orange-700 text-base">{item.bmi}</p>
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="text-xs text-gray-700 mt-1">{item.risk}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 5. BMI FOR MEN ──────────────────────────────────────────────── */}
              <section className="pb-10 border-b border-gray-100">
                <h2 className="mb-5 text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <User className="w-6 h-6 text-green-600" />
                  BMI Calculator for Men — The Muscle Problem
                </h2>

                <p className="mb-4 text-gray-700 leading-relaxed">
                  If you lift weights, play sports, or have a physically active job, your BMI calculator result may show "overweight" or even "obese" — while your actual body fat is perfectly healthy. This is BMI's most well-known limitation for men.
                </p>

                <p className="mb-4 text-gray-700 leading-relaxed">
                  Here's a real example: a 5'11" man who weighs 195 lbs has a BMI of 27.2 — technically overweight by the BMI scale. But if his waist is 32 inches and he can run a 10-minute mile, he's in better cardiovascular health than someone with a BMI of 23 who sits all day. <strong>For men, BMI is most accurate when combined with waist circumference.</strong>
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-4">
                  <div className="bg-gray-50 p-5 rounded-xl border-l-4 border-green-600">
                    <h3 className="font-bold text-gray-800 mb-3">Healthy BMI for Men by Age</h3>
                    <table className="w-full text-sm text-gray-700">
                      <thead>
                        <tr className="text-green-700 font-semibold border-b border-gray-200">
                          <th className="text-left py-1">Age</th>
                          <th className="text-left py-1">Target BMI</th>
                          <th className="text-left py-1">Waist Target</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {[
                          ["20–29", "20.0–24.9", "Under 32 in"],
                          ["30–39", "21.0–25.9", "Under 34 in"],
                          ["40–49", "22.0–26.5", "Under 36 in"],
                          ["50–59", "22.5–27.0", "Under 38 in"],
                          ["60+", "23.0–28.0", "Under 40 in"],
                        ].map(([age, bmi, waist]) => (
                          <tr key={age}>
                            <td className="py-2">{age}</td>
                            <td className="py-2 font-semibold text-green-700">{bmi}</td>
                            <td className="py-2 text-gray-600">{waist}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-800">For Men Who Train: BMI vs Reality</h3>
                    <p className="text-sm text-gray-600">The BMI calculator for bodybuilding context is especially unreliable. If you strength train regularly, use these secondary checks alongside BMI:</p>
                    {[
                      "Waist under 35 in with BMI 25–28 = likely muscle, not fat",
                      "Waist over 40 in with any BMI = elevated cardiovascular risk",
                      "Resting heart rate under 65 bpm = strong cardiovascular health signal",
                      "Body fat under 20% at BMI 27 = fit, not overweight",
                      "5'7\" male BMI chart: healthy weight is 121–158 lbs",
                    ].map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 6. WALKING PLAN BY BMI ──────────────────────────────────────── */}
              <section className="pb-10 border-b border-gray-100">
                <h2 className="mb-4 text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Footprints className="w-6 h-6 text-green-600" />
                  Walking Plan According to Your BMI — The Best Starting Point
                </h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  Walking is the most underrated fat-loss tool. Research published in the Journal of the American Medical Association (JAMA) found that walking 7,000–9,000 steps daily reduces all-cause mortality by 50–70%. It doesn't spike cortisol, doesn't require equipment, and works at any BMI level. Here's a personalized walking plan based on your BMI result:
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {[
                    {
                      bmi: "BMI 18.5–24.9 (Normal)",
                      color: "border-green-500 bg-green-50",
                      titleColor: "text-green-800",
                      plan: "Maintenance: 7,000–10,000 steps/day. Add 2 strength sessions/week to maintain lean mass. Walk after dinner — it lowers blood sugar spikes by up to 30%."
                    },
                    {
                      bmi: "BMI 25–29.9 (Overweight)",
                      color: "border-yellow-500 bg-yellow-50",
                      titleColor: "text-yellow-800",
                      plan: "Week 1–2: 5,000 steps/day. Week 3–4: 7,000 steps. Week 5+: 10,000 steps. Brisk pace (3–4 mph). This pace burns 200–300 calories/hour and lowers blood pressure measurably within 8 weeks."
                    },
                    {
                      bmi: "BMI 30–35 (Obese Class I)",
                      color: "border-orange-500 bg-orange-50",
                      titleColor: "text-orange-800",
                      plan: "Start with 15-min walks twice daily. Build to 30 min continuous by week 4. Flat terrain first — reduce joint impact. Target: 6,000–8,000 steps/day by week 6. Small increments = sustainable results."
                    },
                    {
                      bmi: "BMI 35+ (Obese Class II–III)",
                      color: "border-red-400 bg-red-50",
                      titleColor: "text-red-800",
                      plan: "Consult your doctor before starting. Water walking or pool walking removes 90% of joint impact. Start with 10 min/day and add 2 min per week. Walking 45–60 min daily at this level can produce 1–2 lb/week loss."
                    },
                  ].map((item) => (
                    <div key={item.bmi} className={`p-5 rounded-xl border-l-4 ${item.color}`}>
                      <h3 className={`font-bold mb-2 text-sm ${item.titleColor}`}>{item.bmi}</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{item.plan}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-4 bg-green-50 rounded-xl border border-green-200 text-sm text-gray-700">
                  <strong className="text-green-800">Pro tip:</strong> A 10-minute walk after each meal (breakfast, lunch, dinner) totals 30 minutes with none of the mental barrier of "going to exercise." Studies show this routine specifically reduces postmeal blood sugar spikes — a key factor in preventing type 2 diabetes regardless of BMI.
                </div>
              </section>

              {/* 7. BMI BY AGE CONTEXT ───────────────────────────────────────── */}
              <section className="pb-10 border-b border-gray-100">
                <h2 className="mb-4 text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-green-600" />
                  BMI Calculator by Age — How Your Number Changes Over Time
                </h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  The BMI formula itself doesn't change with age — but what your BMI means does. As you get older, your muscle mass naturally declines (a process called sarcopenia), your metabolism slows, and fat redistributes toward the abdomen. Two people can have identical BMIs at age 25 and 55 but wildly different health profiles.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      age: "Your 20s",
                      headline: "BMI is most straightforward",
                      detail: "Metabolism is high, muscle mass is naturally elevated. A BMI of 22–24 is genuinely ideal. Watch for the 'freshman 15' or post-college weight gain as activity levels drop.",
                      color: "bg-green-50 border-green-200 text-green-800"
                    },
                    {
                      age: "Your 30s–40s",
                      headline: "BMI can creep up silently",
                      detail: "Muscle loss begins around age 30 at ~0.5–1% per year. Weight on the scale may stay constant, but body composition shifts toward more fat. Resistance training becomes critical to keep BMI meaningful.",
                      color: "bg-yellow-50 border-yellow-200 text-yellow-800"
                    },
                    {
                      age: "50s and Beyond",
                      headline: "Context matters most",
                      detail: "Post-menopausal women and older men often have a 'healthy' BMI but elevated visceral fat. Some research suggests a BMI of 25–27 in adults over 65 is associated with better outcomes than a BMI under 22.",
                      color: "bg-blue-50 border-blue-200 text-blue-800"
                    }
                  ].map((item) => (
                    <div key={item.age} className={`p-6 rounded-2xl border ${item.color}`}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-70">{item.age}</p>
                      <p className="font-bold text-base mb-2">{item.headline}</p>
                      <p className="text-sm leading-relaxed opacity-90">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 8. NEW BMI & LIMITATIONS ────────────────────────────────────── */}
              <section className="pb-10 border-b border-gray-100">
                <div className="border-l-4 border-orange-400 bg-orange-50/50 p-6 rounded-r-xl">
                  <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-orange-800">
                    <AlertTriangle className="w-5 h-5" /> When BMI Is Misleading — And What to Use Instead
                  </h2>
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                    The AMA, in its 2023 policy update, explicitly stated that BMI alone should not be used to make clinical decisions. This isn't a reason to dismiss BMI — it's a reason to use it correctly. BMI is a screening tool, like a warning light on your dashboard. It tells you to look further. It doesn't tell you exactly what's wrong.
                  </p>
                  <p className="text-sm text-gray-700 mb-4">BMI is least accurate for these groups:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {[
                      { group: "Athletes & bodybuilders", why: "High muscle mass inflates BMI" },
                      { group: "Pregnant women", why: "Weight gain is normal and healthy" },
                      { group: "Adults over 65", why: "Muscle loss makes BMI overestimate fat" },
                      { group: "Children & teens", why: "Use CDC BMI-for-age percentiles instead" },
                      { group: "Very tall or short people", why: "Traditional formula distorts at extremes" },
                      { group: "Different ethnicities", why: "Asian populations have higher health risk at lower BMIs" },
                    ].map((item) => (
                      <div key={item.group} className="bg-white p-3 rounded-lg border border-orange-100">
                        <p className="font-semibold text-gray-800 text-xs">{item.group}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.why}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5">
                    <h3 className="font-bold text-orange-800 mb-2 text-sm">Better Than BMI Alone — A Complete Picture:</h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                      <p><strong>Waist-to-Height Ratio:</strong> Waist (inches) ÷ Height (inches). Under 0.5 = low risk. Simple and fast.</p>
                      <p><strong>Body Fat %:</strong> Measured by DEXA scan, hydrostatic weighing, or skinfold calipers. Gold standard.</p>
                      <p><strong>Waist Circumference:</strong> Under 35 in (women), under 40 in (men) = low metabolic risk.</p>
                      <p><strong>Ponderal Index:</strong> Weight ÷ Height³. Better for very tall or short individuals (shown in our results).</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 9. DIET — US & INDIA ─────────────────────────────────────────── */}
              <section className="pb-10 border-b border-gray-100">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                  <Utensils className="w-6 h-6 text-green-600" /> Practical Diet Changes to Improve Your BMI
                </h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  You don't need a meal plan overhaul. Research consistently shows that small, consistent substitutions outperform drastic diet changes for long-term BMI improvement. Here are realistic swaps for both US and Indian eating patterns:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="not-prose border-green-100 overflow-hidden">
                    <div className="bg-green-50 px-5 py-3 border-b border-green-100">
                      <h3 className="font-bold text-green-800 text-sm">🇺🇸 For US Eating Patterns</h3>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white border-b">
                          <th className="px-5 py-2 text-left text-gray-500 font-semibold">Instead of</th>
                          <th className="px-5 py-2 text-left font-semibold text-green-700">Switch to</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          ["16 oz soda (200 cal)", "Sparkling water + lemon (0 cal)"],
                          ["Fast food lunch daily", "Meal-prepped protein bowl 4x/week"],
                          ["Chips as snack", "Apple + 2 tbsp peanut butter"],
                          ["White bread sandwich", "Whole grain or lettuce wrap"],
                          ["Ranch dressing", "Olive oil + vinegar (50% less fat)"],
                          ["Dinner plate = full", "Half plate vegetables, always"],
                        ].map(([from, to]) => (
                          <tr key={from}>
                            <td className="px-5 py-2.5 text-gray-500">{from}</td>
                            <td className="px-5 py-2.5 font-medium text-green-700">{to}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                  <Card className="not-prose border-orange-100 overflow-hidden">
                    <div className="bg-orange-50 px-5 py-3 border-b border-orange-100">
                      <h3 className="font-bold text-orange-800 text-sm">🇮🇳 For Indian Eating Patterns</h3>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white border-b">
                          <th className="px-5 py-2 text-left text-gray-500 font-semibold">Instead of</th>
                          <th className="px-5 py-2 text-left font-semibold text-green-700">Switch to</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          ["Fried namkeen as evening snack", "Roasted chana or makhana"],
                          ["3–4 cups sugary chai", "1–2 cups with half sugar"],
                          ["White rice daily", "Mix brown rice or millets"],
                          ["Deep-fried puri/bhatura", "Whole wheat roti (baked)"],
                          ["Maida-based sweets daily", "1–2 pieces maximum, post-lunch"],
                          ["Packaged biscuits", "Banana or handful of dates"],
                        ].map(([from, to]) => (
                          <tr key={from}>
                            <td className="px-5 py-2.5 text-gray-500">{from}</td>
                            <td className="px-5 py-2.5 font-medium text-green-700">{to}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                </div>
                <p className="mt-4 text-center text-gray-500 italic text-sm">
                  Each swap saves 150–300 calories. At 200 calories saved per day, that's ~1.7 lbs of fat lost per month — without a single gym visit.
                </p>
              </section>

              {/* 10. TIMELINE ─────────────────────────────────────────────────── */}
              <section className="py-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                  <TrendingDown className="w-6 h-6 text-green-600" /> Realistic Timeline: How Long Does It Take to Lower BMI?
                </h2>
                <p className="mb-5 text-gray-700 leading-relaxed">
                  This is the question everyone really wants answered. Here's the honest, research-based timeline — no false promises:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { change: "0.5–1 Point", time: "3–4 Weeks", method: "Cutting 500 cal/day from diet only", color: "bg-green-50 text-green-700 border-green-200" },
                    { change: "1–2 Points", time: "6–8 Weeks", method: "Diet + 30-min daily walking", color: "bg-green-100 text-green-800 border-green-300" },
                    { change: "3–5 Points", time: "3–5 Months", method: "Consistent deficit + exercise combo", color: "bg-green-500 text-white border-green-600" },
                    { change: "5+ Points", time: "6–12 Months", method: "Structured program with medical guidance", color: "bg-green-700 text-white border-green-800" },
                  ].map((item, i) => (
                    <div key={i} className={`p-5 rounded-2xl text-center border ${item.color}`}>
                      <p className="text-xs uppercase tracking-widest opacity-70 mb-1">BMI Drop</p>
                      <p className="text-2xl font-bold mb-1">{item.change}</p>
                      <p className="font-semibold text-sm mb-2">{item.time}</p>
                      <div className="h-px bg-current opacity-20 my-2" />
                      <p className="text-xs opacity-80">{item.method}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-gray-700">
                  <strong className="text-blue-800">Important:</strong> BMI loss faster than 0.5 points/month typically means muscle loss, not just fat loss. Crash diets can lower your BMI number while actually worsening your body composition. Slow, consistent progress is the only kind that lasts.
                </div>
              </section>

              {/* 11. ACTION PLAN ──────────────────────────────────────────────── */}
              <section className="bg-green-50 p-8 rounded-3xl border border-green-100">
                <h2 className="text-2xl font-bold mb-2 text-green-900">
                  What to Do Right Now — Based on Your BMI Result
                </h2>
                <p className="text-sm text-green-700 mb-6">Pick your category and follow the next steps. Bookmark this page — you'll want to come back and track your progress.</p>
                <div className="grid md:grid-cols-2 gap-5">
                  {[
                    {
                      label: "Underweight (BMI under 18.5)",
                      color: "border-blue-400",
                      href: "/health/ideal-body-weight-calculator",
                      steps: [
                        "Calculate your TDEE → eat 300–500 calories above it",
                        "Prioritize protein: eggs, lentils, Greek yogurt, paneer, chicken",
                        "Start light resistance training 3x/week — muscle > fat for weight gain",
                        "Rule out underlying causes: thyroid, GI issues, eating disorders",
                        "Sleep 8–9 hours — growth hormone peaks during deep sleep",
                      ]
                    },
                    {
                      label: "Normal Weight (BMI 18.5–24.9)",
                      color: "border-green-500",
                      href: "/health/daily-water-intake-calculator",
                      steps: [
                        "Don't ignore it — 'normal BMI' doesn't mean no risks",
                        "Check your waist circumference every 3 months",
                        "Aim for 150 min moderate exercise per week (CDC guideline)",
                        "Recheck your BMI every 2–3 months — use our save feature",
                        "Your best tool now is consistency, not change",
                      ]
                    },
                    {
                      label: "Overweight (BMI 25–29.9)",
                      color: "border-yellow-500",
                      href: "/health/calorie-deficit-calculator",
                      steps: [
                        "Calculate your calorie deficit: 500 cal/day = ~1 lb/week loss",
                        "Start with 30-min brisk walks daily — no gym needed",
                        "Cut one ultra-processed food per week, not everything at once",
                        "Track sleep — under 6 hrs raises hunger hormone (ghrelin) by 24%",
                        "Use our TDEE calculator to find your exact maintenance calories",
                      ]
                    },
                    {
                      label: "Obese (BMI 30+)",
                      color: "border-red-400",
                      href: "/health/obesity-risk-calculator",
                      steps: [
                        "Talk to your doctor before intense exercise — protect your joints",
                        "Start with 10-min walks twice daily, then build from there",
                        "Focus on reducing processed sugar and liquid calories first",
                        "Know this: people who start at BMI 35+ see the fastest early results",
                        "GLP-1 medications (Ozempic, etc.) are now FDA-approved for BMI 30+ with risk factors",
                      ]
                    }
                  ].map((item) => (
                    <div key={item.label} className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 ${item.color}`}>
                      <Link href={item.href} className="font-bold text-gray-800 hover:underline hover:text-green-700 transition-colors text-sm block mb-3">
                        {item.label} →
                      </Link>
                      <ul className="space-y-1.5">
                        {item.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="text-green-500 font-bold mt-0.5">✓</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* 12. FINAL SECTION ────────────────────────────────────────────── */}
              <section className="text-center py-12 border-t border-gray-100">
                <div className="flex justify-center mb-4">
                  <Heart className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Your BMI is a signal — not a sentence.</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-4">
                  The number you just calculated took 2 seconds to produce. Changing it takes weeks and months of consistent small decisions — not one dramatic overhaul. The people who succeed are not those with the most willpower. They're the ones who made the habits boring and automatic.
                </p>
                <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Save your result above. Come back in 6–8 weeks. Recalculate. The delta between those two numbers — that's your real progress indicator, not what you see in the mirror day-to-day.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {[
                    { label: "Calculate TDEE", href: "/health/tdee-calculator" },
                    { label: "Ideal Body Weight Calculator", href: "/health/ideal-body-weight-calculator" },
                    { label: "Calorie Deficit Calculator", href: "/health/calorie-deficit-calculator" },
                    { label: "Body Fat % Calculator", href: "/health/body-fat-calculator" },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm font-semibold px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
                    >
                      {link.label} →
                    </Link>
                  ))}
                </div>
              </section>

              {/* CITATIONS ───────────────────────────────────────────────────── */}
              <section className="py-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-widest">Sources & References</h3>
                <div className="grid md:grid-cols-2 gap-1 text-xs text-gray-400">
                  {[
                    ["CDC", "Adult BMI Categories — cdc.gov/bmi"],
                    ["NHLBI / NIH", "Calculate Your BMI — nhlbi.nih.gov/calculate-your-bmi"],
                    ["WHO", "Global Database on Body Mass Index — who.int"],
                    ["AMA", "AMA Policy on BMI as a Measure in Medicine (2023) — ama-assn.org"],
                    ["PMC / NIH", "BMI Interpretation across Age Groups — pmc.ncbi.nlm.nih.gov/articles/PMC9396052"],
                    ["JAMA", "Steps/Day and Mortality — jamanetwork.com (2021)"],
                    ["Trefethen, Oxford", "New BMI Formula Proposal — people.maths.ox.ac.uk"],
                    ["MedicalNewsToday", "Healthy Weight by Height — medicalnewstoday.com"],
                  ].map(([source, desc]) => (
                    <p key={source}><strong className="text-gray-500">{source}:</strong> {desc}</p>
                  ))}
                </div>
              </section>

            </div>

            {/* SERVICE CTA */}
            <ServiceCTA
              eyebrow="BMI is a starting point, not an answer"
              title="BMI cannot tell fat from muscle"
              body="Your BMI comes from two numbers, height and weight, so it cannot see what the weight is made of. Two people at the same BMI can be in completely different shape. Calqulate Vitals logs your weight, waist and body composition on one timeline so you can watch what is actually changing."
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

            <RelatedCalculators slug="bmi-calculator" />

            {/* FAQ ─────────────────────────────────────────────────────────── */}
            <div className="mt-12">
              <FAQSection faqs={faqs} />
            </div>

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