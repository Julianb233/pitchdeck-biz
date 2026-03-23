import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getDeck } from "@/lib/supabase/decks";
import { generatePptx } from "@/lib/export/pptx-generator";
import {
  generateSellSheetPDF,
  generateOnePagerPDF,
  generateBrandKitPDF,
} from "@/lib/export/pdf-generator";
import { generateBundle } from "@/lib/export/zip-bundler";
import { exportLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";
import type { DeckContent } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

type ExportFormat = "pptx" | "sell-sheet" | "one-pager" | "brand-kit" | "bundle";

const CONTENT_TYPES: Record<ExportFormat, string> = {
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "sell-sheet": "application/pdf",
  "one-pager": "application/pdf",
  "brand-kit": "application/pdf",
  bundle: "application/zip",
};

const FILENAMES: Record<ExportFormat, string> = {
  pptx: "pitch-deck.pptx",
  "sell-sheet": "sell-sheet.pdf",
  "one-pager": "one-pager.pdf",
  "brand-kit": "brand-kit.pdf",
  bundle: "pitchdeck-bundle.zip",
};

/**
 * GET /api/decks/[id]/export?format=pptx|sell-sheet|one-pager|brand-kit|bundle
 *
 * Loads the deck from the database and generates the requested export format.
 * Requires authentication.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ip = getClientIp(request);
    const limited = applyRateLimit(exportLimiter, ip);
    if (limited) return limited;

    const user = await getSessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const format = (request.nextUrl.searchParams.get("format") ?? "bundle") as ExportFormat;

    if (!CONTENT_TYPES[format]) {
      return NextResponse.json(
        { error: `Invalid format. Must be one of: ${Object.keys(CONTENT_TYPES).join(", ")}` },
        { status: 400 },
      );
    }

    const deck = await getDeck(id);
    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Reconstruct DeckContent from the database row
    const deckContent: DeckContent = {
      slides: (deck.slides as unknown as DeckContent["slides"]) ?? [],
      sellSheet: deck.sell_sheet as DeckContent["sellSheet"],
      onePager: deck.one_pager as DeckContent["onePager"],
      brandKit: deck.brand_kit as DeckContent["brandKit"],
    };

    if (!deckContent.slides || deckContent.slides.length === 0) {
      return NextResponse.json(
        { error: "Deck has no slides to export" },
        { status: 400 },
      );
    }

    let buffer: Buffer;

    switch (format) {
      case "pptx":
        buffer = await generatePptx(deckContent);
        break;
      case "sell-sheet":
        buffer = await generateSellSheetPDF(deckContent);
        break;
      case "one-pager":
        buffer = await generateOnePagerPDF(deckContent);
        break;
      case "brand-kit":
        buffer = await generateBrandKitPDF(deckContent);
        break;
      case "bundle":
        buffer = await generateBundle(deckContent);
        break;
      default:
        return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    const filename = deck.title
      ? `${deck.title.replace(/[^a-zA-Z0-9-_ ]/g, "").slice(0, 50)}-${FILENAMES[format]}`
      : FILENAMES[format];

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPES[format],
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("[decks/export] error:", error);
    return NextResponse.json(
      { error: "Export failed" },
      { status: 500 },
    );
  }
}
