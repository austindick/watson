---
phase: 8
slug: session-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — Watson is a Claude skill, behavioral testing only |
| **Config file** | none |
| **Quick run command** | Manual invocation in Playground |
| **Full suite command** | Manual E2E walkthrough of both paths |
| **Estimated runtime** | ~5 minutes (manual walkthrough) |

---

## Sampling Rate

- **After every task commit:** Manual spot-check — create a branch, verify name format and STATUS.md branch: field
- **After every plan wave:** Full E2E: new prototype (branch created from main) + continue existing (branch switch + context summary) + inactive cleanup (delete flow)
- **Before `/gsd:verify-work`:** Both paths demonstrably functional and all SESS requirements met
- **Max feedback latency:** N/A (manual verification)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | SESS-01 | manual-only | Start new prototype, observe branch creation with confirmation step | N/A | ⬜ pending |
| 08-01-02 | 01 | 1 | SESS-03 | shell-verify | `git branch --list 'watson/*' \| grep -v '^watson/'` returns empty | N/A | ⬜ pending |
| 08-01-03 | 01 | 2 | SESS-02 | manual-only | Select existing prototype from list, observe checkout with confirmation | N/A | ⬜ pending |
| 08-01-04 | 01 | 2 | SESS-04 | manual-only | With 30+ day inactive branch, observe tagging and delete option in list | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No automated test framework needed — Watson skill behavioral tests are observational.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| New prototype creates watson/{slug} branch with confirmation | SESS-01 | Interactive Claude skill — requires user conversation | Invoke /watson, select "Start new prototype", verify confirmation step appears before branch creation |
| Continue existing switches to correct branch with confirmation | SESS-02 | Interactive Claude skill — requires user conversation | Invoke /watson with existing watson/* branches, select "Continue existing", verify confirmation and checkout |
| All branches follow watson/{slug} convention | SESS-03 | Partially automatable — shell verify post-hoc | After branch operations, run `git branch --list 'watson/*'` and confirm all match pattern |
| Inactive branches surfaced with delete option | SESS-04 | Interactive Claude skill — requires UI inspection | Start new session with 30+ day inactive watson/* branches present, verify list shows them with delete option |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency documented
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
