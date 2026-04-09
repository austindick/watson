# Roadmap: Watson

## Milestones

- ✅ **v1.0 Loupe Pipeline** — Phases 1-5 (shipped 2026-03-26)
- ✅ **Watson 1.0 Foundation** — Phases 1-5 (shipped 2026-04-01)
- ✅ **Watson 1.1 Ambient Mode & Iteration** — Phases 6-12 (shipped 2026-04-03)
- ✅ **Watson 1.2 Plugin Deployment** — Phases 13-15 (shipped 2026-04-07)
- 🚧 **Watson 1.3 User Experience & Commands** — Phases 16-19 (in progress)

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

Full details: see Phase Details below (archived inline).

</details>

### 🚧 Watson 1.3 User Experience & Commands (In Progress)

**Milestone Goal:** Transform Watson from an ambient process that commandeers the session into opt-in tooling with discrete commands. Users work freestyle and invoke Watson capabilities when they need them.

- [x] **Phase 16: Opt-in Activation Model** - Watson never auto-activates; startup asks intent first, defers housekeeping, eliminates empty commit (completed 2026-04-09)
- [ ] **Phase 17: Save Blueprint Command** - `/watson:save-blueprint` retroactively captures session context into blueprint files with gap analysis
- [ ] **Phase 18: Recovery & Lifecycle Commands** - `/watson:status`, `/watson:resume`, and `/watson:off` give users visibility and control over session state
- [ ] **Phase 19: Standalone Commands & Flexible Entry** - `/watson:discuss` and `/watson:loupe` callable without full session; continue accepts branch, URL, or directory

## Phase Details

### Phase 13: Plugin Scaffold + Path Portability
**Goal**: Watson loads as a valid Claude Code plugin with all file references portable and the command namespace established
**Depends on**: Phase 12 (Watson 1.1 complete)
**Requirements**: PLUG-01, PLUG-02, PLUG-03, PLUG-04, PLUG-05
**Success Criteria** (what must be TRUE):
  1. Running `claude plugin validate .` against the Watson directory returns no errors
  2. `/watson:watson` (or the resolved namespace) is invocable after `claude --plugin-dir ./watson` without error
  3. All agents successfully read library books — no "file not found" errors when agents access `${CLAUDE_PLUGIN_ROOT}/library/`
  4. Grepping the entire plugin directory for `~/.claude` returns zero hits
  5. Library books (design-system, playground-conventions) are present in the plugin directory and agents can access them via the portable path
**Plans**: 2 plans

Plans:
- [x] 13-01: Create plugin.json manifest, reorganize directory structure, resolve command namespace
- [x] 13-02: Replace all hardcoded paths with ${CLAUDE_PLUGIN_ROOT}, update @-dispatch references, bundle library books, validate locally

### Phase 14: Hook Migration + Script Bundling
**Goal**: Watson's session lifecycle hooks fire exclusively from the plugin, not from the author's personal settings.json
**Depends on**: Phase 13
**Requirements**: HOOK-01, HOOK-02, HOOK-03, HOOK-04
**Success Criteria** (what must be TRUE):
  1. SessionStart recovery notification appears exactly once in a fresh session (not twice — double-firing would indicate settings.json not cleaned)
  2. SessionEnd branch+actions preservation fires correctly when a Watson session ends
  3. Author's settings.json contains no Watson hooks (GSD and share-proto hooks unaffected)
  4. `scripts/watson-statusline.js` exists in the plugin and contains no share-proto tunnel logic
**Plans**: 1 plan

Plans:
- [x] 14-01-PLAN.md — Create hooks.json + 3 lifecycle scripts, migrate author's settings.json, verify no double-firing

### Phase 15: Distribution + Onboarding + Validation
**Goal**: A teammate starting from zero Watson experience can install and use Watson with two commands; a fresh install and author migration both work cleanly
**Depends on**: Phase 14
**Requirements**: DIST-01, DIST-02, DIST-03, DIST-04, VALD-01, VALD-02
**Success Criteria** (what must be TRUE):
  1. A teammate runs two commands and Watson is available — `/watson:watson` (or resolved namespace) is invocable with no manual file copying
  2. After the author pushes a version bump to the GitHub repo, teammates receive the update automatically on next Claude Code start
  3. The onboarding README lists all prerequisites (Figma MCP, GITHUB_TOKEN) before the install instructions
  4. A fresh install on a machine with no prior Watson produces a working Watson instance
  5. The author's existing install migrates without double-firing hooks or broken path references
**Plans**: 2 plans

Plans:
- [x] 15-01: Create marketplace.json, write plugin README with prerequisites + install flow + manual steps, establish version bump discipline
- [x] 15-02: Validate fresh install (VALD-01) and author migration (VALD-02); enabledPlugins deferred to broader rollout

### Phase 16: Opt-in Activation Model
**Goal**: Watson never interrupts a user who didn't ask for it; when users do invoke Watson, startup is fast, intentional, and free of noisy setup commits
**Depends on**: Phase 15
**Requirements**: ACTV-01, ACTV-02, ACTV-03, ACTV-04, ACTV-05, ACTV-06
**Success Criteria** (what must be TRUE):
  1. Working in the Prototype Playground without typing `/watson` produces no Watson activation — Watson is silent unless explicitly invoked
  2. When Watson detects a potential design context (but wasn't invoked), it asks "Want Watson's help?" and waits — it does not proceed without confirmation
  3. After invoking `/watson`, the first prompt is "New prototype or continue existing?" with branch detection and session recovery running after the user answers
  4. A new prototype session completes startup with no git commit until the user makes a meaningful change (discuss write, build output, or manual blueprint save)
  5. Startup produces two terminal blocks or fewer — batch operations are invisible to the user
**Plans**: 2 plans

Plans:
- [x] 16-01-PLAN.md — Add opt-in gate logic and ambient rule cleanup (ACTV-01, ACTV-02)
- [x] 16-02-PLAN.md — Reorder startup sequence, defer scaffold commit, batch operations (ACTV-03, ACTV-04, ACTV-05, ACTV-06)

### Phase 17: Save Blueprint Command
**Goal**: Users can retroactively capture context from any prototyping session — with or without Watson formally activated — into a complete, gap-analyzed blueprint
**Depends on**: Phase 16
**Requirements**: SAVE-01, SAVE-02, SAVE-03, SAVE-04
**Success Criteria** (what must be TRUE):
  1. Running `/watson:save-blueprint` after a freestyle session produces all four blueprint files (CONTEXT.md, LAYOUT.md, DESIGN.md, INTERACTION.md) populated with Watson's interpretation of the conversation
  2. After writing, Watson presents a readable summary of what was captured and explicitly lists gaps — decisions that are missing, ambiguous, or unresolved
  3. Watson asks whether the user wants to discuss the gaps; accepting bridges into the discuss flow, declining keeps the blueprint as written
  4. `/watson:save-blueprint` works when Watson was never formally activated — it captures context from any session, not just Watson-managed ones
**Plans**: 2 plans

Plans:
- [ ] 17-01-PLAN.md — Create save-blueprint.md subskill with extraction, blueprint writing, gap analysis, discuss bridge, and non-Watson session handling (SAVE-01, SAVE-02, SAVE-03, SAVE-04)
- [ ] 17-02-PLAN.md — Register /watson:save-blueprint in SKILL.md routing, add [INFERRED] skip logic to builder.md (SAVE-01, SAVE-02)

### Phase 18: Recovery & Lifecycle Commands
**Goal**: Users can inspect prototype state without activating Watson, reconstruct context after a reset, and exit sessions cleanly with a summary and a save prompt
**Depends on**: Phase 16
**Requirements**: STAT-01, STAT-02, RESM-01, RESM-02, SESS-01, SESS-02
**Success Criteria** (what must be TRUE):
  1. `/watson:status` displays prototype name, branch, sections built, pending amendments count, session history (last 3), and a suggested next action — without triggering Watson activation
  2. `/watson:resume` reads STATUS.md and blueprint files and offers the right next action based on actual state (build, rebuild, or continue discussion)
  3. `/watson:off` prints a session summary (discussed, built, pending) before deactivating
  4. If blueprint files are empty or template-only at `/watson:off` time, Watson prompts the user to run `/watson:save-blueprint` before closing
**Plans**: TBD

Plans:
- [ ] 18-01: TBD

### Phase 19: Standalone Commands & Flexible Entry
**Goal**: Users can start a discuss or build session directly without a full Watson session, and continue existing work by pasting any branch name, URL, or directory path
**Depends on**: Phase 16
**Requirements**: STND-01, STND-02, STND-03, FLEX-01, FLEX-02
**Success Criteria** (what must be TRUE):
  1. `/watson:discuss` invoked without a prior `/watson` session starts a discuss flow with branch detection and blueprint path resolved — no full session setup required
  2. `/watson:loupe` invoked without a prior `/watson` session starts the build pipeline directly
  3. Discuss and loupe standalone sessions write blueprint files and update STATUS.md identically to the full Watson flow
  4. "Continue existing" accepts a pasted branch name, Playground URL, or directory path and resolves the correct blueprint — not just the watson/* branch list
**Plans**: TBD

Plans:
- [ ] 19-01: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-5. Loupe Pipeline | v1.0 | 10/10 | Complete | 2026-03-26 |
| 1-5. Watson Foundation | Watson 1.0 | 15/15 | Complete | 2026-04-01 |
| 6-12. Ambient Mode & Iteration | v1.1 | 11/11 | Complete | 2026-04-03 |
| 13. Plugin Scaffold + Path Portability | v1.2 | 2/2 | Complete | 2026-04-05 |
| 14. Hook Migration + Script Bundling | v1.2 | 1/1 | Complete | 2026-04-05 |
| 15. Distribution + Onboarding + Validation | v1.2 | 2/2 | Complete | 2026-04-07 |
| 16. Opt-in Activation Model | 2/2 | Complete    | 2026-04-09 | - |
| 17. Save Blueprint Command | 1/2 | In Progress|  | - |
| 18. Recovery & Lifecycle Commands | v1.3 | 0/? | Not started | - |
| 19. Standalone Commands & Flexible Entry | v1.3 | 0/? | Not started | - |
