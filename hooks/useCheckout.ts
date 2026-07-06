"use client";

import { useState, useCallback } from "react";
import type { Tier, Cadence, Gateway } from "@/lib/payment/types/index";
import { detectCountryFromBrowser } from "@/lib/payment/country";

interface UseCheckoutOptions {
  onError?: (message: string) => void;
  onRedirect?: (url: string) => void;
}

interface UseCheckoutReturn {
  loading: boolean;
  error: string | null;
  checkout: (tier: Tier, cadence: Cadence, gateway?: Gateway) => Promise<void>;
  retry: () => void;
  lastAttempt: { tier: Tier; cadence: Cadence; gateway?: Gateway } | null;
}

export function useCheckout(options: UseCheckoutOptions = {}): UseCheckoutReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAttempt, setLastAttempt] = useState<{ tier: Tier; cadence: Cadence; gateway?: Gateway } | null>(null);

  const checkout = useCallback(
    async (tier: Tier, cadence: Cadence, gateway?: Gateway) => {
      setLoading(true);
      setError(null);
      // gateway = undefined → server auto-detects by IP country (India → Razorpay/INR, rest → PayPal/USD)
      // gateway = "paypal"  → explicit PayPal
      // gateway = "razorpay" → explicit Razorpay (for card payments; falls back to PayPal if USD plans not configured)
      const country = gateway ? detectCountryFromBrowser() : undefined;
      setLastAttempt({ tier, cadence, gateway });

      try {
        const payload: Record<string, unknown> = { tier, cadence };
        if (gateway) payload.gateway = gateway;
        if (country) payload.country = country;
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => ({}));

        if (data.url) {
          options.onRedirect?.(data.url);
          window.location.href = data.url;
          return;
        }

        if (res.status === 401) {
          window.location.href = `/signup?next=/pricing`;
          return;
        }

        const msg = data.error ?? "Could not start checkout. Please try again.";
        setError(msg);
        options.onError?.(msg);
      } catch {
        const msg = "Could not start checkout. Please try again.";
        setError(msg);
        options.onError?.(msg);
      } finally {
        setLoading(false);
      }
    },
    [options],
  );

  const retry = useCallback(() => {
    if (lastAttempt) {
      checkout(lastAttempt.tier, lastAttempt.cadence, lastAttempt.gateway);
    }
  }, [lastAttempt, checkout]);

  return { loading, error, checkout, retry, lastAttempt };
}
