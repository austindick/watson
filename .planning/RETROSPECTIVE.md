# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Loupe Pipeline

**Shipped:** 2026-03-26
**Phases:** 5 | **Plans:** 10 | **Sessions:** ~8

### What Was Built
- 7-agent pipeline skill for pixel-perfect Figma-to-code implementation
- Frame decomposition with `::section` tagging and heuristic fallback
- Parallel layout extraction + token/component mapping agents
- Code builder with zero-hardcoded-value guarantee + in-place QA reviewer
- Project-level consolidator that extends vocabulary on subsequent runs
- Watson-to-Loupe integration via Skill tool invocation

### What Worked
- Locking artifact schemas in Phase 1 before writing any agents — prevented contract drift entirely
- Building and testing one phase at a time with real Figma data — caught issues early (overflow fallback, hex normalization)
- Agent 3 deferral — removed the highest-risk item (interactive interview + background agents) without blocking the core pipeline
- Smoke tests on each phase gate — caught the silent-serialization timing concern immediately
- Phase 4 gap closure pattern (04-03) for catching missed TODO annotations — small follow-up plans are cheap

### What Was Inefficient
- Phase 4 smoke test took 33 minutes — longest plan by far, mostly waiting on builder/reviewer agent execution against real Figma data
- STATE.md fell behind during rapid execution — frontmatter percent stuck at 60% even at completion
- Some SUMMARY.md files lacked `requirements_completed` frontmatter — required tech debt cleanup pass

### Patterns Established
- Critical Constraints section front-loaded in every agent file (before execution steps)
- Overflow fallback pattern: `get_design_context` → `get_metadata` + targeted children for Figma MCP token limits
- Figma-wins vocabulary conflict rule with inline comment annotation
- Per-instance TODO rule: every use of an unmapped raw value gets its own locked TODO comment
- Agent 06 cleanup gated on 5-line minimum file verification

### Key Lessons
1. Schema-first development (lock contracts before implementation) is the highest-leverage decision for multi-agent systems
2. Deferring high-risk features (Agent 3) unblocks delivery without quality compromise — the pipeline is complete without interactions
3. Smoke testing against real external data (Figma MCP) is non-negotiable — synthetic tests miss real-world edge cases like hex casing and token overflow
4. Tech debt cleanup should happen before milestone completion, not after — the audit-then-fix cycle worked cleanly

### Cost Observations
- Model mix: ~80% opus, ~20% sonnet (research and executor agents)
- Sessions: ~8 across 2 days
- Notable: Entire v1.0 milestone completed in 2 days — schema-first approach and aggressive deferral kept scope tight

---

## Milestone: Watson 1.0 — Foundation

**Shipped:** 2026-04-01
**Phases:** 5 | **Plans:** 15

### What Was Built
- Master orchestrator with three-tier intent classification and subskill dispatch
- Library system: LIBRARY.md index, Book/Chapter/Page hierarchy, Librarian generate + update modes
- Design system book regenerated from real Slate source — 29 components, 170 icons, full token set
- Playground conventions book consolidated from 6+ sources into 7 chapters
- Blueprint system: /blueprint directory per prototype with 4 spec files
- `discuss` subskill: design thinking partner with library-grounded recommendations
- `loupe` subskill: Figma-to-code pipeline orchestrator wiring all 7 agents
- 7 Loupe agents ported to Watson contract with libraryPaths[] and source-agnosticism

### What Worked
- Source-agnostic design system architecture — FauxDS→Slate migration required zero agent edits
- Book/Chapter/Page hierarchy scaled from flat files to deep component trees
- Porting agents as mechanical task (no redesign) kept Phase 3 fast

### What Was Inefficient
- Library system required 4 plans in Phase 2 — more complex than initially scoped
- Some phase SUMMARYs lacked requirements_completed frontmatter

### Key Lessons
1. Source-agnosticism pays for itself immediately — the design system transition proved the architecture
2. Mechanical porting (copy + adapt contract) is fast and safe when contracts are locked

---

## Milestone: v1.1 — Ambient Mode & Iteration

**Shipped:** 2026-04-03
**Phases:** 7 | **Plans:** 11

### What Was Built
- Ambient activation via path-specific rule in Prototype Playground context
- Draft/commit amendment model: [PENDING]/[COMMITTED] lifecycle with builder filter
- Git branch session management: watson/{slug} branches, inactive cleanup, session history tracking
- Interaction agent (Agent 3): structures discuss context + library defaults into INTERACTION.md
- 3-agent parallel dispatch: layout, design, and interaction agents run simultaneously per section
- Integration hardening: blueprintPath resolution, git show STATUS.md, traceability backfill

### What Worked
- Gap closure phases (11, 12) were surgical and fast — small follow-up phases for audit findings are cheap
- Quick task for post-audit fixes — `/gsd:quick` handled 3 integration fixes without phase ceremony
- SKILL.md 200-line budget forced clean separation: all git mechanics in watson-init.md, routing-only in SKILL.md
- Interaction agent Figma MCP refactor (Phase 10) — removing layoutPath/designPath dependency enabled true parallel dispatch

### What Was Inefficient
- Phase 06 required re-verification after gap closure (06-02) — initial approach (paths: in frontmatter) broke slash command registration
- SUMMARY frontmatter requirements_completed was missing for phases 06-09 — required Phase 12 backfill
- Milestone audit flagged sections_built as never populated — should have been caught during Phase 8 verification

### Patterns Established
- Session toggle via state file: write on load, delete on deactivate/session-end
- AskUserQuestion gate in path-specific rules for ambient activation
- [PENDING]/[COMMITTED] marker lifecycle for exploratory vs locked decisions
- Mid-session switch cross-references existing sequences (avoids duplication under line budgets)
- Action string tracking in subskills for session history

### Key Lessons
1. `paths:` in SKILL.md frontmatter makes skills ambient-only — breaks slash command registration. Use ~/.claude/rules/ instead.
2. Instrument state tracking (sections_built, last_activity) at the point of mutation, not just initialization — init without update is an orphaned field
3. Gap closure phases should be budgeted into the milestone plan — v1.1 needed 2 extra phases (11, 12) for audit findings
4. 200-line SKILL.md budget is a forcing function for clean architecture — every time it gets tight, it reveals logic that belongs in a utility file

### Cost Observations
- Model mix: ~70% opus (orchestration, verification), ~30% sonnet (execution, research agents)
- Timeline: 2 days for 7 phases — rapid execution enabled by locked contracts from Watson 1.0
- Notable: Phases 11 and 12 were gap-closure phases added after milestone audit — audit-driven cleanup is now a validated pattern

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Timeline | Key Change |
|-----------|--------|-------|----------|------------|
| Loupe v1.0 | 5 | 10 | 2 days | Schema-first development, aggressive scope deferral |
| Watson 1.0 | 5 | 15 | 3 days | Source-agnostic library system, mechanical agent porting |
| Watson 1.1 | 7 | 11 | 2 days | Audit-driven gap closure phases, quick tasks for small fixes |

### Top Lessons (Verified Across Milestones)

1. Lock artifact contracts before writing implementations — prevents drift in multi-agent systems (v1.0, Watson 1.0)
2. Defer high-risk features rather than blocking core delivery (v1.0 Agent 3 → v1.1)
3. Instrument state tracking at the point of mutation, not just initialization (v1.1 sections_built)
4. Gap closure phases are cheap and should be expected — audit-then-fix is a validated pattern (v1.0, v1.1)
5. Line budgets on orchestrator files force clean architecture — tight limits reveal misplaced logic (v1.1 SKILL.md)
