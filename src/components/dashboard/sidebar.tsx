"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Rocket,
  Palette,
  Clock,
  Mic,
  Sparkles,
  FileText,
  Package,
  Briefcase,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/launch", label: "Launch Suite", icon: Rocket },
  { href: "/dashboard/assets", label: "Branding Assets", icon: Palette },
  { href: "/dashboard/assets/history", label: "Asset History", icon: Clock },
  { href: "/dashboard/materials", label: "Materials", icon: Package },
  { href: "/dashboard/documents", label: "Documents", icon: Briefcase },
  { href: "/dashboard/pitch-coach", label: "Pitch Coach", icon: Mic },
] as const

export function DashboardSidebar({ displayName }: { displayName: string }) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-[240px] border-r border-border bg-sidebar shrink-0 sticky top-0 h-screen">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight"
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

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: "var(--brand-primary)" }}
                />
              )}
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Create CTA */}
      <div className="p-4 border-t border-border">
        <Link
          href="/create"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.02]"
          style={{
            background: "var(--brand-gradient-cta)",
            boxShadow: "0 4px 16px rgba(124, 58, 237, 0.3)",
          }}
        >
          <Sparkles className="w-4 h-4" />
          Create New Deck
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: "var(--brand-gradient-cta)" }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{displayName}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
