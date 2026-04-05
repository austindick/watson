---
type: page
title: Checkbox Component
last_updated: "2026-03-31"
---

# Checkbox Component

Checkboxes enable users to select one or more items from a list.

**Import:** `import { Checkbox, CheckboxGroup } from "@faire/slate/components/checkbox"`

## Checkbox Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| checked | boolean \| "indeterminate" | false | No | Checked state; "indeterminate" for partially checked |
| disabled | boolean | false | No | Whether checkbox is disabled |
| label | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Checkbox label text |
| id | string | auto-generated | No | Input element id (web) |
| onChange | ChangeEventHandler | -- | No | Change handler (web) |
| name | string | -- | No | Input name attribute (web) |
| value | string | -- | No | Input value attribute (web) |

## CheckboxGroup Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| children | Checkbox elements | -- | Yes | Only accepts Checkbox components |
| disabled | boolean | -- | No | Disables all checkboxes in the group |
| error | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Error message for the group |
| label | string | -- | No | Group header label |

## States

- **checked** -- standard checked state with checkmark
- **indeterminate** -- partially checked state (visual dash)
- **disabled** -- grayed out, non-interactive
- **error** -- group-level error message displayed below

## Slots / Composition

CheckboxGroup only accepts Checkbox components as children. It wraps them in a fieldset with optional label and error message. Individual checkboxes get unique IDs auto-generated from the group.
