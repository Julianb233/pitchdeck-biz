import type React from "react"
import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Reset Password",
  description: "Set a new password for your pitchdeck.biz account.",
  path: "/reset-password",
  noIndex: true,
})

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
