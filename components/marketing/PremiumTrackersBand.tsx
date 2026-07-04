import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/glp1/marketing/Reveal";
import { PREMIUM_FEATURES } from "@/lib/features";

/**
 * Luxury Premium band (dark-emerald + gold palette). Lists ONLY the premium
 * features (from the feature registry) so it reads as the paid-tier value prop.
 * Two CTAs: start free (login required → dashboard's free features), or go
 * Premium (pricing).
 */
const LUXE_BG =
  "radial-gradient(70% 60% at 82% -10%, rgba(16,185,129,0.22), transparent 60%)," +
  "radial-gradient(55% 60% at 2% 112%, rgba(245,158,11,0.14), transparent 55%)," +
  "linear-gradient(160deg, #0a3a2b 0%, #052017 45%, #02120c 100%)";

export function PremiumTrackersBand({ paid }: { paid?: boolean }) {
  return (
    <section className="relative overflow-hidden py-14 text-white sm:py-20" style={{ background: LUXE_BG }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.55), transparent)" }} />
      <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-light to-gold px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)]">
            ✦ Calqulate Vitals Premium
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Everything Premium unlocks</h2>
          <p className="mt-3 text-[17px] leading-relaxed text-white/65">
            The whole logging engine is free. Premium unlocks the forward-looking, personalized layer — one plan, $9.99/mo or $79/yr.
          </p>
        </Reveal>

        {/* Premium feature list (from the feature registry) */}
        <div className="mx-auto mt-10 grid max-w-4xl gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {PREMIUM_FEATURES.map((f, i) => (
            <Reveal key={f.key} delay={Math.min(i * 25, 300)}>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gold/20 ring-1 ring-gold/30">
                  <Check className="h-2.5 w-2.5 text-gold-light" />
                </span>
                <span className="text-[15px] leading-snug text-white/80">
                  {f.label}
                  {f.note ? <span className="text-white/45"> ({f.note})</span> : null}
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTAs — start free (login) + go Premium (pricing) */}
        <Reveal className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          {paid ? (
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-brand-600 sm:w-auto"
            >
              Go to dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login?next=/dashboard"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-brand-600 sm:w-auto"
              >
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold px-6 py-3 text-sm font-bold text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)] transition-all duration-150 hover:-translate-y-0.5 sm:w-auto"
              >
                Go Premium <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}
