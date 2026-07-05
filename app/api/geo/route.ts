import { NextResponse } from "next/server";
import { detectCountryFromHeaders } from "@/lib/payment/country";

/**
 * Lightweight geolocation endpoint. Resolves the visitor's country from the
 * CDN/edge IP headers (Cloudflare / Vercel / CloudFront) — the same source the
 * checkout route uses to pick a gateway — so the pricing card can tailor its UI
 * (India → Razorpay/INR, everywhere else → PayPal/USD) without trusting the
 * browser locale. No auth, no PII.
 */
export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const country = detectCountryFromHeaders(req.headers);
  return NextResponse.json({ country });
}
