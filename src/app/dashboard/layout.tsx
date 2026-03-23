import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LogoutButton } from "@/components/dashboard/logout-button"
import { createPageMetadata } from "@/lib/metadata"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export const metadata: Metadata = createPageMetadata({
  title: "Dashboard",
  description: "Manage your AI-generated pitch decks, branding assets, and account settings.",
  path: "/dashboard",
  noIndex: true,
})

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = user.user_metadata?.name || user.email || "User";
  const emailVerified = !!(user.email_confirmed_at || user.confirmed_at);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Email verification banner */}
      {!emailVerified && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center">
          <p className="text-sm text-amber-200">
            <span className="font-medium">Verify your email address.</span>{" "}
            Please check your inbox for a verification link to unlock all features.
          </p>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <DashboardSidebar displayName={displayName} />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 md:px-8">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-lg font-bold tracking-tight md:hidden"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #06b6d4 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                pitchdeck.biz
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">{displayName}</span>
              <LogoutButton />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-6 md:p-8 max-w-[1200px] w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
