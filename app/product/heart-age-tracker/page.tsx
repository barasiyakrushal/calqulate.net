import type { Metadata } from "next";
import {
  HeartPulse, Activity, Heart, Scale, TrendingUp, Target, ShieldCheck,
  FlaskConical, FileText, Gauge, Sparkles, Droplet, Syringe, Compass,
} from "lucide-react";
import { TrackerLanding, type TrackerLandingConfig } from "@/components/marketing/TrackerLanding";
import { getReviews } from "@/lib/reviews";
import { getAccess, hasPaidAccess } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Heart Age Tracker | See Your Cardiovascular Age — Calqulate",
  description:
    "Find out how old your heart really is with the validated Framingham model, then track it getting younger over time. Free heart-age snapshot; upgrade to track the trend.",
  keywords:
    "heart age tracker, heart age calculator, vascular age, framingham risk score, cardiovascular age, how old is my heart",
  alternates: { canonical: "https://calqulate.net/product/heart-age-tracker" },
  openGraph: {
    title: "See how old your heart really is — then make it younger",
    description:
      "Calculate your heart age with the validated Framingham model and watch it fall as your numbers improve. Free snapshot; track the trend with Premium.",
    url: "https://calqulate.net/product/heart-age-tracker",
    type: "website",
    siteName: "Calqulate",
  },
};

const config: TrackerLandingConfig = {
  jsonLd: {
    productName: "Calqulate Vitals — Heart Age Tracker",
    productDescription:
      "Calculate your heart age with the validated Framingham model and track it getting younger over time, with risk-factor breakdown and a doctor-shareable report.",
    canonical: "https://calqulate.net/product/heart-age-tracker",
    image: "https://calqulate.net/Heart-age-calculator.webp",
  },
  startFreeHref: "/signup?next=/dashboard",
  hero: {
    badge: "Your heart has an age",
    h1: "See how old your heart really is —",
    h1Accent: "then make it younger",
    sub: "Your heart age is calculated from the validated Framingham model. Calqulate shows it against your real age, explains what's driving it, and tracks the number falling as your blood pressure, cholesterol and blood sugar improve.",
    trustLine: "Built on the validated Framingham heart-age model (designed for ages 30–74)",
    screenshotLabel: "Dashboard — heart age vs. real age, trending down",
    screenshotSrc: "/screenshots/heart-age-dashboard.png",
  },
  trust: { label: "Built on validated science", items: ["Framingham model", "CDC-referenced", "Ages 30–74", "Doctor PDF"] },
  whatYouGet: {
    heading: "From a one-time figure to a number you can move",
    sub: "A heart-age quiz gives you a scary number once. Calqulate shows you why — and helps you bring it down.",
    items: [
      { icon: HeartPulse, t: "Your real heart age", d: "From the validated Framingham model, against your actual age." },
      { icon: Activity, t: "What's driving it", d: "See exactly which risk factors are adding years to your heart." },
      { icon: TrendingUp, t: "Track it getting younger", d: "Watch the years come back off as your numbers improve." },
      { icon: Target, t: "Your single next lever", d: "The one change that lowers your heart age the most, first." },
      { icon: Gauge, t: "Bonus metabolic & GLP-1 trackers", d: "Two more trackers included in the same plan." },
      { icon: ShieldCheck, t: "Private, backed up & yours", d: "Automatic backup, export or delete anytime. Never sold." },
    ],
  },
  free: {
    heading: "Free features, from day one",
    sub: "You shouldn't have to pay to find out how old your heart is.",
    rows: [
      { title: "Your free heart-age snapshot", body: "Enter your numbers and find out how old your heart really is — in plain English, against your real age. No account, nothing saved.", screenshotLabel: "Heart age snapshot vs. real age", screenshotSrc: "/screenshots/heart-age-snapshot.png" },
      { title: "Why your heart age is what it is", body: "High blood pressure, cholesterol, blood sugar or smoking each add years. See exactly which factors are aging your heart, and how much each one matters.", screenshotLabel: "Heart-age risk-factor breakdown", screenshotSrc: "/screenshots/heart-age-risk-factors.png", reverse: true },
    ],
    grid: [
      { icon: HeartPulse, t: "Validated Framingham model", d: "The clinically used heart-age estimate." },
      { icon: Heart, t: "Heart age vs. real age", d: "See the gap — and aim to close it." },
      { icon: Activity, t: "Risk-factor breakdown", d: "What's adding years, ranked by impact." },
      { icon: Droplet, t: "Blood pressure & cholesterol", d: "Plug in your readings for a precise estimate." },
      { icon: Sparkles, t: "Plain-English explanation", d: "What your number means and what to do." },
      { icon: TrendingUp, t: "One free snapshot", d: "See where you stand before you track it." },
    ],
  },
  premium: {
    heading: "Premium features that go deeper",
    sub: "Ready to actually lower it? Premium turns the snapshot into a trend you can move.",
    items: [
      { icon: TrendingUp, t: "Track your heart age over time", d: "Save your readings and watch the years come back off as your blood pressure, LDL and blood sugar improve.", hero: true },
      { icon: Compass, t: "Heart-age forecast", d: "See where your heart age is heading 6–60 months out, across realistic and optimistic effort." },
      { icon: Target, t: "Your next-lever protocol", d: "The single highest-impact change to make first, quantified in years of heart age." },
      { icon: FlaskConical, t: "Lab & blood-pressure tracking", d: "Log lipids, blood pressure and A1c and watch them move with your heart age." },
      { icon: Scale, t: "Body composition", d: "Track fat vs. lean mass, a key driver of cardiovascular risk." },
      { icon: FileText, t: "Doctor-ready PDF report", d: "A clean one-page summary to bring to your next appointment." },
      { icon: Activity, t: "Weekly progress email", d: "A week-on-week recap so your trajectory stays top of mind." },
    ],
  },
  bonus: {
    heading: "Bonus: two more trackers, one plan",
    sub: "Your plan includes the Metabolic Health and GLP-1 trackers too. No upsell, no extra charge.",
    cards: [
      { icon: Gauge, accent: "metab", title: "Metabolic Health Score", sublabel: "Violet accent · composite 0–100", stat: 82, body: "One score rolling up your heart, metabolic and body-composition picture — tracked over time, included with Premium." },
      { icon: Syringe, accent: "brand", title: "GLP-1 Progress Tracker", sublabel: "On a GLP-1 medication?", stat: 100, statSuffix: "%", body: "Track fat vs. muscle, free medication-level curves and your risk falling — all in the same plan." },
    ],
    screenshotLabels: ["Metabolic Health Score tracker", "GLP-1 Progress tracker"],
    screenshotSrcs: ["/screenshots/metabolic-tracker.png", "/screenshots/glp1-tracker.png"],
  },
  how: {
    heading: "How it works",
    sub: "Getting your heart age and tracking it takes about two minutes.",
    steps: [
      { t: "Enter your numbers", d: "Age, blood pressure, cholesterol and a few risk factors — free, no login." },
      { t: "See your heart age", d: "How old your heart really is, against your real age, in plain English." },
      { t: "Find your lever", d: "The single change that lowers your heart age the most, first." },
      { t: "Watch it fall", d: "Track it month over month and see the years come back off." },
    ],
  },
  compare: {
    heading: "How Calqulate Vitals is different",
    sub: "An honest look at the alternatives.",
    cols: ["A free heart-age quiz", "A generic health app"],
    rows: [
      { feature: "Validated Framingham model", us: "yes", b: "partial", c: "no" },
      { feature: "Tracked over time (years coming off)", us: "best", b: "no", c: "partial" },
      { feature: "Risk-factor breakdown by impact", us: "yes", b: "partial", c: "no" },
      { feature: "Tells you the #1 change to make next", us: "best", b: "no", c: "no" },
      { feature: "Lab & blood-pressure tracking", us: "yes", b: "no", c: "partial" },
      { feature: "Body composition & lean mass", us: "yes", b: "no", c: "partial" },
      { feature: "Doctor-ready PDF report", us: "yes", b: "no", c: "no" },
      { feature: "Data backed up & exportable", us: "best", b: "no", c: "partial" },
    ],
    priceRow: { us: "$9.99/mo · $79/yr", b: "Free (one-off)", c: "$10–30/mo" },
    note: "A free quiz gives you one scary number and no way to move it. A generic app tracks steps, not cardiovascular age. Calqulate Vitals shows what's aging your heart, what to fix first, and the years coming back off over time.",
  },
  pricing: {
    freeTitle: "Free",
    freePrice: "$0",
    freeUnit: "/forever",
    freeSub: "Find out how old your heart is right now — no account needed to try it.",
    freeFeatures: [
      "Free Heart Age snapshot (Framingham)",
      "Heart age vs. your real age",
      "Risk-factor breakdown",
      "50+ free health calculators",
    ],
    freePrimary: { label: "Open the free Heart Age calculator", href: "/health/heart-age-calculator" },
  },
  // Real, permissioned reviews only (empty until collected) — see lib/reviews.ts.
  testimonials: getReviews("heart-age").map((r) => ({ q: r.quote, n: r.name, m: r.context })),
  faqs: [
    { q: "What is heart age?", a: "Heart age is an estimate of how old your cardiovascular system really is, based on your risk factors. A higher heart age than your real age means strain is adding years to your heart. Calqulate uses the validated Framingham model." },
    { q: "Why is my heart age older than my actual age?", a: "Usually one or more risk factors — high blood pressure, high cholesterol, high blood sugar or smoking — are adding strain. It's very common: the CDC estimates the average American heart is about 7 years older than their real age." },
    { q: "How accurate is the Framingham heart-age model?", a: "It's a well-validated, widely used estimate, but it is an estimate, not a diagnosis. The model was developed and validated for adults aged 30–74, so results outside that range are less reliable. The most useful signal is the direction of travel over time." },
    { q: "Can I actually lower my heart age?", a: "Yes — heart age responds to the same things your risk factors do. As you bring down blood pressure, LDL cholesterol and blood sugar, the tracker shows the years coming back off, and tells you the highest-impact change to make first." },
    { q: "Is it free to start?", a: "Yes. Your first heart-age snapshot is free with no account. To save it and track the trend over time, plus the doctor-shareable report, Calqulate Vitals is one plan at $9.99/month or $79/year." },
    { q: "Is this medical advice?", a: "No. It's educational decision-support that helps you understand and track your cardiovascular risk and bring better questions to your doctor. It does not diagnose, treat or prescribe." },
    { q: "Is my data private?", a: "Yes. Your data is encrypted, backed up automatically and never sold. You can export everything or delete your account anytime." },
    { q: "Can I cancel anytime?", a: "Yes — one click, no retention maze. You keep access until the end of the period you paid for, and your data stays yours." },
  ],
  finalCta: {
    h2: "Find out how old your heart is — then make it younger.",
    sub: "Start free with your heart-age snapshot, and upgrade only when you want to track it falling over time.",
  },
};

export default async function HeartAgeTrackerPage() {
  const access = await getAccess();
  const paid = hasPaidAccess(access);
  const loggedIn = access.userId !== null;
  const cfg = { ...config };

  if (paid || loggedIn) {
    cfg.startFreeHref = "/dashboard";
    cfg.pricing = { ...cfg.pricing, freePrimary: { ...cfg.pricing.freePrimary, href: "/dashboard" } };
  }

  return <TrackerLanding config={cfg} paid={paid} loggedIn={loggedIn} />;
}
