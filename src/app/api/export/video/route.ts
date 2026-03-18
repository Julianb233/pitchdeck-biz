import { NextRequest, NextResponse } from "next/server";
import {
  generateDeckVideos,
  generateSlideVideo,
} from "@/lib/export/video-generator";
import { exportLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";
import type { DeckContent, SlideContent } from "@/lib/types";

interface VideoRequestBody {
  deck?: DeckContent;
  slide?: SlideContent;
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    exportLimiter,
    ip,
    "Too many video generation requests."
  );
  if (limited) return limited;

  try {
    const body = (await request.json()) as VideoRequestBody;
    const { deck, slide, brandColors } = body;

    // Single slide mode
    if (slide) {
      const result = await generateSlideVideo(slide, brandColors);
      return NextResponse.json({ success: true, video: result });
    }

    // Full deck mode
    if (!deck?.slides || deck.slides.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: provide either a deck or a single slide" },
        { status: 400 }
      );
    }

    // Cap at 15 slides to prevent abuse
    if (deck.slides.length > 15) {
      return NextResponse.json(
        { error: "Video generation is limited to 15 slides per request" },
        { status: 400 }
      );
    }

    const result = await generateDeckVideos(deck.slides, brandColors);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[export/video] Generation failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to generate video deck";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
