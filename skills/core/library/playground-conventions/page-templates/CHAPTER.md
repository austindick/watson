---
id: page-templates
title: "Page Templates"
book_type: foundational
book: playground-conventions
last_updated: "2026-04-14"
summary: "Portal outer shell values (Retailer, Brand): background, padding, max-width, nav, inter-section spacing"
---

# Page Templates

Portal outer shell values for the Prototype Playground. These values define the consistent page-level container for each portal type — background color, outer padding, content max-width, nav placement, and inter-section spacing.

**Key principle:** Outer shell values are consistent per portal type across all prototypes. Inner layout (spacing between elements within a section) varies per prototype and is derived from Figma or source. This chapter provides only the outer shell baseline.

## Usage

Builder reads this chapter via `libraryPaths` when `sectionType` is `"page-container"`. The `portalType` input selects the correct template row. These values are applied to the outermost wrapper div of the prototype page scaffold.

- Figma-derived values override portal template values for inner layout (Figma wins for section content)
- Portal template values are NOT overridden for the outer shell — they are authoritative for background, outer padding, max-width, nav placement, and inter-section gap
- On rebuild: `portal_type` stored in STATUS.md is read; the portal prompt is not shown again

---

## Retailer Portal

The Retailer portal hosts tools for brands selling on Faire. Pages use a light background with a persistent left sidebar nav and a content area to the right.

**Source pattern:** `src/pages/retailer/` page files; sidebar nav component at `src/components/shared/retailer/`

### Token Reference

| Property | Token | Value | Notes |
|---|---|---|---|
| Page background | `var(--color-background-primary)` | `#FFFFFF` | White — matches Retailer portal shell |
| Outer padding — top | `var(--spacing-layout-xl)` | `24px` | Top of content area below nav bar |
| Outer padding — bottom | `var(--spacing-layout-xl)` | `24px` | Bottom of page scroll area |
| Outer padding — left | `var(--spacing-layout-2xl)` | `32px` | Left edge of content area (right of sidebar) |
| Outer padding — right | `var(--spacing-layout-2xl)` | `32px` | Right edge of viewport |
| Content max-width | `1280px` | — | No token — use raw value with `/* portal-template */` comment |
| Inter-section spacing | `var(--spacing-section-lg)` | `48px` | Vertical gap between top-level sections |
| Nav placement | Left sidebar | — | Sidebar is outside the content area; content wrapper starts at sidebar right edge |

### Annotated CSS

```css
/* Retailer portal — page-level container */
.retailer-page-container {
  background-color: var(--color-background-primary); /* portal-template */
  padding-top: var(--spacing-layout-xl);             /* portal-template: 24px */
  padding-bottom: var(--spacing-layout-xl);          /* portal-template: 24px */
  padding-left: var(--spacing-layout-2xl);           /* portal-template: 32px */
  padding-right: var(--spacing-layout-2xl);          /* portal-template: 32px */
  max-width: 1280px;                                 /* portal-template: no token */
  display: flex;
  flex-direction: column;
  gap: var(--spacing-section-lg);                    /* portal-template: 48px inter-section */
}
```

---

## Brand Portal

The Brand portal hosts tools for brands managing their Faire presence. Pages use the `BrandPortalLayout` shared component which provides a consistent top nav and content area with a light neutral background.

**Source pattern:** `BrandPortalLayout` shared component at `src/components/shared/BrandPortalLayout/`; wrapped around content in all Brand portal page files.

### Token Reference

| Property | Token | Value | Notes |
|---|---|---|---|
| Page background | `var(--color-background-secondary)` | `#F9F7F4` | Warm off-white — Brand portal shell color |
| Outer padding — top | `var(--spacing-layout-lg)` | `16px` | Below top nav bar |
| Outer padding — bottom | `var(--spacing-layout-xl)` | `24px` | Bottom of page scroll area |
| Outer padding — left | `var(--spacing-layout-3xl)` | `40px` | Left edge of content area |
| Outer padding — right | `var(--spacing-layout-3xl)` | `40px` | Right edge of content area |
| Content max-width | `1200px` | — | No token — use raw value with `/* portal-template */` comment |
| Inter-section spacing | `var(--spacing-section-md)` | `32px` | Vertical gap between top-level sections |
| Nav placement | Top bar | — | `BrandPortalLayout` renders a persistent top nav; content wrapper sits below it |

### Annotated CSS

```css
/* Brand portal — page-level container (mirrors BrandPortalLayout content area) */
.brand-page-container {
  background-color: var(--color-background-secondary); /* portal-template: #F9F7F4 */
  padding-top: var(--spacing-layout-lg);               /* portal-template: 16px */
  padding-bottom: var(--spacing-layout-xl);            /* portal-template: 24px */
  padding-left: var(--spacing-layout-3xl);             /* portal-template: 40px */
  padding-right: var(--spacing-layout-3xl);            /* portal-template: 40px */
  max-width: 1200px;                                   /* portal-template: no token */
  display: flex;
  flex-direction: column;
  gap: var(--spacing-section-md);                      /* portal-template: 32px inter-section */
}
```

---

## portal_type Values

The `portal_type` field in STATUS.md maps to these templates:

| STATUS.md value | Template applied | Notes |
|---|---|---|
| `"Retailer"` | Retailer Portal | Default when portalType is not specified |
| `"Brand"` | Brand Portal | Uses BrandPortalLayout token values |

---

## Notes for Builder

- Read this chapter before generating the page-container scaffold — extract the correct template block by matching `portalType` input to the portal header above
- The `/* portal-template */` annotation on each token comment signals to reviewer that this value comes from the portal template (not from Figma or source code). Reviewer does NOT flag portal-template values as token violations
- `max-width` raw values are intentional — no Slate spacing token maps to a page max-width constraint. Use raw value with `/* portal-template: no token */` comment
- Do NOT derive outer shell values from Figma per-build. The template is authoritative. Figma-derived values apply only to inner section layout (within each section stub)
