"use client"

import { useEffect, useState } from "react"

export function GradientBar() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show gradient bar once user scrolls past the hero section
      setIsVisible(window.scrollY > 100)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return <div className="bottom-gradient-bar transition-opacity duration-500" style={{ opacity: isVisible ? 1 : 0 }} />
}
