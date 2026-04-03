# Milestones

## v1.1 Ambient Mode & Iteration (Shipped: 2026-04-03)

**Phases completed:** 7 phases, 11 plans
**Timeline:** 2026-04-02 to 2026-04-03 (2 days)
**Requirements:** 20/20 satisfied

**Key accomplishments:**
- Ambient activation via path-specific rule — Watson suggests itself in Prototype Playground context without requiring /watson
- Draft/commit amendment model — [PENDING]/[COMMITTED] lifecycle ensures no design decision is silently locked in; builder skips uncommitted amendments
- Git branch session management — watson/{slug} branches created with user confirmation, inactive branch cleanup, session history tracking with action strings
- Interaction agent (Agent 3) — structures discuss-provided context and library component defaults into INTERACTION.md per section
- 3-agent parallel dispatch — layout, design, and interaction agents run simultaneously per Figma section with unified wait gate
- Integration hardening — blueprintPath resolution via inline derivation, git show for STATUS.md reads, requirements traceability backfill across phases 06-09

**Tech debt accepted:**
- 9 human verification tests pending (ambient gate, Tier 0 passthrough, session resume gate — require live Playground sessions)
- 6/7 phases not fully Nyquist compliant
- sections_built field update added via quick task post-audit

**Archive:** `milestones/v1.1-ROADMAP.md`, `milestones/v1.1-REQUIREMENTS.md`, `milestones/v1.1-MILESTONE-AUDIT.md`

---

## Watson 1.0 Foundation (Shipped: 2026-04-01)

**Phases completed:** 5 phases, 15 plans, 0 tasks

**Key accomplishments:**
- (none recorded)

---

## v1.0 Loupe Pipeline (Shipped: 2026-03-26)

**Phases completed:** 5 phases, 10 plans, 20 tasks
**Timeline:** 2026-03-25 to 2026-03-26 (2 days)
**Requirements:** 35/44 satisfied, 9 deferred (Agent 3 / Interactions — follow-up milestone)

**Key accomplishments:**
- Skill directory skeleton with locked artifact schemas — every agent writes to a known contract
- Agent 0 (Decomposer) fetches Figma frames via MCP, identifies sections by `::section` tags or heuristic fallback
- Agents 1 (Layout) and 2 (Tokens) run in parallel, producing schema-compliant LAYOUT.md and DESIGN.md from real Figma data
- Agent 4 (Builder) generates compilable code with zero hardcoded values — every property traces to a spec file
- Agent 5 (Reviewer) fixes discrepancies in-place with property-by-property checklist
- Agent 6 (Consolidator) merges section-level files into project-level `.loupe/` vocabulary that extends on subsequent runs
- Full pipeline wired end-to-end: `/loupe [url]` → decompose → research → build → review → consolidate
- Watson-to-Loupe integration wired via Skill tool invocation

**Known gaps (deferred by design):**
- INTR-01 through INTR-07: Agent 3 (Interactions) — deferred to follow-up milestone
- PARA-01, PARA-03: 3-agent parallel dispatch — requires Agent 3

**Archive:** `milestones/v1.0-ROADMAP.md`, `milestones/v1.0-REQUIREMENTS.md`, `milestones/v1.0-MILESTONE-AUDIT.md`

---

