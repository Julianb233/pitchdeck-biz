/**
 * Pitch Coach Session Manager
 *
 * Manages the state of an AI pitch coaching session, accumulating
 * per-slide feedback and producing a final session summary.
 */

import type { SlideContent } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PitchFeedback {
  overallScore: number; // 1-100
  clarity: { score: number; feedback: string };
  confidence: { score: number; feedback: string };
  pacing: { score: number; feedback: string };
  contentCoverage: { score: number; feedback: string };
  suggestions: string[];
  strongPoints: string[];
}

export interface SlideFeedback {
  slideNumber: number;
  slideTitle: string;
  slideType: string;
  userTranscript: string;
  feedback: PitchFeedback;
  timestamp: number;
}

export interface SessionSummary {
  sessionId: string;
  totalSlides: number;
  slidesReviewed: number;
  overallScore: number;
  categoryScores: {
    clarity: number;
    confidence: number;
    pacing: number;
    contentCoverage: number;
  };
  topStrengths: string[];
  topImprovements: string[];
  slideBreakdown: Array<{
    slideNumber: number;
    slideTitle: string;
    score: number;
    keyFeedback: string;
  }>;
  durationMinutes: number;
}

// ── Session Class ─────────────────────────────────────────────────────────────

export class PitchCoachSession {
  public readonly sessionId: string;
  public readonly userId: string;
  public readonly deckSlides: SlideContent[];
  public readonly startedAt: number;
  private feedbackHistory: SlideFeedback[] = [];

  constructor(sessionId: string, userId: string, slides: SlideContent[]) {
    this.sessionId = sessionId;
    this.userId = userId;
    this.deckSlides = slides;
    this.startedAt = Date.now();
  }

  /** Add feedback for a slide presentation attempt. */
  addFeedback(slideFeedback: SlideFeedback): void {
    this.feedbackHistory.push(slideFeedback);
  }

  /** Get all feedback accumulated so far. */
  getFeedbackHistory(): SlideFeedback[] {
    return [...this.feedbackHistory];
  }

  /** Get the number of slides that have been reviewed. */
  getSlidesReviewed(): number {
    const uniqueSlides = new Set(
      this.feedbackHistory.map((f) => f.slideNumber)
    );
    return uniqueSlides.size;
  }

  /** Calculate current running average score. */
  getCurrentScore(): number {
    if (this.feedbackHistory.length === 0) return 0;
    const total = this.feedbackHistory.reduce(
      (sum, f) => sum + f.feedback.overallScore,
      0
    );
    return Math.round(total / this.feedbackHistory.length);
  }

  /** Generate the final session summary. */
  generateSummary(): SessionSummary {
    const history = this.feedbackHistory;
    const durationMs = Date.now() - this.startedAt;

    if (history.length === 0) {
      return {
        sessionId: this.sessionId,
        totalSlides: this.deckSlides.length,
        slidesReviewed: 0,
        overallScore: 0,
        categoryScores: {
          clarity: 0,
          confidence: 0,
          pacing: 0,
          contentCoverage: 0,
        },
        topStrengths: [],
        topImprovements: [],
        slideBreakdown: [],
        durationMinutes: Math.round(durationMs / 60000),
      };
    }

    // Compute averages
    const avg = (arr: number[]) =>
      Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

    const clarityScores = history.map((f) => f.feedback.clarity.score);
    const confidenceScores = history.map((f) => f.feedback.confidence.score);
    const pacingScores = history.map((f) => f.feedback.pacing.score);
    const coverageScores = history.map(
      (f) => f.feedback.contentCoverage.score
    );
    const overallScores = history.map((f) => f.feedback.overallScore);

    // Collect all strengths and suggestions, rank by frequency
    const strengthCounts = new Map<string, number>();
    const suggestionCounts = new Map<string, number>();

    for (const fb of history) {
      for (const s of fb.feedback.strongPoints) {
        strengthCounts.set(s, (strengthCounts.get(s) ?? 0) + 1);
      }
      for (const s of fb.feedback.suggestions) {
        suggestionCounts.set(s, (suggestionCounts.get(s) ?? 0) + 1);
      }
    }

    const topStrengths = [...strengthCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([text]) => text);

    const topImprovements = [...suggestionCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([text]) => text);

    // Per-slide breakdown (use latest feedback per slide)
    const latestPerSlide = new Map<number, SlideFeedback>();
    for (const fb of history) {
      latestPerSlide.set(fb.slideNumber, fb);
    }

    const slideBreakdown = [...latestPerSlide.values()]
      .sort((a, b) => a.slideNumber - b.slideNumber)
      .map((fb) => ({
        slideNumber: fb.slideNumber,
        slideTitle: fb.slideTitle,
        score: fb.feedback.overallScore,
        keyFeedback:
          fb.feedback.suggestions[0] ??
          fb.feedback.strongPoints[0] ??
          "Good delivery.",
      }));

    return {
      sessionId: this.sessionId,
      totalSlides: this.deckSlides.length,
      slidesReviewed: this.getSlidesReviewed(),
      overallScore: avg(overallScores),
      categoryScores: {
        clarity: avg(clarityScores),
        confidence: avg(confidenceScores),
        pacing: avg(pacingScores),
        contentCoverage: avg(coverageScores),
      },
      topStrengths,
      topImprovements,
      slideBreakdown,
      durationMinutes: Math.round(durationMs / 60000),
    };
  }

  /** Serialize session state for storage. */
  toJSON(): Record<string, unknown> {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startedAt: this.startedAt,
      slidesCount: this.deckSlides.length,
      feedbackHistory: this.feedbackHistory,
    };
  }
}
