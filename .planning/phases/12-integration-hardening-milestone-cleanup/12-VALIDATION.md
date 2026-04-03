---
phase: 12
slug: integration-hardening-milestone-cleanup
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-03
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — Watson is a Claude Code skill (prose/markdown); no automated test runner |
| **Config file** | none |
| **Quick run command** | Manual file read + line count verification |
| **Full suite command** | Manual: read SKILL.md, read all 4 SUMMARY files, read REQUIREMENTS.md |
| **Estimated runtime** | ~10 seconds (file reads only) |

---

## Sampling Rate

- **After every task commit:** Read modified file, verify expected content present
- **After every plan wave:** Read all modified files, cross-reference audit gaps
- **Before `/gsd:verify-work`:** All success criteria verified by static file reads
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | DRFT-04 | manual | Read SKILL.md Path B step 5 | N/A | ⬜ pending |
| 12-01-02 | 01 | 1 | SESS-01, SESS-02 | manual | Read SKILL.md /watson off block | N/A | ⬜ pending |
| 12-01-03 | 01 | 1 | — | manual | Read REQUIREMENTS.md coverage | N/A | ⬜ pending |
| 12-01-04 | 01 | 1 | — | manual | Read 4 SUMMARY files for frontmatter | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No automated test framework needed — all verification is static file content checks.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| blueprintPath derivation documented in Path B step 5 | DRFT-04 | Prose content check — no code to test | Read SKILL.md, find Path B step 5, confirm derivation statement |
| /watson off uses git show for STATUS.md | SESS-01, SESS-02 | Prose content check | Read SKILL.md /watson off block, confirm `git show` pattern |
| REQUIREMENTS.md coverage matches traceability | — | Text consistency check | Read coverage section, verify counts match table |
| SUMMARY frontmatter has requirements_completed | — | YAML field presence check | Read 06-02, 07-02, 08-02, 09-02 SUMMARY files |

---

## Validation Sign-Off

- [ ] All tasks have manual verify instructions
- [ ] Sampling continuity: every task has immediate verification
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
