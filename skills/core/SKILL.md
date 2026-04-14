---
name: design-toolkit
description: Design discussion and prototype building for the Faire Prototype Playground. Use when the user says "/play", "build a prototype", "design discussion", or any design prototyping request for a frontend UI.
---

# Design Toolkit

**Gate (runs before everything else):**
1. If the user's message contains `/play` as a standalone word or at message start — respond: "Session management is handled by /play directly. Just type /play." Exit. (Do not process /play in core — plugin.json routes /play to skills/play/SKILL.md)
2. If `/tmp/dt-declined.json` exists — session was declined this session. Exit silently.
3. Otherwise this is a description-match activation. Show AskUserQuestion — header: "Design Toolkit", question: "Want Design Toolkit's help with this?", options: ["Yes, activate", "Not right now", "No, don't ask again this session"]. "Yes" → tell user "Run /play to start a session." Exit. "Not right now" → exit silently. "No, don't ask again this session" → write `/tmp/dt-declined.json` `{"declined": true}`, exit silently.

**Activation state check:**
When the Design Toolkit is active (`/tmp/dt-active.json` exists), this skill handles design-related messages via intent classification below. The core skill does NOT write dt-active.json — /play writes it on session start.

**Skill exclusivity:** When Design Toolkit is active, do NOT invoke `superpowers:brainstorming` or any external brainstorming/creative-exploration skills. The /think skill handles all design exploration, variant ideation, and creative discussion. Invoking external brainstorming skills alongside Design Toolkit creates conflicting workflows.

---

## Routing

**Tier 0 passthrough (active session only):** If Design Toolkit is already active and the message is pure coding/git/config with no design intent — stay silent. Defer to default Claude.

---

## Library First Rule

**Before any codebase exploration** (grep, file reads, directory scans), check the library books for the answer.

- **Scaffolding questions** (route registration, file location, how to create a new prototype file): read `playground-conventions` → `scaffolding` chapter first.
- **Dev server and build commands** (how to start the dev server, run type checks, verify the build): read `playground-conventions` → `dev-workflow` chapter first.
- **Project structure questions** (where files live, directory layout): read `playground-conventions` → `project-structure` chapter first.

If the answer is in the conventions book, use it — do not explore the codebase. Only fall back to codebase exploration when the library book does not cover the specific question.

---

## Intent Classification

**Check explicit shortcuts first:**
- `/think` → Respond: "Design thinking is handled by /think directly. Just type /think." Exit. (Do not process /think in core — plugin.json routes /think to skills/think/SKILL.md)
- `/design` → Respond: "Building is handled by /design directly. Just type /design." Exit. (Do not process /design in core — plugin.json routes /design to skills/design/SKILL.md)
- `/think:discuss` or `/design:loupe` (colon variants) → these are legacy colon-variant skills handled by Claude Code; the standalone /think and /design skills are the canonical entry points
- `/play help` → Handled by /play skill directly. Respond: "Use /play for session management."
- `/save` → Dispatch `@skills/save-blueprint.md` with `blueprintPath` (resolved via Blueprint Discovery if session is active, or let save-blueprint handle detection if not)
- `/play resume` or `/play:resume` → Handled by /play skill directly. Respond: "Use /play resume to restore your session."
- "switch prototype / work on something else / open {name}" → Suggest: "Run /play to switch prototypes." Exit.

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
- Bare or ambiguous invocation with no signal → Tier 1 (think). Starting a conversation gathers context either way.
- Figma URL + clear scope + populated blueprint → Tier 2 (build)
- Experience name reference ("build from [name]", "clone [name]") + populated blueprint → Tier 2 (build). Set mode='prod-clone'.
- **Never answer design questions inline.** If a message is design-related (feedback, improvements, exploration, critique, "what if" questions), it MUST route to Tier 1 (think) or Tier 3 (ask) — never handle it with an inline response. Inline responses are only for Help and non-design passthrough. When in doubt, dispatch /think.

**Session calibration (within-session only):**
Maintain a mental count of how many times the user has chosen "just build." If they have chosen it more than once this session, shift Tier 3 cases toward Tier 2. Cross-session preference learning is deferred to a future release.

**PDP stage note:** Discuss naturally covers Understand and Explore stages. Build covers Build. No explicit PDP routing is needed — the tier model maps to PDP stages directly.

---

## Routing

**Tier 1 (think):**
Dispatch `@skills/think/SKILL.md` with:
- `blueprintPath`: resolved blueprint/ path
- `figmaUrl`: if detected in user's message (optional)

**Tier 2 (build):**
If `blueprint/CONTEXT.md` is template-only (first Tier 2 invocation with no prior discuss), write a minimal CONTEXT.md inline with the user's problem statement before dispatching.
Before dispatching /design: if STATUS.md `drafts:` is non-empty AND `/tmp/dt-active.json` does not contain `"pendingWarningShown": true`:
  AskUserQuestion — header: "Pending Changes", question: "[M] pending amendment(s) won't be included in the build.", options: ["Commit and build", "Build without pending"]
  - "Commit and build": replace all `[PENDING]` with `[COMMITTED]` in blueprint files, clear STATUS.md `drafts: []`, then dispatch /design.
  - "Build without pending": add `"pendingWarningShown": true` to /tmp/dt-active.json (Edit tool), then dispatch /design as-is.
Dispatch `@skills/design/SKILL.md` with:
- `blueprintPath`, `sections`, `hasFullFrame`, `fullFrameUrl`, `crossSectionFlows`
- `mode`: 'figma' (Figma URL detected) | 'prod-clone' (experience reference detected) | null (let design resolve)
- `experienceName`: extracted from message if mode='prod-clone', otherwise null

**Tier 3 (ask):**
Use AskUserQuestion:
- header: "Approach"
- question: "Are you looking to think through the design, or should I just start building?"
- options: ["Think it through first", "Just start building"]

Route based on user's selection: Tier 1 or Tier 2 accordingly.

**Help:**
Inline conversational response — no dispatch. Example: "I can help you think through a design and build it as a prototype. Share a Figma frame, describe what you want, or both. Use /think to start a design conversation, or /design to go straight to building." Keep to 3–4 lines. No structured feature list.

---

## Discuss → Build Chain

After `@skills/think/SKILL.md` returns, read the return status JSON:

Handle each status as an **explicit case** — no fallthrough:

- **`ready_for_build`:** Say "Building now." Dispatch `@skills/design/SKILL.md` with `blueprintPath`, `sections[]`, `hasFullFrame`, `fullFrameUrl`, `crossSectionFlows` from the return status.
- **`ready_for_hybrid_build`:** Say "I'll pull [surfaceName] as the base and build your additions on top." Dispatch `@skills/design/SKILL.md` with `blueprintPath`, `mode: 'prod-clone'`, `surfaceName`, `sections[]` from the return status, `hasFullFrame: false`, `fullFrameUrl: null`, `crossSectionFlows: null`.
- **`discussion_only`:** Say "Decisions saved. When ready to build, say /design." Exit.
- **`cancelled`:** Acknowledge gracefully. Exit.

**Note:** When /think is dispatched by save-blueprint, it returns to save-blueprint — not this chain.

**Error handling:** Silent retry once on first failure. On second failure: non-technical explanation with actionable suggestion.

---

## Red Flags

| If you're thinking... | Stop. The real issue is... |
|---|---|
| "This is a simple design request, I'll just answer it inline" | If Design Toolkit is active, design questions go through /think — even simple ones. Answering inline bypasses blueprint persistence and the discuss→build contract. |
| "The user clearly wants to build, I'll skip to Tier 2" | Check the classification table. Multiple unknowns or template-only CONTEXT.md = Tier 1 regardless of how eager the user sounds. Only Tier 2 when CONTEXT.md is populated AND scope is clear AND bounded. |
| "I'll just write a quick CONTEXT.md and dispatch /design" | The minimal CONTEXT.md path exists only for explicit Tier 2 with no prior /think and clear scope. If there are open design questions, route to /think — a thin CONTEXT.md with gaps produces a bad build. |
| "This isn't really a design question" | If Design Toolkit is active and the user is on a `dt/*` branch with a `blueprint/` directory, it's a design context. Route to /think or Tier 0 passthrough as appropriate. |
| "I'll handle this brainstorming/exploration myself" | Skill exclusivity: the /think skill handles all design exploration. Do not invoke superpowers:brainstorming or do ad-hoc exploration inline. |
| "The pending amendments don't matter for this build" | Check STATUS.md `drafts:`. If non-empty, show the pending warning before dispatching /design. The user must explicitly choose "build without pending." |

---

## Constraints

- This file must stay under 165 lines
- No file reads, MCP calls, or agent dispatch sequences in this file
- Skills (/play, /think, /design, /save) contain all execution logic — agents are dispatched by skills, never by core SKILL.md
- Session management (fork, continue, cleanup, resume, /play off) is handled by /play — do not duplicate here
