"use client"

import Link from "next/link"
import Image from "next/image"
import { FileText, Printer, Monitor, Layout } from "lucide-react"

const features = [
  {
    icon: Printer,
    title: "Print-Ready Files",
    description: "CMYK color profiles, bleed marks, and crop lines included. Send directly to your printer.",
  },
  {
    icon: Monitor,
    title: "Digital-Optimized Versions",
    description: "RGB exports optimized for web, email, and digital ads with proper compression.",
  },
  {
    icon: Layout,
    title: "Brand-Consistent Layouts",
    description: "Every piece follows your brand guidelines — colors, fonts, spacing, and logo placement.",
  },
]

const collateralTypes = [
  { name: "Flyers" },
  { name: "Brochures" },
  { name: "Business Cards" },
  { name: "Email Headers" },
  { name: "Web Banners" },
  { name: "Event Materials" },
  { name: "Trade Show Graphics" },
]

const steps = [
  { step: "01", title: "Upload Your Materials", description: "Add your logo, brand guidelines, and any content or copy for the piece." },
  { step: "02", title: "AI Generates Designs", description: "Our AI creates professional layouts tailored to each format and your brand." },
  { step: "03", title: "Download & Print", description: "Get print-ready and digital-optimized files, ready to use immediately." },
]

export default function MarketingCollateralPage() {
  return (
    <div className="bg-zinc-950 text-white">
      {/* Hero */}
      <section className="pt-24 pb-16 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1
                className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Marketing Collateral
              </h1>
              <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
                Professional flyers, brochures, business cards, and more — designed by AI, ready to print.
                Every piece stays perfectly on-brand with your colors, fonts, and guidelines.
              </p>
              <p className="text-sm text-zinc-500">8 tokens per piece</p>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800">
              <Image src="/images/branding-marketing-collateral.png" alt="Marketing collateral examples" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 mb-4">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 md:px-12 border-t border-zinc-800">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-zinc-400 text-sm">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Types */}
      <section className="py-20 px-6 md:px-12 border-t border-zinc-800">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Supported Formats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {collateralTypes.map((t) => (
              <div key={t.name} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
                <FileText className="w-5 h-5 mx-auto mb-2 text-zinc-400" />
                <h3 className="text-sm font-semibold">{t.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-6 md:px-12 border-t border-zinc-800">
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create?</h2>
          <p className="text-zinc-400 mb-8">Generate professional marketing materials in seconds.</p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-full text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
              boxShadow: "0 4px 20px rgba(249, 115, 22, 0.3)",
            }}
          >
            $49/mo — Start Creating
          </Link>
        </div>
      </section>
    </div>
  )
}
