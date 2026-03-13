"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { DeckContent } from "@/lib/types";
import type { BrandColors } from "@/lib/export/pptx-generator";
import { toast } from "sonner";
import {
  Download,
  FileText,
  Presentation,
  Palette,
  Package,
} from "lucide-react";

interface DownloadButtonsProps {
  deck: DeckContent;
  brandColors?: BrandColors;
  className?: string;
}

type DownloadType = "pptx" | "sell-sheet" | "one-pager" | "brand-kit" | "bundle";

interface DownloadConfig {
  label: string;
  icon: React.ReactNode;
  endpoint: string;
  body: (deck: DeckContent, brandColors?: BrandColors) => object;
  filename: string;
  variant: "default" | "outline" | "secondary";
}

const DOWNLOAD_CONFIGS: Record<DownloadType, DownloadConfig> = {
  pptx: {
    label: "Download Pitch Deck (.pptx)",
    icon: <Presentation className="size-4" />,
    endpoint: "/api/export/pptx",
    body: (deck, brandColors) => ({ deck, brandColors }),
    filename: "pitch-deck.pptx",
    variant: "outline",
  },
  "sell-sheet": {
    label: "Download Sell Sheet (.pdf)",
    icon: <FileText className="size-4" />,
    endpoint: "/api/export/pdf",
    body: (deck, brandColors) => ({ deck, brandColors, type: "sell-sheet" }),
    filename: "sell-sheet.pdf",
    variant: "outline",
  },
  "one-pager": {
    label: "Download One-Pager (.pdf)",
    icon: <FileText className="size-4" />,
    endpoint: "/api/export/pdf",
    body: (deck, brandColors) => ({ deck, brandColors, type: "one-pager" }),
    filename: "one-pager.pdf",
    variant: "outline",
  },
  "brand-kit": {
    label: "Download Brand Kit (.pdf)",
    icon: <Palette className="size-4" />,
    endpoint: "/api/export/pdf",
    body: (deck, brandColors) => ({ deck, brandColors, type: "brand-kit" }),
    filename: "brand-kit.pdf",
    variant: "outline",
  },
  bundle: {
    label: "Download All (.zip)",
    icon: <Package className="size-4" />,
    endpoint: "/api/export/bundle",
    body: (deck, brandColors) => ({ deck, brandColors }),
    filename: "pitchdeck-bundle.zip",
    variant: "default",
  },
};

export function DownloadButtons({
  deck,
  brandColors,
  className,
}: DownloadButtonsProps) {
  const [loading, setLoading] = useState<DownloadType | null>(null);

  async function handleDownload(type: DownloadType) {
    const config = DOWNLOAD_CONFIGS[type];
    setLoading(type);

    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config.body(deck, brandColors)),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? `Download failed (${response.status})`
        );
      }

      // Create blob and trigger browser download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = config.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`[download] ${type} failed:`, error);
      toast.error(
        error instanceof Error ? error.message : "Download failed. Please try again."
      );
    } finally {
      setLoading(null);
    }
  }

  const isDisabled = loading !== null;

  return (
    <div className={className}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {/* Individual download buttons */}
        {(
          ["pptx", "sell-sheet", "one-pager", "brand-kit"] as DownloadType[]
        ).map((type) => {
          const config = DOWNLOAD_CONFIGS[type];
          const isLoading = loading === type;

          return (
            <Button
              key={type}
              variant={config.variant}
              size="lg"
              disabled={isDisabled}
              onClick={() => handleDownload(type)}
              className="justify-start gap-2"
            >
              {isLoading ? <Spinner /> : config.icon}
              {isLoading ? "Generating..." : config.label}
            </Button>
          );
        })}

        {/* Primary "Download All" button — highlighted */}
        <Button
          variant="default"
          size="lg"
          disabled={isDisabled}
          onClick={() => handleDownload("bundle")}
          className="justify-start gap-2 font-semibold"
        >
          {loading === "bundle" ? (
            <Spinner />
          ) : (
            <Download className="size-4" />
          )}
          {loading === "bundle"
            ? "Generating bundle..."
            : "Download All (.zip)"}
        </Button>
      </div>
    </div>
  );
}
