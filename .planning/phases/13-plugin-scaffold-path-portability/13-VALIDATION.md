---
phase: 13
slug: plugin-scaffold-path-portability
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual validation via Claude Code CLI (no automated test suite — plugin system is CLI-invocation-based) |
| **Config file** | none |
| **Quick run command** | `claude plugin validate` from `~/watson/` |
| **Full suite command** | `claude --plugin-dir ~/watson` then invoke `/watson:watson` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `claude plugin validate` from `~/watson/`
- **After every plan wave:** Run full invocation: `claude --plugin-dir ~/watson/` + `/watson:watson`
- **Before `/gsd:verify-work`:** All 5 success criteria must pass
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | PLUG-01 | smoke | `claude plugin validate` | ❌ W0 | ⬜ pending |
| 13-01-02 | 01 | 1 | PLUG-03 | smoke | `claude plugin validate` + `ls skills/watson/` | ❌ W0 | ⬜ pending |
| 13-01-03 | 01 | 1 | PLUG-05 | integration | `claude --plugin-dir ~/watson/` → `/watson:watson` | Depends on PLUG-01 | ⬜ pending |
| 13-02-01 | 02 | 2 | PLUG-02 | automated-grep | `grep -r "~/.claude" ~/watson/skills/ \| wc -l` (expect 0) | N/A | ⬜ pending |
| 13-02-02 | 02 | 2 | PLUG-04 | integration | Invoke `/watson:watson` → trigger build → verify no "file not found" | Depends on PLUG-02 | ⬜ pending |
| 13-02-03 | 02 | 2 | PLUG-02 | automated-grep | `grep -r "~/.claude" ~/watson/skills/ \| wc -l` (final check, expect 0) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `~/watson/.claude-plugin/plugin.json` — covers PLUG-01, PLUG-03, PLUG-05
- [ ] `~/watson/skills/watson/` directory tree — covers PLUG-03 (copy from `~/.claude/skills/watson/`)

*Plugin validation is CLI-invocation-based; no traditional test files needed beyond the plugin structure itself.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/watson:watson` slash command works | PLUG-05 | Requires interactive Claude Code session | 1. `claude --plugin-dir ~/watson/` 2. Type `/watson:watson` 3. Verify Watson activates |
| Library books accessible to agents | PLUG-04 | Requires agent pipeline execution | 1. Activate Watson via `/watson:watson` 2. Trigger Tier 2 build 3. Verify no "file not found" errors |
| @-reference dispatch works | PLUG-02 | Unverified in plugin context | 1. Invoke `/watson:watson` 2. Test discuss/loupe dispatch 3. If broken, rewrite @-refs with `${CLAUDE_PLUGIN_ROOT}` prefix |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
