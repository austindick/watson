---
type: page
title: Radio Component
last_updated: "2026-03-31"
---

# Radio Component

Radios enable users to select one option from a list.

**Import:** `import { Radio, RadioGroup } from "@faire/slate/components/radio"`

## Radio Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| checked | boolean | false | No | Whether the radio is checked |
| disabled | boolean | false | No | Whether the radio is disabled |
| label | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Radio label text |
| id | string | auto-generated | No | Input element id (web) |
| name | string | -- | No | Input name attribute (web) |
| value | string | -- | No | Input value attribute (web) |
| onChange | ChangeEventHandler | -- | No | Change handler (web) |

## RadioGroup Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| options | Array<{ value, label, disabled? }> | -- | Yes | Radio options |
| checked | string | -- | No | Currently selected value |
| disabled | boolean | -- | No | Disables all radios |
| error | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Error message |
| label | string | -- | No | Group header label |
| name | string | auto-generated | No | Group name for radio inputs (web) |
| autoFocus | boolean | -- | No | Auto-focus first radio (web) |
| id | string | -- | No | Group id (web) |
| onChecked | (option) => void | -- | No | Selection callback (web) |

## States

- **checked** -- selected radio indicator
- **disabled** -- grayed out, non-interactive
- **error** -- group-level error message below the fieldset
