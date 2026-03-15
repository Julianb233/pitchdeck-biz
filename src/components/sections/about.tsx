"use client"

import { SectionTitle } from "@/components/ui/section-title"

const capabilities = [
  "AI Pitch Deck Generation",
  "Business Analysis & Insights",
  "Brand Identity Design",
  "Sell Sheet Creation",
  "Executive Summaries",
  "Voice-to-Deck Conversion",
  "PPTX & PDF Export",
  "Custom Color Palettes",
  "Investor-Ready Formatting",
]

const stats = [
  { value: "500+", label: "Decks Created" },
  { value: "<5min", label: "Average Turnaround" },
  { value: "98%", label: "Satisfaction Rate" },
]

export function About() {
  return (
    <section id="about" className="py-20 border-border border-t-0 md:py-10 md:pb-32 md:pt-32">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Content */}
          <div>
            <SectionTitle className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
              AI-Powered Pitch Decks That Win Funding
            </SectionTitle>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              pitchdeck.biz uses advanced AI to transform your business information into professional,
              investor-ready pitch decks in minutes. No design skills needed, no back-and-forth with
              agencies, no waiting weeks for deliverables.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Upload your documents, paste text, or simply record yourself talking about your
              business. Our AI analyzes your value proposition, market positioning, financials,
              and team to generate a complete pitch deck, sell sheet, one-pager, and branding
              kit tailored to your story.
            </p>
          </div>

          {/* Right Content */}
          <div>
            {/* Capabilities */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Capabilities</h3>
              <div className="flex flex-wrap gap-2">
                {capabilities.map((capability) => (
                  <span
                    key={capability}
                    className="px-4 py-2 text-sm font-medium border border-border rounded-full hover:bg-secondary transition-colors cursor-default"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center p-4 bg-secondary rounded-2xl">
                  <div className="text-2xl md:text-3xl font-semibold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
