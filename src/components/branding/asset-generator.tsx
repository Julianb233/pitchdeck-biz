"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AssetType = "social" | "mockup" | "collateral" | "identity";

interface GenerationState {
  loading: boolean;
  result: string | null;
  error: string | null;
  tokensUsed: number;
}

const ASSET_TYPES: { value: AssetType; label: string; description: string }[] = [
  { value: "social", label: "Social Media", description: "Open graph images, social cards (1200x630)" },
  { value: "mockup", label: "Mockup", description: "Product or service mockups (1024x768)" },
  { value: "collateral", label: "Collateral", description: "Flyers, brochure covers (800x1100)" },
  { value: "identity", label: "Identity", description: "Logo marks, brand icons (800x800)" },
];

const TOKEN_LIMIT = 20;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AssetGenerator() {
  const [assetType, setAssetType] = useState<AssetType>("social");
  const [prompt, setPrompt] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#4F46E5");
  const [secondaryColor, setSecondaryColor] = useState("#7C3AED");
  const [accentColor, setAccentColor] = useState("#EC4899");
  const [state, setState] = useState<GenerationState>({
    loading: false,
    result: null,
    error: null,
    tokensUsed: 0,
  });

  const generate = useCallback(async () => {
    if (!prompt.trim()) {
      setState((s) => ({ ...s, error: "Please enter a description" }));
      return;
    }

    if (state.tokensUsed >= TOKEN_LIMIT) {
      setState((s) => ({ ...s, error: "Token limit reached. Please try again later." }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null, result: null }));

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "brand-asset",
          type: assetType,
          prompt: prompt.trim(),
          brandColors: {
            primary: primaryColor,
            secondary: secondaryColor,
            accent: accentColor,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState((s) => ({ ...s, loading: false, error: data.error ?? "Generation failed" }));
        return;
      }

      setState((s) => ({
        ...s,
        loading: false,
        result: data.image,
        tokensUsed: s.tokensUsed + 1,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Network error",
      }));
    }
  }, [prompt, assetType, primaryColor, secondaryColor, accentColor, state.tokensUsed]);

  const handleDownload = useCallback(() => {
    if (!state.result) return;

    const link = document.createElement("a");
    link.href = state.result;
    link.download = `brand-${assetType}-${Date.now()}.${state.result.includes("svg") ? "svg" : "png"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [state.result, assetType]);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Brand Asset Generator</CardTitle>
            <CardDescription>
              Create custom branding assets with AI-powered generation
            </CardDescription>
          </div>
          <Badge variant={state.tokensUsed >= TOKEN_LIMIT ? "destructive" : "secondary"}>
            {state.tokensUsed}/{TOKEN_LIMIT} tokens
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="generate">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4 mt-4">
            {/* Asset type selector */}
            <div className="space-y-2">
              <Label htmlFor="asset-type">Asset Type</Label>
              <Select value={assetType} onValueChange={(v) => setAssetType(v as AssetType)}>
                <SelectTrigger id="asset-type">
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="font-medium">{t.label}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        {t.description}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt">Description</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the asset you want to generate... e.g., 'A modern fintech social media card featuring abstract data visualizations with a professional feel'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {prompt.length}/500
              </p>
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <Label>Brand Colors</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="primary-color" className="text-xs text-muted-foreground">
                    Primary
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="primary-color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-8 w-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="secondary-color" className="text-xs text-muted-foreground">
                    Secondary
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="secondary-color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-8 w-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="accent-color" className="text-xs text-muted-foreground">
                    Accent
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="accent-color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-8 w-8 rounded border cursor-pointer"
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Generate button */}
            <Button
              onClick={generate}
              disabled={state.loading || !prompt.trim() || state.tokensUsed >= TOKEN_LIMIT}
              className="w-full"
              size="lg"
            >
              {state.loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate Asset"
              )}
            </Button>

            {state.error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
                {state.error}
              </p>
            )}
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            {state.result ? (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center min-h-[300px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={state.result}
                    alt={`Generated ${assetType} asset`}
                    className="max-w-full max-h-[500px] object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleDownload} variant="outline" className="flex-1">
                    Download
                  </Button>
                  <Button onClick={generate} variant="secondary" className="flex-1" disabled={state.loading}>
                    Regenerate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[300px] text-muted-foreground border rounded-lg border-dashed">
                <p>Generate an asset to see the preview here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
