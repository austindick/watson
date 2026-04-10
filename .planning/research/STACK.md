# Stack Research

**Domain:** Multi-mode design reference input — Watson v1.4
**Researched:** 2026-04-09
**Confidence:** HIGH for code analysis patterns and tool availability; MEDIUM for screenshot/image in agent context

> **Scope note:** This document covers ONLY what is needed for Watson v1.4 (source reader agent, codebase-map book, pipeline generalization, discussion-only build path, optional screenshot support). The existing Watson stack (Claude Code plugin, Figma MCP, Slate design system, library system, pipeline agents) is validated and NOT re-researched. See STACK.md dated 2026-04-02 for plugin packaging baseline.

---

## Core Constraint: No External Dependencies

Watson is purely Markdown skill files. No npm packages, no scripts, no CLIs, no AST parsers, no build tooling. Every technique described here operates entirely within Claude Code's native tools: Read, Grep, Glob, Bash, Write, Edit. This constraint is non-negotiable and shapes every technical decision below.

---

## Code Analysis: The Applicable Technique Stack

The source reader agent must extract design-relevant structure from React/TypeScript files — component names, prop interfaces, token usage, layout patterns — without external AST tooling. Claude Code provides three native tools that together cover the full extraction surface:

### Tool 1: Grep — Pattern-Based Extraction (Primary)

**Purpose:** Extract structural signatures from TypeScript source files using regex patterns.

**Why primary:** Grep uses ripgrep's parallel processing and regex engine, making it the fastest path for targeted extraction. Unlike a full AST parse, Grep extracts exactly what is design-relevant (exports, interfaces, token references, component names) without loading entire files into context.

**Patterns the source reader agent will use:**

| Target | Pattern | Rationale |
|--------|---------|-----------|
| Named component exports | `export (default )?function [A-Z]\w+` or `export const [A-Z]\w+ =` | PascalCase identifies React components by convention |
| TypeScript interface/type blocks | `(interface\|type) \w+Props` | Props types are the component contract |
| CSS token variable references | `var\(--[a-z][^)]+\)` | Identifies token usage in inline styles or CSS-in-JS |
| Slate import lines | `from ['"]@faire/slate` | Surfaces which Slate components a file uses |
| className patterns with token utilities | `className=\{[^}]+\}` | Reveals composition patterns |
| JSX structure (opening tags) | `<[A-Z]\w+[\s/>]` | Identifies component instances in render |

**Confidence:** HIGH — Grep is a first-class Claude Code tool, ripgrep-backed, available in all agents.

### Tool 2: Read — File Content Inspection (Secondary)

**Purpose:** Load specific files for structural analysis after Grep has identified them.

**Why secondary (not primary):** Reading entire source files loads raw implementation noise — import statements, business logic, event handlers, test utilities — that is irrelevant to design reconstruction. Read is used selectively: after Grep identifies candidate files, Read loads specific files to extract interface bodies, prop tables, and component composition trees.

**When the source reader uses Read:**
- Read the identified component file to extract the full Props interface body (types, required/optional, defaults)
- Read `index.ts` or barrel files to understand the exported surface of a directory
- Read token/variable definition files to confirm CSS custom property names and values
- Read `package.json` at the monorepo root and package level to orient the directory structure

**Image file support (screenshot path):** The Read tool supports PNG and JPG files, displaying them visually to the agent. This is confirmed in Claude Code documentation. This enables the optional screenshot support path: user pastes a screenshot path, the source reader agent reads it via Read tool and extracts visual layout signals. However, this depends on the running agent having vision capabilities — it works in foreground/interactive context. MEDIUM confidence for reliable agent-autonomous image reading (see Screenshot Support section below).

**Confidence:** HIGH for text files; MEDIUM for autonomous image reading in background agents.

### Tool 3: Glob — Directory Navigation (Tertiary)

**Purpose:** Discover file structure and locate relevant source files without reading them.

**Why tertiary:** Glob returns file paths sorted by modification time, making it the right first step for monorepo orientation. The source reader uses Glob to answer "where are the components?" before using Grep to extract from them.

**Glob patterns for monorepo navigation:**

| Purpose | Pattern |
|---------|---------|
| Find all component files in a package | `packages/{name}/src/**/*.tsx` |
| Find token/variable files | `**/{tokens,variables,theme}.{ts,css}` |
| Find index/barrel exports | `packages/{name}/src/**/index.ts` |
| Find a specific component by name | `**/{ComponentName}/{ComponentName}.tsx` |
| Find page-level components | `apps/web/src/pages/**/*.tsx` |

**Confidence:** HIGH — Glob is a first-class Claude Code tool.

---

## Monorepo Navigation: The Codebase-Map Book

The codebase-map book answers "where does what live in faire/frontend?" for the source reader agent. Without it, every source reader invocation would re-navigate the full monorepo — slow, expensive, inconsistent.

**Pattern: same as the design-system book, different content.**

The Librarian generates codebase-map using its existing scanning infrastructure. The book structure adapts the "Other source-derived books" rule from source-scanning.md: top-level packages become chapters, each chapter documents the package's exported component surface, token files, and notable conventions.

**Book structure:**

```
library/codebase-map/
├── BOOK.md                     # manifest + source_hash for freshness detection
├── monorepo-overview/
│   └── CHAPTER.md              # Top-level: apps/, packages/, tools/ structure; workspace manager; key paths
├── slate-source/
│   └── CHAPTER.md              # @faire/slate package: where components live, export paths, token file locations
├── feature-packages/
│   └── CHAPTER.md              # Feature packages (e.g., @faire/orders, @faire/brand-portal): paths, key screens
└── shared-utilities/
    └── CHAPTER.md              # Shared hooks, utilities, type definitions
```

**What the source reader reads from codebase-map:**
- monorepo-overview: resolves `@repo` prefix paths to absolute filesystem paths
- slate-source: finds CSS token files, component source directories
- feature-packages: finds the specific experience to clone

**Librarian invocation:**
```
mode: generate
sourcePaths: ["@repo/packages/", "@repo/apps/web/src/", "@repo/package.json"]
outputBookPath: "${CLAUDE_PLUGIN_ROOT}/library/codebase-map/"
```

The `@repo` prefix resolves to the monorepo root at Librarian runtime — consistent with the existing `@repo prefix for source paths` convention documented in memory `project_watson_plugin.md`.

**Source hash freshness:** Librarian's existing update mode + source_hash detection handles staleness. The codebase-map book is regenerated by the maintainer when monorepo structure changes materially (new packages, significant restructuring). Not per-session — same pattern as the design-system book.

**Confidence:** HIGH — extends proven Librarian book generation pattern.

---

## Pipeline Generalization: Normalized Section Contract

The existing pipeline contract passes `nodeId` (Figma) to layout, design, and interaction agents. Generalizing to multi-mode requires replacing `nodeId` with a `referenceType` discriminator + source-specific fields. The loupe.md already partially anticipates this with `referenceType: "figma"` vs `"discuss-only"` in the current v1.3 code.

**Normalized section entry (replaces Figma-only contract):**

```json
{
  "name": "Hero",
  "referenceType": "figma" | "prod-code" | "discuss-only",

  // figma only:
  "nodeId": "42-17",
  "dimensions": { "width": 1440, "height": 500 },

  // prod-code only:
  "sourceFilePath": "/abs/path/to/HeroSection.tsx",
  "screenshotPath": "/abs/path/to/hero-screenshot.png",  // optional, user-provided

  // discuss-only: no additional fields (blueprint files are the source)
}
```

**Pipeline behavior by referenceType:**

| Phase | figma | prod-code | discuss-only |
|-------|-------|-----------|--------------|
| Decompose | decomposer.md runs | source-reader.md runs | skip — blueprint is source |
| Layout research | layout.md (Figma) | layout.md reads sourceFilePath | skip |
| Design research | design.md (Figma) | design.md reads sourceFilePath | skip |
| Interaction research | interaction.md (Figma) | interaction.md reads sourceFilePath | skip |
| Build | builder.md | builder.md | builder.md reads blueprint |
| Review | reviewer.md | reviewer.md | reviewer.md |

**Why this shape (not a richer object):** The downstream agents (layout, design, interaction) already accept null paths gracefully. Adding `sourceFilePath` as an alternative to `nodeId` requires minimal changes to each agent — they check which field is present and use the appropriate fetch path. The discriminator keeps the logic clean without proliferating optional fields.

**Confidence:** HIGH — follows existing contract extension pattern validated across v1.0–v1.3.

---

## Source Reader Agent: What It Extracts

The source reader agent reads prod code and writes the same LAYOUT.md + DESIGN.md + INTERACTION.md files that the Figma-path agents write. The downstream pipeline (builder, reviewer, consolidator) is unchanged.

**Extraction targets and methods:**

| Output file | What to extract from source | How |
|-------------|----------------------------|-----|
| LAYOUT.md Component Tree | JSX structure, component nesting from render | Read the file, parse JSX tree mentally, map to ASCII tree |
| LAYOUT.md Annotated CSS | className props, inline style objects, CSS module imports | Grep for className, Read file for style values, map to tokens |
| DESIGN.md Component Mapping | Slate component imports and usage | Grep for `from '@faire/slate'` imports, cross-reference with design-system book |
| DESIGN.md Color Tokens | `var(--token-*)` references in styles | Grep for CSS variable references |
| DESIGN.md Typography | text-related classNames, font utilities | Grep for typography class patterns |
| INTERACTION.md | onClick handlers, disabled props, loading states | Grep for handler patterns, Read for component prop values |

**Key insight: this is a translation problem, not a parsing problem.** The source reader does not need a true AST — it needs to produce the same 80-line structured spec that a layout/design agent produces from Figma. The LLM's ability to read TypeScript naturally and summarize into the fixed schema is the actual mechanism. Grep and Glob are navigation tools, not parsers; Read loads context for the LLM to reason over.

**Line budget:** Same as existing research agents — LAYOUT.md under 80 lines, DESIGN.md under 80 lines, INTERACTION.md under 50 lines. The source reader enforces these budgets using the same compression rules (Step 9 in layout.md, Step 10 in design.md).

**Confidence:** HIGH — the mechanism is Claude's native code reading capability plus existing agent schemas.

---

## Screenshot Support

**What it enables:** User provides a screenshot path when cloning a prod experience. The source reader uses it to verify layout assumptions (viewport width, section boundaries, visual hierarchy) rather than relying solely on code structure.

**How it works (two paths):**

**Path 1: User-pasted (foreground, recommended):** In the multi-mode entry selection flow (loupe.md standalone or SKILL.md dispatch), the user optionally pastes a screenshot path. The source reader agent receives `screenshotPath` as a parameter and calls Read on it. Since the multi-mode entry runs in foreground context with a user present, vision capabilities are available. The agent describes what it sees and uses it to validate/supplement the code-extracted component tree.

**Path 2: Agent-autonomous (background, lower confidence):** If screenshotPath is passed to a background agent (layout.md or the source reader in parallel dispatch), the Read tool should still display the image — the agent model has vision. However, GitHub issue #30925 was closed as "not planned" in April 2026, suggesting this path may not be reliable in all background agent configurations. Treat as opportunistic: if Read returns a visual for the agent, use it; if Read returns an error or binary marker, skip the screenshot path silently and proceed with code-only extraction.

**No automated screenshot acquisition:** SSO/auth complexity in faire.com prevents automated capture (explicitly listed as out of scope in PROJECT.md). The user provides the screenshot manually. Watson's job is to use it if provided.

**Confidence:** MEDIUM for agent-autonomous image reading; HIGH for user-provided-path + foreground agent reading.

---

## Discussion-Only Build Path

**What it needs from the stack:** Nothing new. This path was partially anticipated in the existing loupe.md (`referenceType: "discuss-only"` sections skip Phase 2 entirely and route directly to builder with blueprint files as source). The only addition is making this a first-class entry mode in the multi-mode selection flow.

**Slate-groundedness:** The existing design-system book and playground-conventions book provide all the library context needed for a discuss-only build. The builder reads these books via `libraryPaths[]` exactly as it does in the Figma-path builds. No additional stack additions.

**Confidence:** HIGH — the mechanism is validated in existing loupe.md code.

---

## Recommended Stack Additions

### New Agent

| Component | File | Dispatch Mode | Purpose |
|-----------|------|---------------|---------|
| source-reader | `agents/source-reader.md` | background | Reads prod React/TypeScript code, writes LAYOUT.md + DESIGN.md + INTERACTION.md to `.watson/sections/{sectionName}/` |

### New Library Book

| Book | Path | Generated By | Freshness |
|------|------|--------------|-----------|
| codebase-map | `library/codebase-map/` | Librarian (generate mode) | Maintainer-run on material monorepo change; same pattern as design-system book |

### Modified Components

| Component | Change |
|-----------|--------|
| `skills/loupe.md` | Add multi-mode entry flow (AskUserQuestion for reference type), source-reader dispatch path, normalized section contract |
| `agents/decomposer.md` | Scope role: becomes figma-specific only (or renamed to figma-decomposer); source-reader handles prod-code decompose |
| `agents/layout.md` | Accept `sourceFilePath` as alternative to `nodeId`; add code-reading execution path |
| `agents/design.md` | Accept `sourceFilePath` as alternative to `nodeId`; add code-reading execution path |
| `agents/interaction.md` | Accept `sourceFilePath` as alternative to `nodeId`; add code-reading execution path |
| `references/agent-contract.md` | Add source-reader to registry; update shared parameters with `referenceType` |
| `library/LIBRARY.md` | Add codebase-map book entry |

### No Changes Required

| Component | Why |
|-----------|-----|
| `agents/builder.md` | Receives same LAYOUT.md/DESIGN.md/INTERACTION.md regardless of source type |
| `agents/reviewer.md` | Same — reviews prototype code against spec files |
| `agents/consolidator.md` | Same — consolidates section specs into blueprint |
| `agents/librarian.md` | Uses existing infrastructure; codebase-map is a new book, not a new capability |
| `skills/discuss.md` | No change — discuss already writes blueprint files that loupe reads |
| `library/design-system/` | No change |
| `library/playground-conventions/` | No change |

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Grep + Read + LLM reasoning as "AST" | External AST parser (tree-sitter, babel, TypeScript compiler API) | Watson has no external deps. External parsers require installation, versioning, execution environment. Grep + LLM achieves the same design-relevant extraction. |
| Librarian generates codebase-map book | Source reader navigates monorepo fresh each invocation | Per-invocation navigation is slow, expensive, and inconsistent across sessions. Book pattern is proven and already used for design-system reference. |
| Source reader produces same 3 spec files as Figma agents | Source reader produces a different "source spec" format | Using same output format means zero changes to builder, reviewer, consolidator — they already handle LAYOUT.md/DESIGN.md/INTERACTION.md. New format would require pipeline surgery. |
| `referenceType` discriminator in section entry | Separate pipeline branches for each mode | Discriminator keeps a single pipeline that routes by type. Separate branches would duplicate the build/review/consolidate phases. |
| Source reader as standalone background agent | Inline code reading within layout/design/interaction agents | Separate agent has its own context window (avoids polluting layout agent with raw source code). Consistent with Watson's "one focused task per agent" architecture principle. |
| Manual codebase-map maintenance | Automated freshness detection at pipeline start | Automated detection would require Bash commands on the monorepo root at runtime — fragile in a Markdown-only system. Maintainer-run regeneration is the same model as the design-system book (proven). |

---

## What NOT to Build

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| External AST parser integration | Violates "no external deps" constraint. Adds installation/versioning complexity. Not necessary — LLM reasoning over Grep output achieves design-relevant extraction. | Grep patterns + Read + LLM extraction |
| Automated screenshot acquisition | faire.com requires SSO/auth; explicitly out of scope in PROJECT.md. | User-provided screenshot path |
| Inline CSS/Tailwind class parser | Over-engineering. The design agents already map tokens from Figma values; same approach works from CSS class strings. | Grep for class patterns + Read + token lookup from design-system book |
| Per-session codebase-map regeneration | Makes every Loupe invocation dependent on monorepo file system. Slow. Breaks if monorepo is not mounted. | Static codebase-map book, maintainer-regenerated |
| "Smart" component name inference across packages | High hallucination risk. If the source reader can't find a component, it should say so — not infer. | Explicit Grep + path-based lookup |
| A fourth `referenceType` for "screenshot-only" | Out of scope for v1.4. Screenshots supplement code reading, not replace it. | User provides both screenshot + source path (or neither) |

---

## Confidence Assessment

| Area | Confidence | Source |
|------|------------|--------|
| Grep/Read/Glob as code analysis primitives | HIGH | Official Claude Code documentation; confirmed in this conversation's tool descriptions |
| Codebase-map book via Librarian | HIGH | Extends validated Librarian infrastructure; no new capability required |
| Normalized section contract (referenceType) | HIGH | Consistent with existing contract extension patterns; loupe.md already has partial implementation |
| Discussion-only build path | HIGH | Already implemented in loupe.md; first-class entry is additive only |
| Screenshot support via Read tool (foreground) | MEDIUM | Read tool supports PNG/JPG visually per vtrivedy reference; confirmed by this conversation's system capabilities. GitHub issue #30925 closed "not planned" introduces uncertainty for background agent context. |
| Pipeline generalization (layout/design/interaction accept sourceFilePath) | HIGH | Mechanical addition to existing agents; no new platform capabilities needed |

---

## Sources

- [Claude Code Agent SDK Overview](https://code.claude.com/docs/en/agent-sdk/overview) — built-in tools list (Read, Grep, Glob, Bash, Write, Edit), subagent architecture (HIGH confidence — official docs, fetched 2026-04-09)
- [Claude Code Subagents](https://code.claude.com/docs/en/sub-agents) — foreground/background agent modes, tool permissions (HIGH confidence — official docs, fetched 2026-04-09)
- [Claude Code Tools Reference (vtrivedy)](https://www.vtrivedy.com/posts/claudecode-tools-reference) — Read tool supports PNG/JPG displayed visually; full tool list (MEDIUM confidence — community reference, not official docs)
- [GitHub issue #30925 — agent image reading](https://github.com/anthropics/claude-code/issues/30925) — closed "not planned" April 2026; Read tool returns "Binary files not supported" for images in some agent contexts (MEDIUM confidence — closed issue, reflects partial state)
- [Watson PROJECT.md](https://github.com/austindick/watson) — v1.4 target features, "no external deps" constraint, out-of-scope screenshot automation (HIGH confidence — live project file)
- [Watson loupe.md](skills/core/skills/loupe.md) — existing `referenceType` field, discuss-only section handling, normalized section contract baseline (HIGH confidence — live implementation)
- [Watson source-scanning.md](skills/core/references/source-scanning.md) — Librarian scanning patterns for TypeScript components, tokens, icons; chapter structure rules (HIGH confidence — live implementation)
- [Watson agent-contract.md](skills/core/references/agent-contract.md) — shared parameter schema, dispatch modes, output path conventions (HIGH confidence — live implementation)
- Memory `project_watson_plugin.md` — `@repo` prefix convention for monorepo-relative source paths (HIGH confidence — validated project convention)

---

*Stack research for: Watson v1.4 — multi-mode design reference input (source reader, codebase-map, pipeline generalization, discuss-only path, screenshot support)*
*Researched: 2026-04-09*
