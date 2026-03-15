import type React from "react"
import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Log In",
  description: "Log in to your pitchdeck.biz account to create AI-powered pitch decks and manage your branding assets.",
  path: "/login",
})

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
