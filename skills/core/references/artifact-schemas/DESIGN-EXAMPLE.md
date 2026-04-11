# DESIGN: Product Quick View
Reference: figma
<!-- Reference values: figma | prod-clone | discuss-only -->

## Product Grid

### Component Mapping

| Element | Component | Variant / Props |
|---------|-----------|----------------|
| Product card container | Card | variant: outlined, interactive: true |
| Product image | (native img, not a DS component) | aspect-ratio 4:3, object-fit: cover |
| "Quick View" trigger button | Button | variant: secondary, size: sm |
| Product name text | Text | style: body-md, weight: medium |
| Sale price | Text | style: heading-sm, color: --ds-color-text-primary |
| Original price (struck) | Text | style: body-sm, color: --ds-color-text-subtle, textDecoration: line-through |
| Promo label | Badge | variant: promo |
| "Add to Cart" footer button | Button | variant: primary, size: md, fullWidth: true |
| Sort dropdown | Input | type: select, size: sm |
| Result count text | Text | style: body-sm, color: --ds-color-text-subtle |

### Typography

| Element | Font | Size | Weight | Color Token |
|---------|------|------|--------|-------------|
| Product name | [DS body font] | 14px /* Figma: 14px */ | 500 (medium) | --ds-color-text-primary |
| Sale price | [DS heading font] | 18px /* Figma: 18px */ | 700 (bold) | --ds-color-text-primary |
| Original price | [DS body font] | 14px /* Figma: 14px */ | 400 (regular) | --ds-color-text-subtle |
| Badge label | [DS label font] | 11px /* Figma: 11px */ | 600 (semibold) | --ds-color-on-promo |
| Result count | [DS body font] | 13px /* Figma: 13px */ | 400 (regular) | --ds-color-text-subtle |

### Color Tokens

| Usage | Token | Fallback |
|-------|-------|---------|
| Card background | --ds-color-surface | #ffffff |
| Card border | --ds-color-border-subtle | #e5e7eb |
| Primary button background | --ds-color-primary | #0057FF |
| Primary button text | --ds-color-on-primary | #ffffff |
| Badge promo background | --ds-color-promo | #FFF3CD |
| Badge promo text | --ds-color-on-promo | #92400E |
| Subtle text | --ds-color-text-subtle | #6B7280 |

### Unmapped Values

| Element | Property | Value | Notes |
|---------|----------|-------|-------|
| Card hover shadow | box-shadow | 0 4px 12px rgba(0,0,0,0.16) | Figma: custom shadow value; no --ds-shadow-md equivalent found in library book — confirm with design |
| Quick view trigger | backdrop-filter | blur(4px) | Figma: frosted glass effect on trigger; not a DS token — may need custom implementation |

---

## Quick View Panel

### Component Mapping

| Element | Component | Variant / Props |
|---------|-----------|----------------|
| Panel overlay container | (custom) | No DS panel component; custom positioned element |
| Panel backdrop | Overlay | (utility class from design system) |
| Close button | Button | variant: ghost, size: md, iconOnly: true, aria-label: "Close quick view" |
| Panel title | Text | style: heading-sm |
| Main product image | (native img) | aspect-ratio 1:1, object-fit: cover |
| Carousel prev/next buttons | Button | variant: ghost, size: sm, iconOnly: true |
| Product name | Text | style: heading-md, weight: bold |
| Sale price | Text | style: heading-sm, weight: bold, color: --ds-color-text-primary |
| Original price | Text | style: body-sm, textDecoration: line-through, color: --ds-color-text-subtle |
| Size pills | (custom SizeSelector) | No DS equivalent; see Tier 3 — custom pill group with aria-selected |
| Color swatches | (custom ColorSelector) | No DS equivalent; circular swatches with selected ring |
| "View Full Details" | Text link | variant: inline, style: body-sm |
| "Add to Cart" panel CTA | Button | variant: primary, size: lg, fullWidth: true |

### Typography

| Element | Font | Size | Weight | Color Token |
|---------|------|------|--------|-------------|
| Panel title | [DS heading font] | 16px /* Figma: 16px */ | 600 (semibold) | --ds-color-text-primary |
| Product name | [DS heading font] | 22px /* Figma: 22px */ | 700 (bold) | --ds-color-text-primary |
| Sale price | [DS heading font] | 20px /* Figma: 20px */ | 700 (bold) | --ds-color-text-primary |
| Original price | [DS body font] | 14px /* Figma: 14px */ | 400 (regular) | --ds-color-text-subtle |
| Size pill label | [DS label font] | 13px /* Figma: 13px */ | 500 (medium) | --ds-color-text-primary |
| "View Full Details" | [DS body font] | 14px /* Figma: 14px */ | 400 (regular) | --ds-color-primary |
| Section subheadings | [DS label font] | 12px /* Figma: 12px */ | 600 (semibold) | --ds-color-text-subtle |

### Color Tokens

| Usage | Token | Fallback |
|-------|-------|---------|
| Panel background | --ds-color-surface | #ffffff |
| Panel border (header/footer dividers) | --ds-color-border-subtle | #e5e7eb |
| Backdrop overlay | --ds-color-overlay | rgba(0,0,0,0.4) |
| Selected size pill background | --ds-color-primary | #0057FF |
| Selected size pill text | --ds-color-on-primary | #ffffff |
| Selected color swatch ring | --ds-color-border-focus | #0057FF |
| "Add to Cart" button | --ds-color-primary | #0057FF |
| "Add to Cart" button text | --ds-color-on-primary | #ffffff |
| Link text | --ds-color-primary | #0057FF |

### Unmapped Values

| Element | Property | Value | Notes |
|---------|----------|-------|-------|
| Panel drop shadow | box-shadow | 0 8px 32px rgba(0,0,0,0.24) | Figma: custom value; no --ds-shadow-lg in library book — larger than any existing shadow token |
| Color swatch selected ring | outline-offset | 2px | Figma: 2px gap between swatch and focus ring; no DS token for outline-offset — hardcode |
| SizeSelector pill selected state | background + border-color | --ds-color-primary + border-color same | Not a DS button variant; custom component state — document in INTERACTION.md Tier 3 |
| Dot indicator (active) | width | 16px (inactive: 8px) | Figma: active dot expands to 16px width; purely custom carousel behavior |
