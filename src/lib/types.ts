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
