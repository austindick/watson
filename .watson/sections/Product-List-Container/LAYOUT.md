# LAYOUT: Product-List-Container

## Token Quick-Reference

| Element | Token | Value |
|---------|-------|-------|
| Product List Container | `--slate-dimensions-3` | 12px (gap) |
| Product List Container | `--slate-dimensions-3` | 12px 0px (padding) |
| Product List Container | `--slate-radius-container-default` | 4px (border-radius) |
| Filter/Search Bar | `--slate-dimensions-10` | 40px (min-height) |
| Filter/Search Bar | `--slate-dimensions-5` | 20px (padding-x) |
| Filter/Search Bar | `--slate-dimensions-3` | 12px (padding-y) |
| Filter/Search Bar | `--slate-dimensions-10` | 40px (gap) |
| Search Input | `--slate-dimensions-4` | 16px (padding-x) |
| Search Input | `--slate-dimensions-2` | 8px (gap) |
| Filter Group | `--slate-dimensions-2` | 8px (gap) |
| Tab Group | — | hug (no gap on row container) |
| Tab Middle | `--slate-dimensions-1` | 4px (gap) |
| Badge | `--slate-dimensions-2` | 8px (padding-x) |

## Component Tree

```
Product-List-Container (col, gap: --slate-dimensions-3/12px, pad: 12px 0px, fill × hug)
  ├─ Slate Tab Group (row, align: center, fill × hug)
  │   └─ Tabs (row, align: center, hug × hug)
  │       ├─ Tab 1 (row, align: center, hug × hug)
  │       │   ├─ Left (col, 24×52 fixed)
  │       │   ├─ Middle (row, gap: 4px, center, hug × 52 fixed)
  │       │   │   ├─ Label "All products" [Paragraph 14/400]
  │       │   │   └─ Slate Badge (row, pad: 0 8px, hug × 22 fixed, radius: 999px)
  │       │   └─ Right (col, 24×52 fixed)
  │       └─ Tab 2 "Ready to list" (selected, row)
  ├─ Filter/Search Bar (row, space-between, gap: 40px, pad: 12px 20px, fill × hug)
  │   ├─ Left Group (row, space-between, gap: 8px, fill × hug)
  │   │   ├─ Filter Group (row, gap: 8px, hug × hug)
  │   │   └─ Search Input (row, gap: 8px, pad: 0 16px, 320×40 fixed)
  │   └─ Right Group (row, gap: 8px, hug × 40 fixed)
  └─ Table Rows (col, fill × hug) [repeated product rows]
```

## Annotated CSS

```css
.product-list-container {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  align-self: stretch;
  gap: var(--slate-dimensions-3); /* Figma: 12px */
  padding: var(--slate-dimensions-3) 0; /* Figma: 12px 0px */
  border: 1px solid var(--slate-color-border-muted); /* Figma: #DFE0E1 */
  border-radius: var(--slate-radius-container-default); /* Figma: 4px */
  width: 100%;
}

.filter-search-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: var(--slate-dimensions-10); /* Figma: 40px */
  padding: var(--slate-dimensions-3) var(--slate-dimensions-5); /* Figma: 12px 20px */
}

.search-input {
  display: flex;
  align-items: center;
  gap: var(--slate-dimensions-2); /* Figma: 8px */
  padding: 0 var(--slate-dimensions-4); /* Figma: 16px */
  width: 320px;
  height: var(--slate-button-height-small); /* Figma: 40px */
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--slate-dimensions-2); /* Figma: 8px */
}
```
