# Architecture Research

**Domain:** Claude Code plugin deployment — Watson 1.2 migration architecture
**Researched:** 2026-04-02
**Confidence:** HIGH for plugin directory structure and hooks.json format (official docs, WebFetch); HIGH for CLAUDE_PLUGIN_ROOT substitution in skill/agent content (official docs confirmed); MEDIUM for ambient rule in plugin (no official plugin-rules support found, workaround documented); LOW for statusLine plugin-level support (not documented as plugin-scoped feature)

---

## System Overview: Watson Plugin Structure

Watson's current layout at `~/.claude/skills/watson/` maps to a self-contained plugin directory. The plugin cache system copies all files on install, which means every path must be portable — no hardcoded `~/.claude/skills/watson/` references can survive.

```
watson-plugin/                        ← plugin root (GitHub repo: austindick/watson)
├── .claude-plugin/
│   └── plugin.json                   ← manifest (name, version, author, repo)
├── skills/
│   └── watson/
│       └── SKILL.md                  ← maps from SKILL.md (orchestrator entry point)
├── agents/                           ← maps from agents/ (all 8 agent files)
│   ├── builder.md
│   ├── consolidator.md
│   ├── decomposer.md
│   ├── design.md
│   ├── interaction.md
│   ├── layout.md
│   ├── librarian.md
│   └── reviewer.md
├── commands/                         ← maps from utilities/ (watson-init as command)
│   └── watson-init.md                ← invocable as @commands/watson-init
├── library/                          ← maps from library/ (bundled reference books)
│   ├── LIBRARY.md
│   ├── design-system/
│   │   ├── BOOK.md
│   │   ├── global-theme/
│   │   ├── components/
│   │   └── icons/
│   └── playground-conventions/
│       ├── BOOK.md
│       ├── project-structure/
│       ├── scaffolding/
│       ├── components/
│       ├── design-tokens/
│       ├── dev-workflow/
│       ├── multi-variant/
│       └── contributor-registration/
├── references/                       ← maps from references/ (agent-contract, book-schema, etc.)
│   ├── agent-contract.md
│   ├── book-schema.md
│   ├── source-scanning.md
│   └── artifact-schemas/
├── hooks/
│   └── hooks.json                    ← Watson-specific hooks (SessionStart, SessionEnd)
└── scripts/
    └── watson-statusline.js          ← Watson-only fork of share-proto-statusline.js
```

**Important:** The plugin cache prohibits path traversal outside the plugin root. Files referenced via `../shared-utils` will not work after install. The current `share-proto-statusline.js` at `~/.claude/hooks/` is shared with the share-proto skill — Watson cannot reference it from within its plugin boundary.

---

## File-by-File Migration Map

### Core Orchestrator

| Current path | Plugin destination | Change required |
|---|---|---|
| `~/.claude/skills/watson/SKILL.md` | `skills/watson/SKILL.md` | Path rewrite: all `~/.claude/skills/watson/` references → `${CLAUDE_PLUGIN_ROOT}/` |

### Agents (8 files)

| Current path | Plugin destination | Change required |
|---|---|---|
| `agents/builder.md` | `agents/builder.md` | libraryPaths examples updated (paths are resolved at runtime — remove hardcoded example paths from inline documentation) |
| `agents/consolidator.md` | `agents/consolidator.md` | No path references — no change |
| `agents/decomposer.md` | `agents/decomposer.md` | No path references — no change |
| `agents/design.md` | `agents/design.md` | No path references — no change |
| `agents/interaction.md` | `agents/interaction.md` | No path references — no change |
| `agents/layout.md` | `agents/layout.md` | No path references — no change |
| `agents/librarian.md` | `agents/librarian.md` | @references/ cross-references (see below); output path instruction updated |
| `agents/reviewer.md` | `agents/reviewer.md` | No path references — no change |

### Subskills (2 files)

| Current path | Plugin destination | Change required |
|---|---|---|
| `skills/discuss.md` | `skills/watson/discuss.md` (OR separate skill dir) | `~/.claude/skills/watson/library/LIBRARY.md` → `${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md` |
| `skills/loupe.md` | `skills/watson/loupe.md` (OR separate skill dir) | All hardcoded `~/.claude/skills/watson/library/...` paths in libraryPaths[] example → `${CLAUDE_PLUGIN_ROOT}/library/...` |

**Note on skill directory structure:** The plugin system expects each skill to be a directory with a `SKILL.md` file (e.g., `skills/watson/SKILL.md`). The subskills `discuss.md` and `loupe.md` are currently dispatched from SKILL.md as `@skills/discuss.md`, not as user-invocable skills. They can stay as flat files in a non-standard location (e.g., `skills/watson/discuss.md`) since the dispatch mechanism is instruction-based, not discovery-based.

### Utilities

| Current path | Plugin destination | Change required |
|---|---|---|
| `utilities/watson-init.md` | `commands/watson-init.md` | No @-references or absolute paths in this file; no change needed |

**Note:** `watson-init.md` is invoked from SKILL.md as `@utilities/watson-init.md`. In the plugin, this reference needs updating to match the new location (`@commands/watson-init.md` or inline as a skill). See Path Reference Changes section below.

### References (4 files + subdirectory)

| Current path | Plugin destination | Change required |
|---|---|---|
| `references/agent-contract.md` | `references/agent-contract.md` | libraryPaths example contains `~/.claude/skills/watson/library/...` — update example to `${CLAUDE_PLUGIN_ROOT}/library/...` |
| `references/book-schema.md` | `references/book-schema.md` | No path references — no change |
| `references/source-scanning.md` | `references/source-scanning.md` | No path references — no change |
| `references/artifact-schemas/` | `references/artifact-schemas/` | No path references — no change |

### Library (bundled books)

| Current path | Plugin destination | Change required |
|---|---|---|
| `library/LIBRARY.md` | `library/LIBRARY.md` | Book paths in LIBRARY.md are relative (`library/design-system/BOOK.md`) — these stay relative and continue working |
| `library/design-system/BOOK.md` | `library/design-system/BOOK.md` | `sources` field lists `~/.claude/skills/watson-lite/...` — update to note that sources are Faire-internal, not bundled |
| `library/playground-conventions/BOOK.md` | `library/playground-conventions/BOOK.md` | Same sources note |
| All chapter and page files | Same relative paths | No change |

### Hooks

| Current location | Plugin destination | Migration action |
|---|---|---|
| `~/.claude/settings.json` → `SessionStart` (watson state recovery check) | `hooks/hooks.json` | Move inline, use `${CLAUDE_PLUGIN_ROOT}` if any script reference needed |
| `~/.claude/settings.json` → `SessionEnd` (watson state cleanup) | `hooks/hooks.json` | Move inline (command is pure Node.js inline, no script path) |
| `~/.claude/settings.json` → `statusLine` | NOT in plugin | See Shared StatusLine section below |

### Ambient Rule

| Current location | Plugin destination | Migration action |
|---|---|---|
| `~/.claude/rules/watson-ambient.md` | No official plugin support | See Ambient Rule section below |

---

## Path Reference Changes

### Category 1: Absolute `~/.claude/skills/watson/` paths in skill/agent content

**Where they appear:**
- `skills/discuss.md` line 37: `Read ~/.claude/skills/watson/library/LIBRARY.md`
- `skills/loupe.md` lines 37, 44-48: `~/.claude/skills/watson/library/...` in libraryPaths example
- `references/agent-contract.md` line 16: libraryPaths example with absolute paths

**Fix:** Replace `~/.claude/skills/watson/` with `${CLAUDE_PLUGIN_ROOT}/`.

Official docs confirm: "`${CLAUDE_PLUGIN_ROOT}` is substituted inline anywhere it appears in skill content, agent content, hook commands, and MCP or LSP server configs." (HIGH confidence — WebFetch from code.claude.com/docs/en/plugins-reference)

```
Before: ~/.claude/skills/watson/library/LIBRARY.md
After:  ${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md
```

### Category 2: @-style dispatch references

**Where they appear (all in SKILL.md):**
- `@utilities/watson-init.md` (3 occurrences)
- `@skills/discuss.md` (2 occurrences)
- `@skills/loupe.md` (2 occurrences)

**Where they appear (in skill and agent files):**
- `skills/loupe.md`: `@agents/decomposer.md`, `@agents/layout.md`, `@agents/design.md`, `@agents/interaction.md`, `@agents/builder.md`, `@agents/reviewer.md`, `@agents/consolidator.md`
- `agents/librarian.md`: `@references/book-schema.md`, `@references/source-scanning.md`, `@references/agent-contract.md`

**Behavior in plugins:** The `@`-style path dispatch is a Claude Code instruction-following convention, not a Claude Code file resolution mechanism. Claude Code does NOT automatically expand `@agents/builder.md` to a file path — it is text that Claude reads and acts upon by using the `Read` tool with an appropriate path.

**Required fix:** The `@agents/`, `@skills/`, `@utilities/`, `@references/` prefixes must be replaced with full paths. Use `${CLAUDE_PLUGIN_ROOT}` as the base:

```
Before: @agents/builder.md
After:  ${CLAUDE_PLUGIN_ROOT}/agents/builder.md

Before: @utilities/watson-init.md
After:  ${CLAUDE_PLUGIN_ROOT}/commands/watson-init.md  (if moved to commands/)

Before: @references/book-schema.md
After:  ${CLAUDE_PLUGIN_ROOT}/references/book-schema.md
```

**Confidence:** MEDIUM. The `${CLAUDE_PLUGIN_ROOT}` substitution in skill content is confirmed HIGH. Whether the `@` syntax works as path reference vs. pure instruction text requires validation in a live plugin session. Given the substitution mechanism operates on the full text of skill/agent files, `${CLAUDE_PLUGIN_ROOT}/agents/builder.md` will resolve correctly.

### Category 3: libraryPaths[] runtime construction

**Where it appears:** `skills/loupe.md` and `skills/discuss.md`

The libraryPaths[] array is constructed at runtime by reading `LIBRARY.md`, then `BOOK.md` manifests. The paths in these manifests are relative (`library/design-system/BOOK.md`).

**The problem:** Subskills currently hardcode the base path when building libraryPaths[]:
```
"~/.claude/skills/watson/library/design-system/global-theme/CHAPTER.md"
```

This example is shown in `loupe.md` as illustration, but the instruction says "Never improvise paths. All paths come from LIBRARY.md and BOOK.md manifests." If those manifests contain relative paths, the subskill still needs to know the absolute base to read them.

**Fix strategy:** Two-step approach:
1. `LIBRARY.md` paths stay relative (e.g., `library/design-system/BOOK.md`)
2. Subskills resolve the base path at runtime: "Read `${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md`, then read each book's BOOK.md at `${CLAUDE_PLUGIN_ROOT}/{path from LIBRARY.md}`"

This makes the full path portable: `${CLAUDE_PLUGIN_ROOT}/library/design-system/global-theme/CHAPTER.md`

**Instruction change required in loupe.md and discuss.md:** Replace the hardcoded base in the library resolution instruction:
```
Before: Read ~/.claude/skills/watson/library/LIBRARY.md
After:  Read ${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md
```

And update the libraryPaths example from hardcoded absolute paths to the portable form:
```
Before: "~/.claude/skills/watson/library/design-system/global-theme/CHAPTER.md"
After:  "${CLAUDE_PLUGIN_ROOT}/library/design-system/global-theme/CHAPTER.md"
```

---

## Hooks Migration

### Format: settings.json → hooks/hooks.json

The hooks in `~/.claude/settings.json` are the same JSON format used in `hooks/hooks.json`. The only structural difference is the outer key: settings.json uses `"hooks": { "EventName": [...] }` at the top level, while hooks.json uses the same structure.

**Current SessionEnd hook (Watson cleanup):**
```json
{
  "hooks": {
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"const fs=require('fs'); const f='/tmp/watson-active.json'; if(!fs.existsSync(f)) process.exit(0); try { const s=JSON.parse(fs.readFileSync(f,'utf8')); if(s.branch) fs.writeFileSync('/tmp/watson-session-end.json', JSON.stringify({branch:s.branch,actions:s.actions||[],timestamp:new Date().toISOString()})); fs.unlinkSync(f); } catch(e) { try { fs.unlinkSync(f); } catch(e2) {} }\""
          }
        ]
      }
    ]
  }
}
```

**Current SessionStart hook (Watson recovery check):**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "if [ -f /tmp/watson-active.json ]; then echo 'Watson was active before /clear. Run /watson to reactivate.'; fi"
          }
        ]
      }
    ]
  }
}
```

**watson-plugin/hooks/hooks.json — combined Watson hooks:**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "if [ -f /tmp/watson-active.json ]; then echo 'Watson was active before /clear. Run /watson to reactivate.'; fi"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"const fs=require('fs'); const f='/tmp/watson-active.json'; if(!fs.existsSync(f)) process.exit(0); try { const s=JSON.parse(fs.readFileSync(f,'utf8')); if(s.branch) fs.writeFileSync('/tmp/watson-session-end.json', JSON.stringify({branch:s.branch,actions:s.actions||[],timestamp:new Date().toISOString()})); fs.unlinkSync(f); } catch(e) { try { fs.unlinkSync(f); } catch(e2) {} }\""
          }
        ]
      }
    ]
  }
}
```

**Note on hook events:** Claude Code supports `SessionStart`, `SessionEnd`, `PostToolUse`, `PreToolUse`, `UserPromptSubmit`, `Stop`, and many others. Plugin hooks respond to the same events as user-defined hooks. Hook commands have `${CLAUDE_PLUGIN_ROOT}` available as an environment variable. For inline `node -e` commands (no external script), no path substitution is needed.

**Migration cleanness:** Both current Watson hooks use inline shell commands — no script file references. They migrate verbatim to `hooks/hooks.json`. The `gsd-check-update.js` and `gsd-context-monitor.js` hooks in settings.json are GSD framework hooks, not Watson hooks — they stay in `settings.json` and are NOT migrated into the Watson plugin.

---

## Shared StatusLine Script

### The Problem

`~/.claude/hooks/share-proto-statusline.js` is shared between Watson (reads `/tmp/watson-active.json`) and share-proto (manages tunnel links via `/tmp/share-proto.json`). Watson cannot reference this file from inside the plugin boundary after installation.

The `statusLine` setting is a `settings.json` feature, not a plugin-level feature. Confirmed via official docs: "Add a `statusLine` field to your user settings (`~/.claude/settings.json`) or project settings." No plugin manifest field for `statusLine` is documented. (HIGH confidence — direct official doc quote)

### Resolution Strategy: Fork the Script

Watson bundles its own status line script in `scripts/watson-statusline.js`. This fork:
- Removes the share-proto tunnel logic (lines 50-87 of current script)
- Retains the Watson active indicator (lines 103-113)
- Retains the git branch display, context bar, model/dir display

**What each skill owns after forking:**

| Script | Owner | Contains |
|---|---|---|
| `~/.claude/hooks/share-proto-statusline.js` | share-proto skill (unchanged) | Full script: context bar + tunnel links + Watson indicator + git branch |
| `${CLAUDE_PLUGIN_ROOT}/scripts/watson-statusline.js` | watson plugin | Subset: context bar + Watson indicator + git branch (no tunnel logic) |

**Remaining problem:** `statusLine` must still be configured in `settings.json` at the user level. It cannot be automatically set by plugin install. This is a mandatory post-install step.

**Installer instruction (required in README):**
```json
// Add to ~/.claude/settings.json after installing the Watson plugin:
{
  "statusLine": {
    "type": "command",
    "command": "node \"${WATSON_PLUGIN_ROOT}/scripts/watson-statusline.js\""
  }
}
```

Note: `${WATSON_PLUGIN_ROOT}` is not a real variable in this context — the README must instruct users to find and paste their actual plugin cache path, or use the resolved absolute path. This is a known friction point in the install flow.

**Alternative:** If teammates already have share-proto installed (which installs the shared statusline), the Watson indicator already works — they need no additional statusLine configuration. Document this as the recommended path for Faire teammates: "If you have share-proto installed, Watson status already appears automatically."

---

## Ambient Rule

### Current Implementation

`~/.claude/rules/watson-ambient.md` uses `paths:` frontmatter to activate Watson prompts when Claude works in `packages/design/prototype-playground/**`. This is a user-level rules file.

### Plugin Rules Support

**Finding:** The Claude Code plugin system has no documented `rules/` directory or mechanism for plugins to ship path-specific rules. The plugin directory structure supports `commands/`, `agents/`, `skills/`, `hooks/`, `output-styles/`, `bin/`, and `settings.json`. There is no `rules/` equivalent for plugins.

Rules files live at `~/.claude/rules/` (user scope) or `.claude/rules/` (project scope). Neither is shippable via plugin. (MEDIUM confidence — absence of documentation for plugin rules is not the same as confirmed impossibility, but thorough review of official plugin docs found no mention)

### Resolution Strategies

**Option A — Manual install step (recommended for 1.2):** Include `watson-ambient.md` in the plugin's `docs/` or `references/` directory as a template. Installation instructions tell teammates to copy it to `~/.claude/rules/watson-ambient.md` manually. Single file, one copy command.

```
# In plugin docs/install-guide.md:
cp "${CLAUDE_PLUGIN_ROOT}/docs/watson-ambient.md" ~/.claude/rules/watson-ambient.md
```

**Option B — SessionStart hook writes the rule:** A `SessionStart` hook in `hooks/hooks.json` checks whether `~/.claude/rules/watson-ambient.md` exists and writes it from the bundled template if absent. This makes installation truly one-command.

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "[ -f ~/.claude/rules/watson-ambient.md ] || cp \"${CLAUDE_PLUGIN_ROOT}/docs/watson-ambient.md\" ~/.claude/rules/watson-ambient.md"
          }
        ]
      }
    ]
  }
}
```

**Tradeoff of Option B:** The hook writes outside the plugin root — it touches `~/.claude/rules/`. Plugin updates that change the ambient rule content will NOT automatically update `~/.claude/rules/watson-ambient.md` (since the hook only runs when the file is absent). Requires a version-checking approach (compare file hash) or a manual "reinstall rule" command to force-update. Also, uninstalling the plugin does not clean up `~/.claude/rules/watson-ambient.md`.

**Option C — SKILL.md activation as fallback:** The existing Session toggle (AskUserQuestion gate via `/watson`) already works without the ambient rule. The ambient rule is a convenience for Prototype Playground users. If the ambient rule is not installed, Watson functions normally via `/watson` invocation. Document this clearly: ambient detection requires the optional manual step; slash command requires nothing extra.

**Recommendation for 1.2:** Option A (manual copy). Ship the rule file in `docs/watson-ambient.md`. Document the copy command in the install guide. If teammates find it burdensome, upgrade to Option B in 1.3.

---

## Plugin Manifest

```json
{
  "name": "watson",
  "version": "1.2.0",
  "description": "Agentic product development companion for Faire's Prototype Playground — design discussion, Figma-to-code pipeline, and library-grounded prototyping.",
  "author": {
    "name": "Austin Dick",
    "url": "https://github.com/austindick"
  },
  "repository": "https://github.com/austindick/watson",
  "license": "MIT"
}
```

**On skill namespacing:** Plugin skills are namespaced as `/plugin-name:skill-name`. With `"name": "watson"`, the skill becomes `/watson:watson`. This is awkward — the user must type `/watson:watson` instead of `/watson`.

**Resolution options:**
- Name the plugin `"watson"` and the skill directory `"main"` → command becomes `/watson:main` (still awkward)
- Name the plugin something else (e.g., `"wp"`) and keep skill as `"watson"` → `/wp:watson` (also awkward)
- Accept `/watson:watson` and document it, or alias via a `commands/watson.md` command that simply dispatches the skill

The cleanest approach: keep `"name": "watson"`, put the main skill in `skills/watson/SKILL.md`, accept `/watson:watson` as the full invocation. Alternatively, rename the skill directory to something like `main` or `go` to get `/watson:main` — slightly less awkward.

**Alternative — commands/ for the entry point:** A `commands/watson.md` file creates a `/watson` command (namespaced to `/watson:watson`). A standalone `commands/go.md` creates `/watson:go`. Neither avoids namespacing.

**Practical decision for 1.2:** Use `commands/watson.md` (a thin entry point that reads SKILL.md behavior) to create the `/watson:watson` command. Document that teammates should alias it in shell config: `alias cw="claude --plugin watson"`. Revisit naming in 1.3 if namespacing proves friction-heavy.

---

## Plugin Directory Structure (Final)

```
watson-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── watson/
│       ├── SKILL.md                    ← master orchestrator (path-updated)
│       ├── discuss.md                  ← discuss subskill (LIBRARY.md path updated)
│       └── loupe.md                    ← loupe subskill (library paths updated)
├── agents/
│   ├── builder.md
│   ├── consolidator.md
│   ├── decomposer.md
│   ├── design.md
│   ├── interaction.md
│   ├── layout.md
│   ├── librarian.md                    ← @references/ paths updated
│   └── reviewer.md
├── commands/
│   └── watson-init.md                  ← utilities/watson-init.md (no path changes)
├── library/
│   ├── LIBRARY.md                      ← relative paths, no change
│   ├── design-system/
│   │   ├── BOOK.md
│   │   ├── global-theme/
│   │   │   └── CHAPTER.md
│   │   ├── components/
│   │   │   └── CHAPTER.md (+ page files)
│   │   └── icons/
│   │       └── CHAPTER.md
│   └── playground-conventions/
│       ├── BOOK.md
│       └── [7 chapter directories]/
├── references/
│   ├── agent-contract.md               ← libraryPaths example updated
│   ├── book-schema.md
│   ├── source-scanning.md
│   └── artifact-schemas/
│       ├── DESIGN-EXAMPLE.md
│       ├── INTERACTIONS-EXAMPLE.md
│       └── LAYOUT-EXAMPLE.md
├── docs/
│   ├── watson-ambient.md               ← copy of watson-ambient.md rule (template)
│   ├── install-guide.md
│   └── architecture.md (optional)
├── hooks/
│   └── hooks.json                      ← Watson SessionStart + SessionEnd hooks
└── scripts/
    └── watson-statusline.js            ← Watson-only fork (no share-proto tunnel logic)
```

---

## Data Flow: Path Resolution at Runtime

```
User invokes /watson:watson
    ↓
SKILL.md loads from ${CLAUDE_PLUGIN_ROOT}/skills/watson/SKILL.md
    ↓
SKILL.md dispatches @utilities/watson-init.md
    → resolves to Read ${CLAUDE_PLUGIN_ROOT}/commands/watson-init.md
    ↓
SKILL.md dispatches @skills/discuss.md or @skills/loupe.md
    → resolves to Read ${CLAUDE_PLUGIN_ROOT}/skills/watson/discuss.md
                     Read ${CLAUDE_PLUGIN_ROOT}/skills/watson/loupe.md
    ↓
loupe.md reads ${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md
    → reads BOOK.md files at ${CLAUDE_PLUGIN_ROOT}/library/{book}/BOOK.md
    → builds libraryPaths[] as absolute ${CLAUDE_PLUGIN_ROOT}/library/{...}/CHAPTER.md paths
    ↓
loupe.md dispatches agents
    → resolves to Read ${CLAUDE_PLUGIN_ROOT}/agents/{agent}.md
    ↓
agents receive libraryPaths[] (fully resolved absolute paths)
    → agents Read each path directly
    ↓
librarian.md reads ${CLAUDE_PLUGIN_ROOT}/references/book-schema.md
    → and source-scanning.md, agent-contract.md
```

---

## Change Catalog: Every File That Needs Editing

**High-change files (path rewrites required):**

| File | Changes needed |
|---|---|
| `skills/watson/SKILL.md` | Replace `@utilities/` → `${CLAUDE_PLUGIN_ROOT}/commands/`; Replace `@skills/` → `${CLAUDE_PLUGIN_ROOT}/skills/watson/` |
| `skills/watson/discuss.md` | Replace `~/.claude/skills/watson/library/LIBRARY.md` → `${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md` |
| `skills/watson/loupe.md` | Replace `~/.claude/skills/watson/library/LIBRARY.md` → `${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md`; Update hardcoded libraryPaths example paths |
| `agents/librarian.md` | Replace `@references/` → `${CLAUDE_PLUGIN_ROOT}/references/` (3 occurrences) |

**Medium-change files (example paths updated):**

| File | Changes needed |
|---|---|
| `references/agent-contract.md` | Update libraryPaths example from `~/.claude/skills/watson/...` to `${CLAUDE_PLUGIN_ROOT}/...` |

**No-change files (8 agent files except librarian, utilities/watson-init.md, all library content):**

These files contain no absolute paths or @-style references that need updating. They are dropped into the plugin directory and work as-is.

**New files (2 additions):**

| File | Purpose |
|---|---|
| `.claude-plugin/plugin.json` | Plugin manifest |
| `hooks/hooks.json` | Watson hooks (migrated from settings.json) |
| `docs/watson-ambient.md` | Ambient rule template for manual install |
| `scripts/watson-statusline.js` | Watson-only fork of share-proto-statusline.js |

---

## Anti-Patterns

### Anti-Pattern 1: Keeping `~/.claude/skills/watson/` Paths in Skill Files

**What people do:** Copy files to the plugin directory without updating absolute paths, assuming Watson still lives at `~/.claude/skills/watson/`.

**Why it's wrong:** The plugin cache installs to `~/.claude/plugins/cache/watson-[id]/`. `~/.claude/skills/watson/` no longer exists for plugin users. All `Read ~/.claude/skills/watson/library/LIBRARY.md` instructions fail silently — Claude attempts the read, gets a "file not found" error, and either invents library content or aborts.

**Do this instead:** Use `${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md` everywhere. This variable is substituted in skill and agent content by Claude Code before the model sees it.

### Anti-Pattern 2: Referencing share-proto-statusline.js From Plugin

**What people do:** Point `statusLine` command to `${CLAUDE_PLUGIN_ROOT}/scripts/share-proto-statusline.js` — copying the shared script into the plugin but keeping share-proto tunnel logic.

**Why it's wrong:** The Watson plugin then renders share-proto tunnel links that may or may not be active. The tunnel logic reads `/tmp/share-proto.json` and `/tmp/share-proto-dev-{pid}.json` — files Watson neither creates nor manages. The links are dead noise.

**Do this instead:** Fork the script to `scripts/watson-statusline.js`. Remove lines 50-87 (share-proto tunnel blocks). Keep only context bar, git branch, Watson active indicator. Watson owns its own script.

### Anti-Pattern 3: Bundling Source Files for the Library Books

**What people do:** Bundle the Slate source files (`faire/frontend`) inside the plugin so teammates can regenerate library books without access to the monorepo.

**Why it's wrong:** Slate source changes frequently. Bundled source would be immediately stale after any Slate release. Plugin size becomes enormous. The value of pre-generated books is precisely that teammates don't need source access.

**Do this instead:** Bundle only the generated library books. The maintainer (Austin) regenerates books from Slate source and commits them to the plugin repo. Teammates get fresh books via `claude plugin update watson`.

### Anti-Pattern 4: Using Plugin hooks.json to Manage statusLine

**What people do:** Put a `SessionStart` hook in hooks.json that writes a `statusLine` entry into `~/.claude/settings.json`.

**Why it's wrong:** Modifying `settings.json` from a hook is fragile — concurrent sessions, JSON parse failures, and key collisions with existing statusLine config from other skills. It violates the principle that plugins should not mutate user settings files.

**Do this instead:** Document `statusLine` as a manual post-install step. Teammates add the line once. If share-proto is already installed, Watson status is already visible — no additional step needed.

---

## Integration Points

### External Services

| Service | Integration | Notes |
|---|---|---|
| GitHub (austindick/watson) | Plugin distribution source | Teammates install via `claude plugin install watson@austindick`; updates via `claude plugin update watson` |
| Figma MCP | Agents use same Figma MCP tool as today | No change — MCP tools are user-configured, not plugin-scoped |
| Prototype Playground filesystem | Watson reads/writes blueprint/ and .watson/ directories | No change — these are per-project paths, not plugin paths |

### Internal Boundaries

| Boundary | Communication | Plugin Notes |
|---|---|---|
| SKILL.md → subskills | Read tool dispatches to `${CLAUDE_PLUGIN_ROOT}/skills/watson/discuss.md` | @skills/ prefix must be replaced |
| SKILL.md → watson-init | Read tool dispatches to `${CLAUDE_PLUGIN_ROOT}/commands/watson-init.md` | @utilities/ prefix must be replaced |
| loupe.md → agents | Read tool dispatches to `${CLAUDE_PLUGIN_ROOT}/agents/*.md` | @agents/ prefix must be replaced |
| librarian.md → references | Read tool dispatches to `${CLAUDE_PLUGIN_ROOT}/references/*.md` | @references/ prefix must be replaced |
| subskills → library | Read tool at `${CLAUDE_PLUGIN_ROOT}/library/...` | Hardcoded base path must be replaced |
| hooks → /tmp/ state files | Plugin hooks write to /tmp/watson-active.json, /tmp/watson-session-end.json | No change — /tmp/ is not plugin-scoped |

---

## Confidence Assessment

| Area | Confidence | Basis |
|---|---|---|
| Plugin directory structure | HIGH | Official docs at code.claude.com/docs/en/plugins-reference (WebFetch) |
| hooks.json format and events | HIGH | Official docs confirmed format, all event names listed |
| CLAUDE_PLUGIN_ROOT in skill/agent content | HIGH | "Both are substituted inline anywhere they appear in skill content, agent content..." — direct quote from official docs |
| Path traversal prohibition | HIGH | Official docs: "Installed plugins cannot reference files outside their directory" |
| Ambient rule in plugin | MEDIUM-LOW | No plugin rules/ directory documented; workaround via SessionStart hook is plausible but unconfirmed |
| statusLine as plugin-level setting | LOW (cannot be done) | Not documented as plugin capability; confirmed as user/project settings.json only |
| @-style dispatch resolution at runtime | MEDIUM | ${CLAUDE_PLUGIN_ROOT} substitution confirmed; actual @-reference → Read tool behavior is instruction-following, not documented API |

---

## Sources

- [Plugins reference — code.claude.com](https://code.claude.com/docs/en/plugins-reference) — directory structure, manifest schema, CLAUDE_PLUGIN_ROOT, path traversal rules, hooks events (WebFetch, HIGH confidence)
- [Create plugins — code.claude.com](https://code.claude.com/docs/en/plugins) — migration steps, hooks.json format, component paths (WebFetch, HIGH confidence)
- [Statusline — code.claude.com](https://code.claude.com/docs/en/statusline) — statusLine is a settings.json feature only; no plugin-level statusLine documented (WebFetch, HIGH confidence)
- [Claude Code Settings — code.claude.com](https://code.claude.com/docs/en/settings) — scope system, user vs project vs plugin settings (WebFetch, HIGH confidence)
- `/Users/austindick/.claude/skills/watson/` — all current Watson skill files (Read directly, HIGH confidence)
- `/Users/austindick/.claude/settings.json` — current hooks and statusLine configuration (Read directly, HIGH confidence)
- `/Users/austindick/.claude/rules/watson-ambient.md` — ambient rule content and paths: frontmatter (Read directly, HIGH confidence)
- `/Users/austindick/.claude/hooks/share-proto-statusline.js` — shared statusline script (Read directly, HIGH confidence)

---

## Prior Research Context

This file supersedes the Watson 1.1 architecture research (also stored here, dated 2026-04-01). For 1.1 integration patterns (ambient mode via paths: frontmatter, draft/commit model, session management git ops, Agent 3 contract, 3-agent parallel dispatch), see the git history of this file or `.planning/phases/` CONTEXT and PLAN files for phases 06-09.

---
*Architecture research for: Watson 1.2 — Plugin deployment, path portability, hooks migration*
*Researched: 2026-04-02*
