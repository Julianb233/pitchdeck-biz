import { GoogleGenAI } from "@google/genai";

// ---------------------------------------------------------------------------
// Gemini Native Document Understanding
//
// Uses Gemini 2.5 Pro's multimodal capabilities to analyze documents with
// vision — extracting text, tables, charts, metrics, and visual elements
// that traditional text-only parsers (pdf-parse, mammoth) miss.
// ---------------------------------------------------------------------------

const API_KEY = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? "";

/** Structured data extracted from a document by Gemini vision. */
export interface DocumentExtractionResult {
  /** Full text content organized by section */
  extractedText: string;
  /** Rich structured data including visual elements */
  structuredData: {
    summary: string;
    sections: Array<{ title: string; content: string }>;
    tables: Array<{ title: string; data: string[][] }>;
    charts: Array<{ title: string; description: string }>;
    keyMetrics: Array<{ label: string; value: string }>;
  };
  /** Raw Gemini analysis response (for debugging / downstream use) */
  rawAnalysis: string;
}

const EXTRACTION_PROMPT = `You are a document analysis expert. Analyze this business document thoroughly and extract ALL information.

Return a JSON object with exactly these fields:

{
  "summary": "A comprehensive 2-4 sentence summary of the document",
  "sections": [
    { "title": "Section heading or topic", "content": "Full text content of this section" }
  ],
  "tables": [
    { "title": "Table description", "data": [["header1", "header2"], ["row1col1", "row1col2"]] }
  ],
  "charts": [
    { "title": "Chart title or description", "description": "What this chart shows — trends, key data points, axis labels, notable values" }
  ],
  "keyMetrics": [
    { "label": "Metric name", "value": "Metric value with units" }
  ],
  "fullText": "The complete text content of the document, preserving section structure with markdown headings"
}

Important instructions:
- Extract EVERY table you see, preserving all rows and columns as arrays of strings
- For charts/graphs, describe what they show in detail — trends, values, axes, comparisons
- Pull out ALL numbers, financial figures, percentages, and KPIs as keyMetrics
- Preserve document structure with proper section breaks
- If the document has a cover page or title page, include that as the first section
- For slides/presentations, treat each slide as a separate section
- Do NOT skip any content — be exhaustive`;

/** Size threshold (bytes) above which we should consider using Files API upload */
const LARGE_FILE_THRESHOLD = 20 * 1024 * 1024; // 20 MB

/**
 * Process a document using Gemini 2.5 Pro's native multimodal understanding.
 *
 * Supports PDFs, DOCX, images, and other document formats that Gemini can
 * read natively. For files under 20 MB, uses inline base64 data. For larger
 * files, uses the Gemini Files API upload endpoint.
 */
export async function processDocumentWithGemini(
  file: Buffer,
  mimeType: string,
  fileName: string,
): Promise<DocumentExtractionResult> {
  if (!API_KEY) {
    throw new Error("No Google API key configured for Gemini document processing");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  // Build the content parts — either inline or via Files API for large files
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let filePart: any;

  if (file.byteLength > LARGE_FILE_THRESHOLD) {
    // Large file: upload via Files API first
    const uploaded = await ai.files.upload({
      file: new Blob([file], { type: mimeType }),
      config: { mimeType },
    });

    // Wait for processing to complete
    let fileState = uploaded;
    while (fileState.state === "PROCESSING") {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      fileState = await ai.files.get({ name: fileState.name! });
    }

    if (fileState.state === "FAILED") {
      throw new Error(`Gemini file processing failed for ${fileName}`);
    }

    filePart = {
      fileData: {
        mimeType: fileState.mimeType,
        fileUri: fileState.uri,
      },
    };
  } else {
    // Small file: send inline as base64
    filePart = {
      inlineData: {
        mimeType,
        data: file.toString("base64"),
      },
    };
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [
      {
        role: "user",
        parts: [filePart, { text: EXTRACTION_PROMPT }],
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const rawText = response.text ?? "";

  // Parse the structured JSON response
  let parsed: {
    summary?: string;
    sections?: Array<{ title: string; content: string }>;
    tables?: Array<{ title: string; data: string[][] }>;
    charts?: Array<{ title: string; description: string }>;
    keyMetrics?: Array<{ label: string; value: string }>;
    fullText?: string;
  };

  try {
    parsed = JSON.parse(rawText);
  } catch {
    // If JSON parsing fails, treat the entire response as text
    console.warn(
      `[document-processor] Failed to parse Gemini JSON for ${fileName}, using raw text`,
    );
    return {
      extractedText: rawText,
      structuredData: {
        summary: rawText.slice(0, 500),
        sections: [{ title: "Full Document", content: rawText }],
        tables: [],
        charts: [],
        keyMetrics: [],
      },
      rawAnalysis: rawText,
    };
  }

  // Build the full extracted text from sections + fullText
  const sectionTexts = (parsed.sections ?? [])
    .map((s) => `## ${s.title}\n${s.content}`)
    .join("\n\n");
  const extractedText = parsed.fullText || sectionTexts || parsed.summary || "";

  return {
    extractedText,
    structuredData: {
      summary: parsed.summary ?? "",
      sections: parsed.sections ?? [],
      tables: parsed.tables ?? [],
      charts: parsed.charts ?? [],
      keyMetrics: parsed.keyMetrics ?? [],
    },
    rawAnalysis: rawText,
  };
}

/**
 * Format structured document data into enriched text for the analysis pipeline.
 *
 * This produces a richer representation than raw text extraction — tables are
 * formatted as markdown, charts are described, and key metrics are highlighted.
 */
export function formatStructuredExtraction(result: DocumentExtractionResult): string {
  const parts: string[] = [];

  // Main text content
  if (result.extractedText) {
    parts.push(result.extractedText);
  }

  // Tables as markdown
  if (result.structuredData.tables.length > 0) {
    parts.push("\n\n## Extracted Tables\n");
    for (const table of result.structuredData.tables) {
      parts.push(`### ${table.title}`);
      if (table.data.length > 0) {
        // Header row
        parts.push("| " + table.data[0].join(" | ") + " |");
        parts.push("| " + table.data[0].map(() => "---").join(" | ") + " |");
        // Data rows
        for (const row of table.data.slice(1)) {
          parts.push("| " + row.join(" | ") + " |");
        }
      }
      parts.push("");
    }
  }

  // Chart descriptions
  if (result.structuredData.charts.length > 0) {
    parts.push("\n\n## Charts & Visualizations\n");
    for (const chart of result.structuredData.charts) {
      parts.push(`### ${chart.title}`);
      parts.push(chart.description);
      parts.push("");
    }
  }

  // Key metrics
  if (result.structuredData.keyMetrics.length > 0) {
    parts.push("\n\n## Key Metrics\n");
    for (const metric of result.structuredData.keyMetrics) {
      parts.push(`- **${metric.label}**: ${metric.value}`);
    }
  }

  return parts.join("\n");
}
