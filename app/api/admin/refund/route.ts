import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { paymentService } from "@/lib/payment/PaymentService";
import { resolveIsAdmin } from "@/lib/admin-core";
import { logAudit } from "@/lib/admin";
import type { Gateway } from "@/lib/payment/types/index";

/**
 * Admin-only: mark a subscription as refunded.
 * The admin must process the refund in the gateway dashboard first.
 * This endpoint updates the DB so user access is revoked immediately.
 */
export async function POST(req: Request) {
  const admin = createAdminClient();

  // Verify admin
  const { data: { user } } = await admin.auth.getUser();
  if (!user || !(await resolveIsAdmin(admin, user))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { subscriptionId, userId, gatewaySubId, gateway } = await req.json();
    if (!subscriptionId || !userId) {
      return NextResponse.json({ error: "Missing subscriptionId or userId" }, { status: 400 });
    }

    // Cancel on gateway side if still active
    if (gatewaySubId) {
      try {
        await paymentService.cancelSubscription((gateway ?? "razorpay") as Gateway, gatewaySubId);
      } catch {
        // Non-blocking — may already be cancelled
      }
    }

    // Update DB: set to canceled, expire immediately
    await admin
      .from("subscriptions")
      .update({
        status: "canceled",
        current_period_end: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId);

    await logAudit("refund", subscriptionId, { userId, gatewaySubId, gateway });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
