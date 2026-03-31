---
phase: 3
slug: research-agents
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-25
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Automated grep/wc checks + live smoke test (agent files are Markdown instruction documents, not executable code) |
| **Config file** | none |
| **Quick run command** | Dispatch Agent 1 and Agent 2 against a real Figma section nodeId; verify both output files exist |
| **Full suite command** | Parallel timing test: dispatch both agents, record wall-clock time, confirm < 1.5x single-agent time |
| **Estimated runtime** | ~60 seconds (single agent dispatch + output inspection) |

---

## Sampling Rate

- **After every task commit:** Automated verify commands in each task's `<verify>` block run grep/wc checks on agent files (Watson frontmatter, no .loupe references, no FauxDS hardcoding, word count limits)
- **After every plan wave:** Dispatch both agents against a real Figma section; verify both output files exist and are under 80 lines
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 03-01-01 | 01 | 1 | LOUP-01, LOUP-02 | automated grep | `wc -w` word count + `grep -c` for watson frontmatter, no .loupe, no faux refs | pending |
| 03-01-02 | 01 | 1 | LOUP-01, LOUP-02 | automated grep | `grep -c faux` returns 0 + `grep -c libraryPaths` returns 2+ | pending |
| 03-01-03 | 01 | 1 | LOUP-01, LOUP-02 | automated grep | `grep -c faux` returns 0 + `grep -c Unmapped Values` returns 2+ | pending |
| 03-02-01 | 02 | 1 | LOUP-01, LOUP-03, LOUP-06 | automated grep | `grep -c .loupe` returns 0 + `grep -c watson:` returns 1 per file | pending |
| 03-02-02 | 02 | 1 | LOUP-03, LOUP-06 | automated grep | `grep -c blueprint/` returns 2+ in consolidator + `grep -ci deferred` returns 1+ in interaction | pending |
| 03-03-01 | 03 | 2 | LOUP-02, LOUP-05 | live smoke | `test -f /tmp/watson-smoke-test/.watson/sections/*/LAYOUT.md && test -f .../DESIGN.md` | pending |
| 03-03-02 | 03 | 2 | LOUP-05 | checkpoint | User approves timing data and output quality | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] Smoke test Figma frame with sufficient complexity (auto-layout, mixed spacing, some design-system-matchable + some unmapped elements) — user must provide before smoke test task runs
- [ ] `.watson/sections/` directory must exist in the test project before agents write output

*Existing infrastructure covers framework installation — this phase produces Markdown agent files. Plans 01 and 02 use automated grep/wc verification. Plan 03 uses live smoke testing.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Agent 1 extracts all auto-layout properties | LOUP-01 | Requires live Figma MCP response | Dispatch on section with varied auto-layout; inspect LAYOUT.md |
| Every layout px value maps to design system spacing token | LOUP-02 | Requires inspecting generated Markdown for token+comment pattern | Inspect Annotated CSS section |
| Agent reads libraryPaths[] chapters | LOUP-02 | Verify read instruction exists in agent file | Check agent file for explicit read instructions |
| Agent 2 maps elements to design system component+variant+props | LOUP-01 | Requires live Figma data + library matching | Dispatch on section with known components |
| Color exact-hex matching; off-by-one goes to Unmapped | LOUP-02 | Requires section with exact and near-match colors | Include test section with one exact + one off-by-one color |
| Unmapped Values section always present | LOUP-02 | Must verify section exists even when empty | Check for `_None_` when all values match |
| Agents run in background (no AskUserQuestion) | LOUP-05 | Code inspection of agent file | Verify no foreground-only tool calls in agent files |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands (grep/wc for Plans 01-02, file existence for Plan 03)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---
*Updated: 2026-03-31 — nyquist compliance updated to reflect automated verify commands in plan files*
