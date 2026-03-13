"use client"

import Image from "next/image"
import { Upload, Mic, Sparkles, Wand2, Download, Presentation } from "lucide-react"
import { SectionTitle } from "@/components/ui/section-title"

const steps = [
  {
    number: "01",
    title: "Share Your Story",
    description: "Upload documents, PDFs, or business plans — or just hit record and talk about your business.",
    details: [
      "Upload docs, PDFs, or business plans",
      "Or record audio — just talk about your business",
      "We extract what matters automatically",
    ],
    icons: [Upload, Mic],
    image: "/images/step-1-upload.png",
    gradient: "from-[#ff006e] to-[#8b5cf6]",
    glowColor: "rgba(255, 0, 110, 0.15)",
    borderColor: "rgba(255, 0, 110, 0.2)",
  },
  {
    number: "02",
    title: "AI Creates Your Deck",
    description: "Our AI analyzes your business and designs a complete pitch deck with custom branding.",
    details: [
      "Analyzes your business model, market & value prop",
      "Designs custom color scheme, layout & branding",
      "Generates professional copy and visuals",
    ],
    icons: [Sparkles, Wand2],
    image: "/images/step-2-analyze.png",
    gradient: "from-[#8b5cf6] to-[#203eec]",
    glowColor: "rgba(139, 92, 246, 0.15)",
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  {
    number: "03",
    title: "Download & Present",
    description: "Get your pitch deck, sell sheet, one-pager, and branding kit — ready to wow investors.",
    details: [
      "Pitch deck (PPTX), sell sheet (PDF), one-pager & branding kit",
      "Preview and customize before downloading",
      "Ready to present to investors, partners, or buyers",
    ],
    icons: [Download, Presentation],
    image: "/images/step-3-download.png",
    gradient: "from-[#203eec] to-[#00d4ff]",
    glowColor: "rgba(32, 62, 236, 0.15)",
    borderColor: "rgba(32, 62, 236, 0.2)",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <SectionTitle className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
            How It Works
          </SectionTitle>
          <p className="mt-4 text-lg text-zinc-500 max-w-2xl mx-auto">
            From idea to investor-ready pitch deck in minutes — not weeks.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div
            className="hidden lg:block absolute top-[100px] left-[16.67%] right-[16.67%] h-[2px]"
            style={{
              background: "linear-gradient(90deg, #ff006e, #8b5cf6, #203eec, #00d4ff)",
              opacity: 0.3,
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative group">
                {/* Mobile connecting line */}
                {index < steps.length - 1 && (
                  <div
                    className="lg:hidden absolute left-1/2 -bottom-4 w-[2px] h-8 -translate-x-1/2"
                    style={{
                      background: `linear-gradient(180deg, ${step.borderColor}, transparent)`,
                    }}
                  />
                )}

                {/* Card */}
                <div
                  className="relative rounded-2xl md:rounded-3xl p-8 md:p-10 border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
                  style={{
                    borderColor: step.borderColor,
                    boxShadow: `0 0 0 0 ${step.glowColor}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 8px 40px ${step.glowColor}, 0 0 60px ${step.glowColor}`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 0 ${step.glowColor}`
                  }}
                >
                  {/* Step Image */}
                  <div className="mb-4 -mx-8 md:-mx-10 -mt-8 md:-mt-10 overflow-hidden rounded-t-2xl md:rounded-t-3xl">
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={600}
                      height={400}
                      className="w-full object-cover aspect-[3/2]"
                    />
                  </div>

                  {/* Step Number */}
                  <div
                    className={`text-7xl md:text-8xl font-bold bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent opacity-20 absolute top-4 right-6 select-none`}
                  >
                    {step.number}
                  </div>

                  {/* Icons */}
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    {step.icons.map((Icon, iconIndex) => (
                      <div
                        key={iconIndex}
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-semibold mb-3 relative z-10">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-zinc-500 mb-5 relative z-10">
                    {step.description}
                  </p>

                  {/* Detail list */}
                  <ul className="space-y-2 relative z-10">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-2 text-sm text-zinc-400">
                        <span
                          className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${step.gradient} flex-shrink-0`}
                        />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
