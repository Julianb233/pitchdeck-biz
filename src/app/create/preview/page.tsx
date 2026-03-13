"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DeckPreview } from "@/components/deck/deck-preview";
import { SellSheetPreview } from "@/components/deck/sell-sheet-preview";
import { OnePagerPreview } from "@/components/deck/one-pager-preview";
import { BrandKitPreview } from "@/components/deck/brand-kit-preview";
import type { DeckContent } from "@/lib/types";
import {
  ArrowLeft,
  Download,
  Presentation,
  FileText,
  File,
  Palette,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ── Demo content for when no generation has happened ───────────────────────

const DEMO_DECK: DeckContent = {
  slides: [
    {
      slideNumber: 1,
      type: "title",
      title: "Acme AI",
      subtitle: "Transforming business intelligence with AI-powered analytics",
      notes: "Open with confidence. Smile and make eye contact.",
      imagePrompt: "Modern AI company logo, clean vector design",
    },
    {
      slideNumber: 2,
      type: "problem",
      title: "The Data Problem",
      subtitle: "Businesses drown in data but starve for insights",
      bulletPoints: [
        "87% of analytics projects fail to deliver actionable insights",
        "Average analyst spends 80% of time cleaning data, not analyzing it",
        "Decision-makers wait days for reports that are already outdated",
      ],
      notes: "Pause after the statistics. Let the audience absorb the pain.",
    },
    {
      slideNumber: 3,
      type: "solution",
      title: "AI-Powered Clarity",
      subtitle: "From raw data to board-ready insights in minutes",
      bulletPoints: [
        "Natural language queries replace complex SQL",
        "Automated anomaly detection catches what humans miss",
        "Real-time dashboards update as data flows in",
      ],
      notes: "This is the aha moment. Show the product demo.",
    },
    {
      slideNumber: 4,
      type: "market",
      title: "$50B Market Opportunity",
      subtitle: "Business intelligence is ripe for disruption",
      bulletPoints: [
        "TAM: $50B global BI market growing 12% YoY",
        "SAM: $8B mid-market segment underserved by legacy tools",
        "SOM: $800M achievable within 5 years",
      ],
      notes: "Use bottom-up analysis. Show growth trajectory.",
    },
    {
      slideNumber: 5,
      type: "product",
      title: "Product Overview",
      subtitle: "Three modules, one platform",
      bulletPoints: [
        "Data Lake: Unified data ingestion and storage",
        "AI Engine: Machine learning models that improve over time",
        "Dashboard Builder: Drag-and-drop visualization tools",
        "API-first: Integrates with any existing stack",
      ],
    },
    {
      slideNumber: 6,
      type: "business-model",
      title: "SaaS Revenue Model",
      subtitle: "Land and expand with usage-based pricing",
      bulletPoints: [
        "Starter: $499/mo for teams up to 10",
        "Growth: $1,499/mo for departments up to 50",
        "Enterprise: Custom pricing with dedicated support",
        "Average contract value growing 40% YoY",
      ],
    },
    {
      slideNumber: 7,
      type: "traction",
      title: "Rapid Growth",
      subtitle: "From zero to $2M ARR in 18 months",
      bulletPoints: [
        "ARR: $2M (3x growth from last year)",
        "Customers: 150+ mid-market companies",
        "NPS: 72 (best in category)",
        "Churn: <5% monthly revenue churn",
      ],
    },
    {
      slideNumber: 8,
      type: "team",
      title: "World-Class Team",
      subtitle: "Ex-Google, Ex-Stripe, Ex-Palantir leadership",
      bulletPoints: [
        "Jane Smith - CEO (Ex-Google, 15yr data science)",
        "John Doe - CTO (Ex-Stripe, built payments infra)",
        "Sarah Chen - VP Sales (Ex-Palantir, $50M quota carrier)",
      ],
    },
    {
      slideNumber: 9,
      type: "financials",
      title: "Path to $20M ARR",
      subtitle: "Profitable unit economics from day one",
      bulletPoints: [
        "Current: $2M ARR, 75% gross margins",
        "2025: $8M ARR target with 60% Y/Y growth",
        "2026: $20M ARR with path to profitability",
        "LTV:CAC ratio of 5:1 and improving",
      ],
    },
    {
      slideNumber: 10,
      type: "ask",
      title: "Raising $10M Series A",
      subtitle: "Fuel growth to category leadership",
      bulletPoints: [
        "40% Engineering - AI model improvement and scale",
        "30% Sales & Marketing - Expand GTM team",
        "20% Customer Success - Reduce churn, increase NRR",
        "10% Operations - Infrastructure and compliance",
      ],
    },
    {
      slideNumber: 11,
      type: "why-now",
      title: "The Timing Is Perfect",
      subtitle: "Three converging trends create a once-in-a-decade opportunity",
      bulletPoints: [
        "LLMs make natural language data queries possible for the first time",
        "Cloud data warehouses have made data accessible and affordable",
        "Remote work increased demand for self-serve analytics 3x",
      ],
    },
    {
      slideNumber: 12,
      type: "closing",
      title: "Let's Build the Future of Intelligence",
      subtitle: "acme-ai.com | invest@acme-ai.com",
      bulletPoints: [
        "Join 150+ companies already seeing results",
        "First meeting to term sheet in 30 days",
      ],
    },
  ],
  sellSheet: {
    headline: "AI-Powered Business Intelligence",
    subheadline: "From raw data to board-ready insights in minutes, not days.",
    sections: [
      { title: "The Problem", content: "87% of analytics projects fail. Analysts spend 80% of time on data cleaning. Decision-makers wait days for outdated reports." },
      { title: "Our Solution", content: "Natural language queries, automated anomaly detection, and real-time dashboards that update as data flows in." },
      { title: "Market Opportunity", content: "$50B global BI market growing 12% YoY, with the mid-market segment significantly underserved." },
      { title: "Traction", content: "$2M ARR in 18 months, 150+ customers, 72 NPS, and <5% monthly churn." },
      { title: "The Ask", content: "Raising $10M Series A to accelerate growth from $2M to $20M ARR." },
    ],
  },
  onePager: {
    headline: "Acme AI - Transforming Business Intelligence",
    sections: [
      { title: "Executive Summary", content: "Acme AI is an AI-powered business intelligence platform that transforms raw data into actionable insights in minutes. With $2M ARR and 150+ customers, we are raising $10M to accelerate growth." },
      { title: "Problem & Solution", content: "87% of analytics projects fail to deliver insights. Our AI platform replaces complex SQL with natural language, automates anomaly detection, and provides real-time dashboards." },
      { title: "Market", content: "Targeting the $50B global BI market, specifically the underserved $8B mid-market segment growing at 12% annually." },
      { title: "Team", content: "Jane Smith (CEO, Ex-Google), John Doe (CTO, Ex-Stripe), Sarah Chen (VP Sales, Ex-Palantir)." },
      { title: "Financials", content: "Current: $2M ARR, 75% gross margins, LTV:CAC 5:1. Target: $20M ARR by 2026 with path to profitability." },
    ],
  },
  brandKit: {
    colorRationale: "Deep violet primary conveys innovation and trust. Warm amber accent drives attention to CTAs. Cool slate neutrals for readability.",
    fontPairing: { heading: "Inter Tight", body: "Inter" },
    brandVoice: "Authoritative yet approachable. Data-driven but human. We speak with clarity, confidence, and genuine enthusiasm for solving hard problems.",
    logoDirection: "Clean wordmark with a subtle data-node icon. Should feel premium and modern. Works at 16px favicon size and on dark backgrounds.",
  },
};

// ── Download helper ────────────────────────────────────────────────────────

type ExportType = "pptx" | "sell-sheet" | "one-pager" | "brand-kit" | "bundle";

interface ExportConfig {
  endpoint: string;
  body: (deck: DeckContent) => object;
  filename: string;
}

const EXPORT_CONFIGS: Record<ExportType, ExportConfig> = {
  pptx: {
    endpoint: "/api/export/pptx",
    body: (deck) => ({ deck }),
    filename: "pitch-deck.pptx",
  },
  "sell-sheet": {
    endpoint: "/api/export/pdf",
    body: (deck) => ({ deck, type: "sell-sheet" }),
    filename: "sell-sheet.pdf",
  },
  "one-pager": {
    endpoint: "/api/export/pdf",
    body: (deck) => ({ deck, type: "one-pager" }),
    filename: "one-pager.pdf",
  },
  "brand-kit": {
    endpoint: "/api/export/pdf",
    body: (deck) => ({ deck, type: "brand-kit" }),
    filename: "brand-kit.pdf",
  },
  bundle: {
    endpoint: "/api/export/bundle",
    body: (deck) => ({ deck }),
    filename: "pitchdeck-bundle.zip",
  },
};

// ── Preview Page ───────────────────────────────────────────────────────────

function PreviewPageInner() {
  const searchParams = useSearchParams();
  const [deckContent, setDeckContent] = React.useState<DeckContent | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error] = React.useState<string | null>(null);
  const [isMock, setIsMock] = React.useState(false);
  const [downloading, setDownloading] = React.useState<ExportType | null>(null);

  React.useEffect(() => {
    async function loadDeck() {
      // Check for deckId in URL params or sessionStorage
      const deckId =
        searchParams.get("deck_id") ||
        searchParams.get("deckId") ||
        sessionStorage.getItem("pitchdeck-deckId");

      // Try loading from Supabase if we have a deckId
      if (deckId) {
        try {
          const res = await fetch(`/api/decks/${deckId}`);
          if (res.ok) {
            const data = await res.json();
            const deck = data.deck;
            if (deck && deck.slides && Array.isArray(deck.slides) && deck.slides.length > 0) {
              const content: DeckContent = {
                slides: deck.slides as DeckContent["slides"],
                sellSheet: deck.sell_sheet as DeckContent["sellSheet"],
                onePager: deck.one_pager as DeckContent["onePager"],
                brandKit: deck.brand_kit as DeckContent["brandKit"],
              };
              setDeckContent(content);
              setIsMock(false);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error("[preview] Failed to load deck from Supabase:", err);
        }
      }

      // Fall back to sessionStorage
      try {
        const stored = sessionStorage.getItem("pitchdeck-content");
        if (stored) {
          const parsed = JSON.parse(stored) as DeckContent;
          setDeckContent(parsed);
          setIsMock(false);
        } else {
          setDeckContent(DEMO_DECK);
          setIsMock(true);
        }
      } catch {
        setDeckContent(DEMO_DECK);
        setIsMock(true);
      }
      setIsLoading(false);
    }

    loadDeck();
  }, [searchParams]);

  async function handleDownload(type: ExportType) {
    if (!deckContent || downloading) return;

    const config = EXPORT_CONFIGS[type];
    setDownloading(type);

    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config.body(deckContent)),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? `Download failed (${response.status})`
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = config.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${config.filename} downloaded`);
    } catch (error) {
      console.error(`[download] ${type} failed:`, error);
      toast.error(
        error instanceof Error ? error.message : "Download failed. Please try again."
      );
    } finally {
      setDownloading(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          <p className="text-sm text-muted-foreground">Loading your deck...</p>
        </div>
      </div>
    );
  }

  if (error || !deckContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-muted-foreground">
            {error ?? "No deck content found. Please generate a deck first."}
          </p>
          <Button asChild variant="outline">
            <Link href="/create">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Create
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isDownloading = downloading !== null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/create">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Edit
              </Link>
            </Button>

            {isMock && (
              <Badge variant="secondary" className="text-xs">
                Demo Content
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isDownloading}
              onClick={() => handleDownload("bundle")}
            >
              {downloading === "bundle" ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-1 h-4 w-4" />
              )}
              {downloading === "bundle" ? "Generating..." : "Download All"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content with tabs */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Tabs defaultValue="deck" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deck" className="gap-1.5">
              <Presentation className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pitch Deck</span>
              <span className="sm:hidden">Deck</span>
            </TabsTrigger>
            <TabsTrigger value="sell-sheet" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sell Sheet</span>
              <span className="sm:hidden">Sell</span>
            </TabsTrigger>
            <TabsTrigger value="one-pager" className="gap-1.5">
              <File className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">One-Pager</span>
              <span className="sm:hidden">1-Page</span>
            </TabsTrigger>
            <TabsTrigger value="brand-kit" className="gap-1.5">
              <Palette className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Brand Kit</span>
              <span className="sm:hidden">Brand</span>
            </TabsTrigger>
          </TabsList>

          {/* Pitch Deck Tab */}
          <TabsContent value="deck" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Pitch Deck Preview</h1>
                <p className="text-sm text-muted-foreground">
                  {deckContent.slides.length} slides - Use arrow keys to navigate
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={isDownloading}
                onClick={() => handleDownload("pptx")}
              >
                {downloading === "pptx" ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-1 h-4 w-4" />
                )}
                {downloading === "pptx" ? "Generating..." : "PPTX"}
              </Button>
            </div>
            <DeckPreview slides={deckContent.slides} />
          </TabsContent>

          {/* Sell Sheet Tab */}
          <TabsContent value="sell-sheet" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Sell Sheet</h1>
                <p className="text-sm text-muted-foreground">
                  One-page sales document for prospects
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={isDownloading}
                onClick={() => handleDownload("sell-sheet")}
              >
                {downloading === "sell-sheet" ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-1 h-4 w-4" />
                )}
                {downloading === "sell-sheet" ? "Generating..." : "PDF"}
              </Button>
            </div>
            <SellSheetPreview sellSheet={deckContent.sellSheet} />
          </TabsContent>

          {/* One-Pager Tab */}
          <TabsContent value="one-pager" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Executive One-Pager</h1>
                <p className="text-sm text-muted-foreground">
                  Concise overview for investors and partners
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={isDownloading}
                onClick={() => handleDownload("one-pager")}
              >
                {downloading === "one-pager" ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-1 h-4 w-4" />
                )}
                {downloading === "one-pager" ? "Generating..." : "PDF"}
              </Button>
            </div>
            <OnePagerPreview onePager={deckContent.onePager} />
          </TabsContent>

          {/* Brand Kit Tab */}
          <TabsContent value="brand-kit" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Branding Kit</h1>
                <p className="text-sm text-muted-foreground">
                  Colors, typography, voice, and logo direction
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={isDownloading}
                onClick={() => handleDownload("brand-kit")}
              >
                {downloading === "brand-kit" ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-1 h-4 w-4" />
                )}
                {downloading === "brand-kit" ? "Generating..." : "PDF"}
              </Button>
            </div>
            <BrandKitPreview brandKit={deckContent.brandKit} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            <p className="text-sm text-muted-foreground">Loading your deck...</p>
          </div>
        </div>
      }
    >
      <PreviewPageInner />
    </React.Suspense>
  );
}
