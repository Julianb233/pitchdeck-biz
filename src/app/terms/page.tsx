import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service — pitchdeck.biz",
  description: "Terms of Service for pitchdeck.biz",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">
            pitch<span className="text-primary">deck</span>.biz
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using pitchdeck.biz, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>
              pitchdeck.biz is an AI-powered platform that generates pitch decks, sell sheets, and branding materials based on business information you provide. We offer one-time purchases and subscription plans.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating an account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Intellectual Property</h2>
            <p>
              You retain all rights to the business information you upload. The generated pitch decks, sell sheets, and branding materials are yours to use for any lawful purpose. The pitchdeck.biz platform, its design, and underlying technology remain our intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Payment and Refunds</h2>
            <p>
              Payments are processed securely through our payment provider. We offer a 7-day satisfaction guarantee on one-time purchases. If you are not satisfied, contact us for a full refund. Subscription plans may be cancelled at any time; cancellation takes effect at the end of the current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Acceptable Use</h2>
            <p>
              You agree not to use the service for any unlawful purpose, to upload malicious content, to attempt to reverse-engineer our AI models, or to resell generated materials as a competing service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
            <p>
              pitchdeck.biz is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid for the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Modifications</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact</h2>
            <p>
              For questions about these terms, contact us at{" "}
              <a href="mailto:hello@pitchdeck.biz" className="text-primary hover:underline">
                hello@pitchdeck.biz
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
