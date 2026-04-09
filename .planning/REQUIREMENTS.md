# Requirements: Watson

**Defined:** 2026-04-04
**Core Value:** Every prototype decision is grounded in real context and traceable from idea through prototype to production spec.

## v1.2 Requirements (Complete)

All 15 requirements satisfied. See `milestones/` for archive.

- [x] PLUG-01 through PLUG-05: Plugin infrastructure (Phase 13)
- [x] HOOK-01 through HOOK-04: Hook migration (Phase 14)
- [x] DIST-01 through DIST-04: Distribution (Phase 15)
- [x] VALD-01, VALD-02: Validation (Phase 15)

## v1.3 Requirements

Requirements for Watson 1.3: User Experience & Commands. Each maps to roadmap phases.

### Activation & Startup

- [x] **ACTV-01**: Watson never auto-activates — skill description matching does not trigger a full Watson session without user confirmation
- [x] **ACTV-02**: When Watson detects a potential design context, it asks "Want Watson's help?" via AskUserQuestion before activating
- [x] **ACTV-03**: "New prototype or continue existing?" is the first question presented after `/watson` invocation — before any branch detection, session recovery, or status checks
- [x] **ACTV-04**: Branch detection, session recovery, and status checks run after the user's initial choice, ideally batched or backgrounded to minimize visible tool calls
- [x] **ACTV-05**: Blueprint scaffold files are not committed until the first meaningful change (discuss write, build output, or manual save) — no 20-second empty commit on startup
- [x] **ACTV-06**: Startup tool calls are consolidated into fewer visible terminal blocks (batch bash commands into a single script where possible)

### Commands — Save Blueprint

- [x] **SAVE-01**: `/watson:save-blueprint` reads the current session conversation and prototype state, then immediately writes blueprint files (CONTEXT.md, LAYOUT.md, DESIGN.md, INTERACTION.md) based on Watson's interpretation
- [x] **SAVE-02**: After writing, Watson presents a summary of what was captured and identifies gaps (missing decisions, ambiguous choices, unresolved design questions)
- [x] **SAVE-03**: Watson offers to discuss gaps via the discuss flow — user can accept (bridge into discuss) or decline (keep the blueprint as-is)
- [x] **SAVE-04**: `/watson:save-blueprint` works regardless of whether Watson was formally activated — captures context from any freestyle prototyping session

### Commands — Status & Resume

- [x] **STAT-01**: `/watson:status` displays current prototype state: name, branch, sections built, pending amendments count, session history (last 3), and suggested next action
- [x] **STAT-02**: `/watson:status` does not require or trigger full Watson activation — it's a read-only inspection command
- [x] **RESM-01**: `/watson:resume` reconstructs Watson context from persistent state (STATUS.md + blueprint files) after a context reset
- [x] **RESM-02**: `/watson:resume` offers the appropriate next action based on state: if CONTEXT.md populated but nothing built → offer build; if sections built but amendments pending → offer rebuild; if mid-discussion → summarize and continue

### Commands — Session Lifecycle

- [x] **SESS-01**: `/watson:off` displays a session summary before deactivating (what was discussed, what was built, pending amendments)
- [x] **SESS-02**: If blueprint files are empty or template-only when `/watson:off` runs, Watson prompts the user to run `/watson:save-blueprint` before deactivating

### Commands — Standalone Entry Points

- [ ] **STND-01**: `/watson:discuss` is callable without prior `/watson` activation — starts a discuss session directly with minimal setup (branch detection + blueprint path resolution only)
- [ ] **STND-02**: `/watson:loupe` is callable without prior `/watson` activation — starts a build pipeline directly with minimal setup
- [ ] **STND-03**: Standalone commands still write to blueprint files and update STATUS.md — they produce the same persistent artifacts as the full Watson flow

### Flexible Navigation

- [ ] **FLEX-01**: "Continue existing" accepts a pasted branch name, Playground URL, or directory path in addition to the watson/* branch list
- [ ] **FLEX-02**: When a user pastes a non-watson/* branch or directory, Watson discovers the blueprint path dynamically and adapts

## v1.4 Requirements

Deferred to next milestone (Discuss Refactor). Tracked but not in current roadmap.

### Discuss Subskill Refactor

- **DISC-01**: discuss.md split into ~200-line files (conversation core, blueprint writes, handoff)
- **DISC-02**: Wiring between split files verified with end-to-end discuss session
- **DISC-03**: No behavioral regression — amendment lifecycle, interactionContext emit, Ready gate all preserved

## Out of Scope

| Feature | Reason |
|---------|--------|
| Discuss refactor (file split) | Deferred to v1.4 — internal cleanup, not user-facing |
| Clone from prod (sourceRef) | Deferred to v1.5 — separate capability milestone |
| Automated ambient rule installation | Plugin system doesn't support rules/; manual copy acceptable |
| Token usage tracking/display | Interesting but not actionable without Claude Code usage APIs |
| Branch naming change (watson/ → prototype/) | High refactor cost, low user impact — revisit based on broader feedback |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ACTV-01 | Phase 16 | Complete |
| ACTV-02 | Phase 16 | Complete |
| ACTV-03 | Phase 16 | Complete |
| ACTV-04 | Phase 16 | Complete |
| ACTV-05 | Phase 16 | Complete |
| ACTV-06 | Phase 16 | Complete |
| SAVE-01 | Phase 17 | Complete |
| SAVE-02 | Phase 17 | Complete |
| SAVE-03 | Phase 17 | Complete |
| SAVE-04 | Phase 17 | Complete |
| STAT-01 | Phase 18 | Complete |
| STAT-02 | Phase 18 | Complete |
| RESM-01 | Phase 18 | Complete |
| RESM-02 | Phase 18 | Complete |
| SESS-01 | Phase 18 | Complete |
| SESS-02 | Phase 18 | Complete |
| STND-01 | Phase 19 | Pending |
| STND-02 | Phase 19 | Pending |
| STND-03 | Phase 19 | Pending |
| FLEX-01 | Phase 19 | Pending |
| FLEX-02 | Phase 19 | Pending |

**Coverage:**
- v1.3 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

---
*Requirements defined: 2026-04-04*
*Last updated: 2026-04-09 — traceability completed after roadmap creation*
