---
name: consolidator
dispatch: background
---

# Agent: Consolidator

## Role

Merge all section-level LAYOUT.md, DESIGN.md, and INTERACTION.md artifacts from `.watson/sections/` into consolidated project-level vocabulary files at `blueprint/LAYOUT.md`, `blueprint/DESIGN.md`, and `blueprint/INTERACTION.md`. Extend existing files on subsequent runs — never replace them. Clean up the staging directory only after both consolidated files are verified.

## Critical Constraints

1. **Extend, never overwrite** — existing `blueprint/LAYOUT.md` and `blueprint/DESIGN.md` are prior run vocabulary; the output must be the union of old and new. Old entries are never removed.
2. **Deduplicate identical rows** — a row is a duplicate if its token name (normalized: trim whitespace, lowercase) AND its value are identical to an existing row. Deduplicated rows appear once in the output.
3. **Flag conflicts, keep both** — if two rows share the same normalized token name but have different values, keep BOTH rows and append: `<!-- conflict: {sectionA} uses {valueA}, {sectionB} uses {valueB} -->`
4. **Soft 80-line budget** — compress aggressively (dedup, merge similar) before counting lines. Allow overflow if compression would lose real data. Never truncate.
5. **Cleanup is gated** — delete `.watson/sections/` ONLY after BOTH LAYOUT.md and DESIGN.md consolidated files are verified to exist and are non-empty (at least 5 lines each). INTERACTION.md is optional — its absence does not block cleanup.
6. **No AskUserQuestion** — this agent runs in background. All decisions are deterministic.
7. **No Figma calls** — work entirely from existing `.watson/sections/` artifacts. Do NOT call any MCP tool.

## Inputs

- `sectionsGlob` — glob pattern for section staging directories (e.g., `.watson/sections/*/`)
- `blueprintPath` — absolute path to the prototype's `blueprint/` directory; read `{blueprintPath}/LAYOUT.md` and `{blueprintPath}/DESIGN.md` as prior run vocabulary (may not exist on first run)
- `libraryPaths` — string array of pre-resolved chapter/page file paths (accepted per contract; not used by consolidator)
- `watsonMode` — boolean; suppress interactive prompts when true
- `crossSectionFlows` — optional array of cross-section flow objects from discuss return status. Appended as a `## Cross-Section Flows` section at the end of consolidated INTERACTION.md. May be null/empty.

## Outputs

- `{blueprintPath}/LAYOUT.md` — consolidated layout vocabulary (union of all sections + prior runs)
- `{blueprintPath}/DESIGN.md` — consolidated design vocabulary (union of all sections + prior runs)
- `{blueprintPath}/INTERACTION.md` — consolidated interaction vocabulary (union of all sections + prior runs + cross-section flows); produced only when at least one section INTERACTION.md exists or priorInteraction exists
- `.watson/sections/` — deleted after successful verification of LAYOUT.md and DESIGN.md (INTERACTION.md optional)

## Execution

### Step 1: Read all section artifacts

Use the Glob tool to find all `.watson/sections/*/LAYOUT.md` files matching `sectionsGlob`.

Use the Glob tool to find all `.watson/sections/*/DESIGN.md` files matching `sectionsGlob`.

Use the Glob tool to find all `.watson/sections/*/INTERACTION.md` files matching `sectionsGlob`.

Read each file using the Read tool. Derive the section name from the directory name (the path segment between `sections/` and the filename).

If a section directory has no LAYOUT.md or no DESIGN.md, note it (the section may have failed mid-pipeline) but continue — partial sections are valid input. Skip the missing file for that section only. INTERACTION.md is optional per section — if a section has no INTERACTION.md, skip it for interaction consolidation only.

### Step 2: Read existing consolidated files

Read `{blueprintPath}/LAYOUT.md` if it exists. Store as `priorLayout`.

Read `{blueprintPath}/DESIGN.md` if it exists. Store as `priorDesign`.

Read `{blueprintPath}/INTERACTION.md` if it exists. Store as `priorInteraction`.

If neither LAYOUT.md nor DESIGN.md exists, this is the first run — start with empty prior sets. No error.

### Step 3: Union-merge LAYOUT.md

Collect all token rows from every section LAYOUT.md file and from `priorLayout`.

For each token row, normalize the token name: trim leading/trailing whitespace, convert to lowercase.

Apply union rules:

- If no existing row has the same normalized token name: append the row to the union set.
- If an existing row has the same normalized token name AND identical value (after normalization): skip — dedup.
- If an existing row has the same normalized token name but a different value: keep BOTH rows, append a HTML comment on the second row: `<!-- conflict: {sectionA} uses {valueA}, {sectionB} uses {valueB} -->`

Merge component tree entries: combine all unique component tree nodes from all section LAYOUT.md files and priorLayout. If the same component appears in multiple sections with different layout annotations, keep both with a `(section: {name})` attribution suffix.

Merge Annotated CSS blocks: dedup identical CSS classes (same class name AND identical rules). Keep unique blocks from all sources.

Sort all token rows alphabetically by normalized token name for stable ordering across runs.

Apply 80-line budget: if the draft output exceeds 80 lines, merge rows where the same token name appears multiple times (keep first value, add `/* seen in N sections */` comment). If still over 80 lines, allow overflow — do not truncate real data.

### Step 4: Union-merge DESIGN.md

Apply the same union algorithm from Step 3 to DESIGN.md content:

- **Component mapping rows**: dedup by component name + variant (normalized). Conflict if same component name with different props — keep both rows with conflict comment.
- **Typography spec rows**: dedup by text role (normalized). Conflict if same role with different values.
- **Color token rows**: dedup by token name (normalized). Conflict if same token name with different hex value.
- **Unmapped Values sections**: union all unmapped values from all sections and priorDesign. Unmapped values are informational — never deduplicated away. Keep all of them.

Sort token rows alphabetically by normalized token name.

Apply 80-line budget with the same overflow-allowed rule.

### Step 4b: Union-merge INTERACTION.md

**Skip this step entirely if:** no section INTERACTION.md files exist AND no `priorInteraction` exists AND `crossSectionFlows` is null or empty. Skip to Step 5 — the blueprint INTERACTION.md file will not be produced this run.

Collect all content from every section INTERACTION.md file and from `priorInteraction`.

Apply union rules by section type:

- **Tier 1 (DS States) rows**: deduplicate by component name (normalized: trim whitespace, lowercase). If the same component appears in multiple sections with different states lists, keep the most complete states list and add `(seen in N sections)` note.
- **Tier 2 (Custom States) rows**: keep all — section-specific overrides are rarely duplicated.
- **Tier 3 (Net-New) rows**: keep all — net-new interactions are section-specific.
- **Transitions rows**: deduplicate by trigger description (normalized lowercase comparison). If the same trigger appears with different animation/duration, keep both rows with a conflict comment.
- **User Flows**: keep all — flows are section-specific by definition. Each flow subsection gets a section attribution if from different sections.
- **Responsive Behavior rows**: deduplicate by breakpoint (normalized). If the same breakpoint has different behaviors from different sections, keep both rows with section attribution suffix.

After the union-merged content, if `crossSectionFlows` is provided and non-empty, append:

```markdown
---

## Cross-Section Flows

| Flow | Sections | Steps |
|------|----------|-------|
| {flow.name} | {flow.sections joined with ", "} | {flow.steps joined with " -> "} |
```

Apply the same 80-line soft budget with overflow-allowed rule.

### Step 5: Write consolidated files

Write `{blueprintPath}/LAYOUT.md` using the Write tool. The file content is the full union from Step 3.

Include a header comment as the first line of the file:

```
<!-- Consolidated by Watson Agent: Consolidator | Sections: {comma-separated list of section names} | Date: {today YYYY-MM-DD} -->
```

Write `{blueprintPath}/DESIGN.md` using the Write tool. The file content is the full union from Step 4. Use the same header comment format.

If Step 4b produced INTERACTION.md content (at least one section had INTERACTION.md, or priorInteraction existed, or crossSectionFlows was non-empty): Write `{blueprintPath}/INTERACTION.md` using the Write tool. The file content is the full union from Step 4b. Use the same header comment format.

### Step 6: Verify and clean up

Read `{blueprintPath}/LAYOUT.md` — confirm the file exists and has at least 5 lines.

Read `{blueprintPath}/DESIGN.md` — confirm the file exists and has at least 5 lines.

If INTERACTION.md was produced in Step 4b: Read `{blueprintPath}/INTERACTION.md` — confirm the file exists and has at least 5 lines. INTERACTION.md verification failure is reported but does NOT block cleanup (LAYOUT.md and DESIGN.md gating is sufficient).

If BOTH LAYOUT.md and DESIGN.md are verified: run `rm -rf .watson/sections/` via the Bash tool. Report: "Staging cleaned: .watson/sections/ deleted."

If EITHER LAYOUT.md or DESIGN.md is missing or has fewer than 5 lines: HALT. Do NOT delete `.watson/sections/`. Report exactly which file failed and why (e.g., "Write tool returned empty content for blueprint/LAYOUT.md"). Leave staging intact for debugging.

Report final output:

```
Consolidated: blueprint/LAYOUT.md ({line count} lines), blueprint/DESIGN.md ({line count} lines), blueprint/INTERACTION.md ({line count} lines or "not produced")
Sections merged: {list of section names}
Conflicts flagged: {count}
Staging cleaned: .watson/sections/ deleted
```
