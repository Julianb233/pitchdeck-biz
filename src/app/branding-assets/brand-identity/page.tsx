"use client"

import Link from "next/link"
import Image from "next/image"
import { Palette, Sparkles, BookOpen, Layers } from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "AI Analyzes Your Business",
    description: "Tell us about your industry, audience, and values. AI understands your positioning to generate a fitting identity.",
  },
  {
    icon: Palette,
    title: "Generates Cohesive Identity",
    description: "Logo, colors, typography, and visual elements — all designed to work together as a unified brand system.",
  },
  {
    icon: Layers,
    title: "Multiple Concept Directions",
    description: "Receive 3-5 distinct brand concepts to choose from, each with a different creative direction.",
  },
  {
    icon: BookOpen,
    title: "Full Brand Book Export",
    description: "Download a complete brand guidelines PDF with usage rules, spacing, and do/don't examples.",
  },
]

const deliverables = [
  { name: "Logo Concepts + Variations", description: "Primary, secondary, icon, and monochrome" },
  { name: "Color Palette", description: "Primary, secondary, accent with hex codes" },
  { name: "Typography Pairings", description: "Heading and body font recommendations" },
  { name: "Brand Guidelines PDF", description: "Complete usage rules and standards" },
  { name: "Social Media Kit", description: "Profile pics, banners, templates" },
  { name: "Favicon + App Icon", description: "All sizes for web and mobile" },
]

const steps = [
  { step: "01", title: "Describe Your Brand", description: "Share your business name, industry, target audience, and brand personality." },
  { step: "02", title: "AI Creates Your Identity", description: "Our AI generates multiple cohesive brand concepts with logos, colors, and typography." },
  { step: "03", title: "Download Your Brand Kit", description: "Get your complete brand identity package with all assets and guidelines." },
]

export default function BrandIdentityPage() {
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
                  background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Brand Identity
              </h1>
              <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
                A complete brand identity, generated in minutes. Logo concepts, color palettes,
                typography pairings, and a full brand guidelines document — all from a single prompt.
              </p>
              <p className="text-sm text-zinc-500">25 tokens per brand kit</p>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800">
              <Image src="/images/branding-brand-identity.png" alt="Brand identity kit examples" fill className="object-cover" />
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
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 mb-4">
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
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-zinc-400 text-sm">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deliverables */}
      <section className="py-20 px-6 md:px-12 border-t border-zinc-800">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Full Brand Kit Deliverables</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deliverables.map((d) => (
              <div key={d.name} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <h3 className="text-sm font-semibold mb-1">{d.name}</h3>
                <p className="text-xs text-zinc-500">{d.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-6 md:px-12 border-t border-zinc-800">
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your Brand?</h2>
          <p className="text-zinc-400 mb-8">Generate a complete brand identity in minutes.</p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-full text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
              boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)",
            }}
          >
            $49/mo — Start Creating
          </Link>
        </div>
      </section>
    </div>
  )
}
