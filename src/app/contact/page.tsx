import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { GradientBar } from "@/components/ui/gradient-bar"
import { createPageMetadata } from "@/lib/metadata"
import { ArrowUpRight, Mail, MessageSquare, Clock, Calendar } from "lucide-react"

export const metadata: Metadata = createPageMetadata({
  title: "Contact — Get in Touch",
  description:
    "Questions about AI pitch deck generation? Book a consultation or reach out to the pitchdeck.biz team.",
  path: "/contact",
})

const CONTACT_OPTIONS = [
  {
    icon: MessageSquare,
    title: "Chat With Us",
    description: "Get instant answers about our AI pitch deck platform.",
    action: "Start a Chat",
    href: "/create",
    gradient: "from-[#7c3aed] to-[#3b82f6]",
  },
  {
    icon: Calendar,
    title: "Book a Consultation",
    description:
      "Schedule a 15-minute call to discuss your pitch deck needs and investor strategy.",
    action: "Book a Call",
    href: "https://calendly.com/pitchdeckbiz/consultation",
    gradient: "from-[#ec4899] to-[#7c3aed]",
    external: true,
  },
  {
    icon: Mail,
    title: "Email Us",
    description:
      "For partnerships, enterprise inquiries, or detailed questions.",
    action: "hello@pitchdeck.biz",
    href: "mailto:hello@pitchdeck.biz",
    gradient: "from-[#f97316] to-[#ec4899]",
  },
]

const FAQ_ITEMS = [
  {
    question: "How long does it take to generate a pitch deck?",
    answer:
      "Most decks are generated in under 5 minutes. You answer a few questions about your business, select your investor type, and our AI builds a complete, investor-ready deck.",
  },
  {
    question: "Can I edit the deck after it's generated?",
    answer:
      "Yes. Every deck exports as an editable format. You can customize slides, swap content, and adjust design elements to match your brand.",
  },
  {
    question: "What investor types do you support?",
    answer:
      "We support 6 investor profiles: Venture Capital, Angel Investor, Bank/SBA, Crowdfunding, Family Office, and Strategic Partner. Each profile tailors the deck's narrative, metrics, and structure.",
  },
  {
    question: "Do you offer full-service deck design?",
    answer:
      "Yes. For founders who want hands-on help, we offer a full-service tier where our team reviews your AI-generated deck and refines it with custom design, copywriting, and investor feedback.",
  },
  {
    question: "What's included in each deck?",
    answer:
      "Every deck includes a pitch deck (12-15 slides), a one-page sell sheet, a brand kit with colors and typography, and a business overview document.",
  },
]

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        {/* Hero */}
        <section className="max-w-[1280px] mx-auto px-6 md:px-12 mb-20">
          <div className="max-w-3xl">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
              Contact
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance">
              Let&apos;s Build Your Pitch
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Whether you have questions about our platform, need help choosing a
              plan, or want to discuss a custom project — we&apos;re here to
              help.
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section className="max-w-[1280px] mx-auto px-6 md:px-12 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CONTACT_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <div
                  key={option.title}
                  className="group rounded-xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.gradient} flex items-center justify-center shadow-lg mb-6`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {option.description}
                  </p>
                  <Link
                    href={option.href}
                    {...(option.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    {option.action}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )
            })}
          </div>
        </section>

        {/* Response Time Banner */}
        <section className="max-w-[1280px] mx-auto px-6 md:px-12 mb-20">
          <div
            className="rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(124, 58, 237, 0.06), rgba(59, 130, 246, 0.04))",
              border: "1px solid rgba(124, 58, 237, 0.15)",
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#3b82f6] flex items-center justify-center shadow-lg flex-shrink-0">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">
                Average Response Time: Under 2 Hours
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our team responds to all inquiries during business hours (Mon-Fri
                9am-6pm PT). For urgent matters, use the chat feature for
                real-time assistance.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-[1280px] mx-auto px-6 md:px-12 mb-20">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-10">
            Common Questions
          </h2>
          <div className="space-y-4 max-w-3xl">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.question}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h3 className="text-base font-semibold mb-2">
                  {item.question}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-[1280px] mx-auto px-6 md:px-12">
          <div
            className="rounded-2xl p-10 md:p-14 text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(236, 72, 153, 0.06))",
              border: "1px solid rgba(124, 58, 237, 0.2)",
            }}
          >
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
              Skip the Wait — Create Your Deck Now
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Our AI generates investor-ready pitch decks in under 5 minutes.
              No consultation needed to get started.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-full transition-all hover:scale-105 brand-gradient-glow"
              style={{
                background: "var(--brand-gradient-cta)",
                boxShadow: "0 8px 32px rgba(124, 58, 237, 0.4)",
              }}
            >
              Create Your Pitch Deck
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <GradientBar />
    </>
  )
}
