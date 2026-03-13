"use client"

import Link from "next/link"
import Image from "next/image"
import { ImageIcon, Package, FileText, Palette } from "lucide-react"

const assetCategories = [
  {
    title: "Social Media Graphics",
    description: "On-brand posts, stories, and ads for every platform. Auto-sized for Instagram, LinkedIn, Facebook, X, and TikTok.",
    icon: ImageIcon,
    href: "/branding-assets/social-media",
    gradient: "from-blue-500 to-cyan-400",
    image: "/images/branding-social-media.png",
  },
  {
    title: "Product Mockups",
    description: "Professional lifestyle shots, device mockups, and packaging renders. Upload your product and let AI do the rest.",
    icon: Package,
    href: "/branding-assets/product-mockups",
    gradient: "from-purple-500 to-pink-400",
    image: "/images/branding-product-mockups.png",
  },
  {
    title: "Marketing Collateral",
    description: "Print-ready flyers, brochures, business cards, email headers, and event materials — all on brand.",
    icon: FileText,
    href: "/branding-assets/marketing-collateral",
    gradient: "from-orange-500 to-amber-400",
    image: "/images/branding-marketing-collateral.png",
  },
  {
    title: "Brand Identity",
    description: "Complete brand kits: logo concepts, color palettes, typography pairings, and exportable brand guidelines.",
    icon: Palette,
    href: "/branding-assets/brand-identity",
    gradient: "from-emerald-500 to-teal-400",
    image: "/images/branding-brand-identity.png",
  },
]

export default function BrandingAssetsPage() {
  return (
    <div className="bg-zinc-950 text-white">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto text-center">
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            style={{
              background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Never Hire a Graphic Designer Again
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
            AI-powered branding assets on demand. Generate professional social media graphics,
            product mockups, marketing materials, and complete brand identities — in seconds.
          </p>
        </div>
      </section>

      {/* Category Cards */}
      <section className="pb-20 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {assetCategories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-zinc-700 transition-all hover:bg-zinc-900/80"
            >
              <div className="relative aspect-[8/5] w-full">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
              </div>
              <div className="p-8 pt-4">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${cat.gradient} mb-4`}>
                  <cat.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{cat.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">{cat.description}</p>
                <span className={`text-sm font-medium bg-gradient-to-r ${cat.gradient} bg-clip-text text-transparent`}>
                  Learn More &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-32 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto text-center">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Unlimited Branding Assets
            </h2>
            <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
              One subscription. Every asset type. No per-project fees, no hourly rates,
              no waiting for revisions.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-full text-white transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #203eec 100%)",
                boxShadow: "0 4px 20px rgba(255, 0, 110, 0.3)",
              }}
            >
              Start Your Subscription — $49/mo
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
