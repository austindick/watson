# Feature Research

**Domain:** Multi-mode design reference pipeline (Watson v1.4)
**Researched:** 2026-04-09
**Confidence:** HIGH (all findings derived from direct inspection of existing Watson agent contracts, skill files, and pipeline orchestration)

---

## Scope Note

This research covers only the **new features for Watson 1.4 Multi-Mode Loupe**. The existing Watson 1.3 pipeline is treated as given. The question being answered is: what does each new feature need to do, how does it interact with the existing agents, and what does the normalized intermediate format need to contain so that the rest of the pipeline can remain unchanged?

The six target features are organized as three input modes (Figma, prod-code clone, discussion-only) plus the infrastructure that makes any-source input work (source reader agent, codebase-map book, normalized reference format, multi-mode entry routing). Each mode's feature set is analyzed separately.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features every mode requires to feel complete. Missing these makes the experience broken or unusable for that input type.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Multi-mode entry prompt | Without an explicit mode choice, Loupe asks for a Figma URL by default — users with prod code or no reference have no obvious entry point | LOW | Single AskUserQuestion in loupe Phase -1: "I have a Figma frame / I want to clone an existing experience / Let me describe it." SKILL.md Tier 2 routing also needs updating to pass mode signal |
| Source reader agent: React/TSX parsing | The core value of prod-code clone is that existing experiences can be reproduced without manual annotation; if source reading is unreliable the mode is useless | HIGH | New background agent. Reads TSX files from faire/frontend; extracts component tree, spacing patterns, color usage, typography, and interaction states. Outputs normalized LAYOUT.md + DESIGN.md to `.watson/sections/{name}/` — same paths the existing pipeline already expects |
| Normalized reference format — LAYOUT.md equivalence | Layout agent is Figma-specific today (calls `mcp__figma__get_figma_data`, maps Tailwind classes to tokens); builder and reviewer read LAYOUT.md and are source-agnostic already | MEDIUM | Source reader must produce LAYOUT.md output at the same path, same schema, same sections (Token Quick-Reference, Component Tree, Annotated CSS) as the layout agent. Builder/reviewer require zero changes |
| Normalized reference format — DESIGN.md equivalence | Design agent is Figma-specific today (calls `mcp__figma__get_figma_data`, extracts fills/strokes); builder reads DESIGN.md and is source-agnostic already | MEDIUM | Source reader must produce DESIGN.md output at same path, same schema (Component Mapping, Typography, Color Tokens, Unmapped Values) as design agent. This is the most nuanced extraction — prod code uses Slate tokens directly, not hex fills |
| Codebase-map library book: top-level index | Without a navigation reference, source reader must blindly walk a monorepo it doesn't know — high error rate, slow, context-expensive | HIGH | New source-derived book. Librarian-generated from faire/frontend. Tells source reader: where experiences live, component import paths, file conventions. Structure mirrors design-system book pattern (BOOK.md + chapter files). Required before source reader can be implemented reliably |
| Discussion-only build path | "Describe it" mode currently exists in discuss (discuss-only `referenceType`) and in loupe Phase 2 (skips research agents for discuss-only sections) — but requires a full discuss session to populate blueprint files; standalone "I'm feeling lucky" build from bare description is not yet wired | MEDIUM | Loupe Phase -1 "describe it" branch: accept description, write minimal CONTEXT.md, set all sections as `discuss-only`, trigger library-grounded population of LAYOUT.md + DESIGN.md inline (same path discuss already takes for discuss-only sections), then proceed directly to builder. No new agents needed |
| Optional screenshot supplement | Prod-code clone without a screenshot loses all visual context — components, layout, and spacing — that isn't directly readable from TSX (CSS overrides, conditional styles, runtime-generated classes) | MEDIUM | Accept screenshot in multi-mode entry prompt ("do you have a screenshot?" optional step). Pass screenshot path to source reader; source reader uses it as a visual grounding layer for unmapped values and layout ambiguity. Not required — source reader runs in text-only mode if absent |

### Differentiators (Competitive Advantage)

Features that make Watson 1.4 meaningfully better than manual cloning or "paste your code" approaches.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Slate-token resolution in source reader | Prod code already uses `--slate-*` CSS variables; source reader can resolve these to their exact token names from the design-system book instead of outputting raw values. Result: DESIGN.md from prod code is token-accurate, not "reverse-engineered" | MEDIUM | Source reader loads design-system chapter from libraryPaths (same as other agents). Compares extracted CSS variable names against token table. Direct match → token reference. No-match → Unmapped Values. This makes prod-code DESIGN.md as accurate as Figma-derived DESIGN.md |
| Codebase-map book: experience inventory | If the book indexes named experiences (by feature area and route), the multi-mode entry can offer autocomplete-like suggestions: "Which experience? [Catalog / Orders / Settings / ...]" rather than requiring a raw file path | HIGH | Chapter structure: one chapter per surface area (brand-portal, retailer-portal, shared). Each chapter lists experience names, routes, and primary file paths. Loupe entry prompt can read this chapter to offer a menu |
| Discuss-only path is fully Slate-grounded | Because the discussion-only path runs through discuss or the inline library-loading path, every component suggestion comes from the real design-system book (29 Slate components, 170 icons, full token set) — not hallucinated components | LOW | Already true for discuss-routed builds. The new wire-up is ensuring the standalone "describe it" → loupe path also triggers design-system book loading before builder runs. No new agents; just ensure libraryPaths includes design-system chapters |
| Source reader handles partial reads | Monorepo files are large. Source reader reads only what's necessary: entry component + one level of imported components. Stops at design-system boundaries (does not traverse into `@faire/slate` source). Limits context consumption | MEDIUM | Implement as a depth-bounded traversal: entry file + direct local imports only. External package imports (anything from `node_modules`) → record the import name, look it up in design-system book, stop traversal |
| Mode-appropriate error messages | Figma link expired → "Check sharing settings." Prod file not found → "I couldn't find that file in faire/frontend — can you share the file path?" Blank description → route to discuss instead of failing | LOW | Each mode has distinct failure conditions. Error handling per mode uses designer language (existing Watson pattern). No new infrastructure — just mode-specific error text |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Automated screenshot capture | "Clone from prod" implies a screenshot; automating it sounds like the full experience | SSO/auth complexity documented in PROJECT.md as explicitly out of scope for 1.4. Even without auth, headless capture is an external dependency (Playwright/Puppeteer) violating the "no external deps" constraint | Accept user-provided screenshot as an optional supplement. Document that automation is a future feature (Watson 2.0) |
| Full monorepo indexing (all files in faire/frontend) | Complete index sounds more powerful | Monorepo is enormous; a full scan produces a book that's too large for agent context and takes too long to generate. The value is navigation guidance, not exhaustive coverage | Scope codebase-map book to top-level experience directories only. Index entry points, not every file. Source reader traverses locally from those entry points |
| Source reader that re-creates full design fidelity from code | Users expect prod clone to look identical | Prod code has runtime conditionals, dynamic styles, CSS overrides, and server-provided content that can't be read statically. Claiming full fidelity misleads users | Set accurate expectation: source reader extracts structural fidelity (component tree, token usage). Screenshot supplement fills visual gaps. Unmapped Values section surfaces what couldn't be resolved — same pattern as Figma path |
| Parallel source reader + Figma for the same section | "Use both for highest accuracy" | Two sources of truth for the same section creates contradictions in LAYOUT.md and DESIGN.md that cascade into build errors. Managing conflicts is a new and fragile concern | Pick one reference per section. If user provides both, ask which to treat as primary. The other can be a screenshot supplement |
| New agents for layout, design, interaction in prod-clone path | Separate agents per reference type keeps concerns separated | Doubles agent count (8 → 14+). Every downstream consumer (builder, reviewer, consolidator) would need dual-mode support. The existing builder/reviewer are source-agnostic — the entire value of normalization is that nothing downstream changes | Source reader is the normalization layer. One new agent, not three |
| Codebase-map book with cached component usage patterns | "Show me which Slate components are used where" | This is the "cached surfaces library book" that PROJECT.md explicitly defers to Watson 2.0 (maintenance tax, premature optimization). The codebase-map book should be navigation-only, not a usage analytics layer | Codebase-map book = file paths and experience names only. Slate component usage is already covered by the design-system book from source |

---

## Feature Dependencies

```
Multi-mode entry prompt
    └──requires──> loupe Phase -1 mode selection question
                       └──feeds──> prod-clone path: codebase-map book (for experience suggestions)
                       └──feeds──> prod-clone path: source reader agent dispatch
                       └──feeds──> discuss-only path: inline library loading + builder dispatch
                       └──feeds──> Figma path: existing decomposer (unchanged)

Codebase-map library book
    └──required by──> source reader (knows where to find experience files)
    └──enhances──> multi-mode entry (can offer named experience suggestions)
    └──generated by──> Librarian (new generate mode run; same Librarian agent, new sourcePaths[])
    └──read by──> loupe Phase 0 (add to libraryPaths[] resolution when mode = prod-clone)

Source reader agent
    └──requires──> codebase-map book (navigation reference)
    └──produces──> .watson/sections/{name}/LAYOUT.md (same schema as layout agent output)
    └──produces──> .watson/sections/{name}/DESIGN.md (same schema as design agent output)
    └──reads──> design-system book (for Slate token resolution in prod code)
    └──reads──> optional screenshot (visual supplement for unmapped values)
    └──replaces──> layout agent + design agent for prod-clone sections ONLY
    └──does NOT replace──> interaction agent (interaction agent stays; runs on discuss context or skips)

Pipeline generalization (loupe.md changes)
    └──requires──> source reader agent (produces the normalized files)
    └──requires──> multi-mode entry (determines which path to take)
    └──changes to loupe Phase 1──> decomposer condition: runs only when mode = figma AND hasFullFrame
    └──changes to loupe Phase 2──> research agents condition: runs only when referenceType = "figma"
                                   source reader dispatch: runs when referenceType = "prod-clone"
    └──NO changes to──> builder, reviewer, consolidator (consume LAYOUT.md/DESIGN.md regardless of source)
    └──NO changes to──> decomposer (Figma path unchanged)
    └──NO changes to──> interaction agent (already handles null nodeId as discuss-only fallback)

Discussion-only build path (standalone)
    └──requires──> multi-mode entry "describe it" branch
    └──reads──> design-system book + playground-conventions book (same as discuss path)
    └──populates──> blueprint LAYOUT.md + DESIGN.md from description (same as discuss does for discuss-only sections)
    └──sets──> all sections as referenceType: "discuss-only"
    └──dispatches──> loupe Phase 3 (builder) directly — skips Phase 1 and Phase 2
    └──NO new agents needed──> discuss already defines this path for post-discussion builds

Optional screenshot supplement
    └──accepted by──> multi-mode entry (optional step after "clone existing experience" selection)
    └──passed to──> source reader as screenshotPath parameter
    └──used by──> source reader Step N: visual grounding for unmapped values
    └──ignored by──> all other agents (not in their input contracts)
```

### Dependency Notes

- **Codebase-map book is the critical path blocker.** Source reader cannot navigate the monorepo reliably without it. Must be generated first (Librarian run against faire/frontend). This is Phase 1 of implementation — generate the book before writing the source reader agent.
- **Source reader replaces layout + design agents for prod-clone sections only.** The interaction agent still runs (with null `nodeId` triggering discuss-only / library-defaults path). Builder, reviewer, consolidator are completely unchanged — they consume LAYOUT.md and DESIGN.md regardless of origin.
- **Loupe orchestration changes are additive, not replacement.** Phase 2 gains a new branch: `if (referenceType === "prod-clone")` dispatch source reader instead of layout/design agents. The `referenceType: "figma"` branch is untouched.
- **Discussion-only path reuses existing infrastructure.** No new agents. Discuss already defines how to populate LAYOUT.md + DESIGN.md for discuss-only sections. The new wire-up is: loupe Phase -1 "describe it" branch → inline population → Phase 3 dispatch.
- **Screenshot is optional at every level.** Source reader must handle `screenshotPath: null` gracefully and produce useful output anyway.

---

## Per-Mode Feature Breakdown

### Mode A: Figma Frame (existing, minimal changes)

**What changes:**
- Multi-mode entry prompt replaces the current "do you have a Figma URL?" implicit check in loupe Phase -1
- If user selects "I have a Figma frame": existing flow runs unchanged
- Decomposer, layout, design, interaction, builder, reviewer, consolidator: zero changes

**Table stakes for this mode:**
- Mode selection question must not add friction for the Figma path — the existing two-step (select mode → provide URL) should be no slower than the current implicit flow

**Complexity:** LOW — existing agents unchanged; loupe Phase -1 routing gets one extra step

---

### Mode B: Prod-Code Clone

**What changes:**
- Multi-mode entry: user selects "I want to clone an existing experience"
- Optional: present experience name suggestions from codebase-map book
- Accept: experience name or file path (codebase-map book resolves name → path if needed)
- Accept optional: screenshot path
- Loupe dispatches source reader agent (background) instead of layout + design agents
- Interaction agent still runs (no Figma nodeId → falls back to discuss-only / library-defaults behavior)
- Source reader outputs LAYOUT.md + DESIGN.md to same paths, same schemas → builder/reviewer unchanged

**Table stakes for Mode B:**

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| File path resolution | User needs to tell loupe which experience to clone; accepting a name from the codebase-map book menu is better UX than requiring a raw path | MEDIUM | Loupe reads codebase-map experience chapter; surfaces names as options. If user provides path directly, accept that too |
| Component tree extraction | The component tree is the primary structural output — what components are used, how they're nested, what props are passed | HIGH | Source reader traverses the entry TSX file. Records component names, nesting, key props. Depth-limited: entry + direct local imports only. External imports (Slate components) looked up in design-system book |
| Token extraction from prod code | Prod code uses `--slate-*` CSS vars directly; extracting these produces accurate DESIGN.md without any "reverse engineering" needed | MEDIUM | Source reader reads `className` and inline `style` props; extracts `var(--slate-*)` references; looks each up in design-system global-theme chapter; records as token → element mappings in DESIGN.md Color Tokens section |
| Unmapped values section | Some prod code uses non-token values (legacy, overrides, one-offs); these must be surfaced, not silently dropped | LOW | Same pattern as design agent: anything not resolvable to a design-system token → Unmapped Values with raw value and TODO comment |
| Screenshot visual supplement | CSS class names + token references alone miss: visual hierarchy, actual rendered spacing, conditional styles, content layout. Screenshot provides the gap | MEDIUM | Source reader loads screenshot if provided; uses it to validate and supplement what was extracted from TSX. Unmapped values get a note like "see screenshot for visual context" when a screenshot is present |

**Differentiators for Mode B:**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Named experience menu | User says "Orders management table" not "/src/brand-portal/features/orders/OrdersTable.tsx" | HIGH | Requires codebase-map book with experience inventory chapter. Loupe reads chapter, presents top options via AskUserQuestion |
| Slate-grounded output | Prod code uses Slate; source reader resolves its CSS vars to named tokens → DESIGN.md is as clean as Figma path | MEDIUM | Only possible because design-system book exists and contains the full token map |

---

### Mode C: Discussion-Only ("I'm feeling lucky")

**What changes:**
- Multi-mode entry: user selects "Let me describe it"
- If description is provided in the message: use it; otherwise prompt for description
- Loupe Phase -1 populates minimal CONTEXT.md from description
- Loupe loads design-system + playground-conventions books (same as discuss path)
- All sections set as `referenceType: "discuss-only"` — this is already supported
- Blueprint LAYOUT.md + DESIGN.md are populated from the description + library books (inline, same as discuss already does for discuss-only sections)
- Phase 1 (decomposer) and Phase 2 (research agents) are skipped entirely
- Phase 3 (builder) receives discuss-only paths: `layoutPath = {blueprintPath}/LAYOUT.md`, `designPath = {blueprintPath}/DESIGN.md`

**Table stakes for Mode C:**

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Single-section build from description | User describes what they want; one pass builds it. No multi-section decomposition needed for this mode | MEDIUM | Description → section name + LAYOUT.md + DESIGN.md population → builder. If user's description implies multiple sections, still build as one unless they explicitly name sections |
| Library-grounded component selection | Builder must use real Slate components; "I'm feeling lucky" cannot hallucinate components | LOW | libraryPaths must include design-system chapters in Mode C. This is already how discuss-only sections work in the post-discuss path — just wire it for the standalone entry |
| Honest output expectations | User knows they didn't provide a reference; the result will be interpretation-based | LOW | Progress message for Mode C: "Building from your description..." (distinct from "Analyzing your Figma frame..."). User understands there's interpretive latitude |

**Differentiators for Mode C:**

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Fast path — no discuss required | Go from blank slate to working prototype in one invocation | LOW | The value is speed. Discuss gives better output quality; Mode C trades quality for speed. Users who want better quality can run discuss first |
| Blueprint-persisted decisions | Even though it's a fast path, the builder produces LAYOUT.md + DESIGN.md that persist in the blueprint — the result is inspectable and reusable | LOW | No new infrastructure needed; existing consolidator already handles discuss-only sections |

---

## Normalized Reference Format

The normalized reference format is the contract between source reader and the rest of the pipeline. It is not a new format — it is the **exact existing LAYOUT.md + DESIGN.md schema** as defined by `artifact-schemas/LAYOUT-EXAMPLE.md` and `artifact-schemas/DESIGN-EXAMPLE.md`.

### What source reader must produce for LAYOUT.md

```
# LAYOUT: {sectionName}

## Token Quick-Reference
| Element | Token | Value |

## Component Tree
[ASCII tree matching LAYOUT-EXAMPLE.md format]

## Annotated CSS
[CSS block with var(--token-*) references and /* Source: {value} */ comments]
```

**Source reader vs Figma path differences:**
- Token Quick-Reference: same schema. Source reader looks up token names from design-system book (prod code has `--slate-*` vars already); Figma path maps pixel values to nearest token.
- Annotated CSS comment style: use `/* Source: {original class or value} */` instead of `/* Figma: {px} */` to signal origin without changing the schema structure. Builder and reviewer look for token references, not comment text.
- Component Tree: same ASCII format. Source reader uses actual component names from TSX (e.g., `DataTable`, `Button (primary)`). Figma path infers component names from layer names.

### What source reader must produce for DESIGN.md

```
# DESIGN: {sectionName}

## Component Mapping
| Element | Component | Variant | Props |

## Typography
| Element | Preset | Size | Weight | Line-height |

## Color Tokens
| Element | Property | Token | Value |

## Unmapped Values
| Element | Property | Raw Value | Notes |
```

**Source reader vs Figma path differences:**
- Component Mapping: sourced from JSX component names + prop values directly (not inferred from visual appearance as in Figma path). More reliable for known Slate components.
- Typography: extracted from `className` typography preset classes or `style` props. Same schema.
- Color Tokens: extracted from `var(--slate-*)` references in className/style; resolved to token values via design-system book. Prod code is already tokenized — this is a lookup, not a mapping exercise.
- Unmapped Values: any value not in the design-system token table. Prod code may have legacy values, overrides, or custom colors.

### What source reader must NOT produce

- Raw JSX code snippets (violates "no JSX examples" rule from book-schema.md)
- Component documentation or prose explanations
- Any format variation that would require builder or reviewer changes

---

## Codebase-Map Book Structure

The codebase-map book follows the same BOOK.md + CHAPTER.md schema as the design-system book. It is source-derived (`book_type: source-derived`) and generated by the existing Librarian agent.

### Proposed Book Structure

```
library/codebase-map/
  BOOK.md          — index: source_paths, chapters manifest, use_when
  experiences/
    CHAPTER.md     — experience inventory: names, routes, entry file paths
  conventions/
    CHAPTER.md     — file naming conventions, import path patterns, directory structure
```

**Why only 2 chapters (not one per surface area):**
- A flat experience inventory chapter is simpler to generate and simpler for loupe to consume
- Surface areas (brand-portal, retailer-portal, shared) can be sections within the experiences chapter
- The conventions chapter captures structural patterns that help source reader understand what it's reading

### BOOK.md use_when

```
Use when: Loupe needs to find an existing experience file path in faire/frontend, 
          or source reader needs to understand the monorepo directory structure.
```

### Experiences CHAPTER.md — what it indexes

| Field | Content | Example |
|-------|---------|---------|
| Experience name | Human-readable | "Orders Management Table" |
| Surface area | Brand / Retailer / Shared | Brand |
| Route | The URL path in the app | `/brand/orders` |
| Entry file | Path relative to repo root | `brand-portal/src/features/orders/OrdersPage.tsx` |
| Key components | Comma-separated list (top-level only) | `OrdersTable, FilterBar, OrderDetailDrawer` |

**Line budget:** 2–3 lines per experience, max 50 experiences indexed (covers major surfaces without exhaustive coverage). Source reader navigates from entry file — the book doesn't need to index every subcomponent.

### What codebase-map book is NOT

- Not a component usage database (that's Watson 2.0 cached-surfaces book)
- Not a full file tree (too large, wrong tool for the job)
- Not documentation of component implementations (that's the design-system book)
- Not guaranteed exhaustive (covers major product surfaces; source reader handles files outside the map by path)

---

## Agent Change Matrix

| Agent | Changes for v1.4 | Complexity |
|-------|-----------------|------------|
| `decomposer.md` | None — only runs for Figma mode | NONE |
| `layout.md` | None — only runs for Figma sections | NONE |
| `design.md` | None — only runs for Figma sections | NONE |
| `interaction.md` | None — already handles null nodeId as discuss-only fallback | NONE |
| `builder.md` | None — reads LAYOUT.md + DESIGN.md regardless of source | NONE |
| `reviewer.md` | None — reads LAYOUT.md + DESIGN.md regardless of source | NONE |
| `consolidator.md` | None — reads `.watson/sections/*/` regardless of source | NONE |
| `librarian.md` | None — new book uses same generate mode; just new sourcePaths[] invocation | NONE |
| `source-reader.md` | **New agent** | HIGH |
| `loupe.md` (subskill) | Phase -1: multi-mode entry. Phase 0: conditional codebase-map book loading. Phase 2: prod-clone branch dispatching source reader instead of layout+design agents | MEDIUM |
| `SKILL.md` | Tier 2 routing: pass `mode` signal to loupe if it can be inferred from message context | LOW |

**Key insight:** The normalization contract (LAYOUT.md + DESIGN.md schema) is what makes zero downstream agent changes possible. This is the architectural leverage point. Any deviation from the existing schemas in source reader output would force changes in builder, reviewer, and consolidator simultaneously.

---

## MVP Definition

### Launch With (v1.4)

Minimum viable for multi-mode to be usable end-to-end for all three modes.

- [ ] Codebase-map library book (Librarian generate run, experiences + conventions chapters) — required before source reader can be written
- [ ] Source reader agent: TSX traversal, Slate token resolution, LAYOUT.md + DESIGN.md output at exact existing schema — this is the largest net-new work
- [ ] Multi-mode entry prompt in loupe Phase -1 (3-option AskUserQuestion: Figma / prod-clone / describe it)
- [ ] Loupe Phase 2 prod-clone branch: dispatch source reader instead of layout+design agents when `referenceType = "prod-clone"`
- [ ] Loupe Phase 0 codebase-map book loading (conditional on mode)
- [ ] Discussion-only standalone entry (loupe Phase -1 "describe it" branch → inline library loading → Phase 3 dispatch)
- [ ] Optional screenshot parameter in source reader (graceful null handling required)

### Add After Validation (v1.4.x)

Add once each mode is validated working for at least one end-to-end run.

- [ ] Named experience menu in Mode B (reads codebase-map experiences chapter, presents top options via AskUserQuestion) — currently user provides path; menu is a UX improvement
- [ ] SKILL.md Tier 2 inference: if message mentions a file path or experience name, infer Mode B and pass mode signal to loupe
- [ ] Source reader screenshot visual grounding (supplement text extraction with screenshot for unmapped value context)

### Future Consideration (v2+)

- [ ] Automated screenshot capture — requires SSO/auth solution; explicitly deferred to Watson 2.0 per PROJECT.md
- [ ] Cached surfaces book (per-surface component usage analytics) — maintenance tax; Watson 2.0
- [ ] Full monorepo traversal (all experiences indexed) — scope creep; codebase-map stays navigation-focused

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Codebase-map book: experiences chapter | HIGH | MEDIUM (Librarian run + manual curation of experience inventory) | P1 |
| Multi-mode entry prompt | HIGH | LOW (AskUserQuestion in loupe Phase -1) | P1 |
| Source reader: component tree + token extraction | HIGH | HIGH (new agent, TSX parsing logic) | P1 |
| Normalized LAYOUT.md + DESIGN.md output from source reader | HIGH | HIGH (must match existing schema exactly) | P1 |
| Loupe Phase 2 prod-clone branch | HIGH | MEDIUM (additive, does not touch existing figma branch) | P1 |
| Discussion-only standalone entry | MEDIUM | MEDIUM (reuses existing discuss-only section infrastructure) | P1 |
| Source reader: screenshot supplement parameter | MEDIUM | MEDIUM (visual grounding logic) | P2 |
| Named experience menu from codebase-map | MEDIUM | LOW (read chapter, present options) | P2 |
| Loupe Phase 0 conditional codebase-map loading | LOW | LOW (additive to existing library resolution) | P2 |
| SKILL.md Tier 2 mode inference | LOW | LOW (message pattern matching) | P3 |

**Priority key:**
- P1: Must have for any mode to work end-to-end
- P2: Meaningfully improves UX; add in v1.4 if time allows or in v1.4.x
- P3: Nice to have; defer until v1.4 is validated

---

## Sources

- Watson SKILL.md (`/Users/austindick/watson/skills/core/SKILL.md`) — Tier 2 routing, intent classification, loupe dispatch contract
- Watson loupe.md (`/Users/austindick/watson/skills/core/skills/loupe.md`) — Phase -1 through Phase 5, existing mode detection, sections[] schema, referenceType handling
- Watson discuss.md (`/Users/austindick/watson/skills/core/skills/discuss.md`) — discuss-only section handling, LAYOUT.md + DESIGN.md population for discuss-only sections, return status schema
- Watson decomposer.md — output contract: `{name, nodeId, dimensions}[]`
- Watson layout.md — Figma-specific extraction steps, LAYOUT.md output schema
- Watson design.md — Figma-specific extraction steps, DESIGN.md output schema
- Watson interaction.md — null nodeId fallback behavior (discuss-only mode already exists)
- Watson builder.md — input contract: reads LAYOUT.md + DESIGN.md from path, source-agnostic
- Watson reviewer.md — input contract: reads LAYOUT.md + DESIGN.md from path, source-agnostic
- Watson consolidator.md — reads `.watson/sections/*/` glob, source-agnostic
- Watson librarian.md — generate mode, sourcePaths[] contract, book-type guard
- Watson book-schema.md — BOOK.md, CHAPTER.md, PAGE.md schemas
- Watson source-scanning.md — four sub-scans, book structure determination rules
- Watson LIBRARY.md — existing book index, two current books
- Watson LAYOUT-EXAMPLE.md — canonical LAYOUT.md schema
- Watson PROJECT.md — v1.4 milestone target features, out-of-scope decisions

---

*Feature research for: Multi-mode design reference pipeline (Watson v1.4)*
*Researched: 2026-04-09*
