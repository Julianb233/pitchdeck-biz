import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy — pitchdeck.biz",
  description: "Privacy Policy for pitchdeck.biz",
}

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>
              When you use pitchdeck.biz, we may collect information you provide directly, such as your name, email address, and business information you upload or record to generate pitch decks. We also collect usage data such as pages visited, features used, and device information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>
              We use your information to provide and improve our services, generate your pitch decks and branding materials, process payments, communicate with you about your account, and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Storage and Security</h2>
            <p>
              Your data is encrypted in transit and at rest. We use industry-standard security measures to protect your information. Uploaded business materials are stored securely and used only to generate your requested deliverables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Sharing</h2>
            <p>
              We do not sell or share your personal or business information with third parties for marketing purposes. We may share data with service providers who help us operate our platform (e.g., payment processors, cloud hosting) under strict confidentiality agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Your Rights</h2>
            <p>
              You may request access to, correction of, or deletion of your personal data at any time by contacting us at hello@pitchdeck.biz. We will respond to your request within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Cookies</h2>
            <p>
              We use essential cookies to maintain your session and preferences. We may also use analytics cookies to understand how our service is used. You can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any material changes by posting the updated policy on this page with a revised date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Contact Us</h2>
            <p>
              If you have questions about this privacy policy, please contact us at{" "}
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
