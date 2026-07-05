import Link from "next/link";
import { ArrowRight, Activity, HeartPulse, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/glp1/marketing/Reveal";

/**
 * Luxury Premium band (dark-emerald + gold palette). Showcases the three
 * flagship trackers, each linking to its product page. Gold-shine accents keep
 * the premium feel; fully responsive (1 → 3 columns).
 */
const LUXE_BG =
  "radial-gradient(70% 60% at 82% -10%, rgba(16,185,129,0.22), transparent 60%)," +
  "radial-gradient(55% 60% at 2% 112%, rgba(245,158,11,0.14), transparent 55%)," +
  "linear-gradient(160deg, #0a3a2b 0%, #052017 45%, #02120c 100%)";

const TRACKERS = [
  {
    icon: Activity,
    title: "Metabolism Score Tracker",
    desc: "A composite Metabolic Health Score, heart age and 10-year risk — tracked over time.",
    href: "/product/metabolic-health-tracker",
    cta: "Explore Metabolism Score Tracker",
  },
  {
    icon: HeartPulse,
    title: "Heart Age Tracker",
    desc: "See your vascular age versus your real age with the validated Framingham model — and watch it fall.",
    href: "/product/heart-age-tracker",
    cta: "Explore Heart Age Tracker",
  },
  {
    icon: TrendingUp,
    title: "GLP-1 Progress Tracker",
    desc: "On semaglutide or Ozempic? Track what matters beyond the scale — fat vs. muscle, not just pounds.",
    href: "/product/glp1-progress-tracker",
    cta: "Explore GLP-1 Progress Tracker",
  },
];

export function PremiumTrackersBand() {
  return (
    <section className="relative overflow-hidden py-14 text-white sm:py-20" style={{ background: LUXE_BG }}>
      {/* Luxe accents: gold top hairline, soft orbs, faint grid */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), transparent)" }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-light to-gold px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)]">
            ✦ Calqulate Vitals Premium
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Explore the Products</h2>
          <p className="mt-3 text-[17px] leading-relaxed text-white/65">
            Three flagship trackers, one plan. Pick your starting point and see exactly what Premium unlocks.
          </p>
        </Reveal>

        {/* Three product cards — responsive 1 → 3 columns */}
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKERS.map(({ icon: Icon, title, desc, href, cta }, i) => (
            <Reveal key={href} delay={Math.min(i * 80, 240)}>
              <Link
                href={href}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gold/25 bg-white/[0.06] p-6 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-gold/50 hover:bg-white/[0.1] hover:shadow-[0_20px_50px_-20px_rgba(245,158,11,0.45)]"
              >
                {/* gold shine sweep on hover */}
                <span className="gold-shine pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-12deg] bg-gradient-to-r from-transparent via-gold-light/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold-light/25 to-gold/15 ring-1 ring-gold/40 shadow-[0_4px_16px_rgba(245,158,11,0.2)]">
                  <Icon className="h-6 w-6 text-gold-light" />
                </span>

                <h3 className="relative mt-5 text-lg font-bold text-white">{title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-white/65">{desc}</p>

                <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-light">
                  {cta}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
