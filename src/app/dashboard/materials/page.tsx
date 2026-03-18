"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Share2,
  Mail,
  Megaphone,
  Newspaper,
  Globe,
  Presentation,
  Sparkles,
  Loader2,
  Lock,
  Download,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import type { MaterialType } from "@/types/promotional";
import { MATERIAL_TYPE_META } from "@/types/promotional";

// ---------------------------------------------------------------------------
// Icon mapping
// ---------------------------------------------------------------------------

const MATERIAL_ICONS: Record<MaterialType, typeof Share2> = {
  "social-media-kit": Share2,
  "email-templates": Mail,
  "ad-creatives": Megaphone,
  "press-kit": Newspaper,
  "website-one-pager": Globe,
  "trade-show": Presentation,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GeneratedMaterial {
  type: MaterialType;
  title: string;
  content: Record<string, unknown>;
  exportFormats: string[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MaterialsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<"free" | "pro" | "founder">("free");
  const [authChecked, setAuthChecked] = useState(false);
  const [generatingType, setGeneratingType] = useState<MaterialType | null>(null);
  const [generated, setGenerated] = useState<Map<MaterialType, GeneratedMaterial>>(new Map());
  const [expandedType, setExpandedType] = useState<MaterialType | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check auth + subscription
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status, plan_type")
          .eq("user_id", user.id)
          .eq("status", "active")
          .limit(1)
          .maybeSingle();

        if (sub) {
          const planType =
            sub && typeof sub === "object" && "plan_type" in sub
              ? (sub as Record<string, unknown>).plan_type
              : null;
          setUserTier(planType === "founder" ? "founder" : "pro");
        }
      }
      setAuthChecked(true);
    });
  }, []);

  // We need an analysis to generate materials — try to load the most recent one
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);

  const loadAnalysis = useCallback(async () => {
    if (!userId) return;
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("analyses")
        .select("analysis_data")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.analysis_data) {
        setAnalysis(data.analysis_data as Record<string, unknown>);
      }
    } catch {
      // silent
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadAnalysis();
  }, [loadAnalysis, userId]);

  const handleGenerate = async (materialType: MaterialType) => {
    if (!analysis) {
      setError(
        "No business analysis found. Please create a pitch deck first to generate promotional materials.",
      );
      return;
    }

    setGeneratingType(materialType);
    setError(null);

    try {
      const res = await fetch("/api/generate-materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialType,
          analysis,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Generation failed");
        return;
      }

      const data = await res.json();
      setGenerated((prev) => {
        const next = new Map(prev);
        next.set(materialType, {
          ...data.material,
          generatedAt: new Date().toISOString(),
        });
        return next;
      });
      setExpandedType(materialType);
    } catch {
      setError("Failed to generate material. Please try again.");
    } finally {
      setGeneratingType(null);
    }
  };

  const handleDownload = (material: GeneratedMaterial, format: string) => {
    const content = JSON.stringify(material.content, null, 2);

    if (format === "html" && material.type === "website-one-pager") {
      // Build a basic HTML page from the one-pager content
      const c = material.content as {
        heroHeadline?: string;
        heroSubheadline?: string;
        sections?: Array<{ title: string; content: string }>;
        ctaText?: string;
        footerText?: string;
      };
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${c.heroHeadline ?? material.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; color: #1a1a2e; line-height: 1.6; }
    .hero { padding: 80px 24px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 16px; }
    .hero p { font-size: 1.25rem; opacity: 0.9; max-width: 600px; margin: 0 auto; }
    .section { padding: 60px 24px; max-width: 800px; margin: 0 auto; }
    .section:nth-child(even) { background: #f8f9fa; }
    .section h2 { font-size: 1.5rem; margin-bottom: 16px; color: #667eea; }
    .section p { font-size: 1rem; color: #444; }
    .cta { padding: 60px 24px; text-align: center; }
    .cta a { display: inline-block; padding: 16px 40px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1.1rem; }
    footer { padding: 40px 24px; text-align: center; color: #888; font-size: 0.875rem; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>${c.heroHeadline ?? ""}</h1>
    <p>${c.heroSubheadline ?? ""}</p>
  </div>
  ${(c.sections ?? []).map((s) => `<div class="section"><h2>${s.title}</h2><p>${s.content}</p></div>`).join("\n  ")}
  <div class="cta">
    <a href="#contact">${c.ctaText ?? "Get Started"}</a>
  </div>
  <footer>${c.footerText ?? ""}</footer>
</body>
</html>`;
      downloadFile(html, `${material.type}.html`, "text/html");
      return;
    }

    // Default: download as JSON (can be used by external tools)
    downloadFile(content, `${material.type}.json`, "application/json");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="text-center py-24">
        <Sparkles className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-zinc-200 mb-2">
          Sign in to access materials
        </h2>
        <p className="text-sm text-zinc-500 mb-6">
          You need an account to generate promotional materials.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-[#8b5cf6] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#7c3aed] transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const isLocked = userTier === "free";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/dashboard/overview"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              Promotional Materials
            </h1>
          </div>
          <p className="text-zinc-400 mt-1 ml-8">
            Generate marketing assets from your business analysis
          </p>
        </div>
      </div>

      {/* Tier gate banner */}
      {isLocked && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
          <div className="flex items-start gap-4">
            <Lock className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-amber-200">
                Upgrade to Pro or Founder Suite
              </h3>
              <p className="text-sm text-amber-200/70 mt-1">
                Promotional materials generation is available on Pro and Founder
                Suite plans. Upgrade to create social media kits, investor
                emails, ad creatives, press kits, and more.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 mt-4 rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Material type grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.keys(MATERIAL_TYPE_META) as MaterialType[]).map((type) => {
          const meta = MATERIAL_TYPE_META[type];
          const Icon = MATERIAL_ICONS[type];
          const isGenerating = generatingType === type;
          const material = generated.get(type);
          const isExpanded = expandedType === type;

          return (
            <div
              key={type}
              className={`rounded-2xl border bg-zinc-900/30 overflow-hidden transition-all ${
                material
                  ? "border-emerald-500/30"
                  : "border-zinc-800"
              }`}
            >
              {/* Card header */}
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      material
                        ? "bg-emerald-500/10"
                        : isLocked
                          ? "bg-zinc-800/50"
                          : "bg-[#8b5cf6]/10"
                    }`}
                  >
                    {isLocked ? (
                      <Lock className="w-5 h-5 text-zinc-600" />
                    ) : (
                      <Icon
                        className={`w-5 h-5 ${
                          material ? "text-emerald-400" : "text-[#8b5cf6]"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-100">
                      {meta.label}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      {meta.description}
                    </p>
                  </div>
                </div>

                {/* Token cost badge */}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                    {meta.tokenCost} tokens
                  </span>
                  <span className="text-xs text-zinc-600">
                    {meta.exportFormats.join(", ").toUpperCase()}
                  </span>
                </div>

                {/* Action button */}
                <div className="mt-4">
                  {material ? (
                    <div className="space-y-2">
                      <button
                        onClick={() =>
                          setExpandedType(isExpanded ? null : type)
                        }
                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide Preview
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            View Preview
                          </>
                        )}
                      </button>
                      <div className="flex gap-2">
                        {material.exportFormats.map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => handleDownload(material, fmt)}
                            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            {fmt.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerate(type)}
                      disabled={isLocked || isGenerating || generatingType !== null}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                        isLocked
                          ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#ff006e] via-[#8b5cf6] to-[#00d4ff] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : isLocked ? (
                        <>
                          <Lock className="w-4 h-4" />
                          Upgrade to Unlock
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded preview */}
              {isExpanded && material && (
                <div className="border-t border-zinc-800 p-5 bg-zinc-950/50">
                  <pre className="text-xs text-zinc-400 whitespace-pre-wrap break-words max-h-96 overflow-y-auto font-mono">
                    {JSON.stringify(material.content, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No analysis warning */}
      {!analysis && !isLocked && (
        <div className="text-center py-8 rounded-2xl border border-dashed border-zinc-800">
          <Sparkles className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">
            No business analysis found
          </p>
          <p className="text-sm text-zinc-600 mt-1 mb-4">
            Create a pitch deck first, then come back to generate promotional
            materials.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-xl bg-[#8b5cf6] px-5 py-2 text-sm font-medium text-white hover:bg-[#7c3aed] transition-colors"
          >
            Create Deck
          </Link>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
