/**
 * Video Deck Generator — Veo 2.0
 *
 * Generates animated video clips for each slide using Google's Veo video model.
 * Each slide becomes a ~6 second animated clip with professional motion graphics.
 *
 * Requires GOOGLE_AI_API_KEY env var (same as Gemini).
 */

import type { SlideContent } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface SlideVideo {
  slideNumber: number;
  slideTitle: string;
  videoUrl?: string;
  videoData?: string; // base64 encoded video
  mimeType: string;
  durationSeconds: number;
  status: "completed" | "pending" | "failed";
  error?: string;
}

export interface VideoGenerationResult {
  videos: SlideVideo[];
  totalSlides: number;
  completedSlides: number;
  failedSlides: number;
}

// ── Prompt Engineering ────────────────────────────────────────────────────────

function buildVideoPrompt(
  slide: SlideContent,
  brandColors?: BrandColors
): string {
  const colorNote = brandColors
    ? `Brand colors: ${brandColors.primary}, ${brandColors.secondary}, ${brandColors.accent}.`
    : "Color palette: deep navy, slate blue, coral accent.";

  const slideTypeDescriptions: Record<string, string> = {
    title:
      "Elegant title card reveal with smooth text animation and subtle particle effects",
    problem:
      "Dramatic visualization of the business problem with impactful motion graphics",
    solution:
      "Bright, optimistic reveal of the solution with clean geometric transitions",
    market:
      "Data visualization animation with growing charts and expanding market graphics",
    product:
      "Clean product showcase with smooth transitions between feature highlights",
    "business-model":
      "Professional revenue model visualization with flowing diagrams",
    traction:
      "Dynamic growth metrics animation with rising graphs and milestone markers",
    team: "Professional team introduction with clean card-style reveals",
    financials:
      "Financial data visualization with animated charts and projections",
    ask: "Compelling call-to-action with bold typography and decisive motion",
    "why-now":
      "Converging trend lines animation showing market timing opportunity",
    closing:
      "Elegant closing card with logo resolve and contact information fade-in",
  };

  const typeDesc =
    slideTypeDescriptions[slide.type] ||
    "Professional pitch deck slide with clean corporate motion graphics";

  const contentSummary = [
    slide.title,
    slide.subtitle,
    ...(slide.bulletPoints?.slice(0, 2) ?? []),
  ]
    .filter(Boolean)
    .join(". ");

  return [
    `Professional pitch deck slide animation: ${typeDesc}.`,
    `Content context: ${contentSummary}.`,
    colorNote,
    "Style: clean corporate motion graphics, smooth transitions, 16:9 aspect ratio.",
    "No text overlays — visual mood and motion only.",
    "High production value, startup pitch deck quality.",
  ].join(" ");
}

// ── Video Generation ──────────────────────────────────────────────────────────

/**
 * Generate a video clip for a single slide using Veo 2.0.
 */
export async function generateSlideVideo(
  slide: SlideContent,
  brandColors?: BrandColors
): Promise<SlideVideo> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return {
      slideNumber: slide.slideNumber,
      slideTitle: slide.title,
      mimeType: "video/mp4",
      durationSeconds: 0,
      status: "failed",
      error:
        "GOOGLE_AI_API_KEY is not configured. Video generation requires a Google AI API key with Veo access.",
    };
  }

  const prompt = buildVideoPrompt(slide, brandColors);

  try {
    // Use the Google GenAI SDK for Veo video generation
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateVideos({
      model: "veo-2.0-generate-001",
      prompt,
      config: {
        numberOfVideos: 1,
        durationSeconds: 6,
        aspectRatio: "16:9",
      },
    });

    // Veo returns an operation that needs polling
    if (!response.generatedVideos || response.generatedVideos.length === 0) {
      return {
        slideNumber: slide.slideNumber,
        slideTitle: slide.title,
        mimeType: "video/mp4",
        durationSeconds: 6,
        status: "pending",
        error:
          "Video generation is in progress. Veo operations may take 1-3 minutes.",
      };
    }

    const video = response.generatedVideos[0];

    return {
      slideNumber: slide.slideNumber,
      slideTitle: slide.title,
      videoUrl: video.video?.uri ?? undefined,
      mimeType: "video/mp4",
      durationSeconds: 6,
      status: "completed",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown video generation error";
    console.error(
      `[video-generator] Slide ${slide.slideNumber} failed:`,
      message
    );

    return {
      slideNumber: slide.slideNumber,
      slideTitle: slide.title,
      mimeType: "video/mp4",
      durationSeconds: 0,
      status: "failed",
      error: message,
    };
  }
}

/**
 * Generate videos for all slides in a deck.
 * Processes slides sequentially to avoid API rate limits.
 */
export async function generateDeckVideos(
  slides: SlideContent[],
  brandColors?: BrandColors
): Promise<VideoGenerationResult> {
  const videos: SlideVideo[] = [];

  for (const slide of slides) {
    const video = await generateSlideVideo(slide, brandColors);
    videos.push(video);
  }

  return {
    videos,
    totalSlides: slides.length,
    completedSlides: videos.filter((v) => v.status === "completed").length,
    failedSlides: videos.filter((v) => v.status === "failed").length,
  };
}
