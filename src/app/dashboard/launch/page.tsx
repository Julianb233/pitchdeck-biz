"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { LaunchDocument, InfraType } from "@/types/launch-infrastructure";
import { INFRA_DOCUMENTS } from "@/types/launch-infrastructure";
import { generateInfrastructurePDF } from "@/lib/export/infrastructure-pdf";

// ── Icons ────────────────────────────────────────────────────────────────────

function InfraIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = className || "w-6 h-6";
  switch (icon) {
    case "briefcase":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      );
    case "chart":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      );
    case "pie-chart":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
        </svg>
      );
    case "file-text":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    case "check-list":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "mail":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      );
    case "folder":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      );
    default:
      return null;
  }
}

// ── Document Preview Modal ──────────────────────────────────────────────────

function DocumentPreview({
  document,
  companyName,
  onClose,
}: {
  document: LaunchDocument;
  companyName: string;
  onClose: () => void;
}) {
  const handleDownloadPDF = useCallback(() => {
    const pdf = generateInfrastructurePDF(document, {
      companyName,
      confidential: true,
    });
    pdf.save(`${document.type}-${companyName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  }, [document, companyName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h3 className="text-xl font-bold text-white">{document.title}</h3>
            <p className="text-sm text-zinc-400 mt-1">
              {document.sections.length} sections | Generated{" "}
              {new Date(document.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
              }}
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {document.sections.map((section, index) => (
              <div key={index} className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-7 h-7 rounded-md bg-[#203eec] flex items-center justify-center text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <h4 className="text-lg font-semibold text-white">{section.title}</h4>
                </div>
                <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Analysis Selector ───────────────────────────────────────────────────────

interface AnalysisRow {
  id: string;
  business_name: string;
  analysis_data: Record<string, unknown>;
  created_at: string;
}

function AnalysisSelector({
  analyses,
  selected,
  onSelect,
}: {
  analyses: AnalysisRow[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  if (analyses.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
        <p className="text-zinc-400">
          No business analyses found. Create a pitch deck first to generate your business analysis.
        </p>
        <a
          href="/create"
          className="inline-block mt-4 px-5 py-2.5 rounded-lg text-sm font-medium text-white"
          style={{
            background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
          }}
        >
          Create Pitch Deck
        </a>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <label className="text-sm text-zinc-400 block mb-3">Select Business Analysis</label>
      <div className="space-y-2">
        {analyses.map((a) => (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className={`w-full text-left p-3 rounded-lg border transition-all ${
              selected === a.id
                ? "border-[#203eec] bg-[#203eec]/10 text-white"
                : "border-zinc-700 hover:border-zinc-600 text-zinc-300"
            }`}
          >
            <p className="font-medium">{a.business_name}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {new Date(a.created_at).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function LaunchInfrastructurePage() {
  const { user, loading: authLoading } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [generatedDocs, setGeneratedDocs] = useState<Map<InfraType, LaunchDocument>>(new Map());
  const [generating, setGenerating] = useState<InfraType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<LaunchDocument | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const isFounderSuite = user?.subscriptionStatus === "pro"; // Will be "founder_suite" when tier is added

  // Load analyses
  useEffect(() => {
    if (!user) return;
    async function load() {
      setDataLoading(true);
      try {
        const res = await fetch("/api/analyses");
        if (res.ok) {
          const data = await res.json();
          setAnalyses(data.analyses ?? []);
          if (data.analyses?.length > 0) {
            setSelectedAnalysisId(data.analyses[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load analyses:", err);
      } finally {
        setDataLoading(false);
      }
    }
    load();
  }, [user]);

  const selectedAnalysis = analyses.find((a) => a.id === selectedAnalysisId);

  const handleGenerate = useCallback(
    async (infraType: InfraType) => {
      if (!selectedAnalysis || generating) return;
      setGenerating(infraType);
      setError(null);

      try {
        const res = await fetch("/api/generate-infrastructure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            infraType,
            analysis: selectedAnalysis.analysis_data,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || data.message || "Generation failed");
          return;
        }

        if (data.success && data.document) {
          setGeneratedDocs((prev) => {
            const next = new Map(prev);
            next.set(infraType, data.document);
            return next;
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Generation failed");
      } finally {
        setGenerating(null);
      }
    },
    [selectedAnalysis, generating],
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const completedCount = generatedDocs.size;
  const totalCount = INFRA_DOCUMENTS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-white">Launch Infrastructure</h1>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
              }}
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Founder Suite
            </span>
          </div>
          <p className="text-zinc-400 text-sm">
            Generate comprehensive fundraising documents tailored to your business.
          </p>
        </div>
      </div>

      {/* Founder Suite gate for non-subscribers */}
      {!isFounderSuite && (
        <div
          className="rounded-2xl p-8 border"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,0,110,0.05) 0%, rgba(139,92,246,0.05) 50%, rgba(0,212,255,0.05) 100%)",
            borderColor: "rgba(139,92,246,0.2)",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
              }}
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Unlock Founder Suite</h3>
              <p className="text-zinc-400 mt-1 leading-relaxed">
                Launch infrastructure documents are exclusively available to Founder Suite
                subscribers. Get everything you need to go from idea to funded —
                comprehensive business plans, financial models, cap tables, investor outreach
                kits, and more.
              </p>
              <div className="mt-4 flex items-center gap-4">
                <a
                  href="/#pricing"
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
                  }}
                >
                  Upgrade to Founder Suite — $199/mo
                </a>
                <span className="text-xs text-zinc-500">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis selector */}
      {isFounderSuite && !dataLoading && (
        <AnalysisSelector
          analyses={analyses}
          selected={selectedAnalysisId}
          onSelect={setSelectedAnalysisId}
        />
      )}

      {/* Progress tracker */}
      {isFounderSuite && completedCount > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-white">
              Documents Generated: {completedCount} / {totalCount}
            </p>
            <span className="text-xs text-zinc-400">{progressPercent}% complete</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
              }}
            />
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-red-400 text-sm font-medium">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-500/60 text-xs mt-1 hover:text-red-400"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Infrastructure cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {INFRA_DOCUMENTS.map((doc) => {
          const generated = generatedDocs.get(doc.type);
          const isGenerating = generating === doc.type;
          const isLocked = !isFounderSuite;

          return (
            <div
              key={doc.type}
              className={`relative rounded-2xl border p-6 transition-all ${
                generated
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : isLocked
                    ? "border-zinc-800 bg-zinc-900/50 opacity-60"
                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
              }`}
            >
              {/* Generated checkmark */}
              {generated && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Lock icon for non-subscribers */}
              {isLocked && (
                <div className="absolute top-4 right-4">
                  <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${doc.color}15`, color: doc.color }}
              >
                <InfraIcon icon={doc.icon} />
              </div>

              {/* Title & description */}
              <h3 className="text-base font-semibold text-white mb-2">{doc.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">{doc.description}</p>

              {/* Estimated pages */}
              <div className="flex items-center gap-1.5 mb-5">
                <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <span className="text-xs text-zinc-500">{doc.estimatedPages}</span>
              </div>

              {/* Action buttons */}
              {generated ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewDoc(generated)}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => {
                      const pdf = generateInfrastructurePDF(generated, {
                        companyName: selectedAnalysis?.business_name || "Company",
                        confidential: true,
                      });
                      pdf.save(
                        `${generated.type}-${(selectedAnalysis?.business_name || "company").toLowerCase().replace(/\s+/g, "-")}.pdf`,
                      );
                    }}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                    style={{
                      background:
                        "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
                    }}
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => handleGenerate(doc.type)}
                    disabled={isGenerating}
                    className="px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    title="Regenerate"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleGenerate(doc.type)}
                  disabled={isLocked || isGenerating || !selectedAnalysisId}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={
                    !isLocked && !isGenerating
                      ? {
                          background:
                            "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
                        }
                      : { backgroundColor: "#3f3f46" }
                  }
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Generating...
                    </span>
                  ) : isLocked ? (
                    "Founder Suite Only"
                  ) : (
                    "Generate"
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview modal */}
      {previewDoc && (
        <DocumentPreview
          document={previewDoc}
          companyName={selectedAnalysis?.business_name || "Company"}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
