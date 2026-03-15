"use client"

import { useState } from "react"
import { SectionTitle } from "@/components/ui/section-title"

const gradients = [
  "linear-gradient(135deg, #ff006e, #ff5c8a)",
  "linear-gradient(135deg, #8b5cf6, #a78bfa)",
  "linear-gradient(135deg, #203eec, #6366f1)",
  "linear-gradient(135deg, #00d4ff, #38bdf8)",
  "linear-gradient(135deg, #f97316, #fdba74)",
  "linear-gradient(135deg, #10b981, #6ee7b7)",
  "linear-gradient(135deg, #ec4899, #f9a8d4)",
]

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function Avatar({ name, index }: { name: string; index: number }) {
  const initials = getInitials(name)
  const gradient = gradients[index % gradients.length]
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm"
      style={{ background: gradient }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

const testimonials = [
  {
    id: 1,
    quote:
      "We raised $2.5M in our seed round. The pitch deck from pitchdeck.biz was instrumental — investors said it was one of the most professional they'd seen.",
    author: "Sarah Chen",
    role: "CEO, NeuralFlow",
    company: "NeuralFlow",
    blurColor: "bg-blue-500",
  },
  {
    id: 2,
    quote:
      "I needed to sell my business and had no idea how to present it. In 15 minutes I had a professional sell sheet that helped me close the deal.",
    author: "Marcus Johnson",
    role: "Former Owner, Pacific Grill",
    company: "Pacific Grill",
    blurColor: "bg-purple-500",
  },
  {
    id: 3,
    quote:
      "As a non-technical founder, I struggled to communicate my vision. The AI understood my business better than I could explain it myself.",
    author: "Emily Rodriguez",
    role: "Founder, EcoTrack",
    company: "EcoTrack",
    blurColor: "bg-pink-500",
  },
  {
    id: 4,
    quote:
      "We used to spend $8,000 per pitch deck with agencies. Now we generate them in minutes for a fraction of the cost.",
    author: "David Park",
    role: "CTO, DataStack",
    company: "DataStack",
    blurColor: "bg-emerald-500",
  },
  {
    id: 5,
    quote:
      "The branding kit alone was worth it. We got logo concepts, color palettes, and a style guide that we still use today.",
    author: "Lisa Wang",
    role: "VP Marketing, GreenPath",
    company: "GreenPath",
    blurColor: "bg-orange-500",
  },
  {
    id: 6,
    quote:
      "I just recorded a voice memo about my business and got back a complete investor deck. The future is here.",
    author: "James Mitchell",
    role: "Founder, VoiceFirst",
    company: "VoiceFirst",
    blurColor: "bg-cyan-500",
  },
  {
    id: 7,
    quote:
      "The subscription plan saves us thousands monthly on design. Our marketing team loves the AI-generated social media assets.",
    author: "Nina Patel",
    role: "CEO, AutoScale",
    company: "AutoScale",
    blurColor: "bg-rose-500",
  },
]

export function Testimonials() {
  const [isPaused, setIsPaused] = useState(false)

  const duplicatedTestimonials = [...testimonials, ...testimonials]
  const duplicatedTestimonialsReverse = [...testimonials.slice().reverse(), ...testimonials.slice().reverse()]
  const mobileTestimonials = testimonials.slice(0, 6)

  return (
    <section id="testimonials" className="py-20 border-border overflow-hidden md:py-32 border-t-[0] pb-0 relative">
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-20 hidden lg:block" />

      <div className="hidden lg:block pl-6 md:pl-12">
        {/* Section Header */}
        <div className="mb-12 md:mb-16 max-w-[1280px]">
          <SectionTitle className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
            What clients say
          </SectionTitle>
        </div>

        <div className="relative mb-6">
          <div
            className="flex gap-6 animate-scroll-left"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            style={{ animationPlayState: isPaused ? "paused" : "running" }}
          >
            {duplicatedTestimonials.map((testimonial, index) => (
              <article
                key={`${testimonial.id}-${index}`}
                className="relative flex-shrink-0 w-[85vw] md:w-[400px] p-6 md:p-8 border bg-card hover:shadow-lg transition-shadow overflow-hidden border-border md:px-6 md:py-6 rounded-3xl"
              >
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={testimonial.author} index={testimonial.id - 1} />
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-base leading-relaxed font-semibold text-foreground relative z-10">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                <div
                  className={`absolute -bottom-12 -right-12 w-48 h-48 ${testimonial.blurColor} rounded-full opacity-10`}
                  style={{ filter: "blur(72px)" }}
                />
              </article>
            ))}
          </div>
        </div>

        <div className="relative">
          <div
            className="flex gap-6 animate-scroll-right"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            style={{ animationPlayState: isPaused ? "paused" : "running" }}
          >
            {duplicatedTestimonialsReverse.map((testimonial, index) => (
              <article
                key={`reverse-${testimonial.id}-${index}`}
                className="relative flex-shrink-0 w-[85vw] md:w-[400px] p-6 md:p-8 border bg-card hover:shadow-lg transition-shadow overflow-hidden border-border md:px-6 md:py-6 rounded-3xl"
              >
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={testimonial.author} index={testimonial.id - 1} />
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-base leading-relaxed font-semibold text-foreground relative z-10">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                <div
                  className={`absolute -bottom-12 -right-12 w-48 h-48 ${testimonial.blurColor} rounded-full opacity-10`}
                  style={{ filter: "blur(72px)" }}
                />
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:hidden max-w-[1280px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="mb-12 md:mb-16">
          <SectionTitle className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
            What clients say
          </SectionTitle>
        </div>

        <div className="relative">
          {mobileTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="sticky pt-10"
              style={{
                top: `${70 + index * 0}px`,
                zIndex: index + 1,
              }}
            >
              <article className="relative p-6 md:p-8 border bg-card transition-shadow overflow-hidden border-border rounded-3xl">
                {/* Author Info */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={testimonial.author} index={testimonial.id - 1} />
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>

                {/* Quote */}
                <blockquote className="text-base leading-relaxed font-semibold text-foreground relative z-10">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                <div
                  className={`absolute -bottom-12 -right-12 w-48 h-48 ${testimonial.blurColor} rounded-full opacity-10`}
                  style={{ filter: "blur(72px)" }}
                />
              </article>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none z-10 lg:hidden" />
    </section>
  )
}
