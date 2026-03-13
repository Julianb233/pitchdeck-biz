import Link from "next/link"

const assetNav = [
  { href: "/branding-assets/social-media", label: "Social Media" },
  { href: "/branding-assets/product-mockups", label: "Product Mockups" },
  { href: "/branding-assets/marketing-collateral", label: "Marketing Collateral" },
  { href: "/branding-assets/brand-identity", label: "Brand Identity" },
]

export default function BrandingAssetsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Sub-navigation */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-16 md:top-20 z-40">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <nav className="flex items-center gap-6 h-12 overflow-x-auto">
            <Link href="/branding-assets" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors whitespace-nowrap">
              Overview
            </Link>
            {assetNav.map(item => (
              <Link key={item.href} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-white transition-colors whitespace-nowrap">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {children}
    </div>
  )
}
