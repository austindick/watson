---
type: page
title: Button Component
last_updated: "2026-03-31"
---

# Button Component

Buttons help users take action or make a choice across a hierarchy of emphasis.

**Import:** `import { Button } from "@faire/slate/components/button"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| variant | "primary" \| "secondary" \| "tertiary" \| "plain" | "primary" | No | Button emphasis level |
| size | "xSmall" \| "small" \| "medium" | "medium" | No | Button size: xSmall=32px, small=40px, medium=48px height. Does not affect plain variant |
| destructive | boolean | false | No | Destructive styling variant |
| loading | boolean | false | No | Shows a loading spinner |
| loadingLabel | string | -- | No | Label displayed while loading |
| disabled | boolean | false | No | Whether button is disabled |
| fullWidth | boolean | false | No | Full container width (primary/secondary only, web) |
| iconProps | { Component, position? } | -- | No | Icon to display. Position: "start" (default) or "end" |
| children | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | Yes | Button label text |
| onClick | MouseEventHandler | -- | No | Click handler |
| linkTo | LinkProps["to"] | -- | No | React Router link target (renders as anchor, web) |
| href | string | -- | No | Native anchor href (web) |
| target | string | -- | No | Anchor target attribute (web) |

## Variants

| Variant | CSS Class | Use When |
|---------|-----------|----------|
| primary | `fs-button--primary` | Primary CTA, highest emphasis. Uses `--slate-color-action-surface-default` |
| secondary | `fs-button--secondary` | Secondary action alongside primary |
| tertiary | `fs-button--tertiary` | Lower-emphasis action |
| plain | `fs-button--plain` | Inline text-style action; size prop has no effect |

| Size | CSS Class | Height |
|------|-----------|--------|
| xSmall | `fs-button--x-small` | 32px |
| small | `fs-button--small` | 40px |
| medium | `fs-button--medium` | 48px |

## States

- **disabled** -- `aria-disabled`, uses `--slate-color-action-surface-disabled` / `--slate-color-action-text-disabled`
- **loading** -- shows spinner, button becomes aria-disabled
- **destructive** -- `fs-button--destructive`, uses critical action tokens
- **hover** -- uses `--slate-color-action-surface-hover`
- **active** -- uses `--slate-color-action-surface-active`

## Gotchas

- Plain buttons ignore the `size` prop entirely
- `fullWidth` only affects primary and secondary variants
- Label text is clamped to 2 lines (`line-clamp-2`) except for plain variant which is inline
