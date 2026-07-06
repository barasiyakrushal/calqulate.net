import { createClient } from "@/lib/supabase/server";
import type { Tier } from "@/lib/payment/types/index";
import { resolveIsAdmin } from "@/lib/admin-core";

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export interface AccessState {
  userId: string | null;
  tier: Tier;
  isActive: boolean;
  isAdmin: boolean;
  email: string | null;
}

/** Resolve the current user's subscription tier for paywall checks. */
export async function getAccess(): Promise<AccessState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { userId: null, tier: "free", isActive: false, isAdmin: false, email: null };

  // Developer/admin mode: full access to every paid feature without paying.
  if (await resolveIsAdmin(supabase, user)) {
    return { userId: user.id, tier: "pro", isActive: true, isAdmin: true, email: user.email ?? null };
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier,status")
    .eq("user_id", user.id)
    .maybeSingle();

  const tier = (sub?.tier as Tier) ?? "free";

  // A user has "paid access" when their subscription is active/trialing AND
  // the tier is "pro". Free-tier users get status='free' (not 'active') to
  // avoid misleading look-alikes with real paid subscriptions.
  const isActive =
    sub?.status === "active" ||
    sub?.status === "trialing" ||
    (tier === "free" && sub?.status === "free");

  return { userId: user.id, tier, isActive, isAdmin: false, email: user.email ?? null };
}

export function hasPaidAccess(state: AccessState): boolean {
  return state.isActive && state.tier === "pro";
}
