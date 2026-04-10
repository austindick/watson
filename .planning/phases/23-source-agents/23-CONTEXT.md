# Phase 23: Source Agents - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Surface resolver + 3 parallel source agents that read TSX files from faire/frontend and produce LAYOUT.md, DESIGN.md, and INTERACTION.md artifacts conforming to the existing pipeline schema. Phase 23 delivers the agents only — pipeline wiring and multi-mode entry are Phase 24.

</domain>

<decisions>
## Implementation Decisions

### Section Decomposition (Surface Resolver)
- Use top-level JSX children of the page component as section boundaries (mirrors Figma decomposer using frame children)
- Auto-filter layout wrappers, context providers, and utility components — show only visual regions
- Auto-expand if ≤2 top-level visual children: go one level deeper inside the largest component to find sub-sections
- Humanize section names: PascalCase → "Title Case" (ProductGrid → "Product Grid")
- Show approval list with humanized names + one-line descriptions — no file paths in approval UI
- Foreground dispatch with user approval step (mirrors Figma decomposer exactly)
- On stale codebase-map entry (file not found): search for similarly-named files nearby, suggest top 3 candidates, fall back to surface repick
- Resolver follows the import from the page component to resolve each section's component file path

### Section Contract Shape
- Unified contract with nullable fields across all referenceTypes: `{name, referenceType, nodeId?, filePaths?, dimensions?, description?, sourceSurface?}`
- `referenceType: "prod-clone"` for source agent sections (alongside existing "figma" and "discuss-only")
- `description`: one-line summary inferred from component code
- `sourceSurface`: carries original codebase-map entry (name + route) for builder context and progress messages
- No componentCount — source agents discover this themselves

### Import-Following Depth
- Read associated style files (CSS, SCSS, styled-components) alongside TSX
- Skip hook files (useX.ts) — non-visual code, not relevant to layout/design/interaction specs
- Read shared internal components (non-Slate, non-hook) — they contain visual structure
- Exact import depth is Claude's discretion during implementation

### Confidence Annotations
- 3-tier system across all three artifact types:
  - **From code** (high): `/* from code: 24px */` — value directly read from source
  - **Inferred** (medium): `/* inferred from className 'gap-4' — verify visually */` — derived from class/style analysis
  - **Estimated** (low): `/* estimated — not found in source */` or `/* estimated — from library default */` — agent's best guess or library fallback
- Each artifact includes a confidence summary tally at the top (e.g., "14 from code, 3 inferred, 2 estimated")
- Screenshot boosts confidence: inferred values confirmed by screenshot can upgrade to "from code + visual"
- Builder prefers library book defaults over "estimated" values

### Gap Handling
- Fill gaps from design-system library book defaults, mark as "estimated — from library default"
- Assume standard Slate states from library when code doesn't show them explicitly (same as Figma interaction agent Tier 1 pattern)
- Custom (non-Slate) components: describe structure from code, mark as custom with no library equivalent
- Include responsive breakpoints when found in CSS media queries; note absence otherwise ("Responsive behavior: not detected in source — builder discretion")

### Screenshot Support
- Source agents accept optional `screenshotPath` parameter
- Use for structural reference only (layout, spacing, visual hierarchy) — explicitly ignore data content (product names, images, prices)
- Ask for screenshot AFTER section decomposition, clearly optional
- Pass single page-level image to all 3 source agents
- Screenshot can boost confidence tier (inferred → "from code + visual")

### Agent Files & Registry
- All 4 agents in flat `agents/` directory (same as existing agents)
- File names: `surface-resolver.md`, `source-layout.md`, `source-design.md`, `source-interaction.md`
- Same line budgets as Figma counterparts: LAYOUT < 80 lines, DESIGN < 80 lines, INTERACTION < 50 lines
- All 4 agents added to `agent-contract.md` registry in Phase 23
- Surface resolver: foreground dispatch (uses AskUserQuestion for approval)
- Source agents: background dispatch (receive all context via parameters)

### Claude's Discretion
- Exact import-following depth for source agents
- Wrapper/provider detection heuristics (how to distinguish visual regions from layout wrappers)
- Component description generation (how to summarize a section from code when JSDoc is absent)
- Internal architecture of each agent file (execution steps, error handling)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Figma agents (agents/layout.md, agents/design.md, agents/interaction.md): source agents mirror their output schemas exactly
- Decomposer (agents/decomposer.md): surface resolver mirrors its foreground approval flow and section list format
- agent-contract.md: registry for dispatch parameters — extend with 4 new entries
- Codebase-map book (library/codebase-map/): surface resolver's primary input for locating surfaces
- Design-system book (library/design-system/): source agents use for gap-filling and component state lookup

### Established Patterns
- Background dispatch with shared parameters (blueprintPath, libraryPaths, watsonMode)
- Section-level staging in `.watson/sections/{sectionName}/` with line budgets
- Library-first: agents read library books, not source material (exception: source agents read faire/frontend code as their "input material", but use library books for reference data)
- Artifact schemas are fixed (LAYOUT-EXAMPLE.md, DESIGN-EXAMPLE.md, INTERACTION-EXAMPLE.md)

### Integration Points
- loupe.md Phase 2: will need a prod-clone dispatch branch (Phase 24 work) that dispatches source agents instead of Figma agents per section
- Section contract: unified shape with nullable fields enables Phase 24 to route by referenceType
- Consolidator: unchanged — reads `.watson/sections/` artifacts regardless of source. Source agents write to the same paths.
- Builder/reviewer: unchanged — consume LAYOUT.md, DESIGN.md, INTERACTION.md regardless of which agents produced them

</code_context>

<specifics>
## Specific Ideas

- Screenshot data variance: users see different content on the same page (different products, configurations). Source agents must use screenshots for structural analysis only, never for content/data extraction.
- Section naming should feel designer-friendly: "Product Grid" not "ProductGrid", matching the humanization approach used in codebase-map section headers
- The resolver's approval list should mirror the Figma decomposer's approval UX as closely as possible — users should feel the same workflow regardless of whether they started from Figma or code

</specifics>

<deferred>
## Deferred Ideas

- Content filler agent: dedicated agent for populating realistic mock data in prototypes (product names, images, prices) — separate from layout/design/interaction concerns
- Design agent split: break current design agent into separate token-focused agent and component-mapping agent — cleaner separation, potentially shareable token agent across Figma and source paths
- Admin package indexing in codebase-map — excluded for now; add as a chapter later if internal tools prototyping is needed (carried from Phase 22)

</deferred>

---

*Phase: 23-source-agents*
*Context gathered: 2026-04-10*
