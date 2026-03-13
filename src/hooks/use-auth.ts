"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  subscriptionStatus: "free" | "pro";
  createdAt: string;
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
        // Check subscription status from DB
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", supaUser.id)
          .eq("status", "active")
          .limit(1)
          .maybeSingle();

        setUser({
          id: supaUser.id,
          email: supaUser.email ?? "",
          name: supaUser.user_metadata?.name ?? supaUser.email ?? "",
          subscriptionStatus: sub ? "pro" : "free",
          createdAt: supaUser.created_at,
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
