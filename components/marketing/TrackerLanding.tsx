import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Star, BadgeCheck, CloudUpload } from "lucide-react";
import { Reveal } from "@/components/glp1/marketing/Reveal";
import { CountUp } from "@/components/glp1/marketing/CountUp";
import { FaqAccordion } from "@/components/glp1/marketing/FaqAccordion";
import { ScreenshotFrame } from "@/components/glp1/marketing/ScreenshotFrame";
import { SinglePlan } from "@/components/vitals/SinglePlan";
import { StickyCtaBar } from "@/components/glp1/marketing/StickyCtaBar";
import { FreeVsPremium } from "@/components/marketing/FreeVsPremium";

// ─── Config types ─────────────────────────────────────────────────────────────

export interface FeatureItem { icon: LucideIcon; t: string; d: string; hero?: boolean }
export interface FreeRow { title: string; body: string; screenshotLabel: string; screenshotSrc?: string; reverse?: boolean }
export type Accent = "heart" | "metab" | "brand" | "gold";
export interface BonusCard {
  icon: LucideIcon;
  accent: Accent;
  title: string;
  sublabel: string;
  stat: number;
  statPrefix?: string;
  statSuffix?: string;
  body: string;
}
export type CompareVal = "yes" | "no" | "free" | "best" | "partial" | "premium";
export interface CompareRow { feature: string; us: CompareVal; b: CompareVal; c: CompareVal }

export interface TrackerLandingConfig {
  jsonLd: { productName: string; productDescription: string; canonical: string };
  startFreeHref: string;
  hero: { badge: string; h1: string; h1Accent: string; sub: string; trustLine: string; screenshotLabel: string; screenshotSrc?: string };
  trust: { label: string; items: string[] };
  whatYouGet: { heading: string; sub: string; items: FeatureItem[] };
  free: { heading: string; sub: string; rows: FreeRow[]; grid: FeatureItem[] };
  premium: { heading: string; sub: string; items: FeatureItem[] };
  bonus: { heading: string; sub: string; cards: BonusCard[]; screenshotLabels: string[]; screenshotSrcs?: string[] };
  how: { heading: string; sub: string; steps: { t: string; d: string }[] };
  compare: { heading: string; sub: string; cols: [string, string]; rows: CompareRow[]; priceRow: { us: string; b: string; c: string }; note: string };
  pricing: { freeTitle: string; freePrice: string; freeUnit: string; freeSub: string; freeFeatures: string[]; freePrimary: { label: string; href: string } };
  testimonials: { q: string; n: string; m: string }[];
  faqs: { q: string; a: string; link?: { label: string; href: string } }[];
  finalCta: { h2: string; sub: string };
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const btnGreen =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-brand-600 hover:shadow-md";
const btnGold =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold px-6 py-3 text-sm font-bold text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)] transition-all duration-150 hover:-translate-y-0.5";
const btnOutline =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-brand bg-white px-6 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50";

const ACCENT: Record<Accent, { text: string; bg: string }> = {
  heart: { text: "text-heart", bg: "bg-heart/10" },
  metab: { text: "text-metab", bg: "bg-metab/10" },
  brand: { text: "text-brand", bg: "bg-brand/10" },
  gold: { text: "text-gold", bg: "bg-gold/10" },
};

function CompareCell({ v }: { v: CompareVal }) {
  if (v === "no") return <span className="text-sm font-semibold text-faint">No</span>;
  if (v === "partial") return <span className="text-xs font-medium text-faint">Partial</span>;
  if (v === "premium") return <span className="text-xs font-medium text-faint">Premium</span>;
  if (v === "free") return <span className="text-sm font-bold text-brand-800">Free</span>;
  return <span className="text-sm font-bold text-brand">Yes</span>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TrackerLanding({ config: c, paid, loggedIn }: { config: TrackerLandingConfig; paid?: boolean; loggedIn?: boolean }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: c.jsonLd.productName,
        description: c.jsonLd.productDescription,
        brand: { "@type": "Brand", name: "Calqulate" },
        offers: { "@type": "Offer", price: "79", priceCurrency: "USD", url: c.jsonLd.canonical, availability: "https://schema.org/InStock", priceValidUntil: "2027-12-31" },
      },
      { "@type": "FAQPage", mainEntity: c.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  return (
    <main id="main" className="scroll-smooth bg-surface text-copy">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-curve/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-2 lg:gap-12">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-800">
              <CloudUpload className="h-3.5 w-3.5" /> {c.hero.badge}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              {c.hero.h1} <span className="text-brand">{c.hero.h1Accent}</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-copy">{c.hero.sub}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href={c.startFreeHref} className={btnGreen}>{paid ? "Go to dashboard" : "Start free"} <ArrowRight className="h-4 w-4" /></Link>
              {!paid && <Link href="#pricing" className={btnGold}>See Premium</Link>}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-faint">
              <span className="inline-flex items-center gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </span>
              <span>{c.hero.trustLine}</span>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <ScreenshotFrame label={c.hero.screenshotLabel} src={c.hero.screenshotSrc} frame="browser" />
          </Reveal>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-5 text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium text-brand-800"><BadgeCheck className="h-4 w-4" /> {c.trust.label}</span>
          {c.trust.items.map((m) => <span key={m} className="text-faint">{m}</span>)}
        </div>
      </section>

      {/* What you get */}
      <section id="features" className="scroll-mt-24 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{c.whatYouGet.heading}</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-copy">{c.whatYouGet.sub}</p>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.whatYouGet.items.map((f, i) => (
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

      {/* Free features */}
      <section id="free" className="scroll-mt-24 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-800">No paywall on what matters</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{c.free.heading}</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-copy">{c.free.sub}</p>
          </Reveal>

          {c.free.rows.map((row) => (
            <div key={row.title} className="mt-12 grid items-center gap-8 lg:grid-cols-2">
              <Reveal className={row.reverse ? "lg:order-2" : ""}>
                <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-800">Free</span>
                <h3 className="mt-3 text-2xl font-bold text-ink">{row.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-copy">{row.body}</p>
              </Reveal>
              <Reveal delay={100} className={row.reverse ? "lg:order-1" : ""}>
                <ScreenshotFrame label={row.screenshotLabel} src={row.screenshotSrc} />
              </Reveal>
            </div>
          ))}

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.free.grid.map((f, i) => (
              <Reveal key={f.t} delay={i * 40}>
                <div className="h-full rounded-2xl border border-line bg-surface p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand shadow-sm"><f.icon className="h-5 w-5" /></span>
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-800">Free</span>
                  </div>
                  <h3 className="mt-3 text-[15px] font-bold text-ink">{f.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-copy">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Premium (luxe band) */}
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
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), transparent)" }} />
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-light to-gold px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)]">✦ Premium</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{c.premium.heading}</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-white/65">{c.premium.sub}</p>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.premium.items.map((f, i) => (
              <Reveal key={f.t} delay={i * 50} className={f.hero ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
                <div className={`group flex h-full flex-col rounded-2xl border p-6 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 ${f.hero ? "border-gold/25 bg-white/10 shadow-[0_20px_50px_-20px_rgba(245,158,11,.45)] ring-1 ring-gold/15" : "border-white/10 bg-white/5 hover:border-gold/25 hover:bg-white/10"}`}>
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
          {!paid && <Reveal className="mt-12 text-center"><Link href="#pricing" className={btnGold}>Go Premium <ArrowRight className="h-4 w-4" /></Link></Reveal>}
        </div>
      </section>

      {/* Bonus band */}
      <section id="bonus" className="scroll-mt-24 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-gold-light to-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold-ink">Included with Premium</span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{c.bonus.heading}</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-copy">{c.bonus.sub}</p>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {c.bonus.cards.map((card, i) => (
              <Reveal key={card.title} delay={i * 100}>
                <div className="h-full rounded-2xl border border-line bg-white p-7 shadow-[0_8px_24px_rgba(15,23,42,.06)]">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${ACCENT[card.accent].bg} ${ACCENT[card.accent].text}`}><card.icon className="h-6 w-6" /></span>
                    <div>
                      <h3 className="text-xl font-bold text-ink">{card.title}</h3>
                      <p className="text-xs text-faint">{card.sublabel}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-end gap-3">
                    <span className={`text-5xl font-extrabold ${ACCENT[card.accent].text}`}>
                      {card.statPrefix}<CountUp to={card.stat} />{card.statSuffix}
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-copy">{card.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-5 grid gap-5 lg:grid-cols-2">
            {c.bonus.screenshotLabels.map((l, i) => <ScreenshotFrame key={l} label={l} src={c.bonus.screenshotSrcs?.[i]} />)}
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-24 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{c.how.heading}</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-copy">{c.how.sub}</p>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.how.steps.map((s, i) => (
              <Reveal key={s.t} delay={i * 60}>
                <div className="relative h-full rounded-2xl border border-line bg-surface p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
                  <h3 className="mt-4 font-bold text-ink">{s.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-copy">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="compare" className="scroll-mt-24 py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{c.compare.heading}</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-copy">{c.compare.sub}</p>
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
                  <th className="p-4 text-center font-semibold text-copy">{c.compare.cols[0]}</th>
                  <th className="p-4 text-center font-semibold text-copy">{c.compare.cols[1]}</th>
                </tr>
              </thead>
              <tbody>
                {c.compare.rows.map((r) => (
                  <tr key={r.feature} className="border-t border-line">
                    <td className="sticky left-0 z-10 bg-white p-4 text-left font-medium text-ink">{r.feature}</td>
                    <td className="bg-brand-50/60 p-4 text-center"><CompareCell v={r.us} /></td>
                    <td className="p-4 text-center"><CompareCell v={r.b} /></td>
                    <td className="p-4 text-center"><CompareCell v={r.c} /></td>
                  </tr>
                ))}
                <tr className="border-t border-line font-semibold">
                  <td className="sticky left-0 z-10 bg-white p-4 text-left text-ink">Price</td>
                  <td className="bg-brand-50/60 p-4 text-center text-brand-800">{c.compare.priceRow.us}</td>
                  <td className="p-4 text-center text-copy">{c.compare.priceRow.b}</td>
                  <td className="p-4 text-center text-copy">{c.compare.priceRow.c}</td>
                </tr>
              </tbody>
            </table>
          </Reveal>
          <Reveal className="mt-5 text-center text-sm text-copy">{c.compare.note}</Reveal>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-5xl px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-3 text-[17px] leading-relaxed text-copy">One plan that includes everything — every tracker and bonus.</p>
          </Reveal>
          <Reveal className="mt-10">
            <SinglePlan paid={paid} />
          </Reveal>
          {!paid && (
            <Reveal className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={c.pricing.freePrimary.href} className={btnGreen}>{c.pricing.freePrimary.label} <ArrowRight className="h-4 w-4" /></Link>
              <Link href={c.startFreeHref} className={btnOutline}>Start the free tracker</Link>
            </Reveal>
          )}
          <Reveal className="mt-5 text-center text-sm text-faint">Cancel anytime · Switch monthly ↔ yearly anytime · Export your data anytime · Core tracking stays free.</Reveal>
        </div>
      </section>

      {/* Free vs Premium — full feature matrix (from the feature registry) */}
      <section className="bg-gray-50 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <FreeVsPremium showCta />
        </div>
      </section>

      {/* Testimonials (only when real, permissioned reviews exist) */}
      {c.testimonials.length > 0 && (
        <section className="bg-brand-50/40 py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <Reveal className="text-center"><h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">What our members say</h2></Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {c.testimonials.map((t, i) => (
                <Reveal key={t.n} delay={i * 60}>
                  <figure className="h-full rounded-2xl border border-line bg-white p-6">
                    <div className="mb-3 flex gap-1 text-gold">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-current" />)}</div>
                    <blockquote className="text-[15px] leading-relaxed text-ink">“{t.q}”</blockquote>
                    <figcaption className="mt-4 text-sm"><span className="font-semibold text-ink">{t.n}</span><span className="text-faint"> · {t.m}</span></figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal className="text-center"><h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Frequently asked questions</h2></Reveal>
          <Reveal className="mt-8"><FaqAccordion items={c.faqs} /></Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-brand to-brand-800 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <Reveal>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{c.finalCta.h2}</h2>
            <p className="mx-auto mt-3 max-w-xl text-[17px] text-emerald-50/90">{c.finalCta.sub}</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={c.startFreeHref} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-brand-800 shadow-sm transition-all duration-150 hover:-translate-y-0.5">{paid ? "Go to dashboard" : "Start free at calqulate.net"} <ArrowRight className="h-4 w-4" /></Link>
              {!paid && <Link href="#pricing" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">See pricing</Link>}
            </div>
            <p className="mt-6 text-xs text-emerald-50/70">Educational decision-support, not medical advice · We never sell your data.</p>
          </Reveal>
        </div>
      </section>

      <StickyCtaBar hidePremium={paid} loggedIn={loggedIn} />
    </main>
  );
}
