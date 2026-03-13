/**
 * Shared types for pitchdeck.biz
 *
 * Re-exports from the analysis schema for convenience,
 * plus additional app-wide types.
 */

// Re-export analysis types
export type {
  BusinessAnalysis,
  BusinessModel,
  ValueProposition,
  MarketAnalysis,
  Team,
  Financials,
  BrandEssence,
  UploadResult,
  TranscriptionResult,
} from "./analysis/schema";

export {
  BusinessAnalysisSchema,
  UploadResultSchema,
  TranscriptionResultSchema,
} from "./analysis/schema";

// Onboarding flow types

export type OnboardingInputMethod = "file" | "voice";

export type OnboardingStep = "input" | "processing" | "review";

export interface OnboardingState {
  step: OnboardingStep;
  inputMethod: OnboardingInputMethod | null;
  extractedText: string | null;
  transcription: string | null;
  uploadedFiles: UploadedFileInfo[];
  analysis: import("./analysis/schema").BusinessAnalysis | null;
  error: string | null;
  isProcessing: boolean;
}

export interface UploadedFileInfo {
  name: string;
  type: string;
  size: number;
}

// API response types

export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  details?: string;
  data?: T;
}

export interface UploadApiResponse {
  success: boolean;
  files: Array<{
    fileId: string;
    fileName: string;
    fileType: string;
    sizeBytes: number;
    extractedText?: string;
    isAudio?: boolean;
  }>;
  error?: string;
}

export interface TranscribeApiResponse {
  success: boolean;
  transcription?: {
    text: string;
    durationSeconds?: number;
    language?: string;
  };
  error?: string;
}

export interface AnalyzeApiResponse {
  success: boolean;
  analysis?: import("./analysis/schema").BusinessAnalysis;
  error?: string;
  details?: string;
}

// Pitch deck types

export type DeckStyle = "minimal" | "bold" | "corporate" | "creative";

export interface DeckGenerationRequest {
  analysisId: string;
  style: DeckStyle;
  slideCount?: number;
}

// Slide Content Types

export type SlideType =
  | "title"
  | "problem"
  | "solution"
  | "market"
  | "product"
  | "business-model"
  | "traction"
  | "team"
  | "financials"
  | "ask"
  | "why-now"
  | "closing";

export interface SlideContent {
  slideNumber: number;
  type: SlideType;
  title: string;
  subtitle?: string;
  bulletPoints?: string[];
  notes?: string;
  imagePrompt?: string;
  /** Generated image as a data URI (SVG or base64 PNG) attached server-side */
  generatedImage?: string;
}

// Deck Content (full deliverable output from AI generation)

export interface DeckContent {
  slides: SlideContent[];
  sellSheet: {
    headline: string;
    subheadline: string;
    sections: { title: string; content: string }[];
  };
  onePager: {
    headline: string;
    sections: { title: string; content: string }[];
  };
  brandKit: {
    colorRationale: string;
    fontPairing: { heading: string; body: string };
    brandVoice: string;
    logoDirection: string;
  };
}
