import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RegainRiskCalculator } from "@/components/glp1/RegainRiskCalculator";
import { TaperingPlanner } from "@/components/glp1/TaperingPlanner";
import { FAQSchema } from "@/components/seo/structured-data";
import { FAQSection } from "@/components/seo/faq-section";
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section";
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema";
import { MAINTENANCE_FACTS, MAINTENANCE_REFERENCES } from "@/lib/glp1/maintenance";
import { formatCitation } from "@/lib/citations";
import { ShieldQuestion, TrendingDown, ArrowRight, Info, Activity } from "lucide-react";

const TITLE = "Stopping a GLP-1: Will I Gain the Weight Back? (Regain Risk + Taper)";
const DESCRIPTION =
  "Thinking about stopping Ozempic, Wegovy, Mounjaro, or Zepbound? Free regain risk calculator + tapering planner. See your personal regain risk, the levers that lower it, and how to step down instead of quitting cold.";

export const metadata: Metadata = {
  title: `${TITLE} | Calqulate.net`,
  description: DESCRIPTION,
  keywords:
    "gain weight back after ozempic, stopping wegovy, tapering off ozempic, glp-1 regain risk, will i gain weight back after wegovy, how to stop semaglutide, tapering off tirzepatide, weight regain after stopping glp-1, coming off ozempic",
  alternates: { canonical: "https://calqulate.net/health/glp-1-stopping" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://calqulate.net/health/glp-1-stopping",
    siteName: "Calqulate",
    type: "article",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const faqs = [
  {
    question: "Will I gain the weight back after stopping a GLP-1?",
    answer:
      "Often some of it, but it's not all-or-nothing. In withdrawal trials, people who switched to placebo regained about two-thirds of their lost weight, while real-world data shows just over half of people kept off some or all of their loss at 24 months. The difference is largely predictable: the people who keep the most off protected their muscle and built durable habits while on the drug.",
  },
  {
    question: "Is it better to taper off or stop cold turkey?",
    answer:
      "A gradual taper with your prescriber generally beats stopping abruptly. Stepping the dose down lets appetite return in stages you can manage, rather than all at once. There's no official manufacturer taper protocol, so the schedule is individualized — the planner on this page gives a common, conservative version to discuss with your clinician.",
  },
  {
    question: "What's the single biggest thing that prevents regain?",
    answer:
      "Muscle. It's metabolically active, so holding onto it keeps your daily calorie burn higher and makes maintenance far more forgiving after you stop. That's why protein and resistance training — plus catching muscle loss early — matter more than anything else on the way off.",
  },
  {
    question: "Why do people stop GLP-1s?",
    answer:
      "Most often cost and supply, sometimes side effects, and sometimes because they've reached their goal. Whatever the reason, going in with a plan — a taper, protein, resistance training, and weekly weigh-ins — dramatically changes how much weight stays off.",
  },
];

export default function Glp1StoppingPage() {
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
              <ShieldQuestion className="h-3.5 w-3.5" />
              Coming off? Do it on your terms.
            </div>
            <h1 className="mt-5 text-3xl font-bold leading-tight text-balance text-slate-900 md:text-5xl">
              Stopping a GLP-1: Will I Gain It Back?
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-pretty text-slate-600 md:text-xl">
              Whether it&apos;s cost, supply, or you&apos;ve reached your goal — how much weight stays off is
              largely in your control. Check your personal regain risk, then build a taper instead of quitting cold.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#risk" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700">
                <ShieldQuestion className="h-4 w-4" /> Check my regain risk
              </a>
              <a href="#taper" className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50">
                <TrendingDown className="h-4 w-4" /> Build my taper
              </a>
            </div>
          </div>
        </section>

        {/* REGAIN RISK */}
        <section id="risk" className="scroll-mt-20 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mb-8 text-center">
              <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-900 md:text-3xl">
                <ShieldQuestion className="h-7 w-7 text-emerald-600" /> Regain risk calculator
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-slate-600">
                Your risk of significant regain — and the specific levers that lower it.
              </p>
            </div>
            <RegainRiskCalculator />
          </div>
        </section>

        {/* TAPER */}
        <section id="taper" className="scroll-mt-20 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mb-8 text-center">
              <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-900 md:text-3xl">
                <TrendingDown className="h-7 w-7 text-emerald-600" /> Tapering planner
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-slate-600">
                A conservative step-down schedule to take to your prescriber.
              </p>
            </div>
            <TaperingPlanner />
          </div>
        </section>

        {/* THE EVIDENCE */}
        <section className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 md:text-3xl">
              <Info className="h-6 w-6 text-emerald-600" /> What the evidence actually says
            </h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-slate-900">Stopping does cause regain — on average</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{MAINTENANCE_FACTS.stopping}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-slate-900">But you are not the average</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{MAINTENANCE_FACTS.realWorld}</p>
              </div>
            </div>
            <div className="mt-6 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-sm text-slate-700">
              <Activity className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <span>
                The through-line in every study: muscle and habits decide it. Before you taper,{" "}
                <Link href="/health/glp-1-dose-calculator" className="font-semibold text-emerald-700 hover:underline">
                  check whether your loss was fat or muscle
                </Link>
                , and read the full{" "}
                <Link href="/answers/gain-weight-back-after-ozempic" className="font-semibold text-emerald-700 hover:underline">
                  off-ramp guide
                </Link>
                .
              </span>
            </div>
          </div>
        </section>

        {/* CROSS LINKS */}
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <h2 className="text-center text-2xl font-bold text-slate-900">Before you go</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Link href="/health/glp-1-maintenance" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300">
                <p className="font-bold text-slate-900">Maintenance & keeping it off</p>
                <p className="mt-1 text-sm text-slate-500">Your maintenance calories and protein.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Open <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
              <Link href="/health/glp-1-dose-calculator" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300">
                <p className="font-bold text-slate-900">Fat-vs-muscle tracker</p>
                <p className="mt-1 text-sm text-slate-500">Did you keep the muscle?</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Open <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
              <Link href="/health/glp-1-side-effects" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300">
                <p className="font-bold text-slate-900">Side effects: am I normal?</p>
                <p className="mt-1 text-sm text-slate-500">Timeline &amp; symptom checker.</p>
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
