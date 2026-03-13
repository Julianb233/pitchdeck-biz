import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------------------------------------------------------------
// Gemini Image Generation Service
// Uses Google Gemini API for generating pitch deck visuals & branding assets.
// Falls back to placeholder gradient SVGs when no API key is configured.
// ---------------------------------------------------------------------------

const API_KEY = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? "";

function getClient() {
  if (!API_KEY) return null;
  return new GoogleGenerativeAI(API_KEY);
}

// ---------------------------------------------------------------------------
// Fallback SVG generators (no API key required)
// ---------------------------------------------------------------------------

function placeholderGradientSvg(
  width: number,
  height: number,
  primary: string,
  secondary: string,
  label?: string,
): string {
  const escaped = (label ?? "Generated Image").replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}" />
      <stop offset="100%" stop-color="${secondary}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" rx="12" />
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui, sans-serif" font-size="18" fill="white" opacity="0.85">
    ${escaped}
  </text>
</svg>`;
}

// ---------------------------------------------------------------------------
// Rate limiter (simple in-memory token bucket)
// ---------------------------------------------------------------------------

interface RateBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, RateBucket>();
const MAX_TOKENS = 10;
const REFILL_INTERVAL_MS = 60_000; // 1 minute

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    buckets.set(key, bucket);
  }

  const elapsed = now - bucket.lastRefill;
  if (elapsed > REFILL_INTERVAL_MS) {
    bucket.tokens = MAX_TOKENS;
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) return false;
  bucket.tokens -= 1;
  return true;
}

// ---------------------------------------------------------------------------
// Core generation functions
// ---------------------------------------------------------------------------

/**
 * Generate a graphic for a pitch deck slide.
 * Returns a base64 data-URI string or an SVG placeholder.
 */
export async function generateDeckGraphic(
  prompt: string,
  style: string,
  colors: { primary: string; secondary: string },
): Promise<string> {
  const client = getClient();
  if (!client) {
    return `data:image/svg+xml;base64,${Buffer.from(placeholderGradientSvg(800, 600, colors.primary, colors.secondary, prompt.slice(0, 60))).toString("base64")}`;
  }

  if (!checkRateLimit("deck-graphic")) {
    throw new Error("Rate limit exceeded. Please wait before generating more images.");
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const fullPrompt = [
      `Create a professional pitch deck graphic.`,
      `Style: ${style}`,
      `Primary color: ${colors.primary}, Secondary color: ${colors.secondary}`,
      `Description: ${prompt}`,
      `The image should be clean, modern, and suitable for a business presentation slide.`,
    ].join("\n");

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        responseMimeType: "text/plain",
      },
    });

    const text = result.response.text();

    // If the model returns a data URI or base64, use it directly
    if (text.startsWith("data:image")) return text;

    // Otherwise return the SVG fallback with the AI-generated description
    return `data:image/svg+xml;base64,${Buffer.from(placeholderGradientSvg(800, 600, colors.primary, colors.secondary, text.slice(0, 80))).toString("base64")}`;
  } catch (error) {
    console.error("[gemini-image] generateDeckGraphic error:", error);
    return `data:image/svg+xml;base64,${Buffer.from(placeholderGradientSvg(800, 600, colors.primary, colors.secondary, "Generation failed")).toString("base64")}`;
  }
}

/**
 * Generate a branding asset of the specified type.
 * Returns base64 data-URI or SVG placeholder.
 * @param referenceImages Optional array of reference image data URIs (max 3) to inform generation.
 */
export async function generateBrandAsset(
  type: "social" | "mockup" | "collateral" | "identity",
  prompt: string,
  brandColors: { primary?: string; secondary?: string; accent?: string },
  referenceImages: string[] = [],
): Promise<string> {
  const primary = brandColors.primary ?? "#4F46E5";
  const secondary = brandColors.secondary ?? "#7C3AED";

  const dimensions: Record<string, [number, number]> = {
    social: [1200, 630],
    mockup: [1024, 768],
    collateral: [800, 1100],
    identity: [800, 800],
  };
  const [w, h] = dimensions[type] ?? [800, 600];

  const client = getClient();
  if (!client) {
    return `data:image/svg+xml;base64,${Buffer.from(placeholderGradientSvg(w, h, primary, secondary, `${type}: ${prompt.slice(0, 40)}`)).toString("base64")}`;
  }

  if (!checkRateLimit("brand-asset")) {
    throw new Error("Rate limit exceeded. Please wait before generating more assets.");
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const typeDescriptions: Record<string, string> = {
      social: "social media post graphic (1200x630)",
      mockup: "product/service mockup image (1024x768)",
      collateral: "business collateral like a flyer or brochure cover (800x1100)",
      identity: "brand identity element like a logo mark or icon (800x800)",
    };

    const promptParts: string[] = [
      `Create a ${typeDescriptions[type]} for a brand.`,
      `Brand colors: primary ${primary}, secondary ${secondary}${brandColors.accent ? `, accent ${brandColors.accent}` : ""}`,
      `Description: ${prompt}`,
      `Make it professional, modern, and visually compelling.`,
    ];

    if (referenceImages.length > 0) {
      promptParts.push(`Reference images provided: ${referenceImages.length} image(s) to use as style/context reference.`);
    }

    // Build content parts: text prompt + inline reference images
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contentParts: any[] = [{ text: promptParts.join("\n") }];
    for (const dataUri of referenceImages.slice(0, 3)) {
      const mimeMatch = dataUri.match(/^data:(image\/[^;]+);base64,/);
      if (mimeMatch) {
        const mimeType = mimeMatch[1];
        const base64Data = dataUri.slice(dataUri.indexOf(",") + 1);
        contentParts.push({ inlineData: { mimeType, data: base64Data } });
      }
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: contentParts }],
      generationConfig: { responseMimeType: "text/plain" },
    });

    const text = result.response.text();
    if (text.startsWith("data:image")) return text;

    return `data:image/svg+xml;base64,${Buffer.from(placeholderGradientSvg(w, h, primary, secondary, text.slice(0, 80))).toString("base64")}`;
  } catch (error) {
    console.error("[gemini-image] generateBrandAsset error:", error);
    return `data:image/svg+xml;base64,${Buffer.from(placeholderGradientSvg(w, h, primary, secondary, "Generation failed")).toString("base64")}`;
  }
}

/**
 * Generate a cohesive color scheme for a given industry and mood.
 */
export async function generateColorScheme(
  industry: string,
  mood: string,
): Promise<{ primary: string; secondary: string; accent: string; background: string }> {
  const client = getClient();

  // Algorithmic fallback
  const fallback = algorithmicColorScheme(industry, mood);
  if (!client) return fallback;

  if (!checkRateLimit("color-scheme")) {
    return fallback;
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = [
      `Generate a professional color scheme for a ${industry} company with a ${mood} mood.`,
      `Return ONLY a JSON object with exactly these keys: primary, secondary, accent, background.`,
      `Each value should be a hex color code (e.g. "#4F46E5").`,
      `No explanation, just the JSON.`,
    ].join("\n");

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;

    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.primary && parsed.secondary && parsed.accent && parsed.background) {
      return {
        primary: String(parsed.primary),
        secondary: String(parsed.secondary),
        accent: String(parsed.accent),
        background: String(parsed.background),
      };
    }
    return fallback;
  } catch (error) {
    console.error("[gemini-image] generateColorScheme error:", error);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Algorithmic color scheme fallback
// ---------------------------------------------------------------------------

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function algorithmicColorScheme(
  industry: string,
  mood: string,
): { primary: string; secondary: string; accent: string; background: string } {
  const seed = hashString(`${industry}-${mood}`);
  const baseHue = seed % 360;

  const moodMap: Record<string, { saturation: number; lightness: number }> = {
    professional: { saturation: 60, lightness: 45 },
    energetic: { saturation: 80, lightness: 50 },
    calm: { saturation: 40, lightness: 55 },
    bold: { saturation: 85, lightness: 40 },
    elegant: { saturation: 35, lightness: 35 },
    playful: { saturation: 75, lightness: 55 },
    trustworthy: { saturation: 55, lightness: 42 },
  };

  const m = moodMap[mood.toLowerCase()] ?? { saturation: 60, lightness: 45 };

  return {
    primary: hslToHex(baseHue, m.saturation, m.lightness),
    secondary: hslToHex(baseHue + 30, m.saturation - 10, m.lightness + 10),
    accent: hslToHex(baseHue + 180, m.saturation + 10, m.lightness + 5),
    background: hslToHex(baseHue, 10, 97),
  };
}
