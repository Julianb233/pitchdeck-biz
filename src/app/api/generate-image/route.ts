import { NextRequest, NextResponse } from "next/server";
import {
  generateImage,
  generateDeckGraphic,
  generateBrandAsset,
  generateColorScheme,
  generateHeroImage,
  type ImagePurpose,
} from "@/lib/ai/image-service";
import { generateImageLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// POST /api/generate-image
// Accepts: { action, prompt, style, colors, type, brandColors, purpose,
//            referenceImages, aspectRatio, industry, mood }
// Returns: { image?: string, colors?: object, model?: string, error?: string }
// ---------------------------------------------------------------------------

const VALID_PURPOSES = new Set<string>([
  "slide-graphic",
  "hero-image",
  "brand-asset",
  "social-media",
  "mockup",
]);

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limited = applyRateLimit(generateImageLimiter, ip, "Rate limit exceeded. Please wait a moment and try again.");
    if (limited) return limited;

    const body = await request.json();
    const { action } = body;

    switch (action) {
      // ── New unified image generation endpoint ─────────────────────────
      case "generate": {
        const { purpose, prompt, brandColors, referenceImages, aspectRatio, style, templateId, brandName } = body;
        if (!purpose || !VALID_PURPOSES.has(purpose)) {
          return NextResponse.json(
            { error: `Invalid purpose. Must be one of: ${[...VALID_PURPOSES].join(", ")}` },
            { status: 400 },
          );
        }
        if (!prompt) {
          return NextResponse.json(
            { error: "Missing required field: prompt" },
            { status: 400 },
          );
        }
        const result = await generateImage({
          purpose: purpose as ImagePurpose,
          prompt,
          brandColors,
          referenceImages,
          aspectRatio,
          style,
          templateId,
          brandName,
        });
        return NextResponse.json({ image: result.imageData, model: result.model, mimeType: result.mimeType });
      }

      // ── Hero image generation ─────────────────────────────────────────
      case "hero-image": {
        const { prompt, aspectRatio, brandColors, style } = body;
        if (!prompt) {
          return NextResponse.json(
            { error: "Missing required field: prompt" },
            { status: 400 },
          );
        }
        const result = await generateHeroImage(prompt, { aspectRatio, brandColors, style });
        return NextResponse.json({ image: result.imageData, model: result.model, mimeType: result.mimeType });
      }

      // ── Legacy: deck graphic generation ───────────────────────────────
      case "deck-graphic": {
        const { prompt, style, colors } = body;
        if (!prompt || !style || !colors?.primary || !colors?.secondary) {
          return NextResponse.json(
            { error: "Missing required fields: prompt, style, colors.primary, colors.secondary" },
            { status: 400 },
          );
        }
        const image = await generateDeckGraphic(prompt, style, colors);
        return NextResponse.json({ image });
      }

      // ── Legacy: brand asset generation ────────────────────────────────
      case "brand-asset": {
        const { type, prompt, brandColors } = body;
        if (!type || !prompt) {
          return NextResponse.json(
            { error: "Missing required fields: type, prompt" },
            { status: 400 },
          );
        }
        const validTypes = ["social", "mockup", "collateral", "identity"];
        if (!validTypes.includes(type)) {
          return NextResponse.json(
            { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
            { status: 400 },
          );
        }
        const image = await generateBrandAsset(type, prompt, brandColors ?? {});
        return NextResponse.json({ image });
      }

      // ── Color scheme generation ───────────────────────────────────────
      case "color-scheme": {
        const { industry, mood } = body;
        if (!industry || !mood) {
          return NextResponse.json(
            { error: "Missing required fields: industry, mood" },
            { status: 400 },
          );
        }
        const colors = await generateColorScheme(industry, mood);
        return NextResponse.json({ colors });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Must be one of: generate, hero-image, deck-graphic, brand-asset, color-scheme" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("[generate-image] API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
