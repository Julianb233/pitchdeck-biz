import { NextRequest, NextResponse } from "next/server";
import { generateDeckGraphic, generateBrandAsset, generateColorScheme } from "@/lib/ai/gemini-image";
import { generateLimiter } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// POST /api/generate-image
// Accepts: { action, prompt, style, colors, type, brandColors, industry, mood }
// Returns: { image?: string, colors?: object, error?: string }
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const limited = generateLimiter.check(request);
    if (limited) return limited;

    const body = await request.json();
    const { action } = body;

    switch (action) {
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
          { error: "Invalid action. Must be one of: deck-graphic, brand-asset, color-scheme" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("[generate-image] API error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
