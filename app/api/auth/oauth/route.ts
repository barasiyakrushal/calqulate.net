import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PROVIDERS = ["google", "azure", "apple"] as const;
type Provider = (typeof PROVIDERS)[number];

/** Apple returns very little by default; these are the scopes it accepts. */
const SCOPES: Record<Provider, string> = {
  google: "email profile",
  azure: "email openid profile",
  apple: "email name",
};

/**
 * Starts an OAuth flow (Google, Azure/Outlook or Apple) and returns the provider
 * URL. Provider apps are configured in the Supabase dashboard (Authentication ->
 * Providers). Bots are mitigated by the identity provider itself.
 */
export async function POST(req: Request) {
  const { provider, next } = (await req.json()) as {
    provider: Provider;
    next?: string;
  };
  if (!PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  }

  const supabase = await createClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://calqulate.net"}/auth/callback?next=${encodeURIComponent(next ?? "/dashboard")}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      scopes: SCOPES[provider],
    },
  });

  if (error || !data.url) {
    return NextResponse.json({ error: error?.message ?? "OAuth init failed" }, { status: 400 });
  }
  return NextResponse.json({ url: data.url });
}
