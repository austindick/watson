---
type: chapter
title: "Multi-Variant Prototypes"
last_updated: "2026-03-31"
---

# Multi-Variant Prototypes

## When to Use Folder Structure

| Variants | Pattern |
|----------|---------|
| 1 | Single file: `src/pages/PrototypeName.tsx` or `PrototypeNamePage.tsx` |
| 2+ | Folder: `src/pages/PrototypeName/` with index + variant files |

MUST: Use folder structure for 2+ variants. Single-file prototypes with many variants become unwieldy (4,000+ lines).
Note: Existing single-file prototypes are grandfathered — do NOT migrate them without being asked.

## Folder Structure

```
src/pages/MyPrototype/
├── index.tsx      # Routing, CONCEPTS array, VariantSwitcher, prototypeMeta
├── Variant1.tsx   # Self-contained variant component
├── Variant2.tsx   # Self-contained variant component
└── shared.tsx     # Optional: shared utilities/constants/types across variants
```

MUST: `prototypeMeta` export lives in `index.tsx` only — not in variant files.
SHOULD: Create `shared.tsx` only when multiple variants truly share utilities. Do not create it by default.

## index.tsx Template

```tsx
import { useState } from "react";
import { VariantSwitcher } from "../../components/VariantSwitcher";
import Variant1 from "./Variant1";
import Variant2 from "./Variant2";

const CONCEPTS = [
  { variantNumber: 2, label: "Description of variant 2", lastUpdated: "Mar 10, 2026" },
  { variantNumber: 1, label: "Description of variant 1", lastUpdated: "Mar 10, 2026" },
];

export const prototypeMeta = {
  name: "MyPrototypePage",
  creator: "Full Name",
  ownerGithub: "githubusername",
};

export default function MyPrototypePage() {
  const [activeVariant, setActiveVariant] = useState(CONCEPTS[0].variantNumber);

  const renderVariant = () => {
    switch (activeVariant) {
      case 1: return <Variant1 />;
      case 2: return <Variant2 />;
      default: return <Variant2 />;
    }
  };

  return (
    <div>
      <VariantSwitcher
        activeVariant={activeVariant}
        onVariantChange={setActiveVariant}
        concepts={CONCEPTS}
        featureTitle="My Prototype"
      />
      {renderVariant()}
    </div>
  );
}
```

MUST: CONCEPTS array lists variants with most recent first (highest `variantNumber` at index 0).
MUST: `useState` initializes to `CONCEPTS[0].variantNumber` (most recent variant is default).
MUST: `switch` statement covers all variant numbers + default fallback.

## Variant File Template

```tsx
export default function Variant1() {
  // Self-contained — all JSX, styles, and logic for this variant only
  return <div>{/* Variant content */}</div>;
}
```

MUST: Each variant is fully self-contained. Do not share state between variants.
NEVER: Share component internals between variants via module-level state or context (unless genuinely needed).

## Adding a New Variant to an Existing Prototype

MUST follow this sequence:

1. Add new variant to CONCEPTS array at the top (most recent first) with `variantNumber`, `label`, and `lastUpdated`
2. Create new variant file (e.g., `Variant3.tsx`) — copy the most relevant existing variant and rename everything
3. Add case to switch statement in `renderVariant()`
4. Update any sidebar switches or variant-number checks throughout the file

NEVER: Edit the existing variant's component to accommodate the new variant. Copy it instead. This preserves the original variant.

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Folder | PascalCase, no "Page" suffix | `ProductQuickView/` |
| index.tsx function | PascalCase + Page | `ProductQuickViewPage` |
| Variant files | PascalCase + number | `Variant1.tsx`, `Variant2.tsx` |
| CONCEPTS entries | Most recent first | variantNumber 3, then 2, then 1 |

PREFER: Descriptive variant labels in CONCEPTS (e.g., "Inline drawer with preview" not "Variant 1").
