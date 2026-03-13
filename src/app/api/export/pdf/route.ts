import { NextRequest, NextResponse } from "next/server";
import {
  generateSellSheetPDF,
  generateOnePagerPDF,
  generateBrandKitPDF,
} from "@/lib/export/pdf-generator";
import type { DeckContent } from "@/lib/types";
import type { BrandColors } from "@/lib/export/pptx-generator";

type PdfType = "sell-sheet" | "one-pager" | "brand-kit";

const GENERATORS: Record<
  PdfType,
  (deck: DeckContent, colors?: BrandColors) => Promise<Buffer>
> = {
  "sell-sheet": generateSellSheetPDF,
  "one-pager": generateOnePagerPDF,
  "brand-kit": generateBrandKitPDF,
};

const FILENAMES: Record<PdfType, string> = {
  "sell-sheet": "sell-sheet.pdf",
  "one-pager": "one-pager.pdf",
  "brand-kit": "brand-kit.pdf",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deck, brandColors, type } = body as {
      deck: DeckContent;
      brandColors?: BrandColors;
      type?: PdfType;
    };

    const pdfType: PdfType = type ?? "sell-sheet";

    if (!GENERATORS[pdfType]) {
      return NextResponse.json(
        {
          error: `Invalid PDF type: ${pdfType}. Must be one of: sell-sheet, one-pager, brand-kit`,
        },
        { status: 400 }
      );
    }

    if (!deck) {
      return NextResponse.json(
        { error: "Invalid deck content" },
        { status: 400 }
      );
    }

    const generate = GENERATORS[pdfType];
    const buffer = await generate(deck, brandColors);
    const filename = FILENAMES[pdfType];

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
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
