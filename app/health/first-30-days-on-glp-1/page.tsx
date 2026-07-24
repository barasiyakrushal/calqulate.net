import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { First30DaysChecklist } from "@/components/glp1/First30DaysChecklist";
import { FAQSchema } from "@/components/seo/structured-data";
import { FAQSection } from "@/components/seo/faq-section";
import { ServiceCTA } from "@/components/seo/service-cta";
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section";
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema";
import {
  Syringe,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ClipboardCheck,
  Beef,
  Droplets,
  CalendarClock,
} from "lucide-react";

const TITLE = "Your First 30 Days on a GLP-1: The Step-by-Step Checklist";
const DESCRIPTION =
  "Just got a GLP-1 prescription (Ozempic, Wegovy, Mounjaro, Zepbound) and no instructions? This free interactive 30-day checklist walks you through week by week — dosing, side effects, protein, and what to expect — so you start right.";

export const metadata: Metadata = {
  title: `${TITLE} | Calqulate.net`,
  description: DESCRIPTION,
  keywords:
    "first 30 days on ozempic, starting a glp-1, first month on wegovy what to expect, new glp-1 prescription no instructions, how to start semaglutide, glp-1 beginner checklist, first week on mounjaro, starting zepbound, glp-1 side effects week 1, what to do after getting ozempic prescription",
  alternates: {
    canonical: "https://calqulate.net/health/first-30-days-on-glp-1",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://calqulate.net/health/first-30-days-on-glp-1",
    siteName: "Calqulate",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const faqs = [
  {
    question: "I got a GLP-1 prescription but no instructions. What do I do first?",
    answer:
      "Start by confirming your exact starting dose against your pen or vial (almost everyone begins at the lowest dose for the first 4 weeks), store it in the fridge, pick a consistent weekly injection day, and stock up on protein and water. The interactive checklist on this page walks you through every step in order.",
  },
  {
    question: "What should I expect in the first month on Ozempic or Wegovy?",
    answer:
      "Expect a noticeable drop in appetite within the first week or two, and possible mild nausea, constipation, or fatigue that usually fades in days. Weight loss in month one is often modest and non-linear — a flat week around week 3 is normal. The goal of month one is tolerance and building habits, not maximum weight loss.",
  },
  {
    question: "How much protein should I eat on a GLP-1?",
    answer:
      "Because you're eating much less, protein quality matters more. A common target is about 1.2–1.6 g of protein per kilogram of body weight per day to protect muscle while you lose fat. Prioritise protein first at every meal. Use the macro calculator to find your specific number.",
  },
  {
    question: "When does the dose increase?",
    answer:
      "Most titration schedules step the dose up after 4 weeks, but only if side effects are manageable — the decision is your prescriber's, not automatic. Bring your logged symptoms to your appointment so you can decide together with real data.",
  },
  {
    question: "Is this checklist medical advice?",
    answer:
      "No. It's general educational guidance to help you organise your first month. Always follow the specific dosing and instructions from your own prescriber and pharmacist, and contact them with any questions about your medication.",
  },
];

// HowTo structured data — a step-by-step checklist is a natural HowTo.
const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Your First 30 Days on a GLP-1",
  description: DESCRIPTION,
  totalTime: "P30D",
  step: [
    { "@type": "HowToStep", name: "Before your first shot", text: "Confirm your starting dose, store the medication correctly, gather supplies, pick a weekly injection day, capture a day-zero baseline, and stock protein and electrolytes." },
    { "@type": "HowToStep", name: "Week 1 (Days 1–7)", text: "Take your first dose, eat smaller and slower meals, hit a daily protein target, hydrate well, and log how you feel." },
    { "@type": "HowToStep", name: "Week 2 (Days 8–14)", text: "Second dose on the same day and dose, get ahead of constipation, add short post-meal walks, and switch to weekly weigh-ins." },
    { "@type": "HowToStep", name: "Week 3 (Days 15–21)", text: "Start resistance training to protect muscle, check body composition, expect a normal stall, and confirm your refill timing." },
    { "@type": "HowToStep", name: "Week 4 (Days 22–30)", text: "Review your month-1 numbers, prepare for the titration conversation with your prescriber, know your missed-dose window, and set your month-2 plan." },
  ],
};

export default function First30DaysOnGlp1Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }} />
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />

      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-700">
              <Syringe className="h-3.5 w-3.5" />
              Prescription in hand? Start here.
            </div>
            <h1 className="mt-5 text-3xl font-bold leading-tight text-balance text-slate-900 md:text-5xl">
              Your First 30 Days on a GLP-1
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-pretty text-slate-600 md:text-xl">
              You have the medication and almost no instructions. This free, interactive checklist takes you
              week by week — dosing, side effects, protein, and what&apos;s normal — so you start Ozempic,
              Wegovy, Mounjaro, or Zepbound the right way. Your progress saves automatically.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a
                href="#checklist"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                Start the checklist <ArrowRight className="h-4 w-4" />
              </a>
              <span className="text-sm text-slate-500">Free · No sign-up to use · Saves in your browser</span>
            </div>
          </div>
        </section>

        {/* USP SUMMARY */}
        <section className="border-b border-emerald-100 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-6">
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <p className="text-sm leading-relaxed text-slate-700 md:text-base">
                The single biggest month-one mistake is having no plan — rushing the dose, under-eating
                protein, and quitting at the first stall. This checklist fixes all three. Tick each step as you
                go; when month one is done, Calqulate can carry the plan forward automatically.
              </p>
            </div>
          </div>
        </section>

        {/* THE CHECKLIST */}
        <section id="checklist" className="scroll-mt-20 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <div className="mb-8 text-center">
              <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-slate-900 md:text-3xl">
                <ClipboardCheck className="h-7 w-7 text-emerald-600" />
                The 30-day checklist
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-slate-600">
                Work through it at your own pace. Each step is short, and some link to a free tool that does
                the math for you.
              </p>
            </div>

            <First30DaysChecklist />
          </div>
        </section>

        {/* RED FLAGS — safety */}
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <div className="rounded-3xl border-2 border-red-200 bg-red-50/60 p-6 md:p-8">
              <h2 className="flex items-center gap-2 text-xl font-bold text-red-800 md:text-2xl">
                <ShieldAlert className="h-6 w-6 text-red-600" />
                When to stop and call your doctor
              </h2>
              <p className="mt-3 text-sm text-slate-700 md:text-base">
                Mild, fading side effects are expected. These are not — contact your prescriber or seek urgent
                care if you experience:
              </p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  "Severe or persistent vomiting, or the inability to keep fluids down",
                  "Severe stomach pain, especially pain that radiates to your back (possible pancreatitis)",
                  "Signs of a gallbladder problem — pain in the upper-right belly, fever, or yellowing skin/eyes",
                  "A rapid heartbeat, sweating, shakiness, or confusion (possible low blood sugar)",
                  "Signs of a serious allergic reaction — swelling, trouble breathing, or a spreading rash",
                  "Signs of dehydration — dizziness, very dark urine, or not urinating",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-500">
                This list is not exhaustive. When in doubt, always contact a healthcare professional.
              </p>
            </div>
          </div>
        </section>

        {/* THREE PILLARS */}
        <section className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <h2 className="text-center text-2xl font-bold text-slate-900 md:text-3xl">
              The three things that decide your month one
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: CalendarClock,
                  title: "Go slow on the dose",
                  body: "The lowest dose for a full 4 weeks isn't a delay — it's how you avoid the nausea that makes people quit. Tolerance first, dose later.",
                },
                {
                  icon: Beef,
                  title: "Protect your muscle",
                  body: "Eating far less makes protein and resistance training non-negotiable. Lose fat, keep muscle — that's the whole game on a GLP-1.",
                },
                {
                  icon: Droplets,
                  title: "Stay ahead of the gut",
                  body: "Water, fiber, and daily walks prevent the constipation and dehydration behind most week-1 and week-2 misery.",
                },
              ].map((pillar) => (
                <div key={pillar.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <pillar.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold text-slate-900">{pillar.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{pillar.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SIGNUP CTA — connect to the adaptive protocol / dashboard guide */}
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <ServiceCTA
              eyebrow="After month one"
              title="Turn this checklist into an adaptive protocol"
              body="Month one builds the habits. Month two is where a plan that adapts to your body pays off — logging every dose, weight, and side effect, then adjusting your titration, protein, and training automatically."
              bullets={[
                "Log doses, weight, and side effects in one place",
                "A weekly plan that adapts to how you actually respond",
                "See fat-vs-muscle trends, not just the scale",
                "Free to start — no card required",
              ]}
              href="/signup?next=/dashboard/glp1"
              cta="Start free"
              learnMoreHref="/product/glp1-progress-tracker"
              learnMoreLabel="See the GLP-1 tracker"
            />
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
            <FAQSection faqs={faqs} />
          </div>
        </section>

        {/* Related GLP-1 tools */}
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 pb-16">
            <h2 className="text-lg font-bold text-slate-900">Free GLP-1 tools for your first month</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { label: "Injection Day Calculator", href: "/health/glp-1-injection-day-calculator" },
                { label: "Semaglutide Dose Calculator", href: "/health/semaglutide-dose-calculator" },
                { label: "Tirzepatide Dose Calculator", href: "/health/tirzepatide-dose-calculator" },
                { label: "GLP-1 Unit Converter", href: "/health/glp-1-unit-converter" },
                { label: "Half-Life / Missed Dose", href: "/health/glp-1-half-life-calculator" },
                { label: "Fat-vs-Muscle Tracker", href: "/health/glp-1-dose-calculator" },
                { label: "Protein / Macro Calculator", href: "/health/macro-calculator" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                >
                  {l.label}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <MedicalReviewerSection lastReviewed="July 24, 2026" />
      </main>

      <Footer />
    </div>
  );
}
