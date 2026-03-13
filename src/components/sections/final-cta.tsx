import { ArrowUpRight } from "lucide-react"

export function FinalCTA() {
  return (
    <section id="contact" className="py-20 border-border md:py-20 border-t-0">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-6">Get Started</p>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance">
            Ready to Tell Your Story?
          </h2>

          <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
            Create a professional pitch deck in minutes, not weeks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <a
              href="/create"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-white rounded-full transition-all hover:shadow-2xl relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #203eec 0%, #00d4ff 100%)",
                boxShadow: "0 8px 32px rgba(32, 62, 236, 0.4)",
              }}
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                Create Your Pitch Deck — $497
                <ArrowUpRight className="w-4 h-4" />
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl bg-gradient-to-r from-[#203eec] to-[#00d4ff]" />
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full hover:bg-secondary transition-colors"
              style={{ borderColor: "#203eec", borderWidth: "1px", color: "#203eec" }}
            >
              See Pricing Plans
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
