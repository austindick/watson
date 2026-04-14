---
name: think
description: "Design thinking partner grounded in library books -- explore layout, components, and interactions before building. Use when exploring design decisions or discussing prototype approach."
---

# /think

Standalone design discussion skill for the Design Toolkit. Explore layout, components, and interactions grounded in library books (design-system, playground-conventions). Persists all decisions to the PRD (CONTEXT.md).

**This file is the orchestration layer.** Detailed behavior lives in @references/ files.

## Inputs

| Parameter | Type | Description |
|-----------|------|-------------|
| blueprintPath | string | Absolute path to prototype's blueprint/ directory (provided by caller or resolved in Phase -1) |
| figmaUrl | string or null | Figma URL from user's message (optional) |
| describeOnly | boolean | When true: skip Phase -1, load codebase-map, run Complexity Scaling on description directly |

## Phase -1: Standalone Setup (only when blueprintPath not provided)

1. Find blueprint: `find . -path '*/blueprint/STATUS.md' -maxdepth 4 -not -path './.git/*' 2>/dev/null | head -1` — walk up to 3 parents if not found
2. If on a `dt/*` branch with no result, try full-depth find
3. If still not found: AskUserQuestion — header: "Blueprint", question: "No blueprint found. Create one here and start discussing?", options: ["Yes, create blueprint here", "Let me specify a path", "Cancel"]
4. Set `blueprintPath` to discovered/created directory
5. Conditional activation: if on `dt/*` branch, write `/tmp/dt-active.json` with `{"branch": "{current_branch}", "actions": []}`

## On Activation

Output header: `Design Toolkit ► Design Discussion`

Append "discussed {topic}" to `/tmp/dt-active.json` actions array via Edit tool (skip silently if absent).

## Phase 0: Library Loading

Read `${CLAUDE_PLUGIN_ROOT}/skills/core/library/LIBRARY.md`. Load `playground-conventions` immediately. Load `design-system` on-demand when conversation touches components/tokens/variants. If `describeOnly` is true: also load codebase-map (all chapters) for hybrid surface detection. **Never improvise component names** — all names come from loaded books.

## Phase 1: Blueprint State Reading

Read CONTEXT.md, LAYOUT.md, DESIGN.md, INTERACTION.md at `{blueprintPath}/`. Detect template vs populated content. Adapt opening: fresh start → broad scenario question; populated CONTEXT.md → reference decisions, skip scenario; real content + `src/` exists → mid-build (see @references/mid-build.md).

## Phase 2: Complexity Scaling

- **Clearly simple** (empty page, one-component demo): skip discussion, minimal library grounding, write CONTEXT.md, return status. In describeOnly mode: still run Discuss-Only Build Path to write LAYOUT.md + DESIGN.md before returning `ready_for_build`.
- **Clearly complex** (multi-step flow, data tables, complex interactions): full conversation via @references/questioning-flow.md. In describeOnly: abbreviated (Phases 5-6 only), then Discuss-Only Build Path, return `ready_for_build`.
- **Ambiguous**: AskUserQuestion — header: "Approach", question: "Want to think through the design first, or should I just start building?", options: ["Think it through first", "Just start building"]. In describeOnly: header: "Depth", options: ["Think through it first", "Just build with this description"].

Mid-build modifier: existing blueprint decisions reduce question count naturally.

## Conversation Flow

- Full conversation engine: load **@references/questioning-flow.md** — AskUserQuestion discipline, gentle challenges, core questions, contextual questions, pattern research
- Mid-build re-entry: load **@references/mid-build.md** — hybrid intent detection, question reduction, summary/confirmation
- Blueprint writes and handoff: load **@references/blueprint-writing.md** — CONTEXT.md writes, surgical amendments, discuss-only build path, reference inventory, ready-to-build detection, return status schema

## Handoff

When discussion reaches build-readiness and user confirms "Let's build":
- Standalone invocation: display "Ready to build -- run `/design` to start." Do NOT dispatch /design.
- Dispatched by core SKILL.md: return status JSON to core for design discussion -> build chain.

## Constraints

- /think does NOT dispatch /design, loupe, or any agent — it returns status or suggests /design
- After standalone invocation, user's next message routes through the ambient core skill
- No MCP calls, no agent dispatches — only @references/ file dispatches
- All component names from library books. Never improvise.
- All blueprint writes use Edit tool (never Write except initial scaffold), per @shared/references/blueprint-contract.md
