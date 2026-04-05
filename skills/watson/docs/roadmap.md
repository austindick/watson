# Watson Roadmap

## Watson 1.0 — Foundation (Shipped 2026-03-31)

The foundation: a unified skill that replaces both watson-lite and Loupe with a single `/watson` entry point.

### What was built

**Orchestrator (SKILL.md)**
- Single `/watson` entry point with intent classification — designers never need to know internal architecture
- Three-tier complexity assessment: simple asks build immediately, complex ones get a design conversation, ambiguous ones ask to clarify
- Automatic discuss-to-build chaining — no manual handoff between conversation and building
- Returning prototype detection — Watson summarizes current state and adapts

**Library System**
- Book/Chapter/Page hierarchy for structured agent-readable references
- Two book types: source-derived (Librarian-managed) and foundational (manually authored)
- Design system book generated from real Slate source — 29 components, 170 icons, full token reference
- Playground conventions book consolidated from 6+ source documents into 7 chapters
- Librarian agent with generate and update modes, auto-indexing via LIBRARY.md
- Source-agnosticism proven: migrated from FauxDS to real Slate with zero agent edits

**Blueprint System**
- Per-prototype `/blueprint` directory with four spec files: CONTEXT.md, LAYOUT.md, DESIGN.md, INTERACTION.md
- Living references that persist across sessions — any agent or subskill can read them

**Pipeline Agents**
- 7 agents ported to Watson contract: decomposer, layout, design, interaction (placeholder), builder, reviewer, consolidator
- All agents consume library books via pre-resolved `libraryPaths[]` — no agent navigates source files
- Schema-first artifact contracts with YAML frontmatter
- Layout + design agents run in parallel per section

**Discuss Subskill**
- Design thinking conversation partner grounded in real Slate components and tokens
- Reads existing blueprint state to skip already-decided questions
- Writes decisions to CONTEXT.md, surgical amendments to LAYOUT.md/DESIGN.md/INTERACTION.md
- Complexity scaling: fewer questions for simple changes, deeper exploration for complex flows
- Hybrid reference mode: Figma URLs + conversation-driven sections in the same prototype
- Returns structured status to orchestrator for build routing

**Loupe Subskill**
- Figma-to-code pipeline orchestrator wiring all 7 agents
- Library resolution from LIBRARY.md before any agent dispatch
- Parallel dispatch for Figma sections, skip research for discuss-only sections
- Designer-language progress updates throughout the build

---

## Watson 1.1 — Ambient Mode & Iteration (In Progress)

Watson becomes a persistent companion rather than a one-shot pipeline. It activates automatically in prototype directories, supports iterative design with explicit decision tracking, and manages prototype sessions.

### Shipped (Phase 6 — Ambient Activation)

**Ambient activation**
- Path-specific rule (`~/.claude/rules/watson-ambient.md`) detects Prototype Playground context
- AskUserQuestion gate prompts activation — Watson doesn't auto-activate, but the user doesn't need to know about `/watson`
- Session toggle model: Watson is ON or OFF for the entire session
- `/watson off` deactivation with state file cleanup
- Status line shows "Watson: ON" when active
- STATUS.md schema for per-prototype state tracking (new vs returning detection)

### In Progress (Phase 7 — Draft/Commit Amendment Model)

**Draft/commit amendment model**
- Blueprint amendments default to `[PENDING]` — no design decision is silently locked in
- Inline markers (`[PENDING]`/`[COMMITTED]`) in blueprint amendment lines; builder reads only committed
- Extended "Ready?" gate shows a design-language diff of what will be locked in before building
- Session start surfaces pending amendment counts in the returning-prototype summary
- One-way lock: committed amendments can't revert to pending, but values can evolve via new amendments
- STATUS.md `drafts:` array tracks pending amendment IDs for fast surfacing

### Planned

**Session management (Phase 8)**
- Watson creates/switches git branches for prototype sessions with user confirmation
- Consistent `watson/{prototype-slug}` branch naming
- Surfaces existing Watson branches and offers cleanup of inactive ones

**Interaction agent (Phase 9)**
- Agent 3: reads component built-in interaction states from design system book
- Accepts pre-gathered `interactionContext` from discuss
- Produces INTERACTION.md per section combining discuss context with library defaults

**3-agent parallel dispatch (Phase 10)**
- Layout + design + interaction agents run simultaneously per section
- Interaction agent failure doesn't block pipeline — graceful fallback

---

## Watson 1.2 — Core Workflows

Deeper PDP integration: help users understand problems and explore solutions before building.

**`understand` subskill**
- Build or ingest a PRD, producing enriched CONTEXT.md
- Accept PRDs from Notion, Google Docs, or plain text
- Extract requirements, user stories, and acceptance criteria into blueprint format

**`explore` subskill**
- Structured solution-space research: competitive analysis, pattern mining, multi-approach generation
- Present multiple approaches with trade-offs for the user to evaluate

---

## Watson 1.3 — SDD Integration

Bridge from prototype to production: generate specs for Faire's Spec-Driven Development process.

**`prep-sdd-specs` subskill** — Generate and polish prd.md and frd.md for engineer handoff
**Per-prototype `/sdd` directory** — prd.md, frd.md
**Per-prototype `/resources` directory** — Mock data, user feedback, research archives

---

## Watson 1.4 — Extended Capabilities

New subskills for content, debugging, and open-ended research.

**`write` subskill** — Copywriting and content design within prototypes
**`deduce` subskill** — Non-technical prototype debugging (designer-friendly language)
**`research` subskill** — Open-ended outward research at any point during prototyping
**Additional library books** — Design principles, business context, users/archetypes, content guidelines, research findings, SDD overview

---

## Watson 1.5 — Speed

Systematic optimization pass: pipeline profiling, background pre-warming, lazy library loading, parallel optimization audit.

---

## Watson 2.0 — Advanced

**Clone-from-prod** — Pull existing Faire production experiences into prototypes as design references
**Visual verification** — Screenshot comparison feedback loop against Figma reference
**Design system abstraction** — Support for design systems beyond Slate

---

## Principles That Carry Forward

These architectural decisions from 1.0 apply to all future versions:

- **Agents read books, not source** — the Librarian mediates all reference access
- **Source-agnostic** — swap the library book, everything else adapts
- **Non-technical language** — Watson speaks to designers and PMs, never exposes internals
- **Schema-first contracts** — every agent has a locked input/output spec
- **Discussion is the fallback** — when a structured reference doesn't exist, Watson has a conversation
- **Blueprint as the dedup contract** — decisions in CONTEXT.md are locked; downstream agents don't re-ask

---

*Last updated: 2026-04-02*
