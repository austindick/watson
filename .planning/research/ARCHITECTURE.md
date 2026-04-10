# Architecture Research

**Domain:** Multi-mode design reference pipeline — Watson 1.4
**Researched:** 2026-04-09
**Confidence:** HIGH — all conclusions derived directly from reading the current Watson codebase

---

## Executive Summary

Watson 1.4 generalizes the Loupe pipeline from "Figma-only" to "any design reference." The core insight is that the pipeline already has a seam: decomposer produces `sections[]` with a `referenceType` field, and downstream agents receive pre-resolved specs rather than raw Figma data. Three new features exploit this seam:

1. **Source reader agent** — reads prod React/TSX from faire/frontend, emits the same LAYOUT.md / DESIGN.md / INTERACTION.md schema the pipeline already consumes
2. **Codebase-map library book** — Librarian-generated navigation reference for the monorepo (same Book/Chapter/Page pattern as design-system book)
3. **Discussion-only build path** — already partially implemented (discuss-only sections in loupe.md); needs a complete entry path and mode selector in loupe's Phase -1

The pipeline agents (layout, design, interaction, builder, reviewer) need zero structural changes. The schema-first contract means any agent that produces valid LAYOUT.md / DESIGN.md / INTERACTION.md output will work. Only the upstream (decomposer, loupe orchestrator) and the new source reader agent change.

---

## Current Pipeline Architecture

```
SKILL.md (master orchestrator)
    ↓ Tier 2 (build)
loupe.md (pipeline orchestrator)
    │
    ├── Phase -1: Standalone setup (blueprintPath, Figma URL, minimal CONTEXT.md)
    │
    ├── Phase 0: Library resolution
    │    └── reads LIBRARY.md → BOOK.md manifests → builds libraryPaths[]
    │
    ├── Phase 1: Decompose [hasFullFrame=true]
    │    └── decomposer.md (foreground)
    │         └── Figma MCP → sections[]{name, nodeId, dimensions, referenceType:"figma"}
    │
    ├── Phase 2: Research (parallel per figma section)
    │    ├── layout.md (background) → .watson/sections/{name}/LAYOUT.md
    │    ├── design.md (background) → .watson/sections/{name}/DESIGN.md
    │    └── interaction.md (background) → .watson/sections/{name}/INTERACTION.md
    │         [discuss-only sections SKIP Phase 2 — blueprint files used directly]
    │
    ├── Phase 3: Build + Review (sequential per section)
    │    ├── builder.md (background) — reads LAYOUT.md + DESIGN.md + INTERACTION.md
    │    └── reviewer.md (background) — audits against specs, fixes in-place
    │
    └── Phase 4: Consolidate
         └── consolidator.md (background)
              └── merges .watson/sections/*/[LAYOUT|DESIGN|INTERACTION].md → blueprint/
```

### Key Existing Contract Points

- `sections[]` entries have `referenceType` field — currently only `"figma"` and `"discuss-only"` exist
- loupe.md Phase 2 skips figma agents for `discuss-only` sections and reads `{blueprintPath}/LAYOUT.md` directly
- builder.md and reviewer.md accept `layoutPath: null` — they work with whatever spec paths are provided
- All research agents (layout, design, interaction) are stateless: they take inputs, write files, return
- `libraryPaths[]` is built once in Phase 0 and passed to every agent dispatch

---

## New Components

### 1. Source Reader Agent (`agents/source-reader.md`)

**Role:** Reads a prod React/TSX surface from faire/frontend monorepo and emits normalized LAYOUT.md, DESIGN.md, and INTERACTION.md spec files in exactly the same schema as the existing research agents.

**Position in pipeline:** Replaces layout + design + interaction agents for `referenceType: "prod-clone"` sections. Dispatched by loupe in Phase 2 (same phase, different branch).

**Inputs:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `sourceFilePaths` | string[] | Absolute paths to the TSX/component files for this section |
| `sectionName` | string | Used to construct output paths |
| `blueprintPath` | string | Standard Watson contract |
| `libraryPaths` | string[] | Standard Watson contract — used to validate component names and tokens |
| `watsonMode` | boolean | Standard Watson contract |

**Outputs** (same schema as layout + design + interaction agents):
- `{protoDir}/.watson/sections/{sectionName}/LAYOUT.md`
- `{protoDir}/.watson/sections/{sectionName}/DESIGN.md`
- `{protoDir}/.watson/sections/{sectionName}/INTERACTION.md`

**What it reads in faire/frontend:** TSX component files, CSS modules (or Tailwind classes), imported Slate component names and props. The codebase-map book tells it which files to read for a given route/surface.

**Why a new agent, not modified layout/design agents:** The existing layout and design agents have a hard dependency on `mcp__figma__get_figma_data`. They fetch Figma data before any analysis. Source reader reads the filesystem instead. Splitting into a separate agent preserves agent independence (constraint from PROJECT.md) and avoids polluting the Figma agents with conditional logic.

**Dispatch mode:** background (same as layout, design, interaction)

---

### 2. Codebase-Map Library Book

**Role:** Librarian-generated navigation reference for faire/frontend monorepo. Maps route paths and surface names to actual TSX file paths. Consumed by the source reader agent to locate files without grepping the monorepo at build time.

**Book type:** `source-derived` — Librarian manages it; same guard as design-system book

**Structure (Book/Chapter/Page pattern):**

```
library/
└── codebase-map/
    ├── BOOK.md                    ← manifest, source_hash, chapters[]
    ├── routes/
    │   └── CHAPTER.md             ← route → file path mappings
    ├── shared-components/
    │   └── CHAPTER.md             ← shared UI components used across surfaces
    └── feature-modules/
        └── CHAPTER.md             ← feature directory → primary component paths
```

**CHAPTER.md format (routes chapter example):**

```markdown
---
id: routes
title: Routes
source_hash: "sha256..."
pages: []
---

# Routes Chapter

## Brand Routes
| Route | Primary Component | File Path |
|-------|------------------|-----------|
| /marketplace | MarketplaceHome | @repo/packages/brand/src/pages/MarketplaceHome.tsx |
| /marketplace/products/:id | ProductDetail | @repo/packages/brand/src/pages/ProductDetail.tsx |
...

## Retailer Routes
| Route | Primary Component | File Path |
...
```

**Librarian invocation to generate:**
```
mode: generate
sourcePaths: ["@repo/packages/brand/src/", "@repo/packages/retailer/src/", ...]
outputBookPath: "${CLAUDE_PLUGIN_ROOT}/library/codebase-map/"
```

**How source reader uses it:** Read the routes chapter, match user-specified surface name or route to a file path, then read that file directly. No monorepo grep needed at agent runtime.

**Update cadence:** Regenerate when monorepo routes change significantly. Same `source_hash` fast-path as other source-derived books.

---

### 3. Multi-Mode Entry in Loupe (Phase -1 and Phase 1 changes)

**Where the change lives:** `skills/core/skills/loupe.md` — Phase -1 (standalone setup) and Phase 1 (decompose)

**New mode selector:** When no Figma URL is detected and loupe is invoked standalone or from SKILL.md Tier 2, loupe presents a mode question:

```
AskUserQuestion:
  header: "Reference"
  question: "What are you building from?"
  options: [
    "Figma frame — I have a design link",
    "Existing experience — clone from prod",
    "From scratch — describe it or use discuss decisions"
  ]
```

**Mode → pipeline input mapping:**

| Mode | sections[].referenceType | Phase 1 path | Phase 2 path |
|------|--------------------------|--------------|--------------|
| Figma | `"figma"` | decomposer runs | layout + design + interaction run |
| Prod clone | `"prod-clone"` | NEW: surface reader collects file paths | source-reader runs (replaces trio) |
| Discussion-only | `"discuss-only"` | skip decomposer; sections from blueprint | skip Phase 2; builder reads blueprint files |

---

## Data Flow Per Input Mode

### Mode 1: Figma (existing, unchanged)

```
User provides Figma URL
    ↓
loupe Phase 1: decomposer.md
    → mcp__figma__get_figma_data(frameUrl)
    → sections[]{name, nodeId, referenceType:"figma"}
    ↓
loupe Phase 2 (per figma section, parallel):
    → layout.md: Figma MCP → LAYOUT.md
    → design.md: Figma MCP → DESIGN.md
    → interaction.md: Figma MCP → INTERACTION.md
    ↓
loupe Phase 3 (per section, sequential):
    → builder.md: reads LAYOUT.md + DESIGN.md + INTERACTION.md → edits targetFile
    → reviewer.md: audits targetFile against specs → fixes in-place
    ↓
loupe Phase 4: consolidator.md → blueprint/[LAYOUT|DESIGN|INTERACTION].md
```

---

### Mode 2: Prod Clone (NEW)

```
User specifies surface name or route path
    ↓
loupe Phase 1: surface resolver (new logic in loupe.md, not an agent)
    → read codebase-map book (routes chapter)
    → match surface name → sourceFilePaths[]
    → sections[]{name, sourceFilePaths, referenceType:"prod-clone"}
    [No MCP calls, no user approval needed if match is unambiguous;
     AskUserQuestion to confirm if multiple matches found]
    ↓
loupe Phase 2 (per prod-clone section, parallel):
    → source-reader.md:
        reads sourceFilePaths[] directly
        reads libraryPaths[] to validate component/token names
        reads codebase-map book (shared-components chapter) if needed
        → .watson/sections/{name}/LAYOUT.md  (from JSX structure)
        → .watson/sections/{name}/DESIGN.md  (from component names + props)
        → .watson/sections/{name}/INTERACTION.md (from event handlers + state)
    ↓
loupe Phase 3 (per section, sequential) — UNCHANGED:
    → builder.md: reads same LAYOUT.md + DESIGN.md + INTERACTION.md
    → reviewer.md: same spec-compliance audit
    ↓
loupe Phase 4: consolidator.md — UNCHANGED
```

**Key design decision:** The surface resolver lives in loupe.md Phase 1 as inline logic (not a separate agent) because it's a simple book lookup + user confirmation — no parallel execution, no heavy processing. Keeping it inline avoids the overhead of a foreground agent dispatch for a task that takes 3-5 steps.

---

### Mode 3: Discussion-Only (extends existing partial impl)

```
User selects "From scratch" or has prior discuss session
    ↓
loupe Phase 1: no decomposer, no surface resolver
    → sections come from blueprint/LAYOUT.md CONTEXT.md (discuss output)
    → or user confirms section names inline
    → sections[]{name, referenceType:"discuss-only"}
    ↓
loupe Phase 2 (per discuss-only section): SKIP
    [blueprint/LAYOUT.md, DESIGN.md, INTERACTION.md already written by discuss]
    ↓
loupe Phase 3 (per section, sequential) — paths differ:
    layoutPath  = {blueprintPath}/LAYOUT.md   (blueprint-level, not section-level)
    designPath  = {blueprintPath}/DESIGN.md
    interactionPath = {blueprintPath}/INTERACTION.md (if exists)
    → builder.md: same execution, different input paths
    → reviewer.md: same execution, different input paths
    ↓
loupe Phase 4: consolidator.md
    [sections/*/LAYOUT.md are absent — consolidator handles missing section dirs gracefully]
```

**Note on existing implementation:** loupe.md already handles discuss-only sections in Phase 2 and Phase 3 with correct path routing to blueprint files. The gap is Phase 1 — there is no entry path to produce `sections[]` with `referenceType: "discuss-only"` without a prior discuss session. The mode selector fills this gap.

---

## Normalized Intermediate Format

The normalized intermediate format is the existing LAYOUT.md / DESIGN.md / INTERACTION.md schema — unchanged. This is the key leverage point of the 1.4 design: source reader must produce files that conform to this schema so no downstream agent needs modification.

**LAYOUT.md schema (required sections):**
```markdown
# LAYOUT: {sectionName}

## Token Quick-Reference
| Element | Token | Value |

## Component Tree
[indented ASCII]

## Annotated CSS
[CSS with var(--token-*) references and /* Figma: Xpx */ comments]
```

**For prod-clone sections, source reader maps:**
- JSX nesting structure → Component Tree
- CSS class values / inline styles → Annotated CSS with token lookups via libraryPaths
- The `/* Figma: Xpx */` comment convention adapts: source reader writes `/* prod: Xpx */` or `/* source: classname */` comments instead

**DESIGN.md schema (required sections):**
```markdown
# DESIGN: {sectionName}

## Component Mapping
| Element | Component | Variant | Props |

## Typography
| Element | Preset | Size | Weight | Line-height |

## Color Tokens
| Element | Property | Token | Value |

## Unmapped Values
| Element | Property | Raw Value | Notes |
```

**For prod-clone sections, source reader maps:**
- Imported component names + prop values → Component Mapping (exact match from libraryPaths components table)
- Typography classes / styles → Typography (matched against design-system presets)
- Color classes / CSS vars → Color Tokens (exact match) or Unmapped Values

**INTERACTION.md schema:** Already supports fallback text when no interactionContext is provided. Source reader populates from event handlers and useState patterns in the source.

---

## Agent Change Matrix

| Agent | Change Required | What Changes | What Stays Same |
|-------|----------------|--------------|-----------------|
| `decomposer.md` | Minor | Must not run for `prod-clone` or `discuss-only` modes; loupe conditionalizes dispatch (decomposer itself unchanged) | All Figma fetch + section parsing logic |
| `layout.md` | None | — | Entire file; only dispatched for `referenceType:"figma"` sections |
| `design.md` | None | — | Entire file; only dispatched for `referenceType:"figma"` sections |
| `interaction.md` | None | — | Entire file; only dispatched for `referenceType:"figma"` sections |
| `builder.md` | None | — | Reads LAYOUT.md + DESIGN.md + INTERACTION.md; doesn't care how they were produced |
| `reviewer.md` | None | — | Reads spec files + source code; doesn't care how specs were produced |
| `consolidator.md` | None | — | Union-merges section artifacts; `/* prod: */` comments instead of `/* Figma: */` are valid |
| `librarian.md` | Minor | New invocation pattern for codebase-map book; sourcePaths point to monorepo directories | Book-Type Guard, generate/update logic, LIBRARY.md update, all existing scanning |
| `source-reader.md` | NEW | Entire file | — |
| `loupe.md` | Moderate | Phase -1 mode selector; Phase 1 surface resolver for prod-clone; Phase 2 source-reader dispatch branch; libraryPaths includes codebase-map | Phase 0 library resolution; Phase 2 figma branch; Phase 3 build+review; Phase 4 consolidate |
| `SKILL.md` | None | — | All routing, Tier classification, discuss→loupe chain |
| `discuss.md` | None | — | All discussion, blueprint write logic, return status |

---

## Component Boundaries After 1.4

```
SKILL.md
    │
    ├── discuss.md                  ← unchanged
    │    └── writes blueprint/{LAYOUT|DESIGN|INTERACTION|CONTEXT}.md
    │
    └── loupe.md                    ← mode selector added to Phase -1; surface resolver added to Phase 1
         │
         ├── Phase 0: library resolution
         │    └── reads LIBRARY.md
         │         → design-system book (unchanged)
         │         → playground-conventions book (unchanged)
         │         → codebase-map book (NEW — included when mode=prod-clone)
         │
         ├── Phase 1: Decompose / Resolve
         │    ├── figma mode: decomposer.md (unchanged)
         │    ├── prod-clone mode: inline surface resolver in loupe.md (reads codebase-map book)
         │    └── discuss-only mode: sections from blueprint or inline user input
         │
         ├── Phase 2: Research (parallel per section)
         │    ├── figma sections: layout.md + design.md + interaction.md (unchanged)
         │    ├── prod-clone sections: source-reader.md (NEW, replaces trio)
         │    └── discuss-only sections: SKIP (blueprint files used directly)
         │
         ├── Phase 3: Build + Review (per section, sequential)
         │    └── builder.md + reviewer.md (unchanged — reads normalized specs)
         │
         └── Phase 4: Consolidate
              └── consolidator.md (unchanged)

library/
    ├── design-system/              ← unchanged
    ├── playground-conventions/     ← unchanged
    └── codebase-map/               ← NEW (source-derived, Librarian-managed)
         ├── routes/CHAPTER.md
         ├── shared-components/CHAPTER.md
         └── feature-modules/CHAPTER.md

agents/
    ├── source-reader.md            ← NEW
    ├── decomposer.md               ← unchanged
    ├── layout.md                   ← unchanged
    ├── design.md                   ← unchanged
    ├── interaction.md              ← unchanged
    ├── builder.md                  ← unchanged
    ├── reviewer.md                 ← unchanged
    ├── consolidator.md             ← unchanged
    └── librarian.md                ← minor: codebase-map invocation documented
```

---

## Build Order

Dependencies drive the order. The codebase-map book must exist before source-reader can use it. Source-reader must be defined before loupe.md can dispatch it. Loupe.md's mode selector can be written independently of source-reader because it just routes — it doesn't call source-reader until runtime.

**Phase A: Codebase-Map Library Book**
- Extend librarian.md to document codebase-map scanning approach (what directories to scan, how to structure routes chapter)
- Generate codebase-map book from faire/frontend monorepo
- Update LIBRARY.md

*No dependencies on source-reader or loupe changes. Can be built and validated standalone.*

**Phase B: Source Reader Agent**
- Write `agents/source-reader.md`
- Inputs: sourceFilePaths[], sectionName, blueprintPath, libraryPaths, watsonMode
- Output: .watson/sections/{name}/LAYOUT.md + DESIGN.md + INTERACTION.md in exact existing schema
- Validates against codebase-map book (Phase A must be complete)
- Can be tested standalone by manually dispatching with a known TSX file path

*Depends on: Phase A (codebase-map book for component lookup)*

**Phase C: Pipeline Generalization (loupe.md)**
- Add mode selector to Phase -1 (standalone) and integrate with SKILL.md Tier 2 dispatch
- Add surface resolver to Phase 1 for prod-clone mode (reads codebase-map book, produces sections[])
- Add source-reader dispatch branch to Phase 2
- Extend libraryPaths[] in Phase 0 to include codebase-map chapters when mode=prod-clone
- Verify discuss-only path end-to-end (Phase -1 entry → Phase 1 section list → Phase 3 builder reads blueprint)

*Depends on: Phase A (codebase-map) and Phase B (source-reader)*

**Phase D: Integration Test**
- Full pipeline run: prod-clone mode → source-reader → builder → reviewer → prototype output
- Full pipeline run: discuss-only mode → builder reads blueprint → prototype output
- Verify existing Figma mode is unaffected

*Depends on: Phases A, B, C*

---

## Architecture Patterns

### Pattern: Normalized Intermediate as Integration Seam

**What:** All design reference sources produce the same LAYOUT.md / DESIGN.md / INTERACTION.md schema before hitting the build phase. The schema is the contract.

**When to use:** Every new input mode (Figma, prod clone, screenshot, wireframe in future) should produce this normalized form. The build phase never needs to know the source.

**Why it works here:** builder.md and reviewer.md already accept `null` paths gracefully. They're stateless readers of spec files. The schema is documented in `.planning/artifact-schemas/`. Adding new producers is additive.

**Trade-off:** Source reader must be faithful to the schema even when the source doesn't map cleanly. Prod code may use components outside the Slate library (custom components, deprecated patterns). These become Unmapped Values in DESIGN.md — the same handling as Figma unmapped values. The pipeline doesn't break; it surfaces gaps.

---

### Pattern: Mode-Gated Dispatch in Orchestrator

**What:** The loupe orchestrator (loupe.md) gates which Phase 2 agents run based on `section.referenceType`. Each gate is a simple conditional, not a separate orchestration path.

**When to use:** When the same pipeline applies to multiple input modes but different research strategies are needed. The build phase is shared; only the research phase differs.

**Implementation:** In loupe.md Phase 2:
```
For each section:
  if referenceType === "figma":
    dispatch layout.md (background)
    dispatch design.md (background)
    dispatch interaction.md (background)
  else if referenceType === "prod-clone":
    dispatch source-reader.md (background)
  else if referenceType === "discuss-only":
    skip Phase 2 entirely
```

**Why not a separate pipeline file:** The phases 0, 3, and 4 are identical across modes. Extracting mode-specific Phase 2 logic into separate files would duplicate the outer pipeline and create three maintenance targets.

---

### Pattern: Inline Surface Resolver (not an agent)

**What:** The prod-clone surface resolution (route → file paths) lives as inline logic in loupe.md Phase 1, not as a dispatched agent.

**When to use:** When a task is: (a) short enough to complete in a few steps, (b) sequential (no parallelism needed), (c) requires user interaction (foreground), and (d) produces a simple structured output (sections[]).

**Why not an agent:** The decomposer is a foreground agent because it needs `AskUserQuestion` for section approval and can be complex (multiple MCP calls, heuristic logic). Surface resolution is simpler: read codebase-map book, match string, confirm with user, return paths. No MCP calls. Doesn't justify the dispatch overhead.

**If surface resolution grows:** If multiple-surface selection, partial matching, or complex disambiguation is needed, promote to a separate foreground agent (`agents/surface-resolver.md`) following the decomposer pattern.

---

## Anti-Patterns

### Anti-Pattern 1: Modifying Existing Research Agents to Accept Multiple Input Modes

**What people do:** Add `if (nodeId) { fetchFigma() } else { readFile() }` branches to layout.md and design.md.

**Why it's wrong:** Each agent has a single focused task. Layout reads Figma auto-layout. Source reader reads TSX structure. Merging them violates the separation of concerns that prevents context bloat. It also makes each agent harder to test and reason about.

**Do this instead:** New input mode → new agent (source-reader.md). Existing agents are untouched. The orchestrator (loupe.md) gates which agent runs.

---

### Anti-Pattern 2: Building Source Reader Without the Codebase-Map Book

**What people do:** Have source-reader grep the monorepo at runtime to find files for a given surface.

**Why it's wrong:** Grepping faire/frontend during a pipeline run is slow and unreliable. The monorepo is large. Grep results depend on the repo state at the moment of the run. This is exactly the problem the library system was designed to solve — preprocess reference material into structured books.

**Do this instead:** Build the codebase-map book first (Phase A). Source-reader reads the book to get file paths. The book is the stable reference; the agent is stateless.

---

### Anti-Pattern 3: Treating Discuss-Only as a Degenerate Figma Path

**What people do:** Create fake "empty Figma sections" or stub nodeIds to force discuss-only sections through the Figma research pipeline.

**Why it's wrong:** The Figma MCP calls will fail (no real node). The pipeline will retry, escalate, and produce empty spec files. It's a silent corruption path.

**Do this instead:** Use `referenceType: "discuss-only"` explicitly. loupe.md already handles this correctly in Phase 2 and Phase 3 — it reads blueprint files directly and passes them to the builder. The mode selector ensures discuss-only sections are created with the right referenceType from the start.

---

### Anti-Pattern 4: Having Source Reader Fetch Figma

**What people do:** Source reader reads prod code AND fetches the corresponding Figma frame to fill gaps.

**Why it's wrong:** This couples the prod-clone mode to Figma availability. The entire point of prod-clone is to work from code when Figma doesn't exist, is outdated, or is inaccessible.

**Do this instead:** Source reader reads only what's available: TSX code + libraryPaths books. Gaps go to Unmapped Values just as in the Figma pipeline. If the user also has a Figma frame, they can run in Figma mode instead.

---

## Integration Points

### New Agent ↔ Existing Pipeline

| Integration | Interface | Notes |
|-------------|-----------|-------|
| loupe.md Phase 2 → source-reader.md | Same dispatch contract as layout/design/interaction | sourceFilePaths[] replaces nodeId; same libraryPaths, blueprintPath, watsonMode |
| source-reader.md → builder.md | LAYOUT.md + DESIGN.md + INTERACTION.md files | Exact same schema; builder is blind to how files were produced |
| source-reader.md → reviewer.md | Same spec files | Reviewer validates spec compliance; `/* prod: */` comments are valid |
| loupe.md Phase 1 → codebase-map book | Read ${CLAUDE_PLUGIN_ROOT}/library/codebase-map/routes/CHAPTER.md | Book must exist before this path runs |

### New Book ↔ Existing Library System

| Integration | Interface | Notes |
|-------------|-----------|-------|
| Librarian → codebase-map | generate/update mode; sourcePaths point to faire/frontend | @repo prefix resolves to monorepo root; same Book-Type Guard applies |
| LIBRARY.md → codebase-map entry | Upsert pattern (same as design-system book) | loupe.md Phase 0 must be taught to include codebase-map in libraryPaths when mode=prod-clone |
| source-reader.md → codebase-map | Reads routes chapter to validate paths; reads shared-components for component lookup | Book consumed at agent runtime via libraryPaths[] |

### SKILL.md ↔ Multi-Mode Loupe

No change to SKILL.md. The Tier 2 dispatch signature already passes `fullFrameUrl: null` for non-Figma cases. loupe.md's Phase -1 mode selector handles the case where `fullFrameUrl` is null — it shows the "Reference" question. Existing Figma URL detection path is preserved.

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Pipeline seam identification | HIGH | Direct code read of loupe.md — `referenceType` field and discuss-only handling already exist |
| Source reader output schema | HIGH | Schemas are documented in artifact-schemas/; builder and reviewer are schema-agnostic |
| Codebase-map book structure | HIGH | Follows identical pattern to design-system book; Librarian already supports `@repo` prefix |
| Loupe phase changes | HIGH | Phase 2 gating and Phase 3 path routing already exists for discuss-only; extending to prod-clone is additive |
| Decomposer unchanged | HIGH | Decomposer only runs when hasFullFrame=true; loupe controls when to dispatch it |
| Builder/reviewer unchanged | HIGH | Both accept null paths; no Figma-specific logic in either agent |
| Source reader TSX parsing approach | MEDIUM | No prior art in Watson; TSX→schema mapping is novel; gaps will surface as Unmapped Values (graceful degradation) |
| Codebase-map content completeness | MEDIUM | faire/frontend route structure not directly inspected; assumes standard React Router v5 patterns |

---

## Sources

- `/Users/austindick/watson/skills/core/skills/loupe.md` — Phase 1 decomposer condition, Phase 2 referenceType gating, Phase 3 path routing for discuss-only (direct read, HIGH confidence)
- `/Users/austindick/watson/skills/core/agents/decomposer.md` — output contract, foreground requirement (direct read, HIGH confidence)
- `/Users/austindick/watson/skills/core/agents/layout.md` — Figma MCP dependency, output schema (direct read, HIGH confidence)
- `/Users/austindick/watson/skills/core/agents/design.md` — Figma MCP dependency, output schema (direct read, HIGH confidence)
- `/Users/austindick/watson/skills/core/agents/interaction.md` — Figma MCP dependency, component detection pattern (direct read, HIGH confidence)
- `/Users/austindick/watson/skills/core/agents/builder.md` — null path handling, spec file consumption (direct read, HIGH confidence)
- `/Users/austindick/watson/skills/core/agents/reviewer.md` — spec file consumption, no Figma dependency (direct read, HIGH confidence)
- `/Users/austindick/watson/skills/core/agents/librarian.md` — generate/update modes, @repo prefix, Book-Type Guard (direct read, HIGH confidence)
- `/Users/austindick/watson/skills/core/library/LIBRARY.md` — existing book inventory (direct read, HIGH confidence)
- `/Users/austindick/watson/.planning/PROJECT.md` — 1.4 feature targets, out-of-scope items, constraints (direct read, HIGH confidence)

---

*Architecture research for: Watson 1.4 — Multi-mode design reference pipeline*
*Researched: 2026-04-09*
