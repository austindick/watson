---
phase: 9
slug: agent-3-interactions
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual review (Watson is a markdown-only skill system — no test runner) |
| **Config file** | none |
| **Quick run command** | Read generated INTERACTION.md, verify structure matches schema |
| **Full suite command** | Run full loupe pipeline on a test section, inspect all output files |
| **Estimated runtime** | ~60 seconds (manual inspection) |

---

## Sampling Rate

- **After every task commit:** Read modified file, confirm syntax and structure
- **After every plan wave:** Full pipeline test — run discuss + loupe on a sample section, inspect INTERACTION.md output
- **Before `/gsd:verify-work`:** All five requirements satisfied by manual inspection
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | INTR-01 | manual | Read `.watson/sections/*/INTERACTION.md`, verify Tier 1 rows match detected components | N/A | ⬜ pending |
| 09-01-02 | 01 | 1 | INTR-02 | manual | Invoke loupe with interactionContext; inspect Tier 2/3 sections | N/A | ⬜ pending |
| 09-01-03 | 01 | 1 | INTR-03 | manual | Structural inspection: all required sections present, headers match INTERACTION-EXAMPLE.md | N/A | ⬜ pending |
| 09-01-04 | 01 | 1 | INTR-04 | manual | Invoke with `interactionContext: null`; verify header note and empty Tier 2/3 stubs | N/A | ⬜ pending |
| 09-01-05 | 01 | 2 | INTR-05 | manual | Read discuss return status after interaction discussion; verify interactionContext field | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. The Watson project uses manual review of generated markdown artifacts — no test scaffolding is needed.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tier 1 table populated from PAGE.md states | INTR-01 | No test runner; markdown skill output | Run loupe on section with DS components, verify INTERACTION.md Tier 1 rows match component states from PAGE.md |
| interactionContext → Tier 2/3 mapping | INTR-02 | Requires running discuss with real conversation | Run discuss with interaction questions, then loupe; verify context maps to correct tiers |
| INTERACTION.md schema compliance | INTR-03 | Structural markdown validation | Compare generated INTERACTION.md headers and structure against INTERACTION-EXAMPLE.md |
| Null context fallback | INTR-04 | Requires testing specific null path | Run loupe without prior discuss interaction context; verify header note and stub sections |
| discuss return status extension | INTR-05 | Requires running discuss skill end-to-end | Complete a discuss session with interaction discussion; inspect return status JSON for interactionContext field |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
