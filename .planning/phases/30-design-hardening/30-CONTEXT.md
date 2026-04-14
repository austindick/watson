# Phase 30: /design Hardening - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Harden the `/design` pipeline to produce pixel-accurate, token-compliant output with reliable convergence. Covers: page-container section type, reviewer tightening (property-to-token cross-reference), builder token compliance for novel compositions, convergent builder-reviewer loop, section rebuild, and post-consolidation verification gate. Does not add new pipeline modes or new agent types.

</domain>

<decisions>
## Implementation Decisions

### Section Rebuild (DSGN-10)
- Natural language invocation: designer says "rebuild the hero" or "redo the navbar and footer" — /design parses section names from the message and matches against `sections_built` in STATUS.md
- No-match fallback: show menu of built sections ("I don't see a section called 'cards'. Which section did you mean?")
- Rebuild depth: full re-run — research agents (layout + design + interaction) re-run for target sections, then builder, then reviewer with convergent loop
- No consolidator on rebuild: builder edits in-place, reviewer fixes in-place. A lightweight post-rebuild step handles import reconciliation and targeted blueprint file updates. Skip full consolidator dispatch — avoids LLM-driven regression in unchanged sections
- Re-entry path: /design SKILL.md needs a rebuild detection path that parses section names from the user's message and routes to the rebuild flow (skip decomposition, re-enter at Phase 2 for matched sections)

### Verification Gate (DSGN-13)
- Gate scope: type-check only (no dev server startup) — catches import errors, missing components, type mismatches. Saves ~5-10s per build
- Silent auto-fix: up to 2 auto-fix attempts. Designer sees nothing if auto-fix succeeds — just "Done! Your prototype is ready."
- Failure UX: section-specific error messages in designer language ("The Product Grid is using a component that isn't available in the Playground")
- Recovery options: "Try a different approach" (rebuild failing section with constraints), "Skip that section and finish" (remove and re-consolidate rest), "Cancel the build"
- Auto-fix scope: limited to the section causing the error, consistent with builder's section-scoped constraint

### Convergent Loop (DSGN-09)
- Architecture: separate agents, loop in orchestrator. Builder.md and reviewer.md unchanged. /design SKILL.md orchestrates: dispatch builder → wait → dispatch reviewer → check result → repeat if needed
- Max iterations: 3 passes. Builder → reviewer counts as one pass
- Progress UX: single progress message per pass, no iteration count. Pass 1: "Building the [section]..." / "Reviewing for accuracy..." Pass 2: "Refining the [section]..." Pass 3: "Final polish on the [section]..."
- Max iterations reached: accept best result and move on. Pipeline continues to next section. Brief note: "Built the [section] — a couple of details didn't match perfectly but it's solid overall."
- Known gaps documented: ESCALATE items collected across all sections, surfaced as summary at build end
- Structured diff: internal only (reviewer conversation output), not written to .dt/ directory
- Reviewer result object: structured JSON-like result with `allPass: boolean`, `escalations: []`, `diff: []` — orchestrator reads mechanically, no prose parsing
- Diff entries include: element, property, expected token, Figma source value, actual value, status (FIXED/FAIL/ESCALATE)
- Diff handoff to builder: orchestrator passes reviewer's `remaining` + `escalations` as `reviewFeedback` parameter to builder on pass 2+. Builder reads it as targeted fix list

### Page-Container (DSGN-04, DSGN-05, DSGN-06)
- Full scaffold with stubs: page-container builder creates wrapper div with token styles AND named placeholder stubs for each child section from the decomposer's section list. Subsequent section builders find their stub and replace it via Edit tool
- Stub format: Claude's discretion — choose the most reliable Edit-tool-compatible pattern (comment + data-section div, or similar)
- New Phase 1.5: after decomposition (Phase 1) resolves the section list, a new step runs the page-container builder before Phase 2 research agents. Clean separation
- Layout agent for all modes: page-container gets a layout agent pass in every mode — Figma (frame node), prod-clone (source-layout reads source files), discuss-only (layout agent translates /think's PRD decisions into concrete LAYOUT.md spec). /think captures design intent, layout agent produces spec — clean separation of concerns
- Portal template from library: outer shell (background, outer padding, nav placement, content max-width, inter-section default spacing) comes from a page-templates chapter in playground-conventions. These values are consistent per portal type, not derived from Figma per-build
- Portal selection: AskUserQuestion at Phase 1.5 — "Which portal is this prototype for?" (Retailer / Brand). Answer stored in STATUS.md as `portal_type`. Subsequent builds + rebuilds read from STATUS.md, skip prompt
- Inner layout varies: layout WITHIN the consistent outer container varies per prototype and IS derived from Figma/source/discussion. Portal template defines only the outer shell

### Reviewer Tightening (DSGN-07)
- Full property-to-token cross-reference: for every annotated CSS property in LAYOUT.md, reviewer verifies the built code uses that exact token for that exact property. Not just token name validity — property-to-token mapping
- Diff entries cite token + Figma value: `expected: var(--spacing-section-sm), figmaValue: 12px, actual: var(--spacing-element-lg)` — gives builder full context on pass 2+
- Element mapping: reviewer maps spec selectors to built code via component tree position (matching LAYOUT.md tree structure), not CSS class names or data attributes

### Builder Token Compliance (DSGN-08)
- Always consult library books: builder MUST resolve every styling property through design-system and playground-conventions library books, even for novel compositions. If a token exists for a property category (radius, spacing, color), use it
- Derive tokens when spec doesn't assign them: when LAYOUT.md doesn't specify a token (e.g., discuss-only mode), builder reads library book token tables and selects semantically correct token by category
- Raw values only when genuinely unmapped: only use raw values with TODO comments when the property category genuinely doesn't exist in the token system
- New red flag entries: add token-specific entries to builder's red flags table — "There's no token for this" → check full token table. "I'll use a common CSS value" → common CSS values are NOT tokens. "Novel component so tokens don't apply" → tokens apply to ALL components

### Escalation Summary
- Surfaced at build end: after "Done! Your prototype is ready." append categorized gap summary
- Two categories: "Approximations" (rebuild may improve — token was close but not exact) and "Limitations" (Playground constraint — component or capability doesn't exist)
- Rebuild prompt: "Want me to take another pass at the approximations?" with options: "Yes, rebuild [N sections]" / "No, it's good enough" / "Let me pick which ones"
- Rebuild behavior: same as normal rebuild — full re-run of research → build → review for flagged sections. No special retry logic. Convergent loop may resolve approximations naturally on fresh pass
- New escalation summary generated after rebuild if gaps remain

### Claude's Discretion
- Stub marker format: choose the most reliable Edit-tool-compatible pattern for section stubs in the scaffold
- Post-rebuild lightweight step implementation: how import reconciliation and targeted blueprint updates are handled without the full consolidator
- Verification gate error classification: how auto-fix determines which section caused a type error
- Portal template value derivation: extract actual token values from existing BrandPortalLayout and retailer patterns in the Playground codebase

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `builder.md`: already has red flags table, section-scoped Edit, compile verification — needs convergent loop support via `reviewFeedback` input and token resolution hardening
- `reviewer.md`: already has property-by-property checklist, 2-pass max, ESCALATE mechanism — needs cross-reference tightening and structured result object
- `decomposer.md`: already emits sections with `{name, nodeId, dimensions}` — needs to also emit the frame itself as first section with `type: page-container`
- `/design SKILL.md`: already has Phase 1-5 pipeline — needs Phase 1.5 insertion, convergent loop orchestration in Phase 3, verification gate in Phase 5, and rebuild re-entry path
- `surface-resolver.md`: already resolves prod-clone sections — can emit page-container for prod-clone mode
- `source-layout.md`: already reads source files to produce LAYOUT.md — can handle page-container in prod-clone mode

### Established Patterns
- Agent dispatch: background agents with `quietMode: true`, foreground for user-facing prompts
- Spec files at `.dt/sections/{name}/LAYOUT.md` and `DESIGN.md` — page-container gets its own section directory
- Builder uses Edit tool exclusively (not Write) for section replacement
- STATUS.md stores build state (sections_built, portal_type will be added)
- `surfaceArea: 'Brand' | 'Retailer' | 'Creative' | 'Other'` already exists in prototype registry — maps to portal template selection
- `BrandPortalLayout` shared component exists in `src/components/shared/` — source for brand portal template values

### Integration Points
- playground-conventions library book: new `page-templates` chapter alongside existing `scaffolding` chapter
- LIBRARY.md and BOOK.md manifests: need updating to include new page-templates chapter
- /design SKILL.md Phase 3: loop orchestration replaces current single-pass builder → reviewer
- /design SKILL.md Phase 5: verification gate added before "Done!" message
- /think separation: /think captures layout intent in PRD, layout agent translates to spec — /think doesn't write LAYOUT.md directly

</code_context>

<specifics>
## Specific Ideas

- Page-level container MUST be consistent (like a template) across all prototypes on the same portal — the main container outside the nav has consistent background and outer padding. The layout within varies per prototype.
- Long-term, portal templates should be a library book/chapter — this phase creates it as a new chapter in playground-conventions (foundational, manually authored by Austin, not Librarian-generated)
- Escalation summary should expect designers to want to resolve gaps right away — present an actionable rebuild path, don't just list gaps passively
- Designer never sees iteration counts, agent names, file paths, or internal pipeline mechanics — "Refining the Hero..." not "Pass 2 of 3 on builder agent"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 30-design-hardening*
*Context gathered: 2026-04-14*
