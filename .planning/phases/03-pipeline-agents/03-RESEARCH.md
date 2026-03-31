# Phase 3: Research Agents - Research

**Researched:** 2026-03-25
**Domain:** Figma auto-layout extraction, FauxDS token mapping, parallel Claude Code agent dispatch, agent file authoring
**Confidence:** HIGH

---

## Summary

Phase 3 implements Agent 1 (Layout) and Agent 2 (Tokens) — replacing their placeholder `.md` files with full operational instructions. Agent 3 (Interactions) is deferred to a follow-up milestone per CONTEXT.md. The two agents run in background in parallel per section and produce validated LAYOUT.md and DESIGN.md files conforming to the locked canonical schemas.

Agent 1 fetches section Figma data via `mcp__figma__get_design_context`, reads `fauxds-library.md` for spacing/radius token vocabulary, and maps every auto-layout px value to a `--faux-spacing-*` or `--faux-radius-*` token. Any spacing value without an exact match is mapped to the nearest token with a `/* Figma: Xpx */` comment. The output is a LAYOUT.md under 80 lines with Token Quick-Reference table, Component Tree (indented ASCII), and Annotated CSS.

Agent 2 fetches the same section's Figma data, reads `fauxds-library.md` for components and design tokens, maps every visual element to a FauxDS component (with exact variant and props) or to a `--faux-*`/`--slate-*` color token. Colors require exact hex match — no rounding. Typography maps to named presets. Everything without a FauxDS equivalent goes in an Unmapped Values section. Output is a DESIGN.md under 80 lines. Both agents read any existing `.loupe/LAYOUT.md` / `.loupe/DESIGN.md` for vocabulary consistency before writing.

The parallel dispatch timing verification is a first-class deliverable for this phase — addressing the known silent-serialization bug (#7406) documented in PITFALLS.md. The smoke test must log agent start/end timestamps and confirm total time approximates single-agent time, not 2x.

**Primary recommendation:** Implement Agents 1 and 2 as separate plan tasks. Both agents call `get_design_context` on a scoped nodeId; both stay under 2,500 tokens in file length. The smoke test plan verifies parallel dispatch timing and artifact schema compliance.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Agent 3 deferral:**
- Agent 3 (Interactions) is deferred to a follow-up milestone — not part of Phase 3 or v1
- INTR-01 through INTR-07 requirements move out of this phase
- PARA-01 and PARA-02 simplify: both agents run in background, no foreground agent
- Phase 4 builder works from LAYOUT.md + DESIGN.md only (no INTERACTIONS.md)

**Token matching — spacing and layout values:**
- Map to nearest FauxDS token when no exact match exists
- Always include `/* Figma: Xpx */` comment noting the original Figma value
- No delta magnitude classification — just note the original, reviewer sees the gap themselves
- Unmapped elements (no FauxDS component match at all) go in Unmapped Values section with build hints: raw Figma values, suggested CSS approach, and a "custom implementation" note

**Token matching — colors:**
- Exact hex match only — no rounding to nearest color token
- If a Figma hex value doesn't exactly match a FauxDS color token, it goes to Unmapped Values
- Rationale: color mismatches are more visually noticeable than spacing deltas

**Existing vocabulary influence:**
- Agents always read `fauxds-library.md` before starting (baseline vocabulary)
- If existing `.loupe/LAYOUT.md` or `.loupe/DESIGN.md` exists, prefer consistency with established mappings
- On conflict (existing vocabulary disagrees with new Figma data): Figma wins, agent adds a comment noting the inconsistency — consolidator (Phase 5) resolves later
- First run (no `.loupe/` files): `fauxds-library.md` is the sole vocabulary source

**Smoke test:**
- User will provide a Figma frame URL with sufficient complexity (auto-layout, mixed spacing, FauxDS-matchable + unmapped elements)
- Smoke test must verify parallel dispatch timing: total time ≈ single-agent time, not 2x
- Log agent start/end timestamps to detect serialization

### Claude's Discretion
- Figma data fetch depth strategy for Agents 1 and 2
- How agents handle nested auto-layout containers
- Agent prompt structure and instruction organization
- Error handling when Figma MCP calls fail
- Exact format of vocabulary conflict comments

### Deferred Ideas (OUT OF SCOPE)
- Agent 3 (Interactions) — full interactive interview, Watson pre-gathered context mode, infer-only mode — deferred to follow-up milestone
- INTR-01 through INTR-07 requirements — moved to follow-up milestone
- INTERACTIONS.md artifact generation — not produced until Agent 3 is built
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LAYT-01 | Agent 1 extracts every auto-layout property from Figma section data (direction, spacing, padding, alignment, sizing mode, min/max) | `get_design_context` returns structured layout properties including flexDirection, itemSpacing, padding, primaryAxisAlignItems, counterAxisAlignItems, layoutSizingHorizontal/Vertical, min/maxWidth/Height |
| LAYT-02 | Agent 1 converts each property to CSS flexbox or grid rules with design token mapping | Token mapping table in fauxds-library.md: `--faux-spacing-1` through `--faux-spacing-12`, `--faux-radius-sm/md/lg/xl`; nearest-match rule with Figma comment |
| LAYT-03 | Agent 1 reads `fauxds-library.md` tokens section before starting; reads existing `.loupe/LAYOUT.md` for vocabulary consistency | Both paths are inputs in the existing placeholder contract; vocabulary conflict rule is locked: Figma wins, add comment |
| LAYT-04 | Agent 1 produces LAYOUT.md under 80 lines per section with token quick-reference table, component tree, and annotated CSS | LAYOUT-EXAMPLE.md is the canonical schema; three sections required: Token Quick-Reference, Component Tree (indented ASCII), Annotated CSS |
| TOKN-01 | Agent 2 determines which FauxDS component to use for each visual element (with specific variant, size, and props) | fauxds-library.md Components table lists FauxButton, FauxBadge, FauxCard, FauxInput, FauxStack with variants, sizes, key props |
| TOKN-02 | Agent 2 maps all colors to CSS variable tokens and all text styles to typography presets | Color tokens: `--faux-color-*` and `--slate-*` prefix; Typography: `--faux-type-*` presets; exact hex match rule for colors |
| TOKN-03 | Agent 2 flags elements that don't match FauxDS components as custom implementation needed | Unmapped Values section required in DESIGN.md; format: Element, Property, Raw Value, Notes (with CSS approach hint) |
| TOKN-04 | Agent 2 reads `fauxds-library.md` components/tokens sections before starting; reads existing `.loupe/DESIGN.md` for consistency | Same vocabulary-first pattern as Agent 1; conflict resolution: Figma wins + comment |
| TOKN-05 | Agent 2 produces DESIGN.md under 80 lines per section with component mapping, typography specs, color tokens, and gap analysis | DESIGN-EXAMPLE.md is the canonical schema; four sections: Component Mapping, Typography, Color Tokens, Unmapped Values |
| PARA-01 | Agents 1 and 2 dispatch simultaneously per section (not sequentially) | Both are background-dispatched; no foreground agent in Phase 3; timing test required to verify actual parallelism |
| PARA-02 | (simplified from original) Both agents run in background — no foreground agent in Phase 3 | Agent 3 deferred; both agents write to different files (LAYOUT.md vs DESIGN.md) — no write collision possible |
| PARA-03 | Agent 4 waits for both parallel agents to complete before starting | Phase 4 dependency; Phase 3 delivers agents that write to distinct paths so Phase 4 can safely read both |
| REFS-03 | Agents 1 and 2 read relevant `fauxds-library.md` sections before starting work | Locked in agent constraints; Agent 1 reads Design Tokens section; Agent 2 reads Components, Design Tokens, Typography sections |
</phase_requirements>

---

## Standard Stack

### Core

| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| `mcp__figma__get_design_context` | Figma plugin v2.0.2 | Fetch full layout/style/component data for a specific nodeId | Primary tool for detailed per-section data; returns structured React+Tailwind representation that includes auto-layout properties, typography, colors, components |
| `mcp__figma__get_metadata` | Figma plugin v2.0.2 | Fallback if `get_design_context` response is truncated; provides node map to identify child nodeIds | Cheap high-level map; used when the section is too large for a single `get_design_context` call |
| `fauxds-library.md` | Project reference | Design system token and component vocabulary | Agents read this before mapping; locked decision; located at `~/.claude/skills/loupe/references/fauxds-library.md` |
| Markdown `.md` agent file | — | Agent instruction document | Standard Loupe format per Phase 1 scaffold; self-contained, under 2,500 tokens |

### MCP Tool Clarification (CRITICAL — same as Phase 2)

| Correct Name | Role | Notes |
|---|---|---|
| `mcp__figma__get_design_context` | Primary data fetch for research agents | Returns structured design data including auto-layout, colors, typography, component info |
| `mcp__figma__get_metadata` | Fallback / overflow handling | XML node map only; use when `get_design_context` is too large |
| `mcp__figma__get_screenshot` | Visual reference (Agent 1/2 may optionally use) | Not required for spec writing; useful for validation |

**`get_design_context` key properties returned (HIGH confidence — from figma-implement-design SKILL.md):**
- Layout: `flexDirection`, `itemSpacing`, `padding`, `primaryAxisAlignItems`, `counterAxisAlignItems`, `layoutSizingHorizontal/Vertical`, `minWidth/maxWidth/minHeight/maxHeight`
- Typography: font family, size, weight, line-height, letter-spacing
- Colors: fill hex values, stroke hex values
- Components: component name, variant, props when linked via Code Connect

### FauxDS Token Reference (from fauxds-library.md)

**Spacing tokens:**
| Token | Value |
|-------|-------|
| `--faux-spacing-1` | 4px |
| `--faux-spacing-2` | 8px |
| `--faux-spacing-3` | 12px |
| `--faux-spacing-4` | 16px |
| `--faux-spacing-6` | 24px |
| `--faux-spacing-8` | 32px |
| `--faux-spacing-12` | 48px |
| `--faux-width-content` | 1200px (layout) |

**Radius tokens:** `--faux-radius-sm` (4px), `--faux-radius-md` (8px), `--faux-radius-lg` (12px), `--faux-radius-xl` (16px)

**Typography presets:** `--faux-type-display` (36px/700), `--faux-type-heading-lg` (24px/600), `--faux-type-heading-md` (20px/600), `--faux-type-body-lg` (16px/400), `--faux-type-body-md` (14px/400), `--faux-type-body-sm` (12px/400), `--faux-type-label` (12px/500)

**Color tokens:** `--faux-color-primary-500` (#6366f1), `--faux-color-primary-600` (#4f46e5), `--faux-color-neutral-*`, `--faux-color-success-500`, `--faux-color-error-500`, `--faux-color-white`; Slate tokens: `--slate-50`, `--slate-900`

---

## Architecture Patterns

### Recommended Agent File Structure

Both agent files follow the same structure as `00-decomposer.md` — front-load critical constraints, keep under 2,500 tokens.

```
agents/01-layout.md:
  frontmatter (name: agent-01-layout)
  ## Role (1 sentence)
  ## Critical Constraints (FIRST — before execution steps)
  ## Inputs / Outputs
  ## Execution
    ### Step 1: Read fauxds-library.md tokens section
    ### Step 2: Read existing .loupe/LAYOUT.md if present
    ### Step 3: Fetch section Figma data via get_design_context
    ### Step 4: Build Token Quick-Reference table
    ### Step 5: Build Component Tree (indented ASCII)
    ### Step 6: Build Annotated CSS
    ### Step 7: Enforce 80-line budget
  ## Output Format (LAYOUT.md schema)

agents/02-tokens.md:
  frontmatter (name: agent-02-tokens)
  ## Role (1 sentence)
  ## Critical Constraints (FIRST)
  ## Inputs / Outputs
  ## Execution
    ### Step 1: Read fauxds-library.md components + design tokens + typography sections
    ### Step 2: Read existing .loupe/DESIGN.md if present
    ### Step 3: Fetch section Figma data via get_design_context
    ### Step 4: Build Component Mapping table
    ### Step 5: Build Typography table
    ### Step 6: Build Color Tokens table
    ### Step 7: Build Unmapped Values section
    ### Step 8: Enforce 80-line budget
  ## Output Format (DESIGN.md schema)
```

### Pattern 1: Two-Step Fetch (Overflow Handling)

**What:** Call `get_design_context` first. If response is truncated or produces a tool error, fall back to `get_metadata` to get the node map, then call `get_design_context` on individual child nodeIds.

**When to use:** Any section with complex nesting (5+ nested auto-layout containers, many component instances).

**Example (from figma-implement-design SKILL.md):**
```
Step 1: get_design_context(fileKey, nodeId)  ← try first
Step 2: if truncated → get_metadata(fileKey, nodeId)  ← get node map
Step 3: for each child nodeId → get_design_context(fileKey, childNodeId)  ← targeted fetch
```

### Pattern 2: Token Mapping with Nearest-Match + Comment

**What:** Figma px value → nearest FauxDS token. Raw value preserved as CSS comment.

**Spacing match rule:** Find the `--faux-spacing-*` token whose value is closest to the Figma value. Include original as comment.

**Example:**
```css
.hero {
  gap: var(--faux-spacing-4);     /* Figma: 16px */   /* exact match */
  padding: var(--faux-spacing-3); /* Figma: 13px */   /* nearest: 12px */
}
```

**Color match rule:** Exact hex only. If `#6366f1` is in the token table → `var(--faux-color-primary-500)`. If `#6367f1` is NOT in the table → Unmapped Values section.

### Pattern 3: Vocabulary Conflict Comment

When a new Figma value contradicts an existing `.loupe/LAYOUT.md` or `.loupe/DESIGN.md` mapping:

```css
.element {
  gap: var(--faux-spacing-3);  /* Figma: 12px — conflicts with existing vocab (--faux-spacing-4/16px); Figma wins */
}
```

The conflict is noted inline; the consolidator resolves it in Phase 5.

### Pattern 4: Unmapped Values Section

Used in DESIGN.md for elements with no FauxDS component or color token match:

```markdown
## Unmapped Values

| Element | Property | Raw Value | Notes |
|---------|----------|-----------|-------|
| BackgroundImage | border-radius | 12px | No matching FauxDS radius for image — use `border-radius: 12px` directly |
| Heading | letter-spacing | -0.03em | Outside `--faux-type-display` spec; custom override: `letter-spacing: -0.03em` |
| AccentBar | background-color | #ff6b35 | No FauxDS color token match — custom implementation needed |
```

### Pattern 5: Parallel Background Dispatch Verification

Both agents run as background tasks. The SKILL.md dispatch (Phase 5 concern, but agents must support it) will look like:

```
[SKILL.md orchestrator]
Dispatch Agent 1 BACKGROUND with: nodeId, name, fauxds-library path, existing LAYOUT.md path
Dispatch Agent 2 BACKGROUND with: nodeId, name, fauxds-library path, existing DESIGN.md path
Wait for both to complete
→ proceed to Phase 4
```

**Timing verification requirement:** Smoke test must log timestamps. Total time must be ~1x single-agent time, not 2x.

### Anti-Patterns to Avoid

- **Fetching the page node:** Agents 1 and 2 receive a section nodeId from Agent 0's output. They must call `get_design_context(fileKey, sectionNodeId)` — never fetch the page or the full frame.
- **Hardcoding px values in Annotated CSS:** Every value must be a CSS variable or have a CSS variable with a comment. Never `gap: 16px` without `var(--faux-spacing-4)`.
- **Rounding colors to nearest token:** Colors are exact hex or go to Unmapped Values. No "close enough" color substitution.
- **Omitting the Unmapped Values section:** This section is required in DESIGN.md even if empty (write `_None_`). Omitting it means consuming agents can't distinguish "no unmapped values" from "agent forgot the section."
- **Agent file over 2,500 tokens:** Same pitfall as Agent 0. Front-load constraints. Prune examples.
- **Two agents writing to the same file:** Agent 1 owns LAYOUT.md, Agent 2 owns DESIGN.md. No overlap. This is the isolation that makes parallel safe.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Figma layout data | Custom HTTP calls to Figma REST API | `mcp__figma__get_design_context` | MCP handles auth, rate limits, structured response; REST API requires token management |
| Spacing token lookup | Custom distance/rounding algorithm | Nearest-match table lookup from fauxds-library.md | Token table is small and known; lookup is deterministic; no math needed |
| CSS flexbox translation | Custom mapping logic | Direct property mapping: Figma `HORIZONTAL` → `flex-direction: row`, `VERTICAL` → `flex-direction: column` | Well-known 1:1 mapping; no ambiguity |
| Overflow handling | Custom chunking | Two-step: `get_design_context` → if truncated → `get_metadata` + targeted child calls | Official pattern from figma-implement-design SKILL.md |

---

## Common Pitfalls

### Pitfall 1: Agent Calls get_design_context on Full Frame Instead of Section NodeId

**What goes wrong:** Agent 1 or 2 uses the full frame nodeId (from the Figma URL) instead of the section nodeId provided by Agent 0. Response overflows (25k token limit) or returns data for all sections, not just the assigned one.
**Why it happens:** Agent 0's output contract `{name, nodeId, dimensions}[]` contains per-section nodeIds. Agent 1/2 dispatch must pass the section's nodeId, not the frame nodeId.
**How to avoid:** Agents must use the nodeId passed in the dispatch prompt. Document this explicitly as a critical constraint in both agent files.
**Warning signs:** LAYOUT.md for "Navbar" section contains layout values that belong to the full page; `get_design_context` returns a tool error about response size.

### Pitfall 2: Agent File Instruction Bloat (Inherited from Phase 2)

**What goes wrong:** Mapping logic for all spacing values, all color tokens, and all component variants is documented inline in the agent file. File grows to 3,000+ tokens. Critical constraints at the end are silently ignored.
**Why it happens:** Developers want comprehensive inline reference. Better approach: agent reads fauxds-library.md (the authoritative token table) rather than having tokens duplicated in the agent file.
**How to avoid:** Agents reference fauxds-library.md for the token table — don't reproduce it in the agent file. Target 1,800 tokens, hard ceiling 2,500.
**Warning signs:** Agent file exceeds 2,000 words; LAYOUT.md output missing token comments or using wrong token values.

### Pitfall 3: Color Rounding (Violates Locked Decision)

**What goes wrong:** Agent 2 maps `#6367f1` (not in token table) to `--faux-color-primary-500` (#6366f1) because "it's close." Builder uses the token. The off-by-one hex value is a Figma deviation. Reviewer won't catch it because the value looks like a valid token reference.
**Why it happens:** Agents prefer to produce output over flagging gaps. Without an explicit "exact match only" rule, the model infers the nearest match.
**How to avoid:** Agent 2 file must state: "Color matching is EXACT hex only. If a hex value is not in the fauxds-library.md color tokens table, it MUST go to Unmapped Values — never map to the nearest color."
**Warning signs:** DESIGN.md Color Tokens section contains a token reference for a hex value that doesn't exactly match the token's documented value; Unmapped Values section is suspiciously empty for a complex section.

### Pitfall 4: Missing Unmapped Values Section

**What goes wrong:** Agent 2 finds all elements have FauxDS matches and writes a DESIGN.md with no Unmapped Values section. The consuming agent (Agent 4 builder) interprets the missing section as "agent forgot" and adds its own guesses for values that weren't mapped.
**Why it happens:** The section exists to document gaps; if there are no gaps, authors omit it entirely.
**How to avoid:** The Unmapped Values section is always present. When no unmapped values exist, write `_None_`. Agent 4 (Phase 4) will check for this section explicitly.
**Warning signs:** DESIGN.md produced by Agent 2 lacks the Unmapped Values section header entirely.

### Pitfall 5: Parallel Dispatch Silent Serialization (Bug #7406)

**What goes wrong:** SKILL.md dispatches Agents 1 and 2 as background tasks. They actually run sequentially. Total pipeline time is 2x instead of 1x. No error is surfaced.
**Why it happens:** Documented Claude Code bug — concurrent dispatch language must be explicit; natural language "run in parallel" may be ignored.
**How to avoid:** The smoke test for Phase 3 must measure wall-clock time. Agent files must document that they are background-safe (no AskUserQuestion, no foreground-only tools). Dispatch instruction in SKILL.md (Phase 5) must use explicit concurrent framing.
**Warning signs:** Agent 1's output file appears, then several seconds pass, then Agent 2's output file appears (serialized). Total time is ~2x single-agent time.

### Pitfall 6: Figma get_design_context Output Format Mismatch

**What goes wrong:** `get_design_context` returns a React + Tailwind representation, not raw Figma JSON. Agent 1 tries to extract `itemSpacing` as a direct JSON property but the response is a structured code representation that uses Tailwind classes like `gap-4`.
**Why it happens:** The tool returns a translated representation, not raw Figma API data.
**How to avoid:** Agents must parse the structured React + Tailwind output from `get_design_context`. They should look for spacing values in the CSS/Tailwind output and translate them back to pixel values using the Tailwind scale, then to FauxDS tokens. Alternatively, agents can use `get_variable_defs` for explicit variable/token data when available.
**Warning signs:** Agent produces LAYOUT.md with Tailwind class names instead of CSS variable tokens.

---

## Code Examples

Verified patterns from official sources and locked schema examples:

### Agent 1 Execution Flow (Pseudocode)

```
// Source: CONTEXT.md locked decisions + LAYOUT-EXAMPLE.md schema
INPUTS: nodeId, sectionName, fauxdsLibraryPath, existingLayoutPath

1. Read fauxds-library.md → load spacing tokens table, radius tokens
2. Read .loupe/LAYOUT.md if exists → note established token mappings
3. Call get_design_context(fileKey, nodeId)
   - If truncated: call get_metadata(fileKey, nodeId) → identify children → call get_design_context on each child
4. For each auto-layout element in response:
   - Extract: direction, itemSpacing, padding (top/right/bottom/left), alignItems, justifyContent, sizing mode, min/max
   - Map spacing values to nearest --faux-spacing-* token
   - Note raw Figma value as comment
5. Build Token Quick-Reference table (Element | Token | Value)
6. Build Component Tree (indented ASCII, each node: name + layout annotations)
7. Build Annotated CSS (class per element, flex properties, token variables with comments)
8. Count lines → if > 80, trim: remove redundant comments, merge similar elements
9. Write .loupe/sections/{sectionName}/LAYOUT.md
```

### Agent 2 Execution Flow (Pseudocode)

```
// Source: CONTEXT.md locked decisions + DESIGN-EXAMPLE.md schema
INPUTS: nodeId, sectionName, fauxdsLibraryPath, existingDesignPath

1. Read fauxds-library.md → load Components, Design Tokens, Typography sections
2. Read .loupe/DESIGN.md if exists → note established component/token mappings
3. Call get_design_context(fileKey, nodeId)
4. For each visual element:
   - Identify FauxDS component match (FauxButton, FauxBadge, etc.) → record variant + props
   - Map fill colors to --faux-color-* or --slate-* (EXACT hex match only)
   - Map text styles to --faux-type-* presets (match on size + weight)
   - Unmapped: no exact match → add to Unmapped Values with raw value + CSS hint
5. Build Component Mapping table (Element | FauxDS Component | Variant | Props)
6. Build Typography table (Element | Preset | Size | Weight | Line-height)
7. Build Color Tokens table (Element | Property | Token | Value)
8. Build Unmapped Values section (always present; write "_None_" if empty)
9. Count lines → if > 80, trim: compress props columns, abbreviate table entries
10. Write .loupe/sections/{sectionName}/DESIGN.md
```

### Canonical Output: LAYOUT.md

```markdown
// Source: .planning/artifact-schemas/LAYOUT-EXAMPLE.md

# LAYOUT: Hero Banner

## Token Quick-Reference

| Element | Token | Value |
|---------|-------|-------|
| Container padding | `--faux-spacing-12` | 48px |
| Heading-to-subtitle gap | `--faux-spacing-4` | 16px |
| CTAGroup button gap | `--faux-spacing-2` | 8px |

## Component Tree

```
HeroBanner (column, gap: --faux-spacing-4/16px, pad: --faux-spacing-12/48px, align: center)
  Heading (hug, text-align: center)
  CTAGroup (row, gap: --faux-spacing-2/8px, justify: center)
    PrimaryButton (hug)
    SecondaryButton (hug)
```

## Annotated CSS

```css
.hero-banner {
  display: flex;
  flex-direction: column;        /* Figma: vertical auto-layout */
  align-items: center;
  gap: var(--faux-spacing-4);    /* 16px */
  padding: var(--faux-spacing-12); /* 48px */
}
```
```

### Canonical Output: DESIGN.md

```markdown
// Source: .planning/artifact-schemas/DESIGN-EXAMPLE.md

# DESIGN: Hero Banner

## Component Mapping

| Element | FauxDS Component | Variant | Props |
|---------|-----------------|---------|-------|
| PrimaryButton | FauxButton | primary, lg | `label="Get Started"`, `rightIcon="faux-icon-arrow-right"` |

## Typography

| Element | Preset | Size | Weight | Line-height |
|---------|--------|------|--------|-------------|
| Heading | `--faux-type-display` | 36px | 700 | 1.2 |

## Color Tokens

| Element | Property | Token | Value |
|---------|----------|-------|-------|
| Heading | color | `--faux-color-neutral-900` | #171717 |

## Unmapped Values

| Element | Property | Raw Value | Notes |
|---------|----------|-----------|-------|
| BackgroundImage | border-radius | 12px | No FauxDS radius for image — use `border-radius: 12px` directly |
```

### Spacing Nearest-Match Examples

```
Figma value → FauxDS token     (delta)
4px  → --faux-spacing-1/4px    (exact)
8px  → --faux-spacing-2/8px    (exact)
13px → --faux-spacing-3/12px   (nearest, -1px)
18px → --faux-spacing-4/16px   (nearest, -2px)
20px → --faux-spacing-4/16px   (nearest, -4px) OR --faux-spacing-6/24px (+4px) — pick closer
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|---|---|---|---|
| Single agent handles layout + tokens together | Separate agents: Agent 1 (layout) and Agent 2 (tokens) | Project design decision | Context isolation; each agent stays focused; "Lost in the Middle" degradation avoided |
| Agent fetches full frame data | Agent fetches per-section nodeId using `get_design_context` | Figma plugin v2.0.2 | Avoids 25k token overflow; faster response per section |
| Tailwind token output from `get_design_context` | Agent translates Tailwind/React representation back to FauxDS tokens | Project convention | FauxDS vocabulary is used instead of Tailwind — consistency with project design system |
| Agent 3 (Interactions) in parallel | Agent 3 deferred; only Agents 1 & 2 run in Phase 3 | Phase 3 CONTEXT.md decision | Simpler parallel dispatch; both agents are background-only (no AskUserQuestion complications) |

---

## Open Questions

1. **Exact `get_design_context` response format for auto-layout**
   - What we know: Tool returns "structured React + Tailwind representation" including layout properties; official docs say it includes "Layout properties (Auto Layout, constraints, sizing)"
   - What's unclear: Whether auto-layout values appear as raw px numbers, Tailwind scale classes (e.g., `gap-4`), or both
   - Recommendation: Agent file should instruct the agent to handle both formats — extract px from either raw values or Tailwind scale translation; the Figma `get_variable_defs` tool can supplement with explicit variable names/values when the project has Figma variables set up
   - Confidence: LOW — verified in next research or during smoke test

2. **`get_variable_defs` as supplement to `get_design_context`**
   - What we know: `get_variable_defs` returns variables and styles (colors, spacing, typography) for the selection — explicit variable names and values
   - What's unclear: Whether it returns FauxDS-matching variables for this project's Figma files (depends on whether the user's Figma uses Figma variables for these values)
   - Recommendation: Document `get_variable_defs` as an optional third fetch; useful if spacing/colors aren't cleanly extractable from `get_design_context` output alone; don't require it as a mandatory step
   - Confidence: MEDIUM — tool documented in Figma plugin README; applicability depends on Figma file setup

3. **Nested auto-layout depth handling**
   - What we know: CONTEXT.md leaves this as Claude's discretion. Auto-layout sections can have multiple levels of nesting.
   - What's unclear: How deep to recurse when building the Component Tree; when to stop annotating and use `...` for deeply nested components
   - Recommendation: Agent files should instruct: annotate all direct children and one level below; for components deeper than 2 levels, record the component name but annotate layout only at the direct-child level. This keeps the 80-line budget achievable.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Manual inspection + live smoke test (agent files are Markdown instruction documents, not executable code) |
| Config file | none |
| Quick run command | Dispatch Agent 1 and Agent 2 against a real Figma section nodeId; verify both output files exist |
| Full suite command | Parallel timing test: dispatch both agents, record wall-clock time, confirm < 1.5x single-agent time |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LAYT-01 | Agent 1 extracts all auto-layout properties (direction, spacing, padding, alignment, sizing, min/max) | manual smoke | Dispatch Agent 1 on a section with varied auto-layout; inspect LAYOUT.md for completeness | Wave 0 (requires live Figma section) |
| LAYT-02 | Every layout px value maps to a --faux-spacing-* token with Figma comment | manual smoke | Inspect LAYOUT.md Annotated CSS; verify no bare px values without token + comment | Wave 0 |
| LAYT-03 | Agent reads fauxds-library.md tokens; reads existing .loupe/LAYOUT.md if present | manual inspection | Check agent file for explicit read instructions; run on second section and verify vocabulary consistency | Wave 0 |
| LAYT-04 | LAYOUT.md under 80 lines; all three required sections present | automated | `wc -l .loupe/sections/*/LAYOUT.md` (all < 80); `grep -c "## Token Quick-Reference\|## Component Tree\|## Annotated CSS" LAYOUT.md` (expect 3) | Wave 0 |
| TOKN-01 | Agent 2 maps every FauxDS-matchable element to FauxDS component + variant + props | manual smoke | Dispatch Agent 2 on section with FauxButton, FauxInput; verify Component Mapping table has exact variant + props | Wave 0 |
| TOKN-02 | All colors mapped to exact-hex token; all text styles to --faux-type-* presets | manual smoke | Include a section with one exact-match color and one off-by-one color; verify off-by-one goes to Unmapped Values | Wave 0 |
| TOKN-03 | Unmapped Values section present; non-FauxDS elements documented with CSS hints | manual smoke | Include a section with a custom-colored element; verify it appears in Unmapped Values | Wave 0 |
| TOKN-04 | Agent reads fauxds-library.md components/tokens/typography; reads .loupe/DESIGN.md if present | manual inspection | Check agent file for explicit read instructions | Wave 0 |
| TOKN-05 | DESIGN.md under 80 lines; all four required sections present | automated | `wc -l .loupe/sections/*/DESIGN.md` (all < 80); check for Component Mapping, Typography, Color Tokens, Unmapped Values headers | Wave 0 |
| PARA-01 | Agents 1 and 2 run simultaneously (not sequentially) | timing smoke | Record start/end timestamps; total time ≈ single-agent time (< 1.5x); not 2x | Wave 0 |
| PARA-02 | Both agents run in background | manual inspection | Verify agent files contain no AskUserQuestion or foreground-only tool calls | Wave 0 |
| REFS-03 | Agents read fauxds-library.md before starting | manual inspection | Verify read instruction in both agent files | Wave 0 |

### Sampling Rate

- **Per task commit:** Read the agent file, verify: (1) critical constraints appear first, (2) correct MCP tool name, (3) file is under 2,500 tokens, (4) output format matches canonical schema
- **Per wave merge:** Dispatch both agents against a real Figma section; verify both output files exist and are under 80 lines
- **Phase gate:** Parallel timing test passes (total time ≈ single-agent time); LAYOUT.md and DESIGN.md both match canonical schema on the smoke test section

### Wave 0 Gaps

- [ ] Smoke test Figma frame with sufficient complexity (auto-layout, mixed spacing, some FauxDS-matchable + some unmapped elements) — user must provide before smoke test task runs
- [ ] `.loupe/sections/` directory must exist in the test project before agents write output

*(No test framework installation needed — this phase produces two Markdown agent files. All validation is live smoke testing with manual inspection.)*

---

## Sources

### Primary (HIGH confidence)

- `/Users/austindick/.planning/phases/03-research-agents/03-CONTEXT.md` — All locked decisions for this phase
- `/Users/austindick/.planning/artifact-schemas/LAYOUT-EXAMPLE.md` — Canonical LAYOUT.md schema (section headers, format, line budget)
- `/Users/austindick/.planning/artifact-schemas/DESIGN-EXAMPLE.md` — Canonical DESIGN.md schema
- `/Users/austindick/.claude/skills/loupe/references/fauxds-library.md` — Token vocabulary (spacing, radius, color, typography, components)
- `/Users/austindick/.claude/skills/loupe/agents/01-layout.md` — Existing placeholder contract (inputs, outputs, constraints)
- `/Users/austindick/.claude/skills/loupe/agents/02-tokens.md` — Existing placeholder contract
- `/Users/austindick/.claude/plugins/cache/claude-plugins-official/figma/2.0.2/README.md` — `get_design_context` description, `get_variable_defs`, `get_metadata` fallback pattern
- `/Users/austindick/.claude/plugins/cache/claude-plugins-official/figma/2.0.2/skills/figma-implement-design/SKILL.md` — Confirmed two-step fetch pattern (get_design_context → get_metadata fallback); confirmed data properties returned
- `/Users/austindick/.planning/research/PITFALLS.md` — Pitfalls 1 (silent serialization), 2 (instruction bloat), 3 (MCP overflow), 8 (value hallucination)
- `/Users/austindick/.planning/research/ARCHITECTURE.md` — Parallel dispatch pattern, file ownership isolation, agent self-containment rule
- `/Users/austindick/.planning/phases/02-decomposer/02-RESEARCH.md` — Established MCP tool name conventions, agent file structure patterns

### Secondary (MEDIUM confidence)

- Figma MCP official tool descriptions — `get_design_context` returns "Layout properties (Auto Layout, constraints, sizing), Typography specifications, Color values and design tokens, Component structure and variants" (from figma-implement-design SKILL.md)
- `get_variable_defs` returns explicit variable names + values — useful supplement when Figma file uses variables

### Tertiary (LOW confidence)

- Exact format of `get_design_context` response for auto-layout properties (raw px vs Tailwind scale) — not directly observed; inferred from "React + Tailwind representation" description; must be confirmed during smoke test

---

## Metadata

**Confidence breakdown:**
- Agent file structure and constraints: HIGH — placeholder contracts established, canonical schemas locked, fauxds-library.md populated with real tokens
- Token mapping rules: HIGH — all mapping decisions locked in CONTEXT.md (nearest-match spacing, exact-hex color, always comment original)
- MCP tool strategy: MEDIUM — `get_design_context` as primary is confirmed; exact response format for auto-layout properties is LOW until smoke tested
- Parallel dispatch: MEDIUM — bug #7406 is documented; timing test approach is correct; actual Claude Code behavior must be verified during smoke test
- Artifact schemas: HIGH — LAYOUT-EXAMPLE.md and DESIGN-EXAMPLE.md are locked canonical examples

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable — FauxDS token set and artifact schemas are locked; Figma plugin v2.0.2 is current)
