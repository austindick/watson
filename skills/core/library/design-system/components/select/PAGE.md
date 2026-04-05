---
type: page
title: Select Component
last_updated: "2026-03-31"
---

# Select Component

A Select helps users make a simple selection from a list of choices.

**Import:** `import { Select } from "@faire/slate/components/select"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| options | Array<{ value, label, disabled? }> | -- | Yes | Selectable options |
| disabled | boolean | -- | No | Whether the select is disabled |
| error | boolean \| string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Error state; string/LocalMsg displays in helper text |
| helper | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Helper text below select |
| label | string | -- | No | Select label |
| optional | boolean | false | No | Appends "(optional)" to label |
| placeholder | string | -- | No | Placeholder text |
| tooltipText | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Tooltip in the label |
| value | string | -- | No | Currently selected value |
| id | string | auto-generated | No | Select element id (web) |
| name | string | -- | No | Select name attribute (web) |
| onChange | ChangeEventHandler | -- | No | Change handler (web) |
| ref | Ref<HTMLSelectElement> | -- | No | Select ref (web) |

## States

- **default** -- standard select dropdown
- **disabled** -- grayed out, non-interactive
- **error** -- error styling with message in helper area
- **with placeholder** -- shows placeholder as first disabled option
