---
type: page
title: ListItem Component
last_updated: "2026-03-31"
---

# ListItem Component

A List Item displays a vertical index of text, icons, controls or images.

**Import:** `import { ListItem } from "@faire/slate/components/list-item"`

Sub-components: `ListItemStart`, `ListItemMiddle`, `ListItemEnd` (from same import path).

**Import:** `import { ListItemGroup } from "@faire/slate/components/list-item"`

## ListItem Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| interactionProps | NavigationProps \| ToggleProps | -- | No | Makes the list item interactive |
| id | string | -- | No | Element id; important for toggle variant (web) |
| children | React.ReactNode | -- | No | Must be ListItemStart, ListItemMiddle, ListItemEnd (web) |

### NavigationProps

| Prop | Type | Description |
|------|------|-------------|
| variant | "navigation" | Interaction variant |
| to | string | React Router link (web) |
| href | string | Native anchor href (web) |
| target | string | Link target (web) |
| onClick | () => void | Click handler (web) |

### ToggleProps

| Prop | Type | Description |
|------|------|-------------|
| variant | "toggle" | Interaction variant |
| checked | boolean | Toggle state |
| onChange | ChangeEventHandler | Change handler |

## Slots / Composition

ListItem accepts exactly three slot components as children:
- **ListItemStart** -- left slot (avatar, icon, image)
- **ListItemMiddle** -- center slot (text content)
- **ListItemEnd** -- right slot (badge, action)

Navigation variant renders a chevron icon at the end. Toggle variant renders a Toggle component.

## Gotchas

- Only ListItemStart, ListItemMiddle, and ListItemEnd are accepted as children
- Toggle interaction requires an `id` prop for accessibility
