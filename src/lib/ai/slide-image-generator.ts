// ---------------------------------------------------------------------------
// Slide Image Generator
// Attaches generated SVG images to deck slides.
// - Data/financial/traction slides → chart SVGs via chart-generator
// - Other slides → branded gradient backgrounds via color-generator
// ---------------------------------------------------------------------------

import {
  generateBarChart,
  generateLineChart,
  generatePieChart,
  generateGrowthArrow,
  type ChartDataPoint,
} from "./chart-generator";
import { generateBrandColors } from "./color-generator";
import type { SlideContent, SlideType } from "@/lib/types";

// Slide types that get chart SVGs
const CHART_SLIDE_TYPES = new Set<SlideType>(["market", "financials", "traction"]);

// Slide types that get pie charts specifically
const PIE_CHART_TYPES = new Set<SlideType>(["market"]);

// Slide types that use growth-arrow charts
const GROWTH_CHART_TYPES = new Set<SlideType>(["traction"]);

// ---------------------------------------------------------------------------
// Parse numbers out of bullet points to build sample chart data
// ---------------------------------------------------------------------------

function extractNumbers(texts: string[]): number[] {
  const nums: number[] = [];
  for (const text of texts) {
    const matches = text.match(/[\d,]+(?:\.\d+)?/g);
    if (matches) {
      for (const m of matches) {
        const n = parseFloat(m.replace(/,/g, ""));
        if (!isNaN(n) && n > 0 && n < 1_000_000_000) {
          nums.push(n);
        }
      }
    }
  }
  return nums.slice(0, 6);
}

function bulletPointsToChartData(bullets: string[], fallbackLabels: string[]): ChartDataPoint[] {
  if (!bullets || bullets.length === 0) {
    return fallbackLabels.map((label, i) => ({ label, value: (i + 1) * 25 }));
  }

  // Try to pull a single number per bullet as a value
  return bullets.slice(0, 5).map((bullet, i) => {
    const nums = extractNumbers([bullet]);
    const value = nums.length > 0 ? Math.min(nums[0], 9999) : (i + 1) * 20;
    // Use first few words as the label
    const label = bullet.replace(/[^\w\s]/g, " ").trim().split(/\s+/).slice(0, 2).join(" ");
    return { label: label || `Item ${i + 1}`, value };
  });
}

// ---------------------------------------------------------------------------
// Generate brand gradient background SVG
// ---------------------------------------------------------------------------

function brandedGradientSvg(
  primary: string,
  secondary: string,
  accent: string,
  slideType: SlideType,
  width = 800,
  height = 480,
): string {
  // Use different gradient directions per slide type for variety
  const gradients: Record<string, string> = {
    title: "x1='0%' y1='0%' x2='100%' y2='100%'",
    problem: "x1='100%' y1='0%' x2='0%' y2='100%'",
    solution: "x1='0%' y1='100%' x2='100%' y2='0%'",
    product: "x1='50%' y1='0%' x2='50%' y2='100%'",
    "business-model": "x1='0%' y1='0%' x2='100%' y2='0%'",
    team: "x1='0%' y1='0%' x2='100%' y2='100%'",
    ask: "x1='100%' y1='100%' x2='0%' y2='0%'",
    "why-now": "x1='0%' y1='0%' x2='100%' y2='100%'",
    closing: "x1='0%' y1='0%' x2='100%' y2='100%'",
  };

  const dir = gradients[slideType] ?? "x1='0%' y1='0%' x2='100%' y2='100%'";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" ${dir}>
      <stop offset="0%" stop-color="${primary}" stop-opacity="0.9" />
      <stop offset="60%" stop-color="${secondary}" stop-opacity="0.7" />
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.5" />
    </linearGradient>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
      <feBlend in="SourceGraphic" mode="overlay" result="blend" />
      <feComposite in="blend" in2="SourceGraphic" operator="in" />
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" rx="0" />
  <!-- Decorative circles -->
  <circle cx="${width * 0.85}" cy="${height * 0.15}" r="${height * 0.4}" fill="${accent}" opacity="0.12" />
  <circle cx="${width * 0.1}" cy="${height * 0.8}" r="${height * 0.3}" fill="${secondary}" opacity="0.1" />
  <!-- Subtle grid lines -->
  <line x1="0" y1="${height * 0.33}" x2="${width}" y2="${height * 0.33}" stroke="white" stroke-width="0.5" opacity="0.1" />
  <line x1="0" y1="${height * 0.66}" x2="${width}" y2="${height * 0.66}" stroke="white" stroke-width="0.5" opacity="0.1" />
  <line x1="${width * 0.33}" y1="0" x2="${width * 0.33}" y2="${height}" stroke="white" stroke-width="0.5" opacity="0.1" />
  <line x1="${width * 0.66}" y1="0" x2="${width * 0.66}" y2="${height}" stroke="white" stroke-width="0.5" opacity="0.1" />
</svg>`;
}

// ---------------------------------------------------------------------------
// SVG → data URI helper
// ---------------------------------------------------------------------------

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

// ---------------------------------------------------------------------------
// Public: generate image for a single slide
// ---------------------------------------------------------------------------

export function generateSlideImage(
  slide: SlideContent,
  industry: string,
  description: string,
): string {
  const palette = generateBrandColors(industry, description);
  const { primary, secondary, accent } = palette;

  if (CHART_SLIDE_TYPES.has(slide.type)) {
    const bullets = slide.bulletPoints ?? [];
    const chartOptions = {
      width: 600,
      height: 380,
      title: slide.title,
      backgroundColor: "#ffffff",
    };

    let chartSvg: string;

    if (PIE_CHART_TYPES.has(slide.type)) {
      // Market slide → pie chart showing market segments
      const data = bulletPointsToChartData(bullets, ["TAM", "SAM", "SOM"]);
      chartSvg = generatePieChart(data, chartOptions);
    } else if (GROWTH_CHART_TYPES.has(slide.type)) {
      // Traction slide → growth arrow / line chart showing momentum
      const nums = extractNumbers(bullets);
      let data: ChartDataPoint[];
      if (nums.length >= 2) {
        data = nums.slice(0, 5).map((v, i) => ({ label: `T${i + 1}`, value: v }));
      } else {
        data = [
          { label: "Q1", value: 10 },
          { label: "Q2", value: 35 },
          { label: "Q3", value: 75 },
          { label: "Q4", value: 150 },
        ];
      }
      chartSvg = generateGrowthArrow(data, { ...chartOptions, arrowColor: primary });
    } else {
      // Financials slide → bar chart showing revenue projections
      const data = bulletPointsToChartData(bullets, ["Year 1", "Year 2", "Year 3", "Year 4"]);
      chartSvg = generateBarChart(data, chartOptions);
    }

    return svgToDataUri(chartSvg);
  }

  // All other slide types → branded gradient background
  const gradientSvg = brandedGradientSvg(primary, secondary, accent, slide.type);
  return svgToDataUri(gradientSvg);
}

// ---------------------------------------------------------------------------
// Public: attach generated images to all slides in a deck
// ---------------------------------------------------------------------------

export function attachImagesToSlides(
  slides: SlideContent[],
  industry: string,
  description: string,
): SlideContent[] {
  return slides.map((slide) => ({
    ...slide,
    generatedImage: generateSlideImage(slide, industry, description),
  }));
}
