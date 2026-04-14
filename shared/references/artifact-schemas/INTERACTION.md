# Schema: INTERACTION.md

## Header
`# INTERACTION: {Prototype Name}`
`Reference: {figma|prod-clone|discuss-only}`

## Sections

| Section | Required | Lifecycle | Writers |
|---------|----------|-----------|---------|
| States > Tier 1: Design System States | yes | overwrite | /design (interaction agent), /think |
| States > Tier 2: Custom States | yes | overwrite | /design (interaction agent), /think |
| States > Tier 3: Net-New Interactions | yes | overwrite | /design (interaction agent), /think |
| Transitions | yes | overwrite | /design (interaction agent), /think |
| User Flows | yes | overwrite | /design (interaction agent), /think |
| Responsive Behavior | yes | overwrite | /design (interaction agent), /think |

### Lifecycle Rules
<!-- lifecycle: overwrite at section level | holistic write -->

- **Written holistically.** Unlike LAYOUT.md/DESIGN.md (per-section), INTERACTION.md sections are written as a complete set by the interaction agent.
- **All section headings present from scaffold.** Template includes all headings with `_Not yet defined._` placeholders because the interaction agent uses Edit to replace individual sections.
- **Overwrite at section level.** Each section can be independently replaced without affecting others.

### State Tier Definitions

- **Tier 1:** States already handled by Slate components (hover, focus, disabled, loading, error on inputs, buttons, etc.)
- **Tier 2:** States composed from Slate primitives but requiring custom logic (empty states, permission gates, progressive disclosure)
- **Tier 3:** Net-new interaction patterns not in Slate (custom drag-and-drop, gesture-based, novel transitions)
