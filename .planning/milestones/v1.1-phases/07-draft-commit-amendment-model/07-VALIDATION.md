---
phase: 07
slug: draft-commit-amendment-model
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-02
---

# Phase 07 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — Watson is a Claude Code skill (behavioral output, not testable binary) |
| **Config file** | none |
| **Quick run command** | Manual invocation test in Playground |
| **Full suite command** | Manual E2E walkthrough |
| **Estimated runtime** | ~10 minutes (manual behavioral walkthrough) |

---

## Sampling Rate

- **After every task commit:** Spot-check modified file for marker presence/absence
- **After every plan wave:** E2E walkthrough covering one full pending-commit cycle and one pending-discard cycle
- **Before `/gsd:verify-work`:** All four DRFT requirements demonstrably true
- **Max feedback latency:** N/A (manual verification)

---

## Per-Task Verification Map

| Req ID | Behavior | Test Type | Verification Steps | Status |
|--------|----------|-----------|-------------------|--------|
| DRFT-01 | New amendment written by discuss has `[PENDING]` prefix; STATUS.md `drafts:` updated | manual-only | Invoke discuss, make a design decision, inspect blueprint file and STATUS.md | ⬜ pending |
| DRFT-02 | "Let's build" at commit gate commits all + builds; "Just save" leaves `[PENDING]` | manual-only | Run discuss to conclusion, observe gate options and status after each choice | ⬜ pending |
| DRFT-03 | Commit gate shows design-language diff grouped by file | manual-only | Have pending amendments, reach "Ready?" gate, verify diff appears before build | ⬜ pending |
| DRFT-04 | Session start with non-empty `drafts:` shows pending count and "Review pending" choice | manual-only | End session with pending amendments, start new session, observe routing output | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No automated test framework needed — Watson is a Claude Code skill where behavioral output is Claude's response in conversation, not a testable binary artifact.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Amendment marker format | DRFT-01 | Output is Claude's written text in .md files | Inspect blueprint file after discuss writes amendment |
| Commit gate diff display | DRFT-03 | Output is Claude's conversational response | Observe commit gate presentation with pending amendments |
| Session-start surfacing | DRFT-04 | Output is Claude's routing behavior | Start new session with existing pending amendments |
| Builder skips pending | DRFT-01 | Build output depends on full pipeline run | Run build with mix of pending/committed, verify only committed applied |

---

## Validation Sign-Off

- [x] All tasks have manual verification or Wave 0 dependencies
- [x] Sampling continuity: spot-check after each commit
- [x] Wave 0 covers all MISSING references (N/A — no automated tests)
- [x] No watch-mode flags
- [x] Feedback latency acceptable (manual verification)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
