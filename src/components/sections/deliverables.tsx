"use client"

import { useEffect, useRef, useState } from "react"
import { SectionTitle } from "@/components/ui/section-title"
import { Presentation, FileText, FileCheck, Palette } from "lucide-react"

const deliverables = [
  {
    icon: Presentation,
    title: "Investor Pitch Deck",
    subtitle: "10-15 slides",
    tagline: "Tell your story, backed by data",
    description:
      "Problem, solution, market size, business model, team, financials, and the ask — beautifully designed to close rounds.",
    gradient: "from-[#7c3aed] to-[#3b82f6]",
    accentColor: "#7c3aed",
    mockupType: "slides" as const,
  },
  {
    icon: FileText,
    title: "Business Sell Sheet",
    subtitle: "1-2 pages",
    tagline: "Your business at a glance",
    description:
      "Perfect for partner meetings, trade shows, and quick pitches. Everything that matters, nothing that doesn't.",
    gradient: "from-[#ec4899] to-[#f97316]",
    accentColor: "#ec4899",
    mockupType: "document" as const,
  },
  {
    icon: FileCheck,
    title: "One-Pager / Executive Summary",
    subtitle: "Single page",
    tagline: "The elevator pitch, on paper",
    description:
      "One page that captures everything. Send it ahead of meetings and walk in with momentum.",
    gradient: "from-[#06b6d4] to-[#10b981]",
    accentColor: "#06b6d4",
    mockupType: "onepager" as const,
  },
  {
    icon: Palette,
    title: "Branding Kit",
    subtitle: "Full identity",
    tagline: "Your brand identity, defined",
    description:
      "Logo concepts, color palette, typography, and brand guidelines — everything to look like a million bucks.",
    gradient: "from-[#f97316] to-[#7c3aed]",
    accentColor: "#f97316",
    mockupType: "brand" as const,
  },
]

function SlidesMockup({ accentColor }: { accentColor: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Back slides fanned */}
      <div
        className="absolute w-[60%] h-[70%] rounded-lg opacity-20 border border-white/20"
        style={{
          background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)`,
          transform: "rotate(-8deg) translateX(-12px)",
        }}
      />
      <div
        className="absolute w-[60%] h-[70%] rounded-lg opacity-40 border border-white/20"
        style={{
          background: `linear-gradient(135deg, ${accentColor}44, ${accentColor}22)`,
          transform: "rotate(-4deg) translateX(-6px)",
        }}
      />
      {/* Front slide */}
      <div
        className="relative w-[60%] h-[70%] rounded-lg border border-white/30 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accentColor}66, ${accentColor}33)`,
        }}
      >
        <div className="p-3 space-y-2">
          <div className="w-1/2 h-2 rounded-full bg-white/40" />
          <div className="w-3/4 h-1.5 rounded-full bg-white/20" />
          <div className="w-2/3 h-1.5 rounded-full bg-white/20" />
          <div className="mt-3 w-full h-[40%] rounded bg-white/10" />
          <div className="flex gap-1 mt-2">
            <div className="w-1/3 h-4 rounded bg-white/15" />
            <div className="w-1/3 h-4 rounded bg-white/15" />
            <div className="w-1/3 h-4 rounded bg-white/15" />
          </div>
        </div>
      </div>
    </div>
  )
}

function DocumentMockup({ accentColor }: { accentColor: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Second page behind */}
      <div
        className="absolute w-[50%] h-[75%] rounded-lg opacity-30 border border-white/20"
        style={{
          background: `linear-gradient(180deg, ${accentColor}22, ${accentColor}11)`,
          transform: "translateX(8px) translateY(6px)",
        }}
      />
      {/* Front page */}
      <div
        className="relative w-[50%] h-[75%] rounded-lg border border-white/30 overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${accentColor}55, ${accentColor}22)`,
        }}
      >
        {/* Header bar */}
        <div
          className="h-[18%] w-full"
          style={{ background: `${accentColor}66` }}
        />
        <div className="p-3 space-y-1.5">
          <div className="w-3/4 h-1.5 rounded-full bg-white/30" />
          <div className="w-full h-1 rounded-full bg-white/15" />
          <div className="w-full h-1 rounded-full bg-white/15" />
          <div className="w-2/3 h-1 rounded-full bg-white/15" />
          <div className="mt-2 flex gap-2">
            <div className="w-1/2 h-8 rounded bg-white/10" />
            <div className="w-1/2 h-8 rounded bg-white/10" />
          </div>
          <div className="w-full h-1 rounded-full bg-white/15" />
          <div className="w-4/5 h-1 rounded-full bg-white/15" />
        </div>
      </div>
    </div>
  )
}

function OnePagerMockup({ accentColor }: { accentColor: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="relative w-[50%] h-[75%] rounded-lg border border-white/30 overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${accentColor}44, ${accentColor}18)`,
        }}
      >
        {/* Accent stripe */}
        <div
          className="h-1.5 w-full"
          style={{ background: `${accentColor}88` }}
        />
        <div className="p-3 space-y-1.5">
          <div className="w-2/3 h-2 rounded-full bg-white/35" />
          <div className="w-1/2 h-1 rounded-full bg-white/20" />
          <div className="mt-2 w-full h-1 rounded-full bg-white/15" />
          <div className="w-full h-1 rounded-full bg-white/15" />
          <div className="w-3/4 h-1 rounded-full bg-white/15" />
          <div className="mt-2 grid grid-cols-3 gap-1">
            <div className="h-6 rounded bg-white/10" />
            <div className="h-6 rounded bg-white/10" />
            <div className="h-6 rounded bg-white/10" />
          </div>
          <div className="w-full h-1 rounded-full bg-white/15" />
          <div className="w-full h-1 rounded-full bg-white/15" />
          <div className="w-1/2 h-1 rounded-full bg-white/15" />
        </div>
      </div>
    </div>
  )
}

function BrandMockup({ accentColor }: { accentColor: string }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className="relative w-[70%] h-[70%] rounded-lg border border-white/30 overflow-hidden p-3"
        style={{
          background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}15)`,
        }}
      >
        {/* Logo placeholder */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded-full"
            style={{ background: `${accentColor}88` }}
          />
          <div className="w-12 h-1.5 rounded-full bg-white/30" />
        </div>
        {/* Color swatches */}
        <div className="flex gap-1 mb-2">
          <div className="w-5 h-5 rounded" style={{ background: accentColor }} />
          <div className="w-5 h-5 rounded" style={{ background: `${accentColor}bb` }} />
          <div className="w-5 h-5 rounded" style={{ background: `${accentColor}77` }} />
          <div className="w-5 h-5 rounded bg-white/30" />
          <div className="w-5 h-5 rounded bg-white/15" />
        </div>
        {/* Typography samples */}
        <div className="space-y-1 mb-2">
          <div className="w-3/4 h-2 rounded-full bg-white/25" />
          <div className="w-1/2 h-1.5 rounded-full bg-white/15" />
        </div>
        {/* Pattern blocks */}
        <div className="grid grid-cols-2 gap-1">
          <div
            className="h-6 rounded"
            style={{
              background: `linear-gradient(135deg, ${accentColor}55, ${accentColor}22)`,
            }}
          />
          <div className="h-6 rounded bg-white/10" />
        </div>
      </div>
    </div>
  )
}

const mockupComponents = {
  slides: SlidesMockup,
  document: DocumentMockup,
  onepager: OnePagerMockup,
  brand: BrandMockup,
}

function DeliverableCard({
  item,
  index,
}: {
  item: (typeof deliverables)[number]
  index: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.2 },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  const MockupComponent = mockupComponents[item.mockupType]
  const Icon = item.icon

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-2xl border border-border overflow-hidden transition-all duration-500 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      }`}
      style={{
        transitionDelay: `${index * 100}ms`,
        transform: isHovered ? "translateY(-4px)" : isVisible ? "translateY(0)" : "translateY(32px)",
        boxShadow: isHovered
          ? `0 20px 40px ${item.accentColor}20, 0 8px 16px rgba(0,0,0,0.08)`
          : "0 4px 12px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mockup area */}
      <div
        className={`relative h-48 md:h-56 bg-gradient-to-br ${item.gradient} overflow-hidden`}
      >
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <MockupComponent accentColor={item.accentColor} />
      </div>

      {/* Content area */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-300"
            style={{
              background: isHovered ? `${item.accentColor}18` : `${item.accentColor}0d`,
            }}
          >
            <Icon
              className="w-5 h-5 transition-colors duration-300"
              style={{ color: item.accentColor }}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
            <span className="text-xs text-muted-foreground font-medium">{item.subtitle}</span>
          </div>
        </div>

        <p
          className="text-sm font-semibold mb-2 transition-colors duration-300"
          style={{ color: item.accentColor }}
        >
          {item.tagline}
        </p>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {item.description}
        </p>
      </div>
    </div>
  )
}

export function Deliverables() {
  return (
    <section id="deliverables" className="py-20 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            What You Get
          </p>
          <SectionTitle className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance mx-auto">
            Everything You Need to Win
          </SectionTitle>
          <p className="mt-6 max-w-2xl mx-auto text-muted-foreground leading-relaxed text-lg">
            Four premium deliverables, designed to make your business look as good as it is.
            Each one crafted with AI precision and human taste.
          </p>
        </div>

        {/* 2x2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {deliverables.map((item, index) => (
            <DeliverableCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
