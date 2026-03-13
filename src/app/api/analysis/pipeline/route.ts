import { NextRequest, NextResponse } from "next/server";
import {
  validateApiKey,
  extractTextFromFile,
  imageToBase64,
  validateFile,
  transcribeAudio,
  analyzeBusinessInfo,
  logger,
} from "@/lib/analysis";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import { saveDeck } from "@/lib/supabase/decks";

export const runtime = "nodejs";

/**
 * POST /api/analysis/pipeline
 *
 * Full orchestration endpoint: upload files + optional context → analysis.
 *
 * Accepts multipart form data:
 *   - files: one or more files (PDF, DOCX, images, audio)
 *   - context: (optional) additional text context about the business
 *
 * Returns the complete structured business analysis JSON.
 */
export async function POST(request: NextRequest) {
  // Auth check
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const contextText = formData.get("context") as string | null;

    if ((!files || files.length === 0) && !contextText) {
      return NextResponse.json(
        { error: "Provide at least one file or context text." },
        { status: 400 }
      );
    }

    logger.info("Pipeline request", {
      fileCount: files.length,
      hasContext: !!contextText,
    });

    // ── Step 1: Process all files ──────────────────────────────────────
    const textParts: string[] = [];
    const images: string[] = [];
    const audioFiles: { buffer: Buffer; name: string; type: string }[] = [];
    const processedFiles: Array<{
      name: string;
      type: string;
      size: number;
      status: string;
    }> = [];

    for (const file of files) {
      const validation = validateFile(file.size, file.type);
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error, fileName: file.name },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.type.startsWith("audio/")) {
        audioFiles.push({ buffer, name: file.name, type: file.type });
        processedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          status: "queued_for_transcription",
        });
      } else if (file.type.startsWith("image/")) {
        images.push(imageToBase64(buffer, file.type));
        processedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          status: "processed_as_image",
        });
      } else {
        const text = await extractTextFromFile(buffer, file.type, file.name);
        if (text.trim()) {
          textParts.push(`[${file.name}]\n${text}`);
        }
        processedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          status: text.trim() ? "text_extracted" : "empty_content",
        });
      }
    }

    // ── Step 2: Transcribe audio files ─────────────────────────────────
    const transcriptions: string[] = [];
    for (const audio of audioFiles) {
      try {
        const result = await transcribeAudio(
          audio.buffer,
          audio.name,
          audio.type
        );
        transcriptions.push(result.text);
        const fileEntry = processedFiles.find((f) => f.name === audio.name);
        if (fileEntry) fileEntry.status = "transcribed";
      } catch (error) {
        logger.error("Audio transcription failed in pipeline", {
          fileName: audio.name,
          error: error instanceof Error ? error.message : String(error),
        });
        const fileEntry = processedFiles.find((f) => f.name === audio.name);
        if (fileEntry) fileEntry.status = "transcription_failed";
      }
    }

    // ── Step 3: Run AI analysis ────────────────────────────────────────
    const analysis = await analyzeBusinessInfo({
      textContent: textParts.length > 0 ? textParts.join("\n\n---\n\n") : undefined,
      imageBase64: images.length > 0 ? images : undefined,
      transcription:
        transcriptions.length > 0 ? transcriptions.join("\n\n") : undefined,
      additionalContext: contextText || undefined,
    });

    logger.info("Pipeline complete", {
      analysisId: analysis.id,
      confidence: analysis.confidence,
      filesProcessed: processedFiles.length,
    });

    // ── Step 4: Persist to Supabase (if authenticated) ──────────────
    let savedAnalysisId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Extract business name from analysis
        const businessName =
          analysis.valueProposition?.headline ||
          analysis.brandEssence?.tagline ||
          analysis.summary?.slice(0, 100) ||
          "Untitled Business";

        const { data: savedRow, error: insertError } = await supabase
          .from("analyses")
          .insert({
            user_id: user.id,
            business_name: businessName,
            analysis_data: analysis as unknown as Json,
            files_uploaded: processedFiles.map((f) => f.name) as Json,
          })
          .select("id")
          .single();

        if (insertError) {
          logger.error("Failed to save analysis to Supabase", {
            error: insertError.message,
          });
        } else {
          savedAnalysisId = savedRow.id;
          logger.info("Analysis saved to Supabase", { id: savedAnalysisId });
        }
      }
    } catch (saveErr) {
      logger.error("Supabase save error (non-fatal)", {
        error: saveErr instanceof Error ? saveErr.message : String(saveErr),
      });
    }

    // ── Step 5: Create deck record (if authenticated) ──────────────
    let deckId: string | null = null;
    if (savedAnalysisId) {
      try {
        const businessName =
          analysis.valueProposition?.headline ||
          analysis.brandEssence?.tagline ||
          analysis.summary?.slice(0, 100) ||
          "Untitled Deck";

        const supabase2 = await createClient();
        const { data: { user: deckUser } } = await supabase2.auth.getUser();

        if (deckUser) {
          const deck = await saveDeck(
            deckUser.id,
            businessName,
            analysis as unknown as Json,
            [] as Json // empty slides until deck generation
          );
          if (deck) {
            deckId = deck.id;
            logger.info("Deck record created", { deckId });
          }
        }
      } catch (deckErr) {
        logger.error("Deck creation error (non-fatal)", {
          error: deckErr instanceof Error ? deckErr.message : String(deckErr),
        });
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      analysisId: savedAnalysisId,
      deckId,
      meta: {
        filesProcessed: processedFiles,
        totalFiles: files.length,
      },
    });
  } catch (error) {
    logger.error("Pipeline failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error: "Pipeline failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
