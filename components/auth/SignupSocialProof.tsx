import { Star, ShieldCheck, BadgeCheck, User, Activity, Syringe, Scale, TrendingUp } from "lucide-react";
import { SIGNUP_SOCIAL } from "@/lib/social-proof";
import { LIVE_ACTIVITY, hasLiveActivity } from "@/lib/live-activity";
import { getReviews } from "@/lib/reviews";

/**
 * Premium signup social-proof card.
 *
 * The full visual design (avatar stack, "LIVE" activity feed, member count, star
 * rating) is built and ready — but every claim is DATA-GATED to real figures:
 *   - counts render only when set to a real number in lib/social-proof.ts
 *   - the live feed renders only from genuine, consented entries in lib/live-activity.ts
 *   - the rating renders only when there are real reviews in lib/reviews.ts
 * When those are empty (the honest default), the card shows truthful trust
 * signals instead of invented numbers. Fabricated counts/reviews/activity on a
 * US health signup are deceptive and FTC-actionable — see the notes in those files.
 */
export function SignupSocialProof() {
  const { memberCount, rating, ratingCount, statesCovered } = SIGNUP_SOCIAL;
  const reviewCount = getReviews("glp1").length;
  const showRating = !!rating && reviewCount > 0;
  const filledStars = showRating ? Math.round(Number(rating)) : 0;

  return (
    <section
      aria-label="Why people join Calqulate"
      className="w-full rounded-[18px] border border-emerald-100 bg-[#F0FDF4] p-5 shadow-[0_8px_24px_rgba(16,163,74,0.06)] sm:p-6"
    >
      {/* ── Live activity — only if there is genuine, consented activity ── */}
      {hasLiveActivity && (
        <div className="mb-4 rounded-2xl border border-emerald-100 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">Live</span>
          </div>
          <ul className="space-y-2.5">
            {LIVE_ACTIVITY.slice(0, 3).map((a, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-slate-700">
                  <strong className="font-semibold text-slate-900">{a.firstName}</strong>{" "}
                  <span className="text-slate-400">({a.state})</span> {a.action}
                </span>
                {a.emoji && <span className="shrink-0">{a.emoji}</span>}
              </li>
            ))}
          </ul>
          {memberCount && (
            <p className="mt-3 border-t border-slate-100 pt-2.5 text-xs font-semibold text-emerald-700">
              {memberCount} people tracking today
            </p>
          )}
        </div>
      )}

      {/* ── Member count + avatar affordance — only with a real count ── */}
      {memberCount ? (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-emerald-200 to-teal-300 text-emerald-800 shadow-sm"
              >
                <User className="h-3.5 w-3.5" />
              </span>
            ))}
          </div>
          <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            {memberCount}
          </span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-bold text-emerald-700">
          <Activity className="h-3.5 w-3.5" /> Built for GLP-1 users
        </div>
      )}

      {/* ── Headline ── */}
      <p className="mt-3 text-[17px] font-bold leading-snug text-slate-900">
        {memberCount
          ? `${memberCount} people are tracking their GLP-1 journey with Calqulate.`
          : "Track your whole GLP-1 journey in one private place."}
      </p>

      {/* ── What you track (truthful, always) ── */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          { icon: Scale, label: "Weight & waist" },
          { icon: Syringe, label: "Injections" },
          { icon: Activity, label: "Side effects" },
          { icon: TrendingUp, label: "Progress & trends" },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[13px] font-medium text-slate-700">
            <f.icon className="h-4 w-4 shrink-0 text-emerald-600" />
            {f.label}
          </div>
        ))}
      </div>

      {/* ── Rating (real reviews only) OR validated-models trust (always true) ── */}
      {showRating ? (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex text-amber-400" aria-label={`${rating} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < filledStars ? "fill-current" : "text-slate-200"}`} />
            ))}
          </div>
          <span className="text-sm font-semibold text-slate-800">{rating}</span>
          <span className="text-xs text-slate-500">
            average{ratingCount ? ` · ${ratingCount} reviews` : ""}
            {statesCovered ? ` · across ${statesCovered}` : ""}
          </span>
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-2 border-t border-emerald-100 pt-3 text-[13px] leading-relaxed text-slate-600">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            Built on the same validated models clinicians use —{" "}
            <strong className="text-slate-800">Framingham</strong>,{" "}
            <strong className="text-slate-800">ASCVD Pooled Cohort</strong> &{" "}
            <strong className="text-slate-800">FINDRISC</strong> — with the methodology shown on every result.
          </span>
        </div>
      )}

      {/* ── Privacy (always true) ── */}
      <div className="mt-2.5 flex items-center gap-2 text-[13px] text-slate-600">
        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
        Private, encrypted, and never sold.
      </div>
    </section>
  );
}
