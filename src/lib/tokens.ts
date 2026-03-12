export type AssetType = "social-media" | "product-mockup" | "marketing-collateral" | "brand-identity"

export const ASSET_TOKEN_COSTS: Record<AssetType, number> = {
  "social-media": 5,
  "product-mockup": 10,
  "marketing-collateral": 8,
  "brand-identity": 15,
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  "social-media": "Social Media",
  "product-mockup": "Product Mockup",
  "marketing-collateral": "Marketing Collateral",
  "brand-identity": "Brand Identity",
}

export const MONTHLY_TOKEN_ALLOCATION = 500
