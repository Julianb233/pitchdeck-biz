"use client"

import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Mic,
  FileText,
  CloudUpload,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
  PenLine,
  Edit3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AudioRecorder } from "@/components/onboarding/audio-recorder"
import { cn } from "@/lib/utils"
import {
  DISCOVERY_STEPS,
  type StepResponse,
  type BusinessDiscoverySummary,
} from "@/types/discovery"

const ACCEPTED_FILE_TYPES =
  ".pdf,.doc,.docx,.txt,.csv,.md,.png,.jpg,.jpeg,.webp,.gif"

type InputMode = "voice" | "text" | "upload" | null

export default function DiscoveryPage() {
  const router = useRouter()

  // ── Session state ──────────────────────────────────────────────────────
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [stepResponses, setStepResponses] = useState<
    Record<number, StepResponse>
  >({})
  const [summary, setSummary] = useState<BusinessDiscoverySummary | null>(null)
  const [editingSummary, setEditingSummary] =
    useState<BusinessDiscoverySummary | null>(null)

  // ── Per-step input state ───────────────────────────────────────────────
  const [activeMode, setActiveMode] = useState<InputMode>(null)
  const [textInput, setTextInput] = useState("")
  const [transcription, setTranscription] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; extractedText: string }>
  >([])
  const [isDragging, setIsDragging] = useState(false)

  // ── Loading / error ────────────────────────────────────────────────────
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const stepConfig = DISCOVERY_STEPS[currentStep - 1]
  const totalSteps = DISCOVERY_STEPS.length
  const showSummary = currentStep > totalSteps

  // ── Ensure session exists ──────────────────────────────────────────────
  const ensureSession = useCallback(async () => {
    if (sessionId) return sessionId
    const res = await fetch("/api/discovery", { method: "POST" })
    const data = await res.json()
    if (data.success && data.session) {
      setSessionId(data.session.id)
      return data.session.id as string
    }
    throw new Error("Failed to create discovery session")
  }, [sessionId])

  // ── Save current step ─────────────────────────────────────────────────
  const saveCurrentStep = useCallback(async () => {
    const response: StepResponse = {
      stepId: currentStep,
      textInput: textInput || undefined,
      audioTranscription: transcription || undefined,
      uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    }

    // Only save if there's some input
    const hasInput =
      response.textInput ||
      response.audioTranscription ||
      (response.uploadedFiles && response.uploadedFiles.length > 0)

    if (!hasInput) return

    setStepResponses((prev) => ({ ...prev, [currentStep]: response }))

    try {
      const sid = await ensureSession()
      await fetch("/api/discovery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, stepResponse: response }),
      })
    } catch {
      // Non-fatal — state is maintained client-side
    }
  }, [
    currentStep,
    textInput,
    transcription,
    uploadedFiles,
    ensureSession,
  ])

  // ── Load step state when navigating ────────────────────────────────────
  const loadStepState = useCallback(
    (stepId: number) => {
      const existing = stepResponses[stepId]
      if (existing) {
        setTextInput(existing.textInput || "")
        setTranscription(existing.audioTranscription || null)
        setUploadedFiles(existing.uploadedFiles || [])
        // Set active mode based on what data exists
        if (existing.audioTranscription) setActiveMode("voice")
        else if (existing.uploadedFiles && existing.uploadedFiles.length > 0)
          setActiveMode("upload")
        else if (existing.textInput) setActiveMode("text")
        else setActiveMode(null)
      } else {
        setTextInput("")
        setTranscription(null)
        setUploadedFiles([])
        setActiveMode(null)
      }
      setError(null)
    },
    [stepResponses]
  )

  // ── Navigation ────────────────────────────────────────────────────────
  const goNext = useCallback(async () => {
    await saveCurrentStep()
    if (currentStep < totalSteps) {
      const next = currentStep + 1
      setCurrentStep(next)
      loadStepState(next)
    } else {
      // All 6 steps done — go to summary
      setCurrentStep(totalSteps + 1)
      await generateSummary()
    }
  }, [currentStep, totalSteps, saveCurrentStep, loadStepState])

  const goBack = useCallback(async () => {
    if (showSummary) {
      setCurrentStep(totalSteps)
      loadStepState(totalSteps)
      setSummary(null)
      setEditingSummary(null)
    } else if (currentStep > 1) {
      await saveCurrentStep()
      const prev = currentStep - 1
      setCurrentStep(prev)
      loadStepState(prev)
    }
  }, [
    currentStep,
    totalSteps,
    showSummary,
    saveCurrentStep,
    loadStepState,
  ])

  // ── Audio recording handler ───────────────────────────────────────────
  const handleRecordingComplete = useCallback(async (blob: Blob) => {
    setIsTranscribing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("audio", blob, "recording.webm")

      const res = await fetch("/api/analysis/transcribe", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Transcription failed")
      }

      setTranscription(data.transcription?.text || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed")
    } finally {
      setIsTranscribing(false)
    }
  }, [])

  // ── File upload handler ───────────────────────────────────────────────
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      fileArray.forEach((f) => formData.append("files", f))

      const res = await fetch("/api/analysis/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed")
      }

      const newFiles = data.files
        .filter(
          (f: { extractedText?: string }) =>
            f.extractedText && f.extractedText.trim()
        )
        .map((f: { fileName: string; extractedText: string }) => ({
          name: f.fileName,
          extractedText: f.extractedText,
        }))

      setUploadedFiles((prev) => [...prev, ...newFiles])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }, [])

  // ── Drag and drop ─────────────────────────────────────────────────────
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
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  // ── Generate summary ──────────────────────────────────────────────────
  const generateSummary = useCallback(async () => {
    setIsSummarizing(true)
    setError(null)

    // Save the final step first
    const finalResponse: StepResponse = {
      stepId: currentStep,
      textInput: textInput || undefined,
      audioTranscription: transcription || undefined,
      uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    }

    const allResponses = {
      ...stepResponses,
      [currentStep]: finalResponse,
    }

    const stepsArray = Object.values(allResponses).filter(
      (s) => s.textInput || s.audioTranscription || (s.uploadedFiles && s.uploadedFiles.length > 0)
    )

    try {
      const res = await fetch("/api/discovery/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: stepsArray }),
      })

      const data = await res.json()

      if (!res.ok || !data.success || !data.summary) {
        throw new Error(data.error || "Summarization failed")
      }

      setSummary(data.summary)
      setEditingSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Summarization failed")
      // Go back to last step so user can retry
      setCurrentStep(totalSteps)
    } finally {
      setIsSummarizing(false)
    }
  }, [currentStep, textInput, transcription, uploadedFiles, stepResponses, totalSteps])

  // ── Confirm and generate deck ─────────────────────────────────────────
  const confirmAndGenerate = useCallback(async () => {
    if (!editingSummary) return

    setIsConfirming(true)
    setError(null)

    try {
      // Step 1: Confirm and get analysis
      const confirmRes = await fetch("/api/discovery/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: editingSummary }),
      })

      const confirmData = await confirmRes.json()

      if (!confirmRes.ok || !confirmData.success) {
        throw new Error(confirmData.error || "Confirmation failed")
      }

      // Step 2: Generate deck (pass investor type for tailored generation)
      setIsGenerating(true)

      const genRes = await fetch("/api/generate-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis: confirmData.analysis,
          analysis_id: confirmData.analysisId,
          investorType: confirmData.investorType,
        }),
      })

      const genData = await genRes.json()

      if (!genRes.ok || !genData.success || !genData.deckContent) {
        throw new Error(genData.error || "Deck generation failed")
      }

      sessionStorage.setItem(
        "pitchdeck-content",
        JSON.stringify(genData.deckContent)
      )

      const params = new URLSearchParams()
      if (genData.deckId) params.set("deck_id", genData.deckId)
      const qs = params.toString()
      router.push(`/create/preview${qs ? `?${qs}` : ""}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setIsConfirming(false)
      setIsGenerating(false)
    }
  }, [editingSummary, router])

  // ── Check if current step has input ────────────────────────────────────
  const hasCurrentInput =
    textInput.trim().length > 0 ||
    (transcription && transcription.trim().length > 0) ||
    uploadedFiles.length > 0

  // ── Check how many steps have responses ────────────────────────────────
  const completedSteps = Object.keys(stepResponses).length

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">
            pitch<span className="text-primary">deck</span>.biz
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/create"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Quick Upload
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* ── Progress Bar ─────────────────────────────────────────────── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              {showSummary
                ? "Review & Confirm"
                : `Step ${currentStep} of ${totalSteps}`}
            </span>
            {!showSummary && stepConfig && (
              <span className="text-sm font-semibold">{stepConfig.title}</span>
            )}
          </div>
          <div className="flex gap-1.5">
            {DISCOVERY_STEPS.map((s) => (
              <div
                key={s.id}
                className="flex-1 h-2 rounded-full overflow-hidden bg-muted"
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    s.id < currentStep
                      ? "w-full"
                      : s.id === currentStep && !showSummary
                        ? "w-1/2"
                        : showSummary
                          ? "w-full"
                          : "w-0"
                  )}
                  style={{
                    background:
                      "linear-gradient(90deg, #ff006e, #8b5cf6, #203eec)",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-8 flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Summarizing Spinner ────────────────────────────────────── */}
        {isSummarizing && (
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
                Analyzing Your Responses...
              </h2>
              <p className="text-muted-foreground max-w-sm">
                Our AI is reviewing everything you shared and building a
                comprehensive business profile.
              </p>
            </div>
          </div>
        )}

        {/* ── Summary / Step 7 ──────────────────────────────────────── */}
        {showSummary && !isSummarizing && editingSummary && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-4 border border-green-500/20">
                <CheckCircle2 className="w-4 h-4" />
                Discovery Complete
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Here&apos;s What We Learned
              </h2>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                Review your business profile below. Edit anything that needs
                adjusting, then generate your deck.
              </p>
            </div>

            {/* Confidence bar */}
            <div className="flex items-center gap-3 max-w-md mx-auto">
              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(editingSummary.confidence ?? 0.5) * 100}%`,
                    background:
                      "linear-gradient(90deg, #ff006e, #8b5cf6, #203eec)",
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {Math.round((editingSummary.confidence ?? 0.5) * 100)}%
                confidence
              </span>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Business Description */}
              <SummaryCard
                title="Business Description"
                span={2}
                value={editingSummary.businessDescription}
                onChange={(v) =>
                  setEditingSummary((s) =>
                    s ? { ...s, businessDescription: v } : s
                  )
                }
              />

              <SummaryCard
                title="Business Model"
                value={editingSummary.businessModel}
                onChange={(v) =>
                  setEditingSummary((s) =>
                    s ? { ...s, businessModel: v } : s
                  )
                }
              />

              <SummaryCard
                title="Product / Service"
                value={editingSummary.product}
                onChange={(v) =>
                  setEditingSummary((s) => (s ? { ...s, product: v } : s))
                }
              />

              <SummaryCard
                title="Target Market"
                value={editingSummary.market}
                onChange={(v) =>
                  setEditingSummary((s) => (s ? { ...s, market: v } : s))
                }
              />

              <SummaryCard
                title="Unique Value"
                value={editingSummary.uniqueValue}
                onChange={(v) =>
                  setEditingSummary((s) =>
                    s ? { ...s, uniqueValue: v } : s
                  )
                }
              />

              <SummaryCard
                title="Primary Goal"
                value={editingSummary.primaryGoal}
                onChange={(v) =>
                  setEditingSummary((s) =>
                    s ? { ...s, primaryGoal: v } : s
                  )
                }
              />

              <SummaryCard
                title="Investor Type"
                value={editingSummary.investorType}
                onChange={(v) =>
                  setEditingSummary((s) =>
                    s ? { ...s, investorType: v } : s
                  )
                }
              />

              <SummaryCard
                title="Funding Amount"
                value={editingSummary.fundingAmount}
                onChange={(v) =>
                  setEditingSummary((s) =>
                    s ? { ...s, fundingAmount: v } : s
                  )
                }
              />

              <SummaryCard
                title="Timeline"
                value={editingSummary.timeline}
                onChange={(v) =>
                  setEditingSummary((s) =>
                    s ? { ...s, timeline: v } : s
                  )
                }
              />

              <SummaryCard
                title="Stage"
                value={editingSummary.stage}
                onChange={(v) =>
                  setEditingSummary((s) => (s ? { ...s, stage: v } : s))
                }
              />

              <SummaryCard
                title="Team Size"
                value={editingSummary.teamSize}
                onChange={(v) =>
                  setEditingSummary((s) =>
                    s ? { ...s, teamSize: v } : s
                  )
                }
              />

              {/* Traction */}
              <div className="md:col-span-2 p-5 rounded-2xl border border-border bg-card">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  Traction & Metrics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {editingSummary.traction.map((t, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Use of Funds */}
              <div className="md:col-span-2 p-5 rounded-2xl border border-border bg-card">
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  Use of Funds
                </h3>
                <div className="flex flex-wrap gap-2">
                  {editingSummary.useOfFunds.map((u, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-muted text-sm"
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8"
                onClick={goBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Let Me Revise
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
                onClick={confirmAndGenerate}
                disabled={isConfirming || isGenerating}
              >
                {isConfirming || isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isGenerating ? "Generating Deck..." : "Confirming..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Looks Good — Generate My Deck!
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── Discovery Steps 1-6 ──────────────────────────────────── */}
        {!showSummary && !isSummarizing && stepConfig && (
          <div className="space-y-8">
            {/* Question */}
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #ff006e, #8b5cf6, #203eec)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {stepConfig.question}
                </span>
              </h1>
              <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-lg">
                {stepConfig.description}
              </p>
            </div>

            {/* Input mode selector */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {stepConfig.inputTypes.includes("voice") && (
                <button
                  onClick={() => setActiveMode("voice")}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all font-medium",
                    activeMode === "voice"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Mic className="w-5 h-5" />
                  Voice
                </button>
              )}
              {stepConfig.inputTypes.includes("text") && (
                <button
                  onClick={() => setActiveMode("text")}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all font-medium",
                    activeMode === "text"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <PenLine className="w-5 h-5" />
                  Type
                </button>
              )}
              {stepConfig.inputTypes.includes("upload") && (
                <button
                  onClick={() => setActiveMode("upload")}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all font-medium",
                    activeMode === "upload"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <CloudUpload className="w-5 h-5" />
                  Upload
                </button>
              )}
            </div>

            {/* ── Voice Input ────────────────────────────────────────── */}
            {activeMode === "voice" && (
              <div className="max-w-xl mx-auto">
                <div className="p-8 rounded-2xl border border-border bg-card">
                  <AudioRecorder
                    onRecordingComplete={handleRecordingComplete}
                    disabled={isTranscribing}
                  />
                </div>

                {isTranscribing && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transcribing your recording...
                  </div>
                )}

                {transcription && (
                  <div className="mt-4 p-4 rounded-xl border border-border bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                        Transcription
                      </span>
                      <button
                        onClick={() => setTranscription(null)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Re-record
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed">{transcription}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Text Input ─────────────────────────────────────────── */}
            {activeMode === "text" && (
              <div className="max-w-xl mx-auto">
                <Textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your response here... be as detailed as you like."
                  className="min-h-[160px] text-base rounded-2xl border-border bg-card resize-none"
                />

                {/* Follow-up suggestions */}
                {stepConfig.followUpQuestions &&
                  stepConfig.followUpQuestions.length > 0 &&
                  !textInput && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                        Not sure what to say? Try answering:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {stepConfig.followUpQuestions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => setTextInput(q + " ")}
                            className="px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* ── Upload Input ───────────────────────────────────────── */}
            {activeMode === "upload" && (
              <div className="max-w-xl mx-auto space-y-4">
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
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    ) : (
                      <CloudUpload className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <p className="font-semibold text-lg mb-1">
                    {isDragging
                      ? "Drop files here"
                      : isUploading
                        ? "Uploading..."
                        : "Drop files or click to browse"}
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
                        className="flex items-start gap-3 px-4 py-3 rounded-xl bg-muted/50 border border-border"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{f.name}</span>
                          {f.extractedText && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {f.extractedText.slice(0, 200)}...
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setUploadedFiles((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── No mode selected — show big mic prompt ─────────────── */}
            {activeMode === null && (
              <div className="max-w-xl mx-auto text-center">
                <button
                  onClick={() => setActiveMode("voice")}
                  className="group relative mx-auto"
                >
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all group-hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,0,110,0.1), rgba(139,92,246,0.1))",
                      border: "2px solid rgba(139,92,246,0.3)",
                    }}
                  >
                    <Mic className="w-12 h-12 text-primary" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Tap to speak, or choose an input method above
                  </p>
                </button>
              </div>
            )}

            {/* ── Collected inputs indicator ──────────────────────────── */}
            {(textInput || transcription || uploadedFiles.length > 0) &&
              activeMode !== null && (
                <div className="max-w-xl mx-auto flex flex-wrap gap-2">
                  {transcription && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs border border-green-500/20">
                      <Mic className="w-3 h-3" />
                      Voice recorded
                    </span>
                  )}
                  {textInput && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs border border-blue-500/20">
                      <PenLine className="w-3 h-3" />
                      Text added
                    </span>
                  )}
                  {uploadedFiles.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs border border-purple-500/20">
                      <FileText className="w-3 h-3" />
                      {uploadedFiles.length} file
                      {uploadedFiles.length > 1 ? "s" : ""} uploaded
                    </span>
                  )}
                </div>
              )}

            {/* ── Navigation buttons ────────────────────────────────── */}
            <div className="flex items-center justify-between max-w-xl mx-auto pt-4">
              <Button
                variant="outline"
                className="rounded-full px-6"
                onClick={goBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center gap-2">
                {!hasCurrentInput && currentStep < totalSteps && (
                  <Button
                    variant="ghost"
                    className="rounded-full px-6 text-muted-foreground"
                    onClick={async () => {
                      const next = currentStep + 1
                      setCurrentStep(next)
                      loadStepState(next)
                    }}
                  >
                    Skip
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}

                <Button
                  className="rounded-full px-8 text-white font-semibold"
                  style={{
                    background: hasCurrentInput
                      ? "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #203eec 100%)"
                      : undefined,
                    boxShadow: hasCurrentInput
                      ? "0 4px 24px rgba(255,0,110,0.2)"
                      : undefined,
                  }}
                  onClick={goNext}
                  disabled={!hasCurrentInput || isTranscribing || isUploading}
                >
                  {currentStep === totalSteps ? (
                    <>
                      Review Summary
                      <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* ── Follow-up questions (voice mode) ────────────────────── */}
            {activeMode === "voice" &&
              stepConfig.followUpQuestions &&
              !transcription && (
                <div className="max-w-xl mx-auto pt-2">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2 text-center">
                    Things to mention:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {stepConfig.followUpQuestions.map((q, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-muted/50 text-xs text-muted-foreground border border-border"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </main>
    </div>
  )
}

// ── Summary Card Component ────────────────────────────────────────────────

function SummaryCard({
  title,
  value,
  onChange,
  span = 1,
}: {
  title: string
  value: string
  onChange: (value: string) => void
  span?: 1 | 2
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  return (
    <div
      className={cn(
        "p-5 rounded-2xl border border-border bg-card group relative",
        span === 2 && "md:col-span-2"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <button
          onClick={() => {
            if (isEditing) {
              onChange(editValue)
              setIsEditing(false)
            } else {
              setEditValue(value)
              setIsEditing(true)
            }
          }}
          className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
        >
          {isEditing ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <Edit3 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      {isEditing ? (
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="min-h-[60px] text-sm rounded-lg resize-none"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onChange(editValue)
              setIsEditing(false)
            }
          }}
        />
      ) : (
        <p className="text-sm leading-relaxed">{value || "Not specified"}</p>
      )}
    </div>
  )
}
