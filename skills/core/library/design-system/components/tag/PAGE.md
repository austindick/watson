---
type: page
title: Tag Component
last_updated: "2026-03-31"
---

# Tag Component

A tag contains a descriptive word or phrase associated with another object.

**Import:** `import { Tag, TagGroup } from "@faire/slate/components/tag"`

## Tag Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| label | string | -- | Yes | Tag label text |
| variant | "neutral" \| "success" \| "warning" \| "critical" \| "info" | "neutral" | No | Visual variant |
| onDismiss | () => void | -- | No | Dismiss handler; renders dismiss button. Not allowed with success/warning/critical variants |

## TagGroup Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| items | Array<TagProps> (without variant) | -- | Yes | Tag props array (web) |
| variant | TagVariant | "neutral" | No | Variant applied to all tags |
| overflow | "scroll" \| "wrap" | "scroll" | No | Overflow behavior |

## Variants

| Variant | CSS Class | Description |
|---------|-----------|-------------|
| neutral | (default) | Standard neutral tag |
| success | `fs-tag--success` | Success/positive state |
| warning | `fs-tag--warning` | Warning state |
| critical | `fs-tag--critical` | Critical/error state |
| info | `fs-tag--info` | Informational state |

## Gotchas

- `onDismiss` is only allowed with the "neutral" variant; success/warning/critical tags cannot be dismissed
- TagGroup applies the same variant to all tags; individual tags in a group don't specify variant
- Scroll overflow: tags get `whitespace-nowrap`; wrap overflow: tags get `max-w-full`
