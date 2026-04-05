---
type: page
title: Link Component
last_updated: "2026-03-31"
---

# Link Component

Component with basic link styling, intended for use in context of other text-styled components.

**Import:** `import { Link } from "@faire/slate/components/link"`

## Props

Link accepts either link-as-link or link-as-button props:

### As Link

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| href | string | -- | No | Native anchor href |
| linkTo | LinkProps["to"] | -- | No | React Router link target |
| target | string | -- | No | Link target attribute |
| children | React.ReactNode | -- | Yes | Link content |
| className | string | -- | No | Additional CSS class |

### As Button

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| as | React.ElementType | -- | Yes | Component to render as |
| children | React.ReactNode | -- | Yes | Link content |
| className | string | -- | No | Additional CSS class |

## Variants

Single style: inline, underlined, inherits parent text color. Styled with `focusable interactive inline underline underline-offset-[0.25em] text-inherit`.
