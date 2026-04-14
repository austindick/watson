---
type: page
title: Avatar Component
last_updated: "2026-03-31"
---

# Avatar Component

Avatars show a thumbnail representation of an individual or business.

**Import:** `import { Avatar } from "@faire/slate/components/avatar"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| size | "xxSmall" \| "xSmall" \| "small" \| "medium" \| "large" \| "xLarge" | "medium" | No | Avatar size: xxSmall=32px, xSmall=40px, small=48px, medium=56px, large=64px, xLarge=96px |
| label | string | -- | No | Fallback text when no image; first letter displayed. Also used as alt text if image has none |
| image | Partial<IImage> | -- | No | The IImage object to display |
| iconProps | { Component, position?, showContainer? } | -- | No | Icon overlay. Position: "topRight" (default) or "bottomRight" |
| borderColor | string | -- | No | Border color of the avatar |

## Variants

- Size variants: xxSmall (32px), xSmall (40px), small (48px), medium (56px), large (64px), xLarge (96px)
- Displays image when provided, otherwise shows first letter of label as fallback

## States

- **With image** -- renders the image thumbnail
- **Without image** -- renders first letter of label in a styled container
- **With icon** -- shows an icon overlay at specified position (topRight/bottomRight)
