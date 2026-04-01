# Stack Research

**Domain:** Claude Code skill framework — Watson 1.1 new capabilities
**Researched:** 2026-04-01
**Confidence:** HIGH for platform mechanics (official Claude Code docs); MEDIUM for Figma prototype interaction data (official docs lack specificity); HIGH for git/session patterns

> **Scope note:** This document covers ONLY what is new or changed for Watson 1.1. Validated Watson 1.0 patterns (SKILL.md dispatch, Task/Agent tool, subagent file structure, Figma MCP tool names for design data, parallel layout+design agents, library/book system, blueprint files, AskUserQuestion constraints) are NOT re-researched. See prior STACK.md (2026-03-28) for that baseline.

---

## New Capabilities for Watson 1.1

| Feature | Research focus |
|---------|---------------|
| Ambient mode | Claude Code skill `paths` frontmatter + `description` auto-activation |
| Draft/commit amendment model | Watson-internal convention — no new platform capability needed |
| Session/branch management | Claude Code `--worktree` flag, session naming, session resume |
| Agent 3 (Interactions) | Figma MCP variant/state data availability |
| 3-agent parallel dispatch | Subagent `background` frontmatter + parallel dispatch pattern |

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Claude Code Skills `paths` frontmatter | Current (2026) | Ambient mode — auto-activate watson skill when working in prototype directories | Official field: `paths` accepts glob patterns; skill loads automatically when Claude works with files matching the pattern. Scopes ambient activation to prototype directories without a hook or external script. |
| Claude Code `description` frontmatter (skill) | Current | Secondary ambient trigger — Claude auto-loads skill when prompt matches description | `description` field causes Claude to auto-load full skill content when the prompt is semantically relevant. Combine with `paths` for dual-trigger ambient activation. |
| Claude Code session naming (`/rename`, `--name`) | Current | Session management — name sessions per prototype branch | Sessions are stored per project directory and can be named. `claude -n [name]` at startup or `/rename` mid-session. Session picker shows git branch and allows filtering by branch (`B` key). |
| Claude Code `--worktree` flag | v2.1.50+ | Branch isolation per prototype session | Creates isolated git worktrees per session at `.claude/worktrees/[name]/` with its own branch. Each worktree gets its own branch (`worktree-[name]`). Skills are read from main project root — not duplicated per worktree. |
| Figma MCP `get_design_context` | Current (beta) | Agent 3 — read component variant data from Figma node | Returns structured design representation including variant info for component instances. `componentProperties` on node objects maps property names to types (`VARIANT`, `BOOLEAN`, `TEXT`, `INSTANCE_SWAP`). **Does NOT return prototype interaction triggers or transitions.** |
| Subagent `background: false` (foreground default) | Current | Agent 3 (Interactions) interactive interview — must run foreground | Background agents cannot call `AskUserQuestion` — it fails silently. Agent 3 needs interactive interview when no pre-gathered context exists. Foreground is default; no frontmatter change needed for interactive agents. |
| Subagent parallel dispatch (3 agents) | Current | 3-agent parallel: layout + design + interactions per section | Dispatch all three agents before waiting for any. Layout and design run background. Interactions runs foreground when interview needed, background when pre-gathered context skips the interview. Pattern: dispatch background agents first, then foreground agent; wait for all. |

---

### Ambient Mode: `paths` + `description` Dual Pattern

**Mechanism (HIGH confidence — official docs):**

The `paths` frontmatter field in `SKILL.md` limits automatic activation to files matching glob patterns:

```yaml
---
name: watson
description: Product design and prototyping assistant for Faire's Prototype Playground. Activate when working in prototype directories or when user asks about designing, prototyping, or building a UI.
paths: "src/prototypes/**,src/pages/**"
---
```

When Claude works with files matching `paths`, the skill loads automatically. When `paths` is absent, the skill loads based on `description` semantic match only. Together they give two activation paths:
1. **Directory-based:** Claude opens or edits a file in `src/prototypes/` → watson activates
2. **Prompt-based:** User says "build a prototype" → watson activates via description match

**Integration point:** Watson's current `SKILL.md` trigger line (`Use Watson when the user says "/watson"...`) should be replaced or augmented with `paths` targeting the Playground's prototype directory structure. The `paths` glob must match Faire's actual prototype file locations.

**`disable-model-invocation` is NOT appropriate here:** That field prevents auto-activation entirely. Watson should activate automatically — that is the ambient mode goal.

**Confidence: HIGH** — `paths` field is documented in official Claude Code skills reference with glob pattern syntax.

---

### Draft/Commit Amendment Model: Watson-Internal Convention

**Mechanism:** No new Claude Code platform capability required. This is a behavioral convention implemented in Watson's orchestration logic.

**Pattern:**
- All changes to blueprint files (CONTEXT.md, LAYOUT.md, DESIGN.md, INTERACTION.md) are written as normal file writes (Edit tool).
- "Draft" state = blueprint file exists but has not been explicitly confirmed by user.
- "Commit" state = user explicitly approves; Watson writes a confirmation marker or updates a `status` field in the blueprint.
- Watson checks blueprint status fields before dispatching agents — avoids rebuilding sections that are already committed.

**Why no git commit per amendment:** Watson 1.1 operates within a single prototype branch. Blueprint file state is the amendment record. Git commits are session-level, not blueprint-level. Forcing a git commit per blueprint change adds complexity with no benefit — the Edit tool already tracks file versions through session history.

**Confidence: HIGH** — this is a design decision, not a capability gap. The platform supports all necessary file operations.

---

### Session Management: Worktree + Session Naming

**Worktree isolation pattern (HIGH confidence — official docs):**

```bash
# User creates new prototype session
claude --worktree my-prototype-name
# Creates: .claude/worktrees/my-prototype-name/ on branch worktree-my-prototype-name
```

Worktrees are created at `<repo>/.claude/worktrees/<name>/`. Skills (including Watson) are read from the main project root — not duplicated per worktree. Blueprint files in `.watson/blueprint/` live in the worktree, isolating each prototype session's state.

**Session naming pattern:**
- `claude -n [prototype-name]` names the session at startup
- `/rename [prototype-name]` renames mid-session
- `claude --resume [prototype-name]` resumes a named session later
- Session picker (`claude --resume`) filters by branch (`B` key) — shows sessions linked to current worktree branch

**Watson session detection flow:**
1. Orchestrator checks if current directory is a worktree (`git worktree list`)
2. If in a worktree: extract branch name → derive prototype name
3. If not in a worktree: check `.watson/blueprint/CONTEXT.md` for prototype identity (existing 1.0 flow)

**For NEW prototype sessions in Watson 1.1:**
Watson's Setup Flow should offer to create a worktree. Workflow:
1. User says "new prototype"
2. Watson collects prototype name
3. Watson uses Bash tool: `git worktree add .claude/worktrees/[name] -b watson-proto-[name]`
4. Watson names the session: `/rename [name]` (or instructs user)
5. Prototype work proceeds in isolated branch

**For EXISTING prototype sessions:**
`claude --resume [name]` picks up the session. If `blueprint/CONTEXT.md` exists and has content, Watson treats as returning user (existing 1.0 detection logic carries forward).

**Worktree cleanup:** When session ends with no changes, worktree + branch auto-delete. When changes exist, user is prompted to keep or remove. Watson should document the cleanup flow in its Session Management section.

**`.worktreeinclude` for environment files:**

```text
# .worktreeinclude at repo root
.env
.env.local
```

Place in Playground repo root so `.env` copies to each worktree automatically.

**Confidence: HIGH** — Claude Code `--worktree` is documented with exact behavior including auto-cleanup, branch naming, and skills-read-from-root behavior.

---

### Agent 3 (Interactions): Figma State Data Availability

**What Figma MCP CAN provide (MEDIUM confidence — official tool list, partial docs):**

`get_design_context` returns structured design representation for a node. The Figma REST API (which underlies MCP) exposes `componentProperties` on component instances: a map of property names to types (`VARIANT`, `BOOLEAN`, `TEXT`, `INSTANCE_SWAP`). `variantProperties` (deprecated, still functional) gives variant key-value pairs like `{State: "hover", Size: "lg"}`.

This means Agent 3 CAN:
- Read which variants exist on a component node (e.g., Button has `State: default|hover|pressed|disabled`)
- Read the current variant state rendered in the Figma frame
- Infer what states the designer intended to show (visible states)
- Infer additional states by examining all variant options on the component set

**What Figma MCP CANNOT provide (MEDIUM confidence — multiple sources confirm):**

Figma MCP does NOT return prototype interaction data: triggers, transitions, animation curves, or interaction flows between frames. The official Figma MCP docs lack a field for `reactions` (the Figma REST API field for prototype interactions). One search result explicitly noted: "MCP can't read prototype interactions."

This is a firm architectural constraint: Agent 3 must infer interaction intent from variant data and design context — it cannot read Figma prototype connections.

**Agent 3 data access strategy:**

```
Available from Figma MCP:
- componentProperties: variant states visible in the design (default, hover, disabled, selected, etc.)
- variantProperties: exact variant values on each instance
- get_design_context: component structure, nested variants

Must be inferred / gathered interactively:
- Transitions and animation timing (not in Figma MCP)
- State machine logic (which states transition to which)
- Hover/focus/loading/error states not rendered in the design
- Complex multi-step interactions
```

**Input from discuss subskill:** When discuss has already captured interaction intent in `CONTEXT.md` (`## Interactions` and `## States` sections), Agent 3 reads these sections and skips the interactive interview entirely. This is the `interactionContext` parameter in the agent stub — pre-gathered context from discuss.

**Figma MCP tool to use:** `get_design_context` for the section node. This returns component structure with variant information. Supplemented by `get_metadata` for node IDs of variant sibling frames if available.

**Confidence: MEDIUM** — official Figma MCP tool list is verified; `get_design_context` returning variant data is verified from Figma Plugin API docs (`componentProperties`, `variantProperties`). Prototype interaction data NOT being available is confirmed by multiple sources but not via a single definitive official statement.

---

### 3-Agent Parallel Dispatch

**Current state (Watson 1.0):** Layout and design agents dispatch in parallel (background). Interactions agent was deferred. Builder waits for all agents before starting.

**Watson 1.1 change:** Add interactions agent to the parallel batch. Three agents dispatch simultaneously per section.

**Dispatch pattern (HIGH confidence — official subagent docs):**

```
For each section:
  1. Dispatch layout agent (background: true)
  2. Dispatch design agent (background: true)
  3a. IF interactionContext provided (from discuss):
       Dispatch interactions agent (background: true)
  3b. IF no interactionContext:
       Dispatch interactions agent (foreground — needs AskUserQuestion)

Wait for ALL three agents before dispatching builder.
```

**Background agent constraint (HIGH confidence):** Background agents auto-deny `AskUserQuestion` — it does not fail with an error, it just silently skips. If interactions agent needs interactive interview, it MUST run foreground. This is the `watsonMode` flag pattern from 1.0: when `watsonMode: true` AND `interactionContext` is provided, interactions can run background. When `watsonMode: true` AND no `interactionContext`, interactions must run foreground and the other two agents run in parallel background.

**Why foreground interactions + background others works:** Foreground blocks the main conversation but background agents run concurrently during that block. The user sees the interactions interview while layout and design agents work simultaneously. This is the most efficient path when interactive interview is required.

**Subagent `isolation: worktree` is NOT needed here:** Watson agents write to `.watson/sections/[sectionName]/` paths that are section-scoped — no file conflicts between agents working on the same section's different artifact types (LAYOUT.md vs DESIGN.md vs INTERACTION.md). Worktree isolation adds overhead not justified by this use case.

**Confidence: HIGH** — parallel background dispatch is validated from Watson 1.0 (layout + design). Adding a third agent follows the same pattern. Background/foreground mode decision is documented in official Claude Code subagent docs.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `paths` frontmatter for ambient activation | `CwdChanged` hook with bash script | Use `CwdChanged` if `paths` glob patterns can't cover the activation condition (e.g., conditional logic based on file content). For directory-based activation, `paths` is cleaner and requires no external script. |
| `paths` + `description` dual trigger | `UserPromptSubmit` hook running every prompt | `UserPromptSubmit` can enforce skill activation but adds overhead on every prompt. Use for enforcement; `paths` + `description` is sufficient for ambient suggestion. |
| Watson-internal draft/commit convention (file status field) | Git commits per blueprint change | Git commits per blueprint change would clutter commit history with intermediate states. Blueprint is a spec, not a commit-worthy artifact on every edit. |
| `--worktree` flag for session isolation | Feature branches without worktrees | Use feature branches without worktrees if the team doesn't want isolated working directories. Worktrees are optional; session naming (`--name`) provides session management without worktree overhead. |
| Figma `componentProperties` + `variantProperties` for state inference | Full prototype interaction export | Prototype interactions are not available via Figma MCP — this is not an alternative, it is a hard constraint. Inference from variants is the only Figma-based option. |
| Foreground interactions + background layout/design in parallel | All three foreground sequential | Sequential foreground is 3x slower. Parallel background + foreground interactions is optimal. Only fall back to sequential if the user's request explicitly requires layout output before interaction interview. |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| External scripts or CLIs for ambient activation | Watson constraint: purely Claude Code skill files, no external tooling | `paths` frontmatter in SKILL.md |
| `isolation: worktree` on section-scoped agents | Section agents write to non-overlapping paths — worktree isolation adds 2–5s overhead per agent with zero benefit | No `isolation` field; agents share the main worktree |
| Figma prototype interaction fetching | Not available via Figma MCP. Attempting to fetch `reactions` field will return nothing or fail. | Infer states from `componentProperties`/`variantProperties`; supplement with discuss-gathered context |
| `disable-model-invocation: true` on main watson SKILL.md | This would prevent ambient auto-activation, defeating the purpose of Watson 1.1's ambient mode | `paths` + `description` for controlled auto-activation |
| Git commit per blueprint draft | Pollutes commit history; blueprint drafts are not ship-worthy artifacts | Watson-internal `status` field in blueprint files |
| AskUserQuestion in background interactions agent | Fails silently — silent data loss in the pipeline | Foreground interactions agent when interview is needed |
| Nested subagent spawning within interactions agent | Platform hard limit: subagents cannot spawn subagents | Interactions agent is dispatched from the loupe subskill orchestrator, not from another agent |

---

## Stack Patterns by Variant

**If user opens a file in `src/prototypes/`:**
- Watson skill auto-activates via `paths` glob match
- SKILL.md reads current directory context
- Checks for `blueprint/CONTEXT.md` to classify as new/returning
- Proceeds with ambient Setup Flow or Intent Classification

**If no Figma URL and discuss has populated CONTEXT.md:**
- Interactions agent receives `interactionContext` from CONTEXT.md
- Runs background (no interview needed)
- All three research agents dispatch simultaneously

**If Figma URL present and no prior discuss:**
- Interactions agent runs foreground (interview needed)
- Layout and design agents dispatch background concurrently with the interview
- After interview completes, interactions agent writes INTERACTION.md
- Builder waits for all three outputs

**If user creates a new prototype:**
- Watson offers worktree creation (via Bash: `git worktree add`)
- Session named after prototype
- Blueprint directory initialized in the worktree
- Work isolated from main branch

**If user resumes existing prototype:**
- `claude --resume [prototype-name]` restores session
- Watson checks `blueprint/CONTEXT.md` for state
- Returning user flow applies

---

## Version Compatibility

| Component | Version / Notes |
|-----------|----------------|
| `paths` frontmatter in SKILL.md | Current Claude Code (2026) — official feature |
| `disable-model-invocation` field | Current — use to block auto-activation when needed (NOT for watson main skill) |
| `--worktree` flag | Claude Code v2.1.50+ — confirmed available |
| Session `--resume` by name | Current — sessions stored per project directory |
| Subagent `background: true` | Current — background agents cannot call AskUserQuestion (validated) |
| Figma `componentProperties` / `variantProperties` | Available via Figma REST API and surfaced through `get_design_context` MCP tool |
| Figma prototype interaction data (`reactions`) | NOT available via Figma MCP — confirmed across multiple sources |
| `Task` vs `Agent` tool name | Renamed to `Agent` in Claude Code v2.1.63; `Task(...)` alias still works. Watson uses `Task` for consistency with existing agents. |
| `isolation: worktree` on subagents | Available but NOT recommended for Watson section agents (no file conflict risk) |

---

## Sources

- [Claude Code Skills documentation](https://code.claude.com/docs/en/skills) — `paths` frontmatter, `description` auto-activation, `disable-model-invocation`, `context: fork` patterns (HIGH confidence — official docs, fetched 2026-04-01)
- [Claude Code Sub-agents documentation](https://code.claude.com/docs/en/sub-agents) — `background` frontmatter, `isolation: worktree`, foreground/background behavior, AskUserQuestion in background agents (HIGH confidence — official docs, fetched 2026-04-01)
- [Claude Code Common Workflows](https://code.claude.com/docs/en/common-workflows) — `--worktree` flag, session naming, `--resume`, worktree cleanup behavior, skills-from-main-root behavior (HIGH confidence — official docs, fetched 2026-04-01)
- [Claude Code Hooks reference](https://code.claude.com/docs/en/hooks) — `CwdChanged`, `SessionStart`, hook configuration format (HIGH confidence — official docs, fetched 2026-04-01)
- [Figma MCP Server Guide (GitHub)](https://github.com/figma/mcp-server-guide) — tool list: `get_design_context`, `get_metadata`, `get_variable_defs` (MEDIUM confidence — official guide but lacks detailed field documentation)
- [Figma Developer Docs: MCP Tools](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/) — tool names and purposes; prototype interaction data confirmed absent (MEDIUM confidence — official but incomplete field documentation)
- [Figma Plugin API: variantProperties](https://developers.figma.com/docs/plugins/api/properties/nodes-variantproperties/) — confirms variant state data is available per node (HIGH confidence — official API reference)
- [Figma Plugin API: componentProperties](https://developers.figma.com/docs/plugins/api/ComponentProperties/) — confirms VARIANT, BOOLEAN, TEXT, INSTANCE_SWAP types available on component instances (HIGH confidence — official API reference)
- WebSearch findings: "MCP can't read prototype interactions" — confirmed by LogRocket blog and multiple community sources (MEDIUM confidence — multiple sources, no single definitive official statement)
- `/Users/austindick/.claude/skills/watson/SKILL.md` — current Watson 1.0 SKILL.md structure; ambient mode must extend, not replace (HIGH confidence — live file)
- `/Users/austindick/.claude/skills/watson/agents/interaction.md` — deferred Agent 3 stub with contract interface (HIGH confidence — live file)

---

*Stack research for: Watson 1.1 — ambient mode, draft/commit model, session management, Agent 3 (Interactions), 3-agent parallel dispatch*
*Researched: 2026-04-01*
