import type { Metadata } from "next"
import Image from "next/image"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import WaistToHipRatioCalculator from "@/components/calculators/waist-to-hip-ratio-calculator"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { Card, CardContent } from "@/components/ui/card"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { ServiceCTA } from "@/components/seo/service-cta"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { RelatedCalculators } from "@/components/calculators/related-calculators"
import {
  HeartPulse,
  Ruler,
  CheckCircle2,
  AlertTriangle,
  ListChecks,
  ShieldCheck,
  Activity,
  Calculator,
  ArrowRight,
  Check,
  Target,
  MessageCircleQuestion,
  Stethoscope,
  Scale,
  HeartHandshake,
  Sparkles
} from "lucide-react"

export const metadata: Metadata = {
  title: "Waist to Hip Ratio Calculator (WHR): Check Health Risks",
  description:
    "Check your hidden health risk in seconds. Our free Waist to Hip Ratio Calculator accurately measures your body fat distribution and metabolic health risk.",
  keywords:
    "waist to hip ratio calculator, whr calculator, hip ratio calculator, waist ratio calculator, calculate waist to hip ratio, height waist ratio calculator",
  alternates: {
    canonical: "https://calqulate.net/health/waist-to-hip-ratio-calculator",
  },
  openGraph: {
    title: "Waist to Hip Ratio Calculator (WHR): Check Health Risks",
    description: "Check your hidden health risk in seconds. Our free Waist to Hip Ratio Calculator accurately measures your body fat distribution and metabolic health risk.",
    url: "https://calqulate.net/health/waist-to-hip-ratio-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Waist to Hip Ratio Calculator (WHR): Check Health Risks",
    description: "Check your hidden health risk in seconds. Our free Waist to Hip Ratio Calculator accurately measures your body fat distribution and metabolic health risk.",
  },
}

const faqs =[
  {
    question: "What is a good waist to hip ratio?",
    answer:
      "A healthy WHR is generally considered to be below 0.90 for men and below 0.80 for women. Staying within these ranges suggests a lower risk of metabolic complications.",
  },
  {
    question: "Is WHR better than BMI?",
    answer:
      "Yes. WHR is often more accurate for assessing health risks because it measures your actual fat distribution, not just your overall weight. BMI cannot tell the difference between muscle mass and belly fat, but WHR shows exactly where your body stores risk-associated fat.",
  },
  {
    question: "Can I reduce my WHR?",
    answer:
      "Absolutely. Yes, you can reduce your WHR by losing belly fat. This is usually achieved through a combination of regular cardiovascular exercise, targeted strength training, a healthy whole-food diet, and reducing refined sugars.",
  },
  {
    question: "What is the difference between waist ratio and hip ratio calculator?",
    answer:
      "They are often used interchangeably by users, but a true WHR specifically compares your waist size directly against your hip size to determine fat distribution. Both terms refer to the exact same formula.",
  },
  {
    question: "Does height affect WHR?",
    answer:
      "Not directly. Your height isn't used in the WHR formula. However, the waist-to-height ratio is another excellent metric that gives additional insight into your overall health risk.",
  },
  {
    question: "Why is belly fat dangerous?",
    answer:
      "Excess abdominal fat (often called visceral fat) surrounds your internal organs. It actively releases hormones and inflammatory markers that increase the risk of heart disease, type 2 diabetes, high blood pressure, and stroke.",
  },
]

export default function WaistToHipRatioPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Waist to Hip Ratio Calculator"
        description="Instantly calculate your Waist-to-Hip Ratio (WHR) to discover your body fat distribution and hidden health risks."
        url="https://calqulate.net/health/waist-to-hip-ratio-calculator"
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
              Waist to Hip Ratio Calculator (WHR)
            </h1>

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
                Calqulate.net works out your waist-to-hip ratio from two measurements against WHO thresholds. You get an apple/pear classification and a clear cardiometabolic read.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "WHR", label: "Ratio" },
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
            <WaistToHipRatioCalculator />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            
            <p className="text-center text-sm font-medium text-gray-500 mt-6 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Your data is private. We do not store your measurements.
            </p>

            <div className="prose prose-gray dark:prose-invert max-w-none mt-16 space-y-16">
              
              {/* Intro Section: What is WHR? */}
              <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <h2 className="mb-6 text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-7 h-7 text-indigo-600" />
                  What is Waist to Hip Ratio?
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed">
                  The <strong>Waist-to-Hip Ratio (WHR)</strong> is a simple yet powerful health metric that compares the size of your waist to your hips. It helps you understand fat distribution in your body, which is significantly more important than just tracking your overall weight.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Unlike BMI, which only considers weight and height, the waist ratio calculator focuses on <em>where</em> fat is stored — a key indicator of your metabolic health risks. A higher WHR means more fat around the waist (abdominal fat), which is closely linked to higher risks of heart disease, diabetes, and other metabolic issues.
                </p>
                
                <div className="mt-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                  <span className="text-sm uppercase tracking-wide font-bold text-slate-400 mb-2 block">The Formula</span>
                  <div className="text-2xl font-black text-slate-800 font-mono flex items-center justify-center gap-4">
                    WHR = <span className="bg-slate-100 px-4 py-2 rounded-lg">Waist Circumference ÷ Hip Circumference</span>
                  </div>
                </div>
              </section>

              {/* Problem / Solution Section */}
              <section>
                <h2 className="mb-8 text-3xl font-bold text-slate-900">
                  Why WHR Matters (The Real Problem We Solve)
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="border-red-100 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-red-900 mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                        Most users struggle with:
                      </h3>
                      <ul className="space-y-4">
                        <li className="flex gap-3 text-slate-700 italic">
                          <span className="text-red-400 font-bold">"</span>
                          I look slim but still have belly fat — am I healthy?
                        </li>
                        <li className="flex gap-3 text-slate-700 italic">
                          <span className="text-red-400 font-bold">"</span>
                          BMI says I’m normal, but I don’t feel fit.
                        </li>
                        <li className="flex gap-3 text-slate-700 italic">
                          <span className="text-red-400 font-bold">"</span>
                          How do I measure my fat distribution correctly?
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-emerald-100 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-900 mb-4">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        How calqulate.net solves this:
                      </h3>
                      <ul className="space-y-3">
                        {[
                          "Giving accurate WHR results instantly",
                          "Helping users identify hidden health risks",
                          "Providing clear interpretation (not just numbers)",
                          "Supporting both Indian & US health standards"
                        ].map((item, i) => (
                          <li key={i} className="flex gap-3 text-slate-700 items-start">
                            <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* NEW SECTION: REAL USER PROBLEMS */}
              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="mb-6 text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <MessageCircleQuestion className="w-8 h-8 text-indigo-600" />
                  Real User Dilemmas: Why Your Scale & Tape Measure Disagree
                </h2>
                <p className="text-lg text-slate-700 mb-8">
                  Whether you are calculating your Waist-to-Hip Ratio or your Waist-to-Height Ratio, mathematical calculators can sometimes give confusing results if you don't understand the context. Based on real questions from users just like you, here is what might be happening:
                </p>

                <div className="space-y-8">
                  {/* Skinny Fat */}
                  <div className="border-l-4 border-indigo-400 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <Scale className="w-5 h-5 text-indigo-500" />
                      1. "My scale says I'm healthy, but the calculator says I'm at risk!"
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      If you weigh a "normal" amount for your height (e.g., 60kg at 5'0"), but your waist ratio flags as moderate or high risk, you are likely dealing with a phenomenon called <strong>"Skinny-Fat"</strong> (Normal Weight Obesity). This means you have a healthy scale weight, but your body fat percentage—specifically visceral fat around your organs—is too high, while your muscle mass is too low.
                    </p>
                    <p className="text-slate-700 mt-2 font-medium">
                      💡 <em>The Fix:</em> Shift your focus away from cardio and starving yourself. You need <strong>strength/resistance training</strong> to build muscle and improve your metabolic rate while burning that abdominal fat.
                    </p>
                  </div>

                  {/* Underweight Flaw */}
                  <div className="border-l-4 border-blue-400 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-blue-500" />
                      2. "I'm 5'7", 147 lbs, and have a 26-inch waist. The calculator says I'm underweight?!"
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      Many women with pronounced <strong>hourglass figures</strong> run into this issue. If you have a completely normal BMI but a very tiny waist relative to your height or hips, mathematical calculators might flag your waist ratio as "underweight" simply because the fraction is so small. 
                    </p>
                    <p className="text-slate-700 mt-2 font-medium">
                      💡 <em>The Reality:</em> A 25 or 26-inch waist at a healthy body weight is absolutely fine. Ratios are mathematical guides, not doctors. If you eat well, have normal energy, and your doctor is happy, you are not clinically underweight—you just have a slender waist.
                    </p>
                  </div>

                  {/* Medical Red Flags */}
                  <div className="border-l-4 border-red-400 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <Stethoscope className="w-5 h-5 text-red-500" />
                      3. "My waist increased by 8 inches in 6 months with NO change in diet. Should I worry?"
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      Yes. If you experience rapid, unexplained weight gain concentrated strictly in your waistline without any changes to your diet or exercise routine, <strong>do not just rely on a calculator—see a doctor.</strong>
                    </p>
                    <p className="text-slate-700 mt-2 font-medium">
                      💡 <em>The Reality:</em> Sudden abdominal expansion is often a red flag for hormonal imbalances (such as Thyroid issues, PCOS, or high Cortisol from chronic stress), medication side effects, or fluid retention. Get standard bloodwork done.
                    </p>
                  </div>

                  {/* Measurement Error */}
                  <div className="border-l-4 border-emerald-400 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <Ruler className="w-5 h-5 text-emerald-500" />
                      4. Are you absolutely sure you're measuring your waist correctly?
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      A staggering number of people measure their waist where their pants sit (the hip bone). <strong>This is incorrect and will ruin your calculation.</strong> Your true waist is the narrowest part of your torso, usually located slightly above your belly button.
                    </p>
                  </div>

                  {/* Body Shaming */}
                  <div className="border-l-4 border-rose-400 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <HeartHandshake className="w-5 h-5 text-rose-500" />
                      5. "People call me fat and it makes me want to starve myself. Am I?"
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      If you are shorter (e.g., 4'8" or 5'2") and have a waist size over 40 inches, your health risk is elevated because abdominal fat puts strain on short frames. However, <strong>starving yourself is the worst possible solution.</strong> Starvation destroys your metabolism and eats away your muscle mass, making your body cling to belly fat even harder.
                    </p>
                    <p className="text-slate-700 mt-2 font-medium">
                      💡 <em>The Fix:</em> Ignore body shamers. Your goal is health, not aesthetics. Start with 10,000 steps a day, prioritize protein to stay full, and make slow, sustainable changes you can maintain for life.
                    </p>
                  </div>
                </div>
              </section>

              {/* How to measure correctly */}
              <section>
                <h2 className="mb-6 text-3xl font-bold text-slate-900">
                  How to Measure Waist and Hip Correctly
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                      <Ruler className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-blue-900 mb-2 text-xl">1. Waist Measurement</h3>
                    <ul className="space-y-2 text-blue-800 text-sm">
                      <li>• Measure around the narrowest part of your waist.</li>
                      <li>• Usually located just above the belly button.</li>
                      <li>• Keep the tape snug, but not tight.</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                      <Target className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-purple-900 mb-2 text-xl">2. Hip Measurement</h3>
                    <ul className="space-y-2 text-purple-800 text-sm">
                      <li>• Measure around the widest part of your hips/buttocks.</li>
                      <li>• Stand perfectly straight with your feet close together.</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 flex items-center gap-3 font-medium">
                  <span className="text-2xl">📌</span> 
                  Tip: Always use a flexible body measuring tape for the highest accuracy.
                </div>
              </section>

              {/* Step by step */}
              <section className="bg-slate-900 text-slate-50 p-10 rounded-3xl">
                <h2 className="text-3xl font-bold text-white mb-6">
                  Step-by-Step: How This WHR Calculator Works
                </h2>
                <div className="flex flex-col md:flex-row gap-8 justify-between">
                  <ol className="space-y-4 text-lg font-medium text-slate-300 flex-1">
                    <li className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</span>
                      Enter your waist size (cm or inches)
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</span>
                      Enter your hip size
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</span>
                      Click "Check Your Health Risk"
                    </li>
                  </ol>
                  <div className="flex-1 bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-emerald-400" /> Instantly get:
                    </h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li className="flex items-center gap-2">✓ Your accurate Waist to Hip Ratio</li>
                      <li className="flex items-center gap-2">✓ Your health category shape</li>
                      <li className="flex items-center gap-2">✓ Your Risk level (Low / Moderate / High)</li>
                    </ul>
                    <p className="mt-4 text-sm text-emerald-400 italic">
                      👉 This makes it more than just a hip ratio calculator — it becomes a true health decision tool.
                    </p>
                  </div>
                </div>
              </section>

              {/* Healthy Range Standards */}
              <section>
                <h2 className="mb-8 text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-7 h-7 text-rose-500" />
                  WHR Healthy Range (India + Global Standards)
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-slate-200">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">👨 For Men:</h3>
                      <ul className="space-y-4">
                        <li className="flex justify-between items-center pb-2 border-b">
                          <span className="font-medium text-slate-600">Below 0.90</span>
                          <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">Healthy</span>
                        </li>
                        <li className="flex justify-between items-center pb-2 border-b">
                          <span className="font-medium text-slate-600">0.90 – 0.99</span>
                          <span className="text-yellow-600 font-bold bg-yellow-50 px-3 py-1 rounded-full text-sm">Moderate Risk</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="font-medium text-slate-600">1.0 and above</span>
                          <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full text-sm">High Risk</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">👩 For Women:</h3>
                      <ul className="space-y-4">
                        <li className="flex justify-between items-center pb-2 border-b">
                          <span className="font-medium text-slate-600">Below 0.80</span>
                          <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">Healthy</span>
                        </li>
                        <li className="flex justify-between items-center pb-2 border-b">
                          <span className="font-medium text-slate-600">0.80 – 0.84</span>
                          <span className="text-yellow-600 font-bold bg-yellow-50 px-3 py-1 rounded-full text-sm">Moderate Risk</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="font-medium text-slate-600">0.85 and above</span>
                          <span className="text-red-600 font-bold bg-red-50 px-3 py-1 rounded-full text-sm">High Risk</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Height Waist Ratio insight */}
              <section className="bg-gradient-to-br from-indigo-50 flex flex-col md:flex-row to-blue-50 p-8 rounded-3xl border border-indigo-100 items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-indigo-950 mb-3">Height Waist Ratio (Extra Insight)</h3>
                  <p className="text-indigo-900 leading-relaxed">
                    Many users also search for the <em>height waist ratio calculator</em>. While WHR looks at your hips, your Waist-to-Height ratio gives additional insight into your overall health risk.
                  </p>
                  <div className="mt-4 font-mono font-bold text-indigo-800 bg-white inline-block px-4 py-2 rounded shadow-sm">
                    Waist-to-Height Ratio = Waist ÷ Height
                  </div>
                  <p className="mt-4 font-medium text-indigo-900">
                    👉 <strong>Ideal:</strong> Less than 0.5. It is considered highly accurate for predicting overall cardiovascular health.
                  </p>
                </div>
                <div className="hidden md:flex w-24 h-24 bg-indigo-200 rounded-full items-center justify-center text-indigo-600 shrink-0">
                  <ListChecks className="w-10 h-10" />
                </div>
              </section>

              {/* Features / Who should use */}
              <section className="py-8 border-t border-slate-100">
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                      What Makes Our WHR Calculator Unique?
                    </h2>
                    <p className="text-slate-600 mb-4">Unlike basic tools, this is built for real human needs:</p>
                    <ul className="space-y-3">
                      {[
                        "Instant, highly accurate results",
                        "Seamlessly supports both cm & inches",
                        "Shows meaningful health insights (not just a random number)",
                        "Works perfectly for both men & women",
                        "Optimized for Indian and US health thresholds",
                        "Mobile-friendly & fast (loads in milliseconds)"
                      ].map((item, i) => (
                        <li key={i} className="flex gap-3 text-slate-700 items-center font-medium">
                          <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                      Who Should Use This?
                    </h2>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <ul className="divide-y divide-slate-100">
                        {[
                          "Fitness beginners tracking their progress",
                          "People actively tracking targeted fat loss",
                          "Women checking their body shape balance",
                          "Men monitoring visceral belly fat",
                          "Anyone feeling confused between BMI vs WHR metrics"
                        ].map((item, i) => (
                          <li key={i} className="p-4 flex items-center gap-3 text-slate-700 hover:bg-slate-50 transition-colors">
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* Author Badge Section */}
            <MedicalReviewerSection />
            

            {/* SERVICE CTA */}
            <ServiceCTA
              eyebrow="One ratio today, or the direction over months"
              title="The trend is what tells you it is working"
              body="A single waist-to-hip reading places you today. What actually matters is which way it moves over the next few months. Calqulate Vitals keeps your measurements and weight on one timeline so you can see the direction instead of guessing from one number."
              bullets={[
                "Log measurements and weight in seconds",
                "Everything you log on one timeline",
                "Track body composition, labs and workouts",
                "Fat vs muscle trend (Premium)",
              ]}
              href="/signup?next=/dashboard/glp1"
              learnMoreHref="/product/glp1-progress-tracker"
              cta="Start tracking free"
            />

            <RelatedCalculators slug="waist-to-hip-ratio-calculator" />

            {/* Structured FAQ UI */}
            <div className="mt-12 pt-8 border-t border-slate-100">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <FAQSection faqs={faqs} />
            </div>
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