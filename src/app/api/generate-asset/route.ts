import { NextRequest, NextResponse } from "next/server"
import {
  type AssetType,
  ASSET_TOKEN_COSTS,
  getTokenBalance,
  deductTokens,
} from "@/lib/tokens"
import { getTemplateById } from "@/lib/branding/templates"
import { generateBrandAsset } from "@/lib/ai/gemini-image"
import { createClient } from "@/lib/supabase/server"
import { saveAsset } from "@/lib/supabase/assets"

// Map API asset types to generateBrandAsset type parameter
const ASSET_TYPE_TO_BRAND_TYPE: Record<AssetType, "social" | "mockup" | "collateral" | "identity"> = {
  "social-media": "social",
  "product-mockup": "mockup",
  "marketing-collateral": "collateral",
  "brand-identity": "identity",
}

const VALID_ASSET_TYPES = new Set<string>(Object.keys(ASSET_TOKEN_COSTS))

/** Map a DB asset row to the client-facing shape */
function toClientAsset(row: {
  id: string
  user_id: string
  asset_type: string
  template_name: string | null
  prompt: string | null
  image_data: string | null
  brand_colors: unknown
  tokens_used: number
  created_at: string
}) {
  const template = row.template_name ? getTemplateById(row.template_name) : null
  const brandColors = Array.isArray(row.brand_colors) ? row.brand_colors as string[] : []
  return {
    id: row.id,
    user_id: row.user_id,
    type: row.asset_type,
    template: row.template_name,
    prompt: row.prompt,
    image_url: row.image_data,
    tokens_cost: row.tokens_used,
    created_at: row.created_at,
    width: template?.width ?? 0,
    height: template?.height ?? 0,
    brand_colors: brandColors,
  }
}

// ── GET: Fetch user's generated assets ──────────────────────────────────────

export async function GET(request: NextRequest) {
  // Authenticate from session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fall back to query param for backward compat
  const userId = user?.id ?? request.nextUrl.searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10))
  const limit = Math.min(50, Math.max(1, parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10)))
  const typeFilter = request.nextUrl.searchParams.get("type")
  const offset = (page - 1) * limit

  try {
    // Build count query
    let countQuery = supabase
      .from("assets")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    if (typeFilter && VALID_ASSET_TYPES.has(typeFilter)) {
      countQuery = countQuery.eq("asset_type", typeFilter)
    }

    const { count } = await countQuery

    const total = count ?? 0
    const totalPages = Math.max(1, Math.ceil(total / limit))

    // Build data query
    let dataQuery = supabase
      .from("assets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (typeFilter && VALID_ASSET_TYPES.has(typeFilter)) {
      dataQuery = dataQuery.eq("asset_type", typeFilter)
    }

    const { data: rows, error } = await dataQuery

    if (error) throw error

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assets = (rows ?? []).map((row: any) => toClientAsset(row))

    const balance = await getTokenBalance(userId)

    return NextResponse.json({
      assets,
      pagination: { page, limit, total, totalPages },
      tokensUsed: balance.tokens_used,
      tokensRemaining: balance.token_balance,
    })
  } catch {
    // Return empty on error
    const balance = await getTokenBalance(userId)
    return NextResponse.json({
      assets: [],
      pagination: { page, limit, total: 0, totalPages: 1 },
      tokensUsed: balance.tokens_used,
      tokensRemaining: balance.token_balance,
    })
  }
}

// ── POST: Generate a new asset ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Authenticate from session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { assetType, templateId, prompt, brandColors, userId: bodyUserId, referenceImages } = body as {
      assetType?: string
      templateId?: string
      prompt?: string
      brandColors?: string[]
      userId?: string
      referenceImages?: string[]
    }

    // Use authenticated user ID, fall back to body for backward compat
    const userId = user?.id ?? bodyUserId
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // ── Input validation ──────────────────────────────────────────────────

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

    const deductResult = await deductTokens(userId, cost)
    if (!deductResult) {
      const balance = await getTokenBalance(userId)
      return NextResponse.json(
        { error: `Insufficient tokens. Need ${cost}, have ${balance.token_balance}.` },
        { status: 402 },
      )
    }

    // ── Generate image ────────────────────────────────────────────────────

    const brandType = ASSET_TYPE_TO_BRAND_TYPE[validAssetType]

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

    // ── Save asset to Supabase ────────────────────────────────────────────

    // Look up active subscription ID for the user
    const { data: activeSub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle()

    const savedAsset = await saveAsset(
      userId,
      activeSub?.id ?? null,
      validAssetType,
      templateId,
      prompt.trim(),
      imageUrl,
      cost,
      validatedColors,
    )

    const clientAsset = savedAsset
      ? toClientAsset(savedAsset)
      : {
          id: crypto.randomUUID(),
          user_id: userId,
          type: validAssetType,
          template: templateId,
          prompt: prompt.trim(),
          image_url: imageUrl,
          tokens_cost: cost,
          created_at: new Date().toISOString(),
          width: template.width,
          height: template.height,
          brand_colors: validatedColors,
        }

    return NextResponse.json({
      asset: clientAsset,
      tokensUsed: cost,
      tokensRemaining: deductResult.token_balance,
    })
  } catch {
    return NextResponse.json({ error: "Asset generation failed" }, { status: 500 })
  }
}
