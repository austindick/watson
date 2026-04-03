---
phase: 6
slug: ambient-activation-status-md-schema
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — Watson is a skill/prompt system, not a code project with a test runner |
| **Config file** | none |
| **Quick run command** | Manual invocation test in Playground |
| **Full suite command** | Manual E2E walkthrough |
| **Estimated runtime** | ~5 minutes (manual) |

---

## Sampling Rate

- **After every task commit:** Manual spot-check after each SKILL.md or watson-init change
- **After every plan wave:** Full E2E walkthrough: new prototype (no STATUS.md) + returning prototype (STATUS.md populated)
- **Before `/gsd:verify-work`:** All three AMBI requirements demonstrably true
- **Max feedback latency:** ~5 minutes (manual verification)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | AMBI-01 | manual | Open prototype file, send message, observe activation | N/A | ⬜ pending |
| 06-01-02 | 01 | 1 | AMBI-02 | manual | New: no STATUS.md → setup flow; Returning: STATUS.md → summary | N/A | ⬜ pending |
| 06-01-03 | 01 | 1 | AMBI-03 | manual | Return to existing prototype with populated STATUS.md | N/A | ⬜ pending |
| 06-02-01 | 02 | 1 | AMBI-02 | manual | Verify watson-init creates STATUS.md in blueprint/ | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No automated test setup needed — Watson is a Claude Code skill validated through behavioral observation.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Watson activates without /watson in prototype dir | AMBI-01 | Skill activation is Claude behavior, not testable binary | Open prototype file, send message, observe Watson engages without /watson |
| New vs returning detection without asking | AMBI-02 | State detection is behavioral — STATUS.md existence check | Test with fresh prototype (no STATUS.md) and existing (with STATUS.md) |
| Context summary shows name, sections, decisions | AMBI-03 | Output format is Claude response, not parseable output | Return to prototype with populated STATUS.md, verify summary content |
| Tier 0 passthrough for non-prototype messages | AMBI-01 | Intent classification is behavioral | Send "git status" in prototype dir, verify Watson stays silent |

---

## Validation Sign-Off

- [ ] All tasks have manual verify instructions
- [ ] Sampling continuity: every task has verification path
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 300s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
