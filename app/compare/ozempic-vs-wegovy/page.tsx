import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CompareTable, type CompareRow } from "@/components/compare/CompareTable";
import { FAQSchema } from "@/components/seo/structured-data";
import { FAQSection } from "@/components/seo/faq-section";
import { MedicalReviewerSection } from "@/components/seo/medical-reviewer-section";
import { MedicalReviewerSchema } from "@/components/seo/medical-reviewer-schema";
import { wegovyVsOzempic } from "@/lib/blog/semaglutide-dosage-data";
import { formatCitation, type Reference } from "@/lib/citations";
import { CheckCircle2, ArrowRight, TrendingDown, Wallet, ShieldCheck, Info } from "lucide-react";

const REFERENCES: Reference[] = [
  {
    title: "Wegovy (semaglutide) Prescribing Information",
    publisher: "U.S. Food & Drug Administration (FDA)",
    year: 2023,
    url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/215256s007lbl.pdf",
  },
  {
    title: "Ozempic (semaglutide) Prescribing Information",
    publisher: "U.S. Food & Drug Administration (FDA)",
    year: 2025,
    url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/209637s025lbl.pdf",
  },
  {
    title: "Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1)",
    authors: "Wilding JPH, Batterham RL, Calanna S, et al.",
    journal: "N Engl J Med",
    year: 2021,
    volume: "384",
    issue: "11",
    pages: "989–1002",
    doi: "10.1056/NEJMoa2032183",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183",
  },
];

const TITLE = "Ozempic vs Wegovy: What's the Difference? (2026 Comparison)";
const DESCRIPTION =
  "Ozempic and Wegovy are the same drug — semaglutide — with different labels, doses, and insurance coverage. Here's a clear side-by-side comparison to help you and your doctor choose.";

export const metadata: Metadata = {
  title: `${TITLE} | Calqulate.net`,
  description: DESCRIPTION,
  keywords:
    "ozempic vs wegovy, wegovy vs ozempic, difference between ozempic and wegovy, ozempic or wegovy for weight loss, is ozempic the same as wegovy, semaglutide brands, ozempic wegovy dose difference, ozempic wegovy cost",
  alternates: { canonical: "https://calqulate.net/compare/ozempic-vs-wegovy" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://calqulate.net/compare/ozempic-vs-wegovy",
    siteName: "Calqulate",
    type: "article",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// Reuse the verified Wegovy-vs-Ozempic rows; present Ozempic first to match the
// query "ozempic vs wegovy". Tint the label-based "winner" where one is clearer.
const rows: CompareRow[] = wegovyVsOzempic.map((r) => ({
  feature: r.feature,
  left: r.ozempic,
  right: r.wegovy,
  winner:
    r.feature === "FDA-approved use"
      ? "right"
      : r.feature === "Maximum / maintenance dose"
      ? "right"
      : undefined,
}));

const faqs = [
  {
    question: "Are Ozempic and Wegovy the same thing?",
    answer:
      "Yes and no. They contain the exact same active drug — semaglutide — made by the same company. But Ozempic is FDA-approved for type 2 diabetes and Wegovy is FDA-approved for chronic weight management, and Wegovy goes up to a higher dose (2.4 mg vs 2.0 mg). So they're the same molecule with different labels, doses, pens, and insurance coverage.",
  },
  {
    question: "Which is better for weight loss, Ozempic or Wegovy?",
    answer:
      "Wegovy is the one actually approved and dosed for weight loss (up to 2.4 mg), and the STEP 1 trial that showed ~15% average weight loss used that dose. Ozempic can produce weight loss too, but using it for weight loss is off-label and it caps at 2.0 mg. For pure weight management, Wegovy is the on-label choice — but access and cost often decide it.",
  },
  {
    question: "Can I get Ozempic for weight loss?",
    answer:
      "Some clinicians prescribe Ozempic off-label for weight loss, often because it's easier to get covered than Wegovy. It's legal and common, but it isn't the FDA-approved use, and it tops out at a lower dose than Wegovy. This is a decision to make with your prescriber.",
  },
  {
    question: "How much do Ozempic and Wegovy cost?",
    answer:
      "Both carry high US list prices — roughly $1,000–$1,350 per month before insurance. What you actually pay depends heavily on coverage: diabetes drugs like Ozempic are more often covered, while many plans exclude weight-management drugs like Wegovy. Manufacturer savings cards can cut costs for commercially insured patients. Always confirm current pricing with your pharmacy and plan.",
  },
];

export default function OzempicVsWegovyPage() {
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
              Ozempic vs Wegovy
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-pretty text-slate-600 md:text-xl">
              Here&apos;s the thing most people don&apos;t realise: Ozempic and Wegovy are the{" "}
              <strong>exact same drug</strong> — semaglutide. The real differences are what they&apos;re
              approved for, how high the dose goes, and whether your insurance will cover it.
            </p>
          </div>
        </section>

        {/* QUICK VERDICT */}
        <section className="border-b border-emerald-100 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Ozempic</p>
                <p className="mt-1 text-lg font-bold text-slate-900">Built for type 2 diabetes</p>
                <p className="mt-2 text-sm text-slate-600">
                  Same molecule, multi-dose pen, caps at 2.0 mg. Often easier to get covered by insurance.
                  Weight loss is an off-label use.
                </p>
              </div>
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">Wegovy</p>
                <p className="mt-1 text-lg font-bold text-slate-900">Built for weight management</p>
                <p className="mt-2 text-sm text-slate-600">
                  Same molecule, single-dose pens, goes up to 2.4 mg — the dose used in the STEP 1 weight-loss
                  trial. The on-label choice for weight loss.
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
              left={{ label: "Ozempic", sublabel: "For type 2 diabetes", accent: "text-slate-700 dark:text-slate-200" }}
              right={{ label: "Wegovy", sublabel: "For weight loss", accent: "text-emerald-700 dark:text-emerald-400" }}
              rows={rows}
            />
            <p className="mt-3 text-xs text-slate-400">
              Highlighted cells indicate the clearer choice for weight management. Sourced from FDA prescribing
              information — see references below.
            </p>
          </div>
        </section>

        {/* HOW MUCH WILL I LOSE — calculator link */}
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white shadow-xl md:flex-row md:items-center">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold">
                  <TrendingDown className="h-6 w-6" /> How much would you lose?
                </h2>
                <p className="mt-2 max-w-xl text-emerald-50">
                  Project your expected weight loss on semaglutide from your own weight and dose, using the real
                  STEP 1 trial averages.
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
                  icon: ShieldCheck,
                  title: "You have type 2 diabetes",
                  body: "Ozempic is the on-label choice and is usually the easier one to get covered. The weight loss that often comes with it is a welcome bonus.",
                },
                {
                  icon: CheckCircle2,
                  title: "Your goal is weight loss and you have coverage",
                  body: "Wegovy is purpose-built for this — it's approved for weight management and reaches the 2.4 mg dose used in the trials.",
                },
                {
                  icon: Wallet,
                  title: "Cost or coverage is the deciding factor",
                  body: "Many people end up on whichever their insurance will pay for. Some prescribers use Ozempic off-label for weight loss when Wegovy isn't covered. Confirm coverage before you commit.",
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
                This is educational information, not a prescription or medical advice. The right medication — and
                whether one is appropriate at all — is a decision for you and a licensed clinician.
              </span>
            </div>
          </div>
        </section>

        {/* CROSS LINKS */}
        <section className="bg-white">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <div className="grid gap-4 sm:grid-cols-3">
              <Link href="/compare/tirzepatide-vs-semaglutide" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300">
                <p className="font-bold text-slate-900">Tirzepatide vs Semaglutide</p>
                <p className="mt-1 text-sm text-slate-500">The other big decision — Zepbound vs Wegovy.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Compare <ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
              <Link href="/blog/semaglutide-dosage-chart" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300">
                <p className="font-bold text-slate-900">Semaglutide Dosage Chart</p>
                <p className="mt-1 text-sm text-slate-500">Full Wegovy & Ozempic titration schedule.</p>
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
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              {REFERENCES.map((r) => (
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
