# Pitfalls Research

**Domain:** Watson skill-to-plugin migration and team distribution (Claude Code plugin system)
**Researched:** 2026-04-02
**Confidence:** HIGH — all pitfalls verified against official Claude Code plugin documentation (code.claude.com/docs) and direct Watson codebase audit

---

## Critical Pitfalls

### Pitfall 1: Hardcoded `~/.claude/skills/watson/` Paths Break in Plugin Cache

**What goes wrong:**
Watson's library resolution is hardcoded throughout the codebase. Every subskill and agent that resolves `libraryPaths[]` constructs absolute paths beginning with `~/.claude/skills/watson/library/...`. After plugin installation, the plugin lives in `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`. Those hardcoded paths point to a directory that does not exist on teammate machines. Every library read fails silently or with a file-not-found error — the pipeline runs but agents get no library context, producing token-mismatched, convention-ignorant output.

Confirmed affected files: `loupe.md` (9 hardcoded chapter paths in the example `libraryPaths[]` block), `discuss.md` (reads `~/.claude/skills/watson/library/LIBRARY.md` directly), and all 8 agent files that construct or receive `libraryPaths[]` as string arrays with `~/.claude/skills/watson/` prefixes.

**Why it happens:**
The paths were written when Watson was a personal skill with a known, fixed location. The migration to a plugin cache directory was not anticipated during design. The plugin system caches plugins under `~/.claude/plugins/cache/` and the original skill directory becomes irrelevant.

**How to avoid:**
Replace all `~/.claude/skills/watson/` prefixes in skill and agent content with `${CLAUDE_PLUGIN_ROOT}` — the official plugin variable that resolves to the plugin's root in the cache. Both skill content and agent content support inline substitution of `${CLAUDE_PLUGIN_ROOT}`. The library is bundled at the plugin root, so the portable reference becomes:
```
${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md
${CLAUDE_PLUGIN_ROOT}/library/design-system/global-theme/CHAPTER.md
```

Every file containing `~/.claude/skills/watson/` must be updated. This is a mechanical find-and-replace — grep for the literal string and replace with `${CLAUDE_PLUGIN_ROOT}` as a phase-one prerequisite before any other migration work.

**Warning signs:**
- Agents produce output with generic CSS values instead of Slate tokens
- Builder ignores scaffolding conventions and creates wrong file structure
- No errors are surfaced — path reads return empty or fail silently in LLM context, producing plausible-looking but wrong output

**Phase to address:**
Phase 1 (Plugin scaffold and path portability). This is a prerequisite for every other plugin feature — nothing else can be validated until paths resolve correctly.

---

### Pitfall 2: Watson Hooks Live in `settings.json` Alongside Non-Watson Hooks — Extraction Must Be Clean

**What goes wrong:**
Watson currently has three hooks in `~/.claude/settings.json`: a SessionStart hook for the `/clear` recovery hint, a SessionEnd hook that writes `/tmp/watson-session-end.json`, and an implicit PostToolUse hook inherited from the existing GSD context monitor. The migration requires extracting the Watson-specific hooks into `hooks/hooks.json` inside the plugin. If this is done without simultaneously removing the Watson hooks from `settings.json`, both copies fire for every event.

Double-firing consequences: SessionStart fires twice — `/tmp/watson-active.json` check runs twice and the recovery hint appears twice. SessionEnd fires twice — `/tmp/watson-session-end.json` is written, then a second write immediately overwrites it. State corruption is subtle and hard to diagnose because both hooks write valid JSON independently.

**Why it happens:**
The migration step of "add hooks to the plugin" and the cleanup step of "remove hooks from settings.json" are easy to sequence incorrectly. The hooks in `settings.json` are not Watson-labeled — they're inline bash commands with no attribution. It's easy to forget which ones belong to Watson during migration.

**How to avoid:**
Before writing a single line of plugin hooks.json, enumerate every Watson hook currently in `settings.json` by reading the file and identifying the commands. The Watson hooks are:
1. SessionStart: `if [ -f /tmp/watson-active.json ]; then echo '...' ; fi`
2. SessionEnd: the `node -e "..."` command that reads watson-active.json and writes watson-session-end.json

Migrate these to `hooks/hooks.json` and remove them from `settings.json` in the same commit. On the author's own machine, test that SessionStart fires exactly once after migration by checking that the recovery hint appears exactly once in a fresh session.

The three GSD hooks (gsd-check-update, gsd-context-monitor) are NOT Watson's — they belong to the GSD skill system and must remain in `settings.json` untouched.

**Warning signs:**
- Session output shows the Watson recovery hint twice
- `/tmp/watson-session-end.json` is overwritten immediately after creation
- SessionEnd behavior appears inconsistent — sometimes works, sometimes the file is missing

**Phase to address:**
Phase 2 (Hook migration). Must happen concurrently with path portability — the hooks reference `/tmp/watson-active.json` and cannot be tested independently. Clean up `settings.json` on the author's machine before any teammate testing.

---

### Pitfall 3: Plugin Slash Command Becomes `/watson:watson` — All User Muscle Memory Breaks

**What goes wrong:**
Plugin skills are namespaced. A plugin named `watson` with a `skills/watson/SKILL.md` directory produces the slash command `/watson:watson`. The clean `/watson` command that users have internalized since Watson 1.0 does not work. The ambient rule in `watson-ambient.md` tells users to "Run `/watson` to activate" — that instruction is now wrong. Teammates who install the plugin and type `/watson` get nothing, or a command-not-found message.

This also affects every reference inside the codebase: SKILL.md routing text says "Activate with /watson", help text generated by SKILL.md references "/watson", and the ambient rule is the canonical onboarding document for Playground users.

**Why it happens:**
Plugin namespacing is mandatory and cannot be disabled. The skill directory name contributes the second segment. This is by design — namespacing prevents conflicts when multiple plugins define similarly-named skills. There is no escape from namespacing in plugin context.

**How to avoid:**
Choose the plugin name and skill directory name deliberately before doing any other migration work, because the resulting command name propagates through all documentation. Two options:

Option A (accept namespacing): Plugin name `watson`, skill directory `watson` → `/watson:watson`. Update all references. Teammates learn the new name. Simple, conforming to plugin conventions.

Option B (minimize friction): Plugin name `w`, skill directory `watson` → `/w:watson`. Shorter to type but unusual naming. Not recommended — the plugin name appears in marketplace listings.

Choose Option A. The command name is a one-time adjustment. Attempting to avoid it with unusual naming creates other problems. Update: SKILL.md frontmatter and all routing text, the ambient rule content, the plugin README, and any team documentation before distribution.

**Warning signs:**
- Teammates report `/watson` not working
- Ambient rule still references `/watson` with no namespace
- Help text generated by SKILL.md says "Run /watson" instead of the namespaced command

**Phase to address:**
Phase 1 (Plugin manifest and structure). Decide the command name in the plugin.json manifest first. This decision gates all subsequent documentation work.

---

### Pitfall 4: Ambient Rule at `~/.claude/rules/watson-ambient.md` Is Not Plugin-Portable

**What goes wrong:**
Watson's ambient activation rule lives at `~/.claude/rules/watson-ambient.md`. This is a user-level rules file — it exists on the author's machine because the author put it there manually. When a teammate installs the Watson plugin, this file is not included. Teammates get the Watson skill but none of the ambient "are you in the Playground?" prompting. The ambient experience requires a separate manual setup step that teammates have no reason to know about.

Additionally, the ambient rule currently instructs users to "Run `/watson` to activate" — after the command rename in Pitfall 3, this instruction is wrong and must be updated.

**Why it happens:**
Claude Code's `~/.claude/rules/` directory is a personal, user-level location. Plugins cannot deploy files there during installation. The plugin system has no mechanism to write to user-level config locations as part of `plugin install`. This is intentional — it would be a security violation.

**How to avoid:**
Two approaches, in order of preference:

Option A (document as manual step): Ship the ambient rule file as a reference file inside the plugin directory at `references/watson-ambient.md`. The plugin README includes a clear "Optional: Ambient Activation" section with the exact command to copy it into place:
```bash
cp ~/.claude/plugins/cache/.../references/watson-ambient.md ~/.claude/rules/watson-ambient.md
```
This is a one-time manual step per machine. Teammates who don't do it still get Watson via explicit invocation — the feature degrades gracefully.

Option B (use paths: frontmatter): The `paths:` frontmatter field in a SKILL.md within a plugin will auto-invoke the skill when working in matching directories. However, `paths:` disables slash command registration (known Watson finding from v1.1 — `paths:` makes skill ambient-only, losing /command registration). Do not use `paths:` for the main SKILL.md — it would eliminate the `/watson:watson` command entirely.

Recommendation: Option A. Ambient activation is a power-user convenience; the core value is in explicit invocation. Document clearly, keep it optional.

**Warning signs:**
- Teammates never get the "You're in the Prototype Playground, activate Watson?" prompt
- The ambient rule is absent from teammate machines after install
- The ambient rule references the old command name after the namespace change

**Phase to address:**
Phase 1 (Plugin manifest and structure). The ambient rule content must be updated before shipping (command name change). The distribution strategy (bundle as reference, document as manual step) must be decided in this phase.

---

### Pitfall 5: `share-proto-statusline.js` Is Shared With Another Skill — Cannot Reference Across Plugin Boundaries

**What goes wrong:**
`share-proto-statusline.js` and `detect-proto-edit.js` live at `~/.claude/hooks/` and are shared between the Watson skill and the `share-proto` skill. When Watson's plugin hooks.json is created, the hook commands reference these scripts. On the author's machine, the scripts are at `~/.claude/hooks/` and the hooks work. On teammate machines, `~/.claude/hooks/` does not exist — Watson's plugin hooks fail silently, and teammates see no statusline.

The plugin system explicitly prohibits external file references: installed plugins cannot reference files outside their directory. Paths that traverse outside the plugin root (such as `~/.claude/hooks/`) will not work after installation because those files are not copied to the cache.

**Why it happens:**
The hooks were written for a personal skill where a shared `~/.claude/hooks/` directory is a reasonable pattern. Plugin distribution changes the assumption — the plugin is now the only portable unit, and it must be self-contained.

**How to avoid:**
Bundle copies of `share-proto-statusline.js` and `detect-proto-edit.js` inside the Watson plugin at `scripts/share-proto-statusline.js` and `scripts/detect-proto-edit.js`. Reference them via `${CLAUDE_PLUGIN_ROOT}/scripts/` in hooks.json. Make both scripts executable (`chmod +x`) before publishing.

Accept that the bundled copies may diverge from the `~/.claude/hooks/` originals if `share-proto` updates independently. This is the cost of plugin self-containment. If Watson and share-proto are co-maintained, use symlinks in the plugin source directory during development — symlinks are honored during the copy process — but this only works for `--plugin-dir` testing, not for marketplace distribution.

**Warning signs:**
- PostToolUse hook for statusline fails silently on teammate machines
- No statusline appears for teammates even after install
- Hook error messages reference a path that doesn't exist at runtime

**Phase to address:**
Phase 2 (Hook migration and script bundling). Both scripts must be audited and bundled before the plugin ships to any teammate.

---

### Pitfall 6: Auto-Update Silently Replaces Library Books Mid-Project

**What goes wrong:**
Watson's library books (design-system, playground-conventions) are bundled with the plugin. When the plugin author regenerates the design-system book after a Slate update and pushes a new version, teammates who have auto-updates enabled receive new book content immediately at their next session start. If a teammate is mid-prototype with an in-progress blueprint, their DESIGN.md may reference component APIs or token names from the old book. The next build reads the new book with different component variants or renamed tokens. Output becomes inconsistent — some sections built before the update use old tokens; sections built after use new ones.

**Why it happens:**
Plugins update atomically — the entire plugin directory in `${CLAUDE_PLUGIN_ROOT}` is replaced. There is no per-file change detection or session-aware update gate. Auto-update runs at session start via `git pull` in the background. By the time the user invokes Watson, the new book is already in place.

**How to avoid:**
1. **Pin the marketplace entry to a specific SHA** for initial distribution. Teammates install a known-stable version. Updates require deliberate opt-in (`claude plugin update`), not passive auto-update. This is the safest option for library book stability.
2. **Use MAJOR version bumps for library regeneration.** Establish a convention: PATCH = bug fixes, MINOR = new components added, MAJOR = token renames or breaking component API changes. Communicate MAJOR bumps to the team before they update.
3. **Version-stamp library books** in each BOOK.md with a `generated:` field. Loupe's Phase 0 can read this stamp and warn (not block) if the stamp changed mid-project.

The marketplace.json `sha` pinning syntax:
```json
{
  "source": {
    "source": "github",
    "repo": "austindick/watson",
    "ref": "v1.2.0",
    "sha": "a1b2c3d4..."
  }
}
```

**Warning signs:**
- Builder produces output mixing two token naming schemes (some sections use old names, some use new)
- Reviewer flags "token mismatch" between sections built in different sessions
- Teammate reports "it worked yesterday, now the tokens are wrong"

**Phase to address:**
Phase 3 (Distribution and marketplace). Library versioning and SHA pinning strategy must be decided before the first marketplace entry is published.

---

### Pitfall 7: Figma MCP Dependency Is Invisible — Teammates Discover It Only When the Pipeline Fails

**What goes wrong:**
Watson's loupe pipeline dispatches agents that call Figma MCP tools. The decomposer agent fetches the Figma frame. The interaction agent fetches component data from Figma. These agents are hardwired to require Figma MCP. A teammate installs the Watson plugin, runs `/watson:watson`, and starts a build. The pipeline dispatches, runs for 2-3 minutes, and then fails or produces empty output with no explanation, because the teammate never configured Figma MCP. The failure mode is the worst kind: delayed and opaque.

**Why it happens:**
Figma MCP is an external dependency that must be configured separately — it is not bundled with Claude Code or with Watson. As a personal skill, this was never a problem because the author always had Figma MCP configured. Plugin distribution introduces users who start from a blank slate.

**How to avoid:**
1. Add a "Prerequisites" section to the plugin README as the first thing teammates read, listing Figma MCP configuration as a required step before using the loupe pipeline.
2. Consider adding a preflight check in the Watson SessionStart hook or at the start of the loupe subskill that verifies Figma MCP is available. This can be a simple natural language instruction: "Before dispatching the pipeline, check if Figma MCP tools are available. If not, surface a clear message: 'Watson requires Figma MCP to be configured. See [link] for setup instructions.' Do not proceed with the pipeline."
3. Document that the discuss subskill works without Figma MCP — only the loupe pipeline (build mode) requires it. Teammates can use Watson for design discussion immediately, while setting up Figma MCP separately.

**Warning signs:**
- Teammate reports "the build just hangs and then produces nothing"
- Decomposer agent returns an error about Figma tool not found
- Teammate confusion: "I installed Watson, why doesn't it work?"

**Phase to address:**
Phase 3 (Distribution and onboarding). Prerequisite documentation must exist before any teammate testing. Preflight check is a nice-to-have that can be added in Phase 3.

---

### Pitfall 8: Version Not Bumped in plugin.json — Teammates Never Receive Updates

**What goes wrong:**
Claude Code uses the `version` field in `plugin.json` to determine whether to offer an update. If the plugin author pushes changes to the GitHub repo without incrementing the version, Claude Code sees the same version it already has cached and skips the update. Teammates continue running the old code indefinitely. This is silent — no error, no warning. The author sees the fix because they're running from the source; teammates are frozen on the broken version.

**Why it happens:**
Version bumping is an easy step to forget, especially in early rapid-iteration phases. In a personal skill, there is no version concept — files are always read fresh. The plugin caching system introduces a version-gating mechanism that doesn't exist in the skill paradigm.

**How to avoid:**
Establish a version bump rule before the first publish: every push that changes any file in the plugin directory must increment the version in `plugin.json`. Use a simple semantic versioning discipline: PATCH for any content fix, MINOR for new features or skill additions, MAJOR for breaking changes (command renames, library regeneration with breaking tokens). Make version bumping part of the push checklist — not an afterthought.

The version may also be managed in marketplace.json rather than plugin.json. Choose one location and stick to it. Setting version in both places causes `plugin.json` to silently win, which can mean the marketplace version is ignored.

**Warning signs:**
- Teammate runs `claude plugin update` and reports "already up to date" after a confirmed fix was pushed
- Teammate behavior differs from author behavior on the same task
- Teammates don't report issues being fixed even after the fix was deployed

**Phase to address:**
Phase 1 (Plugin manifest). Set the initial version (1.0.0) in plugin.json during manifest creation. Establish and document the version bump discipline as part of the distribution guide.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Leave Watson hooks in `settings.json` and add copies to hooks.json | Less migration work | Both copies fire — double invocation, state corruption | Never — extract cleanly in one step |
| Hardcode `${CLAUDE_PLUGIN_ROOT}` value during development | No variable substitution to debug | Works only on the author's machine; breaks on every teammate machine | Never — always use the variable |
| Ship the plugin before deciding command namespacing | Get distribution working faster | Teammates learn the wrong command name; all docs must be rewritten; breaking change if fixed later | Never — name first, ship second |
| Track `main` branch for auto-updates (no SHA pinning) | Teammates always have latest | Mid-prototype breakage from library regeneration; no rollback path | Only for non-library content changes |
| Document ambient setup as optional and skip bundling the reference file | Reduces install complexity | Teammates miss ambient activation entirely; no path to discover it | Acceptable for v1 if the reference file is at least bundled inside the plugin |
| Reference `~/.claude/hooks/` scripts from hooks.json | No script bundling needed | Fails silently on all teammate machines | Never for hooks that produce visible output |
| Skip version bump in plugin.json | Less ceremony | Teammates never receive updates; silent drift | Never — always bump on any meaningful change |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Figma MCP | Assuming teammates have Figma MCP configured — Watson's loupe pipeline requires it | Document Figma MCP as a prerequisite before any other install instruction; test with a teammate starting from a blank Claude Code install |
| GitHub distribution | Pointing marketplace source at repo root when Watson is a monorepo (source + plugin) | If Watson source and plugin coexist in one repo, use `git-subdir` source type in marketplace.json to fetch only the plugin subdirectory |
| Private GitHub repo for marketplace | Using `GITHUB_TOKEN` without verifying it has `repo` scope for private repos | Background auto-updates require the token to be set in the shell environment and to have at least `repo` read scope; verify with `gh auth status` |
| settings.json hook cleanup | Forgetting which hooks in `settings.json` belong to Watson vs. GSD | Identify Watson hooks by their bash commands (watson-active.json references); GSD hooks reference `gsd-check-update.js` and `gsd-context-monitor.js` — never touch those |
| Plugin version vs. marketplace version | Setting `version` in both plugin.json and marketplace.json | `plugin.json` silently wins when both are set; choose one source of truth and set it only there |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Library books grow unboundedly as Slate adds components | Agents receive oversized context; layout and design agents hit context limits mid-pipeline | Set a maximum size target per BOOK.md (e.g., 50KB); enforce chapter splitting when exceeded | When design-system book exceeds ~100KB (currently safe; monitor after Slate updates) |
| All 9 libraryPaths loaded even for simple single-section builds | Unnecessary context load slows pipeline startup for every build | Loupe already does selective chapter loading; ensure this selection logic survives plugin migration unchanged | Not currently a problem — verify selection logic is preserved after path substitution |
| Plugin git clone at every session start | First-session startup is slow for teammates | Plugin caching is automatic — no action needed; the cache persists across sessions | N/A if using marketplace distribution; git clone happens only once per version |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Publishing design-system library books to a public GitHub repo | Slate component API surface and token names are internal Faire IP — exposing them publicly reveals implementation details | Use a private GitHub repo for the Watson marketplace; configure teammates with `GITHUB_TOKEN` for auto-updates; verify no sensitive token values are in the book files themselves |
| Storing teammate-specific session state in a world-readable `/tmp/` file | `/tmp/watson-active.json` contains the branch name and action log; readable by any process on the machine | Acceptable for now; the data is low-sensitivity; if Watson ever stores credentials or user identity, migrate to `${CLAUDE_PLUGIN_DATA}` which is under `~/.claude/` |
| Bundling `userConfig` sensitive values (e.g., GitHub tokens) without `sensitive: true` | Values stored in plaintext in settings.json, readable by anyone with access to the file | Use `sensitive: true` in userConfig declarations — Claude Code routes sensitive values to the system keychain, not settings.json |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Telling teammates to run `/watson` when the actual command is `/watson:watson` | Teammates get "command not found" immediately on first use; erodes trust before Watson demonstrates any value | Update every help text, ambient rule, and onboarding doc to use the actual namespaced command before any teammate sees the plugin |
| No preflight check for Figma MCP | Teammates run the loupe pipeline; pipeline hangs or produces empty output with no explanation | Add "Prerequisites" as the first section of the plugin README; optionally add a preflight check in loupe subskill |
| Plugin README written for the author's mental model | Teammates have no prior Watson context — they don't know what "discuss", "loupe", "blueprint", or "Librarian" mean | Write a "What Watson does" section in plain product language before explaining install steps; use designer vocabulary, not implementation vocabulary |
| No mention of discuss-only mode in onboarding | Teammates think Watson requires Figma — only the build pipeline does; discuss works without it | Onboarding should show Watson's two modes: (1) design discussion (no Figma needed), (2) prototype building (requires Figma MCP) |
| Version bump omitted → teammate reports a bug that was already fixed | Author confusion, teammate frustration, wasted debugging time | Version discipline is a UX issue, not just a technical one — teammates should never be running stale code silently |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Path portability:** Every `~/.claude/skills/watson/` reference replaced — verify by grepping all plugin files for the literal string `~/.claude` before shipping; zero hits required
- [ ] **Hook deduplication:** Watson hooks removed from `~/.claude/settings.json` on the author's machine — verify by running a session and checking that SessionStart fires exactly once (one recovery hint line, not two)
- [ ] **Command name propagation:** Ambient rule, SKILL.md routing text, help text, and plugin README all use the actual namespaced command — grep for `/watson` (without namespace) and update every occurrence
- [ ] **Library books bundled:** `library/` directory is present at the plugin root with all books and chapters — verify by running `--plugin-dir` from a directory that has no `~/.claude/skills/watson/` access
- [ ] **Scripts bundled and executable:** `share-proto-statusline.js` and `detect-proto-edit.js` are in `scripts/` at plugin root with executable permissions — verify with `ls -la scripts/`
- [ ] **hooks.json at plugin root:** `hooks/hooks.json` is at the plugin root level, not inside `.claude-plugin/` — common structural mistake
- [ ] **Version set in plugin.json:** Initial version is set to `1.0.0` in plugin.json before first publish — not left empty or unset
- [ ] **Figma MCP documented as prerequisite:** Plugin README has "Prerequisites" as its first section before install instructions
- [ ] **SHA pinning in marketplace.json:** Initial distribution pins to a specific `sha` rather than tracking `main` — prevents mid-prototype updates

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Hardcoded paths shipped to teammates | MEDIUM | Push a patch with `${CLAUDE_PLUGIN_ROOT}` substitutions; bump version; notify teammates to run `claude plugin update` |
| Double-hook firing from settings.json + hooks.json on author's machine | LOW | Remove Watson hooks from `settings.json`; test that SessionStart fires once; teammates are unaffected (they never had settings.json hooks) |
| Wrong command name (`/watson` vs `/watson:watson`) in all docs | MEDIUM | Update all docs and ambient rule; push update with version bump; teammates update plugin; send team message with the correct command |
| Library book updated mid-prototype for a teammate | MEDIUM | Teammate pins install to previous SHA via marketplace.json `sha` field; author identifies correct SHA; teammate completes prototype then opts into update |
| Figma MCP not configured on teammate machine | LOW | Teammate installs Figma MCP; loupe pipeline works on next invocation; no state to repair |
| `share-proto-statusline.js` missing on teammate machine | LOW | Statusline hook fails silently — no statusline, Watson itself still works; fix by bundling script in next version with version bump |
| Version not bumped — teammates frozen on old code | LOW | Bump version; push; teammates update; no state to repair |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Hardcoded `~/.claude/skills/watson/` paths | Phase 1: Plugin scaffold and path portability | Grep all plugin files for `~/.claude` — zero hits required before shipping |
| Double hook firing from settings.json + hooks.json | Phase 2: Hook migration | Run session post-migration; confirm SessionStart output appears exactly once |
| `/watson` vs `/watson:watson` command naming | Phase 1: Plugin manifest | Decide name in manifest; grep all docs and rules for old command name; confirm namespaced command works |
| Ambient rule not plugin-portable | Phase 1: Plugin manifest and structure | Bundle reference file; update content with new command name; document manual copy step in README |
| Shared hook scripts not bundled | Phase 2: Hook migration and script bundling | Test statusline hook via `--plugin-dir` on a machine without `~/.claude/hooks/` — verify it works |
| Auto-update breaks mid-prototype sessions | Phase 3: Distribution and marketplace config | Pin initial marketplace entry to specific SHA; document version bump process and library update policy |
| Figma MCP dependency invisible to teammates | Phase 3: Distribution and onboarding | Add Prerequisites section to README; test full install flow with a teammate starting from zero |
| Library books not bundled in plugin | Phase 1: Plugin scaffold | Install plugin via `--plugin-dir` without `~/.claude/skills/watson/` on PATH; verify `library/` is accessible |
| Version not bumped — update delivery broken | Phase 1: Plugin manifest | Set initial 1.0.0; establish version bump checklist before any distribution |

---

## Sources

- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference) — `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}`, hooks.json format, path traversal limitations, plugin caching behavior, version detection mechanism, plugin directory structure (HIGH confidence — official Anthropic documentation)
- [Claude Code Plugin Marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) — SHA pinning, auto-update behavior, private repo authentication, `CLAUDE_CODE_PLUGIN_KEEP_MARKETPLACE_ON_FAILURE`, offline behavior, `strictKnownMarketplaces` (HIGH confidence — official Anthropic documentation)
- [Claude Code Skills Reference](https://code.claude.com/docs/en/skills) — `${CLAUDE_SKILL_DIR}` variable, `paths:` frontmatter behavior and tradeoffs, namespacing rules for plugin skills (HIGH confidence — official Anthropic documentation)
- [Claude Code Create Plugins](https://code.claude.com/docs/en/plugins) — migration steps from standalone config to plugin, what changes vs. what stays the same, `--plugin-dir` testing workflow (HIGH confidence — official Anthropic documentation)
- `~/.claude/skills/watson/skills/loupe.md` — direct audit: 9 hardcoded `~/.claude/skills/watson/library/` paths in example libraryPaths[] block, `/tmp/watson-active.json` reads (HIGH confidence — production source code)
- `~/.claude/skills/watson/skills/discuss.md` — direct audit: `~/.claude/skills/watson/library/LIBRARY.md` hardcoded read, `/tmp/watson-active.json` reference (HIGH confidence — production source code)
- `~/.claude/settings.json` — direct audit: Watson SessionStart and SessionEnd hooks identified among GSD hooks (HIGH confidence — production configuration)
- `~/.claude/rules/watson-ambient.md` — direct audit: ambient rule content, portability gap, command name reference (HIGH confidence — production file)
- `~/.claude/hooks/share-proto-statusline.js` — direct audit: confirmed shared hook script between Watson and share-proto skills (HIGH confidence — production source code)
- Watson memory: `paths:` field makes skill ambient-only, losing /command registration — validated finding from Watson 1.1 development (HIGH confidence — documented project decision)

---
*Pitfalls research for: Watson skill-to-plugin migration and team distribution*
*Researched: 2026-04-02*
