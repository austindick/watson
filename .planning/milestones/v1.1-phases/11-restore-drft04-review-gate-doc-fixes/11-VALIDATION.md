---
phase: 11
slug: restore-drft04-review-gate-doc-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — Watson is a Claude Code skill (behavioral, not testable binary) |
| **Config file** | none |
| **Quick run command** | `wc -l ~/.claude/skills/watson/SKILL.md && grep "dispatch:" ~/.claude/skills/watson/agents/interaction.md` |
| **Full suite command** | Manual E2E walkthrough in Playground |
| **Estimated runtime** | ~2 seconds (automated checks) |

---

## Sampling Rate

- **After every task commit:** Run `wc -l ~/.claude/skills/watson/SKILL.md && grep "dispatch:" ~/.claude/skills/watson/agents/interaction.md`
- **After every plan wave:** Inspect all three modified files for correct content
- **Before `/gsd:verify-work`:** All three success criteria verified
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | DRFT-04 | manual | Observe SKILL.md Path B with pending amendments | N/A | ⬜ pending |
| 11-01-02 | 01 | 1 | audit-fix | automated | `grep "dispatch: background" ~/.claude/skills/watson/agents/interaction.md` | ✅ | ⬜ pending |
| 11-01-03 | 01 | 1 | audit-fix | automated | `grep "PARA-0" .planning/phases/10-3-agent-parallel-dispatch/10-01-SUMMARY.md` | ✅ | ⬜ pending |
| 11-01-04 | 01 | 1 | constraint | automated | `wc -l ~/.claude/skills/watson/SKILL.md` (must be ≤ 200) | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework to install; all automated checks are one-line shell commands.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Path B with non-empty drafts: presents AskUserQuestion gate with 3 options | DRFT-04 | Watson is a Claude Code skill; AskUserQuestion gate requires live Playground session with pending amendments in STATUS.md | 1. Create prototype with pending amendments in STATUS.md `drafts:`. 2. Start new session. 3. Verify SKILL.md Path B presents AskUserQuestion (not passive note). 4. Test each option branch. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
