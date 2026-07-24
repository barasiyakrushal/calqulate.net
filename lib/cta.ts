// lib/cta.ts
// One brand CTA, one destination — signup. The label sells the OUTCOME the user
// wants on that page (save a result, track their journey), not the mechanic of
// logging in. Keep the destination identical everywhere so green = continue.

export const CTA_HREF = "/signup?next=/dashboard/glp1";

export interface CtaCopy {
  label: string;
  ctaId: string;
}

/**
 * Pick the CTA label from the page type:
 *  - any GLP-1 / comparison page  → "Track My GLP-1 Journey"
 *  - editorial (answers / blog)   → "Track My GLP-1 Journey"
 *  - any other calculator (/health)→ "Save My Result"
 *  - everything else (home, product, pricing) → "Start Free"
 */
export function ctaForPath(pathname: string | null | undefined): CtaCopy {
  const p = (pathname || "/").toLowerCase();
  if (p.includes("glp-1") || p.includes("glp1") || p.startsWith("/compare")) {
    return { label: "Track My GLP-1 Journey", ctaId: "cta_glp1_journey" };
  }
  if (p.startsWith("/answers") || p.startsWith("/blog")) {
    return { label: "Track My GLP-1 Journey", ctaId: "cta_content" };
  }
  if (p.startsWith("/health/")) {
    return { label: "Save My Result", ctaId: "cta_save_result" };
  }
  return { label: "Start Free", ctaId: "cta_start_free" };
}

// Routes where the elevated CTA, trust bar, and sticky bar should NOT appear
// (the user is already in a signup/auth/app flow).
const HIDE_PREFIXES = [
  "/login",
  "/signup",
  "/checkout",
  "/reset-password",
  "/forgot-password",
  "/dashboard",
  "/auth",
  "/unsubscribe",
  "/admin",
];

export function ctaSuppressed(pathname: string | null | undefined): boolean {
  const p = (pathname || "/").toLowerCase();
  return HIDE_PREFIXES.some((h) => p.startsWith(h));
}
