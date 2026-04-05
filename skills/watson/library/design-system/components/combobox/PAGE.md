---
type: page
title: Combobox Component
last_updated: "2026-03-31"
---

# Combobox Component

A searchable dropdown component supporting single and multi-select.

**Import:** `import { Combobox } from "@faire/slate/components/combobox"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| disabled | boolean | -- | No | Whether combobox is disabled |
| multiselect | boolean | false | No | Enable multi-select mode |
| searchValue | string | -- | No | Current search input value |
| onSearchChange | (value: string) => void | -- | No | Search value change handler |
| value | string \| string[] | -- | No | Selected value(s). string when single, string[] when multiselect |
| onChange | (value) => void | -- | No | Selection change handler. Receives string or string[] based on multiselect |

## Slots / Composition

Combobox only accepts ComboboxDropdown as a child. The dropdown contains ComboboxListItem components.

- `ComboboxDropdown` -- the dropdown container
- `ComboboxListItem` -- individual selectable option

## Gotchas

- Value and onChange types change based on `multiselect` prop (discriminated union)
- Only ComboboxDropdown is accepted as children; other elements produce a console error
