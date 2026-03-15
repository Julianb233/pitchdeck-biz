import type React from "react"
import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description: "Get in touch with pitchdeck.biz. Questions about AI pitch deck generation? We are here to help.",
  path: "/contact",
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
