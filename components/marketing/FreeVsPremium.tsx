import Link from "next/link";
import { Check, Lock, Sparkles, ArrowRight, ChevronDown } from "lucide-react";
import { FEATURE_AREAS, FREE_FEATURES, PREMIUM_FEATURES } from "@/lib/features";

/**
 * Free vs. Premium comparison — driven entirely by lib/features.ts so the
 * marketing tables and the in-app locks can never disagree. Reused on pricing,
 * home, how-it-works and the product pages.
 *
 * `collapsible` hides the (long) table behind a native <details> toggle. Used on
 * the home page, where the full list costs more scroll than it earns. The heading
 * and subheading always stay visible, so the "free covers today" message lands
 * whether or not anyone opens it. Native <details> keeps this a server component.
 */
export function FreeVsPremium({
  heading = "Everything you need to start is free",
  subheading = "Free covers today: log every dose, watch your weight, see how much medication is still working. Premium tells you what happens next: when you will hit your goal, why progress slowed, and whether you are losing fat or muscle.",
  showCta = false,
  collapsible = false,
  className = "",
}: {
  heading?: string;
  subheading?: string;
  showCta?: boolean;
  /** Hide the comparison table behind a "See the full feature list" toggle. */
  collapsible?: boolean;
  className?: string;
}) {
  const table = (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {/* Column header */}
      <div className="grid grid-cols-[1fr_56px_72px] items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 sm:grid-cols-[1fr_72px_88px] sm:px-6">
        <span>Feature</span>
        <span className="text-center">Free</span>
        <span className="inline-flex items-center justify-center gap-1 text-center text-amber-600"><Sparkles className="h-3 w-3" /> Premium</span>
      </div>

      {FEATURE_AREAS.map((group) => (
        <div key={group.area}>
          <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400 sm:px-6">
            {group.area}
          </div>
          {group.rows.map((row) => (
            <div key={row.key} className="grid grid-cols-[1fr_56px_72px] items-center gap-2 border-b border-gray-50 px-4 py-2.5 text-sm last:border-0 sm:grid-cols-[1fr_72px_88px] sm:px-6">
              <span className="text-gray-700">
                {row.label}
                {row.note ? <span className="text-gray-400"> ({row.note})</span> : null}
              </span>
              <span className="flex justify-center">
                {row.tier === "free" ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-gray-300" />
                )}
              </span>
              <span className="flex justify-center">
                <Check className="h-4 w-4 text-amber-500" />
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`mx-auto max-w-3xl ${className}`}>
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">{heading}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">{subheading}</p>
      </div>

      {collapsible ? (
        <details className="group mt-6">
          <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">
              See the full feature list ({FREE_FEATURES.length} free, {PREMIUM_FEATURES.length} premium)
            </span>
            <span className="hidden group-open:inline">Hide the full list</span>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="mt-6">{table}</div>
        </details>
      ) : (
        <div className="mt-8">{table}</div>
      )}

      {showCta && (
        <div className="mt-6 text-center">
          <Link
            href="/pricing"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-gold-light to-gold px-6 py-3 font-bold text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)] transition-all duration-150 hover:-translate-y-0.5"
          >
            <span className="gold-shine pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-12deg] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <span className="relative inline-flex items-center gap-2">
              See plans — $9.99/mo or $79/yr <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <p className="mt-2 text-xs text-gray-500">Start free, no card. Upgrade when you want the predictions.</p>
        </div>
      )}
    </div>
  );
}
