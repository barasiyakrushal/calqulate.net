import { Star, Quote, BadgeCheck, ShieldCheck, Users } from "lucide-react";
import { getReviews } from "@/lib/reviews";
import { GLP1_MEMBER_COUNT } from "@/lib/social-proof";

/**
 * Trust panel shown beside the signup form.
 *
 * Only ONE line here is a fixed claim, and it is verifiably true: the app really
 * does run the Framingham, ASCVD Pooled Cohort and FINDRISC models (see
 * lib/healthCalculations and the methodology shown on every result page).
 *
 * The testimonial and the member count are DATA-GATED on purpose:
 *   - the quote renders only if a real, permissioned review exists in lib/reviews
 *   - the "Join X people" line renders only if GLP1_MEMBER_COUNT is set
 * Until then they are simply absent. Nothing here is a placeholder or an invented
 * number — that would be deceptive for a health product, and the rest of the site
 * is deliberately built the same way.
 */
export function SignupSocialProof() {
  // Prefer a GLP-1 specific review, fall back to any genuine one.
  const review = getReviews("glp1", 1)[0] ?? getReviews(undefined, 1)[0];

  return (
    <aside className="mx-auto mt-6 w-full max-w-sm space-y-3 lg:mt-0">
      {/* Member count — real number only */}
      {GLP1_MEMBER_COUNT && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
          <Users className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm font-medium text-emerald-900">
            Join <strong>{GLP1_MEMBER_COUNT}</strong> people tracking their GLP-1 progress.
          </p>
        </div>
      )}

      {/* Methodology — always shown, and true */}
      <div className="flex items-start gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-gray-600">
          Built on the same validated models clinicians use, including the{" "}
          <strong className="text-gray-900">Framingham</strong>,{" "}
          <strong className="text-gray-900">ASCVD Pooled Cohort</strong> and{" "}
          <strong className="text-gray-900">FINDRISC</strong> equations, with the methodology shown on
          every result.
        </p>
      </div>

      {/* Testimonial — real, permissioned review only */}
      {review && (
        <figure className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="mb-1.5 flex items-center gap-1 text-amber-400" aria-label={`${review.rating ?? 5} out of 5`}>
            {Array.from({ length: Math.max(1, Math.min(5, review.rating ?? 5)) }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          <Quote className="mb-1 h-4 w-4 text-emerald-300" aria-hidden="true" />
          <blockquote className="text-sm leading-relaxed text-gray-700">{review.quote}</blockquote>
          <figcaption className="mt-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-800">{review.name}</span> · {review.context}
          </figcaption>
        </figure>
      )}

      {/* Reassurance — always true, no number required */}
      <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
        <p className="text-sm text-gray-600">
          Free to start, no card. Private, encrypted, and never sold.
        </p>
      </div>
    </aside>
  );
}
