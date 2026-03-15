import type React from "react"
import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Verify Email",
  description: "Verify your email address to activate your pitchdeck.biz account.",
  path: "/verify-email",
  noIndex: true,
})

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children
}
