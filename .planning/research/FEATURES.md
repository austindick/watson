# Feature Research

**Domain:** Watson 1.1 — Ambient Mode & Iteration features for an AI-powered prototyping skill framework
**Researched:** 2026-04-01
**Confidence:** HIGH (framework internals from existing codebase), MEDIUM (expected behavior patterns for ambient/session features), LOW (competitive parallels — no direct analogues exist)

---

## Scope Note

This research covers only the **five new features in Watson 1.1**. The existing Watson 1.0 foundation (orchestrator, library system, discuss subskill, loupe pipeline, 7 agents, blueprint system) is treated as given. References to existing behavior are provided only to clarify dependencies and avoid re-inventing decisions already made.

---

## Feature Landscape

### Table Stakes (Users Expect These)

These are the minimum viable behaviors for each feature. Missing them means the feature is either broken or feels unfinished. Complexity is scoped to implementation inside Claude Code skill files only — no scripts, CLIs, or build tooling.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Ambient mode triggers on natural prototype-related messages | Designers expect a frictionless entry point. Repeating `/watson` every session is friction. The current trigger already accepts "build a prototype" — ambient mode extends this to directory-aware context. | MEDIUM | SKILL.md frontmatter `use_when` is the activation surface. Extend trigger patterns; add directory-presence detection as a signal. Watson already infers prototype directory — ambient just broadens when Watson activates. |
| Ambient mode recognizes returning users silently | If a user is in a prototype directory mid-build and types a question about the UI, Watson should answer with prototype context loaded — not start a fresh setup flow. | MEDIUM | Blueprint state detection (already in SKILL.md) determines new vs returning. Ambient mode reuses this logic. The difference is activation without `/watson` prefix. |
| Draft state is the default for discuss amendments | Designers expect to freely explore changes without accidentally committing to a direction. Amendments should feel exploratory until explicitly confirmed. | LOW | Currently, discuss amendments append to `## Discuss Amendments` sections in blueprint files immediately and permanently. Draft mode adds a "pending" layer before they become canon. Conceptually simple; implementation requires a new state signal. |
| Commit locks blueprint amendments explicitly | Users expect a clear moment when "we're going with this." Without explicit confirmation, it's ambiguous what's decided vs what's being explored. | LOW | A user-facing confirmation step after the discuss summary. Maps to the existing "Ready?" AskUserQuestion at end of discuss — that becomes the commit gate for amendments. Low new implementation work; mostly re-framing existing behavior. |
| Session start recognizes existing prototype | When a designer opens a prototype directory, Watson should greet them with relevant context: "You're working on [name] — your order-table and header sections are built." Not ask "which prototype?" from scratch. | MEDIUM | Already partially implemented in Setup Detection (SKILL.md). Session management formalizes this into a predictable pattern: check blueprint, check src/ for built sections, summarize state in ≤3 lines. |
| Agent 3 (Interactions) produces INTERACTION.md per section | The builder already accepts an `interactionPath` input and has a fallback for when it's null. Users expect interaction specs to actually exist rather than always falling back to "library defaults only." | HIGH | This is a full new agent. The stub exists (`interaction.md`) with a contract defined. The complexity is in Figma state inference: identify variant groups, infer states from layer naming conventions, produce a structured spec without over-specifying. |
| 3-agent parallel dispatch runs layout + design + interactions simultaneously | Users expect the build phase to not get slower as Watson gains capabilities. Adding interactions as a sequential step would noticeably increase pipeline time. | MEDIUM | The loupe subskill already dispatches layout + design as background agents in parallel and waits for both before proceeding. Extending to 3-agent parallel is a mechanical addition to the wait condition in Phase 2 of loupe.md. Requires interaction agent to be background-capable. |

---

### Differentiators (Competitive Advantage)

These are the features that make Watson 1.1 meaningfully better for the target user (designers and PMs in the Faire Prototype Playground), not just feature-complete.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Ambient mode with prototype-directory awareness | Watson activates when you're *in the context* — not when you remember to invoke it. No other AI design tool does context-aware activation from directory presence. Feels like an always-available design partner rather than a tool you have to summon. | MEDIUM | Directory detection is a signal, not a gate. Watson activates when: (1) use_when trigger matches AND (2) current directory or conversation references a known prototype path. Avoids false activations in non-prototype directories. |
| Draft/commit model as a design thinking pattern | Framing blueprint amendments as "draft" vs "committed" maps to how designers actually think. Exploration is cheap; decisions are expensive. Watson 1.1 makes this distinction explicit in the workflow rather than treating all blueprint writes as final. | LOW | The UX distinction matters more than the implementation. The commit moment should feel like a deliberate design decision, not a technicality. Use design language: "lock in these decisions" not "commit amendments." |
| Session continuity: prototype state at a glance | First message of a session surfaces what's been built and what's pending. Designers don't have to remember or re-read files to orient Watson. Reduces the "cold start" overhead of every session. | MEDIUM | Summarize 3 things: prototype name/description (CONTEXT.md), sections built (src/ scan), and pending blueprint decisions (Discuss Amendments sections). Format: 2-3 lines max. Do not ask questions before showing context — show it first, then ask what to do next. |
| Agent 3 (Interactions) consuming discuss context | When discuss has already gathered interaction decisions (states, transitions, user flows), the interaction agent skips re-asking and works directly from that context. This is the "dedup contract" applied to interactions — decisions made in conversation shouldn't be rediscovered by the pipeline. | HIGH | The discuss-to-interaction handoff requires discuss to emit an `interactionContext` object in the return status, and loupe to pass it to the interaction agent. Agent receives it via `interactionContext` (already in the contract stub). If context is null, agent falls back to Figma state inference. |
| Figma state inference from variant groups | Rather than asking the designer to describe every interactive state, the interaction agent reads Figma variant properties and infers the state machine. A component with variants named "hover", "active", "disabled" maps directly to interaction states without human intervention. | HIGH | State inference requires reading the Figma component tree at a section level, identifying variant group boundaries, and mapping Figma variant names to interaction state vocabulary. This is the highest-complexity task in Watson 1.1 but also the highest-value: it replaces what would otherwise be a long manual describe-your-states conversation. |

---

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Ambient mode that activates in any directory | Maximum convenience — Watson is always available | False activations outside prototype directories pollute conversations. Watson activating on a general coding question is disorienting and wastes context. The Prototype Playground has a known project structure; Watson should scope to it. | Activation requires at least one matching signal: prototype directory structure detected (src/prototypes/ or blueprint/ present), OR explicit prototype-related language in the message. Two-signal requirement prevents accidental activation. |
| Auto-committing blueprint amendments on any user acknowledgment | Reduces friction — "yeah that works" shouldn't require an extra step | "That sounds good" in the middle of a conversation is not the same as "yes, commit that to the blueprint." Auto-committing on ambiguous acknowledgment silently locks decisions the designer didn't intend to finalize. This is the biggest trust-killer for the draft/commit model. | Commit requires the explicit confirm step at the end of the summary: the "Ready?" AskUserQuestion already serves this purpose. Nothing commits on conversational acknowledgment mid-discussion. |
| Session management via git branch automation | Feels like a logical extension — new prototype session = new branch | Watson is a purely Claude Code skill framework with no external tooling. Running git commands from within a skill file introduces side effects outside Watson's control. Git discipline is an engineering concern; Watson is a design tool. If a branch already exists from a prior session, Watson can surface that fact, but must never create, switch, or merge branches. | Watson surfaces the session state (what's built, what's pending) and lets the user manage their own git workflow. Watson's "session" is the blueprint state — not the git branch. |
| Interaction agent that specifies animation curves and durations | More complete spec for engineers | Interaction specifications at the curve/duration level require precise values Watson can't reliably infer from Figma data alone. Specifying `cubic-bezier(0.4, 0, 0.2, 1)` for an easing function that Figma only labels "Ease In Out" adds false precision that will be overridden by the engineer anyway. | Interaction agent outputs state names, transitions (what triggers what), and animation intent ("smooth fade", "slide from right") without numeric timing values. Builder uses library component built-in animations for anything not explicitly specified. |
| Interaction agent running as foreground (interactive) during the pipeline | Seems like it would allow the interaction agent to ask clarifying questions in real-time | Foreground agents block the pipeline and require user attention at an unexpected moment mid-build. The user approved the build already — interrupting to ask interaction questions breaks the "just build" expectation. | All interaction context is gathered before the pipeline starts (either by discuss or by Figma inference). If both fail (no discuss context, no Figma variants), the interaction agent falls back to "library component default states" and logs the gap — it does not interrupt. |
| Draft state stored as a separate file (e.g., DRAFT-DESIGN.md) | Clean separation between tentative and committed | A separate file per draft creates file management complexity: which file does the builder use? What happens when draft is committed — copy to real file? Discard? This inverts the current clean contract where agents have deterministic output paths. | Draft state is a flag/section appended to the existing blueprint file (`## Pending Amendments` → `## Discuss Amendments` on commit). The same file serves both states. Agents always read the file; builder treats `## Pending Amendments` as informational (not yet committed) and `## Discuss Amendments` as binding. |
| 3-agent parallel dispatch for discuss-only sections | Consistency — all sections get the same treatment | Discuss-only sections have no Figma node. The interaction agent's primary input is a `nodeId` for Figma state inspection. Running it on a discuss-only section means it can only work from `interactionContext` — which discuss already wrote to INTERACTION.md in the blueprint. Running the agent adds overhead with no new information. | Skip the interaction agent for discuss-only sections, exactly as the layout and design agents are already skipped today. The builder reads the blueprint INTERACTION.md directly for these sections. |

---

## Feature Dependencies

```
Ambient Mode
    └──requires──> SKILL.md use_when trigger extension (broader activation patterns)
    └──requires──> Session continuity: state summary (what to show when activating automatically)
    └──reads──> blueprint/CONTEXT.md (to detect prototype and summarize state)
    └──reads──> src/ directory (to determine which sections are built)
    └──enhances──> Session management (ambient activation IS the new session start behavior)

Draft/Commit Amendment Model
    └──extends──> discuss.md "Discuss Amendments" write behavior (already exists)
    └──extends──> discuss.md "Ready?" confirmation (becomes the commit gate)
    └──requires──> New amendment state: "pending" vs "committed" (structural addition to blueprint files)
    └──feeds into──> Builder (builder must distinguish pending from committed amendments)
    └──feeds into──> Session continuity summary (surfaces "you have pending amendments" on session start)

Session Management
    └──requires──> Ambient mode (session detection IS ambient activation with context summary)
    └──reads──> blueprint/CONTEXT.md (prototype name, description, PDP stage)
    └──reads──> src/ directory scan (which sections are implemented)
    └──reads──> blueprint files for Discuss Amendments sections (pending decisions)
    └──does NOT touch──> git (no branch creation, switching, or merging)

Agent 3 (Interactions)
    └──requires──> Figma MCP access (mcp__figma__get_figma_data — already available)
    └──accepts (optional)──> interactionContext from discuss return status
    └──reads──> libraryPaths (to validate state vocabulary against design system)
    └──writes──> .watson/sections/{sectionName}/INTERACTION.md
    └──feeds into──> Builder (interactionPath input — currently always null in Watson 1.0)
    └──requires──> discuss.md to emit interactionContext in return status (new field)
    └──requires──> loupe.md to pass interactionContext to interaction agent dispatch

3-Agent Parallel Dispatch
    └──requires──> Agent 3 (Interactions) to exist and be background-capable
    └──extends──> loupe.md Phase 2 Research: add interaction agent dispatch alongside layout + design
    └──requires──> loupe.md wait condition: wait for layout + design + interactions before Phase 3
    └──skips──> discuss-only sections (same skip rule as layout + design agents)
    └──requires──> loupe.md to pass interactionContext to interaction agent (from discuss return status)

Draft/Commit ──enhances──> Session Management (pending amendments surfaced on session start)
Ambient Mode ──enables──> Session Management (ambient activation triggers state summary)
Agent 3 ──enables──> 3-Agent Parallel Dispatch (prerequisite — must exist first)
discuss interactionContext ──enhances──> Agent 3 (reduces/eliminates Figma inference when context is pre-gathered)
```

### Dependency Notes

- **Ambient mode and session management are the same feature with two aspects:** Ambient mode is how Watson activates; session management is what it says when it does. They share the same blueprint-reading and src-scanning logic. Build them together, not separately.
- **Draft/commit is an extension of existing discuss behavior, not a new system:** The "Discuss Amendments" pattern already exists. Draft/commit adds a temporal distinction (pending vs committed) to something already being written. The commit gate is already there — it's the "Ready?" AskUserQuestion. 1.1 formalizes the semantics.
- **Agent 3 must be built before 3-agent parallel dispatch:** The parallel dispatch is a mechanical loupe.md change that requires the agent to exist. Do not design the parallel dispatch logic before the agent contract is finalized.
- **discuss must emit interactionContext for Agent 3 to be fully useful:** Without it, Agent 3 always falls back to Figma inference. The highest-value path is discuss-gathered context flowing directly to the agent. The return status schema addition is small but must not be forgotten.
- **Builder already accepts interactionPath — no builder changes needed for Agent 3:** The builder contract stub has `interactionPath` as an input. When Agent 3 produces INTERACTION.md, loupe passes the path to builder. This was designed in Watson 1.0 precisely for this moment.

---

## MVP Definition

### Launch With (Watson 1.1)

Minimum viable for the milestone goal: Watson feels native to the Prototype Playground — activates automatically, supports iterative workflows, manages sessions, and unlocks interaction-aware prototyping.

- [ ] Ambient mode — SKILL.md `use_when` extended with directory-aware activation patterns; activates on prototype-related messages without `/watson` prefix
- [ ] Session continuity state summary — on session start, Watson shows prototype name + built sections + pending amendments in ≤3 lines before asking what to do
- [ ] Draft/commit amendment model — `## Pending Amendments` section distinct from `## Discuss Amendments` in blueprint files; pending → committed on discuss summary confirmation
- [ ] Agent 3 (Interactions) — full implementation of `interaction.md`: Figma variant group inspection, state inference, `interactionContext` passthrough, INTERACTION.md output under 50 lines
- [ ] discuss emits interactionContext in return status — new field in the return status schema from discuss.md
- [ ] 3-agent parallel dispatch in loupe.md — interaction agent dispatched alongside layout + design in Phase 2; wait condition updated to require all three; discuss-only sections skip interaction agent

### Add After Validation (Watson 1.1.x)

- [ ] Cross-session preference memory (user's "just build" preference persists across sessions) — SKILL.md currently tracks this within-session only; persistence requires blueprint CONTEXT.md annotation
- [ ] Interaction agent confidence scoring — agent flags when Figma variant inference is uncertain (e.g., ambiguous variant naming like "state-1", "state-2") rather than silently producing a guess

### Future Consideration (Watson 1.2+)

- [ ] `understand` subskill — PRD ingestion → CONTEXT.md enrichment; higher value once designers are using Watson for Understand-stage work
- [ ] `explore` subskill — competitive pattern review before the discuss conversation; valuable but discuss already has a "pattern research" step that covers the core need

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Ambient mode (activation without /watson) | HIGH | LOW | P1 |
| Session continuity state summary | HIGH | MEDIUM | P1 |
| Draft/commit amendment model | MEDIUM | LOW | P1 |
| Agent 3 (Interactions) — Figma state inference | HIGH | HIGH | P1 |
| discuss emits interactionContext | MEDIUM | LOW | P1 |
| 3-agent parallel dispatch | MEDIUM | MEDIUM | P1 |
| Cross-session preference memory | LOW | LOW | P2 |
| Interaction agent confidence scoring | LOW | LOW | P2 |

**Priority key:**
- P1: Required for Watson 1.1 milestone
- P2: Good-to-have in 1.1 if time allows, otherwise 1.1.x
- P3: Future milestone

---

## Per-Feature Detail: Minimum Viable vs Delight vs Trap

### Ambient Mode

**Minimum viable:** SKILL.md frontmatter trigger patterns extended to activate on "build", "prototype", "redesign", or any design-adjacent verb without requiring `/watson`. Existing blueprint detection (new vs returning) runs immediately on activation.

**Delight:** On ambient activation in an existing prototype directory, Watson's first message is a one-liner context summary ("You're working on Order Management — header and order-table are built, order-sidebar is in progress") before asking what to do. Feels like Watson was already reading over their shoulder.

**Trap to avoid:** Over-broad activation. Adding "help" or "change" to the trigger patterns causes Watson to activate on non-prototype conversations. Stick to: explicit prototype language OR (design-adjacent verb AND prototype directory signal). Two-signal requirement for ambiguous activations.

---

### Draft/Commit Amendment Model

**Minimum viable:** After mid-build discuss, amendments go to a `## Pending Amendments` section instead of `## Discuss Amendments`. The commit moment is the existing "Ready?" AskUserQuestion response of "Let's build" — at that point, pending amendments are renamed/promoted to `## Discuss Amendments`. If the user chooses "Save for later" instead, amendments remain pending. On next session, the state summary flags "you have 3 pending amendments."

**Delight:** At the commit gate, Watson shows a diff-style summary: "These 3 decisions will be locked in: [list]." One more confirmation before writing. Designers feel in control.

**Trap to avoid:** Complex state machine with many transitions (pending → reviewing → committed → archived). Start with two states only: pending and committed. The distinction maps to one real question: "has this been explicitly confirmed by the user?" Yes = committed. No = pending.

---

### Session Management

**Minimum viable:** On session start (ambient or explicit /watson activation), Watson reads CONTEXT.md, scans src/ for built section markers, and reads blueprint files for `## Pending Amendments` sections. Produces a 2-3 line context summary before the first user interaction.

**Delight:** The summary is written in design language, not file-system language. "You're building the Order Management prototype. The header and main table are done. You've got some uncommitted decisions about the sidebar layout." Not "blueprint/CONTEXT.md populated, 2 sections in .watson/, 3 Pending Amendments in LAYOUT.md."

**Trap to avoid:** Conflating session management with git workflow. Watson describes state — never creates or switches branches. If a designer asks "should I start a new branch?", Watson answers conversationally but does not run any git command.

---

### Agent 3 (Interactions)

**Minimum viable:** Agent reads `nodeId` from dispatch, calls `mcp__figma__get_figma_data` scoped to that node, identifies component variant groups (components with multiple variants), infers state names from variant property names ("hover", "active", "error", "disabled", "loading"), and writes a structured INTERACTION.md under 50 lines. If `interactionContext` is provided from discuss, skips Figma inference for any states already described and uses the discuss context directly.

**Delight:** Agent distinguishes between confirmed states (explicitly named variants in Figma) and inferred states (heuristic guesses from layer names or structure), and marks inferred states clearly in the output. Builder knows which states have Figma backing and which are guesses.

**Trap to avoid:** Over-inferring. If a Figma section has no variant groups and discuss provided no interaction context, the agent should produce a minimal INTERACTION.md noting "no variant groups detected — builder will use library component defaults." Do NOT fabricate states from thin air. A sparse INTERACTION.md that's honest is better than a rich one that's invented.

---

### 3-Agent Parallel Dispatch

**Minimum viable:** loupe.md Phase 2 dispatches layout, design, AND interaction agents simultaneously as background agents for each figma section. The wait condition changes from "wait for layout + design" to "wait for layout + design + interaction." Interaction agent receives `nodeId`, `sectionName`, `blueprintPath`, `libraryPaths`, `watsonMode: true`, and `interactionContext` (null if discuss didn't provide one). Discuss-only sections skip all three research agents, same as today.

**Delight:** Progress message updates: "Mapping out the [section name]..." covers all three agents. No separate "analyzing interactions..." message — keep it a single beat in designer language.

**Trap to avoid:** Letting the interaction agent's null-case (no variants found, no discuss context) block the pipeline. If interaction agent produces no output (or fails), loupe logs it and proceeds with `interactionPath: null` — exactly the same as today. The parallel dispatch must be robust to the interaction agent producing nothing.

---

## Competitor Feature Analysis

No direct analogues exist for this specific feature set (ambient activation + draft/commit amendment model + session continuity for an AI prototyping skill). The following table assesses directional parallels:

| Feature | GitHub Copilot Workspace | Cursor | Figma Make | Watson 1.1 approach |
|---------|--------------------------|--------|------------|---------------------|
| Context-aware activation | Workspace-scoped (always on in repo) | File-focused (current file context) | Figma-scoped (Figma canvas only) | Blueprint-directory scoped — activates when design work is detected |
| Draft/exploratory state | Branch-based (implicit — uncommitted changes are drafts) | None — all edits are immediate | None | Explicit pending/committed distinction within blueprint files |
| Session continuity summary | Workspace overview (issues, PRs, file changes) | None | None | Prototype-specific state: name, built sections, pending decisions |
| Interaction spec inference | None | None | Limited (Figma component props) | Figma variant group inspection + discuss context passthrough |
| Multi-agent parallel execution | None | None | None | Background agent parallelism, already validated in 1.0 |

**Key insight:** Watson's draft/commit model is more fine-grained than git-branch drafting because it operates at the decision level, not the file level. A designer can have committed decisions about layout and pending decisions about interactions in the same prototype, simultaneously. This granularity has no direct analogue.

---

## Sources

- Watson SKILL.md, discuss.md, loupe.md, interaction.md — source of truth for existing contracts, existing behavior, and agent stub definitions (`/Users/austindick/.claude/skills/watson/`)
- Watson PROJECT.md — milestone goals, out-of-scope decisions, constraints (`/Users/austindick/watson/.planning/PROJECT.md`)
- Watson 1.0 FEATURES.md — prior research establishing context for what's already built (`/Users/austindick/watson/.planning/research/FEATURES.md`)

---

*Feature research for: Watson 1.1 — Ambient Mode & Iteration*
*Researched: 2026-04-01*
