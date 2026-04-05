---
type: page
title: IconButton Component
last_updated: "2026-03-31"
---

# IconButton Component

Help users take action or make a choice in smaller, refined spaces.

**Import:** `import { IconButton } from "@faire/slate/components/icon-button"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| variant | "primary" \| "secondary" \| "tertiary" | "primary" | No | Button emphasis level |
| shape | "circle" \| "square" | "circle" | No | Button shape |
| size | "xxSmall" \| "xSmall" \| "small" \| "medium" | "medium" | No | xxSmall=24px, xSmall=32px, small=40px, medium=48px |
| loading | boolean | false | No | Shows a loading spinner |
| disabled | boolean | false | No | Whether button is disabled |
| Icon | React.FC<SVGIconProps> | -- | Yes | Icon component to render |
| aria-label | string | -- | No | Accessible label (required for icon-only buttons) |
| onClick | MouseEventHandler | -- | No | Click handler (web) |
| linkTo | LinkProps["to"] | -- | No | React Router link target (web) |
| href | string | -- | No | Native anchor href (web) |

## Variants

| Variant | CSS Class |
|---------|-----------|
| primary | `fs-button--primary` |
| secondary | `fs-button--secondary` |
| tertiary | `fs-button--tertiary` |

| Shape | Effect |
|-------|--------|
| circle | `rounded-(--slate-radius-component-round)` (999px) |
| square | default border radius |

| Size | CSS Class | Dimensions |
|------|-----------|------------|
| xxSmall | `fs-icon-button--xx-small` | 24px |
| xSmall | `fs-icon-button--x-small` | 32px |
| small | `fs-icon-button--small` | 40px |
| medium | `fs-icon-button--medium` | 48px |

## States

- **disabled** -- aria-disabled, uses disabled action tokens
- **loading** -- shows spinner, hides icon, becomes aria-disabled
- **hover/active** -- uses hover/active action surface tokens
