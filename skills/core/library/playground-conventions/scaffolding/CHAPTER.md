---
type: chapter
title: "Scaffolding"
last_updated: "2026-03-31"
---

# Scaffolding

Every new prototype requires exactly 4 steps. Do not skip any step.

## Step 1: Create Page File

**Single-variant** — `src/pages/[Name]Page.tsx`:

```tsx
import { useEffect } from "react";

export const prototypeMeta = {
  name: "Prototype Name",
  creator: "Full Name",
  ownerGithub: "githubusername",
};

export default function PrototypeNamePage() {
  useEffect(() => {
    document.title = "Prototype Name";
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Prototype content */}
    </div>
  );
}
```

MUST: Include `prototypeMeta` export with `name`, `creator`, and `ownerGithub`. This drives Feed attribution.
MUST: Set `document.title` in `useEffect`.
PREFER: Include `<VariantSwitcher>` even for single-concept prototypes (enables table config panel).

**Multi-variant (2+ concepts)** — use folder structure (see multi-variant chapter).

Also add route to `src/App.tsx`:
```tsx
import PrototypeNamePage from "./pages/PrototypeNamePage";
// In <Switch>:
<Route path="/prototype-path" render={() => <RouteWrapper><PrototypeNamePage /></RouteWrapper>} />
```

## Step 2: Register in `src/config/prototypes.ts`

Add to the `prototypes` array:

```tsx
{
  id: 'prototype-id',           // kebab-case, matches route path
  name: 'Prototype Name',
  path: '/prototype-path',
  description: 'Brief description.',
  owner: 'OwnerShortName',      // MUST match name field in contributors.ts exactly
  createdAt: 'YYYY-MM-DD',
  lastUpdated: 'YYYY-MM-DD',
  surfaceArea: 'Brand',         // 'Brand' | 'Retailer' | 'Creative' | 'Other'
  category: 'experimental',
  status: 'wip',
  thumbnail: '/images/thumbnails/prototype-id.png',
},
```

MUST: `owner` matches a `name` field in `contributors.ts` exactly — mismatches break Feed attribution.
MUST: If creator not in contributors.ts, add them first (see contributor-registration chapter).
MUST: Add tool entry in `src/data/prototype-tools.json`:
```json
"prototype-id": "claude-code"
```
Valid values: `"cursor"`, `"claude-code"`, `"figma-make"`. Use array for multiple: `["cursor", "claude-code"]`.

## Step 3: Set Up Data Layer (if needed)

SHOULD: Use `entity_db` for any realistic product/brand/retailer data instead of hardcoded payloads.

**Import entities via CLI:**
```bash
# Check what's missing
yarn nx run prototype-playground:entity-db -- missing product --tokens p_xxx,p_yyy

# Import missing entities
yarn nx run prototype-playground:entity-db -- upsert product --tokens p_xxx,p_yyy --api-env production

# Validate (must pass before finalizing)
ENTITY_DB_LIMIT_PRODUCT=5000 yarn nx run prototype-playground:entity-db-validate
```

NEVER: Use `faire api call` for playground imports — it can fail due to S3 access issues. Use `entity-db` instead.

**Auth setup (one-time):**
```bash
faire auth --env prod --sso
```

**Transitive imports (REQUIRED):** When you import an entity, also import every entity it references.
Known chains:
- `theme.productTokens[]` → product entities
- `product.brandToken` → brand entity

**Workflow:** import products → validate → extract missing brand tokens → import brands → re-validate. Repeat until clean.

**Large batch imports (100+ products):** Split into batches of 20–30 with `--continue-on-error`. Sleep 3–5s between batches. If 429s, wait 60–120s before resuming.

**Data access in pages:**
```tsx
import { getEntityByToken } from "../data/get_entity";
const product = getEntityByToken("product", "p_xxx");
```

NEVER: Import from `entity_db/*` shard files directly.
NEVER: Use `require.context` outside `get_entity.ts`.

## Step 4: Generate Thumbnail

MUST: Every prototype must have a thumbnail before publishing. Without it, prototype shows as gray box in Feed.

```bash
# Dev server must be running first
yarn nx thumbnails prototype-playground
# OR:
yarn nx generate-thumbnails prototype-playground
```

Verify file created at `public/images/thumbnails/[prototype-id].png`.

## Checklist Before Sharing

- [ ] Page file created in `src/pages/`
- [ ] `prototypeMeta` export added with correct `ownerGithub`
- [ ] Route added to `App.tsx` with `<RouteWrapper>`
- [ ] Registered in `prototypes.ts` with matching `owner`
- [ ] Tool entry added to `prototype-tools.json`
- [ ] Uses Slate components (not custom HTML)
- [ ] VariantSwitcher included
- [ ] Thumbnail generated and present in `public/images/thumbnails/`
- [ ] Appears in Feed with preview image
- [ ] Appears in creator's Workspace
