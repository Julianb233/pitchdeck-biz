import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter_Tight } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { MagneticCursor } from "@/components/ui/magnetic-cursor"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
})

export const metadata: Metadata = {
  title: "pitchdeck.biz | AI Pitch Deck Generator",
  description: "Create stunning, investor-ready pitch decks in minutes with AI. Bold designs, compelling narratives, data-driven insights — all powered by artificial intelligence.",
  keywords: ["pitch deck", "AI", "startup", "investor", "fundraising", "presentation", "pitch deck generator", "AI pitch deck"],
  authors: [{ name: "pitchdeck.biz" }],
  openGraph: {
    title: "pitchdeck.biz | AI Pitch Deck Generator",
    description: "Create stunning, investor-ready pitch decks in minutes with AI. Bold designs, compelling narratives, data-driven insights.",
    type: "website",
    siteName: "pitchdeck.biz",
  },
  twitter: {
    card: "summary_large_image",
    title: "pitchdeck.biz | AI Pitch Deck Generator",
    description: "Create stunning, investor-ready pitch decks in minutes with AI.",
  },
  metadataBase: new URL("https://pitchdeck.biz"),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-dark-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0a1a" },
  ],
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
      <body className={`${interTight.className} font-sans antialiased`}>
        <MagneticCursor />
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
