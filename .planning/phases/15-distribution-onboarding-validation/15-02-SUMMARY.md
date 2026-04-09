---
phase: 15-distribution-onboarding-validation
plan: 02
status: complete
started: 2026-04-05
completed: 2026-04-07
requirements-completed: [VALD-01, VALD-02]
---

# Summary: Validation (15-02)

## What was done

### Task 1: Author migration (VALD-02) — PASSED
- Plugin installs via marketplace (`/plugin marketplace add` + `/plugin install`)
- `/watson` resolves and activates after restart
- `/tmp/watson-active.json` created on activation
- StatusLine shows Watson status
- `/clear` writes `/tmp/watson-session-end.json` for session recovery
- No double-firing of recovery notifications
- Old `~/.claude/skills/watson/` removed, no conflicts
- Ambient rule at `~/.claude/rules/watson-ambient.md` triggers Watson suggestion in Playground

### Task 2: Beta tester fresh install (VALD-01) — PASSED
- Colleague followed README install instructions
- `/watson` invocable after full Claude Code restart
- Only hiccup: `/reload-plugins` alone was insufficient — full restart required (now documented in README)
- No coaching needed from author beyond what README provides

### Task 3: enabledPlugins commit — DEFERRED
- Deferred to future broader rollout (tracked as pending todo)
- Enables Watson for all Playground users, not just beta testers — premature at this stage

## Deviations

- **enabledPlugins skipped:** Plan called for committing to Playground settings after validation. Deferred because it would auto-enable Watson for everyone in the repo, not just opt-in beta testers. Tracked as a separate todo for broader rollout.
- **Marketplace architecture changed significantly:** Plugin name/marketplace name collision caused infinite recursive caching. Resolved by separating marketplace into its own repo (`austindick/austins-stuff`) with a different name from the plugin (`watson`). Skill directory renamed from `skills/watson/` to `skills/core/` for the same reason.
- **Install flow requires full restart:** `/reload-plugins` doesn't rebuild the skill registry. Documented in README.

## Bug fixes shipped during validation

- Blueprint files empty after Loupe build (absolute path resolution for `.watson/sections/`)
- Builder imports FauxDS instead of real Slate (library import preference with compile fallback)
- Watson Tier 1 routing for ambiguous questions (prevent inline handling of design questions)
- Blueprint path discovery (find blueprint dynamically instead of assuming repo root)
- Pull main before branching (prevent stale local main)
- Mandatory reviewer step enforcement in Loupe pipeline
- Rationalization prevention tables added to builder, reviewer, and orchestrator

## Key files

- `README.md` — updated install flow with restart requirement
- `.claude-plugin/plugin.json` — plugin manifest (no version field to prevent recursive caching)
- `skills/core/SKILL.md` — banner, red flags table, blueprint discovery
- `skills/core/utilities/watson-init.md` — blueprint discovery, pull-before-branch
- `skills/core/agents/builder.md` — red flags, import resolution, absolute paths
- `skills/core/agents/reviewer.md` — red flags
- `skills/core/docs/guide.md` — full rewrite for plugin architecture
- `skills/core/docs/architecture.md` — full rewrite for plugin architecture
- `skills/core/docs/maintainer.md` — full rewrite for plugin architecture
