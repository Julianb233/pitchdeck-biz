"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import type { SlideContent, SlideType } from "@/lib/types";
import { SLIDE_TYPE_COLORS } from "@/lib/deck/templates";

// ── Slide type label mapping ───────────────────────────────────────────────

const SLIDE_TYPE_LABELS: Record<SlideType, string> = {
  title: "Title",
  problem: "Problem",
  solution: "Solution",
  market: "Market",
  product: "Product",
  "business-model": "Business Model",
  traction: "Traction",
  team: "Team",
  financials: "Financials",
  ask: "The Ask",
  "why-now": "Why Now",
  closing: "Closing",
};

// ── Single Slide Card ──────────────────────────────────────────────────────

interface SlideCardProps {
  slide: SlideContent;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

function SlideCard({ slide, isActive, isExpanded, onClick }: SlideCardProps) {
  const colorClass = SLIDE_TYPE_COLORS[slide.type] ?? "bg-gray-500/20 text-gray-300 border-gray-500/30";

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 border-2 overflow-hidden",
        isActive
          ? "border-violet-500 shadow-lg shadow-violet-500/20 scale-[1.02]"
          : "border-transparent hover:border-violet-500/30 hover:shadow-md",
        isExpanded ? "min-h-[400px]" : "min-h-[200px]"
      )}
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Slide header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              {String(slide.slideNumber).padStart(2, "0")}
            </span>
            <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", colorClass)}>
              {SLIDE_TYPE_LABELS[slide.type]}
            </Badge>
          </div>
        </div>

        {/* Slide content preview */}
        <div className={cn("px-4 pb-4", isExpanded ? "space-y-4" : "space-y-2")}>
          <h3 className={cn(
            "font-bold tracking-tight",
            isExpanded ? "text-xl" : "text-sm"
          )}>
            {slide.title}
          </h3>

          {slide.subtitle && (
            <p className={cn(
              "text-muted-foreground",
              isExpanded ? "text-base" : "text-xs line-clamp-2"
            )}>
              {slide.subtitle}
            </p>
          )}

          {slide.bulletPoints && slide.bulletPoints.length > 0 && (
            <ul className={cn(
              "space-y-1",
              isExpanded ? "text-sm" : "text-xs"
            )}>
              {slide.bulletPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400" />
                  <span className={isExpanded ? "" : "line-clamp-1"}>{point}</span>
                </li>
              ))}
            </ul>
          )}

          {isExpanded && slide.notes && (
            <div className="mt-4 rounded-md bg-muted/50 p-3 border border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-1">Speaker Notes</p>
              <p className="text-xs text-muted-foreground">{slide.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Slide Navigation Thumbnails ────────────────────────────────────────────

interface SlideThumbProps {
  slide: SlideContent;
  isActive: boolean;
  onClick: () => void;
}

function SlideThumb({ slide, isActive, onClick }: SlideThumbProps) {
  const colorClass = SLIDE_TYPE_COLORS[slide.type] ?? "bg-gray-500/20 text-gray-300";

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg p-2 transition-all min-w-[64px]",
        isActive
          ? "bg-violet-500/10 ring-1 ring-violet-500"
          : "hover:bg-muted/50"
      )}
    >
      <div className={cn(
        "w-12 h-8 rounded border flex items-center justify-center text-[9px] font-bold",
        colorClass
      )}>
        {String(slide.slideNumber).padStart(2, "0")}
      </div>
      <span className="text-[9px] text-muted-foreground truncate max-w-[64px]">
        {SLIDE_TYPE_LABELS[slide.type]}
      </span>
    </button>
  );
}

// ── Main Deck Preview Component ────────────────────────────────────────────

export interface DeckPreviewProps {
  slides: SlideContent[];
  className?: string;
}

export function DeckPreview({ slides, className }: DeckPreviewProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const thumbsRef = React.useRef<HTMLDivElement>(null);

  const activeSlide = slides[activeIndex];
  if (!activeSlide) return null;

  const goTo = (index: number) => {
    setActiveIndex(Math.max(0, Math.min(index, slides.length - 1)));
  };

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  // Keyboard navigation
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape") setIsExpanded(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // Scroll thumbnail into view
  React.useEffect(() => {
    if (thumbsRef.current) {
      const thumb = thumbsRef.current.children[activeIndex] as HTMLElement;
      thumb?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeIndex]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={goPrev}
            disabled={activeIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm text-muted-foreground font-mono tabular-nums">
            {activeIndex + 1} / {slides.length}
          </span>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={goNext}
            disabled={activeIndex === slides.length - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Active slide */}
      <SlideCard
        slide={activeSlide}
        isActive={true}
        isExpanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      />

      {/* Thumbnail strip */}
      <div
        ref={thumbsRef}
        className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin"
      >
        {slides.map((slide, i) => (
          <SlideThumb
            key={slide.slideNumber}
            slide={slide}
            isActive={i === activeIndex}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
