---
type: page
title: Accordion Component
last_updated: "2026-03-31"
---

# Accordion Component

Accordions help users understand detailed information via an expandable structure.

**Import:** `import { AccordionGroup } from "@faire/slate/components/accordion"`
**Import:** `import { AccordionItem } from "@faire/slate/components/accordion"`

## AccordionGroup Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| items | Array<AccordionItemProps> | -- | Yes | Props for each accordion item (without expanded/onToggle) |
| footer | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Footer text displayed at the bottom |
| initiallyExpandedIndex | number | -- | No | Index of initially expanded item (web) |
| onToggle | (index: number, e: ToggleEvent) => void | -- | No | Callback when an item is toggled (web) |

## AccordionItem Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| expanded | boolean | -- | No | Controls the open state |
| label | string \| StrictLocalMsg | -- | Yes | The accordion item label |
| labelVariant | "subheading" \| "paragraph" | "subheading" | No | Typography variant for the label |
| content | string \| React.ReactNode | -- | Yes | Content shown when expanded; string renders as paragraph |
| onToggle | ToggleEventHandler | -- | No | Toggle event handler (web) |

## Slots / Composition

AccordionGroup renders a list of AccordionItem components. Pass item props via the `items` array -- the group manages expanded state internally. AccordionItem renders content as a `<p>` when string, or as-is when ReactNode.
