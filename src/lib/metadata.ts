import type { Metadata } from "next";

const SITE_NAME = "pitchdeck.biz";
const DEFAULT_DESCRIPTION = "AI-powered pitch deck creation platform. Generate professional pitch decks, sell sheets, and brand kits in minutes.";

/**
 * Creates consistent page metadata for Next.js pages.
 */
export function createPageMetadata(
  title: string,
  description?: string,
): Metadata {
  const fullTitle = title + " | " + SITE_NAME;
  return {
    title: fullTitle,
    description: description || DEFAULT_DESCRIPTION,
    openGraph: {
      title: fullTitle,
      description: description || DEFAULT_DESCRIPTION,
      siteName: SITE_NAME,
    },
  };
}

/**
 * Returns JSON-LD structured data for the homepage.
 */
export function getHomepageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: process.env.NEXT_PUBLIC_APP_URL || "https://pitchdeck.biz",
    description: DEFAULT_DESCRIPTION,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
  };
}
