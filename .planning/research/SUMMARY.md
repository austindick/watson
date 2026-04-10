# Project Research Summary

**Project:** Watson v1.4 — Multi-Mode Design Reference Input
**Domain:** LLM agent pipeline generalization (Figma → any design reference)
**Researched:** 2026-04-09
**Confidence:** HIGH

## Executive Summary

Watson 1.4 extends the existing Loupe pipeline from Figma-only input to three input modes: Figma frame (unchanged), prod-code clone (new), and discussion-only standalone build (wire-up of partial implementation). The architectural insight driving the entire design is that the pipeline already has a clean seam — downstream agents (builder, reviewer, consolidator) are schema-agnostic consumers of LAYOUT.md and DESIGN.md files. Adding new input modes means adding new producers of those files, not modifying the downstream.

**One new agent** (source-reader), **one new library book** (codebase-map), and **targeted changes** to the loupe orchestrator. Eight existing agents require zero structural changes.

## Key Findings

### Stack Additions

- **No external deps needed.** Source-reader uses Claude Code native tools: Grep (primary — pattern extraction of component exports, Props interfaces, CSS token references, Slate imports), Read (targeted file loading + optional screenshot ingestion), Glob (monorepo orientation and file discovery).
- **No AST parser.** Claude's native TypeScript comprehension does the structural reasoning — Grep/Glob/Read are navigation tools, not parsers.
- **Codebase-map book** follows the identical Librarian pattern as the design-system book — same agent, same infrastructure, new content.
- **Screenshot support** is real but conditionally reliable. Read tool supports PNG/JPG visually. Background agent image reading uncertain. Treat as optional foreground supplement.

### Feature Table Stakes

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Multi-mode entry prompt (Phase -1) | P1 | LOW | 3-option AskUserQuestion |
| Codebase-map library book | P1 | MEDIUM | Critical path blocker for source-reader |
| Source-reader agent | P1 | HIGH | Novel TSX → schema mapping; largest net-new work |
| Loupe Phase 2 prod-clone dispatch | P1 | MEDIUM | Additive branch in existing conditional |
| Discussion-only standalone entry | P1 | LOW | Reuses existing infrastructure |
| Optional screenshot parameter | P1 | LOW | Graceful null required |

### Architecture Approach

**Normalized intermediate format** — every input mode produces the same LAYOUT.md / DESIGN.md / INTERACTION.md schema before the build phase. Mode-gated dispatch lives in the loupe orchestrator (Phase 2 conditional on `section.referenceType`).

**Agent change matrix:**

| Agent | Changes Needed |
|-------|---------------|
| source-reader.md | **NEW** — reads TSX, outputs normalized specs |
| loupe.md | **MODIFIED** — mode selector, surface resolver, dispatch branch |
| decomposer.md | None (Figma path only, still used for Figma mode) |
| layout.md | None (Figma path only) |
| design.md | None (Figma path only) |
| interaction.md | None (Figma path only) |
| builder.md | None (schema-agnostic consumer) |
| reviewer.md | None (schema-agnostic consumer) |
| consolidator.md | None (schema-agnostic consumer) |

**Data flow per mode:**
- **Figma:** Decomposer (Figma MCP) → Layout + Design + Interaction (parallel) → Builder → Reviewer → Consolidator *(unchanged)*
- **Prod-clone:** Source Reader (Grep/Read/Glob) → produces LAYOUT.md + DESIGN.md + INTERACTION.md → Builder → Reviewer → Consolidator
- **Discussion-only:** Discuss context populates blueprint specs → Builder → Reviewer → Consolidator

### Critical Pitfalls (Watch Out For)

1. **Figma regression from `referenceType` extension** — Decomposer never sets `referenceType`; a guard on it silently misroutes all Figma sections. **Prevention:** Default to `"figma"` when absent; regression test before shipping any new mode.

2. **Source-reader schema divergence** — Any deviation from LAYOUT-EXAMPLE.md / DESIGN-EXAMPLE.md breaks builder and reviewer simultaneously. **Prevention:** Schema conformance is non-negotiable; validate by running builder on source-reader output before pipeline integration.

3. **Static analysis overstates accuracy** — Conditional props, dynamic styles, and context-driven props are invisible to code analysis. **Prevention:** Source-reader annotates uncertainty; `/* from code analysis */` comments propagate to builder.

4. **Discussion-only mode has no external anchor** — Discuss-generated specs represent intent, not validated reference. **Prevention:** Cross-agent marker contract (discuss marks specs as intent-level; builder trusts them less).

5. **Codebase-map book scope creep** — Full monorepo scan produces unmaintainable book. **Prevention:** Scope to product area entry points; per-entry `last_verified` dates; source-reader verifies paths before following.

6. **Interaction agent double Figma dependency** — Uses Figma MCP for component identification; in code mode Tier 1 is always empty without nodeId. **Prevention:** Source-reader outputs `componentList[]`; interaction agent uses it when present.

## Suggested Build Order

| Phase | Focus | Rationale |
|-------|-------|-----------|
| 1 | Codebase-Map Library Book | Critical path blocker; no dependencies of its own |
| 2 | Source Reader Agent | Core new capability; depends on Phase 1; novel spec design |
| 3 | Pipeline Generalization (loupe.md) | Depends on Phases 1+2; all changes additive; gated by Figma regression test |
| 4 | Integration Testing | End-to-end validation of all 3 modes |

## Research Flags

- **Phase 2 needs deeper specification:** TSX → schema mapping is novel. Grep patterns, import traversal depth, uncertainty annotations, componentList structure must be pre-specified.
- **Phases 1, 3, 4:** Standard patterns, skip research-phase.

## Gaps to Address

- **faire/frontend route structure:** Inspect before Phase 1 to determine product areas to index
- **Screenshot in background agents:** MEDIUM confidence; source-reader must handle null gracefully
- **Interaction agent componentList contract:** Matched-pair spec with source-reader

---
*Research completed: 2026-04-09*
*Ready for roadmap: yes*
