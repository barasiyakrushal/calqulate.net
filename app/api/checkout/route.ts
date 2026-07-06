import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { paymentService } from "@/lib/payment/PaymentService";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";
import { detectCountryFromHeaders, getConfigForCountry } from "@/lib/payment/country";
import type { Tier, Cadence, Gateway } from "@/lib/payment/types/index";
import { getPrice } from "@/lib/payment/pricing";

const schema = z.object({
  gateway: z.enum(["razorpay", "paypal"]).optional(),
  tier: z.enum(["free", "pro"]),
  cadence: z.enum(["monthly", "yearly"]),
  country: z.string().length(2).optional(),
});

export async function POST(req: Request) {
  try {
    const rl = await rateLimit(`checkout:${clientIp(req)}`, 15, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
      );
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { gateway, tier, cadence, country: clientCountry } = parsed.data;

    const origin = req.headers.get("origin") ?? "";
    const SITE = origin || process.env.NEXT_PUBLIC_SITE_URL || "https://calqulate.net";

    if (tier === "free") {
      return NextResponse.json({ url: `${SITE}/signup` });
    }

    // Detect country: client-provided > server headers > default
    const country = clientCountry ?? detectCountryFromHeaders(req.headers);

    // If gateway explicitly chosen by user, use it; otherwise auto-detect.
    // Razorpay: India → INR, non-India → USD (for card payments once international approved).
    // PayPal: always USD.
    let config = gateway
      ? { gateway: gateway as Gateway, currency: gateway === "razorpay" && country !== "IN" ? "USD" as const : "INR" as const }
      : getConfigForCountry(country);

    // Fallback: Razorpay USD plans not yet configured → route to PayPal.
    // Once Razorpay approves international cards, set RAZORPAY_PLAN_PRO_MONTHLY/YEARLY
    // env vars and this fallback drops away automatically.
    if (config.gateway === "razorpay" && config.currency === "USD") {
      const monthlyPlan = process.env.RAZORPAY_PLAN_PRO_MONTHLY;
      const yearlyPlan = process.env.RAZORPAY_PLAN_PRO_YEARLY;
      if (!monthlyPlan || monthlyPlan === '<plan_id>' || !yearlyPlan || yearlyPlan === '<plan_id>') {
        config = { gateway: "paypal", currency: "USD" };
      }
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const result = await paymentService.createCheckout(config.gateway, {
      userId: user.id,
      userEmail: user.email ?? null,
      tier: tier as Tier,
      cadence: cadence as Cadence,
      currency: config.currency,
      country,
      siteUrl: SITE,
      successUrl: `${SITE}/calqulate-vitals/welcome`,
      cancelUrl: `${SITE}/pricing?checkout=cancelled`,
    });

    return NextResponse.json({ url: result.url, gateway: config.gateway, currency: config.currency });
  } catch (err) {
    const message = (err as Error)?.message ?? JSON.stringify(err);
    console.error("[checkout] error:", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
