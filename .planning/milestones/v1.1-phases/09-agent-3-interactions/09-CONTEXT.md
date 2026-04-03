# Phase 9: Agent 3 (Interactions) - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

A fully implemented interaction agent that structures discuss-provided context and augments with library component defaults, producing INTERACTION.md per section that the builder can consume. The agent reads existing LAYOUT.md + DESIGN.md to detect components, reads library pages for built-in states, and merges with discuss-provided interaction context. This phase does NOT implement 3-agent parallel dispatch (Phase 10) or change builder logic beyond accepting a non-null interactionPath.

</domain>

<decisions>
## Implementation Decisions

### Library state extraction (Tier 1)
- Agent reads the section's LAYOUT.md and DESIGN.md to identify which DS components are used — no Figma re-fetch or separate component list parameter
- All documented states from each component's library PAGE.md are included in Tier 1 (disabled, loading, hover, active, focus, etc.)
- Components not in the design system book are omitted from Tier 1 and noted in Tier 3 as net-new interactions requiring custom implementation
- Tier 1 table includes a Notes column with contextual annotations explaining how each state is used in this specific section (e.g., "Loading state shown during cart mutation")

### User Flows
- Discuss provides flow sequences; agent structures them into the step-by-step format from INTERACTION-EXAMPLE.md
- Agent does NOT infer or invent flows — it only structures what discuss captured
- When discuss didn't capture any flows, User Flows section is present but says "No custom user flows specified — builder should implement standard component interactions only"

### Discuss context format (INTR-05: interactionContext)
- Structured JSON object with keys: `customStates[]`, `flows[]`, `transitions[]`, `responsiveBehavior[]`
- Per-section entries in discuss's return status `sections[]` array, each with an optional `interactionContext` field
- Top-level `crossSectionFlows[]` array for flows that span multiple sections (e.g., "filter in sidebar updates product grid")
- Discuss pre-categorizes into tiers — agent maps directly to INTERACTION.md sections
- `interactionContext` is null/absent when the user didn't discuss interactions — signals library-defaults-only (INTR-04)

### DS override handling
- Discuss warns at decision time when a designer's choice diverges from library defaults ("The DS Button has a Loading state built in — sure you want to skip it?")
- Designer confirms during conversation; agent trusts discuss output without re-checking
- No double-handling — discuss handles the warning, agent respects the decision

### Fallback behavior (INTR-04: no discuss context)
- Tier 1 table with all DS component states + empty stubs for Tier 2, Tier 3, Transitions, User Flows, Responsive Behavior
- Header note at top: "No custom interaction context provided — library component defaults only"
- Responsive Behavior section left empty with note: "No responsive behavior specified — builder should follow standard DS responsive patterns"
- Builder treats fallback INTERACTION.md identically to a fully populated one — same contract, no special fallback logic

### Agent dispatch integration
- In Phase 9, interaction agent runs sequentially AFTER layout + design agents complete (needs their output for Tier 1 component detection)
- Phase 10 will optimize to parallel dispatch — Phase 9 establishes the clean dependency chain first
- Loupe passes `interactionContext` as an agent parameter (from discuss return status sections[]) plus `crossSectionFlows` as a separate parameter
- Error handling: retry once silently, on second failure set `interactionPath: null` and continue — builder proceeds without interaction spec, using DS defaults. Matches existing per-agent error contract.
- Loupe tracks at subskill level ("built N sections") — no per-agent action tracking in /tmp/watson-active.json
- Discuss-only sections skip the interaction agent entirely (same pattern as layout + design agents skip)

### Claude's Discretion
- Exact interactionContext JSON schema field names and structure (beyond the high-level keys decided above)
- How the agent reads and parses LAYOUT.md + DESIGN.md component trees to extract component names
- How the agent matches extracted component names to library PAGE.md files
- Contextual note wording in Tier 1 table
- How crossSectionFlows are represented in consolidated blueprint/INTERACTION.md by the consolidator
- Exact wording of the discuss-time DS override warning

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `agents/interaction.md`: Stub with contract parameters (nodeId, sectionName, interactionContext, blueprintPath, libraryPaths, watsonMode) — needs full implementation
- `references/artifact-schemas/INTERACTION-EXAMPLE.md`: Canonical 3-tier schema with Transitions, User Flows, Responsive Behavior — agent output must match this structure
- `library/design-system/components/*/PAGE.md`: Each component has a `## States` section listing built-in states — agent reads these for Tier 1
- `library/design-system/components/CHAPTER.md`: Chapter manifest listing all 29 component pages — agent uses this to resolve component → PAGE.md paths
- `skills/discuss.md`: Already has "Interactions" core question (Phase 5.3) and INTERACTION.md population for discuss-only sections — needs interactionContext emit added to return status

### Established Patterns
- Agent contract spec (`references/agent-contract.md`): interaction agent is foreground* (background when watsonMode=true or interactionContext provided)
- All agents receive shared params: blueprintPath, libraryPaths, watsonMode
- Section-level output: `.watson/sections/{sectionName}/INTERACTION.md` < 50 lines
- Background agents must not use interactive tools
- Per-agent retry once, then fallback — established in loupe.md error handling

### Integration Points
- `skills/loupe.md` Phase 2/3: Currently hardcodes `interactionPath: null` — needs interaction agent dispatch added after layout + design, and interactionPath resolution before builder dispatch
- `skills/discuss.md` return status: Needs `interactionContext` field added per section in sections[] + top-level `crossSectionFlows[]`
- `skills/discuss.md` Phase 5.3 (Interactions question): Needs DS override warning when designer choice conflicts with library defaults
- `agents/builder.md`: Already accepts `interactionPath` param (currently always null) — no builder changes needed, just a non-null path
- `agents/consolidator.md`: Needs to handle cross-section interaction flows when merging section-level INTERACTION.md into blueprint/INTERACTION.md

</code_context>

<specifics>
## Specific Ideas

- Cross-section flows (e.g., "filter sidebar updates product grid") are a distinct concern from per-section component states — the two-layer model (per-section interactionContext + global crossSectionFlows) keeps them clean
- Discuss is the trust boundary for interaction decisions — it warns on DS overrides, the agent doesn't second-guess
- The fallback (no discuss context) INTERACTION.md is intentionally explicit about being minimal — "library defaults only" header prevents confusion about whether the agent failed or simply had no custom input
- Phase 9 establishes the sequential dispatch chain; Phase 10 optimizes to parallel — this separation keeps Phase 9 focused on getting the agent right, not on pipeline optimization

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-agent-3-interactions*
*Context gathered: 2026-04-02*
