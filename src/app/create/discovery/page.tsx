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
  MessageSquare,
  Bot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AudioRecorder } from "@/components/onboarding/audio-recorder"
import { cn } from "@/lib/utils"
import {
  DISCOVERY_STEPS,
  type StepResponse,
  type BusinessDiscoverySummary,
  type StepAIResponse,
  type DiscoveryStepData,
} from "@/types/discovery"

const ACCEPTED_FILE_TYPES =
  ".pdf,.doc,.docx,.txt,.csv,.md,.png,.jpg,.jpeg,.webp,.gif"

type InputMode = "voice" | "text" | "upload" | null

// ── Summary Card Component ─────────────────────────────────────────────────

function SummaryCard({
  title,
  value,
  span = 1,
  onChange,
}: {
  title: string
  value: string
  span?: 1 | 2
  onChange: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 space-y-2",
        span === 2 && "md:col-span-2",
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">
          {title}
        </h3>
        <button
          onClick={() => {
            if (editing) {
              onChange(draft)
              setEditing(false)
            } else {
              setDraft(value)
              setEditing(true)
            }
          }}
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          <Edit3 className="w-3 h-3" />
          {editing ? "Save" : "Edit"}
        </button>
      </div>
      {editing ? (
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="resize-none text-sm"
        />
      ) : (
        <p className="text-sm leading-relaxed whitespace-pre-line">{value}</p>
      )}
    </div>
  )
}

// ── Main Discovery Page ────────────────────────────────────────────────────

export default function DiscoveryPage() {
  const router = useRouter()

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [stepResponses, setStepResponses] = useState<
    Record<number, StepResponse>
  >({})
  const [_stepData, _setStepData] = useState<Record<number, DiscoveryStepData>>({})
  const [aiResponses, setAiResponses] = useState<
    Record<number, StepAIResponse>
  >({})
  const [_summary, setSummary] = useState<BusinessDiscoverySummary | null>(null)
  const [editingSummary, setEditingSummary] =
    useState<BusinessDiscoverySummary | null>(null)

  // Per-step input state
  const [activeMode, setActiveMode] = useState<InputMode>(null)
  const [textInput, setTextInput] = useState("")
  const [transcription, setTranscription] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; extractedText: string }>
  >([])
  const [isDragging, setIsDragging] = useState(false)

  // Loading / error
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessingStep, setIsProcessingStep] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const stepConfig = DISCOVERY_STEPS[currentStep - 1]
  const totalSteps = DISCOVERY_STEPS.length
  const showSummary = currentStep > totalSteps
  const currentAiResponse = aiResponses[currentStep]

  // Keep lint happy for prefixed unused vars
  void _stepData
  void _summary

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

  // ── Submit current step to AI engine ──────────────────────────────────
  const submitStepToAI = useCallback(
    async (stepId: number, sid: string) => {
      setIsProcessingStep(true)
      try {
        const fileExtractions =
          uploadedFiles.length > 0 ? uploadedFiles : undefined

        const res = await fetch(`/api/discovery/step/${stepId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sid,
            text: textInput || undefined,
            transcript: transcription || undefined,
            fileExtractions,
          }),
        })

        const data = await res.json()

        if (data.success && data.ai) {
          setAiResponses((prev) => ({ ...prev, [stepId]: data.ai }))
          _setStepData((prev) => ({
            ...prev,
            [stepId]: {
              text: textInput || undefined,
              transcript: transcription || undefined,
              files: fileExtractions,
              aiExtraction: data.ai.extractedData,
              aiAcknowledgment: data.ai.acknowledgment,
              confidence: data.ai.stepConfidence,
            },
          }))
        }
      } catch (err) {
        console.error("Step AI processing failed:", err)
      } finally {
        setIsProcessingStep(false)
      }
    },
    [textInput, transcription, uploadedFiles],
  )

  // ── Save current step ─────────────────────────────────────────────────
  const saveCurrentStep = useCallback(async () => {
    const response: StepResponse = {
      stepId: currentStep,
      textInput: textInput || undefined,
      audioTranscription: transcription || undefined,
      uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    }

    const hasInput =
      response.textInput ||
      response.audioTranscription ||
      (response.uploadedFiles && response.uploadedFiles.length > 0)

    if (!hasInput) return

    setStepResponses((prev) => ({ ...prev, [currentStep]: response }))

    try {
      const sid = await ensureSession()
      await submitStepToAI(currentStep, sid)
    } catch {
      // Non-fatal
    }
  }, [currentStep, textInput, transcription, uploadedFiles, ensureSession, submitStepToAI])

  // ── Load step state when navigating ────────────────────────────────────
  const loadStepState = useCallback(
    (stepId: number) => {
      const existing = stepResponses[stepId]
      if (existing) {
        setTextInput(existing.textInput || "")
        setTranscription(existing.audioTranscription || null)
        setUploadedFiles(existing.uploadedFiles || [])
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
    [stepResponses],
  )

  // ── Generate summary ──────────────────────────────────────────────────
  const generateSummary = useCallback(async () => {
    setIsSummarizing(true)
    setError(null)

    const finalResponse: StepResponse = {
      stepId: currentStep,
      textInput: textInput || undefined,
      audioTranscription: transcription || undefined,
      uploadedFiles: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    }

    const allResponses = { ...stepResponses, [currentStep]: finalResponse }

    const formattedResponses: Record<
      string,
      {
        text?: string
        transcript?: string
        files?: Array<{ name: string; extractedText: string }>
        aiExtraction?: Record<string, string>
      }
    > = {}

    for (const [key, sr] of Object.entries(allResponses)) {
      const hasInput =
        sr.textInput ||
        sr.audioTranscription ||
        (sr.uploadedFiles && sr.uploadedFiles.length > 0)
      if (!hasInput) continue

      formattedResponses[key] = {
        text: sr.textInput,
        transcript: sr.audioTranscription,
        files: sr.uploadedFiles,
        aiExtraction: aiResponses[parseInt(key)]?.extractedData as Record<
          string,
          string
        >,
      }
    }

    try {
      const sid = await ensureSession()
      const res = await fetch("/api/discovery/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, responses: formattedResponses }),
      })

      const data = await res.json()

      if (!res.ok || !data.success || !data.summary) {
        throw new Error(data.error || "Summarization failed")
      }

      setSummary(data.summary)
      setEditingSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Summarization failed")
      setCurrentStep(totalSteps)
    } finally {
      setIsSummarizing(false)
    }
  }, [currentStep, textInput, transcription, uploadedFiles, stepResponses, aiResponses, totalSteps, ensureSession])

  // ── Navigation ────────────────────────────────────────────────────────
  const goNext = useCallback(async () => {
    await saveCurrentStep()
    if (currentStep < totalSteps) {
      const next = currentStep + 1
      setCurrentStep(next)
      loadStepState(next)
    } else {
      setCurrentStep(totalSteps + 1)
      await generateSummary()
    }
  }, [currentStep, totalSteps, saveCurrentStep, loadStepState, generateSummary])

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
  }, [currentStep, totalSteps, showSummary, saveCurrentStep, loadStepState])

  // ── Audio ─────────────────────────────────────────────────────────────
  const handleRecordingComplete = useCallback(async (blob: Blob) => {
    setIsTranscribing(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("audio", blob, "recording.webm")
      const res = await fetch("/api/discovery/voice", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Transcription failed")
      setTranscription(data.transcription?.text || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed")
    } finally {
      setIsTranscribing(false)
    }
  }, [])

  // ── File upload ───────────────────────────────────────────────────────
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return
    setIsUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      fileArray.forEach((f) => formData.append("files", f))
      const res = await fetch("/api/discovery/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Upload failed")
      const newFiles = data.files
        .filter((f: { extractedText?: string; success: boolean }) => f.success && f.extractedText?.trim())
        .map((f: { fileName: string; extractedText: string }) => ({ name: f.fileName, extractedText: f.extractedText }))
      setUploadedFiles((prev) => [...prev, ...newFiles])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }, [])

  // ── Drag and drop ─────────────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const onDragLeave = useCallback(() => { setIsDragging(false) }, [])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  // ── Confirm and generate deck ─────────────────────────────────────────
  const confirmAndGenerate = useCallback(async () => {
    if (!editingSummary) return
    setIsConfirming(true)
    setError(null)
    try {
      const confirmRes = await fetch("/api/discovery/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: editingSummary }),
      })
      const confirmData = await confirmRes.json()
      if (!confirmRes.ok || !confirmData.success) throw new Error(confirmData.error || "Confirmation failed")

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
      if (!genRes.ok || !genData.success || !genData.deckContent) throw new Error(genData.error || "Deck generation failed")

      sessionStorage.setItem("pitchdeck-content", JSON.stringify(genData.deckContent))
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

  const hasCurrentInput =
    textInput.trim().length > 0 ||
    (transcription && transcription.trim().length > 0) ||
    uploadedFiles.length > 0

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="font-bold text-lg tracking-tight"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #06b6d4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            pitchdeck.biz
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/create/quick" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Quick Upload
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Indicator — Stitch: numbered circles connected by lines */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              {showSummary ? "Review & Confirm" : `Step ${currentStep} of ${totalSteps}`}
            </span>
            {!showSummary && stepConfig && (
              <span className="text-sm font-semibold">{stepConfig.title}</span>
            )}
          </div>
          <div className="flex items-center w-full">
            {DISCOVERY_STEPS.map((s, idx) => {
              const isCompleted = s.id < currentStep || showSummary
              const isCurrent = s.id === currentStep && !showSummary
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  {/* Circle */}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shrink-0 border-2",
                      isCompleted
                        ? "border-transparent text-white"
                        : isCurrent
                        ? "border-transparent text-white"
                        : "border-border text-muted-foreground bg-background"
                    )}
                    style={
                      isCompleted
                        ? { background: "var(--brand-success)" }
                        : isCurrent
                        ? { background: "var(--brand-gradient-cta)" }
                        : undefined
                    }
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      s.id
                    )}
                  </div>
                  {/* Connecting line */}
                  {idx < DISCOVERY_STEPS.length - 1 && (
                    <div className="flex-1 h-[2px] mx-1.5 rounded-full overflow-hidden bg-border">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: isCompleted ? "100%" : isCurrent ? "50%" : "0%",
                          background: "linear-gradient(90deg, var(--brand-success), var(--brand-primary))",
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-8 flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Summarizing Spinner */}
        {isSummarizing && (
          <div className="flex flex-col items-center justify-center py-20 space-y-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full animate-spin" style={{ background: "conic-gradient(from 0deg, transparent, #ff006e, #8b5cf6, #203eec, transparent)" }} />
              <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Analyzing Your Responses...</h2>
              <p className="text-muted-foreground max-w-sm">Our AI is reviewing everything you shared and building a comprehensive business profile.</p>
            </div>
          </div>
        )}

        {/* Summary / Review */}
        {showSummary && !isSummarizing && editingSummary && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-4 border border-green-500/20">
                <CheckCircle2 className="w-4 h-4" />
                Discovery Complete
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">Here&apos;s What We Learned</h2>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">Review your business profile below. Edit anything that needs adjusting, then generate your deck.</p>
            </div>

            <div className="flex items-center gap-3 max-w-md mx-auto">
              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(editingSummary.confidence ?? 0.5) * 100}%`, background: "linear-gradient(90deg, #ff006e, #8b5cf6, #203eec)" }} />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{Math.round((editingSummary.confidence ?? 0.5) * 100)}% confidence</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SummaryCard title="Business Description" span={2} value={editingSummary.businessDescription} onChange={(v) => setEditingSummary((s) => s ? { ...s, businessDescription: v } : s)} />
              <SummaryCard title="Business Model" value={editingSummary.businessModel} onChange={(v) => setEditingSummary((s) => s ? { ...s, businessModel: v } : s)} />
              <SummaryCard title="Product / Service" value={editingSummary.product} onChange={(v) => setEditingSummary((s) => s ? { ...s, product: v } : s)} />
              <SummaryCard title="Target Market" value={editingSummary.market} onChange={(v) => setEditingSummary((s) => s ? { ...s, market: v } : s)} />
              <SummaryCard title="Unique Value" value={editingSummary.uniqueValue} onChange={(v) => setEditingSummary((s) => s ? { ...s, uniqueValue: v } : s)} />
              <SummaryCard title="Stage" value={editingSummary.stage} onChange={(v) => setEditingSummary((s) => s ? { ...s, stage: v } : s)} />
              <SummaryCard title="Team" value={editingSummary.teamSize} onChange={(v) => setEditingSummary((s) => s ? { ...s, teamSize: v } : s)} />
              <SummaryCard title="Investor Type" value={editingSummary.investorType} onChange={(v) => setEditingSummary((s) => s ? { ...s, investorType: v } : s)} />
              <SummaryCard title="Funding Amount" value={editingSummary.fundingAmount} onChange={(v) => setEditingSummary((s) => s ? { ...s, fundingAmount: v } : s)} />
              <SummaryCard title="Timeline" value={editingSummary.timeline} onChange={(v) => setEditingSummary((s) => s ? { ...s, timeline: v } : s)} />
              <SummaryCard title="Funding Source" value={editingSummary.fundingSource} onChange={(v) => setEditingSummary((s) => s ? { ...s, fundingSource: v } : s)} />
              {editingSummary.traction.length > 0 && (
                <SummaryCard title="Traction" span={2} value={editingSummary.traction.join("\n")} onChange={(v) => setEditingSummary((s) => s ? { ...s, traction: v.split("\n").filter((t) => t.trim()) } : s)} />
              )}
              {editingSummary.useOfFunds.length > 0 && (
                <SummaryCard title="Use of Funds" span={2} value={editingSummary.useOfFunds.join("\n")} onChange={(v) => setEditingSummary((s) => s ? { ...s, useOfFunds: v.split("\n").filter((t) => t.trim()) } : s)} />
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={goBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Back to Step 6</Button>
              <Button onClick={confirmAndGenerate} disabled={isConfirming || isGenerating} size="lg" className="gap-2 px-8" style={{ background: "var(--brand-gradient-cta)" }}>
                {isConfirming ? (<><Loader2 className="w-4 h-4 animate-spin" />{isGenerating ? "Generating Deck..." : "Preparing..."}</>) : (<><Sparkles className="w-4 h-4" />Generate My Pitch Deck</>)}
              </Button>
            </div>
          </div>
        )}

        {/* Step Content */}
        {!showSummary && !isSummarizing && stepConfig && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold">{stepConfig.question}</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">{stepConfig.description}</p>
            </div>

            {/* AI Response bubble */}
            {currentAiResponse && (
              <div className="relative rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm leading-relaxed">{currentAiResponse.acknowledgment}</p>
                    {currentAiResponse.followUpQuestions.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Consider adding:</p>
                        {currentAiResponse.followUpQuestions.map((q, i) => (
                          <p key={i} className="text-xs text-muted-foreground pl-3 border-l-2 border-primary/30">{q}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Input mode selector */}
            <div className="flex items-center justify-center gap-3">
              {stepConfig.inputTypes.includes("text") && (
                <Button variant={activeMode === "text" ? "default" : "outline"} onClick={() => setActiveMode(activeMode === "text" ? null : "text")} className="gap-2">
                  <PenLine className="w-4 h-4" />Type
                </Button>
              )}
              {stepConfig.inputTypes.includes("voice") && (
                <Button variant={activeMode === "voice" ? "default" : "outline"} onClick={() => setActiveMode(activeMode === "voice" ? null : "voice")} className="gap-2">
                  <Mic className="w-4 h-4" />Speak
                </Button>
              )}
              {stepConfig.inputTypes.includes("upload") && (
                <Button variant={activeMode === "upload" ? "default" : "outline"} onClick={() => setActiveMode(activeMode === "upload" ? null : "upload")} className="gap-2">
                  <CloudUpload className="w-4 h-4" />Upload
                </Button>
              )}
            </div>

            {/* Input areas */}
            <div className="space-y-6">
              {activeMode === "text" && (
                <div className="space-y-2">
                  <Textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder={`${stepConfig.description}...`} rows={5} className="resize-none text-base" />
                  {stepConfig.followUpQuestions && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {stepConfig.followUpQuestions.map((q, i) => (
                        <button key={i} onClick={() => setTextInput((prev) => prev ? `${prev}\n${q} ` : `${q} `)} className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors">{q}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeMode === "voice" && (
                <div className="flex flex-col items-center space-y-4">
                  <AudioRecorder onRecordingComplete={handleRecordingComplete} disabled={isTranscribing} />
                  {isTranscribing && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Transcribing your response...</div>
                  )}
                  {transcription && (
                    <div className="w-full rounded-lg border bg-muted/50 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><MessageSquare className="w-3 h-3" />Transcription</div>
                      <p className="text-sm leading-relaxed">{transcription}</p>
                    </div>
                  )}
                </div>
              )}

              {activeMode === "upload" && (
                <div
                  className={cn("border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer", isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}
                  onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-3"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="text-sm text-muted-foreground">Processing documents with AI...</p></div>
                  ) : (
                    <div className="flex flex-col items-center gap-3"><CloudUpload className="w-8 h-8 text-muted-foreground" /><div><p className="text-sm font-medium">Drag & drop files here, or click to browse</p><p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, CSV, images (up to 50 MB each)</p></div></div>
                  )}
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Uploaded Documents</p>
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm truncate flex-1">{f.name}</span>
                      <button onClick={() => setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isProcessingStep && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />AI is analyzing your response...</div>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={goBack} disabled={currentStep === 1} className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {!hasCurrentInput && currentStep < totalSteps && <span>You can skip this step</span>}
              </div>
              <Button onClick={goNext} disabled={isProcessingStep || isTranscribing || isUploading} className="gap-2" style={currentStep === totalSteps ? { background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #203eec 100%)" } : undefined}>
                {currentStep === totalSteps ? (<><Sparkles className="w-4 h-4" />Review Summary</>) : (<>Next<ArrowRight className="w-4 h-4" /></>)}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
