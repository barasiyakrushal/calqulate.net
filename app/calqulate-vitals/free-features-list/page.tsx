import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { FEATURE_AREAS } from "@/lib/features";
import { getAccess } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Free Features List | Calqulate Vitals",
  description:
    "Everything you get for free with Calqulate Vitals — all logging, reminders, dose curves, the metabolic score and shareable scorecard, no account or card needed to start.",
  keywords: "Calqulate Vitals free features, free GLP-1 tracker, free health tracker",
  alternates: { canonical: "https://calqulate.net/calqulate-vitals/free-features-list" },
  openGraph: {
    title: "Calqulate Vitals — Free Features List",
    description:
      "See exactly what stays free with Calqulate Vitals: logging, reminders, dose-level curves, your metabolic score and more.",
    url: "https://calqulate.net/calqulate-vitals/free-features-list",
    type: "website",
    siteName: "Calqulate",
  },
};

// Only the free-tier rows, grouped by dashboard area.
const FREE_AREAS = FEATURE_AREAS
  .map((g) => ({ area: g.area, rows: g.rows.filter((f) => f.tier === "free") }))
  .filter((g) => g.rows.length > 0);

const FREE_COUNT = FREE_AREAS.reduce((n, g) => n + g.rows.length, 0);

export default async function FreeFeaturesListPage() {
  const access = await getAccess();
  const loggedIn = access.userId !== null;
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50/60 via-white to-white">
      <Header />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="border-b border-emerald-100 bg-white/60 py-14 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" /> Free forever
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you get for free
            </h1>
            <p className="mt-3 text-[17px] leading-relaxed text-gray-600">
              {FREE_COUNT}+ features are free with Calqulate Vitals — no account, no card, nothing to lose.
              The whole logging engine stays open. Premium only adds the forward-looking, personalized layer on top.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={loggedIn ? "/dashboard" : "/signup?next=/dashboard"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-emerald-700 sm:w-auto"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 sm:w-auto"
              >
                Compare with Premium
              </Link>
            </div>
          </div>
        </section>

        {/* Free feature groups */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4">
            <div className="grid gap-6 sm:grid-cols-2">
              {FREE_AREAS.map((group) => (
                <div key={group.area} className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-700">{group.area}</h2>
                  <ul className="mt-4 space-y-2.5">
                    {group.rows.map((f) => (
                      <li key={f.key} className="flex gap-2.5 text-sm text-gray-700">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                        <span>
                          {f.label}
                          {f.note ? <span className="text-gray-400"> ({f.note})</span> : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-10 text-center text-sm text-gray-500">
              Want forecasts, simulators, muscle-loss detection and unlimited history?{" "}
              <Link href="/pricing" className="font-semibold text-emerald-700 hover:underline">
                See everything Premium unlocks
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
