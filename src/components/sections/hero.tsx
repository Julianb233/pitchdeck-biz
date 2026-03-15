"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Hero() {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      window.scrollTo({ top: offsetPosition, behavior: "smooth" })
    }
  }

  return (
    <section className="min-h-screen flex flex-col justify-center pt-20 relative overflow-hidden">
      {/* Animated gradient orb background - pure CSS, no images */}
      <div
        className="absolute -right-32 md:-right-20 top-32 md:top-40 w-[500px] h-[500px] md:w-[750px] md:h-[750px] pointer-events-none animate-orb-rotate -z-10 scale-125 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle at 30% 40%, rgba(255,0,110,0.5) 0%, rgba(139,92,246,0.4) 30%, rgba(32,62,236,0.3) 55%, rgba(0,212,255,0.2) 75%, transparent 100%)",
        }}
      />

      {/* Secondary orb for extra color */}
      <div
        className="absolute -left-48 bottom-20 w-[400px] h-[400px] md:w-[500px] md:h-[500px] pointer-events-none -z-10 opacity-40 blur-3xl rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,0,110,0.4) 0%, rgba(139,92,246,0.3) 40%, rgba(0,212,255,0.2) 70%, transparent 100%)",
        }}
      />

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-20 md:py-32 md:pb-4 pb-4 pt-4 md:pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - text content */}
          <div>
            {/* Subtitle badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-border/50 bg-background/50 backdrop-blur-sm">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "linear-gradient(135deg, #ff006e, #8b5cf6)" }}
              />
              <span className="text-sm font-medium text-muted-foreground">
                AI-Powered Pitch Deck Generator
              </span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-[80px] font-sans font-semibold tracking-tight leading-[1.05] text-balance">
              <span className="hero-word font-sans font-semibold text-5xl md:text-7xl py-2" style={{ animationDelay: "0s", marginRight: "0.25em" }}>
                Turn
              </span>
              <span className="hero-word font-sans font-semibold text-5xl md:text-7xl py-2" style={{ animationDelay: "0.1s", marginRight: "0.25em" }}>
                Your
              </span>
              <span className="hero-word font-sans font-semibold text-5xl md:text-7xl py-2" style={{ animationDelay: "0.2s", marginRight: "0.25em" }}>
                Vision
              </span>
              <span className="hero-word font-sans font-semibold text-5xl md:text-7xl py-2" style={{ animationDelay: "0.3s", marginRight: "0.25em" }}>
                Into
              </span>
              <span className="hero-word font-sans font-semibold text-5xl md:text-7xl py-2" style={{ animationDelay: "0.4s", marginRight: "0.25em" }}>
                a
              </span>
              <span
                className="hero-word ai-gradient-word font-sans font-semibold text-5xl md:text-7xl py-2"
                style={{
                  animationDelay: "0.5s",
                  marginRight: "0.25em",
                  background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 33%, #203eec 66%, #00d4ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 20px rgba(255, 0, 110, 0.3)) drop-shadow(0 0 30px rgba(139, 92, 246, 0.3)) drop-shadow(0 0 40px rgba(0, 212, 255, 0.2))",
                }}
              >
                Winning
              </span>
              <span className="hero-word font-sans font-semibold text-5xl md:text-7xl py-2" style={{ animationDelay: "0.6s", marginRight: "0.25em" }}>
                Pitch
              </span>
              <span className="hero-word font-sans font-semibold text-5xl md:text-7xl py-2" style={{ animationDelay: "0.7s" }}>
                Deck
              </span>
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-xl leading-relaxed text-left text-lg text-zinc-500 ml-0">
              Just describe your business — or upload existing materials — and our AI creates a professional
              pitch deck, sell sheet, and branding kit in minutes. Save thousands compared to hiring designers
              and get investor-ready materials today.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mt-10">
              <Link
                href="/create"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white rounded-full transition-all hover:scale-105 relative overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #203eec 100%)",
                  boxShadow: "0 4px 24px rgba(255, 0, 110, 0.3), 0 0 48px rgba(139, 92, 246, 0.15)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(255, 0, 110, 0.5), 0 0 64px rgba(139, 92, 246, 0.3)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(255, 0, 110, 0.3), 0 0 48px rgba(139, 92, 246, 0.15)"
                }}
              >
                Create Your Pitch Deck
              </Link>
              <Link
                href="#how-it-works"
                onClick={(e) => handleNavClick(e, "#how-it-works")}
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-medium transition-colors hover:gap-3"
                style={{ color: "#8b5cf6" }}
              >
                See How It Works
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Social proof hint */}
            <div className="mt-12 flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[
                  "linear-gradient(135deg, #ff006e, #ff5c8a)",
                  "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                  "linear-gradient(135deg, #203eec, #6366f1)",
                  "linear-gradient(135deg, #00d4ff, #38bdf8)",
                ].map((bg, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background"
                    style={{ background: bg }}
                  />
                ))}
              </div>
              <span>Trusted by 500+ founders and startups</span>
            </div>
          </div>

          {/* Right side - Floating deck mockup cards (pure CSS) */}
          <div className="relative hidden lg:flex items-center justify-center min-h-[500px]">
            {/* Background glow */}
            <div
              className="absolute inset-0 rounded-full blur-[80px] opacity-30"
              style={{
                background: "radial-gradient(circle, rgba(139,92,246,0.6) 0%, rgba(32,62,236,0.3) 50%, transparent 70%)",
              }}
            />

            {/* Main deck card */}
            <div
              className="hero-float-main relative w-[320px] h-[200px] rounded-2xl border border-white/10 backdrop-blur-md p-6 z-20"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ background: "#ff006e" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#8b5cf6" }} />
                <div className="w-3 h-3 rounded-full" style={{ background: "#00d4ff" }} />
              </div>
              <div className="h-3 w-3/4 rounded-full mb-3" style={{ background: "linear-gradient(90deg, #ff006e, #8b5cf6)" }} />
              <div className="h-2 w-full rounded-full bg-white/10 mb-2" />
              <div className="h-2 w-5/6 rounded-full bg-white/10 mb-2" />
              <div className="h-2 w-2/3 rounded-full bg-white/10 mb-4" />
              <div className="flex gap-2">
                <div className="h-8 flex-1 rounded-lg" style={{ background: "linear-gradient(135deg, rgba(255,0,110,0.3), rgba(139,92,246,0.3))" }} />
                <div className="h-8 flex-1 rounded-lg" style={{ background: "linear-gradient(135deg, rgba(32,62,236,0.3), rgba(0,212,255,0.3))" }} />
              </div>
            </div>

            {/* Floating card - top right */}
            <div
              className="hero-float-1 absolute top-4 right-2 w-[200px] h-[130px] rounded-xl border border-white/10 backdrop-blur-sm p-4 z-10"
              style={{
                background: "linear-gradient(145deg, rgba(255,0,110,0.08) 0%, rgba(139,92,246,0.05) 100%)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2), 0 0 20px rgba(255,0,110,0.1)",
              }}
            >
              <div className="h-2.5 w-2/3 rounded-full mb-3" style={{ background: "linear-gradient(90deg, #ff006e, #ff5c8a)" }} />
              <div className="h-2 w-full rounded-full bg-white/10 mb-2" />
              <div className="h-2 w-4/5 rounded-full bg-white/10 mb-3" />
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg" style={{ background: "linear-gradient(135deg, rgba(255,0,110,0.4), rgba(255,92,138,0.2))" }} />
                <div className="w-10 h-10 rounded-lg" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.4), rgba(167,139,250,0.2))" }} />
              </div>
            </div>

            {/* Floating card - bottom left */}
            <div
              className="hero-float-2 absolute bottom-8 left-0 w-[180px] h-[120px] rounded-xl border border-white/10 backdrop-blur-sm p-4 z-30"
              style={{
                background: "linear-gradient(145deg, rgba(0,212,255,0.08) 0%, rgba(32,62,236,0.05) 100%)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2), 0 0 20px rgba(0,212,255,0.1)",
              }}
            >
              <div className="h-2.5 w-1/2 rounded-full mb-3" style={{ background: "linear-gradient(90deg, #00d4ff, #38bdf8)" }} />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-14 rounded-lg" style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.3), rgba(56,189,248,0.1))" }} />
                <div className="h-14 rounded-lg" style={{ background: "linear-gradient(135deg, rgba(32,62,236,0.3), rgba(99,102,241,0.1))" }} />
              </div>
            </div>

            {/* Small floating accent - sparkle */}
            <div
              className="hero-float-1-reverse absolute top-16 left-8 w-12 h-12 rounded-lg border border-white/10 z-10 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(255,0,110,0.1))",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#sparkle-grad)" strokeWidth="2">
                <defs>
                  <linearGradient id="sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff006e" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>

            {/* Small floating accent - chart */}
            <div
              className="hero-float-2-reverse absolute bottom-20 right-4 w-10 h-10 rounded-lg border border-white/10 z-10 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(32,62,236,0.1))",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
                <path d="M18 20V10M12 20V4M6 20V14" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
