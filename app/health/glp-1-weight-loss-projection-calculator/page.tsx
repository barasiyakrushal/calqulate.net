import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Glp1WeightLossProjectionCalculator from "@/components/calculators/glp1-weight-loss-projection-calculator";
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data";
import { FAQSection } from "@/components/seo/faq-section";
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section";
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema";
import { EFFICACY_REFERENCES } from "@/lib/glp1/efficacy";
import { formatCitation } from "@/lib/citations";
import { TrendingDown, ArrowRight, Sparkles, Scale, Info } from "lucide-react";

const TITLE = "GLP-1 Weight Loss Projection Calculator: How Much Will I Lose?";
const DESCRIPTION =
  "Estimate how much weight you could lose on semaglutide (Wegovy) or tirzepatide (Zepbound) based on the actual STEP 1 and SURMOUNT-1 trial results. Free, instant, no sign-up — enter your weight and dose.";

export const metadata: Metadata = {
  title: `${TITLE} | Calqulate.net`,
  description: DESCRIPTION,
  keywords:
    "glp-1 weight loss calculator, how much weight will i lose on ozempic, semaglutide weight loss calculator, tirzepatide weight loss calculator, wegovy weight loss projection, zepbound weight loss estimate, how much will i lose on mounjaro, glp-1 weight loss predictor",
  alternates: {
    canonical: "https://calqulate.net/health/glp-1-weight-loss-projection-calculator",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://calqulate.net/health/glp-1-weight-loss-projection-calculator",
    siteName: "Calqulate",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const faqs = [
  {
    question: "How much weight will I lose on a GLP-1?",
    answer:
      "In the pivotal trials, adults without diabetes lost an average of about 14.9% of body weight on semaglutide 2.4 mg (STEP 1, 68 weeks) and about 15%, 19.5%, and 20.9% on tirzepatide 5 mg, 10 mg, and 15 mg (SURMOUNT-1, 72 weeks). These are averages over more than a year at the top dose — your result depends on your dose, adherence, protein intake, and activity.",
  },
  {
    question: "Is this calculator a guarantee of my results?",
    answer:
      "No. It applies published trial averages to your starting weight to give a realistic target and range. Real-world results are usually a little lower than trial results because trials support adherence closely, and individual response varies widely.",
  },
  {
    question: "Why does the calculator show a range instead of one number?",
    answer:
      "Because trial participants at the same dose had very different outcomes — some lost far more than average, some less. The 'modest' and 'strong responder' band reflects that real spread so you're not anchored to a single optimistic number.",
  },
  {
    question: "Which loses more weight, tirzepatide or semaglutide?",
    answer:
      "On average, tirzepatide (Zepbound/Mounjaro) produces more weight loss than semaglutide (Wegovy/Ozempic) at the top doses. But the best medication is the one you can access, afford, tolerate, and stay on. See our tirzepatide vs semaglutide comparison for the full picture.",
  },
];

export default function Glp1WeightLossProjectionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="GLP-1 Weight Loss Projection Calculator"
        description="Estimate weight loss on semaglutide or tirzepatide from published clinical-trial averages."
        url="https://calqulate.net/health/glp-1-weight-loss-projection-calculator"
      />
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />

      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-700">
              <TrendingDown className="h-3.5 w-3.5" />
              Based on real STEP 1 & SURMOUNT-1 trial data
            </div>
            <h1 className="mt-5 text-3xl font-bold leading-tight text-balance text-slate-900 md:text-5xl">
              How Much Weight Will I Lose on a GLP-1?
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-pretty text-slate-600 md:text-xl">
              Enter your weight and dose to project your expected loss on semaglutide (Wegovy) or tirzepatide
              (Zepbound) — using the actual average results from the pivotal clinical trials, not marketing
              numbers.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href="#calculator"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Project my weight loss <ArrowRight className="h-4 w-4" />
              </a>
              <span className="text-sm text-slate-500">Free · Instant · No sign-up</span>
            </div>
          </div>
        </section>

        {/* CALCULATOR */}
        <section id="calculator" className="scroll-mt-20 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <Glp1WeightLossProjectionCalculator />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 md:text-3xl">
              <Info className="h-6 w-6 text-emerald-600" /> How this projection works
            </h2>
            <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-slate-700">
              <p>
                This tool doesn&apos;t guess. It applies the <strong>average total body-weight reduction</strong>{" "}
                measured in each medication&apos;s pivotal randomized trial to your starting weight.
              </p>
              <p>
                For <strong>semaglutide</strong>, that&apos;s the STEP 1 trial: adults with overweight or obesity
                (without diabetes) lost an average of <strong>14.9%</strong> of body weight on the 2.4 mg dose
                over 68 weeks, versus 2.4% on placebo.
              </p>
              <p>
                For <strong>tirzepatide</strong>, that&apos;s SURMOUNT-1: average losses of{" "}
                <strong>15% (5 mg), 19.5% (10 mg), and 20.9% (15 mg)</strong> over 72 weeks, versus about 3% on
                placebo — the largest average reductions seen with any approved anti-obesity medication to date.
              </p>
              <p>
                Because people at the same dose had very different outcomes, the calculator also shows a{" "}
                <strong>realistic range</strong> rather than a single number. Real-world results are often a
                little below trial results, since trials support adherence closely.
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="flex items-start gap-2 text-sm text-amber-900">
                <Scale className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                <span>
                  A number on the scale isn&apos;t the whole story. Up to 40% of weight lost on a GLP-1 can be
                  muscle if you don&apos;t protect it. Pair any projection with enough protein and resistance
                  training, and track fat vs. muscle — not just weight.
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* COMPARE CTA */}
        <section className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <h2 className="text-center text-2xl font-bold text-slate-900">Still choosing a medication?</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                href="/compare/tirzepatide-vs-semaglutide"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-300"
              >
                <div>
                  <p className="font-bold text-slate-900">Tirzepatide vs Semaglutide</p>
                  <p className="text-sm text-slate-500">Zepbound/Mounjaro vs Wegovy/Ozempic — head to head</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:text-emerald-500" />
              </Link>
              <Link
                href="/compare/ozempic-vs-wegovy"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-300"
              >
                <div>
                  <p className="font-bold text-slate-900">Ozempic vs Wegovy</p>
                  <p className="text-sm text-slate-500">Same drug, different label — which is right for you?</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:text-emerald-500" />
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
            <FAQSection faqs={faqs} />
          </div>
        </section>

        {/* REFERENCES */}
        <section className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-3xl px-6 py-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Sources</h2>
            <ul className="mt-3 space-y-3">
              {EFFICACY_REFERENCES.map((r) => (
                <li key={r.url} className="text-sm text-slate-600">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    {r.title}
                  </a>
                  <span className="mt-0.5 block text-xs text-slate-400">{formatCitation(r)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <MedicalReviewerSection lastReviewed="July 24, 2026" />
      </main>

      <Footer />
    </div>
  );
}
