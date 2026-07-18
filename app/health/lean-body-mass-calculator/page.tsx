import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import LeanBodyMassWizard from "@/components/calculators/lean-body-mass-wizard"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { Card, CardContent } from "@/components/ui/card"
import { ServiceCTA } from "@/components/seo/service-cta"
import { SourcesSection } from "@/components/seo/sources-section"
import { RelatedCalculators } from "@/components/calculators/related-calculators"
import {
  Scale,
  Dumbbell,
  Beef,
  Gauge,
  ShieldCheck,
  ArrowRight,
  Check,
  AlertTriangle,
  Percent,
  HeartPulse,
  Syringe,
  Sparkles,
  FlaskConical,
} from "lucide-react"

const TITLE = "Lean Body Mass & Muscle Retention Calculator, Are You Keeping Your Muscle?"
const DESCRIPTION =
  "Free lean body mass calculator that answers the real question: are you keeping your muscle? Get your LBM from the Boer, James and Hume formulas, a protein target, and a muscle-retention plan. Built for anyone losing weight, including on a GLP-1."

export const metadata: Metadata = {
  title: `${TITLE} | Calqulate.net`,
  description: DESCRIPTION,
  keywords:
    "lean body mass calculator, muscle retention calculator, lbm calculator, calculate lean body mass, lean muscle mass, boer james hume formula, protein for muscle retention, keep muscle while losing weight, muscle loss on glp-1, ozempic muscle loss, lean mass on semaglutide",
  alternates: {
    canonical: "https://calqulate.net/health/lean-body-mass-calculator",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://calqulate.net/health/lean-body-mass-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
}

const faqs = [
  {
    question: "What is lean body mass and why does it matter?",
    answer:
      "Lean body mass is your total body weight minus all of your fat mass. It includes muscle, bone, organs, water and skin, so it represents your metabolically active tissue. It matters because muscle drives your resting calorie burn, protects your strength as you age, and is the single biggest factor in whether you keep weight off after a diet.",
  },
  {
    question: "How much muscle can you lose while losing weight?",
    answer:
      "It depends entirely on how you lose it. In fast or unprotected weight loss, a large share of the loss can come from lean mass rather than fat. This is especially common on a GLP-1 medication, where up to 40 percent of the weight lost can be muscle if protein and resistance training are low. Eating enough protein and lifting protects most of it.",
  },
  {
    question: "How do I keep my muscle while losing fat?",
    answer:
      "Three levers, in order. First, eat enough protein, around 1.6 to 2.2 grams per kilogram of body weight. Second, do resistance training two to three times a week so your body has a reason to hold muscle. Third, keep the pace of loss at or under about 1 percent of body weight per week. The deficit takes the fat off; protein and lifting aim it away from muscle.",
  },
  {
    question: "Which LBM formula is most accurate: Boer, James or Hume?",
    answer:
      "The Boer formula is generally most accurate for average adults, the James formula fits muscular people and athletes better, and the Hume formula is common in clinical and drug-dosing settings. We average all three so you see a realistic range instead of false precision. If you enter a body fat percentage, we use the direct method, which is more accurate.",
  },
  {
    question: "Can you calculate lean body mass without knowing your body fat percentage?",
    answer:
      "Yes. The Boer, James and Hume formulas estimate lean body mass from only your weight, height and sex. If you also know your body fat percentage from a DEXA scan, calipers or a smart scale, adding it makes the estimate more accurate, but it is optional.",
  },
  {
    question: "Is this calculator medical advice?",
    answer:
      "No. This is an educational tool that estimates your lean body mass and points you to the habits that protect it. It does not diagnose anything, set a medication dose, or replace your clinician. Always work with a qualified healthcare provider on your health decisions.",
  },
]

export default function LeanBodyMassCalculatorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="Lean Body Mass & Muscle Retention Calculator"
        description="Free lean body mass calculator using the Boer, James and Hume formulas, with a protein target and a muscle-retention plan for anyone losing weight, including on a GLP-1."
        url="https://calqulate.net/health/lean-body-mass-calculator"
      />
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />

      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="bg-gradient-to-br from-emerald-50 via-white to-lime-50 border-b border-slate-200">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-700 mb-5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Free · Instant · No sign-up required
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-balance leading-tight text-slate-900">
              Lean Body Mass &amp; Muscle Retention Calculator, <span className="text-emerald-700">Are You Keeping Your Muscle?</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              Your lean body mass is the muscle, bone and tissue that keeps your metabolism high and your strength intact.
              Answer a few quick questions to get your number from three validated formulas, a daily protein target, and a
              clear plan to hold onto your muscle while you lose fat.
            </p>

            <p className="mt-5 max-w-3xl border-l-4 border-emerald-500 pl-4 text-base md:text-lg font-semibold text-slate-800">
              Losing weight is easy to measure. <span className="text-emerald-700">Keeping your muscle</span> is the part
              that decides whether the results last.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#calculator"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Check my lean mass ↓
              </a>
              <Link
                href="/product/glp1-progress-tracker"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold px-6 py-3 text-sm font-bold text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)] transition hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" /> Track lean mass over time
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* USP SUMMARY */}
        <section className="border-b border-emerald-100 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <p className="text-sm md:text-base leading-relaxed text-slate-700">
                Most calculators just spit out a number. Calqulate.net averages the Boer, James and Hume formulas, turns
                your lean mass into a real protein target, and shows you how to protect that muscle while losing fat, on a
                GLP-1 or off it.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-4">
            {[
              { value: "3 formulas", label: "Boer · James · Hume" },
              { value: "~30 sec", label: "To your result" },
              { value: "Free", label: "No sign-up" },
              { value: "Private", label: "Nothing saved" },
            ].map((s) => (
              <div key={s.label} className="bg-white p-5 text-center">
                <p className="text-xl md:text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CALCULATOR (conversational wizard) */}
        <section id="calculator" className="scroll-mt-20 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mx-auto mb-8 max-w-xl text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">What is your lean body mass?</h2>
              <p className="mt-2 text-slate-600">
                A few quick taps. No account, no email, your answers never leave your browser.
              </p>
            </div>
            <LeanBodyMassWizard />
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-sm font-medium text-gray-500 mt-6 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Your data is private. We do not store your answers or any personal information.
            </p>

            <div className="prose prose-gray dark:prose-invert max-w-none mt-16 space-y-16">
              {/* What is LBM */}
              <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <h2 className="mb-6 text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-7 h-7 text-emerald-600" />
                  What is lean body mass, really?
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Lean body mass, or LBM, is your total body weight minus all of your fat. It includes your muscle, bone,
                  organs, skin, blood and water, so it represents the metabolically active tissue that actually keeps you
                  running. When people talk about protecting their metabolism, this is the number they mean.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed mt-4">
                  Unlike BMI, which cannot tell muscle from fat, lean body mass shows you the part of your weight worth
                  keeping. Two people can weigh the same and have completely different lean mass, and that difference is
                  what shows up in strength, energy, and how easily the weight stays off.
                </p>
                <div className="mt-6 grid md:grid-cols-2 gap-6 not-prose">
                  <div className="p-4 bg-white rounded-xl border border-rose-100">
                    <h4 className="font-bold text-rose-800 mb-2">Why the scale misleads you</h4>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>Cannot tell muscle from fat</li>
                      <li>Hides muscle loss during a diet</li>
                      <li>Gives no metabolic insight</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-800 mb-2">Why lean mass tells the truth</h4>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>Tracks the tissue that burns calories</li>
                      <li>Shows if you are losing fat or muscle</li>
                      <li>Predicts whether results last</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-4 text-slate-700">
                  To see your fat side of the picture, pair this with the{" "}
                  <Link href="/health/body-fat-calculator" className="text-emerald-700 hover:underline font-medium">
                    Body Fat Calculator
                  </Link>
                  .
                </p>
              </section>

              {/* Muscle retention: why it matters */}
              <section>
                <h2 className="mb-8 text-3xl font-bold text-slate-900">
                  Muscle retention: the number that decides if the weight stays off
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="border-emerald-100 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-900 mb-4">
                        <Check className="w-6 h-6 text-emerald-600" />
                        Signs you are keeping muscle
                      </h3>
                      <ul className="space-y-3">
                        {[
                          "Losing weight but strength is holding or rising",
                          "Hitting a real protein target most days",
                          "Lifting or resistance training 2 to 3 times a week",
                          "Losing at or under about 1 percent of body weight a week",
                          "Energy steady, clothes looser but you still feel solid",
                        ].map((item, i) => (
                          <li key={i} className="flex gap-3 text-slate-700 items-start">
                            <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-rose-100 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-rose-900 mb-4">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                        Signs you are losing muscle
                      </h3>
                      <ul className="space-y-3">
                        {[
                          "Scale dropping fast but you feel weaker or flatter",
                          "Barely eating, protein has fallen off a cliff",
                          "No strength training at all",
                          "Losing more than about 1 percent of body weight a week",
                          "Looking softer or more drawn even as weight drops",
                        ].map((item, i) => (
                          <li key={i} className="flex gap-3 text-slate-700 items-start">
                            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* GLP-1 section with STRONG ANCHOR to the glp1 page */}
              <section className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white p-8 md:p-10 rounded-3xl">
                <div className="flex items-center gap-2 mb-4">
                  <Syringe className="w-7 h-7 text-emerald-300" />
                  <h2 className="text-3xl font-bold text-white m-0">Lean body mass on a GLP-1</h2>
                </div>
                <p className="text-lg text-emerald-50/90 leading-relaxed">
                  GLP-1 medications like semaglutide (Ozempic, Wegovy) and tirzepatide (Mounjaro, Zepbound) are extremely
                  good at taking weight off. The catch is that when weight comes off fast, a big share of it can be lean
                  muscle rather than fat. Research on rapid weight loss suggests that, unprotected, roughly 25 to 40
                  percent of the loss can be lean mass.
                </p>
                <p className="text-lg text-emerald-50/90 leading-relaxed mt-4">
                  That is why your lean body mass matters more than ever on these drugs. Losing muscle slows your
                  metabolism and makes the weight easier to regain the moment you taper off. Enough protein, resistance
                  training, and a steady pace of loss keep most of your muscle where it belongs.
                </p>
                <div className="mt-6 rounded-2xl bg-white/10 border border-white/20 p-5">
                  <p className="text-base font-semibold text-white">
                    Want to know your split right now? Use the{" "}
                    <Link
                      href="/health/glp-1-dose-calculator"
                      className="font-bold text-gold-light underline decoration-gold/50 underline-offset-2 hover:decoration-gold-light"
                    >
                      GLP-1 Body Composition Tracker to find out if you are losing fat or muscle
                    </Link>{" "}
                    on Ozempic, Wegovy, Mounjaro or Zepbound.
                  </p>
                </div>
              </section>

              {/* How to protect / build lean mass */}
              <section>
                <h2 className="mb-6 text-3xl font-bold text-slate-900">
                  How to protect and build your lean body mass
                </h2>
                <p className="text-slate-700 mb-8 text-lg">
                  Whether you are cutting fat or gaining muscle, the levers are the same three, in priority order:
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: <Beef className="w-6 h-6" />,
                      title: "1. Eat enough protein",
                      body: "Aim for 1.6 to 2.2 g per kg of body weight. Protein supplies the amino acids that repair and build lean tissue. Spread it across the day, and never let a low-appetite day drop you to zero.",
                    },
                    {
                      icon: <Dumbbell className="w-6 h-6" />,
                      title: "2. Train with resistance",
                      body: "Lift 2 to 3 times a week to keep muscle in a deficit, or 3 to 5 times to build it. Compound moves like squats, rows and presses with progressive overload do the heavy lifting.",
                    },
                    {
                      icon: <Gauge className="w-6 h-6" />,
                      title: "3. Control your pace",
                      body: "When losing fat, target around 1 percent of body weight a week or less. Faster loss tilts the ratio toward muscle. When building, a small surplus of 200 to 500 kcal is plenty.",
                    },
                  ].map((tip, i) => (
                    <div key={i} className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mb-4">
                        {tip.icon}
                      </div>
                      <h3 className="font-bold text-emerald-900 mb-2 text-lg">{tip.title}</h3>
                      <p className="text-emerald-900/90 text-sm leading-relaxed">{tip.body}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Formulas */}
              <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <h2 className="mb-2 text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <FlaskConical className="w-7 h-7 text-emerald-600" />
                  The formulas behind your number
                </h2>
                <p className="text-lg text-slate-700 mb-8">
                  We average three validated prediction formulas so you get a realistic range instead of false precision.
                  Each was built on a different population, and each uses only your weight, height and sex.
                </p>
                <div className="space-y-4 not-prose">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <h4 className="font-bold text-slate-900 mb-2">Boer formula (best for average adults)</h4>
                    <div className="bg-slate-50 p-3 rounded-lg font-mono text-sm text-slate-700">
                      <p>Men: LBM = 0.407 x weight(kg) + 0.267 x height(cm) - 19.2</p>
                      <p className="mt-1">Women: LBM = 0.252 x weight(kg) + 0.473 x height(cm) - 48.3</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <h4 className="font-bold text-slate-900 mb-2">Hume formula (clinical standard)</h4>
                    <div className="bg-slate-50 p-3 rounded-lg font-mono text-sm text-slate-700">
                      <p>Men: LBM = 0.32810 x weight(kg) + 0.33929 x height(cm) - 29.5336</p>
                      <p className="mt-1">Women: LBM = 0.29569 x weight(kg) + 0.41813 x height(cm) - 43.2933</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <h4 className="font-bold text-slate-900 mb-2">James formula (for muscular builds)</h4>
                    <div className="bg-slate-50 p-3 rounded-lg font-mono text-sm text-slate-700">
                      <p>Men: LBM = 1.1 x weight(kg) - 128 x (weight / height)squared</p>
                      <p className="mt-1">Women: LBM = 1.07 x weight(kg) - 148 x (weight / height)squared</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 pt-2">
                    If you enter a body fat percentage, we switch to the direct method, lean body mass = weight x (1 minus
                    body fat), which is more accurate than any formula.
                  </p>
                </div>
              </section>

              {/* Healthy ranges */}
              <section>
                <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Percent className="w-7 h-7 text-emerald-600" />
                  What is a healthy lean body mass percentage?
                </h2>
                <p className="mb-6 text-lg text-slate-700">
                  Your lean mass as a share of body weight depends on sex, age and training. Use this as a rough guide,
                  not a verdict.
                </p>
                <Card className="not-prose overflow-hidden border-emerald-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[440px]">
                      <thead>
                        <tr className="bg-emerald-600 text-white">
                          <th className="px-6 py-4 text-left font-bold">Group</th>
                          <th className="px-6 py-4 text-left font-bold">Typical lean mass</th>
                          <th className="px-6 py-4 text-left font-bold">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          ["Men 20 to 39", "75 to 85%", "Peak muscle years"],
                          ["Women 20 to 39", "65 to 75%", "Higher essential fat"],
                          ["Men 40 to 59", "70 to 80%", "Natural decline begins"],
                          ["Women 40 to 59", "60 to 70%", "Hormonal shifts"],
                          ["Adults 60+", "Falls about 1% a year", "Without resistance training"],
                          ["Athletes, any age", "80 to 90%", "Elite body composition"],
                        ].map((row, i) => (
                          <tr key={i} className={i % 2 ? "bg-emerald-50/30" : ""}>
                            <td className="px-6 py-4 font-bold text-emerald-700">{row[0]}</td>
                            <td className="px-6 py-4">{row[1]}</td>
                            <td className="px-6 py-4">{row[2]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </section>

              {/* Why muscle matters (aging + rebound) */}
              <section className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-8 rounded-3xl border border-emerald-100">
                <h2 className="text-2xl font-bold text-emerald-950 mb-4 flex items-center gap-2">
                  <HeartPulse className="w-6 h-6 text-emerald-700" />
                  Why lean mass is your insurance policy
                </h2>
                <p className="text-emerald-900 leading-relaxed mb-4">
                  Muscle is metabolically active, so holding onto it keeps your daily calorie burn higher. That makes
                  maintenance far more forgiving after a diet or after you taper off a GLP-1. Someone who lost 30 pounds
                  of mostly fat has a very different metabolism than someone who lost 30 pounds with a big chunk of muscle
                  mixed in.
                </p>
                <p className="text-emerald-900 leading-relaxed">
                  Lean mass also protects you with age. Muscle loss starts around 30 and speeds up after 50, and it is the
                  quiet driver behind lost strength, slower metabolism and frailty later on. Protein and lifting are the
                  only proven ways to hold the line.
                </p>
                <div className="mt-4 font-medium text-emerald-900 bg-white inline-block px-4 py-2 rounded shadow-sm">
                  The people who keep the weight off protected their muscle while they were losing it.
                </div>
              </section>

              {/* Paid service CTA */}
              <ServiceCTA
                eyebrow="Track results, not just the scale"
                title="Keep your muscle where you can see it"
                body="A single lean-mass reading is a snapshot. What protects your results is logging your weight, body composition and protein over time. Calqulate Vitals keeps all of that on one timeline and checks the protein in a real meal for free, with the lean-mass trend and dose-timing views on Premium."
                bullets={[
                  "Log weight and body composition in seconds",
                  "Everything you log on one timeline",
                  "Find out how much protein is really in your meal",
                  "Lean-mass trend over time (Premium)",
                ]}
                href="/signup?next=/dashboard/glp1"
                learnMoreHref="/product/glp1-progress-tracker"
                cta="Start tracking free"
              />

              <RelatedCalculators slug="lean-body-mass-calculator" />

              <SourcesSection
                items={[
                  { label: "Boer P. Estimated lean body mass as an index for normalization of body fluid volumes (1984)", href: "https://pubmed.ncbi.nlm.nih.gov/6496691/" },
                  { label: "Hume R. Prediction of lean body mass from height and weight (1966)", href: "https://pubmed.ncbi.nlm.nih.gov/5929341/" },
                  { label: "NEJM: STEP 1 trial of semaglutide for weight management", href: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183" },
                  { label: "NEJM: SURMOUNT-1 trial of tirzepatide", href: "https://www.nejm.org/doi/full/10.1056/NEJMoa2206038" },
                  { label: "NIH: Sarcopenia and age-related loss of muscle mass", href: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2804956/" },
                ]}
              />
            </div>

            {/* FAQ Section */}
            <div className="mt-12 pt-8 border-t border-slate-100">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
              <FAQSection faqs={faqs} />
            </div>

            {/* Disclaimer */}
            <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-900">Medical Disclaimer:</strong> This tool is for informational purposes
                only and provides an educational estimate, not a body-composition measurement or medical advice. Lean mass
                includes water and can shift with hydration. Always consult a qualified healthcare provider about your
                health decisions, especially if you have underlying conditions.
              </p>
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
