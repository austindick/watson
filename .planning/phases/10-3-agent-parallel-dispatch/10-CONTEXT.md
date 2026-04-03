# Phase 10: 3-Agent Parallel Dispatch - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Convert loupe.md from sequential interaction agent dispatch (after layout + design complete) to simultaneous 3-agent parallel dispatch per Figma section. Layout, design, and interaction agents all run as background agents in the same step. A wait gate ensures all three outputs are present (or gracefully fallen back) before the builder proceeds. No new agents, no new artifact schemas, no changes to builder or consolidator contracts.

</domain>

<decisions>
## Implementation Decisions

### Component detection strategy
- Interaction agent fetches the Figma node directly via MCP (using existing `nodeId` parameter) to identify DS components, instead of reading LAYOUT.md + DESIGN.md
- This removes the sequential dependency on layout + design agent output
- `layoutPath` and `designPath` parameters are removed from the interaction agent's dispatch signature in parallel mode
- Slight duplication of Figma fetch across agents is acceptable — cleanest parallel approach with no decomposer changes or new inter-agent contracts

### Dispatch mechanics
- All three agents (layout, design, interaction) dispatched as background agents in the same step per Figma section — same pattern as current layout + design parallel dispatch, extended to include interaction
- Wait gate checks all three outputs across all sections before proceeding to Phase 3 (build + review)
- `crossSectionFlows` passed to interaction agent at dispatch time (already available from discuss return status)
- `interactionContext` per section passed from discuss sections[] array (same as Phase 9 sequential path)

### Progress messaging
- Consolidated to a single progress message per section: "Mapping out the [section name]..." covers all three research agents running in parallel
- The separate "Detailing interaction states for the [section name]..." message is removed since interaction now runs simultaneously with layout + design
- All other progress messages unchanged (decomposer, builder, reviewer, complete)

### Graceful degradation (PARA-03)
- Silent fallback — current pattern preserved: retry once, then set `interactionPath: null`
- No user-facing message on interaction failure — builder already handles null interactionPath gracefully
- Interaction failure is isolated — does not block layout or design agent output, does not block other sections

### Discuss-only skip (PARA-04)
- Same skip rule as current: discuss-only sections skip all three research agents (layout, design, interaction) identically
- No change in skip logic — `referenceType = "discuss-only"` skips entire Phase 2

### Claude's Discretion
- How the interaction agent implements direct Figma fetch for component identification (internal parsing logic)
- Whether to keep `layoutPath`/`designPath` as optional params on the interaction agent for potential future use, or remove entirely
- Exact wait gate implementation (polling, promise-style, sequential checks)
- Whether the Phase 2 progress update text needs a minor wording tweak to better reflect 3-agent scope

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `skills/loupe.md` Phase 2: Already has layout + design parallel dispatch pattern — extend to include interaction agent in the same dispatch block
- `agents/interaction.md`: Already receives `nodeId` parameter — can fetch Figma directly without new params
- `agents/interaction.md`: Already has retry-once + null fallback error contract from Phase 9

### Established Patterns
- Background agent dispatch: layout and design agents already dispatched as background agents per section — proven pattern to replicate
- Wait gate: "Wait for every layout and design agent across all sections to complete before proceeding" — extend to include interaction
- Per-agent retry: "Retry silently once on first failure" — interaction agent already follows this contract
- Null fallback: `interactionPath: null` already handled by builder — no builder changes needed

### Integration Points
- `skills/loupe.md` Phase 2: Remove sequential interaction dispatch block; add interaction to parallel dispatch block alongside layout + design
- `skills/loupe.md` Phase 2: Update wait gate to check for three outputs instead of two
- `agents/interaction.md`: Remove dependency on `layoutPath`/`designPath` inputs; add direct Figma fetch for component identification
- `skills/loupe.md` progress messages: Remove "Detailing interaction states..." line from Designer-Language Progress Reference table

</code_context>

<specifics>
## Specific Ideas

- Phase 9 explicitly deferred parallel dispatch to Phase 10: "Phase 9 establishes the clean dependency chain first" — this phase delivers on that promise
- The Figma MCP fetch duplication (interaction agent fetching same node as layout + design) is a conscious tradeoff: simple parallel architecture over minimal redundant API calls
- Wait gate is the natural extension of the existing "wait for all research agents" pattern — just adding one more agent to the set

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-3-agent-parallel-dispatch*
*Context gathered: 2026-04-02*
