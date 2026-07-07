/**
 * Central pricing configuration — the ONLY place prices are defined.
 * Frontend displays prices from here. Providers map tiers to their plan IDs.
 * Change a price once and it updates everywhere.
 */

export type Currency = "USD";

export interface PriceEntry {
  amount: number;
  currency: Currency;
  label: string;
}

export interface LocalizedPricing {
  monthly: PriceEntry;
  yearly: PriceEntry;
}

/**
 * Prices per tier per currency.
 * Add a new currency here and all pages auto-display it.
 */
export const PRICES: Record<string, Record<Currency, LocalizedPricing>> = {
  pro: {
    USD: {
      monthly: { amount: 9.99, currency: "USD", label: "$9.99/month" },
      yearly: { amount: 79, currency: "USD", label: "$79/year" },
    },
  },
};

export function getPrice(tier: string, cadence: "monthly" | "yearly", currency: Currency): number {
  return PRICES[tier]?.[currency]?.[cadence]?.amount ?? 0;
}

export function formatPrice(amount: number, _currency: Currency): string {
  const formatted = Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2);
  return `$${formatted}`;
}

export function displayPriceFull(tier: string, cadence: "monthly" | "yearly", currency: Currency): string {
  const entry = PRICES[tier]?.[currency]?.[cadence];
  if (!entry) return "Free";
  const unit = cadence === "yearly" ? "/year" : "/month";
  return `${formatPrice(entry.amount, currency)}${unit}`;
}

export function displaySubtitle(_currency: Currency, cadence: "monthly" | "yearly"): string {
  if (cadence === "yearly") {
    const monthly = PRICES.pro.USD.monthly.amount;
    const yearly = PRICES.pro.USD.yearly.amount;
    const effectiveMonthly = (yearly / 12).toFixed(2);
    return `Billed annually — about $${effectiveMonthly}/mo. Save ~${Math.round((1 - yearly / (monthly * 12)) * 100)}%.`;
  }
  return "Billed monthly. Switch to yearly anytime.";
}
