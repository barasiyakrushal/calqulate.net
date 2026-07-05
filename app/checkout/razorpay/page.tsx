"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: () => void) => void };
  }
}

export default function RazorpayCheckoutPage() {
  const params = useSearchParams();
  const router = useRouter();
  const opened = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (opened.current) return;
    const subscriptionId = params.get("subscription_id");
    const key = params.get("key");
    if (!subscriptionId || !key) {
      setError("Missing checkout parameters. Please return to pricing and try again.");
      setLoading(false);
      return;
    }

    opened.current = true;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      try {
        const rzp = new window.Razorpay({
          key,
          subscription_id: subscriptionId,
          name: "Calqulate",
          description: "Vitals Pro",
          image: "https://calqulate.net/calqulate-logo.png",
          theme: { color: "#059669" },
          handler: () => {
            router.push("/calqulate-vitals/welcome");
          },
          modal: {
            ondismiss: () => {
              router.push("/pricing?checkout=cancelled");
            },
          },
        });

        rzp.on("payment.failed", () => {
          router.push("/pricing?checkout=cancelled");
        });

        setLoading(false);
        setTimeout(() => rzp.open(), 300);
      } catch (e) {
        setError("Failed to initialize payment. Please try again.");
        setLoading(false);
      }
    };
    script.onerror = () => {
      setError("Could not load payment gateway. Check your internet connection and try again.");
      setLoading(false);
    };
    document.body.appendChild(script);
  }, [params, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-sm text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <p className="mt-3 text-sm text-gray-700">{error}</p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => { opened.current = false; setError(null); setLoading(true); window.location.reload(); }}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
            <button
              onClick={() => router.push("/pricing")}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Back to pricing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
        <p className="mt-3 text-sm text-gray-600">
          {loading ? "Loading payment gateway…" : "Opening payment window…"}
        </p>
      </div>
    </div>
  );
}
