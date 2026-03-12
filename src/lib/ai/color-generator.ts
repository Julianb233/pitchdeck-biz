// ---------------------------------------------------------------------------
// Brand Color Generator
// Generates cohesive color palettes using color theory and HSL manipulation.
// Works entirely offline — no API dependency.
// ---------------------------------------------------------------------------

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
}

export type ColorHarmony = "complementary" | "analogous" | "triadic" | "split-complementary";

// ---------------------------------------------------------------------------
// HSL <-> Hex conversion utilities
// ---------------------------------------------------------------------------

interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

function hslToHex({ h, s, l }: HSL): string {
  h = ((h % 360) + 360) % 360;
  const sn = Math.max(0, Math.min(100, s)) / 100;
  const ln = Math.max(0, Math.min(100, l)) / 100;

  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHSL(hex: string): HSL {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16) / 255;
  const g = parseInt(cleaned.substring(2, 4), 16) / 255;
  const b = parseInt(cleaned.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l: l * 100 };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// ---------------------------------------------------------------------------
// Deterministic seed from strings
// ---------------------------------------------------------------------------

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ---------------------------------------------------------------------------
// Industry + mood -> base hue & saturation/lightness mapping
// ---------------------------------------------------------------------------

const INDUSTRY_HUES: Record<string, number> = {
  technology: 220,
  tech: 220,
  saas: 230,
  software: 225,
  finance: 210,
  fintech: 200,
  banking: 215,
  healthcare: 160,
  health: 155,
  medical: 165,
  education: 195,
  edtech: 200,
  food: 30,
  restaurant: 25,
  "real estate": 35,
  realty: 35,
  energy: 120,
  green: 130,
  sustainability: 140,
  fashion: 330,
  beauty: 340,
  luxury: 275,
  entertainment: 280,
  media: 260,
  sports: 15,
  fitness: 10,
  travel: 190,
  hospitality: 185,
  legal: 220,
  consulting: 215,
  marketing: 350,
  advertising: 355,
  retail: 40,
  ecommerce: 45,
  automotive: 0,
  construction: 30,
  agriculture: 100,
  nonprofit: 170,
};

interface MoodProfile {
  saturation: number;
  lightness: number;
  contrast: number; // how much contrast for secondary/accent
}

const MOOD_PROFILES: Record<string, MoodProfile> = {
  professional: { saturation: 55, lightness: 42, contrast: 0.7 },
  corporate: { saturation: 50, lightness: 40, contrast: 0.6 },
  energetic: { saturation: 80, lightness: 52, contrast: 0.9 },
  calm: { saturation: 38, lightness: 55, contrast: 0.5 },
  bold: { saturation: 85, lightness: 40, contrast: 1.0 },
  elegant: { saturation: 30, lightness: 35, contrast: 0.4 },
  luxurious: { saturation: 35, lightness: 30, contrast: 0.5 },
  playful: { saturation: 75, lightness: 55, contrast: 0.85 },
  trustworthy: { saturation: 50, lightness: 42, contrast: 0.6 },
  innovative: { saturation: 70, lightness: 48, contrast: 0.8 },
  warm: { saturation: 60, lightness: 50, contrast: 0.65 },
  cool: { saturation: 45, lightness: 48, contrast: 0.55 },
  minimal: { saturation: 20, lightness: 50, contrast: 0.3 },
  vibrant: { saturation: 90, lightness: 50, contrast: 0.95 },
};

// ---------------------------------------------------------------------------
// Color harmony generators
// ---------------------------------------------------------------------------

function generateHarmony(baseHue: number, harmony: ColorHarmony): number[] {
  switch (harmony) {
    case "complementary":
      return [baseHue, (baseHue + 180) % 360];
    case "analogous":
      return [baseHue, (baseHue + 30) % 360, (baseHue + 330) % 360];
    case "triadic":
      return [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
    case "split-complementary":
      return [baseHue, (baseHue + 150) % 360, (baseHue + 210) % 360];
  }
}

function pickHarmony(seed: number): ColorHarmony {
  const harmonies: ColorHarmony[] = ["complementary", "analogous", "triadic", "split-complementary"];
  return harmonies[seed % harmonies.length];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a full color palette from an industry and brand description.
 * Fully algorithmic — works without any API calls.
 */
export function generateBrandColors(
  industry: string,
  description: string,
  harmony?: ColorHarmony,
): ColorPalette {
  const industryLower = industry.toLowerCase().trim();
  const seed = hashString(`${industry}-${description}`);

  // Determine base hue from industry or fallback to hash
  const baseHue = INDUSTRY_HUES[industryLower] ?? (seed % 360);

  // Determine mood from description keywords
  const mood = detectMood(description);
  const profile = MOOD_PROFILES[mood] ?? MOOD_PROFILES.professional;

  // Pick harmony type
  const chosenHarmony = harmony ?? pickHarmony(seed);
  const hues = generateHarmony(baseHue, chosenHarmony);

  const primary: HSL = { h: hues[0], s: profile.saturation, l: profile.lightness };
  const secondary: HSL = {
    h: hues[1] ?? (baseHue + 30) % 360,
    s: profile.saturation - 10,
    l: profile.lightness + 10,
  };
  const accent: HSL = {
    h: hues[2] ?? (baseHue + 180) % 360,
    s: profile.saturation + 10 * profile.contrast,
    l: profile.lightness + 5,
  };

  return {
    primary: hslToHex(primary),
    secondary: hslToHex(secondary),
    accent: hslToHex(accent),
    background: hslToHex({ h: baseHue, s: 8, l: 97 }),
    surface: hslToHex({ h: baseHue, s: 10, l: 93 }),
    text: hslToHex({ h: baseHue, s: 15, l: 15 }),
    textMuted: hslToHex({ h: baseHue, s: 10, l: 45 }),
  };
}

/**
 * Adjust an existing color palette — shift hue, change saturation/lightness.
 */
export function adjustPalette(
  palette: ColorPalette,
  adjustments: { hueShift?: number; saturationDelta?: number; lightnessDelta?: number },
): ColorPalette {
  const { hueShift = 0, saturationDelta = 0, lightnessDelta = 0 } = adjustments;

  function adjust(hex: string): string {
    const hsl = hexToHSL(hex);
    return hslToHex({
      h: hsl.h + hueShift,
      s: hsl.s + saturationDelta,
      l: hsl.l + lightnessDelta,
    });
  }

  return {
    primary: adjust(palette.primary),
    secondary: adjust(palette.secondary),
    accent: adjust(palette.accent),
    background: adjust(palette.background),
    surface: adjust(palette.surface),
    text: adjust(palette.text),
    textMuted: adjust(palette.textMuted),
  };
}

/**
 * Convert a palette to CSS custom properties string.
 */
export function paletteToCSSVars(palette: ColorPalette, prefix = "brand"): string {
  return Object.entries(palette)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `  --${prefix}-${cssKey}: ${value};`;
    })
    .join("\n");
}

/**
 * Get a contrast color (black or white) for readability against a given background.
 */
export function getContrastColor(hex: string): string {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);

  // Relative luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
}

// ---------------------------------------------------------------------------
// Mood detection from description text
// ---------------------------------------------------------------------------

function detectMood(description: string): string {
  const lower = description.toLowerCase();

  const moodKeywords: Record<string, string[]> = {
    energetic: ["fast", "dynamic", "energy", "exciting", "startup", "disrupt"],
    calm: ["calm", "peaceful", "serene", "relax", "wellness", "mindful"],
    bold: ["bold", "strong", "powerful", "aggressive", "ambitious"],
    elegant: ["elegant", "sophisticated", "refined", "premium", "luxury"],
    playful: ["fun", "playful", "creative", "colorful", "young", "kids"],
    trustworthy: ["trust", "reliable", "secure", "safe", "established"],
    innovative: ["innovative", "cutting-edge", "future", "ai", "tech", "modern"],
    warm: ["warm", "friendly", "welcoming", "community", "family"],
    cool: ["cool", "sleek", "minimal", "clean", "simple"],
    minimal: ["minimalist", "minimal", "simple", "understated"],
    vibrant: ["vibrant", "colorful", "bright", "vivid", "lively"],
    corporate: ["corporate", "enterprise", "b2b", "business", "professional"],
  };

  let bestMood = "professional";
  let bestScore = 0;

  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    const score = keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMood = mood;
    }
  }

  return bestMood;
}
