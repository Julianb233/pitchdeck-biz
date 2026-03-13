import PptxGenJS from "pptxgenjs";
import type { SlideContent, DeckContent } from "@/lib/types";

// ── Brand Color Types ────────────────────────────────────────────────────────

export interface BrandColors {
  primary: string;   // hex e.g. "#1a1a2e"
  secondary: string; // hex e.g. "#16213e"
  accent: string;    // hex e.g. "#0f3460"
  text: string;      // hex e.g. "#ffffff"
  background: string; // hex e.g. "#0a0a0a"
}

const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: "#1a1a2e",
  secondary: "#16213e",
  accent: "#e94560",
  text: "#ffffff",
  background: "#0f0f23",
};

// ── Helper: strip # from hex ─────────────────────────────────────────────────

function hex(color: string): string {
  return color.replace(/^#/, "");
}

// ── PowerPoint Generator ─────────────────────────────────────────────────────

export async function generatePptx(
  deck: DeckContent,
  brandColors: BrandColors = DEFAULT_BRAND_COLORS
): Promise<Buffer> {
  const pptx = new PptxGenJS();

  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 inches
  pptx.author = "PitchDeck.biz";
  pptx.company = "PitchDeck.biz";
  pptx.title = deck.slides[0]?.title ?? "Pitch Deck";

  // Define master slide with brand background
  pptx.defineSlideMaster({
    title: "BRANDED",
    background: { color: hex(brandColors.primary) },
    objects: [
      // Bottom accent bar
      {
        rect: {
          x: 0,
          y: 6.9,
          w: "100%",
          h: 0.6,
          fill: { color: hex(brandColors.accent) },
        },
      },
    ],
    slideNumber: {
      x: 12.2,
      y: 7.0,
      color: hex(brandColors.text),
      fontSize: 10,
    },
  });

  for (const slide of deck.slides) {
    addSlide(pptx, slide, brandColors);
  }

  // Generate as Node buffer
  const data = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  return Buffer.from(data);
}

// ── Slide Builder ────────────────────────────────────────────────────────────

function addSlide(
  pptx: PptxGenJS,
  content: SlideContent,
  colors: BrandColors
): void {
  const slide = pptx.addSlide({ masterName: "BRANDED" });

  if (content.type === "title") {
    addTitleSlide(pptx, slide, content, colors);
  } else {
    addContentSlide(slide, content, colors);
  }

  // Speaker notes
  if (content.notes) {
    slide.addNotes(content.notes);
  }
}

function addTitleSlide(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  content: SlideContent,
  colors: BrandColors
): void {
  // Company / deck title — centered, large
  slide.addText(content.title, {
    x: 0.8,
    y: 2.0,
    w: 11.7,
    h: 1.6,
    fontSize: 44,
    fontFace: "Arial",
    bold: true,
    color: hex(colors.text),
    align: "center",
    valign: "middle",
  });

  // Subtitle / tagline
  if (content.subtitle) {
    slide.addText(content.subtitle, {
      x: 1.5,
      y: 3.8,
      w: 10.3,
      h: 1.0,
      fontSize: 22,
      fontFace: "Arial",
      color: hex(colors.accent),
      align: "center",
      valign: "middle",
    });
  }

  // Decorative line under subtitle
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.0,
    y: 5.0,
    w: 3.3,
    h: 0.06,
    fill: { color: hex(colors.accent) },
  });
}

function addContentSlide(
  slide: PptxGenJS.Slide,
  content: SlideContent,
  colors: BrandColors
): void {
  // Section label (slide type)
  const label = formatSlideType(content.type);
  slide.addText(label.toUpperCase(), {
    x: 0.8,
    y: 0.4,
    w: 4.0,
    h: 0.4,
    fontSize: 10,
    fontFace: "Arial",
    bold: true,
    color: hex(colors.accent),
    charSpacing: 3,
  });

  // Slide title
  slide.addText(content.title, {
    x: 0.8,
    y: 0.9,
    w: 11.7,
    h: 0.8,
    fontSize: 30,
    fontFace: "Arial",
    bold: true,
    color: hex(colors.text),
  });

  // Subtitle if present
  let yOffset = 1.9;
  if (content.subtitle) {
    slide.addText(content.subtitle, {
      x: 0.8,
      y: yOffset,
      w: 11.7,
      h: 0.6,
      fontSize: 16,
      fontFace: "Arial",
      color: hex(colors.secondary === colors.text ? colors.accent : colors.text),
      italic: true,
    });
    yOffset += 0.7;
  }

  // Bullet points
  if (content.bulletPoints && content.bulletPoints.length > 0) {
    const bulletRows: PptxGenJS.TextProps[] = content.bulletPoints.map(
      (bp) => ({
        text: bp,
        options: {
          fontSize: 16,
          fontFace: "Arial",
          color: hex(colors.text),
          bullet: {
            code: "2022",
            color: hex(colors.accent),
          },
          paraSpaceAfter: 8,
          breakType: "break" as const,
        },
      })
    );

    slide.addText(bulletRows, {
      x: 0.8,
      y: yOffset,
      w: 11.7,
      h: 6.5 - yOffset,
      valign: "top",
    });
  }
}

// ── Utilities ────────────────────────────────────────────────────────────────

function formatSlideType(type: string): string {
  return type
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
