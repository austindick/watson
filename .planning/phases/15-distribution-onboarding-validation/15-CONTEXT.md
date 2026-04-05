# Phase 15: Distribution + Onboarding + Validation - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Get Watson into teammates' hands — GitHub repo live, install flow working, onboarding README complete, both fresh install and author migration verified. No new Watson capabilities — this is distribution and validation only.

</domain>

<decisions>
## Implementation Decisions

### Install Flow
- One command: `claude plugin add austindick/watson`
- Public repo (austindick/watson) — no GITHUB_TOKEN needed, zero auth friction
- Prerequisites drop to: Figma MCP configured + Claude Code installed
- First run is "just launch and go" — session-start script handles ambient rule auto-copy and statusLine auto-write
- Teammates launch from `~/faire/frontend` (monorepo), not a standalone playground dir

### Playground Integration
- Add `austindick/watson` to enabledPlugins in the Playground's `.claude/settings.json`
- Commit enabledPlugins only AFTER validation passes (not before)
- Non-installers see nothing — entry is silently ignored if plugin not installed

### README Content
- Minimal quickstart — scannable by designers and PMs, not engineers
- Beta badge at top: "> Beta — internal Faire tool"
- Inline 3-step Figma MCP setup instructions (not a link to external docs)
- 2-3 troubleshooting items for common failure modes
- "DM Austin in Slack" as fallback support channel
- No architecture details, no advanced usage — keep it short

### Validation Strategy
- Sequence: push repo → author migration (VALD-02) → beta tester fresh install (VALD-01) → commit enabledPlugins → share with broader team
- VALD-01 (fresh install): real test on a beta tester's machine, not simulated. Pass = they follow README and Watson works without your help
- VALD-02 (author migration): self-test with checklist — no double-firing hooks, /watson:watson works, statusLine shows, old skill files not interfering
- Specific beta tester(s) hand-picked for VALD-01 — not a broad Slack blast

### Auto-Update Flow
- Silent auto-update — Claude Code handles plugin updates when version bumps in plugin.json
- Slack the beta group only for breaking changes (e.g., new Figma MCP version required)
- No changelog posts for routine updates

### Versioning
- Bump plugin.json version on every push to main — no unbumped pushes
- Patch for fixes/tweaks (1.2.0 → 1.2.1), minor for features (1.2.1 → 1.3.0), major for breaking changes
- Library books ship with plugin version — no separate book versioning
- Book regeneration = patch bump like any other change

### Claude's Discretion
- Exact troubleshooting items to include in README (based on likely failure modes)
- Figma MCP inline setup step wording
- enabledPlugins commit message and timing within the Playground repo
- Whether to include a CHANGELOG.md in the repo (low priority)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.claude-plugin/plugin.json`: manifest already exists with name=watson, version=1.2.0
- `hooks/hooks.json`: plugin hooks already wired for SessionStart and SessionEnd
- `scripts/watson-session-start.js`: first-run detection already implemented (ambient rule auto-copy, statusLine auto-write)
- `scripts/watson-session-end.js`: session preservation script already bundled
- `scripts/watson-statusline.js`: statusline script already forked and bundled

### Established Patterns
- `${CLAUDE_PLUGIN_ROOT}` path convention throughout all skill files (Phase 13)
- `/tmp/watson-active.json` and `/tmp/watson-session-end.json` as cross-boundary state files
- First-run idempotent checks in session-start.js (Phase 14)

### Integration Points
- `~/faire/frontend/.claude/settings.json` — target for enabledPlugins entry (post-validation)
- `~/.claude/rules/watson-ambient.md` — auto-copied by session-start on first run
- GitHub: austindick/watson repo (needs to be created/made public)

</code_context>

<specifics>
## Specific Ideas

- Public repo eliminates the single biggest onboarding friction point (GITHUB_TOKEN setup)
- "Just launch and go" — the ideal is zero steps after `claude plugin add`
- Beta tester validation is the real test — if they can follow the README without help, it works
- enabledPlugins gated behind validation success — don't touch shared settings until proven

</specifics>

<deferred>
## Deferred Ideas

- Go private again if external visibility becomes a concern — start public for frictionless beta
- CHANGELOG.md for version history — add if update frequency warrants it
- Automated validation script for VALD-01/VALD-02 — add if manual checklist proves insufficient
- Broader team rollout strategy (Slack channel, team demo) — after beta validates

</deferred>

---

*Phase: 15-distribution-onboarding-validation*
*Context gathered: 2026-04-05*
