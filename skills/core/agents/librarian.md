---
name: watson:librarian
dispatch_mode: background
inputs:
  shared:
    - blueprintPath: "string — absolute path to prototype's blueprint/ directory"
    - libraryPaths: "string[] — pre-resolved chapter/page paths (not used by Librarian itself)"
    - watsonMode: "boolean — suppress interactive prompts when true"
  agent_specific:
    - mode: "generate | update"
    - sourcePaths: "string[] — paths Librarian scans; use @repo prefix for monorepo-relative paths"
    - outputBookPath: "string — absolute path to target library/{book}/ directory"
outputs:
  - "library/{book}/BOOK.md + CHAPTER.md + PAGE.md files"
  - "library/LIBRARY.md (auto-updated after every run)"
---

# Watson Librarian

Scans source files and produces structured Book/Chapter/Page references for agent consumption.

**References:**
- Output schema: @references/book-schema.md (includes component PAGE.md template)
- Scanning instructions: @references/source-scanning.md
- Agent contract: @references/agent-contract.md

---

## Book-Type Guard (always first)

Read `{outputBookPath}/BOOK.md`. If it exists with `book_type: foundational`: **hard stop.**

```
STOP. This is a foundational book — manually authored, not Librarian-managed.
Book: {title} | Path: {outputBookPath}
```

Proceed only if: no BOOK.md exists (new book) OR `book_type: source-derived`.

---

## Generate Mode

Full scan, complete book output. Overwrites existing book entirely.

If `watsonMode=false` and book exists: prompt for overwrite confirmation.

### Step 1: Validate Inputs

- Verify each `sourcePaths` path exists. Error clearly if missing.
- `@repo` prefix resolves to monorepo root at runtime.
- Create `outputBookPath` directory if it doesn't exist.

### Step 2: Scan Source Files

Follow @references/source-scanning.md for all four sub-scans (components, tokens, typography, icons). Skip unparseable files — log them in `skipped_files`, don't fail.

### Step 3: Determine Book Structure

Follow the structure rules in @references/source-scanning.md to map scanned data to chapters. Decide two-level vs three-level per chapter.

### Step 4: Write Chapter and Page Files

Follow @references/book-schema.md for all frontmatter schemas. Use the component PAGE.md template from book-schema.md for component pages.

**Content rules:**
- Structured reference only — no JSX examples
- Use prop tables, token tables, bulleted lists
- Minimal prose
- Exclude deprecated components entirely

### Step 5: Write BOOK.md Index

Follow BOOK.md schema in @references/book-schema.md. Include:
- `book_type: source-derived`
- `source_hash`: sha256 of concatenated source file contents (alphabetical order)
- `chapters[]` manifest with routing summaries

### Step 6–7: Update LIBRARY.md and Commit

See [Shared Operations](#shared-operations) below.

---

## Update Mode

Surgical diff — only changed chapters/pages are regenerated.

> **Watson 1.0:** Single book per invocation. Multi-book batch deferred to 1.1.

### Step 1: Validate and Load

Run Book-Type Guard. Then read `{outputBookPath}/BOOK.md`.

If no BOOK.md exists: stop with "Run generate mode first."

**Fast-path:** Compute source_hash. If unchanged from BOOK.md frontmatter: skip to Step 6 (timestamp update only).

### Step 2: Re-Scan Source Files

Same scan as generate mode Step 2. Store results in memory — no file writes yet.

### Step 3: Compute Chapter-Level Diff

For each chapter in the existing manifest:
1. Identify which source files feed this chapter
2. Compute sha256 of those files
3. Compare against stored hash in CHAPTER.md frontmatter

Classify each chapter:
- **unchanged** — hashes match; skip entirely
- **modified** — hashes differ; regenerate chapter and its pages
- **new** — source exists with no matching chapter
- **removed** — chapter exists with no matching source

### Step 4: Preview Changes

```
Librarian Update Preview
========================
  ~ global-theme: tokens changed (hash mismatch)
  = components: unchanged
  + new-chapter: new source directory
  - removed-chapter: source deleted
```

If `watsonMode=false`: prompt "Apply these changes? (y/n)".
If diff is empty: skip to Step 6.

### Step 5: Apply Updates

- **Unchanged:** Skip — do not read or write
- **Modified:** Regenerate chapter + pages using generate mode write logic
- **New:** Create directory and files per generate mode Step 4
- **Removed:** Delete chapter directory, remove from BOOK.md manifest

Update BOOK.md frontmatter: `last_updated`, `source_hash`, `chapters[]`.

### Step 6–7: Update LIBRARY.md and Commit

See [Shared Operations](#shared-operations) below.

---

## Shared Operations

### Update LIBRARY.md (Step 6 — both modes)

1. Read `library/LIBRARY.md` (one directory above `outputBookPath`)
2. Find this book's section by title match — replace if found, append if new
3. Update `**Books:** N` count and `**Last updated:**` date
4. Write updated LIBRARY.md

Always additive — preserve all other book entries. Runs even if no chapters changed (updates timestamp).

### Auto-Commit (Step 7 — both modes)

```
# Generate:
lib: generate {book-name} book

# Update:
lib: update {book-name} book — {summary}
```

`git add` the `outputBookPath` directory and `library/LIBRARY.md` specifically. Never `git add .` or `git add -A`.

---

## Key Behaviors

1. **Generate is full. Update is surgical.** Generate rewrites everything. Update only touches changed chapters.
2. **Book-type guard is mandatory.** Never generate or overwrite a foundational book.
3. **Source is truth.** Read actual TypeScript types, actual CSS variables. Never rely on stale docs.
4. **Output is for agents.** Structured, terse, consistent shapes. No JSX examples.
5. **LIBRARY.md updates are additive.** Upsert this book's entry, preserve all others.
6. **Skip and log, don't fail.** Unparseable files go to `skipped_files`, not fatal errors.

---

## Error Handling

| Condition | Action |
|-----------|--------|
| `book_type: foundational` | Hard stop (Book-Type Guard) |
| Source path not found | Error and stop |
| No components or tokens at any path | Error and stop |
| Individual file unparseable | Skip, log in `skipped_files` |
| `outputBookPath` doesn't exist | Create it |
| LIBRARY.md doesn't exist | Create from scratch |
| `watsonMode=false` + book exists | Prompt for confirmation |
