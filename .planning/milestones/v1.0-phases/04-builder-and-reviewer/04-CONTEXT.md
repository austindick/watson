# Phase 4: Builder and Reviewer - Context

**Gathered:** 2026-03-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Agent 4 generates compilable code from LAYOUT.md and DESIGN.md spec files with no hardcoded values, and Agent 5 audits property-by-property and fixes every discrepancy in-place. After reviewer passes, section files are staged to `.watson/sections/{section-name}/`. Verified on the same real section used in Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Blueprint integration
- Builder reads section-level staging files only (.watson/sections/{name}/LAYOUT.md, DESIGN.md) for spec data — does NOT read consolidated blueprint/ files for vocabulary
- Builder reads blueprint/CONTEXT.md for design decisions and constraints (e.g., "minimal UI", "no animations") — informs code choices beyond what spec files capture
- Builder reads ONLY CONTEXT.md from blueprint/ — not consolidated LAYOUT.md or DESIGN.md
- Reviewer does NOT read blueprint/CONTEXT.md — audits mechanically against spec files only
- Section staging files (.watson/sections/{name}/) persist until consolidation — reviewer confirms they exist but does not move or delete them
- watson-init utility creates blueprint/ directory with template files (decided in Phase 1) — builder/reviewer assume it exists
- Independent staging per section — builder has no cross-section awareness; consolidator (Phase 5) handles merging

### Library book usage
- Builder validates component usage at import + prop level — reads library pages to verify correct import path, component variant, and prop names/types
- When library book data conflicts with DESIGN.md spec (e.g., non-existent variant), builder trusts DESIGN.md and adds a TODO comment flagging the discrepancy
- Reviewer audits code against spec files only — does NOT cross-check library books; library mismatches are the Design agent's responsibility
- Builder reads conventions book (via libraryPaths[]) for unmapped element styling patterns — ensures custom CSS follows playground rules (class naming, Tailwind usage)

### Unmapped value handling in code
- Builder uses raw Figma values with TODO comment for elements flagged as unmapped in DESIGN.md
- TODO comment includes: marker, closest library component name + library book path (e.g., "See design-system/components/button"), gap explanation, and raw Figma values
- TODO comment does NOT include suggested import statements — reference path only, to avoid stale imports if library changes
- Same TODO marker for both unmapped values and library conflicts — one format for all human-judgment items
- Builder pulls from BOTH spec files — DESIGN.md Unmapped Values hints AND LAYOUT.md positioning — to make custom CSS structurally correct
- Reviewer verifies every TODO comment follows the locked format (marker, component ref, gap explanation, raw values) and fixes malformed ones; reports total count in summary

### Interaction states without Agent 3
- No INTERACTION.md in v1 — builder relies on library component built-in states only (hover, focus, disabled ship automatically)
- No custom interaction code written for any element — library defaults or nothing
- Custom/unmapped elements get zero interaction behavior until Agent 3 is built
- Agent 4 keeps INTERACTION.md as optional input — if file exists, use it; if absent, proceed with library component defaults only
- Agent 5 same approach — checklist includes INTERACTION.md verification pass only when file exists

### Error handling flow
- Both builder and reviewer return structured JSON payloads: { status, errorType, details, sectionScope, filesModified }
- Builder errorTypes: 'compile', 'scope_not_found', 'spec_missing'
- Reviewer returns dual output: human-readable summary report (for conversation display) AND structured { status, passCount, failCount, escalatedItems, compileStatus }
- On compile failure after 3 fix attempts: builder leaves its best attempt in the file and escalates with compile error output — does NOT revert to pre-build state
- On scope miss (sectionScope not found in target file): builder errors out immediately — does NOT create a new section; subskill resolves
- Reviewer 2-pass maximum: Pass 1 fixes all discrepancies, Pass 2 re-checks; persistent issues escalate with structured payload

### Compile verification
- Both agents run compile checks — builder after generating code, reviewer after fixes
- TypeScript compile check (tsc --noEmit or equivalent) — not full dev build, not syntax-only
- Agent detects compile command from project (checks package.json scripts, tsconfig.json) rather than hardcoding
- Up to 3 fix attempts on compile failure before escalating to user with error output

### Reviewer visibility and escalation
- Reviewer produces a concise summary report displayed in conversation (not written to file)
- Report format: properties checked per spec, fixes applied with details, unmapped/conflict TODO count (format-verified), compile status
- Reviewer always attempts fixes first (best guess) — escalates to user only when same issue persists after 2 passes

### Claude's Discretion
- Agent prompt structure and instruction organization
- How builder discovers and scopes to the correct section in the target file
- Exact compile command detection heuristic
- Review checklist internal organization (as long as summary output matches agreed format)
- Error message formatting when escalating to user
- Structured payload field names and exact JSON shape

</decisions>

<specifics>
## Specific Ideas

- TODO comment pattern for unmapped elements should include closest library component hint + library book path + gap explanation — gives human reviewer a starting point without the AI making the swap
- Summary report format matches the preview: ✅ for passing categories, 🔧 for fixes applied with before→after, ⚠️ for unmapped/conflict TODO count (format-verified), ✔️ for compile status
- Builder scoping is the highest implementation risk (per STATE.md) — agent must only modify assigned section, surrounding code untouched
- Builder reads blueprint/CONTEXT.md for design intent — this is the only blueprint file the builder touches; keeps builder informed about discuss-phase decisions without opening the full blueprint directory
- Conventions book guides unmapped element styling — ensures custom CSS follows playground patterns even when no library component matches

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `builder.md`: Watson agent file with libraryPaths[], blueprintPath, watsonMode parameters — already structured for Watson architecture
- `reviewer.md`: Watson agent file with matching parameters — dual-output pattern (summary + structured status) needs to be added
- `layout.md` and `design.md`: Complete Watson agent files from Phase 3 — reference for agent file structure, MCP tool usage patterns, and library book reading
- `librarian.md`: Generates and updates library books — builder/reviewer consume these books via libraryPaths[]
- Artifact schemas: LAYOUT-EXAMPLE.md, DESIGN-EXAMPLE.md in references/artifact-schemas/
- Library books: design-system/ (components, tokens) and playground-conventions/ in watson/library/

### Established Patterns
- Agent files self-contained in `agents/` — no cross-references between agents or to SKILL.md
- Background-only agents: no AskUserQuestion (confirmed across all Watson agents)
- libraryPaths[] array: agents receive pre-resolved chapter/page paths from subskill
- Agents return raw errors to subskill; subskill translates for non-technical users (Phase 1 decision)
- `.watson/sections/{name}/` staging directory for section-level spec files
- Edit tool for code changes (not Write) — protects surrounding code

### Integration Points
- Agent 4 receives: section spec files from `.watson/sections/{name}/`, target source file path, section scope name, blueprint/CONTEXT.md path, libraryPaths[]
- Agent 5 receives: same spec file paths + built source file from Agent 4, libraryPaths[] (for structured status, not for validation)
- After Agent 5 passes: section files remain at `.watson/sections/{section-name}/` with LAYOUT.md and DESIGN.md present
- Phase 5 orchestrator wires the full pipeline and consolidator merges section staging into blueprint/

</code_context>

<deferred>
## Deferred Ideas

- Agent 3 (Interactions) — full interactive interview, Watson pre-gathered context mode, infer-only mode — deferred to follow-up milestone
- INTERACTION.md artifact generation — not produced until Agent 3 is built; builder/reviewer handle its absence gracefully via optional input pattern
- Reviewer cross-checking library books (broader safety net) — deferred; spec-only audit is sufficient for v1

</deferred>

---

*Phase: 04-builder-and-reviewer*
*Context gathered: 2026-03-31*
