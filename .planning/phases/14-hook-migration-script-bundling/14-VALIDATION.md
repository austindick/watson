---
phase: 14
slug: hook-migration-script-bundling
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — smoke tests via direct Node.js script invocation |
| **Config file** | none |
| **Quick run command** | `node /Users/austindick/watson/scripts/watson-session-start.js 2>&1` |
| **Full suite command** | All 3 smoke commands below + manual settings.json inspection |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run smoke test for the script(s) written in that task
- **After every plan wave:** Run all smoke tests + manual settings.json inspection
- **Before `/gsd:verify-work`:** All smoke tests green + fresh Claude Code session double-fire test
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 14-01-01 | 01 | 1 | HOOK-01 | smoke | `node /Users/austindick/watson/scripts/watson-session-start.js 2>&1` | ❌ W0 | ⬜ pending |
| 14-01-02 | 01 | 1 | HOOK-02 | smoke | `touch /tmp/watson-active.json && echo '{"branch":"watson/test"}' > /tmp/watson-active.json && node /Users/austindick/watson/scripts/watson-session-end.js && cat /tmp/watson-session-end.json` | ❌ W0 | ⬜ pending |
| 14-01-03 | 01 | 1 | HOOK-04 | smoke | `echo '{"model":{"display_name":"Claude"},"workspace":{"current_dir":"/tmp"},"context_window":{"remaining_percentage":80}}' \| node /Users/austindick/watson/scripts/watson-statusline.js` | ❌ W0 | ⬜ pending |
| 14-01-04 | 01 | 1 | HOOK-03 | manual-only | Inspect `~/.claude/settings.json` after migration; GSD hooks must remain | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/watson-session-start.js` — smoke test target for HOOK-01
- [ ] `scripts/watson-session-end.js` — smoke test target for HOOK-02
- [ ] `scripts/watson-statusline.js` — smoke test target for HOOK-04
- [ ] `hooks/hooks.json` — declares HOOK-01 and HOOK-02

*All gaps are the deliverables of this phase — scripts are created as plan tasks.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| settings.json cleanup removes only Watson hooks | HOOK-03 | Requires inspecting real settings.json with GSD/share-proto hooks present | 1. Run migration script 2. Open `~/.claude/settings.json` 3. Verify Watson SessionStart/SessionEnd hooks gone 4. Verify GSD SessionStart + PostToolUse hooks remain 5. Verify statusLine points to watson-statusline.js |
| SessionStart fires exactly once per session | HOOK-01 | Requires fresh Claude Code session to test double-fire | 1. Start fresh Claude Code session 2. Observe recovery notification appears at most once 3. Confirm no duplicate messages |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
