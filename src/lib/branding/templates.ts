import type { AssetType } from "@/lib/tokens"

export interface AssetTemplate {
  id: string
  name: string
  category: AssetType
  width: number
  height: number
  description: string
}

const TEMPLATES: AssetTemplate[] = [
  // Social Media
  { id: "ig-post", name: "Instagram Post", category: "social-media", width: 1080, height: 1080, description: "Square format for Instagram feed" },
  { id: "ig-story", name: "Instagram Story", category: "social-media", width: 1080, height: 1920, description: "Vertical story format" },
  { id: "linkedin-banner", name: "LinkedIn Banner", category: "social-media", width: 1584, height: 396, description: "LinkedIn profile or company banner" },
  { id: "twitter-header", name: "Twitter/X Header", category: "social-media", width: 1500, height: 500, description: "Twitter profile header" },
  { id: "fb-cover", name: "Facebook Cover", category: "social-media", width: 820, height: 312, description: "Facebook page cover photo" },
  { id: "og-image", name: "OG Image", category: "social-media", width: 1200, height: 630, description: "Open Graph sharing image" },

  // Product Mockups
  { id: "device-mockup", name: "Device Mockup", category: "product-mockup", width: 1920, height: 1080, description: "Product shown on device screen" },
  { id: "lifestyle-shot", name: "Lifestyle Shot", category: "product-mockup", width: 1200, height: 800, description: "Product in lifestyle context" },
  { id: "packaging-3d", name: "3D Packaging", category: "product-mockup", width: 1200, height: 1200, description: "3D packaging render" },
  { id: "hero-product", name: "Hero Product Shot", category: "product-mockup", width: 1920, height: 1080, description: "Full-width hero product image" },

  // Marketing Collateral
  { id: "flyer-a4", name: "Flyer (A4)", category: "marketing-collateral", width: 2480, height: 3508, description: "A4 print-ready flyer" },
  { id: "email-header", name: "Email Header", category: "marketing-collateral", width: 600, height: 200, description: "Email campaign header" },
  { id: "web-banner", name: "Web Banner", category: "marketing-collateral", width: 1200, height: 300, description: "Website promotional banner" },
  { id: "event-poster", name: "Event Poster", category: "marketing-collateral", width: 1080, height: 1350, description: "Event or webinar poster" },

  // Brand Identity
  { id: "logo-primary", name: "Primary Logo", category: "brand-identity", width: 800, height: 800, description: "Main logo mark" },
  { id: "logo-wordmark", name: "Wordmark", category: "brand-identity", width: 1200, height: 400, description: "Text-based logo" },
  { id: "brand-pattern", name: "Brand Pattern", category: "brand-identity", width: 1200, height: 1200, description: "Repeating brand pattern" },
  { id: "icon-set", name: "Icon Set", category: "brand-identity", width: 1200, height: 1200, description: "Custom brand icon collection" },
]

export function getTemplatesByCategory(category: AssetType): AssetTemplate[] {
  return TEMPLATES.filter((t) => t.category === category)
}

export function getTemplateById(id: string): AssetTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id)
}
