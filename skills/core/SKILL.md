---
name: watson
description: Design discussion and prototype building for the Faire Prototype Playground. Use when the user says "/watson", "build a prototype", "design discussion", or any design prototyping request for a frontend UI.
---

# Watson

**Gate (runs before everything else):**
1. If the user's message contains `/watson` as a standalone word or at message start — explicit invocation. Skip gate, proceed to activation below.
2. If `/tmp/watson-declined.json` exists — Watson was declined this session. Exit silently.
3. Otherwise this is a description-match activation. Show AskUserQuestion — header: "Watson", question: "Want Watson's help with this?", options: ["Yes, activate Watson", "Not right now", "No, don't ask again this session"]. "Yes" → proceed to activation. "Not right now" → exit silently (may ask again on future matches). "No, don't ask again this session" → write `/tmp/watson-declined.json` `{"declined": true}`, exit silently.

**Activation (after gate passes — explicit /watson or user said "Yes"):**
Watson is a session-level toggle — ON or OFF for the entire Claude Code session. Activate with /watson, deactivate with /watson off. When ON, Watson handles all design-related messages; Tier 0 passthrough (active session only) catches non-design work. When OFF, Watson is completely silent.

Write state file: `echo '{}' > /tmp/watson-active.json`

**Skill exclusivity:** When Watson is active, do NOT invoke `superpowers:brainstorming` or any external brainstorming/creative-exploration skills. Watson's discuss subskill handles all design exploration, variant ideation, and creative discussion. Invoking external brainstorming skills alongside Watson creates conflicting workflows.

---

## Routing

**If the user's message is `/watson off` or `/watson:off`:** Auto-commit, summarize, then deactivate:
0. Auto-commit: run `git status --porcelain`. If dirty, `git add -A && git commit -m "watson: checkpoint"` silently (do not mention to user).
1. Read `/tmp/watson-active.json`. If `branch` and `actions` fields exist:
   a. Discover blueprint path, read STATUS.md frontmatter
   b. Display summary: "Discussed: [actions joined or 'nothing']", "Built: [sections_built joined or 'nothing']", "Pending: [drafts length] amendment(s)"
   c. Write session entry to STATUS.md `sessions:` array: get user via `git config --get user.name`, compile actions (join with ", ", truncate at 80 chars), prepend `{timestamp, summary, who}`, drop oldest if count >= 10; if `sessions: []` compact empty, replace with block sequence format
2. Save-blueprint prompt: read CONTEXT.md. If Problem Statement contains `_Not yet defined._`:
   AskUserQuestion — header: "Save?", question: "You haven't saved any design decisions yet. Run /watson:save-blueprint before closing?", options: ["Save now", "Skip"]
   - "Save now": dispatch `@skills/save-blueprint.md` with `blueprintPath`, wait for completion
   - "Skip": continue
3. Delete `/tmp/watson-active.json` (bash: `rm -f /tmp/watson-active.json`)
4. Respond "Watson deactivated." and exit.

**Tier 0 passthrough (active session only):** If Watson is already active and the message is pure coding/git/config with no design intent — stay silent. Defer to default Claude.

**Session greeting:** Read and display the banner from `@references/watson-banner.md`. Display it once at the start of every `/watson` session, before the fork below.

**Entry point: 2-path fork**

AskUserQuestion — header: "Watson", question: "What would you like to work on?", options: ["Start a new prototype", "Continue working on an existing prototype"]

**Path A — Start a new prototype:**
1. Session recovery: if `/tmp/watson-session-end.json` exists, read `{branch, actions, timestamp}`, discover blueprint path, read STATUS.md via `git show {branch}:{blueprintPath}/STATUS.md`, compile actions into summary (join with ", ", truncate at 80 chars), prepend new session entry to STATUS.md `sessions:` array (drop oldest if count >= 10), delete `/tmp/watson-session-end.json`.
2. Ask prototype name (plain text question, not AskUserQuestion)
3. Derive slug: `name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`
4. Run Setup Flow (surface area, owner, GitHub username, description)
5. Invoke `@utilities/watson-init.md` with `prototype_name` and `slug` parameters — watson-init handles branch creation and blueprint scaffold
6. Proceed to Intent Classification

**Path B — Continue working on an existing prototype:**
1. Session recovery: if `/tmp/watson-session-end.json` exists, run session recovery first (same steps as Path A step 1) before proceeding.
2. Invoke `@utilities/watson-init.md` branch-list operation — watson-init gathers all branch data (branch list, STATUS.md reads, last commit dates) in a single batched bash script to minimize visible terminal blocks, groups into "Your prototypes" (by ownership) and expandable "Browse other prototypes", tags inactive branches (30+ days) with [INACTIVE] prefix
3. User selects branch; watson-init handles: inactive-branch options (continue / delete / reset timer), auto-commit guard, `git checkout watson/{slug}`, missing-branch recovery (try remote, else offer fresh branch or return to list), health check
4. Watson-init updates `/tmp/watson-active.json` with `"branch": "watson/{slug}"`
5. Load STATUS.md frontmatter; display: "[name] — [N] section(s) built. [M] pending amendment(s). Last session: [date] by [user] — [summary]."
6. If `drafts:` non-empty (use `blueprintPath` discovered by watson-init during branch switch):
   Scan {blueprintPath}/LAYOUT.md, DESIGN.md, INTERACTION.md for [PENDING] lines; render grouped by file.
   AskUserQuestion — header: "Pending", question: "[diff]\n\nWhat would you like to do?",
   options: ["Commit all", "Discard all", "Keep pending and continue"]
   - "Commit all": replace all [PENDING]→[COMMITTED] in blueprint files (Edit), set `drafts: []` (Edit), proceed
   - "Discard all": delete all [PENDING] lines from blueprint files (Edit), set `drafts: []` (Edit), confirm discarded, proceed
   - "Keep pending and continue": proceed to Intent Classification unchanged
7. Proceed to Intent Classification

---

## Library First Rule

**Before any codebase exploration** (grep, file reads, directory scans), check the library books for the answer.

- **Scaffolding questions** (route registration, file location, how to create a new prototype file): read `playground-conventions` → `scaffolding` chapter first.
- **Dev server and build commands** (how to start the dev server, run type checks, verify the build): read `playground-conventions` → `dev-workflow` chapter first.
- **Project structure questions** (where files live, directory layout): read `playground-conventions` → `project-structure` chapter first.

If the answer is in the conventions book, use it — do not explore the codebase. Only fall back to codebase exploration when the library book does not cover the specific question.

---

## Setup Flow (new prototypes only)

Prototype name and slug are collected in Path A before invoking Setup Flow. Collect remaining fields via AskUserQuestion discipline — 2–4 options per question, headers max 12 chars, "Other" added automatically:

1. **Surface area** — options: Brand, Retailer, Creative, Other
2. **Owner full name** — free text input
3. **GitHub username** — free text input
4. **Brief description** — one sentence: what problem does this prototype explore?

After collecting answers:
- Check `src/config/contributors.ts` — if owner's GitHub username is not listed, add their entry
- Pass all collected values to `@utilities/watson-init.md` (invoked in Path A)

---

## Intent Classification

**Check explicit shortcuts first:**
- `/watson discuss` → Tier 1 (discuss)
- `/watson loupe` → Tier 2 (build)
- `/watson help` → Help response (see Routing below)
- `/watson save-blueprint` → Dispatch `@skills/save-blueprint.md` with `blueprintPath` (resolved via Blueprint Discovery if Watson is active, or let save-blueprint handle detection if not)
- `/watson resume` or `/watson:resume` → Dispatch `@skills/resume.md` with `blueprintPath`
- "switch prototype / work on something else / open {name}" → write session entry (same sequence as `/watson off` steps 1a–1f above), then auto-commit (`watson: checkpoint`), re-enter 2-path fork. Watson stays ON throughout.

**Check for Figma URL in the message** → flag as a build signal (figmaUrl detected)

**Apply three-tier classification:**

| Signal | Tier 0 — Passthrough | Tier 1 — Discuss | Tier 2 — Build | Tier 3 — Ask |
|--------|---------------------|------------------|----------------|--------------|
| Blueprint state | Blueprint exists, non-design message | No blueprint / template-only CONTEXT.md | Populated CONTEXT.md | Mixed signals |
| Prompt complexity | Pure code/config/git task | Multiple unknowns or assumptions | Clear, specific, bounded ask | Ambiguous scope |
| Figma URL | No URL, non-design message | URL present, intent unclear | URL present, clear scope | URL present, no context |
| Session history | N/A — exits before classification | First interaction | User has said "just build" repeatedly | No prior signal |

**Tier 0 exits in the Routing section** — messages that reach Intent Classification have already passed the blueprint gate and Tier 0 check. The Tier 0 column is shown here for completeness but is handled upstream.

**Defaults:**
- Bare or ambiguous invocation with no signal → Tier 1 (discuss). Starting a conversation gathers context either way.
- Figma URL + clear scope + populated blueprint → Tier 2 (build)
- **Never answer design questions inline.** If a message is design-related (feedback, improvements, exploration, critique, "what if" questions), it MUST route to Tier 1 (discuss) or Tier 3 (ask) — never handle it with an inline response. Inline responses are only for Help and non-design passthrough. When in doubt, dispatch discuss.

**Session calibration (within-session only):**
Maintain a mental count of how many times the user has chosen "just build." If they have chosen it more than once this session, shift Tier 3 cases toward Tier 2. Cross-session preference learning is deferred to Watson 1.1+.

**PDP stage note:** Discuss naturally covers Understand and Explore stages. Loupe covers Build. No explicit PDP routing is needed — the tier model maps to PDP stages directly.

---

## Routing

**Tier 1 (discuss):**
Dispatch `@skills/discuss.md` with:
- `blueprintPath`: resolved blueprint/ path
- `figmaUrl`: if detected in user's message (optional)

**Tier 2 (build):**
If `blueprint/CONTEXT.md` is template-only (first Tier 2 invocation with no prior discuss), write a minimal CONTEXT.md inline with the user's problem statement before dispatching.
Before dispatching loupe: if STATUS.md `drafts:` is non-empty AND `/tmp/watson-active.json` does not contain `"pendingWarningShown": true`:
  AskUserQuestion — header: "Pending Changes", question: "[M] pending amendment(s) won't be included in the build.", options: ["Commit and build", "Build without pending"]
  - "Commit and build": replace all `[PENDING]` with `[COMMITTED]` in blueprint files, clear STATUS.md `drafts: []`, then dispatch loupe.
  - "Build without pending": add `"pendingWarningShown": true` to /tmp/watson-active.json (Edit tool), then dispatch loupe as-is.
Dispatch `@skills/loupe.md` with:
- `blueprintPath`: resolved blueprint/ path
- `sections`: inferred from blueprint if populated (or empty — loupe will decompose)
- `hasFullFrame`: true if fullFrameUrl is a whole-frame Figma link, false otherwise
- `fullFrameUrl`: Figma URL if detected (or null)
- `crossSectionFlows`: null (no discuss context in direct Tier 2 build)

**Tier 3 (ask):**
Use AskUserQuestion:
- header: "Approach"
- question: "Are you looking to think through the design, or should I just start building?"
- options: ["Think it through first", "Just start building"]

Route based on user's selection: Tier 1 or Tier 2 accordingly.

**Help:**
Inline conversational response — no dispatch. Example: "I can help you think through a design and build it as a prototype. Share a Figma frame, describe what you want, or both. Use /watson discuss to start a design conversation, or /watson loupe to go straight to building." Keep to 3–4 lines. No structured feature list.

---

## Discuss → Loupe Chain

After `@skills/discuss.md` returns, read the return status JSON:

```json
{
  "status": "ready_for_build" | "discussion_only" | "cancelled",
  "blueprintPath": "/path/to/prototype/blueprint/",
  "sections": [...],
  "hasFullFrame": false,
  "fullFrameUrl": null
}
```

Handle each status as an **explicit case** — no fallthrough:

- **`ready_for_build`:** Say "Great, I have what I need — building now." Dispatch `@skills/loupe.md` with `blueprintPath`, `sections[]`, `hasFullFrame`, `fullFrameUrl`, `crossSectionFlows` from the return status.
- **`discussion_only`:** Say "Decisions saved to your blueprint. When you're ready to build, just say /watson and I'll pick up where we left off." Exit.
- **`cancelled`:** Acknowledge gracefully. Exit.

**Note:** When discuss is dispatched by save-blueprint (gap discussion), it returns to save-blueprint — not this chain. Save-blueprint handles its own post-discuss flow.

**Error handling:** Silent retry once on first failure. On second failure: non-technical explanation with actionable suggestion.

---

## Red Flags

| If you're thinking... | Stop. The real issue is... |
|---|---|
| "This is a simple design request, I'll just answer it inline" | If Watson is active, design questions go through discuss — even simple ones. Answering inline bypasses blueprint persistence and the discuss→build contract. |
| "The user clearly wants to build, I'll skip to Tier 2" | Check the classification table. Multiple unknowns or template-only CONTEXT.md = Tier 1 regardless of how eager the user sounds. Only Tier 2 when CONTEXT.md is populated AND scope is clear AND bounded. |
| "I'll just write a quick CONTEXT.md and dispatch loupe" | The minimal CONTEXT.md path exists only for explicit Tier 2 with no prior discuss and clear scope. If there are open design questions, route to discuss — a thin CONTEXT.md with gaps produces a bad build. |
| "This isn't really a design question" | If Watson is active and the user is on a `watson/*` branch with a `blueprint/` directory, it's a design context. Route to discuss or Tier 0 passthrough as appropriate. |
| "I'll handle this brainstorming/exploration myself" | Skill exclusivity: Watson's discuss handles all design exploration. Do not invoke superpowers:brainstorming or do ad-hoc exploration inline. |
| "The pending amendments don't matter for this build" | Check STATUS.md `drafts:`. If non-empty, show the pending warning before dispatching loupe. The user must explicitly choose "build without pending." |

---

## Constraints

- This file must stay under 215 lines
- No file reads, MCP calls, or agent dispatch sequences in this file
- Subskills (discuss.md, loupe.md) contain all execution logic
- Agents are dispatched by subskills, never by SKILL.md
