import type React from "react"
import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Create Your Pitch Deck",
  description: "Upload your business documents and let AI generate a professional investor pitch deck, sell sheet, one-pager, and branding kit in minutes.",
  path: "/create",
  noIndex: true,
})

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children
}
