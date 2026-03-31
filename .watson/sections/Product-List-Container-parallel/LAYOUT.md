# LAYOUT: Product-List-Container

## Token Quick-Reference

| Element                 | Property        | Token                          | Value |
|-------------------------|-----------------|--------------------------------|-------|
| Product List Container  | gap             | `--slate-dimensions-3`         | 12px  |
| Product List Container  | padding-top/btm | `--slate-dimensions-3`         | 12px  |
| Product List Container  | padding-left/rt | `0`                            | 0px   |
| Product List Container  | border-radius   | `--slate-radius-container-default` | 4px |
| Table Actions           | gap             | `--slate-dimensions-10`        | 40px  |
| Table Actions           | padding-top/btm | `--slate-dimensions-3`         | 12px  |
| Table Actions           | padding-left/rt | `--slate-dimensions-5`         | 20px  |

## Component Tree

```
Product List Container (FRAME, column, fill×hug)
├── Slate Tab Group (INSTANCE, row, fill×hug)
├── Table Actions (FRAME, row, space-between, fill×hug)
│   ├── [left actions]
│   └── [right actions]
└── Table Rows Container (FRAME, column, fill×hug)
```

## Annotated CSS

```css
.product-list-container {
  display: flex;
  flex-direction: column;              /* Figma: column */
  align-items: stretch;
  width: 100%;                         /* Figma: fill */
  height: fit-content;                 /* Figma: hug */
  gap: var(--slate-dimensions-3);      /* Figma: 12px */
  padding: var(--slate-dimensions-3) 0; /* Figma: 12px 0px */
  border-radius: var(--slate-radius-container-default); /* Figma: 4px */
  border: 1px solid #DFE0E1;
}

.slate-tab-group {
  display: flex;
  flex-direction: row;                 /* Figma: row */
  align-items: center;
  width: 100%;                         /* Figma: fill */
  height: fit-content;                 /* Figma: hug */
}

.table-actions {
  display: flex;
  flex-direction: row;                 /* Figma: row */
  justify-content: space-between;
  align-items: center;
  width: 100%;                         /* Figma: fill */
  height: fit-content;                 /* Figma: hug */
  gap: var(--slate-dimensions-10);     /* Figma: 40px */
  padding: var(--slate-dimensions-3) var(--slate-dimensions-5); /* Figma: 12px 20px */
}

.table-rows-container {
  display: flex;
  flex-direction: column;              /* Figma: column */
  align-items: stretch;
  width: 100%;                         /* Figma: fill */
  height: fit-content;                 /* Figma: hug */
}
```
