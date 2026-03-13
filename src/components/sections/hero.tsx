"use client"

import Link from "next/link"
import Image from "next/image"
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
      {/* Animated orb background - more colorful */}
      <div className="absolute -right-32 md:-right-48 top-32 md:top-40 w-[500px] h-[500px] md:w-[750px] md:h-[750px] pointer-events-none animate-orb-rotate -z-10 scale-125">
        <Image src="/images/orb.png" alt="" width={750} height={750} className="w-full h-full" priority />
      </div>

      {/* Secondary orb for extra color */}
      <div
        className="absolute -left-48 bottom-20 w-[400px] h-[400px] md:w-[500px] md:h-[500px] pointer-events-none -z-10 opacity-40 blur-3xl rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,0,110,0.4) 0%, rgba(139,92,246,0.3) 40%, rgba(0,212,255,0.2) 70%, transparent 100%)",
        }}
      />

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-20 md:py-32 md:pb-4 pb-4 pt-4 md:pt-32">
        <div className="max-w-4xl">
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
          <h1 className="text-5xl sm:text-6xl lg:text-[80px] font-semibold tracking-tight leading-[1.05] text-balance">
            <span className="hero-word font-mono font-normal text-5xl md:text-7xl py-2" style={{ animationDelay: "0s", marginRight: "0.25em" }}>
              Turn
            </span>
            <span className="hero-word font-mono font-normal text-5xl md:text-7xl py-2" style={{ animationDelay: "0.1s", marginRight: "0.25em" }}>
              Your
            </span>
            <span className="hero-word font-mono font-normal text-5xl md:text-7xl py-2" style={{ animationDelay: "0.2s", marginRight: "0.25em" }}>
              Vision
            </span>
            <span className="hero-word font-mono font-normal text-5xl md:text-7xl py-2" style={{ animationDelay: "0.3s", marginRight: "0.25em" }}>
              Into
            </span>
            <span className="hero-word font-mono font-normal text-5xl md:text-7xl py-2" style={{ animationDelay: "0.4s", marginRight: "0.25em" }}>
              a
            </span>
            <span
              className="hero-word ai-gradient-word font-mono font-normal text-5xl md:text-7xl py-2"
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
            <span className="hero-word font-mono font-normal text-5xl md:text-7xl py-2" style={{ animationDelay: "0.6s", marginRight: "0.25em" }}>
              Pitch
            </span>
            <span className="hero-word font-mono font-normal text-5xl md:text-7xl py-2" style={{ animationDelay: "0.7s" }}>
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
      </div>

      {/* Pitch deck mockup placeholder */}
      <div className="w-full mt-8 px-6 md:px-12 max-w-[1280px] mx-auto">
        <div
          className="w-full aspect-[16/9] max-h-[500px] rounded-2xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0f0f1a 0%, #1a1033 30%, #0f172a 60%, #0a0a14 100%)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 0 120px rgba(139,92,246,0.1)",
          }}
        >
          {/* Simulated slide grid */}
          <div className="absolute inset-6 md:inset-10 grid grid-cols-3 gap-3 md:gap-4 opacity-80">
            {/* Title slide */}
            <div className="col-span-2 rounded-xl p-4 md:p-6 flex flex-col justify-between"
              style={{ background: "linear-gradient(135deg, rgba(255,0,110,0.15) 0%, rgba(139,92,246,0.1) 100%)", border: "1px solid rgba(139,92,246,0.2)" }}
            >
              <div>
                <div className="w-16 md:w-24 h-2 rounded-full mb-3" style={{ background: "linear-gradient(90deg, #ff006e, #8b5cf6)" }} />
                <div className="w-32 md:w-48 h-3 md:h-4 rounded-full bg-white/20 mb-2" />
                <div className="w-24 md:w-36 h-2 md:h-3 rounded-full bg-white/10" />
              </div>
              <div className="w-20 md:w-28 h-2 rounded-full bg-white/10" />
            </div>

            {/* Stats slide */}
            <div className="rounded-xl p-3 md:p-4 flex flex-col gap-2"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="w-full h-2 rounded-full bg-white/10" />
              <div className="flex-1 flex flex-col justify-center gap-1.5">
                <div className="w-full h-6 md:h-8 rounded-lg" style={{ background: "linear-gradient(90deg, rgba(0,212,255,0.3), rgba(0,212,255,0.1))" }} />
                <div className="w-3/4 h-6 md:h-8 rounded-lg" style={{ background: "linear-gradient(90deg, rgba(139,92,246,0.3), rgba(139,92,246,0.1))" }} />
                <div className="w-1/2 h-6 md:h-8 rounded-lg" style={{ background: "linear-gradient(90deg, rgba(255,0,110,0.3), rgba(255,0,110,0.1))" }} />
              </div>
            </div>

            {/* Team slide */}
            <div className="rounded-xl p-3 md:p-4"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="w-full h-2 rounded-full bg-white/10 mb-3" />
              <div className="grid grid-cols-2 gap-2">
                {[0,1,2,3].map(i => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full" style={{ background: `linear-gradient(135deg, ${["#ff006e","#8b5cf6","#00d4ff","#203eec"][i]}, transparent)` }} />
                    <div className="w-full h-1 rounded-full bg-white/10" />
                  </div>
                ))}
              </div>
            </div>

            {/* Chart slide */}
            <div className="col-span-2 rounded-xl p-3 md:p-4 flex flex-col"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="w-24 h-2 rounded-full bg-white/10 mb-3" />
              <div className="flex-1 flex items-end gap-1.5 md:gap-2">
                {[30, 45, 35, 60, 50, 75, 65, 85, 70, 90, 80, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all"
                    style={{
                      height: `${h}%`,
                      background: `linear-gradient(to top, rgba(${i < 4 ? "255,0,110" : i < 8 ? "139,92,246" : "0,212,255"},0.6), rgba(${i < 4 ? "255,0,110" : i < 8 ? "139,92,246" : "0,212,255"},0.2))`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Shine overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(139,92,246,0.05) 100%)",
            }}
          />
        </div>
      </div>
    </section>
  )
}
