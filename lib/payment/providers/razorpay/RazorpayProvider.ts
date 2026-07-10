import Razorpay from "razorpay";
import crypto from "crypto";
import type {
  PaymentProvider,
  CreateCheckoutInput,
  CheckoutResult,
  BillingPortalInput,
  ProviderSubscription,
} from "../../PaymentProvider";
import type { Gateway, Tier, Cadence, Currency } from "../../types/index";
import type { NormalizedEvent, NormalizedEventType } from "../../types/events";
import { razorpayPlanIdFor } from "../../types/index";
import { ProviderNotConfiguredError, InvalidWebhookError, SubscriptionActionError, BillingPortalError } from "../../utils/errors";
import type {
  RazorpayCustomer,
  RazorpayPlan,
  RazorpaySubscription,
  RazorpayWebhookPayload,
  RazorpayEventType,
} from "./types";

function getClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new ProviderNotConfiguredError("Razorpay");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function normalizeStatus(status: string): string {
  switch (status) {
    case "active":
    case "authenticated":
      return "active";
    case "created":
    case "pending":
      return "trialing";
    case "halted":
    case "completed":
      return "canceled";
    case "cancelled":
      return "canceled";
    default:
      return "inactive";
  }
}

function normalizeEventType(razorpayEvent: RazorpayEventType): NormalizedEventType {
  switch (razorpayEvent) {
    case "subscription.charged":
      return "subscription.updated";
    case "subscription.cancelled":
      return "subscription.cancelled";
    case "subscription.updated":
      return "subscription.updated";
    case "subscription.pending":
      return "subscription.created";
    case "subscription.halted":
      return "subscription.cancelled";
    case "payment.failed":
      return "payment.failed";
    case "payment.captured":
      return "payment.succeeded";
    default:
      return "subscription.updated";
  }
}

function inferTier(planId: string): Tier {
  const proPlans = [
    process.env.RAZORPAY_PLAN_PRO_MONTHLY,
    process.env.RAZORPAY_PLAN_PRO_YEARLY,
  ].filter(Boolean);
  if (proPlans.includes(planId)) return "pro";
  return "free";
}

function inferCurrency(_planId: string): Currency {
  return "USD";
}

export class RazorpayProvider implements PaymentProvider {
  readonly name: Gateway = "razorpay";

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
    const client = getClient();
    const planId = razorpayPlanIdFor(input.tier, input.cadence);
    if (!planId) throw new Error(`No plan configured for ${input.tier} ${input.cadence} ${input.currency}`);

    // Get or create customer
    const customerId = await this.getOrCreateCustomer(input.userId, input.userEmail ?? "");

    // Get the plan to know the amount
    const plan = await client.plans.fetch(planId) as unknown as RazorpayPlan;
    const totalCount = input.cadence === "yearly" ? 12 : 0; // 0 = infinite for monthly

    // Create subscription — no trial: the first cycle is charged immediately on
    // authentication, matching the PayPal path (immediate payment).
    // `customer_id` binds the subscription to a Razorpay customer. The SDK
    // request type omits it, so annotate the body to include it explicitly.
    const subBody: Parameters<typeof client.subscriptions.create>[0] & { customer_id?: string } = {
      plan_id: planId,
      customer_id: customerId,
      total_count: totalCount,
      customer_notify: 0,
      notes: {
        supabase_user_id: input.userId,
        tier: input.tier,
        cadence: input.cadence,
        currency: input.currency,
        country: input.country ?? "",
      },
    };
    const sub = await client.subscriptions.create(subBody) as any;

    const subscription = sub as RazorpaySubscription;
    const siteUrl = input.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://calqulate.net";
    const keyId = process.env.RAZORPAY_KEY_ID;
    const checkoutUrl = `${siteUrl}/checkout/razorpay?subscription_id=${subscription.id}&key=${keyId}`;

    return {
      url: checkoutUrl,
      sessionId: subscription.id,
    };
  }

  async createBillingPortal(input: BillingPortalInput): Promise<string> {
    // Razorpay doesn't have a hosted billing portal.
    // We point users to a page where they can contact support or manage via Razorpay dashboard.
    throw new BillingPortalError(
      "Razorpay does not provide a hosted billing portal. Contact support for subscription changes.",
    );
  }

  async verifyWebhook(body: string, signature: string): Promise<NormalizedEvent> {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) throw new ProviderNotConfiguredError("Razorpay webhook");

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const sigBuf = Buffer.from(expectedSignature, "hex");
    const recvBuf = Buffer.from(signature, "hex");
    if (sigBuf.length !== recvBuf.length || !crypto.timingSafeEqual(sigBuf, recvBuf)) {
      throw new InvalidWebhookError("Signature mismatch");
    }

    const payload = JSON.parse(body) as RazorpayWebhookPayload;
    const sub = payload.payload.subscription?.entity;
    if (!sub) throw new InvalidWebhookError("No subscription entity in payload");

    const notes = (sub as { notes?: Record<string, string> }).notes ?? {};

    const currency = "USD";

    return {
      eventId: `${payload.event}_${sub.id}_${payload.created_at}`,
      type: normalizeEventType(payload.event as RazorpayEventType),
      gateway: "razorpay",
      customerId: sub.customer_id,
      subscriptionId: sub.id,
      userId: notes.supabase_user_id,
      tier: inferTier(sub.plan_id),
      status: normalizeStatus(sub.status) as "active" | "inactive" | "trialing" | "canceled" | "past_due",
      currentPeriodEnd: sub.current_end
        ? new Date(sub.current_end * 1000).toISOString()
        : sub.charge_at
          ? new Date(sub.charge_at * 1000).toISOString()
          : null,
      currency: currency as Currency,
      country: notes.country || undefined,
      raw: payload,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const client = getClient();
    try {
      await client.subscriptions.cancel(subscriptionId);
    } catch (err: unknown) {
      const msg =
        (err as { error?: { description?: string } })?.error?.description ??
        (err as { message?: string })?.message ??
        (err as { description?: string })?.description ??
        JSON.stringify(err);
      throw new SubscriptionActionError("cancel Razorpay subscription", msg);
    }
  }

  async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    const client = getClient();
    try {
      const customer = await client.customers.create({
        email,
        contact: "",
        notes: { supabase_user_id: userId },
      }) as unknown as RazorpayCustomer;
      return customer.id;
    } catch (err: unknown) {
      const desc =
        (err as { error?: { description?: string } })?.error?.description ??
        (err as { message?: string })?.message ??
        (err as { description?: string })?.description ??
        "";
      // If customer already exists, search by email and return existing
      if (/already exists/i.test(desc)) {
        // Look up the existing customer by email. The SDK pagination type omits
        // the `email` filter, so annotate the options to include it.
        const listOpts: Parameters<typeof client.customers.all>[0] & { email?: string } = { email };
        const existing = await client.customers.all(listOpts) as unknown as { items: RazorpayCustomer[] };
        const found = existing?.items?.[0];
        if (found?.id) return found.id;
      }
      throw new SubscriptionActionError("create Razorpay customer", desc);
    }
  }

  async getSubscription(subscriptionId: string): Promise<ProviderSubscription> {
    const client = getClient();
    try {
      const sub = await client.subscriptions.fetch(subscriptionId) as unknown as RazorpaySubscription;
      return {
        status: normalizeStatus(sub.status),
        currentPeriodEnd: sub.current_end ? new Date(sub.current_end * 1000) : new Date(),
        tier: inferTier(sub.plan_id),
      };
    } catch (err: unknown) {
      const msg =
        (err as { error?: { description?: string } })?.error?.description ??
        (err as { message?: string })?.message ??
        (err as { description?: string })?.description ??
        JSON.stringify(err);
      throw new SubscriptionActionError("fetch Razorpay subscription", msg);
    }
  }
}
