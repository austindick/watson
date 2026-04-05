---
type: chapter
title: "Project Structure"
last_updated: "2026-03-31"
---

# Project Structure

## Tech Stack

| Tech | Version | Notes |
|------|---------|-------|
| React | 18 | Hooks-based |
| TypeScript | — | Strict mode |
| Tailwind CSS | — | Token-driven via CSS vars |
| React Router | v5 | `<Switch>` + `<Route>` pattern |
| Nx | — | Monorepo task runner |

MUST: App uses React Router v5. Do NOT use v6 patterns (no `useNavigate`, no `<Routes>` element).

## Directory Layout

```
packages/design/prototype-playground/
├── src/
│   ├── pages/              # All prototype pages — one file or folder per prototype
│   ├── components/
│   │   ├── design-system/  # Legacy FauxDS components (prefer @faire/slate imports)
│   │   └── shared/         # Shared UI: SlateTable, BrandPortalLayout, ProductTile, etc.
│   ├── config/
│   │   ├── prototypes.ts   # Prototype registry (Feed + Workspaces data)
│   │   └── contributors.ts # Team member registry
│   ├── data/
│   │   ├── entity_types/   # Canonical entity interfaces
│   │   ├── entity_db/      # Token-sharded entity snapshots
│   │   ├── entity_sets/    # Shared entity exports only
│   │   └── get_entity.ts   # Entity retrieval API
│   ├── view_models/        # Optional presentation shaping outside src/data
│   ├── contexts/           # React contexts
│   └── App.tsx             # Route definitions
├── tokens/                 # Slate design tokens (CSS variables)
├── scripts/                # Automation (thumbnails, dates)
└── public/                 # Static assets and thumbnails
```

## Prototype File Naming

| Variants | Pattern | Example |
|----------|---------|---------|
| 1 variant | `src/pages/[Name]Page.tsx` | `ProductQuickViewPage.tsx` |
| 2+ variants | `src/pages/[Name]/index.tsx` + variant files | `ProductQuickView/index.tsx` |

MUST: Single-variant prototypes live directly in `src/pages/`. Multi-variant prototypes use a folder — see multi-variant chapter.

MUST: `prototypeMeta` export goes only in files directly in `src/pages/` (or in folder's `index.tsx`). NEVER add it to sub-variant files.

## Route Registration

Routes are defined in `src/App.tsx` using React Router v5:

```tsx
import PrototypeNamePage from "./pages/PrototypeNamePage";

// Inside <Switch>:
<Route
  path="/prototype-path"
  render={() => (
    <RouteWrapper>
      <PrototypeNamePage />
    </RouteWrapper>
  )}
/>
```

MUST: Always wrap with `<RouteWrapper>`. MUST: Kebab-case route paths (e.g., `/product-quick-view`).

## Data Layer Rules

MUST: `src/data` is the canonical data layer. Data lives in `entity_db`, retrieved only via `get_entity.ts`.
MUST: Use `getEntityByToken`, `getEntityByTokenAsync`, `getAllEntities`, or `getRandomEntitiesSync` from `get_entity.ts`.
NEVER: Import entity shard files directly from pages or view-models.
NEVER: Hardcode reusable product/brand/retailer datasets in `src/pages/*`.
NEVER: Add non-entity payloads to `src/data/` — use `src/config/` or co-located page seeds instead.

**Data layer structure:**
- `entity_types/*` — canonical interfaces
- `entity_db/*` — canonical shards only (one entity per file)
- `get_entity.ts` — the only retrieval API
- `entity_sets/*` — entity exports only (no view-model types, no JSON)
- `view_models/*` — optional presentation shaping outside `src/data`

Think of it as: **Data in `src/data`** | **Presentation in `view_models`** | **Interaction/layout in `src/pages`**
