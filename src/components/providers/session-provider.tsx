"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

// Wraps the app with NextAuth SessionProvider for useSession() support.
// Works alongside Supabase cookie-based auth for route protection.
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
