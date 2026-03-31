# Phase 4: Discuss Subskill - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

The discuss subskill gives users a design thinking conversation partner at any stage of prototyping. It reads existing blueprint state, writes decisions grounded in library books, and hands off to the orchestrator with a reference inventory that routes to the correct build path. Ports watson-lite's proven UX patterns (AskUserQuestion discipline, complexity scaling, gentle challenges, pattern research) into the Watson architecture.

</domain>

<decisions>
## Implementation Decisions

### Blueprint read behavior
- Discuss reads ALL FOUR blueprint files (CONTEXT.md, LAYOUT.md, DESIGN.md, INTERACTION.md) when they exist to understand current prototype state
- Empty templates (from watson-init) signal "nothing decided yet" — discuss opens with broader questions
- Populated content signals prior decisions — discuss skips already-decided areas and adapts
- Same flow for fresh start and mid-build — no separate modes, just adaptive behavior based on existing content
- Mid-build invocations also scan the actual built code (not just blueprint) to understand what was implemented vs what was decided

### Blueprint write behavior
- Discuss writes design decisions to CONTEXT.md always
- When conversation touches layout, component, or interaction specifics, discuss also amends LAYOUT.md, DESIGN.md, or INTERACTION.md
- Amendments use a `## Discuss Amendments` section appended to the file — original agent-generated content stays untouched
- Amendment format is structured key-value: `- [property]: [old value] → [new value] (reason)`
- Builder and consolidator see both base content and amendments, applying amendments as overlay
- Loupe agents and consolidator preserve the `## Discuss Amendments` section when regenerating — amendments persist across loupe runs
- Write timing is Claude's discretion — must not disrupt conversation rhythm or make the workflow feel sluggish

### Library grounding
- Discuss references library books using natural language with real component names — design language, not code (e.g., "Card component with bordered and elevated variants", not `import { Card } from '@faux/card'`)
- Conventions book loaded upfront at conversation start (playground rules apply throughout)
- Design system book loaded on-demand when conversation touches components, tokens, or visual specifics
- Book discovery via LIBRARY.md index — discuss reads `use_when` metadata to decide which books are relevant; future books auto-discovered
- Proactive component suggestions when relevant: name + key variants + composition hints (e.g., "DataTable supports sortable columns and pagination. You could pair it with a FilterBar above.")
- When user requests something not in the design system: acknowledge the gap, suggest alternatives from what exists, let user decide
- Convention conflicts use watson-lite's gentle challenge pattern: present the convention as an option alongside the user's choice, accept their decision if they have a reason

### Loupe handoff contract
- Discuss returns structured status to orchestrator — discuss itself never invokes loupe or the builder directly
- Return status includes reference inventory with per-section types:
  ```json
  {
    "status": "ready_for_build" | "discussion_only" | "cancelled",
    "blueprintPath": "/path/to/prototype/blueprint/",
    "sections": [
      { "name": "header", "referenceType": "discuss-only" },
      { "name": "order-table", "referenceType": "figma", "figmaUrl": "...", "nodeId": "..." }
    ],
    "hasFullFrame": false,
    "fullFrameUrl": null
  }
  ```
- `referenceType` per section: `"figma"` or `"discuss-only"` — extensible for future types (`"clone"`, `"prd"`)
- `hasFullFrame` distinguishes full-frame Figma (decomposer runs) from individual section frames (skip decomposer)
- Blueprint is the dedup contract — anything in CONTEXT.md is a locked decision; loupe agents don't re-ask
- Discuss proactively surfaces "ready to build?" when it detects sufficient decision coverage — not a passive wait for user signal, but still requires explicit user confirmation

### Hybrid reference mode (v1.0)
- Users can blend Figma-driven sections with discuss-only sections in the same prototype
- Figma URLs can be provided at any point during conversation (not just the start)
- When a Figma URL arrives mid-discussion, discuss associates it with the relevant section and updates the reference inventory
- Discuss detects whether a Figma URL is a full frame or a focused section/element and routes accordingly
- Watson-lite's background pre-fetch pattern applies — discuss can kick off Figma fetch while continuing the conversation
- Orchestrator routes each section independently: Figma sections → research agents → builder, discuss sections → builder directly

### Build path routing
- Builder agent always dispatched in a clean context window regardless of reference type — protects against context drift after deep discussions
- Figma path: research agents produce LAYOUT.md + DESIGN.md → builder + reviewer
- Discuss-only path: discuss populates LAYOUT.md + DESIGN.md from conversation decisions + library books → builder + reviewer
- Same pipeline tail (builder → reviewer), different head — clean architecture
- Orchestrator reads discuss's return status to determine which path per section

### Mid-build invocation
- Discuss can be invoked at any point during prototyping (DISC-01)
- Mid-build: reads blueprint files AND scans built code for full picture of current state
- Hybrid intent detection: infer intent from user's message and recent context, then present alternative focuses as escape hatch ("It sounds like you want to rethink the sidebar — is that right, or something else?")
- After mid-build discuss writes amendments, asks user: "Want me to rebuild affected section(s) now, or save for later?" — user controls rebuild timing
- Amendments persist in blueprint regardless of whether rebuild happens immediately
- Naturally shorter mid-build — same complexity scaling logic, but existing decisions reduce question count; no special mid-build mode

### Watson-lite patterns preserved
- AskUserQuestion discipline: 2-4 options, max 12-char headers, freeform escape via "Other"
- Complexity scaling: skip discussion for clearly simple, deep exploration for complex
- Gentle challenges: present alternatives when simpler patterns exist, accept designer's decision when they have a reason
- Core + contextual questions: always ask scenario/flow/interactions, conditionally ask states/data/variants/layout
- Pattern research: optional competitive analysis via web search
- Summary + confirmation before handoff

### Claude's Discretion
- Write timing strategy (batch vs incremental vs hybrid — constrained only by "must not disrupt conversation flow")
- How discuss detects sufficient coverage to surface "ready to build?"
- Question ordering and follow-up adaptation during conversation
- How discuss infers mid-build intent from context
- Internal organization of the discuss subskill file
- How discuss populates LAYOUT.md/DESIGN.md in the discuss-only path (level of detail)

</decisions>

<specifics>
## Specific Ideas

- The reference model is intentionally extensible: Figma, discuss-only, and per-section hybrid now; clone-from-prod (Watson 2.0), PRD ingestion (Watson 1.1), and design patterns book later
- "Discussion is always the fallback when a structured reference doesn't exist" — this principle scales across Watson's lifecycle (understand, explore, build stages)
- Eventually a "Existing design patterns" book would let Watson analyze how Faire has solved similar UI/UX problems elsewhere — powerful for the discuss-only build path
- The builder agent always running in a clean context window is an architectural guarantee, not an optimization — prevents the exact context-drift problem that motivated loupe's multi-agent design
- Mid-build hybrid intent ("infer then offer alternatives") is a UX improvement over watson-lite's more linear flow — respects that users mid-build have specific intent

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `~/.claude/skills/watson-lite/SKILL.md`: Proven discuss patterns — AskUserQuestion rules, complexity scaling, gentle challenges, core/contextual questions, pattern research, Loupe integration, scaffolding flow
- `~/.claude/skills/watson/library/LIBRARY.md`: Book index with use_when metadata for routing
- `~/.claude/skills/watson/library/design-system/`: Design system book with component pages (variants, props, composition patterns)
- `~/.claude/skills/watson/library/playground-conventions/`: Conventions book with scaffolding, component rules, data layer, multi-variant patterns
- `~/.claude/skills/watson/references/artifact-schemas/`: Blueprint file schemas (CONTEXT, LAYOUT, DESIGN, INTERACTION examples)

### Established Patterns
- Agent files self-contained in agents/, subskill files in skills/ — no cross-references
- libraryPaths[] array: subskill reads LIBRARY.md, resolves paths, passes to agents
- Blueprint files at prototype/blueprint/ — watson-init creates template structure
- Background agent dispatch for clean context windows — proven in loupe pipeline
- Agents return raw errors to subskill; subskill translates for non-technical users

### Integration Points
- Discuss subskill writes to: skills/discuss.md
- Discuss reads: prototype's blueprint/ directory, library books via LIBRARY.md
- Discuss writes: blueprint files (CONTEXT.md always, others via amendments)
- Discuss returns: structured status to SKILL.md orchestrator (Phase 5)
- Orchestrator routes: discuss return status → build path selection (Figma vs discuss-only vs hybrid)
- Builder agent: always dispatched in background regardless of reference type

</code_context>

<deferred>
## Deferred Ideas

- **Existing design patterns book** (Watson 1.2+): Foundational book analyzing how Faire solves similar UI/UX problems across the platform. Would significantly strengthen the discuss-only build path by giving Watson real patterns to reference beyond atomic components/tokens.
- **Clone-from-prod reference type** (Watson 2.0): `referenceType: "clone"` with a production URL — Watson extracts the existing experience and uses it as the design reference. Fits the same per-section routing model.
- **PRD ingestion as reference** (Watson 1.1): `referenceType: "prd"` — understand subskill ingests a PRD and populates CONTEXT.md, similar to how discuss populates it from conversation.
- **Understand subskill** (Watson 1.1): Facilitates problem understanding — accepts PRD as structured reference or gathers context through discussion (same "discussion is the fallback" principle).
- **Multi-Figma-frame stitching**: User provides multiple Figma frames for different sections of the same prototype, discuss helps stitch them together into a coherent whole.

</deferred>

---

*Phase: 04-discuss-subskill*
*Context gathered: 2026-03-31*
