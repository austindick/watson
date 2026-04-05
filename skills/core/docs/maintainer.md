# Watson Maintainer Documentation

Technical reference for engineers who maintain Watson -- updating library books, adding subskills, modifying agents.

Watson lives at `${CLAUDE_PLUGIN_ROOT}/skills/core/`. It is a Claude Code skill plugin with a library system, agent pipeline, and subskill routing layer.

---

## 1. Library System Overview

The library lives at `${CLAUDE_PLUGIN_ROOT}/skills/core/library/`. It uses a 3-level hierarchy:

```
LIBRARY.md              <- index of all books
  library/{book}/
    BOOK.md             <- book index (frontmatter + chapter manifest)
      {chapter}/
        CHAPTER.md      <- content or page manifest
          PAGE.md       <- granular content (e.g., one component per page)
```

`LIBRARY.md` is the entry point. Subskills read it to discover books, match `use_when` guidance to the current task, then pass resolved chapter/page paths to agents as `libraryPaths[]`.

### Two Book Types

| Type | `book_type` value | Managed by | Example |
|------|-------------------|------------|---------|
| Source-derived | `source-derived` | Librarian agent (auto-generated) | `library/design-system/` |
| Foundational | `foundational` | Human maintainers (manual edits) | `library/playground-conventions/` |

The `book_type` field is a safety guard. The Librarian has a hard stop: if it reads `book_type: foundational` in a BOOK.md, it refuses to proceed. This prevents accidental overwrite of manually authored content.

---

## 2. Updating the Design System Book

The design system book (`library/design-system/`) is source-derived. The Librarian generates it by scanning Slate source files.

### When to Regenerate

Regenerate after any Slate source change: new components, updated props, token changes, icon additions.

### How to Regenerate

Invoke the Librarian agent in generate mode with these parameters:

- `mode: generate`
- `sourcePaths`:
  - `@repo/packages/core/slate/src/components/`
  - `@repo/packages/core/slate/src/foundation/`
  - `@repo/packages/core/slate/src/icons/`
- `outputBookPath: ${CLAUDE_PLUGIN_ROOT}/skills/core/library/design-system/`

Or tell Claude: "Regenerate the design system book." The Librarian handles the rest.

### What It Produces

The Librarian overwrites the entire `library/design-system/` directory:
- `BOOK.md` with updated `source_hash` (sha256 of concatenated source contents)
- `global-theme/CHAPTER.md` -- color tokens, spacing, radii, typography presets
- `components/CHAPTER.md` + individual `PAGE.md` files (one per component)
- `icons/CHAPTER.md` -- icon inventory with shared props interface
- Updated entry in `LIBRARY.md`

Skipped files are logged but do not fail the run. Check the Librarian output for parse warnings.

### Updating Source Paths

If Slate's directory structure changes (paths move, new source directories appear):

1. Edit `source_paths` in `library/design-system/BOOK.md` frontmatter.
2. Run the Librarian in generate mode. It reads `source_paths` from BOOK.md and resolves `@repo` to the monorepo root at runtime.

---

## 3. Updating the Conventions Book

The playground conventions book (`library/playground-conventions/`) is foundational. The Librarian refuses to touch it.

### Editing Existing Chapters

Edit the chapter file directly. Each chapter is a directory with a `CHAPTER.md`:

```
library/playground-conventions/
  project-structure/CHAPTER.md
  scaffolding/CHAPTER.md
  components/CHAPTER.md
  design-tokens/CHAPTER.md
  dev-workflow/CHAPTER.md
  multi-variant/CHAPTER.md
  contributor-registration/CHAPTER.md
```

Keep content as structured reference (tables, bulleted lists) -- not prose.

### Adding a New Chapter

1. Create a directory: `library/playground-conventions/{chapter-id}/`
2. Write `CHAPTER.md` inside it.
3. Add the chapter to the `chapters:` array in `library/playground-conventions/BOOK.md`:
   ```yaml
   - id: chapter-id
     path: chapter-id/CHAPTER.md
     summary: "One-line description for routing decisions"
   ```
4. Update `last_updated` in both `BOOK.md` and `LIBRARY.md`.

### Source References

The `source_paths` list in BOOK.md frontmatter tracks where the content was originally consolidated from. Update this list if you draw from a new source document, so future maintainers know the provenance.

---

## 4. Adding a New Book

1. **Choose `book_type`.** Use `source-derived` if content can be scanned from source files. Use `foundational` if it requires human authoring or consolidation from multiple docs.

2. **Create the directory:** `library/{book-name}/`

3. **Write `BOOK.md`** with required frontmatter (see `references/book-schema.md`):
   ```yaml
   ---
   type: book
   title: "Book Title"
   last_updated: "2026-03-31"
   book_type: source-derived  # or foundational
   source_paths:
     - "@repo/path/to/source/"
   chapters:
     - id: chapter-id
       path: chapter-id/CHAPTER.md
       summary: "Chapter routing summary"
   use_when: "When agents should pull from this book"
   source_hash: "sha256:..."  # or "foundational-manually-authored"
   ---
   ```

4. **Create chapters.** For source-derived books, run the Librarian in generate mode instead of writing chapters manually. For foundational books, create each `{chapter-id}/CHAPTER.md` by hand.

5. **Register in `LIBRARY.md`.** Add an entry with: path, book type, last updated, chapters summary, use_when, and last run info.

---

## 5. Agent Maintenance

Agents live at `${CLAUDE_PLUGIN_ROOT}/skills/core/agents/`. Current agents:

| Agent | File | Dispatch Mode |
|-------|------|---------------|
| decomposer | `agents/decomposer.md` | foreground |
| layout | `agents/layout.md` | background |
| design | `agents/design.md` | background |
| interaction | `agents/interaction.md` | foreground* |
| builder | `agents/builder.md` | background |
| reviewer | `agents/reviewer.md` | background |
| consolidator | `agents/consolidator.md` | background |
| librarian | `agents/librarian.md` | background |

### The Agent Contract

`references/agent-contract.md` is the canonical registry. Agent YAML frontmatter and the contract spec are a **mirrored pair** -- when one changes, the other must too.

The contract defines:
- **Shared parameters** all agents receive: `blueprintPath`, `libraryPaths[]`, `watsonMode`
- **Pipeline parameters** for loupe agents: `sectionName`
- **Agent-specific parameters** per agent (e.g., `figmaUrl` for decomposer, `mode` for librarian)
- **Dispatch mode**: foreground (may prompt user) or background (must run silently). Binary and permanent per agent.

### Modifying an Agent

1. Edit the agent file at `agents/{name}.md`.
2. Update the matching row in `references/agent-contract.md` if you changed dispatch mode, parameters, or outputs.
3. Check every subskill that dispatches the agent (`skills/discuss.md`, `skills/loupe.md`) -- they pass parameters at dispatch time and may need updates.

### Adding a New Agent

1. Add a row to the Agent Registry in `references/agent-contract.md` first. Define: file path, dispatch mode, agent-specific params, outputs.
2. Create the agent file at `agents/{name}.md`. Copy frontmatter format from an existing agent -- it must mirror the contract spec entry.
3. Wire dispatch in the subskill that will call it.

---

## 6. Adding a New Subskill

Subskills live at `${CLAUDE_PLUGIN_ROOT}/skills/core/skills/`. Current subskills: `discuss.md` (conversational design discussion) and `loupe.md` (Figma-to-code pipeline).

### Subskill Structure

Each subskill file has:
- **YAML frontmatter**: `name`, `type: subskill`, `purpose`
- **Phase 0 -- Library Resolution**: reads `LIBRARY.md`, selects relevant books by `use_when`, resolves `libraryPaths[]`
- **Execution phases**: the subskill's core logic
- **Return contract**: structured JSON returned to `SKILL.md`

### How Subskills Dispatch Agents

Subskills are responsible for library resolution. They read `LIBRARY.md` and `BOOK.md` manifests, select chapters based on `use_when` guidance, and pass resolved absolute paths as `libraryPaths[]` to agents. Agents never navigate the book hierarchy themselves.

### Creating a New Subskill

1. Create `skills/{name}.md` with frontmatter:
   ```yaml
   ---
   name: {name}
   type: subskill
   purpose: One-line description
   ---
   ```
2. Implement Phase 0 (library loading) -- follow the pattern in `skills/loupe.md`.
3. Define the return contract -- structured JSON that `SKILL.md` consumes to route next steps.
4. Register routing in `SKILL.md`:
   - Add a shortcut in Intent Classification (e.g., `/watson {name}`)
   - Add a routing case with dispatch parameters
   - Add return status handling if the subskill chains into another

---

## 7. Common Tasks

### Checking Book Freshness

Source-derived books store a `source_hash` (sha256 of concatenated source file contents, alphabetical order). To check if a book is stale, compare its stored hash against the current source files. If the Librarian detects a hash mismatch, it knows regeneration is needed.

Foundational books use the sentinel value `foundational-manually-authored` as their source_hash.

### Updating Source Paths After Repo Changes

If source directories move or are renamed:
1. Update `source_paths` in the affected `BOOK.md` frontmatter.
2. Regenerate the book (for source-derived books).
3. The `@repo` prefix resolves to the monorepo root at runtime -- use it for all monorepo-relative paths.

### Regenerating After Slate Updates

1. Confirm which source paths changed.
2. Run the Librarian in generate mode (see section 2).
3. Review the diff for new/removed components, changed props.
4. Commit the regenerated book.

### Debugging a Missing Component

If a component exists in Slate source but is missing from the book, the book is stale -- regenerate. If the component does not exist in Slate source yet, wait for it to land before regenerating. Do not manually add entries to source-derived books; the next Librarian run overwrites them.
