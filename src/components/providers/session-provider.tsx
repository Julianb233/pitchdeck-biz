"use client";

// Passthrough wrapper — auth handled by Supabase directly.
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
