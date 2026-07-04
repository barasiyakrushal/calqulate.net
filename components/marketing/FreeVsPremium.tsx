import Link from "next/link";
import { Check, Lock, Sparkles, ArrowRight } from "lucide-react";
import { FEATURE_AREAS } from "@/lib/features";

/**
 * Free vs. Premium comparison — driven entirely by lib/features.ts so the
 * marketing tables and the in-app locks can never disagree. Reused on pricing,
 * home, how-it-works and the product pages.
 */
export function FreeVsPremium({
  heading = "What’s free vs. Premium",
  subheading = "The whole logging engine is free forever. Premium unlocks the forward-looking, personalized layer — forecasts, simulators and your correlation engine.",
  showCta = false,
  className = "",
}: {
  heading?: string;
  subheading?: string;
  showCta?: boolean;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-3xl ${className}`}>
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">{heading}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">{subheading}</p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white">
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

      {showCta && (
        <div className="mt-6 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            See plans — $9.99/mo or $79/yr <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-xs text-gray-500">Start free, no card. Upgrade when you want the predictions.</p>
        </div>
      )}
    </div>
  );
}
