# Roadmap: Watson

## Milestones

- ✅ **v1.0 Loupe Pipeline** — Phases 1-5 (shipped 2026-03-26)
- ✅ **Watson 1.0 Foundation** — Phases 1-5 (shipped 2026-04-01)
- ✅ **Watson 1.1 Ambient Mode & Iteration** — Phases 6-12 (shipped 2026-04-03)
- 🚧 **Watson 1.2 Plugin Deployment** — Phases 13-15 (in progress)
- 📋 **Watson 1.3 Discuss Refactor** — (planned)

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

### 🚧 Watson 1.2 Plugin Deployment (In Progress)

**Milestone Goal:** Package Watson as a Claude Code plugin so teammates can install with one command, receive automatic updates, and use Watson identically to how it works locally today.

- [ ] **Phase 13: Plugin Scaffold + Path Portability** - Valid plugin.json manifest, plugin directory structure, all paths portable via ${CLAUDE_PLUGIN_ROOT}, library books bundled, namespace resolved
- [ ] **Phase 14: Hook Migration + Script Bundling** - Watson session hooks moved from personal settings.json to plugin hooks/hooks.json; statusline script forked and bundled
- [ ] **Phase 15: Distribution + Onboarding + Validation** - GitHub marketplace live, one-command install working, onboarding README complete, fresh install and author migration verified

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
- [ ] 13-01: Create plugin.json manifest, reorganize directory structure, resolve command namespace
- [ ] 13-02: Replace all hardcoded paths with ${CLAUDE_PLUGIN_ROOT}, update @-dispatch references, bundle library books, validate locally

### Phase 14: Hook Migration + Script Bundling
**Goal**: Watson's session lifecycle hooks fire exclusively from the plugin, not from the author's personal settings.json
**Depends on**: Phase 13
**Requirements**: HOOK-01, HOOK-02, HOOK-03, HOOK-04
**Success Criteria** (what must be TRUE):
  1. SessionStart recovery notification appears exactly once in a fresh session (not twice — double-firing would indicate settings.json not cleaned)
  2. SessionEnd branch+actions preservation fires correctly when a Watson session ends
  3. Author's settings.json contains no Watson hooks (GSD and share-proto hooks unaffected)
  4. `scripts/watson-statusline.js` exists in the plugin and contains no share-proto tunnel logic
**Plans**: 2 plans

Plans:
- [ ] 14-01: Write hooks/hooks.json, atomically remove Watson hooks from settings.json, fork statusline script, verify no double-firing

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
- [ ] 15-01: Create marketplace.json, write plugin README with prerequisites + install flow + manual steps, establish version bump discipline
- [ ] 15-02: Validate fresh install (VALD-01) and author migration (VALD-02); add enabledPlugins to Playground settings post-validation

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-5. Loupe Pipeline | v1.0 | 10/10 | Complete | 2026-03-26 |
| 1-5. Watson Foundation | Watson 1.0 | 15/15 | Complete | 2026-04-01 |
| 6-12. Ambient Mode & Iteration | v1.1 | 11/11 | Complete | 2026-04-03 |
| 13. Plugin Scaffold + Path Portability | 1/2 | In Progress|  | - |
| 14. Hook Migration + Script Bundling | v1.2 | 0/1 | Not started | - |
| 15. Distribution + Onboarding + Validation | v1.2 | 0/2 | Not started | - |
