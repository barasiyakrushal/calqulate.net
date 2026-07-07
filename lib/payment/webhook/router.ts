import { paymentService } from "../PaymentService";
import { markEventProcessed, logWebhook } from "../utils/idempotency";
import { syncSubscription } from "../SubscriptionService";
import type { Gateway } from "../types/index";

export async function processWebhook(
  gateway: Gateway,
  body: string,
  signature: string,
): Promise<{ received: boolean; status: string }> {
  let normalized;

  try {
    normalized = await paymentService.handleWebhook(gateway, body, signature);
  } catch (err) {
    await logWebhook(gateway, "unknown", null, body, "error", 400, (err as Error).message);
    throw err;
  }

  await logWebhook(gateway, normalized.eventId, normalized.type, body, "received");

  // Razorpay sends subscription.pending (→ subscription.created) BEFORE
  // the user completes payment.  We must NOT provision the user until the
  // first payment is actually captured (subscription.charged).
  if (normalized.type === "subscription.created" && normalized.status === "trialing") {
    await logWebhook(gateway, normalized.eventId, normalized.type, body, "skipped");
    await markEventProcessed(gateway, normalized.eventId, normalized.type, body);
    return { received: true, status: "skipped" };
  }

  // Sync subscription BEFORE marking event as processed.
  // This ensures that if syncSubscription fails, the webhook can be retried
  // and the subscription update is not silently lost.
  await syncSubscription(normalized);

  const result = await markEventProcessed(gateway, normalized.eventId, normalized.type, body);

  if (result === "skipped") {
    await logWebhook(gateway, normalized.eventId, normalized.type, body, "skipped");
    return { received: true, status: "skipped" };
  }

  await logWebhook(gateway, normalized.eventId, normalized.type, body, "processed");
  return { received: true, status: "processed" };
}
