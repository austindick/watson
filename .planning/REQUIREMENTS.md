# Requirements: Watson

**Defined:** 2026-04-01
**Core Value:** Every prototype decision is grounded in real context and traceable from idea through prototype to production spec.

## v1.1 Requirements

Requirements for Watson 1.1: Ambient Mode & Iteration. Each maps to roadmap phases.

### Ambient Activation

- [x] **AMBI-01**: Watson activates automatically when user is in a prototype directory without requiring /watson prefix
- [x] **AMBI-02**: Watson detects whether user is starting a new prototype or returning to an existing one without asking
- [x] **AMBI-03**: On activation in an existing prototype, Watson displays a 2-3 line context summary (prototype name, built sections, pending decisions) before asking what to do

### Draft/Commit Amendment Model

- [x] **DRFT-01**: Blueprint amendments from discuss default to a pending state rather than immediately committed
- [x] **DRFT-02**: User can explicitly commit pending amendments via the existing "Ready?" confirmation gate
- [x] **DRFT-03**: At commit gate, Watson shows a diff-style summary of which decisions will be locked in
- [x] **DRFT-04**: On session start, Watson surfaces any pending amendments from previous sessions

### Session Management

- [x] **SESS-01**: Watson creates a new git branch for a new prototype session with user confirmation
- [x] **SESS-02**: Watson switches to an existing prototype branch when returning to a prototype, with user confirmation
- [x] **SESS-03**: Watson uses a consistent branch naming convention (`watson/{prototype-slug}`)
- [x] **SESS-04**: On new session start, Watson surfaces existing Watson branches and offers cleanup of inactive ones

### Agent 3 (Interactions)

- [x] **INTR-01**: Interaction agent reads library component built-in interaction states from design system book and applies them to the section
- [x] **INTR-02**: Interaction agent accepts pre-gathered interactionContext from discuss and structures user-described states and behaviors
- [x] **INTR-03**: Interaction agent produces a structured INTERACTION.md per section combining discuss context with library defaults
- [x] **INTR-04**: When no discuss context exists, agent applies library component defaults only and notes that no custom interactions were specified
- [x] **INTR-05**: discuss subskill emits interactionContext field in its return status JSON

### 3-Agent Parallel Dispatch

- [x] **PARA-01**: loupe.md dispatches layout, design, and interaction agents simultaneously per Figma section
- [x] **PARA-02**: loupe.md wait gate requires all three agent outputs before proceeding to builder
- [x] **PARA-03**: Interaction agent failure or empty output does not block the pipeline — falls back to interactionPath: null
- [x] **PARA-04**: Discuss-only sections skip the interaction agent (same skip rule as layout and design)

## v1.2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Extended Capabilities

- **PREF-01**: Cross-session preference memory (persist "just build" mode across sessions)
- **CONF-01**: Interaction agent confidence scoring (flag uncertain variant inference)
- **UNDR-01**: `understand` subskill (PRD ingestion → CONTEXT.md enrichment)
- **EXPL-01**: `explore` subskill (competitive analysis, pattern review before discuss)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Animation curve/duration specification | False precision — Figma labels don't map to exact values; engineers override anyway |
| Ambient activation in non-prototype directories | False positives degrade trust; two-signal requirement scopes activation |
| Auto-committing on conversational acknowledgment | "That sounds good" mid-discussion is not an explicit design decision; trust-killer |
| Interaction agent as foreground (interactive) during pipeline | Blocks pipeline and interrupts "just build" expectation; all context gathered before build |
| Draft state as separate files (DRAFT-DESIGN.md) | Inverts clean agent contract where output paths are deterministic |
| 3-agent dispatch for discuss-only sections | No Figma node to inspect; discuss already wrote INTERACTION.md to blueprint |
| Figma variant inference for interaction states | Redundant — standard states already in Slate library; complex interactions need discuss anyway |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AMBI-01 | Phase 6 | Complete |
| AMBI-02 | Phase 6 | Complete |
| AMBI-03 | Phase 6 | Complete |
| DRFT-01 | Phase 7 | Complete |
| DRFT-02 | Phase 7 | Complete |
| DRFT-03 | Phase 7 | Complete |
| DRFT-04 | Phase 7 | Complete |
| SESS-01 | Phase 8 | Complete |
| SESS-02 | Phase 8 | Complete |
| SESS-03 | Phase 8 | Complete |
| SESS-04 | Phase 8 | Complete |
| INTR-01 | Phase 9 | Complete |
| INTR-02 | Phase 9 | Complete |
| INTR-03 | Phase 9 | Complete |
| INTR-04 | Phase 9 | Complete |
| INTR-05 | Phase 9 | Complete |
| PARA-01 | Phase 10 | Complete |
| PARA-02 | Phase 10 | Complete |
| PARA-03 | Phase 10 | Complete |
| PARA-04 | Phase 10 | Complete |

**Coverage:**
- v1.1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0

---
*Requirements defined: 2026-04-01*
*Last updated: 2026-04-01 — traceability completed during roadmap creation*
