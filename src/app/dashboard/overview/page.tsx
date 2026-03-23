"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { MONTHLY_TOKEN_ALLOCATION } from "@/lib/tokens";
import { TokenUsage } from "@/components/dashboard/token-usage";
import {
  Presentation,
  FileText,
  FileCheck,
  Palette,
  Package,
  Briefcase,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

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

const DELIVERABLES_HUB = [
  {
    icon: Presentation,
    title: "Pitch Deck",
    description: "10-15 slide investor deck",
    href: "/create",
    gradient: "from-[#7c3aed] to-[#3b82f6]",
    accentColor: "#7c3aed",
  },
  {
    icon: FileText,
    title: "Sell Sheet",
    description: "1-2 page business overview",
    href: "/create/preview",
    gradient: "from-[#ec4899] to-[#f97316]",
    accentColor: "#ec4899",
  },
  {
    icon: FileCheck,
    title: "One-Pager",
    description: "Executive summary",
    href: "/create/preview",
    gradient: "from-[#06b6d4] to-[#10b981]",
    accentColor: "#06b6d4",
  },
  {
    icon: Palette,
    title: "Brand Kit",
    description: "Colors, fonts & guidelines",
    href: "/dashboard/assets",
    gradient: "from-[#f97316] to-[#7c3aed]",
    accentColor: "#f97316",
  },
  {
    icon: Package,
    title: "Promo Materials",
    description: "Social kit & ad creatives",
    href: "/dashboard/materials",
    gradient: "from-[#3b82f6] to-[#06b6d4]",
    accentColor: "#3b82f6",
  },
  {
    icon: Briefcase,
    title: "Business Docs",
    description: "Executive summary & more",
    href: "/dashboard/documents",
    gradient: "from-[#10b981] to-[#3b82f6]",
    accentColor: "#10b981",
  },
];

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
        <div className="text-muted-foreground">Loading...</div>
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
          <h1 className="text-2xl font-bold">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here&apos;s an overview of your pitch deck workspace
          </p>
        </div>
        <Link
          href="/create"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 hover:scale-[1.02]"
          style={{
            background: "var(--brand-gradient-cta)",
            boxShadow: "0 4px 16px rgba(124, 58, 237, 0.3)",
          }}
        >
          <Sparkles className="w-4 h-4" />
          Create New Deck
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(124, 58, 237, 0.1)" }}>
              <TrendingUp className="w-4 h-4" style={{ color: "#7c3aed" }} />
            </div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Plan</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${user.subscriptionStatus === "pro" ? "bg-emerald-500" : "bg-muted-foreground/30"}`} />
            <span className="text-lg font-semibold capitalize">{user.subscriptionStatus}</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(236, 72, 153, 0.1)" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#ec4899" }} />
            </div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Analyses</p>
          </div>
          <p className="text-lg font-semibold">
            {dataLoading ? "..." : analyses.length}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(6, 182, 212, 0.1)" }}>
              <Presentation className="w-4 h-4" style={{ color: "#06b6d4" }} />
            </div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Total Decks</p>
          </div>
          <p className="text-lg font-semibold">
            {dataLoading ? "..." : decks.length}
          </p>
        </div>
      </div>

      {/* Token Balance */}
      <TokenUsage tokensRemaining={tokenBalance} resetDate={tokenResetDate} />

      {/* Upgrade CTA */}
      {user.subscriptionStatus !== "pro" && (
        <div
          className="rounded-xl p-5 flex items-center justify-between border"
          style={{
            borderColor: "rgba(124, 58, 237, 0.2)",
            background: "linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(236, 72, 153, 0.06))",
          }}
        >
          <div>
            <p className="font-semibold">Upgrade to Pro</p>
            <p className="text-muted-foreground text-sm">Unlimited deck creation, branding materials & priority support</p>
          </div>
          <button
            onClick={() => handleCheckout("subscription")}
            disabled={checkoutLoading}
            className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-50 transition-all hover:opacity-90 shrink-0"
            style={{
              background: "var(--brand-gradient-cta)",
              boxShadow: "0 4px 16px rgba(124, 58, 237, 0.3)",
            }}
          >
            {checkoutLoading ? "Loading..." : "Upgrade Now"}
          </button>
        </div>
      )}

      {/* Deliverables Hub */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Deliverables Hub</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DELIVERABLES_HUB.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Decks */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Decks</h2>
        {dataLoading ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Loading decks...</p>
          </div>
        ) : decks.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Presentation className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No decks yet. Create your first pitch deck!</p>
            <Link
              href="/create"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium"
              style={{ color: "var(--brand-primary)" }}
            >
              Get started <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {decks.map((deck) => (
              <Link
                key={deck.id}
                href={`/create/preview?deck_id=${deck.id}`}
                className="block rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(6, 182, 212, 0.15))" }}
                    >
                      <Presentation className="w-5 h-5" style={{ color: "#7c3aed" }} />
                    </div>
                    <div>
                      <p className="font-medium">{deck.title}</p>
                      <p className="text-muted-foreground text-sm">{formatDate(deck.created_at)}</p>
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
          <h2 className="text-lg font-semibold">Recent Assets</h2>
          <Link
            href="/dashboard/assets/history"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
        {dataLoading ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Loading assets...</p>
          </div>
        ) : recentAssets.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Palette className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No assets yet.</p>
            <Link
              href="/dashboard/assets"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium"
              style={{ color: "var(--brand-primary)" }}
            >
              Generate your first asset <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {recentAssets.map((asset) => (
              <div
                key={asset.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                  {asset.image_data?.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.image_data}
                      alt={asset.prompt ?? ""}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Palette className="w-8 h-8 text-muted-foreground/30" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-muted-foreground line-clamp-1">{asset.prompt ?? asset.asset_type}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{formatDate(asset.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Analyses */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Analyses</h2>
        {dataLoading ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Loading analyses...</p>
          </div>
        ) : analyses.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No analyses yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <div
                key={analysis.id}
                className="rounded-xl border border-border bg-card p-4 flex items-center justify-between hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(124, 58, 237, 0.15))" }}
                  >
                    <Sparkles className="w-5 h-5" style={{ color: "#ec4899" }} />
                  </div>
                  <div>
                    <p className="font-medium">{analysis.business_name}</p>
                    <p className="text-muted-foreground text-sm">{formatDate(analysis.created_at)}</p>
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
