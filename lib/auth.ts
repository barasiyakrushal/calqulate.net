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

  // isActive means the subscription row is in a usable state.
  // For free users this is always true (they can use the dashboard).
  // For pro users it requires status = 'active' | 'trialing'.
  const isActive =
    sub?.status === "active" ||
    sub?.status === "trialing" ||
    sub?.status === "free";

  return { userId: user.id, tier, isActive, isAdmin: false, email: user.email ?? null };
}

export function hasPaidAccess(state: AccessState): boolean {
  return state.isActive && state.tier === "pro";
}
