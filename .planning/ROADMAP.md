# Roadmap: Watson

## Milestones

- ✅ **v1.0 Loupe Pipeline** — Phases 1-5 (shipped 2026-03-26)
- ✅ **Watson 1.0 Foundation** — Phases 1-5 (shipped 2026-04-01)
- 🚧 **Watson 1.1 Ambient Mode & Iteration** — Phases 6-10 (in progress)

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

### 🚧 Watson 1.1 Ambient Mode & Iteration (In Progress)

**Milestone Goal:** Make Watson feel native to the Prototype Playground — activate automatically, support iterative draft/commit workflows, manage sessions, and unlock interaction-aware prototyping with Agent 3 and 3-agent parallel dispatch.

- [x] **Phase 6: Ambient Activation + STATUS.md Schema** - Watson activates automatically in prototype directories and initializes a per-prototype state file (gap closure in progress) (completed 2026-04-02)
- [x] **Phase 7: Draft/Commit Amendment Model** - Blueprint amendments default to pending; explicit commit gate locks them in (completed 2026-04-02)
- [x] **Phase 8: Session Management** - Watson creates and switches git branches for prototype sessions with user confirmation (completed 2026-04-03)
- [x] **Phase 9: Agent 3 (Interactions)** - Interaction agent structures discuss context and library defaults into INTERACTION.md per section (completed 2026-04-03)
- [x] **Phase 10: 3-Agent Parallel Dispatch** - loupe.md dispatches layout, design, and interaction agents simultaneously per section (completed 2026-04-03)
- [ ] **Phase 11: Restore DRFT-04 Review Gate + Doc Fixes** - Restore dropped amendment review gate in SKILL.md Path B and fix documentation mismatches (gap closure)

## Phase Details

### Phase 6: Ambient Activation + STATUS.md Schema
**Goal**: Watson is always-on in prototype directories — no /watson prefix required, and every prototype has a per-prototype state file that downstream phases will read and write
**Depends on**: Phase 5 (Watson 1.0 master orchestrator)
**Requirements**: AMBI-01, AMBI-02, AMBI-03
**Success Criteria** (what must be TRUE):
  1. Opening any prototype file in the Playground triggers Watson without the user typing /watson
  2. Watson correctly identifies new vs. returning prototypes without asking the user
  3. Returning to an existing prototype shows a 2-3 line summary (prototype name, built sections, pending decisions) before asking what to do
  4. blueprint/STATUS.md is created on new prototype setup with a defined schema consumed by all downstream phases
**Plans**: 2 plans

Plans:
- [x] 06-01-PLAN.md — STATUS.md schema (watson-init + artifact schema) and Activation section (blueprint gate, Tier 0, STATUS.md routing)
- [ ] 06-02-PLAN.md — Gap closure: ambient trigger via path-specific rule (decoupled from SKILL.md frontmatter to preserve /watson slash command)

### Phase 7: Draft/Commit Amendment Model
**Goal**: Blueprint amendments are explicitly pending until the user confirms — no design decision is silently locked in, and every session start surfaces unfinished work
**Depends on**: Phase 6 (STATUS.md schema must exist)
**Requirements**: DRFT-01, DRFT-02, DRFT-03, DRFT-04
**Success Criteria** (what must be TRUE):
  1. After a discuss session with design decisions, amendments appear as pending in blueprint/STATUS.md rather than committed
  2. When the user reaches the "Ready?" confirmation gate, Watson shows a plain-language diff of which decisions will be locked in
  3. Starting a new session after previous pending amendments surfaces those amendments before asking what to do next
  4. A committed amendment cannot be re-staged as pending (one-way lock)
**Plans**: 2 plans

Plans:
- [ ] 07-01-PLAN.md — [PENDING] amendment writes in discuss.md + commit gate diff + commit-all sequence + STATUS.md drafts management
- [ ] 07-02-PLAN.md — Session-start pending surfacing in SKILL.md + soft build warning + builder.md [COMMITTED]-only filter

### Phase 8: Session Management
**Goal**: Watson manages prototype git branches on behalf of the user — new prototypes get a dedicated branch, returning sessions switch to the right branch, and orphaned branches are surfaced for cleanup
**Depends on**: Phase 7 (session start must surface pending amendments, which requires draft/commit model)
**Requirements**: SESS-01, SESS-02, SESS-03, SESS-04
**Success Criteria** (what must be TRUE):
  1. Starting a new prototype session presents the user with a confirmation step before creating a watson/{prototype-slug} git branch
  2. Returning to an existing prototype presents the user with a confirmation step before switching to the matching branch
  3. All Watson branches follow the watson/{prototype-slug} naming convention without exception
  4. At new session start, Watson lists inactive Watson branches and offers to delete them (with user confirmation)
**Plans**: 2 plans

Plans:
- [ ] 08-01-PLAN.md — 2-path fork routing (replaces blueprint gate), watson-init branch creation, branch conflict/collaboration handling, status line branch display
- [ ] 08-02-PLAN.md — Session history lifecycle: action tracking in subskills, SessionEnd hook extension, /watson off session write, loupe push-on-first-build

### Phase 9: Agent 3 (Interactions)
**Goal**: A fully implemented interaction agent structures discuss-provided context and augments with library component defaults, producing INTERACTION.md output per section that the builder can consume — no Figma variant inference
**Depends on**: Phase 6 (STATUS.md schema), Phase 7 (discuss emits interactionContext)
**Requirements**: INTR-01, INTR-02, INTR-03, INTR-04, INTR-05
**Success Criteria** (what must be TRUE):
  1. Running the pipeline on a section produces INTERACTION.md combining library component default states with any discuss-provided context
  2. When discuss has already documented interaction context, the agent structures those user-described states and behaviors into INTERACTION.md
  3. A section with no discuss context produces INTERACTION.md with library component defaults only, noting no custom interactions were specified
  4. discuss.md emits an interactionContext field in its return status JSON that loupe.md can forward to the interaction agent
**Plans**: 2 plans

Plans:
- [ ] 09-01-PLAN.md — Interaction agent implementation + discuss interactionContext emit
- [ ] 09-02-PLAN.md — Loupe dispatch wiring + consolidator INTERACTION.md handling

### Phase 10: 3-Agent Parallel Dispatch
**Goal**: The Loupe pipeline dispatches layout, design, and interaction agents simultaneously per section, with a wait gate that requires all three outputs before the builder proceeds — no increase in total build time
**Depends on**: Phase 9 (interaction agent must exist before loupe.md can dispatch it)
**Requirements**: PARA-01, PARA-02, PARA-03, PARA-04
**Success Criteria** (what must be TRUE):
  1. Triggering a build dispatches layout, design, and interaction agents as background agents in the same step, not sequentially
  2. The builder does not start until all three agent outputs are present (or interaction explicitly fell back to null)
  3. A section where the interaction agent errors or produces empty output does not block the pipeline — interactionPath falls back to null and the build continues
  4. Discuss-only sections skip the interaction agent dispatch using the same skip logic as layout and design agents
**Plans**: 1 plan

Plans:
- [ ] 10-01-PLAN.md — Interaction agent Figma fetch refactor + loupe.md parallel dispatch + wait gate extension + agent-contract.md update

### Phase 11: Restore DRFT-04 Review Gate + Doc Fixes
**Goal**: Restore the amendment review gate that was dropped during Phase 8's SKILL.md rewrite, and fix documentation mismatches identified by milestone audit
**Depends on**: Phase 10 (all prior phases complete)
**Requirements**: DRFT-04
**Gap Closure**: Closes gaps from v1.1 milestone audit
**Success Criteria** (what must be TRUE):
  1. SKILL.md Path B presents AskUserQuestion review gate (Commit all / Discard all / Keep pending) when `drafts:` is non-empty, before proceeding to Intent Classification
  2. interaction.md frontmatter declares `dispatch: background` matching actual loupe.md dispatch behavior
  3. 10-01-SUMMARY.md frontmatter includes PARA-01 through PARA-04 in requirements_completed
**Plans**: 1 plan

Plans:
- [ ] 11-01-PLAN.md — Restore review gate in SKILL.md Path B + interaction.md frontmatter fix + SUMMARY frontmatter fix

## Progress

**Execution Order:** 6 → 7 → 8 → 9 → 10

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-5. Watson 1.0 Foundation | v1.0 | 15/15 | Complete | 2026-04-01 |
| 6. Ambient Activation + STATUS.md Schema | 2/2 | Complete   | 2026-04-02 | - |
| 7. Draft/Commit Amendment Model | 2/2 | Complete   | 2026-04-02 | - |
| 8. Session Management | 2/2 | Complete   | 2026-04-03 | - |
| 9. Agent 3 (Interactions) | 2/2 | Complete   | 2026-04-03 | - |
| 10. 3-Agent Parallel Dispatch | 1/1 | Complete    | 2026-04-03 | - |
| 11. Restore DRFT-04 Review Gate + Doc Fixes | 0/1 | Pending | - | - |
