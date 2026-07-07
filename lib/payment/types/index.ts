/** Gateway-agnostic plan and subscription types */

export type Tier = "free" | "pro";
export type Gateway = "razorpay" | "paypal";
export type Currency = "USD";
export type Cadence = "monthly" | "yearly";
export type SubscriptionStatus = "active" | "inactive" | "trialing" | "canceled" | "past_due";

export interface Plan {
  tier: Tier;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  cta: string;
}

export const PLANS: Plan[] = [
  {
    tier: "free",
    name: "Free",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "All Calqulate calculators",
      "One-time metabolic health snapshot",
      "No saved history",
    ],
    cta: "Start free",
  },
  {
    tier: "pro",
    name: "Vitals Pro",
    priceMonthly: 9.99,
    priceYearly: 79,
    features: [
      "All Calqulate calculators",
      "Saved measurement history",
      "Metabolic Health Score + trend dashboard",
      "Personalized 'next lever' protocol",
      "Re-measure & milestone reminders",
      "Doctor-shareable PDF reports",
      "Full lab-value tracking (A1c, lipids)",
      "Priority access to new risk engines",
    ],
    cta: "Get Vitals Pro",
  },
];

export function priceForTier(tier: Tier, cadence: Cadence): number {
  const plan = PLANS.find((p) => p.tier === tier);
  if (!plan) return 0;
  return cadence === "yearly" ? plan.priceYearly : plan.priceMonthly;
}

export function displayPrice(tier: Tier, cadence: Cadence): string {
  const amount = priceForTier(tier, cadence);
  if (amount === 0) return "Free";
  return `$${amount}`;
}

export function displayUnit(tier: Tier, cadence: Cadence): string {
  if (tier === "free") return "";
  return cadence === "yearly" ? "/year" : "/month";
}

export function displaySub(cadence: Cadence): string {
  return cadence === "yearly"
    ? "Billed annually — about $6.58/mo. Save ~34%."
    : "Billed monthly. Switch to yearly anytime.";
}

/** Razorpay-specific plan ID lookup (always USD) */
export function razorpayPlanIdFor(tier: Tier, cadence: Cadence): string | undefined {
  if (tier === "free") return undefined;
  return process.env[`RAZORPAY_PLAN_${tier.toUpperCase()}_${cadence.toUpperCase()}`];
}

/** PayPal-specific plan ID lookup (always USD) */
export function paypalPlanIdFor(tier: Tier, cadence: Cadence): string | undefined {
  if (tier === "free") return undefined;
  return process.env[`PAYPAL_PLAN_${tier.toUpperCase()}_${cadence.toUpperCase()}`];
}
