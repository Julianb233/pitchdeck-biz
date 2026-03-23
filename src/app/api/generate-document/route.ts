import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { BusinessAnalysis } from "@/lib/types";
import type { DocumentType, BusinessDocument } from "@/types/documents";
import {
  getSystemPrompt,
  getUserPrompt,
  parseDocumentResponse,
} from "@/lib/generators/documents";
import { createClient } from "@/lib/supabase/server";
import { getUserTier, canAccess } from "@/lib/feature-gate";
import { generationLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_TYPES: DocumentType[] = [
  "executive-summary",
  "investor-update",
  "board-deck",
  "company-overview",
];

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    generationLimiter,
    ip,
    "Too many document generation requests. Please try again later.",
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

    // Tier check — Pro+ only
    const tierInfo = await getUserTier(user.id);
    if (!tierInfo || !canAccess(tierInfo.tier, "business_documents")) {
      return NextResponse.json(
        {
          error: "Business documents require a Pro or Founder Suite subscription",
          requiredTier: "pro",
        },
        { status: 403 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const documentType = body.documentType as DocumentType;
    const analysis = body.analysis as BusinessAnalysis;

    if (!documentType || !VALID_TYPES.includes(documentType)) {
      return NextResponse.json(
        {
          error: `Invalid document type. Must be one of: ${VALID_TYPES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (!analysis || !analysis.summary) {
      return NextResponse.json(
        { error: "Valid business analysis is required" },
        { status: 400 },
      );
    }

    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: getUserPrompt(analysis, documentType),
        },
      ],
      system: getSystemPrompt(documentType),
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 },
      );
    }

    const documentContent = parseDocumentResponse(textBlock.text);

    // Build the document object
    const now = new Date().toISOString();
    const document: BusinessDocument = {
      id: crypto.randomUUID(),
      type: documentType,
      title: `${documentContent.metadata.companyName} — ${documentType
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")}`,
      content: documentContent,
      version: 1,
      feedback: [],
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Generate document failed:", error);
    return NextResponse.json(
      {
        error: "Document generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
