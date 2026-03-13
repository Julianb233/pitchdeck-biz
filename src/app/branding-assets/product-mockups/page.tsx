"use client"

import Link from "next/link"
import Image from "next/image"
import { Package, Smartphone, Laptop, Monitor, Camera } from "lucide-react"

const features = [
  {
    icon: Camera,
    title: "Upload Product Photo",
    description: "Simply upload a photo of your product — any angle, any background. AI handles the rest.",
  },
  {
    icon: Package,
    title: "AI Background Removal",
    description: "Automatic, pixel-perfect background removal. Your product, isolated and ready for placement.",
  },
  {
    icon: Monitor,
    title: "Professional Scene Placement",
    description: "AI places your product in curated lifestyle scenes, on devices, and in packaging renders.",
  },
  {
    icon: Smartphone,
    title: "Multiple Angles & Variations",
    description: "Get your product from every angle — front, side, 3/4 view — across multiple scene types.",
  },
]

const mockupTypes = [
  { name: "Lifestyle Backgrounds", description: "Natural, studio, and outdoor scenes" },
  { name: "Device Mockups", description: "Phone, laptop, tablet screens" },
  { name: "Packaging Renders", description: "Box, bag, and label mockups" },
  { name: "Flat Lay Compositions", description: "Styled top-down arrangements" },
  { name: "Environment Shots", description: "In-context real-world settings" },
]

const steps = [
  { step: "01", title: "Upload Your Product", description: "Upload a clear photo of your product from any angle." },
  { step: "02", title: "AI Generates Mockups", description: "Our AI removes the background and places your product in professional scenes." },
  { step: "03", title: "Download High-Res Assets", description: "Download production-ready mockups in multiple formats and resolutions." },
]

export default function ProductMockupsPage() {
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
                  background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Product Mockups
              </h1>
              <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
                Transform simple product photos into stunning professional mockups. AI removes backgrounds,
                places products in lifestyle scenes, and renders them on devices — all automatically.
              </p>
              <p className="text-sm text-zinc-500">10 tokens per mockup</p>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800">
              <Image src="/images/branding-product-mockups.png" alt="Product mockup examples" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-400 mb-4">
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
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-transparent mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-zinc-400 text-sm">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mockup Types */}
      <section className="py-20 px-6 md:px-12 border-t border-zinc-800">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Supported Mockup Types</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {mockupTypes.map((t) => (
              <div key={t.name} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
                <h3 className="text-sm font-semibold mb-1">{t.name}</h3>
                <p className="text-xs text-zinc-500">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-6 md:px-12 border-t border-zinc-800">
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create?</h2>
          <p className="text-zinc-400 mb-8">Generate professional product mockups in seconds.</p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-full text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
              boxShadow: "0 4px 20px rgba(168, 85, 247, 0.3)",
            }}
          >
            $49/mo — Start Creating
          </Link>
        </div>
      </section>
    </div>
  )
}
