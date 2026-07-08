import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { STANDALONE_QUESTIONS, getStandaloneQuestion } from "../questions-data";
import { getService } from "@/app/product/data";

export function generateStaticParams() {
  return STANDALONE_QUESTIONS.map((q) => ({ slug: q.slug! }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const qa = getStandaloneQuestion(slug);
  if (!qa) return {};
  const url = `https://calqulate.net/answers/${slug}`;
  return {
    title: `${qa.q} | Calqulate.net`,
    description: qa.metaDescription ?? qa.a,
    alternates: { canonical: url },
    openGraph: { title: qa.q, description: qa.metaDescription ?? qa.a, url, type: "article" },
  };
}

export default async function AnswerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const qa = getStandaloneQuestion(slug);
  if (!qa) notFound();

  const svc = qa.serviceSlug ? getService(qa.serviceSlug) : undefined;
  const paragraphs = qa.longAnswer ?? [qa.a];

  // FAQPage (not QAPage): these are publisher-authored answers, not community
  // forum threads. FAQPage avoids QAPage's required answerCount/upvoteCount/
  // author/datePublished fields, which don't apply to editorial content.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: qa.q,
        acceptedAnswer: { "@type": "Answer", text: paragraphs.join(" ") },
      },
    ],
  };

  // A few sibling questions for internal linking.
  const related = STANDALONE_QUESTIONS.filter((q) => q.slug !== slug).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main id="main" className="flex-1">
        <article className="container mx-auto px-4 max-w-3xl py-10">
          <Link href="/answers" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800">
            <ArrowLeft className="h-4 w-4" /> All health questions
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-emerald-600">{qa.groupTitle}</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">{qa.q}</h1>

          <div className="mt-6 space-y-4 text-[17px] leading-relaxed text-gray-700">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Service CTA — the "navigate to the service page" button */}
          {svc && (
            <div className="mt-8 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{svc.name.replace("Calqulate Vitals — ", "")}</p>
              <p className="mt-1 text-gray-700">{svc.tagline}</p>
              <Link
                href={`/product/${qa.serviceSlug}`}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 transition-colors"
              >
                {qa.serviceLabel ?? "Explore the tracker"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Related free tools */}
          {qa.links && qa.links.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-gray-500 mb-3">Free tools for this</h2>
              <div className="flex flex-wrap gap-2">
                {qa.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
                  >
                    {l.label}
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related questions */}
          <div className="mt-12 border-t border-gray-100 pt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">More questions people ask</h2>
            <ul className="space-y-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/answers/${r.slug}`} className="inline-flex items-start gap-2 text-[15px] text-emerald-700 hover:text-emerald-800">
                    <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0" /> {r.q}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex items-start gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-emerald-600" />
            <p>
              Educational decision-support from Calqulate.net — not medical advice, diagnosis, or treatment.
              Always consult a licensed clinician about your health decisions.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
