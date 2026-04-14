# Schema: CONTEXT.md

## Header
`# CONTEXT: {Prototype Name}`

## Sections

| Section | Required | Lifecycle | Writers |
|---------|----------|-----------|---------|
| Problem Statement | yes | overwrite | /think, /save |
| Hypotheses | yes | overwrite | /think, /save |
| Solution Intent | yes | overwrite | /think, /save |
| Design Decisions | yes | append-only | /think (appends [PENDING]), /save (flips to [COMMITTED]) |
| PDP Stage | yes | overwrite | /think, /play (on scaffold) |
| Constraints | yes | overwrite | /think, /save |

## Lifecycle Rules
<!-- lifecycle: overwrite | append-only | set-once | prepend-only -->

- **Design Decisions is append-only.** New decisions are appended with `[PENDING]` prefix. Never delete or reorder existing [COMMITTED] decisions. /save flips [PENDING] → [COMMITTED].
- All other sections are overwrite — the latest write replaces the previous content.
- Placeholder text `_Not yet defined._` is valid for any required section (means "not yet populated").

## Amendment Format

Each decision line in Design Decisions:
```
- **[COMMITTED] Side panel over modal** — reason text here
- **[PENDING] Card-level trigger over hover** — reason text here
```

## Template (for scaffold)

See watson-init / /play scaffold — creates all section headings with `_Not yet defined._` placeholders.
