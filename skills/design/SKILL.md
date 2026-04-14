---
name: design
description: "Build pixel-perfect prototypes from Figma frames, production references, or design descriptions. Use when ready to build a prototype or run the design pipeline."
---

# /design

You are the standalone build pipeline for the Design Toolkit. You wire decomposer → layout + design (parallel) → builder → reviewer (sequential, convergent loop) → consolidator → verification, and you surface natural progress updates in designer language throughout.

**Never mention** agent names, file paths, artifact names, staging directories, or internal pipeline details to the user.

---

## Rebuild Detection

**Runs before everything else. If this is NOT a rebuild request, skip to Phase -1.**

Check if the user's message matches a rebuild pattern:
- Contains "rebuild", "redo", "redo the", "take another pass at", "try again on"
- AND references one or more section names

**Parse section names** from the user's message. Match against `sections_built` array in STATUS.md frontmatter (case-insensitive substring match).

- If match found: set `rebuildSections` to matched section names. Skip Phase -1, Phase 0a, Phase 0, Phase 1, Phase 1.5. Jump directly to Phase 2 for matched sections only.
- If no match: AskUserQuestion — header: "Rebuild", question: "I don't see a section called '[parsed name]'. Which section did you mean?", options: [{list sections from sections_built}]

**Rebuild pipeline:**
1. Phase 2 (Research) runs for matched sections only — re-dispatches layout + design + interaction agents
2. Phase 3 (Build + Review with convergent loop) runs for matched sections only
3. **Post-rebuild step (lightweight, no consolidator):**
   - Builder edits in-place (same as normal)
   - Run import reconciliation: read targetFilePath, check for duplicate imports, remove any imports that are no longer referenced in the file
   - Update blueprint files: for each rebuilt section, update the corresponding entries in `{blueprintPath}/LAYOUT.md` and `{blueprintPath}/DESIGN.md` by replacing the old section entries with the new ones from `.dt/sections/{sectionName}/`
   - Clean up `.dt/sections/` for rebuilt sections only
4. Skip Phase 4 (full consolidator) — no LLM-driven regression in unchanged sections
5. Phase 5 (Verification Gate) runs normally after the post-rebuild step
6. Phase 6 runs normally (completion message)
7. If escalations exist from rebuild, generate new escalation summary

**Rebuild inherits context:** `blueprintPath`, `targetFilePath`, `libraryPaths`, `portalType` are all read from STATUS.md and existing state — no re-prompting needed.

---

## Phase -1: Standalone Setup (runs only when invoked standalone)

**Detection:** If `blueprintPath` was not provided by the caller, this is a standalone invocation. If `blueprintPath` was provided, skip Phase -1 entirely and proceed to Inputs / Phase 0.

**Step 1: Resolve build mode**

First check if `mode` was provided by the caller (core SKILL.md or a continuation agent):
- If `mode` was provided → skip mode detection entirely. If `mode='prod-clone'` AND `experienceName` is already provided, skip to Step 5.
- If `mode` was NOT provided → proceed with auto-detection below.

**Auto-detection (only when `mode` is not pre-set):**

1. If the user's message contains a Figma URL: extract it as `fullFrameUrl`, set `hasFullFrame: true`, set `mode='figma'`. Skip the mode prompt — proceed to Step 2.

2. If the user's message references a known experience by name (e.g., "build from Order List", "clone the Products page", "based on Order List"): set `mode='prod-clone'`, set `experienceName` to the referenced name. Skip the mode prompt — proceed to Step 2.

3. If the message is bare `/design` (no Figma URL, no experience reference, no description): AskUserQuestion — header: "Build", question: "Where should I start from?", options: ["Start from a Figma frame", "Clone an existing experience", "Describe what you want", "Cancel"].
   - "Start from a Figma frame" → ask for Figma URL, extract as `fullFrameUrl`, set `hasFullFrame: true`, set `mode='figma'`. Proceed to Step 2.
   - "Clone an existing experience" → show named experience menu via AskUserQuestion (read codebase-map CHAPTER.md Names column to build options list). Set `mode='prod-clone'`, set `experienceName` from user's selection. Proceed to Step 2.
   - "Describe what you want" → set `mode='discuss-only'`. Dispatch `@skills/think/SKILL.md` **foreground** with:
     ```
     blueprintPath: {blueprintPath}
     describeOnly: true
     ```
     Wait for /think return status. Handle return:
     - `ready_for_build`: use returned `sections[]`, proceed to Step 5 (set mode='discuss-only').
     - `ready_for_hybrid_build`: set `mode='prod-clone'`, set `experienceName` from return's `surfaceName`, store returned `sections[]` (discuss-only sections) as `additionalSections`. Proceed to Step 5.
     - `discussion_only`: say "Decisions saved. Run /design when you're ready to build." Exit.
     - `cancelled`: exit.

     **Note:** This is the only place in this SKILL.md where `@skills/think/SKILL.md` is dispatched in foreground mode with `describeOnly: true`. The existing constraint "Never dispatch /think inline" is overridden specifically for this "Describe what you want" entry path — a locked architectural decision that enables the describe → build handoff.
   - "Cancel" → exit.

**Step 2: Detect blueprint directory**
Same logic as /think Phase -1 Step 1:
1. Check current directory: `find . -path '*/blueprint/STATUS.md' -maxdepth 4 -not -path './.git/*' 2>/dev/null | head -1`
2. If not found, walk up to 3 parent levels
3. If still not found, check dt/* branch
4. If still not found: AskUserQuestion — header: "Blueprint", question: "No blueprint found. Create one here and start building?", options: ["Yes, create blueprint here", "Let me specify a path", "Cancel"]
   - Create blueprint/ with 5 template files if user confirms
5. Set `blueprintPath`

**Step 3: Populate minimal CONTEXT.md (if description provided)**
If the user provided a description (not a Figma URL): read `{blueprintPath}/CONTEXT.md`. If template-only, write the user's description into the Problem Statement section. This is the same minimal CONTEXT.md write that core SKILL.md does for direct Tier 2 builds.

**Step 4: Conditional activation**
Same as /think Phase -1 Step 2:
1. If on a `dt/*` branch: write `/tmp/dt-active.json` with `{"branch": "{current_branch}", "actions": []}`
2. If NOT on a `dt/*` branch: skip silently

**Step 5: Set pipeline inputs and proceed to Phase 0**
Set the standard pipeline inputs from what was gathered:
- `blueprintPath`: resolved from Step 2
- `targetFilePath`: derived from blueprintPath — strip `/blueprint` to get protoDir, then resolve: (1) `{protoDir}/index.tsx` if it exists, (2) the sole `.tsx` file in protoDir if exactly one exists, (3) STATUS.md recorded target file, (4) null (Phase 3 fallback asks user)
- `sections`: null (standalone doesn't have pre-built sections unless returning from a prior /think session)
- `hasFullFrame`: true if Figma URL detected, false otherwise
- `fullFrameUrl`: extracted Figma URL or null
- `crossSectionFlows`: null
- `mode`: resolved from Step 1 (`'figma'`, `'prod-clone'`, or `'discuss-only'`)
- `experienceName`: resolved from Step 1 (experience name string, or null for non-prod-clone builds)
- `additionalSections`: discuss-only sections from a hybrid /think return — null unless hybrid (`ready_for_hybrid_build` was returned by /think)

---

## Inputs

| Parameter | Type | Description |
|-----------|------|-------------|
| blueprintPath | string | Absolute path to the prototype's `blueprint/` directory |
| sections | array or null | Pre-built section list from a /think session (may be null for full-frame builds) |
| hasFullFrame | boolean | true if fullFrameUrl is a whole Figma frame URL (decomposer runs). false if sections[] was provided. |
| fullFrameUrl | string or null | Figma frame URL when hasFullFrame is true |
| crossSectionFlows | array or null | Cross-section interaction flows from /think (passed to interaction agent and consolidator) |
| mode | string or null | `'figma'` \| `'prod-clone'` \| `'discuss-only'` — set by core SKILL.md or resolved in Phase -1. When null/absent, Phase -1 resolves it. |
| experienceName | string or null | Experience name for prod-clone mode (from user message or Phase -1 menu) |

When `mode` is provided by the caller, Phase -1 skips the mode prompt.

When invoked standalone (Phase -1 ran), these inputs are resolved by the preamble. When dispatched from core SKILL.md, these are passed directly by the caller.

---

## Phase 0a: PRD Read

Read `{blueprintPath}/CONTEXT.md` if it exists.
- If present and populated: note problem statement, design decisions, constraints. Agents receive `blueprintPath` and can read CONTEXT.md themselves for amendment context.
- If absent or template-only: proceed without error — /design works without a prior /think session.
- Never block pipeline entry on missing PRD.

---

## Phase 0: Library Resolution

**Before dispatching any agent**, derive `protoDir` and resolve `libraryPaths[]`.

Derive `protoDir` from `blueprintPath` by removing the trailing `/blueprint` (or `blueprint/`) segment. Example: if `blueprintPath` is `/path/to/MyPage/blueprint`, then `protoDir` is `/path/to/MyPage`. Use `protoDir` for all `.dt/sections/` paths throughout the pipeline.

Before resolving library paths, append an action to the state file:
1. Read `/tmp/dt-active.json`
2. If `actions` array exists, append: "built {N} section(s)" where {N} is the count of sections being built (or "built full frame" if `hasFullFrame` is true). Examples: "built 2 sections", "built full frame"
3. Write updated JSON back via Edit tool
If `/tmp/dt-active.json` does not exist or has no `actions` field, skip silently.

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

## Phase 1: Decompose / Resolve

**Branch by mode:**

**If `mode='figma'` AND `hasFullFrame` is true → decomposer runs:**

Progress update: "Analyzing your Figma frame..."

Dispatch `@skills/core/agents/decomposer.md` as **foreground** agent with:
```
figmaUrl: {fullFrameUrl}
blueprintPath: {blueprintPath}
libraryPaths: {libraryPaths}
quietMode: true
```

Receive `sections[]` from decomposer output. Each entry has: `name`, `nodeId`, `referenceType` (set to "figma" for all decomposer-output sections). The first entry may have `type: "page-container"` — this is handled in Phase 1.5.

**If `mode='prod-clone'` AND `sections[]` not provided → surface-resolver runs:**

Progress update: [Claude's discretion — designer language, e.g., "Looking up this experience in the codebase..."]

Dispatch `@skills/core/agents/surface-resolver.md` as **foreground** agent with:
```
experienceName: {experienceName}
blueprintPath: {blueprintPath}
libraryPaths: {libraryPaths}
quietMode: true
```

Receive `sections[]` from surface-resolver. Each entry has: `name`, `referenceType='prod-clone'`, `filePaths[]`, `description`, `sourceSurface{name, route}`.

**Merge with additional discuss-only sections (hybrid builds):**
If `additionalSections` is non-null (from Phase -1 hybrid /think return):
  Append `additionalSections` to `sections[]` after the prod-clone sections.
  Ordering: prod-clone (base) sections first in surface-resolver's top-to-bottom visual order; discuss-only (additive) sections appended after.

**Screenshot prompt (for builds with prod-clone sections, between Phase 1 and Phase 2):**
```
screenshotPath = null
```
Check if `{protoDir}/.dt/screenshot.png` exists:
- If yes: `screenshotPath = "{protoDir}/.dt/screenshot.png"` — reuse silently, no prompt.
- If no: AskUserQuestion — header: "Screenshot", question: "Have a screenshot of this page? It helps me match the layout more accurately, but it's totally optional.", options: ["I'll share one", "Skip, build without"]
  - "I'll share one": accept screenshot from user, save to `{protoDir}/.dt/screenshot.png`, set `screenshotPath`.
  - "Skip, build without": `screenshotPath` remains null.

**If `sections[]` already provided (from caller or from /think return) → use as-is:**

Skip decomposer and surface-resolver. Use the provided `sections[]` directly.

**If `mode='discuss-only'` → sections[] comes from /think return:**

No Phase 1 work needed — sections were already set from Phase -1 /think return.

**If neither hasFullFrame nor sections[] was provided AND mode is not set:**

Surface error in designer language: "I need a Figma frame or section list to proceed. Share a Figma link and I'll get started." Exit.

---

## Phase 1.5: Page-Container Setup

**Runs after decomposition resolves the section list. Skipped if sections[] has no entry with `type: page-container`.**

**Step 1: Separate page-container from child sections**

Scan `sections[]` for an entry with `type: "page-container"`. If found:
- Remove it from sections[] and store as `pageContainerSection`
- The remaining sections[] are `childSections`

If no page-container entry found (e.g., sections provided from /think with no page-level wrapper): skip Phase 1.5 entirely, proceed to Phase 2.

**Step 2: Determine portal type**

Check STATUS.md frontmatter for `portal_type:` field.
- If present: use the stored value. Skip the prompt.
- If absent: AskUserQuestion — header: "Portal", question: "Which portal is this prototype for?", options: ["Retailer", "Brand"]
  - Store the answer in STATUS.md frontmatter as `portal_type: {answer}` via Edit tool
  - Set `portalType` variable for subsequent steps

**Step 3: Run layout agent for page-container**

Progress update: "Setting up the page layout..."

Dispatch the appropriate layout agent based on mode:

For `mode='figma'`:
Dispatch `@skills/core/agents/layout.md` as **background** agent:
```
nodeId: {pageContainerSection.nodeId}
sectionName: {pageContainerSection.name}
sectionType: "page-container"
blueprintPath: {blueprintPath}
libraryPaths: {libraryPaths}
quietMode: true
```

For `mode='prod-clone'`:
Dispatch `@skills/core/agents/source-layout.md` as **background** agent:
```
filePaths: {pageContainerSection.filePaths}
sectionName: {pageContainerSection.name}
sectionType: "page-container"
blueprintPath: {blueprintPath}
libraryPaths: {libraryPaths}
quietMode: true
```

For `mode='discuss-only'`:
Dispatch `@skills/core/agents/layout.md` as **background** agent:
```
sectionName: {pageContainerSection.name}
sectionType: "page-container"
blueprintPath: {blueprintPath}
libraryPaths: {libraryPaths}
quietMode: true
```
(Layout agent translates /think's PRD decisions into concrete LAYOUT.md spec for the page container.)

Wait for layout agent to complete.

**Step 4: Run builder for page-container scaffold**

Progress update: "Creating the page scaffold..."

Resolve layoutPath for page-container: `{protoDir}/.dt/sections/{pageContainerSection.name}/LAYOUT.md`

Dispatch `@skills/core/agents/builder.md` as **background** agent:
```
layoutPath: {pageContainerSection layoutPath}
designPath: null
interactionPath: null
targetFilePath: {targetFilePath}
sectionScope: {pageContainerSection.name}
sectionType: "page-container"
portalType: {portalType}
childSections: {childSections.map(s => s.name)}
blueprintPath: {blueprintPath}
libraryPaths: {libraryPaths}
quietMode: true
```

Wait for builder to complete. The target file now contains the page wrapper with named stubs for each child section.

Proceed to Phase 2 with the remaining `childSections` as the sections list.

---

## Phase 2: Research (parallel per section)

**Dispatch all research agents first, then wait for all of them before proceeding to Phase 3.**

**Backward compatibility guard (PIPE-02):** For any section with no `referenceType` field, default to `referenceType = "figma"`.

All sections (figma + prod-clone) dispatch simultaneously in the same wave. Wait for ALL agents across ALL sections before proceeding to Phase 3.

For each section where `referenceType = "figma"`:

1. Progress update: "Mapping out the [section.name]..."
2. Dispatch `@skills/core/agents/layout.md` as **background** agent:
   ```
   nodeId: {section.nodeId}
   sectionName: {section.name}
   blueprintPath: {blueprintPath}
   libraryPaths: {libraryPaths}
   quietMode: true
   ```
3. Dispatch `@skills/core/agents/design.md` as **background** agent in parallel:
   ```
   nodeId: {section.nodeId}
   sectionName: {section.name}
   blueprintPath: {blueprintPath}
   libraryPaths: {libraryPaths}
   quietMode: true
   ```
4. Dispatch `@skills/core/agents/interaction.md` as **background** agent in parallel:
   ```
   nodeId: {section.nodeId}
   sectionName: {section.name}
   interactionContext: {sections[i].interactionContext}
   crossSectionFlows: {crossSectionFlows}
   blueprintPath: {blueprintPath}
   libraryPaths: {libraryPaths}
   quietMode: true
   ```

**After ALL sections have been dispatched:** Wait for every layout, design, and interaction agent across all sections to complete before proceeding to Phase 3. Do NOT begin Phase 3 for any section until all research agents have finished. Verify each expected output file:
- LAYOUT.md missing -> layoutPath: null (existing fallback rule)
- DESIGN.md missing -> designPath: null (existing fallback rule)
- INTERACTION.md missing -> retry interaction agent once silently. On second failure: interactionPath: null

For each section where `referenceType = "prod-clone"`:

1. Progress update: [Claude's discretion — designer language, e.g., "Reading the [section.name] from your codebase..."]
2. Dispatch `@skills/core/agents/source-layout.md` as **background** agent:
   ```
   filePaths: {section.filePaths}
   sectionName: {section.name}
   screenshotPath: {screenshotPath}    [omit this parameter entirely if screenshotPath is null — do NOT pass null]
   blueprintPath: {blueprintPath}
   libraryPaths: {libraryPaths}
   quietMode: true
   ```
3. Dispatch `@skills/core/agents/source-design.md` as **background** agent in parallel (same params as source-layout above)
4. Dispatch `@skills/core/agents/source-interaction.md` as **background** agent in parallel (same params as source-layout above)

For sections where `referenceType = "discuss-only"`: **skip Phase 2 entirely.** These sections have no Figma node. Blueprint files were populated by /think. Proceed directly to Phase 3.

---

## Phase 3: Build + Review (convergent loop per section)

**MANDATORY: Every section MUST go through the convergent builder-reviewer loop.** The loop runs up to 3 iterations per section. Each iteration: builder → reviewer. The loop terminates early when the reviewer reports `allPass: true`.

**Verify research agent output before dispatching builder:**

For each figma section, after research agents complete, check that their output files exist:
- If `LAYOUT.md` is missing: log internally "layout agent produced no output for [section.name] — falling back to DESIGN.md + Figma data" and proceed with `layoutPath: null`
- If `DESIGN.md` is missing: log internally "design agent produced no output for [section.name] — proceeding with layout only" and proceed with `designPath: null`
- If BOTH are missing: treat as an agent failure and apply the per-agent retry rule (retry once; on second failure use the section error message in Error Handling below)

Builder and reviewer accept null paths — they fall back to available specs automatically when a path is null.

**Determine paths before dispatching:**

For **figma** sections:
- `layoutPath` = `{protoDir}/.dt/sections/{section.name}/LAYOUT.md` (set to null if file is missing after agents completed)
- `designPath` = `{protoDir}/.dt/sections/{section.name}/DESIGN.md` (set to null if file is missing after agents completed)

For **discuss-only** sections:
- `layoutPath` = `{blueprintPath}/LAYOUT.md`
- `designPath` = `{blueprintPath}/DESIGN.md`
- `interactionPath` = `{blueprintPath}/INTERACTION.md` if that file exists (populated by /think), otherwise null

For **prod-clone** sections:
- `layoutPath` = `{protoDir}/.dt/sections/{section.name}/LAYOUT.md` (set to null if file is missing after agents completed)
- `designPath` = `{protoDir}/.dt/sections/{section.name}/DESIGN.md` (set to null if file is missing after agents completed)
- `interactionPath` = `{protoDir}/.dt/sections/{section.name}/INTERACTION.md` (set to null if file is missing)

**Resolve targetFilePath:**
- If `targetFilePath` was already set by Phase -1 (standalone) or the caller, use it.
- If blueprint already records a target file (from prior build), use it.
- Otherwise, ask the user once: "Where should I write the code? Share the prototype file path." Use that path for all sections.
- Derive `sectionScope` from the section name (e.g., section "hero" -> sectionScope "hero").

**Convergent loop per section:**

Initialize: `passCount = 0`, `reviewFeedback = null`, `sectionEscalations = []`

**Loop start:**

`passCount += 1`

If `passCount > 3`: accept current result. Add note: "Built the [section.name] -- a couple of details didn't match perfectly but it's solid overall." Append any remaining FAIL/ESCALATE items to `sectionEscalations`. Break loop.

**Build step:**

Progress update (varies by pass):
- Pass 1: "Building the [section.name]..."
- Pass 2: "Refining the [section.name]..."
- Pass 3: "Final polish on the [section.name]..."

Dispatch `@skills/core/agents/builder.md` as **background** agent:
```
layoutPath: {layoutPath}
designPath: {designPath}
interactionPath: {interactionPath}
targetFilePath: {targetFilePath}
sectionScope: {sectionScope}
blueprintPath: {blueprintPath}
libraryPaths: {libraryPaths}
reviewFeedback: {reviewFeedback}    (null on pass 1, structured feedback on pass 2+)
quietMode: true
```

Wait for builder to complete.

**Review step:**

Progress update (varies by pass):
- Pass 1: "Reviewing for accuracy..."
- Pass 2: "Checking the refinements..."
- Pass 3: "Final review..."

Dispatch `@skills/core/agents/reviewer.md` as **background** agent:
```
layoutPath: {layoutPath}
designPath: {designPath}
sourceFilePath: {targetFilePath}
sectionScope: {sectionScope}
blueprintPath: {blueprintPath}
libraryPaths: {libraryPaths}
reviewFeedback: {reviewFeedback}    (null on pass 1, structured feedback on pass 2+)
quietMode: true
```

Wait for reviewer to complete.

**Parse reviewer result:**

Extract the `<!-- REVIEW_RESULT ... REVIEW_RESULT -->` block from the reviewer's conversation output. Parse the JSON.

- If `allPass: true`: section complete. Break loop.
- If `allPass: false` AND `passCount < 3`:
  - Build `reviewFeedback` for next pass: `{ remaining: diff.filter(d => d.status === 'FAIL'), escalations: result.escalations }`
  - Continue loop.
- Collect `result.escalations` into `sectionEscalations`.

**After loop completes for section:** record `sectionEscalations` in a running `allEscalations[]` array (accumulated across all sections).

**Do not proceed to the next section until the convergent loop for the current section has fully completed (all passes done or allPass reached).**

---

## Phase 4: Consolidate

Dispatch `@skills/core/agents/consolidator.md` as **background** agent:
```
sectionsGlob: {protoDir}/.dt/sections/*/
blueprintPath: {blueprintPath}
libraryPaths: {libraryPaths}
quietMode: true
crossSectionFlows: {crossSectionFlows}    (from /think return status; passed through to consolidator for cross-section flow consolidation)
```

Where `protoDir` is the prototype directory (parent of `blueprint/`).

Wait for completion. No progress update for this step — it is brief and internal.

---

## Phase 5: Verification Gate

**Runs after consolidation (Phase 4) and before completion (Phase 6). Also runs after rebuild post-rebuild step.**

**Step 1: Run type-check**

Read the `dev-workflow` chapter from libraryPaths to get the correct type-check command. (The playground-conventions dev-workflow chapter documents the exact npm script name.)

Alternatively, detect from package.json:
1. Look for `"type-check"`, `"typecheck"`, or `"tsc"` in `scripts`
2. Run the found script: `npm run [script-name]`
3. If none found, fall back to `npx tsc --noEmit`

**Step 2: Evaluate result**

If type-check passes: proceed to Phase 6 silently. Designer sees nothing about the verification — just "Done! Your prototype is ready."

If type-check fails:

**Step 3: Auto-fix attempt (up to 2 attempts)**

`fixAttempt = 0`

**Auto-fix loop:**

`fixAttempt += 1`

If `fixAttempt > 2`: go to Step 4 (failure UX).

Analyze the type-check error output:
1. Identify which section caused the error by matching the error file/line against the section regions in targetFilePath
2. Identify the error type: missing import, type mismatch, unknown component, missing prop
3. Apply a targeted fix WITHIN the failing section scope only (consistent with builder's section-scoped constraint):
   - Missing import: add the import (consult library books for correct path)
   - Type mismatch: fix the prop type
   - Unknown component: check library books for correct component name
   - Missing required prop: add the prop with library default value

Re-run type-check. If passes: proceed to Phase 6 silently. If still fails: continue auto-fix loop.

**Step 4: Failure UX (after 2 failed auto-fix attempts)**

Identify the failing section from the error output. Present in designer language:

"[Section name] has an issue — [designer-friendly description]."

Examples of designer-friendly descriptions:
- "The Product Grid is using a component that isn't available in the Playground"
- "The Hero section has a style that TypeScript doesn't recognize"
- "There's a connection issue between the Navbar and the page layout"

Do NOT show: file paths, line numbers, TypeScript error codes, or stack traces.

Present recovery options via AskUserQuestion:
- "Try a different approach" — triggers rebuild for the failing section with an additional constraint: avoid the component/pattern that caused the error
- "Skip that section and finish" — remove the failing section from targetFilePath (replace with a comment placeholder), re-run consolidator for remaining sections, re-run type-check
- "Cancel the build" — exit pipeline with current state preserved

After recovery action: re-run type-check. If passes, proceed to Phase 6. If still fails after recovery, inform user and exit.

---

## Phase 6: Complete

Progress update: "Done! Your [prototype name] prototype is ready."

**Escalation Summary (if any):**

If `allEscalations[]` is non-empty, categorize and display after "Done! Your [prototype name] prototype is ready.":

Categorize each escalation:
- **Approximations**: items where a token was used but isn't the exact match (status was FAIL after all passes, but a token IS applied — it's just the wrong one). These MAY improve on rebuild.
- **Limitations**: items where the issue is a Playground constraint — component doesn't exist, capability not supported, or property category has no token. These will NOT improve on rebuild.

Display format:
```
A few things to note:

Approximations (rebuild may improve):
- [section]: [element] [property] -- used [actual token] instead of [expected token]

Limitations (Playground constraints):
- [section]: [element] -- [reason from escalation]
```

Then prompt:
```
Want me to take another pass at the approximations?
```
Options: "Yes, rebuild [N sections]" / "No, it's good enough" / "Let me pick which ones"

- "Yes, rebuild [N sections]": trigger rebuild flow for all sections with approximation escalations
- "No, it's good enough": proceed to completion
- "Let me pick which ones": AskUserQuestion with section list, then trigger rebuild for selected sections

If no escalations: skip this section entirely — just show "Done! Your [prototype name] prototype is ready."

Update STATUS.md `sections_built` after each successful pipeline run:
1. Derive `statusPath` = `{blueprintPath}/STATUS.md`
2. Read `statusPath` and parse the `sections_built:` YAML array from frontmatter
3. For each section that was successfully built in this pipeline run (from the sections list processed in Phases 1–4), append the section name to `sections_built` if not already present
4. Write updated `sections_built:` array back to STATUS.md frontmatter via Edit tool

After the build completes successfully, push to remote if this is the first build on this branch:
1. Read `/tmp/dt-active.json` for the `branch` field
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
| Surface resolver running | [Claude's discretion — e.g., "Looking up this experience in the codebase..."] |
| Source agents running (prod-clone sections) | [Claude's discretion — e.g., "Reading the [section name] from your codebase..."] |
| Screenshot prompt | "Have a screenshot of this page? It helps me match the layout more accurately, but it's totally optional." |
| Page-container setup | "Setting up the page layout..." |
| Page-container builder | "Creating the page scaffold..." |
| Builder running (pass 1) | "Building the [section name]..." |
| Builder running (pass 2) | "Refining the [section name]..." |
| Builder running (pass 3) | "Final polish on the [section name]..." |
| Reviewer running (pass 1) | "Reviewing for accuracy..." |
| Reviewer running (pass 2) | "Checking the refinements..." |
| Reviewer running (pass 3) | "Final review..." |
| Consolidator running | (silent) |
| Verification running | (silent — designer sees nothing) |
| Verification auto-fix | (silent — designer sees nothing) |
| Verification failure | "[Section] has an issue -- [designer-friendly description]" |
| Pipeline complete | "Done! Your [prototype name] prototype is ready." |

---

## Constraints

- `quietMode: true` on every agent dispatch — never false
- Never emit technical language to the user — designer language only
- All library paths resolved from LIBRARY.md and BOOK.md manifests — never improvise paths
- Never dispatch `@skills/think/SKILL.md` in foreground except in Phase -1 "Describe what you want" branch — that single entry path is the explicit exception for handoff to design thinking
- Discuss-only sections skip layout + design research agents entirely (no Figma node to analyze)
- When dispatched from core SKILL.md, `blueprintPath` and `sections[]` are passed directly — Phase -1 is skipped. When invoked standalone, Phase -1 resolves all inputs.
- The `mode` input parameter controls routing. `referenceType` defaults to `'figma'` when absent on any section (PIPE-02 backward compatibility guard)
- Phase numbering: Rebuild Detection → Phase -1 → Phase 0a → Phase 0 → Phase 1 → Phase 1.5 → Phase 2 → Phase 3 (convergent loop) → Phase 4 (consolidate) → Phase 5 (verification gate) → Phase 6 (complete)
