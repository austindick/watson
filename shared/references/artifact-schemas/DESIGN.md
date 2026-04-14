# Schema: DESIGN.md

## Header
`# DESIGN: {Prototype Name}`
`Reference: {figma|prod-clone|discuss-only}`

## Per-Section Structure

Each section is added as a `## {SectionName}` block. Same incremental growth pattern as LAYOUT.md.

### Required Sub-sections Per Section

| Sub-section | Required | Lifecycle | Description |
|-------------|----------|-----------|-------------|
| Design Tokens | yes | overwrite | Token name → value mapping for this section |
| Visual Specs | yes | overwrite | Colors, typography, spacing specifics |
| Component Mapping | yes | overwrite | Figma layer → Slate component mapping |

### Lifecycle Rules
<!-- lifecycle: section-level overwrite | cross-section append -->

- **Section-level overwrite.** Same as LAYOUT.md — entire `## {SectionName}` block replaced on rewrite.
- **Cross-section append.** New sections appended, never deleted.
- **Never delete sections.**
