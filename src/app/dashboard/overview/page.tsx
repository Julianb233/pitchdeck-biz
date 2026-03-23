"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { MONTHLY_TOKEN_ALLOCATION } from "@/lib/tokens";
import { TokenUsage } from "@/components/dashboard/token-usage";

interface DeckRow {
  id: string;
  title: string;
  status: string;
  created_at: string;
  analysis_id: string | null;
}

interface AnalysisRow {
  id: string;
  business_name: string;
  created_at: string;
}

interface AssetRow {
  id: string;
  asset_type: string;
  template_name: string | null;
  prompt: string | null;
  image_data: string | null;
  tokens_used: number;
  created_at: string;
}

export default function DashboardOverviewPage() {
  const { user, loading } = useAuth();
  const [decks, setDecks] = useState<DeckRow[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [recentAssets, setRecentAssets] = useState<AssetRow[]>([]);
  const [tokenBalance, setTokenBalance] = useState(MONTHLY_TOKEN_ALLOCATION);
  const [tokenResetDate, setTokenResetDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setDataLoading(true);
      try {
        const [decksRes, analysesRes, assetsRes, tokensRes] = await Promise.all([
          fetch("/api/decks"),
          fetch("/api/analyses"),
          fetch(`/api/generate-asset?userId=${user!.id}&limit=5`),
          fetch(`/api/tokens?userId=${user!.id}`),
        ]);

        if (decksRes.ok) {
          const decksData = await decksRes.json();
          setDecks(decksData.decks ?? []);
        }

        if (analysesRes.ok) {
          const analysesData = await analysesRes.json();
          setAnalyses(analysesData.analyses ?? []);
        }

        if (assetsRes.ok) {
          const assetsData = await assetsRes.json();
          setRecentAssets(assetsData.assets ?? []);
        }

        if (tokensRes.ok) {
          const tokensData = await tokensRes.json();
          if (typeof tokensData.token_balance === "number") {
            setTokenBalance(tokensData.token_balance);
          }
          if (tokensData.current_period_end) {
            setTokenResetDate(tokensData.current_period_end);
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setDataLoading(false);
      }
    }

    fetchData();
  }, [user]);

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

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

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
          href="/create"
          className="px-5 py-2.5 rounded-lg font-semibold text-white text-sm transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
          }}
        >
          Create New Deck
        </Link>
      </div>

      {/* Token Balance */}
      <TokenUsage tokensRemaining={tokenBalance} resetDate={tokenResetDate} />

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Plan</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${user.subscriptionStatus !== "free" ? "bg-emerald-500" : "bg-zinc-600"}`} />
            <span className="text-lg font-semibold text-white capitalize">{user.subscriptionStatus === "founder_suite" ? "Founder Suite" : user.subscriptionStatus}</span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Analyses</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {dataLoading ? "..." : analyses.length}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">Total Decks</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {dataLoading ? "..." : decks.length}
          </p>
        </div>
      </div>

      {/* Upgrade CTA */}
      {user.subscriptionStatus === "free" && (
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
      )}

      {/* Decks list */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your Decks</h2>
        {dataLoading ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-zinc-400">Loading decks...</p>
          </div>
        ) : decks.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-zinc-400">No decks yet. Create your first pitch deck!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {decks.map((deck) => (
              <Link
                key={deck.id}
                href={`/create/preview?deck_id=${deck.id}`}
                className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between">
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
                      <p className="text-white font-medium">{deck.title}</p>
                      <p className="text-zinc-500 text-sm">{formatDate(deck.created_at)}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      deck.status === "generated"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {deck.status === "generated" ? "Ready" : deck.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Assets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Assets</h2>
          <Link
            href="/dashboard/assets/history"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            View all
          </Link>
        </div>
        {dataLoading ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-zinc-400">Loading assets...</p>
          </div>
        ) : recentAssets.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-zinc-400">No assets yet.</p>
            <Link href="/dashboard/assets" className="text-sm text-violet-400 hover:underline mt-2 inline-block">
              Generate your first asset
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {recentAssets.map((asset) => (
              <div
                key={asset.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden"
              >
                <div className="aspect-video bg-zinc-900 flex items-center justify-center overflow-hidden">
                  {asset.image_data?.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.image_data}
                      alt={asset.prompt ?? ""}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6.75 6.75h.008v.008H6.75V6.75z" />
                    </svg>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-zinc-400 line-clamp-1">{asset.prompt ?? asset.asset_type}</p>
                  <p className="text-xs text-zinc-600 mt-1">{formatDate(asset.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analyses list */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Analyses</h2>
        {dataLoading ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-zinc-400">Loading analyses...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <p className="text-zinc-400">No analyses yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-violet-500/20 flex items-center justify-center text-pink-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">{analysis.business_name}</p>
                    <p className="text-zinc-500 text-sm">{formatDate(analysis.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
