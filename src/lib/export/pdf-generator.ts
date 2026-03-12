import { jsPDF } from "jspdf";
import type { DeckContent } from "@/lib/types";
import type { BrandColors } from "./pptx-generator";

const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: "#1a1a2e",
  secondary: "#16213e",
  accent: "#e94560",
  text: "#ffffff",
  background: "#0f0f23",
};

// ── Color Helpers ────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace(/^#/, "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function setFillColor(doc: jsPDF, color: string) {
  const [r, g, b] = hexToRgb(color);
  doc.setFillColor(r, g, b);
}

function setTextColor(doc: jsPDF, color: string) {
  const [r, g, b] = hexToRgb(color);
  doc.setTextColor(r, g, b);
}

function setDrawColor(doc: jsPDF, color: string) {
  const [r, g, b] = hexToRgb(color);
  doc.setDrawColor(r, g, b);
}

// ── Page Layout Constants ────────────────────────────────────────────────────

const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// ── Sell Sheet PDF (1-2 pages) ───────────────────────────────────────────────

export async function generateSellSheetPDF(
  content: DeckContent,
  brandColors: BrandColors = DEFAULT_BRAND_COLORS
): Promise<Buffer> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const sellSheet = content.sellSheet;

  // Background
  setFillColor(doc, brandColors.primary);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");

  // Accent bar at top
  setFillColor(doc, brandColors.accent);
  doc.rect(0, 0, PAGE_WIDTH, 8, "F");

  // Headline
  setTextColor(doc, brandColors.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  const headlineLines = doc.splitTextToSize(sellSheet.headline, CONTENT_WIDTH);
  doc.text(headlineLines, MARGIN, 30);

  // Subheadline
  let yPos = 30 + headlineLines.length * 12;
  setTextColor(doc, brandColors.accent);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(14);
  const subLines = doc.splitTextToSize(sellSheet.subheadline, CONTENT_WIDTH);
  doc.text(subLines, MARGIN, yPos);
  yPos += subLines.length * 7 + 10;

  // Divider
  setDrawColor(doc, brandColors.accent);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, yPos, PAGE_WIDTH - MARGIN, yPos);
  yPos += 10;

  // Sections
  for (const section of sellSheet.sections) {
    if (yPos > PAGE_HEIGHT - 40) {
      doc.addPage();
      setFillColor(doc, brandColors.primary);
      doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
      yPos = MARGIN;
    }

    setTextColor(doc, brandColors.accent);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(section.title.toUpperCase(), MARGIN, yPos);
    yPos += 8;

    setTextColor(doc, brandColors.text);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const contentLines = doc.splitTextToSize(section.content, CONTENT_WIDTH);
    doc.text(contentLines, MARGIN, yPos);
    yPos += contentLines.length * 5.5 + 10;
  }

  // Footer accent bar
  setFillColor(doc, brandColors.accent);
  doc.rect(0, PAGE_HEIGHT - 6, PAGE_WIDTH, 6, "F");

  const buffer = Buffer.from(doc.output("arraybuffer"));
  return buffer;
}

// ── One-Pager PDF (single page executive summary) ────────────────────────────

export async function generateOnePagerPDF(
  content: DeckContent,
  brandColors: BrandColors = DEFAULT_BRAND_COLORS
): Promise<Buffer> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const onePager = content.onePager;

  // Background
  setFillColor(doc, brandColors.primary);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");

  // Left accent stripe
  setFillColor(doc, brandColors.accent);
  doc.rect(0, 0, 5, PAGE_HEIGHT, "F");

  // Headline
  setTextColor(doc, brandColors.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  const headlineLines = doc.splitTextToSize(
    onePager.headline,
    CONTENT_WIDTH - 5
  );
  doc.text(headlineLines, MARGIN + 5, 28);

  // Divider
  let yPos = 28 + headlineLines.length * 10 + 5;
  setDrawColor(doc, brandColors.accent);
  doc.setLineWidth(0.8);
  doc.line(MARGIN + 5, yPos, PAGE_WIDTH - MARGIN, yPos);
  yPos += 10;

  // Sections — two-column layout for compactness
  const leftSections = onePager.sections.filter((_, i) => i % 2 === 0);
  const rightSections = onePager.sections.filter((_, i) => i % 2 !== 0);
  const colWidth = (CONTENT_WIDTH - 15) / 2;
  const startY = yPos;

  let leftY = startY;
  for (const section of leftSections) {
    leftY = renderSection(doc, section, MARGIN + 5, leftY, colWidth, brandColors);
  }

  let rightY = startY;
  for (const section of rightSections) {
    rightY = renderSection(
      doc,
      section,
      MARGIN + 5 + colWidth + 10,
      rightY,
      colWidth,
      brandColors
    );
  }

  // Footer
  setFillColor(doc, brandColors.accent);
  doc.rect(0, PAGE_HEIGHT - 6, PAGE_WIDTH, 6, "F");
  setTextColor(doc, brandColors.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Generated by PitchDeck.biz", PAGE_WIDTH / 2, PAGE_HEIGHT - 2, {
    align: "center",
  });

  return Buffer.from(doc.output("arraybuffer"));
}

// ── Brand Kit PDF ────────────────────────────────────────────────────────────

export async function generateBrandKitPDF(
  content: DeckContent,
  brandColors: BrandColors = DEFAULT_BRAND_COLORS
): Promise<Buffer> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const kit = content.brandKit;

  // Page 1: Cover
  setFillColor(doc, brandColors.primary);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");

  setTextColor(doc, brandColors.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text("Brand Guidelines", PAGE_WIDTH / 2, 80, { align: "center" });

  setTextColor(doc, brandColors.accent);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text("Visual Identity & Voice", PAGE_WIDTH / 2, 95, { align: "center" });

  setDrawColor(doc, brandColors.accent);
  doc.setLineWidth(1);
  doc.line(70, 105, 140, 105);

  // Page 2: Color Palette + Typography + Voice
  doc.addPage();
  setFillColor(doc, brandColors.primary);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");

  let yPos = MARGIN + 5;

  // Color Palette title
  setTextColor(doc, brandColors.accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("COLOR PALETTE", MARGIN, yPos);
  yPos += 15;

  // Rationale
  setTextColor(doc, brandColors.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const ratLines = doc.splitTextToSize(kit.colorRationale, CONTENT_WIDTH);
  doc.text(ratLines, MARGIN, yPos);
  yPos += ratLines.length * 5.5 + 15;

  // Color swatches
  const swatches = [
    { label: "Primary", color: brandColors.primary },
    { label: "Secondary", color: brandColors.secondary },
    { label: "Accent", color: brandColors.accent },
    { label: "Text", color: brandColors.text },
    { label: "Background", color: brandColors.background },
  ];

  const swatchSize = 25;
  const swatchGap = 8;
  let xPos = MARGIN;

  for (const swatch of swatches) {
    setFillColor(doc, swatch.color);
    doc.rect(xPos, yPos, swatchSize, swatchSize, "F");

    setDrawColor(doc, "#666666");
    doc.setLineWidth(0.3);
    doc.rect(xPos, yPos, swatchSize, swatchSize, "S");

    setTextColor(doc, brandColors.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(swatch.label, xPos, yPos + swatchSize + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(swatch.color.toUpperCase(), xPos, yPos + swatchSize + 10);

    xPos += swatchSize + swatchGap;
  }
  yPos += swatchSize + 25;

  // Typography
  setTextColor(doc, brandColors.accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("TYPOGRAPHY", MARGIN, yPos);
  yPos += 12;

  setTextColor(doc, brandColors.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Heading Font: ${kit.fontPairing.heading}`, MARGIN, yPos);
  yPos += 8;
  doc.setFont("helvetica", "normal");
  doc.text(`Body Font: ${kit.fontPairing.body}`, MARGIN, yPos);
  yPos += 20;

  // Brand Voice
  setTextColor(doc, brandColors.accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("BRAND VOICE", MARGIN, yPos);
  yPos += 12;

  setTextColor(doc, brandColors.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const voiceLines = doc.splitTextToSize(kit.brandVoice, CONTENT_WIDTH);
  doc.text(voiceLines, MARGIN, yPos);
  yPos += voiceLines.length * 5.5 + 20;

  // Logo Direction
  setTextColor(doc, brandColors.accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("LOGO DIRECTION", MARGIN, yPos);
  yPos += 12;

  setTextColor(doc, brandColors.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const logoLines = doc.splitTextToSize(kit.logoDirection, CONTENT_WIDTH);
  doc.text(logoLines, MARGIN, yPos);

  // Footer
  setFillColor(doc, brandColors.accent);
  doc.rect(0, PAGE_HEIGHT - 6, PAGE_WIDTH, 6, "F");

  return Buffer.from(doc.output("arraybuffer"));
}

// ── Shared Helpers ───────────────────────────────────────────────────────────

function renderSection(
  doc: jsPDF,
  section: { title: string; content: string },
  x: number,
  y: number,
  maxWidth: number,
  colors: BrandColors
): number {
  setTextColor(doc, colors.accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(section.title.toUpperCase(), x, y);
  y += 6;

  setTextColor(doc, colors.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(section.content, maxWidth);
  doc.text(lines, x, y);
  y += lines.length * 4.5 + 8;

  return y;
}
