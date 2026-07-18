import "server-only";
import webpush from "web-push";

/**
 * Web Push (VAPID) sender. Generate keys once with:
 *   npx web-push generate-vapid-keys
 * then set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.
 */
let configured = false;
export function pushConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function ensure(): boolean {
  if (!pushConfigured()) return false;
  if (!configured) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:meet.akabari@calqulate.net",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
    configured = true;
  }
  return true;
}

export interface PushPayload {
  title?: string;
  body: string;
  url?: string;
  tag?: string;
}

export interface StoredSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** Send one push; returns true on success. Marks 404/410 as gone for cleanup. */
export async function sendPush(sub: StoredSubscription, payload: PushPayload): Promise<{ ok: boolean; gone?: boolean }> {
  if (!ensure()) return { ok: false };
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: sub.keys } as any,
      JSON.stringify({ title: "Calqulate.net", ...payload }),
    );
    return { ok: true };
  } catch (err: any) {
    const code = err?.statusCode;
    return { ok: false, gone: code === 404 || code === 410 };
  }
}
