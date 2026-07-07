import { createAdminClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/payment/types/index";
import Link from "next/link";
import { CreditCard, Calendar, CheckCircle, XCircle, ArrowRight, RefreshCw } from "lucide-react";
import { CancelButton } from "./CancelButton";

export async function SubscriptionStatus({ userId }: { userId: string }) {
  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("tier, status, gateway, gateway_subscription_id, current_period_end, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (!sub || sub.tier === "free") {
    return (
      <section className="rounded-2xl border bg-white p-6">
        <h2 className="font-semibold">Subscription</h2>
        <p className="mt-1 text-sm text-gray-500">
          You are on the Free plan. Upgrade to unlock Vitals Pro with saved history, trends, PDF reports, and more.
        </p>
        <Link
          href="/pricing"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
        >
          See pricing <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    );
  }

  const plan = PLANS.find((p) => p.tier === sub.tier);
  const isActive = sub.status === "active" || sub.status === "trialing";
  const gatewayLabel = sub.gateway === "paypal" ? "PayPal" : "Razorpay";
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  return (
    <section className="rounded-2xl border bg-white p-6">
      <h2 className="font-semibold">Subscription</h2>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center gap-2">
          {isActive ? (
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="font-medium">{plan?.name ?? sub.tier}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}>
            {isActive ? "Active" : sub.status}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-600">
          <CreditCard className="h-4 w-4" />
          <span>Paid via {gatewayLabel}</span>
        </div>

        {periodEnd && isActive && (
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Next billing: {periodEnd}</span>
          </div>
        )}

        {periodEnd && !isActive && (
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Access until: {periodEnd}</span>
          </div>
        )}
      </div>

      {isActive && <CancelButton />}

      {isActive && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Need a refund?{" "}
            <a
              href="mailto:krushal.barasiya@calqulate.net?subject=Refund%20request&body=Please%20process%20a%20refund%20for%20my%20Calqulate%20Vitals%20subscription.%0A%0AAccount%20email%3A%20[your%20email]%0ASubscription%20ID%3A%20[found%20above]%0A%0AThank%20you."
              className="text-emerald-600 hover:underline font-medium"
            >
              Request a refund
            </a>
            {" · "}
            <Link href="/refund-policy" className="text-emerald-600 hover:underline font-medium">
              Refund policy
            </Link>
          </p>
        </div>
      )}
    </section>
  );
}
