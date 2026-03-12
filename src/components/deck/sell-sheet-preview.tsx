"use client";

import type { DeckContent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SellSheetPreviewProps {
  sellSheet: DeckContent["sellSheet"];
}

export function SellSheetPreview({ sellSheet }: SellSheetPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{sellSheet.headline}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{sellSheet.subheadline}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sellSheet.sections.map((section, i) => (
          <Card key={i} className={i === sellSheet.sections.length - 1 && sellSheet.sections.length % 2 !== 0 ? "md:col-span-2" : ""}>
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{section.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
