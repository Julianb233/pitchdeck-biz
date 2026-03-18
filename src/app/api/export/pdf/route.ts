import { NextRequest, NextResponse } from "next/server";
import {
  generateSellSheetPDF,
  generateOnePagerPDF,
  generateBrandKitPDF,
} from "@/lib/export/pdf-generator";
import { generateDocumentPDF } from "@/lib/export/document-pdf";
import type { DeckContent } from "@/lib/types";
import type { DocumentContent } from "@/types/documents";
import type { BrandColors } from "@/lib/export/pptx-generator";
import { exportLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

type PdfType = "sell-sheet" | "one-pager" | "brand-kit" | "business-document";

const GENERATORS: Record<
  PdfType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (content: any, colors?: BrandColors) => Promise<Buffer>
> = {
  "sell-sheet": generateSellSheetPDF,
  "one-pager": generateOnePagerPDF,
  "brand-kit": generateBrandKitPDF,
  "business-document": (content: DocumentContent) => generateDocumentPDF(content),
};

const FILENAMES: Record<PdfType, string> = {
  "sell-sheet": "sell-sheet.pdf",
  "one-pager": "one-pager.pdf",
  "brand-kit": "brand-kit.pdf",
  "business-document": "business-document.pdf",
};

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(exportLimiter, ip, "Too many export requests. Please try again later.");
  if (limited) return limited;

  try {
    const body = await request.json();
    const { deck, documentContent, brandColors, type } = body as {
      deck?: DeckContent;
      documentContent?: DocumentContent;
      brandColors?: BrandColors;
      type?: PdfType;
    };

    const pdfType: PdfType = type ?? "sell-sheet";

    if (!GENERATORS[pdfType]) {
      return NextResponse.json(
        {
          error: "Invalid PDF type. Must be one of: sell-sheet, one-pager, brand-kit, business-document",
        },
        { status: 400 }
      );
    }

    // For business-document type, use documentContent; otherwise use deck
    const content = pdfType === "business-document" ? documentContent : deck;
    if (!content) {
      return NextResponse.json(
        { error: pdfType === "business-document" ? "Invalid document content" : "Invalid deck content" },
        { status: 400 }
      );
    }

    const generate = GENERATORS[pdfType];
    const buffer = await generate(content, brandColors);
    const filename = FILENAMES[pdfType];

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=\"" + filename + "\"",
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("[export/pdf] Generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
