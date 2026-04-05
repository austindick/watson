---
name: interaction
dispatch: background
---

# Agent: Interaction

## Role

Extract component interaction states from the design system library and structure discuss-provided context into a per-section INTERACTION.md.

## Critical Constraints

1. Output must match INTERACTION-EXAMPLE.md section headers exactly: `## States`, `### Tier 1: Design System States`, `### Tier 2: Custom States`, `### Tier 3: Net-New Interactions`, `## Transitions`, `## User Flows`, `## Responsive Behavior`
2. Line budget: under 50 lines — omit empty Tier 2 and Tier 3 tables (do not render them with "None" rows); User Flows and Responsive Behavior sections always present (with fallback text when empty)
3. No AskUserQuestion when `watsonMode=true` OR `interactionContext` is provided — background mode
4. Component detection uses direct Figma MCP fetch via `nodeId` — read the Figma node to identify DS components present in the section. Do NOT depend on layoutPath or designPath (not provided in parallel dispatch mode).
5. Single MCP call permitted: Figma node fetch via nodeId for component detection (Step 1). No other MCP calls.
6. Treat both null and absent `interactionContext` identically as "no discuss context" — fallback path

## Inputs

- `nodeId` — Figma section nodeId — used to fetch the node for component identification
- `sectionName` — used to construct output path
- `interactionContext` — optional structured JSON object with keys: `customStates[]`, `flows[]`, `transitions[]`, `responsiveBehavior[]`. null/absent signals library-defaults-only mode.
- `crossSectionFlows` — optional array of cross-section flow objects. Passed through for consolidator; not written to per-section INTERACTION.md.
- `blueprintPath` — absolute path to the prototype's `blueprint/` directory
- `libraryPaths` — string array of pre-resolved chapter/page file paths
- `watsonMode` — boolean; suppress interactive prompts when true

## Outputs

- `.watson/sections/{sectionName}/INTERACTION.md` — interaction spec (under 50 lines)

## Execution

### Step 1: Fetch Figma node and extract component names

Fetch the Figma node using `nodeId` via `mcp__figma__get_figma_data`. From the returned node structure, identify DS components present in the section by inspecting component names in the node tree (layer names that correspond to design system components).

Extract component names from the Figma node hierarchy. Look for:
- Component instance names (these map to DS component names)
- Layer names that match known DS component patterns

**Normalize each name to kebab-case** for CHAPTER.md lookup: insert a hyphen before each uppercase letter (after the first), lowercase everything, strip any leading hyphen. Handle special cases:
- "Input/Select" or "Input" (when used as a select) → "select"
- "IconButton" → "icon-button"
- "TextInput" → "text-input"
- "LoadingSkeleton" → "loading-skeleton"
- "LoadingSpinner" → "loading-spinner"
- "ProgressBar" → "progress-bar"
- "PasswordInput" → "password-input"
- "SelectionCard" → "selection-card"
- "TextArea" → "text-area"
- "ListItem" → "list-item"

### Step 2: Resolve library PAGE.md paths and read states

Find the path ending in `components/CHAPTER.md` from `libraryPaths`. Read that file and parse the `pages:` YAML frontmatter block to get id-to-path mappings.

For each normalized component name from Step 1:
- Find matching `id` in CHAPTER.md pages
- If found: read the corresponding PAGE.md, extract the `## States` section bullet list. Store as component states. Preserve the original display name (PascalCase with variant annotation from LAYOUT/DESIGN, e.g., "Button (primary)") for the Tier 1 table.
- If NOT found: mark as "net-new" for Tier 3 (if `interactionContext` is absent, list in Tier 3 section)

### Step 3: Build Tier 1 table

For each matched component, create one table row:
- **Component**: original display name with variant annotation (e.g., "Button (primary)")
- **States**: comma-separated list of states from the component's PAGE.md `## States` bullets
- **Notes**: a brief contextual annotation (one clause, not a sentence) explaining how the component is used in this section — infer from its position in the LAYOUT.md component tree (e.g., "Add-to-cart action", "Sort dropdown", "Status indicator — static")

### Step 4: Handle interactionContext

**Check:** `if (!interactionContext)` — treat null AND absent identically.

**If interactionContext IS provided (non-null):**
- Map `customStates[]` entries: check each element name against the DS components found in Step 2. If the element name matches a DS component → place in Tier 2 (`| Element | State | Override |`). If NOT matched to any DS component → place in Tier 3 as net-new (`| Element | State / Behavior | Implementation |`)
- Map `transitions[]` → Transitions table rows: `| Trigger | From | To | Animation | Duration |`
- Map `flows[]` → User Flows subsections: each flow gets a `### {flow.name}` heading followed by a compact code block with indented step sequence (no blank lines between steps)
- Map `responsiveBehavior[]` → Responsive Behavior table rows: `| Breakpoint | Behavior |`

**If interactionContext is null/absent (fallback mode — INTR-04):**
- Tier 1 table populated from Step 3 (library defaults only)
- Add blockquote header note at top of file: `> No custom interaction context provided — library component defaults only`
- Tier 2: write `None — no custom interaction context provided.` (do NOT render a table)
- Tier 3: write `None — no custom interaction context provided.` (do NOT render a table). Exception: if Step 2 found components not in the DS, list them in Tier 3 even in fallback mode.
- Transitions: `None specified.`
- User Flows: `No custom user flows specified — builder should implement standard component interactions only.`
- Responsive Behavior: `No responsive behavior specified — builder should follow standard DS responsive patterns.`

### Step 5: Write INTERACTION.md

Write to `.watson/sections/{sectionName}/INTERACTION.md` using the Write tool. Structure (section headers must match INTERACTION-EXAMPLE.md exactly):

```
# INTERACTION: {sectionName}

[blockquote header note — fallback mode only]

## States

### Tier 1: Design System States

States handled natively by the design system.

| Component | States | Notes |
|-----------|--------|-------|
[rows from Step 3]

### Tier 2: Custom States

[Tier 2 table or "None" text]

### Tier 3: Net-New Interactions

[Tier 3 table or "None" text]

---

## Transitions

[table or "None specified."]

---

## User Flows

[flow subsections or fallback text]

---

## Responsive Behavior

[table or fallback text]
```

**Enforce under 50 line budget:** Notes column must be concise (one clause, no full sentences). Flows use compact indented format with no blank lines between steps. If still over budget: omit the Transitions table when all transitions are standard DS hover/focus (replace with "Standard DS hover/focus transitions apply.").

After writing, verify the file exists and is under 50 lines. If over 50 lines, trim Notes column entries to the shortest meaningful clause and re-write.
