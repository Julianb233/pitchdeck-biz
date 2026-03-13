import { createClient } from "@/lib/supabase/server";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  subscriptionStatus: "free" | "pro";
  createdAt: Date;
}

// ── Supabase Auth wrappers ─────────────────────────────────────────────────

export async function signUp(email: string, password: string, name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });
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

function toSafeUser(user: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string }): SafeUser {
  return {
    id: user.id,
    email: user.email ?? "",
    name: (user.user_metadata?.name as string) ?? "",
    subscriptionStatus: "free",
    createdAt: user.created_at ? new Date(user.created_at) : new Date(),
  };
}

export async function getSessionFromCookies(): Promise<SafeUser | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return toSafeUser(user);
}

export async function getSessionFromRequest(_request: Request): Promise<SafeUser | null> {
  // With Supabase SSR, session is managed via cookies handled by the server client.
  // The request parameter is kept for API compatibility but not used directly.
  return getSessionFromCookies();
}
