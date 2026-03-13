"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";

interface Deck {
  id: string;
  name: string;
  createdAt: string;
  status: "paid" | "pending";
}

export default function DashboardOverviewPage() {
  const { user, loading } = useAuth();
  const [decks] = useState<Deck[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleCheckout = useCallback(async (type: "deck" | "subscription", deckId?: string) => {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, deckId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setCheckoutLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome, {user.name}</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {user.email}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
          }}
        >
          Create New Deck
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Plan</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-zinc-600" />
            <span className="text-lg font-semibold text-white">Free</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Subscription</p>
          <p className="mt-2 text-lg font-semibold text-white">None</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Total Decks</p>
          <p className="mt-2 text-lg font-semibold text-white">{decks.length}</p>
        </div>
      </div>

      {/* Upgrade CTA */}
      <div className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-white font-medium">Upgrade to Pro</p>
          <p className="text-zinc-400 text-sm">Subscribe for $49/mo for unlimited deck creation</p>
        </div>
        <button
          onClick={() => handleCheckout("subscription")}
          disabled={checkoutLoading}
          className="px-4 py-2 rounded-lg font-semibold text-white text-sm disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
          }}
        >
          {checkoutLoading ? "Loading..." : "Subscribe Now"}
        </button>
      </div>

      {/* Decks list */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your Decks</h2>
        {decks.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-zinc-400">No decks yet. Create your first pitch deck!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center text-violet-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">{deck.name}</p>
                    <p className="text-zinc-500 text-sm">{deck.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      deck.status === "paid"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {deck.status === "paid" ? "Ready" : "Pending"}
                  </span>
                  <button className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
