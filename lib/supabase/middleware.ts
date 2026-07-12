import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { applySecurityHeaders } from "@/lib/security/headers";
import { resolveIsAdmin } from "@/lib/admin-core";
import { getSupabaseSessionId } from "@/lib/supabase/session-id";

// Polyfill process.version for Edge Runtime if missing (used by @supabase/supabase-js).
// This prevents webpack build warnings and runtime errors in the middleware.
if (typeof process !== "undefined" && !process.version) {
  (process as any).version = "v22.0.0";
}

/** Refreshes the auth session cookie and applies security headers. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();
  const path = request.nextUrl.pathname;

  // Auth pages — redirect already-logged-in users to the dashboard
  const authPages = ["/login", "/signup", "/forgot-password", "/reset-password"];
  if (user && authPages.some((p) => path === p)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/glp1";
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  // Require sign-in for gated areas.
  if (!user && (path.startsWith("/dashboard") || path.startsWith("/admin"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  // Single-device login enforcement — only for authenticated dashboard/admin
  // pages (skip API routes and static assets).
  const sessionId = getSupabaseSessionId(session);
  if (user && sessionId && !path.startsWith("/api/") && !path.startsWith("/auth/")) {
    try {
      const { data: activeSession } = await supabase
        .from("user_sessions")
        .select("session_id")
        .eq("user_id", user.id)
        .is("revoked_at", null)
        .maybeSingle();

      if (activeSession && activeSession.session_id !== sessionId) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("reason", "logged_out_elsewhere");
        url.searchParams.set("next", path);
        return applySecurityHeaders(NextResponse.redirect(url));
      }
    } catch {
      // user_sessions table may not exist yet — skip enforcement silently
    }
  }

  // Admin area: members only.
  if (path.startsWith("/admin")) {
    const isAdmin = await resolveIsAdmin(supabase, user);
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return applySecurityHeaders(NextResponse.redirect(url));
    }
  }

  return applySecurityHeaders(response);
}
