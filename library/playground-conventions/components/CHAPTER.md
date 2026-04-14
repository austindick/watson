---
type: chapter
title: "Components"
last_updated: "2026-03-31"
---

# Components

## Slate Components (Primary — use these first)

Real Slate components from `@faire/slate`. MUST use Slate before creating custom UI.

**Import path:**
```tsx
import { Button } from "@faire/slate/components/button";
import { TextInput } from "@faire/slate/components/text-input";
import { BaseModal } from "@faire/slate/components/modal/base";
```

**Available components:**

| Category | Components |
|----------|-----------|
| Buttons | Button (primary/secondary/tertiary/plain), IconButton |
| Inputs | TextInput, TextArea, PasswordInput, Select, Search, Combobox |
| Controls | Checkbox, Radio, Toggle |
| Display | Badge, Tag, Avatar, LoadingSpinner, LoadingSkeleton, ProgressBar, Link, ListItem |
| Navigation | Tab, Accordion, Pagination, Menu |
| Overlays | BaseModal, PromptModal, MarketingModal, Popover, Tooltip, Toast |
| Filters | Filter |
| Selection | SelectionCard |

For full component props, variants, and states, see the design system book.

**Slate component rules:**

PREFER: Adjust via component props before adding custom styling.
SHOULD: When props aren't enough, wrap the Slate component and style the wrapper.
NEVER: Target Slate component internals with CSS selectors.

## VariantSwitcher

MUST: Include VariantSwitcher in every prototype. It controls variant display and enables SlateTable config panel.

**Import:**
```tsx
import { VariantSwitcher } from "../components/VariantSwitcher";
// In subfolders:
import { VariantSwitcher } from "../../components/VariantSwitcher";
```

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `activeVariant` | `number` | Currently selected variant number |
| `onVariantChange` | `(n: number) => void` | Variant selection callback |
| `featureTitle` | `string` | Feature label displayed in control bar |
| `concepts` | `Concept[]` | Array of variant descriptors |
| `hideConceptSelector` | `boolean` | Hide concept switcher (for table-only pages) |

**Concept shape:** `{ variantNumber: number, label: string, lastUpdated?: string }`

For single-concept prototypes with a SlateTable, use `hideConceptSelector`:
```tsx
<VariantSwitcher featureTitle="My Prototype" hideConceptSelector />
```

## BrandPortal (Brand surface prototypes)

MUST: All Brand surface prototypes include Brand Portal sidebar navigation.
NEVER: Modify shared `BrandPortalSidebar.tsx` for prototype-specific nav. Always use `navOverrides`.

**BrandPortalLayout wrapper (preferred):**
```tsx
import { BrandPortalLayout } from "../../components/shared";

export default function MyBrandPrototype() {
  return (
    <BrandPortalLayout activeItem="Products" activeChild="Bulk upload">
      <div className="min-h-screen bg-[var(--slate-color-surface-secondary,#F7F7F7)]">
        {/* page content */}
      </div>
    </BrandPortalLayout>
  );
}
```

**BrandPortalLayout props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeItem` | `string` | — | Top-level nav item to highlight (e.g. "Products") |
| `activeChild` | `string` | — | Child nav item to highlight (e.g. "Bulk upload") |
| `initials` | `string` | `"AD"` | Avatar initials |
| `navOverrides` | `NavOverride[]` | — | Prototype-specific nav additions/changes |

**Adding prototype-specific nav (use navOverrides):**
```tsx
<BrandPortalLayout
  activeItem="Products"
  activeChild="Dashboard"
  navOverrides={[
    { label: "Products", addChildren: ["Dashboard"] },
    { label: "Fulfilled by Faire", afterItem: "Products", children: ["Products", "Shipments"] },
    { label: "Messages", badge: 35 },
  ]}
>
```

**Sidebar only (without wrapper):**
```tsx
import { BrandPortalSidebar } from "../../components/shared";
<div className="flex min-h-screen">
  <BrandPortalSidebar activeItem="Products" activeChild="Bulk upload" />
  <main className="flex-1">...</main>
</div>
```

## SlateTable

MUST: Use SlateTable for ALL data tables in prototypes. NEVER build custom table markup.
MUST: Provide a unique, descriptive `tableId` for every table (persistence key).
MUST: Include `<VariantSwitcher>` on pages with SlateTable (enables config panel toggle).
NEVER: Modify files in `src/components/shared/SlateTable*.tsx` when building a prototype (use `customCellRenderer` instead).

**Import:**
```tsx
import { SlateTableWithConfig, SlateTableActions } from "../components/shared";
// In subfolders:
import { SlateTableWithConfig, SlateTableActions } from "../../components/shared";
```

**Basic usage:**
```tsx
<SlateTableActions className="mb-4" />
<SlateTableWithConfig tableId="unique-table-id" />
```

**With pre-built config (initialConfig):**
```tsx
import type { TableConfig } from "../../types/table";

const tableConfig: TableConfig = {
  columns: [
    { id: "col-1", label: "Product", cellType: "imageAndText", width: 250, key: "imageAndText", bold: false },
    { id: "col-2", label: "Price",   cellType: "text",         width: 120, key: "text",         bold: false },
    { id: "col-3", label: "Status",  cellType: "tag",          width: 120, key: "tag",          bold: false },
  ],
  cellValues: {},
  imageUrlValues: {},
  subtextValues: {},
  rowCount: 12,
  rowsSelectable: true,
  rowActionsEnabled: true,
  rowActionItems: [
    { id: "ra-1", label: "Edit",      display: "overflow", variant: "secondary" },
    { id: "ra-2", label: "Duplicate", display: "overflow", variant: "secondary" },
    { id: "ra-3", label: "Delete",    display: "overflow", variant: "secondary" },
  ],
  columnPrompts: {},
};

<SlateTableWithConfig tableId="products-table" initialConfig={tableConfig} />
```

Note: `initialConfig` seeds on first mount only — ignored if a saved config already exists for that `tableId`.

**SlateTableWithConfig props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tableId` | `string` | — | Required. Stable persistence key |
| `initialConfig` | `TableConfig` | — | Seed config for first mount |
| `rows` | `SlateTableRow[]` | MOCK_ROWS | Custom row data |
| `configurable` | `boolean` | `true` | Show config toggle in VariantSwitcher |
| `editable` | `boolean` | `false` | Allow inline cell editing |
| `onActionClick` | `(action, rowId) => void` | — | Row action click handler |
| `customCellRenderer` | `(cellType, value, row) => ReactNode \| undefined` | — | Override specific cell rendering |

**Cell types:**
| Type | Key | Description |
|------|-----|-------------|
| Text | `text` | Plain text |
| Image + Text | `imageAndText` | Thumbnail with name and optional subtext |
| Tag | `tag` | Single status tag |
| Tag Group | `tagGroup` | Multiple tags |
| Input | `input` | Editable text input |
| Quantity Picker | `quantityPicker` | Increment/decrement control |
| Checkbox | `checkbox` | Toggle |
| Icon | `icon` | Status icon (check, x, warning) |
| Button | `button` | Action button |
| Link | `link` | Clickable link |

**Multiple tables:** Give each a unique `tableId` — they appear as separate toggles in VariantSwitcher.

**SlateTableActions props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchPlaceholder` | `string` | `"Search..."` | Search input placeholder |
| `quickFilters` | `{ label: string; Icon?: React.FC }[]` | `[]` | Filter pills after Sort/Filters |
| `actionLabel` | `string` | `"Bulk edit"` | Right-side action button label |
| `hideSearch/hideSort/hideFilters/hideExport/hideAction` | `boolean` | `false` | Hide individual controls |
| `className` | `string` | `""` | Additional className |

Note: SlateTableActions controls are visual-only — they do not yet control the table.

**Custom cell rendering (prototype-specific only):**
```tsx
<SlateTableWithConfig
  tableId="my-table"
  customCellRenderer={(cellType, value, row) => {
    if (cellType === "tag" && value === "Urgent") {
      return <span className="font-bold text-red-600">{value}</span>;
    }
    return undefined; // fall back to default renderer
  }}
/>
```

## Icons

```tsx
import { ArrowLeft } from "@faire/slate/icons/ArrowLeft";
import { Search } from "@faire/slate/icons/Search";
```

170 icons available from `@faire/slate/icons/`. For the full list, see the design system book's Icons chapter.
