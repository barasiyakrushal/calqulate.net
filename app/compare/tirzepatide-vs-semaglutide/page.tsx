import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CompareTable, type CompareRow } from "@/components/compare/CompareTable";
import { FAQSchema } from "@/components/seo/structured-data";
import { FAQSection } from "@/components/seo/faq-section";
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section";
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema";
import { EFFICACY_REFERENCES } from "@/lib/glp1/efficacy";
import { formatCitation, type Reference } from "@/lib/citations";
import { CheckCircle2, ArrowRight, TrendingDown, Wallet, Zap, Info, FlaskConical } from "lucide-react";

// SURMOUNT-5 — the direct head-to-head trial, cited separately from the pivotal
// trials so the evidence types stay clearly distinguished.
const SURMOUNT5_REFERENCE: Reference = {
  title: "Tirzepatide as Compared with Semaglutide for the Treatment of Obesity (SURMOUNT-5)",
  authors: "Aronne LJ, Horn DB, le Roux CW, et al.",
  journal: "N Engl J Med",
  year: 2025,
  volume: "393",
  pages: "26–36",
  doi: "10.1056/NEJMoa2416394",
  url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2416394",
};

const TITLE = "Tirzepatide vs Semaglutide: Which Wins for Weight Loss? (2026)";
const DESCRIPTION =
  "Tirzepatide (Zepbound, Mounjaro) vs semaglutide (Wegovy, Ozempic) compared head to head — average weight loss, how they work, dosing, side effects, and cost, using real trial data.";

export const metadata: Metadata = {
  title: `${TITLE} | Calqulate.net`,
  description: DESCRIPTION,
  keywords:
    "tirzepatide vs semaglutide, semaglutide vs tirzepatide, zepbound vs wegovy, mounjaro vs ozempic, tirzepatide or semaglutide for weight loss, which is better tirzepatide or semaglutide, dual agonist vs glp-1",
  alternates: { canonical: "https://calqulate.net/compare/tirzepatide-vs-semaglutide" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://calqulate.net/compare/tirzepatide-vs-semaglutide",
    siteName: "Calqulate",
    type: "article",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const rows: CompareRow[] = [
  {
    feature: "How it works",
    left: "Dual agonist — activates both GIP and GLP-1 receptors",
    right: "Single agonist — activates the GLP-1 receptor",
    winner: "left",
  },
  {
    feature: "Brand names",
    left: "Zepbound (weight), Mounjaro (diabetes)",
    right: "Wegovy (weight), Ozempic (diabetes), Rybelsus (oral)",
  },
  {
    feature: "Avg. weight loss in pivotal trial",
    left: "≈ 15% (5 mg), 19.5% (10 mg), 20.9% (15 mg) — SURMOUNT-1, 72 wks",
    right: "≈ 14.9% at 2.4 mg — STEP 1, 68 wks",
    winner: "left",
  },
  {
    feature: "Maximum weekly dose",
    left: "15 mg",
    right: "2.4 mg (Wegovy)",
  },
  {
    feature: "How it's taken",
    left: "Once-weekly injection",
    right: "Once-weekly injection (or a daily pill, Rybelsus)",
    winner: "right",
  },
  {
    feature: "Main side effects",
    left: "Nausea, diarrhea, constipation (mostly early, dose-related)",
    right: "Nausea, diarrhea, constipation (mostly early, dose-related)",
  },
  {
    feature: "Track record",
    left: "Newer to market",
    right: "Longer real-world and safety track record",
    winner: "right",
  },
  {
    feature: "Approved uses",
    left: "Type 2 diabetes (Mounjaro) + chronic weight management (Zepbound)",
    right: "Type 2 diabetes (Ozempic/Rybelsus) + chronic weight management (Wegovy)",
  },
];

const faqs = [
  {
    question: "Which is better for weight loss, tirzepatide or semaglutide?",
    answer:
      "On average, tirzepatide produces more weight loss. The strongest evidence is SURMOUNT-5, the head-to-head trial that compared the two directly: over 72 weeks, tirzepatide led to about 20% average weight loss versus about 14% for semaglutide, in adults with obesity without diabetes. Its dual GIP/GLP-1 action appears to give it an edge — but the best drug for you is the one you can access, afford, tolerate, and stay on.",
  },
  {
    question: "What's the actual difference between them?",
    answer:
      "Semaglutide mimics one gut hormone (GLP-1). Tirzepatide mimics two (GIP and GLP-1), which is why it's called a dual agonist. Both slow stomach emptying and reduce appetite; the second target on tirzepatide is thought to explain its larger average weight loss. Semaglutide has a longer track record and a pill option (Rybelsus).",
  },
  {
    question: "Are the side effects different?",
    answer:
      "They're broadly similar — mostly gastrointestinal (nausea, diarrhea, constipation), most common early and when the dose increases, and usually improving over time. Slow, patient dose titration is the main way to keep either one tolerable.",
  },
  {
    question: "Which is cheaper?",
    answer:
      "US list prices are generally around $1,000–$1,350 per month before insurance, depending on the medication and manufacturer pricing. Actual out-of-pocket costs vary widely based on insurance coverage, manufacturer savings programs, and pharmacy pricing. Always confirm current pricing with your pharmacy and health plan.",
  },
];

export default function TirzepatideVsSemaglutidePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <FAQSchema faqs={faqs} />
      <MedicalReviewerSchema />
      <Header />

      <main id="main" className="flex-1">
        {/* HERO */}
        <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
          <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">GLP-1 comparison</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-balance text-slate-900 md:text-5xl">
              Tirzepatide vs Semaglutide
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-pretty text-slate-600 md:text-xl">
              The two heavyweights of weight loss. Tirzepatide (Zepbound, Mounjaro) hits two hormone targets and
              wins on average weight loss; semaglutide (Wegovy, Ozempic) has the longer track record and a pill
              option. Here&apos;s how they really stack up.
            </p>
          </div>
        </section>

        {/* QUICK VERDICT */}
        <section className="border-b border-emerald-100 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">Tirzepatide</p>
                <p className="mt-1 text-lg font-bold text-slate-900">The efficacy leader</p>
                <p className="mt-2 text-sm text-slate-600">
                  Dual GIP + GLP-1 action and the largest average weight loss of any approved obesity drug — up
                  to ~21% at 15 mg. Injection only.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Semaglutide</p>
                <p className="mt-1 text-lg font-bold text-slate-900">The proven standard</p>
                <p className="mt-2 text-sm text-slate-600">
                  Powerful ~15% average loss, a longer real-world track record, and the only one with an oral
                  pill option (Rybelsus).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="bg-slate-50/60">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
            <h2 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">Side by side</h2>
            <CompareTable
              left={{ label: "Tirzepatide", sublabel: "Zepbound / Mounjaro", accent: "text-emerald-700 dark:text-emerald-400" }}
              right={{ label: "Semaglutide", sublabel: "Wegovy / Ozempic", accent: "text-slate-700 dark:text-slate-200" }}
              rows={rows}
            />
            <p className="mt-3 text-xs text-slate-400">
              Highlighted cells indicate the stronger option for that row. The efficacy figures above come from
              each drug&apos;s own pivotal trial and are <strong>not a head-to-head comparison</strong> — those
              trials enrolled different patients under different designs. For direct evidence, see SURMOUNT-5
              below.
            </p>
          </div>
        </section>

        {/* SURMOUNT-5 — DIRECT COMPARISON EVIDENCE */}
        <section className="border-t border-slate-100 bg-white">
          <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              <FlaskConical className="h-3.5 w-3.5" /> Direct comparison evidence
            </span>
            <h2 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
              What do head-to-head studies show?
            </h2>
            <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-slate-700">
              <p>
                The pivotal trials in the table above shouldn&apos;t be compared directly: STEP&nbsp;1 and
                SURMOUNT-1 enrolled different patients, ran for different lengths, and used different study
                designs. A cross-trial comparison can only hint at a difference — it can&apos;t prove one.
              </p>
              <p>
                <strong>SURMOUNT-5</strong> settles that by putting the two drugs in the same randomized trial.
                It compared tirzepatide and semaglutide, each titrated to its maximum tolerated dose, in adults
                with obesity but <em>without</em> diabetes over 72 weeks — the first large head-to-head between
                them.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Tirzepatide</p>
                <p className="mt-1 text-4xl font-extrabold text-emerald-700">≈ 20%</p>
                <p className="text-xs text-slate-500">average body-weight loss at 72 weeks</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Semaglutide</p>
                <p className="mt-1 text-4xl font-extrabold text-slate-900">≈ 14%</p>
                <p className="text-xs text-slate-500">average body-weight loss at 72 weeks</p>
              </div>
            </div>

            <p className="mt-5 text-[17px] leading-relaxed text-slate-700">
              In plain terms: in this one trial, tirzepatide produced meaningfully greater average weight loss
              than semaglutide, and more participants reached the larger weight-loss milestones. Both drugs still
              produced substantial loss, and the side-effect profiles were broadly similar.
            </p>

            <div className="mt-5 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
              <span>
                These results apply to SURMOUNT-5&apos;s specific population (adults with obesity, without
                diabetes) and its treatment protocol (maximum tolerated doses). They don&apos;t predict any one
                person&apos;s result, and &ldquo;more average weight loss&rdquo; still isn&apos;t the same as
                &ldquo;the right choice for you&rdquo; — access, tolerability, and staying on it matter just as
                much. See the{" "}
                <a
                  href={SURMOUNT5_REFERENCE.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="font-medium text-emerald-700 hover:underline"
                >
                  full trial
                </a>{" "}
                for details.
              </span>
            </div>
          </div>
        </section>

        {/* HOW MUCH WILL I LOSE — calculator link */}
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white shadow-xl md:flex-row md:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold">
                  <TrendingDown className="h-6 w-6" /> See your numbers on each
                </h2>
                <p className="mt-2 max-w-xl text-emerald-50">
                  Enter your weight and compare projected loss on tirzepatide vs semaglutide, using the real
                  SURMOUNT-1 and STEP 1 trial averages.
                </p>
              </div>
              <Link
                href="/health/glp-1-weight-loss-projection-calculator"
                className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              >
                Open the projection calculator <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* DECISION GUIDE */}
        <section className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Which one is right for you?</h2>
            <div className="mt-6 space-y-4">
              {[
                {
                  icon: TrendingDown,
                  title: "You want maximum average weight loss",
                  body: "Tirzepatide has the edge on the numbers, thanks to its dual GIP/GLP-1 mechanism and higher ceiling of loss.",
                },
                {
                  icon: Zap,
                  title: "You'd prefer a pill, or a longer track record",
                  body: "Semaglutide is the only one with an oral option (Rybelsus) and has been in wide use longer, which some people and prescribers prefer.",
                },
                {
                  icon: Wallet,
                  title: "Access and cost are the deciding factor",
                  body: "For most people it comes down to what their insurance covers and what they can tolerate. The best drug is the one you can actually stay on.",
                },
                {
                  icon: CheckCircle2,
                  title: "Either way — protect your muscle",
                  body: "Whichever you choose, up to 40% of the weight lost can be muscle without enough protein and resistance training. That's the real make-or-break for keeping it off.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-2 rounded-xl bg-slate-100 p-4 text-sm text-slate-500">
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
              <span>
                Educational information, not a prescription or medical advice. Which medication is appropriate —
                if any — is a decision for you and a licensed clinician.
              </span>
            </div>
          </div>
        </section>

        {/* CROSS LINKS */}
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <div className="grid gap-4 sm:grid-cols-3">
              <Link href="/compare/ozempic-vs-wegovy" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300">
                <p className="font-bold text-slate-900">Ozempic vs Wegovy</p>
                <p className="mt-1 text-sm text-slate-500">Same drug, different label — how to choose.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Compare <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
              <Link href="/answers/best-glp-1-for-weight-loss" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300">
                <p className="font-bold text-slate-900">Best GLP-1 for weight loss</p>
                <p className="mt-1 text-sm text-slate-500">The short answer, and how to pick.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Read <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
              <Link href="/health/first-30-days-on-glp-1" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300">
                <p className="font-bold text-slate-900">First 30 Days on a GLP-1</p>
                <p className="mt-1 text-sm text-slate-500">Got a prescription? Your step-by-step start.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Start <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
            <FAQSection faqs={faqs} />
          </div>
        </section>

        {/* REFERENCES */}
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-6 py-10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Sources</h2>
            <p className="mt-2 text-xs text-slate-400">
              Evidence hierarchy: FDA prescribing information, pivotal clinical trials, and the SURMOUNT-5
              head-to-head trial for direct comparison.
            </p>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              {[SURMOUNT5_REFERENCE, ...EFFICACY_REFERENCES].map((r) => (
                <li key={r.url}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="font-medium text-emerald-700 hover:underline">
                    {r.title}
                  </a>
                  <span className="mt-0.5 block text-xs text-slate-400">{formatCitation(r)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <MedicalReviewerSection lastReviewed="July 24, 2026" />
      </main>

      <Footer />
    </div>
  );
}
