import type React from "react"
import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Forgot Password",
  description: "Reset your pitchdeck.biz account password. Enter your email to receive a password reset link.",
  path: "/forgot-password",
  noIndex: true,
})

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
