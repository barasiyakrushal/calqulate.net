import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PlateauAnalyzer } from "@/components/glp1/PlateauAnalyzer";
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data";
import { FAQSection } from "@/components/seo/faq-section";
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section";
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema";
import { ArrowRight, Info, TrendingDown, Waves } from "lucide-react";

const TITLE = "GLP-1 Plateau Analyzer: Why Did My Weight Loss Stall?";
const DESCRIPTION =
  "Weight loss stalled on Ozempic, Wegovy, Mounjaro, or Zepbound? Enter your weigh-ins and this free analyzer tells you if it's a real plateau, why it happened, and the levers that actually restart it.";

export const metadata: Metadata = {
  title: `${TITLE} | Calqulate.net`,
  description: DESCRIPTION,
  keywords:
    "glp-1 plateau, weight loss stalled on ozempic, ozempic plateau, wegovy plateau, semaglutide plateau, tirzepatide plateau, scale not moving glp-1, is ozempic still working, weight loss stopped week 12, plateau analyzer",
  alternates: { canonical: "https://calqulate.net/health/glp-1-plateau-analyzer" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://calqulate.net/health/glp-1-plateau-analyzer",
    siteName: "Calqulate",
    type: "article",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const faqs = [
  {
    question: "Is a weight-loss plateau on a GLP-1 normal?",
    answer:
      "Yes — plateaus are extremely common, and they don't mean the medication has stopped working. As you lose weight your body needs fewer calories, and each dose eventually reaches the limit of what it can do until you step up. A flat stretch of 2–4 weeks is normal; a longer stall is worth reviewing with your prescriber.",
  },
  {
    question: "Why did my weight loss stop at week 12 (or after a dose increase)?",
    answer:
      "Two common reasons: your current dose has done most of its work and a titration step may be due, or your body has adapted to a lower calorie intake (metabolic adaptation), often made worse by losing muscle. Protein, resistance training, and a dose review with your prescriber are the usual levers.",
  },
  {
    question: "How do I know if it's a real plateau or just water weight?",
    answer:
      "One flat or up week is usually noise — water, glycogen, sodium, or hormonal shifts. A real plateau is several weeks essentially flat after a period of steady loss. That's exactly what this analyzer checks: it compares your recent weeks against the weeks before to tell the difference.",
  },
  {
    question: "Could I be losing fat even if the scale isn't moving?",
    answer:
      "Yes. If you've added resistance training, you can lose fat and gain muscle at the same time, leaving the scale flat while your body composition improves. That's why checking fat vs. muscle — not just weight — matters at a plateau.",
  },
  {
    question: "Should I increase my dose to break a plateau?",
    answer:
      "Possibly, but that's a decision for your prescriber, not something to do on your own. Bring your logged weight trend and side-effect history to your appointment so you can decide together with real data.",
  },
];

export default function Glp1PlateauAnalyzerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema
        name="GLP-1 Plateau Analyzer"
        description="Analyze your GLP-1 weight-loss trend to tell a real plateau from normal noise, and what restarts it."
        url="https://calqulate.net/health/glp-1-plateau-analyzer"
      />
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />
      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-700">
              <Waves className="h-3.5 w-3.5" />
              Scale stuck? Let&apos;s find out why.
            </div>
            <h1 className="mt-5 text-3xl font-bold leading-tight text-balance text-slate-900 md:text-5xl">
              GLP-1 Plateau Analyzer
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-pretty text-slate-600 md:text-xl">
              Weight loss stalled on Ozempic, Wegovy, Mounjaro, or Zepbound? Enter your weigh-ins and we&apos;ll
              tell you whether it&apos;s a real plateau or just noise — and the levers that actually restart it.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href="#analyzer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Analyze my trend <ArrowRight className="h-4 w-4" />
              </a>
              <span className="text-sm text-slate-500">Free · No sign-up to use · Not medical advice</span>
            </div>
          </div>
        </section>

        {/* ANALYZER */}
        <section id="analyzer" className="scroll-mt-20 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <PlateauAnalyzer />
          </div>
        </section>

        {/* WHY PLATEAUS HAPPEN */}
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-900 md:text-3xl">
              <Info className="h-6 w-6 text-emerald-600" /> Why GLP-1 weight loss plateaus
            </h2>
            <div className="mt-6 space-y-5">
              {[
                {
                  title: "Your dose reached its ceiling",
                  body: "Each dose does a fixed amount of appetite suppression. As your body adjusts, that effect levels off — which is exactly why titration schedules step the dose up. A plateau often simply means it's time to talk to your prescriber about the next step.",
                },
                {
                  title: "Metabolic adaptation",
                  body: "A smaller body burns fewer calories, so the deficit that drove early loss shrinks over time. Eat too little for too long and your body defends its weight even harder.",
                },
                {
                  title: "Muscle loss lowered your engine",
                  body: "Up to 40% of GLP-1 weight loss can be muscle if it isn't protected. Less muscle means a lower resting metabolism — a hidden driver of stalls. Protein and lifting are the fix.",
                },
                {
                  title: "It's not actually a plateau",
                  body: "Water, sodium, glycogen, and hormonal shifts move the scale day to day. One flat week is noise. A trend over several weeks is signal — which is what the analyzer measures.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
              <p className="flex items-start gap-2 text-sm text-slate-700">
                <TrendingDown className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                <span>
                  The single most important habit at a plateau is to keep measuring — both weight and body
                  composition. A stall you can see is a stall you can break.{" "}
                  <Link href="/health/glp-1-dose-calculator" className="font-semibold text-emerald-700 hover:underline">
                    Check whether you&apos;re losing fat or muscle
                  </Link>
                  .
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* CROSS LINKS */}
        <section className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <h2 className="text-center text-2xl font-bold text-slate-900">Keep going</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Link href="/answers/scale-not-moving-am-i-making-progress" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300">
                <p className="font-bold text-slate-900">Scale isn&apos;t moving?</p>
                <p className="mt-1 text-sm text-slate-500">Am I actually making progress?</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Read <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
              <Link href="/health/glp-1-side-effects" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300">
                <p className="font-bold text-slate-900">Side effects: am I normal?</p>
                <p className="mt-1 text-sm text-slate-500">Timeline &amp; symptom checker</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Check <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
              <Link href="/health/weight-loss-percentage-calculator" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300">
                <p className="font-bold text-slate-900">How much have I lost?</p>
                <p className="mt-1 text-sm text-slate-500">Weight-loss % + save your trend</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Open <ArrowRight className="h-3.5 w-3.5" /></span>
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

        <MedicalReviewerSection lastReviewed="July 24, 2026" />
      </main>

      <Footer />
    </div>
  );
}
