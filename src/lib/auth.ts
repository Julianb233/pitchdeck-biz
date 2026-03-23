import { createClient } from "@/lib/supabase/server";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  subscriptionStatus: "free" | "starter" | "pro" | "founder_suite";
  emailVerified: boolean;
  createdAt: Date;
  isGrandfathered?: boolean;
}

// ── Supabase Auth wrappers ─────────────────────────────────────────────────

export async function signUp(email: string, password: string, name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/callback?type=signup`,
    },
  });

  // Sync to public.users table (safety net — DB trigger handles this too)
  if (!error && data.user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("users") as any).upsert(
      { id: data.user.id, email, name },
      { onConflict: "id" }
    );
  }

  return { data, error };
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
}

export async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
}

// ── Session helpers (used by API routes and server components) ──────────────

function toSafeUser(user: { id: string; email?: string; email_confirmed_at?: string | null; confirmed_at?: string | null; user_metadata?: Record<string, unknown>; created_at?: string }): SafeUser {
  return {
    id: user.id,
    email: user.email ?? "",
    name: (user.user_metadata?.name as string) ?? "",
    subscriptionStatus: "free",
    emailVerified: !!(user.email_confirmed_at || user.confirmed_at),
    createdAt: user.created_at ? new Date(user.created_at) : new Date(),
  };
}

export async function getSessionFromCookies(): Promise<SafeUser | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  // Check subscription status and tier from DB
  // Columns tier, grandfathered_until added by migration 008 — not yet in generated types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subscription } = (await (supabase
    .from("subscriptions") as any)
    .select("status, tier, grandfathered_until")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()) as { data: { status: string; tier?: string; grandfathered_until?: string } | null };

  const safeUser = toSafeUser(user);
  if (subscription) {
    const tier = subscription.tier || "pro";
    if (tier === "starter" || tier === "pro" || tier === "founder_suite") {
      safeUser.subscriptionStatus = tier;
    } else {
      safeUser.subscriptionStatus = "pro";
    }
    if (subscription.grandfathered_until) {
      safeUser.isGrandfathered = new Date(subscription.grandfathered_until) > new Date();
    }
  }
  return safeUser;
}

export async function getSessionFromRequest(_req?: Request): Promise<SafeUser | null> {
  // With Supabase SSR, session is managed via cookies handled by the server client.
  // The request parameter is kept for API compatibility but not used directly.
  return getSessionFromCookies();
}
