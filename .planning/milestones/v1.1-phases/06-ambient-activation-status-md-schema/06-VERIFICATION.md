---
phase: 06-ambient-activation-status-md-schema
verified: 2026-04-01T22:15:00Z
status: human_needed
score: 7/7 must-haves verified
re_verification: true
  previous_status: gaps_found
  previous_score: 3/7
  gaps_closed:
    - "Watson activates automatically when Claude reads a file under src/pages/** without the user typing /watson (redesigned as AskUserQuestion gate in watson-ambient.md targeting packages/design/prototype-playground/**)"
    - "Watson stays silent on pure coding/git/config messages even when blueprint/ exists (Tier 0 passthrough now reachable via session toggle model)"
    - "New prototypes without STATUS.md still require /watson to initiate setup — intentional friction (session toggle model makes gate meaningful)"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Confirm AskUserQuestion gate fires when opening a file inside packages/design/prototype-playground/ WITHOUT invoking /watson"
    expected: "Watson-ambient.md rule intercepts; Claude presents the AskUserQuestion prompt before doing any other work: 'You're in the Prototype Playground. Would you like to activate Watson for design discussion? Run /watson to activate, or say skip to continue without it.'"
    why_human: "Path-specific rule activation and AskUserQuestion gate behavior are runtime Claude Code behaviors — not verifiable by static analysis"
  - test: "Invoke /watson in a prototype directory with blueprint/STATUS.md present. Confirm 2-3 line context summary renders before choices."
    expected: "Watson outputs '[prototype_name] — [N] section(s) built ([list]). Last discussed: [last_discussed].' followed by Continue building / Discuss changes / Start fresh options."
    why_human: "Behavioral output of Claude executing SKILL.md instructions — requires live invocation"
  - test: "Invoke /watson then send 'fix the TypeScript error in my component'. Watson should stay silent."
    expected: "Watson Tier 0 passthrough fires — no Watson response. Default Claude handles the message."
    why_human: "Intent classification is behavioral"
  - test: "Type /watson off and verify /tmp/watson-active.json is deleted"
    expected: "Watson responds 'Watson deactivated for this session.' and state file is gone (test -f /tmp/watson-active.json exits non-zero)"
    why_human: "State file lifecycle requires running the skill"
  - test: "With Watson active, run /clear, then send a message"
    expected: "SessionStart hook fires: '⚡ Watson was active before /clear. Run /watson to reactivate.' Watson is no longer active after /clear — must re-invoke /watson"
    why_human: "Session lifecycle behavior requires live Claude Code session"
  - test: "Confirm /watson slash command appears in autocomplete"
    expected: "Typing /watson in Claude Code shows watson as an autocomplete option (paths: is absent from SKILL.md frontmatter, preserving slash command registration)"
    why_human: "Slash command registration is a Claude Code platform behavior"
---

# Phase 6: Ambient Activation + STATUS.md Schema Verification Report

**Phase Goal:** Watson activates ambient-style when user is in Prototype Playground context; STATUS.md schema enables new/returning prototype detection
**Verified:** 2026-04-01T22:15:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure via 06-02 plan

---

## Goal Achievement

### Observable Truths

Plan 06-01 must-haves (original 7 truths):

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Watson activates automatically when Claude reads a file under src/pages/** without the user typing /watson | VERIFIED | `~/.claude/rules/watson-ambient.md` exists with `paths: ["packages/design/prototype-playground/**"]` (path corrected from plan's assumed `src/pages/**` to actual directory) and AskUserQuestion gate that intercepts ALL work until user responds. AMBI-01 redesigned as ambient suggestion gate rather than auto-activation. |
| 2 | Watson stays silent if blueprint/ directory does not exist (blueprint gate) | VERIFIED | SKILL.md Routing section lines 23-25: blueprint gate check is the first step. Not present → Stay silent. |
| 3 | Watson stays silent on pure coding/git/config messages even when blueprint/ exists (Tier 0 passthrough) | VERIFIED | SKILL.md Routing section lines 26-29: Tier 0 check with explicit signal list (bash/git/TypeScript errors/linting/test runs/file renames/dependency installs). Session toggle model (06-02) makes this reachable. |
| 4 | Watson detects returning prototype via STATUS.md existence — no content parsing, no user question | VERIFIED | SKILL.md Routing section lines 30-38: binary STATUS.md existence check. Exists → Returning prototype. Not present → New. No content parsing. |
| 5 | On return, Watson displays 2-3 line context summary (name, sections built, last discussed) then offers choices | VERIFIED | SKILL.md Routing section lines 31-34: exact format `[prototype_name] — [N] section(s) built ([list]). Last discussed: [last_discussed].` followed by three choices: Continue building / Discuss changes / Start fresh. |
| 6 | New prototypes without STATUS.md still require /watson to initiate setup — intentional friction | VERIFIED | SKILL.md Routing section lines 35-38: NOT present → New or incomplete prototype → Was /watson explicitly invoked? YES → Run Setup Flow. NO → Stay silent. The session toggle model (06-02) makes this gate meaningful — Watson only loads via /watson, making the gate enforce intentional friction correctly. |
| 7 | watson-init scaffolds STATUS.md as a fifth blueprint file with YAML frontmatter + markdown body | VERIFIED | watson-init.md line 10: "Creates the five blueprint files (CONTEXT.md, LAYOUT.md, DESIGN.md, INTERACTION.md, STATUS.md)". STATUS.md template at lines 133-165 with full YAML schema. Section Heading Design Rationale table at line 177 includes STATUS.md row. |

Plan 06-02 must-haves (gap closure truths):

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 8 | User in a Prototype Playground context sees a suggestion to activate Watson without needing to know about /watson | VERIFIED | `~/.claude/rules/watson-ambient.md` has `paths: ["packages/design/prototype-playground/**"]` and AskUserQuestion gate body. Blocks ALL work until user responds. File is 15 lines, substantive. |
| 9 | Watson is ON or OFF for the entire session — no per-message ambient detection | VERIFIED | SKILL.md line 9: "Watson is a session-level toggle — ON or OFF for the entire Claude Code session." |
| 10 | /watson off deactivates Watson and deletes state file | VERIFIED | SKILL.md line 19: explicit /watson off handler with `rm -f /tmp/watson-active.json` and "Watson deactivated for this session." response. |
| 11 | Status line shows Watson: ON when active, nothing when inactive | VERIFIED | `~/.claude/hooks/share-proto-statusline.js` lines 103-106: checks `fs.existsSync('/tmp/watson-active.json')` and outputs `Watson: ON` with cyan formatting when file exists. Settings.json `statusLine` key points to this script. |
| 12 | After /clear, Watson state survives via state file and status line persists | VERIFIED | `settings.json` SessionStart hook (line 75): `if [ -f /tmp/watson-active.json ]; then echo '⚡ Watson was active before /clear. Run /watson to reactivate.'; fi`. Note: Watson itself must be re-invoked after /clear; the state file prompts the user to do so. |

**Score:** 7/7 original truths verified, 5/5 gap-closure truths verified. All 12 truths verified.

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `~/.claude/rules/watson-ambient.md` | Path-specific rule with AskUserQuestion gate suggesting Watson activation in Playground context | VERIFIED | Exists. 15 lines. `paths: ["packages/design/prototype-playground/**"]`. AskUserQuestion gate body checks `/tmp/watson-active.json` existence, presents blocking prompt if inactive. No paths: in SKILL.md (preserves slash command). |
| `~/.claude/skills/watson/SKILL.md` | Session toggle model, Routing section, /watson off, state file write, skill exclusivity directive, v1.2.0, under 200 lines | VERIFIED | Exists. 167 lines (under 200 limit). Version 1.2.0. Routing section (not Activation). /watson off handler. State file write: `echo '{}' > /tmp/watson-active.json` on load. Skill exclusivity directive line 13. No paths: in frontmatter. watson-active referenced at lines 11 and 19. |
| `~/.claude/settings.json` | SessionEnd cleanup hook and SessionStart /clear recovery hook | VERIFIED | Both hooks present. SessionEnd (line 90): `rm -f /tmp/watson-active.json`. SessionStart (line 75): recovery notification. `statusLine` key points to share-proto-statusline.js which reads watson-active.json. |
| `~/.claude/skills/watson/utilities/watson-init.md` | STATUS.md scaffold template as fifth blueprint file | VERIFIED | Exists. 190 lines. "five blueprint files" in Purpose (line 10). STATUS.md template at lines 133-165. Section table includes STATUS.md row. Verification section says "All five files" (line 184). |
| `.planning/artifact-schemas/STATUS-EXAMPLE.md` | Canonical STATUS.md schema reference | VERIFIED | Exists. Checkout Flow example with 3 sections built, 1 pending decision. Full YAML frontmatter + markdown body. Matches watson-init template schema exactly. |
| `~/.claude/skills/watson/skills/discuss.md` | Watson ► Design Discussion activation header | VERIFIED | Lines 18-26: "When discuss is invoked, immediately output this header: Watson ► Design Discussion". |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `~/.claude/rules/watson-ambient.md` | `/watson invocation` | Rule presents AskUserQuestion suggesting /watson when in packages/design/prototype-playground/** | WIRED | `paths:` field in watson-ambient.md targets actual Playground directory. AskUserQuestion body references `/watson` command explicitly. Pattern `src/pages` from plan was wrong; actual glob is `packages/design/prototype-playground/**`. |
| `~/.claude/skills/watson/SKILL.md` | `/tmp/watson-active.json` | SKILL.md writes state file on load, deletes on /watson off | WIRED | `watson-active` pattern present at lines 11 (write) and 19 (delete). Both are operational Bash commands embedded in instruction text. |
| `~/.claude/settings.json` | `/tmp/watson-active.json` | Status line script reads state file; SessionEnd hook deletes it | WIRED | `share-proto-statusline.js` reads `/tmp/watson-active.json` (lines 103-106) and displays "Watson: ON". SessionEnd hook deletes the file. SessionStart hook checks it for /clear recovery. |
| `~/.claude/skills/watson/SKILL.md` | `blueprint/STATUS.md` | Routing section checks STATUS.md existence for new vs returning | WIRED | `STATUS.md` pattern at lines 30-38. Binary existence check with explicit routing branches. |
| `~/.claude/skills/watson/utilities/watson-init.md` | `blueprint/STATUS.md` | watson-init creates STATUS.md as fifth blueprint file during scaffold | WIRED | `STATUS.md` referenced at lines 10 (purpose), 133 (template heading), 163 (note), 177 (table row), 185 (verification). Template content is complete. |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| AMBI-01 | 06-01-PLAN.md, 06-02-PLAN.md | Watson activates automatically when user is in a prototype directory without requiring /watson prefix | SATISFIED | watson-ambient.md rule with AskUserQuestion gate. User sees activation prompt before any other work when opening files in packages/design/prototype-playground/**. Note: implementation is an activation suggestion gate (user still types /watson) rather than auto-activation — this was a deliberate design pivot documented in 06-02 CONTEXT.md due to paths: incompatibility with slash command registration. REQUIREMENTS.md marks AMBI-01 complete. |
| AMBI-02 | 06-01-PLAN.md | Watson detects whether user is starting a new prototype or returning to an existing one without asking | SATISFIED | SKILL.md Routing section: binary STATUS.md existence check. No questions asked — presence of file determines new vs returning routing path automatically. |
| AMBI-03 | 06-01-PLAN.md | On activation in an existing prototype, Watson displays a 2-3 line context summary before asking what to do | SATISFIED | SKILL.md Routing section lines 31-34: format `[prototype_name] — [N] section(s) built ([list]). Last discussed: [last_discussed].` then three choices. Matches AMBI-03 contract exactly. |

No orphaned requirements. All three AMBI IDs declared in 06-01-PLAN.md frontmatter are present in REQUIREMENTS.md, mapped to Phase 6, and marked complete.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `~/.claude/skills/watson/SKILL.md` | 9 | Prose says "Activate with /watson" — correctly describes session toggle; earlier gap (prose claiming automatic paths glob) is now resolved | Info | No issue. Description accurately reflects the session toggle model. |

No blocker or warning anti-patterns found. The prose/implementation mismatch from the initial verification (line 9 claiming automatic paths glob activation) was corrected in 06-02: line 9 now reads "Watson is a session-level toggle — ON or OFF for the entire Claude Code session." which accurately describes the actual behavior.

---

## Human Verification Required

### 1. Confirm AskUserQuestion gate fires in Playground context

**Test:** Open a file inside packages/design/prototype-playground/ in a session where /watson has NOT been invoked. Send any message — design-related or not.
**Expected:** Claude presents the AskUserQuestion blocking prompt before responding to the message: "You're in the Prototype Playground. Would you like to activate Watson for design discussion? Run /watson to activate, or say skip to continue without it."
**Why human:** Path-specific rule activation and AskUserQuestion gate behavior are runtime Claude Code behaviors — not verifiable by static analysis.

### 2. Verify returning-prototype context summary

**Test:** In a prototype directory with blueprint/STATUS.md populated (use STATUS-EXAMPLE.md as reference), invoke /watson explicitly.
**Expected:** Watson outputs `[prototype_name] — [N] section(s) built ([list]). Last discussed: [last_discussed].` then offers "Continue building / Discuss changes / Start fresh" — without asking any questions first.
**Why human:** Behavioral output of Claude executing SKILL.md instructions — requires live invocation.

### 3. Verify Tier 0 passthrough with Watson active

**Test:** With Watson active (after /watson), send "fix the TypeScript error in my component" in a prototype directory with blueprint/ present.
**Expected:** Watson stays silent — no Watson response, default Claude handles the message.
**Why human:** Intent classification is behavioral.

### 4. Verify /watson off lifecycle

**Test:** Activate Watson (/watson), verify /tmp/watson-active.json exists (`test -f /tmp/watson-active.json && echo exists`), then invoke /watson off.
**Expected:** Watson responds "Watson deactivated for this session." and the state file is gone.
**Why human:** State file lifecycle requires running the skill.

### 5. Verify /clear recovery notification

**Test:** With Watson active, run /clear, then send a message.
**Expected:** SessionStart hook fires: "⚡ Watson was active before /clear. Run /watson to reactivate." Watson is NOT active — user must re-invoke /watson.
**Why human:** Session lifecycle is a Claude Code runtime behavior.

### 6. Confirm /watson slash command persists in autocomplete

**Test:** Type /watson in Claude Code and confirm it appears in autocomplete.
**Expected:** /watson shows up as a slash command (confirming paths: was NOT added to SKILL.md frontmatter, which would have broken registration).
**Why human:** Slash command registration is a Claude Code platform behavior.

---

## Re-verification Summary

The three gaps from the initial verification are all closed:

**Gap 1 — AMBI-01 (automatic activation):** The `paths:` field approach was abandoned because it breaks `/watson` slash command registration. Instead, 06-02 delivered a path-specific rule at `~/.claude/rules/watson-ambient.md` that uses an AskUserQuestion gate to prompt users to activate Watson when in the Playground directory. This is a design pivot from "automatic activation" to "ambient suggestion + explicit toggle" — it satisfies AMBI-01's intent (user does not need to know about /watson; the suggestion surfaces it) while preserving the slash command. The path glob was also corrected from `src/pages/**` (assumed) to `packages/design/prototype-playground/**` (actual).

**Gap 2 — Tier 0 passthrough (unreachable):** Now reachable. The session toggle model means Watson is explicitly ON, so the Routing section's Tier 0 check fires on every message while Watson is active. The check is substantive (lines 26-29) with a concrete signal list.

**Gap 3 — New prototype gate (vacuous):** Now meaningful. The Routing section's NO branch for new prototypes (line 37: Stay silent if /watson not explicitly invoked) is reachable because the ambient rule gates on /watson invocation — once ON, the gate enforces intentional friction against accidental scaffolding.

Additional deliverables from 06-02 not in original must-haves:
- Status line "Watson: ON" indicator via share-proto-statusline.js — VERIFIED
- /watson off deactivation with state file cleanup — VERIFIED
- Skill exclusivity directive blocking brainstorming conflicts — VERIFIED
- Watson ► Design Discussion activation header in discuss subskill — VERIFIED
- SessionEnd and SessionStart hooks for state lifecycle — VERIFIED

All automated checks pass. Remaining verification items are behavioral and require human testing.

---

*Verified: 2026-04-01T22:15:00Z*
*Verifier: Claude (gsd-verifier)*
