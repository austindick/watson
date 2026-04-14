# Schema: LAYOUT.md

## Header
`# LAYOUT: {Prototype Name}`
`Reference: {figma|prod-clone|discuss-only}`

The Reference line is on line 2 and indicates the source type for all sections. Set on first write.

## Per-Section Structure

Each section is added as a `## {SectionName}` block. Sections are added incrementally by the layout agent — LAYOUT.md starts minimal and grows.

### Required Sub-sections Per Section

| Sub-section | Required | Lifecycle | Description |
|-------------|----------|-----------|-------------|
| Token Quick-Reference | yes | overwrite | Table: Token, Value, Usage |
| Component Tree | yes | overwrite | ASCII tree showing component hierarchy |
| Annotated CSS | yes | overwrite | CSS with token annotations in comments |

### Lifecycle Rules
<!-- lifecycle: section-level overwrite | cross-section append -->

- **Section-level overwrite.** When the layout agent rewrites a section, it replaces the entire `## {SectionName}` block.
- **Cross-section append.** New sections are appended; existing sections are never deleted by adding a new one.
- **Never delete sections.** Even on rebuild, overwrite the section content but preserve the heading.

### Token Quick-Reference Format

| Token | Value | Usage |
|-------|-------|-------|
| --ds-spacing-sm | 8px | Gap between grid cards |

### Component Tree Format

ASCII tree with indentation. Each node: `ComponentName` optionally followed by `(SlateComponent, variant, size)` or `(HTML element)`.

### Annotated CSS Format

Standard CSS with `/* Figma: {measured value} */` or `/* Source: {file}:{line} */` comments tracing each value to its origin.
