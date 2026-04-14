---
name: save
description: "Checkpoint your session -- write decisions to blueprints, commit your branch, update status for later restoration. Use when you want to save progress."
---

# /save

Session checkpoint utility for the Design Toolkit. Extracts design decisions, component choices, and interaction patterns from the current session — then writes them to blueprint files, commits the branch, and updates STATUS.md so /play can restore the session later.

**This file is the full instruction set.** /save runs as single-pass analysis because it needs full conversation context.

---

## Phase -1: Standalone Setup (only when blueprintPath not provided)

1. Check `/tmp/dt-active.json` — if it exists and has a `branch` field, set `blueprintPath` to `blueprint/` relative to the prototype root on that branch.
2. If no active session or no `branch` field: `find . -path '*/blueprint/STATUS.md' -maxdepth 4 -not -path './.git/*' 2>/dev/null | head -1` — extract parent directory as `blueprintPath`.
3. If still not found and on a `dt/*` branch, retry without `-maxdepth 4`.
4. If still not found: respond "No blueprint found. Run /play to start a session, or run /save from a directory with a blueprint/ folder." Exit.

/save does NOT create sessions or blueprint directories. If no blueprint exists, tell the user to run /play first.

---

## On Activation

1. Output header: `Design Toolkit > Save Checkpoint`
2. Track action in dt-active.json: read `/tmp/dt-active.json`. If `actions` array exists, append `"saved checkpoint"` and write back via Edit tool. Skip silently if file doesn't exist.

---

## Phase 0: Amendment Commit

Check for pending amendments per the blueprint contract — /save flips [PENDING] -> [COMMITTED].

1. Read `{blueprintPath}/CONTEXT.md`. Scan for lines containing `[PENDING]` in the Design Decisions section.
2. If [PENDING] lines found:
   - Replace all `[PENDING]` with `[COMMITTED]` in CONTEXT.md via Edit tool.
   - Clear `drafts: []` in STATUS.md frontmatter via Edit tool.
   - Note the count of committed amendments for the Phase 5 summary.
3. If no [PENDING] lines found: skip silently.

See blueprint contract for write protocol: @shared/references/blueprint-contract.md

---

## Phase 1: Context Extraction

**Step 1 — Load library books for grounding**

Read `${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md` for the book index.

Load immediately:
- `design-system` — component names, token values, variants. Required before writing DESIGN.md. Never write a component name without grounding it here first.
- `playground-conventions` — scaffolding rules, project structure. Required before interpreting `src/` code.

**Step 2 — Read three sources**

**Source A — Conversation context:**
Parse the current session conversation history. Extract:
- Design decisions: explicit statements the user made ("I want X", "let's use Y")
- Problem framing: what problem was being solved, user context, goals stated
- Component choices: any UI components mentioned or agreed on
- Interaction descriptions: flows, states, behaviors described
- Constraints: scope limits stated ("desktop only", "no pagination for now")

Distinguish **decisions** (explicit user statements or confirmed choices) from **casual mentions** (referenced in passing, not confirmed).

**Source B — Built code:**
Read files in `src/` on the current branch. Identify:
- Sections from component file names, directory names, subdirectories
- Components in use: match against design-system book — resolve to real component names and variants
- Layout approach: infer from JSX structure (sidebar + content, full-width, grid, etc.)
- Token usage: map colors, spacing, and typography to token values from the design-system book
- States implemented: loading, error, empty states present in code

**Source C — Git state:**
Run `git diff` and `git log --oneline -20`. Extract:
- What was built or changed recently
- Iteration patterns (what was tried and revised)
- Files added or significantly modified

**Step 3 — Confidence classification**

- **Confirmed:** Explicitly stated by user in conversation, OR clearly implemented in code matching a conversation decision. Written as-is.
- **Inferred:** Deduced from code patterns, casual mentions, or ambiguous signals. Written with `[INFERRED]` prefix.

When conversation and code conflict — do NOT silently pick one. Flag as ambiguous gap for Phase 5.

---

## Phase 2: Blueprint Writing

Read existing blueprint files at `blueprintPath`. Apply merge strategy:
- **Template-only content** (placeholder text like `_Not yet defined._`): replace with extracted content.
- **Existing real content**: preserve it. Add new extracted content additively. If extracted content conflicts with existing, do NOT overwrite — record the conflict for Phase 5 gap analysis.

All writes use the Edit tool per the blueprint contract write protocol. Exception: if a blueprint file is template-only (all placeholders), Write tool is acceptable for initial population.

**Write CONTEXT.md:** Problem Statement (Source A), Hypotheses (2-3 if evidence supports, `[INFERRED]` if not explicit), Solution Intent (short prose), Design Decisions (each confirmed decision with rationale), Constraints (scope limits from Source A).

**Write LAYOUT.md:** Add `## SectionName` entries from Source B. Include component hierarchy and layout approach per section. Mark inferred layout decisions with `[INFERRED]`.

**Write DESIGN.md:** Add section entries with component choices and token usage. Ground all component names against the design-system book — never write an improvised name. Mark inferred visual decisions with `[INFERRED]`.

**Write INTERACTION.md:** Populate States (Tier 1/2/3), Transitions, User Flows, Responsive Behavior from Source A and Source B. Mark inferred interactions with `[INFERRED]`.

**Write STATUS.md updates:**
- `last_activity`: overwrite with today's date
- `sections_built`: append any new section names found in Source B (append-only — never remove existing entries)
- Preserve existing `sessions:` array (Phase 4 adds the session entry after the commit)

Do NOT commit yet — Phase 3 commits.

---

## Phase 3: Commit

Create a descriptive git commit summarizing the captured session:

1. `git add blueprint/`
2. Build commit message from extraction summary: `dt: save — {brief summary}` (e.g., "dt: save — layout decisions, 3 sections built, interaction specs for checkout flow")
3. `git commit -m "{message}"`
4. If commit fails (nothing to commit), note inline and continue to Phase 4.

Always commit before showing the Phase 5 summary. The commit is the persistent record; the summary is a view of it.

---

## Phase 4: STATUS.md Session Entry

After the Phase 3 commit (so the commit is included in the session record):

1. Get user: `git config --get user.name`
2. Compile actions summary: read `/tmp/dt-active.json` `actions` array, join with ", ", truncate at 80 chars. If no dt-active.json, use the extraction summary from Phase 1.
3. Prepend `{timestamp, summary, who}` entry to STATUS.md `sessions:` array via Edit tool. Drop oldest entry if count >= 10.
4. Commit: `git add blueprint/STATUS.md && git commit -m "dt: update session log"`

Session entry format:
```yaml
sessions:
  - timestamp: "2026-04-10T15:30:00Z"
    summary: "Saved checkpoint — layout decisions, 3 sections built"
    who: "Austin Dick"
```

This satisfies STATUS.md prepend-only lifecycle for `sessions:` (max 10, newest first).

---

## Phase 5: Summary

Present captured context with confidence indicators:
- `✓` Confirmed — explicitly stated or clearly in code
- `?` Inferred — best guess, marked `[INFERRED]` in blueprint
- `✗` Missing — not found in conversation or code

**"Here's the context I captured"** — summarize CONTEXT.md content with indicators. Show gaps (missing sections, inferred items needing review).

**"Here are the design decisions I'm seeing"** — summarize LAYOUT.md + DESIGN.md + INTERACTION.md combined with indicators. Show gaps.

Count total gaps across both groups.

- If gaps > 0: "Run /think to discuss these gaps and confirm the inferred decisions."
- If gaps == 0: "Blueprint looks complete. Run /design when ready to build."

Always end with: "Checkpoint saved. Run /play to see your session history."

Do NOT dispatch /think or /design. Suggest only (suggest-not-dispatch pattern).

---

## Red Flags

| If you're thinking... | Stop. The real issue is... |
|---|---|
| "I'll skip the library books, extraction is straightforward" | Library grounding prevents invented component names and wrong tokens. Load design-system before writing DESIGN.md. If you improvise a component name, the builder will fail to recognize it. |
| "The user said X but the code shows Y, I'll go with the code" | Flag as ambiguous gap. Do not silently pick one signal over the other. Both signals matter. |
| "I'll dispatch /think directly" | Stop: suggest-not-dispatch. Always suggest, never dispatch peer skills. |
| "I'll show summary before committing" | Always commit blueprint files before showing the summary. The commit is the persistent record. |
| "I'll skip extraction for short sessions" | Even short sessions capture something — a problem statement, a component choice, a constraint. Extract what's there and flag the rest as gaps. |
| "I'll create a session or blueprint if none exists" | /save never creates sessions. If no blueprint found, tell the user to run /play first. |

---

## Constraints

- File must stay under 250 lines
- /save runs as single-pass analysis — not dispatched to agents — because it needs full conversation context
- Never mention file paths, agent names, or internal toolkit architecture to the user
- All user-facing language is design language
- /save does NOT dispatch /think or /design — it only suggests them (suggest-not-dispatch pattern)
- Always commit blueprint files before showing the Phase 5 summary
- All blueprint writes use Edit tool per blueprint contract (exception: initial population of template-only files)
- [INFERRED] markers in blueprint files are the persistent record of uncertain decisions
- Library paths use plugin root: `${CLAUDE_PLUGIN_ROOT}/library/LIBRARY.md` (not skills/core/library/)
