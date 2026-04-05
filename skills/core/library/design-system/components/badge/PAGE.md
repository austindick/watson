---
type: page
title: Badge Component
last_updated: "2026-03-31"
---

# Badge Component

Badges display a numeric value in a pill-shaped container.

**Import:** `import { Badge } from "@faire/slate/components/badge"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| value | number | -- | Yes | The numeric value to display |
| showExact | boolean | false | No | When false, values above 99 display as "99+" |
| variant | "default" \| "inverse" | "default" | No | Visual variant |

## Variants

- **default** -- standard badge styling
- **inverse** -- inverted color scheme (`fs-badge--inverse`)
