---
type: page
title: SelectionCard Component
last_updated: "2026-03-31"
---

# SelectionCard Component

Selection Cards enable users to select an option similar to a radio button with additional styling.

**Import:** `import { SelectionCard, SelectionCardGroup } from "@faire/slate/components/selection-card"`

## SelectionCard Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| label | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | Yes | Card label text |
| checked | boolean | false | No | Whether the card is selected |
| description | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Description text |
| Icon | React.FC<SVGIconProps> | -- | No | Icon (rendered at 24px) |
| bottomSlot | React.ReactNode | -- | No | Content below the main row |
| endSlot | React.ReactNode | -- | No | Content at the end of the main row |
| inlineSlot | React.ReactNode | -- | No | Content inline with the label |
| id | string | -- | No | Input element id (web) |
| name | string | -- | No | Radio input name (web) |
| onChange | ChangeEventHandler | -- | No | Change handler (web) |

## SelectionCardGroup Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| items | Array<SelectionCardProps> | -- | Yes | Card props array |
| name | string | auto-generated | No | Group name for radio behavior (web) |

## Slots / Composition

SelectionCard has named slots:
- **Icon** -- leading icon (24px, `Dimensions[6]`)
- **inlineSlot** -- inline with label (hidden from assistive tech when checked)
- **endSlot** -- trailing content (hidden from assistive tech when checked)
- **bottomSlot** -- below main content row (hidden from assistive tech when checked)

## States

- **unchecked** -- renders as `<label>`, entire card is clickable
- **checked** -- renders as `<div>`, allows nested interactive elements; card border style changes

## Gotchas

- When checked, container switches from `<label>` to `<div>` for WCAG compliance with nested interactives
- Input ref is auto-focused when transitioning from unchecked to checked
- SelectionCardGroup manages mutual exclusion (radio group behavior)
