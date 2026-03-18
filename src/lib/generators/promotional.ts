/**
 * Promotional material generator functions.
 *
 * Each generator takes a BusinessAnalysis and optional brand colors,
 * calls Claude for text content, and returns structured material data
 * with image prompts for the image service.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { BusinessAnalysis } from "@/lib/types";
import type {
  SocialMediaKit,
  EmailTemplateSet,
  AdCreativeSet,
  PressKit,
  WebsiteOnePager,
  TradeShowMaterials,
} from "@/types/promotional";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey });
}

async function callClaude<T>(systemPrompt: string, userPrompt: string): Promise<T> {
  const client = getClient();

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from AI");
  }

  let raw = textBlock.text.trim();
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  return JSON.parse(raw) as T;
}

function analysisContext(analysis: BusinessAnalysis): string {
  return JSON.stringify(
    {
      summary: analysis.summary,
      businessModel: analysis.businessModel,
      valueProposition: analysis.valueProposition,
      market: analysis.market,
      team: analysis.team,
      financials: analysis.financials,
      brandEssence: analysis.brandEssence,
    },
    null,
    2,
  );
}

// ---------------------------------------------------------------------------
// 1. Social Media Kit
// ---------------------------------------------------------------------------

export async function generateSocialMediaKit(
  analysis: BusinessAnalysis,
  brandColors?: string[],
): Promise<SocialMediaKit> {
  const colorsNote = brandColors?.length
    ? `Brand colors: ${brandColors.join(", ")}.`
    : "";

  const system = `You are an expert social media strategist. Given a business analysis, generate a complete social media kit.

Return ONLY valid JSON matching this schema (no markdown, no fences):
{
  "platforms": [
    {
      "platform": "instagram" | "linkedin" | "facebook" | "twitter",
      "profileImage": { "prompt": string, "dimensions": string },
      "bannerImage": { "prompt": string, "dimensions": string },
      "postTemplates": [
        { "caption": string, "imagePrompt": string, "hashtags": string[] }
      ]
    }
  ]
}

Guidelines:
- Cover all 4 platforms: instagram, linkedin, facebook, twitter
- Profile images: square format, professional, brand-aligned
- Banner images: platform-correct dimensions
- 5 post templates per platform, each with engaging caption, image generation prompt, and 5-8 relevant hashtags
- Captions should be platform-appropriate (professional for LinkedIn, visual for Instagram, etc.)
- Image prompts should be detailed enough for AI image generation
- All content must be specific to this business, not generic
${colorsNote}`;

  const user = `Generate a social media kit for this business:\n\n${analysisContext(analysis)}`;
  return callClaude<SocialMediaKit>(system, user);
}

// ---------------------------------------------------------------------------
// 2. Email Templates
// ---------------------------------------------------------------------------

export async function generateEmailTemplates(
  analysis: BusinessAnalysis,
): Promise<EmailTemplateSet> {
  const system = `You are an expert investor relations copywriter. Generate 5 production-ready investor email templates.

Return ONLY valid JSON matching this schema:
{
  "templates": [
    {
      "name": string,
      "subject": string,
      "body": string,
      "purpose": "introduction" | "follow-up" | "update" | "thank-you" | "meeting-request"
    }
  ]
}

Guidelines:
- One template for each purpose: introduction, follow-up, update, thank-you, meeting-request
- Subject lines should be compelling and specific to the business
- Body text should be complete, professional emails with placeholders like [Investor Name], [Your Name]
- Include specific metrics, value props, and achievements from the analysis
- Tone should match the brand essence
- Emails should be 150-300 words each
- Use HTML formatting (paragraphs, bold, lists) in the body`;

  const user = `Generate investor email templates for this business:\n\n${analysisContext(analysis)}`;
  return callClaude<EmailTemplateSet>(system, user);
}

// ---------------------------------------------------------------------------
// 3. Ad Creatives
// ---------------------------------------------------------------------------

export async function generateAdCreatives(
  analysis: BusinessAnalysis,
  brandColors?: string[],
): Promise<AdCreativeSet> {
  const colorsNote = brandColors?.length
    ? `Brand colors: ${brandColors.join(", ")}.`
    : "";

  const system = `You are an expert performance marketing strategist. Generate ad creatives for Facebook, LinkedIn, and Google Display.

Return ONLY valid JSON matching this schema:
{
  "ads": [
    {
      "platform": "facebook" | "linkedin" | "google-display",
      "headline": string,
      "body": string,
      "cta": string,
      "imagePrompt": string,
      "dimensions": string
    }
  ]
}

Guidelines:
- 3 ads each for facebook, linkedin, and google-display (9 total)
- Facebook: engaging, scroll-stopping headlines; 1200x628 images
- LinkedIn: professional, B2B-focused; 1200x627 images
- Google Display: concise, high-impact; 300x250 and 728x90 dimensions
- Headlines should be under 40 characters
- Body copy should be platform-appropriate length
- CTAs should be action-oriented (Learn More, Get Started, Book a Demo, etc.)
- Image prompts should describe visuals for AI generation
- All content must reference this specific business
${colorsNote}`;

  const user = `Generate ad creatives for this business:\n\n${analysisContext(analysis)}`;
  return callClaude<AdCreativeSet>(system, user);
}

// ---------------------------------------------------------------------------
// 4. Press Kit
// ---------------------------------------------------------------------------

export async function generatePressKit(
  analysis: BusinessAnalysis,
): Promise<PressKit> {
  const system = `You are an expert PR and communications strategist. Generate a complete press kit.

Return ONLY valid JSON matching this schema:
{
  "companyFactSheet": string,
  "founderBios": [{ "name": string, "title": string, "bio": string }],
  "boilerplate": string,
  "logoDescriptions": string[],
  "mediaContact": string
}

Guidelines:
- Company fact sheet: 300-500 words covering mission, product, market, traction, and key stats
- Founder bios: based on team members from the analysis, 100-150 words each, professional third-person
- Boilerplate: 2-3 sentence company description for press releases
- Logo descriptions: 3-4 descriptions of how the logo should appear in different contexts (full color, monochrome, icon-only, reversed)
- Media contact: template with [Name], [Email], [Phone] placeholders
- All content should be factual, based on the analysis data, and ready for media use`;

  const user = `Generate a press kit for this business:\n\n${analysisContext(analysis)}`;
  return callClaude<PressKit>(system, user);
}

// ---------------------------------------------------------------------------
// 5. Website One-Pager
// ---------------------------------------------------------------------------

export async function generateWebsiteOnePager(
  analysis: BusinessAnalysis,
  brandColors?: string[],
): Promise<WebsiteOnePager> {
  const colorsNote = brandColors?.length
    ? `Brand colors: ${brandColors.join(", ")}.`
    : "";

  const system = `You are an expert web copywriter and landing page strategist. Generate branded one-pager website content.

Return ONLY valid JSON matching this schema:
{
  "heroHeadline": string,
  "heroSubheadline": string,
  "sections": [
    { "title": string, "content": string, "imagePrompt": string }
  ],
  "ctaText": string,
  "ctaUrl": string,
  "footerText": string
}

Guidelines:
- Hero headline: powerful, benefit-driven, under 10 words
- Hero subheadline: expand on the headline, 1-2 sentences
- 4-6 sections covering: problem, solution, features, social proof, pricing/offer
- Section content should be 50-100 words each, persuasive and scannable
- Image prompts for each section describing relevant visuals
- CTA should be compelling and specific (not just "Learn More")
- CTA URL should be a placeholder like "#contact" or "#demo"
- Footer text: brief company description + copyright placeholder
${colorsNote}`;

  const user = `Generate website one-pager content for this business:\n\n${analysisContext(analysis)}`;
  return callClaude<WebsiteOnePager>(system, user);
}

// ---------------------------------------------------------------------------
// 6. Trade Show Materials
// ---------------------------------------------------------------------------

export async function generateTradeShowMaterials(
  analysis: BusinessAnalysis,
  brandColors?: string[],
): Promise<TradeShowMaterials> {
  const colorsNote = brandColors?.length
    ? `Brand colors: ${brandColors.join(", ")}.`
    : "";

  const system = `You are an expert trade show and event marketing strategist. Generate complete trade show materials.

Return ONLY valid JSON matching this schema:
{
  "boothGraphics": [
    { "name": string, "copy": string, "imagePrompt": string, "dimensions": string }
  ],
  "handoutContent": {
    "headline": string,
    "sections": [{ "title": string, "content": string }],
    "callToAction": string
  },
  "talkingPoints": string[]
}

Guidelines:
- 4 booth graphics: backdrop banner (10ft x 8ft), table banner (6ft x 2.5ft), retractable banner (33in x 80in), monitor display (1920x1080)
- Booth copy should be large-text-friendly, impactful, and readable from 6+ feet away
- Image prompts should describe professional trade show visuals
- Handout: 4-5 sections covering product, benefits, proof points, and next steps
- Handout content should fit on a double-sided letter-size page
- 8-10 talking points for booth staff, covering elevator pitch, key differentiators, objection handling
- All content specific to this business
${colorsNote}`;

  const user = `Generate trade show materials for this business:\n\n${analysisContext(analysis)}`;
  return callClaude<TradeShowMaterials>(system, user);
}
