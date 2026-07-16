/**
 * ============================================================
 * CONVERSION TRACKING
 * Thin, safe wrapper over the GTM dataLayer.
 *
 * The GTM container (GTM-MNCCJNHF) is loaded in app/layout.tsx, but it only
 * ever saw pageviews. These events give the funnel real steps to measure:
 *
 *   cta_click       -> which page/CTA actually sends people to signup
 *   signup_start    -> they submitted the form (or launched OAuth)
 *   signup_complete -> an account was really created
 *   signup_error    -> why a signup attempt failed
 *   onboarding_step -> where the 6-step GLP-1 setup loses people
 *   paywall_view    -> which locked feature drove the upgrade prompt
 *
 * In GTM, create a Custom Event trigger per event name and forward to GA4.
 * Fails silently if the dataLayer is absent (blocked, SSR, consent tools).
 * ============================================================
 */

export type AnalyticsEvent =
  | "cta_click"
  | "signup_start"
  | "signup_complete"
  | "signup_error"
  | "onboarding_step"
  | "paywall_view";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Push an event to the GTM dataLayer. No-ops on the server and never throws,
 * so a tracking failure can never break a signup or a paywall render.
 */
export function track(event: AnalyticsEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...params });
  } catch {
    /* analytics must never break the app */
  }
}
