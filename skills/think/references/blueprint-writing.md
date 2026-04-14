---
name: blueprint-writing
type: reference
description: "Blueprint persistence and handoff for /think — CONTEXT.md writes, surgical amendments, discuss-only build path, return status, dedup contract"
---

# Reference: Blueprint Writing and Handoff

This reference file is loaded by /think's SKILL.md. It contains all rules for persisting design decisions to blueprint files, the discuss-only build path, return status schema, and the dedup contract.

---

## Blueprint Write: CONTEXT.md (always written)

After the conversation concludes and the summary is confirmed by the user, write design decisions to `{blueprintPath}/CONTEXT.md`.

**Follow CONTEXT-EXAMPLE.md schema exactly.** Populate all sections /think has information for:
- **Problem Statement** — the user problem and browse friction from the scenario question
- **Hypotheses** — inferred from flow and interaction decisions; write 2–3 if the conversation supports them
- **Solution Intent** — a short prose description of the chosen approach from the conversation
- **Design Decisions** — each key decision from the conversation as a named bullet with rationale (e.g., "**Side panel over modal** — reason")
- **PDP Stage** — set to the appropriate stage if clear from conversation; leave as template placeholder otherwise
- **Constraints** — any scope limits stated during the conversation (e.g., "no inventory handling", "desktop only for now")

**Leave sections as template placeholders** if the design discussion did not gather that information. Do not fabricate content.

**Write timing:** Natural write point is after summary confirmation and before returning status. /think may write incrementally as topic areas complete or batch-write at the end — use discretion to avoid disrupting conversation rhythm. Never pause mid-question-sequence to write.

---

## Blueprint Write: Surgical Amendments (LAYOUT.md, DESIGN.md, INTERACTION.md)

When the conversation touches layout structure, component mapping, or interaction specifics, amend the relevant blueprint file.

**Append a `## Discuss Amendments` section at the END of the target file.** Never modify original agent-generated content above this section. Amendments are strictly additive.

**Amendment format:**

Every new amendment line is prefixed with `[PENDING]` — no exceptions. There are no bare amendments.

Changes to existing decisions:
```
[PENDING] [property]: [old value] -> [new value] (reason)
```

New decisions not previously in the file:
```
[PENDING] [property]: [value] (new decision)
```

**Examples:**

```
## Discuss Amendments

[PENDING] header/layout: sticky -> fixed (user prefers fixed position, sticky caused z-index issues in prior prototype)
[PENDING] product-table/columns: default set -> [Order ID, Brand, Amount, Status, Date] (matches existing Brand orders pattern)
[PENDING] sidebar/width: not specified -> 280px (designer requested narrower sidebar to give content more room)
```

**Same-property update-in-place rule:** When writing an amendment for a property, first scan the existing `## Discuss Amendments` section for an entry matching the same property slug (the text before the first colon, e.g., `sidebar/width`). If a match is found:
- Replace the existing line (regardless of its current `[PENDING]` or `[COMMITTED]` status) with a new `[PENDING]` line reflecting the new value
- If the prior line was `[COMMITTED]`, reference the committed value as the "old" value
- This preserves one-entry-per-property semantics — one line per property, always the latest decision

If no match is found: append as a new `[PENDING]` line at the end of the section.

**Appending to existing `## Discuss Amendments`:** If the section already exists from a prior design discussion session, append new amendments below the existing ones (unless the same-property update-in-place rule applies — existing entries for the same property are replaced, not appended).

**STATUS.md drafts: update:** After EACH amendment write to a blueprint file:
1. Derive the amendment ID slug from the property portion (e.g., `sidebar/width` → replace `/` with `-` → `sidebar-width`; `header/layout` → `header-layout`; spaces become `-`; all lowercase)
2. Read `blueprint/STATUS.md` YAML frontmatter
3. If the slug is NOT already in `drafts:`, append it using the Edit tool (never the Write tool)
4. If the slug is already present, no change needed

**Amendment removal during conversation:** If the user explicitly reverses a pending amendment during the conversation, delete the `[PENDING]` line from the blueprint file and remove its slug from STATUS.md `drafts:` array. This keeps the pending state accurate and in sync with the conversation.

**Which file to amend:**
- LAYOUT.md — section structure, component tree, spacing, layout decisions
- DESIGN.md — component mapping, typography, color token choices, visual decisions
- INTERACTION.md — states, transitions, user flows, responsive behavior decisions

Builder, loupe agents, and consolidator read both base content and amendments, applying only `[COMMITTED]` amendments as an overlay. `[PENDING]` lines are skipped by the builder. The `## Discuss Amendments` section is preserved across loupe runs and consolidation — amendments persist.

---

## Discuss-Only Build Path: LAYOUT.md + DESIGN.md Population

When there is no Figma reference for a section (`referenceType` is `"discuss-only"`), /think populates LAYOUT.md and DESIGN.md from conversation decisions plus library books.

**Level of detail: "conversation-derived."** Include:
- Component names and section structure (from conversation + design system book)
- Key layout decisions (e.g., "right-anchored panel, 480px wide")
- Design token references from library books (e.g., `--ds-spacing-lg`, `--ds-color-primary`)
- Component variants chosen during conversation

**Do NOT include:** Pixel measurements, CSS values, or implementation-level specifics. Builder fills in sensible defaults from library books.

**Follow LAYOUT-EXAMPLE.md and DESIGN-EXAMPLE.md schemas for structure** — component trees, token quick-reference tables, component mapping tables — but content comes from conversation decisions, not Figma extraction.

**INTERACTION.md in discuss-only path:**
- Populate if the conversation covered interaction specifics (states, flows, transitions)
- Leave as template if interaction discussion was minimal — Builder can infer from component choices

**Hybrid detection (describeOnly mode only):**
After loading codebase-map surface names (from Phase 0), scan the user's description for matches BEFORE starting the conversation or writing artifacts:

For each surface name in the codebase-map index:
  If user's description contains this surface name (case-insensitive substring match):
    Candidate hybrid surface found.

If a candidate is found:
  AskUserQuestion — header: "Surface", question: "Looks like you want to build on the [surfaceName]. I'll pull the existing layout and we'll add your changes on top.", options: ["Yes, use existing layout", "No, describe from scratch"]
  - "Yes, use existing layout":
    Run Discuss-Only Build Path for the user's description (write LAYOUT.md + DESIGN.md for the describe-only sections)
    Return status `ready_for_hybrid_build` with surfaceName and discuss-only sections
  - "No, describe from scratch":
    Proceed as pure discuss-only (no hybrid)

If no candidate is found:
  Proceed as pure discuss-only (standard Discuss-Only Build Path).

**Important:** Hybrid detection runs BEFORE the conversation or artifact writing. If the user confirms hybrid, /think still writes LAYOUT.md + DESIGN.md for the discuss-only sections (the user's new additions), then returns. The prod-clone base sections are resolved by surface-resolver in loupe — /think never dispatches surface-resolver.

**Anti-patterns to enforce:**
- /think NEVER dispatches surface-resolver, loupe, or any agent — it returns status only
- Hybrid detection triggers a user confirmation prompt, NOT automatic mode switching
- The AskUserQuestion wording is confirmatory: "Looks like you want to build on..." not assumptive "I'll use..."

---

## Reference Inventory

Throughout the conversation, maintain a mental reference inventory tracking each section discussed.

**Each section has:**
- `name` — free-form string chosen during conversation (e.g., "header", "product-table", "order-sidebar"). Not a reserved vocabulary — choose names that match what the designer said.
- `referenceType` — `"discuss-only"` or `"figma"`

**When a Figma URL arrives mid-discussion:**
1. Associate it with the relevant section — infer from conversation context
2. If ambiguous, ask: `"Is this Figma frame for the [header] or the [order-table]?"` (use AskUserQuestion)
3. Detect whether the URL is a full-frame or a focused section/element — set `hasFullFrame` accordingly
4. **Immediately dispatch a background Figma fetch** (`mcp__figma__get_figma_data`) and continue the conversation without waiting. Do NOT block on the Figma fetch — the data is only needed at build time, not during conversation. Say something like "I'll pull your Figma frame in the background while we keep talking." Cache the result once it completes; include it in the return status `sections[]` entry for this section.

**Section names are free-form.** The orchestrator and loupe agents receive these names in the return status and use them as-is. Prefer descriptive names that will be meaningful in the build phase (e.g., "order-management-table" not "section-2").

---

## "Ready to Build?" Detection

/think proactively surfaces a "ready to build?" prompt when it detects sufficient decision coverage — don't wait for the user to say "start building."

**Coverage indicators (all should be satisfied):**
- Scenario / user problem decided
- Primary user flow decided
- Key interactions discussed or acknowledged
- States and data shape at least acknowledged (even if scoped out)

**Pending amendment diff (conditional):** Before showing the Ready gate, check `blueprint/STATUS.md drafts:` array.
- If `drafts:` is empty: proceed directly to the gate below (no diff, no commit step needed).
- If `drafts:` is non-empty: scan all three blueprint files (LAYOUT.md, DESIGN.md, INTERACTION.md) for lines starting with `[PENDING]`. Assemble a diff grouped by target file using design language — translate the raw amendment syntax into plain human-readable descriptions. Example: `sidebar/width: not specified -> 280px` becomes "Sidebar narrows to 280px." Display the diff before the gate question using this format:

```
> Here's what will be locked in:
>
> **Layout changes:**
> - [translated amendment 1]
> - [translated amendment 2]
>
> **Design changes:**
> - [translated amendment]
>
> **Interaction changes:**
> (none)
```

When coverage is sufficient, surface the prompt naturally at a conversational break (after any pending diff display if applicable):

```
- header: "Ready?"
- question: "We've covered the core design decisions. Ready to build?"
- options: ["Let's build", "I want to discuss more", "Just save decisions (no build)"]
```

**Commit-all sequence:** When user selects "Let's build" AND `drafts:` was non-empty, run the commit-all sequence BEFORE returning status `ready_for_build`:
1. For each blueprint file (LAYOUT.md, DESIGN.md, INTERACTION.md):
   a. Read the file
   b. In the `## Discuss Amendments` section, replace all `[PENDING] ` prefixes with `[COMMITTED] ` using the Edit tool (never the Write tool)
2. Clear STATUS.md `drafts:` array to `[]` using the Edit tool
3. Then return status `ready_for_build` as normal

If `drafts:` was already empty when "Let's build" is selected, skip the commit-all sequence entirely and return `ready_for_build` directly.

**"Just save decisions"** → skip the commit-all sequence entirely. Amendments remain `[PENDING]`, `drafts:` array unchanged. Return status `discussion_only`. Decisions persist in blueprint files. No build is triggered.

**"I want to discuss more"** → return to conversation. All pending amendments remain as-is.

This is a proactive suggestion — /think raises it, but requires explicit user confirmation before proceeding.

---

## Return Status

After the conversation concludes and blueprint files are written, emit structured return status to the orchestrator.

**/think itself NEVER invokes loupe, builder, or any agent.** Return status only — the orchestrator routes from there.

**Return status schema:**

```json
{
  "status": "ready_for_build" | "discussion_only" | "cancelled",
  "blueprintPath": "/path/to/prototype/blueprint/",
  "sections": [
    {
      "name": "product-grid",
      "referenceType": "figma",
      "figmaUrl": "https://figma.com/...",
      "nodeId": "123:456",
      "interactionContext": {
        "customStates": [
          { "element": "ProductCard", "state": "Selected (panel open)", "override": "Grid card gains a selected ring while Quick View panel is open" }
        ],
        "flows": [
          { "name": "Quick View Browse", "steps": ["User hovers card", "Quick View trigger appears", "User clicks trigger"] }
        ],
        "transitions": [
          { "trigger": "Quick View click", "from": "Panel hidden", "to": "Panel visible", "animation": "slide right", "duration": "250ms" }
        ],
        "responsiveBehavior": [
          { "breakpoint": "Mobile (< 768px)", "behavior": "Panel becomes a bottom sheet" }
        ]
      }
    },
    {
      "name": "filter-sidebar",
      "referenceType": "figma",
      "figmaUrl": "https://figma.com/...",
      "nodeId": "124:100",
      "interactionContext": null
    }
  ],
  "crossSectionFlows": [
    {
      "name": "Filter updates grid",
      "sections": ["filter-sidebar", "product-grid"],
      "steps": ["User selects filter", "Product grid re-fetches and updates"]
    }
  ],
  "hasFullFrame": false,
  "fullFrameUrl": null
}
```

**`interactionContext`** is populated when the conversation covered interaction specifics for that section. `null`/absent when interactions were not discussed for that section — signals library-defaults-only to the interaction agent.

**`crossSectionFlows`** captures flows that span multiple sections (e.g., "filter in sidebar updates product grid"). Empty array when no cross-section flows were discussed.

/think pre-categorizes interaction context into the four keys (`customStates`, `flows`, `transitions`, `responsiveBehavior`) during the conversation. The interaction agent maps these directly to INTERACTION.md sections without re-categorization.

**`status` values:**
- `ready_for_build` — user confirmed ready to build; all sections have decided reference types
- `ready_for_hybrid_build` — hybrid detected; discuss-only sections written, surface name identified for prod-clone base
- `discussion_only` — user chose to save decisions without building (amendments persist in blueprint)
- `cancelled` — user cancelled the discussion

**`ready_for_hybrid_build` schema example:**

```json
{
  "status": "ready_for_hybrid_build",
  "blueprintPath": "/path/to/prototype/blueprint/",
  "surfaceName": "Order List",
  "sections": [
    {
      "name": "promotions-banner",
      "referenceType": "discuss-only",
      "interactionContext": null
    }
  ],
  "crossSectionFlows": [],
  "hasFullFrame": false,
  "fullFrameUrl": null
}
```

**`surfaceName`** is only present when status is `ready_for_hybrid_build`. It identifies the codebase-map surface that loupe should pass to surface-resolver for the prod-clone base sections.

**`hasFullFrame`:** `true` when the user provided a full Figma frame URL (decomposer runs on it); `false` when only individual section frames or discuss-only sections exist.

**`fullFrameUrl`:** The full-frame Figma URL if `hasFullFrame` is true; `null` otherwise.

**`sections`:** One entry per section tracked in the reference inventory. Each entry has `name` and `referenceType`. Figma entries include `figmaUrl` and `nodeId` from the mid-session Figma fetch. For `ready_for_hybrid_build`, sections[] contains only the discuss-only sections (the user's new additions) — the prod-clone base sections are resolved by surface-resolver in loupe.

---

## Standalone Chain Handling

When /think was invoked standalone (Phase -1 ran) and returns status `ready_for_build`:
- Display: "Ready to build -- run `/design` to start."
- Do NOT dispatch /design. The user triggers the next step manually.

When dispatched from core SKILL.md, this section does not apply — core SKILL.md handles the design discussion -> build chain.

---

## Dedup Contract

CONTEXT.md is the single source of truth for what's decided.

**Build agents read CONTEXT.md before asking questions.** If information is already captured there — scenario, flow, interaction choices, states, constraints — the build agent skips that question. This is the dedup contract: /think locks a decision by writing it to CONTEXT.md; build agents honor the lock.

**After mid-build design discussion concludes:** Amendments persist in blueprint files regardless of whether a rebuild happens immediately. Ask what to do next:

```
- header: "Next step"
- question: "Want me to rebuild the affected section(s) now, or save the changes for later?"
- options: ["Rebuild now", "Save for later"]
```

**Mid-build pending model:** Both "Rebuild now" and "Save for later" leave new amendments as `[PENDING]`. The commit-all sequence only runs at the main Ready gate ("Let's build"). This means:
- "Rebuild now" → returns `ready_for_build`. The builder will use only `[COMMITTED]` amendments — pending amendments written during this mid-build session are NOT included in the build until they are committed at a future Ready gate.
- "Save for later" → returns `discussion_only`. Amendments remain `[PENDING]` in blueprint files with their slugs in STATUS.md `drafts:`.

All amendments written during mid-build design discussion use the same `[PENDING]` prefix logic and STATUS.md `drafts:` update rules defined in "Blueprint Write: Surgical Amendments" above.

Blueprint amendments are durable — they do not expire if the user chooses "Save for later." When the builder runs later, it reads both the base blueprint content and all `## Discuss Amendments` sections, applying only `[COMMITTED]` lines.
