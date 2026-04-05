---
type: chapter
title: "Contributor Registration"
last_updated: "2026-03-31"
---

# Contributor Registration

## When to Register

MUST: Add a team member to `src/config/contributors.ts` before using their name as `owner` in `prototypes.ts`. Mismatches cause the prototype to not appear in the creator's Workspace.

Check first:
```bash
# Search for existing entry
grep -r "YourFirstName" src/config/contributors.ts
```

## Registration Format

File: `src/config/contributors.ts`

```typescript
{ name: 'FirstName', fullName: 'First Last', photo: 'https://github.com/githubusername.png' }
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Short name — used as `owner` in prototypes.ts |
| `fullName` | `string` | Display name in UI |
| `photo` | `string` | GitHub avatar URL (use GitHub's CDN) |

MUST: `name` must be unique — it's the join key between contributors.ts and prototypes.ts.
MUST: GitHub photo URL format: `https://github.com/[githubusername].png` (no size param needed).
PREFER: Use first name only for `name` to keep it short and match how `prototypeMeta.creator` is set.

## How Contributors Appear in UI

- **Feed:** Prototype cards show contributor photo and name
- **Workspace:** `/workspaces/[name]` page lists all prototypes owned by that person
- **Attribution:** Timestamp updates track when the creator commits to the repo

## Owner Field Matching

The `owner` field in `prototypes.ts` must exactly match the `name` field in `contributors.ts`:

```typescript
// contributors.ts
{ name: 'Austin', fullName: 'Austin Dick', photo: 'https://github.com/austindick.png' }

// prototypes.ts
{ id: 'my-prototype', owner: 'Austin', ... }  // CORRECT — matches 'name' exactly
{ id: 'my-prototype', owner: 'austin', ... }  // WRONG — case mismatch
{ id: 'my-prototype', owner: 'Austin Dick', ... }  // WRONG — fullName not name
```

MUST: Case-sensitive exact match. A mismatch means the prototype won't appear in the creator's Workspace and Feed attribution will be broken.
