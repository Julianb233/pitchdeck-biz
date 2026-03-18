/**
 * Google Slides Export Generator
 *
 * Creates a Google Slides presentation from deck JSON using the Google Slides API.
 * Requires GOOGLE_SERVICE_ACCOUNT_KEY env var with a JSON service account key.
 *
 * The service account must have Google Slides API and Google Drive API enabled.
 */

import type { DeckContent, SlideContent, SlideType } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
}

const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: "#1a1a2e",
  secondary: "#16213e",
  accent: "#e94560",
  text: "#ffffff",
  background: "#0f0f23",
};

interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

interface SlideRequest {
  createSlide: {
    objectId: string;
    insertionIndex: number;
    slideLayoutReference: { predefinedLayout: string };
    placeholderIdMappings?: Array<{
      layoutPlaceholder: { type: string; index: number };
      objectId: string;
    }>;
  };
}

interface TextInsertRequest {
  insertText: {
    objectId: string;
    text: string;
    insertionIndex?: number;
  };
}

interface TextStyleRequest {
  updateTextStyle: {
    objectId: string;
    style: Record<string, unknown>;
    textRange: { type: string; startIndex?: number; endIndex?: number };
    fields: string;
  };
}

interface BackgroundRequest {
  updatePageProperties: {
    objectId: string;
    pageProperties: {
      pageBackgroundFill: {
        solidFill: {
          color: { rgbColor: RgbColor };
        };
      };
    };
    fields: string;
  };
}

type SlidesRequest =
  | SlideRequest
  | TextInsertRequest
  | TextStyleRequest
  | BackgroundRequest
  | Record<string, unknown>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): RgbColor {
  const clean = hex.replace(/^#/, "");
  return {
    red: parseInt(clean.substring(0, 2), 16) / 255,
    green: parseInt(clean.substring(2, 4), 16) / 255,
    blue: parseInt(clean.substring(4, 6), 16) / 255,
  };
}

/**
 * Map our internal slide types to Google Slides predefined layouts.
 * See: https://developers.google.com/slides/api/reference/rest/v1/presentations.pages#PredefinedLayout
 */
function getLayoutForSlideType(type: SlideType): string {
  switch (type) {
    case "title":
    case "closing":
      return "TITLE";
    case "problem":
    case "solution":
    case "market":
    case "product":
    case "business-model":
    case "traction":
    case "financials":
    case "ask":
    case "why-now":
    case "competition":
    case "competitive-landscape":
    case "executive-summary":
    case "business-overview":
    case "cash-flow":
    case "loan-request":
    case "repayment-plan":
    case "campaign-details":
    case "rewards":
    case "values-impact":
      return "TITLE_AND_BODY";
    case "team":
    case "management-team":
      return "TITLE_AND_TWO_COLUMNS";
    case "founder-story":
    case "hook":
    case "social-proof":
    case "collateral":
      return "SECTION_HEADER";
    default:
      return "TITLE_AND_BODY";
  }
}

// ── Core Functions ────────────────────────────────────────────────────────────

/**
 * Build the batch update request body for creating a full presentation.
 */
export function buildPresentation(
  deck: DeckContent,
  brandColors?: BrandColors
): SlidesRequest[] {
  const colors = brandColors ?? DEFAULT_BRAND_COLORS;
  const requests: SlidesRequest[] = [];

  deck.slides.forEach((slide, index) => {
    const slideId = `slide_${index}`;
    const titleId = `${slideId}_title`;
    const bodyId = `${slideId}_body`;

    // Create slide with layout
    requests.push({
      createSlide: {
        objectId: slideId,
        insertionIndex: index,
        slideLayoutReference: {
          predefinedLayout: getLayoutForSlideType(slide.type),
        },
        placeholderIdMappings: [
          {
            layoutPlaceholder: { type: "TITLE", index: 0 },
            objectId: titleId,
          },
          {
            layoutPlaceholder: { type: "BODY", index: 0 },
            objectId: bodyId,
          },
        ],
      },
    });

    // Set slide background
    requests.push({
      updatePageProperties: {
        objectId: slideId,
        pageProperties: {
          pageBackgroundFill: {
            solidFill: {
              color: { rgbColor: hexToRgb(colors.background) },
            },
          },
        },
        fields: "pageBackgroundFill.solidFill.color",
      },
    });

    // Add title text
    const titleText = slide.subtitle
      ? `${slide.title}\n${slide.subtitle}`
      : slide.title;
    requests.push({
      insertText: {
        objectId: titleId,
        text: titleText,
      },
    });

    // Style title
    requests.push({
      updateTextStyle: {
        objectId: titleId,
        style: {
          foregroundColor: {
            opaqueColor: { rgbColor: hexToRgb(colors.text) },
          },
          bold: true,
          fontSize: { magnitude: 28, unit: "PT" },
        },
        textRange: { type: "ALL" },
        fields: "foregroundColor,bold,fontSize",
      },
    });

    // Add body content (bullet points or subtitle-only slides)
    const bodyContent = formatSlideBody(slide);
    if (bodyContent) {
      requests.push({
        insertText: {
          objectId: bodyId,
          text: bodyContent,
        },
      });

      requests.push({
        updateTextStyle: {
          objectId: bodyId,
          style: {
            foregroundColor: {
              opaqueColor: { rgbColor: hexToRgb(colors.text) },
            },
            fontSize: { magnitude: 16, unit: "PT" },
          },
          textRange: { type: "ALL" },
          fields: "foregroundColor,fontSize",
        },
      });
    }
  });

  return requests;
}

/**
 * Format slide bullet points and notes into body text.
 */
function formatSlideBody(slide: SlideContent): string | null {
  const parts: string[] = [];

  if (slide.bulletPoints && slide.bulletPoints.length > 0) {
    parts.push(slide.bulletPoints.map((bp) => `\u2022 ${bp}`).join("\n"));
  }

  if (slide.notes) {
    if (parts.length > 0) parts.push("");
    parts.push(`Speaker Notes: ${slide.notes}`);
  }

  return parts.length > 0 ? parts.join("\n") : null;
}

/**
 * Apply branding colors to presentation theme.
 * Returns batch update requests for theme color overrides.
 */
export function applyBranding(
  presentationId: string,
  brandColors: BrandColors
): SlidesRequest[] {
  // Theme color updates are applied at the master level
  // For MVP, colors are applied per-slide in buildPresentation
  // This function is a hook for future master-level theme updates
  return [
    {
      updatePageProperties: {
        objectId: presentationId,
        pageProperties: {
          pageBackgroundFill: {
            solidFill: {
              color: { rgbColor: hexToRgb(brandColors.background) },
            },
          },
        },
        fields: "pageBackgroundFill.solidFill.color",
      },
    },
  ];
}

/**
 * Get a Google auth token from service account credentials.
 * Uses the JWT grant flow for server-to-server authentication.
 */
async function getGoogleAuthToken(
  serviceAccountKey: Record<string, string>
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: serviceAccountKey.client_email,
    scope:
      "https://www.googleapis.com/auth/presentations https://www.googleapis.com/auth/drive",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  // Import the crypto module for JWT signing
  const crypto = await import("crypto");
  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const claimB64 = Buffer.from(JSON.stringify(claim)).toString("base64url");
  const signInput = `${headerB64}.${claimB64}`;

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signInput);
  const signature = sign
    .sign(serviceAccountKey.private_key, "base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${signInput}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Google auth failed: ${err}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string };
  return tokenData.access_token;
}

/**
 * Create a Google Slides presentation and return its URL.
 */
export async function createGoogleSlidesPresentation(
  deck: DeckContent,
  brandColors?: BrandColors
): Promise<{ url: string; presentationId: string }> {
  const serviceAccountKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKeyRaw) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not configured. " +
        "Please set up a Google Cloud service account with Slides API access."
    );
  }

  const serviceAccountKey = JSON.parse(serviceAccountKeyRaw) as Record<
    string,
    string
  >;
  const accessToken = await getGoogleAuthToken(serviceAccountKey);
  const colors = brandColors ?? DEFAULT_BRAND_COLORS;

  // Step 1: Create an empty presentation
  const createRes = await fetch(
    "https://slides.googleapis.com/v1/presentations",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title:
          deck.slides[0]?.title ??
          "Pitch Deck — Generated by pitchdeck.biz",
      }),
    }
  );

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create presentation: ${err}`);
  }

  const presentation = (await createRes.json()) as {
    presentationId: string;
  };
  const presentationId = presentation.presentationId;

  // Step 2: Delete the default blank slide
  const deleteDefault: SlidesRequest[] = [
    {
      deleteObject: {
        objectId: "p", // default first slide ID
      },
    },
  ];

  await fetch(
    `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests: deleteDefault }),
    }
  );

  // Step 3: Build and apply all slides
  const slideRequests = buildPresentation(deck, colors);

  const batchRes = await fetch(
    `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests: slideRequests }),
    }
  );

  if (!batchRes.ok) {
    const err = await batchRes.text();
    throw new Error(`Failed to populate slides: ${err}`);
  }

  // Step 4: Make the presentation publicly viewable
  await fetch(
    `https://www.googleapis.com/drive/v3/files/${presentationId}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: "reader",
        type: "anyone",
      }),
    }
  );

  return {
    presentationId,
    url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
  };
}
