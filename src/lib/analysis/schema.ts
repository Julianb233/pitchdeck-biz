import { z } from "zod";

// ── Business Analysis JSON Schema ──────────────────────────────────────────

export const BusinessModelSchema = z.object({
  type: z
    .string()
    .describe("e.g. SaaS, marketplace, e-commerce, services, hardware"),
  revenueStreams: z.array(z.string()),
  costStructure: z.array(z.string()).optional(),
  keyPartners: z.array(z.string()).optional(),
  keyActivities: z.array(z.string()).optional(),
});

export const ValuePropositionSchema = z.object({
  headline: z.string().describe("One-liner value prop"),
  description: z.string().describe("2-3 sentence expansion"),
  painPoints: z.array(z.string()),
  solutions: z.array(z.string()),
  uniqueDifferentiators: z.array(z.string()),
});

export const MarketAnalysisSchema = z.object({
  targetAudience: z.string(),
  marketSize: z.string().optional().describe("TAM/SAM/SOM if available"),
  competitors: z.array(z.string()).optional(),
  trends: z.array(z.string()).optional(),
  positioning: z.string().optional(),
});

export const TeamSchema = z.object({
  members: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      background: z.string().optional(),
    })
  ),
  teamStrengths: z.array(z.string()).optional(),
  advisors: z.array(z.string()).optional(),
});

export const FinancialsSchema = z.object({
  stage: z
    .string()
    .describe("e.g. pre-revenue, early revenue, growth, profitable"),
  fundingHistory: z.array(z.string()).optional(),
  currentAsk: z.string().optional().describe("Current fundraise amount/terms"),
  keyMetrics: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  projections: z.string().optional(),
});

export const BrandEssenceSchema = z.object({
  mission: z.string(),
  vision: z.string().optional(),
  tone: z.string().describe("e.g. professional, playful, bold, trustworthy"),
  coreValues: z.array(z.string()).optional(),
  tagline: z.string().optional(),
});

export const BusinessAnalysisSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  status: z.enum(["complete", "partial", "failed"]),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Overall confidence in analysis quality"),
  summary: z.string().describe("2-3 sentence executive summary"),
  businessModel: BusinessModelSchema,
  valueProposition: ValuePropositionSchema,
  market: MarketAnalysisSchema,
  team: TeamSchema,
  financials: FinancialsSchema,
  brandEssence: BrandEssenceSchema,
  rawInputSummary: z
    .string()
    .optional()
    .describe("Summary of what input data was provided"),
  warnings: z
    .array(z.string())
    .optional()
    .describe("Areas where data was sparse or ambiguous"),
});

// ── TypeScript types ───────────────────────────────────────────────────────

export type BusinessModel = z.infer<typeof BusinessModelSchema>;
export type ValueProposition = z.infer<typeof ValuePropositionSchema>;
export type MarketAnalysis = z.infer<typeof MarketAnalysisSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type Financials = z.infer<typeof FinancialsSchema>;
export type BrandEssence = z.infer<typeof BrandEssenceSchema>;
export type BusinessAnalysis = z.infer<typeof BusinessAnalysisSchema>;

// ── Upload types ───────────────────────────────────────────────────────────

export const UploadResultSchema = z.object({
  fileId: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  sizeBytes: z.number(),
  extractedText: z.string().optional(),
});

export type UploadResult = z.infer<typeof UploadResultSchema>;

export const TranscriptionResultSchema = z.object({
  text: z.string(),
  durationSeconds: z.number().optional(),
  language: z.string().optional(),
});

export type TranscriptionResult = z.infer<typeof TranscriptionResultSchema>;
