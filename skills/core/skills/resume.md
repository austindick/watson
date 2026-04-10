---
name: resume
type: subskill
purpose: Reconstructs Watson context from persistent state after a context reset and offers state-aware next actions
---

# Watson Resume Subskill

**On Activation:** Output header before anything else:

```
Watson > Resume
```

---

## Phase 0: Detect Branch Context

1. Check current branch: `git branch --show-current`
2. **On a `watson/*` branch:** Discover blueprint path (`find . -name "STATUS.md" -path "*/blueprint/*" | head -1`), read STATUS.md, proceed to Phase 1.
3. **NOT on a watson/* branch:**
   - Check `/tmp/watson-active.json` for `branch` field, then `/tmp/watson-session-end.json`.
   - **State file found:** Auto-commit guard (`git status --porcelain` — if dirty, `git add -A && git commit -m "watson: checkpoint"`), then `git checkout {branch}`, discover blueprint path, proceed to Phase 1.
   - **No state files:** Invoke `@utilities/watson-init.md` with `operation: "branch-list"` — let user select branch, then proceed to Phase 1.

---

## Phase 1: Display Dashboard + Key Decisions

Read STATUS.md YAML frontmatter. Display dashboard card:

```
Prototype: {name}
Branch:    watson/{slug}
Built:     {sections_built joined with ", " or "none yet"}
Pending:   {drafts length} amendment(s)
Sessions:  {last 3 session summaries — timestamp + who + summary, one per line}
```

**Key decisions:** Extract 2–3 decisions from CONTEXT.md "Design Decisions" section — scan for lines starting with `- **` or `**` under that heading. Display as bullet points below the dashboard.

If CONTEXT.md is template-only (contains `_Not yet defined._` in Problem Statement), skip key decisions and note: "No design decisions captured yet."

---

## Phase 2: Present Action Prompt

Determine the state-aware primary action (check in order):

1. `drafts:` non-empty → primary: "Commit pending amendments"
2. CONTEXT.md template-only → primary: "Start a discussion"
3. CONTEXT.md populated, `sections_built` empty → primary: "Build prototype"
4. `sections_built` non-empty, `drafts` empty → primary: "Continue iterating"
5. Fallback → primary: "Start fresh"

AskUserQuestion — header: "Resume", question: "{dashboard summary}\n\nWhat would you like to do?", options: [primary action, "Switch to a different prototype", "Just activate Watson"]

**Handle each choice:**

- **"Commit pending amendments":** Scan `{blueprintPath}/LAYOUT.md`, `DESIGN.md`, `INTERACTION.md` for `[PENDING]` lines; render grouped by file. AskUserQuestion — header: "Pending", question: "{diff}\n\nWhat would you like to do?", options: ["Commit all", "Discard all", "Keep pending and continue"] — same behavior as SKILL.md Path B step 6.
- **"Start a discussion":** Dispatch `@skills/discuss.md` with `blueprintPath`.
- **"Build prototype":** Dispatch `@skills/loupe.md` with `blueprintPath`.
- **"Continue iterating":** Proceed to Phase 3 (activate Watson). The user's next message will drive what happens — Watson is active and ready.
- **"Switch to a different prototype":** Auto-commit guard, then invoke `@utilities/watson-init.md` with `operation: "branch-list"`.
- **"Just activate Watson":** Proceed to Phase 3 (activate Watson). The user's next message will drive what happens.
- **"Start fresh":** Proceed to Phase 3 (activate Watson), then invoke `@utilities/watson-init.md` to start the new-prototype flow.

---

## Phase 3: Activate Watson

1. Write `/tmp/watson-active.json` with `{ "branch": "{current_branch}" }`.
2. Tell the user: "Watson is active on {branch}. What would you like to do?"
3. The subskill ends here — control returns to the conversation. The user's next message drives what happens next (Watson is active, so SKILL.md will route subsequent input).

Resume **always** activates Watson — resume implies intent to work.

---

## Constraints

- Always writes `watson-active.json` (unlike status which never writes)
- "Switch to different prototype" uses watson-init branch-list, same pattern as SKILL.md Path B
- Key decisions extraction: scan CONTEXT.md for lines starting with `- **` under "Design Decisions" heading; take first 2–3
- Keep file under 150 lines
