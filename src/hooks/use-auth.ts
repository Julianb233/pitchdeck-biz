"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  subscriptionStatus: "free" | "starter" | "pro" | "founder_suite";
  emailVerified: boolean;
  createdAt: string;
  isGrandfathered?: boolean;
}

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user: supaUser } } = await supabase.auth.getUser();
      if (supaUser) {
        // Check subscription status and tier from DB
        // Columns tier, grandfathered_until added by migration 008 — not yet in generated types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: sub } = (await (supabase
          .from("subscriptions") as any)
          .select("status, tier, grandfathered_until")
          .eq("user_id", supaUser.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()) as { data: { status: string; tier?: string; grandfathered_until?: string } | null };

        let subscriptionStatus: AuthUser["subscriptionStatus"] = "free";
        let isGrandfathered = false;
        if (sub) {
          const tier = sub.tier;
          if (tier === "starter" || tier === "pro" || tier === "founder_suite") {
            subscriptionStatus = tier;
          } else {
            subscriptionStatus = "pro";
          }
          if (sub.grandfathered_until) {
            isGrandfathered = new Date(sub.grandfathered_until) > new Date();
          }
        }

        setUser({
          id: supaUser.id,
          email: supaUser.email ?? "",
          name: supaUser.user_metadata?.name ?? supaUser.email ?? "",
          subscriptionStatus,
          emailVerified: !!(supaUser.email_confirmed_at || supaUser.confirmed_at),
          createdAt: supaUser.created_at,
          isGrandfathered,
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    await refresh();
  }, [refresh]);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return { user, loading, login, signup, logout, refresh };
}
