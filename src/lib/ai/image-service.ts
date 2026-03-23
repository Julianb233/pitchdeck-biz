// ---------------------------------------------------------------------------
// Unified Image Generation Service
// Routes image generation to the optimal model based on purpose:
//   - Slide graphics & brand assets -> Gemini native image generation
//     (consistent branding, text accuracy, reference image support)
//   - Hero/stock images & mockups -> Imagen 4 Ultra
//     (photorealistic quality, high-detail imagery)
//   - Fallback -> AI-crafted SVGs or algorithmic placeholders
// ---------------------------------------------------------------------------

import { GoogleGenAI, Type } from "@google/genai";
import { generateMockupSVG } from "./mockup-svg-generator";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ImagePurpose =
  | "slide-graphic"
  | "hero-image"
  | "brand-asset"
  | "social-media"
  | "mockup";

export interface ImageGenerationOptions {
  purpose: ImagePurpose;
  prompt: string;
  brandColors?: string[];
  referenceImages?: string[]; // base64 data URIs
  aspectRatio?: string;
  style?: string;
  width?: number;
  height?: number;
  templateId?: string;
  brandName?: string;
}

export interface ImageGenerationResult {
  imageData: string; // data URI (base64 PNG or SVG)
  mimeType: string;
  model: string; // which model generated the image
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const IMAGEN_MODEL =
  process.env.IMAGEN_MODEL ?? "imagen-4.0-ultra-generate-001";
const SLIDE_IMAGE_MODEL =
  process.env.SLIDE_IMAGE_MODEL ?? "gemini-3-pro-image-preview";

// Fallback model when SLIDE_IMAGE_MODEL fails (e.g. preview quota exhausted)
const SLIDE_IMAGE_FALLBACK_MODEL = "gemini-2.5-flash-image";

const API_KEY =
  process.env.GOOGLE_API_KEY ??
  process.env.GEMINI_API_KEY ??
  "";

const IMAGEN_API_KEY =
  process.env.GOOGLE_IMAGEN_API_KEY ??
  process.env.GOOGLE_API_KEY ??
  process.env.GEMINI_API_KEY ??
  "";

// Purposes routed to Imagen (photorealistic)
const IMAGEN_PURPOSES = new Set<ImagePurpose>(["hero-image", "mockup"]);

// Purposes routed to Gemini native image gen (branded consistency)
const GEMINI_IMAGE_PURPOSES = new Set<ImagePurpose>([
  "slide-graphic",
  "brand-asset",
  "social-media",
]);

// Aspect ratios for each purpose (defaults)
const DEFAULT_ASPECT_RATIOS: Record<ImagePurpose, string> = {
  "slide-graphic": "16:9",
  "hero-image": "16:9",
  "brand-asset": "1:1",
  "social-media": "16:9",
  "mockup": "3:2",
};

// Dimensions for each purpose
const DEFAULT_DIMENSIONS: Record<ImagePurpose, [number, number]> = {
  "slide-graphic": [800, 600],
  "hero-image": [1200, 675],
  "brand-asset": [800, 800],
  "social-media": [1200, 630],
  "mockup": [1200, 800],
};

// ---------------------------------------------------------------------------
// Rate limiter (simple in-memory token bucket)
// ---------------------------------------------------------------------------

interface RateBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, RateBucket>();
const MAX_TOKENS = 10;
const REFILL_INTERVAL_MS = 60_000;

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
// Imagen 4 generation (photorealistic hero/stock imagery)
// ---------------------------------------------------------------------------

async function generateWithImagen(
  prompt: string,
  aspectRatio: string,
): Promise<ImageGenerationResult | null> {
  if (!IMAGEN_API_KEY) return null;

  try {
    // Dynamic import — skipped silently when @google/genai is not installed
    const genaiModule = await (Function(
      'return import("@google/genai")',
    )() as Promise<{
      GoogleGenAI: new (opts: { apiKey: string }) => {
        models: {
          generateImages: (params: {
            model: string;
            prompt: string;
            config: { numberOfImages: number; aspectRatio?: string; imageSize?: string };
          }) => Promise<{
            generatedImages?: Array<{
              image?: { imageBytes?: string };
            }>;
          }>;
        };
      };
    }>);

    const client = new genaiModule.GoogleGenAI({ apiKey: IMAGEN_API_KEY });

    const response = await client.models.generateImages({
      model: IMAGEN_MODEL,
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio as "1:1" | "16:9" | "9:16" | "3:4" | "4:3",
        imageSize: "2K" as "1K" | "2K",
      },
    });

    const image = response.generatedImages?.[0];
    if (image?.image?.imageBytes) {
      return {
        imageData: `data:image/png;base64,${image.image.imageBytes}`,
        mimeType: "image/png",
        model: IMAGEN_MODEL,
      };
    }
    return null;
  } catch (error) {
    console.error("[image-service] Imagen generation error:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Gemini native image generation (branded slide graphics)
// Uses Gemini's native image generation with responseModalities: IMAGE
// Supports reference images for brand consistency across slides
// ---------------------------------------------------------------------------

async function generateWithGeminiNativeImage(
  prompt: string,
  brandColors: string[],
  referenceImages: string[],
  style?: string,
): Promise<ImageGenerationResult | null> {
  if (!API_KEY) return null;

  try {
    // Dynamic import for @google/genai SDK (native image gen support)
    const genaiModule = await (Function(
      'return import("@google/genai")',
    )() as Promise<{
      GoogleGenAI: new (opts: { apiKey: string }) => {
        models: {
          generateContent: (params: {
            model: string;
            contents: Array<{
              parts: Array<
                | { text: string }
                | { inlineData: { mimeType: string; data: string } }
              >;
            }>;
            config?: {
              responseModalities?: string[];
            };
          }) => Promise<{
            candidates?: Array<{
              content?: {
                parts?: Array<{
                  text?: string;
                  inlineData?: { mimeType: string; data: string };
                }>;
              };
            }>;
          }>;
        };
      };
    }>);

    const client = new genaiModule.GoogleGenAI({ apiKey: API_KEY });

    const colorContext = brandColors.length > 0
      ? `Brand colors: ${brandColors.join(", ")}.`
      : "";

    const styleContext = style
      ? `Style: ${style}.`
      : "Style: clean, modern, professional pitch deck aesthetic.";

    const fullPrompt = [
      `Generate a professional slide graphic: ${prompt}.`,
      colorContext,
      styleContext,
      "The image should be suitable for a business presentation.",
      "Use clean lines, modern design, and professional aesthetics.",
      "Avoid text unless specifically requested.",
    ]
      .filter(Boolean)
      .join(" ");

    // Build content parts with reference images for consistency
    const parts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [{ text: fullPrompt }];

    // Include up to 5 reference images for brand consistency
    for (const dataUri of referenceImages.slice(0, 5)) {
      const mimeMatch = dataUri.match(/^data:(image\/[^;]+);base64,/);
      if (mimeMatch) {
        const mimeType = mimeMatch[1];
        const base64Data = dataUri.slice(dataUri.indexOf(",") + 1);
        parts.push({ inlineData: { mimeType, data: base64Data } });
      }
    }

    // First attempt: primary model (Nano Banana Pro or env override)
    let response;
    try {
      response = await client.models.generateContent({
        model: SLIDE_IMAGE_MODEL,
        contents: [{ parts }],
        config: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      });
    } catch (primaryError) {
      // Primary model failed (quota, preview access, etc.) — try stable fallback
      if (SLIDE_IMAGE_MODEL !== SLIDE_IMAGE_FALLBACK_MODEL) {
        console.warn(`[image-service] Primary model ${SLIDE_IMAGE_MODEL} failed, falling back to ${SLIDE_IMAGE_FALLBACK_MODEL}:`, primaryError);
        try {
          response = await client.models.generateContent({
            model: SLIDE_IMAGE_FALLBACK_MODEL,
            contents: [{ parts }],
            config: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          });
        } catch (fallbackError) {
          console.error("[image-service] Gemini native image gen error (both models failed):", fallbackError);
          return null;
        }
      } else {
        console.error("[image-service] Gemini native image gen error:", primaryError);
        return null;
      }
    }

    // Extract image from response
    const candidate = response?.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          return {
            imageData: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
            mimeType: part.inlineData.mimeType,
            model: SLIDE_IMAGE_MODEL,
          };
        }
      }
    }

    return null;
  } catch (error) {
    console.error("[image-service] Gemini native image gen error:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Gemini SVG generation (AI-crafted vector graphics via text model)
// ---------------------------------------------------------------------------

async function generateWithGeminiSvg(
  prompt: string,
  width: number,
  height: number,
  colors: { primary: string; secondary?: string; accent?: string },
  context: string,
  referenceImages: string[],
): Promise<ImageGenerationResult | null> {
  if (!API_KEY) return null;

  try {
    const client = new GoogleGenAI({ apiKey: API_KEY });

    const svgPrompt = [
      `Generate a sophisticated, professional SVG graphic. Return ONLY the SVG markup starting with <svg, no explanation, no markdown fences, no backticks.`,
      ``,
      `Context: ${context}`,
      `Description: ${prompt}`,
      `Dimensions: ${width}x${height}`,
      `Brand colors: primary ${colors.primary}${colors.secondary ? `, secondary ${colors.secondary}` : ""}${colors.accent ? `, accent ${colors.accent}` : ""}`,
      ``,
      `Requirements:`,
      `- Valid SVG with xmlns="http://www.w3.org/2000/svg" and viewBox="0 0 ${width} ${height}"`,
      `- Use the brand colors for gradients, fills, and strokes`,
      `- Include defs with linearGradient or radialGradient elements`,
      `- Use geometric patterns, abstract shapes, circles, paths, and polygons`,
      `- Add depth with opacity variations and layered elements`,
      `- Keep text minimal — at most a short label or none at all`,
      `- Modern, clean, polished visual style`,
      `- No <script> tags, no event handler attributes`,
    ].join("\n");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contentParts: any[] = [{ text: svgPrompt }];
    for (const dataUri of referenceImages.slice(0, 3)) {
      const mimeMatch = dataUri.match(/^data:(image\/[^;]+);base64,/);
      if (mimeMatch) {
        const mimeType = mimeMatch[1];
        const base64Data = dataUri.slice(dataUri.indexOf(",") + 1);
        contentParts.push({ inlineData: { mimeType, data: base64Data } });
      }
    }

    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contentParts,
      config: {
        temperature: 0.8,
      },
    });

    const text = result.text ?? "";
    const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
    if (!svgMatch) return null;

    let svg = svgMatch[0];
    if (!svg.includes("xmlns")) return null;

    // Sanitize
    svg = svg
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/\bon\w+\s*=/gi, "data-removed=");

    return {
      imageData: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
      mimeType: "image/svg+xml",
      model: `${SLIDE_IMAGE_MODEL}-svg`,
    };
  } catch (error) {
    console.error("[image-service] Gemini SVG generation error:", error);
    return null;
  }
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
  const escaped = (label ?? "Generated Image")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;");
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

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// ---------------------------------------------------------------------------
// Brand name extraction helper
// ---------------------------------------------------------------------------

function extractBrandName(prompt: string): string {
  const patterns = [
    /(?:for|brand(?:ed)?|company|called|named)\s+["']?([A-Z][A-Za-z0-9\s]{1,20})["']?/i,
    /^["']?([A-Z][A-Za-z0-9]{1,15})["']?\s/,
  ];
  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match) return match[1].trim();
  }
  const words = prompt.split(/\s+/);
  for (const word of words) {
    if (/^[A-Z][a-z]/.test(word) && word.length > 2) return word;
  }
  return "Brand";
}

// ---------------------------------------------------------------------------
// Purpose-specific prompt builders
// ---------------------------------------------------------------------------

function buildImagenPrompt(options: ImageGenerationOptions): string {
  const { purpose, prompt, brandColors, style } = options;

  const colorStr =
    brandColors && brandColors.length > 0
      ? `Brand colors: ${brandColors.join(", ")}.`
      : "";

  const styleStr = style ? `Style: ${style}.` : "";

  const purposeContext: Record<ImagePurpose, string> = {
    "hero-image":
      "Professional, photorealistic hero image for a business presentation. High quality, cinematic lighting, sharp details.",
    mockup:
      "Professional product mockup visualization. Photorealistic rendering with clean studio lighting.",
    "slide-graphic":
      "Professional presentation slide graphic. Clean, modern business aesthetic.",
    "brand-asset":
      "Professional brand identity asset. Clean, cohesive design.",
    "social-media":
      "Eye-catching social media graphic. Bold, engaging composition.",
  };

  return [
    purposeContext[purpose],
    prompt,
    colorStr,
    styleStr,
    "High quality, professional design.",
  ]
    .filter(Boolean)
    .join(" ");
}

// ---------------------------------------------------------------------------
// Public API: Unified image generation
// ---------------------------------------------------------------------------

/**
 * Generate an image routed to the optimal model based on purpose.
 *
 * Routing:
 *   slide-graphic  -> Gemini native image gen -> Gemini SVG -> SVG fallback
 *   brand-asset    -> Gemini native image gen -> Gemini SVG -> SVG fallback
 *   social-media   -> Gemini native image gen -> Gemini SVG -> SVG fallback
 *   hero-image     -> Imagen 4 -> Gemini native -> SVG fallback
 *   mockup         -> Imagen 4 -> Mockup SVG template -> SVG fallback
 */
export async function generateImage(
  options: ImageGenerationOptions,
): Promise<ImageGenerationResult> {
  const {
    purpose,
    prompt,
    brandColors = [],
    referenceImages = [],
    aspectRatio,
    style,
    templateId,
    brandName,
  } = options;

  const [width, height] = options.width && options.height
    ? [options.width, options.height]
    : DEFAULT_DIMENSIONS[purpose];

  const resolvedAspectRatio = aspectRatio ?? DEFAULT_ASPECT_RATIOS[purpose];

  if (!checkRateLimit(`image-${purpose}`)) {
    throw new Error("Rate limit exceeded. Please wait before generating more images.");
  }

  const colors = {
    primary: brandColors[0] ?? "#4F46E5",
    secondary: brandColors[1] ?? "#7C3AED",
    accent: brandColors[2] ?? "#F59E0B",
  };

  // ── Imagen-routed purposes (hero-image, mockup) ──────────────────────
  if (IMAGEN_PURPOSES.has(purpose)) {
    // 1) Try Imagen (photorealistic)
    const imagenPrompt = buildImagenPrompt(options);
    const imagenResult = await generateWithImagen(imagenPrompt, resolvedAspectRatio);
    if (imagenResult) return imagenResult;

    // 2) For mockups, try mockup SVG template
    if (purpose === "mockup" && templateId) {
      const mockupSvg = generateMockupSVG(
        templateId,
        colors,
        brandName ?? extractBrandName(prompt),
      );
      if (mockupSvg) {
        return {
          imageData: svgToDataUri(mockupSvg),
          mimeType: "image/svg+xml",
          model: "mockup-svg-template",
        };
      }
    }

    // 3) Try Gemini native image gen as fallback
    const geminiResult = await generateWithGeminiNativeImage(
      prompt,
      brandColors,
      referenceImages,
      style,
    );
    if (geminiResult) return geminiResult;

    // 4) SVG fallback
    return {
      imageData: svgToDataUri(
        placeholderGradientSvg(width, height, colors.primary, colors.secondary, prompt.slice(0, 60)),
      ),
      mimeType: "image/svg+xml",
      model: "fallback-svg",
    };
  }

  // ── Gemini-routed purposes (slide-graphic, brand-asset, social-media) ─
  if (GEMINI_IMAGE_PURPOSES.has(purpose)) {
    // 1) Try Gemini native image generation (with reference images for consistency)
    const geminiResult = await generateWithGeminiNativeImage(
      prompt,
      brandColors,
      referenceImages,
      style,
    );
    if (geminiResult) return geminiResult;

    // 2) Try AI-crafted SVG via Gemini text model
    const purposeDescriptions: Record<string, string> = {
      "slide-graphic":
        `Pitch deck slide graphic. Style: ${style ?? "modern"}. Create an abstract, professional business graphic.`,
      "brand-asset":
        `Brand identity asset. Create a cohesive brand visual with the brand colors.`,
      "social-media":
        `Social media post graphic. Eye-catching, bold layout with branded visual elements.`,
    };
    const svgResult = await generateWithGeminiSvg(
      prompt,
      width,
      height,
      colors,
      purposeDescriptions[purpose] ?? "Professional graphic",
      referenceImages,
    );
    if (svgResult) return svgResult;

    // 3) Try Imagen as fallback for brand assets
    if (purpose === "brand-asset") {
      const imagenPrompt = buildImagenPrompt(options);
      const imagenResult = await generateWithImagen(imagenPrompt, resolvedAspectRatio);
      if (imagenResult) return imagenResult;
    }

    // 4) Gradient placeholder fallback
    return {
      imageData: svgToDataUri(
        placeholderGradientSvg(width, height, colors.primary, colors.secondary, prompt.slice(0, 60)),
      ),
      mimeType: "image/svg+xml",
      model: "fallback-svg",
    };
  }

  // Fallback for any unrecognized purpose
  return {
    imageData: svgToDataUri(
      placeholderGradientSvg(width, height, colors.primary, colors.secondary, prompt.slice(0, 60)),
    ),
    mimeType: "image/svg+xml",
    model: "fallback-svg",
  };
}

// ---------------------------------------------------------------------------
// Convenience wrappers (backward compatibility + simpler API)
// ---------------------------------------------------------------------------

/**
 * Generate a graphic for a pitch deck slide.
 * Routes: Gemini native image -> AI SVG -> placeholder SVG.
 */
export async function generateDeckGraphic(
  prompt: string,
  style: string,
  colors: { primary: string; secondary: string },
): Promise<string> {
  const result = await generateImage({
    purpose: "slide-graphic",
    prompt,
    brandColors: [colors.primary, colors.secondary],
    style,
  });
  return result.imageData;
}

/**
 * Generate a branding asset of the specified type.
 * Routes: Gemini native image -> AI SVG -> Imagen -> mockup template -> placeholder.
 */
export async function generateBrandAsset(
  type: "social" | "mockup" | "collateral" | "identity",
  prompt: string,
  brandColors: { primary?: string; secondary?: string; accent?: string },
  referenceImages: string[] = [],
  templateId?: string,
): Promise<string> {
  const purposeMap: Record<string, ImagePurpose> = {
    social: "social-media",
    mockup: "mockup",
    collateral: "brand-asset",
    identity: "brand-asset",
  };

  const colorArray = [
    brandColors.primary ?? "#4F46E5",
    brandColors.secondary ?? "#7C3AED",
    brandColors.accent ?? "#F59E0B",
  ];

  const dimensions: Record<string, [number, number]> = {
    social: [1200, 630],
    mockup: [1200, 800],
    collateral: [800, 1100],
    identity: [800, 800],
  };
  const [w, h] = dimensions[type] ?? [800, 600];

  const result = await generateImage({
    purpose: purposeMap[type] ?? "brand-asset",
    prompt,
    brandColors: colorArray,
    referenceImages,
    templateId,
    brandName: extractBrandName(prompt),
    width: w,
    height: h,
  });
  return result.imageData;
}

/**
 * Generate a hero/stock image for presentations or marketing.
 * Routes: Imagen 4 -> Gemini native -> SVG fallback.
 */
export async function generateHeroImage(
  prompt: string,
  options?: {
    aspectRatio?: string;
    brandColors?: string[];
    style?: string;
  },
): Promise<ImageGenerationResult> {
  return generateImage({
    purpose: "hero-image",
    prompt,
    aspectRatio: options?.aspectRatio ?? "16:9",
    brandColors: options?.brandColors,
    style: options?.style,
  });
}

/**
 * Generate a cohesive color scheme for a given industry and mood.
 * Uses Gemini for intelligent palette generation with algorithmic fallback.
 */
export async function generateColorScheme(
  industry: string,
  mood: string,
): Promise<{ primary: string; secondary: string; accent: string; background: string }> {
  if (!API_KEY) return algorithmicColorScheme(industry, mood);

  if (!checkRateLimit("color-scheme")) {
    return algorithmicColorScheme(industry, mood);
  }

  try {
    const client = new GoogleGenAI({ apiKey: API_KEY });

    const prompt = [
      `Generate a professional, cohesive color scheme for a ${industry} company with a ${mood} mood.`,
      `Consider color theory: complementary, analogous, or split-complementary relationships.`,
      `The background should be very light (near-white) to work as a page background.`,
      `Return ONLY a JSON object with exactly these keys: primary, secondary, accent, background.`,
      `Each value should be a hex color code (e.g. "#4F46E5").`,
      `No explanation, just the JSON.`,
    ].join("\n");

    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primary:    { type: Type.STRING },
            secondary:  { type: Type.STRING },
            accent:     { type: Type.STRING },
            background: { type: Type.STRING },
          },
          required: ["primary", "secondary", "accent", "background"],
        },
      },
    });
    const text = (result.text ?? "").trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return algorithmicColorScheme(industry, mood);

    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.primary && parsed.secondary && parsed.accent && parsed.background) {
      return {
        primary: String(parsed.primary),
        secondary: String(parsed.secondary),
        accent: String(parsed.accent),
        background: String(parsed.background),
      };
    }
    return algorithmicColorScheme(industry, mood);
  } catch (error) {
    console.error("[image-service] generateColorScheme error:", error);
    return algorithmicColorScheme(industry, mood);
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
    innovative: { saturation: 70, lightness: 48 },
    minimal: { saturation: 25, lightness: 50 },
    luxurious: { saturation: 45, lightness: 30 },
  };

  const m = moodMap[mood.toLowerCase()] ?? { saturation: 60, lightness: 45 };

  return {
    primary: hslToHex(baseHue, m.saturation, m.lightness),
    secondary: hslToHex(baseHue + 30, m.saturation - 10, m.lightness + 10),
    accent: hslToHex(baseHue + 180, m.saturation + 10, m.lightness + 5),
    background: hslToHex(baseHue, 10, 97),
  };
}
