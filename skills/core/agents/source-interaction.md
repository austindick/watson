---
name: source-interaction
dispatch: background
---

# Agent: Source Interaction

## Role

Detect Slate components from TSX import statements and JSX usage, look up their design system states from library books, and produce an INTERACTION.md spec for a section.

## Critical Constraints

1. Output must match INTERACTION-EXAMPLE.md section headers exactly: `## States`, `### Tier 1: Design System States`, `### Tier 2: Custom States`, `### Tier 3: Net-New Interactions`, `## Transitions`, `## User Flows`, `## Responsive Behavior`
2. Line budget: under 50 lines — omit empty Tier 2 and Tier 3 tables (do not render them with "None" rows); User Flows and Responsive Behavior sections always present (with fallback text when empty)
3. No AskUserQuestion — background agent only
4. Component detection uses TSX import analysis and JSX scanning — no Figma MCP calls
5. Confidence summary tally required as HTML comment after heading: `<!-- Confidence: N from code, N inferred, N estimated -->`
6. Use screenshots for structural reference only — never extract data content
7. Do NOT reproduce library component state tables inside the output file
8. Agents are self-contained — do NOT read other agent output files (LAYOUT.md, DESIGN.md)

## Inputs

- `filePaths` (string[]) — resolved component file paths from surface-resolver
- `sectionName` (string) — used to construct output path
- `screenshotPath` (string, optional) — page-level screenshot for structural reference
- `blueprintPath` (string) — absolute path to prototype's blueprint/ directory
- `libraryPaths` (string[]) — pre-resolved chapter/page file paths; includes design-system components/CHAPTER.md
- `watsonMode` (boolean)

## Outputs

- `{protoDir}/.watson/sections/{sectionName}/INTERACTION.md` — interaction spec (under 50 lines)

## Execution

### Path Resolution

Derive `protoDir` from `blueprintPath` by removing the trailing `/blueprint` (or `blueprint/`) segment. Example: if `blueprintPath` is `/path/to/MyPage/blueprint`, then `protoDir` is `/path/to/MyPage`. All `.watson/sections/` paths below use this absolute `protoDir` prefix.

### Step 1: Detect Slate components from TSX

Read each file in `filePaths` via the Read tool. Scan for Slate component imports:
- Named imports: `import { Button, Badge, Input } from '@faire/slate'`
- Default imports: `import Button from '@faire/slate/components/button'`

Scan JSX usage: `<Button`, `<Badge`, `<Input` — confirm each is actually rendered (not just imported).

Build `componentList[]` from detected names. Normalize each to kebab-case for CHAPTER.md lookup:
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
- General rule: insert hyphen before each uppercase letter (after first), lowercase everything

Confidence for component detection:
- Import statement found + JSX usage confirmed: `/* from code */`
- JSX usage found but no explicit import (re-exported or dynamically loaded): `/* inferred */`
- Component mentioned in code comments but not rendered: skip (not in componentList)

### Step 2: Resolve library PAGE.md paths and read states

Find the path ending in `components/CHAPTER.md` from `libraryPaths`. Read that file and parse the `pages:` YAML frontmatter block to get id-to-path mappings.

For each normalized component name from Step 1:
- Find matching `id` in CHAPTER.md pages
- If found: read the corresponding PAGE.md, extract the `## States` section bullet list. Store as component states. Confidence: `/* from code */` (library states are authoritative)
- If NOT found: mark as Tier 3 net-new (custom component with no library equivalent)

### Step 3: Analyze interaction patterns from TSX

Scan for event handlers: `onClick`, `onChange`, `onSubmit`, `onHover`, `onFocus`, `onKeyDown`, etc.
- Handlers found in code: `/* from code */`
- Standard handlers assumed for Slate components but not in code: `/* estimated -- from library default */`

Scan for state management: `useState` hooks controlling visibility, active states, loading states.
- Explicit state variables: `/* from code */`

Scan for transitions: CSS transitions/animations, framer-motion, react-spring.
- Explicit in code: `/* from code */`
- Implied by component type but not coded: `/* estimated */`

Scan for responsive behavior: media queries in associated CSS, Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`).
- Found in code: `/* from code */`
- Not found: use fallback text "Responsive behavior: not detected in source -- builder discretion"

### Step 4: Build INTERACTION.md content

**Tier 1: Design System States** — Slate components from Step 1 with library states from Step 2:
| Component | States | Notes |
- Component: original display name (PascalCase with variant annotation, e.g., "Button (primary)")
- States: comma-separated list from PAGE.md `## States` bullets
- Notes: one-clause contextual annotation of how the component is used in this section

**Tier 2: Custom States** — Slate components with additional interaction beyond library defaults:
| Element | State | Override |
- Populate only when explicit custom state handling found in TSX; omit table entirely if empty
- Event handlers overriding or extending default Slate behavior: `/* from code */`

**Tier 3: Net-New Interactions** — non-Slate custom components with interaction:
| Element | State / Behavior | Implementation |
- Custom components not found in library: describe from code, mark as "custom -- no library equivalent"
- Include confidence annotation in Implementation column; omit table entirely if empty

**Transitions** — from CSS transitions, animations, framer-motion found in Step 3:
| Trigger | From | To | Animation | Duration |
- If no explicit transitions found: "Standard DS component transitions apply."

**User Flows** — from event handler chains and state management patterns:
### {flow name}
- Infer flow names from primary user actions in the section
- If no complex flows detected: "Standard component interactions -- no custom user flows detected in source."

**Responsive Behavior** — from media queries and Tailwind responsive classes:
| Breakpoint | Behavior |
- If none detected: "Responsive behavior: not detected in source -- builder discretion"

### Step 5: Add confidence summary and enforce 50-line budget

Count all confidence annotations. Add HTML comment after the file heading:
`<!-- Confidence: N from code, N inferred, N estimated -->`

If over 50 lines: trim Notes column to shortest meaningful clause, omit empty Tier 2/3 tables entirely, compact User Flow step sequences (no blank lines between steps). If still over: replace Transitions table with "Standard DS hover/focus transitions apply." when all are standard.

### Step 6: Write output

Write to `{protoDir}/.watson/sections/{sectionName}/INTERACTION.md` using the Write tool. Heading: `# INTERACTION: {sectionName}`.

After writing, verify the file exists and is under 50 lines. If over 50 lines, trim Notes column entries to the shortest meaningful clause and re-write.

## Output Format

Reference INTERACTION-EXAMPLE.md as canonical schema. Structure:

```
# INTERACTION: {sectionName}

<!-- Confidence: N from code, N inferred, N estimated -->

## States

### Tier 1: Design System States

States handled natively by the design system.

| Component | States | Notes |
|-----------|--------|-------|
[rows from Step 4]

### Tier 2: Custom States

[Tier 2 table — omit entirely if empty]

### Tier 3: Net-New Interactions

[Tier 3 table — omit entirely if empty]

---

## Transitions

[table or "Standard DS component transitions apply."]

---

## User Flows

[flow subsections or fallback text]

---

## Responsive Behavior

[table or "Responsive behavior: not detected in source -- builder discretion"]
```
