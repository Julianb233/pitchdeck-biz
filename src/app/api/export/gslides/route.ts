import { NextRequest, NextResponse } from "next/server";
import { createGoogleSlidesPresentation } from "@/lib/export/gslides-generator";
import { exportLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";
import type { DeckContent } from "@/lib/types";
import type { BrandColors } from "@/lib/export/gslides-generator";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(exportLimiter, ip, "Too many export requests.");
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

    const result = await createGoogleSlidesPresentation(deck, brandColors);

    return NextResponse.json({
      success: true,
      url: result.url,
      presentationId: result.presentationId,
    });
  } catch (error) {
    console.error("[export/gslides] Generation failed:", error);

    const message =
      error instanceof Error ? error.message : "Failed to generate Google Slides";

    // Provide a helpful message when credentials are missing
    const isConfigError = message.includes("GOOGLE_SERVICE_ACCOUNT_KEY");

    return NextResponse.json(
      {
        error: isConfigError
          ? "Google Slides export is not yet configured. Please contact support."
          : message,
        configRequired: isConfigError,
      },
      { status: isConfigError ? 503 : 500 }
    );
  }
}
