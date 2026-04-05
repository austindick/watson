# Phase 14: Hook Migration + Script Bundling - Research

**Researched:** 2026-04-05
**Domain:** Claude Code plugin hooks.json, Node.js script authoring, settings.json programmatic editing
**Confidence:** HIGH

## Summary

Phase 14 moves Watson's session lifecycle hooks from the author's personal `~/.claude/settings.json` into the plugin's `hooks/hooks.json`. This eliminates the personal-config dependency, makes Watson self-contained, and enables clean teammate onboarding. Three companion scripts move into the plugin's `scripts/` directory.

The plugin system is well-understood from official docs (fetched live). The hooks.json format is confirmed: a top-level wrapper object with a `hooks` key containing event arrays. `${CLAUDE_PLUGIN_ROOT}` is available in all hook commands and resolves to the plugin's installation directory at runtime. StatusLine is NOT configurable from hooks.json — it remains a settings.json-only field — so the `watson-statusline.js` script must be referenced from the user's settings.json (author migrates; teammates auto-configured by watson-session-start.js first-run logic).

The current plugin root is `/Users/austindick/watson` (one level above `.claude-plugin/`). All new directories (`hooks/`, `scripts/`, `references/`) must be created at the plugin root, not inside `.claude-plugin/`.

**Primary recommendation:** Create `hooks/hooks.json` at plugin root using the confirmed schema, write three scripts to `scripts/`, programmatically clean settings.json with a Node.js read-modify-write, and bundle `watson-ambient.md` as `references/watson-ambient.md` in the plugin skill.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**StatusLine strategy:**
- Fork `share-proto-statusline.js` into `scripts/watson-statusline.js` in the plugin
- Include share-proto tunnel link check (reads `/tmp/share-proto.json` — no-op if share-proto isn't active)
- Strip the standalone local dev server link (lines 76-87 of current script) — not needed
- Keep: model, dir, git branch, context bar, share-proto tunnel links, Watson active indicator
- Everyone (author + teammates) points settings.json statusLine to the plugin's script
- Author's personal `share-proto-statusline.js` becomes unused after migration

**Hook command format:**
- Plugin hooks.json references bundled script files, not inline commands
- Three scripts in `scripts/`: `watson-session-start.js`, `watson-session-end.js`, `watson-statusline.js`
- hooks.json uses `${CLAUDE_PLUGIN_ROOT}` in command paths (consistent with Phase 13 path convention)

**Settings.json cleanup:**
- Automated in-plan: programmatically read settings.json, remove Watson hook entries, update statusLine pointer — single atomic edit
- Remove: Watson SessionStart hook (recovery notification) and Watson SessionEnd hook (branch+actions preservation)
- Keep: GSD SessionStart (`gsd-check-update.js`), GSD PostToolUse (`gsd-context-monitor.js`)
- Update: statusLine to point to plugin's `watson-statusline.js`

**First-run teammate setup:**
- `watson-session-start.js` handles first-run detection — idempotent checks every session, silent when already configured
- **Ambient rule**: auto-copy `watson-ambient.md` from plugin's `references/` to `~/.claude/rules/` if missing; echo confirmation; skip silently if already exists
- **StatusLine**: auto-write statusLine config to `~/.claude/settings.json` if not already pointing to Watson; read-modify-write approach
- **Recovery notification**: existing logic — check `/tmp/watson-active.json` and echo recovery message if found

### Claude's Discretion
- Exact hooks.json schema (event format, array structure)
- StatusLine auto-write safety checks (e.g., JSON parse error handling, backup before write)
- watson-session-end.js internal structure (port of current inline Node one-liner to proper script)
- Whether to add a `--skip-setup` flag or env var to suppress first-run checks

### Deferred Ideas (OUT OF SCOPE)
- Fold share-proto skill into Watson as a subskill — future milestone
- StatusLine per-segment plugin composition (if Claude Code adds multi-script statusLine support) — monitor ecosystem
- `--skip-setup` flag for CI/automation environments — add if needed
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HOOK-01 | Watson SessionStart hook (recovery notification) fires from plugin hooks/hooks.json, not personal settings.json | Confirmed: SessionStart is a first-class plugin hook event. hooks.json at plugin root. `${CLAUDE_PLUGIN_ROOT}/scripts/watson-session-start.js` as command. |
| HOOK-02 | Watson SessionEnd hook (branch+actions preservation) fires from plugin hooks/hooks.json, not personal settings.json | Confirmed: SessionEnd is a first-class plugin hook event. hooks.json at plugin root. `${CLAUDE_PLUGIN_ROOT}/scripts/watson-session-end.js` as command. |
| HOOK-03 | Watson hooks are removed from author's settings.json without affecting non-Watson hooks (GSD, share-proto) | Pattern: Node.js read-modify-write on `~/.claude/settings.json`. Splice only Watson entries; GSD hooks and PostToolUse stay. Atomic JSON rewrite. |
| HOOK-04 | StatusLine script is bundled in the plugin (forked from share-proto-statusline.js, Watson-only logic) | Confirmed: `scripts/watson-statusline.js` at plugin root. StatusLine is settings.json-only; auto-write via watson-session-start.js first-run logic handles both author migration and teammate onboarding. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js built-ins (`fs`, `path`, `child_process`, `net`) | system | All three scripts use only stdlib | No npm dependencies; plugin scripts run without install step |
| hooks.json (Claude Code plugin format) | current | Declare plugin lifecycle hooks | First-class plugin component; merges with user hooks automatically |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `${CLAUDE_PLUGIN_ROOT}` env variable | runtime | Plugin-relative paths in hook commands | All hook command paths must use this |
| `${CLAUDE_PLUGIN_DATA}` env variable | runtime | Persistent data across plugin updates | Not needed for Phase 14 (no npm dependencies) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Bundled scripts in `scripts/` | Inline bash one-liners in hooks.json | Inline is harder to read and debug; scripts are testable independently and match existing share-proto-statusline.js pattern |
| Node.js read-modify-write for settings.json | Manual cleanup instructions | Automated is zero-friction, satisfies HOOK-03 requirement |

## Architecture Patterns

### Plugin Directory Structure After Phase 14
```
watson/                          ← plugin root (--plugin-dir target)
├── .claude-plugin/
│   └── plugin.json              ← manifest (name: watson)
├── hooks/
│   └── hooks.json               ← NEW: SessionStart + SessionEnd
├── scripts/
│   ├── watson-session-start.js  ← NEW: recovery notification + first-run setup
│   ├── watson-session-end.js    ← NEW: branch+actions preservation + cleanup
│   └── watson-statusline.js     ← NEW: forked from share-proto-statusline.js
├── skills/
│   └── watson/
│       ├── references/
│       │   └── watson-ambient.md  ← source for first-run auto-copy
│       └── ... (existing)
└── ... (existing)
```

### Pattern 1: hooks.json Schema (confirmed from official docs)

**What:** Top-level wrapper object with `hooks` key containing event name arrays.

**When to use:** All plugin hook declarations.

```json
// Source: https://code.claude.com/docs/en/plugins-reference
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/watson-session-start.js\""
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/watson-session-end.js\""
          }
        ]
      }
    ]
  }
}
```

**Key detail:** No `matcher` field is required for SessionStart/SessionEnd (unlike PostToolUse which matches tool names). Omit matcher or use `"matcher": "*"` — both are valid.

### Pattern 2: Node.js settings.json Read-Modify-Write

**What:** Safe atomic edit pattern for `~/.claude/settings.json`.

**When to use:** watson-session-start.js first-run setup (statusLine auto-write), and the standalone migration script for the author's settings.json cleanup.

```javascript
// Safe read-modify-write pattern
const fs = require('fs');
const SETTINGS_PATH = require('os').homedir() + '/.claude/settings.json';

function editSettings(mutate) {
  let settings = {};
  try {
    settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
  } catch (e) {
    if (e.code !== 'ENOENT') throw e; // missing file is fine, parse error is not
  }
  mutate(settings);
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n');
}
```

**Safety considerations (Claude's discretion area):**
- Catch `SyntaxError` separately from `ENOENT` — a corrupt settings.json should stop the script, not silently overwrite
- Claude Code auto-detects file changes and reloads; no restart needed after write
- Claude Code creates automatic timestamped backups; but writing a local backup before mutation is belt-and-suspenders for the author's migration

### Pattern 3: First-Run Idempotency Guard

**What:** Check-before-act pattern in watson-session-start.js for each setup action.

**When to use:** Every first-run action (ambient rule copy, statusLine write).

```javascript
// Ambient rule: copy only if missing
const RULES_DIR = require('os').homedir() + '/.claude/rules';
const RULE_TARGET = RULES_DIR + '/watson-ambient.md';
const RULE_SOURCE = process.env.CLAUDE_PLUGIN_ROOT + '/skills/watson/references/watson-ambient.md';

if (!fs.existsSync(RULE_TARGET)) {
  fs.mkdirSync(RULES_DIR, { recursive: true });
  fs.copyFileSync(RULE_SOURCE, RULE_TARGET);
  console.log('Watson: ambient rule installed to ~/.claude/rules/watson-ambient.md');
}
// else: silent skip
```

### Pattern 4: watson-session-end.js (port of inline one-liner)

**What:** Expand the current inline Node.js one-liner into a standalone script.

**Current inline command (in settings.json):**
```javascript
node -e "const fs=require('fs'); const f='/tmp/watson-active.json'; if(!fs.existsSync(f)) process.exit(0); try { const s=JSON.parse(fs.readFileSync(f,'utf8')); if(s.branch) fs.writeFileSync('/tmp/watson-session-end.json', JSON.stringify({branch:s.branch,actions:s.actions||[],timestamp:new Date().toISOString()})); fs.unlinkSync(f); } catch(e) { try { fs.unlinkSync(f); } catch(e2) {} }"
```

**Port to script:** Same logic, expanded to readable function form. No behavior changes.

### Pattern 5: watson-statusline.js Fork

**What:** Copy `~/.claude/hooks/share-proto-statusline.js`, remove lines 76-87 (standalone dev server block), keep everything else.

**Lines to remove (confirmed from source read):**
```javascript
// Standalone local dev server link (per-tab, independent of /share-proto)
if (!proto) {
  const devFile = `/tmp/share-proto-dev-${process.ppid}.json`;
  if (fs.existsSync(devFile)) {
    try {
      const dev = JSON.parse(fs.readFileSync(devFile, 'utf8'));
      if (dev.port && await portOpen(dev.port)) {
        const localUrl = `http://localhost:${dev.port}${dev.path || ''}`;
        proto = ` \x1b[2m│\x1b[0m \x1b[36m${link(localUrl, 'Local')}\x1b[0m`;
      }
    } catch (e) {}
  }
}
```

**Keep:** OSC 8 link helper, port check, stdin JSON parsing, context bar, share-proto tunnel links, git branch, Watson active indicator, model + dir display.

### Anti-Patterns to Avoid

- **Putting hooks/ inside .claude-plugin/**: Only `plugin.json` belongs in `.claude-plugin/`. The `hooks/` directory must be at the plugin root. Official docs warn this is the most common structure mistake.
- **Using matcher field for SessionStart/SessionEnd**: Unlike PostToolUse, session events don't have a meaningful matcher target. Omit or use `"*"`.
- **Inline Node one-liners in hooks.json**: Hard to debug, maintain, and test. Always reference external scripts.
- **Absolute paths in hook commands**: Use `${CLAUDE_PLUGIN_ROOT}` — absolute paths break when plugin is installed to a different machine.
- **Silently swallowing JSON parse errors in settings.json edit**: A corrupt settings.json should throw, not produce a blank settings object. Distinguish `ENOENT` from `SyntaxError`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Hook firing deduplication | Custom locking / PID tracking | Plugin hooks.json + settings.json cleanup | Plugin hooks only fire when plugin is loaded; removing Watson hook from settings.json is the correct fix for double-fire |
| StatusLine registration | Plugin-side injection of statusLine | Manual settings.json write in watson-session-start.js | statusLine is settings.json-only; plugin hooks.json cannot configure it |
| Backup before settings edit | Custom backup utility | Claude Code's built-in timestamped backup + single `.bak` write | Claude Code auto-backups; one `.bak` is sufficient belt-and-suspenders for the migration script |

**Key insight:** The plugin system handles hook merging automatically. The only manual step is removing the Watson hooks from settings.json — which is straightforward surgical JSON editing.

## Common Pitfalls

### Pitfall 1: Double-Firing After Migration
**What goes wrong:** If settings.json still has the Watson SessionStart hook AND hooks.json defines it, both fire on session start.
**Why it happens:** Forgetting to remove the Watson hook from settings.json, or testing the new hooks.json before running the cleanup script.
**How to avoid:** The settings.json cleanup must run atomically as part of the same plan step that creates hooks.json. Verify by checking `/tmp/watson-active.json` notification appears exactly once.
**Warning signs:** Two "Watson was active before /clear" messages on session start.

### Pitfall 2: Plugin Root vs .claude-plugin Directory Confusion
**What goes wrong:** Placing `hooks/` or `scripts/` inside `.claude-plugin/` instead of at the plugin root.
**Why it happens:** `.claude-plugin/plugin.json` is the manifest — it feels like the plugin's home. But only `plugin.json` belongs there.
**How to avoid:** Plugin root = the directory you pass to `--plugin-dir`. In Watson's case, that's `/Users/austindick/watson`. All component dirs (`hooks/`, `scripts/`, `skills/`) are siblings of `.claude-plugin/`, not children of it.
**Warning signs:** Claude Code debug output (`claude --debug`) shows no hooks registered despite hooks.json existing.

### Pitfall 3: CLAUDE_PLUGIN_ROOT Unavailable at Runtime
**What goes wrong:** Scripts launched by hooks don't receive `${CLAUDE_PLUGIN_ROOT}` as an environment variable.
**Why it happens:** `${CLAUDE_PLUGIN_ROOT}` is substituted by Claude Code inline in the command string before execution — it is NOT available as an env var inside the running script via `process.env.CLAUDE_PLUGIN_ROOT`.
**How to avoid:** Use `${CLAUDE_PLUGIN_ROOT}` only inside the `"command"` string in hooks.json. Inside the script itself, use `__dirname` to derive relative paths.
**Warning signs:** `process.env.CLAUDE_PLUGIN_ROOT` is undefined inside watson-session-start.js at runtime.

### Pitfall 4: watson-ambient.md Source Path
**What goes wrong:** First-run auto-copy reads from `CLAUDE_PLUGIN_ROOT + '/references/watson-ambient.md'` but the file actually lives at `CLAUDE_PLUGIN_ROOT + '/skills/watson/references/watson-ambient.md'`.
**Why it happens:** watson-ambient.md currently lives in `skills/watson/references/` (existing Watson skill structure). Phase 14 doesn't move it — it's read from there.
**How to avoid:** Use `__dirname` relative path inside watson-session-start.js: `path.join(__dirname, '..', 'skills', 'watson', 'references', 'watson-ambient.md')`.
**Warning signs:** ENOENT error on first session start for new teammates.

### Pitfall 5: statusLine Auto-Write Overwrites Existing Custom Config
**What goes wrong:** watson-session-start.js unconditionally overwrites the user's statusLine setting, replacing a custom script they already configured.
**Why it happens:** Naive write-always approach.
**How to avoid:** Read current settings.json first. Only write statusLine if: (a) it's missing entirely, OR (b) it currently points to `share-proto-statusline.js` (author migration case). If it already points to watson-statusline.js or some other custom script, skip.

## Code Examples

### hooks.json (complete)
```json
// Source: https://code.claude.com/docs/en/plugins-reference
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/watson-session-start.js\""
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/watson-session-end.js\""
          }
        ]
      }
    ]
  }
}
```

### settings.json cleanup script (conceptual structure)
```javascript
// Runs once during Phase 14 plan execution
// Removes Watson hooks, updates statusLine to plugin script
const fs = require('fs');
const os = require('os');
const path = require('path');

const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');
const PLUGIN_ROOT = '/path/to/watson'; // passed as arg or derived

// Read
let raw;
try { raw = fs.readFileSync(SETTINGS_PATH, 'utf8'); }
catch (e) { if (e.code === 'ENOENT') { console.log('settings.json not found'); process.exit(0); } throw e; }

let settings;
try { settings = JSON.parse(raw); }
catch (e) { console.error('settings.json parse error — aborting'); process.exit(1); }

// Backup
fs.writeFileSync(SETTINGS_PATH + '.bak', raw);

// Remove Watson SessionStart hook (the bash if [ -f /tmp/watson-active.json ] one-liner)
if (settings.hooks?.SessionStart) {
  settings.hooks.SessionStart = settings.hooks.SessionStart.filter(group =>
    !group.hooks?.some(h => h.command?.includes('watson-active.json') &&
      !h.command?.includes('gsd'))
  );
}

// Remove Watson SessionEnd hook
if (settings.hooks?.SessionEnd) {
  settings.hooks.SessionEnd = settings.hooks.SessionEnd.filter(group =>
    !group.hooks?.some(h => h.command?.includes('watson-active.json') ||
      h.command?.includes('watson-session-end'))
  );
  if (settings.hooks.SessionEnd.length === 0) delete settings.hooks.SessionEnd;
}

// Update statusLine to plugin script
settings.statusLine = {
  type: 'command',
  command: `node "${PLUGIN_ROOT}/scripts/watson-statusline.js"`
};

// Write
fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n');
console.log('settings.json updated: Watson hooks removed, statusLine updated');
```

### watson-session-start.js structure
```javascript
#!/usr/bin/env node
// watson-session-start.js — SessionStart hook for Watson plugin
// Responsibilities:
//   1. Recovery notification (existing behavior)
//   2. First-run: auto-copy watson-ambient.md to ~/.claude/rules/
//   3. First-run: auto-write statusLine to ~/.claude/settings.json

const fs = require('fs');
const path = require('path');
const os = require('os');

// 1. Recovery notification
const ACTIVE_FILE = '/tmp/watson-active.json';
if (fs.existsSync(ACTIVE_FILE)) {
  console.log('\u26a1 Watson was active before /clear. Run /watson to reactivate.');
}

// 2. Ambient rule auto-copy
const RULES_DIR = path.join(os.homedir(), '.claude', 'rules');
const RULE_TARGET = path.join(RULES_DIR, 'watson-ambient.md');
const RULE_SOURCE = path.join(__dirname, '..', 'skills', 'watson', 'references', 'watson-ambient.md');

if (!fs.existsSync(RULE_TARGET) && fs.existsSync(RULE_SOURCE)) {
  fs.mkdirSync(RULES_DIR, { recursive: true });
  fs.copyFileSync(RULE_SOURCE, RULE_TARGET);
  console.log('Watson: installed ambient rule → ~/.claude/rules/watson-ambient.md');
}

// 3. StatusLine auto-write (if not already configured)
const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');
const WATSON_STATUSLINE = path.join(__dirname, 'watson-statusline.js');

// ... read-modify-write with idempotency check
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Watson hooks in personal settings.json | Watson hooks in plugin hooks/hooks.json | Phase 14 | Self-contained plugin; teammates auto-configured |
| Inline Node one-liner for SessionEnd | Proper script at scripts/watson-session-end.js | Phase 14 | Readable, maintainable, debuggable |
| share-proto-statusline.js (personal hooks dir) | watson-statusline.js (plugin scripts dir) | Phase 14 | Plugin-bundled; consistent for all users |

**Deprecated/outdated after Phase 14:**
- `~/.claude/hooks/share-proto-statusline.js`: becomes unused for Watson purposes (share-proto skill may still reference it independently)
- Watson's SessionStart bash one-liner in settings.json: replaced by hooks.json + watson-session-start.js
- Watson's SessionEnd Node one-liner in settings.json: replaced by hooks.json + watson-session-end.js

## Open Questions

1. **`${CLAUDE_PLUGIN_ROOT}` inside scripts at runtime**
   - What we know: Claude Code substitutes `${CLAUDE_PLUGIN_ROOT}` in hook `"command"` strings before spawning the process. Official docs confirm it's also exported as an environment variable to hook processes.
   - What's unclear: Whether `process.env.CLAUDE_PLUGIN_ROOT` is reliably set inside the spawned Node.js process (the docs say "exported as environment variables to hook processes").
   - Recommendation: Use `__dirname` inside scripts as the primary path anchor (reliable, no env dependency). If env var is available, it's a bonus. Do NOT require it.

2. **Plugin root path at migration script execution time**
   - What we know: When the plan runs, Claude Code has the watson repo as the working directory or knows its location via `--plugin-dir`.
   - What's unclear: The migration script (cleanup settings.json) needs to know the plugin root to write the correct statusLine command path. It could use a hardcoded path or accept a CLI argument.
   - Recommendation: Use `path.resolve(__dirname, '..')` from within `scripts/` to derive the plugin root — works correctly regardless of how the script is invoked.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — manual verification only |
| Config file | none |
| Quick run command | `node /Users/austindick/watson/scripts/watson-session-start.js 2>&1` |
| Full suite command | Fresh Claude Code session + check notification fires once |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HOOK-01 | SessionStart fires recovery notification from plugin | smoke | `node /Users/austindick/watson/scripts/watson-session-start.js 2>&1` | ❌ Wave 0 |
| HOOK-02 | SessionEnd saves branch+actions, cleans up active file | smoke | `touch /tmp/watson-active.json && echo '{"branch":"watson/test"}' > /tmp/watson-active.json && node /Users/austindick/watson/scripts/watson-session-end.js && cat /tmp/watson-session-end.json` | ❌ Wave 0 |
| HOOK-03 | settings.json cleanup removes only Watson hooks | manual-only | Inspect `~/.claude/settings.json` after migration; GSD hooks must remain | N/A |
| HOOK-04 | watson-statusline.js exists and renders statusline output | smoke | `echo '{"model":{"display_name":"Claude"},"workspace":{"current_dir":"/tmp"},"context_window":{"remaining_percentage":80}}' \| node /Users/austindick/watson/scripts/watson-statusline.js` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Run the smoke tests for the scripts written in that task
- **Per wave merge:** All smoke tests green + manual settings.json inspection
- **Phase gate:** SessionStart fires exactly once in a fresh Claude Code session (double-fire test) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `scripts/watson-session-start.js` — covers HOOK-01 (must be created in plan)
- [ ] `scripts/watson-session-end.js` — covers HOOK-02 (must be created in plan)
- [ ] `scripts/watson-statusline.js` — covers HOOK-04 (must be created in plan)
- [ ] `hooks/hooks.json` — declares HOOK-01 and HOOK-02 (must be created in plan)

*(All gaps are the deliverables of this phase — by definition they don't exist yet)*

## Sources

### Primary (HIGH confidence)
- `https://code.claude.com/docs/en/plugins-reference` — hooks.json schema, plugin directory structure, `${CLAUDE_PLUGIN_ROOT}` behavior, env var export to hook processes
- `~/.claude/settings.json` — current hook structure, exact Watson hook command strings to remove
- `~/.claude/hooks/share-proto-statusline.js` — source for watson-statusline.js fork; lines 76-87 identified as the dev-server block to strip

### Secondary (MEDIUM confidence)
- WebSearch result: statusLine confirmed as settings.json-only; not configurable from plugin hooks.json — corroborated by absence of statusLine in hooks.json schema in official docs

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- hooks.json schema: HIGH — fetched live from official docs
- `${CLAUDE_PLUGIN_ROOT}` in commands: HIGH — official docs, confirmed behavior
- `${CLAUDE_PLUGIN_ROOT}` as process.env inside scripts: MEDIUM — docs say "exported to hook processes" but runtime behavior not tested
- statusLine plugin restriction: MEDIUM — absence in docs + WebSearch confirmation; not explicitly stated as impossible in official docs
- Settings.json read-modify-write safety: HIGH — Claude Code's documented behavior (auto-backup, auto-reload on change)
- watson-statusline.js fork scope: HIGH — source code read directly, lines 76-87 identified precisely

**Research date:** 2026-04-05
**Valid until:** 2026-06-05 (plugin system stable; statusLine API could evolve)
