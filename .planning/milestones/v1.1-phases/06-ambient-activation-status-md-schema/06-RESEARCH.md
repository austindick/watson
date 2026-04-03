# Phase 6: Ambient Activation + STATUS.md Schema — Research

**Researched:** 2026-04-01
**Domain:** Claude Code skill activation, YAML frontmatter, STATUS.md schema design
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- `paths: ["src/pages/**"]` glob in SKILL.md YAML frontmatter as primary activation mechanism
- `/watson` explicit invocation stays available as fallback if glob is unreliable
- Research phase must validate paths glob reliability before implementation — if unreliable, keep `/watson` as primary with ambient activation as best-effort (no pivot to UserPromptSubmit hook)
- Blueprint gate: Watson only engages if `blueprint/` directory exists in the prototype directory; no blueprint = Watson stays silent
- New prototypes (no blueprint) still require `/watson` to initiate setup flow — intentional friction
- Blueprint existence checked before STATUS.md parsing or intent classification
- Intent passthrough: "Tier 0 — Not prototype work" added to intent classification table
- Tier 0 signals: message is pure coding/git/config with no prototype intent
- STATUS.md location: `blueprint/STATUS.md`, scaffolded by watson-init alongside the four existing blueprint files
- STATUS.md format: YAML frontmatter (machine-parseable) + markdown body (human-readable)
- Three content sections: identity, build state, session info
- Schema-ready stubs for Phase 7 (drafts) and Phase 8 (session management) consumers
- watson-init updated to create STATUS.md as part of blueprint/ scaffolding
- New vs. returning detection: STATUS.md exists = returning; no STATUS.md = new/non-Watson
- Returning context summary: 2-3 lines (prototype name, sections built, suggested next step)
- After summary, present choices: "Continue building / Discuss changes / Start fresh"
- No intent inference on return — always offer explicit choices
- SKILL.md "Setup Detection" section (~12 lines) replaced with "Activation" section (~30 lines)
- SKILL.md target: stay under 200-line limit (current: 148, estimated after: ~170)
- New prototype setup flow unchanged from Phase 5

### Claude's Discretion

- Exact STATUS.md YAML field names and types (constrained by: identity + build state + session info + stubs for Phase 7/8)
- How the Tier 0 passthrough signals are weighted in the classification table
- Exact wording of the returning-user context summary
- How watson-init integrates STATUS.md creation into its existing scaffold logic
- Research approach for validating paths glob reliability

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AMBI-01 | Watson activates automatically when user is in a prototype directory without requiring /watson prefix | `paths` glob in SKILL.md frontmatter triggers when Claude reads matching files; blueprint gate scopes activation to Watson prototypes only |
| AMBI-02 | Watson detects whether user is starting a new prototype or returning to an existing one without asking | STATUS.md existence check is a deterministic binary signal; no content parsing needed |
| AMBI-03 | On activation in an existing prototype, Watson displays a 2-3 line context summary (prototype name, built sections, pending decisions) before asking what to do | STATUS.md build state fields (sections built, pending decisions) directly supply the summary data; pattern confirmed by existing CONTEXT.md structure |
</phase_requirements>

---

## Summary

Phase 6 has two independent implementation concerns: (1) ambient activation via the `paths` glob in SKILL.md frontmatter, and (2) the STATUS.md schema that enables new/returning detection and context summaries.

The `paths` frontmatter field in SKILL.md is confirmed as a real, documented Claude Code feature (verified against official docs at code.claude.com/docs/en/skills). The field accepts glob patterns and causes Claude to load the skill's full content when it reads files matching those patterns. The activation trigger is a **file read**, not a UI open event. This is the critical reliability nuance: the skill loads into context when Claude first reads a matching file in a session, not merely when the user opens a file in their editor. The implication for Phase 6 is that ambient activation fires when Claude reads any file under `src/pages/**` — which happens naturally on the first build or discuss request in a prototype directory.

STATUS.md follows the established blueprint pattern (YAML frontmatter + markdown body, placeholders for agent writes). The schema is fully constrained by the decisions in CONTEXT.md: three identity fields, build state fields fed directly by loupe agents, session stubs for Phases 7/8. The key design insight is that this replaces the fragile "check CONTEXT.md for placeholder text" heuristic with a clean existence check — a file either exists or it does not.

**Primary recommendation:** Implement both concerns in a single-pass update: (1) add `paths` to SKILL.md frontmatter + replace Setup Detection with Activation section, and (2) update watson-init to create STATUS.md with the full schema template. The two changes are tightly coupled — the Activation section logic depends on STATUS.md existence semantics.

---

## Standard Stack

### Core

| Item | Version/Details | Purpose | Why Standard |
|------|----------------|---------|--------------|
| SKILL.md `paths` frontmatter field | Claude Code current | Triggers skill loading on file read for matching glob | Official documented mechanism; only path-scoped activation option for skills |
| YAML frontmatter + markdown body | — | STATUS.md format | Established project pattern (STATE.md, library books, blueprint files); machine-parseable + human-readable |
| `blueprint/STATUS.md` | New file | Per-prototype state artifact | Single source of truth consumed by Phases 7, 8, 9 |
| watson-init.md | Existing utility | Blueprint scaffolding, extended to create STATUS.md | Existing pattern — all blueprint files scaffolded here |

### How `paths` Glob Activation Works (HIGH confidence)

From official Claude Code docs (code.claude.com/docs/en/skills, frontmatter reference table):

> `paths` — Glob patterns that limit when this skill is activated. Accepts a comma-separated string or a YAML list. When set, Claude loads the skill automatically only when working with files matching the patterns.

From the `.claude/rules/` path-specific rules section:

> Path-scoped rules trigger when Claude reads files matching the pattern, not on every tool use.

**Trigger is a file read, not a file open.** The skill loads into context when Claude's Read tool, Grep tool, or Write tool touches a file whose path matches the glob. This is important for understanding activation latency:

- User opens a `.tsx` in `src/pages/` in their editor → Watson does NOT activate yet
- User sends a message, Claude reads the file to understand the context → Watson activates
- User's first message references a file and Claude reads it → Watson activates with that read

**For `src/pages/**`:** This glob matches any file at any depth under `src/pages/`. A prototype at `src/pages/CheckoutFlow/index.tsx` matches. A blueprint file at `src/pages/CheckoutFlow/blueprint/STATUS.md` also matches (blueprint/ is inside the prototype folder which is under src/pages/).

### Glob Pattern Syntax

| Pattern | Matches |
|---------|---------|
| `src/pages/**` | All files at any depth under src/pages/ |
| `src/pages/**/*.tsx` | Only TSX files (more specific, but misses blueprint/ reads) |
| `["src/pages/**"]` | YAML list form — equivalent |

**Recommendation:** Use `src/pages/**` (not `src/pages/**/*.tsx`) so that blueprint/ file reads also trigger activation. This matters because Watson may be invoked by reading STATUS.md or blueprint files, not just the prototype TSX.

### Reliability Assessment (MEDIUM confidence — confirmed by docs, unverified against Faire Playground behavior)

The official mechanism is confirmed. However, the CONTEXT.md correctly flags that **behavior in the specific Faire Playground monorepo needs validation** before implementation proceeds. Key unknowns:

1. Does Claude Code resolve `src/pages/**` relative to the Watson skill's location, or relative to the working directory of the active session?
2. In the Faire Playground (`packages/design/prototype-playground/`), does Watson's session have `src/pages/**` as a relative path that resolves correctly?
3. The Watson skill lives in `~/.claude/skills/watson/` (personal skill). Its `paths` are evaluated against the **active session's working directory**, not the skill's directory. If the user's Claude Code session is rooted at the Playground root (`packages/design/prototype-playground/`), then `src/pages/**` resolves correctly. If rooted at the monorepo root, it may not match.

**Validation protocol (Claude's discretion to determine approach):** Test by opening a prototype file and sending a first message — observe whether Watson's Activation section fires without `/watson`. The `/memory` command can also reveal which skills are loaded.

---

## Architecture Patterns

### Recommended SKILL.md Activation Section Structure

Replace the current "Setup Detection" section (lines 12-23) with this expanded "Activation" section. Structure mirrors the blueprint gate decision chain from CONTEXT.md:

```
## Activation

[YAML paths glob handles getting into context — do not re-describe here]

**Entry point: blueprint gate**
1. Check for blueprint/ directory in the prototype directory
   - Not present → Watson stays silent; default Claude handles the message
2. Check for blueprint/STATUS.md
   - Exists → Returning prototype (see Returning Flow)
   - Not present → New prototype or non-Watson prototype
3. For new prototypes: Watson only engages if user invoked /watson explicitly
   - Without /watson → stay silent (blueprint/ exists but no STATUS.md + no explicit invocation)
   - With /watson → run Setup Flow, then proceed to Intent Classification

**Tier 0 — Not prototype work**
If blueprint/ exists but message is pure coding/git/config with no prototype design intent
(e.g., "fix the TypeScript error", "git status", "run the linter"):
→ Stay silent. Default Claude handles it.

**Returning Flow**
Parse blueprint/STATUS.md build state fields.
Display 2-3 line summary: "[Name] — [N] sections built ([list]). Last discussed: [topic]."
Offer choices: "Continue building / Discuss changes / Start fresh"
Then proceed to Intent Classification with returning context.
```

**Line budget check:** Current SKILL.md = 148 lines. Setup Detection section being replaced = 12 lines. Estimated new Activation section = ~30 lines. Net addition = +18 lines. New total ≈ 166 lines. Under the 200-line constraint.

### STATUS.md Schema Design

The schema is driven by three constraints: (1) identity fields for returning-user summary, (2) build state fields consumed by the context summary, (3) forward-compatible stubs for Phases 7 and 8.

**Recommended schema:**

```yaml
---
# Identity
prototype_name: ""
prototype_slug: ""
owner: ""
owner_github: ""
created_at: ""

# Build State
sections_built: []
pending_decisions: []
last_discussed: ""

# Session Info
last_activity: ""
branch: ""

# Phase 7 stub — draft/commit model
drafts: []

# Phase 8 stub — session management
sessions: []
---

# STATUS: [Prototype Name]

## Build Summary
_No sections built yet._

## Pending Decisions
_None._

## Session Log
_No sessions recorded._
```

**Field rationale:**

| Field | Consumer | Notes |
|-------|----------|-------|
| `prototype_name` | Returning summary, Phase 9 | Human-readable name |
| `prototype_slug` | Phase 8 branch naming (`watson/{slug}`) | Kebab-case, matches route path |
| `owner` / `owner_github` | Feed attribution, Phase 8 | Mirrors prototypeMeta fields |
| `created_at` | Audit / display | ISO date |
| `sections_built` | Returning summary, Phase 9 agent | String array of section names |
| `pending_decisions` | Returning summary, Phase 7 | String array of decision stubs |
| `last_discussed` | Returning summary | Free text, updated by discuss |
| `last_activity` | Session log | ISO timestamp |
| `branch` | Phase 8 | Current Watson branch name |
| `drafts` | Phase 7 | Empty array stub — Phase 7 defines schema |
| `sessions` | Phase 8 | Empty array stub — Phase 8 defines schema |

### watson-init Integration Pattern

watson-init currently creates four files (CONTEXT.md, LAYOUT.md, DESIGN.md, INTERACTION.md). STATUS.md becomes a fifth file added in the same `## Template Content` section. Pattern is identical to existing files: markdown content with YAML frontmatter + placeholder body.

The key difference from the four blueprint files: STATUS.md uses **YAML frontmatter** as the primary machine-readable section (agents update frontmatter fields), while the markdown body is human-readable summary text derived from the frontmatter. The four existing blueprint files are markdown-only with section headings and placeholder text.

**watson-init addition:**

```markdown
### blueprint/STATUS.md

[YAML frontmatter schema + markdown body as shown above]

Note: STATUS.md is the per-prototype state file. YAML frontmatter is updated by Watson agents as the prototype evolves. Markdown body is auto-generated from frontmatter for human readability. Never overwrite STATUS.md — always Edit specific frontmatter fields.
```

### Anti-Patterns to Avoid

- **Using `description` field alone for activation:** The description-based auto-invocation is probabilistic. `paths` provides deterministic triggering on file reads. Use both: `paths` for activation scope, `description` for semantic match signal.
- **Parsing CONTEXT.md placeholder text for new/returning detection:** The current approach (check if CONTEXT.md has real content) is fragile. STATUS.md existence is binary and unambiguous.
- **Writing STATUS.md from scratch on update:** Agents should Edit specific fields, never overwrite the whole file. The YAML frontmatter has deterministic field locations — Edit tool targets them precisely.
- **Putting prototype-specific data in STATUS.md body:** The markdown body is human-readable summary only, derived from frontmatter. Machine data lives in frontmatter.
- **Embedding activation logic in watson-init:** watson-init creates files; SKILL.md contains routing logic. Keep concerns separate.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File-based skill activation scoping | Custom UserPromptSubmit hook | `paths` frontmatter field | Documented feature, no external deps, no hook infra needed |
| Glob pattern matching | Custom path comparison logic | `paths` field (Claude Code handles it) | Platform handles resolution and matching |
| New/returning state detection | Content-parsing heuristics | STATUS.md existence check | Binary file existence is more reliable than parsing placeholder text |
| Per-prototype state persistence | Database, external storage | File-based STATUS.md | Consistent with all other Watson artifacts; works in any environment |

---

## Common Pitfalls

### Pitfall 1: `paths` resolves against session working directory, not skill directory

**What goes wrong:** Watson skill lives at `~/.claude/skills/watson/SKILL.md`. Adding `paths: ["src/pages/**"]` may not resolve to the Playground's `src/pages/` if the Claude Code session is rooted at the monorepo root rather than the Playground package root.

**Why it happens:** `paths` patterns are evaluated against the active session's working directory. A personal skill has no inherent tie to a specific project directory. If the Faire Playground monorepo is opened at its root (e.g., `faire/`), then `src/pages/**` would look for `faire/src/pages/` which doesn't exist.

**How to avoid:** Validate before implementation. Confirm that the Claude Code session for Playground work is opened at `packages/design/prototype-playground/` as its working directory, not at the monorepo root. If the monorepo root is the CWD, the glob must be `packages/design/prototype-playground/src/pages/**` instead.

**Warning signs:** Watson doesn't activate on first file read in a prototype directory. Test by sending a message that would reference a prototype file and check if the Activation section behavior fires.

**Fallback:** If glob proves unreliable, the `/watson` fallback remains and ambient activation is documented as best-effort.

### Pitfall 2: Activation fires on blueprint/ file reads too (desired behavior, potential confusion)

**What goes wrong:** `src/pages/**` matches `src/pages/CheckoutFlow/blueprint/STATUS.md` as well as `src/pages/CheckoutFlow/index.tsx`. Watson activates whenever any file in a prototype directory tree is read — including when agents read blueprint files during an existing Watson session.

**Why it happens:** `**` matches any depth. Blueprint files live inside the prototype directory which is inside `src/pages/`.

**How to avoid:** This is actually the desired behavior — Watson should be active whenever any file in a prototype directory is read. Agents writing blueprint files are operating within a Watson session, so re-activation is harmless. Document this as intentional in the Activation section.

**Warning signs:** This becomes a problem only if Watson's Activation section performs expensive operations (file reads, agent dispatches) on re-activation within an existing session. The blueprint gate (check blueprint/ exists) is cheap; ensure re-entry is handled gracefully.

### Pitfall 3: STATUS.md written with full Write (not Edit) on updates

**What goes wrong:** When updating build state after a loupe run, an agent uses Write to overwrite STATUS.md rather than Edit to update specific fields. This stomps any concurrent changes or human edits to the markdown body.

**Why it happens:** Write is simpler than Edit, and agents default to it for full-file content. Watson agents (builder, consolidator) may update STATUS.md after each section.

**How to avoid:** watson-init must scaffold STATUS.md with deterministic section headings and YAML frontmatter field names that Edit tool can target precisely. Document in watson-init: "Never overwrite STATUS.md — always Edit specific frontmatter fields." Each updater agent gets specific field paths.

**Warning signs:** STATUS.md timestamp or sections_built array gets reset to scaffold values during pipeline runs.

### Pitfall 4: Tier 0 passthrough not comprehensive enough

**What goes wrong:** Watson's Activation section engages on messages like "fix the linting error" or "run `npm test`" because the blueprint gate passes (blueprint/ exists) and STATUS.md exists (returning prototype), so it falls through to intent classification. No Tier 0 check catches pure coding tasks.

**Why it happens:** The Tier 0 check must be inserted before intent classification, after the blueprint gate and STATUS.md check. If it's not an early exit, every message from a returning user goes through the full classification.

**How to avoid:** Insert Tier 0 as an explicit check in the activation flow, after STATUS.md parse and before intent classification. List signal patterns explicitly (pure bash commands, TypeScript errors, linting, git operations with no prototype context words).

**Warning signs:** Users in prototype directories report Watson hijacking generic coding assistance. User feedback pattern: "Watson keeps trying to do design stuff when I'm just fixing bugs."

### Pitfall 5: SKILL.md exceeds 200 lines

**What goes wrong:** Adding the new Activation section and Tier 0 entry to the classification table pushes SKILL.md over the 200-line limit, violating the hard constraint.

**Why it happens:** Activation section is ~30 lines replacing ~12 lines, +18 net. The Tier 0 entry in the classification table adds 1-2 lines. With current 148 lines, estimated total is ~168 — safe. But if the Activation section grows during implementation, it can tip over.

**How to avoid:** Count lines explicitly before finalizing. Target the Activation section at ≤28 lines. Tier 0 row in the table is one line. Total budget: 148 - 12 (removed) + 28 (activation) + 2 (tier 0 row) = 166. Buffer: 34 lines.

---

## Code Examples

### SKILL.md Frontmatter Change

```yaml
# Source: code.claude.com/docs/en/skills — frontmatter reference
---
name: watson
version: 1.0.0
paths:
  - "src/pages/**"
---
```

The `paths` field accepts a YAML list or comma-separated string. The list form is clearer for multi-pattern future expansion.

### Path-Specific Rule Example (from official docs)

```yaml
# Source: code.claude.com/docs/en/memory#path-specific-rules
---
paths:
  - "src/api/**/*.ts"
---
# API Development Rules
- All API endpoints must include input validation
```

Watson's usage is identical: `paths` in the frontmatter, skill content follows.

### STATUS.md Template (watson-init addition)

```markdown
---
prototype_name: "[Prototype Name]"
prototype_slug: "[prototype-slug]"
owner: "[Owner Full Name]"
owner_github: "[githubusername]"
created_at: "[YYYY-MM-DD]"
sections_built: []
pending_decisions: []
last_discussed: ""
last_activity: "[YYYY-MM-DD]"
branch: ""
drafts: []
sessions: []
---

# STATUS: [Prototype Name]

## Build Summary
_No sections built yet._

## Pending Decisions
_None._

## Session Log
_No sessions recorded._
```

Replace `[Prototype Name]`, `[prototype-slug]`, etc. with values from setup flow. YAML list fields (`sections_built`, `pending_decisions`, `drafts`, `sessions`) use empty array `[]` as placeholder — Edit-safe since YAML parsers will append to arrays cleanly.

### Returning-User Context Summary Format

```
[Prototype Name] — [N] section(s) built ([section1], [section2]).
Last discussed: [last_discussed field value].

What would you like to do?
→ Continue building
→ Discuss changes
→ Start fresh
```

Derived entirely from STATUS.md YAML frontmatter fields. No blueprint file parsing required.

### Activation Section Logic (pseudocode for SKILL.md)

```
## Activation

1. Check: does `blueprint/` directory exist?
   NO  → Stay silent. Not a Watson prototype.
   YES → Continue.

2. Check: is message pure coding/git/config? (Tier 0)
   YES → Stay silent. Defer to default Claude.
   NO  → Continue.

3. Check: does `blueprint/STATUS.md` exist?
   YES → Parse YAML frontmatter. Show returning summary. Offer choices.
   NO  → Is this an explicit /watson invocation?
           YES → Run Setup Flow.
           NO  → Stay silent. Intentional: don't scaffold without explicit request.

4. Proceed to Intent Classification.
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `/watson` required to activate | `paths` glob activates on file read | Phase 6 | Ambient activation — no prefix needed |
| CONTEXT.md placeholder-text parsing for new/returning | STATUS.md existence check | Phase 6 | Binary, reliable, no string parsing |
| 3 blueprint files created by watson-init | 5 blueprint files (adds STATUS.md) | Phase 6 | Per-prototype state lives alongside blueprint |
| 3-tier intent classification | 4-tier (adds Tier 0 passthrough) | Phase 6 | Prevents Watson hijacking generic coding tasks |
| "Setup Detection" section in SKILL.md | "Activation" section | Phase 6 | ~12 → ~30 lines, handles full routing tree |

**Deprecated:**
- Placeholder-text existence check in Setup Detection section: replaced by STATUS.md existence check. The old CONTEXT.md content-parsing approach (`blueprint/CONTEXT.md` has real content vs. `_Not yet defined._`) is no longer needed.

---

## Open Questions

1. **`paths` glob resolution against session CWD**
   - What we know: `paths` is evaluated against the active session's working directory
   - What's unclear: Whether Faire Playground sessions are always opened at `packages/design/prototype-playground/` or at the monorepo root
   - Recommendation: Validate by testing in the actual Playground before finalizing SKILL.md `paths` value. If monorepo root is typical CWD, the glob needs to be `packages/design/prototype-playground/src/pages/**`

2. **STATUS.md update protocol for loupe agents**
   - What we know: builder and consolidator agents currently write CONTEXT.md, LAYOUT.md, DESIGN.md, INTERACTION.md
   - What's unclear: Which agent(s) should update `sections_built` and `last_activity` in STATUS.md, and at what point in the pipeline
   - Recommendation: Define in watson-init and agent-contract.md which agent updates which STATUS.md fields. This is Phase 6 scope only if watson-init scaffolds STATUS.md — the loupe pipeline update protocol can be a stub for Phase 9 to complete.

3. **"Start fresh" choice semantics**
   - What we know: The returning-user choices are "Continue building / Discuss changes / Start fresh"
   - What's unclear: Does "Start fresh" delete STATUS.md and blueprint files, or just re-run setup flow? This affects downstream phases.
   - Recommendation: For Phase 6, "Start fresh" should run the Setup Flow again, overwriting STATUS.md with a fresh scaffold. Explicitly document this in the Activation section. Phase 8 (session management) can refine branch behavior.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — Watson is a skill/prompt system, not a code project with a test runner |
| Config file | none |
| Quick run command | Manual invocation test in Playground |
| Full suite command | Manual E2E walkthrough |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AMBI-01 | Watson activates without /watson in a prototype directory | manual-only | Open prototype file, send message, observe activation | N/A |
| AMBI-02 | Watson detects new vs. returning without asking | manual-only | New: no STATUS.md → setup flow triggered; Returning: STATUS.md present → summary shown | N/A |
| AMBI-03 | Context summary shows prototype name, sections built, pending decisions | manual-only | Return to existing prototype with populated STATUS.md | N/A |

**Manual-only justification:** Watson is a Claude Code skill — behavioral output is Claude's response, not a testable binary. Verification requires observing Claude's behavior in an actual Playground session.

### Sampling Rate

- **Per task:** Manual spot-check after each SKILL.md or watson-init change
- **Per wave:** Full E2E walkthrough: new prototype (no STATUS.md) + returning prototype (STATUS.md populated)
- **Phase gate:** All three AMBI requirements demonstrably true before `/gsd:verify-work`

### Wave 0 Gaps

None — no automated test infrastructure needed. Validation is entirely behavioral/observational.

---

## Sources

### Primary (HIGH confidence)
- `code.claude.com/docs/en/skills` — Full skills documentation including `paths` frontmatter field, frontmatter reference table, activation behavior, invocation control
- `code.claude.com/docs/en/memory#path-specific-rules` — Path-specific rules behavior confirming "trigger when Claude reads files matching the pattern, not on every tool use"
- `~/.claude/skills/watson/SKILL.md` — Current implementation (148 lines), Setup Detection section being replaced
- `~/.claude/skills/watson/utilities/watson-init.md` — Current blueprint scaffolding logic, four-file template structure
- `~/.claude/skills/watson/library/playground-conventions/project-structure/CHAPTER.md` — Confirms `src/pages/` as prototype directory in Playground

### Secondary (MEDIUM confidence)
- `.planning/phases/06-ambient-activation-status-md-schema/06-CONTEXT.md` — User decisions constraining all implementation choices
- `.planning/REQUIREMENTS.md` — AMBI-01, AMBI-02, AMBI-03 requirement definitions
- `.planning/STATE.md` — Blocker documented: validate paths glob reliability

### Tertiary (LOW confidence)
- None — all critical claims verified against official docs or project files

---

## Metadata

**Confidence breakdown:**
- `paths` glob feature exists and works as described: HIGH — verified against official Claude Code docs
- `paths` triggers on file read (not UI open): HIGH — verified against official docs
- `paths` resolves against session CWD: HIGH for the mechanism, MEDIUM for Faire Playground behavior (not yet tested in environment)
- STATUS.md schema design: HIGH for structure, MEDIUM for exact field names (Claude's discretion per CONTEXT.md)
- Blueprint gate + Tier 0 logic: HIGH — directly derived from locked CONTEXT.md decisions
- Watson-init integration pattern: HIGH — mirrors existing four-file pattern exactly

**Research date:** 2026-04-01
**Valid until:** 2026-06-01 (stable platform feature, 60-day window)
