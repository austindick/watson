# Requirements: Watson 1.0 Foundation

**Defined:** 2026-03-28
**Core Value:** Every prototype decision is grounded in real context and traceable from idea through prototype to production spec.

## v1 Requirements

### Orchestration

- [ ] **ORCH-01**: User can invoke Watson via single `/watson` entry point with intent routing to subskills
- [ ] **ORCH-02**: Watson chains discuss → loupe automatically (CONTEXT.md handoff, suppresses duplicate prompts)
- [ ] **ORCH-03**: All user-facing messages use non-technical language (no agent names, file paths, or artifact names exposed to user)
- [ ] **ORCH-04**: Watson recognizes PDP stage context (Understand/Explore/Build/Ship) and adapts behavior accordingly
- [ ] **ORCH-05**: SKILL.md stays under 200 lines — execution logic lives in subskills and agents, not the orchestrator

### Library System

- [ ] **LIB-01**: LIBRARY.md index exists as table of contents for all books with metadata (last updated, source, chapter count)
- [ ] **LIB-02**: Book/Chapter/Page hierarchy supports both flat files and deep trees (design system has chapters; conventions is flat)
- [ ] **LIB-03**: Design system book is source-agnostic (works with FauxDS now, flips to real Slate via Librarian regeneration with zero agent edits)
- [ ] **LIB-04**: Playground conventions book documents scaffolding checklist, component conventions, design tokens, dev workflow, multi-variant patterns, and contributor registration
- [x] **LIB-05**: Librarian agent can generate a book from source files (full scan mode)
- [x] **LIB-06**: Librarian agent can update a book surgically (diff source against existing book, patch only changed entries)
- [x] **LIB-07**: Librarian auto-updates LIBRARY.md index when books are created or modified
- [x] **LIB-08**: Agents read library books exclusively — never raw source material (Librarian is the sole interface to source)

### Blueprint System

- [x] **BLUE-01**: Each prototype has a `/blueprint` directory with CONTEXT.md, LAYOUT.md, DESIGN.md, INTERACTION.md
- [x] **BLUE-02**: Blueprint files are source-agnostic (no reference to where data originated — Figma, conversation, or future clone-from-prod)
- [x] **BLUE-03**: Blueprint files persist across sessions as living references that any agent or subskill can read
- [x] **BLUE-04**: Blueprint files can be generated from Figma (via loupe pipeline) or conversation (via discuss + library books)

### Discuss Subskill

- [ ] **DISC-01**: User can invoke discuss anytime during prototyping for design thinking conversation
- [ ] **DISC-02**: Discuss reads any blueprint file to understand current prototype state before conversation
- [ ] **DISC-03**: Discuss writes surgical amendments to any blueprint file based on decisions made in conversation
- [ ] **DISC-04**: Discuss references library books (design system, playground conventions) to ground recommendations in real components and tokens
- [ ] **DISC-05**: Discuss scales depth based on prototype complexity (fewer questions for simple changes, deeper exploration for complex flows)

### Loupe Subskill

- [ ] **LOUP-01**: Figma-to-code pipeline with ported agents (decomposer, layout, design, builder, reviewer, consolidator)
- [ ] **LOUP-02**: All agents accept parameterized book paths (injected at dispatch time, never hardcoded)
- [ ] **LOUP-03**: Pipeline outputs write to prototype's `/blueprint` directory (LAYOUT.md, DESIGN.md, INTERACTION.md)
- [ ] **LOUP-04**: Agent 3 (interactions) infers states from Figma with optional interactive interview, produces INTERACTION.md
- [ ] **LOUP-05**: 3-agent parallel dispatch per section (layout + design + interactions simultaneously)
- [ ] **LOUP-06**: Section staging (`.watson/sections/`) cleaned up after consolidation to blueprint files

### Agent Architecture

- [x] **ARCH-01**: Watson agent contract spec defined before any agent is ported (input parameters, output schema, dispatch mode)
- [x] **ARCH-02**: Each agent is a self-contained `.md` file in `agents/` with no cross-references to other agents or SKILL.md
- [x] **ARCH-03**: Foreground/background classification is binary and permanent per agent (documented in contract spec)
- [x] **ARCH-04**: Schema-first artifact contracts — no agent written before its input/output schema is locked in a canonical example
- [x] **ARCH-05**: Source-agnosticism verified (agents produce correct output when design system book is swapped from FauxDS to a different source)

## Future Requirements

### Watson 1.1 — Core Workflows

- **EXPL-01**: User can invoke explore for structured solution-space research (competitive analysis, pattern mining, multi-approach generation)
- **UNDR-01**: User can invoke understand to build or ingest a PRD, producing enriched CONTEXT.md
- **INTR-01**: Agent 3 accepts pre-gathered interaction context from Watson (skips interview when discuss has already gathered context)
- **PARA-01**: Full 3-agent parallel dispatch verified with interaction context passthrough

### Watson 1.2 — Extended Capabilities

- **WRIT-01**: User can invoke write for copywriting and content design within prototypes
- **DEDC-01**: User can invoke deduce for non-technical prototype debugging (Sherlock-themed, designer-friendly language)
- **RSRCH-01**: User can invoke research for open-ended outward research at any point
- **BOOK-01**: Additional library books (design principles, business context, users/archetypes, content guidelines, research, SDD overview)

### Watson 1.3 — SDD Integration

- **SDD-01**: User can invoke prep-sdd-specs to generate and polish prd.md and frd.md for engineer handoff
- **SDD-02**: /sdd directory per prototype with prd.md and frd.md
- **SDD-03**: /resources directory per prototype (mock data, feedback, archive)
- **SDD-04**: Blueprint-to-SDD pipeline auto-updates specs as prototype evolves

### Watson 2.0 — Advanced

- **CLON-01**: User can clone an existing Faire prod experience into a prototype as design reference
- **VDIF-01**: Visual verification feedback loop (screenshot comparison against Figma reference)
- **ABST-01**: Abstracted design system support beyond FauxDS/Slate

## Out of Scope

| Feature | Reason |
|---------|--------|
| External tooling (scripts, CLIs, build tools) | Watson is purely Claude Code skill files |
| Figma MCP server setup | Already connected, not part of Watson build |
| Real Slate component migration | Playground team handles this; Watson adapts via Librarian |
| Full monorepo build integration | Watson works within prototype-playground package only |
| Engineer-facing workflows | Watson serves designers and PMs; SDD serves engineers |
| Auto-deploying prototypes | Publishing is a manual git workflow |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 1 | Complete |
| ARCH-02 | Phase 1 | Complete |
| ARCH-03 | Phase 1 | Complete |
| ARCH-04 | Phase 1 | Complete |
| ARCH-05 | Phase 1 | Complete |
| BLUE-01 | Phase 1 | Complete |
| BLUE-02 | Phase 1 | Complete |
| BLUE-03 | Phase 1 | Complete |
| BLUE-04 | Phase 1 | Complete |
| LIB-01 | Phase 2 | Pending |
| LIB-02 | Phase 2 | Pending |
| LIB-03 | Phase 2 | Pending |
| LIB-04 | Phase 2 | Pending |
| LIB-05 | Phase 2 | Complete |
| LIB-06 | Phase 2 | Complete |
| LIB-07 | Phase 2 | Complete |
| LIB-08 | Phase 2 | Complete |
| LOUP-01 | Phase 3 | Pending |
| LOUP-02 | Phase 3 | Pending |
| LOUP-03 | Phase 3 | Pending |
| LOUP-04 | Phase 3 | Pending |
| LOUP-05 | Phase 3 | Pending |
| LOUP-06 | Phase 3 | Pending |
| DISC-01 | Phase 4 | Pending |
| DISC-02 | Phase 4 | Pending |
| DISC-03 | Phase 4 | Pending |
| DISC-04 | Phase 4 | Pending |
| DISC-05 | Phase 4 | Pending |
| ORCH-01 | Phase 5 | Pending |
| ORCH-02 | Phase 5 | Pending |
| ORCH-03 | Phase 5 | Pending |
| ORCH-04 | Phase 5 | Pending |
| ORCH-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 33 total
- Mapped to phases: 33
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 — traceability populated after roadmap creation*
