import Image from "next/image";
import { Star, Quote, ShieldCheck, BadgeCheck, RefreshCw, Lock } from "lucide-react";
import { STATS } from "@/lib/social-proof";
import { getReviews } from "@/lib/reviews";

/**
 * Social proof. Renders REAL member reviews from lib/reviews.ts. Until genuine
 * reviews exist, it shows honest trust signals (validated models, privacy,
 * guarantee) instead of fabricated quotes — never placeholder testimonials.
 */
const TRUST = [
  { icon: BadgeCheck, t: "Validated clinical models", d: "Pooled Cohort Equations, Framingham & FINDRISC. Methodology shown on every result." },
  { icon: Lock, t: "Private by design", d: "Encrypted, backed up, and never sold. Export or delete anytime." },
  { icon: ShieldCheck, t: "Your data is never lost", d: "Durable saves, version history and a restore flow, the #1 thing other apps get wrong." },
  { icon: RefreshCw, t: "Cancel anytime", d: "One click, no retention maze. Switch monthly ↔ yearly whenever you like." },
];

export function SocialProof() {
  const stats = STATS.filter((s) => s.value);
  const reviews = getReviews(undefined, 4);

  return (
    <section className="bg-white py-16 border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Stats strip (factual only) */}
        {stats.length > 0 && (
          <div className="mb-14 grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-emerald-600 md:text-4xl">{s.value}</div>
                <div className="mt-1 text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {reviews.length > 0 ? (
          <>
            <div className="text-center mb-10">
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3 block">What members say</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">People who kept it off</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {reviews.map((t) => (
                <figure key={t.name} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6">
                  <div className="mb-3 flex items-center gap-1 text-amber-400">
                    {Array.from({ length: t.rating ?? 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <Quote className="mb-2 h-5 w-5 text-emerald-300" />
                  <blockquote className="text-[15px] leading-relaxed text-gray-700">{t.quote}</blockquote>
                  <figcaption className="mt-4 text-sm">
                    <span className="font-semibold text-gray-900">{t.name}</span>
                    <span className="text-gray-400"> · {t.context}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </>
        ) : (
          /* No reviews yet — honest trust signals instead of fake quotes */
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Left: visual */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-emerald-400/20 blur-3xl" />
              <div className="relative aspect-[5/4] w-full overflow-hidden rounded-3xl ring-1 ring-emerald-100 shadow-xl bg-white">
                <Image
                  src="/why-people-trust-calqulate.webp"
                  alt="Why people trust Calqulate: validated models, private by design, durable data and cancel anytime"
                  fill
                  sizes="(max-width: 1500px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>
            </div>

            {/* Right: text + trust signals */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3 block">Why people trust us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Built to earn your trust, not just your subscription</h2>
              <p className="mt-3 text-gray-500 max-w-xl">
                We&rsquo;re new, and we&rsquo;d rather show you exactly how we work than post reviews we can&rsquo;t back up.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {TRUST.map((s) => (
                  <div key={s.t} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><s.icon className="h-5 w-5" /></span>
                    <h3 className="mt-4 text-sm font-bold text-gray-900">{s.t}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">{s.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-gray-400">
          Educational decision-support, not medical advice. Individual results vary.
        </p>
      </div>
    </section>
  );
}
