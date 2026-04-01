# Project Research Summary

**Project:** Watson 1.1 — Ambient Mode & Iteration
**Domain:** Claude Code skill framework — AI-powered prototyping assistant
**Researched:** 2026-04-01
**Confidence:** HIGH (stack mechanics, architecture patterns, known pitfalls); MEDIUM (ambient activation reliability, Figma MCP variant data details)

## Executive Summary

Watson 1.1 extends a validated AI prototyping skill framework with five capabilities: ambient mode activation, a draft/commit amendment model, session management, a fully implemented Agent 3 (Interactions), and 3-agent parallel dispatch in the build pipeline. The research confirms all five features are achievable within Watson's existing constraint (pure Claude Code skill files, no external tooling), and all depend on well-documented platform capabilities. The recommended implementation order is strictly dependency-driven: ambient mode and the STATUS.md schema must be established first because three other components consume them, while Agent 3 must be implemented before loupe.md's parallel dispatch can be extended to include it.

The highest-value, highest-risk feature is Agent 3. Figma MCP does not expose prototype interaction data — triggers, transitions, or event handlers are absent from the API surface. Agent 3 must infer interaction states from visual evidence (named variant layers, component state vocabulary) and from discuss-gathered context in `blueprint/INTERACTION.md`. This is a firm architectural constraint, not a gap that will self-resolve. The second major risk is ambient mode: Claude skill activation is semantic matching, not algorithmic directory detection. Broad trigger descriptions produce false positives in non-prototype workflows. Research confirms that explicit negative constraints in trigger descriptions and a two-signal activation requirement (directory signal AND prototype-adjacent language) reduce false positives significantly.

The overall implementation surface is smaller than the feature list suggests. Five of the seven skill files that will change require minor modifications (one or two new steps each). The only net-new file is `agents/interaction.md` (implementing an existing stub) and `blueprint/STATUS.md` (a new per-prototype state file). The existing Watson 1.0 pipeline — loupe.md, builder.md, discuss.md, all other agents — carries forward unchanged in structure, with targeted additions only.

---

## Key Findings

### Recommended Stack

Watson 1.1 requires no new external dependencies. All new capabilities are built on Claude Code platform features already available in the environment. The `paths` frontmatter field in `SKILL.md` provides directory-scoped ambient activation and is the primary trigger mechanism. Session management uses the Claude Code `--worktree` flag (v2.1.50+) and session naming (`--resume`, `/rename`) for prototype isolation. The draft/commit model is a Watson-internal behavioral convention using file state fields — no new platform capability required.

The one platform constraint with material design implications: background subagents cannot call `AskUserQuestion` (it fails silently). Agent 3 must be classified as a background agent and must never ask clarifying questions mid-pipeline. All ambiguous interaction decisions must be resolved before Agent 3 runs — either by the discuss subskill (which writes `blueprint/INTERACTION.md` with pre-gathered context) or accepted as gaps and documented as `INFERRED` in Agent 3's output.

**Core technologies:**
- `paths` frontmatter in SKILL.md — ambient activation scoped to prototype directories; eliminates requirement for `/watson` invocation
- Claude Code `--worktree` flag (v2.1.50+) — isolated git worktrees per prototype session; skills read from main project root, not duplicated
- `background: true` subagent dispatch — 3-agent parallel execution per section; layout, design, and interaction agents run simultaneously
- Figma MCP `get_design_context` — component variant data (state names, variant properties) for Agent 3 inference; prototype interaction data NOT available
- Watson-internal STATUS.md — per-prototype file tracking draft/commit state and session branch; consumed by SKILL.md, discuss.md, loupe.md, and watson-init.md

### Expected Features

**Must have (table stakes):**
- Ambient activation without `/watson` prefix — designers expect frictionless entry into a context-aware assistant
- Session continuity state summary — on activation, surface prototype name + built sections + pending amendments in 3 lines before asking what to do
- Draft/commit amendment model — explicit `## Pending Amendments` section distinct from committed `## Discuss Amendments`; commit gate is the existing "Ready?" confirmation
- Agent 3 (Interactions) producing INTERACTION.md per section — builder already accepts `interactionPath`; every build currently falls back to null
- discuss emits `interactionContext` in return status — required for Agent 3's highest-value path (pre-gathered context skips Figma inference)
- 3-agent parallel dispatch — adding interactions to the pipeline must not increase build time

**Should have (differentiators):**
- Figma variant state inference with INFERRED/CONFIRMED annotation — identifies state machines from visual evidence without a designer interview
- Ambient activation with session state at a glance — "You're working on Order Management — header and order-table are built, sidebar is in progress"
- Branch hygiene step at new session start — surfaces inactive Watson branches and offers cleanup

**Defer (Watson 1.1.x and 1.2+):**
- Cross-session preference memory (persist "just build" mode across sessions) — within-session tracking is sufficient for 1.1
- Interaction agent confidence scoring (flag uncertain variant inference)
- `understand` subskill (PRD ingestion to CONTEXT.md enrichment)
- `explore` subskill (competitive pattern review before discuss)

### Architecture Approach

Watson 1.1 adds an ambient activation layer above the master orchestrator and a co-located state layer (STATUS.md) below it. The pipeline itself (loupe.md to parallel agents to builder to reviewer to consolidator) is structurally unchanged — Phase 2 of loupe.md gains a third background agent dispatch, and Phase 3 gains a third path pass-through (`interactionPath`). No existing agent files change. The only net-new agent file is `interaction.md`, which implements the existing stub contract. Per-prototype state is centralized in `blueprint/STATUS.md`, which is read on every Watson entry and written by discuss.md on any amendment.

**Major components:**
1. **Ambient Activation Layer** (SKILL.md frontmatter) — `paths` glob triggers skill load when editing prototype files; description-based trigger as secondary path; ambient entry detection in Setup Detection handles new vs. returning without running the full setup flow
2. **Draft/Commit State** (blueprint/STATUS.md) — tracks `draft | committed` state and pending amendment list per prototype; written by discuss.md on amendment, reset by SKILL.md on explicit commit action; read by SKILL.md on entry and loupe.md before pipeline
3. **Agent 3 (interaction.md)** — background agent implementing existing stub; reads discuss context from `{blueprintPath}/INTERACTION.md` first, then infers from Figma variant data; outputs INTERACTION.md in `.watson/sections/{name}/` with INFERRED/CONFIRMED annotations
4. **3-Agent Parallel Dispatch** (loupe.md Phase 2) — adds interaction agent to the existing layout+design background dispatch; wait gate updated to require all three before Phase 3; consolidator treats INTERACTION.md as a first-class artifact

### Critical Pitfalls

1. **Ambient mode fires on non-prototype directories** — Skill activation is semantic matching inside Claude's forward pass, not algorithmic directory detection. Prevention: write trigger description with explicit negative constraints ("ONLY when prototype directory signal present — do NOT activate for non-design tasks"); require two-signal activation (directory signal AND prototype-adjacent language). Test near-miss scenarios before shipping.

2. **Agent 3 over-infers interaction states from minimal Figma evidence** — Without a ceiling, "infer states" produces fabricated INTERACTION.md with states the designer never intended. Prevention: enforce evidence tiers — Tier 1 (named Figma variants), Tier 2 (discuss context), Tier 3 (flag gaps instead of fabricating). INFERRED/CONFIRMED annotation is mandatory per state.

3. **Figma MCP has no prototype interaction data** — `get_design_context` exposes design layer only (visual properties, variants, component structure). Prototype interactions are not accessible via this API. Prevention: Agent 3's input spec must document this constraint explicitly; the agent never attempts to fetch interaction/prototype connection data.

4. **Draft state is invisible — users don't know what's saved** — Blueprint files show amendments but the user mental model is binary. Prevention: at the end of every discuss session with amendments, Watson surfaces the status explicitly in plain language ("I've saved these decisions as drafts — want to build now or save for later?"). Never let a discuss session end without the user knowing their amendment state.

5. **Session branch conflicts and orphaned branch accumulation** — Two sessions on the same prototype or abandoned sessions create branch collisions and repo clutter. Prevention: check `git branch --list watson/{prototype}*` before creating any branch; enforce one-branch-per-prototype naming (`watson/{prototype-slug}`); include a branch hygiene step at new session start.

6. **3-agent wait gate excludes Agent 3 (consolidation race)** — If the consolidator dispatches before all three agent outputs are present, blueprint INTERACTION.md is corrupted or missing sections. Prevention: all three agents must be enumerated in the loupe.md wait gate; verify file existence for all sections before dispatch.

---

## Implications for Roadmap

The research establishes a strict dependency order. STATUS.md schema and ambient activation are load-bearing for everything else. Agent 3 must exist before loupe.md can be extended. All five features are independent enough to proceed in phases without circular dependencies.

### Phase 1: Ambient Activation + STATUS.md Schema

**Rationale:** Ambient mode is load-bearing for session management and the session continuity state summary. STATUS.md schema must be defined before discuss.md, watson-init.md, and SKILL.md can write to it. Both establish foundational contracts before any pipeline work begins. These two features share the same blueprint-reading logic and are best built together.

**Delivers:** Watson activates in prototype directories without `/watson`; returning users see a context summary on activation; per-prototype blueprint state file initialized on setup; `blueprint/STATUS.md` schema defined and written by watson-init.md.

**Addresses:** Ambient mode (must-have), session continuity summary (must-have), STATUS.md initialization

**Avoids:** Ambient false positives on non-prototype workflows (Pitfall 1); ambient/explicit code path divergence (Pitfall 2); STATUS.md schema disagreement between three writing components

**Research flag:** Needs near-miss testing (non-prototype `.tsx` files, utility file edits in same project) before this phase is considered complete. The ~50% description-based activation rate means `paths` frontmatter must be validated in the Playground environment; a `UserPromptSubmit` hook is the documented fallback if `paths` proves insufficient.

### Phase 2: Draft/Commit Amendment Model

**Rationale:** Depends on STATUS.md schema (Phase 1). Extends existing discuss.md behavior — the "Discuss Amendments" pattern already exists; this adds a temporal state distinction. Low implementation cost; high trust impact. Must complete before session management (Phase 3) so the session start summary can surface pending amendments.

**Delivers:** Blueprint amendments are explicitly pending until user confirms; discuss exit surfaces draft status in plain language; SKILL.md surfaces pending amendments on session start.

**Addresses:** Draft/commit model (must-have), pending amendment visibility (UX pitfall)

**Avoids:** Draft state invisibility (Pitfall 4); auto-committing on ambiguous acknowledgment (anti-feature); draft markers embedded in CONTEXT.md body (anti-pattern); complex state machine with many transitions (anti-pattern — two states only: pending and committed)

**Research flag:** Standard patterns. This is a behavioral convention layered on existing file writes. The only validation needed is the UX test: after a discuss session with amendments, ask Watson "what's the current state?" and verify it distinguishes drafted from built.

### Phase 3: Session Management

**Rationale:** Depends on STATUS.md schema (Phase 1) and draft/commit (Phase 2). Branch creation and detection logic lives in SKILL.md alongside the ambient entry logic from Phase 1 — grouping in separate phases avoids re-editing SKILL.md twice. Session management without git branch automation (the anti-feature) keeps scope contained.

**Delivers:** New prototypes optionally get a dedicated worktree/session via user-confirmed `git worktree add`; returning users are shown session state before being asked what to do; branch hygiene step lists inactive Watson branches on new session start.

**Addresses:** Session continuity (must-have), session branch collision (Pitfall 4 from PITFALLS.md), orphaned branch accumulation (Pitfall 5)

**Avoids:** Silent git branch operations (anti-pattern); conflating Watson session with git workflow (anti-feature); surfacing git branch names to designers in Watson's language (UX pitfall)

**Research flag:** Well-documented. Verify `git worktree add` via Bash tool works in the Faire Playground environment before writing the full session flow.

### Phase 4: Agent 3 (Interactions)

**Rationale:** Fully self-contained — the stub contract and input/output schema are already defined. Must be implemented before Phase 5 (3-agent parallel dispatch) can be wired. This is the highest-complexity, highest-value phase.

**Delivers:** Full implementation of `interaction.md`; INTERACTION.md output per section in `.watson/sections/{name}/`; INFERRED/CONFIRMED annotation per state; discuss context passthrough (reads `{blueprintPath}/INTERACTION.md` before Figma inference); graceful sparse-evidence handling (flags gaps, does not fabricate).

**Uses:** Figma MCP `get_design_context` (must mirror the exact tool call pattern used in layout.md and design.md — the internal alias `mcp__figma__get_figma_data` may differ from the public server name); `libraryPaths[]` for DS-standard interaction pattern cross-reference

**Addresses:** Agent 3 (must-have); discuss emits `interactionContext` in return status (must be coordinated with discuss.md in this phase)

**Avoids:** Figma MCP prototype data assumption (Pitfall 6 — critical); Agent 3 over-inference without evidence tiers (Pitfall 7); AskUserQuestion in background agent (platform hard constraint); INTERACTION.md schema undefined before agent implementation (integration gotcha from PITFALLS.md)

**Research flag:** Must lock INTERACTION.md artifact schema with INFERRED/CONFIRMED annotations before writing the agent file. Verify exact Figma MCP tool name in the Faire environment by checking layout.md and design.md tool call patterns.

### Phase 5: 3-Agent Parallel Dispatch + Integration Test

**Rationale:** Depends on Agent 3 existing (Phase 4). Change is confined to loupe.md Phase 2 (add third agent dispatch) and Phase 3 (add `interactionPath` pass-through). Includes the end-to-end integration test that validates all 1.1 features working together on a realistic multi-section prototype.

**Delivers:** loupe.md dispatches layout + design + interaction simultaneously per figma section; wait gate updated to require all three outputs; `interactionPath` passed to builder (resolves the persistent `null` placeholder); consolidator treats INTERACTION.md as a first-class artifact; 4-section frame validation confirms no context window degradation.

**Addresses:** 3-agent parallel dispatch (must-have), consolidator wait gate correctness, builder `interactionPath` activation

**Avoids:** Consolidator dispatched before Agent 3 outputs are present (Pitfall 8); context window pressure on multi-section frames (Pitfall 9); interaction agent dispatch on discuss-only sections (anti-feature — skip same as layout/design)

**Research flag:** 4-section frame validation is required before shipping — single-section smoke tests are insufficient to surface context window pressure. If later sections (3 and 4) show lower output quality than sections 1 and 2, implement section batching (2 sections parallel, consolidate, next 2).

### Phase Ordering Rationale

- STATUS.md schema precedes all consumers (Phases 2 and 3) because three components write to this file and they must agree on format before any writes occur
- Ambient mode (Phase 1) and session management (Phase 3) share blueprint-reading and src-scanning logic; ambient must be established first because it is the activation trigger that session management hooks into
- Draft/commit (Phase 2) precedes session management (Phase 3) because the session start context summary must surface pending amendment state, which requires the amendment model to be defined
- Agent 3 (Phase 4) precedes 3-agent parallel dispatch (Phase 5) because loupe.md dispatches the agent — the agent must exist before the dispatch is wired
- Integration test is the terminal step in Phase 5, not a separate phase, because the parallel dispatch and the E2E test are tightly coupled (the test validates dispatch timing and the wait gate)

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Ambient Mode):** Validate `paths` glob activation reliability in the Faire Playground environment. Description-based activation has ~50% observed auto-trigger rate; `paths` is more reliable but untested in this specific repo structure. Document the `UserPromptSubmit` hook fallback plan before starting implementation.
- **Phase 4 (Agent 3):** Confirm exact Figma MCP tool name in Faire's environment. Lock INTERACTION.md artifact schema with INFERRED/CONFIRMED annotations before writing the agent file. The evidence-tier inference model has no direct prior art.

Phases with standard patterns (skip research-phase):
- **Phase 2 (Draft/Commit):** Entirely Watson-internal behavioral convention. Extends existing discuss.md amendment logic with a temporal state distinction.
- **Phase 3 (Session Management):** `--worktree` flag and session naming are well-documented in official Claude Code docs. Git branch check via Bash tool follows established Watson patterns.
- **Phase 5 (3-Agent Parallel):** Direct mechanical extension of the validated 2-agent parallel pattern from Watson 1.0. Confined to loupe.md.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All capabilities grounded in official Claude Code docs fetched 2026-04-01; `paths` frontmatter, `--worktree`, background subagent AskUserQuestion constraint all verified |
| Features | HIGH | Watson codebase read directly; feature dependencies derived from production skill files; existing contracts (builder `interactionPath`, discuss "Discuss Amendments" pattern) confirmed against live files |
| Architecture | HIGH | Integration points derived from direct reading of all production skill files; build order has strict dependency rationale; only gap is ambient reliability rate (MEDIUM — community research) |
| Pitfalls | HIGH | Grounded in Watson 1.0 production experience + official Figma MCP docs confirming no prototype interaction data + Claude skill activation studies (650-trial experiment) + MAST taxonomy research |

**Overall confidence:** HIGH

### Gaps to Address

- **Figma MCP tool name in Faire environment:** The official public Figma MCP server uses `get_design_context`; Watson's agents reference `mcp__figma__get_figma_data`. These may be aliases or Watson may use a custom MCP configuration. Before implementing Agent 3, check the exact tool call in `layout.md` and mirror it exactly.

- **Ambient activation reliability in Playground:** The `paths` glob pattern must match Faire's actual prototype file locations. Research assumes `src/pages/**/*.tsx` based on Playground conventions, but this must be verified against the actual directory structure before SKILL.md frontmatter is written.

- **4-section context window ceiling:** 3-agent parallel on a 4-section frame (12 concurrent background agents each loading 9 library chapter files) has not been load-tested. The mitigation (section batching) is defined, but the threshold for degradation is unknown until the Phase 5 integration test runs.

- **discuss `interactionContext` return status schema:** Agent 3's highest-value path depends on discuss.md emitting an `interactionContext` field. This return status schema change is small but must be coordinated between discuss.md and loupe.md — do not implement these independently.

---

## Sources

### Primary (HIGH confidence)
- Claude Code Skills documentation (code.claude.com/docs/en/skills) — `paths` frontmatter, `description` auto-activation, `disable-model-invocation`; fetched 2026-04-01
- Claude Code Sub-agents documentation (code.claude.com/docs/en/sub-agents) — `background` frontmatter, foreground/background behavior, AskUserQuestion in background agents; fetched 2026-04-01
- Claude Code Common Workflows (code.claude.com/docs/en/common-workflows) — `--worktree` flag, session naming, `--resume`, worktree cleanup; fetched 2026-04-01
- Figma Plugin API: variantProperties and componentProperties (developers.figma.com) — confirms variant state data available per node; fetched 2026-04-01
- Figma MCP Developer Documentation — confirms no direct access to prototype interaction/event data; 2026
- `/Users/austindick/.claude/skills/watson/` — production Watson 1.0 skill files (SKILL.md, loupe.md, discuss.md, interaction.md, layout.md, builder.md); read directly; HIGH confidence

### Secondary (MEDIUM confidence)
- Figma MCP Server Guide (github.com/figma/mcp-server-guide) — tool list: `get_design_context`, `get_metadata`; lacks detailed field documentation
- Skills auto-activation reliability analysis (scottspence.com) — ~50% auto-trigger rate for description-based activation; `paths`-based more reliable
- Claude Code Changelog (github.com/anthropics/claude-code/blob/main/CHANGELOG.md) — `paths` YAML list support v2.1.84, `CwdChanged`/`FileChanged` hooks v2.1.83
- Marc Bara: Claude Skills Have Two Reliability Problems — activation failure vs. execution failure taxonomy; directive descriptions with ALWAYS invoke have ~20x higher activation odds (2026)
- Claude Code skill activation experiment (650-trial, Ivan Seleznov via Marc Bara) — negative constraints in trigger descriptions reduce false positives significantly

### Tertiary (LOW confidence)
- Competitive feature analysis (GitHub Copilot Workspace, Cursor, Figma Make) — directional parallels only; no direct analogues for Watson's draft/commit or ambient activation pattern exist in competing tools

---
*Research completed: 2026-04-01*
*Ready for roadmap: yes*
