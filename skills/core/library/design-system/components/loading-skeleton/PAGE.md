---
type: page
title: LoadingSkeleton Component
last_updated: "2026-03-31"
---

# LoadingSkeleton Component

A loading skeleton represents the expected UI that will be displayed after an unspecified loading time.

**Import:** `import { LoadingSkeleton } from "@faire/slate/components/loading-skeleton"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| variant | "canvas" \| "square" \| "circle" \| "titleText" \| "paragraphText" | "canvas" | No | Skeleton shape variant |
| width | number \| string | -- | No | Width (canvas variant) |
| height | number \| string | -- | No | Height (canvas variant) |
| size | number \| string | 240 | No | Size (square variant) |
| diameter | number \| string | 64 | No | Diameter (circle variant) |

## Variants

| Variant | Description | Customizable Props |
|---------|-------------|--------------------|
| canvas | Custom dimensions, defaults to 100% | width, height |
| square | Square shape | size (default 240px) |
| circle | Circular shape | diameter (default 64px) |
| titleText | Title placeholder | width (default 136px), fixed 32px height |
| paragraphText | Paragraph placeholder | width (default 240px), fixed 20px height |
