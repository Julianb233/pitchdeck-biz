import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * GET /auth/callback
 *
 * Supabase Auth redirects here after email verification or password reset.
 * Exchanges the authorization code for a session, then redirects appropriately.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type") || "";
  const next = searchParams.get("next") || "/dashboard";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;

  if (!code) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Missing authorization code.")}`, appUrl),
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/login", appUrl));
  }

  // Determine if this is a password reset flow
  const isRecovery = type === "recovery" || next === "/reset-password";

  // Determine redirect target based on type
  let redirectTarget: URL;
  if (isRecovery) {
    redirectTarget = new URL("/reset-password", appUrl);
  } else if (type === "signup") {
    redirectTarget = new URL("/login?verified=true", appUrl);
  } else {
    redirectTarget = new URL(next, appUrl);
  }

  const response = NextResponse.redirect(redirectTarget);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] Code exchange failed:", error.message);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`, appUrl),
    );
  }

  return response;
}
