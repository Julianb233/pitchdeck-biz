import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { BusinessDocument, DocumentContent } from "@/types/documents";
import {
  getRevisionSystemPrompt,
  getRevisionUserPrompt,
  parseDocumentResponse,
} from "@/lib/generators/documents";
import { createClient } from "@/lib/supabase/server";
import { getUserTier, canAccess } from "@/lib/feature-gate";
import { generationLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    generationLimiter,
    ip,
    "Too many revision requests. Please try again later.",
  );
  if (limited) return limited;

  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Tier check
    const tier = await getUserTier(user.id);
    if (!canAccess(tier, "business_documents")) {
      return NextResponse.json(
        {
          error: "Business documents require a Pro or Founder Suite subscription",
          requiredTier: "pro",
        },
        { status: 403 },
      );
    }

    // Check revision limits (Pro = 2, Founder Suite = unlimited)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const document = body.document as BusinessDocument;
    const feedback = body.feedback as string;
    const specificSections = body.specificSections as string[] | undefined;

    if (!document || !document.content) {
      return NextResponse.json(
        { error: "Valid document is required" },
        { status: 400 },
      );
    }

    if (!feedback || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: "Feedback is required for revision" },
        { status: 400 },
      );
    }

    // Check revision cycle limits for Pro tier
    if (tier === "pro" && !canAccess(tier, "unlimited_revisions")) {
      const maxRevisions = 2;
      if (document.version >= maxRevisions + 1) {
        return NextResponse.json(
          {
            error: `Pro plan allows ${maxRevisions} revision cycles per document. Upgrade to Founder Suite for unlimited revisions.`,
            requiredTier: "founder_suite",
          },
          { status: 403 },
        );
      }
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: getRevisionUserPrompt(
            document.content,
            feedback,
            specificSections,
          ),
        },
      ],
      system: getRevisionSystemPrompt(),
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 },
      );
    }

    const revisedContent: DocumentContent = parseDocumentResponse(textBlock.text);

    // Build the revised document
    const now = new Date().toISOString();
    const revisedDocument: BusinessDocument = {
      ...document,
      content: revisedContent,
      version: document.version + 1,
      feedback: [...(document.feedback ?? []), feedback],
      updatedAt: now,
    };

    return NextResponse.json({
      success: true,
      document: revisedDocument,
      previousVersion: document.version,
    });
  } catch (error) {
    console.error("Document revision failed:", error);
    return NextResponse.json(
      {
        error: "Document revision failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
