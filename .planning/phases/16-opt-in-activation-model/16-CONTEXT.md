# Phase 16: Opt-in Activation Model - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Watson never interrupts a user who didn't ask for it. When users do invoke Watson, startup is fast, intentional, and free of noisy setup commits. This phase rewires activation, startup sequence, and commit timing — no new Watson capabilities.

</domain>

<decisions>
## Implementation Decisions

### Ambient rule removal
- Delete `watson-ambient.md` auto-install logic from `watson-session-start.js`
- `watson-session-start.js` actively removes old `~/.claude/rules/watson-ambient.md` on upgrade, echoes "⚙️ Watson ambient rule removed — Watson is now opt-in only."
- Keep `watson-ambient.md` in `references/` as documentation only — no longer auto-installed or functional
- No ambient rule means no path-based auto-triggering in the Playground

### Description-match gate (ACTV-01/02)
- SKILL.md description stays broad ("build a prototype", "design discussion", etc.) for discoverability
- Gate logic at very top of SKILL.md, before everything else:
  1. Check `/tmp/watson-declined.json` — if exists, exit silently
  2. Check if user message contains `/watson` — if yes, explicit invocation, skip gate
  3. Otherwise description-match: show AskUserQuestion gate
- Gate wording: header "Watson", question "Want Watson's help with this?", options: "Yes, activate Watson" / "Not right now" / "No, don't ask again this session"
- "Not right now" — Watson exits, may ask again on future description matches
- "No, don't ask again" — writes `/tmp/watson-declined.json`, Watson silently exits on all future description matches this session
- Explicit `/watson` always works regardless of decline marker — marker only suppresses description-match activations
- Gate replaces Tier 0 passthrough for non-explicit activations; Tier 0 narrows to active-session message routing only (no behavioral change when Watson is already active)

### Startup sequence reorder (ACTV-03/04/06)
- New order after activation:
  1. Gate check (description-match only — skipped for explicit `/watson`)
  2. Write `/tmp/watson-active.json` (moved from "on load" to after confirmation)
  3. Display banner (`watson-banner.md`)
  4. 2-path fork: "New prototype or continue existing?" — first interactive question (ACTV-03)
  5. Session recovery + housekeeping runs after fork, scoped to the chosen path (ACTV-04)
- State file (`/tmp/watson-active.json`) written only after user confirms activation — not on SKILL.md load. Recovery message only fires when Watson was genuinely active.
- "Continue" path: single bash script batches session recovery + branch list + STATUS.md reads + last-commit dates into one terminal block (ACTV-06)
- "New" path: setup questions remain as 4 fields (surface area, owner, GitHub, description)

### Deferred scaffold commit (ACTV-05)
- watson-init creates branch and scaffolds 5 blueprint files synchronously — no commit
- Scaffold is just 5 Write calls (~2-3 seconds), no backgrounding needed
- First commit happens organically when discuss/loupe/save-blueprint writes and commits their changes — scaffold files get swept up by `git add blueprint/`
- No separate "scaffold commit" ever exists — the initialize blueprint commit is eliminated
- Auto-commit guard (existing) catches uncommitted files on branch switch — safety net for session-end
- Agents are unaware they might be making the first commit — no special first-commit logic
- No commit message changes — discuss/loupe use their existing commit messages
- Exception: `contributors.ts` changes (adding new user) committed immediately since it's shared state, not blueprint

### Claude's Discretion
- Exact gate check implementation (how to detect `/watson` in user message)
- `/tmp/watson-declined.json` file format (can be empty or minimal JSON)
- Batched bash script structure for "Continue" path branch listing
- How to handle concurrent session edge cases (multiple Claude Code windows)
- watson-session-start.js old-rule removal error handling

</decisions>

<code_context>
## Existing Code Insights

### Files Requiring Changes
- `skills/core/SKILL.md`: Gate logic at top, state file write moved, startup sequence reordered, Tier 0 narrowed
- `skills/core/utilities/watson-init.md`: Remove `git add blueprint/ && git commit` from branch creation, keep scaffold writes
- `scripts/watson-session-start.js`: Remove ambient rule auto-copy logic, add old-rule removal + notification
- `skills/core/references/watson-ambient.md`: Stays as documentation only — no functional changes needed

### Reusable Assets
- Auto-commit guard in `watson-init.md`: Already handles uncommitted files on branch switch — serves as safety net for deferred commit
- `/tmp/watson-active.json`: Session state pattern already established — `/tmp/watson-declined.json` follows same convention
- AskUserQuestion pattern: Used throughout Watson for structured choices — gate follows existing UX pattern

### Established Patterns
- `/tmp/` files for session-scoped state (watson-active.json, watson-session-end.json)
- `watson-session-start.js` as first-run setup handler (Phase 14) — adding old-rule removal follows same pattern
- SKILL.md routing: tier classification already structured for adding gate logic at top

### Integration Points
- `~/.claude/rules/watson-ambient.md` on existing installs — session-start.js removes it on upgrade
- `src/config/contributors.ts` — immediate commit exception (shared state)
- `scripts/watson-session-start.js` — first-run setup + recovery notification + now old-rule cleanup

</code_context>

<specifics>
## Specific Ideas

- "I'd like to branch immediately, and then run the scaffolding with a background agent so users can begin discussing without waiting" — explored but scaffolding is only ~2-3 seconds (5 file writes, no commit). Background deemed unnecessary; synchronous scaffold without commit is the sweet spot.
- Decline marker (`/tmp/watson-declined.json`) is session-scoped via /tmp/ — naturally cleaned up on restart, no explicit cleanup needed.
- Old ambient rule auto-removal on upgrade aligns with Phase 13/14's "zero manual steps" principle.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 16-opt-in-activation-model*
*Context gathered: 2026-04-09*
