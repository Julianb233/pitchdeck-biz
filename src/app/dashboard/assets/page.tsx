"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import {
  Share2,
  Package,
  FileText,
  Palette,
  Sparkles,
  Download,
  Clock,
  Loader2,
  ChevronRight,
  ImageIcon,
} from "lucide-react"
import { TokenUsage } from "@/components/dashboard/token-usage"
import { FileUploader, type UploadedFile } from "@/components/dashboard/file-uploader"
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

// ── Types ──────────────────────────────────────────────────────────────────

interface AssetRecord {
  id: string
  user_id: string
  type: string
  template: string | null
  prompt: string | null
  image_url: string | null
  tokens_cost: number
  created_at: string
  width: number
  height: number
  brand_colors: string[]
}

const ASSET_TYPE_ICONS: Record<AssetType, typeof Share2> = {
  "social-media": Share2,
  "product-mockup": Package,
  "marketing-collateral": FileText,
  "brand-identity": Palette,
}

const DEFAULT_BRAND_COLORS = ["#8b5cf6", "#ff006e", "#00d4ff", "#0f0a1a"]

// ── Page Component ─────────────────────────────────────────────────────────

export default function AssetsPage() {
  const [selectedType, setSelectedType] = useState<AssetType>("social-media")
  const [selectedTemplate, setSelectedTemplate] = useState<AssetTemplate | null>(null)
  const [prompt, setPrompt] = useState("")
  const [brandColors, setBrandColors] = useState<string[]>(DEFAULT_BRAND_COLORS)
  const [referenceFiles, setReferenceFiles] = useState<UploadedFile[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [assets, setAssets] = useState<AssetRecord[]>([])
  const [tokensRemaining, setTokensRemaining] = useState(MONTHLY_TOKEN_ALLOCATION)
  const [userId, setUserId] = useState<string | null>(null)
  const [resetDate, setResetDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString()
  })

  const templates = getTemplatesByCategory(selectedType)

  // Get current user ID from Supabase
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  // Auto-select first template when type changes
  useEffect(() => {
    const t = getTemplatesByCategory(selectedType)
    setSelectedTemplate(t[0] || null)
  }, [selectedType])

  // Load existing assets
  const loadAssets = useCallback(async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/generate-asset?userId=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setAssets(data.assets || [])
        if (typeof data.tokensRemaining === "number") {
          setTokensRemaining(data.tokensRemaining)
        }
      }
    } catch {
      // silent fail on load
    }
  }, [userId])

  useEffect(() => {
    if (userId) loadAssets()
  }, [loadAssets, userId])

  const handleGenerate = async () => {
    if (!selectedTemplate || !prompt.trim()) return

    setIsGenerating(true)
    try {
      // Convert reference files to base64 data URIs for the API
      const referenceImageDataUris: string[] = []
      for (const uploadedFile of referenceFiles) {
        if (uploadedFile.file.type !== "image/svg+xml") {
          const dataUri = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(uploadedFile.file)
          })
          referenceImageDataUris.push(dataUri)
        }
      }

      const res = await fetch("/api/generate-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetType: selectedType,
          templateId: selectedTemplate.id,
          prompt: prompt.trim(),
          brandColors,
          userId: "demo-user",
          referenceImages: referenceImageDataUris,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error || "Generation failed")
        return
      }

      const data = await res.json()
      setAssets((prev) => [data.asset, ...prev])
      setTokensRemaining(data.tokensRemaining)
      setPrompt("")
    } catch {
      alert("Failed to generate asset. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const cost = ASSET_TOKEN_COSTS[selectedType]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branding Assets</h1>
          <p className="text-zinc-400 mt-1">
            Generate professional branding assets with AI
          </p>
        </div>
        <Link
          href="/dashboard/assets/history"
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <Clock className="w-4 h-4" />
          History
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Token Balance */}
      <TokenUsage tokensRemaining={tokensRemaining} resetDate={resetDate} />

      {/* Generate New Asset Section */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
          Generate New Asset
        </h2>

        {/* Asset Type Selector */}
        <div>
          <label className="text-sm font-medium text-zinc-300 block mb-3">
            Asset Type
          </label>
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
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium text-center">
                    {ASSET_TYPE_LABELS[type]}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-[#8b5cf6]/20 text-[#8b5cf6]"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {ASSET_TOKEN_COSTS[type]} tokens
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Template Selector */}
        <div>
          <label className="text-sm font-medium text-zinc-300 block mb-3">
            Template
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {templates.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`text-left rounded-lg border p-3 transition-all ${
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
        </div>

        {/* Prompt Input */}
        <div>
          <label className="text-sm font-medium text-zinc-300 block mb-2">
            Describe your asset
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A modern tech startup social media post announcing a new AI feature launch with abstract geometric shapes..."
            rows={3}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-[#8b5cf6] focus:outline-none focus:ring-1 focus:ring-[#8b5cf6] resize-none"
          />
        </div>

        {/* Reference Image Upload */}
        <div>
          <label className="text-sm font-medium text-zinc-300 block mb-2">
            Reference Image (optional)
          </label>
          <FileUploader
            files={referenceFiles}
            onFilesChange={setReferenceFiles}
            disabled={isGenerating}
          />
        </div>

        {/* Brand Colors */}
        <div>
          <label className="text-sm font-medium text-zinc-300 block mb-2">
            Brand Colors
          </label>
          <div className="flex items-center gap-3">
            {brandColors.map((color, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    const updated = [...brandColors]
                    updated[i] = e.target.value
                    setBrandColors(updated)
                  }}
                  className="w-8 h-8 rounded-lg border border-zinc-700 cursor-pointer bg-transparent"
                />
                <span className="text-xs text-zinc-500 font-mono">{color}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim() || !selectedTemplate || tokensRemaining < cost}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff006e] via-[#8b5cf6] to-[#00d4ff] px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate ({cost} tokens)
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

      {/* Generated Assets Gallery */}
      {assets.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Generated Assets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset) => {
              const assetType = asset.type as AssetType
              const Icon = ASSET_TYPE_ICONS[assetType] ?? ImageIcon
              const imageUrl = asset.image_url ?? ""
              return (
                <div
                  key={asset.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden group"
                >
                  {/* Preview */}
                  <div className="relative aspect-video bg-zinc-900 flex items-center justify-center overflow-hidden">
                    {imageUrl.startsWith("data:") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={asset.prompt ?? ""}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-zinc-700" />
                    )}
                    {/* Download overlay */}
                    <a
                      href={imageUrl}
                      download={`${asset.template ?? "asset"}-${asset.id.slice(0, 8)}`}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="w-8 h-8 text-white" />
                    </a>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6]">
                        <Icon className="w-3 h-3" />
                        {ASSET_TYPE_LABELS[assetType] ?? asset.type}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 line-clamp-2">
                      {asset.prompt}
                    </p>
                    <p className="text-xs text-zinc-500 mt-2">
                      {new Date(asset.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {assets.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-800">
          <ImageIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">No assets generated yet</p>
          <p className="text-sm text-zinc-600 mt-1">
            Use the form above to create your first branding asset
          </p>
        </div>
      )}
    </div>
  )
}
