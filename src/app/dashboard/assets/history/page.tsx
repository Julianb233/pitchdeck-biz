"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import {
  ArrowLeft,
  Download,
  Filter,
  Share2,
  Package,
  FileText,
  Palette,
  ImageIcon,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import {
  type AssetType,
  ASSET_TOKEN_COSTS,
  ASSET_TYPE_LABELS,
} from "@/lib/tokens"

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

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

const ASSET_TYPE_ICONS: Record<AssetType, typeof Share2> = {
  "social-media": Share2,
  "product-mockup": Package,
  "marketing-collateral": FileText,
  "brand-identity": Palette,
}

type ViewMode = "grid" | "table"

const PAGE_SIZE = 20

// ── Page Component ─────────────────────────────────────────────────────────

export default function AssetHistoryPage() {
  const [assets, setAssets] = useState<AssetRecord[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  })
  const [typeFilter, setTypeFilter] = useState<AssetType | "all">("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  const loadAssets = useCallback(async (page: number, type: AssetType | "all") => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        userId: "demo-user",
        page: String(page),
        limit: String(PAGE_SIZE),
      })
      if (type !== "all") {
        params.set("type", type)
      }

      const res = await fetch(`/api/generate-asset?${params}`)
      if (res.ok) {
        const data = await res.json()
        setAssets(data.assets || [])
        if (data.pagination) {
          setPagination(data.pagination)
        }
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAssets(1, typeFilter)
  }, [loadAssets, typeFilter])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return
    setSelectedIds(new Set())
    loadAssets(newPage, typeFilter)
  }

  const handleTypeFilterChange = (type: AssetType | "all") => {
    setTypeFilter(type)
    setSelectedIds(new Set())
  }

  // ── Monthly Usage Chart Data ─────────────────────────────────────────────

  const usageByType = useMemo(() => {
    const counts: Record<AssetType, number> = {
      "social-media": 0,
      "product-mockup": 0,
      "marketing-collateral": 0,
      "brand-identity": 0,
    }

    for (const asset of assets) {
      const assetType = asset.type as AssetType
      if (assetType in counts) {
        counts[assetType] += asset.tokens_cost
      }
    }

    return counts
  }, [assets])

  const maxUsage = Math.max(...Object.values(usageByType), 1)

  // ── Selection ────────────────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === assets.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(assets.map((a) => a.id)))
    }
  }

  const handleBulkDownload = () => {
    const selected = assets.filter((a) => selectedIds.has(a.id))
    for (const asset of selected) {
      if (!asset.image_url) continue
      const link = document.createElement("a")
      link.href = asset.image_url
      link.download = `${asset.template ?? "asset"}-${asset.id.slice(0, 8)}`
      link.click()
    }
  }

  // ── Bar colors ───────────────────────────────────────────────────────────

  const barColors: Record<AssetType, string> = {
    "social-media": "#8b5cf6",
    "product-mockup": "#ff006e",
    "marketing-collateral": "#00d4ff",
    "brand-identity": "#22c55e",
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/assets"
            className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Asset History</h1>
            <p className="text-sm text-zinc-500">
              {pagination.total} asset{pagination.total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkDownload}
            className="flex items-center gap-2 rounded-xl bg-[#8b5cf6] px-4 py-2 text-sm font-medium text-white hover:bg-[#7c3aed] transition-colors"
          >
            <Download className="w-4 h-4" />
            Download {selectedIds.size} selected
          </button>
        )}
      </div>

      {/* Monthly Usage Chart */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Token Usage by Type
        </h2>
        <div className="space-y-3">
          {(Object.keys(usageByType) as AssetType[]).map((type) => {
            const tokens = usageByType[type]
            const pct = (tokens / maxUsage) * 100
            return (
              <div key={type} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-36 shrink-0">
                  {ASSET_TYPE_LABELS[type]}
                </span>
                <div className="flex-1 h-6 bg-zinc-800 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-500"
                    style={{
                      width: `${Math.max(pct, tokens > 0 ? 2 : 0)}%`,
                      backgroundColor: barColors[type],
                    }}
                  />
                </div>
                <span className="text-xs text-zinc-500 w-16 text-right">
                  {tokens} tokens
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 text-sm text-zinc-500">
          <Filter className="w-4 h-4" />
          Filter:
        </div>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => handleTypeFilterChange(e.target.value as AssetType | "all")}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300 focus:border-[#8b5cf6] focus:outline-none"
        >
          <option value="all">All Types</option>
          {(Object.keys(ASSET_TOKEN_COSTS) as AssetType[]).map((type) => (
            <option key={type} value={type}>
              {ASSET_TYPE_LABELS[type]}
            </option>
          ))}
        </select>

        {/* View mode */}
        <div className="ml-auto flex items-center gap-1 rounded-lg border border-zinc-800 p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-zinc-700 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === "table"
                ? "bg-zinc-700 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Select All */}
      {assets.length > 0 && (
        <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedIds.size === assets.length && assets.length > 0}
            onChange={selectAll}
            className="rounded border-zinc-700"
          />
          Select all ({assets.length})
        </label>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </div>
      )}

      {/* Grid View */}
      {!isLoading && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset) => {
            const assetType = asset.type as AssetType
            const Icon = ASSET_TYPE_ICONS[assetType] ?? ImageIcon
            const isSelected = selectedIds.has(asset.id)
            const imageUrl = asset.image_url ?? ""
            return (
              <div
                key={asset.id}
                className={`rounded-2xl border overflow-hidden group cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#8b5cf6] bg-[#8b5cf6]/5"
                    : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-600"
                }`}
                onClick={() => toggleSelect(asset.id)}
              >
                <div className="relative aspect-video bg-zinc-900 flex items-center justify-center overflow-hidden">
                  {imageUrl.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={asset.prompt ?? ""}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-zinc-700" />
                  )}
                  <a
                    href={imageUrl}
                    download={`${asset.template ?? "asset"}-${asset.id.slice(0, 8)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </a>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                      <Icon className="w-3 h-3" />
                      {ASSET_TYPE_LABELS[assetType] ?? asset.type}
                    </span>
                    <span className="text-xs text-zinc-600">
                      {asset.tokens_cost} tokens
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1">{asset.prompt}</p>
                  <p className="text-xs text-zinc-600 mt-1">
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
      )}

      {/* Table View */}
      {!isLoading && viewMode === "table" && (
        <div className="rounded-2xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === assets.length && assets.length > 0}
                    onChange={selectAll}
                    className="rounded border-zinc-700"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Preview</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Prompt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Tokens</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {assets.map((asset) => {
                const assetType = asset.type as AssetType
                const Icon = ASSET_TYPE_ICONS[assetType] ?? ImageIcon
                const imageUrl = asset.image_url ?? ""
                return (
                  <tr
                    key={asset.id}
                    className={`transition-colors ${
                      selectedIds.has(asset.id) ? "bg-[#8b5cf6]/5" : "hover:bg-zinc-900/50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(asset.id)}
                        onChange={() => toggleSelect(asset.id)}
                        className="rounded border-zinc-700"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-12 h-8 rounded bg-zinc-800 flex items-center justify-center overflow-hidden">
                        {imageUrl.startsWith("data:") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-zinc-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-zinc-300">
                        <Icon className="w-3.5 h-3.5 text-zinc-500" />
                        {ASSET_TYPE_LABELS[assetType] ?? asset.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-zinc-400 max-w-xs truncate">{asset.prompt}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {asset.tokens_cost}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(asset.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={imageUrl}
                        download={`${asset.template ?? "asset"}-${asset.id.slice(0, 8)}`}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="flex items-center gap-1 rounded-lg border border-zinc-800 px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-zinc-500 px-3">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="flex items-center gap-1 rounded-lg border border-zinc-800 px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && assets.length === 0 && (
        <div className="text-center py-16">
          <ImageIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">No assets found</p>
          <p className="text-sm text-zinc-600 mt-1">
            {typeFilter !== "all"
              ? "Try adjusting your filters"
              : "Generate your first asset to see it here"}
          </p>
        </div>
      )}
    </div>
  )
}
