"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

// Wraps the app with NextAuth's SessionProvider for useSession() support.
// Also works alongside Supabase cookie-based auth.
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
