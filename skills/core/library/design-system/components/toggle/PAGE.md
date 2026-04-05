---
type: page
title: Toggle Component
last_updated: "2026-03-31"
---

# Toggle Component

Toggles enable users to switch a single option on or off.

**Import:** `import { Toggle } from "@faire/slate/components/toggle"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| checked | boolean | false | No | Whether the toggle is on |
| disabled | boolean | false | No | Whether the toggle is disabled |
| id | string | -- | No | Input element id (web) |
| onChange | ChangeEventHandler | -- | No | Change handler (web) |
| aria-label | string | -- | No | Accessible label (web) |

## States

- **unchecked** -- off position
- **checked** -- on position
- **disabled** -- grayed out, non-interactive
