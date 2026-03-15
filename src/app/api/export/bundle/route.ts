import { NextRequest, NextResponse } from "next/server";
import { generateBundle } from "@/lib/export/zip-bundler";
import type { DeckContent } from "@/lib/types";
import type { BrandColors } from "@/lib/export/pptx-generator";
import { exportLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(exportLimiter, ip, "Too many export requests. Please try again later.");
  if (limited) return limited;

  try {
    const body = await request.json();
    const { deck, brandColors } = body as {
      deck: DeckContent;
      brandColors?: BrandColors;
    };

    if (!deck?.slides || deck.slides.length === 0) {
      return NextResponse.json(
        { error: "Invalid deck content: slides are required" },
        { status: 400 }
      );
    }

    const buffer = await generateBundle(deck, brandColors);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="pitchdeck-bundle.zip"',
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("[export/bundle] Generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate bundle" },
      { status: 500 }
    );
  }
}
