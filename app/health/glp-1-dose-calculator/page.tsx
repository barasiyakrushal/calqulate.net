import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import GLP1DoseCalculator from "@/components/calculators/glp-1-dose-calculator"
import { FreeFeaturesPromo } from "@/components/glp1/marketing/FreeFeaturesPromo"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { Card, CardContent } from "@/components/ui/card"
import { ServiceCTA } from "@/components/seo/service-cta"
import { SourcesSection } from "@/components/seo/sources-section"
import { RelatedCalculators } from "@/components/seo/related-calculators"
import { getAccess } from "@/lib/auth"
import { RelatedCalculators as CatalogRelatedCalculators } from "@/components/calculators/related-calculators"
import { EmbedCodeBox } from "@/components/embed/EmbedCodeBox"
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Calculator,
  ArrowRight,
  Check,
  ClipboardList,
  MessageCircleQuestion,
  Stethoscope,
  HeartHandshake,
  Timer,
  Pill,
  Scale,
  Zap,
  Sparkles,
} from "lucide-react"

export const metadata: Metadata = {
  title: "GLP-1 Dose Calculator | Exact Syringe Units for Semaglutide & Tirzepatide",
  description:
    "Free GLP-1 dose calculator. Get the exact number of units to draw on your insulin syringe for compounded semaglutide and tirzepatide. Simple, accurate, and built for real people.",
  keywords:
    "glp 1 dose calculator, glp-1 dose calculator, semaglutide dose calculator, tirzepatide dose calculator, compounded semaglutide units, insulin syringe units calculator, semaglutide syringe calculator, glp 1 weight loss calculator, ozempic dose calculator, wegovy dose calculator",
  alternates: {
    canonical: "https://calqulate.net/health/glp-1-dose-calculator",
  },
  openGraph: {
    title: "GLP-1 Dose Calculator | Exact Syringe Units for Semaglutide & Tirzepatide",
    description: "Free GLP-1 dose calculator. Get the exact number of units to draw on your insulin syringe for compounded semaglutide and tirzepatide. Simple, accurate, and built for real people.",
    url: "https://calqulate.net/health/glp-1-dose-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GLP-1 Dose Calculator | Exact Syringe Units for Semaglutide & Tirzepatide",
    description: "Free GLP-1 dose calculator. Get the exact number of units to draw on your insulin syringe for compounded semaglutide and tirzepatide. Simple, accurate, and built for real people.",
  },
}

const faqs = [
  {
    question: "Is this calculator only for compounded medications?",
    answer:
      "It works best for compounded semaglutide and tirzepatide, but the principles apply to any GLP-1 medication that comes as a liquid you draw into a syringe. If your medication comes in a pre-filled pen, you do not need this tool.",
  },
  {
    question: "Can I use this for both semaglutide and tirzepatide?",
    answer:
      "Yes. This GLP-1 dose calculator works for any GLP-1 receptor agonist that comes as a liquid vial. Just enter your prescribed dose in milligrams and the concentration listed on your vial label, and the calculator handles the rest.",
  },
  {
    question: "What if my numbers do not match the standard doses?",
    answer:
      "Your doctor may prescribe a custom dose based on how your body responds to the medication. That is completely normal. Always follow your healthcare provider's specific guidance, and use this calculator to convert whatever dose they prescribe into accurate syringe units.",
  },
  {
    question: "What concentration should I enter if it is not on my vial?",
    answer:
      "Always check your vial label or the paperwork from your pharmacy. Common concentrations for compounded semaglutide are 0.5 mg/mL, 1 mg/mL, 2 mg/mL, 2.5 mg/mL, and 5 mg/mL. If you are unsure, call your compounding pharmacy directly before drawing your dose.",
  },
  {
    question: "Why do I need to calculate units instead of just measuring in mg?",
    answer:
      "Standard insulin syringes are marked in units, not milligrams. One unit on a U-100 syringe equals 0.01 mL of liquid. To draw the correct amount, you need to know how many units correspond to your prescribed milligram dose at your vial's specific concentration. This calculator does that conversion instantly.",
  },
  {
    question: "Is this medical advice?",
    answer:
      "No. This is a helpful calculation tool only. It performs the math for converting a prescribed milligram dose into syringe units based on concentration. Your healthcare provider is the one who decides what dose is right for your body and health situation.",
  },
]

export default async function GLP1DoseCalculatorPage() {
  const access = await getAccess();
  const loggedIn = access.userId !== null;
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="GLP-1 Dose Calculator"
        description="Free GLP-1 dose calculator. Get exact syringe units for compounded semaglutide and tirzepatide based on your prescribed dose and vial concentration."
        url="https://calqulate.net/health/glp-1-dose-calculator"
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
              GLP-1 Dose Calculator
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              After more than 20 years studying metabolic health and watching how these medications work in everyday life, one thing stands out above everything else: getting the dose right matters a lot. That is why we built this straightforward tool for you. Just plug in your prescribed dose and the concentration on your vial, and it tells you exactly how many units to draw on a standard U-100 insulin syringe.
            </p>

            <p className="mt-5 max-w-3xl border-l-4 border-emerald-500 pl-4 text-base md:text-lg font-semibold text-slate-800">
              The app that makes sure your GLP-1 weight loss is the <span className="text-emerald-700">right</span> weight loss &mdash; <span className="text-emerald-700">fat, not muscle</span> &mdash; and never loses your data.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#calculator"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Try the Calculator ↓
              </a>
              <a
                href="/product/glp1-progress-tracker"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold px-6 py-3 text-sm font-bold text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)] transition hover:-translate-y-0.5"
              >
                ✦ Try our Premium GLP-1 Tracker
                <span aria-hidden>&rarr;</span>
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
                Calqulate.net calculates exact syringe units for compounded semaglutide or tirzepatide, concentration-aware with a titration schedule. You get precise dosing and built-in safety checks that help avoid errors.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-5">
            {[
              { value: "Titration", label: "Schedule" },
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
            <GLP1DoseCalculator />
          </div>
        </section>

        {/* EMBED THIS CALCULATOR — free-backlink widget */}
        <section className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <EmbedCodeBox />
          </div>
        </section>

        {/* FREE GLP-1 TRACKER PROMO */}
        <FreeFeaturesPromo
          heading="Calculated your dose? Now track it — free"
          sub="Calqulate Vitals logs every shot, reminds you when the next is due, and tracks food, weight and side effects in one place — with medication-level curves other apps charge for."
          loggedIn={loggedIn}
        />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">

            <p className="text-center text-sm font-medium text-gray-500 mt-6 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Your data is private. We do not store your dose or any personal information.
            </p>

            <div className="prose prose-gray dark:prose-invert max-w-none mt-16 space-y-16">

              {/* Why Accurate Dosing Matters */}
              <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <h2 className="mb-6 text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-7 h-7 text-blue-600" />
                  Why Accurate Dosing Actually Matters
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed">
                  GLP-1 medications like the active ingredients in Ozempic, Wegovy, Mounjaro, and Zepbound are powerful
                  tools for managing blood sugar and supporting weight loss. But they are also strong. They work by slowing
                  digestion, reducing appetite, and helping your body handle glucose better.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed mt-4">
                  Start too high or jump doses too fast and you can feel pretty rough with nausea or other side effects.
                  Go too low for too long and you might not see the results you are hoping for. The sweet spot is slow,
                  steady increases that let your body adjust comfortably. That is exactly why proper dosing and clear
                  calculations make such a big difference in how people feel and how well the medication works for them.
                </p>
                <div className="mt-6 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">The Core Formula</p>
                  <div className="text-xl md:text-2xl font-black text-slate-800 font-mono flex flex-wrap items-center justify-center gap-3 text-center">
                    Units to Draw =
                    <span className="bg-blue-100 text-blue-900 px-4 py-2 rounded-lg">
                      (Dose in mg / Concentration in mg/mL) x 100
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 text-center mt-3">
                    This converts your milligram dose into the unit markings on a standard U-100 insulin syringe.
                  </p>
                </div>
              </section>

              {/* Common Medications and Dosing Schedules */}
              <section>
                <h2 className="mb-6 text-3xl font-bold text-slate-900">
                  Common GLP-1 Medications and Typical Dosing Schedules
                </h2>
                <p className="text-lg text-slate-700 mb-8">
                  Here is a simple breakdown of the most common options used in the US. Doctors usually follow these
                  gradual step-up schedules to help your body adapt. Many people also use a glp 1 weight loss calculator
                  alongside these schedules to track how their body is responding at each dose level.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                        <Pill className="w-5 h-5 text-blue-600" />
                        Semaglutide (Wegovy)
                      </h3>
                      <p className="text-sm text-slate-500 mb-4 italic">For weight loss. Most common titration schedule:</p>
                      <ul className="space-y-3">
                        {[
                          { weeks: "Weeks 1 to 4", dose: "0.25 mg once weekly" },
                          { weeks: "Weeks 5 to 8", dose: "0.5 mg once weekly" },
                          { weeks: "Weeks 9 to 12", dose: "1.0 mg once weekly" },
                          { weeks: "Weeks 13 to 16", dose: "1.7 mg once weekly" },
                          { weeks: "Week 17 and beyond", dose: "2.4 mg once weekly (maintenance)" },
                        ].map((item, i) => (
                          <li key={i} className="flex justify-between items-center pb-2 border-b border-slate-100 last:border-0">
                            <span className="text-sm font-medium text-slate-600">{item.weeks}</span>
                            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{item.dose}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-slate-500 mt-4 italic">
                        Ozempic (for type 2 diabetes) starts the same but usually tops out at 0.5 mg, 1 mg, or up to 2 mg
                        depending on your needs.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                        <Pill className="w-5 h-5 text-blue-600" />
                        Tirzepatide (Zepbound / Mounjaro)
                      </h3>
                      <p className="text-sm text-slate-500 mb-4 italic">Step-up schedule increasing every 4 weeks:</p>
                      <ul className="space-y-3">
                        {[
                          { weeks: "Weeks 1 to 4", dose: "2.5 mg once weekly" },
                          { weeks: "Weeks 5 to 8", dose: "5 mg once weekly" },
                          { weeks: "Every 4 weeks after", dose: "7.5 mg / 10 mg / 12.5 mg / 15 mg" },
                        ].map((item, i) => (
                          <li key={i} className="flex justify-between items-center pb-2 border-b border-slate-100 last:border-0">
                            <span className="text-sm font-medium text-slate-600">{item.weeks}</span>
                            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{item.dose}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-900 font-medium">
                          Your doctor may keep you at a certain dose longer if you are doing well or having side effects.
                          That is completely normal and often the smartest move.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* How to Use the Calculator */}
              <section className="bg-slate-900 text-slate-50 p-10 rounded-3xl">
                <h2 className="text-3xl font-bold text-white mb-6">
                  How to Use the GLP-1 Dose Calculator
                </h2>
                <p className="text-slate-300 text-lg mb-8">
                  It is honestly as easy as it gets. Three inputs, one result:
                </p>
                <div className="flex flex-col md:flex-row gap-8 justify-between">
                  <ol className="space-y-4 text-lg font-medium text-slate-300 flex-1">
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">1</span>
                      Enter your prescribed dose in milligrams (mg). This is what your doctor wrote down.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">2</span>
                      Enter the concentration of your medication in mg/mL. You will find this on your vial label.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">3</span>
                      Click calculate. That is all there is to it.
                    </li>
                  </ol>
                  <div className="flex-1 bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-blue-400" /> Instantly get:
                    </h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-blue-400 shrink-0" />
                        Exact units to draw on your U-100 insulin syringe
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-blue-400 shrink-0" />
                        Volume in mL for double verification
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-blue-400 shrink-0" />
                        Clear, easy-to-read result with no confusing math
                      </li>
                    </ul>
                    <p className="mt-4 text-sm text-blue-400 italic">
                      Many people using compounded versions love this because vial strengths can vary. This keeps things
                      precise and safe week after week.
                    </p>
                  </div>
                </div>
              </section>

              {/* Problem / Solution */}
              <section>
                <h2 className="mb-8 text-3xl font-bold text-slate-900">
                  Why So Many People Get the Units Wrong
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 mb-4">
                        <AlertTriangle className="w-6 h-6 text-slate-500" />
                        Most people struggle with:
                      </h3>
                      <ul className="space-y-4">
                        <li className="flex gap-3 text-slate-700 italic">
                          <span className="text-slate-400 font-bold">&ldquo;</span>
                          My vial says 2 mg/mL but my doctor prescribed 0.5 mg. How many units do I draw?
                        </li>
                        <li className="flex gap-3 text-slate-700 italic">
                          <span className="text-slate-400 font-bold">&ldquo;</span>
                          The compounding pharmacy changed the concentration. Do I use the same units as before?
                        </li>
                        <li className="flex gap-3 text-slate-700 italic">
                          <span className="text-slate-400 font-bold">&ldquo;</span>
                          I do not want to do the math wrong and accidentally give myself too much.
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-100 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-blue-900 mb-4">
                        <CheckCircle2 className="w-6 h-6 text-blue-600" />
                        How this calculator solves it:
                      </h3>
                      <ul className="space-y-3">
                        {[
                          "Works for any vial concentration, including custom compounded strengths",
                          "Instantly converts your mg dose to exact U-100 syringe units",
                          "Eliminates mental math errors that could affect your safety",
                          "Recalculate in seconds whenever your vial concentration changes",
                        ].map((item, i) => (
                          <li key={i} className="flex gap-3 text-slate-700 items-start">
                            <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Real User Dilemmas */}
              <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="mb-6 text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <MessageCircleQuestion className="w-8 h-8 text-blue-600" />
                  Real Questions People Ask About GLP-1 Dosing
                </h2>
                <p className="text-lg text-slate-700 mb-8">
                  Based on real questions from people using compounded GLP-1 medications, here are the situations that
                  come up most often and how to handle them:
                </p>

                <div className="space-y-8">

                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <FlaskConical className="w-5 h-5 text-blue-600" />
                      1. &ldquo;My pharmacy changed the concentration on my new vial. Do I use the same units?&rdquo;
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      Absolutely not. The units you draw are directly tied to the concentration. If your vial goes from
                      1 mg/mL to 2 mg/mL, you will draw half as many units for the same milligram dose. This is one of
                      the most common and dangerous mistakes people make with compounded medications.
                    </p>
                    <p className="text-slate-700 mt-2 font-medium">
                      The fix: Every time you get a new vial, check the concentration label and run it through this
                      calculator again. It takes about 10 seconds.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-blue-600" />
                      2. &ldquo;I felt terrible after my injection. Did I take too much?&rdquo;
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      Not necessarily. Nausea, feeling full quickly, and general discomfort are the most common side
                      effects of GLP-1 medications, especially when you first start or increase the dose. These usually
                      ease up as your body gets used to the medication. However, if symptoms are severe or you suspect
                      you drew the wrong units, contact your prescriber or pharmacist right away.
                    </p>
                    <p className="text-slate-700 mt-2 font-medium">
                      What helps: Ginger tea, smaller and more frequent meals, avoiding greasy or heavy foods right
                      after your shot, and walking a bit after eating. Many people find symptoms become very manageable
                      once they settle into the right dose.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <Timer className="w-5 h-5 text-blue-600" />
                      3. &ldquo;I missed my injection day. What do I do?&rdquo;
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      If you remember within a few days of your scheduled dose, you can typically take it and then resume
                      your normal weekly schedule. If it has been longer or you are close to your next scheduled dose,
                      skip the missed one and continue as normal. Always check with your pharmacist or prescriber for
                      the exact rule on your specific medication, since guidelines can differ slightly between semaglutide
                      and tirzepatide.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      4. &ldquo;My doctor increased my dose but I feel like it is too much. Can I stay at my current dose longer?&rdquo;
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      Yes, and this is often the smartest move. The titration schedules listed above are standard starting
                      points, not rigid rules. If you are tolerating your current dose well and feeling good, staying
                      there longer before moving up is a completely valid choice. Talk to your prescriber about staying
                      at the current level for another 4 to 8 weeks.
                    </p>
                    <p className="text-slate-700 mt-2 font-medium">
                      The principle: Go slow when stepping up. Your body thanks you for it. Most side effects are worst
                      during dose increases, so patience really does pay off.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <Scale className="w-5 h-5 text-blue-600" />
                      5. &ldquo;I am on GLP-1 medication but my weight loss has stalled. What is going on?&rdquo;
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      Weight loss plateaus on GLP-1 therapy are real and common. As your body adjusts, appetite
                      suppression can become less noticeable at lower doses. This is often a signal to move to the next
                      dose tier, though your prescriber may also look at other factors like calorie intake, sleep, and
                      stress. Pairing this GLP-1 dose calculator with a dedicated glp 1 weight loss calculator can help
                      you track whether your body is actually responding at each new dose level, so you can have a much
                      more informed conversation with your doctor at your next visit.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      6. &ldquo;How should I store my compounded vial?&rdquo;
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      Most compounded semaglutide and tirzepatide vials should be refrigerated between 36 and 46 degrees
                      Fahrenheit and kept away from light. Check with your specific compounding pharmacy for their
                      instructions, as formulations can vary. Never use a vial that has been frozen, looks cloudy when
                      it should be clear, or has visible particles floating in it.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                      <HeartHandshake className="w-5 h-5 text-blue-600" />
                      7. &ldquo;People in my online group seem to be losing weight faster than me. Should I increase my dose?&rdquo;
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      Please do not let comparison drive your dosing decisions. GLP-1 response is deeply individual.
                      Genetics, gut microbiome, baseline metabolic rate, sleep quality, stress levels, and other
                      medications all affect how fast you respond. Someone losing 3 lbs per week on the same dose
                      you are using is not evidence that you need more medication. It is evidence that bodies are different.
                    </p>
                    <p className="text-slate-700 mt-2 font-medium">
                      The better question: Are you tolerating the medication well and seeing any positive changes at all?
                      If yes, stay the course. Dose decisions belong with your prescriber, not your online group.
                    </p>
                  </div>

                </div>
              </section>

              {/* Practical Tips */}
              <section>
                <h2 className="mb-6 text-3xl font-bold text-slate-900">
                  Practical Tips Learned Over 20 Years in Metabolic Health
                </h2>
                <p className="text-slate-700 mb-6 text-lg">
                  These are the things that actually make a difference in how people feel and how well the medication
                  works for them. None of them are complicated, but each one matters more than most people realize.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: <Timer className="w-6 h-6" />,
                      title: "Inject on the same day each week",
                      body: "Consistency helps keep steady medication levels in your system. Pick a day that works for your schedule and stick to it every week without exception.",
                    },
                    {
                      icon: <Activity className="w-6 h-6" />,
                      title: "Focus on protein with your meals",
                      body: "Protein helps reduce nausea and supports muscle while you are losing fat. Aim for a protein source at every meal, even if your portions are smaller than they used to be.",
                    },
                    {
                      icon: <FlaskConical className="w-6 h-6" />,
                      title: "Stay well hydrated throughout the day",
                      body: "It makes a surprising difference in how you feel overall, especially in the first few weeks. Aim for water spread throughout the day rather than large amounts all at once.",
                    },
                    {
                      icon: <ClipboardList className="w-6 h-6" />,
                      title: "Rotate your injection sites",
                      body: "Common injection sites include the abdomen, outer thigh, and upper arm. Rotating between them helps prevent tissue buildup and keeps absorption consistent over time.",
                    },
                  ].map((tip, i) => (
                    <div key={i} className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                      <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-4">
                        {tip.icon}
                      </div>
                      <h3 className="font-bold text-blue-900 mb-2 text-lg">{tip.title}</h3>
                      <p className="text-blue-900 text-sm leading-relaxed">{tip.body}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Managing Side Effects */}
              <section className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-8 rounded-3xl border border-blue-100">
                <h2 className="text-2xl font-bold text-blue-950 mb-4">Managing Side Effects the Natural Way</h2>
                <p className="text-blue-900 leading-relaxed mb-4">
                  The most common side effects are nausea, feeling full quickly, constipation, or occasional digestive
                  discomfort, especially when you first start or increase the dose. These usually ease up quite a bit
                  as your body gets used to the medication.
                </p>
                <p className="text-blue-900 leading-relaxed">
                  Simple things that help a lot: ginger tea, smaller and more frequent meals, avoiding greasy or heavy
                  foods right after your shot, and walking a bit after eating. Many people find symptoms become very
                  manageable once they settle into their right dose and stop increasing it every few weeks.
                </p>
                <div className="mt-4 font-medium text-blue-900 bg-white inline-block px-4 py-2 rounded shadow-sm">
                  Most side effects peak in the first 2 to 4 weeks at each new dose level, then fade significantly.
                </div>
              </section>

              {/* Features and Who Should Use */}
              <section className="py-8 border-t border-slate-100">
                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                      What Makes This Calculator Different
                    </h2>
                    <p className="text-slate-600 mb-4">Built specifically for people using compounded GLP-1 medications:</p>
                    <ul className="space-y-3">
                      {[
                        "Works for any vial concentration, not just standard strengths",
                        "Gives you units AND mL for double verification",
                        "No signup, no email, no personal data collected",
                        "Instant results with no page reload needed",
                        "Mobile-friendly and loads in milliseconds",
                        "100% private. Nothing is stored anywhere.",
                      ].map((item, i) => (
                        <li key={i} className="flex gap-3 text-slate-700 items-center font-medium">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                      Who This Tool Is For
                    </h2>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <ul className="divide-y divide-slate-100">
                        {[
                          "People using compounded semaglutide or tirzepatide",
                          "Anyone whose vial concentration changed recently",
                          "Patients new to self-injection who want to feel confident",
                          "Anyone stepping up to a new dose and recalculating",
                          "Caregivers helping a family member with their injections",
                        ].map((item, i) => (
                          <li
                            key={i}
                            className="p-4 flex items-center gap-3 text-slate-700 hover:bg-blue-50/50 transition-colors"
                          >
                            <ArrowRight className="w-4 h-4 text-blue-600" />
                            <span>{item}</span>
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
                  Common Mistakes When Drawing Your GLP-1 Dose
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-2">Using last vial&apos;s units on a new vial</p>
                    <p className="text-sm text-slate-600">
                      Always check the concentration of your new vial. A different strength means different units, even
                      for the exact same milligram dose. Never assume it is the same as before.
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-2">Guessing instead of calculating</p>
                    <p className="text-sm text-slate-600">
                      Eyeballing the syringe or estimating units is not safe with medications this potent. The math
                      takes 10 seconds. Run the numbers every single time you draw a dose.
                    </p>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-2">Confusing mg and mL</p>
                    <p className="text-sm text-slate-600">
                      Milligrams is the dose your doctor prescribed. Milliliters is the volume in the syringe.
                      Concentration in mg/mL is what connects the two. This calculator handles all of it automatically.
                    </p>
                  </div>
                </div>
              </section>

              {/* Paid service CTA */}
              <ServiceCTA
                eyebrow="Track results, not just the scale"
                title="On a GLP-1? Prove it's working at the level that matters"
                body="A dose schedule gets you started. What protects your results is losing fat without losing muscle, and watching your risk fall, not just the number on the scale. Calqulate Vitals tracks lean mass, builds an adaptive titration and protein plan, and flags when you're dropping weight too fast."
                bullets={[
                  "Adaptive titration that holds when side-effects spike",
                  "Protein target and training to protect muscle",
                  "Heart and diabetes risk trended over time",
                  "Rebound-risk view for when you taper off",
                ]}
                href="/product/glp1-progress-tracker"
                cta="Start the GLP-1 Progress Tracker"
              />

              {/* In-depth, practical guide */}
              <section className="prose prose-slate max-w-none mt-12">
                <h2 className="text-2xl font-bold text-slate-900">How GLP-1 dosing actually works</h2>
                <p className="text-slate-600 leading-relaxed">
                  GLP-1 medications start low and step up on a fixed schedule. The point of starting low is tolerance, not
                  results. Your gut needs time to adjust, so the early doses exist to reduce nausea and let you stay on the
                  drug long enough to benefit. Semaglutide and tirzepatide each follow their own ladder, and the steps are
                  usually four weeks apart when you are handling the current dose well.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Side-effects change that timeline. If nausea, reflux or fatigue get rough, holding the current dose for an
                  extra few weeks is normal and often smarter than pushing higher. The goal is the lowest dose that keeps
                  appetite in check, not the highest dose on the label. This calculator maps the standard schedule so you
                  can see where you are and what the next step looks like.
                </p>

                <h3 className="text-xl font-bold text-slate-900 mt-6">The mistake most people make</h3>
                <p className="text-slate-600 leading-relaxed">
                  Watching only the scale hides the real risk, which is muscle loss. When weight comes off fast, a chunk of
                  it can be lean tissue, especially if protein is low and you are not lifting. Lose too much muscle and your
                  metabolism slows, which makes the weight easier to regain once you taper off. Two changes prevent most of
                  this: eat enough protein, around 1.6 grams per kilogram of your goal weight, and do resistance training
                  two or three times a week.
                </p>

                <h3 className="text-xl font-bold text-slate-900 mt-6">What this calculator does and does not do</h3>
                <p className="text-slate-600 leading-relaxed">
                  This tool estimates a typical titration schedule and injection units from public prescribing information.
                  It is educational. It does not set your dose, account for your full medical history, or replace your
                  prescriber. Compounded products can differ in concentration, so always confirm units against your own vial
                  and your clinician's instructions before you draw anything.
                </p>
              </section>

              <RelatedCalculators
                items={[
                  { label: "Lean Body Mass Calculator", href: "/health/lean-body-mass-calculator" },
                  { label: "Body Fat Calculator", href: "/health/body-fat-calculator" },
                  { label: "Macro Calculator", href: "/health/macro-calculator" },
                  { label: "Calorie Deficit Calculator", href: "/health/calorie-deficit-calculator" },
                  { label: "Diabetes Risk Calculator", href: "/health/diabetes-risk-calculator" },
                  { label: "GLP-1 Progress Tracker (paid)", href: "/product/glp1-progress-tracker" },
                ]}
              />

              <SourcesSection
                items={[
                  { label: "FDA prescribing information: Wegovy (semaglutide)", href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/215256s000lbl.pdf" },
                  { label: "FDA prescribing information: Zepbound (tirzepatide)", href: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/217806s000lbl.pdf" },
                  { label: "NEJM: STEP 1 trial of semaglutide for weight management", href: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183" },
                  { label: "NEJM: SURMOUNT-1 trial of tirzepatide", href: "https://www.nejm.org/doi/full/10.1056/NEJMoa2206038" },
                  { label: "NIDDK (NIH): Prescription medications to treat overweight and obesity", href: "https://www.niddk.nih.gov/health-information/weight-management/prescription-medications-treat-overweight-obesity" },
                ]}
              />

            </div>

            <CatalogRelatedCalculators slug="glp-1-dose-calculator" />

            {/* FAQ Section */}
            <div className="mt-12 pt-8 border-t border-slate-100">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                Frequently Asked Questions
              </h2>
              <FAQSection faqs={faqs} />
            </div>

            {/* Disclaimer */}
            <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-900">Medical Disclaimer:</strong> This calculator is for informational
                purposes only and should not replace medical advice. Always consult a qualified healthcare provider
                before adjusting your GLP-1 dose, especially if you have underlying health conditions or are taking
                other medications.
              </p>
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