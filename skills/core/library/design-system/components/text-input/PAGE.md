---
type: page
title: TextInput Component
last_updated: "2026-03-31"
---

# TextInput Component

Text Inputs allow users to enter and edit text.

**Import:** `import { TextInput } from "@faire/slate/components/text-input"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| disabled | boolean | -- | No | Whether the input is disabled |
| error | boolean \| string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Error state; string/LocalMsg displays in helper text |
| helper | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Helper text below input |
| label | string | -- | No | Input label |
| optional | boolean | false | No | Appends "(optional)" to label |
| placeholder | string | -- | No | Placeholder text |
| tooltipText | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Tooltip in the label |
| value | string | -- | No | Input value |
| type | string | "text" | No | Input type attribute (web) |
| id | string | auto-generated | No | Input element id (web) |
| name | string | -- | No | Input name attribute (web) |
| onChange | ChangeEventHandler | -- | No | Change handler (web) |

## States

- **default** -- standard text input
- **disabled** -- grayed out, non-interactive
- **error** -- error styling with message in helper area
