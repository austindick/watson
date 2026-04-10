# Pitfalls Research

**Domain:** Multi-mode input generalization for an established LLM agent pipeline (Watson v1.4)
**Researched:** 2026-04-09
**Confidence:** HIGH — all pitfalls derived from direct audit of Watson's 7 existing agent files, the established pipeline contracts, and known failure modes documented in previous milestone research. No speculative claims.

---

## Critical Pitfalls

### Pitfall 1: Decomposer Has Figma DNA at Its Core — It Cannot Be "Mode-Switched" In-Place

**What goes wrong:**
The decomposer agent is structurally Figma-specific: its role description reads "Parse a Figma frame node tree," every step calls `mcp__figma__get_figma_data`, and its output contract assumes `nodeId` is always present in the section list. If you add a mode parameter (`inputMode: "figma" | "code" | "discuss"`) and branch inside decomposer, you get a single file doing three very different jobs. The foreground dispatch requirement (decomposer must be foreground because it uses AskUserQuestion) exists specifically for Figma flow section approval. Code-reading mode and discuss-only mode have entirely different approval concerns — or no approval at all for discuss-only. Branching inside decomposer makes the agent's critical constraints contradictory and bloats it past the point where its contract is trustworthy.

**Why it happens:**
Developers reaching for the least-code path treat the existing decomposer as "the entry point" and add conditionals rather than recognizing that the input acquisition phase is architecturally different per mode. The decomposer's name ("decomposer") suggests a generic role, but its actual behavior is Figma-specific.

**How to avoid:**
Introduce a new source reader agent that handles code-mode input — reads prod files, outputs a normalized section list matching the same `{name, dimensions}[]` contract that decomposer produces. The decomposer remains untouched and Figma-only. The loupe orchestrator routes to the correct entry agent based on user-selected mode before Phase 1. The output of both paths converges to the same section list shape before Phase 2 begins.

For discuss-only mode, sections already exist from discuss context — no new agent is needed. Loupe already has the `hasFullFrame: false` + `sections[]` path that skips decomposer entirely. Extend that path rather than creating a third branch in decomposer.

**Warning signs:**
- Decomposer file growing beyond its current single-responsibility: parse Figma frame into sections
- A mode parameter appearing in decomposer's inputs table
- `mcp__figma__get_figma_data` calls wrapped in conditional blocks
- Agent critical constraints becoming conditional ("constraint X only applies when mode=figma")

**Phase to address:**
Source reader agent introduction phase. Decide the agent boundary before writing a single line — the source reader must produce output that satisfies the existing section list contract, not a new extended contract.

---

### Pitfall 2: Layout and Design Agents Assume `nodeId` Is Always Present — Code Mode Breaks Silently

**What goes wrong:**
Both `layout.md` and `design.md` accept `nodeId` as their primary input and immediately call `mcp__figma__get_figma_data(fileKey, nodeId)` in Step 3. In code mode, sections come from source file structure — there is no `nodeId`. If the orchestrator passes `nodeId: null` (or omits it), the agents will either fail immediately on the MCP call or, worse, attempt to fabricate layout/design data from training memory. The Figma MCP call is Step 3 in both agents, after library loading — meaning two steps of useful work happen before the critical failure point. The failure will look like a partial success.

**Why it happens:**
The loupe orchestrator currently dispatches layout and design agents only for sections where `referenceType = "figma"`. This guard is in loupe.md Phase 2. If the source reader produces sections with a new `referenceType = "code"`, and the orchestrator's guard isn't updated to treat "code" sections like "figma" sections (i.e., dispatch research agents with source-derived data instead of nodeId), those sections silently fall through to Phase 3 with no LAYOUT.md or DESIGN.md — the null path fallback that was designed for agent failure, not for a new input mode.

**How to avoid:**
The layout and design agents should accept a `referenceData` parameter that is either a `nodeId` string (Figma mode) or a pre-extracted structured object from the source reader (code mode). The agents' Step 3 becomes conditional: if `nodeId` is set, call Figma MCP; if `referenceData` is set, read from that object directly. This keeps the agents' responsibility (convert reference data to spec format) consistent without duplicating the entire agent.

Alternatively — and this is the cleaner option — the source reader agent outputs normalized intermediate files (LAYOUT.md and DESIGN.md equivalents from static analysis) and the loupe orchestrator for code sections skips layout and design agents entirely, pointing builder directly at source reader output. This mirrors how discuss-only sections skip research agents.

**Warning signs:**
- `nodeId: null` being passed to layout or design agents
- Layout agent running but producing a LAYOUT.md with no token mappings (all unmapped) — this is what happens when Step 3 silently fails
- Design agent producing DESIGN.md with only "Unmapped Values" and no Component Mapping rows

**Phase to address:**
Pipeline generalization phase. Audit the Phase 2 dispatch guard in loupe.md explicitly before adding any new `referenceType` value.

---

### Pitfall 3: Static Code Analysis Cannot Recover Rendered Visual State — Drift Is Systematic, Not Random

**What goes wrong:**
The source reader reads TypeScript/React files in the faire/frontend monorepo. It can extract component names, props, and structural relationships from the static AST. It cannot know: which conditional branches are active in the real UI, which CSS-in-JS or Tailwind classes are applied at runtime, what variant props are passed from parent context, what data-driven states the component is typically in. A `ProductCard` component might accept 12 different prop combinations — the source reader has no way to know which combination produces the "main feed" visual. It will pick one (likely the first or the default), and the resulting LAYOUT.md and DESIGN.md will describe a real component in a state that may not match the experience being cloned.

This is not a bug in the source reader — it is a fundamental limitation of static analysis vs. runtime rendering. The problem is that the pipeline has no mechanism to surface this uncertainty. LAYOUT.md and DESIGN.md look authoritative. The builder trusts them completely.

**Why it happens:**
The design for the source reader naturally draws from the Librarian's source-scanning instructions, which were designed for design system components (props, variants, tokens — all statically recoverable). Production UI code has dynamic behavior that the same scanning approach cannot capture.

**How to avoid:**
The source reader agent must annotate its output with uncertainty. Every component row in the DESIGN.md equivalent should include a `Confidence` column: HIGH (exact component + props recovered), MEDIUM (component recovered, props inferred), LOW (structural guess, needs visual verification). The pipeline should not suppress this uncertainty — it should flow through to the builder as a TODO comment, not be silently resolved.

Additionally, the source reader should explicitly document "context assumptions" at the top of its output: "Analyzed ProductCard in default props state. Conditional props X, Y, Z not resolved — visual fidelity depends on runtime context."

Optional user-provided screenshot (noted in PROJECT.md as supported) directly addresses this gap. The orchestrator should prompt for it in code mode: "To improve accuracy, paste a screenshot of the experience you want to clone."

**Warning signs:**
- Source reader output with no uncertainty annotations
- Builder producing a prototype that "looks right at first glance but misses the main use case"
- DESIGN.md Component Mapping with all HIGH confidence but no Unmapped Values — prod code almost always has custom states that don't map perfectly

**Phase to address:**
Source reader agent design phase. The uncertainty annotation scheme must be in the agent spec before any implementation — retrofitting it after the agent is built requires revising the DESIGN.md schema.

---

### Pitfall 4: Discussion-Only Mode Enables Rationalization at Maximum — No External Reference Acts as Anchor

**What goes wrong:**
In Figma mode, the layout agent is anchored by actual Figma data. In code mode, it's anchored by static file analysis. In discussion-only mode, there is no external anchor — the builder receives LAYOUT.md and DESIGN.md files that were written by the discuss agent (or saved-blueprint extraction) based purely on conversation. The builder, which is explicitly prohibited from calling Figma MCP, works from these files faithfully. If the discuss-generated specs contain rationalized component mappings (components that sound right but aren't validated against actual Slate usage), the builder will faithfully implement wrong components with complete confidence.

The existing "rationalization prevention tables" in builder and reviewer address a different failure mode (builder rationalizing when Figma data exists). They don't address the case where the spec itself was generated by rationalization.

**Why it happens:**
The discuss subskill is designed for design exploration, not pixel-accurate spec generation. When a user says "I want a product grid with filters on the left," discuss captures the intent. But mapping that intent to specific Slate components (which FilterGroup variant? which Grid layout pattern?) requires the same accuracy that Figma and code-mode inputs provide via external reference. Without that external reference, the discuss agent is making component mapping decisions on behalf of the Figma or code modes — and it doesn't have the same constraints (exact hex matching, exact token mapping) that those agents enforce.

**How to avoid:**
Discussion-only mode specs must be explicitly marked as intent-level, not implementation-level. The discuss-generated DESIGN.md should include a header: `> DESIGN.md generated from discussion context — component mappings are intent-level and have not been validated against Figma or prod code. Builder should treat all component assignments as [PENDING] for user confirmation.`

The builder must read this marker and apply extra caution: for each component row from a discuss-generated spec, add a comment `/* from discuss — unvalidated */` rather than treating it as authoritative. The reviewer should flag these rather than pass them.

Separately, the discuss subskill should prompt the user before building: "This build is based on our discussion only — no Figma frame or prod code reference. Component and token choices will be my best interpretation of your description. Want to add a reference before we build?"

**Warning signs:**
- Discuss-generated DESIGN.md with no Unmapped Values section (real implementations always have edge cases)
- Builder receiving DESIGN.md from discuss with no uncertainty markers
- Reviewer passing all items PASS for a discuss-only build (should be nearly impossible with no external reference)

**Phase to address:**
Discussion-only build path phase. The header marker and builder response to it must be specified before discuss and loupe specs are written — this is a cross-agent contract that can't be retrofitted.

---

### Pitfall 5: Figma Pipeline Regresses When `referenceType` Is Added to the Section List Contract

**What goes wrong:**
The current section list contract is `{name, nodeId, dimensions, parent?}[]`. Adding `referenceType` to this contract is necessary for multi-mode support, but it's a breaking change to every agent that consumes the section list. Decomposer produces sections without `referenceType` (it only handles Figma). The loupe orchestrator currently reads `sections[]` from decomposer output and from discuss context — neither of those paths sets `referenceType`. If the orchestrator adds a Phase 2 guard based on `referenceType`, but the existing Figma path doesn't set `referenceType: "figma"`, the guard fails silently and Figma sections fall through as if they were discuss-only — skipping layout and design agents.

**Why it happens:**
Backward compatibility in schema evolution is easy to miss when the "new" case is what gets built first. The source reader sets `referenceType: "code"`. The discuss path sets `referenceType: "discuss-only"`. But the decomposer output (Figma) was written before this field existed and never sets it. The guard `if referenceType === "figma"` silently becomes false for all decomposer output.

**How to avoid:**
Default `referenceType` to `"figma"` when absent. Add this rule explicitly to the loupe orchestrator's Phase 1 receive step: "If a section entry has no `referenceType` field, treat it as `referenceType: "figma"`." This preserves backward compatibility with decomposer output.

Then update decomposer to set `referenceType: "figma"` explicitly on its output, so the implicit default is only a safety net, not the primary mechanism.

Write a single integration test case that verifies Figma mode still dispatches layout and design agents for sections with `referenceType` absent — before any new mode ships.

**Warning signs:**
- Figma pipeline test builds producing correct-looking code but no `.watson/sections/{name}/LAYOUT.md` or `DESIGN.md` files
- Reviewer receiving null paths for layout and design that previously always had values
- Builds completing suspiciously fast in Figma mode (builder got null specs, fell back to training memory)

**Phase to address:**
Pipeline generalization phase. Schema evolution must be backward-compatible by design before any new `referenceType` value is introduced. The Figma regression test must pass before source reader or discuss-only paths are added.

---

### Pitfall 6: Codebase-Map Book Goes Stale Immediately in a Monorepo

**What goes wrong:**
The faire/frontend monorepo is large and actively developed. A codebase-map book generated today will have wrong paths, removed components, and renamed modules within weeks. When the source reader consults the book to navigate to a specific experience's files, it follows stale paths and either reads the wrong files or produces "file not found" errors. The Librarian's fast-path optimization (skip re-scan if source hash is unchanged) will keep the book perpetually stale because a large monorepo's hash changes every day — which triggers a full rescan that takes too long to be practical. Both options (fast-path-too-aggressive and full-rescan-too-slow) produce the same outcome: the book is either stale or unusable.

**Why it happens:**
The design system book that the Librarian currently manages is read-only, curated source (Slate component files that change infrequently and in predictable ways). The codebase-map book tracks the monorepo's directory structure, component locations, and route-to-file mappings — this is high-churn data that behaves nothing like design system source. The same scan-and-hash strategy doesn't apply.

**How to avoid:**
The codebase-map book should be scoped narrowly: not "map the entire monorepo" but "index the entry points for major product areas and their primary component files." This reduces the surface area from thousands of files to hundreds.

The book should include explicit "last verified" dates per entry and mark entries as "stale after N days" rather than relying on hash-based freshness. The source reader, when consulting the book, should warn if an entry was last verified more than 30 days ago: "Path may be stale — last verified 2026-03-01. Proceeding, but verifying file exists before reading."

Additionally, the source reader should always verify that the path from the book actually exists before reading it. A stale path that produces a clear "file not found" error is recoverable. A stale path that resolves to the wrong file is not.

**Warning signs:**
- Codebase-map book BOOK.md `last_updated` more than 2 weeks old
- Source reader finding components at book-specified paths that don't match the experience being cloned
- Librarian update mode taking more than 2 minutes (sign the scope is too broad)

**Phase to address:**
Codebase-map book design phase. Scope and freshness strategy must be decided before the first generation run — these are not adjustable after the book shape is established.

---

### Pitfall 7: The Interaction Agent Is Doubly Figma-Specific and Cannot Handle Code Mode

**What goes wrong:**
The interaction agent has two Figma dependencies, not one. The obvious one: it calls `mcp__figma__get_figma_data` with the section `nodeId` to identify which DS components are present. The non-obvious one: its output (Tier 1 table) derives component state lists from the design system CHAPTER.md, where each component page has a `## States` section. This two-step process (Figma fetch → component identification → library lookup → states table) is the core loop. In code mode, there is no `nodeId`. The component identification step must come from the source reader output instead.

The interaction agent's critical constraints list begins "Component detection uses direct Figma MCP fetch via nodeId." This is load-bearing — the entire agent is designed around this. Without that fetch, Step 1 produces nothing, Tier 1 is empty, and the agent falls into fallback mode (library-defaults-only), discarding the component context that code analysis could have provided.

**Why it happens:**
Same as the layout/design agents: nodeId is a shared parameter across all research agents, and each was designed with Figma as the only input mode. The interaction agent is more Figma-coupled than the others because its component detection logic is not in the spec file — it's in the live MCP fetch.

**How to avoid:**
In code mode, the source reader should output a component list as part of its normalized section data — the same information the interaction agent extracts from Figma. The interaction agent should accept this as an alternative to its own Figma fetch: if `componentList` is provided in section parameters, skip Step 1 and use it directly. If not, fall back to Figma fetch (for Figma mode).

This requires the section list contract to carry component metadata for code-mode sections, which extends the contract. Design this extension carefully to avoid the backward-compatibility problem described in Pitfall 5.

**Warning signs:**
- Interaction agent receiving sections with `referenceType: "code"` but no `componentList`
- INTERACTION.md for code-mode sections showing the fallback blockquote "No custom interaction context provided — library component defaults only" even though the source reader extracted real components
- Tier 1 table in code-mode INTERACTION.md is empty

**Phase to address:**
Source reader agent design phase. The component list output must be in the source reader's contract before interaction agent generalization is designed — the two are a matched pair.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Add mode branching inside decomposer rather than creating a source reader agent | Less new code | Decomposer violates single responsibility; critical constraints become conditional; Figma path harder to reason about | Never — the input acquisition phase is architecturally different per mode |
| Pass `nodeId: null` to existing layout/design agents for code-mode sections | No agent API changes | Silent fallback to training memory; plausible-looking but wrong specs | Never — null nodeId means the agent generates from memory, not reference |
| Skip uncertainty annotation in source reader output | Simpler output schema | Builder treats static-analysis output as authoritative; code-mode builds overstate their accuracy; no way to identify which sections need human validation | Never for the first implementation — uncertainty is load-bearing context |
| Generate a full monorepo map (all packages, all routes) for the codebase-map book | Maximum coverage | Scan takes 10+ minutes; book goes stale within days; maintenance tax eliminates value within weeks | Never — scope to product area entry points only |
| Treat discuss-generated specs as equivalent to Figma-generated specs | One code path for builder | Rationalized component mappings get treated as authoritative; no uncertainty signal reaches builder or reviewer | Never — discuss intent != validated Figma or code reference |
| Default `referenceType` to "discuss-only" when absent | Safer than assuming Figma | Existing Figma pipeline breaks (research agents never dispatch) | Never — default to "figma" for backward compatibility |

---

## Integration Gotchas

Common mistakes when connecting new modes to the existing pipeline.

| Integration Point | Common Mistake | Correct Approach |
|-------------------|----------------|------------------|
| Section list contract extension | Add `referenceType` without backward-compat default | Default to "figma" when absent; update decomposer to set it explicitly; write regression test before shipping |
| Source reader → interaction agent | Source reader omits component list from output | Source reader must output `componentList[]` as part of section data; interaction agent reads it instead of Figma-fetching in code mode |
| Discuss-only path → builder | Builder receives discuss-generated DESIGN.md without uncertainty markers | Discuss must set a header marker; builder must read and respond to it with lighter-weight trust |
| Codebase-map book → source reader | Source reader treats book paths as ground truth | Source reader must verify each book path exists before reading; log stale paths; continue with available files |
| Multi-mode entry (loupe Phase -1) | All three modes share one AskUserQuestion flow | Each mode has a meaningfully different follow-up: Figma needs URL, code needs experience description + screenshot optional, discuss-only needs confirmation. Design mode-specific flows, not a generic brancher |
| Source reader output format | Source reader writes its own novel schema | Source reader must output LAYOUT.md and DESIGN.md files that match the existing schemas in LAYOUT-EXAMPLE.md and DESIGN-EXAMPLE.md. No novel schemas — builder and reviewer are hardwired to those shapes |

---

## Performance Traps

Patterns that work at small scale but fail as monorepo usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Reading entire component file trees from faire/frontend | Source reader takes 5+ minutes; context window fills with irrelevant code | Source reader should read only the specific component files identified by the codebase-map book, not whole directories | First use against a component with deep imports (third-party + local) |
| Full Librarian rescan of monorepo after each deployment | Codebase-map update blocks pipeline for minutes | Use narrow scope (product area entry points, not all packages); use update mode with directory-level hashing | When source reader is first set up against the full monorepo |
| Source reader reading every import chain recursively | Context fills with utility components, not the target experience | Limit to 2 levels of import resolution; stop at design system component boundaries | Any component that imports from a shared utils package |

---

## UX Pitfalls

Common experience mistakes for this multi-mode feature.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Asking "Figma frame, existing experience, or describe it?" without explaining what happens in each mode | Designers don't know which to pick; "existing experience" sounds like screenshot cloning (which is out of scope) | Frame as outcomes: "Build from Figma frame," "Clone from prod (file reading)," "Build from our discussion" — then briefly explain the accuracy trade-offs |
| Presenting discuss-only build as equivalent accuracy to Figma build | Designers trust the output as pixel-accurate when it isn't | Surface accuracy expectations upfront: "Building from discussion — component choices will be my best interpretation; no external reference means more review needed" |
| Stale codebase-map book silently producing wrong file paths | Source reader reads wrong components; prototype looks vaguely right but clones the wrong experience | Show which files were read in the progress output for code mode; make the reference visible so mismatch is detectable |
| Multi-mode entry flow that's too long before building starts | Designers who just want to build from Figma (the proven path) now have extra steps | Detect Figma URL in the opening message and skip mode selection entirely — only prompt for mode when no URL is provided |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Source reader → existing spec schema:** Source reader outputs files that match LAYOUT-EXAMPLE.md and DESIGN-EXAMPLE.md exactly — verify by running builder on source reader output with no modifications
- [ ] **Backward compatibility gate:** Figma pipeline integration test passes before any new referenceType is introduced — verify that `.watson/sections/{name}/LAYOUT.md` and `DESIGN.md` are produced for Figma sections after the contract extension
- [ ] **Uncertainty propagation:** Code-mode DESIGN.md output includes Confidence column and source reader annotation header — verify builder reads and responds to the header with `/* from code analysis — unvalidated */` comments
- [ ] **Discuss-only marker contract:** Discuss-generated blueprint files include intent-level header marker; builder has a step that reads for this marker before applying spec data — verify by tracing builder Step 1 for a discuss-only build
- [ ] **Codebase-map staleness handling:** Source reader verifies each book path exists before reading; logs warning for stale paths; does not silently read wrong file — verify by giving it a deliberately stale entry
- [ ] **Interaction agent code-mode path:** Interaction agent uses `componentList` from section data when present, skips Figma MCP fetch — verify INTERACTION.md Tier 1 table is populated for code-mode sections without a nodeId
- [ ] **Mode selection skips when Figma URL present:** Loupe Phase -1 detects Figma URL in opening message and routes directly to Figma path — verify existing Figma builds don't acquire new friction from mode selection UI

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Decomposer modified with mode branching, now violating single responsibility | HIGH | Extract code-mode and discuss-only entry logic back to source reader agent; restore decomposer to its original contract; update loupe orchestrator routing |
| Figma pipeline regressed (research agents not dispatching after contract extension) | MEDIUM | Add backward-compat default (`referenceType = "figma"` when absent) to Phase 1 of loupe orchestrator; existing sections lists from decomposer begin working again without changes |
| Source reader output schema diverged from LAYOUT-EXAMPLE.md | HIGH | Source reader must be rewritten to output the fixed schema — builder cannot be modified to accept a novel schema without breaking the reviewer too |
| Discuss-only build shipped without uncertainty markers — users treating output as pixel-accurate | MEDIUM | Add intent-level header to discuss spec generation; add builder step to read for it; note in user-facing output that discuss builds need more review |
| Codebase-map book generated for full monorepo scope — too large to maintain | MEDIUM | Regenerate with narrow scope (product area entry points only); archive the full-scope book for reference; update source reader to use narrowed book |
| Interaction agent not identifying components in code mode — Tier 1 always empty | MEDIUM | Update source reader to add componentList to its output; update interaction agent to use it; re-run code-mode builds |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Decomposer modified with mode branching (Pitfall 1) | Source reader agent introduction phase — establish agent boundary in spec before writing code | Decomposer file line count unchanged after source reader phase; source reader outputs valid section list |
| Layout/design agents receiving null nodeId (Pitfall 2) | Pipeline generalization phase — audit Phase 2 dispatch guard in loupe.md before adding new referenceType values | LAYOUT.md and DESIGN.md present for code-mode sections without calling Figma MCP |
| Static analysis drift from rendered output (Pitfall 3) | Source reader agent design phase — uncertainty annotation scheme in spec first | Code-mode DESIGN.md has Confidence column; context assumptions header present |
| Discussion-only rationalization (Pitfall 4) | Discussion-only build path phase — cross-agent marker contract spec before implementation | Discuss-generated DESIGN.md has intent-level header; builder inserts `/* from discuss */` comments; reviewer flags discuss-mode outputs differently |
| Figma pipeline regression from schema extension (Pitfall 5) | Pipeline generalization phase — backward-compat default rule added before any new referenceType | Integration test passes: Figma mode sections produce LAYOUT.md and DESIGN.md after referenceType field is added to contract |
| Codebase-map book going stale (Pitfall 6) | Codebase-map book design phase — scope and freshness strategy decided before first generation | Book scope limited to product area entry points; source reader logs stale path warnings; book includes per-entry last_verified dates |
| Interaction agent empty Tier 1 in code mode (Pitfall 7) | Source reader agent design phase — componentList output in source reader contract before interaction agent generalization | Code-mode INTERACTION.md has populated Tier 1 table without Figma MCP being called |

---

## Sources

- Direct audit: `skills/core/agents/decomposer.md` — Figma-specific role, nodeId contract, mcp__figma__get_figma_data dependency (HIGH confidence)
- Direct audit: `skills/core/agents/layout.md` — Step 3 Figma fetch is primary data source, no alternative input path (HIGH confidence)
- Direct audit: `skills/core/agents/design.md` — Step 3 Figma fetch, exact hex matching, all three data categories require live Figma response (HIGH confidence)
- Direct audit: `skills/core/agents/interaction.md` — critical constraint 4: "Component detection uses direct Figma MCP fetch via nodeId"; Step 1 Figma fetch is the component identification mechanism (HIGH confidence)
- Direct audit: `skills/core/agents/builder.md` — Step 1 amendment filter, spec-trust architecture, rationalization prevention tables (HIGH confidence)
- Direct audit: `skills/core/agents/reviewer.md` — mechanical checklist from spec rows, no external reference consulted (HIGH confidence)
- Direct audit: `skills/core/skills/loupe.md` — Phase 2 dispatch guard (`referenceType = "figma"` check), discuss-only section handling, section list contract (HIGH confidence)
- Direct audit: `skills/core/agents/librarian.md` — source_hash fast-path, generate vs update mode scan strategy (HIGH confidence)
- Direct audit: `skills/core/references/source-scanning.md` — component scanning approach designed for design system source, not prod UI (HIGH confidence)
- Direct audit: `skills/core/references/agent-contract.md` — section list contract `{name, nodeId, dimensions, parent?}[]`, no referenceType field currently (HIGH confidence)
- `.planning/PROJECT.md` — multi-mode goals, discussion-only build path, optional screenshot, codebase-map book, source-agnosticism proof from FauxDS→Slate migration (HIGH confidence)
- Previous milestone PITFALLS.md (v1.2) — rationalization prevention tables already exist in builder, reviewer, orchestrator; known issue: Slate import resolution TBD (HIGH confidence)

---
*Pitfalls research for: Multi-mode input generalization for Watson Loupe pipeline (v1.4)*
*Researched: 2026-04-09*
