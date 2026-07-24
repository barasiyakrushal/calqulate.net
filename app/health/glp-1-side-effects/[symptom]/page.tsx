import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FAQSection } from "@/components/seo/faq-section";
import { FAQSchema } from "@/components/seo/structured-data";
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section";
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema";
import { SIDE_EFFECT_SLUGS, getSideEffect, FREQUENCY_LABEL } from "@/lib/glp1/sideEffects";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Stethoscope,
  Info,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

export function generateStaticParams() {
  return SIDE_EFFECT_SLUGS.map((symptom) => ({ symptom }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ symptom: string }>;
}): Promise<Metadata> {
  const { symptom } = await params;
  const se = getSideEffect(symptom);
  if (!se) return {};
  const url = `https://calqulate.net/health/glp-1-side-effects/${se.slug}`;
  const description = `${se.tldr} What causes it, how long it lasts, what helps, and when to call a doctor — from Calqulate.net.`;
  return {
    title: `${se.name} | Calqulate.net`,
    description,
    keywords: [...se.aka, "glp-1 side effects", "ozempic", "wegovy", "mounjaro", "zepbound"].join(", "),
    alternates: { canonical: url },
    openGraph: { title: se.name, description, url, siteName: "Calqulate", type: "article" },
    twitter: { card: "summary_large_image", title: se.name, description },
  };
}

export default async function SideEffectPage({
  params,
}: {
  params: Promise<{ symptom: string }>;
}) {
  const { symptom } = await params;
  const se = getSideEffect(symptom);
  if (!se) notFound();

  const related = se.related.map(getSideEffect).filter(Boolean);
  const isFoodDrink = se.category === "food-drink";

  // Build FAQ + schema from the structured data.
  const faqs = [
    { question: se.name, answer: se.tldr },
    { question: `How long does it last?`, answer: se.howLong },
    {
      question: `When should I be worried?`,
      answer: `Contact your prescriber or seek care if: ${se.redFlags.join("; ")}.`,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />
      <Header />

      <main id="main" className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-10 md:py-12">
          <Link
            href="/health/glp-1-side-effects"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            <ArrowLeft className="h-4 w-4" /> All GLP-1 side effects
          </Link>

          {/* Header */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              {FREQUENCY_LABEL[se.frequency]}
            </span>
            {se.timeline && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <Clock className="h-3.5 w-3.5" /> Typically weeks {se.timeline.onsetWeek}–{se.timeline.easesWeek}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">{se.name}</h1>

          {/* TLDR reassurance */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
            <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
            <p className="text-[17px] leading-relaxed text-slate-800">
              <strong>The short answer:</strong> {se.tldr} This is {se.howCommon}.
            </p>
          </div>

          {/* Why */}
          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Info className="h-5 w-5 text-emerald-600" /> Why it happens
            </h2>
            <div className="mt-3 space-y-3 text-[17px] leading-relaxed text-slate-700">
              {se.why.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          {/* How long */}
          <section className="mt-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Clock className="h-5 w-5 text-emerald-600" /> {isFoodDrink ? "The practical rule" : "How long it lasts"}
            </h2>
            <p className="mt-3 text-[17px] leading-relaxed text-slate-700">{se.howLong}</p>
          </section>

          {/* What helps */}
          <section className="mt-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Stethoscope className="h-5 w-5 text-emerald-600" /> What helps
            </h2>
            <ul className="mt-4 space-y-2.5">
              {se.whatHelps.map((h) => (
                <li key={h} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <span className="text-slate-700">{h}</span>
                </li>
              ))}
            </ul>
            {se.tools && se.tools.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {se.tools.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    {t.label} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Red flags */}
          <section className="mt-8">
            <div className="rounded-2xl border-2 border-red-200 bg-red-50/60 p-5 md:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-red-800">
                <AlertTriangle className="h-5 w-5 text-red-600" /> When to call your doctor
              </h2>
              <ul className="mt-3 space-y-2">
                {se.redFlags.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-slate-700">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Symptom-logging CTA */}
          <section className="mt-8">
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <ClipboardList className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" />
                <p className="text-sm text-slate-700">
                  <strong className="text-slate-900">Track this against your dose.</strong> Logging {se.short.toLowerCase()} week by week shows whether it&apos;s actually easing — and gives your prescriber real data.
                </p>
              </div>
              <Link
                href="/signup?next=/dashboard/glp1"
                className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Log it free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-10 border-t border-slate-100 pt-8">
              <h2 className="text-lg font-bold text-slate-900">Related symptoms</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r!.slug}
                    href={`/health/glp-1-side-effects/${r!.slug}`}
                    className="group flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300"
                  >
                    <span className="font-semibold text-slate-900 group-hover:text-emerald-700">{r!.short}</span>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-300 transition group-hover:text-emerald-500" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Tools row */}
          <section className="mt-8 flex flex-wrap gap-2">
            <Link href="/health/glp-1-side-effects" className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">
              Side-effect timeline &amp; checker <ArrowRight className="h-3 w-3" />
            </Link>
            <Link href="/health/first-30-days-on-glp-1" className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">
              First 30 days checklist <ArrowRight className="h-3 w-3" />
            </Link>
          </section>

          {/* Disclaimer */}
          <div className="mt-10 flex items-start gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-600" />
            <p>
              Educational information from Calqulate.net — not medical advice, diagnosis, or treatment. Follow
              your prescriber&apos;s instructions and contact a licensed clinician about your symptoms.
            </p>
          </div>

          {/* FAQ */}
          <div className="mt-10">
            <FAQSection faqs={faqs} />
          </div>
        </article>

        <MedicalReviewerSection lastReviewed="July 24, 2026" />
      </main>

      <Footer />
    </div>
  );
}
