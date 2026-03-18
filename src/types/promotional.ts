/**
 * Promotional Materials types for Phase 23.
 *
 * Material types that can be generated from the user's business
 * analysis and discovery data.
 */

export type MaterialType =
  | "social-media-kit"
  | "email-templates"
  | "ad-creatives"
  | "press-kit"
  | "website-one-pager"
  | "trade-show";

export interface PromotionalMaterial {
  type: MaterialType;
  title: string;
  content: Record<string, unknown>;
  images?: string[];
  exportFormats: string[];
}

export interface SocialMediaKit {
  platforms: Array<{
    platform: "instagram" | "linkedin" | "facebook" | "twitter";
    profileImage: { prompt: string; dimensions: string };
    bannerImage: { prompt: string; dimensions: string };
    postTemplates: Array<{
      caption: string;
      imagePrompt: string;
      hashtags: string[];
    }>;
  }>;
}

export interface EmailTemplateSet {
  templates: Array<{
    name: string;
    subject: string;
    body: string;
    purpose:
      | "introduction"
      | "follow-up"
      | "update"
      | "thank-you"
      | "meeting-request";
  }>;
}

export interface AdCreativeSet {
  ads: Array<{
    platform: "facebook" | "linkedin" | "google-display";
    headline: string;
    body: string;
    cta: string;
    imagePrompt: string;
    dimensions: string;
  }>;
}

export interface PressKit {
  companyFactSheet: string;
  founderBios: Array<{ name: string; title: string; bio: string }>;
  boilerplate: string;
  logoDescriptions: string[];
  mediaContact: string;
}

export interface WebsiteOnePager {
  heroHeadline: string;
  heroSubheadline: string;
  sections: Array<{
    title: string;
    content: string;
    imagePrompt?: string;
  }>;
  ctaText: string;
  ctaUrl: string;
  footerText: string;
}

export interface TradeShowMaterials {
  boothGraphics: Array<{
    name: string;
    copy: string;
    imagePrompt: string;
    dimensions: string;
  }>;
  handoutContent: {
    headline: string;
    sections: Array<{ title: string; content: string }>;
    callToAction: string;
  };
  talkingPoints: string[];
}

/** Material type metadata for display */
export const MATERIAL_TYPE_META: Record<
  MaterialType,
  {
    label: string;
    description: string;
    icon: string;
    exportFormats: string[];
    tokenCost: number;
  }
> = {
  "social-media-kit": {
    label: "Social Media Kit",
    description:
      "Profile images, banners, and 5 post templates per platform for Instagram, LinkedIn, Facebook, and X.",
    icon: "share-2",
    exportFormats: ["pdf", "zip"],
    tokenCost: 15,
  },
  "email-templates": {
    label: "Email Templates",
    description:
      "5 investor-ready emails: introduction, follow-up, update, thank-you, and meeting request.",
    icon: "mail",
    exportFormats: ["pdf", "html"],
    tokenCost: 8,
  },
  "ad-creatives": {
    label: "Ad Creatives",
    description:
      "3 ad sets each for Facebook, LinkedIn, and Google Display with headlines, copy, and image prompts.",
    icon: "megaphone",
    exportFormats: ["pdf", "zip"],
    tokenCost: 12,
  },
  "press-kit": {
    label: "Press Kit",
    description:
      "Company fact sheet, founder bios, boilerplate, logo descriptions, and media contact info.",
    icon: "newspaper",
    exportFormats: ["pdf"],
    tokenCost: 10,
  },
  "website-one-pager": {
    label: "Website One-Pager",
    description:
      "Branded HTML one-pager content with hero section, feature blocks, and CTA.",
    icon: "globe",
    exportFormats: ["html", "pdf"],
    tokenCost: 10,
  },
  "trade-show": {
    label: "Trade Show Materials",
    description:
      "Booth graphics copy, handout content, and talking points for events and conferences.",
    icon: "presentation",
    exportFormats: ["pdf"],
    tokenCost: 10,
  },
};
