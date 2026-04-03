# Feature Research

**Domain:** Claude Code plugin distribution for a team-shared skill framework (Watson v1.2)
**Researched:** 2026-04-02
**Confidence:** HIGH (all findings verified against official Claude Code documentation at code.claude.com)

---

## Scope Note

This research covers only **plugin distribution features** for Watson 1.2. The existing Watson 1.1 skill framework is treated as given. The question being answered is: what does it take to package Watson as a Claude Code plugin so teammates can install it with one command, receive updates automatically, and use it identically to how it works locally today?

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features teammates assume will work. Missing these makes the installation feel broken or requires Watson author involvement to set up each machine manually.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| One-command install | Teams expect `claude plugin install watson@faire` — not a multi-step git clone + symlink + settings.json edit | LOW | Two-step: `claude plugin marketplace add austindick/watson`, then `claude plugin install watson@faire` |
| Plugin manifest (`plugin.json`) | Claude Code needs this to discover components and to namespace the plugin name; without the `name` field, the `/watson` command cannot be guaranteed to register correctly | LOW | `.claude-plugin/plugin.json` with `"name": "watson"` (see namespacing section) |
| Portable paths via `${CLAUDE_PLUGIN_ROOT}` | Installed plugins are copied to `~/.claude/plugins/cache/` — hardcoded `~/.claude/skills/watson/` paths break immediately after installation | MEDIUM | Every internal path reference across ~15 files must be replaced; this is the largest mechanical work of the milestone |
| `/watson` command preserved post-install | Teammates using the plugin must get `/watson` exactly as today — not `/faire-watson` or `/watson-plugin` or nothing | MEDIUM | Plugin `name` field controls this; `"name": "watson"` in `plugin.json` registers skills under that namespace, preserving `/watson` |
| Hooks migrate into `hooks/hooks.json` | Each teammate would need to manually add watson-init's SessionStart hook to their personal `~/.claude/settings.json` otherwise | LOW | Extract existing SessionStart hook configuration into plugin `hooks/hooks.json`; installs automatically with the plugin |
| Library books bundled with plugin | Teammates need pre-generated books (design-system.md, playground-conventions.md) to use Watson immediately; they can't regenerate from source without faire/frontend access | LOW | Books are static Markdown files; bundle in `library/` directory inside the plugin repo; no generation at install time |
| Semantic versioning | Claude Code uses the version field to detect whether to update a plugin; without a version bump, existing users never receive changes | LOW | `plugin.json` version field; must be incremented on every push to the distribution repo |
| Project-scope install (shareable via git) | Team leads want to commit the plugin reference to the Playground repo so all contributors get it automatically | LOW | `claude plugin install watson@faire --scope project` writes to `.claude/settings.json`; commit that file |

### Differentiators (Competitive Advantage)

Features that make Watson's plugin experience meaningfully better than a manual installation or a raw GitHub clone.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Private GitHub marketplace (`austindick/watson`) | Watson author controls release timing; teammates add the marketplace once and thereafter install/update without any coordination with the author | LOW | GitHub repo with `.claude-plugin/marketplace.json`; supports relative-path or GitHub-source plugin entries |
| Auto-update at Claude Code session start | Watson improvements reach teammates without any manual action on their part | LOW | Per-marketplace toggle; disabled by default for third-party; teammates enable via `/plugin` UI or set `GITHUB_TOKEN` for private repo access |
| `extraKnownMarketplaces` in Playground's `.claude/settings.json` | Committing this to the Playground repo prompts all teammates to install the marketplace when they trust the project folder — eliminates "how do I add the marketplace?" entirely | LOW | One JSON field; triggers Claude Code's install prompt flow on project trust |
| `enabledPlugins` in project settings | Can pre-enable Watson for all Playground contributors, so it's active without any install step beyond trusting the project | LOW | Adds `"watson@faire": true` to `.claude/settings.json`; most aggressive onboarding reduction |
| GITHUB_TOKEN for private repo auto-updates | Background auto-updates (which run without interactive prompts) work on private repos when `GITHUB_TOKEN` is in the environment | LOW | Document in README; teammates add to `.zshrc` once and never think about updates again |
| `userConfig` for team-specific paths | Teammates with non-standard Playground or faire/frontend checkout locations can configure `libraryPaths` at plugin enable time — no SKILL.md edits needed | MEDIUM | `userConfig` in `plugin.json` prompts at enable-time; non-sensitive values available as `${user_config.KEY}` in skill/agent content |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| npm package distribution | Standard mechanism; familiar to engineers | Watson is purely Markdown files — no JS/TS to compile. npm adds publish workflow complexity, requires an npm account or private registry, and provides zero benefit over GitHub for a markdown-only plugin. Also introduces a second release artifact to keep in sync with the GitHub repo. | GitHub-based marketplace: simpler, no account beyond existing GitHub access, private repo works natively with `GITHUB_TOKEN` |
| Anthropic official marketplace submission | Maximum discoverability | Watson is Faire-specific (Slate design system, Playground conventions, Faire's PDP). It would mislead external users and likely be rejected as too narrow. Official marketplace is for general-purpose plugins. | Private GitHub marketplace scoped to `austindick/watson`; submit to official only if Watson is ever generalized |
| Auto-regenerate library books on install | Always-fresh books sound appealing | Library generation requires Librarian agent + source repos (faire/frontend). Teammates may not have faire/frontend, or may have it at a non-standard path. Generation takes significant time and LLM calls per install. Books are stable: the design system doesn't change weekly. | Bundle pre-generated books with the plugin; Watson author regenerates and pushes when Slate changes; teammates receive updates via normal plugin update flow |
| `paths:` in SKILL.md for ambient auto-activation | Would make Watson activate automatically in Prototype Playground directories without any setup | Known-broken: `paths:` in SKILL.md makes the skill ambient-only and breaks `/watson` slash command registration (confirmed project memory and Watson 1.1 decision log). Watson already solved this with session-toggle + SessionStart hook. | Keep existing approach: SessionStart hook surfaces Watson state; `/watson` toggle preserved; ambient rule remains a documented optional manual step for users who want it |
| Plugin hooks that write to prototype project files | Hooks could auto-maintain STATUS.md or blueprint files | Plugin hooks execute in the plugin root context with `${CLAUDE_PLUGIN_ROOT}` paths; they cannot safely write to arbitrary project directories. Project file writes belong inside skill/agent content where Claude handles the Edit tool calls with proper paths. | Keep all blueprint/STATUS.md writes inside skill and agent Markdown content; hooks only handle plugin-internal side effects |
| Single monolithic SKILL.md | Simple to reason about | SKILL.md is currently 198 lines (2 under the 200-line budget). Post-plugin refactor adds path portability changes that will grow it. Watson 1.3 (Discuss Refactor) is already planned to split files. Monolith blocks that work. | Keep existing multi-file structure (SKILL.md + skills/ + agents/ + utilities/); plugin directory structure maps naturally to this layout |

---

## Namespacing Analysis: Impact on `/watson` Command

This is the single most critical distribution decision. Getting it wrong means teammates get a broken or renamed command.

**How plugin namespacing works (HIGH confidence — official Claude Code docs):**

The `name` field in `plugin.json` is the plugin identifier and namespace root. Components are namespaced as `plugin-name:component-name` in UI surfaces like `/agents`. However, a skill with its own `name` field in SKILL.md frontmatter registers its command directly.

**Decision:** `plugin.json` must declare `"name": "watson"`. Combined with a skill at `skills/watson/SKILL.md` (which already has `name: watson` in its frontmatter), the `/watson` command registers identically to how it works in the current `~/.claude/skills/watson/` setup. Teammates see no difference.

**Agent namespacing:** In the `/agents` UI, Watson's 8 agents will appear as `watson:builder`, `watson:reviewer`, etc. This is acceptable and actually better — it scopes Watson's agents clearly away from other installed plugins. Claude's internal agent invocations use the name transparently.

**Subskill naming:** `skills/discuss/SKILL.md` (with `name: discuss` in frontmatter) and `skills/loupe/SKILL.md` (with `name: loupe`) register as `/discuss` and `/loupe` directly. This matches current behavior. Verify during implementation whether these inherit the plugin namespace prefix or use their own SKILL.md `name` — if they inherit, they become `/watson:discuss` which would break existing usage patterns.

**Conflict risk:** LOW. `/watson` is unique enough that no other installed plugin is expected to claim it. Flag in README that users should not install other plugins that register `/watson`.

---

## Installation Friction Analysis

**Current teammate setup (before plugin):**
1. Copy `~/.claude/skills/watson/` manually (or coordinate with Watson author for a git clone)
2. Add SessionStart hook to personal `~/.claude/settings.json`
3. Optionally add ambient rule to `~/.claude/rules/` manually
4. Regenerate library books (requires faire/frontend checkout + Librarian run)
Estimated friction: HIGH — 4 manual steps, requires Watson author coordination

**Post-plugin setup (v1.2 target):**
1. `claude plugin marketplace add austindick/watson`
2. `claude plugin install watson@faire`
Estimated friction: LOW — 2 commands, fully self-service

**Post-plugin with project settings committed to Playground repo (v1.2 + `extraKnownMarketplaces`):**
1. Trust the Playground project folder when Claude prompts
2. Follow the install prompt in the Claude Code UI
Estimated friction: MINIMAL — guided entirely by Claude Code's existing UI; Watson author does zero per-teammate work

---

## Feature Dependencies

```
GitHub marketplace repo (austindick/watson)
    └──enables──> `claude plugin install watson@faire`
                      └──requires──> plugin.json manifest
                                         └──requires──> "name": "watson" (preserves /watson)
                                         └──requires──> semantic version bump per release

Portable paths (${CLAUDE_PLUGIN_ROOT})
    └──required by──> All internal skill/agent/utility cross-references
    └──required by──> libraryPaths[] in all 8 agents
    └──required by──> Hook commands in hooks.json

hooks/hooks.json
    └──replaces──> Manual settings.json SessionStart hook config per teammate
    └──enables──> watson-init session management without per-user setup
    └──requires──> Hook command paths using ${CLAUDE_PLUGIN_ROOT}

Bundled library books
    └──enables──> Zero-setup experience (no Librarian run required at install)
    └──requires──> libraryPaths[] in agents to use ${CLAUDE_PLUGIN_ROOT}/library/
    └──conflicts with──> Auto-regeneration at install time (pick one; bundled wins for v1.2)

extraKnownMarketplaces in Playground .claude/settings.json
    └──enables──> Auto-prompt on project trust
    └──enhances──> One-command install experience
    └──requires──> GitHub marketplace to exist first

GITHUB_TOKEN env var
    └──enables──> Background auto-updates for private repo
    └──required by──> Auto-update feature working without interactive auth prompt
```

### Dependency Notes

- **Portable paths are the blocking work:** Every `~/.claude/skills/watson/` reference across SKILL.md, `skills/`, `agents/`, `utilities/` must be replaced with `${CLAUDE_PLUGIN_ROOT}`. This is the largest mechanical task. Libraries at `~/.claude/skills/watson/library/` become `${CLAUDE_PLUGIN_ROOT}/library/`.
- **hooks/hooks.json replaces settings.json hooks:** The watson-init SessionStart hook currently lives in the user's personal `~/.claude/settings.json`. Moving it to `hooks/hooks.json` means it installs automatically and teammates don't need to edit their personal config at all.
- **Bundled books are static:** The Watson author runs Librarian, commits the output books to the plugin repo, bumps version, and pushes. Teammates receive updated books via the normal plugin update flow (`claude plugin update watson@faire` or auto-update). This is the correct maintenance model.
- **Subskill path question needs implementation-time verification:** Confirm whether `skills/discuss/SKILL.md` with `name: discuss` registers as `/discuss` (SKILL.md name wins) or `/watson:discuss` (plugin namespace wins). If the latter, the existing skill interaction pattern changes and users need to know.

---

## MVP Definition

### Launch With (v1.2)

Minimum viable for a teammate to replace their manual Watson setup with one install command and get identical behavior.

- [ ] `plugin.json` manifest with `"name": "watson"`, version, author, repository fields
- [ ] All `~/.claude/skills/watson/` path references replaced with `${CLAUDE_PLUGIN_ROOT}` across all files
- [ ] `hooks/hooks.json` with SessionStart hook migrated from settings.json
- [ ] Library books bundled as static files in `library/` within the plugin repo
- [ ] GitHub repo (`austindick/watson`) with `.claude-plugin/marketplace.json` pointing to plugin source
- [ ] README with two-command install instructions
- [ ] Version bump strategy: increment `plugin.json` version on every push

### Add After Validation (v1.2.x)

Add once the plugin works correctly for the Watson author and one other teammate.

- [ ] `extraKnownMarketplaces` in Playground's `.claude/settings.json` — prompts teammates automatically on project trust
- [ ] GITHUB_TOKEN documentation in team onboarding — enables auto-updates for the team
- [ ] `enabledPlugins` in project settings — eliminates the install step entirely for new Playground contributors

### Future Consideration (v2+)

- [ ] `userConfig` for configurable `libraryPaths` — add when Watson expands to repos with non-standard structures or when teammates have diverse checkout layouts
- [ ] Separate stable/beta release channels via marketplace `ref` pinning — add when Watson has enough team users to warrant staged rollouts
- [ ] Container/CI seed population via `CLAUDE_CODE_PLUGIN_SEED_DIR` — only relevant if Watson is ever used in CI contexts (currently out of scope per PROJECT.md)

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Plugin manifest + `"name": "watson"` | HIGH | LOW | P1 |
| Portable paths (`${CLAUDE_PLUGIN_ROOT}` audit) | HIGH | MEDIUM (mechanical, ~15 files) | P1 |
| Hooks migration to `hooks/hooks.json` | HIGH | LOW | P1 |
| Library books bundled in `library/` | HIGH | LOW | P1 |
| GitHub marketplace repo + `marketplace.json` | HIGH | LOW | P1 |
| Semantic versioning strategy | HIGH | LOW | P1 |
| `extraKnownMarketplaces` in Playground settings | MEDIUM | LOW | P2 |
| GITHUB_TOKEN auto-update documentation | MEDIUM | LOW | P2 |
| `enabledPlugins` in project settings | LOW | LOW | P3 |
| `userConfig` for configurable `libraryPaths` | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for one-command install to function correctly
- P2: Meaningfully improves teammate experience; add in v1.2 or v1.2.x
- P3: Nice to have; defer until v1.2 is validated working

---

## Competitor Feature Analysis

Watson is unique at Faire; "competitors" here are other Claude Code plugins that distribute multi-file skill frameworks.

| Feature | obra/superpowers (community example) | anthropic/commit-commands (official example) | Watson v1.2 approach |
|---------|--------------------------------------|---------------------------------------------|----------------------|
| Distribution method | GitHub-based marketplace | Anthropic official marketplace | Private GitHub marketplace (`austindick/watson`) |
| Command namespace | `superpowers:` prefix (skills use plugin name) | Direct (`/commit-commands:commit`) | `/watson` direct (skill SKILL.md `name` field takes precedence) |
| Bundled reference files | None documented | None | Library books in `library/`; key differentiator |
| Hooks | `hooks/hooks.json` | Not applicable | `hooks/hooks.json` for SessionStart migration |
| Auto-update default | Disabled for third-party | Enabled (official marketplace) | Disabled; documented opt-in via `GITHUB_TOKEN` |
| Team configuration | None | None | `extraKnownMarketplaces` in project settings |
| User-configurable options | None | None | Future: `userConfig` for `libraryPaths` |

---

## Sources

- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference) — HIGH confidence; manifest schema, namespacing behavior, hooks format, `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}`, installation scopes, `userConfig`
- [Claude Code Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) — HIGH confidence; `marketplace.json` format, GitHub distribution, auto-update behavior, private repo auth, `extraKnownMarketplaces`, `enabledPlugins`, version resolution, release channels
- [Discover and Install Plugins](https://code.claude.com/docs/en/discover-plugins) — HIGH confidence; install commands, scope options, auto-update toggle behavior, `/reload-plugins`
- Watson PROJECT.md (`/Users/austindick/watson/.planning/PROJECT.md`) — v1.2 milestone requirements, current skill file structure, active/out-of-scope decisions
- Project memory (`paths:` field breaks slash command registration) — confirmed pitfall, informed anti-features section

---

*Feature research for: Claude Code plugin distribution (Watson v1.2)*
*Researched: 2026-04-02*
