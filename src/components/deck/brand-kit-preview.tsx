"use client";

import type { DeckContent } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Type, MessageSquare, PenTool } from "lucide-react";

interface BrandKitPreviewProps {
  brandKit: DeckContent["brandKit"];
}

const SECTIONS = [
  {
    key: "colorRationale" as const,
    label: "Color Rationale",
    icon: Palette,
  },
  {
    key: "fontPairing" as const,
    label: "Typography",
    icon: Type,
  },
  {
    key: "brandVoice" as const,
    label: "Brand Voice",
    icon: MessageSquare,
  },
  {
    key: "logoDirection" as const,
    label: "Logo Direction",
    icon: PenTool,
  },
];

export function BrandKitPreview({ brandKit }: BrandKitPreviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {SECTIONS.map((section) => {
        const Icon = section.icon;
        const value = brandKit[section.key];
        const content =
          section.key === "fontPairing"
            ? `Heading: ${(value as DeckContent["brandKit"]["fontPairing"]).heading}\nBody: ${(value as DeckContent["brandKit"]["fontPairing"]).body}`
            : String(value);

        return (
          <Card key={section.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="h-4 w-4 text-violet-400" />
                {section.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {content}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
