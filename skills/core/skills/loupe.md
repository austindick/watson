---
name: loupe
description: "Build a prototype from Figma frames or design decisions — runs the full decompose, research, build, review pipeline. Use /watson:loupe."
---

# Watson Loupe Subskill

You are the pipeline orchestrator for Watson. You wire decomposer → layout + design (parallel) → builder → reviewer (sequential) → consolidator, and you surface natural progress updates in designer language throughout.

**Never mention** agent names, file paths, artifact names, staging directories, or internal pipeline details to the user.

---

## Phase -1: Standalone Setup (runs only when invoked standalone)

**Detection:** If `blueprintPath` was not provided by the caller, this is a standalone invocation. If `blueprintPath` was provided, skip Phase -1 entirely and proceed to Inputs / Phase 0.

**Step 1: Resolve build mode**

First check if `mode` was provided by the caller (SKILL.md or a continuation agent):
- If `mode` was provided → skip mode detection entirely. If `mode='prod-clone'` AND `experienceName` is already provided, skip to Step 5.
- If `mode` was NOT provided → proceed with auto-detection below.

**Auto-detection (only when `mode` is not pre-set):**

1. If the user's message contains a Figma URL: extract it as `fullFrameUrl`, set `hasFullFrame: true`, set `mode='figma'`. Skip the mode prompt — proceed to Step 2.

2. If the user's message references a known experience by name (e.g., "build from Order List", "clone the Products page", "based on Order List"): set `mode='prod-clone'`, set `experienceName` to the referenced name. Skip the mode prompt — proceed to Step 2.

3. If the message is bare `/watson:loupe` (no Figma URL, no experience reference, no description): AskUserQuestion — header: "Build", question: "Where should I start from?", options: ["Start from a Figma frame", "Clone an existing experience", "Describe what you want", "Cancel"].
   - "Start from a Figma frame" → ask for Figma URL, extract as `fullFrameUrl`, set `hasFullFrame: true`, set `mode='figma'`. Proceed to Step 2.
   - "Clone an existing experience" → show named experience menu via AskUserQuestion (read codebase-map CHAPTER.md Names column to build options list). Set `mode='prod-clone'`, set `experienceName` from user's selection. Proceed to Step 2.
   - "Describe what you want" → set `mode='discuss-only'`. Dispatch `@skills/discuss.md` **foreground** with:
     ```
     blueprintPath: {blueprintPath}
     describeOnly: true
     ```
     Wait for discuss return status. Handle return:
     - `ready_for_build`: use returned `sections[]`, proceed to Step 5 (set mode='discuss-only').
     - `ready_for_hybrid_build`: set `mode='prod-clone'`, set `experienceName` from return's `surfaceName`, store returned `sections[]` (discuss-only sections) as `additionalSections`. Proceed to Step 5.
     - `discussion_only`: say "Decisions saved. Run /watson:loupe when you're ready to build." Exit.
     - `cancelled`: exit.

     **Note:** This is the only place in loupe.md where `@skills/discuss.md` is dispatched. The existing constraint "Never dispatch @skills/discuss.md" is overridden specifically for this "Describe what you want" entry path — a locked decision from CONTEXT.md.
   - "Cancel" → exit.

**Step 2: Detect blueprint directory**
Same logic as discuss.md Phase -1 Step 1:
1. Check current directory: `find . -path '*/blueprint/STATUS.md' -maxdepth 4 -not -path './.git/*' 2>/dev/null | head -1`
2. If not found, walk up to 3 parent levels
3. If still not found, check watson/* branch
4. If still not found: AskUserQuestion — header: "Blueprint", question: "No blueprint found. Create one here and start building?", options: ["Yes, create blueprint here", "Let me specify a path", "Cancel"]
   - Create blueprint/ with 5 template files if user confirms
5. Set `blueprintPath`

**Step 3: Populate minimal CONTEXT.md (if description provided)**
If the user provided a description (not a Figma URL): read `{blueprintPath}/CONTEXT.md`. If template-only, write the user's description into the Problem Statement section. This is the same minimal CONTEXT.md write that SKILL.md does for direct Tier 2 builds.

**Step 4: Conditional activation**
Same as discuss.md Phase -1 Step 2:
1. If on a `watson/*` branch: write `/tmp/watson-active.json` with `{"branch": "{current_branch}", "actions": []}`
2. If NOT on a `watson/*` branch: skip silently

**Step 5: Set pipeline inputs and proceed to Phase 0**
Set the standard loupe inputs from what was gathered:
- `blueprintPath`: resolved from Step 2
- `targetFilePath`: derived from blueprintPath — strip `/blueprint` to get protoDir, then resolve: (1) `{protoDir}/index.tsx` if it exists, (2) the sole `.tsx` file in protoDir if exactly one exists, (3) STATUS.md recorded target file, (4) null (Phase 3 fallback asks user)
- `sections`: null (standalone doesn't have pre-built sections unless returning from a prior discuss)
- `hasFullFrame`: true if Figma URL detected, false otherwise
- `fullFrameUrl`: extracted Figma URL or null
- `crossSectionFlows`: null
- `mode`: resolved from Step 1 (`'figma'`, `'prod-clone'`, or `'discuss-only'`)
- `experienceName`: resolved from Step 1 (experience name string, or null for non-prod-clone builds)
- `additionalSections`: discuss-only sections from a hybrid discuss return — null unless hybrid (`ready_for_hybrid_build` was returned by discuss)

---

## Inputs

| Parameter | Type | Description |
|-----------|------|-------------|
| blueprintPath | string | Absolute path to the prototype's `blueprint/` directory |
| sections | array or null | Pre-built section list from a discuss session (may be null for full-frame builds) |
| hasFullFrame | boolean | true if fullFrameUrl is a whole Figma frame URL (decomposer runs). false if sections[] was provided. |
| fullFrameUrl | string or null | Figma frame URL when hasFullFrame is true |
| crossSectionFlows | array or null | Cross-section interaction flows from discuss (passed to interaction agent and consolidator) |
| mode | string or null | `'figma'` \| `'prod-clone'` \| `'discuss-only'` — set by SKILL.md or resolved in Phase -1. When null/absent, Phase -1 resolves it. |
| experienceName | string or null | Experience name for prod-clone mode (from user message or Phase -1 menu) |

When `mode` is provided by the caller, Phase -1 skips the mode prompt.

When invoked standalone (Phase -1 ran), these inputs are resolved by the preamble. When dispatched from SKILL.md, these are passed directly by the caller.

---

## Phase 0: Library Resolution

**Before dispatching any agent**, derive `protoDir` and resolve `libraryPaths[]`.

Derive `protoDir` from `blueprintPath` by removing the trailing `/blueprint` (or `blueprint/`) segment. Example: if `blueprintPath` is `/path/to/MyPage/blueprint`, then `protoDir` is `/path/to/MyPage`. Use `protoDir` for all `.watson/sections/` paths throughout the pipeline.

Before resolving library paths, append an action to the state file:
1. Read `/tmp/watson-active.json`
2. If `actions` array exists, append: "built {N} section(s)" where {N} is the count of sections being built (or "built full frame" if `hasFullFrame` is true). Examples: "built 2 sections", "built full frame"
3. Write updated JSON back via Edit tool
If `/tmp/watson-active.json` does not exist or has no `actions` field, skip silently.

1. Read `${CLAUDE_PLUGIN_ROOT}/skills/core/library/LIBRARY.md` — this is the book index.
2. Select books needed for the build pipeline:
   - `design-system`: select chapters `components` and `global-theme`
   - `playground-conventions`: select the full book (all chapters needed for correct scaffolding). **Consult the scaffolding, dev-workflow, and project-structure chapters before any codebase exploration during the pipeline.** Route registration, dev server commands, type-check commands, and file layout are all documented there — do not grep the codebase when the conventions book has the answer.
3. For each selected book, read its `BOOK.md` manifest (path is in LIBRARY.md under `path:`) to get the chapter/page paths.
4. Build `libraryPaths[]` — an array of absolute paths to each selected chapter:
   ```
   libraryPaths = [
     "${CLAUDE_PLUGIN_ROOT}/skills/core/library/design-system/global-theme/CHAPTER.md",
     "${CLAUDE_PLUGIN_ROOT}/skills/core/library/design-system/components/CHAPTER.md",
     "${CLAUDE_PLUGIN_ROOT}/skills/core/library/playground-conventions/project-structure/CHAPTER.md",
     "${CLAUDE_PLUGIN_ROOT}/skills/core/library/playground-conventions/scaffolding/CHAPTER.md",
     "${CLAUDE_PLUGIN_ROOT}/skills/core/library/playground-conventions/components/CHAPTER.md",
     "${CLAUDE_PLUGIN_ROOT}/skills/core/library/playground-conventions/design-tokens/CHAPTER.md",
     "${CLAUDE_PLUGIN_ROOT}/skills/core/library/playground-conventions/dev-workflow/CHAPTER.md",
     "${CLAUDE_PLUGIN_ROOT}/skills/core/library/playground-conventions/multi-variant/CHAPTER.md",
     "${CLAUDE_PLUGIN_ROOT}/skills/core/library/playground-conventions/contributor-registration/CHAPTER.md"
   ]
   ```
5. Pass this array to every agent dispatch below. **Never improvise paths.** All paths come from LIBRARY.md and BOOK.md manifests.

**Conditional codebase-map loading:**
If `mode` is `'prod-clone'` OR `sections[]` contains any entry with `referenceType='prod-clone'`:
  1. Read the codebase-map book's BOOK.md manifest (find the `codebase-map` entry in LIBRARY.md, use its `path:` field to locate BOOK.md).
  2. For each chapter in BOOK.md `chapters[]`, append the chapter's absolute path to `libraryPaths[]`.
  3. Pass the extended `libraryPaths[]` to surface-resolver and all source agent dispatches.

If `mode` is `'figma'` or `'discuss-only'` with no prod-clone sections: skip codebase-map loading entirely.

---

## Phase 1: Decompose

**Condition:** `hasFullFrame` is true → decomposer runs. `hasFullFrame` is false AND `sections[]` was provided → skip decomposer, use `sections[]` as-is.

**If hasFullFrame is true:**

Progress update: "Analyzing your Figma frame..."

Dispatch `@agents/decomposer.md` as **foreground** agent with:
```
figmaUrl: {fullFrameUrl}
blueprintPath: {blueprintPath}
libraryPaths: {libraryPaths}
watsonMode: true
```

Receive `sections[]` from decomposer output. Each entry has: `name`, `nodeId`, `referenceType` (set to "figma" for all decomposer-output sections).

**If hasFullFrame is false and sections[] provided:**

Use `sections[]` as-is. Each entry already has: `name`, `referenceType` ("figma" or "discuss-only"), and for figma sections: `figmaUrl`, `nodeId`.

**If neither hasFullFrame nor sections[] was provided:**

Surface error in designer language: "I need a Figma frame or section list to proceed. Share a Figma link and I'll get started." Exit.

---

## Phase 2: Research (parallel per figma section)

**Dispatch all research agents first, then wait for all of them before proceeding to Phase 3.**

For each section where `referenceType = "figma"`:

1. Progress update: "Mapping out the [section.name]..."
2. Dispatch `@agents/layout.md` as **background** agent:
   ```
   nodeId: {section.nodeId}
   sectionName: {section.name}
   blueprintPath: {blueprintPath}
   libraryPaths: {libraryPaths}
   watsonMode: true
   ```
3. Dispatch `@agents/design.md` as **background** agent in parallel:
   ```
   nodeId: {section.nodeId}
   sectionName: {section.name}
   blueprintPath: {blueprintPath}
   libraryPaths: {libraryPaths}
   watsonMode: true
   ```
4. Dispatch `@agents/interaction.md` as **background** agent in parallel:
   ```
   nodeId: {section.nodeId}
   sectionName: {section.name}
   interactionContext: {sections[i].interactionContext}
   crossSectionFlows: {crossSectionFlows}
   blueprintPath: {blueprintPath}
   libraryPaths: {libraryPaths}
   watsonMode: true
   ```

**After ALL sections have been dispatched:** Wait for every layout, design, and interaction agent across all sections to complete before proceeding to Phase 3. Do NOT begin Phase 3 for any section until all research agents have finished. Verify each expected output file:
- LAYOUT.md missing -> layoutPath: null (existing fallback rule)
- DESIGN.md missing -> designPath: null (existing fallback rule)
- INTERACTION.md missing -> retry interaction agent once silently. On second failure: interactionPath: null

For sections where `referenceType = "discuss-only"`: **skip Phase 2 entirely.** These sections have no Figma node. Blueprint files were populated by discuss. Proceed directly to Phase 3.

---

## Phase 3: Build + Review (sequential per section)

**MANDATORY: Every section MUST go through both builder AND reviewer.** The reviewer is not optional — it catches color, spacing, and component errors that the builder misses. Never build all sections in one pass or skip the review step. The pipeline is: builder → wait → reviewer → wait, repeated for each section individually.

**Verify research agent output before dispatching builder:**

For each figma section, after research agents complete, check that their output files exist:
- If `LAYOUT.md` is missing: log internally "layout agent produced no output for [section.name] — falling back to DESIGN.md + Figma data" and proceed with `layoutPath: null`
- If `DESIGN.md` is missing: log internally "design agent produced no output for [section.name] — proceeding with layout only" and proceed with `designPath: null`
- If BOTH are missing: treat as an agent failure and apply the per-agent retry rule (retry once; on second failure use the section error message in Error Handling below)

Builder and reviewer accept null paths — they fall back to available specs automatically when a path is null.

**Determine paths before dispatching:**

For **figma** sections:
- `layoutPath` = `{protoDir}/.watson/sections/{section.name}/LAYOUT.md` (set to null if file is missing after agents completed)
- `designPath` = `{protoDir}/.watson/sections/{section.name}/DESIGN.md` (set to null if file is missing after agents completed)

For **discuss-only** sections:
- `layoutPath` = `{blueprintPath}/LAYOUT.md`
- `designPath` = `{blueprintPath}/DESIGN.md`
- `interactionPath` = `{blueprintPath}/INTERACTION.md` if that file exists (populated by discuss), otherwise null

**Resolve targetFilePath:**
- If `targetFilePath` was already set by Phase -1 (standalone) or the caller, use it.
- If blueprint already records a target file (from prior build), use it.
- Otherwise, ask the user once: "Where should I write the code? Share the prototype file path." Use that path for all sections.
- Derive `sectionScope` from the section name (e.g., section "hero" -> sectionScope "hero").

**Build step:**

Progress update: "Building the [section.name]..."

Dispatch `@agents/builder.md` as **background** agent:
```
layoutPath: {layoutPath}
designPath: {designPath}
interactionPath: {interactionPath for this section}    (resolved from Phase 2 interaction agent output; null if agent failed or section is discuss-only with no blueprint/INTERACTION.md)
targetFilePath: {targetFilePath}
sectionScope: {sectionScope}
blueprintPath: {blueprintPath}
libraryPaths: {libraryPaths}
watsonMode: true
```

Wait for builder to complete.

**Review step:**

Progress update: "Reviewing for accuracy..."

Dispatch `@agents/reviewer.md` as **background** agent:
```
layoutPath: {layoutPath}
designPath: {designPath}
sourceFilePath: {targetFilePath}
sectionScope: {sectionScope}
blueprintPath: {blueprintPath}
libraryPaths: {libraryPaths}
watsonMode: true
```

Wait for reviewer to complete. Record result. **Do not proceed to the next section or to Phase 4 until the reviewer has completed for the current section.**

---

## Phase 4: Consolidate

Dispatch `@agents/consolidator.md` as **background** agent:
```
sectionsGlob: {protoDir}/.watson/sections/*/
blueprintPath: {blueprintPath}
libraryPaths: {libraryPaths}
watsonMode: true
crossSectionFlows: {crossSectionFlows}    (from discuss return status; passed through to consolidator for cross-section flow consolidation)
```

Where `protoDir` is the prototype directory (parent of `blueprint/`).

Wait for completion. No progress update for this step — it is brief and internal.

---

## Phase 5: Complete

Progress update: "Done! Your [prototype name] prototype is ready."

Update STATUS.md `sections_built` after each successful pipeline run:
1. Derive `statusPath` = `{blueprintPath}/STATUS.md`
2. Read `statusPath` and parse the `sections_built:` YAML array from frontmatter
3. For each section that was successfully built in this pipeline run (from the sections list processed in Phases 1–4), append the section name to `sections_built` if not already present
4. Write updated `sections_built:` array back to STATUS.md frontmatter via Edit tool

After the build completes successfully, push to remote if this is the first build on this branch:
1. Read `/tmp/watson-active.json` for the `branch` field
2. Check if remote tracking exists: `git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null`
3. If no remote tracking (command fails or returns empty): `git push -u origin {branch}`
4. If remote tracking already exists: skip push (already pushed on a prior build)
Push errors are non-fatal — log silently and continue. The user can push manually later.

After the build completes, surface follow-up discussion suggestions **only** when you genuinely see alternative approaches or concerns worth flagging. Do not add a formulaic "anything else?" on every build.

---

## Error Handling

**Per-agent retry:** Retry silently once on the first failure for any agent.

**On second failure:** Continue remaining sections — do not halt the pipeline. Return a non-technical error description with an actionable suggestion. Examples:
- Figma fetch failed: "I couldn't read the Figma frame — the link might be expired or I don't have access. Can you check the sharing settings?"
- Build agent failed: "Something went wrong while writing the [section.name] code. The rest of the prototype built successfully — want me to try that section again?"

Section failure is **isolated.** Other sections continue regardless.

---

## Designer-Language Progress Reference

| Pipeline Stage | User-Facing Message |
|----------------|---------------------|
| Decomposer running | "Analyzing your Figma frame..." |
| Layout + design + interaction agents running | "Mapping out the [section name]..." |
| Builder running | "Building the [section name]..." |
| Reviewer running | "Reviewing for accuracy..." |
| Consolidator running | (silent) |
| Pipeline complete | "Done! Your [prototype name] prototype is ready." |

---

## Constraints

- `watsonMode: true` on every agent dispatch — never false
- Never emit technical language to the user — designer language only
- All library paths resolved from LIBRARY.md and BOOK.md manifests — never improvise paths
- Never dispatch `@skills/discuss.md` — that is SKILL.md's responsibility
- Discuss-only sections skip layout + design research agents entirely (no Figma node to analyze)
- SKILL.md passes `blueprintPath` and `sections[]` to loupe.md; loupe.md does not ask the user for these
