"use client";

import { ArrowRight, Smartphone } from "lucide-react";
import { TrackedLink } from "@/components/analytics/TrackedLink";

/**
 * Sits under a browser-only history panel on a weight/body-composition tool.
 *
 * These panels used to say "no account needed" as a selling point, which talked
 * people out of the one thing that would keep their data. The privacy claim is
 * true and stays — but localStorage genuinely dies on a cookie clear or a device
 * switch, and naming that honestly is what earns the signup.
 *
 * The offer is deliberately scoped to the FREE tier: logging a weight, the
 * timeline, and 90 days of history are all free (see lib/features.ts). Do not
 * promise premium views (fat-vs-muscle trend, forecasts) here.
 */
export function SyncPrompt({
  ctaId,
  className = "",
}: {
  /** Stable id so reports show which calculator drove the signup. */
  ctaId: string;
  className?: string;
}) {
  return (
    <div
      className={`mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-slate-600">
          <strong className="text-slate-900">This history lives in this browser only.</strong> Clear your
          cookies or pick up your phone, and it is gone. Log your weight in the free tracker instead and it
          is saved to your account, on any device.
        </p>
      </div>
      <TrackedLink
        href="/signup?next=/dashboard/glp1"
        ctaId={ctaId}
        label="Save across devices"
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-800"
      >
        Save across devices <ArrowRight className="h-3.5 w-3.5" />
      </TrackedLink>
    </div>
  );
}
