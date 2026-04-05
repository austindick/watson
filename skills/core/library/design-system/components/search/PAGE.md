---
type: page
title: Search Component
last_updated: "2026-03-31"
---

# Search Component

Search Inputs allow users to quickly find what they are looking for.

**Import:** `import { Search } from "@faire/slate/components/search"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| disabled | boolean | -- | No | Whether the input is disabled |
| onClear | () => void | -- | No | Clear callback; shows clear button when defined and input has value |
| placeholder | string | -- | No | Placeholder text |
| value | string | -- | No | Input value |
| onChange | ChangeEventHandler | -- | No | Change handler (web) |
| ref | Ref<HTMLInputElement> | -- | No | Input ref (web) |

## States

- **empty** -- shows search icon prefix only
- **has value** -- shows search icon and clear button (if onClear provided)
- **disabled** -- grayed out, clear button hidden

## Gotchas

- Renders as `type="search"` input
- Clear button only appears when `onClear` is defined AND input has a value AND not disabled
- Clicking the input container focuses the input
