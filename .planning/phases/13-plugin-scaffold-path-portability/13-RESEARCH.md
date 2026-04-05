# Phase 13: Plugin Scaffold + Path Portability - Research

**Researched:** 2026-04-05
**Domain:** Claude Code plugin system — packaging, manifest, path portability
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Command Namespace**
- Use `skills/watson/SKILL.md` placement — accept plugin namespace (`/watson:watson`)
- No namespace hacks — `/watson:watson` is awkward but correct; revisit if plugin ecosystem evolves
- `commands/` directory reserved for future actual commands (e.g., `/watson:status`, `/watson:off`)
- Ambient rule updated to reference the namespaced command `/watson:watson`
- Subskills (discuss, loupe) remain internal dispatches via Watson's intent classification — not independently invocable as slash commands

**Plugin Directory Structure**
- Option A: everything nested under `skills/watson/` — current internal layout preserved
- agents/, skills/, utilities/, references/, library/, docs/ all live inside `skills/watson/`
- Plugin discovers only `skills/watson/SKILL.md` — discuss.md and loupe.md are NOT registered as separate plugin skills
- No restructuring of discuss or loupe required

**Path Migration**
- Replace all `~/.claude/skills/watson/` with `${CLAUDE_PLUGIN_ROOT}/skills/watson/`
- Test-first approach: try `${CLAUDE_PLUGIN_ROOT}` substitution and `@`-references in a `--plugin-dir` test session
- Fix `@`-style dispatch references only if they break (they may resolve correctly relative to SKILL.md location)
- ~20 hardcoded paths across loupe.md (10), discuss.md (1), agent-contract.md (1), docs/ (5), library/BOOK.md (1)

**Library Bundling**
- Both books (design-system, playground-conventions) bundled in plugin at `skills/watson/library/`
- No sensitivity concerns — all internal tooling, safe for personal GitHub repo
- Librarian updated to work within plugin context for maintainer regeneration
- Teammates receive updated books via plugin auto-update (maintainer regenerates and pushes)

**Dev Location and Repo Strategy**
- Plugin repo merges into `~/watson` alongside planning docs
- `austindick/watson` on GitHub becomes the plugin repo
- Pre-migration snapshots saved: `austindick/watson-skill-wip` (skill files), `austindick/watson-planning` (planning docs)
- Planning docs (`.planning/`) coexist with plugin files in same repo — harmless extra files in teammate cache

**Versioning**
- Plugin version matches Watson milestone versions (v1.2 = plugin 1.2.0)
- Bump on every meaningful change (bug fix = patch, feature = minor)
- Version field in plugin.json drives auto-update detection

**Teammate Onboarding**
- Guided first-run setup prompt for ambient rule and statusLine (things plugins can't auto-configure)
- SessionStart hook detects missing ambient rule on first load and walks user through one-time setup
- Zero manual steps is the goal — anything that can't be automated gets a first-run prompt
- README documents prerequisites: Figma MCP, GITHUB_TOKEN for private repo auto-updates

### Claude's Discretion
- Exact `${CLAUDE_PLUGIN_ROOT}` substitution pattern if `@`-references need rewriting
- hooks.json event format and hook command structure
- plugin.json metadata fields beyond name/version (description, author, etc.)
- StatusLine first-run detection mechanism

### Deferred Ideas (OUT OF SCOPE)
- Rename skill directory for better namespace (e.g., `skills/start/SKILL.md` → `/watson:start`) — future polish
- Promote discuss/loupe to independently invocable skills (`/watson:discuss`, `/watson:loupe`) — if demand emerges
- Public repo for broader adoption — start private, go public if warranted
- Plugin namespace collapsing (if Claude Code adds support for single-skill plugins) — monitor ecosystem
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PLUG-01 | Watson loads as a Claude Code plugin with a valid plugin.json manifest (name, version, description) | plugin.json schema fully documented; `.claude-plugin/plugin.json` location confirmed |
| PLUG-02 | All internal file references use `${CLAUDE_PLUGIN_ROOT}` instead of hardcoded `~/.claude/skills/watson/` paths | `${CLAUDE_PLUGIN_ROOT}` is a real, documented variable substituted in skill content and hook commands; exact replacement targets identified |
| PLUG-03 | Plugin directory structure follows Claude Code plugin spec (skills/, agents/, commands/ as appropriate) | Standard layout documented; `skills/watson/` nested structure is valid; only plugin.json goes in `.claude-plugin/` |
| PLUG-04 | Library books (design-system, playground-conventions) are bundled in the plugin and accessible to all agents via portable paths | Books already live at `skills/watson/library/` — portable after PLUG-02 path migration |
| PLUG-05 | The `/watson` slash command works after plugin install (namespace investigation determines whether via commands/ or skills/ with accepted namespace) | Skills placed at `skills/<name>/SKILL.md` → registered as `/plugin-name:name`; Watson at `skills/watson/SKILL.md` → `/watson:watson`; confirmed by docs |
</phase_requirements>

---

## Summary

Watson must move from a personal skill directory (`~/.claude/skills/watson/`) to a valid Claude Code plugin. The plugin system is well-documented and straightforward. Two environmental changes matter for this phase: creating `.claude-plugin/plugin.json`, and replacing every `~/.claude/skills/watson/` path string with `${CLAUDE_PLUGIN_ROOT}/skills/watson/`. Everything else — the internal directory layout, @-style dispatch conventions, library structure, /tmp/ state files — stays as-is.

The `${CLAUDE_PLUGIN_ROOT}` variable is officially documented and is substituted anywhere it appears in skill content, agent content, and hook commands. This is exactly the mechanism needed for library path portability. The `@`-style dispatch references (`@agents/builder.md`, `@skills/loupe.md`) are Watson's instruction-following convention, not a Claude Code feature — Claude reads these as relative file paths when executing skill instructions. They should continue to work if Claude resolves them relative to the SKILL.md location (which is within the plugin). The CONTEXT.md decision is to test first and only rewrite if they break.

The plugin namespace outcome is confirmed: a skill at `skills/watson/SKILL.md` inside a plugin named `watson` (per plugin.json) registers as `/watson:watson`. This is the accepted awkward-but-correct outcome for this milestone.

**Primary recommendation:** Create `.claude-plugin/plugin.json` with `name: "watson"`, copy all `~/.claude/skills/watson/` files into the `~/watson/` repo under their current relative paths, do a targeted find-and-replace of `~/.claude/skills/watson/` → `${CLAUDE_PLUGIN_ROOT}/skills/watson/` in the ~20 affected files, verify with `claude --plugin-dir ./`, and validate with `claude plugin validate`.

---

## Standard Stack

### Core

| Component | Location | Purpose | Notes |
|-----------|----------|---------|-------|
| `.claude-plugin/plugin.json` | Plugin root | Plugin manifest — name, version, description | `name` is only required field if manifest present; name gates namespace |
| `${CLAUDE_PLUGIN_ROOT}` | Variable in skill/agent/hook content | Absolute path to plugin installation directory | Substituted inline in text; also exported as env var to hook processes |
| `skills/<name>/SKILL.md` | Plugin root | Skill registration | Directory name becomes skill name; namespaced as `/plugin-name:dir-name` |
| `hooks/hooks.json` | Plugin root | Hook configuration (SessionStart, SessionEnd, etc.) | Same format as settings.json hooks |

### Plugin Directory Structure (Final)

```
~/watson/                          ← plugin root (= austindick/watson repo)
├── .claude-plugin/
│   └── plugin.json                ← manifest: name=watson, version=1.2.0
├── skills/
│   └── watson/                    ← registered as /watson:watson
│       ├── SKILL.md               ← main skill (≤200 lines, current)
│       ├── agents/                ← all 8 agents (unchanged structure)
│       ├── skills/                ← discuss.md, loupe.md (unchanged)
│       ├── utilities/             ← watson-init.md (unchanged)
│       ├── references/            ← agent-contract.md (unchanged)
│       ├── library/               ← design-system/, playground-conventions/ bundled
│       └── docs/                  ← architecture.md, maintainer.md, roadmap.md
├── hooks/
│   └── hooks.json                 ← Phase 14 (not this phase)
├── .planning/                     ← planning docs coexist, harmless in cache
└── README.md
```

### Environment Variables Available in Plugin Context

| Variable | What It Resolves To | Valid In |
|----------|---------------------|----------|
| `${CLAUDE_PLUGIN_ROOT}` | Absolute path to plugin installation dir | Skill content, agent content, hook commands, MCP/LSP configs |
| `${CLAUDE_PLUGIN_DATA}` | Persistent dir that survives plugin updates (`~/.claude/plugins/data/{id}/`) | Same as above |
| `${CLAUDE_SKILL_DIR}` | Absolute path to the skill's directory (e.g., `.../skills/watson/`) | Skill content only |

For this phase, `${CLAUDE_PLUGIN_ROOT}` is the right choice. `${CLAUDE_SKILL_DIR}` only works within skill content, not within agent or subskill files that reference library paths. `${CLAUDE_PLUGIN_ROOT}/skills/watson/` is the full replacement for `~/.claude/skills/watson/`.

---

## Architecture Patterns

### Pattern 1: plugin.json Minimal Manifest

**What:** The manifest file that makes a directory a plugin. Only `name` is strictly required.
**When to use:** Always — create this first.

```json
// .claude-plugin/plugin.json
{
  "name": "watson",
  "version": "1.2.0",
  "description": "Design discussion and prototype building for the Faire Prototype Playground",
  "author": {
    "name": "Austin Dick"
  },
  "repository": "https://github.com/austindick/watson"
}
```

The `name` field `"watson"` means:
- Plugin namespace = `watson`
- Skill at `skills/watson/SKILL.md` → `/watson:watson`

### Pattern 2: Path Replacement Pattern

**What:** Replacing all `~/.claude/skills/watson/` occurrences with `${CLAUDE_PLUGIN_ROOT}/skills/watson/`

**Target files and counts (from CONTEXT.md code audit):**

| File | Count | Example replacement |
|------|-------|---------------------|
| `skills/watson/skills/loupe.md` | 10 | `~/.claude/skills/watson/library/LIBRARY.md` → `${CLAUDE_PLUGIN_ROOT}/skills/watson/library/LIBRARY.md` |
| `skills/watson/skills/discuss.md` | 1 | Same pattern |
| `skills/watson/references/agent-contract.md` | 1 | Example in libraryPaths docs |
| `skills/watson/docs/maintainer.md` | 5 | References to library/, agents/, skills/ locations |
| `skills/watson/docs/architecture.md` | 1 | Directory tree |
| `skills/watson/docs/roadmap.md` | 1 | Ambient rule location reference |
| `skills/watson/library/playground-conventions/BOOK.md` | 1 | Source reference |

**Shell verification command (after replacement):**
```bash
grep -r "~/.claude" ~/watson/skills/ && echo "FOUND - fix remaining" || echo "CLEAN"
```

Success criterion for PLUG-02: zero hits.

### Pattern 3: @-Reference Resolution

**What:** Watson uses `@agents/builder.md`, `@skills/loupe.md`, `@utilities/watson-init.md` as instruction-following dispatch conventions — not Claude Code syntax.

**How it works:** Claude reads these as file path instructions within the skill's markdown content. When executing from a plugin, Claude resolves relative paths from its working context. These are not substituted by Claude Code's variable system — they are prose instructions that Claude follows.

**Risk level:** MEDIUM. The CONTEXT.md decision is test-first — run `claude --plugin-dir ./` and invoke `/watson:watson`. If agents dispatch correctly to `@agents/builder.md` etc., no change needed. If they fail, add `${CLAUDE_PLUGIN_ROOT}/skills/watson/` prefix to convert them to absolute paths.

**Hypothesis:** They likely work because Claude reads the SKILL.md and subskill files and interprets `@agents/` relative to where the skill lives — but this is unverified in plugin context and must be validated in the first test session.

### Pattern 4: hooks.json Format

**What:** Plugin hooks live in `hooks/hooks.json` at plugin root. Format mirrors the `hooks` object from settings.json.

```json
// hooks/hooks.json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "if [ -f /tmp/watson-active.json ]; then echo '⚡ Watson was active before /clear. Run /watson:watson to reactivate.'; fi"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node -e \"const fs=require('fs'); ...watson session-end logic...\""
          }
        ]
      }
    ]
  }
}
```

Note: Hook migration (HOOK-01 through HOOK-04) is Phase 14, not Phase 13. Phase 13 does NOT create hooks.json.

### Pattern 5: Plugin Validation

**What:** Validate plugin before shipping.

```bash
# Test locally during development
claude --plugin-dir ~/watson

# Validate manifest and component structure
claude plugin validate

# Inside a session, reload after edits
/reload-plugins
```

`claude plugin validate` checks: plugin.json syntax and schema, skill/agent/command frontmatter, hooks.json syntax. This maps to the success criterion "Running `claude plugin validate .` against the Watson directory returns no errors."

### Anti-Patterns to Avoid

- **Putting agents/, skills/, hooks/ inside `.claude-plugin/`**: Only `plugin.json` belongs in `.claude-plugin/`. All other directories must be at the plugin root. Watson's skill files live at `skills/watson/` which is at the plugin root — this is correct.
- **Using `${CLAUDE_SKILL_DIR}` for library paths**: `${CLAUDE_SKILL_DIR}` resolves to the skill's subdirectory (e.g., `skills/watson/`), not the plugin root. For agent files that reference library paths, only `${CLAUDE_PLUGIN_ROOT}` works cross-file.
- **Absolute path traversal outside plugin root**: Installed plugins cannot reference files outside their directory. All library book paths must be within the plugin.
- **Forgetting to bump version**: Claude Code uses version to detect updates. If code changes without a version bump, existing users won't receive updates.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Plugin validation | Custom lint script | `claude plugin validate` | Built-in CLI command checks manifest, frontmatter, hooks syntax |
| Plugin loading test | Complex test harness | `claude --plugin-dir ./` | Official development flag; `--plugin-dir` can be specified multiple times |
| Hot-reload during dev | Restart claude session | `/reload-plugins` in session | Reloads plugins, skills, agents, hooks without restart |
| Path variable lookup | String manipulation | `${CLAUDE_PLUGIN_ROOT}` | Officially supported, substituted automatically in all plugin content |

---

## Common Pitfalls

### Pitfall 1: Wrong Manifest Location

**What goes wrong:** Putting plugin.json at the plugin root instead of inside `.claude-plugin/`.
**Why it happens:** Confusion between the plugin root (where skills/, agents/ live) and the metadata directory.
**How to avoid:** The manifest lives at `.claude-plugin/plugin.json`. All OTHER directories (skills, agents, hooks) are at the plugin root. Only `plugin.json` goes inside `.claude-plugin/`.
**Warning signs:** Plugin loads but components are missing; `claude --debug` shows no component registration.

### Pitfall 2: Incomplete Path Replacement

**What goes wrong:** Missing some `~/.claude/skills/watson/` instances after the find-and-replace.
**Why it happens:** Paths appear in docs files, example strings in reference docs, and BOOK.md source references — not just in executable skill content.
**How to avoid:** Run `grep -r "~/.claude" ~/watson/` after replacement. Zero hits required. The exact set of ~20 targets is documented above.
**Warning signs:** Agents fail to read library books with "file not found" errors; success criterion 4 (zero grep hits) fails.

### Pitfall 3: @-Reference Failure in Plugin Context

**What goes wrong:** `@agents/builder.md` and similar dispatch references break when Watson runs as a plugin because paths no longer resolve from `~/.claude/skills/watson/`.
**Why it happens:** These are Claude-interpreted prose instructions, not Claude Code syntax. Resolution depends on how Claude determines the base path for relative file references within a plugin context.
**How to avoid:** Test with `/watson:watson` in a `--plugin-dir` session before committing to either approach. If broken, prepend `${CLAUDE_PLUGIN_ROOT}/skills/watson/` to all `@agents/`, `@skills/`, `@utilities/` references. Total count: ~10 in loupe.md, ~4 in SKILL.md, 0 in discuss.md.
**Warning signs:** Watson activates but discuss or loupe dispatch fails; agents are not dispatched; pipeline doesn't start.

### Pitfall 4: `name` Field Determines Namespace — Choose Carefully

**What goes wrong:** Plugin name in plugin.json is not `"watson"`, causing skill to register under wrong namespace.
**Why it happens:** The `name` field doubles as both the plugin identifier AND the skill namespace prefix.
**How to avoid:** Set `"name": "watson"` in plugin.json. With skill at `skills/watson/SKILL.md`, this yields `/watson:watson` — the accepted outcome per CONTEXT.md.
**Warning signs:** `/watson:watson` not available; skill appears under unexpected namespace.

### Pitfall 5: Confusing This Phase with Hook Migration

**What goes wrong:** Attempting to create hooks/hooks.json and migrate SessionStart/SessionEnd hooks in Phase 13.
**Why it happens:** Hook migration is natural to think about alongside plugin scaffolding.
**How to avoid:** Phase 13 scope is PLUG-01 through PLUG-05 only. hooks.json is Phase 14 (HOOK-01 through HOOK-04). Do NOT create hooks/hooks.json in this phase.
**Warning signs:** Planning tasks for hook JSON creation or settings.json hook removal in Phase 13 plans.

---

## Code Examples

### plugin.json Full Schema (Relevant Fields)

```json
// Source: https://code.claude.com/docs/en/plugins-reference#complete-schema
{
  "name": "watson",
  "version": "1.2.0",
  "description": "Design discussion and prototype building for the Faire Prototype Playground",
  "author": {
    "name": "Austin Dick",
    "url": "https://github.com/austindick"
  },
  "repository": "https://github.com/austindick/watson"
}
```

### ${CLAUDE_PLUGIN_ROOT} in Skill Content

```markdown
// Source: https://code.claude.com/docs/en/plugins-reference#environment-variables

// Before (in loupe.md):
1. Read `~/.claude/skills/watson/library/LIBRARY.md` — this is the book index.

// After:
1. Read `${CLAUDE_PLUGIN_ROOT}/skills/watson/library/LIBRARY.md` — this is the book index.
```

```markdown
// Before (libraryPaths array example in loupe.md):
libraryPaths = [
  "~/.claude/skills/watson/library/design-system/global-theme/CHAPTER.md",
  ...
]

// After:
libraryPaths = [
  "${CLAUDE_PLUGIN_ROOT}/skills/watson/library/design-system/global-theme/CHAPTER.md",
  ...
]
```

### Validation Command

```bash
# Source: https://code.claude.com/docs/en/plugins-reference#debugging-and-development-tools

# Validate plugin structure and manifest
claude plugin validate

# Load for test session
claude --plugin-dir ~/watson

# Inside session — test the skill
/watson:watson

# Reload after editing files mid-session
/reload-plugins
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Skills in `~/.claude/skills/` (personal only) | Plugin in any directory, distributed via marketplace | Current Claude Code | Watson must move to plugin format to be shareable |
| Hooks in `settings.json` | Hooks in `hooks/hooks.json` inside plugin | Current Claude Code | Phase 14 work — not Phase 13 |
| Absolute `~/.claude/` paths | `${CLAUDE_PLUGIN_ROOT}` variable | Current Claude Code | Enables portability across different user home directories |

**Key facts:**
- `commands/` and `skills/` both work for registering slash commands; `skills/` is the recommended modern approach
- The manifest (`.claude-plugin/plugin.json`) is technically optional — Claude Code auto-discovers components. But it is required to specify `name` and `version`, which are both needed for Watson.
- Plugin skills are namespaced automatically — there is no way to get `/watson` (non-namespaced) from a plugin. The user accepted `/watson:watson` for v1.2.

---

## Open Questions

1. **@-reference resolution in plugin context**
   - What we know: `@agents/builder.md` etc. are Watson instruction-following conventions, not Claude Code syntax. They work today from `~/.claude/skills/watson/`.
   - What's unclear: Whether Claude resolves these relative to the SKILL.md location when executing as a plugin, or whether it needs absolute `${CLAUDE_PLUGIN_ROOT}/skills/watson/agents/builder.md` paths.
   - Recommendation: Test with `/watson:watson` in first `--plugin-dir` session (Task 1 or early Task 2). If dispatch works, no change needed. If broken, systematic find-and-replace of `@agents/` → `${CLAUDE_PLUGIN_ROOT}/skills/watson/agents/`, etc. Plan should include both branches.

2. **Repo migration: copying files into ~/watson**
   - What we know: `~/watson` currently contains only `.planning/`. Watson skill files are at `~/.claude/skills/watson/`. The intent is to merge them.
   - What's unclear: The exact git strategy — copy files and commit, or something more involved.
   - Recommendation: Straightforward copy. `cp -r ~/.claude/skills/watson/* ~/watson/skills/watson/` (creating the `skills/watson/` directory). Then the path replacements happen in the new location.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual validation via Claude Code CLI (no automated test suite — plugin system is Claude-invocation-based) |
| Config file | none |
| Quick run command | `claude plugin validate` from `~/watson/` |
| Full suite command | `claude --plugin-dir ~/watson` then invoke `/watson:watson` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PLUG-01 | Valid plugin.json manifest loads without errors | smoke | `claude plugin validate` from `~/watson/` | ❌ Wave 0 — create `.claude-plugin/plugin.json` |
| PLUG-02 | Zero `~/.claude` references in plugin directory | automated-grep | `grep -r "~/.claude" ~/watson/skills/ \| wc -l` (expect 0) | N/A — grep check |
| PLUG-03 | Plugin directory structure follows spec | smoke | `claude plugin validate` + `claude --debug --plugin-dir ~/watson/` | ❌ Wave 0 — create structure |
| PLUG-04 | Library books accessible via portable paths | integration | Invoke `/watson:watson` → trigger Tier 2 build → verify no "file not found" from library | Depends on PLUG-02 |
| PLUG-05 | `/watson:watson` invocable after `--plugin-dir` | integration | `claude --plugin-dir ~/watson/` then `/watson:watson` | Depends on PLUG-01 + PLUG-03 |

### Sampling Rate
- **Per task commit:** `claude plugin validate` from `~/watson/`
- **Per wave merge:** Full invocation test: `claude --plugin-dir ~/watson/` + `/watson:watson`
- **Phase gate:** All 5 success criteria pass before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `~/watson/.claude-plugin/plugin.json` — covers PLUG-01, PLUG-03, PLUG-05
- [ ] `~/watson/skills/watson/` directory tree — covers PLUG-03 (copy from `~/.claude/skills/watson/`)

*(Plugin validation is CLI-invocation-based; no traditional test files needed beyond the plugin structure itself)*

---

## Sources

### Primary (HIGH confidence)
- [https://code.claude.com/docs/en/plugins-reference](https://code.claude.com/docs/en/plugins-reference) — complete manifest schema, `${CLAUDE_PLUGIN_ROOT}` and `${CLAUDE_PLUGIN_DATA}` variables, hooks.json format, all hook events, validation commands, directory structure spec, path traversal rules
- [https://code.claude.com/docs/en/plugins](https://code.claude.com/docs/en/plugins) — plugin quickstart, `--plugin-dir` flag, migration from standalone config, skill namespace mechanics
- [https://code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills) — SKILL.md frontmatter reference, `${CLAUDE_SKILL_DIR}` variable, plugin skill namespacing (`/plugin-name:skill-name`)

### Secondary (MEDIUM confidence)
- Inspected `/Users/austindick/.claude/skills/watson/` — confirmed 20 hardcoded path instances across 7 files; confirmed `@`-reference locations (SKILL.md, loupe.md); confirmed current hooks in `settings.json`
- Inspected `/Users/austindick/.claude/settings.json` — confirmed exact hook commands for SessionStart and SessionEnd that Phase 14 will migrate

---

## Metadata

**Confidence breakdown:**
- Standard stack (plugin.json, ${CLAUDE_PLUGIN_ROOT}, plugin structure): HIGH — sourced directly from official Claude Code docs
- Path replacement targets: HIGH — confirmed by grep across actual watson files
- @-reference resolution in plugin context: MEDIUM — undocumented edge case, test-first approach warranted
- hooks.json format: HIGH — documented in plugins-reference
- Namespace outcome (/watson:watson): HIGH — documented skill naming behavior confirmed

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (stable API; plugin spec unlikely to change rapidly)
