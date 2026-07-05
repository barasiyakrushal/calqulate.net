"use client";

import { useState, useCallback } from "react";
import type { Tier, Cadence } from "@/lib/payment/types/index";
import { detectCountryFromBrowser } from "@/lib/payment/country";

interface UseCheckoutOptions {
  onError?: (message: string) => void;
  onRedirect?: (url: string) => void;
}

interface UseCheckoutReturn {
  loading: boolean;
  error: string | null;
  checkout: (tier: Tier, cadence: Cadence, usePaypal?: boolean) => Promise<void>;
  retry: () => void;
  lastAttempt: { tier: Tier; cadence: Cadence; usePaypal?: boolean } | null;
}

export function useCheckout(options: UseCheckoutOptions = {}): UseCheckoutReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAttempt, setLastAttempt] = useState<{ tier: Tier; cadence: Cadence; usePaypal?: boolean } | null>(null);

  const checkout = useCallback(
    async (tier: Tier, cadence: Cadence, usePaypal?: boolean) => {
      setLoading(true);
      setError(null);
      // usePaypal === true  → PayPal explicitly (also accepts Visa/MC/Amex, no account needed).
      // usePaypal === false → "pay with card": auto-detect by country
      //                       (India → Razorpay/INR, everywhere else → PayPal/USD).
      // undefined           → PayPal.
      const gateway = usePaypal === false ? undefined : "paypal";
      // For the auto path, let the server resolve country from IP headers (more reliable
      // than the browser locale); for the explicit path, pass the browser hint.
      const country = gateway ? detectCountryFromBrowser() : undefined;
      setLastAttempt({ tier, cadence, usePaypal });

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
      checkout(lastAttempt.tier, lastAttempt.cadence, lastAttempt.usePaypal);
    }
  }, [lastAttempt, checkout]);

  return { loading, error, checkout, retry, lastAttempt };
}
