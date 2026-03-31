# DESIGN: Product-List-Container

## Component Mapping

| Element | Component | Variant | Props |
|---------|-----------|---------|-------|
| Slate Tab Group | TabGroup | Amount=5 | accessibilityLabel="Label" |
| Tab 1 | Tab | Selected=False | label="All products", accessory=true |
| Tab 2 | Tab | Selected=True | label="Ready to list", accessory=true |
| Slate Badge | Badge | Show Exact Value=True | value="10" |
| Search Input | Search | — | width=320, height=40 |
| Filter Button | FilterButton | State=Default | — |
| IconButton (sort) | IconButton | Tertiary, Small, Square | disabled=false |
| IconButton (more) | IconButton | Secondary, Small, Circle | disabled=false |
| Checkbox (row) | Checkbox | State=Default | — |

## Typography

| Element | Preset | Size | Weight | Line-height |
|---------|--------|------|--------|-------------|
| Tab Label | paragraph medium | 14px | 400 | 20px |
| Tab Label (selected) | label large | 14px | 500 | 20px |
| Badge Value | label large | 14px | 500 | 20px |
| Search Placeholder | paragraph medium | 14px | 400 | 20px |
| Filter Label | paragraph medium | 14px | 400 | 20px |
| Table Header | label large | 14px | 500 | 20px |
| Product Name | paragraph medium | 14px | 400 | 20px |

## Color Tokens

| Element | Property | Token | Value |
|---------|----------|-------|-------|
| Container | border | `--slate-color-border-muted` | #dfe0e1 |
| Tab Group | border-bottom | `--slate-color-border-muted` | #dfe0e1 |
| Tab Label | fill | `--slate-color-text-primary` | #333333 |
| Selected Tab | border-bottom | `--slate-color-action-surface-default` | #333333 (via stroke) |
| Selected Tab underline | stroke | `--slate-color-grey-1000` | #000000 |
| Badge | fill | `--slate-color-surface-tertiary` | #f7f7f7 |
| Search icon | stroke | `--slate-color-text-primary` | #333333 |
| Surface | fill | `--slate-color-surface-primary` | #ffffff |
| Subdued text | fill | `--slate-color-text-subdued` | #757575 |

## Unmapped Values

| Element | Property | Raw Value | Notes |
|---------|----------|-----------|-------|
| Filter/Search gap | spacing | 40px | No semantic token — custom `gap: 40px` between filter group and actions |
