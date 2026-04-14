# Requirements: Design Toolkit

**Defined:** 2026-04-13
**Core Value:** Every prototype decision is grounded in real context and traceable from idea through prototype to production spec.

## v1.5 Requirements

Requirements for the Design Toolkit milestone. Decompose Watson into standalone skills while hardening the build pipeline.

### Plugin Infrastructure

- [x] **INFRA-01**: Plugin manifest (plugin.json) for "Design Toolkit" with all skills registered as commands
- [x] **INFRA-02**: Shared library directory at plugin level with design-system, playground-conventions, and codebase-map books
- [x] **INFRA-03**: Librarian agent as shared plugin utility accessible by all skills
- [x] **INFRA-04**: Blueprint templates with explicit lifecycle rules — required frontmatter fields, section lifecycle markers (overwrite vs append-only), amendment protocol spec — replacing current example files as the authoritative contract between skills
- [x] **INFRA-05**: Watson branding removed from all user-facing surfaces (folder names, branch prefixes, status files, session markers, output messages)
- [x] **INFRA-06**: Each skill has CSO-optimized frontmatter (name, "Use when..." description, proper triggers)

### /play — Session Management

- [ ] **PLAY-01**: User can run `/play` to start a guided fork choosing new prototype or continue existing
- [ ] **PLAY-02**: New prototype flow creates branch with user confirmation and scaffolds empty blueprint directory
- [ ] **PLAY-03**: Continue flow lists active branches and restores session from blueprint + status files
- [ ] **PLAY-04**: Inactive branch cleanup with user confirmation before deletion
- [ ] **PLAY-05**: Flexible continue accepts branch name, Playground URL, or directory path
- [ ] **PLAY-06**: STATUS.md created/updated with session state on every lifecycle event

### /think — Design Thinking

- [ ] **THINK-01**: User can run `/think` as standalone skill independent of `/design` or `/play`
- [ ] **THINK-02**: Design thinking flow reads library books for grounded component/pattern recommendations
- [ ] **THINK-03**: Complexity-scaled depth — skips discussion for simple requests, deep exploration for complex ones
- [ ] **THINK-04**: Design decisions written back to the PRD (the living context document), amendments tracked as [PENDING]/[COMMITTED]
- [ ] **THINK-05**: File structure refactored: SKILL.md (~100 lines) + reference files for questioning flow, blueprint writing, and mid-build behavior
- [ ] **THINK-06**: Natural handoff suggestion to `/design` when discussion reaches build-readiness (suggestion, not gate)

### /design — Build Pipeline

- [ ] **DSGN-01**: User can run `/design` as standalone skill independent of `/think` or `/play`
- [ ] **DSGN-02**: 3-mode entry: Figma frame URL, existing prod experience reference, or text description
- [ ] **DSGN-03**: All 12 agents ported to standalone context (8 Figma pipeline + 4 source agents)
- [ ] **DSGN-04**: Decomposer emits frame as first section with `type: page-container` for page-level layout properties
- [ ] **DSGN-05**: Layout agent handles `page-container` type — extracts container-only properties (background, padding, alignment, inter-section spacing)
- [ ] **DSGN-06**: Builder handles `page-container` type — creates wrapper structure with insertion region, not standalone component
- [ ] **DSGN-07**: Reviewer cross-references each CSS property against the specific token assigned in LAYOUT.md annotated CSS (not just token name validity)
- [ ] **DSGN-08**: Builder resolves all styling through token system for novel compositions, not just direct copies
- [ ] **DSGN-09**: Builder→reviewer uses convergent loop: iterate until output matches spec or max 3 iterations, with structured diff (not prose) between passes
- [ ] **DSGN-10**: User can rebuild specific section(s) without re-running full pipeline — skips decomposition, targets only specified sections
- [ ] **DSGN-11**: Reads PRD from `/think` if present, works without it
- [ ] **DSGN-12**: Blueprint files (LAYOUT.md, DESIGN.md, INTERACTION.md) written per section and consolidated
- [ ] **DSGN-13**: After consolidation, run full-prototype type-check and dev server verification before declaring completion — auto-fix up to 2 attempts, designer-friendly error reporting

### /save — Checkpoint Utility

- [ ] **SAVE-01**: User can run `/save` at any point during a session to checkpoint current state
- [ ] **SAVE-02**: Writes current conversation context and decisions to relevant blueprint files
- [ ] **SAVE-03**: Commits branch with descriptive message summarizing session progress
- [ ] **SAVE-04**: Updates STATUS.md with snapshot sufficient for `/play` to restore session

## v1.6 Requirements

Deferred to next milestone. Tracked but not in current roadmap.

### /spec — SDD Handoff

- **SPEC-01**: User can run `/spec` to generate FRD and DRD from blueprint files
- **SPEC-02**: FRD (frd.md) captures functional requirements from CONTEXT.md and INTERACTION.md
- **SPEC-03**: DRD (drd.md) captures design requirements from LAYOUT.md and DESIGN.md
- **SPEC-04**: Output files formatted for Faire's Spec-Driven Development framework

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Watson master orchestrator | Paused — standalone skills preserve value without orchestration complexity |
| `/spec` skill | Deferred to v1.6 — blueprint structure informs but doesn't block |
| Context window awareness hooks | Depends on recovery commands being stable first; consider for v1.6 |
| Aesthetic direction in `/think` | Polish — not blocking any workflows |
| Continuation/handoff format | Polish — can be added incrementally after skills ship |
| Automated screenshot capture | SSO/auth complexity — deferred indefinitely |
| Visual verification (screenshot comparison) | v2.0 |
| Design system abstraction beyond Slate | v2.0 |
| Motion/animation vocabulary | Depends on Slate animation support |
| Model profile optimization | Pipeline too short to benefit meaningfully |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 26 | Complete |
| INFRA-02 | Phase 26 | Complete |
| INFRA-03 | Phase 26 | Complete |
| INFRA-04 | Phase 26 | Complete |
| INFRA-05 | Phase 26 | Complete |
| INFRA-06 | Phase 26 | Complete |
| PLAY-01 | Phase 27 | Pending |
| PLAY-02 | Phase 27 | Pending |
| PLAY-03 | Phase 27 | Pending |
| PLAY-04 | Phase 27 | Pending |
| PLAY-05 | Phase 27 | Pending |
| PLAY-06 | Phase 27 | Pending |
| THINK-01 | Phase 28 | Pending |
| THINK-02 | Phase 28 | Pending |
| THINK-03 | Phase 28 | Pending |
| THINK-04 | Phase 28 | Pending |
| THINK-05 | Phase 28 | Pending |
| THINK-06 | Phase 28 | Pending |
| DSGN-01 | Phase 29 | Pending |
| DSGN-02 | Phase 29 | Pending |
| DSGN-03 | Phase 29 | Pending |
| DSGN-04 | Phase 30 | Pending |
| DSGN-05 | Phase 30 | Pending |
| DSGN-06 | Phase 30 | Pending |
| DSGN-07 | Phase 30 | Pending |
| DSGN-08 | Phase 30 | Pending |
| DSGN-09 | Phase 30 | Pending |
| DSGN-10 | Phase 30 | Pending |
| DSGN-11 | Phase 29 | Pending |
| DSGN-12 | Phase 29 | Pending |
| DSGN-13 | Phase 30 | Pending |
| SAVE-01 | Phase 31 | Pending |
| SAVE-02 | Phase 31 | Pending |
| SAVE-03 | Phase 31 | Pending |
| SAVE-04 | Phase 31 | Pending |

**Coverage:**
- v1.5 requirements: 35 total
- Mapped to phases: 35
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-13*
*Last updated: 2026-04-13 — traceability filled during roadmap creation*
