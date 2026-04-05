---
phase: 15
slug: distribution-onboarding-validation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-05
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual checklist (no automated test framework — validation is human execution of install/migration flows) |
| **Config file** | none |
| **Quick run command** | `claude plugin validate .` (syntax check on marketplace.json + plugin.json) |
| **Full suite command** | Author self-test against VALD-02 checklist + beta tester fresh install against VALD-01 checklist |
| **Estimated runtime** | ~5 minutes (author checklist) + ~15 minutes (beta tester install) |

---

## Sampling Rate

- **After every task commit:** Run `claude plugin validate .`
- **After every plan wave:** Author self-test (VALD-02 checklist)
- **Before `/gsd:verify-work`:** VALD-01 (beta tester passes) + VALD-02 (author migration clean)
- **Max feedback latency:** ~60 seconds (validate command); human checklists are async

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 1 | DIST-01 | smoke | `claude plugin validate .` | ❌ W0 | ⬜ pending |
| 15-01-02 | 01 | 1 | DIST-03 | review | manual — README covers prerequisites | ❌ W0 | ⬜ pending |
| 15-01-03 | 01 | 1 | DIST-04 | smoke | `test -f skills/watson/references/watson-ambient.md` | ✅ | ⬜ pending |
| 15-01-04 | 01 | 1 | DIST-02 | review | manual — version bump discipline documented | ❌ W0 | ⬜ pending |
| 15-02-01 | 02 | 2 | VALD-02 | smoke | manual — author migration checklist | ❌ W0 | ⬜ pending |
| 15-02-02 | 02 | 2 | VALD-01 | e2e | manual — beta tester fresh install | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.claude-plugin/marketplace.json` — does not exist; must be created before any install testing
- [ ] `README.md` — does not exist at repo root
- [ ] GitHub remote `austindick/watson` — current remote is planning repo; code remote must be created/pushed
- [ ] `claude plugin validate .` — validate marketplace.json syntax before pushing

*These are prerequisites for plan 15-01, not separate test stubs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Install flow works end-to-end | DIST-01, VALD-01 | Requires real Claude Code session on another machine | Beta tester follows README; pass = Watson works without help |
| Auto-update triggers on version bump | DIST-02 | Requires push + restart cycle on second machine | Bump version, push, beta tester restarts Claude Code, checks for update |
| Author migration clean | VALD-02 | Requires author's actual machine state | Author runs VALD-02 checklist: no double hooks, /watson works, statusLine shows |
| README prerequisite completeness | DIST-03 | Subjective review of documentation | Author reads README against checklist: Figma MCP, ambient rule copy, install commands |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
