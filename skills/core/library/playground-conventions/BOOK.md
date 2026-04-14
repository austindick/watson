---
type: book
title: "Playground Conventions"
last_updated: "2026-03-31"
book_type: foundational
use_when: "Agent needs prototype scaffolding steps, component imports, design tokens, dev workflow, or multi-variant patterns"
source_paths:
  - "${CLAUDE_PLUGIN_ROOT}/skills/core/references/playground-conventions.md"
  - "@repo/packages/design/prototype-playground/CLAUDE.md"
  - "@repo/packages/design/prototype-playground/README.md"
  - "@repo/packages/design/prototype-playground/SHARING_GUIDE.md"
  - "@repo/packages/design/prototype-playground/SHARED-CODE-POLICY.md"
source_hash: "foundational-manually-authored"
chapters:
  - id: project-structure
    path: project-structure/CHAPTER.md
    summary: "Directory layout, tech stack, file naming, routes, where prototypes live"
  - id: scaffolding
    path: scaffolding/CHAPTER.md
    summary: "4-step checklist for new prototypes: page file, registry, data layer, thumbnail"
  - id: components
    path: components/CHAPTER.md
    summary: "Slate component imports, VariantSwitcher, BrandPortal, SlateTable reference"
  - id: design-tokens
    path: design-tokens/CHAPTER.md
    summary: "Slate CSS variable usage, Tailwind integration, color/type/spacing conventions"
  - id: dev-workflow
    path: dev-workflow/CHAPTER.md
    summary: "Dev server, thumbnail generation, publishing/PR workflow, committing rules, shared code policy"
  - id: multi-variant
    path: multi-variant/CHAPTER.md
    summary: "Folder structure for 2+ variants, CONCEPTS array pattern, variant isolation rules"
  - id: contributor-registration
    path: contributor-registration/CHAPTER.md
    summary: "How to add team members to contributors.ts, registration format, owner field matching"
  - id: page-templates
    path: page-templates/CHAPTER.md
    summary: "Portal outer shell values (Retailer, Brand): background, padding, max-width, nav, inter-section spacing"
---

# Playground Conventions

Consolidated from playground source docs. Foundational book — maintained manually, not by Librarian.

Root path: `packages/design/prototype-playground/`

## Chapters

| ID | Chapter | Summary |
|----|---------|---------|
| project-structure | [Project Structure](project-structure/CHAPTER.md) | Directory layout, tech stack, file naming, routes |
| scaffolding | [Scaffolding](scaffolding/CHAPTER.md) | 4-step checklist for every new prototype |
| components | [Components](components/CHAPTER.md) | Slate components, VariantSwitcher, BrandPortal, SlateTable |
| design-tokens | [Design Tokens](design-tokens/CHAPTER.md) | Slate CSS variables, Tailwind usage, color/type/spacing rules |
| dev-workflow | [Dev Workflow](dev-workflow/CHAPTER.md) | Dev server, thumbnails, publishing, commits, shared code policy |
| multi-variant | [Multi-Variant](multi-variant/CHAPTER.md) | Folder structure, CONCEPTS array, variant isolation |
| contributor-registration | [Contributor Registration](contributor-registration/CHAPTER.md) | Adding team members, owner field matching |
| page-templates | [Page Templates](page-templates/CHAPTER.md) | Portal outer shell values (Retailer, Brand): background, padding, max-width, nav, inter-section spacing |
