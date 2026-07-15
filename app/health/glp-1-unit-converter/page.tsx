import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Glp1InjectionSafetyAssistant from "@/components/calculators/glp1-injection-safety-assistant"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { ServiceCTA } from "@/components/seo/service-cta"
import { SourcesSection } from "@/components/seo/sources-section"
import { RelatedCalculators } from "@/components/seo/related-calculators"
import { RelatedCalculators as CatalogRelatedCalculators } from "@/components/calculators/related-calculators"
import { ArrowRight, ShieldCheck, ShieldAlert, Check, X, Beaker, Pill, Syringe } from "lucide-react"
import {
  SITE,
  seo,
  journey,
  references,
  medicalDisclaimer,
  clusterGroups,
  charts,
  understandingConversion,
  beforeYouInject,
  doseConversions,
  whyConcentration,
  brandVsCompounded,
  syringeChoice,
  commonMistakes,
  numbersDontMatch,
  trustSignals,
  type ChartImage,
} from "@/lib/glp1-unit-converter/content"

const TITLE = seo.title
const DESCRIPTION = seo.description
const URL = `https://calqulate.net${SITE.pagePath}`

export const metadata: Metadata = {
  title: `${TITLE} | Calqulate.net`,
  description: DESCRIPTION,
  keywords: seo.keywords.join(", "),
  alternates: {
    canonical: URL,
  },
  openGraph: {
    title: seo.ogTitle,
    description: seo.ogDescription,
    url: URL,
    siteName: "Calqulate",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: seo.ogTitle,
    description: seo.ogDescription,
  },
}

/** The cluster answers are FAQ-shaped, so they feed the FAQ schema (kept in sync with what is visible on the page). */
const allFaqs = clusterGroups.flatMap((g) => g.items)

/* ------------------------------------------------------------------ */
/* SMALL PRESENTATION HELPERS                                          */
/* ------------------------------------------------------------------ */

/** Section wrapper: consistent spacing and a mobile-first heading. */
function Section({
  id,
  heading,
  answer,
  children,
}: {
  id: string
  heading: string
  answer?: string
  children?: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{heading}</h2>
      {answer && <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">{answer}</p>}
      {children}
    </section>
  )
}

/**
 * Chart image placeholder. Drop the matching file into /public/charts/ and it
 * renders automatically. Uses a plain img so any uploaded dimensions work; the
 * width/height reserve space to avoid layout shift.
 */
function ChartFigure({ chart }: { chart: ChartImage }) {
  return (
    <figure className="mt-8">
      {/* Fixed 16:9 frame: reserves space (no layout shift) and shows the whole chart without cropping. */}
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={chart.src}
          alt={chart.alt}
          width={chart.width}
          height={chart.height}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
        />
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-slate-500">{chart.caption}</figcaption>
    </figure>
  )
}

function ContentTable({
  table,
}: {
  table: { caption: string; headers: string[]; rows: string[][] }
}) {
  return (
    <figure className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {table.headers.map((header, i) => (
              <th key={i} scope="col" className="border-b border-slate-200 px-4 py-3 font-bold text-slate-900">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i} className="odd:bg-white even:bg-slate-50/60">
              {row.map((cell, j) => (
                <td key={j} className="border-b border-slate-100 px-4 py-3 text-slate-700">
                  {j === 0 ? <span className="font-semibold text-slate-900">{cell}</span> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="bg-white px-4 py-3 text-xs text-slate-500">{table.caption}</figcaption>
    </figure>
  )
}

export default function Glp1UnitConverterPage() {
  const mgToUnitsTable = clusterGroups.find((g) => g.id === "mg-to-units")?.table
  const unitsToMgTable = clusterGroups.find((g) => g.id === "units-to-mg")?.table

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema name="GLP-1 Unit Converter" description={DESCRIPTION} url={URL} />
      <FAQSchema faqs={allFaqs} />
      <MedicalReviewerSchema />

      <Header />

      <main id="main" className="flex-1">
        {/* HERO + CALCULATOR + INJECTION SNAPSHOT live in the component */}
        <Glp1InjectionSafetyAssistant />

        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-3xl">
            <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm font-medium text-slate-500">
              <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              Your data is private. We do not store your answers or any personal information.
            </p>

            {/* The one rule the whole page rests on */}
            <div className="mt-8 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-amber-900">
                <strong className="font-bold">The label always wins.</strong> Every number on this page depends on the
                concentration printed on your vial. If a result here disagrees with what your prescriber or pharmacist
                told you to draw, do not inject. Call them.
              </p>
            </div>

            <div className="mt-14 space-y-16">
              {/* 1. UNDERSTANDING YOUR CONVERSION ⭐ */}
              <Section
                id="understanding-your-conversion"
                heading={understandingConversion.heading}
                answer={understandingConversion.intro}
              >
                <figure className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                  <dl className="divide-y divide-slate-100">
                    {understandingConversion.example.rows.map((row) => (
                      <div
                        key={row.label}
                        className={`flex items-center justify-between gap-4 px-5 py-4 ${
                          "highlight" in row && row.highlight ? "bg-emerald-50" : "bg-white"
                        }`}
                      >
                        <dt className="text-sm text-slate-600 sm:text-base">{row.label}</dt>
                        <dd
                          className={`text-right font-bold ${
                            "highlight" in row && row.highlight
                              ? "text-2xl text-emerald-700 sm:text-3xl"
                              : "text-lg text-slate-900"
                          }`}
                        >
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <figcaption className="bg-slate-50 px-5 py-3 text-xs text-slate-500">
                    {understandingConversion.example.caption}
                  </figcaption>
                </figure>
              </Section>

              {/* 2. BEFORE YOU INJECT (3-step trust check) */}
              <Section id="before-you-inject" heading={beforeYouInject.heading} answer={beforeYouInject.intro}>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {beforeYouInject.checks.map((check) => (
                    <div key={check.title} className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600">
                          <Check className="h-4 w-4 text-white" aria-hidden="true" />
                        </span>
                        <h3 className="font-bold text-slate-900">{check.title}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-700">{check.body}</p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* 3. HOW MANY UNITS IS MY DOSE (dose cards) */}
              <Section id="how-many-units" heading={doseConversions.heading} answer={doseConversions.answer}>
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {doseConversions.cards.map((card) => (
                    <div key={card.dose} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold text-slate-900">{card.dose}</span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {card.drug}
                        </span>
                      </div>
                      <dl className="mt-4 space-y-2">
                        {card.values.map((v) => (
                          <div
                            key={v.concentration}
                            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                          >
                            <dt className="text-sm text-slate-500">{v.concentration}</dt>
                            <dd className="text-sm font-bold text-emerald-700">{v.units}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </Section>

              {/* 4. mg ↔ UNITS CONVERSION CHART */}
              <Section
                id="conversion-chart"
                heading="mg ↔ Units conversion chart"
                answer="Read the row for your dose or your units, then the column that matches your concentration. Every value assumes a U-100 insulin syringe, where 100 units equals 1 mL."
              >
                <ChartFigure chart={charts.mgToUnits} />
                {mgToUnitsTable && <ContentTable table={mgToUnitsTable} />}
                {unitsToMgTable && <ContentTable table={unitsToMgTable} />}
              </Section>

              {/* 5. WHY CONCENTRATION MATTERS */}
              <Section
                id="why-concentration-matters"
                heading={whyConcentration.heading}
                answer={whyConcentration.answer}
              >
                <ChartFigure chart={charts.concentration} />
                <figure className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                    {whyConcentration.example.rows.map((row) => (
                      <div key={row.concentration} className="p-5 text-center">
                        <p className="text-sm text-slate-500">
                          {row.dose} at {row.concentration}
                        </p>
                        <p className="mt-2 text-3xl font-bold text-emerald-700">{row.units}</p>
                      </div>
                    ))}
                  </div>
                  <figcaption className="bg-slate-50 px-5 py-3 text-xs text-slate-500">
                    {whyConcentration.example.caption}
                  </figcaption>
                </figure>
              </Section>

              {/* 6. BRAND PENS VS COMPOUNDED VIALS */}
              <Section id="brand-vs-compounded" heading={brandVsCompounded.heading} answer={brandVsCompounded.answer}>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {brandVsCompounded.rows.map((row) => (
                    <li
                      key={row.medication}
                      className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${
                        row.convert ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2 font-semibold text-slate-900">
                        <Pill className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        {row.medication}
                      </span>
                      {row.convert ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" /> Convert
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                          <X className="h-3.5 w-3.5" aria-hidden="true" /> No need
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </Section>

              {/* 7. CHOOSING THE RIGHT SYRINGE */}
              <Section id="choosing-a-syringe" heading={syringeChoice.heading} answer={syringeChoice.answer}>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {syringeChoice.cards.map((card) => (
                    <div key={card.size} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <Syringe className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                      <p className="mt-3 text-xl font-bold text-slate-900">{card.size}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {card.volume} · {card.markings}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-emerald-700">{card.bestFor}</p>
                    </div>
                  ))}
                </div>
                <ChartFigure chart={charts.syringe} />
              </Section>

              {/* 8. COMMON CONVERSION MISTAKES */}
              <Section id="common-mistakes" heading={commonMistakes.heading} answer={commonMistakes.answer}>
                <ul className="mt-6 space-y-3">
                  {commonMistakes.items.map((item) => (
                    <li key={item.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
                      <div>
                        <h3 className="font-bold text-slate-900">{item.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-700">{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Section>

              {/* 9. WHAT TO DO IF YOUR NUMBERS DON'T MATCH */}
              <Section id="numbers-dont-match" heading={numbersDontMatch.heading} answer={numbersDontMatch.answer}>
                <ol className="mt-6 space-y-3">
                  {numbersDontMatch.steps.map((step, i) => (
                    <li key={i} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                        {i + 1}
                      </span>
                      <span className="text-slate-700">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                  <p className="text-sm leading-relaxed text-amber-900">{numbersDontMatch.footer}</p>
                </div>
              </Section>

              {/* 10. WHY YOU CAN TRUST THIS CALCULATOR (EEAT) */}
              <Section id="why-trust-this" heading={trustSignals.heading} answer={trustSignals.answer}>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {trustSignals.items.map((item) => (
                    <div key={item.title} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                      <div>
                        <h3 className="font-bold text-slate-900">{item.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-700">{item.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-6 flex gap-3 rounded-2xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-600">
                  <Beaker className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                  {trustSignals.referencesNote}
                </p>
                <SourcesSection items={references.map((r) => ({ label: r.label, href: r.url }))} />
              </Section>

              {/* 11. COMMON GLP-1 CONVERSION QUESTIONS (long-tail cluster) */}
              <Section
                id="conversion-questions"
                heading="Common GLP-1 conversion questions"
                answer="Direct answers to the exact questions people type into search. Every one depends on your concentration, so read your label first."
              >
                <div className="mt-8 space-y-10">
                  {clusterGroups.map((group) => (
                    <div key={group.id} id={group.id} className="scroll-mt-20">
                      <h3 className="text-xl font-bold text-slate-900">{group.title}</h3>
                      <dl className="mt-4 space-y-3">
                        {group.items.map((item) => (
                          <div
                            key={item.question}
                            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                          >
                            <dt className="font-semibold text-slate-900">{item.question}</dt>
                            <dd className="mt-2 leading-relaxed text-slate-700">{item.answer}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Paid service CTA */}
              <ServiceCTA
                eyebrow="One syringe is a number. Every syringe is a pattern."
                title="Save your setup, then track every injection"
                body="This conversion solves the syringe in your hand today. Calqulate Vitals remembers your concentration and syringe, logs every injection you draw, charts your drug level between doses, and turns those weekly numbers into a picture of whether your treatment is actually working."
                bullets={[
                  "Your concentration and syringe, saved",
                  "Every injection on one timeline",
                  "Drug-level curves between weekly shots",
                  "Fat vs. muscle trend and plateau risk",
                ]}
                href="/product/glp1-progress-tracker"
                cta="Start the GLP-1 Progress Tracker"
              />

              {/* 12. GLP-1 JOURNEY HUB (internal links) */}
              <Section id="glp-1-journey" heading={journey.headline} answer={journey.body}>
                <ol className="mt-8 space-y-3">
                  {journey.steps.map((s, i) => (
                    <li key={s.label}>
                      <Link
                        href={s.href}
                        className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-700">
                          {i + 1}
                        </span>
                        <span className="flex-1">
                          <span className="block font-semibold text-slate-900 group-hover:text-emerald-700">
                            {s.question}
                          </span>
                          <span className="block text-sm text-slate-500">{s.label}</span>
                        </span>
                        <ArrowRight
                          className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-600"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ol>
              </Section>

              <RelatedCalculators
                items={[
                  { label: "Semaglutide Dose Calculator", href: "/health/semaglutide-dose-calculator" },
                  { label: "Tirzepatide Dose Calculator", href: "/health/tirzepatide-dose-calculator" },
                  { label: "GLP-1 Half-Life Calculator", href: "/health/glp-1-half-life-calculator" },
                  { label: "GLP-1 Body Composition Tracker", href: "/health/glp-1-dose-calculator" },
                  { label: "Lean Body Mass Calculator", href: "/health/lean-body-mass-calculator" },
                  { label: "Macro Calculator", href: "/health/macro-calculator" },
                ]}
              />
            </div>

            <CatalogRelatedCalculators slug="glp-1-unit-converter" />

            {/* Disclaimer */}
            <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm leading-relaxed text-slate-600">
                <strong className="text-slate-900">Medical Disclaimer:</strong> {medicalDisclaimer}
              </p>
            </div>

            {/* Author Badge Section */}
            <MedicalReviewerSection />
            <AuthorSection />
          </div>
        </div>
      </main>

      {/* Author Schema */}
      <AuthorSchema />

      <Footer />
    </div>
  )
}
