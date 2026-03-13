import { NextRequest, NextResponse } from "next/server"
import {
  type AssetType,
  ASSET_TOKEN_COSTS,
  MONTHLY_TOKEN_ALLOCATION,
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

// In-memory store for demo purposes
// In production, this would use Supabase
const userAssets = new Map<string, { assets: GeneratedAsset[]; tokensUsed: number }>()

interface GeneratedAsset {
  id: string
  assetType: AssetType
  templateId: string
  prompt: string
  imageUrl: string
  width: number
  height: number
  createdAt: string
  brandColors: string[]
}

// GET: Fetch user's generated assets
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId") ?? "demo-user"
  const userData = userAssets.get(userId)

  return NextResponse.json({
    assets: userData?.assets ?? [],
    tokensUsed: userData?.tokensUsed ?? 0,
    tokensRemaining: MONTHLY_TOKEN_ALLOCATION - (userData?.tokensUsed ?? 0),
  })
}

// POST: Generate a new asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetType, templateId, prompt, brandColors, userId = "demo-user" } = body as {
      assetType: AssetType
      templateId: string
      prompt: string
      brandColors: string[]
      userId?: string
    }

    // Validate asset type
    if (!assetType || !ASSET_TOKEN_COSTS[assetType]) {
      return NextResponse.json({ error: "Invalid asset type" }, { status: 400 })
    }

    // Validate template
    const template = getTemplateById(templateId)
    if (!template) {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 })
    }

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Check token balance
    const userData = userAssets.get(userId) ?? { assets: [], tokensUsed: 0 }
    const cost = ASSET_TOKEN_COSTS[assetType]
    const remaining = MONTHLY_TOKEN_ALLOCATION - userData.tokensUsed

    if (remaining < cost) {
      return NextResponse.json(
        { error: `Insufficient tokens. Need ${cost}, have ${remaining}.` },
        { status: 402 },
      )
    }

    // Generate image via Gemini API (falls back to SVG placeholder when no API key)
    const brandType = ASSET_TYPE_TO_BRAND_TYPE[assetType]
    const imageUrl = await generateBrandAsset(brandType, prompt.trim(), {
      primary: brandColors?.[0],
      secondary: brandColors?.[1],
      accent: brandColors?.[2],
    })

    const asset: GeneratedAsset = {
      id: crypto.randomUUID(),
      assetType,
      templateId,
      prompt: prompt.trim(),
      imageUrl,
      width: template.width,
      height: template.height,
      createdAt: new Date().toISOString(),
      brandColors: brandColors ?? [],
    }

    // Deduct tokens and save
    userData.assets.unshift(asset)
    userData.tokensUsed += cost
    userAssets.set(userId, userData)

    return NextResponse.json({
      asset,
      tokensUsed: cost,
      tokensRemaining: MONTHLY_TOKEN_ALLOCATION - userData.tokensUsed,
    })
  } catch {
    return NextResponse.json({ error: "Asset generation failed" }, { status: 500 })
  }
}

