# Project Research Summary

**Project:** Watson 1.2 — Claude Code Plugin Packaging and Distribution
**Domain:** Claude Code plugin migration — shared skill framework to installable plugin
**Researched:** 2026-04-02
**Confidence:** HIGH

## Executive Summary

Watson is a multi-agent Claude Code skill framework for Faire's Prototype Playground that needs to transition from a personal `~/.claude/skills/watson/` installation to a distributable Claude Code plugin so teammates can install it with two commands and receive updates automatically. The research is grounded entirely in official Claude Code plugin documentation and direct audit of the Watson source tree. The recommended approach is: create a `.claude-plugin/plugin.json` manifest, reorganize the directory structure to match plugin conventions, replace all hardcoded `~/.claude/skills/watson/` paths with `${CLAUDE_PLUGIN_ROOT}`, migrate Watson's two session lifecycle hooks to `hooks/hooks.json`, bundle the pre-generated library books, and publish via a personal GitHub marketplace at `austindick/watson`.

The migration is predominantly mechanical. There are no new features being added, no external dependencies being introduced, and no fundamental changes to Watson's agent architecture. The largest bodies of work are: (1) the path portability audit — approximately 15 files with hardcoded absolute paths that must be replaced with `${CLAUDE_PLUGIN_ROOT}` — and (2) the command namespace decision, which affects every piece of documentation and every onboarding instruction. The path portability work is a hard prerequisite; nothing else can be validated until paths resolve correctly in the plugin cache.

Three risks require deliberate attention. First, the `/watson` command becomes `/watson:watson` under plugin namespacing — all documentation, the ambient rule, and in-skill help text must be updated before any teammate sees the plugin or muscle memory will be poisoned. Second, Watson's two session hooks currently coexist in `~/.claude/settings.json` alongside GSD framework hooks that must not be touched; clean extraction requires identifying Watson's hooks precisely and removing them from `settings.json` in the same commit that adds `hooks/hooks.json` to prevent double-firing. Third, two aspects of Watson's experience (`statusLine` and ambient rule auto-activation) cannot be automated through the plugin system and require documented manual post-install steps.

---

## Key Findings

### Recommended Stack

Watson requires no new technologies. The migration uses the Claude Code plugin system exclusively: a `plugin.json` manifest for identity and versioning, the `${CLAUDE_PLUGIN_ROOT}` environment variable for portable path resolution, `hooks/hooks.json` for session lifecycle hooks, and a `marketplace.json` file in `.claude-plugin/` for GitHub-based team distribution. No npm dependencies, no build scripts, and no external tooling are introduced — Watson remains purely Markdown skill files with JSON configuration.

The plugin directory structure requires some reorganization. The main `SKILL.md` moves to `skills/watson/SKILL.md` (producing the `/watson:watson` command), subskills `discuss.md` and `loupe.md` stay in `skills/watson/` as instruction-dispatched subfiles rather than independent discovered skills, `utilities/watson-init.md` moves to `commands/watson-init.md`, and the two Watson-owned hooks migrate from `~/.claude/settings.json` to `hooks/hooks.json`. Library books, references, and docs remain at the plugin root and are not auto-discovered — agents access them via `${CLAUDE_PLUGIN_ROOT}`.

**Core technologies:**
- `.claude-plugin/plugin.json`: Plugin manifest — required for stable namespacing, version-gated updates, and marketplace distribution
- `${CLAUDE_PLUGIN_ROOT}`: Portable path variable — substituted inline in all skill, agent, and hook content; replaces all `~/.claude/skills/watson/` prefixes
- `hooks/hooks.json`: Plugin-level hooks — migrates Watson's SessionStart and SessionEnd hooks out of personal `settings.json` so teammates receive them automatically on install
- `marketplace.json` in `.claude-plugin/`: GitHub marketplace catalog — enables two-command install (`/plugin marketplace add austindick/watson` then `/plugin install watson@watson`) without any per-teammate coordination
- `claude --plugin-dir ./watson` + `/reload-plugins`: Local development workflow — test plugin behavior without installing; hot-reload after changes without restarting Claude

### Expected Features

The MVP for Watson 1.2 is narrow: parity with the current personal skill installation, delivered via two install commands. Nothing is being added to Watson's capabilities — the goal is portability.

**Must have (table stakes):**
- One-command install — teammates cannot be expected to manually clone repos, edit `settings.json`, and copy files; two-command maximum
- `${CLAUDE_PLUGIN_ROOT}` path portability across all files — library reads fail silently without this; produces plausible-but-wrong output with no error surfaced
- `/watson:watson` command preserved and documented — teammates must know the actual namespaced command before first use
- Hooks migrated to `hooks/hooks.json` — session recovery and cleanup work automatically without per-teammate `settings.json` edits
- Library books bundled in `library/` — teammates cannot regenerate books without access to Faire's private monorepo; books must ship with the plugin
- `plugin.json` version increment on every push — Claude Code's update detection is version-gated; silent version omissions freeze teammates on old code

**Should have (differentiators):**
- `extraKnownMarketplaces` committed to Playground's `.claude/settings.json` — guides all Playground contributors to install the marketplace automatically on project trust
- `GITHUB_TOKEN` documented for auto-updates — teammates set it once and receive updates silently
- SHA pinning in `marketplace.json` initial entry — prevents mid-prototype breakage from library book regeneration
- `enabledPlugins` in project settings — eliminates install step for new Playground contributors after marketplace is established

**Defer (v2+):**
- `userConfig` for configurable `libraryPaths` — only needed when teammates have non-standard checkout layouts; low current demand
- Separate stable/beta release channels via `ref` pinning — warranted only when Watson has enough team users for staged rollouts
- Automated ambient rule deployment — plugin system has no `rules/` mechanism; SessionStart hook workaround is feasible but adds mutable state outside plugin boundary; manual step is cleaner for 1.2

### Architecture Approach

Watson's plugin architecture is a direct mapping of the existing skill directory tree into plugin conventions. The core data flow is unchanged: user invokes `/watson:watson` → SKILL.md orchestrates → loupe subskill dispatches 8 agents in parallel → agents read library chapters via `${CLAUDE_PLUGIN_ROOT}/library/` → agents produce artifacts. The only structural change is that all `@`-style dispatch references (`@agents/builder.md`, `@skills/discuss.md`, `@utilities/watson-init.md`, `@references/book-schema.md`) must become full `${CLAUDE_PLUGIN_ROOT}`-prefixed paths, because the plugin cache location is not predictable at authoring time.

The two non-portable features — `statusLine` and ambient rule — remain as manual post-install steps. `statusLine` is documented as a `settings.json` configuration that the teammate adds once; if share-proto is already installed, Watson's status indicator works automatically (no additional step). The ambient rule ships bundled inside the plugin at `docs/watson-ambient.md` as a template; installation instructions tell teammates to copy it to `~/.claude/rules/`.

**Major components:**
1. `.claude-plugin/plugin.json` — Plugin identity, version, and component path declarations; gates update delivery
2. `skills/watson/SKILL.md` — Main orchestrator and entry point; all @-dispatch references updated to `${CLAUDE_PLUGIN_ROOT}` paths
3. `skills/watson/discuss.md` and `loupe.md` — Subskills for design conversation and build pipeline; library base path updated
4. `agents/*.md` (8 files) — Parallel pipeline agents; receive `libraryPaths[]` at runtime; no path changes except `librarian.md`
5. `hooks/hooks.json` — Watson's SessionStart and SessionEnd hooks; extracted from personal `settings.json`
6. `library/` (bundled) — Pre-generated design-system and playground-conventions books; accessed at `${CLAUDE_PLUGIN_ROOT}/library/`
7. `.claude-plugin/marketplace.json` — Self-hosted catalog enabling `austindick/watson` GitHub distribution

### Critical Pitfalls

1. **Hardcoded `~/.claude/skills/watson/` paths break silently in plugin cache** — Grep all plugin files for the literal string `~/.claude` before any distribution; zero hits required. Replace every occurrence with `${CLAUDE_PLUGIN_ROOT}`. Approximately 15 files are affected; loupe.md alone has 9 occurrences. Failure mode is especially dangerous: agents produce plausible-looking output with wrong tokens and wrong file structure — no error is surfaced.

2. **Double hook firing from `settings.json` + `hooks/hooks.json` coexisting on the author's machine** — Migrate Watson's two hooks to `hooks/hooks.json` and remove them from `settings.json` in the same commit. Verify by confirming the SessionStart recovery hint appears exactly once in a fresh session. GSD hooks (`gsd-check-update.js`, `gsd-context-monitor.js`) must not be touched.

3. **`/watson` command rename to `/watson:watson` poisons all documentation** — Decide the plugin name in `plugin.json` first, before writing any other files. Update ambient rule content, SKILL.md routing text, in-skill help text, and the plugin README before any teammate sees the plugin. Grep for `/watson` (without namespace) after completing updates to find any missed occurrences.

4. **Ambient rule is not plugin-portable** — The plugin system has no `rules/` deployment mechanism. Bundle `watson-ambient.md` as a reference file inside the plugin and document the one-time manual copy command. Also update the ambient rule content to reference the namespaced command (`/watson:watson`) before bundling.

5. **Version not bumped in `plugin.json` — teammates frozen on stale code** — Every push that changes any plugin file must increment the `version` field. Claude Code's update detection is version-gated; omissions are silent. Establish and document the version bump discipline before first distribution.

---

## Implications for Roadmap

Based on research, the migration decomposes naturally into three phases with clear dependency ordering. Phase 1 is a hard prerequisite for everything else — no testing is possible until paths resolve. Phase 2 can only be validated after Phase 1 is confirmed working. Phase 3 is distribution packaging and cannot be attempted until the plugin validates cleanly on the author's own machine.

### Phase 1: Plugin Scaffold and Path Portability

**Rationale:** The plugin manifest and `${CLAUDE_PLUGIN_ROOT}` substitution are a hard prerequisite for every other phase. Nothing can be validated until the plugin loads correctly and library reads resolve. The command namespace decision made here propagates into all documentation and cannot be changed without a breaking update.

**Delivers:** A loadable plugin that the author can test locally via `claude --plugin-dir ./watson`; all library reads working via `${CLAUDE_PLUGIN_ROOT}`; correct command name established

**Addresses:** Table-stakes features — plugin manifest, portable paths, command name preservation, library bundled, initial version set

**Avoids:**
- Hardcoded path failure (Pitfall 1) — primary deliverable of this phase
- Command name confusion (Pitfall 3) — manifest name decision gates all documentation
- Version update delivery broken (Pitfall 8) — initial version set in manifest

**Work items:**
- Create `.claude-plugin/plugin.json` with `name: "watson"`, `version: "1.2.0"`, and component paths
- Reorganize directory structure: `SKILL.md` → `skills/watson/SKILL.md`, `utilities/watson-init.md` → `commands/watson-init.md`, `skills/discuss.md` and `loupe.md` → `skills/watson/`
- Replace all `~/.claude/skills/watson/` with `${CLAUDE_PLUGIN_ROOT}` across all files
- Replace all `@agents/`, `@skills/`, `@utilities/`, `@references/` dispatch references with full `${CLAUDE_PLUGIN_ROOT}`-prefixed paths
- Bundle library books at `library/` (they are already present; verify they travel with the plugin)
- Update ambient rule content to use `/watson:watson` and bundle at `docs/watson-ambient.md`
- Validate with `claude --plugin-dir` and `claude plugin validate .`

### Phase 2: Hook Migration and Script Bundling

**Rationale:** Hooks can only be validated after the plugin loads correctly (Phase 1 complete). Hook extraction must be a clean atomic operation — dual-write in `settings.json` and `hooks/hooks.json` causes double-firing that corrupts session state.

**Delivers:** Watson session lifecycle hooks operating from `hooks/hooks.json` exclusively; author's `settings.json` cleaned of Watson hooks; statusline script forked and bundled

**Avoids:**
- Double hook firing (Pitfall 2) — extract and remove in same commit
- Shared script not bundled (Pitfall 5) — fork `share-proto-statusline.js` to `scripts/watson-statusline.js`

**Work items:**
- Write `hooks/hooks.json` with Watson's SessionStart and SessionEnd hooks
- Remove the two Watson hooks from `~/.claude/settings.json` on the author's machine in the same commit
- Verify SessionStart fires exactly once in a fresh session
- Fork `share-proto-statusline.js` to `scripts/watson-statusline.js`, removing share-proto tunnel logic (lines 50-87)
- Document `statusLine` as a manual post-install step in README (cannot be automated via plugin)
- End-to-end test: install via `--plugin-dir`, run `/watson:watson`, confirm session hooks fire, confirm statusline renders

### Phase 3: Distribution, Marketplace, and Onboarding

**Rationale:** Distribution packaging is the final step — it requires the plugin to be fully functional first. SHA pinning and version discipline must be decided before the first marketplace entry is published, because changing these policies after first distribution creates breaking changes for teammates.

**Delivers:** GitHub marketplace at `austindick/watson`; two-command install working for a test teammate; onboarding documentation complete; Figma MCP dependency visible before install

**Avoids:**
- Auto-update breaking mid-prototype sessions (Pitfall 6) — SHA pin initial entry
- Figma MCP dependency invisible to teammates (Pitfall 7) — Prerequisites section first in README
- Wrong command name in onboarding (UX pitfall) — all docs reviewed before any teammate tests

**Work items:**
- Create `.claude-plugin/marketplace.json` with plugin entry pinned to initial release SHA
- Write plugin README with: "What Watson Does," Prerequisites (Figma MCP), two-command install, manual post-install steps (ambient rule, statusLine), two-mode explanation (discuss vs. build)
- Establish version bump checklist and document in `docs/maintainer.md`
- Add `extraKnownMarketplaces` to Playground's `.claude/settings.json` and commit
- Test full install flow with one teammate starting from zero Claude Code Watson experience
- After validation: add `enabledPlugins` to project settings (eliminates install step for new contributors)

### Phase Ordering Rationale

- Phase 1 before Phase 2: Path portability must be verified working before hook behavior can be tested. The plugin loading correctly is a prerequisite for validating any plugin behavior.
- Phase 2 before Phase 3: The plugin must function end-to-end on the author's machine (including hooks and statusline) before distributing to teammates. A broken hook discovered post-distribution requires coordinating a simultaneous fix with every teammate who has already installed.
- Phase 3 last: Distribution is the irreversible step. Once teammates install, a command name change or breaking path fix requires them to take action. Deferring Phase 3 keeps all breakage contained to the author's local environment.

### Research Flags

Phases with well-documented patterns (skip research-phase):
- **Phase 1:** Plugin manifest schema and `${CLAUDE_PLUGIN_ROOT}` substitution are fully documented in official Claude Code docs. The path audit is a mechanical find-and-replace.
- **Phase 2:** `hooks/hooks.json` format is fully documented. Both Watson hooks use inline bash commands with no external script references — migration is verbatim copy.
- **Phase 3:** Marketplace distribution flow is fully documented. SHA pinning syntax is verified in official docs.

Phases with minor unconfirmed behavior (verify during implementation):
- **Phase 1:** Confirm whether `@`-style dispatch references (`@agents/builder.md`) require explicit replacement with `${CLAUDE_PLUGIN_ROOT}/agents/builder.md` or whether the `@`-prefix works as a file-relative path inside the plugin. Research confidence is MEDIUM — `${CLAUDE_PLUGIN_ROOT}` substitution in skill content is confirmed, but `@`-reference resolution is instruction-following behavior, not a documented API.
- **Phase 1:** Confirm whether `skills/watson/discuss.md` (non-SKILL.md filename) is accessible via Read tool dispatch or whether it must be renamed to a subdirectory structure. Subskills are instruction-dispatched, not discovery-based, so flat files should work — but verify before committing to the file layout.
- **Phase 3:** Confirm subskill naming behavior: does `skills/discuss/SKILL.md` with `name: discuss` in frontmatter register as `/discuss` or `/watson:discuss`? This affects whether the discuss subskill interaction pattern changes for users.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies sourced from official Claude Code documentation fetched directly from code.claude.com; no inference required |
| Features | HIGH | Feature decisions are direct consequences of verified plugin system capabilities; no community inference used |
| Architecture | HIGH (structure, hooks, `${CLAUDE_PLUGIN_ROOT}`) / MEDIUM (`@`-reference dispatch, ambient rule workarounds) | `@`-reference dispatch and ambient rule approaches are plausible but not documented by official plugin spec |
| Pitfalls | HIGH | All critical pitfalls verified against official docs and direct Watson codebase audit; the "looks done but isn't" checklist is grounded in concrete file-level evidence |

**Overall confidence:** HIGH

### Gaps to Address

- **`@`-reference dispatch in plugin context (MEDIUM):** Whether `@agents/builder.md` style dispatch works in plugin context or requires full `${CLAUDE_PLUGIN_ROOT}/agents/builder.md` paths should be verified in a `--plugin-dir` test session before committing to the path replacement strategy. Low risk: replacing with full paths is safe regardless.
- **Subskill namespace behavior (MEDIUM):** Whether `skills/discuss/SKILL.md` with `name: discuss` in frontmatter registers as `/discuss` or `/watson:discuss` must be verified during Phase 1 implementation. If the plugin namespace is forced, any documentation or in-skill references to `/discuss` must be updated.
- **`statusLine` post-install experience (LOW):** The share-proto/Watson statusline relationship means teammates with share-proto already installed may get Watson's status indicator automatically. This should be confirmed in a teammate test before recommending the manual statusLine setup to everyone.
- **Ambient rule upgrade path:** The SessionStart hook approach to auto-installing the ambient rule (writes to `~/.claude/rules/`) is feasible but deferred to 1.3 due to mutable-state concerns. If teammates find the manual copy step burdensome, this is the clear upgrade path.

---

## Sources

### Primary (HIGH confidence)
- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference) — manifest schema, `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}`, directory structure, component discovery rules, hooks events, path traversal prohibition, version detection
- [Claude Code Create Plugins](https://code.claude.com/docs/en/plugins) — quickstart, `--plugin-dir`, `/reload-plugins`, migration from standalone config, hooks migration
- [Claude Code Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) — `marketplace.json` schema, GitHub distribution, auto-update behavior, private repo auth, SHA pinning, `extraKnownMarketplaces`, `enabledPlugins`
- [Claude Code Discover Plugins](https://code.claude.com/docs/en/discover-plugins) — install commands, scope options, auto-update toggle, `/reload-plugins`
- [Claude Code Statusline](https://code.claude.com/docs/en/statusline) — confirmed `statusLine` is user/project settings.json only; no plugin-level support
- Direct Watson codebase audit: `~/.claude/skills/watson/skills/loupe.md`, `discuss.md`, `~/.claude/settings.json`, `~/.claude/rules/watson-ambient.md`, `~/.claude/hooks/share-proto-statusline.js`

### Secondary (MEDIUM confidence)
- Project memory `feedback_paths_breaks_slash_command.md` — `paths:` frontmatter in SKILL.md breaks slash command registration; informed anti-features and ambient rule recommendation
- Watson PROJECT.md — v1.2 milestone scope, current structure baseline, out-of-scope decisions

---
*Research completed: 2026-04-02*
*Ready for roadmap: yes*
