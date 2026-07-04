import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FreeVsPremium } from "@/components/marketing/FreeVsPremium";
import { SinglePlan } from "@/components/vitals/SinglePlan";
import { getAccess, hasPaidAccess } from "@/lib/auth";
import {
  ArrowRight, Activity, LineChart, Target, ShieldCheck, Stethoscope,
  AlertTriangle, TrendingDown, Dumbbell, Brain, Lock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "How Calqulate Vitals Works — Track & Reverse Your Metabolic Risk",
  description:
    "You got a scary or borderline number and your doctor said 'come back in 6 months.' Calqulate Vitals translates it, tracks the real trend, and tells you the one change that lowers your risk most. Here's exactly how it works.",
  alternates: { canonical: "https://calqulate.net/how-it-works" },
};

const steps = [
  {
    n: "1",
    icon: <Activity className="h-6 w-6" />,
    title: "Snapshot — free, no account",
    body: "Enter your numbers (and labs, if you have them). We run validated clinical engines — Pooled Cohort Equations, Framingham, FINDRISC — to compute your Metabolic Health Score, heart age, and 10-year heart-attack & diabetes risk. This part is genuinely free and stateless.",
  },
  {
    n: "2",
    icon: <LineChart className="h-6 w-6" />,
    title: "Track — your real trend, not the noise",
    body: "Re-measure weekly. Our trajectory engine fits a statistical model to YOUR history and separates the real signal from day-to-day noise — so a 2-point wiggle doesn't scare you, and a real improvement isn't hidden. You finally get a number that moves between lab tests.",
  },
  {
    n: "3",
    icon: <Target className="h-6 w-6" />,
    title: "Act — your single highest-impact lever",
    body: "We don't say 'eat healthy.' We simulate each change against your own risk equations and rank them by how far they move YOUR numbers: 'Quit smoking → −8.5% 10-yr heart risk, −5 years heart age.' One clear next action, quantified.",
  },
  {
    n: "4",
    icon: <TrendingDown className="h-6 w-6" />,
    title: "Reverse — prove it's working",
    body: "Watch your score climb and your risk fall, month over month. Forecast where you'll land if the trend holds. Export a doctor-shareable PDF. This is the proof the scale never gave you.",
  },
];

const audiences = [
  {
    icon: <AlertTriangle className="h-6 w-6" />,
    tag: "Prediabetes / borderline labs",
    pain: "\"My A1c is 5.7 and my doctor said come back in 6 months.\"",
    fix: "Get the reversal plan they didn't give you — and proof, week by week, that you're moving out of the danger zone before it becomes type-2 diabetes.",
  },
  {
    icon: <Dumbbell className="h-6 w-6" />,
    tag: "On a GLP-1 (Ozempic / Wegovy / Zepbound)",
    pain: "\"I'm losing weight but I'm scared it's muscle — and that I'll bounce back when I stop.\"",
    fix: "Track lean mass vs. fat, not just pounds. We flag when you're losing muscle too fast and forecast rebound risk so coming off the drug doesn't undo months of work.",
  },
  {
    icon: <Brain className="h-6 w-6" />,
    tag: "Scared by a heart / cholesterol number",
    pain: "\"My 10-year risk came back high and nobody explained what it means.\"",
    fix: "Plain-English translation of exactly how worried to be, what's driving it, and the one change that lowers it most — so you can stop spiraling and start acting.",
  },
];

export default async function HowItWorksPage() {
  const access = await getAccess();
  const paid = hasPaidAccess(access);
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main id="main" className="flex-1">

        {/* Hero / the real problem */}
        <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-3 sm:px-4 max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-800/60 border border-emerald-600/40 px-3 sm:px-4 py-1.5 text-sm font-medium text-emerald-300 mb-6">
              <Stethoscope className="h-4 w-4" /> How it actually works
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              You got a scary number. Your doctor said &ldquo;come back in 6 months.&rdquo;
            </h1>
            <p className="mt-6 text-base sm:text-lg text-emerald-100/80 leading-relaxed">
              A borderline A1c. A high 10-year heart risk. Muscle melting off on a GLP-1. The result lands,
              the fear spikes &mdash; and nobody tells you what it means or what to actually do. Calqulate Vitals
              fills that gap: it translates the number, tracks the real trend, and hands you the single change
              that lowers your risk most.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
              <Link href="/product/metabolic-health-tracker" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 sm:px-6 py-3 min-h-[44px] font-semibold text-white hover:bg-emerald-400 transition-colors">
                Get my free score <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#pricing" className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/50 px-5 sm:px-6 py-3 min-h-[44px] font-semibold text-emerald-200 hover:bg-emerald-800/50 transition-colors">
                See the one plan
              </a>
            </div>
          </div>
        </section>

        {/* The 4 steps */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
            <div className="text-center mb-10 sm:mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3 block">The loop</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Snapshot → Track → Act → Reverse</h2>
              <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
                A one-time calculator gives you a number and walks away. Calqulate Vitals is a loop you live in.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {steps.map((s) => (
                <div key={s.n} className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">{s.n}</span>
                    <span className="text-emerald-600">{s.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why it isn't just a calculator — the algorithm/moat in plain English */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
          <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
            <div className="text-center mb-10 sm:mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3 block">Why this isn&apos;t just a calculator</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Two engines a free calculator (or an AI) can&apos;t copy</h2>
              <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
                Anyone can reproduce a risk formula. What can&apos;t be reproduced is a model built on <em>your</em> accumulated history.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="rounded-2xl border border-emerald-100 bg-white p-5 sm:p-7 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-700 mb-3">
                  <LineChart className="h-5 w-5" />
                  <h3 className="font-bold">1 · Personal trajectory engine</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your weight, glucose, and blood pressure jump around day to day. We run a statistical
                  state-space model (a Kalman filter) over your personal series to estimate the <strong>true underlying
                  trend</strong> beneath the noise — with a confidence level. It answers the only question that matters
                  when you&apos;re trying: <em>&ldquo;is this actually working, or is it just a good day?&rdquo;</em>
                </p>
                <p className="mt-3 text-xs text-gray-400">
                  Defensible by design: the estimate depends on your entire history. A competitor — or an AI — starting
                  today has no series, so it can&apos;t reconstruct your trajectory. Every measurement deepens the moat.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white p-7 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-700 mb-3">
                  <Target className="h-5 w-5" />
                  <h3 className="font-bold">2 · Counterfactual &ldquo;next lever&rdquo; simulator</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Instead of generic advice, we run a personalized what-if: we change <strong>one factor at a time</strong>
                  toward a realistic target, re-run every validated risk engine on <strong>your</strong> inputs, and measure
                  exactly how far each move shifts your numbers — then rank them by impact per unit of effort.
                </p>
                <p className="mt-3 text-xs text-gray-400">
                  The output is in your own units (&ldquo;−8.5% heart risk, −5 years heart age&rdquo;), not platitudes — which is
                  the difference between a tool people keep paying for and one they cancel.
                </p>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-gray-500 max-w-3xl mx-auto">
              Built on validated, published models — <span className="font-medium text-gray-700">Pooled Cohort Equations</span> (ASCVD),{" "}
              <span className="font-medium text-gray-700">Framingham</span> (heart age),{" "}
              <span className="font-medium text-gray-700">FINDRISC</span> (diabetes) — wrapped in personalization that compounds with use.
            </p>
          </div>
        </section>

        {/* Who it's for */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
            <div className="text-center mb-10 sm:mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3 block">Who it&apos;s for</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Built for the moment the system left you on your own</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {audiences.map((a) => (
                <div key={a.tag} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 sm:p-6">
                  <div className="p-3 bg-emerald-100 rounded-xl w-fit text-emerald-700 mb-4">{a.icon}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-2">{a.tag}</div>
                  <p className="text-sm italic text-gray-700 mb-3">{a.pain}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{a.fix}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-emerald-950 to-emerald-900">
          <div className="container mx-auto px-3 sm:px-4 max-w-5xl">
            <div className="text-center mb-10 sm:mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3 block">The benefits</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Why people stay</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {[
                { icon: <TrendingDown className="h-5 w-5" />, t: "See your risk actually fall", d: "Watch 10-year heart and diabetes risk drop over time — the outcome the scale can't show." },
                { icon: <LineChart className="h-5 w-5" />, t: "Signal, not noise", d: "Know when a change is real vs. a fluke, so you don't quit during a normal plateau." },
                { icon: <Target className="h-5 w-5" />, t: "One clear action", d: "Always know the single highest-impact thing to do next — quantified in your own numbers." },
                { icon: <Dumbbell className="h-5 w-5" />, t: "Protect your muscle", d: "On a GLP-1, track lean mass so you lose fat, not the muscle that keeps the weight off." },
                { icon: <Stethoscope className="h-5 w-5" />, t: "Walk into your doctor prepared", d: "A clean, shareable PDF of your trend and risk — turn a 7-minute appointment into a real conversation." },
                { icon: <Lock className="h-5 w-5" />, t: "Private by design", d: "Your data is yours. Export it or delete it permanently, anytime. GDPR/CCPA built in." },
              ].map((b) => (
                <div key={b.t} className="flex gap-4 p-5 bg-emerald-900/50 rounded-2xl border border-emerald-800/50">
                  <div className="flex-shrink-0 w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white">{b.icon}</div>
                  <div>
                    <div className="font-bold text-white text-sm mb-0.5">{b.t}</div>
                    <div className="text-sm text-emerald-300/70 leading-relaxed">{b.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing — hidden for existing subscribers */}
        <section id="pricing" className="py-12 sm:py-16 bg-gray-50 scroll-mt-20">
          <div className="container mx-auto px-3 sm:px-4">
            {paid ? (
              <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center max-w-lg mx-auto">
                <span className="inline-block rounded-full bg-emerald-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Active
                </span>
                <h2 className="mt-4 text-xl font-bold text-emerald-900">You already have Calqulate Vitals</h2>
                <p className="mt-2 text-emerald-700">
                  Your subscription is active. Go to your dashboard to see your scores, trends, and personalized next steps.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-6 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-emerald-700"
                >
                  Go to dashboard →
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
                  <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3 block">One simple plan</span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">Start free. Upgrade to track &amp; reverse.</h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    The snapshot is genuinely free &mdash; run any engine once, nothing saved. One plan unlocks the
                    trajectory engine, your next-lever protocol, GLP-1 muscle tracking, and doctor PDFs.
                  </p>
                </div>
                <SinglePlan />
              </>
            )}
          </div>
        </section>

        {/* Final reassurance */}
        <section className="py-10 sm:py-14 bg-white border-t border-gray-100">
          <div className="container mx-auto px-3 sm:px-4 max-w-3xl text-center">
            <ShieldCheck className="h-8 w-8 text-emerald-600 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Educational decision-support &mdash; not a replacement for your doctor</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Calqulate Vitals helps you understand and track your risk and bring better questions to your
              clinician. It is not medical advice, diagnosis, or treatment. Always consult a licensed professional
              about your health decisions.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
              <Link href="/product/metabolic-health-tracker" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 sm:px-6 py-3 min-h-[44px] font-semibold text-white hover:bg-emerald-700 transition-colors">
                Get my free Metabolic Health Score <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/search" className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 sm:px-6 py-3 min-h-[44px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Try a free snapshot tool
              </Link>
            </div>
          </div>
        </section>

        {/* Free vs Premium — full feature matrix */}
        <section className="bg-gray-50 py-12 sm:py-16 border-t border-gray-100">
          <div className="container mx-auto px-3 sm:px-4">
            <FreeVsPremium showCta />
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
