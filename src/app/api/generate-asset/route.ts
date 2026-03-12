import { NextRequest, NextResponse } from "next/server"
import {
  type AssetType,
  ASSET_TOKEN_COSTS,
  ASSET_TYPE_LABELS,
  MONTHLY_TOKEN_ALLOCATION,
} from "@/lib/tokens"
import { getTemplateById } from "@/lib/branding/templates"

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

    // TODO: Integrate with Gemini API for actual image generation
    // For now, generate a placeholder SVG
    const asset: GeneratedAsset = {
      id: crypto.randomUUID(),
      assetType,
      templateId,
      prompt: prompt.trim(),
      imageUrl: generatePlaceholderSvg(template.width, template.height, ASSET_TYPE_LABELS[assetType], brandColors),
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

function generatePlaceholderSvg(
  width: number,
  height: number,
  label: string,
  colors: string[] = [],
): string {
  const c1 = colors[0] ?? "#8b5cf6"
  const c2 = colors[1] ?? "#00d4ff"

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${c1};stop-opacity:0.2"/>
        <stop offset="100%" style="stop-color:${c2};stop-opacity:0.2"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="#0f0a1a"/>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <text x="50%" y="45%" text-anchor="middle" fill="${c1}" font-family="sans-serif" font-size="${Math.min(width, height) * 0.06}" font-weight="bold">${label}</text>
    <text x="50%" y="55%" text-anchor="middle" fill="#666" font-family="sans-serif" font-size="${Math.min(width, height) * 0.03}">${width}x${height} — AI Generated</text>
  </svg>`

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}
