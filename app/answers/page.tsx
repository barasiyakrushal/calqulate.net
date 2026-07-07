import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ArrowRight, MessageCircleQuestion, Sparkles } from "lucide-react";
import { GROUPS } from "./questions-data";

export const metadata: Metadata = {
  title: "Health Questions, Answered Honestly — A1c, Heart Risk, Cholesterol & GLP-1 | Calqulate.net",
  description:
    "Plain-English answers to the questions people actually ask about prediabetes, ASCVD heart risk, cholesterol, heart age, and GLP-1 muscle loss. No fluff — what your numbers mean and what to do next, from Calqulate.net.",
  alternates: { canonical: "https://calqulate.net/answers" },
  keywords: [
    "a1c 5.7 what to do", "is prediabetes reversible", "what does my ascvd risk mean",
    "high cholesterol but doctor not worried", "heart age older than my age",
    "losing muscle on ozempic", "metabolic health score", "how to lower heart disease risk",
  ],
};


function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROUPS.flatMap((g) =>
      g.items.map((it) => ({
        "@type": "Question",
        name: it.q,
        acceptedAnswer: { "@type": "Answer", text: it.a.replace(/\n+/g, " ") },
      })),
    ),
  };
}

export default function AnswersPage() {
  const jsonLd = buildFaqJsonLd();
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main id="main" className="flex-1">

        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 py-14 lg:py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-800/60 border border-emerald-600/40 px-4 py-1.5 text-sm font-medium text-emerald-300 mb-5">
              <MessageCircleQuestion className="h-4 w-4" /> Real questions, honest answers
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              The health questions people actually Google at 2am — answered straight
            </h1>
            <p className="mt-5 text-lg text-emerald-100/80 leading-relaxed">
              No fluff, no scare tactics. Plain-English answers about prediabetes, heart risk, cholesterol,
              heart age, and GLP-1 muscle loss — what your numbers mean and what to do next, from the team at
              Calqulate.net.
            </p>
          </div>
        </section>

        {/* Quick nav */}
        <section className="border-b border-gray-100 bg-white sticky top-[60px] z-30">
          <div className="container mx-auto px-4 max-w-5xl">
            <nav className="flex gap-1 overflow-x-auto py-3 text-sm">
              {GROUPS.map((g) => (
                <a key={g.id} href={`#${g.id}`} className="whitespace-nowrap rounded-full px-3 py-1.5 font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                  {g.title}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {/* Q&A groups */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-3xl space-y-14">
            {GROUPS.map((g) => (
              <div key={g.id} id={g.id} className="scroll-mt-32">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{g.title}</h2>
                <p className="mt-1 mb-6 text-gray-500">{g.blurb}</p>
                <div className="space-y-6">
                  {g.items.map((it) => (
                    <article key={it.q} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {it.slug ? (
                          <Link href={`/answers/${it.slug}`} className="hover:text-emerald-700 transition-colors">
                            {it.q}
                          </Link>
                        ) : (
                          it.q
                        )}
                      </h3>
                      <div className="space-y-3 text-[15px] text-gray-700 leading-relaxed">
                        {it.a.split("\n\n").map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {it.slug && (
                          <Link
                            href={`/answers/${it.slug}`}
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                          >
                            Read the full answer
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                        {it.links?.map((l) =>
                          l.gold ? (
                            <Link
                              key={l.href}
                              href={l.href}
                              className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-bold text-amber-950 shadow-sm shadow-amber-500/30 ring-1 ring-amber-300/60 hover:from-amber-300 hover:via-yellow-300 hover:to-amber-400 hover:shadow-md hover:shadow-amber-500/40 transition-all"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              {l.label}
                              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                          ) : (
                            <Link
                              key={l.href}
                              href={l.href}
                              className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                              {l.label}
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          ),
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 bg-gradient-to-br from-emerald-50 to-white border-t border-emerald-100">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Stop guessing about your numbers
            </h2>
            <p className="text-gray-600 mb-7">
              Get your free Metabolic Health Score on Calqulate.net, then track it over time with Calqulate Vitals —
              and always know the single highest-impact change to make next.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/product/metabolic-health-tracker" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 transition-colors">
                Get my free score <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/search" className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Browse all free calculators
              </Link>
            </div>
            <p className="mt-8 text-xs text-gray-400">
              Educational decision-support only — not medical advice, diagnosis, or treatment. Always consult a licensed clinician.
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
