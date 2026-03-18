/**
 * PDF export for launch infrastructure documents.
 * Uses jsPDF to generate professional PDFs with cover pages,
 * table of contents, formatted sections, and page numbers.
 */

import { jsPDF } from "jspdf";
import type { LaunchDocument } from "@/types/launch-infrastructure";

// Color palette
const BRAND_BLUE = "#203eec";
const BRAND_CYAN = "#00d4ff";
const TEXT_BLACK = "#1a1a1a";
const TEXT_GRAY = "#6b7280";
const DIVIDER_GRAY = "#e5e7eb";

interface PDFOptions {
  companyName: string;
  confidential?: boolean;
}

/**
 * Render markdown-like text to PDF, handling bold, bullets, and tables.
 * Returns the new Y position after rendering.
 */
function renderMarkdownContent(
  doc: jsPDF,
  content: string,
  startY: number,
  pageWidth: number,
  margin: number,
): number {
  let y = startY;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 6;
  const lines = content.split("\n");

  for (const line of lines) {
    // Check if we need a new page
    if (y > 270) {
      doc.addPage();
      y = 25;
    }

    const trimmed = line.trim();

    // Skip empty lines (add small space)
    if (!trimmed) {
      y += 3;
      continue;
    }

    // Headers (### and ####)
    if (trimmed.startsWith("#### ")) {
      const text = trimmed.replace(/^####\s+/, "").replace(/\*\*/g, "");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(TEXT_BLACK);
      y += 3;
      doc.text(text, margin, y);
      y += lineHeight + 2;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      const text = trimmed.replace(/^###\s+/, "").replace(/\*\*/g, "");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(TEXT_BLACK);
      y += 4;
      doc.text(text, margin, y);
      y += lineHeight + 3;
      continue;
    }

    // Table rows (|)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      // Skip separator rows
      if (trimmed.match(/^\|[\s-:|]+\|$/)) continue;

      const cells = trimmed
        .split("|")
        .filter(Boolean)
        .map((c) => c.trim().replace(/\*\*/g, ""));
      const cellWidth = maxWidth / cells.length;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(TEXT_BLACK);

      cells.forEach((cell, i) => {
        const x = margin + i * cellWidth;
        const wrapped = doc.splitTextToSize(cell, cellWidth - 4);
        doc.text(wrapped, x + 2, y);
      });

      // Draw light grid line
      doc.setDrawColor(DIVIDER_GRAY);
      doc.setLineWidth(0.2);
      doc.line(margin, y + 2, margin + maxWidth, y + 2);

      y += lineHeight + 1;
      continue;
    }

    // Checkbox items (- [ ] or - [x])
    if (trimmed.match(/^-\s+\[[ x]\]\s+/)) {
      const isChecked = trimmed.includes("[x]");
      const text = trimmed.replace(/^-\s+\[[ x]\]\s+/, "").replace(/\*\*/g, "");

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(TEXT_BLACK);

      // Draw checkbox
      doc.setDrawColor(TEXT_GRAY);
      doc.setLineWidth(0.3);
      doc.rect(margin + 2, y - 3, 3.5, 3.5);
      if (isChecked) {
        doc.setFont("helvetica", "bold");
        doc.text("x", margin + 2.8, y - 0.3);
        doc.setFont("helvetica", "normal");
      }

      const wrapped = doc.splitTextToSize(text, maxWidth - 12);
      doc.text(wrapped, margin + 9, y);
      y += wrapped.length * lineHeight;
      continue;
    }

    // Bullet points (- or *)
    if (trimmed.match(/^[-*]\s+/)) {
      const text = trimmed.replace(/^[-*]\s+/, "").replace(/\*\*/g, "");
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(TEXT_BLACK);
      doc.text("\u2022", margin + 2, y);
      const wrapped = doc.splitTextToSize(text, maxWidth - 10);
      doc.text(wrapped, margin + 8, y);
      y += wrapped.length * lineHeight;
      continue;
    }

    // Numbered list items
    if (trimmed.match(/^\d+\.\s+/)) {
      const num = trimmed.match(/^(\d+)\./)?.[1] || "";
      const text = trimmed.replace(/^\d+\.\s+/, "").replace(/\*\*/g, "");
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(TEXT_BLACK);
      doc.text(`${num}.`, margin + 2, y);
      const wrapped = doc.splitTextToSize(text, maxWidth - 12);
      doc.text(wrapped, margin + 10, y);
      y += wrapped.length * lineHeight;
      continue;
    }

    // Regular paragraph (handle bold markers by stripping them)
    const text = trimmed.replace(/\*\*/g, "");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(TEXT_BLACK);
    const wrapped = doc.splitTextToSize(text, maxWidth);
    doc.text(wrapped, margin, y);
    y += wrapped.length * lineHeight;
  }

  return y;
}

export function generateInfrastructurePDF(
  document: LaunchDocument,
  options: PDFOptions,
): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // ── Cover Page ────────────────────────────────────────────────────────
  // Background gradient effect (simulated with rectangles)
  doc.setFillColor(26, 26, 46); // dark navy
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Accent stripe
  doc.setFillColor(32, 62, 236); // brand blue
  doc.rect(0, pageHeight * 0.35, pageWidth, 2, "F");

  // Company name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(options.companyName.toUpperCase(), margin, 50);

  // Document title
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(document.title, pageWidth - margin * 2);
  doc.text(titleLines, margin, pageHeight * 0.4 + 15);

  // Date
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 220);
  const dateStr = new Date(document.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  doc.text(dateStr, margin, pageHeight * 0.4 + 35);

  // Confidential watermark
  if (options.confidential) {
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("CONFIDENTIAL", margin, pageHeight - 30);
  }

  // Branding footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 170);
  doc.text("Generated by pitchdeck.biz | Founder Suite", margin, pageHeight - 15);

  // ── Table of Contents ──────────────────────────────────────────────────
  doc.addPage();
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(TEXT_BLACK);
  doc.text("Table of Contents", margin, 35);

  // Divider line
  doc.setDrawColor(BRAND_BLUE);
  doc.setLineWidth(0.8);
  doc.line(margin, 40, margin + 40, 40);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(TEXT_GRAY);

  let tocY = 55;
  document.sections.forEach((section, index) => {
    doc.setTextColor(TEXT_BLACK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const sectionNum = `${index + 1}.`;
    doc.text(sectionNum, margin, tocY);
    doc.text(section.title, margin + 10, tocY);

    // Dotted line
    doc.setDrawColor(DIVIDER_GRAY);
    doc.setLineWidth(0.2);
    const textWidth = doc.getTextWidth(`${sectionNum} ${section.title}`) + margin + 10;
    for (let x = textWidth + 2; x < pageWidth - margin - 10; x += 2) {
      doc.line(x, tocY, x + 0.5, tocY);
    }

    tocY += 10;
  });

  // ── Content Pages ──────────────────────────────────────────────────────
  document.sections.forEach((section, index) => {
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Section number badge
    doc.setFillColor(32, 62, 236);
    doc.roundedRect(margin, 18, 12, 8, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`${index + 1}`, margin + 4.5, 24);

    // Section title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(TEXT_BLACK);
    const sectionTitle = doc.splitTextToSize(section.title, pageWidth - margin * 2 - 20);
    doc.text(sectionTitle, margin + 16, 25);

    // Divider
    doc.setDrawColor(DIVIDER_GRAY);
    doc.setLineWidth(0.3);
    const titleBottomY = 25 + sectionTitle.length * 8 + 3;
    doc.line(margin, titleBottomY, pageWidth - margin, titleBottomY);

    // Section content
    renderMarkdownContent(doc, section.content, titleBottomY + 8, pageWidth, margin);
  });

  // ── Add page numbers to all pages except cover ────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(TEXT_GRAY);
    doc.text(`Page ${i - 1} of ${totalPages - 1}`, pageWidth - margin, pageHeight - 10, {
      align: "right",
    });

    // Footer branding
    doc.setTextColor(200, 200, 200);
    doc.text("pitchdeck.biz", margin, pageHeight - 10);

    // Confidential watermark on each page
    if (options.confidential) {
      doc.setFontSize(7);
      doc.setTextColor(220, 220, 220);
      doc.text("CONFIDENTIAL", pageWidth / 2, pageHeight - 10, { align: "center" });
    }
  }

  return doc;
}
