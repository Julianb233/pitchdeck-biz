import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import type { DiscoverySession, StepResponse } from "@/types/discovery";
import { analysisLimiter, getClientIp, applyRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * In-memory session store. In production this would use Redis or Supabase,
 * but for the MVP we keep it simple and stateless-friendly by also accepting
 * the full session object from the client on PUT.
 */
const sessions = new Map<string, DiscoverySession>();

/**
 * POST /api/discovery
 * Create a new discovery session.
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    analysisLimiter,
    ip,
    "Too many requests. Please try again later."
  );
  if (limited) return limited;

  const session: DiscoverySession = {
    id: uuidv4(),
    steps: [],
    status: "in-progress",
    createdAt: new Date().toISOString(),
  };

  sessions.set(session.id, session);

  return NextResponse.json({ success: true, session });
}

/**
 * PUT /api/discovery
 * Update a step response in the session.
 *
 * Body: { sessionId: string, stepResponse: StepResponse }
 */
export async function PUT(request: NextRequest) {
  const ip = getClientIp(request);
  const limited = applyRateLimit(
    analysisLimiter,
    ip,
    "Too many requests. Please try again later."
  );
  if (limited) return limited;

  try {
    const body = await request.json();
    const { sessionId, stepResponse } = body as {
      sessionId: string;
      stepResponse: StepResponse;
    };

    if (!sessionId || !stepResponse || !stepResponse.stepId) {
      return NextResponse.json(
        { error: "sessionId and stepResponse with stepId are required" },
        { status: 400 }
      );
    }

    let session = sessions.get(sessionId);

    if (!session) {
      // Allow client-side session reconstruction
      session = {
        id: sessionId,
        steps: [],
        status: "in-progress",
        createdAt: new Date().toISOString(),
      };
    }

    // Upsert: replace existing step response or add new one
    const existingIdx = session.steps.findIndex(
      (s) => s.stepId === stepResponse.stepId
    );
    if (existingIdx >= 0) {
      session.steps[existingIdx] = stepResponse;
    } else {
      session.steps.push(stepResponse);
    }

    sessions.set(sessionId, session);

    return NextResponse.json({ success: true, session });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
