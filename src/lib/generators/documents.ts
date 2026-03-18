import type { BusinessAnalysis } from "@/lib/types";
import type { DocumentContent, DocumentType } from "@/types/documents";

// ── System Prompts ──────────────────────────────────────────────────────────

const SHARED_INSTRUCTIONS = `You are an expert business writer who creates professional, substantive business documents.

You MUST return valid JSON matching the exact schema below. Do NOT include any text outside the JSON object.

Schema:
{
  "sections": [
    {
      "title": string,
      "body": string,
      "subsections": [{ "title": string, "body": string }] (optional)
    }
  ],
  "metadata": {
    "companyName": string,
    "date": string (ISO date),
    "confidential": boolean
  }
}

Guidelines:
- Write substantial, professional prose — not fill-in-the-blank templates
- Use specific numbers, metrics, and data from the analysis wherever possible
- Maintain a confident, authoritative tone appropriate for investors and executives
- Each section body should be 2-5 detailed paragraphs unless it's a summary section
- Use subsections to organize complex topics`;

const DOCUMENT_PROMPTS: Record<DocumentType, string> = {
  "executive-summary": `${SHARED_INSTRUCTIONS}

Generate a 2-page Executive Summary / Investor Brief with these sections:
1. Company Overview — What the company does, stage, and key metrics
2. Problem & Opportunity — The pain point being solved and why now
3. Solution — The product/service and its unique differentiators
4. Market Opportunity — TAM/SAM/SOM, target audience, competitive landscape
5. Business Model — Revenue streams, unit economics, pricing
6. Traction & Milestones — Key achievements, growth metrics, customers
7. Team — Founders, key hires, advisors, relevant backgrounds
8. Financial Highlights — Revenue, burn rate, runway, projections
9. The Ask — Investment amount, use of funds, terms, expected milestones

Make this compelling enough to get a follow-up meeting. Lead with strength.`,

  "investor-update": `${SHARED_INSTRUCTIONS}

Generate a Monthly/Quarterly Investor Update with these sections:
1. TL;DR — 3-4 sentence executive summary of the period
2. Key Metrics Dashboard — KPIs with current values and period-over-period changes (use subsections for each metric)
3. Highlights — Top 3-5 wins and achievements this period
4. Lowlights & Challenges — Honest assessment of what didn't go well and what was learned
5. Product Updates — New features, improvements, roadmap progress
6. Team Updates — New hires, departures, organizational changes
7. Financial Summary — Revenue, expenses, burn, runway
8. Asks — Specific requests from investors (intros, advice, resources)
9. Upcoming Milestones — What to expect in the next 30-90 days

Be transparent and data-driven. Investors respect honesty about challenges.`,

  "board-deck": `${SHARED_INSTRUCTIONS}

Generate a Board Meeting Deck / Report with these sections:
1. Executive Summary — High-level state of the business (1 paragraph)
2. Financial Performance — Revenue, expenses, margins, cash position, burn rate, runway (use subsections for each category)
3. Key Performance Indicators — Critical metrics with trends and analysis
4. Strategic Progress — Progress against quarterly/annual strategic goals
5. Product & Technology — Development progress, technical milestones, architecture decisions
6. Go-to-Market — Sales pipeline, marketing performance, customer acquisition
7. Team & Culture — Headcount, hiring progress, retention, culture initiatives
8. Risk Assessment — Top risks, mitigation strategies, emerging threats
9. Decisions Needed — Specific items requiring board input or approval
10. Forward Outlook — Plans and projections for next quarter

Format for board-level scrutiny. Be thorough and analytically rigorous.`,

  "company-overview": `${SHARED_INSTRUCTIONS}

Generate a Comprehensive Company Overview document with these sections:
1. About Us — Company history, mission, vision, and core values
2. What We Do — Detailed product/service description with key features (use subsections for each product/service)
3. Our Market — Industry overview, target audience, market size, trends
4. Our Approach — Methodology, technology, unique differentiators, competitive advantages
5. Our Team — Leadership team, key personnel, advisors, culture
6. Our Track Record — Achievements, case studies, customer testimonials, metrics
7. Our Partners & Ecosystem — Strategic partnerships, integrations, community
8. Contact & Next Steps — How to engage, offices, key contacts

Make this suitable for partners, enterprise clients, and sophisticated stakeholders.`,
};

// ── Generator Functions ─────────────────────────────────────────────────────

function buildUserPrompt(
  analysis: BusinessAnalysis,
  documentType: DocumentType,
): string {
  return `Generate a ${documentType.replace(/-/g, " ")} for the following business:

BUSINESS ANALYSIS:
${JSON.stringify(analysis, null, 2)}

Return ONLY the JSON object matching the schema. No markdown, no code fences, no explanation.`;
}

function buildRevisionPrompt(
  originalContent: DocumentContent,
  feedback: string,
  specificSections?: string[],
): string {
  const sectionInstruction = specificSections?.length
    ? `Focus your revisions specifically on these sections: ${specificSections.join(", ")}. Keep other sections largely unchanged unless the feedback clearly applies to them.`
    : "Apply the feedback across the entire document as appropriate.";

  return `Revise the following business document based on user feedback.

CURRENT DOCUMENT:
${JSON.stringify(originalContent, null, 2)}

USER FEEDBACK:
${feedback}

${sectionInstruction}

Return the COMPLETE revised document as a JSON object matching the same schema. Include ALL sections (revised and unrevised). No markdown, no code fences, no explanation.`;
}

export function getSystemPrompt(documentType: DocumentType): string {
  return DOCUMENT_PROMPTS[documentType];
}

export function getRevisionSystemPrompt(): string {
  return `${SHARED_INSTRUCTIONS}

You are revising an existing document based on user feedback. Preserve the overall structure and quality while incorporating the requested changes. Maintain consistency in tone and style throughout.`;
}

export function getUserPrompt(
  analysis: BusinessAnalysis,
  documentType: DocumentType,
): string {
  return buildUserPrompt(analysis, documentType);
}

export function getRevisionUserPrompt(
  originalContent: DocumentContent,
  feedback: string,
  specificSections?: string[],
): string {
  return buildRevisionPrompt(originalContent, feedback, specificSections);
}

export function parseDocumentResponse(rawText: string): DocumentContent {
  let text = rawText.trim();
  // Strip markdown code fences if present
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  const parsed = JSON.parse(text) as DocumentContent;

  // Basic validation
  if (!parsed.sections || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    throw new Error("AI returned invalid document content: no sections");
  }

  if (!parsed.metadata || !parsed.metadata.companyName) {
    throw new Error("AI returned invalid document content: missing metadata");
  }

  return parsed;
}
