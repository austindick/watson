# Watson Agent Contract Spec

## Overview

This is the canonical enumeration of all Watson agents. It is the source of truth for dispatch parameters, dispatch modes, and output paths. Agent YAML frontmatter mirrors these entries exactly — the two are a mirrored pair, not independently maintained documents. When an agent is ported or built in a later phase, its frontmatter is copied from its registry row here.

---

## Shared Parameters

All agents receive these parameters at dispatch time:

| Parameter | Type | Description |
|-----------|------|-------------|
| blueprintPath | string | Absolute path to prototype's blueprint/ directory |
| libraryPaths | string[] | Pre-resolved chapter/page paths. Subskills read LIBRARY.md and BOOK.md manifests, select relevant chapters based on use_when guidance, and pass resolved paths to agents. Agents never navigate the book hierarchy themselves — they read each path directly. Example: `["${CLAUDE_PLUGIN_ROOT}/skills/watson/library/design-system/global-theme/CHAPTER.md", "${CLAUDE_PLUGIN_ROOT}/skills/watson/library/design-system/components/CHAPTER.md"]` |
| watsonMode | boolean | Suppress interactive prompts when true |

---

## Pipeline Parameters

Additional parameters for loupe pipeline agents only (layout, design, interaction, builder, reviewer, consolidator):

| Parameter | Type | Description |
|-----------|------|-------------|
| sectionName | string | Section name from decomposer output (e.g., "Hero", "Navbar") |

---

## Agent Registry

| Agent | File | Dispatch Mode | Agent-Specific Params | Outputs |
|-------|------|---------------|-----------------------|---------|
| decomposer | agents/decomposer.md | foreground | figmaUrl (string — full Figma frame URL including node-id param) | sections[] JSON inline (each entry: name, nodeId, dimensions, parent?) |
| layout | agents/layout.md | background | nodeId (string — Figma section nodeId from decomposer) | .watson/sections/{sectionName}/LAYOUT.md (< 80 lines) |
| design | agents/design.md | background | nodeId (string — Figma section nodeId from decomposer) | .watson/sections/{sectionName}/DESIGN.md (< 80 lines) |
| interaction | agents/interaction.md | background | nodeId (string), interactionContext? (structured JSON — pre-gathered context from discuss), crossSectionFlows? (array — cross-section flows from discuss) | .watson/sections/{sectionName}/INTERACTION.md (< 50 lines) |
| builder | agents/builder.md | background | layoutPath (string), designPath (string), interactionPath? (string), targetFilePath (string — path to prototype file to modify), sectionScope (string — section name or "all") | modified targetFilePath |
| reviewer | agents/reviewer.md | background | layoutPath (string), designPath (string), sourceFilePath (string — prototype file to review), sectionScope (string) | in-place fixes to sourceFilePath |
| consolidator | agents/consolidator.md | background | sectionsGlob (string — glob path to .watson/sections/ directory) | blueprint/LAYOUT.md, blueprint/DESIGN.md, blueprint/INTERACTION.md |
| librarian | agents/librarian.md | background | mode (enum: generate \| update), sourcePaths (string[] — paths Librarian scans), outputBookPath (string — target library/book/ directory) | library/{book}/BOOK.md + CHAPTER.md files |

---

## Dispatch Mode Notes

### Binary Classification

Dispatch mode is **binary and permanent** per agent. Subskills do not dynamically reclassify agents. The classification is set here and in agent frontmatter and does not change at runtime.

| Mode | Meaning |
|------|---------|
| foreground | Agent may use AskUserQuestion or other interactive tools. Agent may pause execution and wait for user input. |
| background | Agent MUST NOT use any interactive tools. Agent runs to completion without prompting the user. |

### Foreground Agents

- **decomposer** — always foreground. Figma URL is required; if not provided, agent must ask.

### Background Agents

All other agents (layout, design, interaction, builder, reviewer, consolidator, librarian) are always background. They receive all required context via parameters and must not prompt the user.

- **interaction** — always background. Receives all required context via parameters (`interactionContext` from discuss, or `watsonMode=true` in loupe parallel dispatch).

### Interaction Agent Note

The interaction agent always runs as background. When `interactionContext` is provided (from discuss), it writes INTERACTION.md from that context. When dispatched by loupe in parallel mode, `watsonMode=true` is always set.

---

## Error Contract

Agents return raw errors to the dispatching subskill. The subskill (loupe.md, discuss.md) translates errors into non-technical, designer/PM-friendly language before surfacing them to the user.

**Agents never write user-facing messages directly.**

This keeps error vocabulary consistent and ensures designer-facing copy is centralized in subskills rather than scattered across agent files.

---

## Output Path Conventions

### Section-Level Staging (per-section, temporary)

Section-level files are written to `.watson/sections/` colocated inside the prototype directory. They have line budgets enforced:

| File | Path | Line Budget |
|------|------|-------------|
| LAYOUT.md | `{protoDir}/.watson/sections/{sectionName}/LAYOUT.md` | < 80 lines |
| DESIGN.md | `{protoDir}/.watson/sections/{sectionName}/DESIGN.md` | < 80 lines |
| INTERACTION.md | `{protoDir}/.watson/sections/{sectionName}/INTERACTION.md` | < 50 lines |

Section-level files are cleaned up after successful consolidation.

### Consolidated Blueprint (per-prototype, persistent)

Blueprint files live inside the prototype directory at `blueprint/`. They have **no line budget** — they grow as sections accumulate:

| File | Path | Line Budget |
|------|------|-------------|
| CONTEXT.md | `{protoDir}/blueprint/CONTEXT.md` | none |
| LAYOUT.md | `{protoDir}/blueprint/LAYOUT.md` | none |
| DESIGN.md | `{protoDir}/blueprint/DESIGN.md` | none |
| INTERACTION.md | `{protoDir}/blueprint/INTERACTION.md` | none |

CONTEXT.md is written directly to blueprint/ — there is no section-level staging equivalent. It is written holistically by the discuss subskill.
