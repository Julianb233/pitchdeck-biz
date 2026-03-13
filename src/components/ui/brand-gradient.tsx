"use client"

import React from "react"

type GradientVariant = "primary" | "hero" | "cta" | "accent" | "bar"

const gradientMap: Record<GradientVariant, string> = {
  primary: "var(--brand-gradient-primary)",
  hero: "var(--brand-gradient-hero)",
  cta: "var(--brand-gradient-cta)",
  accent: "var(--brand-gradient-accent)",
  bar: "var(--brand-gradient-bar)",
}

interface BrandGradientTextProps {
  variant?: GradientVariant
  className?: string
  children: React.ReactNode
  as?: "span" | "h1" | "h2" | "h3" | "h4" | "p" | "div"
  animated?: boolean
}

/**
 * Renders text with a pitchdeck.biz brand gradient fill.
 * Use `variant` to select the gradient style and `animated` to enable the shifting animation.
 */
export function BrandGradientText({
  variant = "primary",
  className = "",
  children,
  as: Tag = "span",
  animated = false,
}: BrandGradientTextProps) {
  return (
    <Tag
      className={`${animated ? "brand-gradient-animated" : ""} ${className}`}
      style={{
        background: gradientMap[variant],
        backgroundSize: animated ? "300% 300%" : undefined,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
    </Tag>
  )
}

interface BrandGradientBgProps {
  variant?: GradientVariant
  className?: string
  children?: React.ReactNode
  as?: "div" | "section" | "span"
  style?: React.CSSProperties
}

/**
 * Renders a container with a pitchdeck.biz brand gradient background.
 * Useful for buttons, cards, badges, and decorative elements.
 */
export function BrandGradientBg({
  variant = "primary",
  className = "",
  children,
  as: Tag = "div",
  style,
}: BrandGradientBgProps) {
  return (
    <Tag
      className={className}
      style={{
        background: gradientMap[variant],
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}
