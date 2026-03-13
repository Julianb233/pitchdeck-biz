"use client";

import type { DeckContent } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

interface OnePagerPreviewProps {
  onePager: DeckContent["onePager"];
}

export function OnePagerPreview({ onePager }: OnePagerPreviewProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-center">
        {onePager.headline}
      </h2>

      <Separator />

      <div className="space-y-5">
        {onePager.sections.map((section, i) => (
          <div key={i} className="space-y-1.5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-400">
              {section.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
