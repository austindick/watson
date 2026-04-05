# Phase 13: Plugin Scaffold + Path Portability - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Convert Watson from a personal skill directory (`~/.claude/skills/watson/`) into a valid Claude Code plugin with portable paths, bundled library books, and resolved command namespace. No new Watson capabilities — this is a packaging and distribution migration.

</domain>

<decisions>
## Implementation Decisions

### Command Namespace
- Use `skills/watson/SKILL.md` placement — accept plugin namespace (`/watson:watson`)
- No namespace hacks — `/watson:watson` is awkward but correct; revisit if plugin ecosystem evolves
- `commands/` directory reserved for future actual commands (e.g., `/watson:status`, `/watson:off`)
- Ambient rule updated to reference the namespaced command `/watson:watson`
- Subskills (discuss, loupe) remain internal dispatches via Watson's intent classification — not independently invocable as slash commands

### Plugin Directory Structure
- Option A: everything nested under `skills/watson/` — current internal layout preserved
- agents/, skills/, utilities/, references/, library/, docs/ all live inside `skills/watson/`
- Plugin discovers only `skills/watson/SKILL.md` — discuss.md and loupe.md are NOT registered as separate plugin skills
- No restructuring of discuss or loupe required

### Path Migration
- Replace all `~/.claude/skills/watson/` with `${CLAUDE_PLUGIN_ROOT}/skills/watson/`
- Test-first approach: try `${CLAUDE_PLUGIN_ROOT}` substitution and `@`-references in a `--plugin-dir` test session
- Fix `@`-style dispatch references only if they break (they may resolve correctly relative to SKILL.md location)
- ~20 hardcoded paths across loupe.md (10), discuss.md (1), agent-contract.md (1), docs/ (5), library/BOOK.md (1)

### Library Bundling
- Both books (design-system, playground-conventions) bundled in plugin at `skills/watson/library/`
- No sensitivity concerns — all internal tooling, safe for personal GitHub repo
- Librarian updated to work within plugin context for maintainer regeneration
- Teammates receive updated books via plugin auto-update (maintainer regenerates and pushes)

### Dev Location and Repo Strategy
- Plugin repo merges into `~/watson` alongside planning docs
- `austindick/watson` on GitHub becomes the plugin repo
- Pre-migration snapshots saved: `austindick/watson-skill-wip` (skill files), `austindick/watson-planning` (planning docs)
- Planning docs (`.planning/`) coexist with plugin files in same repo — harmless extra files in teammate cache

### Versioning
- Plugin version matches Watson milestone versions (v1.2 = plugin 1.2.0)
- Bump on every meaningful change (bug fix = patch, feature = minor)
- Version field in plugin.json drives auto-update detection

### Teammate Onboarding
- Guided first-run setup prompt for ambient rule and statusLine (things plugins can't auto-configure)
- SessionStart hook detects missing ambient rule on first load and walks user through one-time setup
- Zero manual steps is the goal — anything that can't be automated gets a first-run prompt
- README documents prerequisites: Figma MCP, GITHUB_TOKEN for private repo auto-updates

### Claude's Discretion
- Exact `${CLAUDE_PLUGIN_ROOT}` substitution pattern if `@`-references need rewriting
- hooks.json event format and hook command structure
- plugin.json metadata fields beyond name/version (description, author, etc.)
- StatusLine first-run detection mechanism

</decisions>

<code_context>
## Existing Code Insights

### Files Requiring Path Changes
- `skills/loupe.md`: 10 hardcoded `~/.claude/skills/watson/library/` paths (libraryPaths array + LIBRARY.md read)
- `skills/discuss.md`: 1 hardcoded path (LIBRARY.md read)
- `references/agent-contract.md`: 1 hardcoded path (libraryPaths example)
- `docs/maintainer.md`: 5 hardcoded paths (library, agents, subskills locations)
- `docs/architecture.md`: 1 hardcoded path (directory tree)
- `docs/roadmap.md`: 1 hardcoded path (ambient rule location)
- `library/playground-conventions/BOOK.md`: 1 hardcoded path (source reference)

### Hooks to Migrate
- `~/.claude/settings.json` line 75: SessionStart hook (Watson recovery notification)
- `~/.claude/settings.json` line 95: SessionEnd hook (branch+actions preservation to watson-session-end.json)
- `~/.claude/hooks/share-proto-statusline.js`: StatusLine script (shared with share-proto — needs Watson-only fork)

### External Dependencies
- `~/.claude/rules/watson-ambient.md`: Path-specific rule for Prototype Playground ambient activation — cannot be bundled in plugin, needs first-run setup prompt
- `/tmp/watson-active.json`: Session state file — works across plugin boundaries (not in ~/.claude/)
- `/tmp/watson-session-end.json`: Session recovery file — same, works anywhere

### Established Patterns
- `@agents/`, `@skills/`, `@utilities/` dispatch convention — instruction-following convention, not Claude Code feature. Relative to SKILL.md location.
- `libraryPaths` array in agent dispatch — currently absolute paths, needs `${CLAUDE_PLUGIN_ROOT}` substitution
- Session state via /tmp/ files — plugin-boundary-safe, no changes needed

</code_context>

<specifics>
## Specific Ideas

- "Can we actually push what we currently have up to a repo before doing anything else? I want to save where we're at right now just in case." — Done: watson-skill-wip and watson-planning snapshot repos created.
- "I want austindick/watson to become the main thing eventually, which I'm guessing will be the plugin." — Confirmed: ~/watson merges planning + plugin, austindick/watson is the plugin repo.
- "/watson:watson is a bit repetitive and awkward, but we can address that later." — Accepted as v1.2 reality; future polish opportunity.
- Zero manual steps is the ideal — guided first-run prompt for anything that can't be automated.

</specifics>

<deferred>
## Deferred Ideas

- Rename skill directory for better namespace (e.g., `skills/start/SKILL.md` → `/watson:start`) — future polish
- Promote discuss/loupe to independently invocable skills (`/watson:discuss`, `/watson:loupe`) — if demand emerges
- Public repo for broader adoption — start private, go public if warranted
- Plugin namespace collapsing (if Claude Code adds support for single-skill plugins) — monitor ecosystem

</deferred>

---

*Phase: 13-plugin-scaffold-path-portability*
*Context gathered: 2026-04-05*
