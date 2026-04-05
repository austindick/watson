# Watson: AI-Powered Product Development for Faire

## The Opportunity

AI is fundamentally changing the leverage of product development. What used to take weeks of alignment, wireframing, and iterative design now compresses into hours. But as the cost of building decreases, the cost of poor judgment increases. The constraint is no longer *can we build it* — it's *are we building the right thing, at the right quality, grounded in real customer context?*

Watson is built for this moment. It's an AI design companion that amplifies product judgment — giving designers and PMs a thinking partner that speaks their language, knows Faire's design system, and turns decisions into working prototypes. The human focuses on *what* to build and *why*; Watson handles the rest at speed, with structural quality guarantees, and without losing a single decision along the way.

## How Watson Delivers

The insight behind Watson's architecture is that **product context should compound, not evaporate**.

Today, context is the most expensive thing in product development. A designer spends weeks building a mental model — user research, design system constraints, prior decisions, competitive patterns — and that model lives in their head. When they context-switch, go on vacation, or hand off to engineering, the model degrades. The next person reconstructs it from scattered artifacts, losing nuance along the way. Over time, the same problems are rediscovered, the same questions re-asked, and the same trade-offs re-debated.

Watson inverts this through two systems that make context durable:

**The blueprint system** captures every design decision in structured files that persist across sessions. When a PM revisits a prototype two weeks later, Watson picks up exactly where they left off — not from a vague summary, but from the actual decisions, constraints, and design context that were locked in. Decisions flow forward: customer insight into design choices, design choices into blueprints, blueprints into code, code into SDD specs. Nothing is reconstructed from memory.

**The library system** is a structured, pre-processed reference layer that grounds every interaction in real context. The design system book contains every Slate component's API, variants, and tokens. The playground conventions book captures Faire's scaffolding patterns and project structure. Future books will add business context, user archetypes, content guidelines, and research findings. When Watson suggests a component or evaluates a trade-off, it draws from this shared knowledge base — the same one every agent and subskill reads from. Context isn't just captured; it accumulates into a permanent, growing foundation that gets richer with every prototype built on top of it.

Together, these systems mean that product judgment compounds. Teams don't just make better decisions — they make better decisions *faster*, because each decision builds on a foundation of prior context rather than starting from scratch.

## How It Maps to the PDP

**Understand** — Watson ingests PRDs, user research, and problem context. It asks clarifying questions, surfaces gaps, and captures structured decisions that flow forward into every subsequent stage. Nothing gets lost between a Notion doc and a prototype.

**Explore** — Watson becomes a design thinking partner. It references competitive patterns, suggests approaches grounded in what Slate actually offers, and helps teams evaluate trade-offs before committing. Multiple directions can be explored as concrete prototypes, not abstract wireframes — lowering the cost of exploring the right solution before building the wrong one.

**Build** — Watson takes design decisions (from conversation or Figma frames) and builds high-fidelity prototypes using real Slate components and tokens. A multi-agent pipeline handles decomposition, layout analysis, design token extraction, code generation, and fidelity review — each agent focused on one job, reading from the same library, producing structured artifacts that downstream agents can rely on.

**Ship** — Prototype decisions become the foundation for SDD specs. Engineers receive specs that trace back to specific design choices — no ambiguity, no reconstruction from memory.

## Why This Matters Now

Watson addresses structural challenges that Faire's leadership has identified as critical to the next stage of growth:

**Quality is structural, not conditional.** Watson doesn't know how to build outside Faire's design system. Every prototype uses real Slate components with correct props, variants, and tokens — not because someone checked, but because the library system makes the design system the only vocabulary available. The quality bar is built into the tool, not negotiated per project. This is what "raise the bar on quality through shared standards" looks like when it's embedded in the workflow rather than enforced through review.

**Exploration becomes concrete and fast.** Instead of debating approaches in a meeting or waiting for static mocks, teams can explore three directions as working prototypes in the time it used to take to align on one wireframe. User testing happens against real interactions. This is what increased AI capacity should unlock: more confidence before shipping, not just more shipping.

**Customer insight compounds into the work.** The library and blueprint systems ensure that context from user research, design decisions, and prior prototypes is structurally embedded — not dependent on who happens to remember it. Teams build on what's already known rather than starting from scratch each cycle.

**Cross-functional collaboration compresses.** Watson speaks design language to designers, captures structured decisions for engineers, and maintains traceability for PMs. Product, design, and engineering work from the same living artifacts rather than handing off between disconnected tools and documents.

## Where We Are

**Watson 1.0 is shipped.** The foundation is in production: orchestrator, design conversation, Figma-to-code pipeline, library system backed by real Slate, and persistent blueprints. End-to-end flow verified: `/watson` through design discussion to pixel-accurate prototype with real Slate components.

**Watson 1.1 is in progress.** Watson becomes a persistent companion rather than a one-shot pipeline:
- Ambient activation — Watson offers to activate when working in the Prototype Playground, no `/watson` required
- Draft/commit amendment model — design decisions are exploratory by default, explicitly locked in when ready
- Session management — Watson handles prototype branches automatically
- Interaction agent + 3-agent parallel dispatch — faster, richer builds

| Milestone | Focus | Key Unlock |
|-----------|-------|------------|
| **1.0** (Shipped) | Foundation | Orchestrator, library, blueprint, 7-agent pipeline, discuss + loupe |
| **1.1** (In progress) | Ambient Mode & Iteration | Persistent companion, draft/commit, session management, interaction agent |
| **1.2** | Core Workflows | `understand` + `explore` subskills — full PDP coverage |
| **1.3** | SDD Integration | Auto-generate specs from prototype decisions for engineer handoff |
| **1.4** | Extended Capabilities | Content design, debugging, research subskills; additional library books |

## The Throughline

A product team should be able to go from "here's a problem we've validated" to "here's a spec engineers can build from" without context leaving the system. Every decision is grounded in real customer context, built with real design system components, and traceable from insight through prototype to production.

Watson doesn't replace product judgment — it amplifies it. In an era where the cost of building is approaching zero, the teams that win are the ones with the best judgment about *what* to build. Watson makes it easy to act on that judgment quickly, at a high quality bar, without losing the thread.

---

*Built by Austin Dick. Runs entirely within Claude Code — no infrastructure, no maintenance overhead, no additional cost.*
