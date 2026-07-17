import { ArrowRight, Check, Activity } from "lucide-react"
import { TrackedLink } from "@/components/analytics/TrackedLink"

/**
 * Green, conversion-focused CTA on high-intent calculator pages.
 *
 * `href` should point straight at signup: the tracker is free to start, so an
 * intermediate product page was just a hop that lost people. `learnMoreHref`
 * keeps the product page reachable for anyone who wants to read first.
 *
 * Bullets must describe FREE-tier features. The button says "free", so anything
 * listed here has to be there without a card. Mark premium extras explicitly.
 */
export function ServiceCTA({
  eyebrow,
  title,
  body,
  bullets,
  href,
  cta,
  learnMoreHref,
  learnMoreLabel = "See how it works",
}: {
  eyebrow: string
  title: string
  body: string
  bullets: string[]
  href: string
  cta: string
  /** Optional secondary link for people who want detail before signing up. */
  learnMoreHref?: string
  learnMoreLabel?: string
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-green-200 bg-gradient-to-br from-green-600 via-green-600 to-emerald-700 p-8 text-white shadow-xl">
      <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
      <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
            <Activity className="h-3.5 w-3.5" /> {eyebrow}
          </span>
          <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-xl text-green-50/90 leading-relaxed">{body}</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-green-50">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0" /> {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col items-stretch gap-3 lg:items-end">
          <TrackedLink
            href={href}
            ctaId="service_cta"
            label={cta}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-center font-bold text-green-700 shadow-lg transition hover:bg-green-50"
          >
            {cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </TrackedLink>
          {learnMoreHref && (
            <TrackedLink
              href={learnMoreHref}
              ctaId="service_cta_learn_more"
              label={learnMoreLabel}
              className="text-center text-sm font-semibold text-green-50 underline underline-offset-4 hover:text-white lg:text-right"
            >
              {learnMoreLabel}
            </TrackedLink>
          )}
          <p className="text-center text-xs text-green-100/80 lg:text-right">
            Free to start. No card needed.
          </p>
        </div>
      </div>
    </section>
  )
}
