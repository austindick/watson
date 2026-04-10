# Roadmap: Watson

## Milestones

- ✅ **v1.0 Loupe Pipeline** — Phases 1-5 (shipped 2026-03-26)
- ✅ **Watson 1.0 Foundation** — Phases 1-5 (shipped 2026-04-01)
- ✅ **Watson 1.1 Ambient Mode & Iteration** — Phases 6-12 (shipped 2026-04-03)
- ✅ **Watson 1.2 Plugin Deployment** — Phases 13-15 (shipped 2026-04-07)
- ✅ **Watson 1.3 User Experience & Commands** — Phases 16-21 (shipped 2026-04-10)
- 🚧 **Watson 1.4 Multi-Mode Loupe** — Phases 22-25 (in progress)

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

<details>
<summary>✅ Watson 1.0 Foundation (Phases 1-5) — SHIPPED 2026-04-01</summary>

- [x] Phase 1: Foundation Scaffold (3/3 plans) — completed 2026-03-29
- [x] Phase 2: Library System (4/4 plans) — completed 2026-03-31
- [x] Phase 3: Pipeline Agents (4/4 plans) — completed 2026-03-31
- [x] Phase 4: Discuss Subskill (2/2 plans) — completed 2026-03-31
- [x] Phase 5: Master Orchestrator (2/2 plans) — completed 2026-04-01

Full details: `milestones/Watson 1.0-ROADMAP.md`

</details>

<details>
<summary>✅ Watson 1.1 Ambient Mode & Iteration (Phases 6-12) — SHIPPED 2026-04-03</summary>

- [x] Phase 6: Ambient Activation + STATUS.md Schema (2/2 plans) — completed 2026-04-02
- [x] Phase 7: Draft/Commit Amendment Model (2/2 plans) — completed 2026-04-02
- [x] Phase 8: Session Management (2/2 plans) — completed 2026-04-03
- [x] Phase 9: Agent 3 (Interactions) (2/2 plans) — completed 2026-04-03
- [x] Phase 10: 3-Agent Parallel Dispatch (1/1 plan) — completed 2026-04-03
- [x] Phase 11: Restore DRFT-04 Review Gate + Doc Fixes (1/1 plan) — completed 2026-04-03
- [x] Phase 12: Integration Hardening + Milestone Cleanup (1/1 plan) — completed 2026-04-03

Full details: `milestones/v1.1-ROADMAP.md`

</details>

<details>
<summary>✅ Watson 1.2 Plugin Deployment (Phases 13-15) — SHIPPED 2026-04-07</summary>

- [x] Phase 13: Plugin Scaffold + Path Portability (2/2 plans) — completed 2026-04-05
- [x] Phase 14: Hook Migration + Script Bundling (1/1 plan) — completed 2026-04-05
- [x] Phase 15: Distribution + Onboarding + Validation (2/2 plans) — completed 2026-04-07

Full details: `milestones/v1.3-ROADMAP.md` (phases 13-15 archived with v1.3)

</details>

<details>
<summary>✅ Watson 1.3 User Experience & Commands (Phases 16-21) — SHIPPED 2026-04-10</summary>

- [x] Phase 16: Opt-in Activation Model (2/2 plans) — completed 2026-04-09
- [x] Phase 17: Save Blueprint Command (2/2 plans) — completed 2026-04-09
- [x] Phase 18: Recovery & Lifecycle Commands (2/2 plans) — completed 2026-04-09
- [x] Phase 19: Standalone Commands & Flexible Entry (3/3 plans) — completed 2026-04-09
- [x] Phase 20: Audit Gap Closure (1/1 plan) — completed 2026-04-09
- [x] Phase 21: Tech Debt Wiring Fixes (1/1 plan) — completed 2026-04-10

Full details: `milestones/v1.3-ROADMAP.md`

</details>

### Watson 1.4 Multi-Mode Loupe (In Progress)

**Milestone Goal:** Generalize the Loupe pipeline to accept any design reference — prod codebase, Figma frame, or discussion-based intent — so designers can clone existing experiences and PMs/engineers can prototype from ideas alone.

- [x] **Phase 22: Codebase-Map Library Book** — Librarian generates monorepo navigation reference for faire/frontend (completed 2026-04-10)
- [x] **Phase 23: Source Agents** — Surface resolver + 3 parallel source agents produce normalized pipeline artifacts from TSX (completed 2026-04-10)
- [ ] **Phase 24: Pipeline Generalization & Discussion-Only** — Loupe orchestrator supports multi-mode entry, prod-clone dispatch, and discussion-only path
- [ ] **Phase 25: Integration Testing** — All 3 modes validated end-to-end; Figma regression confirmed

## Phase Details

### Phase 22: Codebase-Map Library Book
**Goal**: The Librarian can generate a codebase-map book from faire/frontend that source agents can use to navigate the monorepo
**Depends on**: Phase 21 (v1.3 complete)
**Requirements**: CBNV-01, CBNV-02, CBNV-03
**Success Criteria** (what must be TRUE):
  1. Running Librarian in generate mode produces a codebase-map book scoped to product area entry points
  2. Each entry in the codebase-map book includes a last_verified date
  3. A user can invoke the named experience menu and select a known surface by name
**Plans:** 1/1 plans complete

Plans:
- [ ] 22-01-PLAN.md — Codebase-map scanning reference, Librarian update, seed book, and LIBRARY.md entry

### Phase 23: Source Agents
**Goal**: A surface resolver and 3 parallel source agents can read TSX files from faire/frontend and produce LAYOUT.md, DESIGN.md, and INTERACTION.md artifacts that conform to the existing pipeline schema
**Depends on**: Phase 22
**Requirements**: RSLV-01, RSLV-02, RSLV-03, RSLV-04, SLAY-01, SLAY-02, SDSG-01, SDSG-02, SINT-01, SINT-02, SINT-03
**Success Criteria** (what must be TRUE):
  1. Surface resolver reads the codebase-map book and produces a section list with verified file paths for a named experience
  2. Source layout agent reads TSX files and produces a LAYOUT.md that a human can verify matches the existing schema
  3. Source design agent reads TSX files and produces a DESIGN.md with Slate tokens and CSS variables, matching the existing schema
  4. Source interaction agent reads TSX files and produces an INTERACTION.md with a componentList[] of detected Slate components
  5. All three source agents annotate uncertain values with confidence indicators (e.g., `/* from code analysis — verify visually */`)
**Plans:** 3/3 plans complete

Plans:
- [ ] 23-01-PLAN.md — Surface resolver agent (foreground, codebase-map lookup + section decomposition)
- [ ] 23-02-PLAN.md — Source layout + source design agents (background, TSX to LAYOUT.md + DESIGN.md)
- [ ] 23-03-PLAN.md — Source interaction agent + agent-contract.md registry extension

### Phase 24: Pipeline Generalization & Discussion-Only
**Goal**: The Loupe orchestrator presents a multi-mode entry prompt, routes prod-clone sections to source agents in parallel, and supports a discussion-only build path without external reference
**Depends on**: Phase 23
**Requirements**: PIPE-01, PIPE-02, PIPE-03, PIPE-04, PIPE-05, PIPE-06, DISC-01, DISC-02, DISC-03, DISC-04
**Success Criteria** (what must be TRUE):
  1. When a user invokes /watson:loupe, they are prompted to choose: Figma frame, existing experience, or describe it — before any pipeline work begins
  2. A prod-clone build dispatches source-layout, source-design, and source-interaction agents in parallel per section (same parallelism as the Figma path)
  3. A discussion-only build produces Slate-grounded output via library books without any Figma URL or prod surface as input
  4. Builder output for discussion-only mode visibly acknowledges intent-level certainty vs reference-derived certainty
  5. A build where different sections have different referenceTypes completes without error
  6. Source agents gracefully handle a null screenshotPath with no pipeline failure
**Plans**: TBD

Plans:
- [ ] 24-01: Multi-mode entry prompt and referenceType contract extension
- [ ] 24-02: Prod-clone dispatch branch and source agent wiring in loupe.md
- [ ] 24-03: Discussion-only path and intent marker contract

### Phase 25: Integration Testing
**Goal**: All three Loupe input modes (Figma, prod-clone, discussion-only) produce correct pipeline output end-to-end; no regressions in the Figma path
**Depends on**: Phase 24
**Requirements**: (validates RSLV-01-04, SLAY-01-02, SDSG-01-02, SINT-01-03, CBNV-01-03, PIPE-01-06, DISC-01-04 end-to-end)
**Success Criteria** (what must be TRUE):
  1. An existing Figma build completes with identical output before and after the referenceType extension is applied
  2. A prod-clone build for a known faire/frontend surface produces compilable prototype code with Slate components
  3. A discussion-only build from a text description alone produces compilable prototype code grounded in Slate library books
  4. Mixed-mode sections (one Figma, one prod-clone) in a single build complete without error or routing failure
**Plans**: TBD

Plans:
- [ ] 25-01: End-to-end validation across all 3 modes + Figma regression

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-5. Loupe Pipeline | v1.0 | 10/10 | Complete | 2026-03-26 |
| 1-5. Watson Foundation | Watson 1.0 | 15/15 | Complete | 2026-04-01 |
| 6-12. Ambient Mode & Iteration | v1.1 | 11/11 | Complete | 2026-04-03 |
| 13-15. Plugin Deployment | v1.2 | 5/5 | Complete | 2026-04-07 |
| 16-21. User Experience & Commands | v1.3 | 11/11 | Complete | 2026-04-10 |
| 22. Codebase-Map Library Book | 1/1 | Complete    | 2026-04-10 | - |
| 23. Source Agents | 3/3 | Complete   | 2026-04-10 | - |
| 24. Pipeline Generalization & Discussion-Only | v1.4 | 0/3 | Not started | - |
| 25. Integration Testing | v1.4 | 0/1 | Not started | - |
