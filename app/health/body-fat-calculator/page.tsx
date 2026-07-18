import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import BodyFatWizard from "@/components/calculators/body-fat-wizard"
import { ServiceCTA } from "@/components/seo/service-cta"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { Card } from "@/components/ui/card"
import {
  Scale,
  Ruler,
  Heart,
  Activity,
  ShieldCheck,
  User,
  Users,
  AlertTriangle,
  CheckCircle2,
  Target,
  TrendingDown,
  Dumbbell,
  X,
  Check,
  Zap,
  Sparkles,
  Camera,
  Syringe,
  ArrowRight,
} from "lucide-react"
import { RelatedCalculators } from "@/components/calculators/related-calculators"

export const metadata: Metadata = {
  title: "Body Fat Calculator: Check Your Real Body Fat %",
  description:
    "Calculate body fat percentage accurately using the U.S. Navy Method. Our free body fat calculator uses your measurements (waist, neck, hip, height) to estimate body fat for men and women.",
  keywords:
    "body fat calculator, body fat percentage calculator, calculate body fat, body fat calculator by measurements, body fat calculator for women, body fat calculator for men, accurate body fat calculator, bmi to body fat calculator",
  alternates: {
    canonical: "https://calqulate.net/health/body-fat-calculator",
  },
  openGraph: {
    title: "Body Fat Calculator: Check Your Real Body Fat %",
    description: "Calculate body fat percentage accurately using the U.S. Navy Method. Our free body fat calculator uses your measurements (waist, neck, hip, height) to estimate body fat for men and women.",
    url: "https://calqulate.net/health/body-fat-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Body Fat Calculator: Check Your Real Body Fat %",
    description: "Calculate body fat percentage accurately using the U.S. Navy Method. Our free body fat calculator uses your measurements (waist, neck, hip, height) to estimate body fat for men and women.",
  },
}

const faqs = [
  {
    question: "How accurate is the Navy body fat calculator?",
    answer:
      "Within about 3 to 4 percent when you measure consistently. That is accurate enough to track real change over weeks and months.",
  },
  {
    question: "What is the ideal body fat percentage for men and women?",
    answer:
      "It depends on age and goals. For general health, aim for 10 to 20 percent (men) or 18 to 28 percent (women). See the full ranges above.",
  },
  {
    question: "Does this calculator work for both men and women?",
    answer:
      "Yes. Select your sex and it applies the correct formula automatically.",
  },
  {
    question: "How do I lower my body fat percentage?",
    answer:
      "Strength train, eat enough protein, keep a moderate calorie deficit, walk more and sleep well. Expect steady progress, not overnight change.",
  },
  {
    question: "Why does waist measurement matter?",
    answer:
      "Waist size is a strong indicator of visceral fat, the type linked to heart disease and diabetes. Even if your overall percentage looks fine, a large waist is worth acting on.",
  },
]

export default function BodyFatCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Body Fat Calculator"
        description="Calculate your body fat percentage using the U.S. Navy Method. Accurate body fat estimation for men and women based on body measurements."
        url="https://calqulate.net/health/body-fat-calculator"
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
              Body Fat Calculator: Find Your Real Body Fat Percentage <span className="text-emerald-700">(Male &amp; Female)</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              Snap a photo and let the AI measure you, or grab a soft tape. Either way you get a reliable estimate from
              the proven U.S. Navy method, the same one the military has used for decades.
            </p>

            <p className="mt-5 max-w-3xl border-l-4 border-emerald-500 pl-4 text-base md:text-lg font-semibold text-slate-800">
              New: <span className="text-emerald-700">AI photo mode</span>. Your photo never leaves your browser.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#calculator"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                <Camera className="h-4 w-4" /> Check my body fat ↓
              </a>
              <Link
                href="/product/glp1-progress-tracker"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold px-6 py-3 text-sm font-bold text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)] transition hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" /> Track fat vs muscle over time
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* USP SUMMARY (TOFU) */}
        <section className="border-b border-emerald-100 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 md:p-6">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <p className="text-sm md:text-base leading-relaxed text-slate-700">
                Your scale tells you one number. It cannot tell you what that number is made of. This body fat percentage
                calculator estimates how much of your weight is fat versus lean mass (muscle, bone, organs and water)
                using simple circumference measurements. That makes it far more useful than the scale or BMI, whether you
                are losing fat, building muscle or simply staying healthy.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "AI photo", label: "Or tape measure" },
              { value: "Navy", label: "Method" },
              { value: "On-device", label: "Nothing uploaded" },
              { value: "Free", label: "No sign-up" },
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

        {/* CALCULATOR (conversational wizard: photo or tape) */}
        <section id="calculator" className="scroll-mt-20 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mx-auto mb-8 max-w-xl text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">What is your body fat percentage?</h2>
              <p className="mt-2 text-slate-600">
                A few quick taps. Use a photo or a tape measure. No account, no email, nothing leaves your browser.
              </p>
            </div>
            <BodyFatWizard />
          </div>
        </section>

        {/* AI PHOTO MODE: how it works + honest limits */}
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-7 h-7 text-emerald-600" />
              How AI photo mode works
            </h2>
            <p className="mt-3 text-lg text-slate-700 leading-relaxed">
              Taking tape measurements is fiddly, and most people do it wrong. AI photo mode skips the tape. It runs a
              Google MediaPipe pose model directly in your browser, so your photo is never uploaded anywhere.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { n: "1", t: "Find your body", d: "The model detects 33 body landmarks and a full silhouette of you." },
                { n: "2", t: "Scale to real size", d: "Your silhouette height is matched to the real height you typed, giving centimetres per pixel." },
                { n: "3", t: "Measure the rows", d: "It measures your true width at the neck, waist and hips, ignoring arms held away from your body." },
                { n: "4", t: "Apply the Navy formula", d: "Widths plus depth become circumferences, which feed the same validated formula as tape mode." },
              ].map((s) => (
                <div key={s.n} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold mb-3">{s.n}</div>
                  <h3 className="font-bold text-slate-900 mb-1">{s.t}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.d}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50">
                <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Check className="w-5 h-5" /> Add a side photo for a better estimate
                </h3>
                <p className="text-sm text-emerald-900/90 leading-relaxed">
                  A front photo alone cannot see how deep your torso is front to back, so it assumes an average. A side
                  photo measures that depth instead, which is why confidence jumps from medium to high.
                </p>
              </div>
              <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50">
                <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> What it is not
                </h3>
                <p className="text-sm text-amber-900/90 leading-relaxed">
                  This is an educational estimate, not a medical device and not a DEXA scan. Lighting, baggy clothing and
                  pose all move the number. If you want precision, use the tape, and re-measure the same way each time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMMIT: GLP-1 progress tracker + internal links */}
        <section className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white">
          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
            <div className="flex items-center gap-2 mb-4">
              <Syringe className="w-7 h-7 text-emerald-300" />
              <h2 className="text-2xl md:text-3xl font-bold text-white m-0">Now make the fat come off, and the muscle stay</h2>
            </div>
            <p className="text-lg text-emerald-50/90 leading-relaxed">
              One reading is a snapshot. What decides whether the fat stays off is your lean mass, and that is exactly
              what the scale hides. This matters most on a GLP-1, where up to 40 percent of the weight lost can be muscle
              if you do not protect it.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-white/10 border border-white/20 p-5">
                <p className="font-bold text-white mb-2">If you want to lose body fat</p>
                <p className="text-sm text-emerald-50/90 leading-relaxed">
                  Check your pace with the{" "}
                  <Link href="/health/weight-loss-percentage-calculator" className="font-bold text-gold-light underline underline-offset-2">
                    weight loss percentage calculator
                  </Link>
                  , then set a protein target with the{" "}
                  <Link href="/health/lean-body-mass-calculator" className="font-bold text-gold-light underline underline-offset-2">
                    lean body mass and muscle retention calculator
                  </Link>
                  .
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/20 p-5">
                <p className="font-bold text-white mb-2">If you take a GLP-1</p>
                <p className="text-sm text-emerald-50/90 leading-relaxed">
                  Find out where you stand with the{" "}
                  <Link href="/health/glp-1-dose-calculator" className="font-bold text-gold-light underline underline-offset-2">
                    GLP-1 Body Composition Tracker: are you losing fat or muscle?
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/product/glp1-progress-tracker"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-light to-gold px-6 py-4 text-base font-bold text-gold-ink shadow-[0_10px_28px_rgba(245,158,11,0.4)] transition-transform hover:-translate-y-0.5"
              >
                <Sparkles className="h-5 w-5" /> See the GLP-1 Progress Tracker
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Plans and pricing
              </Link>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="max-w-4xl mx-auto">

            <div className="prose prose-gray dark:prose-invert max-w-none mt-12 space-y-12">

              {/* Why Body Fat Percentage Beats BMI */}
              <section className="py-8 border-b border-gray-100">
                <h2 className="mb-4 text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-teal-600" />
                  Why Body Fat Percentage Beats BMI
                </h2>
                <p className="mb-4 text-gray-700 leading-relaxed">
                  BMI looks only at total weight and height. It cannot tell the difference between a muscular athlete and
                  someone carrying extra fat. You can be a &quot;normal&quot; weight on BMI yet carry high visceral fat,
                  the dangerous kind that surrounds your organs. Equally, you can be &quot;overweight&quot; on BMI yet
                  lean and strong.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  <strong>Body fat percentage tells the real story for:</strong>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 not-prose">
                  <div className="p-4 bg-red-50 rounded-xl text-center">
                    <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-800 text-sm">Heart and metabolic health</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl text-center">
                    <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-800 text-sm">Insulin sensitivity and diabetes risk</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl text-center">
                    <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-800 text-sm">Hormone balance</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl text-center">
                    <Dumbbell className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-800 text-sm">Fat loss that does not cost you muscle</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl text-center">
                    <Target className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-800 text-sm">Athletic performance, and how you look and feel</p>
                  </div>
                </div>

                <p className="mt-6 text-gray-700 font-medium bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500">
                  That is why fitness professionals, doctors and serious trainees track body fat percentage instead of
                  relying on the scale alone.
                </p>
              </section>

              {/* How to Calculate at Home (Navy Method) */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Ruler className="w-6 h-6 text-teal-600" />
                  How to Calculate Body Fat Percentage at Home (U.S. Navy Method)
                </h2>
                <p className="mb-6 text-gray-700 leading-relaxed">
                  The Navy method is one of the most practical, reliable options for home use. It is not lab-perfect, but
                  with consistent measurements it is accurate to within about 3 to 4 percent, more than enough for
                  tracking change over time.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 bg-white border border-gray-200 rounded-xl">
                    <h4 className="font-bold text-gray-800 mb-3">What you will need:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> A soft fabric measuring tape (not metal)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> A mirror, or someone to help
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> Relaxed posture and normal breathing
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <h4 className="font-bold text-amber-800 mb-3">Best time to measure:</h4>
                    <p className="text-sm text-amber-700">
                      First thing in the morning, after using the bathroom and before eating or drinking. Repeat under the
                      same conditions each time for the most useful trends.
                    </p>
                  </div>
                </div>

                {/* Measurement Guide */}
                <h3 className="text-xl font-bold text-gray-800 mb-4">Measurement Guide</h3>
                <div className="grid gap-4 not-prose sm:grid-cols-2">
                  <div className="p-5 bg-white border-2 border-teal-200 rounded-2xl">
                    <h4 className="font-bold text-gray-800 mb-1">Height</h4>
                    <p className="text-sm text-gray-600">Stand straight against a wall, barefoot. Measure to the nearest 0.5 cm or 1/4 inch.</p>
                  </div>
                  <div className="p-5 bg-white border-2 border-teal-200 rounded-2xl">
                    <h4 className="font-bold text-gray-800 mb-1">Neck</h4>
                    <p className="text-sm text-gray-600">Just below the Adam&apos;s apple. Keep the tape level, sloping slightly down at the front. Do not tense or flare your neck.</p>
                  </div>
                  <div className="p-5 bg-white border-2 border-teal-200 rounded-2xl">
                    <h4 className="font-bold text-gray-800 mb-1">Waist</h4>
                    <p className="text-sm text-gray-600">Men, at navel level, relaxed. Women, at the narrowest point, usually just above the navel.</p>
                  </div>
                  <div className="p-5 bg-white border-2 border-pink-200 rounded-2xl">
                    <h4 className="font-bold text-gray-800 mb-1">Hips <span className="text-pink-600 font-semibold">(women only)</span></h4>
                    <p className="text-sm text-gray-600">Around the widest part of the hips and buttocks.</p>
                  </div>
                </div>

                {/* Formulas */}
                <div className="mt-6 space-y-4 not-prose">
                  <p className="text-sm font-semibold text-gray-700">Formulas (the calculator applies these automatically; measurements in inches):</p>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <p className="font-bold text-blue-800">Men</p>
                    </div>
                    <div className="overflow-x-auto">
                      <div className="text-sm font-mono bg-white p-3 rounded-lg border border-blue-200 text-blue-800 whitespace-nowrap">
                        BF% = 86.010 × log₁₀(waist − neck) − 70.041 × log₁₀(height) + 36.76
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-pink-600" />
                      <p className="font-bold text-pink-800">Women</p>
                    </div>
                    <div className="overflow-x-auto">
                      <div className="text-sm font-mono bg-white p-3 rounded-lg border border-pink-200 text-pink-800 whitespace-nowrap">
                        BF% = 163.205 × log₁₀(waist + hip − neck) − 97.684 × log₁₀(height) − 78.387
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-6 text-gray-700 font-medium bg-teal-50 p-4 rounded-lg border-l-4 border-teal-500">
                  Pro tip: measure each spot three times and take the average. Do not suck in your stomach or pull the
                  tape tight.
                </p>
              </section>

              {/* Body Fat Percentage Ranges */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-teal-600" />
                  Body Fat Percentage Ranges (Men &amp; Women)
                </h2>
                <p className="mb-6 text-gray-700 leading-relaxed">
                  Healthy ranges vary by age, sex and goals. Here is the widely used American Council on Exercise (ACE)
                  guidance:
                </p>

                <Card className="not-prose overflow-hidden border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[360px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold text-gray-800 whitespace-nowrap">Category</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-800 whitespace-nowrap">Men</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-800 whitespace-nowrap">Women</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          ["Essential fat", "2 to 5%", "10 to 13%"],
                          ["Athletes", "6 to 13%", "14 to 20%"],
                          ["Fitness", "14 to 17%", "21 to 24%"],
                          ["Average", "18 to 24%", "25 to 31%"],
                          ["Obese", "25%+", "32%+"],
                        ].map((row, i) => (
                          <tr key={row[0]} className={i % 2 ? "bg-gray-50/50" : ""}>
                            <td className="px-4 py-3 font-medium whitespace-nowrap">{row[0]}</td>
                            <td className="px-4 py-3 text-gray-700 font-semibold whitespace-nowrap">{row[1]}</td>
                            <td className="px-4 py-3 text-gray-700 font-semibold whitespace-nowrap">{row[2]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <p className="mt-4 text-gray-700">
                  Women naturally carry more fat than men because of reproductive and hormonal needs.
                </p>

                <h3 className="mt-8 text-xl font-bold text-gray-800 mb-4">Realistic targets (not extremes):</h3>
                <Card className="not-prose overflow-hidden border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[360px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold text-gray-800 whitespace-nowrap">Goal</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-800 whitespace-nowrap">Men</th>
                          <th className="px-4 py-3 text-left font-bold text-gray-800 whitespace-nowrap">Women</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          ["General health", "10 to 20%", "18 to 28%"],
                          ["Visible definition", "12 to 15%", "20 to 24%"],
                          ["Competition lean (hard to maintain)", "6 to 10%", "14 to 18%"],
                        ].map((row, i) => (
                          <tr key={row[0]} className={i % 2 ? "bg-gray-50/50" : ""}>
                            <td className="px-4 py-3 font-medium">{row[0]}</td>
                            <td className="px-4 py-3 text-gray-700 font-semibold whitespace-nowrap">{row[1]}</td>
                            <td className="px-4 py-3 text-gray-700 font-semibold whitespace-nowrap">{row[2]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <div className="mt-6 p-4 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
                  <p className="text-purple-800 text-sm">
                    Staying too lean for too long can disrupt hormones, energy, immunity and bone health, especially for
                    women. Speak to a doctor if you are concerned.
                  </p>
                </div>
              </section>

              {/* How the Navy Method Compares */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-teal-600" />
                  How the Navy Method Compares with Other Options
                </h2>

                <Card className="not-prose overflow-hidden border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-5 py-4 text-left font-bold text-gray-800 whitespace-nowrap">Method</th>
                          <th className="px-5 py-4 text-left font-bold text-gray-800 whitespace-nowrap">Accuracy</th>
                          <th className="px-5 py-4 text-left font-bold text-gray-800 whitespace-nowrap">Ease at Home</th>
                          <th className="px-5 py-4 text-left font-bold text-gray-800 whitespace-nowrap">Cost</th>
                          <th className="px-5 py-4 text-left font-bold text-gray-800 whitespace-nowrap">Best For</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          ["DEXA scan", "Highest (gold standard)", "Low", "$$$", "One-off detailed check", ""],
                          ["Hydrostatic / Bod Pod", "Very high", "Low", "$$", "Research and clinical use", ""],
                          ["Navy tape (this tool)", "Good (about 3 to 4%)", "Excellent", "Free", "Tracking progress", "bg-orange-50"],
                          ["Skinfold calipers", "Good (with practice)", "High", "$", "More precise home option", ""],
                          ["Smart scales (BIA)", "Variable", "High", "$ to $$", "Rough daily estimates", ""],
                          ["BMI", "Poor for fat", "High", "Free", "Population screening", ""],
                        ].map((row) => (
                          <tr key={row[0]} className={row[5]}>
                            <td className="px-5 py-4 font-bold text-gray-800 whitespace-nowrap">{row[0]}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{row[1]}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{row[2]}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{row[3]}</td>
                            <td className="px-5 py-4 whitespace-nowrap">{row[4]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <p className="mt-4 text-gray-700 leading-relaxed">
                  For most people, the Navy method or calipers hit the sweet spot: accurate enough, free or cheap, and
                  easy to repeat. Track every 2 to 4 weeks.
                </p>
                <p className="mt-4 text-gray-700 font-medium bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
                  Using calipers? Pinch at standard sites (abdomen, thigh, triceps), and use the same calipers and
                  technique every time. Jackson-Pollock formulas cover 3-site, 4-site and 7-site measurements.
                </p>
              </section>

              {/* Common Mistakes */}
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-teal-600" />
                  Common Mistakes That Skew Your Results
                </h2>
                <ul className="space-y-2 text-sm text-gray-700 not-prose">
                  {[
                    "Measuring after eating, bloating changes waist size",
                    "Sucking in your stomach or holding your breath",
                    "Measuring at different spots or times of day",
                    "Mixing units (cm vs inches)",
                    "Expecting one number to tell your whole story",
                  ].map((m) => (
                    <li key={m} className="flex items-start gap-2 bg-red-50 p-3 rounded-lg">
                      <X className="w-4 h-4 text-red-500 mt-0.5 shrink-0" /> {m}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-gray-700 font-medium bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  Do this instead: log your measurements and percentage in a simple spreadsheet or app, then watch the
                  trend. Combine it with photos, how your clothes fit, strength gains and energy levels.
                </p>
              </section>

              {/* Fat Loss vs Weight Loss */}
              <section className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <TrendingDown className="w-6 h-6 text-teal-600" />
                  Fat Loss vs Weight Loss: The Real Goal
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  You can lose weight and look softer, that is fat and muscle going. You can gain weight and look leaner,
                  that is muscle coming on. What matters is body composition, not the scale.
                </p>
                <p className="text-gray-700 font-semibold mb-3">Prioritise:</p>
                <ul className="space-y-2 text-sm text-gray-700 not-prose">
                  {[
                    "Strength training to preserve and build muscle",
                    "A protein-rich diet",
                    "A sustainable calorie deficit, not a crash diet",
                    "Sleep and stress management",
                  ].map((m) => (
                    <li key={m} className="flex items-start gap-2 bg-white p-3 rounded-lg border border-amber-100">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> {m}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-gray-700 font-semibold text-center">
                  If the scale stalls while your body fat percentage drops, you are winning.
                </p>
              </section>

              {/* Why Use This Calculator */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-teal-600" />
                  Why Use This Calculator?
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    "Uses the validated U.S. Navy formulas, with separate calculations for men and women",
                    "Gives clear, actionable results with context, not just a number",
                    "No data tracking, no ads, no products pushed at you",
                  ].map((m) => (
                    <div key={m} className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="text-gray-800 text-sm">{m}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm text-gray-600 leading-relaxed">
                  <strong className="text-gray-800">Health note:</strong> this is an educational estimate. See a doctor
                  or registered dietitian for personalised advice, especially if you have a health condition or an
                  extreme reading.
                </p>
              </section>

              <ServiceCTA
                eyebrow="Track results, not just the scale"
                title="Watch your body fat fall without losing muscle"
                body="A single reading tells you where you are. What protects your results is logging body fat, weight and protein consistently, so you can see a direction instead of one dot. Calqulate Vitals keeps all of that on one timeline for free, and Premium adds the fat vs muscle trend, plateau risk and dose-timing views."
                bullets={[
                  "Log body fat, weight and measurements in seconds",
                  "Everything you log on one timeline",
                  "Find out how much protein is really in your meal",
                  "Fat vs muscle trend and plateau risk (Premium)",
                ]}
                href="/signup?next=/dashboard/glp1"
                learnMoreHref="/product/glp1-progress-tracker"
                cta="Start tracking free"
              />

            </div>

            <RelatedCalculators slug="body-fat-calculator" />

            {/* FAQ Section - Long-tail keyword capture */}
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
