# Phase 2: Library System - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the Librarian agent (generate + update modes), populate the design system book from FauxDS source, author the playground conventions book (consolidated from 6+ source docs), wire LIBRARY.md auto-indexing with full metadata, and create the Watson plugin manifest. Two books are delivered: one source-derived (design system), one foundational (conventions). No pipeline agents, subskills, or orchestrator logic are built here.

</domain>

<decisions>
## Implementation Decisions

### Librarian Agent Design
- Port and adapt from Loupe's `~/.claude/skills/loupe/utilities/librarian.md` — proven logic stays, output format changes to Book/Chapter/Page
- Single agent file, book-type aware — routes behavior based on book type, not separate agents per book
- Source paths configured in LIBRARY.md entries (not hardcoded in agent) — adding a new book = adding an entry, not editing the agent
- Full book generation in single pass (generate mode) — reads all source files, writes BOOK.md index + all chapters + all pages in one go
- Self-validating against book-schema.md — catches malformed books at the source before writing files
- Skip and log unparseable source files — skipped files listed in BOOK.md frontmatter, book still usable
- Generate mode overwrites entirely when a book already exists — with confirmation prompt in utility mode (manual invocation), no confirmation in pipeline dispatch (watsonMode=true)
- Restricted manual access — convention-based for Watson 1.0 ("only library maintainers run the Librarian"), documented as maintainer-only
- Last-run stats stored in LIBRARY.md entries — one-line snapshot per book (chapters, pages, skipped), overwritten each run
- Librarian auto-commits book changes with conventional message (e.g., `lib: regenerate design-system book`)
- Librarian refuses to run generate/update on foundational books (uses book_type field as guardrail) — hard stop with explanation, not a warning

### Two Book Types
- **Source-derived books** (design system): Librarian generates mechanically from source files. Auto-updates when source changes. Librarian "owns" these.
- **Foundational books** (playground conventions, future SDD overview): Curated knowledge from multiple sources, authored with Claude's help but not Librarian-generated. Indexed in LIBRARY.md with book_type: "foundational". Librarian refuses to generate/update these.
- LIBRARY.md entries include `book_type: "source-derived" | "foundational"` field — prevents accidental regeneration of curated books

### Design System Book
- Hybrid structure optimized for agent lookup: token chapters (flat, cross-cutting) + component chapters (one per component with PAGE.md)
- Token chapters: colors, typography, spacing, elevation — inline content, no pages needed. Include both token names AND resolved values (e.g., `color-primary: #1A1A1A`) for Design agent Figma-value matching
- Component pages include: import path, prop table, variants, slots, composition patterns (how components nest together), built-in states (hover, focus, disabled, loading)
- Structured reference only — no JSX code examples. Agents generate code from specs, not by copying snippets
- BOOK.md index with descriptive chapter summaries is sufficient for agent routing — no separate quick reference chapter needed
- Wrapper props only for components wrapping third-party libraries — agents use the FauxDS API surface, not underlying library details
- Document built-in responsive behavior on components that have native responsive props
- Exclude deprecated/do-not-use components entirely — agents should never suggest them
- Visual + interactive components only — utility components (providers, context wrappers, theme config) handled by conventions book
- No FauxDS/bridge marking — source-agnostic, regenerate when source changes

### Playground Conventions Book
- Consolidates ALL playground sources into single agent-optimized reference: watson-lite SKILL.md, playground-conventions.md, playground CLAUDE.md, README.md, SHARING_GUIDE.md, SHARED-CODE-POLICY.md
- 2-level book (BOOK.md → CHAPTER.md, no pages) — restructured around agent needs, not human browsing
- Foundational book type — manually authored (Claude drafts, user reviews), NOT Librarian-generated
- Source docs (CLAUDE.md, README, etc.) remain as-is — they serve humans and non-Watson tools. Conventions book is the agent-optimized view. Two audiences, two formats, same information.
- Clearly distinguishes hard rules (MUST/NEVER) vs. guidelines (PREFER/SHOULD) — agents can bend guidelines for design intent but must never break hard rules
- Data layer rules (entity_db, get_entity.ts, validation) live as a chapter within conventions — not a separate book
- SlateTable reference data (props, cell types, config options) in conventions book; interview logic belongs in discuss subskill (Phase 4)

### Update Mode Strategy
- Chapter-level diff — compares source_hash per chapter. Changed hash = regenerate entire chapter. Unchanged = skip. Avoids partial-page patching complexity
- Hash comparison for change detection — each chapter stores hash of its source files. Deterministic, no false positives
- Auto-create new chapters/pages when new source files detected — BOOK.md manifest updated automatically
- Auto-remove chapters/pages when source files deleted — book always mirrors current source
- Update summary in commit message (not a changelog file) — git log becomes the changelog
- On-demand only — library maintainer runs update manually. Watson never auto-triggers updates
- Preview then confirm in utility mode — shows what will change before applying ("Will update 2 chapters, add 1 new page, remove 1 page. Proceed?")

### LIBRARY.md Schema
- YAML frontmatter + markdown table — consistent with book-schema pattern. Agents parse YAML for routing, humans scan table
- LIBRARY.md schema documented within book-schema.md (not a separate file) — one reference for the whole hierarchy
- Full metadata per book entry: id, title, path, book_type, use_when, last_updated, chapter_count, last_run_summary

### Agent-to-Book Routing
- Subskill reads LIBRARY.md, selects relevant books based on use_when fields, passes specific book paths to agents — agents never read LIBRARY.md directly
- `libraryPaths` (array) replaces `libraryPath` (string) in agent contract — agents can receive multiple books. Agent contract from Phase 1 needs minor update
- All paths in array are equal — no primary/supplementary ordering. Subskill already curated the list

### Distribution Strategy (Plugin)
- Watson distributed as a Claude Code plugin (GA feature) — not shared-skills/ in frontend repo
- Plugin manifest (plugin.json) added to existing watson/ directory in Phase 2
- Current watson/ structure (SKILL.md, agents/, skills/, library/, utilities/, references/) already compatible with plugin spec — no restructuring needed
- Library books live in watson/library/, versioned with the plugin — teammates get identical books via plugin updates
- All internal paths relative to watson/ root — entire directory is portable
- Source paths (FauxDS files in frontend repo) use `@repo` prefix convention — Librarian resolves at runtime
- Librarian ships with plugin but documented as maintainer-only — teammates get pre-generated books, don't need to run Librarian themselves

### Build Order
1. Librarian agent (generate mode) — must exist first
2. Design system book — generated by Librarian from FauxDS source
3. Librarian agent (update mode) + LIBRARY.md auto-update — extends the agent
4. Playground conventions book — manually authored, registered in LIBRARY.md
5. Plugin manifest (plugin.json) — formalizes Watson as distributable plugin

### Claude's Discretion
- Chapter count and grouping for conventions book (7 proposed: scaffolding, component rules, design tokens, data layer, multi-variant, publishing, surface-specific — adjust as needed for agent optimization)
- Source priority for FauxDS parsing (TypeScript interfaces > JSDoc > Storybook stories recommended)
- Exact LIBRARY.md YAML field names and types
- How the `@repo` prefix resolves in different environments
- Watson config approach for environment-specific values (if needed beyond @repo convention)

</decisions>

<specifics>
## Specific Ideas

- Books are for agents, not humans — structure decisions driven by agent lookup patterns (direct access by component name or token category), not human browsability
- Builder agent reads both blueprint files (what to build) AND library books (how to build correctly — import paths, prop APIs, composition patterns, playground rules)
- "Agents read books, not source material" principle from Phase 1 carries forward — Librarian is sole interface to source files
- Playground conventions book inspired by the comprehensive analysis of 6+ source docs across watson-lite and faire/frontend prototype-playground
- Plugin approach enables controlled rollout: develop and test locally, distribute to teammates when ready, independent versioning from frontend repo

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `~/.claude/skills/loupe/utilities/librarian.md`: Existing Librarian with generate/update modes — port-and-adapt reference for Watson's Librarian
- `~/.claude/skills/loupe/references/library.md`: 1145-line flat design system reference — structural model for what agents need from design system data
- `~/.claude/skills/watson-lite/references/playground-conventions.md`: Current conventions reference — one of 6+ sources for the consolidated conventions book
- `~/faire/frontend/packages/design/prototype-playground/CLAUDE.md`: Scaffolding instructions, FauxDS gotchas, SlateTable setup, entity DB workflow
- `~/faire/frontend/packages/design/prototype-playground/README.md`: Philosophy, project structure, multi-variant patterns, publishing, design guidelines

### Established Patterns
- Loupe's librarian uses 6-step generate mode — Watson adapts for Book/Chapter/Page output instead of flat library.md
- Book-schema.md locked from Phase 1: YAML frontmatter + markdown content, 3-level hierarchy
- Agent contract spec (references/agent-contract.md): defines shared parameters — `libraryPath` evolves to `libraryPaths` (array)

### Integration Points
- FauxDS source files in frontend repo: input for Librarian's design system book generation
- watson/library/: output location for both books, versioned with plugin
- watson/references/book-schema.md: needs LIBRARY.md schema section added
- watson/references/agent-contract.md: needs libraryPath → libraryPaths update
- Plugin manifest: watson/.claude-plugin/plugin.json

</code_context>

<deferred>
## Deferred Ideas

- **SDD overview book** (Watson 1.1): Foundational book covering Faire's Spec-Driven Development process. Key validation opportunity for generating books from Notion-style content (prose with embedded databases, toggles, cross-links) — fundamentally different from TypeScript source or markdown doc parsing. Includes .prd and .frd file generation capability.
- **Librarian Notion-source support** (Watson 1.1): Extend Librarian to generate books from Notion pages/databases — validates a different generation pattern than TypeScript parsing or doc consolidation.
- **Discussion-based book updates** (Watson 1.1+): For foundational books, a mode where the user describes desired updates conversationally and the Librarian/discuss applies them surgically. Natural fit for discuss subskill.
- **Staleness detection** (Watson 1.1+): Watson checks source_hash at session start and suggests updates when books are stale. Deferred because on-demand-only is simpler for 1.0.
- **Technical enforcement of Librarian access** (Watson 1.1+): Currently convention-based ("only maintainers run Librarian"). Could add plugin-level permissions or role checks.

</deferred>

---

*Phase: 02-library-system*
*Context gathered: 2026-03-30*
