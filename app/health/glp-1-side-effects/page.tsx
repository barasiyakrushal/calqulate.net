import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SideEffectTimeline } from "@/components/glp1/SideEffectTimeline";
import { AmINormalChecker } from "@/components/glp1/AmINormalChecker";
import { FAQSchema } from "@/components/seo/structured-data";
import { FAQSection } from "@/components/seo/faq-section";
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section";
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema";
import { SIDE_EFFECTS, FREQUENCY_LABEL } from "@/lib/glp1/sideEffects";
import { ShieldAlert, ArrowRight, Activity, ClipboardList, HeartPulse } from "lucide-react";

const TITLE = "GLP-1 Side Effects Timeline: Am I Normal? (Nausea, Fatigue & More)";
const DESCRIPTION =
  "Nauseous, constipated, exhausted, or cold on Ozempic, Wegovy, Mounjaro, or Zepbound? Use the interactive side-effect timeline and 'Am I Normal?' checker to see what's typical at your week — and when to call a doctor.";

export const metadata: Metadata = {
  title: `${TITLE} | Calqulate.net`,
  description: DESCRIPTION,
  keywords:
    "glp-1 side effects, ozempic side effects timeline, how long does nausea last on ozempic, wegovy side effects, mounjaro side effects, am i normal glp-1, semaglutide side effects week by week, tirzepatide side effects, sulfur burps ozempic, ozempic fatigue, ozempic chills",
  alternates: { canonical: "https://calqulate.net/health/glp-1-side-effects" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://calqulate.net/health/glp-1-side-effects",
    siteName: "Calqulate",
    type: "article",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const faqs = [
  {
    question: "How long do GLP-1 side effects last?",
    answer:
      "Most gastrointestinal side effects — nausea, constipation, diarrhea, burps — are worst in the first 1–2 weeks at a new dose and ease as your body adjusts, usually within a few weeks. They often flare again briefly after each dose increase. Use the timeline above to see the typical arc for each symptom.",
  },
  {
    question: "Are my side effects normal or should I worry?",
    answer:
      "Mild, fading symptoms that improve at a steady dose are expected. The warning signs that mean you should contact a clinician are things like persistent vomiting, inability to keep fluids down, severe stomach pain (especially radiating to the back), or signs of dehydration. Each symptom guide lists its specific red flags.",
  },
  {
    question: "Why are my side effects worse after a dose increase?",
    answer:
      "GLP-1 doses are raised gradually on purpose. Each increase temporarily strengthens the effect that slows your stomach, so nausea and other GI symptoms often return for a week or two before settling again. That's why titration is slow.",
  },
  {
    question: "Do side effects mean the medication is working?",
    answer:
      "Not necessarily. Side effects reflect how your gut is reacting, not how much weight you'll lose. Some people have strong results with few side effects, and vice versa. Don't judge whether it's 'working' by how sick you feel.",
  },
];

const CATEGORY_TITLES: Record<string, string> = {
  gi: "Stomach & digestion",
  systemic: "Whole-body symptoms",
  "food-drink": "Food & drink questions",
};
const CATEGORY_ORDER = ["gi", "systemic", "food-drink"] as const;

export default function Glp1SideEffectsHubPage() {
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
              <HeartPulse className="h-3.5 w-3.5" />
              For anyone thinking &ldquo;is this normal?&rdquo;
            </div>
            <h1 className="mt-5 text-3xl font-bold leading-tight text-balance text-slate-900 md:text-5xl">
              GLP-1 Side Effects: Am I Normal?
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-pretty text-slate-600 md:text-xl">
              Nauseous in week 2? Constipated, exhausted, weirdly cold, or getting rotten-egg burps? Almost all
              of it is common and temporary. Check your symptom and your week below to see what&apos;s typical —
              and the exact signs that mean you should call a doctor.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href="#checker"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Check my symptom <ArrowRight className="h-4 w-4" />
              </a>
              <span className="text-sm text-slate-500">Free · No sign-up · Not medical advice</span>
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mb-8 text-center">
              <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-900 md:text-3xl">
                <Activity className="h-7 w-7 text-emerald-600" /> The side-effect timeline
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-slate-600">
                When each symptom typically starts, peaks, and fades. Drag to your week.
              </p>
            </div>
            <SideEffectTimeline />
          </div>
        </section>

        {/* AM I NORMAL CHECKER */}
        <section id="checker" className="scroll-mt-20 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <AmINormalChecker />
          </div>
        </section>

        {/* SYMPTOM DIRECTORY */}
        <section className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Every symptom, explained</h2>
            <p className="mt-2 text-slate-600">Straight answers on what&apos;s happening and what to do about it.</p>
            <div className="mt-8 space-y-8">
              {CATEGORY_ORDER.map((cat) => {
                const items = SIDE_EFFECTS.filter((s) => s.category === cat);
                if (!items.length) return null;
                return (
                  <div key={cat}>
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                      {CATEGORY_TITLES[cat]}
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/health/glp-1-side-effects/${s.slug}`}
                          className="group flex items-start justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300"
                        >
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-emerald-700">{s.short}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{FREQUENCY_LABEL[s.frequency]}</p>
                          </div>
                          <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-slate-300 transition group-hover:text-emerald-500" />
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* GLOBAL RED FLAGS */}
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <div className="rounded-3xl border-2 border-red-200 bg-red-50/60 p-6 md:p-8">
              <h2 className="flex items-center gap-2 text-xl font-bold text-red-800 md:text-2xl">
                <ShieldAlert className="h-6 w-6 text-red-600" /> When it&apos;s not just a side effect
              </h2>
              <p className="mt-3 text-sm text-slate-700 md:text-base">
                Contact your prescriber or seek urgent care if you have any of these — they are not the routine
                symptoms above:
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "Severe stomach pain, especially pain that radiates to your back (possible pancreatitis)",
                  "Persistent vomiting or an inability to keep any fluids down",
                  "Upper-right belly pain, fever, or yellowing skin/eyes (possible gallbladder issue)",
                  "Signs of dehydration — dizziness, very dark urine, or not urinating",
                  "A serious allergic reaction — swelling, trouble breathing, or a spreading rash",
                  "Shakiness, sweating, or confusion (possible low blood sugar)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* SIGNUP CTA — connect to symptom logging */}
        <section className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white shadow-xl md:flex-row md:items-center">
              <div className="flex items-start gap-3">
                <ClipboardList className="mt-0.5 h-8 w-8 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold">Log your symptoms and spot the pattern</h2>
                  <p className="mt-2 max-w-xl text-emerald-50">
                    Tracking each side effect against your dose shows you what&apos;s improving, what flares after
                    an increase, and gives your prescriber real data at your next visit.
                  </p>
                </div>
              </div>
              <Link
                href="/signup?next=/dashboard/glp1"
                className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              >
                Start tracking free <ArrowRight className="h-4 w-4" />
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
