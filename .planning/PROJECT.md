# Watson — Agentic Product Development Companion

## What This Is

A Claude Code skill framework that reimagines the product development process at Faire. Watson is a unified set of subskills, agents, and reference "books" that product teams use to go from problem understanding through high-fidelity prototyping to SDD-ready specs. Born from watson-lite (design thinking/discussion) and Loupe (pixel-perfect Figma-to-code pipeline), Watson subsumes both into a single, extensible architecture where a master orchestrator dispatches to specialized subskills and agents based on the task at hand.

Watson works directly with Faire's Prototype Playground. Designers and PMs interact with Watson at every stage — understanding problems, exploring solutions, building prototypes, and preparing specs for engineering handoff via Faire's Spec-Driven Development framework.

## Core Value

Every prototype decision — layout, interaction, component choice, copy, design token — is grounded in real context (user research, design system, business goals, existing patterns) and traceable from idea through prototype to production spec.

## Requirements

### Validated

- ✓ Multi-agent pipeline: decomposer, layout, tokens, builder, reviewer, consolidator — Loupe v1.0
- ✓ Frame decomposition via `::section` tagging with heuristic fallback — Loupe v1.0
- ✓ Parallel agent execution (layout + tokens per section) — Loupe v1.0
- ✓ Adaptive design discussion before building (complexity-scaled) — watson-lite
- ✓ Librarian generates/updates machine-readable design system reference from source — Loupe v1.0
- ✓ Schema-first agent contracts (fixed artifact structures) — Loupe v1.0
- ✓ Edit-based code generation (protects surrounding code) — Loupe v1.0
- ✓ Reviewer 2-pass max with escalation — Loupe v1.0
- ✓ Master orchestrator with three-tier intent classification and subskill dispatch — Watson 1.0
- ✓ Library system: LIBRARY.md index, Book/Chapter/Page hierarchy, Librarian generate + update modes — Watson 1.0
- ✓ Design system book from real Slate (source-agnostic, proven by FauxDS → Slate migration) — Watson 1.0
- ✓ Playground conventions book (7 chapters consolidated from 6+ sources) — Watson 1.0
- ✓ Blueprint system: /blueprint directory per prototype with 4 spec files — Watson 1.0
- ✓ `discuss` subskill: design thinking partner, library-grounded, blueprint read/write, loupe handoff — Watson 1.0
- ✓ `loupe` subskill: Figma-to-code pipeline orchestrator wiring all 7 agents — Watson 1.0
- ✓ 7 Loupe agents ported to Watson contract with libraryPaths[] and source-agnosticism — Watson 1.0
- ✓ Librarian agent evolved for multi-book management with book-type guard — Watson 1.0
- ✓ Agents read books, not source material — Librarian mediates all reference access — Watson 1.0
- ✓ End-to-end pipeline verified: /watson → discuss → loupe → pixel-accurate prototype with real Slate — Watson 1.0
- ✓ Ambient activation via path-specific rule in Prototype Playground context — Watson 1.1
- ✓ Draft/commit amendment model: [PENDING]/[COMMITTED] lifecycle with builder filter — Watson 1.1
- ✓ Git branch session management: watson/{slug} branches, inactive cleanup, session history — Watson 1.1
- ✓ Interaction agent (Agent 3): discuss context + library defaults → INTERACTION.md — Watson 1.1
- ✓ 3-agent parallel dispatch (layout + design + interactions) per section — Watson 1.1
- ✓ STATUS.md per-prototype state file with YAML schema — Watson 1.1

### Active

- [ ] `understand` subskill (PRD building/ingestion → CONTEXT.md) — Watson 1.2
- [ ] `explore` subskill (solution space, competitive analysis, pattern review) — Watson 1.2

### Out of Scope

- Clone-from-prod (pull existing Faire frontend experience into prototype) — Watson 2.0
- Visual verification/feedback loop (screenshot comparison) — Watson 2.0
- Abstracted design system support beyond Slate — Watson 2.0
- `prep-sdd-specs` subskill (prd.md + frd.md polishing for SDD handoff) — Watson 1.3
- /sdd directory with prd.md and frd.md generation — Watson 1.3
- /resources directory (mock data, feedback, archive) — Watson 1.3
- `write` subskill (copywriting/content design) — Watson 1.4
- `deduce` subskill (non-technical debugging, Sherlock-themed) — Watson 1.4
- `research` subskill (open-ended outward research) — Watson 1.4
- Additional library books (design principles, business context, users, content guidelines, research, SDD overview) — Watson 1.4+
- Pipeline speed optimization (profiling, pre-warming, lazy loading) — Watson 1.5
- External tooling (scripts, CLIs) — Watson is purely Claude Code skill files

## Context

### Heritage

Watson evolves from two proven skills:
- **watson-lite** (`~/.claude/skills/watson-lite/`): Adaptive design discussion flow for the Prototype Playground. Complexity-scaled — skips discussion for simple prototypes, deep design thinking for complex ones. Currently a single SKILL.md with playground-conventions reference.
- **Loupe** (`~/.claude/skills/loupe/`): 7-agent pipeline (decomposer → layout + tokens parallel → builder → reviewer → consolidator) that converts Figma frames to pixel-perfect code. Agents produce compact intermediate artifacts (LAYOUT.md, DESIGN.md) so the builder works from specs, not raw Figma data. Validated on real Figma frames, shipped v1.0 2026-03-26.
- **Librarian** (`~/.claude/skills/loupe/utilities/librarian.md`): Generates and updates the FauxDS library reference from source files. Two modes: generate (full scan) and update (surgical diff).

### Why This Architecture

LLMs drift on precise visual values when combining recall and reasoning in a single pass (Stanford "Lost in the Middle" research). Watson's architecture addresses this through:
1. **Separation of concerns**: Each agent gets one focused task and a clean context window
2. **Library system**: Agents read pre-processed "books" (compact, structured references) instead of raw source material. The Librarian maintains these books from various source materials.
3. **Blueprint system**: Per-prototype spec files (CONTEXT.md, LAYOUT.md, DESIGN.md, INTERACTION.md) persist as living references that any agent can read
4. **Schema-first contracts**: Every agent produces a fixed-structure artifact, enabling reliable downstream parsing

### Design System Transition

The Prototype Playground now supports real Slate imports (`@faire/slate`). The design system book was regenerated from real Slate source on 2026-03-31 — 29 components, 170 icons, full token set. Source-agnosticism was proven: migration from FauxDS to Slate required zero agent or subskill edits.

### Faire's Product Development Process

Watson maps to Faire's PDP stages:
- **Understand** → Define and validate the problem (PRD, user research, impact modeling)
- **Explore** → Find the right solution (competitive analysis, pattern review, prototyping)
- **Build** → High-fidelity prototype in the Playground
- **Ship** → Prep SDD specs (prd.md, frd.md) for engineering handoff

Designers and PMs may do Understand/Explore work outside Watson (Notion PRDs, Figma wireframes, FigJam sketches) and bring artifacts in. Watson is the foundation these processes are rooted in, not the only place work happens.

### Skill Location

`~/.claude/skills/watson/` — new directory, coexists with watson-lite and loupe until Watson is ready to replace both.

### Related Repos

- **Prototype Playground**: Faire's internal prototype environment (React 18, TypeScript, Tailwind, React Router v5)
- **faire/frontend**: Faire's production frontend (source of real Slate components and existing experiences)

## Constraints

- **File structure**: Each agent is its own `.md` file in `agents/`. Each subskill is its own `.md` in `skills/`. No combining.
- **Agent independence**: Agent files are self-contained — no cross-references between agents or back to SKILL.md
- **Source-agnostic design system**: Library and agents must work with FauxDS today and real Slate tomorrow without code changes
- **No external deps**: Purely Claude Code skill files — no scripts, CLIs, or build tooling
- **Figma MCP**: Agents fetch Figma data via existing Figma MCP tool (already available)
- **Non-technical users**: Watson's primary users are designers and PMs, not engineers. Language, error messages, and workflows must reflect this.
- **Books over source**: Agents should read library books for reference, not raw source files. The Librarian is the only agent that reads source material directly.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Watson 1.0 as new identity (not Loupe v1.1) | This is a reimagining, not an iteration — different architecture, different scope, different audience | ✓ Good |
| Fresh skill directory (~/.claude/skills/watson/) | Clean separation from watson-lite and loupe during build; both stay available until Watson replaces them | ✓ Good |
| Source-agnostic design system book | FauxDS → real Slate transition imminent; Librarian regenerates from whatever source is available | ✓ Good — proven by FauxDS→Slate migration |
| Agents read books, not source material | Prevents context bloat, ensures consistency, centralizes maintenance in the Librarian | ✓ Good |
| Library uses Book/Chapter/Page hierarchy | Scales from flat files (playground conventions) to deep trees (design system components) | ✓ Good |
| Blueprint files persist per prototype | CONTEXT.md, LAYOUT.md, DESIGN.md, INTERACTION.md, STATUS.md as living references any agent can read | ✓ Good |
| Schema-first agent contracts (from Loupe) | Prevents contract drift between agents — highest-leverage pitfall prevention from v1.0 | ✓ Good |
| Builder uses Edit tool, not Write (from Loupe) | Protects surrounding code from being overwritten | ✓ Good |
| Reviewer 2-pass max with escalation (from Loupe) | Prevents infinite fix loops | ✓ Good |
| Session toggle over auto-activation | paths: in SKILL.md breaks /watson slash command registration; AskUserQuestion gate preserves both | ✓ Good — v1.1 |
| [PENDING]/[COMMITTED] amendment markers | Prevents half-baked discuss decisions from reaching builder; one-way lock semantics | ✓ Good — v1.1 |
| All git mechanics in watson-init.md | Keeps SKILL.md routing-only under 200-line budget | ✓ Good — v1.1 |
| Interaction agent fetches Figma directly | Eliminates sequential dependency on layout+design for parallel dispatch | ✓ Good — v1.1 |

## Current State

Watson 1.1 shipped 2026-04-03. The skill framework is fully operational with ambient activation, draft/commit amendments, session management, interaction agent, and 3-agent parallel dispatch. 20/20 v1.1 requirements satisfied. SKILL.md at 198 lines (2 under 200-line limit).

**Tech stack:** Claude Code skill files (Markdown agent specs), Figma MCP, Slate design system
**Skill location:** `~/.claude/skills/watson/` (8 agent files, 2 subskills, 5 utilities, 2 reference files)

## Milestone Map

| Milestone | Focus | Key Deliverables |
|-----------|-------|-----------------|
| **Watson 1.0** | Foundation | Orchestrator, library system, blueprint, ported agents, discuss + loupe subskills |
| **Watson 1.1** | Ambient Mode & Iteration | Ambient activation, draft/commit amendments, session management, Agent 3, 3-agent parallel |
| Watson 1.2 | Core Workflows | understand, explore subskills |
| Watson 1.3 | SDD Integration | prep-sdd-specs, /sdd directory, /resources, blueprint-to-SDD pipeline |
| Watson 1.4 | Extended Capabilities | write, deduce, research subskills; additional library books |
| Watson 1.5 | Speed | Pipeline profiling, background pre-warming, lazy loading, parallel optimization |
| Watson 2.0 | Advanced | Clone-from-prod, visual verification, design system abstraction |

---
*Last updated: 2026-04-03 after v1.1 milestone*
