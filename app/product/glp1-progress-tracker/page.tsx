import type { Metadata } from "next";
import Link from "next/link";
import {
  Syringe, Utensils, LineChart, Scale, HeartPulse, ShieldCheck, BellRing, Target,
  Activity, FlaskConical, Dumbbell, Sparkles, FileText, Pill, Flame,
  ArrowRight, Star, BadgeCheck, CloudUpload,
} from "lucide-react";
import { Reveal } from "@/components/glp1/marketing/Reveal";
import { CountUp } from "@/components/glp1/marketing/CountUp";
import { FaqAccordion } from "@/components/glp1/marketing/FaqAccordion";
import { ScreenshotFrame } from "@/components/glp1/marketing/ScreenshotFrame";
import { SinglePlan } from "@/components/vitals/SinglePlan";
import { StickyCtaBar } from "@/components/glp1/marketing/StickyCtaBar";
import { MoatSection } from "@/components/marketing/MoatSection";
import { getReviews } from "@/lib/reviews";
import { getAccess, hasPaidAccess } from "@/lib/auth";
import { OFFER_ENRICHMENT } from "@/lib/seo/product-offer";

export const metadata: Metadata = {
  title: "GLP-1 Tracker + Heart Age & Metabolism | Calqulate",
  description:
    "Track every GLP-1 shot, side effect & pound in one app. Free dose-level curves plus heart-age & metabolism. Your data is never lost.",
  keywords:
    "GLP-1 tracker, GLP-1 shot tracker app, semaglutide tracker, tirzepatide tracker, weekly injection reminder, ozempic tracker, wegovy tracker, mounjaro tracker, zepbound tracker",
  alternates: { canonical: "https://calqulate.net/product/glp1-progress-tracker" },
  openGraph: {
    title: "The All-in-One GLP-1 Tracker That Actually Has Your Back",
    description:
      "Track shots, food, weight & side effects in one place. Free medication-level curves, plus a bonus Heart Age & Metabolism tracker. Your data never disappears.",
    url: "https://calqulate.net/product/glp1-progress-tracker",
    type: "website",
    siteName: "Calqulate",
  },
};

// ─── Content ────────────────────────────────────────────────────────────────

const MEDS = ["Ozempic", "Wegovy", "Mounjaro", "Zepbound", "Rybelsus", "Saxenda", "Victoza", "Trulicity"];

const WHAT_YOU_GET = [
  { icon: Syringe, t: "Every shot in one place", d: "Log doses, timing and sites — never miss one." },
  { icon: Utensils, t: "Track food the GLP-1 way", d: "Protein, fiber and water first, calories second." },
  { icon: LineChart, t: "Medication-level curves", d: "See active drug rise and fall through the week." },
  { icon: Scale, t: "Real body composition", d: "Watch fat vs. lean mass, not just the scale." },
  { icon: HeartPulse, t: "Bonus heart age & metabolism", d: "Two extra trackers in the same plan." },
  { icon: ShieldCheck, t: "Your data, backed up & yours", d: "Automatic backup, export anytime. Never lost." },
];

const FREE_LIST = [
  { icon: Syringe, t: "Shot & dose logging", d: "One-tap logging with a full history for every GLP-1." },
  { icon: BellRing, t: "Smart dose reminders", d: "Set your shot day; get a reminder + live countdown." },
  { icon: Target, t: "Injection-site rotation", d: "A body map remembers the last site and suggests the next." },
  { icon: Pill, t: "Dose & titration schedule", d: "Plan your step-up and see what comes next." },
  { icon: Scale, t: "Weight tracking with real charts", d: "Decimal-precise weight and a calm trend line." },
  { icon: Activity, t: "Side-effects that get it", d: "Severity scale — plus a “no symptoms today” option." },
];

const PREMIUM = [
  { icon: Dumbbell, t: "Body-composition tracking", d: "Up to a third of GLP-1 weight loss can be muscle. We track fat vs. lean mass and warn you if you’re losing too much muscle.", hero: true },
  { icon: Target, t: "“Am I on track?” benchmarking", d: "Compare your loss and side effects against published clinical-trial results for your exact medication and dose." },
  { icon: FlaskConical, t: "Lab & biomarker tracking", d: "Log A1c, fasting glucose, cholesterol and blood pressure, and watch them improve." },
  { icon: Activity, t: "Exercise & strength logging", d: "Track workouts with a focus on the resistance training that protects muscle." },
  { icon: Sparkles, t: "Smart food estimate", d: "Type your meal and we instantly estimate protein, fiber and calories — no tedious database search." },
  { icon: FileText, t: "Doctor-ready PDF report", d: "Export a clean, one-page summary for your next appointment." },
  { icon: Pill, t: "Refill & cost tracking", d: "Keep refill dates, copay and savings-card details in one place." },
];

const COMPARE: { feature: string; us: "yes" | "free" | "best"; shotsy: "yes" | "no" | "premium"; glapp: "yes" | "no" }[] = [
  { feature: "Shot logging + reminders", us: "yes", shotsy: "yes", glapp: "yes" },
  { feature: "Injection-site rotation", us: "yes", shotsy: "yes", glapp: "yes" },
  { feature: "Food, protein, water logging", us: "yes", shotsy: "yes", glapp: "no" },
  { feature: "Medication-level curves", us: "free", shotsy: "premium", glapp: "yes" },
  { feature: "“Am I on track?” benchmarking", us: "yes", shotsy: "no", glapp: "yes" },
  { feature: "Body composition (fat vs muscle)", us: "best", shotsy: "no", glapp: "no" },
  { feature: "Lab / biomarker tracking", us: "yes", shotsy: "no", glapp: "no" },
  { feature: "Exercise / strength logging", us: "yes", shotsy: "no", glapp: "no" },
  { feature: "Smart food estimate", us: "yes", shotsy: "no", glapp: "no" },
  { feature: "Heart Age tracker", us: "best", shotsy: "no", glapp: "no" },
  { feature: "Metabolism tracker", us: "best", shotsy: "no", glapp: "no" },
  { feature: "Automatic backup + export", us: "best", shotsy: "no", glapp: "yes" },
  { feature: "Works on web", us: "best", shotsy: "no", glapp: "yes" },
];

// Real, permissioned reviews only (empty until collected) — see lib/reviews.ts.
// `rating` is carried through so we render the stars the member actually gave,
// never a hardcoded 5.
const TESTIMONIALS = getReviews("glp1").map((r) => ({ q: r.quote, n: r.name, m: r.context, r: r.rating }));

const FAQS = [
  { q: "What is a GLP-1 tracker app?", a: "A GLP-1 tracker helps you log your weekly medication, side effects, food and weight in one place. Calqulate Vitals also shows your medication levels, body composition, heart age and metabolism, so you understand how your treatment is working." },
  { q: "Which medications does Calqulate Vitals support?", a: "All major GLP-1 medications, including Ozempic, Wegovy, Mounjaro, Zepbound, Rybelsus, Saxenda, Victoza and Trulicity — covering semaglutide, tirzepatide, liraglutide and dulaglutide." },
  { q: "How do I know when my next shot is due?", a: "Set your shot day once. Calqulate Vitals sends a reminder and shows a live countdown to your next dose, so you never have to guess." },
  { q: "Can it help with food noise and cravings?", a: "Yes. Your free medication-level chart shows when your medication is fading, which is often when cravings return. You can log food noise daily and see your patterns." },
  { q: "Will I lose muscle on a GLP-1 medication?", a: "Some muscle loss is common during weight loss. Our body-composition tracker helps you see fat versus lean mass and flags if you’re losing too much muscle, so you can adjust your protein and training." },
  { q: "Is my data private and safe?", a: "Yes. Your data is encrypted, backed up automatically and never sold. You can export everything anytime, and if you switch devices your full history comes with you." },
  { q: "Can I use Calqulate Vitals on the web?", a: "Yes. Calqulate Vitals works right in your browser on your computer or phone, with a dedicated mobile app coming soon." },
  { q: "How is this different from Shotsy?", a: "Shotsy puts medication-level charts behind a paywall and has no body composition, heart age or metabolism tracking. Calqulate Vitals includes all of that for the same $9.99 a month." },
  { q: "How is this different from Glapp?", a: "Glapp is free but does not track food, exercise or body composition. Calqulate Vitals is a true all-in-one, with bonus heart age and metabolism tracking." },
  { q: "Do I have to pay to start?", a: "No. You can start free and keep core tracking and medication-level charts at no cost. Premium unlocks the deeper features and bonus trackers." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      name: "Calqulate Vitals — GLP-1 Tracker",
      description:
        "All-in-one GLP-1 tracker for semaglutide and tirzepatide with free medication-level curves, body composition, and bonus heart-age and metabolism trackers.",
      image: ["https://calqulate.net/screenshots/glp1-dashboard.webp"],
      brand: { "@type": "Brand", name: "Calqulate" },
      offers: {
        "@type": "Offer",
        price: "79",
        priceCurrency: "USD",
        url: "https://calqulate.net/product/glp1-progress-tracker",
        availability: "https://schema.org/InStock",
        priceValidUntil: "2027-12-31",
        ...OFFER_ENRICHMENT,
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
};

// ─── Small presentational helpers ─────────────────────────────────────────────

function CompareCell({ v }: { v: string }) {
  if (v === "no") return <span className="text-sm font-semibold text-faint">No</span>;
  if (v === "premium") return <span className="text-xs font-medium text-faint">Premium</span>;
  if (v === "free") return <span className="text-sm font-bold text-brand-800">Free</span>;
  return <span className="text-sm font-bold text-brand">Yes</span>;
}

const btnGreen =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-md";
const btnGold =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold px-6 py-3 text-sm font-bold text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)] transition-all duration-150 hover:-translate-y-0.5";
const btnOutline =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-brand bg-white px-6 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50";

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function Glp1TrackerLanding() {
  const access = await getAccess();
  const paid = hasPaidAccess(access);
  const loggedIn = access.userId !== null;

  const startFreeHref = paid || loggedIn ? "/dashboard/glp1" : "/signup?next=/dashboard/glp1";
  const goDashboard = <Link href={startFreeHref} className={btnGreen}>Go to dashboard <ArrowRight className="h-4 w-4" /></Link>;
  const startFreeLink = <Link href={startFreeHref} className={btnGreen}>Start free <ArrowRight className="h-4 w-4" /></Link>;

  return (
    <main id="main" className="scroll-smooth bg-surface text-copy">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-curve/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-2 lg:gap-12">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-800">
              <CloudUpload className="h-3.5 w-3.5" /> Your data is always backed up
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              The all-in-one GLP-1 tracker that{" "}
              <span className="text-brand">actually has your back</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-copy">
              Track your GLP-1 shots, food, weight and side effects in one place. Get medication-level charts,
              plus a bonus Heart Age and Metabolism tracker — and your data never disappears.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {paid ? goDashboard : startFreeLink}
              {!paid && <Link href="#pricing" className={btnGold}>See Premium</Link>}
            </div>
            {/* Factual capability statement. No star rating here: real, permissioned
                reviews are the only social proof we show, and none are collected yet
                (see TESTIMONIALS / lib/reviews). */}
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-faint">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-brand" />
                Works with Ozempic, Wegovy, Mounjaro &amp; Zepbound
              </span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            {/* SCREENSHOT 1: dashboard — dose countdown, weight trend, medication-level curve */}
            <ScreenshotFrame label="Dashboard — dose countdown, weight trend & medication-level curve" src="/screenshots/glp1-dashboard.webp" frame="browser" />
          </Reveal>
        </div>
      </section>

      {/* ── Trust strip ────────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-5 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-brand-800"><BadgeCheck className="h-4 w-4" /> Built for people on</span>
          {MEDS.map((m) => <span key={m} className="text-faint">{m}</span>)}
        </div>
      </section>

      {/* ── What you get ───────────────────────────────────────────────────── */}
      <section id="features" className="scroll-mt-24 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Your GLP-1 journey, finally in one place</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-copy">
              Whether you're on GLP-1 shots or the oral GLP-1 pill, most people juggle three apps — one for doses,
              one for food, one for weight. Calqulate Vitals works with every GLP-1 drug for weight loss and brings it
              together, so nothing important slips through the cracks.
            </p>
            <p className="mt-3 text-sm text-faint">
              Still deciding?{" "}
              <Link href="/answers/best-glp-1-for-weight-loss" className="font-semibold text-brand-800 hover:underline">
                See which GLP-1 is best for weight loss
              </Link>
              .
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHAT_YOU_GET.map((f, i) => (
              <Reveal key={f.t} delay={i * 50}>
                <div className="group h-full rounded-2xl border border-line bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_8px_24px_rgba(15,23,42,.08)]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand"><f.icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 text-lg font-bold text-ink">{f.t}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-copy">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Free features ──────────────────────────────────────────────────── */}
      <section id="free" className="scroll-mt-24 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-800">Everything you need to start strong</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Take the guesswork out of every shot</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-copy">Know exactly what your medication is doing in your body — every single day.</p>
          </Reveal>

          {/* Hero free feature row 1 — medication-level curve */}
          <div className="mt-12 grid items-center gap-8 lg:grid-cols-2">
            <Reveal>
              <h3 className="text-2xl font-bold text-ink">Medication-level curves</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-copy">
                See how much medication is active in your body each day until your next shot — so you finally understand why
                cravings creep back late in the week, and can plan for it instead of being blindsided.
              </p>
            </Reveal>
            <Reveal delay={100}>
              {/* SCREENSHOT 3: medication-level (PK) curve with cravings overlay */}
              <ScreenshotFrame label="Medication-level curve with cravings overlay" src="/screenshots/glp1-medication-curve.webp" />
            </Reveal>
          </div>

          {/* Hero free feature row 2 — side effects (reversed) */}
          <div className="mt-12 grid items-center gap-8 lg:grid-cols-2">
            <Reveal className="lg:order-2">
              <h3 className="text-2xl font-bold text-ink">Side-effect tracking that gets it</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-copy">
                Log nausea, fatigue, constipation and more on a severity scale. You can even mark “no symptoms today” —
                something most apps won’t let you do.
              </p>
            </Reveal>
            <Reveal delay={100} className="lg:order-1">
              {/* SCREENSHOT: side-effect logging with severity + "no symptoms" */}
              <ScreenshotFrame label="Side-effect logging — severity scale & “no symptoms today”" src="/screenshots/glp1-side-effects.webp" />
            </Reveal>
          </div>

          {/* The rest of the free list */}
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FREE_LIST.map((f, i) => (
              <Reveal key={f.t} delay={i * 40}>
                <div className="h-full rounded-2xl border border-line bg-surface p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand shadow-sm"><f.icon className="h-5 w-5" /></span>
                  <h3 className="mt-3 text-[15px] font-bold text-ink">{f.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-copy">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Premium features (luxe dark band) ──────────────────────────────── */}
      <section
        id="premium"
        className="relative scroll-mt-24 overflow-hidden py-16 text-white sm:py-24"
        style={{
          background:
            "radial-gradient(70% 60% at 82% -10%, rgba(16,185,129,0.22), transparent 60%)," +
            "radial-gradient(55% 60% at 2% 112%, rgba(245,158,11,0.14), transparent 55%)," +
            "linear-gradient(160deg, #0a3a2b 0%, #052017 45%, #02120c 100%)",
        }}
      >
        {/* gold hairline + soft texture */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), transparent)" }} />
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-light to-gold px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)]">
              ✦ Premium
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Premium features that go deeper</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-white/65">Ready for more? Premium turns your logs into real answers.</p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PREMIUM.map((f, i) => (
              <Reveal key={f.t} delay={i * 50} className={f.hero ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
                <div
                  className={`group flex h-full flex-col rounded-2xl border p-6 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 ${
                    f.hero
                      ? "border-gold/25 bg-white/10 shadow-[0_20px_50px_-20px_rgba(245,158,11,.45)] ring-1 ring-gold/15"
                      : "border-white/10 bg-white/5 hover:border-gold/25 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-gold-light ring-1 ring-white/10 transition-colors group-hover:bg-gold/15"><f.icon className="h-5 w-5" /></span>
                    <span className="rounded-full bg-gradient-to-r from-gold-light to-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-ink">Premium</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">{f.t}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-white/65">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {!paid && (
            <Reveal className="mt-12 text-center">
              <Link href="#pricing" className={btnGold}>Go Premium <ArrowRight className="h-4 w-4" /></Link>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Bonus band (Heart Age + Metabolism) ────────────────────────────── */}
      <section id="bonus" className="scroll-mt-24 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-gold-light to-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold-ink">Included with Premium</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Bonus: Heart Age &amp; Metabolism, one plan</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-copy">What no other GLP-1 app gives you. No upsell, no extra charge.</p>
          </Reveal>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border border-line bg-white p-7 shadow-[0_8px_24px_rgba(15,23,42,.06)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-heart/10 text-heart"><HeartPulse className="h-6 w-6" /></span>
                  <div>
                    <h3 className="text-xl font-bold text-ink">Heart Age Tracker</h3>
                    <p className="text-xs text-faint">Coral accent · animated ring</p>
                  </div>
                </div>
                <div className="mt-5 flex items-end gap-3">
                  <span className="text-5xl font-extrabold text-heart"><CountUp to={52} /></span>
                  <span className="mb-1.5 text-sm text-copy">heart age, trending down</span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-copy">
                  Your heart has an age — and it’s not always your birthday number. Watch it drop as you get healthier. A powerful
                  reminder that this journey is about more than a dress size.
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="h-full rounded-2xl border border-line bg-white p-7 shadow-[0_8px_24px_rgba(15,23,42,.06)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-metab/10 text-metab"><Flame className="h-6 w-6" /></span>
                  <div>
                    <h3 className="text-xl font-bold text-ink">Metabolism Tracker</h3>
                    <p className="text-xs text-faint">Violet accent · live gauge</p>
                  </div>
                </div>
                <div className="mt-5 flex items-end gap-3">
                  <span className="text-5xl font-extrabold text-metab"><CountUp to={1740} /></span>
                  <span className="mb-1.5 text-sm text-copy">est. kcal/day</span>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-copy">
                  GLP-1 medications change how your body burns energy. Understand your estimated metabolic rate and how it shifts
                  as you lose weight and build muscle — so your results last.
                </p>
              </div>
            </Reveal>
          </div>
          {/* SCREENSHOT 6 & 7: Heart Age tracker / Metabolism tracker */}
          <Reveal className="mt-5 grid gap-5 lg:grid-cols-2">
            <ScreenshotFrame label="Heart Age tracker" src="/screenshots/heart-age-tracker.png" />
            <ScreenshotFrame label="Metabolism tracker" src="/screenshots/metabolic-tracker.png" />
          </Reveal>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="how" className="scroll-mt-24 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">How it works</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-copy">Getting started takes about two minutes.</p>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: 1, t: "Add your medication", d: "Pick your medication and dose. We support every major GLP-1." },
              { n: 2, t: "Log your weekly shot", d: "Tap to record your dose and site. We handle the reminders." },
              { n: 3, t: "Track your day", d: "Add food, water, weight and how you feel — in seconds." },
              { n: 4, t: "See your insights", d: "Medication levels, body comp, heart age & metabolism in one view." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 60}>
                <div className="relative h-full rounded-2xl border border-line bg-surface p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{s.n}</span>
                  <h3 className="mt-4 font-bold text-ink">{s.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-copy">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ─────────────────────────────────────────────────────── */}
      <section id="compare" className="scroll-mt-24 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Calqulate Vitals vs Shotsy vs Glapp</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-copy">An honest, side-by-side look. Features as of 2026.</p>
          </Reveal>

          <Reveal className="mt-10 overflow-x-auto rounded-2xl border border-line bg-white shadow-[0_8px_24px_rgba(15,23,42,.06)]">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-white p-4 text-left font-semibold text-ink">Feature</th>
                  <th className="relative bg-brand-50 p-4 text-center">
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-light to-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-ink shadow">Best value</span>
                    <span className="font-bold text-brand-800">Calqulate Vitals</span>
                  </th>
                  <th className="p-4 text-center font-semibold text-copy">Shotsy</th>
                  <th className="p-4 text-center font-semibold text-copy">Glapp</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((r) => (
                  <tr key={r.feature} className="border-t border-line">
                    <td className="sticky left-0 z-10 bg-white p-4 text-left font-medium text-ink">{r.feature}</td>
                    <td className="bg-brand-50/60 p-4 text-center"><CompareCell v={r.us} /></td>
                    <td className="p-4 text-center"><CompareCell v={r.shotsy} /></td>
                    <td className="p-4 text-center"><CompareCell v={r.glapp} /></td>
                  </tr>
                ))}
                <tr className="border-t border-line font-semibold">
                  <td className="sticky left-0 z-10 bg-white p-4 text-left text-ink">Yearly price</td>
                  <td className="bg-brand-50/60 p-4 text-center text-brand-800">$79 (~$6.58/mo)</td>
                  <td className="p-4 text-center text-copy">$49.99</td>
                  <td className="p-4 text-center text-copy">Free</td>
                </tr>
              </tbody>
            </table>
          </Reveal>
          <Reveal className="mt-5 text-center text-sm text-copy">
            Shotsy charges the same $9.99/mo but paywalls medication-level charts and has no body composition, heart age or
            metabolism. Glapp is free but has no food, exercise or body composition. Calqulate Vitals gives you all of it.
          </Reveal>
        </div>
      </section>

      {/* ── Product moat (luxe) ────────────────────────────────────────────── */}
      <MoatSection />

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="scroll-mt-24 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-copy">One plan that includes everything — bonuses and all.</p>
          </Reveal>

          <Reveal className="mt-10">
            <SinglePlan paid={paid} />
          </Reveal>
          {!paid && (
            <Reveal className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/health/glp-1-dose-calculator" className={btnGreen}>Free GLP-1 dose calculator <ArrowRight className="h-4 w-4" /></Link>
              <Link href={startFreeHref} className={btnOutline}>Start the free tracker</Link>
            </Reveal>
          )}
          <Reveal className="mt-5 text-center text-sm text-faint">Cancel anytime · Switch monthly ↔ yearly anytime · Export your data anytime · Core tracking &amp; medication-level charts stay free.</Reveal>
        </div>
      </section>

      {/* ── Testimonials (only when real, permissioned reviews exist) ───────── */}
      {TESTIMONIALS.length > 0 && (
        <section className="bg-brand-50/40 py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal className="text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">What our members say</h2>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.n} delay={i * 60}>
                  <figure className="h-full rounded-2xl border border-line bg-white p-6">
                    {/* Only render stars when the member actually gave a rating. */}
                    {typeof t.r === "number" && (
                      <div className="mb-3 flex gap-1 text-gold" aria-label={`${t.r} out of 5 stars`}>
                        {Array.from({ length: Math.max(0, Math.min(5, Math.round(t.r))) }).map((_, k) => (
                          <Star key={k} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    )}
                    <blockquote className="text-[15px] leading-relaxed text-ink">“{t.q}”</blockquote>
                    <figcaption className="mt-4 text-sm">
                      <span className="font-semibold text-ink">{t.n}</span>
                      <span className="text-faint"> · {t.m}</span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="scroll-mt-24 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">GLP-1 tracker FAQs</h2>
          </Reveal>
          <Reveal className="mt-8"><FaqAccordion items={FAQS} /></Reveal>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand to-brand-800 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Track smarter. Lose fat, not muscle.</h2>
            <p className="mx-auto mt-3 max-w-xl text-[17px] text-emerald-50/90">
              Keep your data. Keep your strength. The all-in-one GLP-1 tracker that actually has your back.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={startFreeHref} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-brand-800 shadow-sm transition-all duration-150 hover:-translate-y-0.5">
                {paid ? "Go to dashboard" : "Start free at calqulate.net"} <ArrowRight className="h-4 w-4" />
              </Link>
              {!paid && <Link href="#pricing" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">See pricing</Link>}
            </div>
            <p className="mt-6 text-xs text-emerald-50/70">Educational decision-support, not medical advice · We never sell your data.</p>
          </Reveal>
        </div>
      </section>

      {/* Mobile sticky CTA — follows the user past the hero */}
      <StickyCtaBar hidePremium={paid} loggedIn={loggedIn} />
    </main>
  );
}
