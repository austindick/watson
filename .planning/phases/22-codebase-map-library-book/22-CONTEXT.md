# Phase 22: Codebase-Map Library Book - Context

**Gathered:** 2026-04-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Librarian generates a codebase-map library book from faire/frontend that maps product surfaces to file paths. Source agents (Phase 23) and the named experience menu (Phase 24) consume this book. Phase 22 delivers the book only — the menu UX and source agent wiring are downstream phases.

</domain>

<decisions>
## Implementation Decisions

### Product Area Coverage
- Index 3 apps: Brand Portal (seller dashboard), Retailer (buyer portal), Logged Out (marketplace/public-facing — relabeled from "Marketplace" for clarity)
- Include major sub-pages within each app (~150-300 total entries)
- Do NOT index brand-sdk separately — source agents follow imports from brand-portal into it as needed
- Source packages: `packages/brand-portal/brand-portal/src/maker/`, `packages/retailer/`, `packages/marketplace/`

### Book Structure
- Single book with 3 chapters organized by app (departing from research's routes/shared-components/feature-modules structure)
- Chapter directories: `brand-portal/`, `retailer/`, `logged-out/`
- 2-level inline tables: all surfaces as rows in section-grouped tables within CHAPTER.md (no PAGE.md files)
- Follows existing Book/Chapter hierarchy and book-schema.md conventions

### Entry Format
- 5 columns per surface entry: Name, Route, Description, File Path, Last Verified
- Name: human-readable surface name (e.g., "Order Detail")
- Route: production URL path (e.g., `/maker/orders/:id`) — mirrors staging/prod URL slugs
- Description: one-line auto-generated from code (JSDoc, component structure, route context)
- File Path: @repo-prefixed path to primary component file
- Last Verified: ISO date when file path was confirmed to exist
- No additional metadata (component count, child paths, etc.) — source agents derive the rest at runtime

### Section Grouping
- Sections derived from top-level source directories within each app
- Names humanized automatically: kebab-case to Title Case (my-shop → "My Shop")
- Skip non-surface directories: utils/, hooks/, helpers/, lib/, types/, constants/, __tests__/

### Named Experience Menu (UX decisions for Phase 24)
- Two-step categorized browse: pick app (Brand Portal / Retailer / Logged Out) → see surfaces grouped by section
- Free-text input available at any point in the category tree (via AskUserQuestion "Other")
- Fuzzy search on no-match: suggest closest 3-5 candidates, then fall back to browse flow

### Monorepo Path Resolution
- @repo resolves to `git rev-parse --show-toplevel` from user's working directory
- No config setting needed — Prototype Playground lives inside faire/frontend monorepo
- Clear error if outside monorepo: "Codebase-map requires running from within faire/frontend. Are you in the Prototype Playground?"

### Staleness Handling
- last_verified dates tracked per entry but not surfaced in the menu
- Source agents verify paths at runtime (RSLV-04) — stale entries fail gracefully, not silently

### Claude's Discretion
- Exact humanization rules for edge-case directory names
- How to handle directories with ambiguous content (surface vs utility)
- Description generation heuristics when JSDoc is absent

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Librarian agent (agents/librarian.md): already supports generate/update modes, @repo prefix, Book-Type Guard — extend for codebase-map scanning
- book-schema.md: defines BOOK.md/CHAPTER.md/PAGE.md frontmatter — add codebase-map entry template
- source-scanning.md: design-system scanning reference — codebase-map needs its own scanning reference

### Established Patterns
- Book/Chapter/Page hierarchy: design-system book uses 3-level (chapter with pages). Codebase-map uses 2-level (inline chapter tables) — both are valid per schema
- source_hash fast-path: Librarian skips unchanged chapters during update mode — same applies here
- LIBRARY.md upsert: Librarian auto-updates LIBRARY.md after every run — additive, preserves other books

### Integration Points
- LIBRARY.md: new "Codebase Map" entry added after generation
- loupe.md Phase 0: must include codebase-map chapters in libraryPaths when mode=prod-clone (Phase 24 work)
- Source agents (Phase 23): consume codebase-map chapters via libraryPaths[] to locate files
- Named experience menu (Phase 24): reads codebase-map chapters to present surfaces to user

</code_context>

<specifics>
## Specific Ideas

- "Marketplace" relabeled to "Logged Out" — users may not understand that marketplace = logged-out/public pages
- "maker" is not a separate package — it's a subdirectory within brand-portal (packages/brand-portal/brand-portal/src/maker/)
- Route paths mirror production URL slugs (e.g., /maker/orders/:id → brand.faire.com/orders/:id) — users can recognize surfaces by URL

</specifics>

<deferred>
## Deferred Ideas

- Admin package indexing — excluded for now; add as a chapter later if internal tools prototyping is needed
- brand-sdk shared component chapter — excluded; follow-imports approach preferred. Revisit if teams want to clone shared patterns independently
- Cached surfaces library book (pre-built templates) — explicitly out of scope per PROJECT.md (Watson 2.0)

</deferred>

---

*Phase: 22-codebase-map-library-book*
*Context gathered: 2026-04-10*
