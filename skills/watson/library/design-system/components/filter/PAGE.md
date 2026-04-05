---
type: page
title: Filter Component
last_updated: "2026-03-31"
---

# Filter Component

Filters help users view a subset of content.

**Import:** `import { FilterButton, FilterGroup, FilterToggle } from "@faire/slate/components/filter"`

## FilterButton Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| variant | "rest" \| "applied" | "rest" | No | Visual variant |
| Icon | React.FC<SVGIconProps> | -- | No | Icon to display |
| label | string | -- | Yes | Filter label text |
| disabled | boolean | false | No | Whether filter is disabled |
| onClick | MouseEventHandler | -- | No | Click handler (web) |

## FilterToggle Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| applied | boolean | false | No | Whether the filter is currently applied |
| appliedBackgroundColor | string | -- | No | Custom background when applied |
| defaultContentColor | string | -- | No | Custom text/icon color in rest state |
| Icon | React.FC<SVGIconProps> | -- | No | Icon to display |
| label | string | -- | Yes | Filter label text |
| disabled | boolean | false | No | Whether filter is disabled |
| onClick | MouseEventHandler | -- | No | Click handler (web) |

## FilterGroup Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| items | FilterToggleProps[] | -- | Yes | Array of FilterToggle props (web) |
| filterButtonProps | FilterButtonProps | -- | No | Optional leading FilterButton |
| overflow | "scroll" \| "wrap" | "scroll" | No | Overflow behavior |

## Variants

- **FilterButton** -- a non-toggle action button (opens filter panel, etc.). Variant: "rest" or "applied"
- **FilterToggle** -- a toggle switch for filters. Uses `role="switch"` with `aria-checked`. When applied: `fs-filter--applied`

## Gotchas

- FilterButton does NOT change state on click (it triggers an action). FilterToggle DOES change state -- this distinction is important for accessibility.
- FilterGroup renders FilterButton first (if provided), then FilterToggles.
