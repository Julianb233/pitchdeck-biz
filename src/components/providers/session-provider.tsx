"use client";

// Auth is handled by Supabase via cookies — no React context provider needed.
// This wrapper is kept for layout.tsx import compatibility.
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
