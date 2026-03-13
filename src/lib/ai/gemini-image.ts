import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateMockupSVG } from "./mockup-svg-generator";

// ---------------------------------------------------------------------------
// Gemini Image Generation Service
// Primary: AI-crafted SVG graphics via Gemini text model (always works)
// Secondary: Imagen 3 via @google/genai SDK (when installed + configured)
// Fallback: Algorithmic placeholder SVGs when no API key is configured
// ---------------------------------------------------------------------------

const API_KEY = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? "";

function getClient() {
  if (!API_KEY) return null;
  return new GoogleGenerativeAI(API_KEY);
}

// ---------------------------------------------------------------------------
// Imagen 3 support (optional — requires @google/genai package)
// ---------------------------------------------------------------------------

async function generateWithImagen(prompt: string): Promise<string | null> {
  const imagenKey =
    process.env.GOOGLE_IMAGEN_API_KEY ??
    process.env.GOOGLE_API_KEY ??
    process.env.GEMINI_API_KEY ??
    "";
  if (!imagenKey) return null;

  try {
    // Dynamic import — skipped silently when @google/genai is not installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const genaiModule = await (Function('return import("@google/genai")')() as Promise<{
      GoogleGenAI: new (opts: { apiKey: string }) => {
        models: {
          generateImages: (params: {
            model: string;
            prompt: string;
            config: { numberOfImages: number };
          }) => Promise<{
            generatedImages?: Array<{
              image?: { imageBytes?: string };
            }>;
          }>;
        };
      };
    }>);

    const client = new genaiModule.GoogleGenAI({ apiKey: imagenKey });

    const response = await client.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt,
      config: { numberOfImages: 1 },
    });

    const image = response.generatedImages?.[0];
    if (image?.image?.imageBytes) {
      return `data:image/png;base64,${image.image.imageBytes}`;
    }
    return null;
  } catch {
    // @google/genai not installed or Imagen not available — silent fallback
    return null;
  }
}

// ---------------------------------------------------------------------------
// AI SVG generation via Gemini text model
// ---------------------------------------------------------------------------

function buildSvgPrompt(
  description: string,
  width: number,
  height: number,
  colors: { primary: string; secondary?: string; accent?: string },
  context: string,
): string {
  return [
    `Generate a sophisticated, professional SVG graphic. Return ONLY the SVG markup starting with <svg, no explanation, no markdown fences, no backticks.`,
    ``,
    `Context: ${context}`,
    `Description: ${description}`,
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
}

function extractSvg(text: string): string | null {
  const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
  if (!svgMatch) return null;

  const svg = svgMatch[0];
  if (!svg.includes("xmlns")) return null;

  // Sanitize: strip any script tags or event handlers
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\bon\w+\s*=/gi, "data-removed=");
}

async function generateAiSvg(
  description: string,
  width: number,
  height: number,
  colors: { primary: string; secondary?: string; accent?: string },
  context: string,
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const prompt = buildSvgPrompt(description, width, height, colors, context);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "text/plain",
        temperature: 0.8,
      },
    });

    return extractSvg(result.response.text());
  } catch (error) {
    console.error("[gemini-image] AI SVG generation error:", error);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Brand name extraction from prompts
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

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
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
 * Strategy: Imagen 3 -> AI-crafted SVG -> placeholder SVG fallback.
 * Returns a base64 data-URI string.
 */
export async function generateDeckGraphic(
  prompt: string,
  style: string,
  colors: { primary: string; secondary: string },
): Promise<string> {
  if (!checkRateLimit("deck-graphic")) {
    throw new Error("Rate limit exceeded. Please wait before generating more images.");
  }

  // 1) Try Imagen 3 (photorealistic quality, optional)
  const imagenResult = await generateWithImagen(
    `Professional pitch deck slide graphic. Style: ${style}. ${prompt}. Use brand colors ${colors.primary} and ${colors.secondary}. Clean, modern, business presentation.`,
  );
  if (imagenResult) return imagenResult;

  // 2) Try AI-crafted SVG via Gemini text model
  const aiSvg = await generateAiSvg(
    prompt,
    800,
    600,
    colors,
    `Pitch deck slide graphic. Style: ${style}. Create an abstract, professional business graphic with geometric shapes, data visualization elements, or conceptual illustrations suitable for a presentation slide.`,
  );
  if (aiSvg) return svgToDataUri(aiSvg);

  // 3) Fallback to simple gradient placeholder
  return svgToDataUri(
    placeholderGradientSvg(800, 600, colors.primary, colors.secondary, prompt.slice(0, 60)),
  );
}

/**
 * Generate a branding asset of the specified type.
 * Strategy: Imagen 3 -> AI-crafted SVG (with reference images) -> mockup SVG template -> placeholder.
 * Returns base64 data-URI.
 */
export async function generateBrandAsset(
  type: "social" | "mockup" | "collateral" | "identity",
  prompt: string,
  brandColors: { primary?: string; secondary?: string; accent?: string },
  referenceImages: string[] = [],
  templateId?: string,
): Promise<string> {
  const primary = brandColors.primary ?? "#4F46E5";
  const secondary = brandColors.secondary ?? "#7C3AED";

  const dimensions: Record<string, [number, number]> = {
    social: [1200, 630],
    mockup: [1200, 800],
    collateral: [800, 1100],
    identity: [800, 800],
  };
  const [w, h] = dimensions[type] ?? [800, 600];

  // Pre-compute mockup SVG fallback for mockup types
  const mockupFallback =
    type === "mockup" && templateId
      ? generateMockupSVG(templateId, brandColors, extractBrandName(prompt))
      : null;

  if (!checkRateLimit("brand-asset")) {
    throw new Error("Rate limit exceeded. Please wait before generating more assets.");
  }

  const typeDescriptions: Record<string, string> = {
    social:
      "social media post graphic with engaging layout, bold typography areas, and branded visual elements (1200x630)",
    mockup:
      "product/service mockup with device frames, screens, or packaging visualization (1200x800)",
    collateral:
      "business collateral cover design with professional layout, sections, and branding (800x1100)",
    identity:
      "brand identity element — a logo mark, icon, or monogram using geometric shapes (800x800)",
  };

  // 1) Try Imagen 3 (optional)
  const imagenPrompt = `Professional ${typeDescriptions[type]}. ${prompt}. Brand colors: ${primary}, ${secondary}${brandColors.accent ? `, ${brandColors.accent}` : ""}. High quality, modern design.`;
  const imagenResult = await generateWithImagen(imagenPrompt);
  if (imagenResult) return imagenResult;

  // 2) Try AI-crafted SVG via Gemini (supports reference images for context)
  const client = getClient();
  if (client) {
    try {
      const model = client.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

      const svgPrompt = buildSvgPrompt(
        prompt,
        w,
        h,
        { primary, secondary: brandColors.secondary, accent: brandColors.accent },
        `Brand asset type: ${typeDescriptions[type]}.`,
      );

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

      const result = await model.generateContent({
        contents: [{ role: "user", parts: contentParts }],
        generationConfig: { responseMimeType: "text/plain", temperature: 0.8 },
      });

      const svg = extractSvg(result.response.text());
      if (svg) return svgToDataUri(svg);
    } catch (error) {
      console.error("[gemini-image] generateBrandAsset AI SVG error:", error);
    }
  }

  // 3) Mockup SVG template fallback (for mockup types)
  if (mockupFallback) {
    return svgToDataUri(mockupFallback);
  }

  // 4) Simple gradient placeholder
  return svgToDataUri(
    placeholderGradientSvg(w, h, primary, secondary, `${type}: ${prompt.slice(0, 40)}`),
  );
}

/**
 * Generate a cohesive color scheme for a given industry and mood.
 * Uses Gemini for intelligent palette generation with algorithmic fallback.
 */
export async function generateColorScheme(
  industry: string,
  mood: string,
): Promise<{ primary: string; secondary: string; accent: string; background: string }> {
  const client = getClient();
  const fallback = algorithmicColorScheme(industry, mood);
  if (!client) return fallback;

  if (!checkRateLimit("color-scheme")) {
    return fallback;
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = [
      `Generate a professional, cohesive color scheme for a ${industry} company with a ${mood} mood.`,
      `Consider color theory: complementary, analogous, or split-complementary relationships.`,
      `The background should be very light (near-white) to work as a page background.`,
      `Return ONLY a JSON object with exactly these keys: primary, secondary, accent, background.`,
      `Each value should be a hex color code (e.g. "#4F46E5").`,
      `No explanation, just the JSON.`,
    ].join("\n");

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

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
