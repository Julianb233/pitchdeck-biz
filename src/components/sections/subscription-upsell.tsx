import { ImageIcon, Package, FileText, Palette } from "lucide-react"

const assetTypes = [
  {
    icon: ImageIcon,
    title: "Social Media Graphics",
    description: "Instagram posts, LinkedIn banners, Facebook ads, Twitter headers, and Story templates",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: Package,
    title: "Product Mockups",
    description: "Lifestyle shots, packaging renders, device mockups, and custom background compositions",
    color: "from-purple-500 to-pink-400",
  },
  {
    icon: FileText,
    title: "Marketing Collateral",
    description: "Flyers, brochures, email headers, web banners, and event materials on demand",
    color: "from-orange-500 to-amber-400",
  },
  {
    icon: Palette,
    title: "Brand Identity",
    description: "Logo variations, color palettes, style guides, brand books, and visual identity systems",
    color: "from-emerald-500 to-teal-400",
  },
]

export function SubscriptionUpsell() {
  return (
    <section id="subscription" className="py-20 md:py-32 relative overflow-hidden">
      {/* Dark contrasting background */}
      <div className="absolute inset-0 bg-zinc-950" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at 30% 50%, rgba(32, 62, 236, 0.15) 0%, transparent 70%), radial-gradient(ellipse at 70% 50%, rgba(0, 212, 255, 0.1) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <p className="text-sm uppercase tracking-wider mb-4 bg-gradient-to-r from-[#203eec] to-[#00d4ff] bg-clip-text text-transparent font-medium">
            Monthly Subscription
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white text-balance">
            Never Hire a Graphic Designer Again
          </h2>
          <p className="mt-6 text-zinc-400 text-lg leading-relaxed">
            Monthly branding assets, powered by AI. Upload your product images and brand materials, and our AI generates marketing assets on demand using your monthly token allocation.
          </p>
        </div>

        {/* 4-Column Icon Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {assetTypes.map((asset) => (
            <div
              key={asset.title}
              className="relative group p-6 md:p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all duration-300"
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${asset.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <asset.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2">{asset.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{asset.description}</p>

              {/* Subtle glow on hover */}
              <div
                className={`absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br ${asset.color} rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                style={{ filter: "blur(40px)" }}
              />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 md:mt-16">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white rounded-full transition-all hover:shadow-2xl relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #203eec 0%, #00d4ff 100%)",
              boxShadow: "0 8px 32px rgba(32, 62, 236, 0.4)",
            }}
          >
            <span className="relative z-10">Start Your Subscription</span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl bg-gradient-to-r from-[#203eec] to-[#00d4ff]" />
          </a>
        </div>
      </div>
    </section>
  )
}
