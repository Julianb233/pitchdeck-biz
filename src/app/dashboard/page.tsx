"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Sparkles,
  AlertCircle,
  ImageIcon,
  Package,
  FileText,
  Palette,
  Upload,
  Loader2,
} from "lucide-react"
import { FileUploader, type UploadedFile } from "@/components/dashboard/file-uploader"
import { TokenUsage } from "@/components/dashboard/token-usage"
import {
  type AssetType,
  ASSET_TOKEN_COSTS,
  ASSET_TYPE_LABELS,
  MONTHLY_TOKEN_ALLOCATION,
} from "@/lib/tokens"
import {
  getTemplatesByCategory,
  type AssetTemplate,
} from "@/lib/branding/templates"

const ASSET_TYPE_ICONS: Record<AssetType, typeof ImageIcon> = {
  "social-media": ImageIcon,
  "product-mockup": Package,
  "marketing-collateral": FileText,
  "brand-identity": Palette,
}

const ASSET_TYPE_GRADIENTS: Record<AssetType, string> = {
  "social-media": "from-blue-500 to-cyan-400",
  "product-mockup": "from-purple-500 to-pink-400",
  "marketing-collateral": "from-orange-500 to-amber-400",
  "brand-identity": "from-emerald-500 to-teal-400",
}

export default function DashboardPage() {
  const [selectedType, setSelectedType] = useState<AssetType>("social-media")
  const [selectedTemplate, setSelectedTemplate] = useState<AssetTemplate | null>(null)
  const [prompt, setPrompt] = useState("")
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [tokensRemaining, setTokensRemaining] = useState(MONTHLY_TOKEN_ALLOCATION)
  const [error, setError] = useState<string | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [resetDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString()
  })

  const templates = getTemplatesByCategory(selectedType)

  // Auto-select first template when type changes
  useEffect(() => {
    const t = getTemplatesByCategory(selectedType)
    setSelectedTemplate(t[0] ?? null)
  }, [selectedType])

  const cost = ASSET_TOKEN_COSTS[selectedType]
  const canGenerate =
    !!selectedTemplate && prompt.trim().length > 0 && !isGenerating && tokensRemaining >= cost

  const handleGenerate = useCallback(async () => {
    if (!selectedTemplate || !prompt.trim()) return
    setError(null)
    setGeneratedImageUrl(null)
    setIsGenerating(true)

    try {
      const res = await fetch("/api/generate-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetType: selectedType,
          templateId: selectedTemplate.id,
          prompt: prompt.trim(),
          brandColors: ["#8b5cf6", "#ff006e", "#00d4ff", "#0f0a1a"],
          userId: "demo-user",
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Generation failed")
      }

      const data = await res.json()
      setGeneratedImageUrl(data.asset.image_url)
      setTokensRemaining(data.tokensRemaining)
      setPrompt("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsGenerating(false)
    }
  }, [selectedType, selectedTemplate, prompt])

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Asset Generator</h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Upload brand materials, pick a template, describe what you need, and let AI create it.
        </p>
      </div>

      {/* Token balance */}
      <TokenUsage tokensRemaining={tokensRemaining} resetDate={resetDate} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Main content */}
        <div className="space-y-8">
          {/* Step 1: Asset type */}
          <section>
            <StepLabel step={1} label="Choose Asset Type" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.keys(ASSET_TOKEN_COSTS) as AssetType[]).map((type) => {
                const Icon = ASSET_TYPE_ICONS[type]
                const isSelected = selectedType === type
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      isSelected
                        ? "border-[#8b5cf6] bg-[#8b5cf6]/10 text-white"
                        : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ASSET_TYPE_GRADIENTS[type]} flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-center">{ASSET_TYPE_LABELS[type]}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isSelected ? "bg-[#8b5cf6]/20 text-[#8b5cf6]" : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {ASSET_TOKEN_COSTS[type]} tokens
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Step 2: Template */}
          <section>
            <StepLabel step={2} label="Select Template" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`text-left rounded-xl border p-3 transition-all ${
                    selectedTemplate?.id === tmpl.id
                      ? "border-[#8b5cf6] bg-[#8b5cf6]/5"
                      : "border-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  <p className="text-sm font-medium text-zinc-200">{tmpl.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {tmpl.width} x {tmpl.height}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Step 3: Describe */}
          <section>
            <StepLabel step={3} label="Describe Your Asset" />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A modern tech startup social media post announcing a new AI feature with abstract geometric shapes..."
              rows={3}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-[#8b5cf6] focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] resize-none"
            />
          </section>

          {/* Step 4: Reference images */}
          <section>
            <StepLabel step={4} label="Upload Reference Images" optional />
            <FileUploader files={files} onFilesChange={setFiles} disabled={isGenerating} />
          </section>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed text-white hover:opacity-90"
            style={{
              background: canGenerate
                ? "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)"
                : undefined,
              backgroundColor: canGenerate ? undefined : "#27272a",
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Asset ({cost} tokens)
              </>
            )}
          </button>

          {tokensRemaining < cost && (
            <p className="text-xs text-red-400 text-center">
              Not enough tokens. Your balance resets on{" "}
              {new Date(resetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.
            </p>
          )}
        </div>

        {/* Preview sidebar */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-300">Preview</h3>
            </div>
            <div className="p-5">
              {isGenerating ? (
                <div className="aspect-video flex flex-col items-center justify-center bg-zinc-900 rounded-xl">
                  <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin mb-3" />
                  <p className="text-xs text-zinc-500">Generating...</p>
                </div>
              ) : generatedImageUrl ? (
                <div className="space-y-3">
                  <div className="aspect-video bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generatedImageUrl}
                      alt="Generated asset"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <a
                    href={generatedImageUrl}
                    download={`asset-${Date.now()}`}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                  >
                    <Upload className="w-4 h-4 rotate-180" />
                    Download Asset
                  </a>
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center bg-zinc-900 rounded-xl border border-dashed border-zinc-800">
                  <ImageIcon className="w-10 h-10 text-zinc-700 mb-2" />
                  <p className="text-xs text-zinc-600">Your generated asset will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick info */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-300">How it works</h3>
            <ol className="space-y-2 text-xs text-zinc-500">
              <li className="flex gap-2">
                <span className="text-[#8b5cf6] font-bold">1.</span>
                Choose an asset type and template size
              </li>
              <li className="flex gap-2">
                <span className="text-[#8b5cf6] font-bold">2.</span>
                Describe what you want in detail
              </li>
              <li className="flex gap-2">
                <span className="text-[#8b5cf6] font-bold">3.</span>
                Optionally upload reference images
              </li>
              <li className="flex gap-2">
                <span className="text-[#8b5cf6] font-bold">4.</span>
                AI generates your branded asset
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  )
}

function StepLabel({ step, label, optional }: { step: number; label: string; optional?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-6 h-6 rounded-full bg-[#8b5cf6] text-white text-xs font-bold flex items-center justify-center">
        {step}
      </span>
      <h2 className="text-sm font-semibold text-zinc-200">{label}</h2>
      {optional && <span className="text-xs text-zinc-600">(optional)</span>}
    </div>
  )
}
