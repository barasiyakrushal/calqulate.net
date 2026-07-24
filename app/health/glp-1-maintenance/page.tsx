import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MaintenanceDoseCalculator } from "@/components/glp1/MaintenanceDoseCalculator";
import { MaintenancePlanner } from "@/components/glp1/MaintenancePlanner";
import { FAQSchema } from "@/components/seo/structured-data";
import { FAQSection } from "@/components/seo/faq-section";
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section";
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema";
import { MAINTENANCE_FACTS, MAINTENANCE_REFERENCES } from "@/lib/glp1/maintenance";
import { formatCitation } from "@/lib/citations";
import { Pill, Target, Clock, ArrowRight, Info, Trophy } from "lucide-react";

const TITLE = "GLP-1 Maintenance: Dose, Duration & Keeping Weight Off";
const DESCRIPTION =
  "Reached your goal on Ozempic, Wegovy, Mounjaro, or Zepbound? Free maintenance dose calculator + weight maintenance planner: lowest effective dose, how long to stay on it, and the calories and protein to keep it off.";

export const metadata: Metadata = {
  title: `${TITLE} | Calqulate.net`,
  description: DESCRIPTION,
  keywords:
    "glp-1 maintenance dose, ozempic maintenance dose, wegovy maintenance dose, lowest effective dose glp-1, how long do i stay on ozempic, keeping weight off after ozempic, glp-1 maintenance, semaglutide maintenance dose, tirzepatide maintenance dose, weight maintenance calculator",
  alternates: { canonical: "https://calqulate.net/health/glp-1-maintenance" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://calqulate.net/health/glp-1-maintenance",
    siteName: "Calqulate",
    type: "article",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const faqs = [
  {
    question: "What is the maintenance dose of a GLP-1?",
    answer:
      "For weight management, Wegovy (semaglutide) maintains at 2.4 mg once weekly, with 1.7 mg an accepted alternative if the top dose isn't tolerated. Zepbound (tirzepatide) maintains at 5, 10, or 15 mg once weekly. Many people maintain on whichever dose held their weight steady rather than the maximum — but the dose is your prescriber's call.",
  },
  {
    question: "What is the lowest effective dose?",
    answer:
      "Once you reach your goal, the job changes from losing weight to holding it. Some people work with their prescriber to step down toward the lowest dose that keeps their weight stable, instead of staying at the maximum. There's no single 'right' answer — it depends on how your weight responds, and it's always a clinical decision.",
  },
  {
    question: "How long do I stay on a GLP-1?",
    answer:
      "These medications are designed for long-term, chronic use — there's no official taper protocol, because the intended use is ongoing. In withdrawal trials, stopping led to significant regain (people regained about two-thirds of their lost weight after switching off semaglutide in STEP 4). Many people stay on a maintenance dose indefinitely; if you do stop, a slow taper with your prescriber plus strong habits gives the best odds of keeping it off.",
  },
  {
    question: "Will I regain the weight if I stop?",
    answer:
      "Often, partly — but it's not all-or-nothing. Real-world data suggests just over half of people kept off some or all of their loss at 24 months. The people who keep the most off protected their muscle on the way down and built durable nutrition and activity habits while on the drug. Muscle keeps your metabolism higher, which makes maintenance far more forgiving.",
  },
  {
    question: "How many calories should I eat to maintain?",
    answer:
      "Roughly your maintenance calories (TDEE) for your goal weight — the planner above estimates this from your height, age, sex, and activity. As you lose the deficit, appetite returns, so the key is treating that maintenance number as your new normal and keeping protein high to protect muscle.",
  },
];

export default function Glp1MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />
      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-700">
              <Trophy className="h-3.5 w-3.5" />
              You hit your goal. Now keep it.
            </div>
            <h1 className="mt-5 text-3xl font-bold leading-tight text-balance text-slate-900 md:text-5xl">
              GLP-1 Maintenance: How to Keep It Off
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-pretty text-slate-600 md:text-xl">
              The hard part isn&apos;t losing it — it&apos;s holding it. Find your maintenance dose options and the
              exact calories, protein, and guardrails to keep the weight off for good.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#dose" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700">
                <Pill className="h-4 w-4" /> Maintenance dose
              </a>
              <a href="#planner" className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
                <Target className="h-4 w-4" /> Maintenance planner
              </a>
            </div>
          </div>
        </section>

        {/* DOSE CALCULATOR */}
        <section id="dose" className="scroll-mt-20 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mb-8 text-center">
              <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-900 md:text-3xl">
                <Pill className="h-7 w-7 text-emerald-600" /> Maintenance dose calculator
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-slate-600">
                Your dose options once you&apos;ve reached your goal — and the lowest-effective-dose idea.
              </p>
            </div>
            <MaintenanceDoseCalculator />
          </div>
        </section>

        {/* PLANNER */}
        <section id="planner" className="scroll-mt-20 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mb-8 text-center">
              <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-900 md:text-3xl">
                <Target className="h-7 w-7 text-emerald-600" /> Weight maintenance planner
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-slate-600">
                The calories, protein, and regain guardrail to hold your goal weight.
              </p>
            </div>
            <MaintenancePlanner />
          </div>
        </section>

        {/* HOW LONG / STOPPING */}
        <section className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 md:text-3xl">
              <Clock className="h-6 w-6 text-emerald-600" /> How long do I stay on it?
            </h2>
            <div className="mt-6 space-y-4">
              {[
                { title: "It's designed to be long-term", body: MAINTENANCE_FACTS.duration },
                { title: "Stopping usually means some regain", body: MAINTENANCE_FACTS.stopping },
                { title: "But it's not all-or-nothing", body: MAINTENANCE_FACTS.realWorld },
              ].map((b) => (
                <div key={b.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-bold text-slate-900">{b.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{b.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-sm text-slate-700">
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <span>
                The single best predictor of keeping weight off is protecting muscle.{" "}
                <Link href="/health/glp-1-dose-calculator" className="font-semibold text-emerald-700 hover:underline">
                  Check your fat-vs-muscle split
                </Link>{" "}
                and read the{" "}
                <Link href="/answers/gain-weight-back-after-ozempic" className="font-semibold text-emerald-700 hover:underline">
                  off-ramp guide
                </Link>{" "}
                before you consider stopping.
              </span>
            </div>
          </div>
        </section>

        {/* CROSS LINKS */}
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <h2 className="text-center text-2xl font-bold text-slate-900">Related tools</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Link href="/health/glp-1-plateau-analyzer" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300">
                <p className="font-bold text-slate-900">Plateau analyzer</p>
                <p className="mt-1 text-sm text-slate-500">Weight loss stalled? Why, and what to do.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Open <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
              <Link href="/health/macro-calculator" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300">
                <p className="font-bold text-slate-900">Macro / protein calculator</p>
                <p className="mt-1 text-sm text-slate-500">Dial in your maintenance protein.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Open <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
              <Link href="/health/glp-1-dose-calculator" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300">
                <p className="font-bold text-slate-900">Fat-vs-muscle tracker</p>
                <p className="mt-1 text-sm text-slate-500">Make sure you kept the muscle.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Open <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
            <FAQSection faqs={faqs} />
          </div>
        </section>

        {/* REFERENCES */}
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-6 py-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Sources</h2>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              {MAINTENANCE_REFERENCES.map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="font-medium text-emerald-700 hover:underline">
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
