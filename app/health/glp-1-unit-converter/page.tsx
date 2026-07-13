import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import Glp1InjectionSafetyAssistant from "@/components/calculators/glp1-injection-safety-assistant"
import { CalculatorSchema, FAQSchema } from "@/components/seo/structured-data"
import { FAQSection } from "@/components/seo/faq-section"
import { AuthorSection } from "@/components/seo/author-section"
import { AuthorSchema } from "@/components/seo/author-schema"
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section"
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema"
import { ServiceCTA } from "@/components/seo/service-cta"
import { SourcesSection } from "@/components/seo/sources-section"
import { RelatedCalculators } from "@/components/seo/related-calculators"
import { RelatedCalculators as CatalogRelatedCalculators } from "@/components/calculators/related-calculators"
import { ArrowRight, ShieldCheck, ShieldAlert } from "lucide-react"
import {
  SITE,
  seo,
  educationSections,
  clusterGroups,
  journey,
  faq,
  references,
  medicalDisclaimer,
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

/** The cluster answers are FAQ-shaped, so they feed the FAQ schema too. */
const allFaqs = [...faq, ...clusterGroups.flatMap((g) => g.items)]

function ContentTable({
  table,
}: {
  table: { caption: string; headers: string[]; rows: string[][] }
}) {
  return (
    <figure className="mt-8 overflow-x-auto rounded-2xl border border-slate-200">
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
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <CalculatorSchema name="GLP-1 Unit Converter" description={DESCRIPTION} url={URL} />
      <FAQSchema faqs={allFaqs} />
      <MedicalReviewerSchema />

      <Header />

      <main id="main" className="flex-1">
        {/* CONVERTER: hero, wizard and injection snapshot live in the component */}
        <Glp1InjectionSafetyAssistant />

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-sm font-medium text-gray-500 mt-6 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
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

            <div className="prose prose-gray dark:prose-invert max-w-none mt-16 space-y-16">
              {educationSections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-20">
                  <h2 className="mb-6 text-3xl font-bold text-slate-900">{section.heading}</h2>

                  {section.paragraphs.map((paragraph, i) => (
                    <p key={i} className="text-lg text-slate-700 leading-relaxed mt-4 first:mt-0">
                      {paragraph}
                    </p>
                  ))}

                  {section.table && <ContentTable table={section.table} />}

                  {section.list && (
                    <ul className="mt-6 space-y-3">
                      {section.list.map((item, i) => (
                        <li key={i} className="flex gap-3 items-start text-slate-700">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.tip && (
                    <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                      <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                      <p className="text-sm leading-relaxed text-amber-900">{section.tip}</p>
                    </div>
                  )}

                  {section.related && (
                    <Link
                      href={section.related.href}
                      className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      {section.related.label}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}
                </section>
              ))}

              {/* CONTENT CLUSTER: conversion charts and the long tail */}
              <section id="conversion-charts" className="scroll-mt-20">
                <h2 className="mb-4 text-3xl font-bold text-slate-900">GLP-1 Conversion Charts and Common Questions</h2>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Every answer below assumes a U-100 insulin syringe, where 100 units equals 1 mL. None of them mean
                  anything without your concentration, so read your label first and use the chart that matches it.
                </p>

                <div className="mt-10 space-y-12">
                  {clusterGroups.map((group) => (
                    <div key={group.id} id={group.id} className="scroll-mt-20">
                      <h3 className="text-2xl font-bold text-slate-900">{group.title}</h3>
                      {group.intro && (
                        <p className="mt-3 text-slate-700 leading-relaxed">{group.intro}</p>
                      )}
                      {group.table && <ContentTable table={group.table} />}
                      <dl className="mt-6 space-y-4">
                        {group.items.map((item) => (
                          <div key={item.question} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <dt className="font-semibold text-slate-900">{item.question}</dt>
                            <dd className="mt-2 leading-relaxed text-slate-700">{item.answer}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </section>

              {/* THE GLP-1 JOURNEY: each tool answers one urgent question */}
              <section id="glp-1-journey" className="scroll-mt-20">
                <h2 className="mb-4 text-3xl font-bold text-slate-900">{journey.headline}</h2>
                <p className="text-lg text-slate-700 leading-relaxed">{journey.body}</p>
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
              </section>

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

              <SourcesSection items={references.map((r) => ({ label: r.label, href: r.url }))} />
            </div>

            <CatalogRelatedCalculators slug="glp-1-unit-converter" />

            {/* FAQ Section */}
            <div className="mt-12 pt-8 border-t border-slate-100">
              <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
              <FAQSection faqs={faq} />
            </div>

            {/* Disclaimer */}
            <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <p className="text-sm text-slate-600 leading-relaxed">
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
