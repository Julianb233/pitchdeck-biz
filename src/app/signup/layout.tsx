import type React from "react"
import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Sign Up",
  description: "Create your free pitchdeck.biz account and start generating AI-powered pitch decks, sell sheets, and branding kits.",
  path: "/signup",
})

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
