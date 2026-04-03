---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - ~/.claude/skills/watson/skills/loupe.md
  - ~/.claude/skills/watson/references/agent-contract.md
  - ~/.claude/skills/watson/SKILL.md
autonomous: true
requirements: [AUDIT-GAP-1, AUDIT-GAP-2, AUDIT-GAP-3]

must_haves:
  truths:
    - "sections_built in STATUS.md is updated after each successful loupe pipeline run"
    - "agent-contract.md interaction row shows background, matching interaction.md frontmatter"
    - "SKILL.md Path A no longer references targetFilePath"
  artifacts:
    - path: "~/.claude/skills/watson/skills/loupe.md"
      provides: "sections_built update step in Phase 5"
      contains: "sections_built"
    - path: "~/.claude/skills/watson/references/agent-contract.md"
      provides: "Corrected interaction agent dispatch mode"
      contains: "background"
    - path: "~/.claude/skills/watson/SKILL.md"
      provides: "Clean Path A without targetFilePath"
  key_links:
    - from: "loupe.md Phase 5"
      to: "blueprint/STATUS.md"
      via: "Edit tool updating sections_built array"
      pattern: "sections_built"
---

<objective>
Fix three integration gaps identified in the v1.1 milestone audit: (1) populate sections_built in STATUS.md after builds, (2) correct stale interaction agent dispatch mode in agent-contract.md, (3) remove uncollected targetFilePath param from SKILL.md Path A.

Purpose: Close documentation and behavior gaps so STATUS.md accurately tracks build progress, agent-contract.md matches agent frontmatter, and SKILL.md does not reference phantom parameters.
Output: Three updated files with targeted edits.
</objective>

<execution_context>
@/Users/austindick/.claude/get-shit-done/workflows/execute-plan.md
@/Users/austindick/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@~/.claude/skills/watson/skills/loupe.md
@~/.claude/skills/watson/references/agent-contract.md
@~/.claude/skills/watson/SKILL.md
@~/.claude/skills/watson/agents/interaction.md (first 5 lines — confirms dispatch: background)
@~/.claude/skills/watson/agents/consolidator.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add sections_built update to loupe.md Phase 5</name>
  <files>~/.claude/skills/watson/skills/loupe.md</files>
  <action>
In loupe.md Phase 5 ("## Phase 5: Complete"), insert a new step AFTER the progress update line ("Done! Your [prototype name] prototype is ready.") and BEFORE the push-to-remote block. The new step updates STATUS.md sections_built:

```
After the progress update, update STATUS.md `sections_built`:
1. Derive `statusPath` = `{blueprintPath}/STATUS.md`
2. Read `statusPath` and parse the `sections_built:` YAML array from frontmatter
3. For each section that was successfully built in this pipeline run (from the sections list processed in Phase 1-4), append the section name to `sections_built` if not already present
4. Write updated `sections_built:` array back to STATUS.md frontmatter via Edit tool
```

This goes between the "Done!" progress update line and the "After the build completes successfully, push to remote" paragraph. The consolidator already writes blueprint files — loupe is the right place because it knows which sections were built and has the orchestrator view.
  </action>
  <verify>
    <automated>grep -n "sections_built" ~/.claude/skills/watson/skills/loupe.md | head -5</automated>
  </verify>
  <done>loupe.md Phase 5 contains a sections_built update step that appends built section names to STATUS.md after each successful pipeline run</done>
</task>

<task type="auto">
  <name>Task 2: Fix interaction row in agent-contract.md and remove targetFilePath from SKILL.md</name>
  <files>~/.claude/skills/watson/references/agent-contract.md, ~/.claude/skills/watson/SKILL.md</files>
  <action>
**agent-contract.md fix:** In the Agent Registry table (line 38), change the interaction row's Dispatch Mode from `foreground*` to `background`. Also update the "Foreground Agents" section below the table: remove the interaction bullet point from "### Foreground Agents" (lines 60-61 — the bullet about interaction being foreground when watsonMode=false). Move it to "### Background Agents" with updated text: "**interaction** — always background. Receives all required context via parameters (interactionContext from discuss or watsonMode=true in loupe parallel dispatch)."

Also remove or update the "### Interaction Agent Footnote" section (lines 66-74) since the foreground asterisk is no longer needed. Replace it with a brief note: "The interaction agent always runs as background. When `interactionContext` is provided (from discuss), it writes from that context. When dispatched by loupe in parallel mode, `watsonMode=true` is always set."

**SKILL.md fix:** In Path A step 4 (line 51), remove `targetFilePath` from the parameter list. Current text: "Invoke `@utilities/watson-init.md` with `targetFilePath`, `prototype_name`, and `slug` parameters". Change to: "Invoke `@utilities/watson-init.md` with `prototype_name` and `slug` parameters"
  </action>
  <verify>
    <automated>grep -n "foreground\*" ~/.claude/skills/watson/references/agent-contract.md; grep -n "targetFilePath" ~/.claude/skills/watson/SKILL.md; echo "---"; grep -n "interaction" ~/.claude/skills/watson/references/agent-contract.md | head -10</automated>
  </verify>
  <done>agent-contract.md interaction row shows "background" (no asterisk), footnote updated to reflect background-only dispatch, and SKILL.md Path A step 4 no longer mentions targetFilePath</done>
</task>

</tasks>

<verification>
1. `grep "foreground\*" ~/.claude/skills/watson/references/agent-contract.md` returns empty (no stale asterisk)
2. `grep "targetFilePath" ~/.claude/skills/watson/SKILL.md` returns empty (param removed)
3. `grep "sections_built" ~/.claude/skills/watson/skills/loupe.md` returns at least one match (new step exists)
4. All three files remain syntactically valid markdown
</verification>

<success_criteria>
- STATUS.md sections_built will be populated after loupe pipeline runs (instruction added to loupe.md Phase 5)
- agent-contract.md interaction row matches interaction.md frontmatter (both say background)
- SKILL.md Path A does not reference targetFilePath
- No net line count increase beyond 10 lines across all files
</success_criteria>

<output>
After completion, create `.planning/quick/1-fix-sections-built-agent-contract-md-and/1-SUMMARY.md`
</output>
