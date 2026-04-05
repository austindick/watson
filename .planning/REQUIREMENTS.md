# Requirements: Watson

**Defined:** 2026-04-04
**Core Value:** Every prototype decision is grounded in real context and traceable from idea through prototype to production spec.

## v1.2 Requirements

Requirements for Watson 1.2: Plugin Deployment. Each maps to roadmap phases.

### Plugin Infrastructure

- [x] **PLUG-01**: Watson loads as a Claude Code plugin with a valid plugin.json manifest (name, version, description)
- [x] **PLUG-02**: All internal file references use `${CLAUDE_PLUGIN_ROOT}` instead of hardcoded `~/.claude/skills/watson/` paths
- [x] **PLUG-03**: Plugin directory structure follows Claude Code plugin spec (skills/, agents/, commands/ as appropriate)
- [x] **PLUG-04**: Library books (design-system, playground-conventions) are bundled in the plugin and accessible to all agents via portable paths
- [x] **PLUG-05**: The `/watson` slash command works after plugin install (namespace investigation determines whether via commands/ or skills/ with accepted namespace)

### Hook Migration

- [x] **HOOK-01**: Watson SessionStart hook (recovery notification) fires from plugin hooks/hooks.json, not personal settings.json
- [x] **HOOK-02**: Watson SessionEnd hook (branch+actions preservation) fires from plugin hooks/hooks.json, not personal settings.json
- [x] **HOOK-03**: Watson hooks are removed from author's settings.json without affecting non-Watson hooks (GSD, share-proto)
- [x] **HOOK-04**: StatusLine script is bundled in the plugin (forked from share-proto-statusline.js, Watson-only logic)

### Distribution

- [ ] **DIST-01**: Teammates can install Watson with a single command from a GitHub repo (austindick/watson or equivalent)
- [ ] **DIST-02**: Plugin auto-updates when author pushes new versions to the repo
- [ ] **DIST-03**: Onboarding README documents all prerequisites (Figma MCP, GITHUB_TOKEN for private repo, ambient rule manual step)
- [ ] **DIST-04**: Ambient rule (watson-ambient.md) is bundled as a reference file with documented manual copy step to ~/.claude/rules/

### Validation

- [ ] **VALD-01**: Fresh install on a clean machine (or new user profile) produces a working Watson with /watson invocable
- [ ] **VALD-02**: Existing Watson author install migrates cleanly (no double-firing hooks, no broken paths)

## v1.3 Requirements

Deferred to next milestone (Discuss Refactor). Tracked but not in current roadmap.

### Discuss Subskill Refactor

- **DISC-01**: discuss.md split into ~200-line files (conversation core, blueprint writes, handoff)
- **DISC-02**: Wiring between split files verified with end-to-end discuss session
- **DISC-03**: No behavioral regression — amendment lifecycle, interactionContext emit, Ready gate all preserved

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Marketplace with multiple plugins | Watson is the only plugin; marketplace catalog is overhead for one entry |
| Librarian for teammates | MVP ships bundled books; author regenerates and pushes. Teammate self-service deferred. |
| Automated ambient rule installation | Plugin system doesn't support rules/; manual copy is acceptable for MVP |
| StatusLine auto-configuration | settings.json statusLine is not plugin-configurable; documented manual step |
| Public repo | Start private (austindick/watson); go public if/when adoption warrants |
| Plugin settings UI | No custom settings needed for MVP |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLUG-01 | Phase 13 | Complete |
| PLUG-02 | Phase 13 | Complete |
| PLUG-03 | Phase 13 | Complete |
| PLUG-04 | Phase 13 | Complete |
| PLUG-05 | Phase 13 | Complete |
| HOOK-01 | Phase 14 | Complete |
| HOOK-02 | Phase 14 | Complete |
| HOOK-03 | Phase 14 | Complete |
| HOOK-04 | Phase 14 | Complete |
| DIST-01 | Phase 15 | Pending |
| DIST-02 | Phase 15 | Pending |
| DIST-03 | Phase 15 | Pending |
| DIST-04 | Phase 15 | Pending |
| VALD-01 | Phase 15 | Pending |
| VALD-02 | Phase 15 | Pending |

**Coverage:**
- v1.2 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0

---
*Requirements defined: 2026-04-04*
*Last updated: 2026-04-04 after roadmap creation — all 15 requirements mapped*
