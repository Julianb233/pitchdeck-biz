import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter_Tight } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { MagneticCursor } from "@/components/ui/magnetic-cursor"
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "@/components/providers/session-provider"
import "./globals.css"

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
})

export const metadata: Metadata = {
  title: "pitchdeck.biz — AI Pitch Deck Generator",
  description: "Create a professional investor pitch deck in minutes with AI. Upload your business docs, get a complete pitch deck, sell sheet, one-pager, and branding kit.",
  keywords: ["pitch deck", "AI", "startup", "investor", "fundraising", "presentation", "pitch deck generator", "AI pitch deck"],
  authors: [{ name: "pitchdeck.biz" }],
  openGraph: {
    title: "pitchdeck.biz — AI Pitch Deck Generator",
    description: "Create a professional investor pitch deck in minutes with AI. Upload your business docs, get a complete pitch deck, sell sheet, one-pager, and branding kit.",
    type: "website",
    siteName: "pitchdeck.biz",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "pitchdeck.biz — AI Pitch Deck Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "pitchdeck.biz — AI Pitch Deck Generator",
    description: "Create a professional investor pitch deck in minutes with AI. Upload your business docs, get a complete pitch deck, sell sheet, one-pager, and branding kit.",
    images: ["/og-image.svg"],
  },
  manifest: "/manifest.json",
  metadataBase: new URL("https://pitchdeck.biz"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-dark-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} ${interTight.className} font-sans antialiased`}>
        <SessionProvider>
          <MagneticCursor />
          {children}
          <Toaster />
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  )
}
