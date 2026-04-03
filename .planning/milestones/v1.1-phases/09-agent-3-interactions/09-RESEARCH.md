# Phase 9: Agent 3 (Interactions) - Research

**Researched:** 2026-04-02
**Domain:** Watson agent implementation — interaction spec generation from library component states + discuss context
**Confidence:** HIGH

## Summary

Phase 9 implements the interaction agent (`agents/interaction.md`) — currently a stub — and extends two existing files: `skills/discuss.md` (add `interactionContext` to return status) and `skills/loupe.md` (dispatch interaction agent after layout + design, pass `interactionPath` to builder). The agent reads `LAYOUT.md` and `DESIGN.md` from the section staging directory to detect which DS components are used, looks up each component's `## States` section in `library/design-system/components/{id}/PAGE.md`, and produces a structured `INTERACTION.md` matching the 3-tier schema in `references/artifact-schemas/INTERACTION-EXAMPLE.md`. When discuss has captured interaction context it passes that as a structured JSON object; the agent maps it directly into Tier 2/3 content. When no context is provided, the agent produces library-defaults-only content with a header note.

Three files change, one file is fully written from scratch. The agent runs sequentially in Phase 9 (after layout + design complete, before builder) — parallel dispatch is deferred to Phase 10. All architectural decisions are locked in CONTEXT.md; this research maps them to exact implementation mechanics.

**Primary recommendation:** Implement in this order — (1) interaction agent body, (2) discuss.md return status extension, (3) loupe.md dispatch insertion, (4) consolidator.md INTERACTION.md handling. This order ensures each change is testable in isolation before wiring up.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Library state extraction (Tier 1)**
- Agent reads the section's LAYOUT.md and DESIGN.md to identify which DS components are used — no Figma re-fetch or separate component list parameter
- All documented states from each component's library PAGE.md are included in Tier 1 (disabled, loading, hover, active, focus, etc.)
- Components not in the design system book are omitted from Tier 1 and noted in Tier 3 as net-new interactions requiring custom implementation
- Tier 1 table includes a Notes column with contextual annotations explaining how each state is used in this specific section

**User Flows**
- Discuss provides flow sequences; agent structures them into the step-by-step format from INTERACTION-EXAMPLE.md
- Agent does NOT infer or invent flows — it only structures what discuss captured
- When discuss didn't capture any flows, User Flows section is present but says "No custom user flows specified — builder should implement standard component interactions only"

**Discuss context format (INTR-05: interactionContext)**
- Structured JSON object with keys: `customStates[]`, `flows[]`, `transitions[]`, `responsiveBehavior[]`
- Per-section entries in discuss's return status `sections[]` array, each with an optional `interactionContext` field
- Top-level `crossSectionFlows[]` array for flows that span multiple sections
- Discuss pre-categorizes into tiers — agent maps directly to INTERACTION.md sections
- `interactionContext` is null/absent when the user didn't discuss interactions — signals library-defaults-only (INTR-04)

**DS override handling**
- Discuss warns at decision time when a designer's choice diverges from library defaults
- Designer confirms during conversation; agent trusts discuss output without re-checking
- No double-handling — discuss handles the warning, agent respects the decision

**Fallback behavior (INTR-04: no discuss context)**
- Tier 1 table with all DS component states + empty stubs for Tier 2, Tier 3, Transitions, User Flows, Responsive Behavior
- Header note at top: "No custom interaction context provided — library component defaults only"
- Responsive Behavior section left empty with note: "No responsive behavior specified — builder should follow standard DS responsive patterns"
- Builder treats fallback INTERACTION.md identically to a fully populated one — same contract, no special fallback logic

**Agent dispatch integration**
- In Phase 9, interaction agent runs sequentially AFTER layout + design agents complete (needs their output for Tier 1 component detection)
- Phase 10 will optimize to parallel dispatch — Phase 9 establishes the clean dependency chain first
- Loupe passes `interactionContext` as an agent parameter (from discuss return status sections[]) plus `crossSectionFlows` as a separate parameter
- Error handling: retry once silently, on second failure set `interactionPath: null` and continue — matches existing per-agent error contract
- Loupe tracks at subskill level ("built N sections") — no per-agent action tracking in /tmp/watson-active.json
- Discuss-only sections skip the interaction agent entirely (same pattern as layout + design agents skip)

### Claude's Discretion

- Exact interactionContext JSON schema field names and structure (beyond the high-level keys decided above)
- How the agent reads and parses LAYOUT.md + DESIGN.md component trees to extract component names
- How the agent matches extracted component names to library PAGE.md files
- Contextual note wording in Tier 1 table
- How crossSectionFlows are represented in consolidated blueprint/INTERACTION.md by the consolidator
- Exact wording of the discuss-time DS override warning

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INTR-01 | Interaction agent reads library component built-in interaction states from design system book and applies them to the section | Component PAGE.md `## States` section is the extraction point; CHAPTER.md maps component name → PAGE.md path |
| INTR-02 | Interaction agent accepts pre-gathered interactionContext from discuss and structures user-described states and behaviors | `interactionContext` passed as agent parameter; agent maps `customStates[]` → Tier 2, `flows[]` → User Flows, `transitions[]` → Transitions table, `responsiveBehavior[]` → Responsive Behavior |
| INTR-03 | Interaction agent produces a structured INTERACTION.md per section combining discuss context with library defaults | Output matches INTERACTION-EXAMPLE.md 3-tier schema; written to `.watson/sections/{sectionName}/INTERACTION.md` (< 50 lines) |
| INTR-04 | When no discuss context exists, agent applies library component defaults only and notes that no custom interactions were specified | `interactionContext` null/absent → fallback path; header note + Tier 1 only + empty stubs with explanatory text |
| INTR-05 | discuss subskill emits interactionContext field in its return status JSON | discuss.md `sections[]` entries gain optional `interactionContext` field; top-level `crossSectionFlows[]` added to return status schema |
</phase_requirements>

---

## Standard Stack

This phase is pure markdown-file orchestration within the Watson skill system. No new libraries or packages are needed.

### Core Files to Modify or Implement

| File | Current State | Change Required |
|------|--------------|-----------------|
| `agents/interaction.md` | Stub — role + deferred notice + contract params | Full implementation of execution steps |
| `skills/discuss.md` | Complete — missing interactionContext in return status | Add `interactionContext` to each sections[] entry + top-level `crossSectionFlows[]` |
| `skills/loupe.md` | Phase 2 dispatches layout + design; Phase 3 hardcodes `interactionPath: null` | Add interaction agent dispatch after Phase 2 wait gate; resolve interactionPath in Phase 3 |
| `agents/consolidator.md` | Explicitly skips INTERACTION.md (constraint 5 says "No INTERACTION.md") | Add INTERACTION.md consolidation per existing union-merge pattern; remove constraint 5 |

### Reference Files (read-only during implementation)

| File | Purpose |
|------|---------|
| `references/artifact-schemas/INTERACTION-EXAMPLE.md` | Canonical output structure the agent must match |
| `references/agent-contract.md` | Interaction agent's registered params, dispatch mode, output path |
| `library/design-system/components/CHAPTER.md` | Maps component ids → PAGE.md paths (29 components) |
| `library/design-system/components/{id}/PAGE.md` | Contains `## States` section for each component |
| `references/artifact-schemas/LAYOUT-EXAMPLE.md` | Shows LAYOUT.md component tree format the agent parses |

---

## Architecture Patterns

### INTERACTION.md Output Schema

The canonical output format is documented in `references/artifact-schemas/INTERACTION-EXAMPLE.md`. Every INTERACTION.md the agent produces must follow this exact structure:

```
# INTERACTION: {Section Name}

## States

### Tier 1: Design System States
| Component | States | Notes |

### Tier 2: Custom States
| Element | State | Override |

### Tier 3: Net-New Interactions
| Element | State / Behavior | Implementation |

---

## Transitions
| Trigger | From | To | Animation | Duration |

---

## User Flows

### {Flow Name}
```code block with indented step sequence```

---

## Responsive Behavior
| Breakpoint | Behavior |
```

Line budget: < 50 lines (per agent-contract.md). The example is ~90 lines — the agent must be concise. Tier 2 and Tier 3 tables are omitted (not just emptied) when they have no content. User Flows section always present (with fallback text when empty). Responsive Behavior always present (with fallback text when empty).

### Component Extraction Pattern

The agent must extract DS component names from `LAYOUT.md` and `DESIGN.md` without a separate parameter. Two reliable extraction sources:

**From LAYOUT.md component tree:** The Component Tree block (```...```) uses the format `ComponentName (× N)` or `ComponentName (variant, size)`. Extract the text before the first `(` on each line. Example:
```
└── AddToCartButton (Button, primary, full-width)  → "Button"
└── SortDropdown (Input/Select)                    → "Input/Select" (normalize to "Select")
└── Badge (variant: promo) (× 0-2)                → "Badge"
```

**From DESIGN.md component mapping table:** The Component Mapping table has a Component column with entries like `Button (primary)`, `Badge`, `TextInput`. Strip variant annotation.

**Deduplication:** Union both lists, normalize names to lowercase-no-spaces for matching against CHAPTER.md ids (e.g., "TextInput" → "text-input", "IconButton" → "icon-button"). Components not in CHAPTER.md go into Tier 3 as net-new.

**CHAPTER.md lookup:** Read `library/design-system/components/CHAPTER.md`. It has a `pages:` YAML block mapping id → path, plus an HTML table in the body. Both contain the same data. Use the YAML frontmatter `pages:` block for programmatic matching (id is the normalized form).

### interactionContext JSON Schema

The discuss return status `sections[]` entry gains an optional field. When null/absent, the agent uses fallback mode (INTR-04).

```json
{
  "status": "ready_for_build",
  "blueprintPath": "/path/to/blueprint/",
  "sections": [
    {
      "name": "product-grid",
      "referenceType": "figma",
      "figmaUrl": "https://figma.com/...",
      "nodeId": "123:456",
      "interactionContext": {
        "customStates": [
          {
            "element": "ProductCard",
            "state": "Selected (panel open)",
            "override": "Grid card gains a selected ring while Quick View panel is open"
          }
        ],
        "flows": [
          {
            "name": "Quick View Browse",
            "steps": [
              "User hovers product card",
              "QuickViewTrigger becomes visible (120ms fade)",
              "User clicks Quick View trigger"
            ]
          }
        ],
        "transitions": [
          {
            "trigger": "Quick View button click",
            "from": "Panel hidden",
            "to": "Panel visible",
            "animation": "translateX(100%) → translateX(0), ease-out",
            "duration": "250ms"
          }
        ],
        "responsiveBehavior": [
          {
            "breakpoint": "Mobile (< 768px)",
            "behavior": "Panel becomes a bottom sheet, full width, 85vh"
          }
        ]
      }
    }
  ],
  "crossSectionFlows": [
    {
      "name": "Filter sidebar updates product grid",
      "sections": ["filter-sidebar", "product-grid"],
      "steps": ["User selects filter", "Product grid re-fetches", "Grid updates in place"]
    }
  ],
  "hasFullFrame": false,
  "fullFrameUrl": null
}
```

Field names above are recommendations (Claude's discretion). The key structural decisions are locked: `customStates[]`, `flows[]`, `transitions[]`, `responsiveBehavior[]` as keys; `crossSectionFlows[]` at top level of return status.

### Loupe.md Dispatch Integration

The interaction agent inserts into Phase 2 (Research), after layout and design agents are dispatched and their wait gate completes. This is sequential in Phase 9 — it waits for both layout and design to finish before running.

**New Phase 2 sequence (Phase 9):**
```
For each figma section:
  1. Dispatch layout agent (background)
  2. Dispatch design agent (background) in parallel

Wait for ALL layout + design agents across ALL sections to complete.

For each figma section (sequential):
  3. Dispatch interaction agent (background — watsonMode=true OR interactionContext provided)
     Parameters: nodeId, sectionName, interactionContext (from discuss sections[].interactionContext),
                 crossSectionFlows (from discuss return status top-level),
                 blueprintPath, libraryPaths, watsonMode: true
  Wait for interaction agent to complete.
  Resolve interactionPath: .watson/sections/{sectionName}/INTERACTION.md (null if file missing)
```

**Phase 3 change:** Replace `interactionPath: null` with resolved `interactionPath` from Phase 2 interaction agent output.

**Error handling (matches existing per-agent contract):**
- Retry once silently on first failure
- On second failure: `interactionPath: null`, continue — builder already handles null interactionPath with library-defaults-only behavior

**Discuss-only sections:** Same skip rule as layout + design — interaction agent dispatch is skipped entirely. Discuss already populated `blueprint/INTERACTION.md` in the discuss-only path.

### Discuss.md Extension (INTR-05)

Two additions to discuss.md, both in the "Loupe Handoff: Return Status" section:

1. Add `interactionContext` to each sections[] entry (optional field, null when interactions weren't discussed)
2. Add `crossSectionFlows[]` as a top-level field in the return status JSON

**When to populate `interactionContext`:** During the conversation, discuss already asks about Interactions (Phase 5.3 Core Questions). When the user describes states, flows, or transitions, discuss captures and categorizes them into the `interactionContext` structure before emitting return status. When the user skips or gives minimal interaction input, `interactionContext` is null.

**DS override warning (discuss Phase 5.3):** When the user specifies an interaction behavior that conflicts with a known DS component default (e.g., "skip the loading state on the button"), discuss surfaces a gentle challenge using AskUserQuestion before accepting the decision. Example:
```
- header: "DS State"
- question: "Button has a built-in Loading state — want to skip it here?"
- options: ["Use DS loading state", "Skip it for this prototype"]
```
Agent trusts whatever discuss recorded — no re-validation in the interaction agent.

### Consolidator INTERACTION.md Extension

The consolidator currently has constraint 5: "No INTERACTION.md — do NOT create or consolidate an INTERACTION.md file." This constraint must be removed and INTERACTION.md handling added following the same union-merge pattern used for LAYOUT.md and DESIGN.md.

**Key differences from LAYOUT/DESIGN consolidation:**

- **Tier 1 rows**: deduplicate by component name (same component across sections — keep first occurrence, add `(seen in N sections)` note)
- **Tier 2 rows**: keep all (section-specific overrides are rarely duplicated)
- **Tier 3 rows**: keep all (net-new interactions are always section-specific)
- **Transitions**: deduplicate by trigger description (normalized)
- **User Flows**: keep all (flows are section-specific by definition)
- **Responsive Behavior**: deduplicate by breakpoint (same breakpoint with different behaviors → keep both with section attribution)
- **Cross-section flows**: append as a separate `## Cross-Section Flows` section at the end of the consolidated file; source is `crossSectionFlows[]` from discuss return status (loupe must pass this to consolidator as a parameter)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Component name → PAGE.md path resolution | Custom component registry | CHAPTER.md `pages:` YAML frontmatter | Already authoritative; 29 components listed |
| State list per component | Hardcoded state enumerations | `## States` section in each PAGE.md | Library is the source of truth; states evolve |
| interactionContext categorization | Agent-side inference from raw conversation | Discuss pre-categorizes into tiers | Discuss is the trust boundary; agent just maps |
| INTERACTION.md template | Generating structure programmatically | INTERACTION-EXAMPLE.md as the schema | Canonical format already exists |

**Key insight:** The interaction agent is deliberately a "structured writer" not a "thinker" — all context-gathering and categorization happens in discuss.md. The agent's only judgment calls are (1) which library components are in the section and (2) what contextual Notes to write for each Tier 1 state row.

---

## Common Pitfalls

### Pitfall 1: Component Name Normalization Mismatch

**What goes wrong:** Agent extracts "TextInput" from LAYOUT.md but CHAPTER.md uses id "text-input" — no match found, component silently omitted from Tier 1.
**Why it happens:** LAYOUT.md uses PascalCase component names; CHAPTER.md ids are kebab-case.
**How to avoid:** Normalize both sides before comparison: `"TextInput".replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')` → "text-input". Also handle common variants: "Input/Select" → "select", "IconButton" → "icon-button".
**Warning signs:** Tier 1 table is empty despite obvious DS components in LAYOUT.md.

### Pitfall 2: Line Budget Overflow

**What goes wrong:** INTERACTION.md exceeds 50-line budget when a section has many components and rich discuss context.
**Why it happens:** The INTERACTION-EXAMPLE.md is ~90 lines; agents tend to match example verbosity.
**How to avoid:** Tier 1 Notes column must be concise (one clause, not a sentence). Flows use compact indented format (no blank lines between steps). Tier 3 descriptions are one line. If still over budget: omit the Transitions table when transitions are all standard DS (hover/focus) — only include for custom animations.
**Warning signs:** Builder reviewer flags INTERACTION.md as oversized.

### Pitfall 3: Consolidator Skips INTERACTION.md

**What goes wrong:** Consolidator constraint 5 ("No INTERACTION.md") is not updated — consolidated blueprint never gets an INTERACTION.md.
**Why it happens:** Constraint 5 was intentional in Watson 1.0 (agent was deferred). It must be explicitly removed in Phase 9.
**How to avoid:** PLAN must include consolidator.md as a change target. Constraint 5 removal is a required edit, not optional.
**Warning signs:** Blueprint directory has LAYOUT.md and DESIGN.md but no INTERACTION.md after a full build.

### Pitfall 4: discuss-only Sections Get Interaction Agent Dispatched

**What goes wrong:** Loupe dispatches interaction agent for discuss-only sections that already have INTERACTION.md in blueprint/.
**Why it happens:** The skip guard exists for layout + design agents but may not be copied over to the interaction agent dispatch block.
**How to avoid:** The `referenceType = "figma"` guard that wraps layout + design dispatch must wrap interaction dispatch identically.
**Warning signs:** Interaction agent tries to read non-existent .watson/sections/ staging files for discuss-only sections.

### Pitfall 5: interactionContext null vs absent Conflation

**What goes wrong:** Agent treats a missing `interactionContext` field differently from an explicit `null` value — one triggers fallback, the other doesn't.
**Why it happens:** JSON undefined vs null distinction in parsing.
**How to avoid:** Treat both `null` and absent field identically as "no discuss context" → fallback path. The condition is: `if (!interactionContext)`.
**Warning signs:** Agent errors or produces malformed INTERACTION.md on first run after discuss with no interaction discussion.

---

## Code Examples

### Tier 1 Table — Library Defaults Only (INTR-04 fallback)

```markdown
# INTERACTION: Product Grid

> No custom interaction context provided — library component defaults only

## States

### Tier 1: Design System States

States handled natively by the design system. No prototype-level overrides needed.

| Component | States | Notes |
|-----------|--------|-------|
| Button (primary) | Default, Hover, Focus, Active, Disabled, Loading | Add-to-cart action |
| Badge | Default only | Status indicator — static |
| Select | Default, Hover, Focus, Disabled | Sort dropdown |

### Tier 2: Custom States

None — no custom interaction context provided.

### Tier 3: Net-New Interactions

None — no custom interaction context provided.

---

## Transitions

None specified.

---

## User Flows

No custom user flows specified — builder should implement standard component interactions only.

---

## Responsive Behavior

No responsive behavior specified — builder should follow standard DS responsive patterns.
```

### discuss.md Return Status with interactionContext

```json
{
  "status": "ready_for_build",
  "blueprintPath": "/path/to/blueprint/",
  "sections": [
    {
      "name": "product-grid",
      "referenceType": "figma",
      "figmaUrl": "https://figma.com/...",
      "nodeId": "123:456",
      "interactionContext": {
        "customStates": [],
        "flows": [
          {
            "name": "Quick View Browse",
            "steps": ["User hovers card", "Quick View trigger appears", "User clicks trigger", "Panel slides in"]
          }
        ],
        "transitions": [
          { "trigger": "Quick View click", "from": "Panel hidden", "to": "Panel visible", "animation": "slide right", "duration": "250ms" }
        ],
        "responsiveBehavior": []
      }
    },
    {
      "name": "filter-sidebar",
      "referenceType": "figma",
      "figmaUrl": "https://figma.com/...",
      "nodeId": "124:100",
      "interactionContext": null
    }
  ],
  "crossSectionFlows": [
    {
      "name": "Filter updates grid",
      "sections": ["filter-sidebar", "product-grid"],
      "steps": ["User selects filter", "Product grid re-fetches and updates"]
    }
  ],
  "hasFullFrame": false,
  "fullFrameUrl": null
}
```

### Loupe Phase 2 — Interaction Agent Dispatch

```
# After layout + design wait gate completes:

For each figma section (sequential in Phase 9):
  sectionInteractionContext = sections[i].interactionContext  # may be null

  Dispatch @agents/interaction.md as **background** agent:
    nodeId: {section.nodeId}
    sectionName: {section.name}
    interactionContext: {sectionInteractionContext}    # null signals fallback mode
    crossSectionFlows: {crossSectionFlows}            # from discuss return status top-level
    blueprintPath: {blueprintPath}
    libraryPaths: {libraryPaths}
    watsonMode: true

  Wait for completion.

  Check .watson/sections/{section.name}/INTERACTION.md exists:
    If yes: interactionPath[section.name] = ".watson/sections/{section.name}/INTERACTION.md"
    If no (agent failed twice): interactionPath[section.name] = null
```

### interaction.md — Execution Steps Outline

The full agent implementation follows this structure:

**Step 1: Read spec files**
Read `{blueprintPath}/LAYOUT.md` (section staging) and `{blueprintPath}/DESIGN.md`. Extract component names from Component Tree block and Component Mapping table. Normalize to kebab-case for library lookup.

**Step 2: Resolve library PAGE.md paths**
Read `library/design-system/components/CHAPTER.md` frontmatter `pages:` array. For each extracted component name: find matching id, read its PAGE.md. Extract `## States` bullet list.

**Step 3: Build Tier 1 table**
For each matched component: one row with component display name, states (comma-separated from ## States bullets), and a contextual Note inferred from how the component appears in the section (e.g., "Primary CTA — all states apply", "Static label — default only").

**Step 4: Handle interactionContext**
If `interactionContext` is non-null:
- Map `customStates[]` → Tier 2 table rows
- Map unmatched-to-DS elements in customStates → Tier 3 rows
- Map `transitions[]` → Transitions table rows
- Map `flows[]` → User Flows sections (structured step sequences)
- Map `responsiveBehavior[]` → Responsive Behavior table rows
If null: write fallback stubs with explanatory text per locked decisions.

**Step 5: Write INTERACTION.md**
Write to `.watson/sections/{sectionName}/INTERACTION.md`. Enforce < 50 line budget. Use INTERACTION-EXAMPLE.md section headers exactly.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `interactionPath: null` hardcoded in loupe.md | Resolved from interaction agent output | Phase 9 | Builder receives real interaction spec |
| Agent 3 stub + deferred notice | Full implementation | Phase 9 | INTR-01 through INTR-05 satisfied |
| Consolidator skips INTERACTION.md (constraint 5) | Consolidator union-merges INTERACTION.md | Phase 9 | Blueprint INTERACTION.md populated after builds |
| discuss return status has no interaction data | Sections[] entries carry `interactionContext`; top-level `crossSectionFlows[]` | Phase 9 (INTR-05) | Interaction agent receives pre-categorized context |

**Deprecated/outdated in this phase:**
- `interaction agent: foreground*` footnote in agent-contract.md is now operational, not theoretical — the binary foreground/background classification based on `watsonMode` + `interactionContext` applies as written
- Consolidator constraint 5 is removed

---

## Open Questions

1. **Consolidator parameter for crossSectionFlows**
   - What we know: `crossSectionFlows[]` comes from discuss return status; loupe must pass it somewhere for consolidation
   - What's unclear: Does loupe store crossSectionFlows in /tmp/watson-active.json and consolidator reads from there? Or does loupe pass it as a new consolidator parameter?
   - Recommendation: Planner's discretion. Simplest: loupe passes `crossSectionFlows` as a new parameter to consolidator dispatch. This is consistent with how other parameters flow through the pipeline.

2. **interaction agent LAYOUT.md path — staging vs blueprint**
   - What we know: Loupe Phase 2 dispatches the interaction agent (before Phase 3 build step). For figma sections, LAYOUT.md and DESIGN.md are at `.watson/sections/{sectionName}/LAYOUT.md` (staging).
   - What's unclear: The agent-contract.md interaction agent params include `blueprintPath` but not `layoutPath`/`designPath`. The CONTEXT.md says "reads section's LAYOUT.md and DESIGN.md."
   - Recommendation: Pass explicit `layoutPath` and `designPath` parameters to the interaction agent (matching builder's pattern), rather than having the agent construct paths from blueprintPath + sectionName. This is consistent with the existing agent contract pattern.

3. **discuss.md DS override warning — when to trigger**
   - What we know: Discuss warns during Phase 5.3 (Interactions) when designer choice diverges from DS defaults
   - What's unclear: The agent can only warn about DS states it knows — this requires discuss to have loaded the design-system book at that point in the conversation
   - Recommendation: The design-system book is already loaded "on-demand" when the conversation touches specific components (discuss.md Phase 0). By Phase 5.3, it should be loaded. No structural change needed — the warning is just a new AskUserQuestion challenge pattern following existing Phase 4 (Gentle Challenges) rules.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected in watson project (markdown-only skill system) |
| Config file | None — no test runner in /Users/austindick/watson/ |
| Quick run command | Manual review: read generated INTERACTION.md, verify structure |
| Full suite command | End-to-end: run full loupe pipeline on a test section, check all four output files |

The Watson skill system has no automated test infrastructure. All validation is manual inspection of generated markdown artifacts.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INTR-01 | Agent reads DS component states from PAGE.md files and produces Tier 1 table | manual | Read `.watson/sections/*/INTERACTION.md`, verify Tier 1 rows match detected components | N/A — no automation |
| INTR-02 | Agent structures discuss-provided interactionContext into INTERACTION.md sections | manual | Invoke loupe with a test section that has interactionContext; inspect output | N/A — no automation |
| INTR-03 | INTERACTION.md output matches 3-tier schema from INTERACTION-EXAMPLE.md | manual | Structural inspection: all required sections present, headers match | N/A — no automation |
| INTR-04 | Null interactionContext produces library-defaults-only INTERACTION.md with header note | manual | Invoke with `interactionContext: null`; verify header note and empty Tier 2/3 stubs | N/A — no automation |
| INTR-05 | discuss.md return status JSON includes interactionContext in sections[] | manual | Read discuss return status after a conversation with interaction discussion | N/A — no automation |

### Sampling Rate

- **Per task commit:** Manual read of the modified file to confirm syntax and structure
- **Per wave merge:** Full pipeline test — run discuss + loupe on a sample section, inspect INTERACTION.md output
- **Phase gate:** All five requirements satisfied (confirmed by manual inspection before `/gsd:verify-work`)

### Wave 0 Gaps

None — existing test infrastructure covers all phase requirements (the Watson project uses manual review, not automated tests; no test scaffolding is needed).

---

## Sources

### Primary (HIGH confidence)

- `/Users/austindick/.claude/skills/watson/references/artifact-schemas/INTERACTION-EXAMPLE.md` — canonical INTERACTION.md schema, all section headers, Tier 1-3 table formats
- `/Users/austindick/.claude/skills/watson/references/agent-contract.md` — interaction agent contract params, dispatch modes, output path conventions
- `/Users/austindick/.claude/skills/watson/agents/interaction.md` — current stub implementation; exact params listed
- `/Users/austindick/.claude/skills/watson/skills/discuss.md` — full discuss implementation; return status schema and all write patterns
- `/Users/austindick/.claude/skills/watson/skills/loupe.md` — full loupe implementation; Phase 2/3 dispatch patterns, error handling
- `/Users/austindick/.claude/skills/watson/agents/builder.md` — confirms interactionPath handling (optional, null → library defaults only)
- `/Users/austindick/.claude/skills/watson/agents/consolidator.md` — confirms constraint 5 and union-merge algorithm to replicate for INTERACTION.md
- `/Users/austindick/.claude/skills/watson/library/design-system/components/CHAPTER.md` — 29-component index; id-to-path mapping
- `/Users/austindick/.claude/skills/watson/library/design-system/components/button/PAGE.md` — exemplar PAGE.md with `## States` format
- `/Users/austindick/.claude/skills/watson/library/design-system/components/text-input/PAGE.md` — second exemplar confirming States format consistency
- `/Users/austindick/watson/.planning/phases/09-agent-3-interactions/09-CONTEXT.md` — all locked decisions and Claude's discretion areas

### Secondary (MEDIUM confidence)

- Pattern extrapolation from LAYOUT-EXAMPLE.md and DESIGN-EXAMPLE.md component tree format → component name extraction approach

### Tertiary (LOW confidence)

None — all findings grounded in existing project files.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all files exist and were read directly
- Architecture patterns: HIGH — locked decisions in CONTEXT.md + existing code patterns are concrete
- Pitfalls: HIGH — derived from direct inspection of existing agent code and the specific mechanical steps required
- interactionContext schema: MEDIUM — field names are Claude's discretion; structure is locked; exact schema requires planner decision

**Research date:** 2026-04-02
**Valid until:** Stable — no external dependencies; internal markdown files only. Valid until project files change.
