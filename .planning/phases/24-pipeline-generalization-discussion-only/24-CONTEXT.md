# Phase 24: Pipeline Generalization & Discussion-Only - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

The Loupe orchestrator presents a multi-mode entry prompt, routes prod-clone sections to source agents in parallel, and supports a discussion-only build path without external reference. Phase 24 modifies loupe.md, SKILL.md, and discuss.md — it does NOT modify any agent files (source agents, Figma agents, builder, reviewer, consolidator are all unchanged).

</domain>

<decisions>
## Implementation Decisions

### Multi-Mode Entry Flow
- Mode prompt lives in loupe.md Phase -1 (not SKILL.md) — 3 options: Figma frame, existing experience, describe it
- Auto-detect from user's message: Figma URL → skip to Figma mode, experience name → skip to prod-clone mode. Only show 3-mode prompt when message is bare `/watson:loupe`
- Experience name collected inline in loupe Phase -1 via AskUserQuestion (named experience menu from Phase 22), then passed to surface-resolver as `experienceName`
- Explicit `mode` parameter added to loupe inputs: `'figma' | 'prod-clone' | 'discuss-only'`. SKILL.md sets it based on Tier classification. loupe skips Phase -1 mode prompt when mode is pre-set
- Experience references in user message (e.g., "build from Order List") classified as Tier 2 in SKILL.md (direct to loupe), matching Figma URL shortcut behavior
- Per-section routing in Phase 2: each section dispatches by its own `referenceType` independently. Figma → Figma agents, prod-clone → source agents, discuss-only → skip research. All in the same dispatch wave (PIPE-05)
- Codebase-map book loaded conditionally in Phase 0 — only when mode is prod-clone or hybrid. Figma and discuss-only modes skip it

### Discussion-Only Build Experience
- loupe dispatches discuss.md with `describeOnly=true` flag when user picks "describe it"
- discuss.md assesses prompt quality adaptively (reusing existing Complexity Scaling logic): sufficient description → auto-return `ready_for_build` with no confirmation gate; vague description → mini-discussion; very vague → fuller discussion
- INTERACTION.md populated only if the adaptive session covers interactions; otherwise left null for builder to infer from component choices + library defaults
- Discuss-only sections write to blueprint/ directly (no .watson/sections/ staging) — same as current behavior

### Hybrid Build Detection
- When a "describe it" prompt references a known surface from the codebase-map book (e.g., "I want to build a new promotions banner on the Products page"), discuss auto-detects hybrid mode and confirms with user: "Looks like you want to build on the Products page. I'll pull the existing layout and we'll add your changes on top."
- discuss loads codebase-map book in `describeOnly` mode to enable surface name matching
- discuss returns new status `ready_for_hybrid_build` with `{surfaceName, sections: [...discuss-only sections...]}`
- SKILL.md handles the hybrid chain: reads `ready_for_hybrid_build`, dispatches loupe with `mode='prod-clone'`, `surfaceName`, and discuss-only sections
- loupe skips Phase -1 when inputs are pre-resolved (mode + surfaceName + sections from SKILL.md)
- loupe runs surface-resolver for the base sections, merges with discuss-only sections, proceeds with mixed referenceTypes in one build

### Intent Markers & Certainty
- Each artifact (LAYOUT.md, DESIGN.md, INTERACTION.md) includes a `Reference:` header line indicating source: `figma`, `prod-clone`, or `discuss-only`
- Builder reads `Reference:` line and adjusts behavior: for `discuss-only`, uses library book values (standard Slate spacing, sizing, component defaults) for anything not explicitly specified. No guessing, no interpolation, no asking
- Consolidator preserves per-section `Reference:` markers in mixed-mode builds — sections retain their individual source markers after consolidation

### Screenshot Handling
- Inline skip-friendly prompt after surface-resolver section approval, before Phase 2 dispatch: "Have a screenshot of this page? It helps me match the layout more accurately, but it's totally optional." Options: "I'll share one" / "Skip, build without"
- Screenshot prompt appears for any build with at least one prod-clone section (including hybrid builds)
- Screenshot saved to `.watson/screenshot.png` in the prototype directory
- On subsequent builds, reuse existing screenshot silently — only prompt again if no screenshot exists

### Claude's Discretion
- Exact wording of the 3-mode prompt in Phase -1
- How surface-resolver results merge with discuss-only sections in the sections[] array
- Progress message wording for prod-clone and discuss-only builds
- Exact auto-detection heuristics for Figma URLs and experience name references in user messages
- How discuss determines "sufficient" vs "needs more discussion" for prompt quality assessment

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- loupe.md Phase -1: already handles standalone setup with Figma URL detection — extend with mode prompt and experience name collection
- discuss.md Phase 2 (Complexity Scaling): already assesses clearly simple / clearly complex / ambiguous — reuse for describeOnly adaptive depth
- discuss.md Discuss-Only Build Path: already populates LAYOUT.md + DESIGN.md from conversation + library books for discuss-only sections
- discuss.md Reference Inventory: already tracks referenceType per section and manages the section list
- discuss.md Loupe Handoff: already returns structured JSON status — extend with `ready_for_hybrid_build`
- SKILL.md Discuss → Loupe Chain: already reads discuss return status and dispatches loupe — add hybrid case
- surface-resolver.md: already a foreground agent with AskUserQuestion for experience lookup + section approval
- agent-contract.md: already has mode parameter documented for surface-resolver

### Established Patterns
- SKILL.md stays routing-only (< 215 lines) — intent classification + dispatch, no execution logic
- loupe.md Phase -1 handles all standalone setup; skipped when SKILL.md provides inputs
- discuss never dispatches agents — returns status to orchestrator
- Per-section routing by referenceType already works for figma + discuss-only in loupe Phase 2
- Library resolution (Phase 0) reads LIBRARY.md and selects books — extend with conditional codebase-map inclusion

### Integration Points
- loupe.md: new `mode` input parameter; Phase -1 extended with 3-mode prompt; Phase 0 conditional codebase-map; Phase 1 routes to decomposer or surface-resolver by mode; Phase 2 per-section dispatch by referenceType
- SKILL.md: Tier 2 classification extended for experience references; Discuss → Loupe Chain extended with `ready_for_hybrid_build` case
- discuss.md: new `describeOnly` input flag; codebase-map loaded in describeOnly mode; hybrid detection + `ready_for_hybrid_build` return status; auto-return for sufficient prompts
- Artifact schemas: new `Reference:` header line in LAYOUT.md, DESIGN.md, INTERACTION.md
- builder.md: reads `Reference:` line to determine library-first default behavior (behavioral note, not code change — builder already falls back to library defaults for missing values)
- consolidator.md: preserves per-section `Reference:` markers (behavioral note)

</code_context>

<specifics>
## Specific Ideas

- Hybrid detection should feel natural: "Looks like you want to build on the Products page" — not a modal or formal mode switch
- The 3-mode prompt should be designer-friendly language, not technical terms: "Start from a Figma frame", "Clone an existing experience", "Describe what you want"
- Auto-detection means the mode prompt rarely appears in practice — power users who paste URLs or name experiences skip it entirely
- Screenshot prompt should feel like a helpful suggestion, not a requirement: "totally optional" language

</specifics>

<deferred>
## Deferred Ideas

- Tier 2 mode inference from message content without explicit mode prompt (PIPE-F1) — auto-detect reference type from natural language without any prompt at all. Current auto-detection is a step toward this but still shows the prompt for ambiguous cases.
- Automated screenshot capture for prod surfaces (SCRN-F1) — blocked on SSO/auth complexity
- Cached surfaces library book (CACH-F1) — pre-built templates of common experiences

</deferred>

---

*Phase: 24-pipeline-generalization-discussion-only*
*Context gathered: 2026-04-10*
