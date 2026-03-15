import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSessionFromRequest } from "@/lib/auth";
import { getDeck, updateDeckContent } from "@/lib/supabase/decks";
import { generateSlideImage } from "@/lib/ai/slide-image-generator";
import { generateLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";
import type { SlideContent } from "@/lib/types";
import type { Json } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM = `You are an expert pitch deck strategist. Regenerate a single slide with fresh content.
Return ONLY valid JSON: { "slideNumber": number, "type": string, "title": string, "subtitle": string, "bulletPoints": string[], "notes": string, "imagePrompt": string }
Write punchy, investor-ready copy with specific metrics. No markdown, no code fences.`;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ip = getClientIp(request);
    const limited = applyRateLimit(generateLimiter, ip);
    if (limited) return limited;

    const user = await getSessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
    }

    const { id } = await params;
    const body = await request.json();
    const { slideIndex, instructions } = body as { slideIndex: number; instructions?: string };

    if (typeof slideIndex !== "number" || slideIndex < 0) {
      return NextResponse.json({ error: "Valid slideIndex is required" }, { status: 400 });
    }

    const deck = await getDeck(id);
    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const slides = deck.slides as unknown as SlideContent[];
    if (slideIndex >= slides.length) {
      return NextResponse.json({ error: "slideIndex out of range" }, { status: 400 });
    }

    const current = slides[slideIndex];
    const context = slides.filter((_, i) => i !== slideIndex).map((s) => `[${s.type}] ${s.title}`).join(", ");

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM,
      messages: [{
        role: "user",
        content: `Regenerate slide ${current.slideNumber} (type: "${current.type}").
Current: ${JSON.stringify(current, null, 2)}
Context: ${context}
${instructions ? `Instructions: ${instructions}` : "Make it more compelling."}
Return ONLY JSON.`,
      }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No AI response" }, { status: 500 });
    }

    let raw = textBlock.text.trim();
    if (raw.startsWith("```")) raw = raw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");

    const newSlide: SlideContent = JSON.parse(raw);
    newSlide.slideNumber = current.slideNumber;
    newSlide.type = current.type;
    newSlide.generatedImage = generateSlideImage(newSlide, "technology", slides[0]?.title ?? "Pitch Deck");

    const updatedSlides = [...slides];
    updatedSlides[slideIndex] = newSlide;
    await updateDeckContent(id, { slides: updatedSlides as unknown as Json });

    return NextResponse.json({ success: true, slide: newSlide, slideIndex });
  } catch (error) {
    console.error("[regenerate-slide] error:", error);
    return NextResponse.json({
      error: "Slide regeneration failed",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
