import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pitchdeck.biz"
const SITE_NAME = "pitchdeck.biz"
const SITE_DESCRIPTION =
  "AI-powered pitch deck generator. Create professional investor presentations, sell sheets, and branding kits in minutes."

export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — AI-Powered Pitch Deck Generator`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — AI-Powered Pitch Deck Generator`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — AI-Powered Pitch Deck Generator`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export function createPageMetadata({
  title,
  description,
  path = "/",
  noIndex = false,
}: {
  title: string
  description: string
  path?: string
  noIndex?: boolean
}): Metadata {
  const url = `${SITE_URL}${path}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}

export function getHomepageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: "0",
      offerCount: "3",
    },
  }
}
