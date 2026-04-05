---
type: page
title: Menu Component
last_updated: "2026-03-31"
---

# Menu Component

A menu is a list of links or actions that sits on top of another surface.

**Import:** `import { Menu, MenuItem, MenuTrigger } from "@faire/slate/components/menu"`

## Menu Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| alignment | MenuAlignment | "end" | No | Menu alignment relative to trigger |
| zIndex | number | 5 | No | Z-index of the menu (web) |
| children | React.ReactNode | -- | Yes | Must contain MenuTrigger and MenuItem components |

## MenuItem Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| Icon | React.FC<SVGIconProps> | -- | No | Icon for the menu item |
| label | string | -- | No | Label text |
| static | boolean | -- | No | Renders as non-interactive div (for titles) |
| variant | "link" \| "divider" \| "customSlot" | "link" | No | Item type |
| linkTo | LinkProps["to"] | -- | No | React Router link target (web) |
| onClick | MouseEventHandler | -- | No | Click handler (web) |
| download | string \| boolean | -- | No | Download attribute (web) |
| children | React.ReactNode | -- | No | Custom content (customSlot variant) |

## MenuTrigger

Wraps the element that opens the menu. Child must forward props to underlying HTML element.

## Slots / Composition

Menu only accepts MenuTrigger (exactly one) and MenuItem components. MenuTrigger wraps the trigger element (e.g., a Button or IconButton). MenuItem renders as button by default, or as link when `linkTo` is provided. Set `static` for non-interactive items like section headers.

## Variants

- **link** -- default, renders as button or anchor
- **divider** -- renders a visual separator line
- **customSlot** -- renders custom children within menu item wrapper

## Gotchas

- Only MenuTrigger and MenuItem are accepted as children
- MenuTrigger child must forward props and ref to its DOM element
- Divider variant ignores all other props (Icon, label, etc.)
