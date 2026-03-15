import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /auth/verify
 *
 * Handles the email confirmation redirect from Supabase Auth.
 * Supabase appends ?token_hash=...&type=... to the redirect URL.
 * We exchange the token for a session, then redirect to the dashboard.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'signup' | 'email' | 'recovery' | 'invite' | null;
  const next = searchParams.get('next') ?? '/dashboard';

  if (!tokenHash || !type) {
    // Missing parameters — redirect to login with error
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'invalid_verification_link');
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    console.error('[auth/verify] OTP verification failed:', error.message);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'verification_failed');
    return NextResponse.redirect(loginUrl);
  }

  // Verification successful — redirect to dashboard
  const redirectUrl = new URL(next, request.url);
  return NextResponse.redirect(redirectUrl);
}
