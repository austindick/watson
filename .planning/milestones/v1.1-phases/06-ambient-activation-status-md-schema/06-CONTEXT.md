# Phase 6: Ambient Activation + STATUS.md Schema - Context

**Gathered:** 2026-04-01, revised 2026-04-01
**Status:** Ready for planning (06-02 rewrite)

<domain>
## Phase Boundary

Watson activates automatically in prototype directories without requiring /watson, and every prototype gets a per-prototype state file (blueprint/STATUS.md) that downstream phases read and write. This phase adds the activation mechanism, blueprint gate, returning-user context summary, and STATUS.md schema. It does NOT implement draft/commit (Phase 7), session/branch management (Phase 8), or interaction agent (Phase 9).

**Activation model pivot:** The original `paths:` frontmatter approach and `.claude/rules/` suggestive approach both failed. Phase 6 now delivers a **session-level toggle model** — Watson is explicitly ON or OFF per session, with a rules-based prompt to suggest activation.

</domain>

<decisions>
## Implementation Decisions

### Session toggle model (replaces per-message ambient detection)
- Watson is either ON or OFF for the entire Claude Code session — no per-message inference
- ON = Watson handles all design-related messages; Tier 0 passthrough still catches non-design work
- OFF = Watson is completely silent; default Claude handles everything
- Session-wide scope: turning Watson ON applies to all prototypes in the session, not just one
- Switching prototypes mid-session: Watson auto-routes via blueprint gate (no re-activation needed)

### Turning Watson ON
- **Primary:** `/watson` explicit invocation — SKILL.md loads, writes state file, shows welcome message
- **Ambient:** `~/.claude/rules/watson-ambient.md` with `paths: ["src/pages/**"]` detects Playground context and suggests: "You're in the Prototype Playground. Use /watson to activate Watson." Rule does NOT auto-activate — it invites the user to invoke `/watson`
- Both paths lead to the same SKILL.md load → state file write → welcome message flow

### Turning Watson OFF
- `/watson off` argument to the skill — SKILL.md deletes state file, acknowledges deactivation
- No separate subskill needed — handled inline in SKILL.md

### State file persistence
- `/tmp/watson-active.json` written by SKILL.md on activation, deleted on `/watson off`
- State file is for status line and `/clear` recovery only — SKILL.md never reads it (if SKILL.md loaded, Watson is ON by definition)
- SessionEnd hook deletes state file on session exit (prevents stale state across sessions)

### Status line indicator
- Combined status line script showing Watson state AND share-proto tunnel state (when active)
- Shows "Watson: ON" when state file exists, nothing when it doesn't
- Persists across `/clear` (configured in settings.json, not conversation context)
- No performance impact — runs after assistant response, reads tiny file from /tmp

### /clear recovery
- SessionStart hook with `"clear"` matcher reads state file after /clear
- If Watson was active, injects context suggesting user re-run `/watson`
- Status line still shows Watson: ON (state file survived /clear) as visual reminder

### SKILL.md changes (Routing section)
- Rename "Activation" section → "Routing" section — assumes Watson is already ON
- Blueprint gate stays but role shifts: no longer ON/OFF gate, now routing-only (no blueprint = tell user to set up, blueprint = check STATUS.md for new vs returning)
- Tier 0 passthrough unchanged — silent on pure coding/git/config messages
- Drop `🕵️ Watson ►` voice prefix — status line replaces it as the persistent Watson signal
- Add brief, functional welcome message on activation: confirms state, shows prototype context awareness, invites action (2-3 lines)
- SKILL.md writes state file on load, deletes on `/watson off` — inline bash, no new files
- Opening description updated to session toggle framing

### Blueprint gate (unchanged role, new framing)
- Watson only engages with prototypes that have `blueprint/` directory
- No blueprint = Watson stays silent even when ON — explicit `/watson` still required to scaffold new prototypes (intentional friction preserved)
- Blueprint existence checked before STATUS.md parsing or intent classification

### Intent passthrough (Tier 0) — unchanged
- "Tier 0 — Not prototype work" stays in intent classification table
- Signals: pure coding/git/config with no prototype design intent
- Watson stays silent (same behavior as before toggle model)

### STATUS.md schema — unchanged from 06-01
- Location: `blueprint/STATUS.md`, scaffolded by watson-init
- Format: YAML frontmatter (machine-parseable) + markdown body (human-readable)
- Three content sections: identity, build state, session info
- Schema-ready stubs for Phase 7 (drafts) and Phase 8 (sessions)
- No toggle-related fields added — STATUS.md is per-prototype state, not session state

### New vs. returning detection — unchanged
- STATUS.md exists = returning prototype → context summary + choices
- No STATUS.md = new prototype → check for explicit /watson, then setup flow or silence
- Returning-user summary: 2-3 lines (prototype name, sections built, suggested next step)
- After summary, present choices: "Continue building / Discuss changes / Start fresh"

### AMBI-01 requirement revision
- Current: "Watson activates automatically when user is in a prototype directory without requiring /watson prefix"
- Revised: "Watson offers to activate at session start when the user is in a Prototype Playground context, without requiring the user to know about /watson"
- Intent preserved (user doesn't need to know /watson), mechanism changed (prompt, not auto-detection)

### Artifact scope
- All Phase 6 artifacts in `~/.claude/` (global/personal scope) — nothing in Faire frontend repo
- Porting to Faire repo happens later when Watson becomes a distributed plugin
- Deliverables: SKILL.md updates, `~/.claude/rules/watson-ambient.md`, status line script, settings.json hook configs, state file protocol

### Plan structure
- 06-01: DONE — STATUS.md schema + watson-init + original Activation section
- 06-02: REWRITE — Session toggle model (state file, status line, rule, SKILL.md Routing rename, /watson off, SessionStart/SessionEnd hooks, AMBI-01 revision, roadmap success criteria update)
- Roadmap success criteria also updated to reflect toggle model

### Claude's Discretion
- Exact status line script implementation (must combine with existing share-proto status line)
- Exact state file JSON structure (minimal — just needs an `active` flag and timestamp)
- Exact welcome message wording (brief + functional, 2-3 lines)
- Exact wording of the rules prompt suggestion
- SessionStart/SessionEnd hook script implementations
- How `/watson off` parsing works within SKILL.md
- Exact revised AMBI-01 wording in REQUIREMENTS.md

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `~/.claude/skills/watson/SKILL.md`: Current ~160-line orchestrator with Activation section (lines 13-33) that becomes Routing section
- `~/.claude/skills/watson/utilities/watson-init.md`: Blueprint scaffolding utility — already updated in 06-01 to create STATUS.md
- `.planning/artifact-schemas/STATUS-EXAMPLE.md`: Canonical STATUS.md schema reference — delivered in 06-01
- Existing `share-proto-statusline.js`: Status line script pattern to extend for Watson state (reads state files from /tmp, conditional display)

### Established Patterns
- SKILL.md three-tier intent classification (Tier 1 discuss, Tier 2 build, Tier 3 ask) + Tier 0 passthrough
- YAML frontmatter for machine parsing + markdown body for human reading (STATUS.md, STATE.md, library books)
- `/tmp/share-proto.json` state file pattern for status line integration — Watson follows same convention
- settings.json hook configuration for SessionStart/SessionEnd events

### Integration Points
- `~/.claude/settings.json`: Gains SessionStart (clear matcher) and SessionEnd hook entries; status line script updated
- `~/.claude/rules/watson-ambient.md`: New rule file with `paths: ["src/pages/**"]` suggesting Watson activation
- SKILL.md: Activation → Routing rename, state file write/delete, /watson off handling, welcome message, drop voice prefix
- REQUIREMENTS.md: AMBI-01 wording revision
- ROADMAP.md: Phase 6 success criteria revision

</code_context>

<specifics>
## Specific Ideas

- Status line as the persistent Watson signal replaces the per-message `🕵️ Watson ►` prefix — cleaner, always visible, doesn't clutter responses
- The rules prompt suggests `/watson` but doesn't auto-activate — user consent preserved while reducing friction
- State file lifecycle is clean: created on /watson, deleted on /watson off or session end, read by status line and /clear hook — no stale state possible
- SessionEnd hook cleanup prevents misleading "Watson: ON" status in future sessions
- "All artifacts in ~/.claude/" constraint simplifies Phase 6 scope — no cross-repo concerns

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-ambient-activation-status-md-schema*
*Context gathered: 2026-04-01, revised 2026-04-01*
