# Roadmap: Watson

## Milestones

- ✅ **v1.0 Loupe Pipeline** — Phases 1-5 (shipped 2026-03-26)
- 🚧 **Watson 1.0 Foundation** — Phases 1-5 (in progress)

## Phases

<details>
<summary>✅ v1.0 Loupe Pipeline (Phases 1-5) — SHIPPED 2026-03-26</summary>

- [x] Phase 1: Scaffold (1/1 plans) — completed 2026-03-25
- [x] Phase 2: Decomposer (1/1 plans) — completed 2026-03-25
- [x] Phase 3: Research Agents (2/2 plans) — completed 2026-03-25
- [x] Phase 4: Builder and Reviewer (3/3 plans) — completed 2026-03-26
- [x] Phase 5: Orchestration and Consolidator (3/3 plans) — completed 2026-03-26

Full details: `milestones/v1.0-ROADMAP.md`

</details>

### 🚧 Watson 1.0 Foundation (In Progress)

**Milestone Goal:** Replace watson-lite and standalone Loupe with a unified Watson skill — master orchestrator, library system, blueprint system, ported pipeline agents, and discuss and loupe subskills all wired through a thin-router SKILL.md.

- [ ] **Phase 1: Foundation Scaffold** - Directory structure, artifact schemas, agent contract spec, blueprint file templates
- [ ] **Phase 2: Library System** - Librarian agent, design system book, playground conventions book, LIBRARY.md index
- [ ] **Phase 3: Pipeline Agents** - All 7 Loupe agents ported to Watson contract, source-agnostic, schema-verified
- [ ] **Phase 4: Discuss Subskill** - Design thinking conversation, blueprint reads/writes, library book grounding, loupe handoff
- [ ] **Phase 5: Master Orchestrator** - SKILL.md thin router, intent classification, subskill dispatch, end-to-end wiring

## Phase Details

### Phase 1: Foundation Scaffold
**Goal**: The watson/ directory exists with locked schemas and a complete agent contract spec — every subsequent phase has a known target structure to build into
**Depends on**: Nothing (first Watson 1.0 phase)
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, BLUE-01, BLUE-02, BLUE-03, BLUE-04
**Plans:** 1/3 plans executed
**Success Criteria** (what must be TRUE):
  1. Watson agent contract spec exists and enumerates every input parameter, output path convention, and flag name any agent will use
  2. Canonical artifact schema examples exist for LAYOUT.md, DESIGN.md, INTERACTION.md, and CONTEXT.md — each is a filled-in example, not a prose description
  3. Blueprint directory structure is defined and a fresh prototype directory can be initialized with the correct four-file scaffold
  4. Directory skeleton at ~/.claude/skills/watson/ is present with agents/, skills/, library/, utilities/, and references/artifact-schemas/ all in place
  5. Source-agnosticism constraint is documented and verifiable — swapping the design system book requires zero agent file edits

Plans:
- [ ] 01-01-PLAN.md — watson/ directory skeleton and file structure
- [ ] 01-02-PLAN.md — Artifact schemas (CONTEXT, LAYOUT, DESIGN, INTERACTION examples)
- [ ] 01-03-PLAN.md — Agent contract spec, book schema, and watson-init utility

### Phase 2: Library System
**Goal**: The Librarian agent can generate and update structured library books, and at least two books (design system, playground conventions) are populated and indexed in LIBRARY.md
**Depends on**: Phase 1
**Requirements**: LIB-01, LIB-02, LIB-03, LIB-04, LIB-05, LIB-06, LIB-07, LIB-08
**Success Criteria** (what must be TRUE):
  1. Running Librarian in generate mode against FauxDS source files produces a structured design system book that agents can read instead of raw source material
  2. Running Librarian in update mode patches only changed entries without overwriting the rest of the existing book
  3. LIBRARY.md index is updated automatically at the end of every Librarian run, with accurate last-updated timestamps and chapter counts
  4. The playground conventions book documents all scaffolding, component conventions, design tokens, dev workflow, multi-variant patterns, and contributor registration
  5. An agent given a libraryPath parameter reads a book file and produces correct output — it never touches a source file directly

Plans:
- [ ] 02-01: Librarian agent (generate mode)
- [ ] 02-02: Librarian agent (update mode) and LIBRARY.md auto-update
- [ ] 02-03: Design system book generation from FauxDS source
- [ ] 02-04: Playground conventions book

### Phase 3: Pipeline Agents
**Goal**: All seven pipeline agents exist in watson/agents/, conform to the Watson agent contract, produce schema-valid artifacts, and contain zero FauxDS-specific hardcoding
**Depends on**: Phase 2
**Requirements**: LOUP-01, LOUP-02, LOUP-03, LOUP-04, LOUP-05, LOUP-06
**Success Criteria** (what must be TRUE):
  1. Each agent accepts Watson contract parameters (blueprintPath, libraryPath, sectionName) and writes output to the prototype's /blueprint directory
  2. Agents 01, 02, and 03 dispatched in parallel produce three simultaneous outputs — wall-clock timing confirms concurrent execution, not sequential serialization
  3. Agent 03 (Interactions) infers states from Figma data with an optional interactive interview before producing INTERACTION.md
  4. Agent 06 (Consolidator) cleans up .watson/sections/ staging files after merging all section artifacts into blueprint files
  5. Swapping the library book from FauxDS to a minimal Slate fixture produces different token and component output from every agent without any agent file edits

Plans:
- [ ] 03-01: Pre-port audit (document exact Watson contract diffs from current Loupe agent files)
- [ ] 03-02: Agents 00 and 01 port (Decomposer, Layout)
- [ ] 03-03: Agents 02 and 03 port (Design/Tokens, Interactions)
- [ ] 03-04: Agents 04, 05, and 06 port (Builder, Reviewer, Consolidator)

### Phase 4: Discuss Subskill
**Goal**: The discuss subskill gives users a design thinking conversation partner at any stage, reads and writes blueprint files grounded in library books, and chains to loupe when the user is ready to build
**Depends on**: Phase 1 (blueprint schema), Phase 2 (library books)
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04, DISC-05
**Success Criteria** (what must be TRUE):
  1. A user can invoke discuss at any point during prototyping and receive design thinking conversation grounded in library books, without needing to know any Watson internals
  2. Discuss reads any existing blueprint file to understand the current prototype state before opening the conversation
  3. Discuss writes surgical amendments to blueprint files based on conversation decisions — existing content is preserved, only changed sections are updated
  4. Complex prototype discussions ask more questions and explore more depth; simple change requests proceed quickly without extended exploration
  5. After a discuss session the handoff to loupe works: CONTEXT.md is populated and loupe does not re-prompt for information already gathered

Plans:
- [ ] 04-01: discuss subskill core (complexity scaling, library grounding)
- [ ] 04-02: Blueprint read/write and loupe handoff wiring

### Phase 5: Master Orchestrator
**Goal**: Watson is a single entry point that routes to the right subskill based on user intent, stays under 200 lines, and works end-to-end from a fresh invocation through discuss and loupe to a built prototype
**Depends on**: Phase 3, Phase 4
**Requirements**: ORCH-01, ORCH-02, ORCH-03, ORCH-04, ORCH-05
**Success Criteria** (what must be TRUE):
  1. Typing /watson with any design intent routes to the correct subskill — the user never needs to know subskill names or internal architecture
  2. Watson automatically chains discuss to loupe (CONTEXT.md handoff) and suppresses duplicate prompts — the user is never asked the same question twice
  3. All user-facing messages use designer/PM language — no agent names, file paths, artifact names, or technical error messages are ever visible to the user
  4. SKILL.md is at or under 200 lines and contains no file reads, MCP calls, or agent dispatch sequences — all execution logic lives in subskills
  5. An end-to-end run on a real Figma frame completes without errors: /watson → discuss → loupe → built prototype code in the Playground

Plans:
- [ ] 05-01: SKILL.md intent classification and routing
- [ ] 05-02: End-to-end integration and design language audit

## Progress

**Execution Order:**
1 → 2 → 3 → 4 → 5
(Phase 4 depends only on Phases 1 and 2, so it can run parallel with Phase 3 — both must complete before Phase 5.)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation Scaffold | 1/3 | In Progress|  | - |
| 2. Library System | Watson 1.0 | 0/4 | Not started | - |
| 3. Pipeline Agents | Watson 1.0 | 0/4 | Not started | - |
| 4. Discuss Subskill | Watson 1.0 | 0/2 | Not started | - |
| 5. Master Orchestrator | Watson 1.0 | 0/2 | Not started | - |
