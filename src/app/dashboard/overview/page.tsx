"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Deck {
  id: string;
  name: string;
  createdAt: string;
  status: "paid" | "pending";
}

interface UserData {
  subscriptionStatus: "active" | "inactive";
  tokensRemaining: number;
  decks: Deck[];
}

// Mock data for demo — in production, fetch from API
const MOCK_USER_DATA: UserData = {
  subscriptionStatus: "active",
  tokensRemaining: 487,
  decks: [
    { id: "deck_1", name: "TechVenture Series A", createdAt: "2026-03-10", status: "paid" },
    { id: "deck_2", name: "GreenEnergy Seed Round", createdAt: "2026-03-08", status: "paid" },
    { id: "deck_3", name: "HealthAI Pre-Seed", createdAt: "2026-03-05", status: "paid" },
  ],
};

export default function DashboardOverviewPage() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    setUserData(MOCK_USER_DATA);
  }, []);

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage your pitch decks and subscription
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
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Subscription</p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                userData.subscriptionStatus === "active" ? "bg-emerald-500" : "bg-zinc-600"
              }`}
            />
            <span className="text-lg font-semibold text-white capitalize">
              {userData.subscriptionStatus}
            </span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Tokens Remaining</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {userData.subscriptionStatus === "active" ? userData.tokensRemaining : "--"}
            {userData.subscriptionStatus === "active" && (
              <span className="text-zinc-500 text-sm font-normal"> / 500</span>
            )}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Total Decks</p>
          <p className="mt-2 text-lg font-semibold text-white">{userData.decks.length}</p>
        </div>
      </div>

      {/* Manage subscription */}
      {userData.subscriptionStatus === "active" ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Monthly Subscription</p>
            <p className="text-zinc-400 text-sm">$49/mo &middot; 500 tokens &middot; Renews monthly</p>
          </div>
          <button
            onClick={() => {
              // In production: call /api/portal to get Stripe portal URL
              alert("Stripe Customer Portal would open here.");
            }}
            className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Manage Subscription
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-white font-medium">No active subscription</p>
            <p className="text-zinc-400 text-sm">Subscribe for $49/mo and get 500 tokens per month</p>
          </div>
          <Link
            href="/#pricing"
            className="px-4 py-2 rounded-lg font-semibold text-white text-sm"
            style={{
              background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
            }}
          >
            Subscribe Now
          </Link>
        </div>
      )}

      {/* Decks list */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your Decks</h2>
        {userData.decks.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-zinc-400">No decks yet. Create your first pitch deck!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userData.decks.map((deck) => (
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
