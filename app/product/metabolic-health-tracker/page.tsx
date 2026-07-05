import type { Metadata } from "next";
import {
  Activity, HeartPulse, Scale, TrendingUp, Target, ShieldCheck,
  FlaskConical, FileText, Gauge, Sparkles, Brain, Syringe, Compass,
} from "lucide-react";
import { TrackerLanding, type TrackerLandingConfig } from "@/components/marketing/TrackerLanding";
import { getReviews } from "@/lib/reviews";
import { getAccess, hasPaidAccess } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Metabolic Health Score Tracker | Heart & Diabetes Risk — Calqulate",
  description:
    "Turn your numbers into one Metabolic Health Score and watch your 10-year heart-attack and diabetes risk fall over time. Validated clinical models. Free to start.",
  keywords:
    "metabolic health score, metabolism tracker, metabolic health tracker, longevity index, biological age, ascvd risk tracker, diabetes risk tracker, track health over time",
  alternates: { canonical: "https://calqulate.net/product/metabolic-health-tracker" },
  openGraph: {
    title: "Watch your metabolic health improve, month over month",
    description:
      "One Metabolic Health Score, your 10-year heart & diabetes risk, heart age and a Future You projection — tracked over time with validated clinical models.",
    url: "https://calqulate.net/product/metabolic-health-tracker",
    type: "website",
    siteName: "Calqulate",
  },
};

const config: TrackerLandingConfig = {
  jsonLd: {
    productName: "Calqulate Vitals — Metabolic Health Score Tracker",
    productDescription:
      "Composite Metabolic Health Score with 10-year ASCVD and diabetes risk, heart age, Longevity Index and a Future You simulator, tracked over time on validated clinical models.",
    canonical: "https://calqulate.net/product/metabolic-health-tracker",
  },
  startFreeHref: "/signup?next=/dashboard",
  hero: {
    badge: "Your score, tracked over time",
    h1: "Watch your metabolic health",
    h1Accent: "improve month over month",
    sub: "Think you have a sluggish metabolism? Calqulate turns your numbers into one Metabolic Health Score, shows your real 10-year heart-attack and diabetes risk, and tells you the single highest-impact change to make next. Then it tracks it all falling over time.",
    trustLine: "Built on the same equations clinicians use — ASCVD, Framingham & FINDRISC",
    screenshotLabel: "Dashboard — Metabolic Health Score, heart age & risk trend",
    screenshotSrc: "/screenshots/metabolic-dashboard.png",
  },
  trust: { label: "Built on validated models", items: ["Pooled Cohort Equations", "Framingham", "FINDRISC", "Longevity Index"] },
  whatYouGet: {
    heading: "From a one-time number to a health trajectory",
    sub: "Most health tools give you a single reading and stop. Calqulate tracks the trend, scores it, and shows whether your metabolic diet and daily habits are actually moving the number, so you know what to fix first.",
    items: [
      { icon: Gauge, t: "One Metabolic Health Score", d: "A composite 0–100 score from validated models, tracked over time." },
      { icon: HeartPulse, t: "Real heart & diabetes risk", d: "Your 10-year ASCVD risk, heart age and FINDRISC diabetes risk." },
      { icon: Target, t: "Your single next lever", d: "The one highest-impact change to make next, quantified in your own numbers." },
      { icon: TrendingUp, t: "Future You projection", d: "A Monte-Carlo simulation of your score and risk 6–60 months out." },
      { icon: HeartPulse, t: "Bonus heart age & GLP-1 trackers", d: "Two more trackers included in the same plan." },
      { icon: ShieldCheck, t: "Private, backed up & yours", d: "Automatic backup, export or delete anytime. Never sold." },
    ],
  },
  free: {
    heading: "Free features, from day one",
    sub: "Run every clinical engine once, free and stateless — no account needed to see your numbers.",
    rows: [
      { title: "Your free Metabolic Health Score", body: "Enter your numbers and get today's composite score with a plain-English explanation of what it means — and where you stand against healthy ranges. No account, nothing saved.", screenshotLabel: "Metabolic Health Score snapshot", screenshotSrc: "/screenshots/metabolic-score-snapshot.png" },
      { title: "Your real risk, broken down", body: "See your 10-year heart-attack risk, heart age and type-2 diabetes risk from validated models, with the exact factors driving each one. Methodology is shown on every result.", screenshotLabel: "Risk breakdown — ASCVD, heart age, diabetes", screenshotSrc: "/screenshots/metabolic-risk-breakdown.png", reverse: true },
    ],
    grid: [
      { icon: Gauge, t: "Composite score (0–100)", d: "Built from validated cardiometabolic models." },
      { icon: HeartPulse, t: "10-year ASCVD risk", d: "Pooled Cohort Equations, the clinical standard." },
      { icon: Activity, t: "Heart age", d: "How old your heart really is, vs. your real age." },
      { icon: FlaskConical, t: "Diabetes risk (FINDRISC)", d: "Your validated type-2 diabetes risk score." },
      { icon: Scale, t: "Body composition basics", d: "BMI, waist-to-height and lean-mass estimates." },
      { icon: Sparkles, t: "Plain-English results", d: "What each number means and what to do next." },
    ],
  },
  premium: {
    heading: "Premium features that go deeper",
    sub: "Ready for more? Premium turns your numbers into a tracked trajectory and a plan.",
    items: [
      { icon: TrendingUp, t: "Saved history & trend engine", d: "A trajectory engine that separates real progress from daily noise, so you see the signal — not the bounce.", hero: true },
      { icon: Brain, t: "Longevity Index & biological age", d: "One number (0–1000) rolling up your cardiometabolic systems, plus a biomarker-weighted biological age." },
      { icon: Compass, t: "“Future You” simulator", d: "A Monte-Carlo projection of your weight, score and heart age 6–60 months out, with honest confidence bands." },
      { icon: Target, t: "Your next-lever protocol", d: "The single highest-impact change to make first, quantified in your own risk numbers." },
      { icon: FlaskConical, t: "Lab & biomarker tracking", d: "Log A1c, glucose, lipids and blood pressure and watch them move with your score." },
      { icon: FileText, t: "Doctor-ready PDF report", d: "A clean one-page summary to bring to your next appointment." },
      { icon: Activity, t: "Weekly progress email", d: "A week-on-week recap so your trajectory stays top of mind." },
    ],
  },
  bonus: {
    heading: "Bonus: two more trackers, one plan",
    sub: "Your plan isn't just the score — it includes the Heart Age and GLP-1 trackers too. No upsell.",
    cards: [
      { icon: HeartPulse, accent: "heart", title: "Heart Age Tracker", sublabel: "Coral accent · validated Framingham", stat: 52, body: "See how old your heart really is and watch it get younger as your numbers improve — included with Premium." },
      { icon: Syringe, accent: "brand", title: "GLP-1 Progress Tracker", sublabel: "On Ozempic, Wegovy, Mounjaro or Zepbound?", stat: 100, statSuffix: "%", body: "Track fat vs. muscle, free medication-level curves and your risk falling — all in the same plan." },
    ],
    screenshotLabels: ["Heart Age tracker", "GLP-1 Progress tracker"],
    screenshotSrcs: ["/screenshots/heart-age-tracker.png", "/screenshots/glp1-tracker.png"],
  },
  how: {
    heading: "How it works",
    sub: "Snapshot → Track → Act → Reverse. Getting started takes about two minutes.",
    steps: [
      { t: "Compute", d: "Run every clinical engine free and stateless — no login needed." },
      { t: "Save & track", d: "Create an account to save your score and trend it over time." },
      { t: "Act", d: "Follow your single highest-impact next lever, quantified in your numbers." },
      { t: "Reverse", d: "Watch your score climb and your heart & diabetes risk fall, month over month." },
    ],
  },
  compare: {
    heading: "How Calqulate Vitals is different",
    sub: "An honest look at the alternatives.",
    cols: ["A one-time calculator", "A generic wellness app"],
    rows: [
      { feature: "Validated clinical models (ASCVD, FINDRISC)", us: "yes", b: "partial", c: "no" },
      { feature: "Tracked over time (trend, not one number)", us: "best", b: "no", c: "partial" },
      { feature: "10-year heart & diabetes risk", us: "yes", b: "partial", c: "no" },
      { feature: "Tells you the #1 change to make next", us: "best", b: "no", c: "no" },
      { feature: "Future You projection", us: "best", b: "no", c: "no" },
      { feature: "Body composition & lean mass", us: "yes", b: "no", c: "partial" },
      { feature: "Doctor-ready PDF report", us: "yes", b: "no", c: "no" },
      { feature: "Data backed up & exportable", us: "best", b: "no", c: "partial" },
    ],
    priceRow: { us: "$9.99/mo · $79/yr", b: "Free (one-off)", c: "$10–30/mo" },
    note: "A free calculator gives you one number once. A generic wellness app tracks steps and sleep, not validated cardiometabolic risk. Calqulate Vitals tracks the clinical numbers that matter — and tells you what to fix first.",
  },
  pricing: {
    freeTitle: "Free",
    freePrice: "$0",
    freeUnit: "/forever",
    freeSub: "Run any clinical engine once and see your numbers — no account needed to try it.",
    freeFeatures: [
      "Free Metabolic Health Score snapshot",
      "10-year heart & diabetes risk + heart age",
      "Plain-English results & healthy ranges",
      "50+ free health calculators",
    ],
    freePrimary: { label: "Open a free risk calculator", href: "/health/ascvd-risk-calculator" },
  },
  // Real, permissioned reviews only (empty until collected) — see lib/reviews.ts.
  testimonials: getReviews("metabolic").map((r) => ({ q: r.quote, n: r.name, m: r.context })),
  faqs: [
    { q: "What is the Metabolic Health Score?", a: "It's one composite score (0–100) built from peer-reviewed clinical equations — the Pooled Cohort Equations, Framingham and FINDRISC — that rolls up your cardiovascular, metabolic and body-composition picture. The methodology is shown on every result." },
    {
      q: "What causes a sluggish metabolism, and can I fix it?",
      a: "A slow or sluggish metabolism usually comes down to low muscle mass, poor sleep, high stress, and sitting too much, not one single cause. The fix is to protect your muscle, walk after meals, sleep well, and eat enough protein. Calqulate scores it all so you can watch your metabolism improve as you change those habits.",
      link: { label: "How to fix a sluggish metabolism naturally", href: "/answers/boost-sluggish-metabolism" },
    },
    {
      q: "What are the best metabolism boosting foods and supplements?",
      a: "The best metabolism boosting foods are high-protein, high-fiber options like eggs, lean meat, Greek yogurt, legumes, and green vegetables, because protein burns the most energy to digest. Most metabolism boosting supplements do very little on their own. What actually matters is whether your metabolic meals move your score over time, which is exactly what this tracker shows you.",
      link: { label: "Metabolism boosting foods that increase your metabolism", href: "/answers/boost-sluggish-metabolism" },
    },
    { q: "Is it accurate, and what's a good score?", a: "The score is built from validated published models, not a black box. Any single reading is an estimate, so the real value is the trend — re-check every few weeks and watch it climb. Higher is better, and the tracker shows which levers move it most." },
    { q: "What models is this based on?", a: "The Pooled Cohort Equations for 10-year ASCVD risk, Framingham for heart age, and FINDRISC for type-2 diabetes risk — all transparent, published models." },
    { q: "Is it free to start?", a: "Yes. Every calculator and your first metabolic snapshot are free, with no account and nothing saved. Calqulate Vitals adds saved history, the trajectory engine, the Future You simulator and your next-lever protocol." },
    { q: "What's the Future You simulator?", a: "A Monte-Carlo engine that projects your weight, score and heart age 6–60 months out across realistic, optimistic and pessimistic effort, with honest confidence bands." },
    { q: "Is this medical advice?", a: "No. Calqulate is educational decision-support that helps you understand and track your risk and bring better questions to your doctor. It does not diagnose, treat or prescribe." },
    { q: "Is my data private?", a: "Yes. Your data is encrypted, backed up automatically and never sold. You can export everything or delete your account anytime." },
    { q: "Can I cancel anytime?", a: "Yes — one click, no retention maze. You keep access until the end of the period you paid for, and your data stays yours." },
  ],
  finalCta: {
    h2: "Know your score. Track your trend. Lower your risk.",
    sub: "Start free, and upgrade only when you want to save it, track it, and reverse it.",
  },
};

export default async function MetabolicHealthTrackerPage() {
  const access = await getAccess();
  const paid = hasPaidAccess(access);
  const cfg = { ...config };

  if (paid) {
    cfg.startFreeHref = "/dashboard";
    cfg.pricing = { ...cfg.pricing, freePrimary: { ...cfg.pricing.freePrimary, href: "/dashboard" } };
  }

  return <TrackerLanding config={cfg} paid={paid} />;
}
