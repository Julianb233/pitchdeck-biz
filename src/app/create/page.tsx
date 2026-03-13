"use client"

import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Upload,
  Mic,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AudioRecorder } from "@/components/onboarding/audio-recorder"
import { cn } from "@/lib/utils"
import type {
  OnboardingInputMethod,
  OnboardingStep,
  UploadedFileInfo,
  UploadApiResponse,
  TranscribeApiResponse,
  AnalyzeApiResponse,
  BusinessAnalysis,
} from "@/lib/types"

const ACCEPTED_FILE_TYPES =
  ".pdf,.doc,.docx,.txt,.csv,.md,.png,.jpg,.jpeg,.webp,.gif"

const STEPS: { key: OnboardingStep; label: string }[] = [
  { key: "input", label: "Share Your Business" },
  { key: "processing", label: "AI Analysis" },
  { key: "review", label: "Review & Generate" },
]

export default function CreatePage() {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>("input")
  const [inputMethod, setInputMethod] = useState<OnboardingInputMethod | null>(
    null
  )
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([])
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const [transcription, setTranscription] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── File upload handler ────────────────────────────────────────────────
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    setError(null)
    setIsProcessing(true)

    const fileInfos: UploadedFileInfo[] = fileArray.map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }))
    setUploadedFiles(fileInfos)

    try {
      const formData = new FormData()
      fileArray.forEach((f) => formData.append("files", f))

      const res = await fetch("/api/analysis/upload", {
        method: "POST",
        body: formData,
      })

      const data: UploadApiResponse = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed")
      }

      // Collect extracted text
      const texts = data.files
        .map((f) => f.extractedText)
        .filter(Boolean)
        .join("\n\n")

      if (texts) {
        setExtractedText(texts)
      }

      // Check for audio files to transcribe
      const audioFiles = data.files.filter((f) => f.isAudio)
      if (audioFiles.length > 0) {
        // Re-upload audio files for transcription
        for (const audioInfo of audioFiles) {
          const originalFile = fileArray.find(
            (f) => f.name === audioInfo.fileName
          )
          if (!originalFile) continue

          const audioForm = new FormData()
          audioForm.append("audio", originalFile)

          const transcribeRes = await fetch("/api/analysis/transcribe", {
            method: "POST",
            body: audioForm,
          })
          const transcribeData: TranscribeApiResponse =
            await transcribeRes.json()
          if (transcribeData.success && transcribeData.transcription) {
            setTranscription(transcribeData.transcription.text)
          }
        }
      }

      // Now run analysis
      await runAnalysis(texts || null, null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setIsProcessing(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Audio recording handler ─────────────────────────────────────────────
  const handleRecordingComplete = useCallback(async (blob: Blob) => {
    setError(null)
    setIsProcessing(true)
    setStep("processing")

    try {
      const formData = new FormData()
      formData.append("audio", blob, "recording.webm")

      const res = await fetch("/api/analysis/transcribe", {
        method: "POST",
        body: formData,
      })

      const data: TranscribeApiResponse = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Transcription failed")
      }

      const text = data.transcription?.text || ""
      setTranscription(text)

      await runAnalysis(null, text)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed")
      setIsProcessing(false)
      setStep("input")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── AI analysis ─────────────────────────────────────────────────────────
  const runAnalysis = useCallback(
    async (text: string | null, transcript: string | null) => {
      setStep("processing")
      setIsProcessing(true)

      try {
        const body: Record<string, string | undefined> = {}
        if (text) body.textContent = text
        if (transcript) body.transcription = transcript
        if (extractedText && !text) body.textContent = extractedText
        if (transcription && !transcript) body.transcription = transcription

        const res = await fetch("/api/analysis/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })

        const data = await res.json() as AnalyzeApiResponse & { analysisId?: string }

        if (!res.ok || !data.success || !data.analysis) {
          throw new Error(data.error || "Analysis failed")
        }

        setAnalysis(data.analysis)
        if (data.analysisId) {
          setAnalysisId(data.analysisId)
        }
        setStep("review")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed")
        setStep("input")
      } finally {
        setIsProcessing(false)
      }
    },
    [extractedText, transcription]
  )

  // ── Generate deck content ──────────────────────────────────────────────
  const generateDeck = useCallback(async () => {
    if (!analysis) return

    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch("/api/generate-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis, analysis_id: analysisId }),
      })

      const data = await res.json()

      if (!res.ok || !data.success || !data.deckContent) {
        throw new Error(data.error || "Deck generation failed")
      }

      sessionStorage.setItem("pitchdeck-content", JSON.stringify(data.deckContent))

      // Build preview URL with deck_id if available
      const params = new URLSearchParams()
      if (data.deckId) params.set("deck_id", data.deckId)
      if (analysisId) params.set("analysis_id", analysisId)
      const qs = params.toString()
      router.push(`/create/preview${qs ? `?${qs}` : ""}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deck generation failed")
    } finally {
      setIsGenerating(false)
    }
  }, [analysis, analysisId, router])

  // ── Drag and drop handlers ──────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        setInputMethod("file")
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">
            pitch<span className="text-primary">deck</span>.biz
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-12 max-w-lg mx-auto">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all",
                    step === s.key
                      ? "text-white"
                      : STEPS.findIndex((x) => x.key === step) > i
                        ? "bg-green-500/20 text-green-600 border border-green-500/40"
                        : "bg-muted text-muted-foreground border border-border"
                  )}
                  style={
                    step === s.key
                      ? {
                          background:
                            "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #203eec 100%)",
                        }
                      : undefined
                  }
                >
                  {STEPS.findIndex((x) => x.key === step) > i ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium hidden sm:block",
                    step === s.key
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 mx-2 transition-colors",
                    STEPS.findIndex((x) => x.key === step) > i
                      ? "bg-green-500/40"
                      : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 1: Input ─────────────────────────────────────────────── */}
        {step === "input" && (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Tell Us About Your{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #ff006e, #8b5cf6, #203eec)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Business
                </span>
              </h1>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                Upload existing materials or record a quick description. Our AI
                will extract everything needed for your pitch deck.
              </p>
            </div>

            {error && (
              <div className="max-w-md mx-auto flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-auto">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Method selector */}
            {!inputMethod && (
              <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                <button
                  onClick={() => setInputMethod("file")}
                  className="group relative p-8 rounded-2xl border-2 border-border hover:border-primary/50 transition-all text-left bg-card hover:shadow-lg hover:shadow-primary/5"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,0,110,0.1), rgba(139,92,246,0.1))",
                    }}
                  >
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">
                    Upload Documents
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    PDF, DOCX, images, or text files with your business
                    information
                  </p>
                </button>

                <button
                  onClick={() => setInputMethod("voice")}
                  className="group relative p-8 rounded-2xl border-2 border-border hover:border-primary/50 transition-all text-left bg-card hover:shadow-lg hover:shadow-primary/5"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(139,92,246,0.1), rgba(32,62,236,0.1))",
                    }}
                  >
                    <Mic className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">
                    Voice Description
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Record yourself describing your business — just speak
                    naturally
                  </p>
                </button>
              </div>
            )}

            {/* File upload area */}
            {inputMethod === "file" && (
              <div className="max-w-xl mx-auto space-y-4">
                <button
                  onClick={() => setInputMethod(null)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to options
                </button>

                <div
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_FILE_TYPES}
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleFiles(e.target.files)
                    }}
                  />
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,0,110,0.1), rgba(139,92,246,0.1))",
                    }}
                  >
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-semibold text-lg mb-1">
                    {isDragging ? "Drop files here" : "Drop files or click to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    PDF, DOCX, TXT, images — up to 25 MB each
                  </p>
                </div>

                {/* Uploaded files list */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {f.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {(f.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Voice recording area */}
            {inputMethod === "voice" && (
              <div className="max-w-xl mx-auto space-y-4">
                <button
                  onClick={() => setInputMethod(null)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to options
                </button>

                <div className="p-8 rounded-2xl border border-border bg-card">
                  <AudioRecorder
                    onRecordingComplete={handleRecordingComplete}
                    disabled={isProcessing}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Processing ────────────────────────────────────────── */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-full animate-spin"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent, #ff006e, #8b5cf6, #203eec, transparent)",
                }}
              />
              <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">
                Analyzing Your Business...
              </h2>
              <p className="text-muted-foreground max-w-sm">
                Our AI is extracting key insights, market positioning, and
                financial data from your input.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Extracting business model and value proposition
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Identifying target market and competitive landscape
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Building brand narrative and financial summary
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Review ────────────────────────────────────────────── */}
        {step === "review" && analysis && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-4 border border-green-500/20">
                <CheckCircle2 className="w-4 h-4" />
                Analysis Complete
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Review Your Business Analysis
              </h2>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                Here is what our AI extracted. Review the details before
                generating your pitch deck.
              </p>
            </div>

            {/* Analysis cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Executive Summary */}
              <div className="md:col-span-2 p-6 rounded-2xl border border-border bg-card">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Executive Summary
                </h3>
                <p className="text-base leading-relaxed">{analysis.summary}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div
                    className="h-2 flex-1 rounded-full bg-muted overflow-hidden"
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${analysis.confidence * 100}%`,
                        background:
                          "linear-gradient(90deg, #ff006e, #8b5cf6, #203eec)",
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(analysis.confidence * 100)}% confidence
                  </span>
                </div>
              </div>

              {/* Value Proposition */}
              <AnalysisCard title="Value Proposition">
                <p className="font-semibold text-lg mb-1">
                  {analysis.valueProposition.headline}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {analysis.valueProposition.description}
                </p>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Differentiators
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.valueProposition.uniqueDifferentiators.map(
                      (d, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
                        >
                          {d}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </AnalysisCard>

              {/* Business Model */}
              <AnalysisCard title="Business Model">
                <p className="font-semibold mb-2">
                  {analysis.businessModel.type}
                </p>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Revenue Streams
                  </p>
                  <ul className="space-y-1">
                    {analysis.businessModel.revenueStreams.map((s, i) => (
                      <li
                        key={i}
                        className="text-sm flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnalysisCard>

              {/* Market */}
              <AnalysisCard title="Target Market">
                <p className="text-sm mb-2">
                  {analysis.market.targetAudience}
                </p>
                {analysis.market.marketSize && (
                  <p className="text-xs text-muted-foreground">
                    Market Size: {analysis.market.marketSize}
                  </p>
                )}
                {analysis.market.competitors &&
                  analysis.market.competitors.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">
                        Competitors
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.market.competitors.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-md bg-muted text-xs"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </AnalysisCard>

              {/* Brand Essence */}
              <AnalysisCard title="Brand Essence">
                <p className="text-sm mb-2">{analysis.brandEssence.mission}</p>
                {analysis.brandEssence.tagline && (
                  <p className="font-semibold text-primary text-sm italic">
                    &quot;{analysis.brandEssence.tagline}&quot;
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Tone: {analysis.brandEssence.tone}
                </p>
              </AnalysisCard>

              {/* Financials */}
              <AnalysisCard title="Financials">
                <p className="text-sm mb-2">
                  Stage: <span className="font-semibold">{analysis.financials.stage}</span>
                </p>
                {analysis.financials.currentAsk && (
                  <p className="text-sm">
                    Ask:{" "}
                    <span className="font-semibold">
                      {analysis.financials.currentAsk}
                    </span>
                  </p>
                )}
                {analysis.financials.keyMetrics &&
                  analysis.financials.keyMetrics.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {analysis.financials.keyMetrics.map((m, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 rounded-lg bg-muted/50"
                        >
                          <p className="text-xs text-muted-foreground">
                            {m.label}
                          </p>
                          <p className="text-sm font-semibold">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
              </AnalysisCard>

              {/* Team */}
              <AnalysisCard title="Team">
                <div className="space-y-2">
                  {analysis.team.members.map((m, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${
                            ["#ff006e", "#8b5cf6", "#203eec", "#00d4ff"][i % 4]
                          }, ${
                            ["#8b5cf6", "#203eec", "#00d4ff", "#ff006e"][i % 4]
                          })`,
                        }}
                      >
                        {m.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AnalysisCard>
            </div>

            {/* Warnings */}
            {analysis.warnings && analysis.warnings.length > 0 && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400 mb-2">
                  Notes
                </p>
                <ul className="space-y-1">
                  {analysis.warnings.map((w, i) => (
                    <li
                      key={i}
                      className="text-sm text-yellow-600 dark:text-yellow-300 flex items-start gap-2"
                    >
                      <AlertCircle className="w-3 h-3 mt-1 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8"
                onClick={() => {
                  setStep("input")
                  setAnalysis(null)
                  setExtractedText(null)
                  setTranscription(null)
                  setUploadedFiles([])
                  setInputMethod(null)
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Start Over
              </Button>
              <Button
                size="lg"
                className="rounded-full px-8 text-white font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #203eec 100%)",
                  boxShadow:
                    "0 4px 24px rgba(255,0,110,0.3), 0 0 48px rgba(139,92,246,0.15)",
                }}
                onClick={generateDeck}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate My Pitch Deck
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ── Helper component ────────────────────────────────────────────────────

function AnalysisCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="p-5 rounded-2xl border border-border bg-card">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </h3>
      {children}
    </div>
  )
}
