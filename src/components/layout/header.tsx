"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#deliverables", label: "Deliverables" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
]

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const element = document.querySelector(href)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
    router.refresh()
  }

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border" : "bg-transparent",
        )}
      >
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <nav className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="text-xl font-bold tracking-tight"
              style={{
                background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              pitchdeck.biz
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Auth-aware CTA */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    href="/create"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Create
                  </Link>
                  <Link
                    href="/dashboard/overview"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                  <span className="text-sm text-muted-foreground">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-full text-white transition-all hover:scale-105 relative overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #203eec 100%)",
                      boxShadow: "0 4px 20px rgba(255, 0, 110, 0.3)",
                    }}
                  >
                    <span className="relative z-10">Create Your Deck</span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r from-[#ff006e] via-[#8b5cf6] to-[#203eec]" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -mr-2" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex flex-col h-full p-6">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-xl font-bold tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #00d4ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                pitchdeck.biz
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 -mr-2" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-6 mt-12">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-3xl font-semibold hover:text-muted-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto space-y-3">
              {user ? (
                <>
                  <Link
                    href="/create"
                    className="inline-flex items-center justify-center w-full px-5 py-3 text-base font-semibold rounded-full text-white transition-all hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #203eec 100%)",
                      boxShadow: "0 4px 20px rgba(255, 0, 110, 0.3)",
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Create New Deck
                  </Link>
                  <Link
                    href="/dashboard/overview"
                    className="block w-full text-center px-5 py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="w-full px-5 py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center w-full px-5 py-3 text-base font-semibold rounded-full text-white transition-all hover:scale-105 relative overflow-hidden group"
                    style={{
                      background: "linear-gradient(135deg, #ff006e 0%, #8b5cf6 50%, #203eec 100%)",
                      boxShadow: "0 4px 20px rgba(255, 0, 110, 0.3)",
                    }}
                  >
                    <span className="relative z-10">Create Your Deck</span>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl bg-gradient-to-r from-[#ff006e] via-[#8b5cf6] to-[#203eec]" />
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center px-5 py-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
