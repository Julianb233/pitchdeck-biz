"use client"

import Link from "next/link"

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#deliverables", label: "Deliverables" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "mailto:hello@pitchdeck.biz", label: "Contact" },
]

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              pitchdeck.biz
            </Link>
            <p className="mt-4 text-muted-foreground text-sm max-w-xs leading-relaxed">
              AI-powered pitch deck generator. Upload your business info, get a professional investor deck, sell sheet, and branding kit in minutes.
            </p>
            <div className="mt-6">
              <Link
                href="mailto:hello@pitchdeck.biz"
                className="text-sm transition-colors hover:underline"
                style={{ color: "#203eec" }}
              >
                hello@pitchdeck.biz
              </Link>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Pages</h4>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-4">Get product updates and AI tips directly to your inbox.</p>
            <Link
              href="mailto:hello@pitchdeck.biz?subject=Subscribe%20to%20pitchdeck.biz%20updates"
              className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all"
              style={{
                background: "linear-gradient(135deg, #203eec 0%, #00d4ff 100%)",
                boxShadow: "0 4px 20px rgba(32, 62, 236, 0.3)",
              }}
            >
              Subscribe via Email
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-16 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} pitchdeck.biz. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
