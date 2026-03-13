import { NextRequest, NextResponse } from "next/server";
import { generatePptx } from "@/lib/export/pptx-generator";
import type { DeckContent } from "@/lib/types";
import type { BrandColors } from "@/lib/export/pptx-generator";

export async function POST(request: NextRequest) {
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

    const buffer = await generatePptx(deck, brandColors);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": 'attachment; filename="pitch-deck.pptx"',
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("[export/pptx] Generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate PowerPoint" },
      { status: 500 }
    );
  }
}
