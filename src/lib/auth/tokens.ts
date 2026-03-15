import { createAdminClient } from "@/lib/supabase/admin";
import { v4 as uuidv4 } from "uuid";

export type TokenType = "email_verification" | "password_reset";

const TOKEN_EXPIRY_HOURS: Record<TokenType, number> = {
  email_verification: 24,
  password_reset: 1,
};

/**
 * Generate a verification/reset token and store it in the database.
 * Returns the token string or null if the admin client is unavailable.
 */
export async function generateToken(
  userId: string,
  type: TokenType
): Promise<string | null> {
  const supabase = createAdminClient();
  if (!supabase) {
    console.warn("[auth/tokens] Admin client unavailable — cannot generate token");
    return null;
  }

  const token = uuidv4();
  const expiresAt = new Date(
    Date.now() + TOKEN_EXPIRY_HOURS[type] * 60 * 60 * 1000
  ).toISOString();

  const { error } = await supabase.from("verification_tokens").insert({
    user_id: userId,
    token,
    type,
    expires_at: expiresAt,
  });

  if (error) {
    console.error("[auth/tokens] Failed to insert token:", error.message);
    return null;
  }

  return token;
}

/**
 * Validate a token: check it exists, is the correct type, hasn't expired, and hasn't been used.
 * On success, marks the token as used and returns the associated user_id.
 */
export async function validateToken(
  token: string,
  type: TokenType
): Promise<{ userId: string } | { error: string }> {
  const supabase = createAdminClient();
  if (!supabase) {
    return { error: "Service unavailable" };
  }

  const { data, error } = await supabase
    .from("verification_tokens")
    .select("id, user_id, expires_at, used_at")
    .eq("token", token)
    .eq("type", type)
    .maybeSingle();

  if (error || !data) {
    return { error: "Invalid or expired token" };
  }

  if (data.used_at) {
    return { error: "Token has already been used" };
  }

  if (new Date(data.expires_at) < new Date()) {
    return { error: "Token has expired" };
  }

  // Mark as used
  await supabase
    .from("verification_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", data.id);

  return { userId: data.user_id };
}
