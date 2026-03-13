import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Creates a Supabase client with the service role key.
 * This bypasses RLS and should only be used in server-side contexts
 * like webhook handlers where there is no user session.
 *
 * Returns null if env vars are not configured (allows in-memory fallback).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !url ||
    !serviceRoleKey ||
    url === 'https://your-project.supabase.co' ||
    serviceRoleKey === 'your-service-role-key'
  ) {
    return null;
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
