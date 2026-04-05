---
type: chapter
title: "Design Tokens"
last_updated: "2026-03-31"
---

# Design Tokens

Convention for using Slate design tokens in playground prototypes. For full token reference data (all values), see the design system book.

## Slate CSS Variables

Slate tokens are available as CSS custom properties with `--slate-` prefix. Use via Tailwind's arbitrary value syntax.

```tsx
className="bg-[var(--slate-color-surface-secondary)]"
className="text-[var(--slate-color-text-primary)]"
```

PREFER: Slate tokens over hardcoded hex values for colors in the Slate palette.
SHOULD: Fall back to hardcoded values only when a specific token does not exist for the use case.

## Color Usage

**Text:**
| Use | Token / Value | Tailwind |
|-----|--------------|---------|
| Primary text | `#333333` | `text-[#333333]` |
| Secondary text | `#757575` | `text-[#757575]` |

**Backgrounds:**
| Use | Token / Value | Tailwind |
|-----|--------------|---------|
| Page background | `#f5f5f5` | `bg-[#f5f5f5]` |
| Card/modal background | `#ffffff` | `bg-white` |
| Secondary surface | `var(--slate-color-surface-secondary, #F7F7F7)` | `bg-[var(--slate-color-surface-secondary,#F7F7F7)]` |

**Borders:**
| Use | Value | Tailwind |
|-----|-------|---------|
| Default border | `#dfe0e1` | `border-[#dfe0e1]` |

**Named token prefixes:**
- `--slate-color-grey-*` — grey scale
- `--slate-color-neutral-*` — neutral palette
- `--slate-color-red-*` — error/destructive
- `--slate-color-blue-*` — info/action
- `--slate-color-surface-*` — surface backgrounds

## Typography

MUST: Use Nantes serif for display/editorial text. Use Graphik for UI text.

| Role | Font | Size | Tailwind |
|------|------|------|---------|
| Display/headings | Nantes serif | varies | `font-[family-name:var(--slate-font-family-nantes)]` |
| UI/body | Graphik | — | `font-[family-name:var(--slate-font-family-graphik)]` |
| Body text | Graphik | 14px | `text-sm` |
| Body text (larger) | Graphik | 16px | `text-base` |

CSS variable names:
- `--slate-font-family-graphik` — Graphik (UI font)
- `--slate-font-family-nantes` — Nantes (display font)
- `--slate-font-size-*` — font size scale

## Spacing and Dimensions

Slate dimension tokens: `--slate-dimensions-1` (4px) through `--slate-dimensions-18` (72px). Each step is 4px.

PREFER: Tailwind spacing utilities (`p-4`, `gap-6`) over custom values for standard spacing.
SHOULD: Use tokens via CSS vars for spacing values that must be precisely aligned with Slate components.

**Layout guidelines (use these values):**
| Use | Value |
|-----|-------|
| Max content width | 1440px |
| Side padding | 48px |
| Between major sections | 48px |
| Between subsections | 32px |

## Component Styling Conventions

SHOULD: Follow these patterns for consistency across prototypes:

```tsx
// Cards
className="bg-white rounded-3xl shadow-sm"

// Buttons (custom — prefer Slate Button)
className="rounded-lg px-6 py-2.5"

// Input borders
className="border border-[#dfe0e1] rounded"

// Hover states
className="hover:shadow-xl transition-shadow duration-300"
```

## When to Use Tokens vs Raw Values

PREFER tokens when:
- Using Slate surface colors (backgrounds, borders)
- Using Slate typography (font families)
- Spacing needs to align with Slate components

SHOULD use raw values when:
- Exact color not available as a token
- Prototype-specific one-off values
- Rapid iteration where token lookup slows development

NEVER: Override Slate component internal styles by targeting their internal CSS classes.

## Slate Component Imports

The playground supports real Slate imports directly:

```tsx
import { Button } from "@faire/slate/components/button";
```

PREFER: Real Slate components over custom UI for all standard controls.
