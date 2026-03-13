import { NextRequest, NextResponse } from "next/server";
import { logger } from "./logger";

/**
 * Validates the API key from the request's Authorization header.
 * Expects: Authorization: Bearer <API_KEY>
 *
 * The server-side key is read from ANALYSIS_API_KEY env var.
 * If no key is configured, auth is bypassed in development mode.
 */
export function validateApiKey(request: NextRequest): NextResponse | null {
  const apiKey = process.env.ANALYSIS_API_KEY;

  // In development without a configured key, allow all requests
  if (!apiKey && process.env.NODE_ENV === "development") {
    logger.warn("API key not configured — auth bypassed in development mode");
    return null;
  }

  if (!apiKey) {
    logger.error("ANALYSIS_API_KEY not configured in production");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header. Use: Bearer <API_KEY>" },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7);
  if (token !== apiKey) {
    logger.warn("Invalid API key attempt", {
      ip: request.headers.get("x-forwarded-for") ?? "unknown",
    });
    return NextResponse.json({ error: "Invalid API key" }, { status: 403 });
  }

  return null; // Auth passed
}
