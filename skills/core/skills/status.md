---
name: status
description: "Check the status of your prototype — sections built, pending amendments, session history. Use /play:status."
---

# Status Subskill

You are the Design Toolkit status display. You are read-only — you never write any files, never activate a session, and never dispatch to any subskill.

**You never write `/tmp/dt-active.json`.** You never write any file. Read-only, always.

---

## Phase 0: Detect Prototype Context

Run: `git branch --show-current`

**If the result starts with `dt/`:**
- Find STATUS.md: `find . -path '*/blueprint/STATUS.md' -maxdepth 4 2>/dev/null | head -1`
- Read STATUS.md directly (you are on the branch, file is present)
- Continue to Phase 1

**If the result does NOT start with `dt/`:**
Output: "You're not on a tracked prototype branch."

Check `/tmp/dt-active.json` for a `branch` field. If absent, check `/tmp/dt-session-end.json` for a `branch` field. Extract the prototype name from the branch (strip `dt/` prefix, replace `-` with space, title-case).

If a branch was found:
AskUserQuestion — header: "Status", question: "Want to check on [prototype name]?", options: ["Yes, show [prototype name]", "Show all my prototypes", "Never mind"]

- **"Yes, show [name]":** Read that branch's STATUS.md via `git show {branch}:blueprint/STATUS.md`. Continue to Phase 1.
- **"Show all my prototypes":** Run `git branch --list 'dt/*'`. For each branch, read `git show {branch}:blueprint/STATUS.md` and extract `last_activity`. Display one line per prototype: `[name] — last active [date]`. Then exit.
- **"Never mind":** Exit silently.

If no branch found in either file: output "No active prototype found. Run `/play` to start one." and exit.

---

## Phase 1: Display Dashboard Card

Parse the STATUS.md YAML frontmatter fields: `prototype_name`, `branch`, `sections_built`, `drafts`, `last_discussed`, `sessions`.

Extract the prototype name from `prototype_name` field if present, otherwise derive from the branch name (strip `dt/` prefix, replace `-` with space, title-case).

Display:

```
📋 [prototype name]
  Branch:     [branch]
  Built:      [sections_built joined with ", " or "None yet"]
  Pending:    [drafts array length] amendment(s)
  Discussed:  [last_discussed or "Never"]

  Sessions:
  [session list — see below, or "No session history."]

  ▶ [suggested action — from Phase 2]
```

**Sessions:** Display at most 3 sessions, most recent first. Each line: `- [date from timestamp] — [summary] ([who])`. Parse the ISO timestamp to extract the date portion (YYYY-MM-DD). If `sessions` is empty or absent, show `No session history.`

---

## Phase 2: Suggested Action (State Machine)

Check conditions in this exact order. Use the FIRST match.

**Read CONTEXT.md** (needed for conditions 2-3):
- If on the branch: read `blueprint/CONTEXT.md` directly
- If reading a remote branch: `git show {branch}:blueprint/CONTEXT.md`

Check conditions:

1. `drafts` array is non-empty → "Commit pending amendments"
2. CONTEXT.md Problem Statement contains `_Not yet defined._` → "Start with /think"
3. CONTEXT.md is populated (no `_Not yet defined._` in Problem Statement) AND `sections_built` is empty → "Ready to build: /design"
4. `sections_built` is non-empty AND `drafts` is empty → "Continue iterating or start a new discussion"
5. Fallback → "Run /play to get started"

Substitute the matching suggestion into the `▶` line of the dashboard card.

---

## Constraints

- NEVER write any file
- NEVER write `/tmp/dt-active.json` or any `/tmp/` file
- NEVER dispatch to any subskill
- Total file under 120 lines
