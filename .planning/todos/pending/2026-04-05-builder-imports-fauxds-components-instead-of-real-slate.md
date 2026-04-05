---
created: 2026-04-05T16:27:45.067Z
title: Builder imports FauxDS components instead of real Slate
area: watson-builder
files:
  - skills/watson/agents/builder.md
  - skills/watson/library/design-system/BOOK.md
  - skills/watson/library/design-system/components/button/PAGE.md
---

## Problem

When Watson builds a prototype, the builder agent imports from `@/components/design-system/` (FauxDS wrapper components) instead of `@faire/slate/components/` (real Slate). The design-system library book correctly contains `@faire/slate` import paths (e.g., `import { Button } from "@faire/slate/components/button"`), so the library data is accurate. The builder either skips the library lookup or overrides what it reads based on the existing `src/components/design-system/` directory in the prototype playground.

Observed during phase 13 plugin verification: builder read the design-system BOOK.md but still emitted FauxDS imports. When asked, the builder claimed the playground "doesn't have @faire/slate as a dependency" — which may or may not be true but contradicts the library book guidance.

## Solution

Investigate whether:
1. The builder agent reads the library but deprioritizes it in favor of what it finds on disk (existing FauxDS components)
2. The builder agent doesn't read the library at all for import resolution
3. The prototype playground actually needs `@faire/slate` added as a dependency

Fix likely involves strengthening the builder agent's instruction to always use library book imports over filesystem discovery, or ensuring the playground has real Slate available.
