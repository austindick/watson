---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: planning
stopped_at: Completed 19-03-PLAN.md
last_updated: "2026-04-09T20:17:12.830Z"
last_activity: 2026-04-09 — v1.3 roadmap written, 21 requirements mapped across 4 phases
progress:
  total_phases: 7
  completed_phases: 7
  total_plans: 14
  completed_plans: 14
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-09)

**Core value:** Every prototype decision is grounded in real context and traceable from idea through prototype to production spec.
**Current focus:** v1.3 User Experience & Commands — Phase 16: Opt-in Activation Model

## Current Position

Phase: 16 of 19 (Opt-in Activation Model)
Plan: Not yet planned
Status: Ready to plan
Last activity: 2026-04-09 — v1.3 roadmap written, 21 requirements mapped across 4 phases

Progress: [░░░░░░░░░░] 0%

## Accumulated Context

### Decisions

- [Phase 13]: Plugin manifest at .claude-plugin/plugin.json; skills nested under skills/core/ (not skills/watson/ — infinite cache recursion)
- [Phase 13]: @-dispatch references resolve correctly in plugin context without prefixing
- [Phase 14]: hooks/ and scripts/ are plugin root siblings; use __dirname in scripts, not CLAUDE_PLUGIN_ROOT env
- [Phase 15]: marketplace.json in separate repo (austindick/austins-stuff); marketplace name must differ from plugin name
- [Phase 15]: Plugin version field removed from plugin.json — causes recursive caching
- [Phase 15]: Agents use absolute paths derived from blueprintPath for .watson/sections/ staging
- [Phase 16-opt-in-activation-model]: Gate uses /tmp/watson-declined.json as session-scoped decline marker (not persistent)
- [Phase 16-opt-in-activation-model]: Tier 0 passthrough narrowed to active-session-only; gate now handles ambient suppression
- [Phase 16-opt-in-activation-model]: Fork question (New/Continue?) comes before branch detection — branch list not checked until user chooses Continue
- [Phase 16-opt-in-activation-model]: Scaffold commit removed from Branch Creation step 7 — first commit deferred to meaningful work (discuss/loupe/save-blueprint)
- [Phase 17-save-blueprint-command]: save-blueprint runs as single-pass analysis (not agent dispatch) because full conversation context is required
- [Phase 17-save-blueprint-command]: [INFERRED] markers removed on user confirmation during discuss bridge — no [CONFIRMED] marker; Watson stays inactive after non-Watson path (no watson-active.json written)
- [Phase 17-save-blueprint-command]: save-blueprint added as explicit shortcut only (not tier-classified); [INFERRED] skip parity with [PENDING] in builder amendment filter
- [Phase 18-recovery-lifecycle-commands]: watson:status is an independent skill (own frontmatter + plugin.json entry) — not dispatched from SKILL.md, ensuring STAT-02 (no Watson activation) by design
- [Phase 18-recovery-lifecycle-commands]: Plugin manifest gains skills array pattern for independently-discoverable skill entries; watson:status is first entry
- [Phase 18-recovery-lifecycle-commands]: Resume always writes watson-active.json (activates Watson) unlike status which is read-only; off flow is silent on checkpoint commit; save-blueprint prompt uses _Not yet defined._ as template-only signal
- [Phase 19-standalone-commands-flexible-entry]: discuss and loupe gain Phase -1 preambles; standalone detection is presence/absence of blueprintPath parameter from caller
- [Phase 19-standalone-commands-flexible-entry]: Conditional activation: only write watson-active.json on watson/* branches; off watson/* branches run capability without session tracking
- [Phase 19-standalone-commands-flexible-entry]: Standalone chain in discuss.md surfaces /watson:loupe pointer instead of auto-dispatching; SKILL.md continues to own the discuss->loupe chain
- [Phase 19-standalone-commands-flexible-entry]: direct-input mode added to watson-init as Phase 0C; SKILL.md Path B routes pasted flexible input to direct-input with offerConversion: true; colon-variants documented as bypassing SKILL.md
- [Phase 19-standalone-commands-flexible-entry]: targetFilePath auto-resolved in Phase -1 via protoDir probe (index.tsx -> sole .tsx -> STATUS.md -> null); Phase 3 consumes it if set
- [Phase 19-standalone-commands-flexible-entry]: Branch search in url/slug handlers is unrestricted (all branches, not just watson/*) enabling prototype/* and other naming conventions
- [Phase 19-standalone-commands-flexible-entry]: Health check scaffold offer uses AskUserQuestion with Yes/Cancel — explicit pattern matches Phase 0C directory handler

### Pending Todos

5 pending:
- Enforce Slate token resolution for novel component riffs (blocked on Slate import resolution)
- Blueprint files empty after Loupe build (fix shipped — needs verification with next build)
- Builder imports FauxDS instead of real Slate (fix shipped — Slate availability from Playground TBD)
- `/watson:save` command for non-technical users (feature idea — now formalized as SAVE-* requirements)
- Agent-styled badges (low priority)

### Blockers/Concerns

- Slate import resolution from Playground: `@faire/slate/components/button` doesn't resolve — Playground doesn't list `@faire/slate` as a dependency. Austin is checking with the eng who set this up.

## Session Continuity

Last session: 2026-04-09T20:12:55.422Z
Stopped at: Completed 19-03-PLAN.md
Resume: Run `/gsd:plan-phase 16` to begin planning Phase 16 (Opt-in Activation Model)
