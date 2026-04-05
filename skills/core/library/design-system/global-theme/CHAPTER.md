---
type: chapter
title: Global Theme
last_updated: "2026-03-31"
---

# Global Theme

CSS custom properties and design tokens from `@repo/packages/core/slate/src/foundation/`. Import the theme via `@faire/slate/foundation/theme.css`.

## Color Primitives

Defined in `foundation/color/__internal__/primitives.css`.

### Grey

| Token | Value | Name |
|-------|-------|------|
| `--slate-color-grey-100` | #ffffff | White |
| `--slate-color-grey-200` | #fbfbfb | Cotton |
| `--slate-color-grey-300` | #f7f7f7 | Paper |
| `--slate-color-grey-400` | #dfe0e1 | Canvas |
| `--slate-color-grey-500` | #b7b7b7 | |
| `--slate-color-grey-600` | #8e8c8c | |
| `--slate-color-grey-700` | #757575 | Graphite |
| `--slate-color-grey-800` | #474747 | |
| `--slate-color-grey-900` | #333333 | FaireBlack |
| `--slate-color-grey-1000` | #000000 | Black |

### Neutral

| Token | Value | Name |
|-------|-------|------|
| `--slate-color-neutral-100` | #fbf8f6 | Ivory |
| `--slate-color-neutral-600` | #b5a998 | Flax |
| `--slate-color-neutral-1000` | #585550 | Espresso |

### Red

| Token | Value | Name |
|-------|-------|------|
| `--slate-color-red-100` | #f2e5e1 | Blossom |
| `--slate-color-red-200` | #e9e0dc | Almond |
| `--slate-color-red-400` | #ba9b88 | Sugar |
| `--slate-color-red-500` | #d17e70 | Rose |
| `--slate-color-red-700` | #921100 | Siren |
| `--slate-color-red-800` | #5a1e09 | Brick |
| `--slate-color-red-1000` | #390d18 | Eggplant |

### Blue

| Token | Value | Name |
|-------|-------|------|
| `--slate-color-blue-100` | #f2f5f5 | Salt |
| `--slate-color-blue-200` | #e2e7f0 | Thistle |
| `--slate-color-blue-400` | #7a7885 | Taro |
| `--slate-color-blue-500` | #667495 | Jay |
| `--slate-color-blue-700` | #275ec5 | Blueberry |
| `--slate-color-blue-1000` | #1b2834 | Midnight |

### Teal

| Token | Value |
|-------|-------|
| `--slate-color-teal-600` | #36676a (Harbor) |
| `--slate-color-teal-900` | #154548 (Pacific) |

### Orange

| Token | Value | Name |
|-------|-------|------|
| `--slate-color-orange-100` | #f6eee4 | Ecru |
| `--slate-color-orange-400` | #ab7456 | Terra |
| `--slate-color-orange-700` | #e65126 | |
| `--slate-color-orange-1000` | #7d3e1e | Rust |

### Yellow

| Token | Value | Name |
|-------|-------|------|
| `--slate-color-yellow-100` | #f6efdb | Meringue |
| `--slate-color-yellow-200` | #ece3d2 | Sand |
| `--slate-color-yellow-400` | #d1b985 | Cashew |
| `--slate-color-yellow-600` | #a79764 | Bamboo |
| `--slate-color-yellow-800` | #907c3a | Dijon |
| `--slate-color-yellow-1000` | #595540 | Marsh |

### Green

| Token | Value | Name |
|-------|-------|------|
| `--slate-color-green-100` | #e9f1e5 | Soy |
| `--slate-color-green-200` | #dde3d0 | Ivy |
| `--slate-color-green-300` | #d9d8cd | Birch |
| `--slate-color-green-500` | #91957b | Field |
| `--slate-color-green-600` | #91a793 | Juniper |
| `--slate-color-green-700` | #49694c | Fern |
| `--slate-color-green-1000` | #3e4023 | Thyme |

### Transparent Grey

| Token | Value |
|-------|-------|
| `--slate-color-transparent-grey-0` | rgba(51, 51, 51, 0) |
| `--slate-color-transparent-grey-100` | rgba(51, 51, 51, 0.05) |
| `--slate-color-transparent-grey-200` | rgba(51, 51, 51, 0.1) |
| `--slate-color-transparent-grey-500` | rgba(51, 51, 51, 0.5) |

## Semantic Color Tokens

Defined in `foundation/color/semantic.css`. Map primitives to semantic roles.

### Surface

| Token | Resolves To |
|-------|-------------|
| `--slate-color-surface-primary` | grey-100 (#ffffff) |
| `--slate-color-surface-primary-inverse` | grey-900 (#333333) |
| `--slate-color-surface-secondary` | grey-200 (#fbfbfb) |
| `--slate-color-surface-tertiary` | grey-300 (#f7f7f7) |
| `--slate-color-surface-overlay` | transparent-grey-100 (5% black) |
| `--slate-color-surface-mask` | transparent-grey-500 (50% black) |
| `--slate-color-surface-transparent` | transparent-grey-0 (0%) |

### Text

| Token | Resolves To |
|-------|-------------|
| `--slate-color-text-primary` | grey-900 (#333333) |
| `--slate-color-text-subdued` | grey-700 (#757575) |
| `--slate-color-text-primary-inverse` | grey-100 (#ffffff) |

### Border

| Token | Resolves To |
|-------|-------------|
| `--slate-color-border-subdued` | grey-700 (#757575) |
| `--slate-color-border-muted` | grey-400 (#dfe0e1) |

### Icon

| Token | Resolves To |
|-------|-------------|
| `--slate-color-icon-primary` | grey-900 (#333333) |
| `--slate-color-icon-subdued` | grey-700 (#757575) |
| `--slate-color-icon-primary-inverse` | grey-100 (#ffffff) |

### Action Surface

| Token | Resolves To |
|-------|-------------|
| `--slate-color-action-surface-default` | grey-900 |
| `--slate-color-action-surface-inverse` | grey-100 |
| `--slate-color-action-surface-hover` | grey-1000 |
| `--slate-color-action-surface-inverse-hover` | grey-300 |
| `--slate-color-action-surface-active` | grey-1000 |
| `--slate-color-action-surface-inverse-active` | grey-300 |
| `--slate-color-action-surface-disabled` | grey-300 |
| `--slate-color-action-surface-favorited` | red-700 |
| `--slate-color-action-surface-critical` | red-100 |
| `--slate-color-action-surface-critical-hover` | red-700 |
| `--slate-color-action-surface-critical-active` | red-700 |

### Action Border

| Token | Resolves To |
|-------|-------------|
| `--slate-color-action-border-default` | grey-900 |
| `--slate-color-action-border-subdued` | grey-400 |
| `--slate-color-action-border-inverse` | grey-100 |
| `--slate-color-action-border-hover` | grey-1000 |
| `--slate-color-action-border-active` | grey-1000 |
| `--slate-color-action-border-disabled` | grey-400 |
| `--slate-color-action-border-focus_ring` | blue-700 |
| `--slate-color-action-border-critical` | red-500 |

### Action Text

| Token | Resolves To |
|-------|-------------|
| `--slate-color-action-text-default` | grey-900 |
| `--slate-color-action-text-inverse` | grey-100 |
| `--slate-color-action-text-hover` | grey-1000 |
| `--slate-color-action-text-active` | grey-1000 |
| `--slate-color-action-text-disabled` | grey-700 |
| `--slate-color-action-text-critical` | red-700 |
| `--slate-color-action-text-critical-inverse` | grey-100 |
| `--slate-color-action-text-placeholder` | grey-700 |

### Action Icon

| Token | Resolves To |
|-------|-------------|
| `--slate-color-action-icon-default` | grey-900 |
| `--slate-color-action-icon-inverse` | grey-100 |
| `--slate-color-action-icon-hover` | grey-1000 |
| `--slate-color-action-icon-active` | grey-1000 |
| `--slate-color-action-icon-disabled` | grey-700 |
| `--slate-color-action-icon-critical` | red-700 |

### Message

| Token | Resolves To |
|-------|-------------|
| `--slate-color-message-text-critical` | red-700 |
| `--slate-color-message-text-sale` | orange-1000 |
| `--slate-color-message-icon-success` | green-700 |
| `--slate-color-message-icon-warning` | yellow-800 |
| `--slate-color-message-icon-critical` | red-700 |
| `--slate-color-message-icon-info` | blue-1000 |
| `--slate-color-message-border-success` | green-600 |
| `--slate-color-message-border-warning` | yellow-400 |
| `--slate-color-message-border-critical` | red-500 |
| `--slate-color-message-border-info` | blue-400 |
| `--slate-color-message-surface-success` | green-100 |
| `--slate-color-message-surface-warning` | yellow-100 |
| `--slate-color-message-surface-critical` | red-100 |
| `--slate-color-message-surface-info` | blue-200 |

### Expressive

Surface, icon, and text tokens for each color: neutral, yellow, green, blue, red, orange (plus inverse variants). Additional surface-only tokens: olive (#595604), eggplant (#41252a), earth (#453200).

### Program

Brand-specific tokens for: Insider, Top Shop, Faire Source, Faire Pay, AI Suggestions, Market, Faire Direct. Each provides surface, text, and icon tokens.

## Dimensions Scale

Defined in `foundation/dimensions/primitives.css`. Base 4px grid.

| Token | px | rem |
|-------|----|-----|
| `--slate-dimensions-1` | 4px | 0.25rem |
| `--slate-dimensions-2` | 8px | 0.5rem |
| `--slate-dimensions-3` | 12px | 0.75rem |
| `--slate-dimensions-4` | 16px | 1rem |
| `--slate-dimensions-5` | 20px | 1.25rem |
| `--slate-dimensions-6` | 24px | 1.5rem |
| `--slate-dimensions-7` | 28px | 1.75rem |
| `--slate-dimensions-8` | 32px | 2rem |
| `--slate-dimensions-9` | 36px | 2.25rem |
| `--slate-dimensions-10` | 40px | 2.5rem |
| `--slate-dimensions-11` | 44px | 2.75rem |
| `--slate-dimensions-12` | 48px | 3rem |
| `--slate-dimensions-13` | 52px | 3.25rem |
| `--slate-dimensions-14` | 56px | 3.5rem |
| `--slate-dimensions-15` | 60px | 3.75rem |
| `--slate-dimensions-16` | 64px | 4rem |
| `--slate-dimensions-17` | 68px | 4.25rem |
| `--slate-dimensions-18` | 72px | 4.5rem |

**TS import:** `import { Dimensions } from "@faire/slate/foundation/dimensions/primitives"` -- keys are numeric (e.g., `Dimensions[4]` = "16px").

## Spacing Tokens

Defined in `foundation/spacing/semantic.css`. Maps to dimensions scale.

| Token | Resolves To |
|-------|-------------|
| `--slate-spacing-element-default` | dimensions-2 (8px) |
| `--slate-spacing-element-large` | dimensions-4 (16px) |
| `--slate-spacing-group-default` | dimensions-4 (16px) |
| `--slate-spacing-section-default` | dimensions-8 (32px) |

**TS import:** `import { Spacing } from "@faire/slate/foundation/spacing/semantic"` -- e.g., `Spacing.element.default`.

## Radius Tokens

Defined in `foundation/radius/semantic.css`.

| Token | Value |
|-------|-------|
| `--slate-radius-container-default` | dimensions-1 (4px) |
| `--slate-radius-component-default` | dimensions-1 (4px) |
| `--slate-radius-component-round` | 999px |
| `--slate-radius-component-checkbox` | 2px |
| `--slate-radius-component-tag` | 2px |

Tailwind aliases: `--radius-fs-component-round`, `--radius-fs-component-default`, `--radius-fs-container-default`, `--radius-fs-component-checkbox`, `--radius-fs-component-tag`.

## Typography

### Font Families

| Token | Value |
|-------|-------|
| `--slate-typography-family-serif` | "Nantes_fix" |
| `--slate-typography-family-sans` | "Graphik_fix" |

Tailwind: `--font-family-sans` (Graphik + sans-serif), `--font-family-serif` (Nantes + serif).

### Font Weights

| Token | Value |
|-------|-------|
| `--slate-typography-weight-regular` | 400 |
| `--slate-typography-weight-medium` | 500 |
| `--slate-typography-weight-semibold` | 600 |

Tailwind: `--font-weight-normal` (400), `--font-weight-medium` (500), `--font-weight-semibold` (600).

### Font Size Scale

| Token | Value |
|-------|-------|
| `--slate-typography-font-size-100` | 0.75rem (12px) |
| `--slate-typography-font-size-200` | 0.875rem (14px) |
| `--slate-typography-font-size-300` | 1.125rem (18px) |
| `--slate-typography-font-size-400` | 1.375rem (22px) |
| `--slate-typography-font-size-500` | 1.875rem (30px) |
| `--slate-typography-font-size-600` | 2.375rem (38px) |
| `--slate-typography-font-size-700` | 3.25rem (52px) |
| `--slate-typography-font-size-800` | 4.5rem (72px) |

### Line Height Scale

| Token | Value |
|-------|-------|
| `--slate-typography-line-height-100` | 1rem (16px) |
| `--slate-typography-line-height-200` | 1.25rem (20px) |
| `--slate-typography-line-height-300` | 1.625rem (26px) |
| `--slate-typography-line-height-400` | 2rem (32px) |
| `--slate-typography-line-height-500` | 2.375rem (38px) |
| `--slate-typography-line-height-600` | 3.125rem (50px) |
| `--slate-typography-line-height-700` | 4rem (64px) |
| `--slate-typography-line-height-800` | 5.375rem (86px) |

### Letter Spacing

| Token | Value |
|-------|-------|
| `--slate-typography-letter-spacing-100` | 0rem (0px) |
| `--slate-typography-letter-spacing-200` | 0.009375rem (0.15px) |

### Typography Presets (Tailwind Utility Classes)

Applied via `@utility` classes in CSS.

| Preset | Class | Family | Weight | Size | Line Height | Letter Spacing |
|--------|-------|--------|--------|------|-------------|----------------|
| Display XL | `type-fs-display-xl` | Serif | 400 | 72px | 86px | 0 |
| Display L | `type-fs-display-l` | Serif | 400 | 52px | 64px | 0 |
| Display M | `type-fs-display-m` | Serif | 400 | 38px | 50px | 0 |
| Display S | `type-fs-display-s` | Serif | 400 | 30px | 38px | 0 |
| Page Heading | `type-fs-page-heading` | Serif | 400 | 22px | 32px | 0 |
| Display S Sans Semibold | `type-fs-display-s-sans-semibold` | Sans | 600 | 30px | 38px | 0.15px |
| Display S Sans | `type-fs-display-s-sans` | Sans | 400 | 30px | 38px | 0.15px |
| Section Heading | `type-fs-section-heading` | Sans | 500 | 22px | 32px | 0.15px |
| Subheading Medium | `type-fs-subheading-medium` | Sans | 500 | 18px | 26px | 0.15px |
| Subheading | `type-fs-subheading` | Sans | 400 | 18px | 26px | 0.15px |
| Paragraph Medium | `type-fs-paragraph-medium` | Sans | 500 | 14px | 20px | 0.15px |
| Paragraph | `type-fs-paragraph` | Sans | 400 | 14px | 20px | 0.15px |
| Label Medium | `type-fs-label-medium` | Sans | 500 | 12px | 16px | 0.15px |
| Label | `type-fs-label` | Sans | 400 | 12px | 16px | 0.15px |

**Medium weight variants:** Add `font-medium` class alongside `type-fs-subheading`, `type-fs-paragraph`, or `type-fs-label`.

**Utility classes:**
- `type-aligned-nums` -- lining-nums tabular-nums for number alignment
- `type-aligned-elem` -- vertically align element to text baseline
- `elem-aligned-type` -- vertically align text to element center

## Tailwind Compatibility

All semantic color tokens are re-declared with `--color-fs-*` prefix for Tailwind consumption (e.g., `--color-fs-surface-primary` maps to `--slate-color-surface-primary`). Radius tokens use `--radius-fs-*` prefix.
