# Roadmap: Watson

## Milestones

- ✅ **v1.0 Loupe Pipeline** — Phases 1-5 (shipped 2026-03-26)
- ✅ **Watson 1.0 Foundation** — Phases 1-5 (shipped 2026-04-01)
- ✅ **Watson 1.1 Ambient Mode & Iteration** — Phases 6-12 (shipped 2026-04-03)
- ✅ **Watson 1.2 Plugin Deployment** — Phases 13-15 (shipped 2026-04-07)
- ✅ **Watson 1.3 User Experience & Commands** — Phases 16-21 (shipped 2026-04-10)
- ✅ **Watson 1.4 Multi-Mode Loupe** — Phases 22-25 (shipped 2026-04-13)
- 🚧 **v1.5 Design Toolkit** — Phases 26-32 (in progress)

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

<details>
<summary>✅ Watson 1.4 Multi-Mode Loupe (Phases 22-25) — SHIPPED 2026-04-13</summary>

- [x] Phase 22: Codebase-Map Library Book (1/1 plan) — completed 2026-04-10
- [x] Phase 23: Source Agents (3/3 plans) — completed 2026-04-10
- [x] Phase 24: Pipeline Generalization & Discussion-Only (3/3 plans) — completed 2026-04-11
- [x] Phase 25: Integration Testing (2/2 plans) — completed 2026-04-13

Full details: `milestones/v1.4-ROADMAP.md`

</details>

### v1.5 Design Toolkit (In Progress)

**Milestone Goal:** Decompose Watson into independent, standalone skills (`/play`, `/think`, `/design`, `/save`) packaged as a "Design Toolkit" plugin. Preserves the blueprint and library systems while removing the orchestration layer and hardening the build pipeline.

- [x] **Phase 26: Plugin Scaffold** - Establish Design Toolkit plugin manifest, shared library, Librarian, blueprint contract, and rebrand (completed 2026-04-14)
- [x] **Phase 27: /play Skill** - Extract session management as standalone `/play` skill with branch/blueprint lifecycle (completed 2026-04-14)
- [x] **Phase 28: /think Skill** - Extract design thinking as standalone `/think` skill with file refactor (completed 2026-04-14)
- [x] **Phase 29: /design Extraction** - Port all 12 agents and basic pipeline as standalone `/design` skill (completed 2026-04-14)
- [ ] **Phase 30: /design Hardening** - Add page-container, reviewer tightening, token compliance, convergent loop, section rebuild, and verification gate
- [ ] **Phase 31: /save Skill** - Build checkpoint utility skill for session state preservation
- [ ] **Phase 32: Integration Testing** - Validate all 4 skills work standalone and together via blueprint contract

## Phase Details

### Phase 26: Plugin Scaffold
**Goal**: Design Toolkit plugin exists as a clean foundation — manifest registered, shared library in place, Librarian accessible, blueprint contract authoritative, and Watson branding gone
**Depends on**: Nothing (first phase of v1.5)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, INFRA-06
**Success Criteria** (what must be TRUE):
  1. Running `/play`, `/think`, `/design`, or `/save` resolves to a registered Design Toolkit command (not a Watson command)
  2. Library books (design-system, playground-conventions, codebase-map) are at plugin level and readable by any skill
  3. Librarian agent is accessible as a shared utility — any skill can invoke it without duplicating its file
  4. Blueprint template files define explicit lifecycle rules (overwrite vs append-only, required frontmatter, amendment protocol) rather than being informal examples
  5. No Watson-branded strings appear in any user-facing output, folder names, branch prefixes, or status files
**Plans**: 3 plans
Plans:
- [ ] 26-01-PLAN.md — Plugin manifest + library promotion + shared Librarian
- [ ] 26-02-PLAN.md — Blueprint contract schemas with lifecycle rules
- [ ] 26-03-PLAN.md — Watson branding removal + skill SKILL.md stubs

### Phase 27: /play Skill
**Goal**: Users can manage prototype sessions entirely through `/play` — forking new branches, continuing existing work, and maintaining STATUS.md — independent of any other skill
**Depends on**: Phase 26
**Requirements**: PLAY-01, PLAY-02, PLAY-03, PLAY-04, PLAY-05, PLAY-06
**Success Criteria** (what must be TRUE):
  1. User can run `/play` to start a guided fork that asks new vs. continue, with no other skill or context required
  2. New prototype flow creates a branch (with user confirmation) and scaffolds an empty blueprint directory
  3. Continue flow lists active branches and restores session context from blueprint + STATUS.md files
  4. User can pass a branch name, Playground URL, or directory path to continue without navigating a menu
  5. STATUS.md is created or updated at every lifecycle event (new, continue, cleanup, save)
**Plans**: 2 plans
Plans:
- [ ] 27-01-PLAN.md — Write full /play SKILL.md + port session-init and resume references
- [ ] 27-02-PLAN.md — Slim core SKILL.md by removing extracted session management

### Phase 28: /think Skill
**Goal**: Users can run `/think` as a standalone design thinking partner grounded in library books, with decisions persisted to the PRD, independently of `/play` or `/design`
**Depends on**: Phase 26
**Requirements**: THINK-01, THINK-02, THINK-03, THINK-04, THINK-05, THINK-06
**Success Criteria** (what must be TRUE):
  1. User can invoke `/think` with no prior session — it works without an active branch or blueprint
  2. Recommendations reference library books (design-system, playground-conventions) — not generic advice
  3. Simple requests skip deep exploration; complex requests get multi-step design thinking
  4. All decisions are written back to the PRD (the living context document) with [PENDING]/[COMMITTED] amendment tracking
  5. SKILL.md is under 100 lines, with questioning flow, blueprint writing, and mid-build behavior in separate reference files
**Plans**: 2 plans
Plans:
- [ ] 28-01-PLAN.md — Write full /think skill + reference files (questioning-flow, blueprint-writing, mid-build)
- [ ] 28-02-PLAN.md — Update core SKILL.md routing to dispatch /think + verify separation

### Phase 29: /design Extraction
**Goal**: Users can run `/design` as a standalone build pipeline — all 12 agents ported, 3-mode entry working, blueprint files written — independent of Watson or Loupe
**Depends on**: Phase 26
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-11, DSGN-12
**Success Criteria** (what must be TRUE):
  1. User can invoke `/design` with no prior Watson session — it works with a Figma URL, prod reference, or text description alone
  2. All 12 agents (8 Figma pipeline + 4 source agents) run under the `/design` skill context with no references to Watson or Loupe
  3. LAYOUT.md, DESIGN.md, and INTERACTION.md are written per section and consolidated to the blueprint directory
  4. When a PRD exists from a `/think` session, `/design` reads and incorporates it; when absent, it proceeds without error
**Plans**: 2 plans
Plans:
- [ ] 29-01-PLAN.md — Port loupe.md pipeline to standalone /design SKILL.md
- [ ] 29-02-PLAN.md — Update core SKILL.md routing to dispatch /design skill

### Phase 30: /design Hardening
**Goal**: The `/design` pipeline produces pixel-accurate, token-compliant output with reliable convergence — page-level layout is handled correctly, the reviewer checks token mapping not just names, and the builder enforces token resolution for novel compositions
**Depends on**: Phase 29
**Requirements**: DSGN-04, DSGN-05, DSGN-06, DSGN-07, DSGN-08, DSGN-09, DSGN-10, DSGN-13
**Success Criteria** (what must be TRUE):
  1. Decomposer emits a `page-container` section as the first section; layout agent extracts only container-level properties for it; builder wraps child sections in an insertion-region structure
  2. Reviewer output cites the specific token value from LAYOUT.md annotated CSS when flagging a property mismatch — not just the token name
  3. Builder resolves all CSS properties through the token system for novel compositions (no raw hex or magic numbers) even when no direct Figma match exists
  4. Builder-reviewer loop terminates when output matches spec or after 3 iterations, with a structured property diff between passes (not prose description)
  5. User can target a single section for rebuild — decomposition is skipped, only the specified section reruns the pipeline
  6. After consolidation, a type-check and dev-server verification run automatically, with up to 2 auto-fix attempts and designer-friendly error output on failure
**Plans**: 3 plans
Plans:
- [ ] 30-01-PLAN.md — Page-container pipeline (decomposer + layout + builder + library chapter)
- [ ] 30-02-PLAN.md — Reviewer tightening + builder token compliance
- [ ] 30-03-PLAN.md — Convergent loop + section rebuild + verification gate

### Phase 31: /save Skill
**Goal**: Users can run `/save` at any point to checkpoint their session — decisions written to blueprint files, branch committed with a descriptive message, STATUS.md updated for restoration
**Depends on**: Phase 26
**Requirements**: SAVE-01, SAVE-02, SAVE-03, SAVE-04
**Success Criteria** (what must be TRUE):
  1. User can run `/save` at any point during a session and receive confirmation that state was captured
  2. Current conversation context and decisions are written to relevant blueprint files (PRD, LAYOUT.md, DESIGN.md, INTERACTION.md as applicable)
  3. A git commit is created on the current branch with a message summarizing session progress
  4. STATUS.md is updated with a snapshot sufficient for `/play continue` to fully restore the session
**Plans**: TBD

### Phase 32: Integration Testing
**Goal**: All four skills work together via the shared blueprint contract — a user can run `/play` → `/think` → `/design` → `/save` as a continuous workflow, and each skill also works in isolation
**Depends on**: Phase 27, Phase 28, Phase 29, Phase 30, Phase 31
**Requirements**: None (validation phase)
**Success Criteria** (what must be TRUE):
  1. Full workflow runs end-to-end: `/play` forks branch → `/think` enriches PRD with design decisions → `/design` reads PRD and builds → `/save` commits with status snapshot
  2. Each skill works independently — `/design` with only a Figma URL, `/think` with no existing session, `/save` without a prior `/play` session
  3. Blueprint files written by one skill are correctly read and extended by subsequent skills — no field conflicts, no overwrite of append-only sections
  4. No Watson or Loupe branding appears anywhere in any skill's output during the full workflow
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-5. Loupe Pipeline | v1.0 | 10/10 | Complete | 2026-03-26 |
| 1-5. Watson Foundation | Watson 1.0 | 15/15 | Complete | 2026-04-01 |
| 6-12. Ambient Mode & Iteration | v1.1 | 11/11 | Complete | 2026-04-03 |
| 13-15. Plugin Deployment | v1.2 | 5/5 | Complete | 2026-04-07 |
| 16-21. User Experience & Commands | v1.3 | 11/11 | Complete | 2026-04-10 |
| 22-25. Multi-Mode Loupe | v1.4 | 9/9 | Complete | 2026-04-13 |
| 26. Plugin Scaffold | 3/3 | Complete    | 2026-04-14 | - |
| 27. /play Skill | 2/2 | Complete    | 2026-04-14 | - |
| 28. /think Skill | 2/2 | Complete    | 2026-04-14 | - |
| 29. /design Extraction | 2/2 | Complete    | 2026-04-14 | - |
| 30. /design Hardening | 2/3 | In Progress|  | - |
| 31. /save Skill | v1.5 | 0/TBD | Not started | - |
| 32. Integration Testing | v1.5 | 0/TBD | Not started | - |
