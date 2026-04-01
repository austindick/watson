# Architecture Research

**Domain:** Claude Code skill framework — Watson 1.1 integration architecture
**Researched:** 2026-04-01
**Confidence:** HIGH for integration patterns (derived from reading all existing skill files); MEDIUM for ambient activation reliability (WebSearch confirmed functional but noted ~50% auto-trigger rate without hooks); HIGH for 3-agent parallel (direct extension of proven 2-agent pattern)

---

## System Overview: Watson 1.1 Target State

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AMBIENT ACTIVATION LAYER  (NEW)                  │
│  paths: "src/pages/**/*.tsx"  in SKILL.md frontmatter               │
│  Description-based auto-load when user edits prototype files        │
│  UserPromptSubmit hook (optional hardening) injects context         │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ (activates when working in prototype dir)
┌───────────────────────────▼─────────────────────────────────────────┐
│                     MASTER ORCHESTRATOR                              │
│                   watson/SKILL.md  (v1.1 changes)                   │
│   + Draft/commit state awareness                                     │
│   + Session management (branch detection/creation)                  │
│   + Ambient re-entry path (no /watson invocation needed)            │
└──────┬───────────────────┬──────────────────┬───────────────────────┘
       │                   │                  │
┌──────▼──────┐   ┌────────▼────────┐  ┌──────▼──────────┐
│  SUBSKILLS  │   │    SUBSKILLS    │  │    UTILITIES    │
│             │   │                 │  │                 │
│ skills/     │   │ skills/         │  │ utilities/      │
│ discuss.md  │   │ loupe.md        │  │ librarian.md    │
│ (+ draft/   │   │ (v1.1: 3-agent  │  │ (unchanged)     │
│  commit     │   │  parallel)      │  │                 │
│  awareness) │   │                 │  │                 │
└─────────────┘   └──────┬──────────┘  └─────────────────┘
                         │
         ┌───────────────┼──────────────────────────────────┐
         │               │                   │              │
┌────────▼───┐  ┌────────▼──────────────────▼─┐  ┌─────────▼──────┐
│  FOREGROUND│  │  PARALLEL BACKGROUND  (v1.1) │  │  SEQUENTIAL    │
│  AGENTS    │  │  3 agents per section         │  │  FOREGROUND    │
│            │  │                               │  │  AGENTS        │
│ decomposer │  │  layout.md   design.md        │  │  builder.md    │
│            │  │              interaction.md   │  │  reviewer.md   │
│            │  │              (NEW — Agent 3)  │  │  consolidator  │
└────────────┘  └───────────────────────────────┘  └────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────────┐
│                     DRAFT/COMMIT LAYER  (NEW)                        │
│  Blueprint files: CONTEXT.md, LAYOUT.md, DESIGN.md, INTERACTION.md  │
│  State: "draft" (discuss amendments, pending rebuild) vs            │
│         "committed" (explicitly locked by user)                      │
│  Stored in: blueprint/STATUS.md  (new file)                         │
│  Consumers: SKILL.md (routing), discuss.md (amendment writes)       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Integration Points: What Changes and What's New

### Feature 1: Ambient Mode

**What it is:** Watson activates automatically when the user works in a prototype directory without typing `/watson`.

**Mechanism:** Claude Code's `paths` frontmatter field in `SKILL.md`. When the field is set, Claude loads the skill automatically when the user reads, writes, or edits a file matching the glob pattern.

**Integration point:** `SKILL.md` frontmatter only. No new files needed.

```yaml
---
name: watson
version: 1.1.0
description: Design prototyping assistant — activates automatically in prototype directories. Use when building, discussing, or iterating on UI prototypes in the Playground.
paths:
  - "src/pages/**/*.tsx"
  - "src/pages/**/*.ts"
---
```

**Setup Detection change:** SKILL.md's current "Setup Detection" step assumes explicit invocation. In ambient mode, the user has not typed `/watson` — they are already working in a file. The setup detection logic must additionally handle "ambient entry":

- If user is already editing a file matching `paths`, skip the "find prototype directory" question — infer it from the file they are editing (`{editedFilePath}` context)
- If blueprint exists → returning user, proceed to Intent Classification
- If blueprint missing → prompt softly: "I can help with this prototype — want me to set it up?"

**Reliability note:** Description-based ambient activation has approximately 50% auto-trigger rate in practice (WebSearch, MEDIUM confidence). The `paths` frontmatter approach is more reliable — it triggers on file access patterns, not language matching. If reliability remains insufficient after initial testing, a `UserPromptSubmit` hook can be added as a hardening layer to inject explicit activation context.

**Nothing else changes:** loupe.md, discuss.md, and all agents are unaffected by ambient mode. Ambient mode is purely an entry-path concern for SKILL.md.

---

### Feature 2: Draft/Commit Amendment Model

**What it is:** Blueprint changes from `discuss` are exploratory ("draft") by default. Users explicitly lock in changes with a "commit" action to mark them as the new authoritative state.

**Where state lives:** A new file `blueprint/STATUS.md` per prototype. This keeps state co-located with the blueprint it describes and does not require any global Watson state.

**STATUS.md schema:**

```markdown
# Blueprint Status

**State:** draft | committed
**Last committed:** [ISO date or "never"]
**Pending amendments:** [list of changed sections, or "none"]
```

**Integration points:**

| Component | Change |
|-----------|--------|
| `SKILL.md` | Reads STATUS.md on entry; surfaces "you have uncommitted design changes" if state is draft |
| `discuss.md` | After writing a `## Discuss Amendments` section to any blueprint file, writes STATUS.md with `State: draft` and records which file was amended |
| `loupe.md` | Checks STATUS.md before pipeline run; if draft, show: "Building with pending design changes — these are exploratory until you commit them" |
| `utilities/watson-init.md` | Writes initial STATUS.md (`State: committed`, `Last committed: [date]`, `Pending amendments: none`) during prototype setup |

**Commit action:** User says "commit" / "lock this in" / "finalize these changes." SKILL.md catches this intent, writes STATUS.md with `State: committed`, `Last committed: [now]`, `Pending amendments: none`.

**No new agents needed.** Draft/commit is pure orchestration and file-write logic in SKILL.md + discuss.md.

---

### Feature 3: Session Management

**What it is:** Watson automates prototype branch creation and detection — new prototypes get a feature branch, returning users land on the right branch.

**Where it runs:** SKILL.md's Setup Flow (new prototypes) and Setup Detection (returning users). No subskills or agents involved.

**New prototype flow:**
1. After setup questions are answered, SKILL.md checks current git branch
2. If on `main`/`master`: offer to create a feature branch
   ```
   - header: "Branch"
   - question: "Should I create a feature branch for this prototype?"
   - options: ["Yes, create one", "I'll manage branches myself"]
   ```
3. If yes: run `git checkout -b prototype/[prototype-name-slug]`
4. Record branch name in `blueprint/STATUS.md` under a `## Session` section

**Returning prototype flow:**
1. SKILL.md reads `blueprint/STATUS.md` for recorded branch name
2. If current branch differs from recorded branch: surface a soft warning
   ```
   "You're on branch [current] — this prototype was last worked on from [recorded branch]. Want to switch?"
   ```
3. User chooses; SKILL.md runs `git checkout [branch]` if confirmed

**Constraints:**
- All git operations run via Bash tool in SKILL.md — no external scripts
- Git operations are always user-confirmed before execution (no silent checkouts)
- If git is not available or repo is not initialized: skip branch management silently, do not block Watson
- Branch naming: `prototype/[slug]` where slug is kebab-case of prototype name

**STATUS.md extended schema:**

```markdown
# Blueprint Status

**State:** draft | committed
**Last committed:** [ISO date or "never"]
**Pending amendments:** [comma-separated list, or "none"]

## Session
**Branch:** prototype/[slug]
**Created:** [ISO date]
```

---

### Feature 4: Agent 3 (Interactions)

**What it is:** The `interaction.md` agent stub is activated. It fetches Figma interaction/state data per section and produces an `INTERACTION.md` spec for the builder to consume.

**Figma MCP reality check:** Watson's existing agents reference `mcp__figma__get_figma_data`. The official Figma MCP server (as of February 2026) does not expose a tool by this name. The available tools are `get_metadata` (sparse XML of layer IDs, names, types, positions, sizes) and `get_design_context` (React+Tailwind rendering output). Watson 1.0 agents were built and validated against `mcp__figma__get_figma_data` — meaning the actual MCP tool available in the Faire environment likely has a different name than the official public server. This is LOW confidence on the exact tool name. **The interaction agent must mirror the same tool-call pattern used in `layout.md` and `design.md` — whatever tool those agents actually call, Agent 3 calls the same tool.**

**What Agent 3 extracts from Figma data:**
Figma's React+Tailwind output includes component variant data (e.g., `Button variant="primary" state="hover"`), conditional rendering patterns, and component names that imply state machines. Agent 3 infers interaction states from:
- Component variant names (Figma "interactive component" variants expose state names: `Default`, `Hover`, `Pressed`, `Disabled`, `Loading`)
- Conditional className patterns in the Tailwind output
- Layer names that follow state-naming conventions (e.g., `Button/Hover`, `Input/Error`)

Figma does NOT reliably expose animation timing or prototype-link transitions via MCP. Agent 3 infers timing from design system conventions (loaded from `libraryPaths`) and documents inferred values explicitly.

**`discuss.md` context pass-through:** If the discuss phase captured interaction specifics in `INTERACTION.md` blueprint file, Agent 3 reads `{blueprintPath}/INTERACTION.md` before fetching Figma data. Pre-gathered discuss context takes precedence over Figma inference for any section detail it covers. Figma inference fills gaps.

**Agent 3 contract (implementing the existing stub):**

```
Inputs:
  nodeId         — section nodeId for Figma state variant inspection
  sectionName    — used to construct output path
  blueprintPath  — reads {blueprintPath}/INTERACTION.md for discuss context
  libraryPaths   — design system book for DS-standard interaction patterns
  watsonMode     — boolean

Output:
  .watson/sections/{sectionName}/INTERACTION.md  (< 50 lines)
  Sections: Visible States, Confirmed/Inferred States, State Transitions, Animation and Timing
```

**Builder change:** `loupe.md` currently passes `interactionPath: null` to the builder. In v1.1, it passes the resolved interaction path (or null if Agent 3 produced no output — fallback behavior already exists in `builder.md` Step 1).

**Dispatch classification:** Background agent (no `AskUserQuestion`). Mirrors layout and design agents.

---

### Feature 5: 3-Agent Parallel Dispatch

**What it is:** Phase 2 of `loupe.md` currently dispatches 2 background agents per section (layout + design). In v1.1, it dispatches 3 (layout + design + interaction).

**Change is confined to `loupe.md` Phase 2 only.**

**Current Phase 2:**
```
For each section where referenceType = "figma":
  Dispatch @agents/layout.md (background)
  Dispatch @agents/design.md (background)
  Wait for both
```

**v1.1 Phase 2:**
```
For each section where referenceType = "figma":
  Dispatch @agents/layout.md (background)
  Dispatch @agents/design.md (background)
  Dispatch @agents/interaction.md (background)  ← NEW
  Wait for all three
```

**Output file check additions:** Phase 3 already handles null paths for missing layout/design outputs. Add analogous check for INTERACTION.md:
- If `INTERACTION.md` is missing after agents complete: pass `interactionPath: null` to builder (already the correct fallback per builder constraints)
- Do not retry interaction agent failure independently — if all three are missing, apply existing "both missing" retry rule

**`interactionPath` in Phase 3 dispatch to builder:**
```
interactionPath: .watson/sections/{section.name}/INTERACTION.md
  (set to null if file is missing after agents completed)
```

**Discuss-only sections:** Unchanged. Discuss-only sections skip Phase 2 entirely. For these sections, `interactionPath` is set to `{blueprintPath}/INTERACTION.md` (the same pattern as layoutPath/designPath for discuss-only sections).

---

## Component Change Summary

| Component | Change Type | What Changes |
|-----------|-------------|--------------|
| `SKILL.md` | Modified | Add `paths` frontmatter; ambient entry detection; draft/commit routing; session management (branch create/switch) |
| `skills/discuss.md` | Modified | Write STATUS.md to `draft` on any blueprint amendment |
| `skills/loupe.md` | Modified | Phase 2: add interaction agent to parallel dispatch; Phase 3: pass `interactionPath` to builder |
| `agents/interaction.md` | New (implements stub) | Full implementation of existing contract stub |
| `blueprint/STATUS.md` | New file per prototype | Draft/commit state + session branch tracking |
| `utilities/watson-init.md` | Modified | Write initial STATUS.md during setup |
| `agents/layout.md` | Unchanged | — |
| `agents/design.md` | Unchanged | — |
| `agents/builder.md` | Unchanged | Already accepts `interactionPath` as optional input |
| `agents/reviewer.md` | Unchanged | — |
| `agents/consolidator.md` | Unchanged | — |
| `agents/decomposer.md` | Unchanged | — |
| `utilities/librarian.md` | Unchanged | — |
| Library books | Unchanged | — |

---

## Data Flow Changes

### Ambient Entry Path (new)

```
User edits src/pages/[prototype]/[file].tsx
    ↓ (paths: frontmatter triggers)
SKILL.md: ambient entry detected
    ↓ read blueprint from parent directory
Setup Detection: find blueprint/ relative to edited file
    ↓
Blueprint state check → Intent Classification (unchanged from here)
```

### Draft/Commit Flow (new)

```
discuss.md: writes ## Discuss Amendments to LAYOUT.md / DESIGN.md / INTERACTION.md
    ↓
discuss.md: writes blueprint/STATUS.md → State: draft, Pending: [file list]
    ↓
[Next session / any Watson invocation]
SKILL.md: reads STATUS.md → surfaces "uncommitted changes" notice
    ↓
User: "commit" / explicit lock-in signal
    ↓
SKILL.md: writes STATUS.md → State: committed, Last committed: [now], Pending: none
```

### 3-Agent Parallel Phase 2 (updated)

```
loupe.md Phase 2: for each figma section
    ↓ dispatch simultaneously
layout.md (background)   design.md (background)   interaction.md (background)
    ↓                         ↓                          ↓
.watson/sections/N/       .watson/sections/N/       .watson/sections/N/
  LAYOUT.md                 DESIGN.md                 INTERACTION.md
    ↓
loupe.md: wait for all three, then verify all three outputs
    ↓
Phase 3: builder receives layoutPath + designPath + interactionPath
```

### Agent 3 Internal Flow

```
interaction.md:
  Step 1: Read libraryPaths for DS-standard interaction patterns
  Step 2: Read {blueprintPath}/INTERACTION.md for discuss context (if exists)
  Step 3: Fetch section data from Figma MCP (same tool as layout.md/design.md)
  Step 4: Extract variant names → map to states
  Step 5: Cross-reference DS patterns from library books
  Step 6: Identify state transitions from conditional rendering patterns
  Step 7: Write INTERACTION.md (< 50 lines)
    Output: Visible States, Confirmed/Inferred States, State Transitions, Animation and Timing
```

---

## Structural Changes to File Tree

```
~/.claude/skills/watson/
├── SKILL.md                         # Modified: paths frontmatter, ambient entry, session mgmt
├── skills/
│   ├── discuss.md                   # Modified: writes STATUS.md on amendment
│   └── loupe.md                     # Modified: 3-agent parallel, interactionPath pass-through
├── agents/
│   ├── decomposer.md                # Unchanged
│   ├── layout.md                    # Unchanged
│   ├── design.md                    # Unchanged
│   ├── interaction.md               # IMPLEMENTED (was stub)
│   ├── builder.md                   # Unchanged
│   ├── reviewer.md                  # Unchanged
│   └── consolidator.md              # Unchanged
├── utilities/
│   └── watson-init.md               # Modified: writes STATUS.md on init

# Per-prototype blueprint adds STATUS.md:
[prototype-dir]/
└── blueprint/
    ├── CONTEXT.md                   # Unchanged
    ├── LAYOUT.md                    # Unchanged
    ├── DESIGN.md                    # Unchanged
    ├── INTERACTION.md               # Unchanged
    └── STATUS.md                    # NEW: draft/commit state + session branch

# Ephemeral staging adds INTERACTION.md per section:
[prototype-dir]/
└── .watson/
    └── sections/
        └── [SectionName]/
            ├── LAYOUT.md            # Unchanged
            ├── DESIGN.md            # Unchanged
            └── INTERACTION.md       # NEW output from interaction agent
```

---

## Architectural Patterns: New and Changed

### Pattern: Paths-Based Ambient Activation

**What:** `SKILL.md` sets `paths: ["src/pages/**/*.tsx", ...]` in frontmatter. Claude Code loads Watson automatically when the user works with matching files.

**When to use:** Prototype directories follow a known pattern (`src/pages/`). This is the case for the Playground.

**Trade-offs:** Reliable file-based trigger vs. description-based trigger. Does not require a hook. Limitation: only triggers when Claude is actively working with a matching file — background awareness is not available. If the user opens a new conversation without touching prototype files, ambient activation does not fire.

**Hardening option:** Add a `UserPromptSubmit` hook that checks `cwd` against known prototype directory patterns and injects `additionalContext` to activate Watson. Use only if path-based activation proves insufficient in practice.

### Pattern: Co-located Blueprint State

**What:** `blueprint/STATUS.md` lives next to `CONTEXT.md`, `LAYOUT.md`, etc. All state about this prototype's draft/commit status and session branch is in one file, in the prototype directory.

**When to use:** State that is per-prototype and must persist across sessions.

**Trade-offs:** No global Watson state file needed; each prototype is self-contained. Downside: STATUS.md must be checked by every Watson entry point (SKILL.md, discuss.md, loupe.md). The check is a single file read — acceptable overhead.

### Pattern: Discuss → STATUS.md Write Contract

**What:** Every time discuss.md writes a `## Discuss Amendments` section to any blueprint file, it immediately writes `STATE: draft` to STATUS.md. This is a hard rule — not optional.

**Why:** Without this rule, the system has no way to know whether blueprint amendments are "new and pending" or "already built." The STATUS.md write is the mechanism that makes the draft/commit distinction reliable.

### Pattern: Interaction Agent as Parallel Peer

**What:** The interaction agent is classified as a background agent (no `AskUserQuestion`) and dispatched in parallel with layout and design agents. It reads the same Figma section nodeId and the same libraryPaths.

**Why:** All three research agents are read-only with respect to the build pipeline. They write to isolated section staging files and have no data dependencies between them. Running them in parallel cuts Phase 2 time by approximately 33% vs. running interaction sequentially.

**Constraint:** The interaction agent must NEVER use `AskUserQuestion`. Ambiguity must be resolved by the discuss subskill (which writes to `{blueprintPath}/INTERACTION.md` before loupe runs) or inferred silently from Figma data. When interaction context is genuinely unknown, the agent writes `_Not determined from available data_` in the relevant section and the builder falls back to library component defaults.

---

## Anti-Patterns: 1.1-Specific

### Anti-Pattern: Writing Draft State to CONTEXT.md Body

**What people do:** Embed "draft" markers inside CONTEXT.md content — `[DRAFT] sidebar width: 280px`.

**Why it's wrong:** CONTEXT.md is a reference document read by agents. Draft markers inside content corrupt the reference. Agents may interpret `[DRAFT]` as part of a decision.

**Do this instead:** CONTEXT.md is immutable content. All draft tracking lives in STATUS.md only.

### Anti-Pattern: Interaction Agent Asking for Clarification

**What people do:** The interaction agent cannot determine if a component has a hover state from Figma data alone, so it asks the user mid-pipeline.

**Why it's wrong:** Background agents cannot use `AskUserQuestion`. The agent hangs silently or produces corrupt output. This is the same as Anti-Pattern 3 from v1.0 but now applies to a new agent.

**Do this instead:** The interaction agent infers from available data and documents uncertainty in the `Confirmed/Inferred States` section with explicit "Inferred — verify" labels. Builder and reviewer handle under-specified interactions using library component defaults.

### Anti-Pattern: Ambient Mode Blocking on Missing Blueprint

**What people do:** On ambient entry, Watson discovers there is no blueprint and immediately runs the full setup flow, interrupting the user's active editing work.

**Why it's wrong:** The user was editing code, not invoking Watson. An interruptive setup flow breaks their flow and creates confusion ("why is my code editor asking me design questions?").

**Do this instead:** On ambient entry with no blueprint, Watson surfaces a single soft prompt: "I can help with this prototype — want me to set it up?" If the user ignores it or says no, Watson stays dormant. Setup only runs on explicit confirmation.

### Anti-Pattern: Git Branch Operations Without Confirmation

**What people do:** On new prototype creation, Watson automatically creates and checks out a branch without asking, treating it as a convenience.

**Why it's wrong:** Silent git operations surprise users. Designers may not be aware they are on a new branch. If they push to the wrong remote or merge unexpectedly, work is lost.

**Do this instead:** Every git operation (checkout, branch create) is preceded by an explicit user confirmation via `AskUserQuestion`. The operation runs only on explicit "yes." The branch name is shown before creation.

---

## Integration Points

### External Services

| Service | Integration | Notes |
|---------|-------------|-------|
| Figma MCP | Interaction agent uses same tool as layout/design agents — `mcp__figma__get_figma_data` (Watson-internal name) | Variant names in Figma React+Tailwind output are the primary source of state data; animation timing is inferred from DS library, not directly exposed by MCP |
| Git (Bash tool) | SKILL.md runs `git checkout -b`, `git checkout` via Bash tool | Always user-confirmed; gracefully skipped if git unavailable |
| Prototype Playground filesystem | `paths` frontmatter glob matches `src/pages/**/*.tsx` | Requires Playground to follow this directory convention; verify before shipping |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| SKILL.md → STATUS.md | Direct file read/write | SKILL.md reads on every entry; writes on commit action |
| discuss.md → STATUS.md | Write only (draft state) | Never reads STATUS.md — routing is SKILL.md's concern |
| loupe.md → interaction.md | Agent dispatch (background) | Same dispatch pattern as layout + design |
| interaction.md → builder.md | `INTERACTION.md` file in `.watson/sections/` | Builder already accepts this path — no builder changes needed |
| loupe.md Phase 3 → builder | `interactionPath` parameter | Currently hardcoded `null`; v1.1 passes resolved path or null |

---

## Suggested Build Order

Dependencies determine order. Each step depends on the ones above.

```
1. artifact-schemas/INTERACTION-EXAMPLE.md  (validate/update schema)
   — Agent 3 must have a canonical schema before implementation
   — Review existing stub contract: matches schema? Extend if needed.

2. blueprint/STATUS.md schema definition
   — Decide exact fields before any file writes it
   — Trivial: 6-8 lines of Markdown schema documentation
   — Output: add STATUS.md template to watson-init.md

3. watson-init.md: write STATUS.md on prototype init
   — Depends on: STATUS.md schema
   — One new write step at end of setup flow

4. SKILL.md: ambient activation + session management
   — Depends on: STATUS.md schema
   — Add paths frontmatter
   — Add ambient entry detection to Setup Detection
   — Add branch create/switch to Setup Flow / Setup Detection
   — Add commit intent routing
   — Add STATUS.md read on entry (uncommitted changes notice)

5. discuss.md: draft state write
   — Depends on: STATUS.md schema
   — One new write after any ## Discuss Amendments write
   — Minimal change — existing amendment logic unchanged

6. agents/interaction.md: full implementation
   — Depends on: INTERACTION-EXAMPLE.md schema (Step 1)
   — Mirror layout.md structure; add discuss context pre-read; add Figma variant extraction
   — Background dispatch classification confirmed

7. skills/loupe.md: 3-agent parallel + interactionPath pass-through
   — Depends on: interaction.md implemented (Step 6)
   — Phase 2: add interaction dispatch
   — Phase 3: pass interactionPath (resolve or null)
   — Discuss-only sections: set interactionPath = {blueprintPath}/INTERACTION.md

8. End-to-end integration test
   — Trigger ambient activation in a prototype directory
   — Run full pipeline: verify 3 agents produce all three section specs
   — Confirm builder receives interactionPath and uses it
   — Confirm STATUS.md is written on discuss amendment and reset on commit
   — Confirm branch creation flow completes without errors
```

**Strict ordering rationale:**
- Schema before agent (Step 1 before Step 6): Agent 3 cannot have a correct output contract without a canonical schema
- STATUS.md schema before all consumers (Step 2 before Steps 3-5): Three components write STATUS.md; they must agree on format before any writes
- interaction.md before loupe.md (Step 6 before Step 7): loupe.md dispatches the agent; the agent must exist before the dispatch is wired
- SKILL.md ambient + session before integration test (Step 4 before Step 8): Ambient entry is the primary test trigger for 1.1 features

---

## Sources

- `/Users/austindick/.claude/skills/watson/SKILL.md` — current master orchestrator (read directly, HIGH confidence)
- `/Users/austindick/.claude/skills/watson/skills/loupe.md` — pipeline orchestrator (read directly, HIGH confidence)
- `/Users/austindick/.claude/skills/watson/skills/discuss.md` — discuss subskill (read directly, HIGH confidence)
- `/Users/austindick/.claude/skills/watson/agents/interaction.md` — existing stub (read directly, HIGH confidence)
- `/Users/austindick/.claude/skills/watson/agents/layout.md` — background agent pattern (read directly, HIGH confidence)
- `/Users/austindick/.claude/skills/watson/agents/builder.md` — builder input contract (read directly, HIGH confidence)
- `/Users/austindick/watson/.planning/PROJECT.md` — Watson 1.1 requirements (read directly, HIGH confidence)
- [Claude Code Skills documentation](https://code.claude.com/docs/en/skills) — `paths` frontmatter, `disable-model-invocation`, ambient activation (WebFetch, HIGH confidence)
- [Claude Code Hooks documentation](https://code.claude.com/docs/en/hooks) — UserPromptSubmit, CwdChanged hooks (WebFetch, HIGH confidence)
- [Skills auto-activation reliability analysis](https://scottspence.com/posts/claude-code-skills-dont-auto-activate) — ~50% auto-trigger rate for description-based activation; paths-based is more reliable (WebFetch, MEDIUM confidence)
- [Figma MCP Tools reference](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/) — official tools list; `mcp__figma__get_figma_data` not in official public API (WebFetch, HIGH confidence — but Watson may use a different MCP configuration)
- [Claude Code Changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) — `paths` YAML list support v2.1.84, `CwdChanged`/`FileChanged` hooks v2.1.83 (WebFetch, HIGH confidence)

---
*Architecture research for: Watson 1.1 — Ambient Mode, Draft/Commit, Session Management, Agent 3, 3-Agent Parallel*
*Researched: 2026-04-01*
