import { randomBytes, createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Supabase-backed verification token store with in-memory fallback.
 */
const fallbackTokens = new Map<
  string,
  { userId: string; email: string; expiresAt: number }
>();

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generates a verification token for a user and returns the full verification URL.
 */
export function generateVerificationToken(userId: string, email: string): string {
  const rawToken = randomBytes(32).toString("hex");
  const secret = process.env.VERIFICATION_TOKEN_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dev-secret";
  const hmac = createHmac("sha256", secret).update(rawToken).digest("hex");
  const token = rawToken + "." + hmac.slice(0, 16);

  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

  const supabase = createAdminClient();
  if (supabase) {
    supabase
      .from("verification_tokens")
      .upsert(
        { token, user_id: userId, email, expires_at: expiresAt.toISOString() },
        { onConflict: "token" },
      )
      .then(({ error }) => {
        if (error) {
          console.warn("[verification] Supabase insert failed, using in-memory fallback:", error.message);
          fallbackTokens.set(token, { userId, email, expiresAt: expiresAt.getTime() });
        }
      });
  } else {
    fallbackTokens.set(token, { userId, email, expiresAt: expiresAt.getTime() });
  }

  cleanupExpiredTokens();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return appUrl + "/api/auth/verify-email?token=" + token + "&type=signup";
}

/**
 * Validates a verification token. Returns the associated user info if valid.
 * The token is consumed (deleted) on successful validation.
 */
export async function validateVerificationToken(
  token: string,
): Promise<{ userId: string; email: string } | null> {
  const supabase = createAdminClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("verification_tokens")
      .select("user_id, email, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (!error && data) {
      if (new Date(data.expires_at) < new Date()) {
        await supabase.from("verification_tokens").delete().eq("token", token);
        return null;
      }
      await supabase.from("verification_tokens").delete().eq("token", token);
      return { userId: data.user_id, email: data.email };
    }
  }

  const entry = fallbackTokens.get(token);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    fallbackTokens.delete(token);
    return null;
  }

  fallbackTokens.delete(token);
  return { userId: entry.userId, email: entry.email };
}

/**
 * Checks if a Supabase user has verified their email.
 */
export function isEmailVerified(user: {
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
}): boolean {
  return !!(user.email_confirmed_at || user.confirmed_at);
}

function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, entry] of fallbackTokens.entries()) {
    if (now > entry.expiresAt) {
      fallbackTokens.delete(token);
    }
  }
}
