import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SERVICES, getService } from "../data";
import { SinglePlan } from "@/components/vitals/SinglePlan";
import { MetricForm } from "@/components/vitals/MetricForm";
import { CalculatorSearch } from "@/components/search/CalculatorSearch";
import { getAccess, hasPaidAccess } from "@/lib/auth";
import { OFFER_ENRICHMENT } from "@/lib/seo/product-offer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const svc = getService(slug);
  if (!svc) return {};
  const url = `https://calqulate.net/product/${svc.slug}`;
  return {
    title: svc.metaTitle,
    description: svc.metaDescription,
    keywords: svc.keywords,
    alternates: { canonical: url },
    openGraph: { title: svc.metaTitle, description: svc.metaDescription, url, type: "website" },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const svc = getService(slug);
  if (!svc) notFound();
  const access = await getAccess();
  const paid = hasPaidAccess(access);
  const loggedIn = access.userId !== null;

  // Each tracker foregrounds its own metric in the free snapshot.
  const SNAPSHOTS: Record<string, { heading: string; sub: string; focus: "metabolic" | "heartAge" | "glp1" }> = {
    "metabolic-health-tracker": {
      heading: "Your free metabolic snapshot",
      sub: "Enter your numbers to see today's Metabolic Health Score. Create an account to track it over time and watch it improve.",
      focus: "metabolic",
    },
    "heart-age-tracker": {
      heading: "Your free heart age snapshot",
      sub: "Enter your numbers to find out how old your heart really is. Create an account to track it and watch it get younger.",
      focus: "heartAge",
    },
    "glp1-progress-tracker": {
      heading: "Your free GLP-1 body-composition snapshot",
      sub: "Enter your numbers to see your lean mass and risk — not just weight. Create an account to track muscle vs. fat over time.",
      focus: "glp1",
    },
  };
  const snapshot = SNAPSHOTS[svc.slug] ?? SNAPSHOTS["metabolic-health-tracker"];

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: svc.name,
        description: svc.metaDescription,
        image: ["https://calqulate.net/Health-personalized-dashboard-calqulate.net.webp"],
        brand: { "@type": "Brand", name: "Calqulate" },
        offers: {
          "@type": "AggregateOffer",
          lowPrice: "0",
          highPrice: "119",
          priceCurrency: "USD",
          offerCount: "2",
          ...OFFER_ENRICHMENT,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: svc.faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <main id="main" className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />

      <div className="mb-8 flex justify-center">
        <CalculatorSearch />
      </div>

      {/* Hero */}
      <section className="text-center">
        {paid && (
          <span className="inline-block mb-3 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
            {access.tier === "pro" ? "Pro" : "Plus"} plan active
          </span>
        )}
        <p className="mb-2 text-sm font-medium text-blue-600">{svc.tagline}</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{svc.heroHeadline}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">{svc.heroSub}</p>
        <div className="mt-6 flex justify-center gap-3">
          {paid ? (
            <Link href="/dashboard" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
              Go to dashboard
            </Link>
          ) : (
            <>
              <a href="#snapshot" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
                Get my free snapshot
              </a>
              <Link href="/dashboard" className="rounded-lg border border-gray-300 px-5 py-3 font-semibold hover:bg-gray-50">
                Go to dashboard
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Value bullets */}
      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        {svc.bullets.map((b) => (
          <div key={b} className="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
            <span className="mt-1 text-blue-600">✓</span>
            <span className="text-gray-800">{b}</span>
          </div>
        ))}
      </section>

      {/* Free interactive snapshot — the conversion hook */}
      <section id="snapshot" className="mt-16">
        <h2 className="text-2xl font-bold">{snapshot.heading}</h2>
        <p className="mt-1 text-gray-600">{snapshot.sub}</p>
        <div className="mt-6">
          <MetricForm productSlug={svc.slug} focus={snapshot.focus} />
        </div>
      </section>

      {/* Pricing — hidden for existing subscribers */}
      <section className="mt-16">
        <h2 className="text-center text-2xl font-bold">Track it over time</h2>
        <p className="mt-1 text-center text-gray-600">
          A snapshot is a starting point. The value is the trend.
        </p>
        <div className="mt-8">
          {paid ? (
            <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center">
              <span className="inline-block rounded-full bg-emerald-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                Active
              </span>
              <h3 className="mt-4 text-xl font-bold text-emerald-900">
                You already have Calqulate Vitals
              </h3>
              <p className="mt-2 text-emerald-700">
                Your subscription is active. Go to your dashboard to see your scores, trends, and personalized next steps.
              </p>
              <Link
                href="/dashboard"
                className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Go to dashboard →
              </Link>
            </div>
          ) : (
            <SinglePlan />
          )}
        </div>
      </section>

      {/* FAQ — rendered + marked up as FAQPage JSON-LD above */}
      <section id="faq" className="mt-16 scroll-mt-20">
        <h2 className="text-center text-2xl font-bold">Frequently asked questions</h2>
        <div className="mx-auto mt-8 max-w-3xl divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
          {svc.faqs.map((faq, i) => (
            <details key={faq.question} className="group px-5 sm:px-6" open={i === 0}>
              <summary className="flex cursor-pointer items-center justify-between gap-4 py-4 sm:py-5 list-none [&::-webkit-details-marker]:hidden">
                <h3 id={`faq-${i}`} className="text-sm font-semibold text-gray-900 scroll-mt-24 sm:text-base">
                  {faq.question}
                </h3>
                <span className="flex-shrink-0 text-blue-600 transition-transform duration-200 group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-gray-600 sm:text-base">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-12 text-center text-xs text-gray-400">
        Educational decision-support only. Not medical advice, diagnosis or treatment.
        Risk models: 2013 ACC/AHA Pooled Cohort Equations, Framingham (D&apos;Agostino 2008), FINDRISC.
      </p>
    </main>
  );
}
