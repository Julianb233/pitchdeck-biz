"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import type {
  BusinessDocument,
  DocumentType,
  DocumentContent,
} from "@/types/documents";
import { DOCUMENT_TYPE_INFO } from "@/types/documents";

// ── Icons ────────────────────────────────────────────────────────────────────

function DocumentIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "briefcase":
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      );
    case "chart":
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      );
    case "building":
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      );
    case "globe":
      return (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      );
    default:
      return null;
  }
}

// ── Document Viewer ──────────────────────────────────────────────────────────

function DocumentViewer({
  document,
  onRevise,
  onDownloadPDF,
  onClose,
  isRevising,
  isDownloading,
}: {
  document: BusinessDocument;
  onRevise: (feedback: string, sections?: string[]) => void;
  onDownloadPDF: () => void;
  onClose: () => void;
  isRevising: boolean;
  isDownloading: boolean;
}) {
  const [feedback, setFeedback] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onClose}
            className="text-sm text-zinc-400 hover:text-white transition-colors mb-2 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Documents
          </button>
          <h2 className="text-xl font-bold text-white">{document.title}</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-zinc-500">
              Version {document.version}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                document.status === "final"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-amber-500/10 text-amber-400"
              }`}
            >
              {document.status}
            </span>
            {document.content.metadata.confidential && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                Confidential
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDownloadPDF}
            disabled={isDownloading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-zinc-800 text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            {isDownloading ? "Generating..." : "Download PDF"}
          </button>
          <button
            onClick={() => setShowRevisionForm(!showRevisionForm)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
            }}
          >
            Revise
          </button>
        </div>
      </div>

      {/* Revision Form */}
      {showRevisionForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white">Request Revision</h3>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Describe what you'd like changed. Be specific about which sections need work and what improvements you want..."
            className="w-full h-32 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm p-3 resize-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none placeholder:text-zinc-500"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (feedback.trim()) {
                  onRevise(feedback.trim());
                  setFeedback("");
                  setShowRevisionForm(false);
                }
              }}
              disabled={isRevising || !feedback.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
              }}
            >
              {isRevising ? "Revising..." : "Submit Revision"}
            </button>
            <button
              onClick={() => {
                setShowRevisionForm(false);
                setFeedback("");
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Version History */}
      {document.feedback && document.feedback.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Revision History
          </h3>
          <div className="space-y-2">
            {document.feedback.map((fb, i) => (
              <div
                key={i}
                className="text-sm text-zinc-400 flex items-start gap-2"
              >
                <span className="text-xs bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-mono shrink-0">
                  v{i + 1}
                </span>
                <span>{fb}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Content */}
      <div className="bg-white rounded-xl overflow-hidden shadow-lg">
        {/* Document Header */}
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 px-8 py-6">
          <p className="text-violet-400 text-sm font-medium">
            {document.content.metadata.companyName}
          </p>
          <h3 className="text-white text-xl font-bold mt-1">{document.title}</h3>
          <p className="text-zinc-400 text-sm mt-1">
            {new Date(document.content.metadata.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Sections */}
        <div className="px-8 py-6 space-y-8">
          {document.content.sections.map((section, i) => (
            <div key={i}>
              <h4 className="text-lg font-bold text-zinc-900 border-l-4 border-violet-500 pl-3 mb-3">
                {section.title}
              </h4>
              <div className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
                {section.body}
              </div>

              {section.subsections && section.subsections.length > 0 && (
                <div className="mt-4 space-y-4 pl-4 border-l border-zinc-200">
                  {section.subsections.map((sub, j) => (
                    <div key={j}>
                      <h5 className="text-sm font-semibold text-violet-600 mb-1">
                        {sub.title}
                      </h5>
                      <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-line">
                        {sub.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {i < document.content.sections.length - 1 && (
                <hr className="mt-6 border-zinc-200" />
              )}
            </div>
          ))}
        </div>

        {/* Document Footer */}
        <div className="bg-zinc-50 px-8 py-4 text-center">
          <p className="text-xs text-zinc-400">
            Generated by PitchDeck.biz
            {document.content.metadata.confidential && " | CONFIDENTIAL"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const { user, loading } = useAuth();
  const [documents, setDocuments] = useState<Map<string, BusinessDocument[]>>(
    new Map(),
  );
  const [activeDocument, setActiveDocument] = useState<BusinessDocument | null>(
    null,
  );
  const [generating, setGenerating] = useState<DocumentType | null>(null);
  const [isRevising, setIsRevising] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<Record<string, unknown> | null>(null);

  // Fetch the user's most recent analysis for document generation
  const fetchAnalysis = useCallback(async () => {
    try {
      const res = await fetch("/api/analyses");
      if (!res.ok) return null;
      const data = await res.json();
      const analyses = data.analyses ?? [];
      if (analyses.length === 0) return null;

      // Get the full analysis data for the most recent one
      const latestId = analyses[0].id;
      const analysisRes = await fetch(`/api/analyses/${latestId}`);
      if (!analysisRes.ok) return null;
      const analysisData = await analysisRes.json();
      return analysisData.analysis ?? null;
    } catch {
      return null;
    }
  }, []);

  const handleGenerate = useCallback(
    async (documentType: DocumentType) => {
      setError(null);
      setGenerating(documentType);

      try {
        let analysis = analysisData;
        if (!analysis) {
          analysis = await fetchAnalysis();
          if (analysis) setAnalysisData(analysis);
        }

        if (!analysis) {
          setError(
            "No business analysis found. Please complete a discovery session first.",
          );
          setGenerating(null);
          return;
        }

        const res = await fetch("/api/generate-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentType, analysis }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 403) {
            setError(data.error || "Upgrade to Pro to access business documents.");
          } else {
            setError(data.error || "Document generation failed.");
          }
          setGenerating(null);
          return;
        }

        const doc = data.document as BusinessDocument;
        setDocuments((prev) => {
          const next = new Map(prev);
          const existing = next.get(documentType) ?? [];
          next.set(documentType, [doc, ...existing]);
          return next;
        });
        setActiveDocument(doc);
      } catch (err) {
        console.error("Generate document failed:", err);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setGenerating(null);
      }
    },
    [analysisData, fetchAnalysis],
  );

  const handleRevise = useCallback(
    async (feedback: string, specificSections?: string[]) => {
      if (!activeDocument) return;
      setIsRevising(true);
      setError(null);

      try {
        const res = await fetch("/api/generate-document/revise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            document: activeDocument,
            feedback,
            specificSections,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Revision failed.");
          setIsRevising(false);
          return;
        }

        const revisedDoc = data.document as BusinessDocument;
        setActiveDocument(revisedDoc);

        // Update in documents map
        setDocuments((prev) => {
          const next = new Map(prev);
          const existing = next.get(activeDocument.type) ?? [];
          const idx = existing.findIndex((d) => d.id === activeDocument.id);
          if (idx >= 0) {
            existing[idx] = revisedDoc;
          } else {
            existing.unshift(revisedDoc);
          }
          next.set(activeDocument.type, [...existing]);
          return next;
        });
      } catch (err) {
        console.error("Revision failed:", err);
        setError("An unexpected error occurred during revision.");
      } finally {
        setIsRevising(false);
      }
    },
    [activeDocument],
  );

  const handleDownloadPDF = useCallback(async () => {
    if (!activeDocument) return;
    setIsDownloading(true);

    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "business-document",
          documentContent: activeDocument.content,
        }),
      });

      if (!res.ok) {
        setError("PDF generation failed.");
        setIsDownloading(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${activeDocument.type}-v${activeDocument.version}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      setError("Failed to download PDF.");
    } finally {
      setIsDownloading(false);
    }
  }, [activeDocument]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const isPro =
    user.subscriptionStatus === "pro" ||
    user.subscriptionStatus === "founder_suite";

  // If viewing a specific document
  if (activeDocument) {
    return (
      <DocumentViewer
        document={activeDocument}
        onRevise={handleRevise}
        onDownloadPDF={handleDownloadPDF}
        onClose={() => setActiveDocument(null)}
        isRevising={isRevising}
        isDownloading={isDownloading}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Business Documents</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Generate professional documents from your business analysis. Revise
          and iterate until they are perfect.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400/60 text-xs mt-1 hover:text-red-400 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Upgrade CTA for non-Pro users */}
      {!isPro && (
        <div className="bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">
                Unlock Business Documents
              </h3>
              <p className="text-zinc-400 text-sm mt-1">
                Executive summaries, investor updates, board decks, and company
                overviews are available on Pro and Founder Suite plans.
              </p>
              <Link
                href="/#pricing"
                className="inline-block mt-3 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
                }}
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Document Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.entries(DOCUMENT_TYPE_INFO) as [DocumentType, typeof DOCUMENT_TYPE_INFO[DocumentType]][]).map(
          ([type, info]) => {
            const docs = documents.get(type) ?? [];
            const isGenerating = generating === type;

            return (
              <div
                key={type}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center text-violet-400 shrink-0">
                    <DocumentIcon icon={info.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold">{info.label}</h3>
                    <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                      {info.description}
                    </p>

                    {/* Previously generated documents */}
                    {docs.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {docs.map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => setActiveDocument(doc)}
                            className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors group"
                          >
                            <span className="text-sm text-zinc-300 group-hover:text-white truncate">
                              v{doc.version} &mdash;{" "}
                              {new Date(doc.updatedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </span>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                doc.status === "final"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {doc.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleGenerate(type)}
                      disabled={!isPro || isGenerating || generating !== null}
                      className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-all hover:opacity-90"
                      style={{
                        background: isPro
                          ? "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)"
                          : undefined,
                        backgroundColor: !isPro ? "#3f3f46" : undefined,
                      }}
                    >
                      {isGenerating
                        ? "Generating..."
                        : docs.length > 0
                          ? "Generate New"
                          : "Generate"}
                    </button>
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>

      {/* How it works */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          How It Works
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 text-sm font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <p className="text-white text-sm font-medium">Generate</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                AI creates a professional document from your business analysis.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 text-sm font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <p className="text-white text-sm font-medium">Revise</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Provide feedback and AI revises specific sections or the entire
                document.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 text-sm font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <p className="text-white text-sm font-medium">Export</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Download as a polished PDF with professional formatting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
