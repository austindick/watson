# Pitfalls Research

**Domain:** Watson 1.1 — Ambient mode, draft/commit model, session management, Agent 3 (Interactions), 3-agent parallel dispatch
**Researched:** 2026-04-01
**Confidence:** HIGH — based on Watson 1.0 production experience, Figma MCP official developer documentation, Claude Code skill activation research (650-trial studies, Marc Bara's dual-failure taxonomy), and Watson codebase deep read

---

## Critical Pitfalls

### Pitfall 1: Ambient Mode Fires on Non-Prototype Directories

**What goes wrong:**
Watson's ambient trigger is designed to activate when the user is in a prototype directory without typing `/watson`. But the trigger condition is evaluated by Claude's LLM reasoning against the skill description — not by a directory check or algorithmic rule. If the trigger description includes broad language like "activate when working on frontend UI" or "detect when prototype work is happening," Watson fires during unrelated frontend work: grepping a utility file, fixing a linter error, updating a config. The user gets an unsolicited design conversation prompt in the middle of a non-design task.

**Why it happens:**
Claude skill activation is pure semantic matching — "there is no algorithmic skill selection... the decision happens inside Claude's forward pass through the transformer, not in the application code" (paddo.dev, 2025). The broader the trigger description, the more false positives. The system has no directory-scoping mechanism in the activation layer — directory detection must be inside the skill body, not in the trigger.

**How to avoid:**
Write the ambient trigger description with explicit negative constraints, not just positive ones. Pattern: "[positive trigger] — ONLY when [specific signal]. Do NOT activate for [near-miss scenarios]." Include the `blueprint/` directory existence as a required condition stated explicitly in the frontmatter description. Test near-miss scenarios before shipping: a user typing in a React component file unrelated to prototyping, a user running type-checks, a user updating a route config. If Watson activates for any of those, tighten the description.

**Warning signs:**
- Watson activates when the user is grepping or editing utility/config files in the same project
- Watson activates when the user is in a non-prototype directory that happens to contain `.tsx` files
- Users report Watson "interrupting" non-design tasks with questions

**Phase to address:**
Ambient mode phase (Phase 1). The trigger description and negative constraint language must be validated before any other 1.1 feature is built on top of ambient activation. Ambient mode is load-bearing for every subsequent feature.

---

### Pitfall 2: Ambient Mode Breaks Explicit `/watson` Invocation Semantics

**What goes wrong:**
Before ambient mode, Watson only activates on explicit `/watson` invocation. Users learn this contract and rely on it. After ambient mode ships, Watson also activates passively. Now there are two code paths: explicit invocation (known behavior) and ambient detection (new behavior). If ambient mode's intent classification or setup flow differs from the explicit path in any way — different questions asked, different blueprint detection logic, different routing — users experience inconsistency. They stop trusting Watson because it behaves differently depending on how it started.

**Why it happens:**
Ambient mode is treated as a separate entry point with its own setup logic. Small differences accumulate: ambient mode skips the prototype name setup question (the user didn't invoke Watson, so asking for setup feels intrusive), but then CONTEXT.md is empty when loupe runs. Or ambient mode bypasses the existing Tier 1/2/3 intent classification and does its own "detect what the user wants" logic.

**How to avoid:**
Ambient mode is a trigger mechanism only — not a separate code path. Once triggered, Watson follows the exact same setup detection → intent classification → routing flow as explicit invocation. The difference is only in how Watson starts: passively (ambient) vs. explicitly (`/watson`). Add a single condition to the opening: "If this is an ambient activation (user did not type /watson), open with a brief context check: 'It looks like you're working on [prototype name] — want help with this?' before proceeding to intent classification." This gives users an exit without forking the entire flow.

**Warning signs:**
- Ambient activation flow contains separate decision trees not present in the explicit invocation flow
- Blueprint detection logic differs between ambient and explicit paths
- Users can bypass setup questions via ambient activation (leaving CONTEXT.md empty)

**Phase to address:**
Ambient mode phase. Validate that both code paths share the same downstream logic by running the same smoke test on both activation modes before shipping.

---

### Pitfall 3: Draft State is Invisible — Users Don't Know What's "Saved"

**What goes wrong:**
The draft/commit amendment model means blueprint files have two tiers: base content (committed, authoritative) and `## Discuss Amendments` sections (exploratory, not yet built). From the user's perspective, everything looks the same — Watson confirmed the decisions, so surely they're locked in. When loupe runs later, it applies both tiers. But when the user asks "what's the current design?" they get a summary drawn from base content that omits the amendments. Or the reverse: loupe builds from amended specs, but the user thought those were still exploratory.

**Why it happens:**
The amendment model (appending `## Discuss Amendments` to blueprint files) is an implementation detail that never surfaces to the user. Discuss confirms decisions verbally but doesn't communicate clearly whether they're draft (not yet built) or committed (built and live). The user mental model is binary: "decided" vs. "not decided." Watson's model has three states: decided-not-written, decided-in-blueprint, and built-in-code.

**How to avoid:**
Watson must maintain and surface a human-readable draft/commit status. After any discuss session that produces amendments, Watson surfaces the status explicitly: "I've saved these decisions to your blueprint as drafts. They'll be applied the next time you build — want to build now or save for later?" When the user asks "what's the current state?", Watson reports both committed (built) and drafted (in blueprint, not built) decisions as distinct tiers. Never let the user leave a discuss session without knowing whether their changes are "ready to build" or "building now."

**Warning signs:**
- A user says "I thought we decided that already" after loupe builds something that doesn't match the last discuss session
- A user tries to "undo" an amendment that was never built — they don't realize it was still exploratory
- Watson summarizes blueprint state without distinguishing base content from amendments

**Phase to address:**
Draft/commit model phase. Define the three-state vocabulary (exploring, decided-drafted, built) and where each state is surfaced in the UI before writing any blueprint update logic.

---

### Pitfall 4: Session Branch Conflicts — Two Sessions, One Prototype

**What goes wrong:**
Watson 1.1 includes session management: new sessions create prototype branches. A designer starts a Watson session for the "order-management" prototype, creating branch `watson/order-management-v2`. They pause mid-session. A second team member — or the same person in a new Claude Code window — opens Watson on the same prototype. Watson creates (or tries to create) the same branch. Git rejects the branch creation or, worse, silently moves them to the existing branch with uncommitted draft changes from the first session still live in the working tree. The second session builds on top of the first session's draft — without knowing the draft exists.

**Why it happens:**
Session management is purely Claude Code skill files — no scripts, no external tooling (per Watson's constraint). Git operations are expressed as natural language instructions to the AI. There's no atomic branch-creation-with-lock mechanism available in this model. Two sessions checking "does this branch exist?" in parallel can both see "no" before either creates it.

**How to avoid:**
Watson's session management must include a branch state check before creating a new session branch. Before creating any branch: check `git branch --list watson/{prototype-name}-*` and `git status`. If a matching branch exists, surface it: "There's already a Watson session branch for this prototype — [branch name]. Want to resume from there or start a fresh branch?" Never silently create a branch that already exists and never silently resume one without telling the user. For the "no scripts" constraint: express the `git branch --list` check as an explicit bash tool call in the skill instructions, not a natural language ask.

**Warning signs:**
- Watson creates a branch named `watson/{prototype-name}-v2` when `watson/{prototype-name}-v1` already has unpushed commits
- Two sessions both write to the same blueprint directory simultaneously
- A user building a new prototype finds stale blueprint files from a prior session

**Phase to address:**
Session management phase. Branch collision detection must be built into the session start flow — not as an afterthought.

---

### Pitfall 5: Orphaned Prototype Branches Accumulate Without Cleanup Policy

**What goes wrong:**
Watson creates branches per session. Sessions are abandoned frequently — a designer starts a prototype, has a meeting, comes back the next week, and starts fresh rather than resuming. Six months later the repo has 40 `watson/prototype-name-*` branches, some with partially-built blueprints, some empty, none documented. Engineers triaging the branch list have no idea which Watson branches are alive and which are dead. PR checks start warning about open branches. The "session management" feature creates a maintenance problem.

**Why it happens:**
Branch creation is easy to automate in skill instructions. Branch cleanup requires user action or a cleanup policy. Neither is natural to define in a skill file without external tooling (which Watson explicitly excludes). Without a cleanup policy, the growth is unbounded.

**How to avoid:**
Define session lifecycle states explicitly: `active` (in-progress build), `merged` (prototype shipped to main), `abandoned` (no commits in N days). Watson must not create branches indefinitely — the session management skill should include a branch hygiene step: at the start of each new session, list existing Watson branches and flag any that have no recent activity, offering to delete them. Do not silently delete — always surface the list and ask. Keep branch names deterministic and short: `watson/{prototype-slug}` (no version number suffix by default) so there is natural a maximum of one active session branch per prototype.

**Warning signs:**
- More than one `watson/{same-prototype}` branch exists in the repo
- Watson branches are being listed in sprint reviews or PR tools as "stale"
- Engineers manually deleting Watson branches because they don't know what they are

**Phase to address:**
Session management phase. Define branch naming convention and lifecycle policy before writing the first branch creation instruction.

---

### Pitfall 6: Figma MCP Has No Direct Interaction/Prototype Data

**What goes wrong:**
Agent 3 (Interactions) is designed to "infer states from Figma." The assumption is that the Figma MCP provides prototype interaction data — transitions, hover states, click handlers, variant swaps. In reality, the Figma MCP server's `get_design_context` and related tools expose visual/layout data, variables, and component mappings. They have **no direct access to prototype interaction data or event handlers** (Figma MCP developer docs, confirmed 2026). Agent 3 dispatches against a Figma node expecting interaction data, receives only layout information, and either produces generic interactions (all hover/click boilerplate) or halts with no actionable output.

**Why it happens:**
Figma's prototype interactions live in the prototype layer — the transitions, flows, and connections between frames that are separate from the design layer. The MCP server exposes the design layer (visual properties, components, tokens). Prototype layer data is not accessible via the same API surface. This is a documented limitation, not a gap that will self-resolve.

**How to avoid:**
Agent 3 must be designed around what the Figma MCP actually provides, not what would be ideal. The correct model: Agent 3 infers interaction states from **visual evidence** in the design data (e.g., named layers like "button/hover", "card/selected", "row/loading" indicate states; variant groups suggest state machines) plus **context from discuss** (the interaction decisions captured in blueprint INTERACTION.md). Agent 3 does not attempt to read prototype connections. When visual evidence is sparse (no named variants, no interaction-suggesting layer names), Agent 3 must ask clarifying questions rather than fabricating plausible interactions.

**Warning signs:**
- Agent 3 produces interactions that aren't visually represented anywhere in the Figma frame
- Agent 3 always outputs the same generic state pattern (loading/empty/error/hover/focus) regardless of what the frame actually shows
- Agent 3 halts or returns empty output on frames that have no variant layers

**Phase to address:**
Agent 3 phase. Before writing Agent 3's instruction file, document the explicit data contract: what the Figma MCP provides, what must come from discuss context, and what must be inferred from visual evidence alone. This contract is Agent 3's input spec.

---

### Pitfall 7: Agent 3 Over-Infers Interaction State Machines from Minimal Visual Evidence

**What goes wrong:**
Agent 3 is given a Figma frame with one visible state per component — the default. No hover frame. No selected frame. No loading skeleton. Agent 3 is instructed to "infer states" and produces a comprehensive INTERACTION.md with 8 states, 4 transitions, and 3 variants. The builder implements all of them. The prototype now has interaction logic that was never discussed, never designed, and doesn't match what the designer intended. The designer sees "loading skeleton" on a page that was supposed to show static data.

**Why it happens:**
"Infer" without a ceiling is an open invitation to fabricate. Agent 3 knows good interaction design includes loading states, empty states, error states. Without visual evidence, it falls back to applying all known good patterns to every component. This is technically correct from an interaction design perspective but contextually wrong for this specific prototype.

**How to avoid:**
Agent 3's inference must be bounded by evidence tiers. Tier 1: Infer only from explicitly named variants in the Figma data (e.g., a layer group named "button/states/hover" is direct evidence). Tier 2: Infer from discuss context captured in INTERACTION.md (e.g., "user confirmed empty state needed"). Tier 3: Flag gaps for the user rather than fabricating. When neither Tier 1 nor Tier 2 evidence exists for a state, Agent 3 must list the gap explicitly ("No hover state visible in Figma — include a hover variant?") rather than adding one without asking. The INTERACTION.md output should include a `INFERRED` vs `CONFIRMED` annotation per state.

**Warning signs:**
- INTERACTION.md produced by Agent 3 has more states than the Figma frame has visually distinct elements
- The prototype has interaction logic that the designer says "I didn't ask for this"
- Agent 3 produces the same INTERACTION.md structure across wildly different Figma frames

**Phase to address:**
Agent 3 phase. Evidence tiers and the INFERRED/CONFIRMED annotation model must be in the agent's output schema before the file is written.

---

### Pitfall 8: 3-Agent Parallel Blueprint Writes Corrupt INTERACTION.md

**What goes wrong:**
3-agent parallel dispatch runs layout, design, and interactions agents simultaneously per section. Layout agent writes to `.watson/sections/{name}/LAYOUT.md`. Design agent writes to `.watson/sections/{name}/DESIGN.md`. Interaction agent writes to `.watson/sections/{name}/INTERACTION.md`. These are distinct files — no collision. But when the consolidator runs and merges section-level INTERACTION.md files into the blueprint-level `blueprint/INTERACTION.md`, it may encounter a race where Agent 3 from section A and Agent 3 from section B both attempt to append to `blueprint/INTERACTION.md` in the consolidation step. The consolidator sees both writes arriving near-simultaneously and either drops one or produces a malformed file.

**Why it happens:**
Per-section staging (`.watson/sections/`) prevents in-flight collisions, but the consolidation step merges all sections into shared blueprint files. If the consolidator is dispatched before all Agent 3 runs have completed — or if the consolidator's "wait for all agents" gate includes the wrong set — partial merges happen.

**How to avoid:**
The consolidator's wait gate must explicitly include Agent 3 alongside layout and design agents. The loupe.md subskill must enumerate all three agents in the "wait for all research agents before proceeding" step. Verify this by checking that `.watson/sections/{name}/INTERACTION.md` exists for all figma sections before the consolidator dispatches. Never dispatch the consolidator speculatively. Treat INTERACTION.md as a first-class artifact in the consolidation contract.

**Warning signs:**
- Blueprint INTERACTION.md contains content from some sections but not others after a multi-section build
- Blueprint INTERACTION.md has sections appearing in the wrong order or with duplicate headers
- The consolidator completes before Agent 3 output files are all present in `.watson/sections/`

**Phase to address:**
3-agent parallel dispatch phase. Update the loupe.md wait gate as part of adding Agent 3 to the parallel block — do not treat this as a later cleanup step.

---

### Pitfall 9: 3-Agent Parallel Creates Cascading Context Window Pressure on Multi-Section Frames

**What goes wrong:**
Watson 1.0 runs 2 agents per section (layout + design) in parallel. Watson 1.1 runs 3 per section (layout + design + interactions). For a 4-section frame, Watson 1.0 dispatches 8 background agents. Watson 1.1 dispatches 12. Each agent loads the full `libraryPaths[]` array — 9 library chapter files. At 12 concurrent agents each reading 9 files, the orchestrator's session now has 12 simultaneous sub-context windows open. Claude Code with Agent Teams gives each teammate its own 1M token context, but the orchestrating session accumulates all agent outputs as they complete. A 4-section frame with 3 agents each producing 80-line artifacts floods the orchestrator context with 960+ lines of intermediate output before consolidation.

**Why it happens:**
The per-section parallel model scales linearly with section count. 2-agent parallel was validated on a 2-section frame (Watson 1.0). 3-agent parallel on a 4-section frame is a 3x increase in concurrent agents — not yet validated. The orchestrator context window pressure wasn't a problem at 2x because the library chapter files are compact and the artifacts are short. At 3x, the cumulative load hasn't been measured.

**How to avoid:**
Validate 3-agent parallel on a 4-section frame (the realistic maximum for a Playground prototype) before shipping. Measure: time to complete, orchestrator context token consumption before consolidation, any sign of response quality degradation in later sections vs. earlier sections. If context pressure appears (responses for section 4 are shorter or miss spec details), implement a section batching strategy: run parallel agents for 2 sections, consolidate, then run next 2 sections. This prevents unbounded orchestrator context growth.

**Warning signs:**
- Section 3 or 4 builds produce code missing design token references that sections 1 and 2 have correctly
- Pipeline slows significantly after the second section completes
- Consolidator produces a merged file where later sections are less detailed than earlier ones

**Phase to address:**
3-agent parallel dispatch phase. The timing and quality verification test must include a 4-section frame — single-section smoke tests are insufficient to surface this.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Ambient trigger with broad description ("activate for frontend work") | Fewer false negatives, Watson triggers reliably | Watson fires on non-prototype tasks, annoying users in unrelated workflows | Never — add negative constraints from day one |
| Agent 3 fabricating interactions without evidence | Complete-looking INTERACTION.md every time | Prototype has undesigned interaction logic; designer loses trust in output | Never — INFERRED/CONFIRMED annotation is mandatory |
| Session branches without lifecycle policy | Fast to implement | Repo accumulates dozens of stale Watson branches | Never — define naming convention and hygiene step before first branch |
| Draft state visible only in blueprint files | Simpler architecture | Users don't know what's exploratory vs. committed; confusion on next loupe run | Never — draft/commit status must surface in Watson's language, not internal files |
| Consolidator wait gate excludes Agent 3 | Consolidator can run earlier | INTERACTION.md corrupted or missing sections in blueprint | Never — all three agents must be in the wait gate |
| 3-agent parallel validated only on 1-section frame | Faster to smoke test | Cascade context window failure discovered in production on a real 4-section prototype | Acceptable for the first smoke test, but 4-section validation is required before shipping |
| Ambient and explicit invocation diverging code paths | Easier to build ambient-specific logic | Inconsistent behavior erodes user trust | Never — ambient is a trigger only; shared flow after activation |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Figma MCP → Agent 3 | Assuming MCP exposes prototype interaction/event data | MCP exposes design layer only (visual properties, variables, components); interaction inference must come from named variant evidence + discuss context |
| Watson SKILL.md → ambient trigger | Broad frontmatter description causes false positives in non-prototype workflows | Explicit positive trigger + negative constraints + blueprint directory existence as stated condition |
| Session management → git branch creation | Creating a new branch without checking for existing Watson branches on same prototype | Check `git branch --list watson/{prototype}*` before creating; surface existing branch to user |
| Discuss amendments → loupe build | User confuses "decisions saved as draft" with "this is already built" | Watson must verbally surface draft/committed distinction at end of every discuss session |
| 3-agent parallel → consolidator | Consolidator dispatched before all three agent outputs are present | Wait gate must enumerate all three agents; verify file existence for all sections before dispatch |
| Agent 3 → INTERACTION.md schema | Agent 3 output schema undefined before writing the agent file (same error as Library schema pitfall from 1.0) | Lock INTERACTION.md schema with INFERRED/CONFIRMED annotations before writing Agent 3 |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| 3-agent parallel on large frames (5+ sections) | Context pressure on orchestrator; later sections degrade in quality | Section batching strategy: 2 sections parallel, consolidate, next 2 | 5+ section frames without batching |
| Blueprint amendments accumulating across many iterations | Old amendments from 2 sessions ago applied by builder as if current | Amendments section must be dated; Watson must surface and confirm stale amendments before build | After 3+ discuss sessions on the same prototype without a build in between |
| All 12+ background agents loading full libraryPaths[] simultaneously | Orchestrator context token count spikes before any output arrives | Validate peak token load on 4-section frame; consider lazy chapter loading for Agent 3 if it doesn't need design system chapters | Multi-section frames with 3-agent parallel |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Ambient activation with no confirmation | Watson starts a design conversation when the user is debugging a CSS bug | Ambient activation opens with a light context check: "It looks like you're working on [prototype] — want help?" with a one-click exit |
| Draft/commit language uses Watson-internal terms | Designers ask "what does 'drafted' mean?" | Use plain language: "I've saved your decisions — they'll apply next time you build" vs. "Decisions committed to blueprint as amendments" |
| Session branch selection without showing what's on it | User resumes wrong session branch with wrong prototype state | When resuming an existing branch, Watson summarizes what's on it (blueprint state, last build status) before asking to resume |
| Agent 3 asks interaction questions the designer already answered in discuss | Repeated questions erode trust in Watson's memory | Agent 3 must read INTERACTION.md from discuss before asking anything — only fill gaps, never re-ask confirmed decisions |
| Git branch names exposed to designers in Watson's language | Designers don't think in git branches; "watson/order-mgmt-v2" is opaque | Watson references sessions by prototype name and date, not branch name. Branch naming is an implementation detail. |

---

## "Looks Done But Isn't" Checklist

- [ ] **Ambient trigger isolation:** Trigger a Watson ambient activation by being in a prototype directory. Then go to a non-prototype directory and edit a utility file — verify Watson does NOT activate. Then go to a prototype directory and run a type-check command — verify Watson does NOT activate unless the user intends prototype work.
- [ ] **Draft/commit visibility:** Run a discuss session with amendments. Without building, ask Watson "what's the current state?" — verify it reports amendments as drafts (not yet built), not as committed decisions.
- [ ] **Session branch collision:** Manually create a branch named `watson/test-proto`. Then start a new Watson session on the `test-proto` prototype — verify Watson detects the existing branch and asks whether to resume or create fresh.
- [ ] **Agent 3 evidence tiers:** Run Agent 3 on a Figma frame with no named variant layers and no discuss INTERACTION.md context. Verify it flags gaps rather than fabricating states. Then run it with discuss context present — verify it uses that context and only fills gaps.
- [ ] **3-agent wait gate:** Dispatch 3 agents on a 2-section frame. Manually delay one Agent 3 by removing its output file after dispatch. Verify the consolidator does not run until all 3-agent outputs are present for all sections.
- [ ] **Blueprint INTERACTION.md consolidation:** Run a 3-section build. Verify blueprint INTERACTION.md contains entries from all 3 sections, not just the last one written.
- [ ] **Ambient + explicit code path parity:** Walk the same prototype setup flow via ambient activation and via `/watson` explicit invocation. Verify the user experience is identical after the initial activation step.
- [ ] **Orphaned branch hygiene:** Create 3 Watson session branches without committing to them. Start a new session — verify Watson lists the inactive branches and offers to clean them up.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Ambient mode false positive on non-prototype workflows | MEDIUM | Tighten frontmatter description; add explicit negative constraints; retest near-miss scenarios |
| Draft state invisible to user; user confused about build state | LOW | Add draft/commit status surfacing to discuss exit flow; no schema changes needed |
| Session branch collision or stale branch resume | LOW | Add branch existence check to session start flow; test collision scenario before shipping |
| Orphaned branches accumulated | LOW | Introduce branch hygiene step to session start; run `git branch -d` for confirmed-abandoned Watson branches |
| Figma MCP provides no interaction data; Agent 3 output empty | MEDIUM | Rewrite Agent 3 input spec to not depend on MCP interaction data; design evidence-tier model from visual data + discuss context only |
| Agent 3 fabricated interactions built into prototype | MEDIUM | Rewrite INTERACTION.md output with INFERRED/CONFIRMED tiers; add user confirmation gate for INFERRED states before builder runs |
| Blueprint INTERACTION.md corrupted by consolidation race | MEDIUM | Add Agent 3 to consolidator wait gate; rerun consolidation on affected prototype |
| Context window pressure on multi-section parallel dispatch | LOW-MEDIUM | Add section batching if 4-section test shows quality degradation; no architectural change needed if within bounds |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Ambient mode false positives on non-prototype workflows | Ambient mode phase (Phase 1) | Near-miss scenario test: non-prototype workflows in same project do not trigger Watson |
| Ambient/explicit code path divergence | Ambient mode phase (Phase 1) | Same setup flow test on both activation paths; results must be identical |
| Draft state invisible — user confusion about build state | Draft/commit model phase | User-facing summary test: ask Watson for state after discuss-only session; must distinguish drafted vs. built |
| Session branch collision | Session management phase | Collision test: existing Watson branch on same prototype detected and surfaced |
| Orphaned branch accumulation | Session management phase | Lifecycle test: new session lists inactive branches and offers cleanup |
| Figma MCP has no interaction/prototype data | Agent 3 phase | Data contract documented before agent file is written; no MCP interaction tool calls in Agent 3 |
| Agent 3 over-infers without evidence | Agent 3 phase | Evidence tier test: sparse Figma frame produces gaps list, not fabricated states |
| 3-agent wait gate excludes Agent 3 | 3-agent parallel phase | Wait gate verification: consolidator blocked until all three agent outputs confirmed |
| 3-agent context window pressure on multi-section frames | 3-agent parallel phase | 4-section frame timing + quality test: later sections match earlier section output quality |
| Blueprint INTERACTION.md race in consolidation | 3-agent parallel phase | Multi-section consolidation test: INTERACTION.md entries from all sections present |

---

## Sources

- `/Users/austindick/watson/.planning/PROJECT.md` — Watson 1.1 requirements, out-of-scope constraints, no external tooling rule (HIGH confidence — authoritative source)
- `/Users/austindick/.claude/skills/watson/SKILL.md` — Production Watson orchestrator: intent classification, routing, existing code paths (HIGH confidence — production code)
- `/Users/austindick/.claude/skills/watson/skills/discuss.md` — Blueprint amendment model, discuss-only path, return status schema (HIGH confidence — production code)
- `/Users/austindick/.claude/skills/watson/skills/loupe.md` — Pipeline orchestration, parallel dispatch wait gate, libraryPaths[] resolution (HIGH confidence — production code)
- Figma MCP Developer Documentation — `get_design_context` and related tools: "No direct access to interaction/prototype data or event handlers. State and variant information available only through component context." (HIGH confidence — official documentation, 2026)
- paddo.dev: Claude Skills: The Controllability Problem — "you can't control when skills activate. Claude decides using its own semantic understanding... there's no algorithmic matching" (HIGH confidence — 2025, verified against Claude Code skill behavior)
- Marc Bara: Claude Skills Have Two Reliability Problems, Not One — activation failure vs. execution failure taxonomy; "directive descriptions with ALWAYS invoke have ~20x higher activation odds" (HIGH confidence — 2026)
- leehanchung.github.io: Claude Agent Skills: A First Principles Deep Dive — "there is no algorithmic skill selection... the decision happens inside Claude's forward pass" (HIGH confidence — 2025)
- MAST taxonomy, arxiv 2503.13657 — 36.94% of multi-agent failures from inter-agent context loss; free-text handoffs without schemas as primary cause (HIGH confidence — peer-reviewed research, carried from Watson 1.0 research)
- Claude Code skill activation experiment (650-trial, Ivan Seleznov via Marc Bara) — negative constraints in trigger descriptions reduce false positives significantly (MEDIUM confidence — community research, not official)

---

*Pitfalls research for: Watson 1.1 — Ambient mode, draft/commit model, session management, Agent 3, 3-agent parallel*
*Researched: 2026-04-01*
