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
- ✓ Plugin deployment: manifest, portable paths, marketplace distribution, one-command install — Watson 1.2
- ✓ Hooks migrated to plugin hooks.json with bundled session scripts — Watson 1.2
- ✓ Rationalization prevention tables in builder, reviewer, and orchestrator — Watson 1.2
- ✓ Opt-in activation model — Watson never auto-activates; asks before engaging — Watson 1.3
- ✓ `/watson:save-blueprint` retroactive context capture with gap analysis and discuss bridge — Watson 1.3
- ✓ `/watson:status` read-only dashboard and `/watson:resume` full context recovery — Watson 1.3
- ✓ Standalone `/watson:discuss` and `/watson:loupe` callable independently — Watson 1.3
- ✓ `/watson:off` with session summary and save-blueprint prompt — Watson 1.3
- ✓ Flexible continue path accepting branch, URL, or directory — Watson 1.3
- ✓ Multi-mode Loupe: 3-mode entry (Figma, prod-clone, discussion-only) with conditional agent dispatch — Watson 1.4
- ✓ Codebase-map library book: Librarian-generated monorepo navigation from faire/frontend — Watson 1.4
- ✓ 4 new source agents: surface-resolver + source-layout + source-design + source-interaction — Watson 1.4
- ✓ Discussion-only build path: Slate-grounded output from intent alone via library books — Watson 1.4
- ✓ Reference: intent markers for cross-agent provenance tracking — Watson 1.4
- ✓ All 4 integration scenarios (Figma regression, prod-clone, discuss-only, mixed-mode) validated — Watson 1.4

### Active

- [ ] Extract Loupe as standalone `/design` skill with pipeline hardening
- [ ] Extract discuss as standalone `/think` skill with file refactor
- [ ] Extract session management as standalone `/play` skill
- [ ] Create `/save` utility skill for session checkpointing
- [ ] Shared library system and blueprint contract at plugin level
- [ ] Remove Watson branding from all user-facing surfaces

### Out of Scope

- Automated screenshot acquisition for prod cloning (SSO/auth complexity) — v2.0
- Cached surfaces library book (maintenance tax, premature optimization) — v2.0
- Visual verification/feedback loop (screenshot comparison) — v2.0
- Abstracted design system support beyond Slate — v2.0
- `/spec` skill (FRD + DRD generation for SDD handoff) — v1.6
- `write` skill (copywriting/content design) — future
- `deduce` skill (non-technical debugging) — future
- `research` skill (open-ended outward research) — future
- Additional library books (design principles, business context, users, content guidelines, research, SDD overview) — future
- Pipeline speed optimization (profiling, pre-warming, lazy loading) — future
- External tooling (scripts, CLIs) — Design Toolkit is purely Claude Code skill files
- Watson master orchestrator restoration — paused, may revisit after standalone skills are hardened

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
| Opt-in gate with AskUserQuestion | Watson asks before activating; /tmp decline marker scopes to session | ✓ Good — v1.3 |
| Fork question before branch detection | "New or continue?" first; branch list only after user chooses Continue | ✓ Good — v1.3 |
| Deferred scaffold commit | No empty commit on startup; first commit on meaningful work | ✓ Good — v1.3 |
| watson:status as independent skill | Own frontmatter + plugin.json entry; no Watson activation by design (STAT-02) | ✓ Good — v1.3 |
| Standalone preambles for discuss/loupe | Phase -1 bootstraps without full session; presence/absence of blueprintPath signals mode | ✓ Good — v1.3 |
| Direct-input mode in watson-init | Phase 0C handles branch/URL/directory; SKILL.md Path B routes flexible input | ✓ Good — v1.3 |
| 3 parallel source agents (not single source-reader) | Each agent gets focused context window; matches Figma pipeline parallelism | ✓ Good — v1.4 |
| referenceType defaults to "figma" when absent | Backward compatibility — existing Figma pipeline untouched by extension | ✓ Good — v1.4 |
| Conditional Librarian dispatch for codebase-map | outputBookPath routes to codebase-map-scanning.md; existing source-scanning.md unchanged | ✓ Good — v1.4 |
| Reference: intent markers in artifacts | Second line of artifact files signals provenance; builder adjusts certainty behavior | ✓ Good — v1.4 |
| Hybrid detection with confirmatory prompt | Discuss detects codebase-map opportunity; user confirms before mode switch (not automatic) | ✓ Good — v1.4 |

## Last Completed Milestone: v1.4 Multi-Mode Loupe (Shipped 2026-04-13)

Loupe now accepts any design reference — Figma frame, prod codebase, or discussion-based intent. 4 new source agents read faire/frontend TSX and produce normalized pipeline artifacts. Discussion-only mode builds Slate-grounded prototypes from intent alone.

## Current Milestone: v1.5 Design Toolkit

**Goal:** Decompose Watson into independent, standalone skills (`/play`, `/think`, `/design`, `/save`) packaged as a "Design Toolkit" plugin — preserving the blueprint and library systems while removing the orchestration layer.

**Target features:**
- `/design` — standalone pixel-perfect build pipeline with hardened agents (page-container, reviewer tightening, token compliance)
- `/think` — standalone design thinking skill, refactored into manageable files
- `/play` — session management (fork/continue, branch setup, blueprint scaffolding)
- `/save` — checkpoint utility (write context to blueprints, commit, preserve state)
- Shared library system with Librarian at plugin level
- Shared blueprint contract across all skills
- Watson branding removed from all user-facing surfaces

## Current State

Watson 1.4 shipped 2026-04-13. All Watson capabilities proven and validated across 5 milestones. Beginning decomposition into standalone skills packaged as "Design Toolkit" plugin.

**Tech stack:** Claude Code plugin (Markdown agent/skill specs), Figma MCP, Slate design system
**Plugin repo:** `austindick/watson` | **Marketplace:** `austindick/austins-stuff`
**LOC:** ~10,197 lines Markdown across all skill/agent/reference/library files

## Milestone Map

| Milestone | Focus | Key Deliverables |
|-----------|-------|-----------------|
| **Watson 1.0** | Foundation | Orchestrator, library system, blueprint, ported agents, discuss + loupe subskills |
| **Watson 1.1** | Ambient Mode & Iteration | Ambient activation, draft/commit amendments, session management, Agent 3, 3-agent parallel |
| **Watson 1.2** | Plugin Deployment | Plugin manifest, portable paths, marketplace distribution, one-command install |
| Watson 1.3 | User Experience & Commands | Opt-in activation, save-blueprint, status/resume, standalone commands, startup reorder |
| Watson 1.4 | Multi-Mode Loupe | Source reader agent, pipeline generalization, multi-mode entry, discussion-only path, codebase-map book |
| **v1.5** | **Design Toolkit** | Decompose Watson → standalone skills (/play, /think, /design, /save), pipeline hardening, shared library + blueprint systems |
| v1.6 | `/spec` Skill | Blueprint → FRD + DRD for SDD handoff |
| v2.0 | Advanced | Visual verification, design system abstraction |

---
*Last updated: 2026-04-13 after v1.4 milestone*
