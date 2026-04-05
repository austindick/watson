# Watson Architecture Overview

Watson is a Claude Code skill for prototyping at Faire. It helps designers and PMs go from a vague idea to a high-fidelity prototype through structured design conversation and a multi-agent build pipeline.

Watson evolved from two predecessors:

- **watson-lite** — an adaptive design discussion skill that helped users think through prototype decisions before building.
- **Loupe** — a 7-agent pipeline that converted Figma frames into pixel-perfect code through decomposition, parallel analysis, and iterative review.

Watson subsumes both into a single architecture with shared infrastructure (library, blueprint, agent contracts).

---

## Design Philosophy

LLMs drift on precise visual values when they combine recall and reasoning in a single pass. Ask a model to remember 29 component APIs, choose the right one, and produce correct props all at once, and accuracy drops — especially for tokens buried in the middle of a long context (the "Lost in the Middle" effect).

Watson's answer is **separation of concerns at every layer:**

| Problem | Watson's solution |
|---------|-------------------|
| Context overload | Each agent gets one focused task and a clean context window |
| Source material is noisy | Agents read pre-processed "books," never raw source files |
| Decisions evaporate between sessions | Blueprint files persist per prototype as living references |
| Agent outputs vary in shape | Schema-first contracts: every agent produces a fixed-structure artifact |

The library system is the linchpin. Instead of agents scanning source code at build time, a dedicated Librarian agent pre-processes source into compact, structured reference books. Every other agent reads those books. This means agents don't know — or care — what design system they are working with.

---

## Two-Layer Routing

Watson uses a strict two-layer dispatch model:

```
User message
  └─▶ SKILL.md (orchestrator)
        ├─▶ discuss.md (subskill)
        └─▶ loupe.md (subskill)
              ├─▶ decomposer.md (agent)
              ├─▶ layout.md (agent)
              ├─▶ design.md (agent)
              ├─▶ builder.md (agent)
              ├─▶ reviewer.md (agent)
              └─▶ consolidator.md (agent)
```

**Layer 1: SKILL.md dispatches subskills.** The orchestrator classifies intent into three tiers (discuss, build, ask) and routes to the appropriate subskill. It handles setup detection, session calibration, and the discuss-to-loupe handoff. It never touches agents directly.

**Layer 2: Subskills dispatch agents.** Each subskill owns its pipeline logic — which agents to call, in what order, with what parameters. `loupe.md` wires the full decomposer-to-consolidator pipeline. `discuss.md` runs the conversation itself (it is not an agent dispatcher, but it reads library books and writes blueprint files directly).

**Why two layers?** It keeps the orchestrator thin. SKILL.md stays under 200 lines — just intent classification and routing. All execution complexity lives in the subskills where it can grow independently.

---

## The Three Systems

### 1. Library System

The library is Watson's reference layer. It pre-processes source material into a hierarchy that agents can read without navigating codebases.

**Structure:**

```
library/
  LIBRARY.md              ← Index of all books (use_when guidance per book)
  design-system/
    BOOK.md               ← Manifest: chapters, source_paths, source_hash
    global-theme/
      CHAPTER.md          ← Chapter overview + page list
    components/
      CHAPTER.md
      Button.md           ← PAGE: one component's full API reference
      Modal.md
      ...
  playground-conventions/
    BOOK.md
    scaffolding/
      CHAPTER.md
    components/
      CHAPTER.md
    ...
```

**Hierarchy:** LIBRARY.md (index) → BOOK.md (manifest) → CHAPTER.md (topic) → PAGE.md (atomic reference).

Subskills resolve `libraryPaths[]` before dispatching any agent. They read LIBRARY.md and BOOK.md manifests to build an array of chapter paths, then pass that array to agents. Agents never navigate the book hierarchy themselves — they just read each path they receive.

**Two book types:**

| Type | Maintained by | Example | Regeneration |
|------|---------------|---------|--------------|
| **source-derived** | Librarian agent | `design-system` — generated from Slate source files | Librarian scans `source_paths`, regenerates chapters/pages |
| **foundational** | Human author | `playground-conventions` — manually written | Never auto-regenerated; `book_type` field guards against it |

The `book_type` field in each BOOK.md frontmatter prevents the Librarian from accidentally overwriting hand-authored books.

---

### 2. Blueprint System

Each prototype gets a `blueprint/` directory with four files that serve as living references throughout its lifecycle:

| File | Contains | Primary writer | Primary readers |
|------|----------|----------------|-----------------|
| `CONTEXT.md` | Problem statement, user scenario, success criteria, scope | discuss | loupe agents, builder |
| `LAYOUT.md` | Section hierarchy, component placement, responsive rules | loupe (consolidator) | builder, reviewer |
| `DESIGN.md` | Token values, component variants, visual specs | loupe (consolidator) | builder, reviewer |
| `INTERACTION.md` | State machines, transitions, user flows | loupe (consolidator) | builder, reviewer |

Blueprints bridge the discuss-to-build handoff. When discuss writes CONTEXT.md, it captures every design decision in a format that loupe agents can consume without re-asking the user. When loupe's per-section agents produce layout/design/interaction specs, the consolidator merges them into the blueprint-level files for future reference.

Blueprint state also drives routing. SKILL.md checks whether CONTEXT.md has real content or just template placeholders to decide whether a user needs discussion or is ready to build.

---

### 3. Agent System

Agents live as self-contained `.md` files in `agents/`. Each has YAML frontmatter that defines its contract:

```yaml
---
name: layout
type: agent
dispatch_mode: background
inputs:
  - blueprintPath: string
  - libraryPaths: string[]
  - sectionName: string
  - nodeId: string
outputs:
  - path: .watson/sections/{sectionName}/LAYOUT.md
    max_lines: 80
---
```

**Dispatch modes:**

| Mode | Behavior | Examples |
|------|----------|---------|
| **foreground** | May prompt the user; can pause and wait for input | decomposer, interaction (when no prior context) |
| **background** | Runs to completion silently; no interactive tools allowed | layout, design, builder, reviewer, consolidator, librarian |

Mode is binary and permanent per agent — subskills do not reclassify at runtime.

**Key rules:**
- Agents are self-contained. No agent references another agent or SKILL.md.
- Every agent produces a fixed-structure artifact (schema-first). Downstream agents can rely on the shape of upstream output.
- Agents receive `libraryPaths[]` at dispatch time. They read those paths directly — they never resolve books themselves.

**Agent registry:**

| Agent | Purpose | Dispatch | Key output |
|-------|---------|----------|------------|
| decomposer | Break a Figma frame into sections | foreground | `sections[]` JSON |
| layout | Extract spatial structure for one section | background | `LAYOUT.md` per section |
| design | Extract visual specs for one section | background | `DESIGN.md` per section |
| interaction | Define states and transitions | foreground* | `INTERACTION.md` per section |
| builder | Generate code from specs | background | Modified prototype file |
| reviewer | Verify fidelity, fix issues (2-pass max) | background | In-place fixes |
| consolidator | Merge per-section specs into blueprint | background | Blueprint-level files |
| librarian | Generate/update library books from source | background | Book/chapter/page files |

---

## Data Flow

### Full pipeline: discuss through build

```
/watson
  │
  ▼
SKILL.md ─── intent classification ───┐
  │                                    │
  │  Tier 1 (discuss)                  │  Tier 2 (build)
  ▼                                    ▼
discuss.md                          loupe.md
  │                                    │
  ├─ reads library books               ├─ resolves libraryPaths from LIBRARY.md
  ├─ reads blueprint state             │
  ├─ runs design conversation          ├─ Phase 1: decomposer
  ├─ writes CONTEXT.md                 │    └─ sections[] JSON
  │                                    │
  └─ returns status ──┐               ├─ Phase 2: layout + design (parallel per section)
                       │               │    ├─ LAYOUT.md per section
  ┌────────────────────┘               │    └─ DESIGN.md per section
  │                                    │
  ▼                                    ├─ Phase 3: builder → reviewer (sequential per section)
SKILL.md                               │    └─ modified prototype files
  │                                    │
  │  status = ready_for_build          ├─ Phase 4: consolidator
  ▼                                    │    └─ blueprint/LAYOUT.md, DESIGN.md, INTERACTION.md
loupe.md ◄─────────────────────────────┘
```

### Discuss return values

When discuss completes, it returns a status to SKILL.md:

- **`ready_for_build`** — user confirmed they want to build. SKILL.md dispatches loupe with the blueprint path and section list.
- **`discussion_only`** — user wants to save decisions and come back later. SKILL.md exits gracefully.
- **`cancelled`** — user abandoned. SKILL.md acknowledges and exits.

### Loupe internal pipeline

```
loupe.md
  │
  ├─ resolve libraryPaths[]
  │
  ├─ hasFullFrame? ──▶ decomposer ──▶ sections[]
  │                    (or use sections[] from discuss)
  │
  ├─ for each section:
  │    ├─ layout(nodeId, libraryPaths)  ──┐
  │    └─ design(nodeId, libraryPaths)  ──┤  parallel
  │                                       │
  │    ├─ builder(layoutPath, designPath) ─┤  sequential
  │    └─ reviewer(layoutPath, designPath) ┘
  │
  └─ consolidator(sectionsGlob) ──▶ blueprint/ files
```

---

## Source-Agnosticism

Watson agents have no idea what design system they are working with. The library is the only interface between agents and source material, and the Librarian is the sole agent that reads source files.

This is not theoretical. Watson's design system book was originally generated from FauxDS (a bridge design system). When Faire's real Slate components became available, the migration required:

1. Point the Librarian's `source_paths` at the new Slate directory.
2. Run the Librarian in `generate` mode.
3. Done.

**Zero agent edits.** No orchestrator changes. No subskill changes. The agents kept reading the same book structure — only the content inside changed. The `@repo` prefix in `source_paths` resolves to whatever repository root is active, making the library portable across environments.

---

## Key Constraints

These constraints are load-bearing. Relaxing any of them degrades the system.

| Constraint | Why it matters |
|------------|----------------|
| **SKILL.md stays under 200 lines** | Forces the orchestrator to stay thin. If routing logic grows, it belongs in a subskill. |
| **Agents never cross-reference** | Each agent is self-contained. No agent reads another agent's file or imports shared logic. This keeps context windows clean and agents independently testable. |
| **Books over source** | Agents read library books, never raw source. The Librarian is the sole interface to source material. This prevents context bloat and ensures all agents work from the same reference. |
| **Non-technical user language** | Watson's primary users are designers and PMs. Agent names, file paths, and internal pipeline details are never surfaced. All user-facing language is design language. |
| **Schema-first artifacts** | Every agent produces a fixed-structure output. Downstream agents rely on the shape, not just the content. This prevents contract drift — the highest-leverage pitfall from Loupe v1.0. |
| **Binary dispatch modes** | Foreground (interactive) or background (silent) — set permanently per agent, never reclassified at runtime. Subskills know exactly which agents might pause for user input. |

---

## File Map

Quick reference for navigating the skill directory:

```
${CLAUDE_PLUGIN_ROOT}/skills/watson/
  SKILL.md                    ← Orchestrator (intent classification + routing)
  skills/
    discuss.md                ← Design conversation subskill
    loupe.md                  ← Figma-to-code pipeline subskill
  agents/
    decomposer.md             ← Break Figma frame into sections
    layout.md                 ← Extract spatial structure
    design.md                 ← Extract visual specs
    interaction.md            ← Define states and transitions
    builder.md                ← Generate code from specs
    reviewer.md               ← Verify and fix fidelity
    consolidator.md           ← Merge per-section specs into blueprint
    librarian.md              ← Generate/update library books from source
  library/
    LIBRARY.md                ← Book index
    design-system/            ← Source-derived book (Librarian-managed)
    playground-conventions/   ← Foundational book (manually authored)
  references/
    agent-contract.md         ← Canonical agent registry and dispatch spec
  utilities/
    watson-init.md            ← Blueprint scaffolding utility
  docs/
    architecture.md           ← This file
```
