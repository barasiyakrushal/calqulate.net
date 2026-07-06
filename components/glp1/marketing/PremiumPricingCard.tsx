"use client";

import { useState } from "react";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import type { Gateway } from "@/lib/payment/types/index";
import { GatewayPicker } from "@/components/payment/GatewayPicker";
import { useCheckout } from "@/hooks/useCheckout";
import { getPrice, formatPrice, displaySubtitle } from "@/lib/payment/pricing";

export function PremiumPricingCard() {
  const [cadence, setCadence] = useState<"yearly" | "monthly">("yearly");
  const { loading, error, checkout, retry } = useCheckout();

  const currency = "USD";
  const price = getPrice("pro", cadence, currency);
  const formatted = formatPrice(price, currency);
  const unit = cadence === "yearly" ? "/year" : "/month";
  const sub = displaySubtitle(currency, cadence);

  async function goPremium(gateway?: Gateway) {
    await checkout("pro", cadence, gateway);
  }

  return (
    <div className="relative flex h-full flex-col rounded-2xl border-2 border-gold bg-white p-7 shadow-[0_8px_24px_rgba(245,158,11,.18)]">
      <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-gold-light to-gold px-3 py-0.5 text-xs font-bold text-gold-ink shadow">
        {cadence === "yearly" ? "Save 34%" : "Premium"}
      </span>

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-bold uppercase tracking-wide text-faint">Premium</div>
        <div className="inline-flex rounded-lg border border-line p-0.5">
          {(["yearly", "monthly"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCadence(c)}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                cadence === c ? "bg-gold text-gold-ink" : "text-faint hover:text-ink"
              }`}
            >
              {c === "yearly" ? "Yearly" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3">
        <span className="text-4xl font-extrabold text-ink">{formatted}</span>
        <span className="text-faint">{unit}</span>
      </div>
      <p className="mt-1 text-sm text-faint">{sub}</p>

      <ul className="mt-5 space-y-2 text-sm text-copy">
        {[
          "Everything in the free tracker",
          "Body composition, benchmarking & labs",
          "Bonus Heart Age + Metabolism trackers",
          "Doctor-ready PDF reports",
          "Cancel anytime \u00b7 export your data anytime",
        ].map((x) => (
          <li key={x} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" /> {x}</li>
        ))}
      </ul>

      <div className="mt-6 space-y-3">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={() => retry()} className="mt-1 text-xs font-semibold text-red-700 hover:underline">
              Try again
            </button>
          </div>
        )}
        <button
          onClick={() => goPremium("paypal")}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold px-6 py-3 text-sm font-bold text-gold-ink shadow-[0_8px_20px_rgba(245,158,11,.35)] transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4" /> Go Premium</>}
        </button>
        <GatewayPicker />
        <div className="text-center">
          <button
                onClick={() => goPremium("razorpay")}
            disabled={loading}
            className="text-xs text-gray-400 underline-offset-2 hover:text-emerald-600 hover:underline"
          >
            or pay with your card
          </button>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-faint">Create your account, then pay securely — cancel anytime.</p>
    </div>
  );
}
