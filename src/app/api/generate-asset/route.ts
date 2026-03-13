import { NextRequest, NextResponse } from "next/server"
import type { Database } from "@/lib/supabase/types"
import {
  type AssetType,
  ASSET_TOKEN_COSTS,
  getTokenBalance,
  deductTokens,
} from "@/lib/tokens"
import { getTemplateById } from "@/lib/branding/templates"
import { generateBrandAsset } from "@/lib/ai/gemini-image"

// Map API asset types to generateBrandAsset type parameter
const ASSET_TYPE_TO_BRAND_TYPE: Record<AssetType, "social" | "mockup" | "collateral" | "identity"> = {
  "social-media": "social",
  "product-mockup": "mockup",
  "marketing-collateral": "collateral",
  "brand-identity": "identity",
}

const VALID_ASSET_TYPES = new Set<string>(Object.keys(ASSET_TOKEN_COSTS))

// ── In-memory asset store matching assets table schema ──────────────────────

type AssetRow = Database["public"]["Tables"]["assets"]["Row"]

interface StoredAsset extends AssetRow {
  // Extra fields for client display (not persisted to DB)
  width: number
  height: number
  brand_colors: string[]
}

const assetStore = new Map<string, StoredAsset[]>()

function getAssetsForUser(userId: string): StoredAsset[] {
  return assetStore.get(userId) ?? []
}

// ── GET: Fetch user's generated assets ──────────────────────────────────────

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 })
  }

  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10)))
  const typeFilter = request.nextUrl.searchParams.get("type")

  let assets = getAssetsForUser(userId)

  // Filter by type if provided
  if (typeFilter && VALID_ASSET_TYPES.has(typeFilter)) {
    assets = assets.filter((a) => a.asset_type === typeFilter)
  }

  const total = assets.length
  const totalPages = Math.max(1, Math.ceil(total / limit))
  const offset = (page - 1) * limit
  const paginatedAssets = assets.slice(offset, offset + limit)

  const balance = getTokenBalance(userId)

  return NextResponse.json({
    assets: paginatedAssets,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    tokensUsed: balance.tokens_used,
    tokensRemaining: balance.token_balance,
  })
}

// ── POST: Generate a new asset ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetType, templateId, prompt, brandColors, userId, referenceImages } = body as {
      assetType?: string
      templateId?: string
      prompt?: string
      brandColors?: string[]
      userId?: string
      referenceImages?: string[]
    }

    // ── Input validation ──────────────────────────────────────────────────

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    if (!assetType || !VALID_ASSET_TYPES.has(assetType)) {
      return NextResponse.json(
        { error: `Invalid asset type. Must be one of: ${[...VALID_ASSET_TYPES].join(", ")}` },
        { status: 400 },
      )
    }

    if (!templateId || typeof templateId !== "string") {
      return NextResponse.json({ error: "templateId is required" }, { status: 400 })
    }

    const template = getTemplateById(templateId)
    if (!template) {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 })
    }

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (prompt.trim().length > 2000) {
      return NextResponse.json({ error: "Prompt must be 2000 characters or less" }, { status: 400 })
    }

    const validatedColors = Array.isArray(brandColors)
      ? brandColors.filter((c): c is string => typeof c === "string" && /^#[0-9a-fA-F]{6}$/.test(c)).slice(0, 6)
      : []

    // ── Token check ───────────────────────────────────────────────────────

    const validAssetType = assetType as AssetType
    const cost = ASSET_TOKEN_COSTS[validAssetType]

    const deductResult = deductTokens(userId, cost)
    if (!deductResult) {
      const balance = getTokenBalance(userId)
      return NextResponse.json(
        { error: `Insufficient tokens. Need ${cost}, have ${balance.token_balance}.` },
        { status: 402 },
      )
    }

    // ── Generate image ────────────────────────────────────────────────────

    const brandType = ASSET_TYPE_TO_BRAND_TYPE[validAssetType]

    // Validate and limit reference images (max 3, must be data URIs)
    const validReferenceImages = Array.isArray(referenceImages)
      ? referenceImages
          .filter((img): img is string => typeof img === "string" && img.startsWith("data:image/"))
          .slice(0, 3)
      : []

    const imageUrl = await generateBrandAsset(brandType, prompt.trim(), {
      primary: validatedColors[0],
      secondary: validatedColors[1],
      accent: validatedColors[2],
    }, validReferenceImages, templateId)

    // ── Store asset matching DB schema ─────────────────────────────────────

    const asset: StoredAsset = {
      id: crypto.randomUUID(),
      user_id: userId,
      subscription_id: null,
      asset_type: validAssetType,
      template_name: templateId,
      prompt: prompt.trim(),
      image_data: imageUrl,
      tokens_used: cost,
      created_at: new Date().toISOString(),
      // Extra display fields
      width: template.width,
      height: template.height,
      brand_colors: validatedColors,
    }

    const userAssets = assetStore.get(userId) ?? []
    userAssets.unshift(asset)
    assetStore.set(userId, userAssets)

    return NextResponse.json({
      asset,
      tokensUsed: cost,
      tokensRemaining: deductResult.token_balance,
    })
  } catch {
    return NextResponse.json({ error: "Asset generation failed" }, { status: 500 })
  }
}
