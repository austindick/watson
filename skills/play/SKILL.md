---
name: play
description: "Manage prototype sessions -- fork branches, scaffold blueprints, continue existing work. Use when starting or resuming a prototype session."
---

# /play

Session management for the Design Toolkit. Fork new prototype branches, continue existing work, clean up inactive sessions, and maintain STATUS.md throughout.

---

## Gate

1. If `/tmp/dt-declined.json` exists — session was declined this session. Exit silently.
2. If this is a description-match activation (not an explicit `/play` invocation): AskUserQuestion — header: "Design Toolkit", question: "Want Design Toolkit's help with this?", options: ["Yes, activate", "Not right now", "No, don't ask again this session"]. "Yes" → proceed. "Not right now" → exit silently. "No, don't ask again" → write `/tmp/dt-declined.json` `{"declined": true}`, exit silently.
3. Explicit `/play` invocation: skip gate, proceed directly to Activation.

---

## Activation

Write state file: `echo '{}' > /tmp/dt-active.json`

/play is a session-level toggle. /play activates, /play off deactivates. When active, prototype session management is live.

---

## Routing — Explicit Subcommands

Handle these BEFORE the 2-path fork:

**`/play off`:**
0. Auto-commit: `git status --porcelain`. If dirty, `git add -A && git commit -m "dt: checkpoint"` silently.
1. Read `/tmp/dt-active.json`. If `branch` and `actions` fields exist:
   a. Discover blueprint path, read STATUS.md frontmatter.
   b. Display summary: "Discussed: [actions joined or 'nothing']", "Built: [sections_built joined or 'nothing']", "Pending: [drafts length] amendment(s)"
   c. Get user via `git config --get user.name`. Compile actions (join with ", ", truncate at 80 chars). Prepend `{timestamp, summary, who}` entry to STATUS.md `sessions:` array. Drop oldest if count >= 10.
2. Delete `/tmp/dt-active.json` (bash: `rm -f /tmp/dt-active.json`)
3. Respond "Session ended." and exit.

**`/play resume` or `/play:resume`:** Dispatch `@references/resume.md` with `blueprintPath`.

**`/play help`:** Inline response: "I manage prototype sessions. Use /play to start or continue, /play off to end, /play resume after a /clear. Once a session is active, use /think for design discussion and /design to build." Exit.

**`/play cleanup`:** Invoke `@references/session-init.md` with `operation: "branch-list"`. Filter to inactive branches only (30+ days). Display with [INACTIVE] tags. For each: offer "Delete branch" or "Reset inactivity timer". After selection, show remaining branches or confirm all clean.

If none of the above match, proceed to Session Greeting and 2-Path Fork.

---

## Session Greeting

Read and display the banner from `@skills/core/references/watson-banner.md`. Display once at the start of every /play session.

---

## Entry Point: 2-Path Fork

AskUserQuestion — header: "Design Toolkit", question: "What would you like to work on?", options: ["Start a new prototype", "Continue working on an existing prototype"]

---

### Path A — Start a new prototype

1. **Session recovery:** if `/tmp/dt-session-end.json` exists, read `{branch, actions, timestamp}`, discover blueprint path, read STATUS.md via `git show {branch}:{blueprintPath}/STATUS.md`, compile actions into summary (join with ", ", truncate at 80 chars), prepend new session entry to STATUS.md `sessions:` array (drop oldest if count >= 10), delete `/tmp/dt-session-end.json`.
2. Ask prototype name (plain text question, not AskUserQuestion).
3. Derive slug: `name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`
4. Run Setup Flow (see below).
5. Invoke `@references/session-init.md` with `prototype_name` and `slug` parameters — session-init handles branch creation and blueprint scaffold.
6. Tell user: "Session active on dt/{slug}. What would you like to do?" Suggest /think for design discussion or /design to start building. Exit — user's next message drives routing.

---

### Path B — Continue working on an existing prototype

1. **Session recovery:** same as Path A step 1.
2. If the user's message includes additional text (branch name, URL, slug, or path): Invoke `@references/session-init.md` with `operation: "direct-input"`, `userInput: {pasted text}`, `offerConversion: true`. Skip to step 5.
3. Otherwise: Invoke `@references/session-init.md` with `operation: "branch-list"` — session-init gathers all branch data in a batched bash script, groups into "Your prototypes" and "Browse other prototypes", tags inactive branches with [INACTIVE].
4. User selects branch; session-init handles: inactive-branch options, auto-commit guard, `git checkout dt/{slug}`, missing-branch recovery, health check.
5. Load STATUS.md frontmatter; display: "[name] — [N] section(s) built. [M] pending amendment(s). Last session: [date] by [user] — [summary]."
6. If `drafts:` non-empty: Scan `{blueprintPath}/LAYOUT.md`, `DESIGN.md`, `INTERACTION.md` for [PENDING] lines; render grouped by file. AskUserQuestion — header: "Pending", question: "[diff]\n\nWhat would you like to do?", options: ["Commit all", "Discard all", "Keep pending and continue"].
   - "Commit all": replace all [PENDING]→[COMMITTED] (Edit), set `drafts: []` (Edit), proceed.
   - "Discard all": delete all [PENDING] lines (Edit), set `drafts: []` (Edit), confirm discarded, proceed.
   - "Keep pending and continue": proceed unchanged.
7. Tell user: "Session active on dt/{slug}. What would you like to do?" Suggest /think or /design. Exit.

---

## Setup Flow (new prototypes only)

Prototype name and slug are collected in Path A before invoking Setup Flow. Collect remaining fields via AskUserQuestion — 2-4 options per question, headers max 12 chars:

1. **Surface area** — options: Brand, Retailer, Creative, Other
2. **Owner full name** — free text input
3. **GitHub username** — free text input
4. **Brief description** — one sentence: what problem does this prototype explore?

After collecting answers: check `src/config/contributors.ts` — if owner's GitHub username is not listed, add their entry. Pass all values to `@references/session-init.md` (invoked in Path A step 5).

---

## STATUS.md Lifecycle

/play owns the STATUS.md lifecycle. All reads and writes follow the blueprint contract (`@shared/references/blueprint-contract.md`):

- **New session (Path A):** STATUS.md created by session-init scaffold with all template fields populated.
- **Continue (Path B):** STATUS.md `last_activity` updated to today's date via Edit tool after branch switch.
- **Session end (/play off):** Session entry prepended to `sessions:` array, `last_activity` updated. Max 10 entries.
- **Cleanup:** STATUS.md read for branch display metadata; deleted with branch on cleanup confirmation.
- **Resume:** STATUS.md read for dashboard display; `last_activity` updated on activation.

---

## Constraints

- This file must stay under 150 lines
- /play does NOT dispatch /think or /design — it only suggests them after session activation
- After session activation, user's next message is handled by the ambient core skill for routing and dispatch
- No MCP calls, no agent dispatches — only @references/ file dispatches
- All blueprint writes use Edit tool (never Write), per blueprint contract
