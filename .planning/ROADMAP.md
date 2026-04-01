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

- [x] **Phase 1: Foundation Scaffold** - Directory structure, artifact schemas, agent contract spec, blueprint file templates (completed 2026-03-29)
- [x] **Phase 2: Library System** - Librarian agent, design system book, playground conventions book, LIBRARY.md index (completed 2026-03-31)
- [ ] **Phase 3: Pipeline Agents** - All 7 Loupe agents ported to Watson contract, source-agnostic, library-book-driven
- [ ] **Phase 4: Discuss Subskill** - Design thinking conversation, blueprint reads/writes, library book grounding, loupe handoff
- [x] **Phase 5: Master Orchestrator** - SKILL.md thin router, intent classification, subskill dispatch, end-to-end wiring (completed 2026-04-01)

## Phase Details

### Phase 1: Foundation Scaffold
**Goal**: The watson/ directory exists with locked schemas and a complete agent contract spec — every subsequent phase has a known target structure to build into
**Depends on**: Nothing (first Watson 1.0 phase)
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, BLUE-01, BLUE-02, BLUE-03, BLUE-04
**Plans:** 3/3 plans complete
**Success Criteria** (what must be TRUE):
  1. Watson agent contract spec exists and enumerates every input parameter, output path convention, and flag name any agent will use
  2. Canonical artifact schema examples exist for LAYOUT.md, DESIGN.md, INTERACTION.md, and CONTEXT.md — each is a filled-in example, not a prose description
  3. Blueprint directory structure is defined and a fresh prototype directory can be initialized with the correct four-file scaffold
  4. Directory skeleton at ~/.claude/skills/watson/ is present with agents/, skills/, library/, utilities/, and references/artifact-schemas/ all in place
  5. Source-agnosticism constraint is documented and verifiable — swapping the design system book requires zero agent file edits

Plans:
- [x] 01-01-PLAN.md — watson/ directory skeleton and file structure
- [x] 01-02-PLAN.md — Artifact schemas (CONTEXT, LAYOUT, DESIGN, INTERACTION examples)
- [x] 01-03-PLAN.md — Agent contract spec, book schema, and watson-init utility

### Phase 2: Library System
**Goal**: The Librarian agent can generate and update structured library books, and at least two books (design system, playground conventions) are populated and indexed in LIBRARY.md
**Depends on**: Phase 1
**Requirements**: LIB-01, LIB-02, LIB-03, LIB-04, LIB-05, LIB-06, LIB-07, LIB-08
**Plans:** 3/4 plans executed
**Success Criteria** (what must be TRUE):
  1. Running Librarian in generate mode against FauxDS source files produces a structured design system book that agents can read instead of raw source material
  2. Running Librarian in update mode patches only changed entries without overwriting the rest of the existing book
  3. LIBRARY.md index is updated automatically at the end of every Librarian run, with accurate last-updated timestamps and chapter counts
  4. The playground conventions book documents all scaffolding, component conventions, design tokens, dev workflow, multi-variant patterns, and contributor registration
  5. An agent given a libraryPath parameter reads a book file and produces correct output — it never touches a source file directly

Plans:
- [ ] 02-01-PLAN.md — Librarian agent (generate mode), agent contract libraryPaths update, LIBRARY.md schema
- [ ] 02-02-PLAN.md — Design system book generation from FauxDS source
- [ ] 02-03-PLAN.md — Librarian agent (update mode) and LIBRARY.md auto-update
- [ ] 02-04-PLAN.md — Playground conventions book and plugin manifest

### Phase 3: Pipeline Agents
**Goal**: All seven pipeline agents exist in watson/agents/, conform to the Watson agent contract, consume library books via pre-resolved libraryPaths[], and contain zero FauxDS-specific hardcoding
**Depends on**: Phase 2
**Requirements**: LOUP-01, LOUP-02, LOUP-03, LOUP-04, LOUP-05, LOUP-06
**Plans:** 3/4 plans executed
**Success Criteria** (what must be TRUE):
  1. Each agent accepts Watson contract parameters (blueprintPath, libraryPaths[], sectionName) and writes output to .watson/sections/ staging paths
  2. Each agent reads pre-resolved chapter/page paths from libraryPaths[] — no agent navigates LIBRARY.md or BOOK.md
  3. Agent 03 (Interactions) exists as a documented placeholder noting deferral to post-v1 (per Phase 3 CONTEXT.md locked decision)
  4. Agent 06 (Consolidator) cleans up .watson/sections/ staging files after merging all section artifacts into blueprint files
  5. Swapping the library book chapters produces different token and component output from every agent without any agent file edits

Plans:
- [ ] 03-01-PLAN.md — Port all 7 agents to Watson contract (decomposer, layout, design, interaction placeholder, builder, reviewer, consolidator)
- [ ] 03-02-PLAN.md — Integration smoke test with real Figma frame (library book consumption + parallel dispatch + human verification)
- [ ] 03-03-PLAN.md — Fix MCP tool names in decomposer, layout, and design agents (gap closure)
- [ ] 03-04-PLAN.md — Test MCP passthrough to subagents and update requirement statuses (gap closure)

### Phase 4: Discuss Subskill
**Goal**: The discuss subskill gives users a design thinking conversation partner at any stage, writes decisions to blueprint files grounded in library books, and chains to loupe with a clean CONTEXT.md handoff
**Depends on**: Phase 1 (blueprint schema), Phase 2 (library books)
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04, DISC-05
**Plans:** 1/2 plans executed
**Note**: Can run in parallel with Phase 3 — no dependency on ported agents. Both must complete before Phase 5.
**Success Criteria** (what must be TRUE):
  1. A user can invoke discuss at any point during prototyping and receive design thinking conversation grounded in library books, without needing to know any Watson internals
  2. Discuss reads any existing blueprint file to understand the current prototype state before opening the conversation
  3. Discuss writes decisions to CONTEXT.md (and amends LAYOUT.md/DESIGN.md/INTERACTION.md when relevant) — decisions persist beyond the conversation session
  4. Complex prototype discussions ask more questions and explore more depth; simple change requests proceed quickly without extended exploration. Preserves watson-lite's proven UX: AskUserQuestion discipline, complexity scaling, gentle challenges, pattern research
  5. After a discuss session the handoff to loupe works: CONTEXT.md is populated and loupe does not re-prompt for information already gathered. Library grounding means component/token suggestions reference real book data, not generic names

Plans:
- [ ] 04-01: discuss subskill core — port watson-lite's proven patterns (AskUserQuestion rules, complexity scaling, gentle challenges, core/contextual questions, pattern research), add library grounding and blueprint reading
- [ ] 04-02: Blueprint write logic (CONTEXT.md output, surgical amendments to existing blueprints) + loupe handoff (CONTEXT.md interface contract, duplicate-question suppression)

### Phase 5: Master Orchestrator
**Goal**: Watson is a single entry point that routes to the right subskill based on user intent, stays under ~200 lines, and works end-to-end from a fresh invocation through discuss and loupe to a built prototype
**Depends on**: Phase 3, Phase 4
**Requirements**: ORCH-01, ORCH-02, ORCH-03, ORCH-04, ORCH-05
**Plans:** 2/2 plans complete
**Success Criteria** (what must be TRUE):
  1. Typing /watson with any design intent routes to the correct subskill — the user never needs to know subskill names or internal architecture
  2. Watson automatically chains discuss to loupe (CONTEXT.md handoff) and suppresses duplicate prompts — the user is never asked the same question twice
  3. All user-facing messages use designer/PM language — no agent names, file paths, artifact names, or technical error messages are ever visible to the user
  4. SKILL.md is ~200 lines (target, not hard cap) and contains no file reads, MCP calls, or agent dispatch sequences — all execution logic lives in subskills. The constraint ensures architectural discipline, not a precise line count
  5. An end-to-end run on a real Figma frame completes without errors: /watson → discuss → loupe → built prototype code in the Playground

Plans:
- [ ] 05-01-PLAN.md — SKILL.md intent router + loupe.md pipeline orchestrator (setup detection, three-tier classification, discuss-to-loupe chain, agent wiring)
- [ ] 05-02-PLAN.md — End-to-end integration test and designer-language audit on real Figma frame

## Progress

**Execution Order:**
1 → 2 → 3 + 4 (parallel) → 5
Phase 4 depends only on Phases 1 and 2, so it runs parallel with Phase 3. Both must complete before Phase 5.

| Phase | Milestone | Plans | Status | Completed |
|-------|-----------|-------|--------|-----------|
| 1. Foundation Scaffold | Watson 1.0 | 3/3 | Complete | 2026-03-29 |
| 2. Library System | Watson 1.0 | 4/4 | Complete | 2026-03-31 |
| 3. Pipeline Agents | 3/4 | In Progress|  | - |
| 4. Discuss Subskill | 1/2 | In Progress|  | - |
| 5. Master Orchestrator | 2/2 | Complete   | 2026-04-01 | - |
