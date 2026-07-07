import crypto from "crypto";
import {
  PaymentProvider,
  CreateCheckoutInput,
  CheckoutResult,
  BillingPortalInput,
  ProviderSubscription,
} from "../../PaymentProvider";
import { Gateway, Tier, Cadence, type Currency } from "../../types/index";
import { NormalizedEvent, NormalizedEventType } from "../../types/events";
import { paypalPlanIdFor } from "../../types/index";
import {
  ProviderNotConfiguredError,
  InvalidWebhookError,
  SubscriptionActionError,
} from "../../utils/errors";
import {
  PayPalAccessToken,
  PayPalWebhookEvent,
  PayPalSubscriptionDetails,
  PAYPAL_STATUS_MAP,
} from "./types";

const BASE_URL = "https://api-m.paypal.com";
const SANDBOX_URL = "https://api-m.sandbox.paypal.com";

function getConfig(): { clientId: string; clientSecret: string; baseUrl: string } {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new ProviderNotConfiguredError("PayPal");
  const isSandbox = process.env.PAYPAL_SANDBOX === "true";
  return { clientId, clientSecret, baseUrl: isSandbox ? SANDBOX_URL : BASE_URL };
}

async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret, baseUrl } = getConfig();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as PayPalAccessToken;
  return data.access_token;
}

async function paypalFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const { baseUrl } = getConfig();
  const token = await getAccessToken();
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

function normalizeStatus(paypalStatus: string): string {
  return (PAYPAL_STATUS_MAP as Record<string, string>)[paypalStatus] ?? "inactive";
}

function normalizeEventType(eventType: string): NormalizedEventType {
  switch (eventType) {
    case "BILLING.SUBSCRIPTION.CREATED":
      return "subscription.created";
    case "BILLING.SUBSCRIPTION.ACTIVATED":
      return "subscription.activated";
    case "BILLING.SUBSCRIPTION.UPDATED":
      return "subscription.updated";
    case "BILLING.SUBSCRIPTION.CANCELLED":
      return "subscription.cancelled";
    case "BILLING.SUBSCRIPTION.SUSPENDED":
      return "subscription.updated";
    case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
      return "payment.failed";
    case "PAYMENT.SALE.COMPLETED":
      return "payment.succeeded";
    default:
      return "subscription.updated";
  }
}

function inferTier(planId: string): Tier {
  if (planId === process.env.PAYPAL_PLAN_PRO_MONTHLY || planId === process.env.PAYPAL_PLAN_PRO_YEARLY) return "pro";
  return "free";
}

export class PayPalProvider implements PaymentProvider {
  readonly name: Gateway = "paypal";

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
    const planId = paypalPlanIdFor(input.tier, input.cadence);
    if (!planId) throw new Error(`No plan configured for ${input.tier} ${input.cadence} ${input.currency}`);

    const siteUrl = input.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://calqulate.net";

    // Create subscription via PayPal REST API
    const res = await paypalFetch("/v1/billing/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        plan_id: planId,
        start_time: new Date(Date.now() + 60000).toISOString(),
        subscriber: {
          email_address: input.userEmail,
        },
        custom_id: input.userId,
        application_context: {
          brand_name: "Calqulate",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
          },
          return_url: `${siteUrl}/calqulate-vitals/welcome`,
          cancel_url: `${siteUrl}/pricing?checkout=cancelled`,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`PayPal subscription creation failed: ${res.status} ${err}`);
    }

    const data = (await res.json()) as {
      id: string;
      links: Array<{ rel: string; href: string }>;
    };

    // Find the approval URL
    const approveLink = data.links?.find((l) => l.rel === "approve");
    const url = approveLink?.href ?? `${siteUrl}/dashboard`;

    return { url, sessionId: data.id };
  }

  async createBillingPortal(input: BillingPortalInput): Promise<string> {
    // PayPal doesn't have a standardized hosted portal.
    // Users can manage subscriptions in their PayPal account directly.
    // We return the PayPal subscription management URL.
    return `https://www.paypal.com/myaccount/autopay/`;
  }

  async verifyWebhook(body: string, signature: string): Promise<NormalizedEvent> {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) throw new ProviderNotConfiguredError("PayPal webhook");

    // Verify webhook signature via PayPal's API
    let headers: Record<string, string>;
    try {
      headers = JSON.parse(signature) as Record<string, string>;
    } catch {
      throw new InvalidWebhookError("Invalid PayPal webhook signature JSON");
    }

    const verificationRes = await paypalFetch("/v1/notifications/verify-webhook-signature", {
      method: "POST",
      body: JSON.stringify({
        auth_algo: headers["PAYPAL-AUTH-ALGO"],
        cert_url: headers["PAYPAL-CERT-URL"],
        transmission_id: headers["PAYPAL-TRANSMISSION-ID"],
        transmission_sig: headers["PAYPAL-TRANSMISSION-SIG"],
        transmission_time: headers["PAYPAL-TRANSMISSION-TIME"],
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    });

    if (!verificationRes.ok) {
      throw new InvalidWebhookError("PayPal signature verification request failed");
    }

    const verificationData = (await verificationRes.json()) as { verification_status: string };
    if (verificationData.verification_status !== "SUCCESS") {
      throw new InvalidWebhookError(
        `PayPal signature verification failed: ${verificationData.verification_status}`,
      );
    }

    const payload = JSON.parse(body) as PayPalWebhookEvent;
    const resource = payload.resource;

    if (!resource?.id) {
      throw new InvalidWebhookError("PayPal webhook missing resource.id");
    }

    // Fetch full subscription details to get status
    let status = "inactive";
    const subscriptionId = resource.id;
    let planId = resource.plan_id ?? "";
    let currentPeriodEnd: string | null = null;

    try {
      const subRes = await paypalFetch(`/v1/billing/subscriptions/${subscriptionId}`);
      if (subRes.ok) {
        const subData = (await subRes.json()) as PayPalSubscriptionDetails;
        status = normalizeStatus(subData.status);
        planId = subData.plan_id ?? planId;
        currentPeriodEnd = subData.billing_info?.next_billing_time ?? null;
      }
    } catch {
      status = normalizeStatus(resource.status ?? "");
    }

    return {
      eventId: payload.id,
      type: normalizeEventType(payload.event_type),
      gateway: "paypal",
      customerId: resource.subscriber?.payer_id ?? "",
      subscriptionId,
      userId: resource.custom_id,
      tier: inferTier(planId),
      status: status as "active" | "inactive" | "trialing" | "canceled" | "past_due",
      currentPeriodEnd,
      currency: "USD" as Currency,
      raw: payload,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const res = await paypalFetch(`/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason: "Cancelled by user" }),
    });

    if (!res.ok && res.status !== 204) {
      const err = await res.text();
      throw new SubscriptionActionError("cancel PayPal subscription", `${res.status} ${err}`);
    }
  }

  async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    // PayPal doesn't require creating a customer beforehand.
    // The customer is created automatically when the subscription is set up.
    return userId;
  }

  async getSubscription(subscriptionId: string): Promise<ProviderSubscription> {
    const res = await paypalFetch(`/v1/billing/subscriptions/${subscriptionId}`);
    if (!res.ok) {
      throw new SubscriptionActionError(
        "fetch PayPal subscription",
        `${res.status} ${await res.text()}`,
      );
    }
    const data = (await res.json()) as PayPalSubscriptionDetails;
    return {
      status: normalizeStatus(data.status),
      currentPeriodEnd: data.billing_info?.next_billing_time
        ? new Date(data.billing_info.next_billing_time)
        : null,
      tier: inferTier(data.plan_id),
    };
  }
}
