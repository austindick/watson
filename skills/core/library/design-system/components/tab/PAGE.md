---
type: page
title: Tab Component
last_updated: "2026-03-31"
---

# Tab Component

Tabs organize content across different views or data sets.

**Import:** `import { Tab, TabGroup } from "@faire/slate/components/tab"`

**Import:** `import { TabPanel } from "@faire/slate/components/tab"`

## Tab Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| label | string | -- | Yes | Tab label text |
| value | string | -- | Yes | Tab value identifier (web) |
| selected | boolean | false | No | Whether tab is selected |
| accessory | Tag \| Badge element | -- | No | Optional Tag or Badge accessory |
| as | React.ElementType | "button" | No | Underlying element type (web) |
| id | string | -- | No | Tab id for accessibility (web) |
| aria-controls | string | -- | No | Id of controlled TabPanel (web) |
| onSelect | (value) => void | -- | No | Selection callback (web) |
| onClick | MouseEventHandler | -- | No | Click handler (web) |

## TabGroup Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| children | Tab elements | -- | Yes | Only accepts Tab components |
| mode | "automatic" \| "manual" | "manual" | No | Navigation mode per WAI-ARIA tabs pattern (web) |
| selectedTabValue | string | -- | No | Currently selected tab value (web) |
| onSelect | (value) => void | -- | No | Selection callback (web) |
| ref | Ref<HTMLDivElement> | -- | No | Tab list ref (web) |

## Variants

Navigation modes:
- **manual** -- user switches tabs by pressing Enter/Space or clicking
- **automatic** -- user switches tabs by focusing (arrow keys) or clicking

## Slots / Composition

- TabGroup only accepts Tab components as children
- Tab accepts one optional accessory: either a Tag or a Badge (not both)
- TabPanel component is separate -- connect via `aria-controls` on Tab and `id` on TabPanel
- Tag accessories have `onDismiss` removed when rendered inside a Tab

## Gotchas

- TabGroup only accepts Tab as children; other elements produce a console error
- Only one accessory (Tag or Badge) is allowed per Tab
- Tab keyboard navigation follows WAI-ARIA tabs pattern
