---
phase: 10
slug: 3-agent-parallel-dispatch
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual validation (skill/agent markdown files — no runtime test framework) |
| **Config file** | none |
| **Quick run command** | `grep -c "background" .claude/skills/watson/skills/loupe.md` |
| **Full suite command** | `bash -c 'echo "=== Parallel dispatch check ===" && grep -A5 "interaction" .claude/skills/watson/skills/loupe.md | head -20 && echo "=== Agent params check ===" && grep -A3 "layoutPath\|designPath" .claude/skills/watson/agents/interaction.md; echo "=== Constraint check ===" && grep -A2 "Constraint.*4\|No Figma" .claude/skills/watson/agents/interaction.md; echo "DONE"'` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick run command
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | PARA-03 | grep | `grep -c "No Figma" .claude/skills/watson/agents/interaction.md` (should be 0) | ✅ | ⬜ pending |
| 10-01-02 | 01 | 1 | PARA-03 | grep | `grep -c "nodeId" .claude/skills/watson/agents/interaction.md` (should be >0) | ✅ | ⬜ pending |
| 10-02-01 | 02 | 2 | PARA-01 | grep | `grep -c "background.*interaction\|interaction.*background" .claude/skills/watson/skills/loupe.md` (should be >0) | ✅ | ⬜ pending |
| 10-02-02 | 02 | 2 | PARA-02 | grep | `grep -c "INTERACTION.md" .claude/skills/watson/skills/loupe.md` in wait gate (should be >0) | ✅ | ⬜ pending |
| 10-02-03 | 02 | 2 | PARA-04 | manual | Verify discuss-only skip logic includes interaction agent | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. Both target files already exist; changes are in-place edits to markdown skill/agent files.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Three agents dispatch simultaneously | PARA-01 | Skill markdown — behavior verified by reading dispatch block | Read loupe.md Phase 2; confirm interaction agent is dispatched in the same background agent block as layout + design |
| Builder waits for all three outputs | PARA-02 | Skill markdown — behavior verified by reading wait gate | Read loupe.md wait gate; confirm INTERACTION.md is included in the completion check |
| Interaction error doesn't block pipeline | PARA-03 | Skill markdown — behavior verified by reading null fallback | Read loupe.md wait gate; confirm retry-once + null fallback for INTERACTION.md |
| Discuss-only sections skip interaction | PARA-04 | Skill markdown — behavior verified by reading skip logic | Read loupe.md Phase 2 dispatch; confirm discuss-only skip applies to interaction agent |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
