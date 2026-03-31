# Phase 3: Research Agents - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Agents 1 (Layout) and 2 (Tokens) dispatched in parallel per section, producing validated LAYOUT.md and DESIGN.md files against locked schemas. Agent 3 (Interactions) is **deferred to a follow-up milestone** — Watson's discuss flow covers interaction gathering, and Agent 3's complexity (three modes, interactive interview, Watson integration) warrants its own focused build.

Phase 3 validates: parallel background dispatch, layout extraction from Figma auto-layout, token/component mapping against FauxDS, and artifact schema compliance on a real Figma section.

</domain>

<decisions>
## Implementation Decisions

### Path translation (Loupe → Watson)
- CONTEXT.md decisions reflect Loupe-era paths; Watson equivalents apply during planning and execution:
  - `fauxds-library.md` single file → `libraryPaths[]` array of chapter/page paths
  - `.loupe/` staging and output directory → `.watson/` staging, `blueprint/` consolidated output
  - "existing .loupe/LAYOUT.md vocabulary reads" → `blueprintPath` consolidated file reads
- All plans implement the Watson equivalents. CONTEXT.md decisions remain as-written for historical accuracy.


### Agent 3 deferral
- Agent 3 (Interactions) is deferred to a follow-up milestone — not part of Phase 3 or v1
- INTR-01 through INTR-07 requirements move out of this phase
- PARA-01 and PARA-02 simplify: both agents run in background, no foreground agent
- Downstream impact: Phase 4 builder works from LAYOUT.md + DESIGN.md only (no INTERACTIONS.md)
- Roadmap and requirements updates to be handled during planning

### Token matching — spacing and layout values
- Map to nearest FauxDS token when no exact match exists
- Always include `/* Figma: Xpx */` comment noting the original Figma value
- No delta magnitude classification — just note the original, reviewer sees the gap themselves
- Unmapped elements (no FauxDS component match at all) go in Unmapped Values section with build hints: raw Figma values, suggested CSS approach, and a "custom implementation" note

### Token matching — colors
- Exact hex match only — no rounding to nearest color token
- If a Figma hex value doesn't exactly match a FauxDS color token, it goes to Unmapped Values
- Rationale: color mismatches are more visually noticeable than spacing deltas

### Existing vocabulary influence
- Agents always read `fauxds-library.md` before starting (baseline vocabulary)
- If existing `.loupe/LAYOUT.md` or `.loupe/DESIGN.md` exists, prefer consistency with established mappings
- On conflict (existing vocabulary disagrees with new Figma data): Figma wins, agent adds a comment noting the inconsistency — consolidator (Phase 5) resolves later
- First run (no `.loupe/` files): `fauxds-library.md` is the sole vocabulary source

### Smoke test
- User will provide a Figma frame URL with sufficient complexity (auto-layout, mixed spacing, FauxDS-matchable + unmapped elements)
- Smoke test must verify parallel dispatch timing: total time ≈ single-agent time, not 2x (addresses bug #7406 flagged in STATE.md)
- Log agent start/end timestamps to detect serialization

### Claude's Discretion
- Figma data fetch depth strategy for Agents 1 and 2
- How agents handle nested auto-layout containers
- Agent prompt structure and instruction organization
- Error handling when Figma MCP calls fail
- Exact format of vocabulary conflict comments

</decisions>

<specifics>
## Specific Ideas

- Color matching is intentionally stricter than spacing matching — the user views color accuracy as higher priority
- The parallel dispatch timing verification directly addresses a known concern (silent-serialization bug #7406) that was flagged during Phase 2 planning
- With Agent 3 deferred, the parallel dispatch pattern is simpler (both background, no foreground/background split)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `01-layout.md` placeholder: Already defines role, inputs (nodeId, name, fauxds-library path, existing .loupe/LAYOUT.md path), outputs (.loupe/sections/[name]/LAYOUT.md), and constraints
- `02-tokens.md` placeholder: Already defines role, inputs, outputs, and constraints including --faux-*/--slate-* token prefixes
- `fauxds-library.md`: Populated with real FauxDS components (FauxButton, FauxBadge, etc.), Global Theme tokens, spacing/radius tokens
- Artifact schemas: LAYOUT-EXAMPLE.md, DESIGN-EXAMPLE.md locked in .planning/artifact-schemas/ — agents must match these formats exactly

### Established Patterns
- Agent files are self-contained .md in `agents/` — no cross-references
- MCP tool: `mcp__figma__get_metadata` (not `get_figma_data` — corrected in Phase 2)
- Agent 0 outputs `{name, nodeId, dimensions}[]` — this is the input contract for Agents 1 and 2

### Integration Points
- Agent 0 section list → Agents 1 & 2 receive nodeId and name per section
- Agent outputs → `.loupe/sections/[name]/LAYOUT.md` and `.loupe/sections/[name]/DESIGN.md`
- Phase 4 builder reads both files (no INTERACTIONS.md until Agent 3 is built)
- `fauxds-library.md` at `~/.claude/skills/loupe/references/fauxds-library.md`

</code_context>

<deferred>
## Deferred Ideas

- Agent 3 (Interactions) — full interactive interview, Watson pre-gathered context mode, infer-only mode — deferred to follow-up milestone
- INTR-01 through INTR-07 requirements — move to follow-up milestone
- INTERACTIONS.md artifact generation — not produced until Agent 3 is built

</deferred>

---

*Phase: 03-research-agents*
*Context gathered: 2026-03-25*
