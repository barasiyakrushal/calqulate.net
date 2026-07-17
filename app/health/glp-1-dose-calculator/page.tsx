import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import GLP1BodyCompositionWizard from "@/components/calculators/glp1-body-composition-wizard"
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
  Dumbbell,
  Beef,
  Scale,
  ShieldCheck,
  ArrowRight,
  Check,
  AlertTriangle,
  Pill,
  Gauge,
  HeartPulse,
  Sparkles,
} from "lucide-react"

const TITLE = "GLP-1 Body Composition Tracker, Are You Losing Fat or Muscle?"
const DESCRIPTION =
  "Free GLP-1 body composition tool. Answer a few quick questions and get an instant estimate of how much of your Ozempic, Wegovy, Mounjaro or Zepbound weight loss is fat vs. muscle — plus the fixes to protect your lean mass."

export const metadata: Metadata = {
  title: `${TITLE} | Calqulate.net`,
  description: DESCRIPTION,
  keywords:
    "glp-1 body composition, fat vs muscle loss glp-1, are you losing muscle on ozempic, ozempic muscle loss, semaglutide muscle loss, tirzepatide muscle loss, glp-1 lean mass tracker, muscle loss calculator ozempic, wegovy muscle loss, zepbound body composition, glp 1 dose calculator, muscle loss on glp-1",
  alternates: {
    canonical: "https://calqulate.net/health/glp-1-dose-calculator",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://calqulate.net/health/glp-1-dose-calculator",
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
    question: "How much muscle do you actually lose on a GLP-1?",
    answer:
      "Research on rapid weight loss suggests that when you're not actively protecting it, roughly 25 to 40 percent of the weight you lose on a GLP-1 like semaglutide or tirzepatide can come from lean muscle rather than fat. The exact share depends heavily on how fast you're losing, whether you're eating enough protein, and whether you're doing resistance training. This tool estimates your personal split from those factors.",
  },
  {
    question: "How do I know if I'm losing fat or muscle on Ozempic?",
    answer:
      "The scale can't tell you on its own. The warning signs of muscle loss are the number dropping while you feel weaker, flatter, more tired, or 'skinny-fat' — smaller but softer. Losing faster than about 1 percent of your body weight per week, low protein intake, and no strength training all tilt the loss toward muscle. This calculator combines those signals into an estimate so you're not guessing.",
  },
  {
    question: "Does this tool actually measure my body fat?",
    answer:
      "No. It's an educational estimate, not a DEXA scan or body-composition measurement. It infers a likely fat-versus-muscle split from your rate of loss, protein intake, and training habits, based on published research. For a precise reading you'd need a DEXA or bioimpedance scan. The point of this tool is to flag whether you're at risk, quickly and for free, so you can act before it becomes a problem.",
  },
  {
    question: "How do I protect muscle while losing weight on a GLP-1?",
    answer:
      "Three levers, in order: eat enough protein (around 1.6 g per kg of your goal body weight — the hardest thing to hit when a GLP-1 kills your appetite), do resistance training two to three times a week so your body has a reason to keep muscle, and don't lose faster than roughly 1 percent of body weight per week. The drug creates the calorie deficit automatically; your job is to aim that deficit at fat.",
  },
  {
    question: "Why does losing muscle matter if the scale is going down?",
    answer:
      "Muscle is metabolically active tissue, so losing it lowers your resting calorie burn — which makes weight easier to regain once you taper off the medication. Muscle loss is also what leaves people 'skinny-fat' and contributes to the hollowed 'Ozempic face' look. Keeping your muscle is the single biggest predictor of whether you hold your results after stopping the drug.",
  },
  {
    question: "Is this medical advice?",
    answer:
      "No. This is an educational tool that estimates your fat-versus-muscle split and points you to the levers that protect lean mass. It does not set your dose, diagnose anything, or replace your prescriber. Always follow your healthcare provider's guidance on dosing and health decisions.",
  },
]

export default async function GLP1BodyCompositionPage() {
  const access = await getAccess()
  const loggedIn = access.userId !== null
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="GLP-1 Body Composition Tracker"
        description="Free GLP-1 body composition tool that estimates how much of your semaglutide or tirzepatide weight loss is fat vs. muscle, and how to protect your lean mass."
        url="https://calqulate.net/health/glp-1-dose-calculator"
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
              GLP-1 Body Composition Tracker, <span className="text-emerald-700">Are You Losing Fat or Muscle?</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl text-pretty">
              The scale can't tell you the one thing that decides whether you keep the weight off: how much of your loss
              is fat versus muscle. Answer a few quick questions and get an instant, personal estimate. plus the exact
              fixes to protect your lean mass on Ozempic, Wegovy, Mounjaro or Zepbound.
            </p>

            <p className="mt-5 max-w-3xl border-l-4 border-emerald-500 pl-4 text-base md:text-lg font-semibold text-slate-800">
              Up to <span className="text-emerald-700">40% of GLP-1 weight loss can be muscle</span> if you don't protect
              it, and muscle is what keeps the weight off after you stop.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#calculator"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Check my fat vs. muscle ↓
              </a>
              <Link
                href="/product/glp1-progress-tracker"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold px-6 py-3 text-sm font-bold text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)] transition hover:-translate-y-0.5"
              >
                <Sparkles className="h-4 w-4" /> Track it over time, GLP-1 Progress Tracker
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
                Most GLP-1 trackers just log pounds. Calqulate.net estimates whether those pounds are fat or muscle,
                flags when you're losing too fast, and shows you the two changes that protect your metabolism, so the
                weight you lose is the weight that stays off.
              </p>
            </div>
          </div>
        </section>

        {/* STATS DASHBOARD */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-4">
            {[
              { value: "Fat vs. muscle", label: "What you learn" },
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

        {/* CALCULATOR (the conversational wizard) */}
        <section id="calculator" className="scroll-mt-20 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mx-auto mb-8 max-w-xl text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Are you losing fat or muscle?</h2>
              <p className="mt-2 text-slate-600">
                A few quick taps. No account, no email, your answers never leave your browser.
              </p>
            </div>
            <GLP1BodyCompositionWizard />
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
          heading="Got your estimate? Now watch it over time — free"
          sub="Calqulate Vitals logs every shot and weigh-in, trends your lean mass (not just weight), and flags the week you start dropping weight too fast to be all fat — with medication-level curves other apps charge for."
          loggedIn={loggedIn}
        />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-sm font-medium text-gray-500 mt-6 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Your data is private. We do not store your answers or any personal information.
            </p>

            <div className="prose prose-gray dark:prose-invert max-w-none mt-16 space-y-16">
              {/* Pillar section: how much is muscle */}
              <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <h2 className="mb-6 text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <Scale className="w-7 h-7 text-emerald-600" />
                  How much of your GLP-1 weight loss is actually muscle?
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed">
                  This is the quiet fear in every GLP-1 forum, and it's a legitimate one. GLP-1 medications like
                  semaglutide (Ozempic, Wegovy) and tirzepatide (Mounjaro, Zepbound) are extremely good at one thing:
                  taking weight off. But when weight comes off fast, a meaningful share of it can be lean muscle rather
                  than fat — especially when appetite suppression has cratered your protein intake and you're not doing
                  any resistance training.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed mt-4">
                  Studies of rapid weight loss suggest that, unprotected, roughly <strong>25 to 40 percent</strong> of
                  the weight lost can be lean mass. That's the number this tool is built around — because losing muscle
                  is exactly what leaves people smaller but softer, slows the metabolism, and makes the weight easier to
                  regain the moment they taper off the drug.
                </p>
                <div className="mt-6 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">The one thing to remember</p>
                  <p className="text-lg md:text-xl font-bold text-slate-800 text-center">
                    A lower number on the scale isn't the goal. <span className="text-emerald-700">Less fat while
                    keeping muscle</span> is the goal.
                  </p>
                </div>
              </section>

              {/* Signs: fat vs muscle */}
              <section>
                <h2 className="mb-8 text-3xl font-bold text-slate-900">
                  Fat loss vs. muscle loss: how to actually tell the difference
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="border-emerald-100 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-900 mb-4">
                        <Check className="w-6 h-6 text-emerald-600" />
                        Signs it's mostly fat (good)
                      </h3>
                      <ul className="space-y-3">
                        {[
                          "Clothes fit looser but you still feel strong",
                          "Losing at or under ~1% of body weight per week",
                          "Hitting a real protein target most days",
                          "Lifting or doing resistance work 2–3× a week",
                          "Energy and strength holding steady",
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
                        Warning signs of muscle loss
                      </h3>
                      <ul className="space-y-3">
                        {[
                          "Scale dropping fast but you feel weaker or flatter",
                          "Losing more than ~1% of body weight per week",
                          "Barely eating — protein has fallen off a cliff",
                          "No strength training at all",
                          '"Skinny-fat" look, hollowing face, low energy',
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

              {/* How the tool estimates */}
              <section className="bg-slate-900 text-slate-50 p-10 rounded-3xl">
                <h2 className="text-3xl font-bold text-white mb-6">How this tool estimates your split</h2>
                <p className="text-slate-300 text-lg mb-8">
                  We don't scan your body — we read the signals that research links to muscle loss, and combine them
                  into a personal estimate. Three of your answers do the heavy lifting:
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: <Gauge className="w-6 h-6 text-emerald-400" />,
                      title: "Your rate of loss",
                      body: "From your start weight, current weight and weeks on the drug. Faster than ~1%/week tilts the loss toward muscle.",
                    },
                    {
                      icon: <Beef className="w-6 h-6 text-emerald-400" />,
                      title: "Your protein intake",
                      body: "The single easiest thing to under-eat on a GLP-1. Low protein pushes the estimate toward more muscle loss.",
                    },
                    {
                      icon: <Dumbbell className="w-6 h-6 text-emerald-400" />,
                      title: "Your resistance training",
                      body: "Lifting is the signal that tells your body to hold muscle in a deficit. No training raises your risk.",
                    },
                  ].map((c, i) => (
                    <div key={i} className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                      <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                        {c.icon}
                      </div>
                      <h3 className="text-white font-bold mb-2">{c.title}</h3>
                      <p className="text-slate-300 text-sm leading-relaxed">{c.body}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm text-slate-400 italic">
                  This is an educational estimate, not a DEXA scan. For a precise reading, a DEXA or bioimpedance scan is
                  the gold standard — but this flags your risk in seconds, for free.
                </p>
              </section>

              {/* How to protect muscle */}
              <section>
                <h2 className="mb-6 text-3xl font-bold text-slate-900">
                  How to protect muscle while losing fat on a GLP-1
                </h2>
                <p className="text-slate-700 mb-8 text-lg">
                  The drug creates the calorie deficit for you. Your only job is to aim that deficit at fat. Three
                  levers, in priority order:
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: <Beef className="w-6 h-6" />,
                      title: "1. Eat enough protein",
                      body: "Aim for ~1.6 g per kg of your goal body weight. Treat protein as the one macro you never skip, even on low-appetite days. Shakes, Greek yogurt and lean meat make it easier.",
                    },
                    {
                      icon: <Dumbbell className="w-6 h-6" />,
                      title: "2. Lift 2–3× a week",
                      body: "Resistance training is the signal that tells your body to keep muscle while it's shedding fat. It doesn't need to be elaborate — basic compound lifts or bands at home work.",
                    },
                    {
                      icon: <Gauge className="w-6 h-6" />,
                      title: "3. Don't lose too fast",
                      body: "Target around 1% of body weight per week or less. Faster loss tilts the ratio toward muscle. If you're dropping quicker, it's worth talking to your prescriber about your pace.",
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

              {/* Titration reference — dose still matters */}
              <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                <h2 className="mb-2 text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <Pill className="w-7 h-7 text-emerald-600" />
                  Your dose still matters too
                </h2>
                <p className="text-lg text-slate-700 mb-8">
                  Body composition is the outcome; your titration is one of the inputs. Here are the standard step-up
                  ladders doctors follow — a general reference, not a prescription. Slower, well-tolerated increases give
                  your body time to adjust and make it easier to keep protein and training consistent.
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                        <Pill className="w-5 h-5 text-emerald-600" /> Semaglutide (Wegovy)
                      </h3>
                      <ul className="space-y-3">
                        {[
                          { weeks: "Weeks 1–4", dose: "0.25 mg weekly" },
                          { weeks: "Weeks 5–8", dose: "0.5 mg weekly" },
                          { weeks: "Weeks 9–12", dose: "1.0 mg weekly" },
                          { weeks: "Weeks 13–16", dose: "1.7 mg weekly" },
                          { weeks: "Week 17+", dose: "2.4 mg weekly (maintenance)" },
                        ].map((item, i) => (
                          <li key={i} className="flex justify-between items-center pb-2 border-b border-slate-100 last:border-0">
                            <span className="text-sm font-medium text-slate-600">{item.weeks}</span>
                            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">{item.dose}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                        <Pill className="w-5 h-5 text-emerald-600" /> Tirzepatide (Zepbound / Mounjaro)
                      </h3>
                      <ul className="space-y-3">
                        {[
                          { weeks: "Weeks 1–4", dose: "2.5 mg weekly" },
                          { weeks: "Weeks 5–8", dose: "5 mg weekly" },
                          { weeks: "Every 4 weeks after", dose: "7.5 / 10 / 12.5 / 15 mg" },
                        ].map((item, i) => (
                          <li key={i} className="flex justify-between items-center pb-2 border-b border-slate-100 last:border-0">
                            <span className="text-sm font-medium text-slate-600">{item.weeks}</span>
                            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">{item.dose}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <p className="text-sm text-emerald-900 font-medium">
                          Your prescriber may hold you at a dose longer if you're doing well or having side effects.
                          That's completely normal and often the smartest move.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Why muscle matters after you stop */}
              <section className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-8 rounded-3xl border border-emerald-100">
                <h2 className="text-2xl font-bold text-emerald-950 mb-4 flex items-center gap-2">
                  <HeartPulse className="w-6 h-6 text-emerald-700" />
                  Why muscle is your insurance for keeping the weight off
                </h2>
                <p className="text-emerald-900 leading-relaxed mb-4">
                  Muscle is metabolically active tissue — holding onto it keeps your daily calorie burn higher, which
                  makes maintenance after you stop the drug far more forgiving. Someone who lost 30 lbs of mostly fat
                  with their muscle intact has a completely different post-GLP-1 metabolism than someone who lost 30 lbs
                  with a big chunk of muscle in there.
                </p>
                <p className="text-emerald-900 leading-relaxed">
                  It's also the difference behind "Ozempic face" and the skinny-fat look: less muscle and less fat under
                  the skin means less structure holding everything up. Protecting lean mass on the way down is the single
                  biggest predictor of whether your results last.
                </p>
                <div className="mt-4 font-medium text-emerald-900 bg-white inline-block px-4 py-2 rounded shadow-sm">
                  The people who keep the most weight off protected their muscle while they were losing it.
                </div>
              </section>

              {/* Paid service CTA */}
              <ServiceCTA
                eyebrow="Track results, not just the scale"
                title="On a GLP-1? Prove it's working at the level that matters"
                body="This snapshot is one moment in time. What protects your results is watching lean mass over time, keeping protein and training on track, and catching the weeks you drop weight too fast. Calqulate Vitals tracks fat vs. muscle, builds an adaptive titration and protein plan, and flags rebound risk before you taper off."
                bullets={[
                  "Log every dose, weight and symptom in seconds",
                  "See how much medication is still working today",
                  "Know if you are on track against the clinical trials",
                  "Lean-mass trend and dose timing (Premium)",
                ]}
                href="/signup?next=/dashboard/glp1"
                learnMoreHref="/product/glp1-progress-tracker"
                cta="Start the GLP-1 Progress Tracker"
              />

              <RelatedCalculators
                items={[
                  { label: "Lean Body Mass Calculator", href: "/health/lean-body-mass-calculator" },
                  { label: "Body Fat Calculator", href: "/health/body-fat-calculator" },
                  { label: "Macro Calculator", href: "/health/macro-calculator" },
                  { label: "TDEE Calculator", href: "/health/tdee-calculator" },
                  { label: "Weight Loss % Calculator", href: "/health/weight-loss-percentage-calculator" },
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
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
              <FAQSection faqs={faqs} />
            </div>

            {/* Disclaimer */}
            <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-900">Medical Disclaimer:</strong> This tool is for informational purposes
                only and provides an educational estimate, not a body-composition measurement or medical advice. Always
                consult a qualified healthcare provider before adjusting your GLP-1 dose or making health decisions,
                especially if you have underlying conditions or take other medications.
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
