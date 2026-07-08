import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import WeightLossPercentageWizard from "@/components/calculators/weight-loss-percentage-wizard"
import { ServiceCTA } from "@/components/seo/service-cta"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { Card, CardContent } from "@/components/ui/card"
import {
  TrendingDown,
  Scale,
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
  HeartHandshake,
  Percent,
  Calendar,
  Baby,
  Sparkles,
  Syringe,
} from "lucide-react"
import { RelatedCalculators } from "@/components/calculators/related-calculators"

export const metadata: Metadata = {
  title: "Weight Loss Percentage Calculator: Is Your Progress Actually Good?",
  description:
    "Lost weight but not sure if it's enough? Calculate your exact weight loss percentage free, compare it to healthy benchmarks (5%, 10%, 15%+), check your weekly pace, and see if a GLP-1 like Ozempic or Wegovy is dropping fat or muscle.",
  keywords:
    "weight loss percentage calculator, body percent weight loss calculator, calculate the percentage of weight loss, calculate weight loss percentage calculator, determine weight loss percentage, figure out percentage of weight loss, lose weight percentage calculator, percentage of fat loss calculator, weight loss percentage cal, weight loss percentage on ozempic, wegovy weight loss by month, glp-1 weight loss percentage, how much weight loss on mounjaro",
  alternates: {
    canonical: "https://calqulate.net/health/weight-loss-percentage-calculator",
  },
  openGraph: {
    title: "Weight Loss Percentage Calculator: Is Your Progress Actually Good?",
    description: "Free weight loss percentage calculator. Calculate the percentage of weight loss instantly in lbs or kg, track progress to your goal, and see your weekly average.",
    url: "https://calqulate.net/health/weight-loss-percentage-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Weight Loss Percentage Calculator | Track % of Body Weight Lost",
    description: "Free weight loss percentage calculator. Calculate the percentage of weight loss instantly in lbs or kg, track progress to your goal, and see your weekly average.",
  },
}

const faqs = [
  {
    question: "What is a good weight loss percentage?",
    answer:
      "A healthy target is losing 5% to 10% of your starting body weight over 3 to 6 months. Even at 5%, most adults see meaningful improvements in blood pressure, blood sugar, and cholesterol. Anything more aggressive than 1% per week is generally not sustainable long-term.",
  },
  {
    question: "How do I figure the percentage of weight loss?",
    answer:
      "To figure out percentage of weight loss, subtract your current weight from your starting weight, divide that number by your starting weight, then multiply by 100. The formula works the same in lbs or kg — just stay consistent with one unit.",
  },
  {
    question: "Is this a body percent weight loss calculator?",
    answer:
      "Yes. This tool is a body percent weight loss calculator that shows what portion of your original body weight you have lost. It does not measure body fat percentage specifically — for that you would need a body fat caliper, smart scale, or DEXA scan.",
  },
  {
    question: "Can I use this percentage of fat loss calculator in lbs and kg?",
    answer:
      "Yes. The lose weight percentage calculator works for both pounds and kilograms. The math gives the exact same percentage either way — a 10% loss is 10% in any unit. Just make sure both your starting and current weight use the same unit.",
  },
  {
    question: "How often should I calculate weight loss percentage?",
    answer:
      "Once a week is ideal. Daily weighing reflects water and food fluctuations rather than real fat loss, which can be discouraging. A weekly check on the same day, at the same time, and under the same conditions gives the most accurate trend.",
  },
  {
    question: "What is percent weight loss in newborns?",
    answer:
      "Percent weight loss in newborns is a clinical measurement used by pediatricians during the first week of life. Most newborns lose 5% to 7% of birth weight in the first few days, and a loss of more than 10% is considered a medical concern. This calculator is intended for adults — newborn weight loss should always be assessed by a healthcare provider.",
  },
  {
    question: "What weight loss percentage is normal on Ozempic, Wegovy or Mounjaro?",
    answer:
      "On semaglutide (Wegovy) many people lose about 2 to 4% of body weight by month 2, 4 to 6% by month 3, and around 11% by month 6. On tirzepatide (Zepbound or Mounjaro) it tends to run higher, roughly 5 to 8% by month 3 and 10 to 15% by month 6. These are averages that depend on your starting weight, dose, protein and training, so treat them as a gut check rather than a target.",
  },
  {
    question: "Is fast weight loss on a GLP-1 a problem?",
    answer:
      "It can be. Losing faster than about 1% of body weight per week tends to pull more from muscle, and on a GLP-1 up to 40% of the loss can be lean mass if protein and resistance training are low. The percentage on the scale looks great, but keeping muscle is what protects your metabolism and stops rebound after you taper off. If your pace is fast, prioritize protein and lifting.",
  },
]

export default function WeightLossPercentageCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Weight Loss Percentage Calculator"
        description="Free body percent weight loss calculator. Determine weight loss percentage instantly and track your progress toward your goal."
        url="https://calqulate.net/health/weight-loss-percentage-calculator"
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
              Weight Loss Percentage Calculator, <span className="text-emerald-700">Is Your Progress Actually Good?</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              A 10 lb loss means very different things at 150 lbs versus 300 lbs. Answer a few quick questions to get the
              exact percentage of body weight you have lost, how it stacks up against healthy benchmarks, your weekly
              pace, and, if you are on a GLP-1, whether you are dropping fat or muscle.
            </p>

            <p className="mt-5 max-w-3xl border-l-4 border-emerald-500 pl-4 text-base md:text-lg font-semibold text-slate-800">
              Even <span className="text-emerald-700">5% lost is a real health win</span>. Losing faster than about 1% a
              week is where muscle starts to go.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#calculator"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Check my progress ↓
              </a>
              <Link
                href="/product/glp1-progress-tracker"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold px-6 py-3 text-sm font-bold text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)] transition hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" /> Track loss and muscle together
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* USP SUMMARY (TOFU) */}
        <section className="border-b border-emerald-100 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <p className="text-sm md:text-base leading-relaxed text-slate-700">
                Calqulate.net calculates the exact percentage of body weight you&apos;ve lost using simple, precise math. You get your progress, weekly average and a projected goal date to stay motivated.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "%", label: "Lost" },
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

        {/* CALCULATOR (conversational wizard) */}
        <section id="calculator" className="scroll-mt-20 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mx-auto mb-8 max-w-xl text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">How much have you really lost?</h2>
              <p className="mt-2 text-slate-600">
                A few quick taps. No account, no email, your answers never leave your browser.
              </p>
            </div>
            <WeightLossPercentageWizard />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">

            <p className="text-center text-sm font-medium text-gray-500 mt-6 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              Your data is private. We do not store your weight or measurements.
            </p>

            {/* GLP-1 CONTEXT: benchmarks by month + strong anchor to the GLP-1 tool */}
            <section className="mt-12 rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-800 text-white p-8 md:p-10">
              <div className="flex items-center gap-2 mb-4">
                <Syringe className="w-7 h-7 text-emerald-300" />
                <h2 className="text-2xl md:text-3xl font-bold text-white m-0">Weight loss percentage on a GLP-1</h2>
              </div>
              <p className="text-lg text-emerald-50/90 leading-relaxed">
                If you are on Ozempic, Wegovy, Mounjaro or Zepbound, these are the averages people tend to hit. Use them
                as a gut check, not a scoreboard. Your starting weight, dose, protein and training all move the number.
              </p>

              <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/10 border border-white/20 p-5">
                  <p className="text-sm font-bold uppercase tracking-wide text-emerald-200">Semaglutide (Wegovy)</p>
                  <ul className="mt-3 space-y-2 text-emerald-50/90 text-sm">
                    <li className="flex justify-between border-b border-white/10 pb-2"><span>Month 2</span><span className="font-bold">about 2 to 4%</span></li>
                    <li className="flex justify-between border-b border-white/10 pb-2"><span>Month 3</span><span className="font-bold">about 4 to 6%</span></li>
                    <li className="flex justify-between"><span>Month 6</span><span className="font-bold">around 11%</span></li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-white/10 border border-white/20 p-5">
                  <p className="text-sm font-bold uppercase tracking-wide text-emerald-200">Tirzepatide (Zepbound / Mounjaro)</p>
                  <ul className="mt-3 space-y-2 text-emerald-50/90 text-sm">
                    <li className="flex justify-between border-b border-white/10 pb-2"><span>By month 3</span><span className="font-bold">about 5 to 8%</span></li>
                    <li className="flex justify-between border-b border-white/10 pb-2"><span>By month 6</span><span className="font-bold">about 10 to 15%</span></li>
                    <li className="flex justify-between"><span>Note</span><span className="font-bold">more than semaglutide</span></li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white/10 border border-white/20 p-5">
                <p className="text-base font-semibold text-white">
                  A falling percentage is only half the story. Up to 40 percent of GLP-1 weight loss can be muscle if you
                  do not protect it. Check your split with the{" "}
                  <Link
                    href="/health/glp-1-dose-calculator"
                    className="font-bold text-gold-light underline decoration-gold/50 underline-offset-2 hover:decoration-gold-light"
                  >
                    GLP-1 Body Composition Tracker to see if you are losing fat or muscle
                  </Link>
                  , or protect your muscle with the{" "}
                  <Link
                    href="/health/lean-body-mass-calculator"
                    className="font-bold text-gold-light underline decoration-gold/50 underline-offset-2 hover:decoration-gold-light"
                  >
                    lean body mass and muscle retention calculator
                  </Link>
                  .
                </p>
              </div>
            </section>

            <div className="prose prose-gray dark:prose-invert max-w-none mt-16 space-y-16">

              {/* Intro Section: What is Weight Loss Percentage? */}
              <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <h2 className="mb-6 text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-7 h-7 text-green-600" />
                  What is Weight Loss Percentage?
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed">
                  <strong>Weight loss percentage</strong> tells you how much weight you have lost compared to your <span className="bg-green-100 text-green-900 px-1.5 rounded">starting weight</span>. It answers a simple but important question: <em>&quot;What portion of my original body weight have I actually lost?&quot;</em>
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Most people only track raw pounds or kilograms — but a 10 lb loss means very different things for someone who started at 150 lbs versus someone who started at 300 lbs. A <strong>body percent weight loss calculator</strong> normalizes that difference and gives you a metric that doctors, trainers, and clinical research actually use.
                </p>

                <div className="mt-6 p-6 bg-white rounded-xl border border-slate-200 shadow-sm text-center">
                  <span className="text-sm uppercase tracking-wide font-bold text-slate-400 mb-2 block">The Formula</span>
                  <div className="text-xl md:text-2xl font-black text-slate-800 font-mono flex flex-wrap items-center justify-center gap-3">
                    Weight Loss % = <span className="bg-green-100 text-green-900 px-4 py-2 rounded-lg">((Start − Current) ÷ Start) × 100</span>
                  </div>
                </div>
              </section>

              {/* How to Calculate Section */}
              <section>
                <h2 className="mb-6 text-3xl font-bold text-slate-900">
                  How to Calculate Weight Loss Percentage (Step-by-Step)
                </h2>
                <p className="text-lg text-slate-700 mb-6">
                  Figuring percentage of weight loss is straightforward once you know the formula. Here&apos;s a worked example using pounds:
                </p>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs uppercase tracking-wide font-bold text-slate-500 mb-1">Starting Weight</p>
                      <p className="text-2xl font-bold text-slate-900">180 lbs</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs uppercase tracking-wide font-bold text-slate-500 mb-1">Current Weight</p>
                      <p className="text-2xl font-bold text-slate-900">162 lbs</p>
                    </div>
                  </div>

                  <ol className="space-y-3 text-slate-700">
                    <li className="flex gap-3 items-start">
                      <span className="bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</span>
                      <span><strong>Subtract:</strong> 180 − 162 = <span className="bg-green-100 text-green-900 px-1.5 rounded font-semibold">18 lbs lost</span></span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</span>
                      <span><strong>Divide</strong> the loss by your starting weight: 18 ÷ 180 = 0.10</span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</span>
                      <span><strong>Multiply by 100</strong> to convert to a percentage: 0.10 × 100 = <span className="bg-green-100 text-green-900 px-1.5 rounded font-semibold">10%</span></span>
                    </li>
                    <li className="flex gap-3 items-start">
                      <span className="bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0">4</span>
                      <span><strong>Round</strong> to two decimal places for clean tracking.</span>
                    </li>
                  </ol>

                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-900 font-medium">
                    👉 You have lost <strong>10% of your starting body weight</strong> — a clinically meaningful milestone.
                  </div>
                </div>
              </section>

              {/* Problem / Solution Section */}
              <section>
                <h2 className="mb-8 text-3xl font-bold text-slate-900">
                  Why Determine Weight Loss Percentage Instead of Just Pounds?
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 mb-4">
                        <AlertTriangle className="w-6 h-6 text-slate-500" />
                        Most users struggle with:
                      </h3>
                      <ul className="space-y-4">
                        <li className="flex gap-3 text-slate-700 italic">
                          <span className="text-slate-400 font-bold">&ldquo;</span>
                          I lost 8 pounds — is that actually a lot for someone my size?
                        </li>
                        <li className="flex gap-3 text-slate-700 italic">
                          <span className="text-slate-400 font-bold">&ldquo;</span>
                          My friend lost 15 lbs and I lost 10 — who made more progress?
                        </li>
                        <li className="flex gap-3 text-slate-700 italic">
                          <span className="text-slate-400 font-bold">&ldquo;</span>
                          How do I figure out percentage of weight loss correctly?
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-green-100 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-green-900 mb-4">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        How calqulate.net solves this:
                      </h3>
                      <ul className="space-y-3">
                        {[
                          "Instantly calculate weight loss percentage with no math",
                          "Tracks remaining weight to your goal",
                          "Shows weekly average loss when you add dates",
                          "Works in both pounds (USA) and kilograms",
                        ].map((item, i) => (
                          <li key={i} className="flex gap-3 text-slate-700 items-start">
                            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Real User Problems Section */}
              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="mb-6 text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <MessageCircleQuestion className="w-8 h-8 text-green-600" />
                  Real User Dilemmas: When the Percentage Gets Confusing
                </h2>
                <p className="text-lg text-slate-700 mb-8">
                  Even the most accurate <strong>calculate weight loss percentage calculator</strong> can give results that feel confusing if you don&apos;t understand the context. Based on real questions from users, here&apos;s what might be happening with your numbers:
                </p>

                <div className="space-y-8">
                  {/* Plateau */}
                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <Scale className="w-5 h-5 text-green-600" />
                      1. &ldquo;I&apos;ve been dieting for 3 weeks and only lost 1.5%. Is something wrong?&rdquo;
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      Probably not. <strong>0.5% to 1% per week</strong> is the medically recommended sustainable range, and many people lose less in the first few weeks because of water retention, hormonal shifts, or undercounted calories. A 1.5% loss in 3 weeks is right on track.
                    </p>
                    <p className="text-slate-700 mt-2 font-medium">
                      💡 <em>The Fix:</em> Stop weighing daily. Use this lose weight percentage calculator weekly, on the same day, same time, and under the same conditions (e.g., morning, after bathroom, before food).
                    </p>
                  </div>

                  {/* Stalled */}
                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-green-600" />
                      2. &ldquo;I lost 8% in two months but now I&apos;m completely stuck.&rdquo;
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      This is a classic <strong>weight loss plateau</strong>. As you lose weight, your body needs fewer calories to function — so the same diet that produced rapid loss at 200 lbs may produce zero loss at 184 lbs. Your maintenance calories have shifted.
                    </p>
                    <p className="text-slate-700 mt-2 font-medium">
                      💡 <em>The Reality:</em> Recalculate your daily calorie needs at your new weight, add resistance training to preserve muscle, and consider a 1–2 week diet break to reset hormones before resuming a deficit.
                    </p>
                  </div>

                  {/* Rapid Loss */}
                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <Stethoscope className="w-5 h-5 text-green-600" />
                      3. &ldquo;I lost 15% of my body weight in 6 weeks. Should I be proud?&rdquo;
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      Be cautious. Losing more than <strong>1% of body weight per week</strong> for an extended period typically means you are losing significant muscle mass and water — not just fat. This can damage your metabolic rate, weaken your immune system, and almost guarantees rebound weight gain.
                    </p>
                    <p className="text-slate-700 mt-2 font-medium">
                      💡 <em>The Reality:</em> Rapid weight loss is rarely sustainable. If you have lost 15% in 6 weeks without medical supervision, slow down, prioritize protein (0.8–1g per pound of bodyweight), and get bloodwork done.
                    </p>
                  </div>

                  {/* Wrong Starting Weight */}
                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      4. &ldquo;Should I use last week&apos;s weight or my original starting weight?&rdquo;
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      Always use your <strong>true original starting weight</strong> when you determine weight loss percentage. Using last week&apos;s number gives you a misleading short-term snapshot. The whole point of this metric is to measure long-term, total progress against where you began.
                    </p>
                  </div>

                  {/* Newborn */}
                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <Baby className="w-5 h-5 text-green-600" />
                      5. &ldquo;I&apos;m looking up percent weight loss newborn — does this calculator work for babies?&rdquo;
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      <strong>No.</strong> This tool is designed for adults tracking intentional weight loss. <em>Percent weight loss in newborns</em> is a medical assessment used by pediatricians during the first week of life — most newborns lose 5–7% of birth weight, and over 10% requires immediate medical attention.
                    </p>
                    <p className="text-slate-700 mt-2 font-medium">
                      💡 <em>The Fix:</em> If you are tracking a newborn&apos;s weight, please consult your pediatrician or a lactation consultant — never rely on a general calculator for infant care.
                    </p>
                  </div>

                  {/* Body Shaming */}
                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <HeartHandshake className="w-5 h-5 text-green-600" />
                      6. &ldquo;I&apos;m only at 3% loss and people are already discouraging me.&rdquo;
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      Ignore them. A 3% loss is a real, measurable result — and the research is consistent that even <strong>5% sustained weight loss</strong> produces meaningful improvements in blood pressure, blood sugar, and cholesterol. You are closer to a clinically significant milestone than people realize.
                    </p>
                  </div>
                </div>
              </section>

              {/* How to Measure Correctly */}
              <section>
                <h2 className="mb-6 text-3xl font-bold text-slate-900">
                  How to Weigh Yourself Correctly for Accurate Percentages
                </h2>
                <p className="text-slate-700 mb-6 text-lg">
                  Even the best <strong>percentage of fat loss calculator</strong> is only as good as the numbers you feed it. Inconsistent weighing is the #1 reason people get confusing results.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                    <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-4">
                      <Scale className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-green-900 mb-2 text-xl">1. Starting Weight</h3>
                    <ul className="space-y-2 text-green-900 text-sm">
                      <li>• Weigh yourself first thing in the morning, after using the bathroom.</li>
                      <li>• Wear minimal clothing — or none.</li>
                      <li>• Lock that number in. Don&apos;t change it later.</li>
                    </ul>
                  </div>
                  <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                    <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-4">
                      <Target className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-green-900 mb-2 text-xl">2. Current Weight</h3>
                    <ul className="space-y-2 text-green-900 text-sm">
                      <li>• Same time of day, same scale, same conditions.</li>
                      <li>• Weigh weekly, not daily.</li>
                      <li>• Track on the same day each week (e.g., every Monday).</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-green-100 text-green-900 rounded-xl border border-green-200 flex items-center gap-3 font-medium">
                  <span className="text-2xl">📌</span>
                  Tip: Daily weight fluctuations of 2–4 lbs are normal due to water, sodium, and food. Trust the weekly trend, not the daily number.
                </div>
              </section>

              {/* Step by Step Calculator Walkthrough */}
              <section className="bg-slate-900 text-slate-50 p-10 rounded-3xl">
                <h2 className="text-3xl font-bold text-white mb-6">
                  Step-by-Step: How This Weight Loss Percentage Cal Works
                </h2>
                <div className="flex flex-col md:flex-row gap-8 justify-between">
                  <ol className="space-y-4 text-lg font-medium text-slate-300 flex-1">
                    <li className="flex items-center gap-3">
                      <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</span>
                      Enter your starting weight (lbs or kg)
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</span>
                      Enter your current weight in the same unit
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</span>
                      (Optional) Add target weight and start date for richer insights
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">4</span>
                      Click &quot;Calculate Progress&quot;
                    </li>
                  </ol>
                  <div className="flex-1 bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-green-400" /> Instantly get:
                    </h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li className="flex items-center gap-2">✓ Your accurate weight loss percentage</li>
                      <li className="flex items-center gap-2">✓ Total pounds (or kg) lost</li>
                      <li className="flex items-center gap-2">✓ Remaining weight to your goal</li>
                      <li className="flex items-center gap-2">✓ Average weekly loss rate</li>
                      <li className="flex items-center gap-2">✓ Animated progress bar to your target</li>
                    </ul>
                    <p className="mt-4 text-sm text-green-400 italic">
                      👉 More than just a calculator — a complete progress tracker.
                    </p>
                  </div>
                </div>
              </section>

              {/* Healthy Range Standards */}
              <section>
                <h2 className="mb-8 text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <Percent className="w-7 h-7 text-green-600" />
                  Healthy Weight Loss Percentage Benchmarks (USA Standards)
                </h2>
                <p className="text-slate-700 text-lg mb-6">
                  Here&apos;s what U.S. health authorities like the CDC and the National Institutes of Health typically recommend when you calculate the percentage of weight loss per week:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-slate-200">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Weekly Loss Rate</h3>
                      <ul className="space-y-4">
                        <li className="flex justify-between items-center pb-2 border-b">
                          <span className="font-medium text-slate-600">0.5% – 1%</span>
                          <span className="text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">Healthy</span>
                        </li>
                        <li className="flex justify-between items-center pb-2 border-b">
                          <span className="font-medium text-slate-600">1% – 2%</span>
                          <span className="text-slate-700 font-bold bg-slate-100 px-3 py-1 rounded-full text-sm">Aggressive</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="font-medium text-slate-600">Above 2%</span>
                          <span className="text-slate-700 font-bold bg-slate-100 px-3 py-1 rounded-full text-sm">Not Sustainable</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-4">Total Loss Milestones</h3>
                      <ul className="space-y-4">
                        <li className="flex justify-between items-center pb-2 border-b">
                          <span className="font-medium text-slate-600">5% lost</span>
                          <span className="text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">Health Wins Begin</span>
                        </li>
                        <li className="flex justify-between items-center pb-2 border-b">
                          <span className="font-medium text-slate-600">10% lost</span>
                          <span className="text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">Major Milestone</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="font-medium text-slate-600">15%+ lost</span>
                          <span className="text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">Transformative</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* lbs vs kg */}
              <section className="bg-gradient-to-br from-green-50 to-green-100/50 flex flex-col md:flex-row p-8 rounded-3xl border border-green-100 items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-green-950 mb-3">Pounds vs Kilograms — Does It Matter?</h3>
                  <p className="text-green-900 leading-relaxed">
                    Not at all. The percentage of weight loss is <strong>identical</strong> regardless of whether you use lbs or kg — as long as you stay consistent. A 10% loss in pounds is the exact same 10% loss in kilograms.
                  </p>
                  <div className="mt-4 font-mono font-bold text-green-900 bg-white inline-block px-4 py-2 rounded shadow-sm">
                    180 lbs → 162 lbs = 10% &nbsp;|&nbsp; 82 kg → 73.8 kg = 10%
                  </div>
                  <p className="mt-4 font-medium text-green-900">
                    👉 <strong>USA users:</strong> Stick with lbs. Just don&apos;t mix units between starting and current weight, or your math will break.
                  </p>
                </div>
                <div className="hidden md:flex w-24 h-24 bg-green-200 rounded-full items-center justify-center text-green-700 shrink-0">
                  <ListChecks className="w-10 h-10" />
                </div>
              </section>

              {/* Weight Loss vs Fat Loss */}
              <section>
                <h2 className="mb-6 text-3xl font-bold text-slate-900">
                  Weight Loss vs Fat Loss — The Important Difference
                </h2>
                <p className="text-lg text-slate-700 mb-4">
                  This calculator tells you the percentage of <em>total body weight</em> lost — which can include fat, water, glycogen, and even muscle. A true <strong>percentage of fat loss calculator</strong> requires body composition testing (DEXA scan, BodPod, or smart scale).
                </p>
                <p className="text-lg text-slate-700 mb-4">
                  This matters most on a GLP-1, where fast loss can quietly come from muscle. If you are on Ozempic,
                  Wegovy, Mounjaro or Zepbound, run the{" "}
                  <Link href="/health/glp-1-dose-calculator" className="text-emerald-700 hover:underline font-semibold">
                    GLP-1 Body Composition Tracker to find out if you are losing fat or muscle
                  </Link>
                  , then use the{" "}
                  <Link href="/health/lean-body-mass-calculator" className="text-emerald-700 hover:underline font-semibold">
                    lean body mass calculator
                  </Link>{" "}
                  to set a protein target that protects it.
                </p>
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <p className="font-bold text-slate-900 mb-3">For deeper insights, combine your weight loss percentage with:</p>
                  <ul className="space-y-2">
                    {[
                      "Body fat percentage tracking (smart scale or DEXA)",
                      "Tape measurements at waist, hips, chest, and thighs",
                      "Progress photos taken in the same lighting and pose",
                      "Strength gains in the gym (a sign you are preserving muscle)",
                      "How clothes fit — often more honest than the scale",
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-700 items-start">
                        <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Features / Who should use */}
              <section className="py-8 border-t border-slate-100">
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                      What Makes Our Calculator Unique?
                    </h2>
                    <p className="text-slate-600 mb-4">Unlike basic tools, this is built for real human needs:</p>
                    <ul className="space-y-3">
                      {[
                        "Live calculation as you type — no submit needed",
                        "Seamlessly supports both pounds & kilograms",
                        "Tracks remaining weight to your goal automatically",
                        "Shows weekly average loss when you add dates",
                        "Mobile-friendly and loads in milliseconds",
                        "100% private — nothing is stored on our servers",
                      ].map((item, i) => (
                        <li key={i} className="flex gap-3 text-slate-700 items-center font-medium">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
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
                          "Anyone trying to figure out percentage of weight loss",
                          "People on intentional diet or fitness programs",
                          "Post-bariatric surgery patients tracking progress",
                          "Trainers tracking client outcomes",
                          "Anyone wanting more than just &lsquo;pounds lost&rsquo;",
                        ].map((item, i) => (
                          <li key={i} className="p-4 flex items-center gap-3 text-slate-700 hover:bg-green-50/50 transition-colors">
                            <ArrowRight className="w-4 h-4 text-green-600" />
                            <span dangerouslySetInnerHTML={{ __html: item }} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Common Mistakes */}
              <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <h2 className="mb-6 text-3xl font-bold text-slate-900">
                  Common Mistakes When Figuring Percentage of Weight Loss
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-2">❌ Mixing units</p>
                    <p className="text-sm text-slate-600">Don&apos;t put lbs in one field and kg in the other — your math will be way off.</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-2">❌ Updating starting weight</p>
                    <p className="text-sm text-slate-600">Always use your <em>original</em> starting weight, not last month&apos;s. Otherwise you erase your progress.</p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-2">❌ Daily weighing</p>
                    <p className="text-sm text-slate-600">Daily fluctuations are mostly water — they don&apos;t reflect real progress. Weigh weekly.</p>
                  </div>
                </div>
              </section>

              {/* Paid service CTA */}
              <ServiceCTA
                eyebrow="Track results, not just the scale"
                title="Make the weight you lose the weight that stays off"
                body="A percentage is a snapshot. What protects your results is watching your loss and your lean mass on one timeline, keeping protein and training on track, and catching the weeks you drop weight too fast to be all fat. Calqulate Vitals does exactly that, and for GLP-1 users it adds an adaptive titration and rebound-risk view."
                bullets={[
                  "Weight loss and lean mass on one timeline",
                  "Projected goal date from your own pace",
                  "Protein target built from your numbers",
                  "Adaptive titration and rebound-risk view for GLP-1 users",
                ]}
                href="/product/glp1-progress-tracker"
                cta="Start the GLP-1 Progress Tracker"
              />

            </div>

            {/* Author Badge Section */}
            <MedicalReviewerSection />
            

            <RelatedCalculators slug="weight-loss-percentage-calculator" />

            {/* Structured FAQ UI */}
            <div className="mt-12 pt-8 border-t border-slate-100">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <FAQSection faqs={faqs} />
            </div>

            {/* Disclaimer */}
            <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-900">Medical Disclaimer:</strong> This calculator is for informational purposes only and should not replace medical advice. Always consult a qualified healthcare provider before starting any weight loss program — especially if you have underlying health conditions, are pregnant, or are taking medication.
              </p>
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