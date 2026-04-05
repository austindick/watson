# Phase 14: Hook Migration + Script Bundling - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Move Watson's session lifecycle hooks from the author's personal settings.json into the plugin's hooks/hooks.json. Fork the statusline script into the plugin with Watson + share-proto support. Clean up author's settings.json to remove migrated Watson hooks. Add first-run setup detection for new teammates.

</domain>

<decisions>
## Implementation Decisions

### StatusLine strategy
- Fork `share-proto-statusline.js` into `scripts/watson-statusline.js` in the plugin
- Include share-proto tunnel link check (reads `/tmp/share-proto.json` — no-op if share-proto isn't active)
- Strip the standalone local dev server link (lines 76-87 of current script) — not needed
- Keep: model, dir, git branch, context bar, share-proto tunnel links, Watson active indicator
- Everyone (author + teammates) points settings.json statusLine to the plugin's script
- Author's personal `share-proto-statusline.js` becomes unused after migration

### Hook command format
- Plugin hooks.json references bundled script files, not inline commands
- Three scripts in `scripts/`: `watson-session-start.js`, `watson-session-end.js`, `watson-statusline.js`
- hooks.json uses `${CLAUDE_PLUGIN_ROOT}` in command paths (consistent with Phase 13 path convention)

### Settings.json cleanup
- Automated in-plan: programmatically read settings.json, remove Watson hook entries, update statusLine pointer — single atomic edit
- Remove: Watson SessionStart hook (recovery notification) and Watson SessionEnd hook (branch+actions preservation)
- Keep: GSD SessionStart (`gsd-check-update.js`), GSD PostToolUse (`gsd-context-monitor.js`)
- Update: statusLine to point to plugin's `watson-statusline.js`

### First-run teammate setup
- `watson-session-start.js` handles first-run detection — idempotent checks every session, silent when already configured
- **Ambient rule**: auto-copy `watson-ambient.md` from plugin's `references/` to `~/.claude/rules/` if missing; echo confirmation; skip silently if already exists
- **StatusLine**: auto-write statusLine config to `~/.claude/settings.json` if not already pointing to Watson; read-modify-write approach
- **Recovery notification**: existing logic — check `/tmp/watson-active.json` and echo recovery message if found

### Claude's Discretion
- Exact hooks.json schema (event format, array structure)
- StatusLine auto-write safety checks (e.g., JSON parse error handling, backup before write)
- watson-session-end.js internal structure (port of current inline Node one-liner to proper script)
- Whether to add a `--skip-setup` flag or env var to suppress first-run checks

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `~/.claude/hooks/share-proto-statusline.js`: Base for watson-statusline.js fork — 117 lines, well-structured with OSC 8 link helper, port check, share-proto state reading, Watson indicator
- Current SessionStart hook: simple bash one-liner checking `/tmp/watson-active.json`
- Current SessionEnd hook: Node one-liner that saves branch+actions to `/tmp/watson-session-end.json` and cleans up

### Established Patterns
- `/tmp/watson-active.json` and `/tmp/watson-session-end.json` as cross-boundary state files — no changes needed
- `${CLAUDE_PLUGIN_ROOT}` substitution pattern established in Phase 13
- `settings.json` hooks structure: array of event objects, each with `hooks` array of `{type, command}` entries

### Integration Points
- `hooks/hooks.json` in plugin root — Claude Code reads this for plugin hooks
- `scripts/` directory in plugin — new directory for bundled JS files
- `~/.claude/settings.json` — author's file, needs Watson entries removed and statusLine updated
- `~/.claude/rules/watson-ambient.md` — first-run auto-copy target
- `references/watson-ambient.md` in plugin — source for auto-copy

</code_context>

<specifics>
## Specific Ideas

- Share-proto will eventually fold into Watson as a subskill — naming as `watson-statusline.js` anticipates this
- "Zero manual steps" from Phase 13 context — first-run auto-copy and auto-write deliver on this
- Author's migration is a superset: hooks removal + statusLine update + existing personal script becomes unused

</specifics>

<deferred>
## Deferred Ideas

- Fold share-proto skill into Watson as a subskill — future milestone
- StatusLine per-segment plugin composition (if Claude Code adds multi-script statusLine support) — monitor ecosystem
- `--skip-setup` flag for CI/automation environments — add if needed

</deferred>

---

*Phase: 14-hook-migration-script-bundling*
*Context gathered: 2026-04-05*
