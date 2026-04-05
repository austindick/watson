# Phase 15: Distribution + Onboarding + Validation - Research

**Researched:** 2026-04-05
**Domain:** Claude Code plugin marketplace distribution, GitHub repo publishing, onboarding README authoring, install/migration validation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Install Flow**
- One command: `claude plugin add austindick/watson` (see note below — actual command is marketplace-based; see Standard Stack)
- Public repo (austindick/watson) — no GITHUB_TOKEN needed, zero auth friction
- Prerequisites drop to: Figma MCP configured + Claude Code installed
- First run is "just launch and go" — session-start script handles ambient rule auto-copy and statusLine auto-write
- Teammates launch from `~/faire/frontend` (monorepo), not a standalone playground dir

**Playground Integration**
- Add `austindick/watson` to enabledPlugins in the Playground's `.claude/settings.json`
- Commit enabledPlugins only AFTER validation passes (not before)
- Non-installers see nothing — entry is silently ignored if plugin not installed

**README Content**
- Minimal quickstart — scannable by designers and PMs, not engineers
- Beta badge at top: "> Beta — internal Faire tool"
- Inline 3-step Figma MCP setup instructions (not a link to external docs)
- 2-3 troubleshooting items for common failure modes
- "DM Austin in Slack" as fallback support channel
- No architecture details, no advanced usage — keep it short

**Validation Strategy**
- Sequence: push repo → author migration (VALD-02) → beta tester fresh install (VALD-01) → commit enabledPlugins → share with broader team
- VALD-01 (fresh install): real test on a beta tester's machine, not simulated. Pass = they follow README and Watson works without your help
- VALD-02 (author migration): self-test with checklist — no double-firing hooks, /watson:watson works, statusLine shows, old skill files not interfering
- Specific beta tester(s) hand-picked for VALD-01 — not a broad Slack blast

**Auto-Update Flow**
- Silent auto-update — Claude Code handles plugin updates when version bumps in plugin.json
- Slack the beta group only for breaking changes (e.g., new Figma MCP version required)
- No changelog posts for routine updates

**Versioning**
- Bump plugin.json version on every push to main — no unbumped pushes
- Patch for fixes/tweaks (1.2.0 → 1.2.1), minor for features (1.2.1 → 1.3.0), major for breaking changes
- Library books ship with plugin version — no separate book versioning
- Book regeneration = patch bump like any other change

### Claude's Discretion
- Exact troubleshooting items to include in README (based on likely failure modes)
- Figma MCP inline setup step wording
- enabledPlugins commit message and timing within the Playground repo
- Whether to include a CHANGELOG.md in the repo (low priority)

### Deferred Ideas (OUT OF SCOPE)
- Go private again if external visibility becomes a concern — start public for frictionless beta
- CHANGELOG.md for version history — add if update frequency warrants it
- Automated validation script for VALD-01/VALD-02 — add if manual checklist proves insufficient
- Broader team rollout strategy (Slack channel, team demo) — after beta validates
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DIST-01 | Teammates can install Watson with a single command from a GitHub repo (austindick/watson or equivalent) | Marketplace mechanism requires `marketplace.json` alongside `plugin.json`; install is two commands not one (add marketplace, then install plugin) — see Architecture Patterns for resolution |
| DIST-02 | Plugin auto-updates when author pushes new versions to the repo | Auto-update is marketplace-driven; requires version bump in plugin.json per push; auto-update must be enabled on the marketplace entry |
| DIST-03 | Onboarding README documents all prerequisites (Figma MCP, GITHUB_TOKEN for private repo, ambient rule manual step) | Public repo eliminates GITHUB_TOKEN requirement; README must cover Figma MCP setup, ambient rule copy step, and /reload-plugins |
| DIST-04 | Ambient rule (watson-ambient.md) is bundled as a reference file with documented manual copy step to ~/.claude/rules/ | File already exists at skills/watson/references/watson-ambient.md; needs README documentation of copy step |
| VALD-01 | Fresh install on a clean machine (or new user profile) produces a working Watson with /watson invocable | Validation plan: beta tester follows README end-to-end; checklist documents expected state after install |
| VALD-02 | Existing Watson author install migrates cleanly (no double-firing hooks, no broken paths) | Author self-test checklist: hooks.json not duplicated in settings.json, /watson:watson invocable, statusLine shows correctly |
</phase_requirements>

---

## Summary

Phase 15 delivers the last mile: get Watson from the author's machine to teammates' machines cleanly. The technical work is small (create `marketplace.json`, write README, commit one settings entry) but the critical output is validated confidence that the install flow works end-to-end without author assistance.

The most important research finding is a **command model clarification**: Claude Code does not have a bare `claude plugin add owner/repo` command. The actual install model is marketplace-based — two steps: (1) add the marketplace (`/plugin marketplace add austindick/watson`), then (2) install the plugin (`/plugin install watson@watson`). This must be reflected in the README. The CONTEXT.md phrasing "one command: `claude plugin add austindick/watson`" refers to the intent, not the exact CLI syntax. The plan must use the verified two-step command sequence.

The second key finding is what still needs to be created: a `.claude-plugin/marketplace.json` file. Watson already has `.claude-plugin/plugin.json` but has no marketplace catalog. Without `marketplace.json`, `claude plugin marketplace add austindick/watson` will fail. The repo also has no `README.md`. Both are created in this phase.

**Primary recommendation:** Create `marketplace.json` pointing at the plugin via relative path, write the minimal README with exact commands, then execute the validation sequence in order (VALD-02 first as author, then VALD-01 with beta tester), then commit `enabledPlugins` to Playground settings.

---

## Standard Stack

### Core
| Asset | Location | Purpose | Why |
|-------|----------|---------|-----|
| `.claude-plugin/marketplace.json` | Repo root | Makes the repo a marketplace Claude Code can add | Required for `/plugin marketplace add` to work |
| `.claude-plugin/plugin.json` | Repo root | Plugin manifest with name, version, description | Already exists at version 1.2.0 |
| `README.md` | Repo root | Onboarding doc visible on GitHub and to teammates | The sole handoff artifact for VALD-01 |
| `hooks/hooks.json` | Repo root sibling | Wires SessionStart/SessionEnd hooks | Already exists and correct |
| `scripts/watson-session-start.js` | `scripts/` | First-run recovery notification | Already exists |
| `skills/watson/references/watson-ambient.md` | Inside plugin | Ambient rule reference file (DIST-04) | Already exists; README must document copy step |

### Marketplace JSON Structure

The marketplace catalog lives at `.claude-plugin/marketplace.json` alongside the existing `plugin.json`:

```json
{
  "name": "watson",
  "owner": {
    "name": "Austin Dick"
  },
  "plugins": [
    {
      "name": "watson",
      "source": ".",
      "description": "Design discussion and prototype building for the Faire Prototype Playground"
    }
  ]
}
```

**Source `.`** points to the repository root (the plugin directory is the repo itself). This is the correct pattern when the marketplace and plugin are the same repo.

### Verified Install Commands (two-step sequence)

```bash
# Step 1: Register the marketplace
/plugin marketplace add austindick/watson

# Step 2: Install the plugin
/plugin install watson@watson

# Step 3: Activate (no restart needed)
/reload-plugins
```

**Confidence: HIGH** — verified against official Claude Code documentation at code.claude.com.

### enabledPlugins for Playground settings

To gate Watson availability in `~/faire/frontend/.claude/settings.json` (committed AFTER validation):

```json
{
  "enabledPlugins": {
    "watson@watson": true
  }
}
```

Non-installers who don't have the marketplace registered see this entry silently ignored — Claude Code only activates plugins that are actually installed.

### Auto-Update Mechanism

Auto-update for third-party marketplaces is **disabled by default**. Teammates must enable it manually through the plugin UI:

1. `/plugin` → Marketplaces tab → select "watson" → Enable auto-update

Or the auto-update can be pre-configured. When enabled:
- Claude Code refreshes marketplace data at startup
- If `version` in `plugin.json` changed, plugin updates and prompts `/reload-plugins`
- The `version` field in `plugin.json` MUST be bumped on every push for updates to be detected

**Confidence: HIGH** — verified against official docs. Third-party auto-update is off by default; teammates must opt in.

---

## Architecture Patterns

### Recommended Repo Structure (what must exist after phase 15)

```
watson/                              # repo root = plugin root
├── .claude-plugin/
│   ├── plugin.json                  # already exists (name=watson, version=1.2.0)
│   └── marketplace.json             # CREATE THIS — makes repo a marketplace
├── hooks/
│   └── hooks.json                   # already exists
├── scripts/
│   ├── watson-session-start.js      # already exists
│   ├── watson-session-end.js        # already exists
│   └── watson-statusline.js         # already exists
├── skills/
│   └── watson/
│       ├── SKILL.md
│       ├── references/
│       │   └── watson-ambient.md    # already exists (DIST-04 reference file)
│       └── ...
└── README.md                        # CREATE THIS — onboarding doc
```

### Pattern 1: Single-Repo Marketplace (Plugin = Marketplace)

**What:** The repo serves as both marketplace catalog and plugin source. `marketplace.json` lists the plugin with `source: "."` pointing at the repo root.

**When to use:** When you have a single plugin to distribute and don't need a separate catalog repo.

**Example (verified from official docs walkthrough):**
```json
{
  "name": "watson",
  "owner": { "name": "Austin Dick" },
  "plugins": [
    {
      "name": "watson",
      "source": ".",
      "description": "Design discussion and prototype building for the Faire Prototype Playground"
    }
  ]
}
```

### Pattern 2: README Structure for Non-Technical Audience

The README must be scannable. Verified pattern from the decisions:

```markdown
> **Beta** — internal Faire tool. DM Austin in Slack with questions.

# Watson

[1-sentence description]

## Prerequisites

1. Claude Code installed
2. Figma MCP configured (see below)

## Install

[exact 3-step command sequence]

## Figma MCP Setup

[inline 3 steps]

## Troubleshooting

[2-3 items]
```

### Pattern 3: Validation Checklist Structure

For VALD-02 (author self-test), the plan must produce a concrete checklist artifact:

**Author migration checklist:**
- [ ] Watson hooks do not appear in `~/.claude/settings.json` (not duplicated from old install)
- [ ] `~/faire/frontend` session: `/watson` resolves to `/watson:watson` and activates
- [ ] After `/watson` activation: `/tmp/watson-active.json` exists
- [ ] statusLine shows in terminal (not custom script overwritten)
- [ ] SessionEnd fires: `/tmp/watson-session-end.json` written after `/clear`
- [ ] Old `~/.claude/skills/watson/` directory does not interfere (no duplicate hook registration)
- [ ] Ambient rule at `~/.claude/rules/watson-ambient.md` triggers suggestion in playground context

**Fresh install checklist (VALD-01 beta tester):**
- [ ] Beta tester ran exactly the steps in README, no extra coaching
- [ ] `/watson:watson` is invocable after install
- [ ] Figma MCP connection works (if prerequisite was met)
- [ ] SessionStart hook fires (recovery message shows after `/clear` if session was active)
- [ ] Beta tester did not need to contact Austin for help

### Anti-Patterns to Avoid

- **Committing `enabledPlugins` before validation:** if the plugin breaks on a fresh install, all teammates with the setting will see silent failures — or worse, hook errors. Gate on VALD-01 passing.
- **Using `source: "./."` or `"./watson"` instead of `"."` for same-repo plugin:** relative paths work from marketplace root (directory containing `.claude-plugin/`); repo root is that directory, so `"."` is correct.
- **Leaving `version` in `plugin.json` at 1.2.0 indefinitely:** auto-update detection is version-diff based. If version never changes, teammates never get updates. Bump on every push.
- **Writing README for engineers:** CONTEXT.md is explicit — target designers and PMs. No architecture diagrams, no agent explanations, no file tree.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Plugin discovery/distribution | Custom install script | Claude Code marketplace system | Already handles cloning, caching, version tracking, auto-update |
| Auto-update detection | Webhook or cron polling | Version bump in `plugin.json` | Claude Code checks version at startup and prompts reload |
| Private repo auth | Custom token management | `GITHUB_TOKEN` env var (public repo eliminates this entirely) | Claude Code handles git credential helpers automatically |
| Plugin activation after install | Restart Claude Code | `/reload-plugins` command | Claude Code supports in-session plugin reload without restart |

**Key insight:** The marketplace system handles the entire distribution lifecycle. Phase 15 is about wiring the metadata files correctly and writing the human-facing document, not building infrastructure.

---

## Common Pitfalls

### Pitfall 1: Missing marketplace.json means add command fails silently
**What goes wrong:** `/plugin marketplace add austindick/watson` succeeds in cloning the repo but fails to register because `.claude-plugin/marketplace.json` is absent. No useful error message.
**Why it happens:** The repo already has `plugin.json` but not the marketplace catalog file — these are different files serving different purposes.
**How to avoid:** Create `.claude-plugin/marketplace.json` as the first deliverable of this phase. Validate with `claude plugin validate .` before pushing.
**Warning signs:** `/plugin marketplace add` appears to succeed but marketplace doesn't appear in `/plugin` → Marketplaces tab.

### Pitfall 2: Plugin name mismatch between marketplace.json and install command
**What goes wrong:** If `marketplace.json` sets `"name": "watson-plugin"` but teammates run `/plugin install watson@watson`, installation fails.
**Why it happens:** The `name` field in the plugin entry in `marketplace.json` is what users reference in install commands.
**How to avoid:** Use `"name": "watson"` in the plugin entry, making the install command `/plugin install watson@watson` (marketplace name is also `watson`).
**Warning signs:** "Plugin not found" error on `/plugin install`.

### Pitfall 3: Auto-update is disabled by default for third-party marketplaces
**What goes wrong:** Author pushes update, bumps version, but teammates never receive it automatically.
**Why it happens:** Official Anthropic marketplaces have auto-update enabled; third-party marketplaces (including watson) have it **disabled by default**.
**How to avoid:** README must explicitly instruct teammates to enable auto-update: `/plugin` → Marketplaces → watson → Enable auto-update. Or accept manual update flow.
**Warning signs:** Teammate reports running old behavior after author pushed a fix.

### Pitfall 4: Author migration leaves old skill hooks in settings.json
**What goes wrong:** Author has Watson hooks in `~/.claude/settings.json` from before Phase 14 migration. Plugin hooks AND settings hooks both fire, causing double hook execution.
**Why it happens:** Phase 14 migrated hooks to `hooks/hooks.json` in the plugin, but old entries may persist in personal settings.
**How to avoid:** VALD-02 checklist explicitly verifies no Watson hook entries remain in `~/.claude/settings.json`.
**Warning signs:** SessionStart fires twice on Claude Code start (two recovery messages appear).

### Pitfall 5: Source path in marketplace.json uses wrong format
**What goes wrong:** Using `"source": "./watson"` or `"source": "../"` causes "path not found" during plugin install.
**Why it happens:** Relative paths resolve from the marketplace root (the directory containing `.claude-plugin/`), which is the repo root. The plugin is at the repo root, so the source is `"."`.
**How to avoid:** Use `"source": "."` exactly. Verify with local `claude plugin validate .` before pushing.
**Warning signs:** Plugin install fails with path resolution error.

### Pitfall 6: README `prerequisites` section omits ambient rule copy step
**What goes wrong:** DIST-04 requires the ambient rule to be documented. Teammates who skip the manual copy step get no Playground activation suggestion and think Watson is broken.
**Why it happens:** The ambient rule can't live in `rules/` inside the plugin (rules/ is not a plugin-supported directory). It ships as a reference file and requires a manual copy to `~/.claude/rules/`.
**How to avoid:** README must explicitly state: copy `skills/watson/references/watson-ambient.md` → `~/.claude/rules/watson-ambient.md`. This is a post-install manual step.
**Warning signs:** Beta tester reports Watson never prompts them in the Playground.

---

## Code Examples

### marketplace.json (verified structure from official docs)

```json
{
  "name": "watson",
  "owner": {
    "name": "Austin Dick"
  },
  "plugins": [
    {
      "name": "watson",
      "source": ".",
      "description": "Design discussion and prototype building for the Faire Prototype Playground",
      "version": "1.2.0",
      "author": {
        "name": "Austin Dick"
      }
    }
  ]
}
```

Source: official Claude Code plugin marketplace docs, code.claude.com/docs/en/plugin-marketplaces

### enabledPlugins entry for Playground settings.json

```json
{
  "enabledPlugins": {
    "watson@watson": true
  }
}
```

Source: official Claude Code settings docs, code.claude.com/docs/en/discover-plugins

### Validate marketplace before pushing

```bash
# Run from repo root
claude plugin validate .
```

### Full install sequence (what README must contain)

```bash
# From within Claude Code
/plugin marketplace add austindick/watson
/plugin install watson@watson
/reload-plugins

# Manual step (outside Claude Code)
cp ~/.claude/plugins/cache/watson/watson/1.2.0/skills/watson/references/watson-ambient.md \
   ~/.claude/rules/watson-ambient.md
```

**Note:** The cache path structure `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/` is how Claude Code stores installed plugins. The ambient rule copy path will include the actual installed version.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Direct `~/.claude/skills/` installation | Plugin marketplace with `claude plugin marketplace add` | Claude Code plugin system (2025) | Distribution is now declarative via JSON; no manual file copying |
| Hardcoded `~/.claude/skills/watson/` paths | `${CLAUDE_PLUGIN_ROOT}` env var | Phase 13 | Paths portable across installs |
| Hooks in personal settings.json | Hooks in `hooks/hooks.json` bundled with plugin | Phase 14 | Hooks travel with plugin, no per-user setup |
| `GITHUB_TOKEN` required for private repo | Public repo, no token needed | Phase 15 decision | Eliminates biggest onboarding friction |

**Note on "one command" framing:** The CONTEXT.md describes the goal as "one command: `claude plugin add austindick/watson`". The actual Claude Code CLI is two commands: marketplace add, then plugin install. The README should present both as the install sequence. The spirit (minimal friction) is preserved.

---

## Open Questions

1. **Auto-update opt-in: document in README or accept manual updates?**
   - What we know: third-party marketplace auto-update is disabled by default; teammates must manually enable it or run `/plugin marketplace update watson` to refresh
   - What's unclear: whether the README should instruct users to enable auto-update (adds a step) or whether manual update on-demand is acceptable for the beta cohort
   - Recommendation: Include auto-update enable step in README as an optional "to receive future updates automatically" section; beta cohort can skip it

2. **Ambient rule cache path for copy instruction**
   - What we know: plugins are cached at `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`; marketplace name = `watson`, plugin name = `watson`, version = `1.2.0`
   - What's unclear: whether the version subdirectory path in cache is reliable or changes with updates (requiring teammates to update their copy path)
   - Recommendation: Find a version-agnostic path or document that re-copying is needed after major version bumps. Alternative: provide a shell one-liner that globs the cache path.

3. **GitHub repo visibility: is austindick/watson currently public?**
   - What we know: current remote is `watson-planning.git` (the planning repo), not `watson.git`; the code repo may not yet be pushed to `austindick/watson`
   - What's unclear: whether the public `austindick/watson` repo exists and is set up as the code remote
   - Recommendation: First task in Phase 15 plan should verify/create the GitHub repo and set it as the code remote, then push

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual checklist (no automated test framework applicable — validation is human execution) |
| Config file | none |
| Quick run command | Author self-test against VALD-02 checklist |
| Full suite command | Beta tester fresh install against VALD-01 checklist |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DIST-01 | `/plugin marketplace add austindick/watson` + `/plugin install watson@watson` succeeds | smoke | manual — run commands in Claude Code, verify in Installed tab | ❌ Wave 0 (no automated equivalent) |
| DIST-02 | After version bump + push, teammate sees update on next Claude Code start | smoke | manual — bump version, push, restart Claude Code, observe notification | ❌ Wave 0 |
| DIST-03 | README covers all prerequisites: Figma MCP, ambient rule copy step | review | manual — author reads README against checklist | ❌ Wave 0 |
| DIST-04 | `skills/watson/references/watson-ambient.md` exists and README documents copy step | smoke | `test -f skills/watson/references/watson-ambient.md` | ✅ file exists; README step to verify |
| VALD-01 | Beta tester follows README to working Watson without author help | e2e | manual — real person, real machine | ❌ Wave 0 |
| VALD-02 | Author migration: no double hooks, `/watson:watson` works, statusLine shows | smoke | manual checklist — author runs through VALD-02 checklist | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `claude plugin validate .` (validates marketplace.json and plugin.json syntax)
- **Per wave merge:** Author self-test (VALD-02 checklist) before tagging for beta
- **Phase gate:** VALD-01 (beta tester passes) before committing enabledPlugins

### Wave 0 Gaps
- [ ] `.claude-plugin/marketplace.json` — does not exist; must be created before any install testing
- [ ] `README.md` — does not exist at repo root
- [ ] `claude plugin validate .` — prerequisite CLI check to confirm marketplace.json is valid before pushing
- [ ] GitHub remote `austindick/watson` — current remote is `watson-planning.git`; code remote must be created and pushed

*(If no gaps: "None — existing test infrastructure covers all phase requirements")*

---

## Sources

### Primary (HIGH confidence)
- [code.claude.com/docs/en/discover-plugins](https://code.claude.com/docs/en/discover-plugins) — install commands, marketplace add flow, enabledPlugins, auto-update behavior
- [code.claude.com/docs/en/plugin-marketplaces](https://code.claude.com/docs/en/plugin-marketplaces) — marketplace.json schema, plugin sources, relative path behavior, version resolution, validation command
- Existing codebase: `.claude-plugin/plugin.json`, `hooks/hooks.json`, `scripts/`, `skills/watson/references/watson-ambient.md` — confirmed existing assets via direct file read

### Secondary (MEDIUM confidence)
- WebSearch results confirming marketplace-based install model (verified against official docs above)

### Tertiary (LOW confidence)
- Cache path structure `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/` — inferred from docs description; exact path not explicitly stated; flagged in Open Questions

---

## Metadata

**Confidence breakdown:**
- Marketplace.json creation: HIGH — schema fully documented in official docs
- Install command sequence: HIGH — verified exact commands from official docs
- Auto-update behavior: HIGH — explicitly documented (third-party default = off)
- Ambient rule cache path: MEDIUM — structure described, exact path format inferred
- GitHub repo setup: MEDIUM — assumed public austindick/watson exists or must be created; current remote is planning repo

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (stable platform; Claude Code plugin system unlikely to change materially in 30 days)
