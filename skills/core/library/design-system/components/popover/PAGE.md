---
type: page
title: Popover Component
last_updated: "2026-03-31"
---

# Popover Component

Popovers provide users with additional information or walk them through a new experience.

**Import:** `import { Popover } from "@faire/slate/components/popover"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| description | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | Yes | Popover description text |
| title | string | -- | No | Popover title |
| children | React.ReactNode | -- | Yes | Trigger element |
| position | "top" \| "bottom" \| "left" \| "right" | "top" | No | Position relative to trigger |
| alignment | "start" \| "middle" \| "end" | "middle" | No | Alignment relative to trigger |
| footerVariant | "action" \| "custom" | "action" | No | Footer type |
| actionButtonProps | { label, onClick, ... } | -- | No | Action button props (footerVariant="action") |
| customSlot | React.ReactNode | -- | No | Custom footer content (footerVariant="custom") |
| asCallout | boolean | false | No | Callout mode (non-modal, no focus trap, not portaled) |
| open | boolean | -- | No | Controlled open state |
| onClose | (reason?) => void | -- | No | Close callback (web) |
| portaled | boolean | true | No | Use React portal (web) |
| zIndex | number | 5 | No | Z-index (web) |

## States

- **open** -- popover is visible with focus trapped (unless callout)
- **closed** -- popover hidden, trigger receives focus on close
- **callout** -- non-modal mode: no focus trap, not portaled, used for feature introduction

## Gotchas

- Only one popover can be open at a time
- Callouts are NOT guided tours -- they should be isolated, single-use introductions
- Callout mode changes accessibility: `aria-modal=false`, no focus trapping, not portaled
- Popover is dismissed by Close button or Escape key (not by clicking trigger again)
