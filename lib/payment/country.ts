/**
 * Country detection for payment routing.
 *
 * Priority:
 *   1. User-selected country (passed from client)
 *   2. Cloudflare cf-ipcountry header
 *   3. x-vercel-ip-country header (Vercel/AWS Amplify)
 *   4. Accept-Language header fallback
 *   5. Default to USD (international)
 */

import type { Gateway, Currency } from "@/lib/payment/types/index";

export interface CountryConfig {
  gateway: Gateway;
  currency: Currency;
}

/** All countries default to PayPal/USD. Razorpay is used via explicit card-button selection. */
const DEFAULT_CONFIG: CountryConfig = { gateway: "paypal", currency: "USD" };

export function getConfigForCountry(_countryCode: string): CountryConfig {
  return DEFAULT_CONFIG;
}

/**
 * Detect country from request headers.
 * Call from server-side API routes and server components.
 */
export function detectCountryFromHeaders(headers: Headers): string {
  // Cloudflare
  const cf = headers.get("cf-ipcountry");
  if (cf && cf.length === 2) return cf;

  // Vercel / Amplify
  const vercel = headers.get("x-vercel-ip-country");
  if (vercel && vercel.length === 2) return vercel;

  // Cloudfront
  const cf2 = headers.get("CloudFront-Viewer-Country");
  if (cf2 && cf2.length === 2) return cf2;

  // Accept-Language fallback (e.g. "en-US,en;q=0.9" → "US")
  const al = headers.get("accept-language");
  if (al) {
    const match = al.match(/-([A-Z]{2})(?:,|;|$)/);
    if (match) return match[1];
  }

  return "US";
}

/**
 * Detect country from browser (client-side fallback).
 * Returns ISO country code or "US" as default.
 */
export function detectCountryFromBrowser(): string {
  if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
    const parts = Intl.DateTimeFormat().resolvedOptions().locale?.split("-");
    if (parts?.length === 2) return parts[1].toUpperCase();
  }
  return "US";
}
