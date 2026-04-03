# Stack Research

**Domain:** Claude Code plugin packaging — Watson 1.2 distribution
**Researched:** 2026-04-02
**Confidence:** HIGH — all findings sourced from official Claude Code documentation fetched directly

> **Scope note:** This document covers ONLY what is needed for Watson 1.2 plugin packaging and distribution. Validated Watson 1.0/1.1 patterns (SKILL.md authoring, agent structure, library system, hooks behavior in settings.json, subagent dispatch, ambient activation) are NOT re-researched. See prior STACK.md (2026-04-01) for those baselines.

---

## Plugin System: Verified Specs

### Plugin Manifest — `.claude-plugin/plugin.json`

The manifest is **optional** — if omitted, Claude Code auto-discovers components in default locations and derives the plugin name from the directory name. Use a manifest to provide metadata and custom paths.

**Complete schema:**

```json
{
  "name": "watson",
  "version": "1.2.0",
  "description": "Design discussion and prototype building for Faire's Prototype Playground",
  "author": {
    "name": "Austin Dick",
    "email": "austin@faire.com"
  },
  "homepage": "https://github.com/austindick/watson",
  "repository": "https://github.com/austindick/watson",
  "license": "MIT",
  "keywords": ["design", "prototyping", "faire", "playground"],
  "commands": "./commands/",
  "agents": "./agents/",
  "skills": "./skills/",
  "hooks": "./hooks/hooks.json"
}
```

**Field types and notes:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Yes (if manifest present) | Kebab-case. Becomes skill namespace prefix: `/watson:skill-name` |
| `version` | string | No | Semantic versioning. Drives update detection — bump version to push updates to teammates |
| `description` | string | No | Shown in plugin manager UI |
| `author` | object | No | `name` required if object present, `email` optional |
| `homepage` | string | No | Documentation URL |
| `repository` | string | No | Source code URL |
| `license` | string | No | SPDX identifier |
| `keywords` | array | No | Discovery tags |
| `commands` | string\|array | No | Custom path replaces default `commands/` directory |
| `agents` | string\|array | No | Custom path replaces default `agents/` directory |
| `skills` | string\|array | No | Custom path replaces default `skills/` directory |
| `hooks` | string\|array\|object | No | Path to hooks file or inline hook config |
| `mcpServers` | string\|array\|object | No | MCP config — Watson does not use this |
| `lspServers` | string\|array\|object | No | LSP config — Watson does not use this |
| `userConfig` | object | No | User-prompted values at install time |

**Watson-specific decision:** Include the manifest. Watson has custom directory layout (library/, references/, docs/, utilities/ alongside the standard paths). The manifest makes component paths explicit and carries version metadata for update signaling.

---

### Plugin Directory Structure

```
watson/                              # Plugin root (GitHub repo root)
├── .claude-plugin/
│   └── plugin.json                  # Plugin manifest
├── commands/                        # Slash command entrypoint
│   └── watson.md                    # /watson command (currently SKILL.md at root)
├── agents/                          # 8 agent files
│   ├── builder.md
│   ├── consolidator.md
│   ├── decomposer.md
│   ├── design.md
│   ├── interaction.md
│   ├── layout.md
│   ├── librarian.md
│   └── reviewer.md
├── skills/                          # 2 subskill files (model-invoked)
│   ├── discuss/
│   │   └── SKILL.md
│   └── loupe/
│       └── SKILL.md
├── hooks/
│   └── hooks.json                   # Migrated from settings.json
├── library/                         # Bundled reference books
│   ├── LIBRARY.md
│   ├── design-system/
│   │   ├── BOOK.md
│   │   ├── components/
│   │   ├── global-theme/
│   │   └── icons/
│   └── playground-conventions/
│       ├── BOOK.md
│       ├── components/
│       ├── contributor-registration/
│       ├── design-tokens/
│       ├── dev-workflow/
│       ├── multi-variant/
│       ├── project-structure/
│       └── scaffolding/
├── references/                      # Agent contract and schemas
│   ├── agent-contract.md
│   ├── artifact-schemas/
│   ├── book-schema.md
│   └── source-scanning.md
├── utilities/                       # Utility skill files
│   └── watson-init.md
├── docs/                            # Internal docs (not part of plugin discovery)
│   ├── architecture.md
│   ├── executive-summary.md
│   ├── guide.md
│   ├── maintainer.md
│   └── roadmap.md
└── README.md
```

**Critical directory rules (verified):**
- `.claude-plugin/` contains ONLY `plugin.json`. All other directories must be at plugin root.
- `skills/` uses subdirectory-per-skill with `SKILL.md`: `skills/discuss/SKILL.md`, `skills/loupe/SKILL.md`
- `commands/` holds flat `.md` files (the main `/watson` entrypoint)
- `agents/` holds flat `.md` files (all 8 agents)
- `hooks/` holds `hooks.json` (required filename for auto-discovery)
- `library/`, `references/`, `utilities/`, `docs/` are bundled data — they are NOT auto-discovered as components but are accessible via `${CLAUDE_PLUGIN_ROOT}`

**Skill naming with namespace:** Plugin `name: "watson"` means the discuss subskill becomes `/watson:discuss`. This is a BREAKING CHANGE from the current standalone skill name `/discuss`. The main `/watson` command remains accessible as `/watson:watson` (namespaced) or via the `commands/` directory. Evaluate whether to name the plugin `watson` or use the root orchestrator as the primary entry.

---

### SKILL.md vs commands/ — Watson Entrypoint Decision

Current Watson structure has a single `SKILL.md` at the root used as the main `/watson` slash command. In plugin context:

| Approach | Result | Tradeoff |
|----------|--------|----------|
| Put main SKILL.md in `commands/watson.md` | `/watson` command available (no namespace prefix) | No longer auto-invokable by model based on description |
| Put main SKILL.md in `skills/watson/SKILL.md` | `/watson:watson` command + model auto-invocation | Awkward double-namespace; teammates type `/watson:watson` |
| Use `commands/` for main entrypoint, `skills/` for subskills | `/watson` for user-invoked, model invokes discuss/loupe as skills | Matches current UX; main command stays `/watson` |

**Recommendation:** Main orchestrator in `commands/watson.md` (user-invoked `/watson`). Subskills `discuss` and `loupe` in `skills/discuss/SKILL.md` and `skills/loupe/SKILL.md` (model-invoked when appropriate). This preserves the familiar `/watson` entry point while making subskills discoverable to the model.

---

### Component Discovery Rules (verified)

| Component | Auto-discovery location | File format | Naming |
|-----------|------------------------|-------------|--------|
| Commands (slash commands) | `commands/` | Flat `.md` files | `/plugin-name:filename` |
| Skills (model-invoked) | `skills/<name>/SKILL.md` | Subdirectory + SKILL.md | `/plugin-name:skill-name` |
| Agents | `agents/` | Flat `.md` files with frontmatter | Appear in `/agents` interface |
| Hooks | `hooks/hooks.json` | JSON | Auto-loaded |
| Reference files | Anywhere (not auto-discovered) | Any | Accessed via `${CLAUDE_PLUGIN_ROOT}/path` |

Watson's `library/`, `references/`, `utilities/`, and `docs/` directories are NOT auto-discovered as plugin components. They are reference files bundled with the plugin and accessed by agents at runtime via `${CLAUDE_PLUGIN_ROOT}`.

---

### Environment Variables (verified)

Two variables are substituted inline in skill content, agent content, and hook commands:

| Variable | Resolves to | Use case |
|----------|-------------|----------|
| `${CLAUDE_PLUGIN_ROOT}` | Absolute path to plugin installation directory | Reference bundled files (library, references) |
| `${CLAUDE_PLUGIN_DATA}` | `~/.claude/plugins/data/watson/` | Persistent state that survives plugin updates |

**Critical:** `${CLAUDE_PLUGIN_ROOT}` changes on plugin update. Files written there do NOT survive an update. Use `${CLAUDE_PLUGIN_DATA}` for any generated state. Watson's library books are bundled (committed to the repo) — they live in `${CLAUDE_PLUGIN_ROOT}/library/`, not `${CLAUDE_PLUGIN_DATA}/`.

**Path migration:** All current hardcoded `~/.claude/skills/watson/` references in skill files must be replaced with `${CLAUDE_PLUGIN_ROOT}`. This affects:
- `skills/discuss.md`: `~/.claude/skills/watson/library/LIBRARY.md` → `${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md`
- `skills/loupe.md`: 9 hardcoded library paths → `${CLAUDE_PLUGIN_ROOT}/library/...`
- `references/agent-contract.md`: example paths in documentation strings
- `docs/maintainer.md`, `docs/architecture.md`, `docs/roadmap.md`: human-readable paths

---

### Hooks Migration — `hooks/hooks.json`

Current Watson hooks live in `~/.claude/settings.json`. Migration to plugin format:

**Current hooks in settings.json (Watson-owned):**

```json
{
  "SessionStart": [watson-active check hook],
  "SessionEnd": [watson state cleanup hook]
}
```

Note: `settings.json` also contains GSD hooks (`gsd-check-update.js`, `gsd-context-monitor.js`) that are NOT Watson's. Only the two Watson-specific hooks migrate to the plugin.

**Plugin `hooks/hooks.json` format:**

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

**All supported hook events (verified):**

`SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PermissionRequest`, `PermissionDenied`, `PostToolUse`, `PostToolUseFailure`, `Notification`, `SubagentStart`, `SubagentStop`, `TaskCreated`, `TaskCompleted`, `Stop`, `StopFailure`, `TeammateIdle`, `InstructionsLoaded`, `ConfigChange`, `CwdChanged`, `FileChanged`, `WorktreeCreate`, `WorktreeRemove`, `PreCompact`, `PostCompact`, `Elicitation`, `ElicitationResult`, `SessionEnd`

**Hook types:** `command`, `http`, `prompt`, `agent`

**Hook script restrictions for plugin agents:** Plugin agents do NOT support `hooks`, `mcpServers`, or `permissionMode` in their frontmatter (security restriction). These belong in `hooks/hooks.json` at the plugin level.

---

### Ambient Rule Migration

Current Watson ambient rule lives at `~/.claude/rules/watson-ambient.md` — a path-specific rule that fires when Claude works in `packages/design/prototype-playground/**`.

**Plugin support for rules:** The official plugin spec does NOT document a `rules/` directory as an auto-discovered component. Plugin components are: commands, agents, skills, hooks, MCP servers, LSP servers, output-styles, and `bin/`. There is no plugin-native mechanism to inject rules into `~/.claude/rules/`.

**Options:**

| Option | How | Tradeoff |
|--------|-----|----------|
| SessionStart hook injects rule content | Hook writes rule file to `~/.claude/rules/watson-ambient.md` on each session start | Mutable user directory; feels hacky; creates file outside plugin boundary |
| Skill with `paths` frontmatter replaces the rule | Move ambient behavior into a skill's `paths` frontmatter scoped to playground paths | Clean; but Watson 1.1 explicitly dropped `paths` because it breaks `/watson` slash command registration |
| Manual step: teammate copies rule file | Document in README; one-time setup | Not zero-configuration; breaks "one-command install" goal |
| Embed ambient behavior in SessionStart hook | Hook checks CWD and outputs context injection if in playground | Functional but hooks can't inject skill instructions into Claude's context window directly |
| CLAUDE.md in plugin root | Plugin discovery may load CLAUDE.md as project context | Unverified; CLAUDE.md is a project-level file, not a plugin mechanism |

**Recommendation:** Document the ambient rule as a manual post-install step in README. The `paths` frontmatter approach is excluded because it breaks `/watson` slash command registration (confirmed by memory `feedback_paths_breaks_slash_command.md`). The plugin plugin system has no native ambient rule mechanism. This is the one non-automated step in the install flow.

---

### Distribution via GitHub Marketplace

Watson will be distributed via a personal GitHub repo (`austindick/watson`) acting as both the plugin repo and the marketplace.

**Two-file setup in the repo:**

```
watson/
├── .claude-plugin/
│   ├── plugin.json          # Plugin manifest
│   └── marketplace.json     # Marketplace catalog
```

**`marketplace.json` format:**

```json
{
  "name": "watson",
  "owner": {
    "name": "Austin Dick"
  },
  "plugins": [
    {
      "name": "watson",
      "source": "./",
      "description": "Design discussion and prototype building for Faire's Prototype Playground"
    }
  ]
}
```

**Teammate install flow (one command each):**

```bash
# Step 1: Add the marketplace (registers the catalog)
/plugin marketplace add austindick/watson

# Step 2: Install the plugin
/plugin install watson@watson

# Step 3: Manual ambient rule setup (documented in README)
# Copy ~/.claude/plugins/cache/watson/watson/*/rules/watson-ambient.md → ~/.claude/rules/
```

**Alternative: install via `--plugin-dir` locally (no marketplace needed):**

```bash
claude --plugin-dir ./path/to/watson/plugin
```

**Private repo authentication:** If repo is private, teammates need `GITHUB_TOKEN` set for background auto-updates. For `git clone` / manual installs, existing git credentials work.

---

### Local Testing Workflow (verified)

```bash
# Load plugin for current session without installing
claude --plugin-dir ./watson-plugin-dir

# Load multiple plugins simultaneously
claude --plugin-dir ./watson --plugin-dir ./other-plugin

# Reload without restarting after changes
/reload-plugins

# Try the main command
/watson

# Validate manifest and component files
claude plugin validate .
# or from within session:
/plugin validate .
```

**What validate checks:** `plugin.json` syntax and schema, skill/agent/command YAML frontmatter, `hooks/hooks.json` syntax and schema.

**Debug loading issues:**

```bash
claude --debug
# Shows: which plugins loaded, manifest errors, command/agent/hook registration, MCP server init
```

**Plugin override during development:** When `--plugin-dir` plugin has the same name as an installed marketplace plugin, local copy takes precedence for that session. Useful for testing updates without uninstalling the installed version.

---

### Agent Frontmatter in Plugin Context

Plugin agents support these frontmatter fields (verified):

```markdown
---
name: agent-name
description: What this agent specializes in and when Claude should invoke it
model: sonnet
effort: medium
maxTurns: 20
disallowedTools: Write, Edit
tools: [specific tools list]
skills: [skill references]
memory: ...
background: true
isolation: worktree
---
```

**NOT supported in plugin agents:** `hooks`, `mcpServers`, `permissionMode` — these are security-restricted for plugin-distributed agents.

Watson's existing agents use `background: true` (layout, design, builder, reviewer, consolidator) and `background: false` (interactions when interview needed). These frontmatter fields are unchanged in plugin context.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `.claude-plugin/plugin.json` manifest | Current (2026) | Declares plugin identity, version, and component paths | Required for namespacing, versioning, and marketplace distribution. Without it, plugin name defaults to directory name (fragile). |
| `commands/watson.md` (was SKILL.md) | Current | Main `/watson` slash command entrypoint | `commands/` produces user-invokable `/watson` without namespace prefix confusion. Preserves existing user muscle memory. |
| `skills/<name>/SKILL.md` structure | Current | Model-invokable subskills (discuss, loupe) | `skills/` directory triggers model auto-invocation based on `description` field. Correct location for subskills the model dispatches to. |
| `${CLAUDE_PLUGIN_ROOT}` path variable | Current | Replace all `~/.claude/skills/watson/` hardcoded paths | The only portable path mechanism. Substituted inline in skill content, agent content, and hook commands. |
| `hooks/hooks.json` | Current | Watson session lifecycle hooks (SessionStart, SessionEnd) | Extracts Watson's two hooks from personal `settings.json` into the plugin. Teammates get hooks automatically on install. |
| `marketplace.json` in `.claude-plugin/` | Current | Self-contained marketplace for `austindick/watson` GitHub repo | Enables `/plugin marketplace add austindick/watson` + `/plugin install watson@watson`. One-command pattern for teammates. |

### Supporting Libraries

No npm dependencies, no scripts, no external tooling. Watson is purely Markdown skill files with JSON configuration — consistent with the "no external deps" constraint.

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `claude --plugin-dir ./watson` | Local session testing | Loads plugin without installing; local copy overrides installed version of same name |
| `/reload-plugins` | Hot-reload after changes | Reloads skills, agents, hooks, MCP servers without restart |
| `claude plugin validate .` | Schema validation | Checks plugin.json, frontmatter, hooks.json for syntax/schema errors |
| `claude --debug` | Loading diagnostics | Shows plugin load sequence, registration, errors |

---

## Path Migration Inventory

All files requiring `~/.claude/skills/watson/` → `${CLAUDE_PLUGIN_ROOT}/` replacement:

| File | Hardcoded occurrences | Change |
|------|-----------------------|--------|
| `skills/loupe.md` | 9 paths (LIBRARY.md + 8 chapter paths in example) | Replace prefix only |
| `skills/discuss.md` | 1 path (LIBRARY.md reference) | Replace prefix |
| `references/agent-contract.md` | 2 example paths in table | Replace prefix (documentation strings) |
| `docs/maintainer.md` | ~6 paths | Replace prefix (human-readable docs) |
| `docs/architecture.md` | ~1 path | Replace prefix |
| `docs/roadmap.md` | ~1 path | Replace prefix |

Files that do NOT need changes: `agents/*.md`, `utilities/watson-init.md` — no hardcoded paths found. Agent files receive `libraryPaths[]` as runtime parameters from subskills; they do not construct paths themselves.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `commands/watson.md` as main entrypoint | `skills/watson/SKILL.md` as main entrypoint | Use skills/ if you want model auto-invocation for the main orchestrator. Rejected because `/watson:watson` namespace is awkward and breaks user muscle memory. |
| Plugin + marketplace in same repo | Separate plugin repo and marketplace repo | Separate repos when distributing many plugins. Overkill for single-plugin personal distribution. |
| `${CLAUDE_PLUGIN_ROOT}` path substitution | Runtime path detection via Bash in skills | Bash-based path detection adds complexity and breaks if Claude's working directory differs. `${CLAUDE_PLUGIN_ROOT}` is the platform-provided solution. |
| Ambient rule as manual README step | SessionStart hook to write `~/.claude/rules/` file | Hook-based rule injection writes outside plugin boundary, creates mutable state in user config. Manual step is cleaner boundary. |
| Library books committed to plugin repo | Librarian regenerates at install time | Regeneration requires access to Faire's private Slate source — teammates don't have this. Books must be pre-generated by maintainer and committed. |
| Relative-path source `"./"` in marketplace.json | `github` source type pointing to same repo | `"./"` works only when marketplace is installed via Git (not direct URL). Since teammates add via `austindick/watson` GitHub shorthand, relative path resolves correctly. |

---

## What NOT to Do

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Putting `commands/`, `agents/`, `skills/` inside `.claude-plugin/` | Platform hard rule: `.claude-plugin/` contains only `plugin.json`. Components in wrong location are invisible. | All component directories at plugin root |
| Using `paths` frontmatter in main SKILL.md/command | Breaks `/watson` slash command registration (confirmed Watson 1.1 decision) | Ambient rule via `~/.claude/rules/` (manual step); `description` field for model auto-invocation |
| Hardcoding `~/.claude/skills/watson/` in any skill or agent file | Path breaks on teammate machines; breaks on plugin update (path changes) | `${CLAUDE_PLUGIN_ROOT}` for all plugin-relative paths |
| Writing Watson state to `${CLAUDE_PLUGIN_ROOT}` | Plugin root path changes on update; files written there do not survive updates | `${CLAUDE_PLUGIN_ROOT}` for read-only bundled files; `/tmp/watson-active.json` for session state (existing pattern) |
| Generating library books at teammate install time | Requires access to Faire's private Slate source; not portable | Maintainer pre-generates and commits books to repo; teammates get books bundled in plugin |
| Migrating GSD hooks into Watson plugin | GSD hooks (`gsd-check-update.js`, `gsd-context-monitor.js`) are not Watson's — they belong in GSD plugin or personal settings | Keep GSD hooks in `~/.claude/settings.json`; migrate only the two Watson-owned hooks |
| Adding `hooks`, `mcpServers`, or `permissionMode` to agent frontmatter | Explicitly unsupported for plugin-distributed agents (security restriction) | Plugin-level `hooks/hooks.json` for hook behavior |

---

## Version Compatibility

| Component | Version / Notes |
|-----------|----------------|
| Plugin manifest `.claude-plugin/plugin.json` | Current (2026) — official feature |
| `${CLAUDE_PLUGIN_ROOT}` / `${CLAUDE_PLUGIN_DATA}` env variables | Current — substituted in skill content, agent content, hook commands |
| `commands/` directory for slash commands | Current — auto-discovered at plugin root |
| `skills/<name>/SKILL.md` structure | Current — subdirectory-per-skill with SKILL.md |
| `hooks/hooks.json` | Current — auto-discovered at `hooks/hooks.json` in plugin root |
| `claude --plugin-dir` flag | Current — local session testing without install |
| `/reload-plugins` command | Current — hot-reload during development |
| `claude plugin validate` CLI | Current — validates plugin.json, frontmatter, hooks.json |
| Marketplace `marketplace.json` in `.claude-plugin/` | Current — enables `/plugin marketplace add owner/repo` |
| Relative-path plugin source `"./"` in marketplace.json | Current — works only with Git-based marketplace installs (not URL-based) |
| `background`, `isolation`, `maxTurns` agent frontmatter | Current — unchanged from Watson 1.1 |
| Plugin agents: `hooks`/`mcpServers`/`permissionMode` frontmatter | NOT SUPPORTED — security restriction on plugin agents |

---

## Sources

- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference) — complete manifest schema, directory structure, component discovery rules, environment variables, CLI commands, debugging tools (HIGH confidence — official docs, fetched 2026-04-02)
- [Claude Code Create Plugins](https://code.claude.com/docs/en/plugins) — quickstart, `--plugin-dir` usage, `/reload-plugins`, migration from standalone config, hooks migration pattern (HIGH confidence — official docs, fetched 2026-04-02)
- [Claude Code Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) — marketplace.json schema, GitHub distribution, `owner/repo` add command, private repo auth, relative-path source type (HIGH confidence — official docs, fetched 2026-04-02)
- [Claude Code Discover Plugins](https://code.claude.com/docs/en/discover-plugins) — install commands, scope options, team distribution via `extraKnownMarketplaces` (HIGH confidence — official docs, fetched 2026-04-02)
- `/Users/austindick/.claude/skills/watson/` — live Watson file inventory, hardcoded path audit (HIGH confidence — live files, inspected 2026-04-02)
- `/Users/austindick/.claude/settings.json` — current hook configuration, Watson-owned hooks identified (HIGH confidence — live file, inspected 2026-04-02)
- `/Users/austindick/.claude/rules/watson-ambient.md` — confirmed ambient rule exists at user level, not in plugin (HIGH confidence — live file, inspected 2026-04-02)
- Memory `feedback_paths_breaks_slash_command.md` — `paths` frontmatter in SKILL.md breaks slash command registration; Watson 1.1 resolved by dropping `paths` (HIGH confidence — validated decision)

---

*Stack research for: Watson 1.2 — plugin packaging, manifest, directory layout, hooks migration, path portability, GitHub distribution*
*Researched: 2026-04-02*
