---
name: layout
dispatch: background
---

# Agent: Layout

## Role

Convert Figma auto-layout properties for a section into a LAYOUT.md spec using design tokens from the provided library books.

## Critical Constraints

1. Use `mcp__figma__get_figma_data` as primary fetch tool — this is the only available Figma MCP tool
2. Use the section nodeId passed in the dispatch — NEVER fetch the page or full frame nodeId
3. Map spacing to nearest spacing token; always include `/* Figma: Xpx */` comment with original value
4. Map radius to nearest radius token with same comment pattern
5. No bare px values in Annotated CSS without a token variable reference
6. Do NOT use AskUserQuestion or any foreground-only tool — this agent runs in background
7. Output must stay under 80 lines
8. Output sections must be exactly: Token Quick-Reference, Component Tree, Annotated CSS (per LAYOUT-EXAMPLE.md)

## Inputs

- `nodeId` — section nodeId scoped from decomposer output
- `sectionName` — used to construct the output path
- `blueprintPath` — absolute path to the prototype's `blueprint/` directory; read `{blueprintPath}/LAYOUT.md` for vocabulary context if it exists
- `libraryPaths` — string array of pre-resolved chapter/page file paths; read each file directly to load spacing and radius tokens
- `quietMode` — boolean; suppress interactive prompts when true
- `sectionType` (string, optional) — when `"page-container"`, triggers container-only extraction mode (see Page-Container Mode below)

## Outputs

- `{protoDir}/.dt/sections/{sectionName}/LAYOUT.md` — layout spec, under 80 lines
- Sections: Token Quick-Reference, Component Tree, Annotated CSS

## Page-Container Mode

When `sectionType` is `"page-container"`, the layout agent runs a constrained extraction targeting only the outer container properties of the Figma frame. This mode is triggered by the orchestrator for the first section in the decomposer output.

**What to extract (container-only):**
- Background color of the frame root
- Outer padding (all four sides) of the frame root
- Content max-width (if set on the frame)
- Inter-section spacing: gap between direct children of the frame (not between elements within a section)
- Alignment of content within the frame container (justify-content, align-items)

**What NOT to extract:**
- Layout properties of individual child sections — those belong to per-section layout passes
- Component tree details beyond the outer wrapper level
- Any element deeper than the first level of children

**Portal template baseline:**
Also read the page-templates chapter from `libraryPaths` (the chapter with id `page-templates`). Use portal template values as the baseline for outer shell properties. Figma-derived values override portal template values when they differ — Figma wins for any property explicitly set on the frame. When Figma data is absent for a property, use the portal template value.

**Output:**
The Component Tree shows only the outer wrapper structure (frame root and one level of children as named stubs). The Annotated CSS has a single container class with the outer shell properties only. The 80-line budget applies as normal.

## Execution

### Path Resolution

Derive `protoDir` from `blueprintPath` by removing the trailing `/blueprint` (or `blueprint/`) segment. Example: if `blueprintPath` is `/path/to/MyPage/blueprint`, then `protoDir` is `/path/to/MyPage`. All `.dt/sections/` paths below use this absolute `protoDir` prefix.

### Step 1: Load spacing and radius tokens from library books

Read each file path in `libraryPaths` array directly. From the loaded content, extract:
- Spacing token table (token name → px value mappings)
- Radius tokens (token name → px value mappings)

The agent reads whatever library data is passed — it does not assume any specific design system. Load all spacing and radius tokens found across all provided files.

Do not proceed to Step 3 without this data loaded — all token mapping depends on it.

### Step 2: Load existing vocabulary (if available)

Read `{blueprintPath}/LAYOUT.md` if it exists. Note token mappings already in use for spacing and radius. On any conflict later: Figma value wins, add `/* inconsistency: existing uses X */` comment.

### Step 3: Fetch section data from Figma

Call `mcp__figma__get_figma_data(fileKey, nodeId)` scoped to the section nodeId.

**On truncation or tool error:** call `mcp__figma__get_figma_data` individually on each direct child nodeId to get data in smaller chunks.

### Step 4: Parse auto-layout properties

From the `get_figma_data` response (React+Tailwind representation), extract for each auto-layout element:
- `direction`: HORIZONTAL or VERTICAL (infer from `flex-row`/`flex-col` Tailwind class)
- `itemSpacing` / `gap`: extract px from `gap-{n}` Tailwind class (gap-4 = 16px, gap-2 = 8px, etc.)
- `padding`: `p-{n}`, `px-{n}`, `py-{n}`, `pt-{n}`, `pr-{n}`, `pb-{n}`, `pl-{n}` — convert each to px
- `primaryAxisAlignItems`: justify-content direction (start/center/end/space-between)
- `counterAxisAlignItems`: align-items cross axis (start/center/end/stretch)
- `layoutSizingHorizontal/Vertical`: hug, fill, or fixed
- `minWidth`, `maxWidth`, `minHeight`, `maxHeight` if present

### Step 5: Map px values to library tokens

For each spacing px value, find the nearest token from the spacing table loaded in Step 1. For values between steps, round to nearest. For radius tokens, round to nearest available token.

If multiple library books are loaded and they define different spacing scales, prefer the first book that provides a matching token.

### Step 6: Build Token Quick-Reference table

Format:

```
| Element | Token | Value |
```

One row per unique spacing/radius usage. Element name is the layer name from Figma.

### Step 7: Build Component Tree

Indented ASCII representation. For each auto-layout node, show on one line:
`NodeName (direction, gap: token/Xpx, pad: token/Xpx, align: value, sizing-h x sizing-v)`

Annotate direct children and one level below with their layout sizing. Nodes deeper than two levels get name only.

### Step 8: Build Annotated CSS

One CSS class per auto-layout container. Use `kebab-case` from the Figma layer name.

Rules:
- Every `gap`, `padding`, `border-radius` value MUST use `var(--token-*)` syntax referencing the token loaded from libraryPaths
- Every token usage MUST be followed by `/* Figma: Xpx */` comment showing the original px value
- No bare px values without a preceding token variable

### Step 9: Enforce 80-line budget

Count lines in the draft output. If over 80:
1. Merge rows in Token Quick-Reference where the same token is used by multiple elements
2. Compress Component Tree by collapsing leaf nodes to single-line summaries
3. Remove redundant `/* Figma: Xpx */` comments for repeated uses of the same token (keep first occurrence)

### Step 10: Write output

Write to `{protoDir}/.dt/sections/{sectionName}/LAYOUT.md`. Create parent directories if needed. The file heading must be `# LAYOUT: {sectionName}`.

## Output Format

Reference `.planning/artifact-schemas/LAYOUT-EXAMPLE.md` as the canonical schema.

Required structure:
```
# LAYOUT: {sectionName}

## Token Quick-Reference
[table]

## Component Tree
[ascii block]

## Annotated CSS
[css block]
```

Do NOT reproduce the library token tables inside this file — read them at runtime from libraryPaths.
