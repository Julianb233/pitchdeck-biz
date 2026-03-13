-- Migration: Add brand_colors jsonb column to assets table
-- Run this if the assets table was already created without brand_colors

ALTER TABLE public.assets
  ADD COLUMN IF NOT EXISTS brand_colors jsonb NOT NULL DEFAULT '[]'::jsonb;
