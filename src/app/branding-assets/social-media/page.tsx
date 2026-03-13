"use client"

import Link from "next/link"
import Image from "next/image"
import { ImageIcon, Wand2, Palette, Type, Instagram, Linkedin, Facebook, Twitter } from "lucide-react"

const features = [
  {
    icon: Palette,
    title: "On-Brand Templates",
    description: "Every graphic uses your brand colors, fonts, and logo — automatically applied across all formats.",
  },
  {
    icon: Wand2,
    title: "Auto-Resize for Every Platform",
    description: "Create once, export everywhere. AI resizes and recomposes your design for each platform's specs.",
  },
  {
    icon: ImageIcon,
    title: "Brand Color Consistency",
    description: "Your hex codes, your palette. AI enforces color consistency across every single asset.",
  },
  {
    icon: Type,
    title: "Caption Suggestions",
    description: "AI-generated captions tailored to each platform's best practices and your brand voice.",
  },
]

const platforms = [
  { name: "Instagram", types: "Posts, Stories, Reels Covers", icon: Instagram },
  { name: "LinkedIn", types: "Posts, Banners", icon: Linkedin },
  { name: "Facebook", types: "Ads, Cover Photos", icon: Facebook },
  { name: "Twitter / X", types: "Headers, Posts", icon: Twitter },
  { name: "TikTok", types: "Cover Images", icon: ImageIcon },
]

const steps = [
  { step: "01", title: "Upload Your Brand Materials", description: "Add your logo, brand colors, and any reference images or style guides." },
  { step: "02", title: "AI Generates Your Graphics", description: "Our AI creates platform-specific graphics that match your brand identity perfectly." },
  { step: "03", title: "Download & Publish", description: "Download high-res files ready to post, or connect directly to your scheduling tools." },
]

export default function SocialMediaPage() {
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
                  background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Social Media Graphics
              </h1>
              <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
                Scroll-stopping social content for every platform. AI generates on-brand posts,
                stories, ads, and covers — perfectly sized and styled for maximum engagement.
              </p>
              <p className="text-sm text-zinc-500">5 tokens per social graphic</p>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800">
              <Image src="/images/branding-social-media.png" alt="Social media graphics examples" fill className="object-cover" />
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
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 mb-4">
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
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-4">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-zinc-400 text-sm">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-20 px-6 md:px-12 border-t border-zinc-800">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Supported Platforms</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {platforms.map((p) => (
              <div key={p.name} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-center">
                <p.icon className="w-6 h-6 mx-auto mb-3 text-zinc-400" />
                <h3 className="text-sm font-semibold mb-1">{p.name}</h3>
                <p className="text-xs text-zinc-500">{p.types}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 px-6 md:px-12 border-t border-zinc-800">
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create?</h2>
          <p className="text-zinc-400 mb-8">Generate stunning social media graphics in seconds.</p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-full text-white transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
              boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)",
            }}
          >
            $49/mo — Start Creating
          </Link>
        </div>
      </section>
    </div>
  )
}
