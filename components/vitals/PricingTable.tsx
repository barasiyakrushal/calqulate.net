"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PLANS, type Tier, type Gateway } from "@/lib/payment/types/index";
import { getPrice, formatPrice } from "@/lib/payment/pricing";
import { GatewayPicker } from "@/components/payment/GatewayPicker";
import { useCheckout } from "@/hooks/useCheckout";

export function PricingTable() {
  const [cadence, setCadence] = useState<"monthly" | "yearly">("monthly");
  const { loading, error, checkout, retry } = useCheckout();
  const [activeTier, setActiveTier] = useState<Tier | null>(null);

  const currency = "USD";

  async function subscribe(tier: Tier, gateway?: Gateway) {
    if (tier === "free") {
      window.location.href = "/signup";
      return;
    }
    setActiveTier(tier);
    await checkout(tier, cadence, gateway);
    setActiveTier(null);
  }

  return (
    <div>
      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 p-1">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCadence(c)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${
                cadence === c ? "bg-blue-600 text-white" : "text-gray-600"
              }`}
            >
              {c === "yearly" ? "Yearly (save ~34%)" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 mx-auto max-w-md rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={() => retry()} className="mt-1 text-xs font-semibold text-red-700 hover:underline">
            Try again
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {PLANS.map((p) => {
          const price = p.tier === "free" ? 0 : getPrice(p.tier, cadence, currency);
          const featured = p.tier === "pro";
          const isBusy = loading && activeTier === p.tier;
          return (
            <div
              key={p.tier}
              className={`flex flex-col rounded-2xl border p-6 ${
                featured ? "border-blue-600 shadow-lg" : "border-gray-200"
              }`}
            >
              {featured && (
                <span className="mb-2 inline-block w-fit rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-extrabold">{p.tier === "free" ? "$0" : formatPrice(price, currency)}</span>
                <span className="text-gray-500">
                  {p.tier === "free" ? "" : cadence === "yearly" ? "/yr" : "/mo"}
                </span>
              </div>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-gray-700">
                {p.features.map((f: string) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-blue-600">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {p.tier === "free" ? (
                <button
                  onClick={() => subscribe("free")}
                  className="mt-6 rounded-lg border border-gray-300 px-4 py-2.5 font-semibold hover:bg-gray-50"
                >
                  {p.cta}
                </button>
              ) : (
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => subscribe(p.tier, "paypal")}
                    disabled={isBusy}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 inline-flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {isBusy ? "Redirecting\u2026" : p.cta}
                  </button>
                  <button
                    onClick={() => subscribe(p.tier, "razorpay")}
                    disabled={isBusy}
                    className="w-full text-center text-xs text-gray-400 underline-offset-2 hover:text-emerald-600 hover:underline"
                  >
                    or pay with your card
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6">
        <GatewayPicker />
      </div>
    </div>
  );
}
