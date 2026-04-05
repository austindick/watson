---
type: page
title: Tooltip Component
last_updated: "2026-03-31"
---

# Tooltip Component

Tooltips display informative text when users hover or focus on an element.

**Import:** `import { Tooltip } from "@faire/slate/components/tooltip"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| label | string | -- | Yes | Tooltip text content |
| children | React.ReactNode | -- | Yes | Trigger element |
| role | "label" \| "description" \| "additional-info" | -- | Yes | Tooltip accessibility role |
| position | "top" \| "bottom" \| "left" \| "right" | "top" | No | Position relative to trigger |
| alignment | "start" \| "middle" \| "end" | "middle" | No | Alignment relative to trigger |
| triggerAriaLabel | string | -- | No | Aria-label for trigger (additional-info role, web) |
| portaled | boolean | true | No | Use React portal (web) |
| zIndex | number | 5 | No | Z-index (web) |
| ref | Ref | -- | No | Tooltip content ref (web) |

## Variants

### Role Variants

| Role | Behavior |
|------|----------|
| label | Acts as `aria-label` for trigger. Shown on hover/focus |
| description | Acts as `aria-description` for trigger. Shown on hover/focus |
| additional-info | Unrelated to trigger (e.g., info icon). Adds artificial interaction to trigger |

## Gotchas

- Tooltips can ONLY contain non-interactive text content (unlike Popovers)
- Tooltips open/close on focus or hover automatically (unlike Popovers which need click)
- `role` is a required prop -- you must specify the accessibility intent
- `additional-info` role adds keyboard interaction to the trigger element
