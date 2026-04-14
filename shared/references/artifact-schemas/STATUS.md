# Schema: STATUS.md

## YAML Frontmatter (machine-readable)

| Field | Type | Required | Lifecycle | Description |
|-------|------|----------|-----------|-------------|
| prototype_name | string | yes | set-once | Human-readable name |
| prototype_slug | string | yes | set-once | Kebab-case identifier |
| owner | string | yes | set-once | Owner full name |
| owner_github | string | yes | set-once | GitHub username |
| created_at | date | yes | set-once | Creation date (YYYY-MM-DD) |
| sections_built | string[] | yes | append-only | Section names that have been built |
| pending_decisions | string[] | yes | overwrite | Decisions awaiting commit |
| last_discussed | date | no | overwrite | Last /think session date |
| last_activity | date | yes | overwrite | Any session activity date |
| branch | string | yes | set-once | Git branch name |
| drafts | object[] | yes | overwrite | Pending [PENDING] amendment descriptions |
| sessions | object[] | yes | prepend-only | Session log entries (max 10, newest first) |
| forked_from | string | no | set-once | Source branch if forked |
| forked_from_owner | string | no | set-once | Source owner if forked |

### Lifecycle Rules
<!-- lifecycle: set-once | append-only | prepend-only | overwrite -->

- **set-once fields** are written at scaffold time and never changed.
- **append-only fields** (sections_built) grow monotonically — entries are added, never removed.
- **prepend-only fields** (sessions) add newest entry at position 0, drop oldest if count exceeds 10.
- **overwrite fields** are replaced on each update.

### Session Entry Format

```yaml
sessions:
  - timestamp: "2026-04-10T15:30:00Z"
    summary: "Discussed layout options, committed 2 decisions"
    who: "Austin Dick"
```

## Markdown Body

| Section | Required | Lifecycle |
|---------|----------|-----------|
| Build Summary | yes | overwrite (derived from sections_built) |
| Pending Decisions | yes | overwrite (derived from pending_decisions) |
| Session Log | yes | overwrite (derived from sessions) |

The markdown body is a human-readable mirror of the YAML frontmatter. Updated whenever frontmatter changes.
