# LAYOUT: Product Quick View
Reference: figma
<!-- Reference values: figma | prod-clone | discuss-only -->

## Product Grid

### Token Quick-Reference

| Token | Value | Usage |
|-------|-------|-------|
| --ds-spacing-sm | 8px | Gap between grid cards |
| --ds-spacing-md | 16px | Card internal padding |
| --ds-spacing-lg | 24px | Grid container horizontal padding |
| --ds-radius-md | 8px | Card border-radius |
| --ds-shadow-sm | 0 1px 3px rgba(0,0,0,0.12) | Card resting shadow |
| --ds-shadow-md | 0 4px 12px rgba(0,0,0,0.16) | Card hover shadow |

### Component Tree

```
ProductGridSection
└── GridContainer
    ├── GridHeader
    │   ├── ResultCount (Text)
    │   └── SortDropdown (Input/Select)
    └── CardGrid
        └── ProductCard (× N)
            ├── CardImageWrapper
            │   ├── ProductImage (img)
            │   └── QuickViewTrigger (Button, secondary, sm)
            ├── CardBody
            │   ├── ProductName (Text, body-md)
            │   ├── PriceLine
            │   │   ├── SalePrice (Text, heading-sm)
            │   │   └── OriginalPrice (Text, body-sm, strikethrough)
            │   └── BadgeRow
            │       └── Badge (variant: promo) (× 0-2)
            └── CardFooter
                └── AddToCartButton (Button, primary, full-width)
```

### Annotated CSS

```css
.product-grid-section {
  padding: 0 var(--ds-spacing-lg); /* Figma: 24px horizontal */
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--ds-spacing-sm); /* Figma: 8px */
}

.product-card {
  border-radius: var(--ds-radius-md); /* Figma: 8px */
  box-shadow: var(--ds-shadow-sm);
  overflow: hidden;
  transition: box-shadow 120ms ease;
}

.product-card:hover {
  box-shadow: var(--ds-shadow-md); /* Figma: hover elevation */
}

.card-image-wrapper {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.quick-view-trigger {
  position: absolute;
  bottom: var(--ds-spacing-sm); /* Figma: 8px from bottom */
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 120ms linear;
}

.product-card:hover .quick-view-trigger,
.product-card:focus-within .quick-view-trigger {
  opacity: 1;
}

.card-body {
  padding: var(--ds-spacing-md); /* Figma: 16px */
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm); /* Figma: 8px between rows */
}

.card-footer {
  padding: 0 var(--ds-spacing-md) var(--ds-spacing-md); /* Figma: 0 16px 16px */
}
```

---

## Quick View Panel

### Token Quick-Reference

| Token | Value | Usage |
|-------|-------|-------|
| --ds-spacing-sm | 8px | Image thumbnail gap, selector pill gap |
| --ds-spacing-md | 16px | Panel section internal padding |
| --ds-spacing-lg | 24px | Panel horizontal padding |
| --ds-spacing-xl | 32px | Vertical spacing between panel sections |
| --ds-radius-sm | 4px | Selector pill border-radius |
| --ds-radius-md | 8px | Panel container radius (top-left, bottom-left corners) |
| --ds-color-border-focus | #0057FF (runtime) | Selected card ring, focused selector outline |
| --ds-shadow-lg | 0 8px 32px rgba(0,0,0,0.24) | Panel drop shadow |

### Component Tree

```
QuickViewPanel (aside)
├── PanelBackdrop (div, role=presentation)
└── PanelContainer
    ├── PanelHeader
    │   ├── PanelTitle (Text, heading-sm, sr-only on mobile)
    │   └── CloseButton (Button, ghost, icon-only, aria-label="Close quick view")
    ├── PanelBody (scroll region)
    │   ├── ImageCarousel
    │   │   ├── MainImage (img)
    │   │   ├── CarouselPrevButton (Button, ghost, icon-only)
    │   │   ├── CarouselNextButton (Button, ghost, icon-only)
    │   │   └── DotIndicators
    │   │       └── DotButton (× N) (Button, unstyled)
    │   ├── ProductDetails
    │   │   ├── ProductName (Text, heading-md)
    │   │   ├── PriceLine
    │   │   │   ├── SalePrice (Text, heading-sm)
    │   │   │   └── OriginalPrice (Text, body-sm, strikethrough)
    │   │   ├── SizeSelector (custom — see Tier 3 states)
    │   │   │   └── SizePill (× N)
    │   │   └── ColorSelector
    │   │       └── ColorSwatch (× N)
    │   └── ViewFullDetailsLink (Text link)
    └── PanelFooter
        └── AddToCartButton (Button, primary, full-width)
```

### Annotated CSS

```css
.quick-view-panel {
  position: fixed;
  inset: 0;
  z-index: var(--ds-z-overlay); /* Ensure above grid */
  pointer-events: none; /* Panel closed: allow grid interaction */
}

.quick-view-panel[data-open="true"] {
  pointer-events: all;
}

.panel-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 200ms ease;
}

.quick-view-panel[data-open="true"] .panel-backdrop {
  opacity: 1;
}

.panel-container {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 480px; /* Figma: 480px fixed */
  background: var(--ds-color-surface);
  border-radius: var(--ds-radius-md) 0 0 var(--ds-radius-md); /* Figma: left corners only */
  box-shadow: var(--ds-shadow-lg);
  transform: translateX(100%);
  transition: transform 250ms ease-out;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.quick-view-panel[data-open="true"] .panel-container {
  transform: translateX(0);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ds-spacing-md) var(--ds-spacing-lg); /* Figma: 16px 24px */
  border-bottom: 1px solid var(--ds-color-border-subtle);
  flex-shrink: 0;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--ds-spacing-lg); /* Figma: 24px */
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xl); /* Figma: 32px between sections */
}

.panel-footer {
  padding: var(--ds-spacing-md) var(--ds-spacing-lg); /* Figma: 16px 24px */
  border-top: 1px solid var(--ds-color-border-subtle);
  flex-shrink: 0;
}

.size-selector {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-spacing-sm); /* Figma: 8px */
}

.size-pill {
  padding: var(--ds-spacing-sm) var(--ds-spacing-md); /* Figma: 8px 16px */
  border-radius: var(--ds-radius-sm); /* Figma: 4px */
  border: 1px solid var(--ds-color-border);
  cursor: pointer;
}

.size-pill[aria-selected="true"] {
  background: var(--ds-color-primary);
  color: var(--ds-color-on-primary);
  border-color: var(--ds-color-primary);
}
```
