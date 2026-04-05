# Watson Guide

## What is Watson?

Watson is a design prototyping companion that lives inside Claude Code. It helps you go from a design idea or Figma frame to a working, interactive prototype in the Faire Prototype Playground. Whether you want to explore a concept through conversation, translate a Figma comp into code, or do both at once, Watson handles the full journey.

Everything Watson builds is grounded in Faire's Slate design system. When it suggests a component, that component actually exists with the exact props, variants, and tokens available to you. Watson does not invent components or guess at design patterns -- it works with the real system.

---

## Getting Started

Open Claude Code in your Prototype Playground repo and type:

| Command | What it does |
|---------|--------------|
| `/watson` | Start Watson. It figures out what you need based on context. |
| `/watson discuss` | Jump straight into a design conversation. |
| `/watson loupe` | Jump straight into building from a Figma frame or prior conversation. |
| `/watson help` | Quick overview of what Watson can do. |

You can also describe what you want naturally -- "I want to prototype a bulk order flow" or "build this Figma frame" -- and Watson will pick up on the intent.

### New prototypes

The first time you start a prototype, Watson asks a few quick setup questions:

- **Prototype name** -- what you want to call it
- **Surface area** -- Brand, Retailer, Creative, or something else
- **Your name and GitHub username** -- for contributor attribution
- **Brief description** -- one sentence on what this prototype explores

This takes about 30 seconds and only happens once per prototype.

### Returning to an existing prototype

Watson detects when you already have a prototype in progress. It reads your current decisions and build state, then summarizes where things stand so you can pick up where you left off. No need to re-explain anything.

---

## Three Ways to Use Watson

### 1. Design Conversation

Best for: exploring ideas, making decisions about layout and interaction, working through complex flows before building.

Invoke with `/watson discuss` or just describe what you want to explore. Watson opens a focused design conversation where it asks concrete questions with 2-4 options each. You pick one, reference it by number, or say "other" and describe your own direction.

Watson covers the key decisions:

- What scenario the prototype explores
- How the layout is organized
- Which Slate components to use and how
- How interactions and state changes work

Every suggestion comes from the real design system -- real component names, real tokens, real patterns. If what you describe does not map to an existing component, Watson will say so rather than making something up.

**For simple asks** (a single static layout, a quick visual test, a one-component demo), Watson skips the conversation entirely and moves straight to building.

**For complex flows** (multi-step interactions, multiple states, conditional logic, cross-component orchestration), Watson goes deeper -- more questions, more options, more grounding in the design system.

When the conversation wraps up, Watson saves your decisions to a blueprint and can start building immediately, or you can come back to it later.

### 2. Figma-to-Code

Best for: translating a polished (or rough) Figma frame into a working prototype with real Slate components.

Provide a Figma frame URL when you invoke Watson, or use `/watson loupe` with the link. Here is what happens:

1. Watson analyzes your Figma frame and breaks it into logical sections
2. For each section, it extracts the layout and identifies spacing, colors, typography, and components
3. It builds each section using Slate components and playground conventions
4. A review pass checks the result against your Figma frame
5. Everything is assembled into a working prototype

The result is a prototype built with real components and proper design tokens -- not a screenshot recreation or raw HTML.

**Tip:** Whole-frame URLs work best. Watson decomposes the frame into sections automatically. For complex multi-page flows, consider starting with a design conversation so Watson understands the full picture before building.

### 3. Hybrid

Best for: prototypes where some sections come from Figma and others are exploratory ideas you have not designed yet.

During a design conversation, you can mark some sections as Figma-backed (with URLs) and others as conversation-driven. When Watson builds:

- **Figma sections** go through the full visual pipeline -- layout extraction, design mapping, component matching
- **Conversation sections** are built from the decisions you made during the discussion -- the components you chose, the layout you described, the interactions you defined

This means you can prototype a screen where the header comes from a polished Figma comp and the body is an idea you talked through, all assembled in the same build.

---

## What to Expect During a Session

### Complexity scaling

Watson adapts to the size of your ask:

- **Simple requests** (single layout, quick visual, one component) build fast with minimal questions
- **Medium requests** get a short, focused conversation to lock down key decisions
- **Complex requests** (multi-step flows, multiple states, data-heavy screens) get a deeper design discussion to avoid rework

You always have the option to skip the conversation and go straight to building if you know what you want.

### From conversation to build

When a design conversation reaches a natural stopping point, Watson transitions to building automatically. You will see a message like "I have what I need -- building now." There is no manual handoff step.

### Progress updates

During the build, Watson shares progress in plain language -- "Analyzing your Figma frame," "Building the header section," "Reviewing against your decisions." You do not need to do anything during the build; Watson will surface the result when it is ready.

---

## Mid-Build Changes

Already building and realize something needs to change? Invoke `/watson` again on the same prototype.

Watson reads the current state -- what has been decided, what has been built -- and adapts. You can:

- **Revisit a decision** -- "Let's change the table to a card grid"
- **Add a new section** -- "I want a filter sidebar on the left"
- **Refine interactions** -- "The modal should close on outside click"

Watson only asks about what is actually changing. It skips anything that has already been decided and built, so you are not starting from scratch.

---

## Tips

### What works well

- **Start with the problem, not the solution.** "We want to test whether retailers find bulk actions faster with a toolbar vs. inline controls" gives Watson more to work with than "build me a table with checkboxes."
- **Bring your Figma link early.** Even a rough frame helps Watson make better decisions during the conversation.
- **Use discuss for complex flows.** If your prototype has multiple states or multi-step interactions, the design conversation saves iteration time.
- **Be specific when redirecting.** "Change the second section to use cards instead of a list" is faster than "I don't like that part."

### What to bring

- A Figma frame URL, if you have one
- A clear sense of what you are testing or exploring
- Any constraints -- "mobile only," "existing components only," "three steps max"

### What you do not need

- Technical knowledge of React, TypeScript, or the playground codebase
- A complete, polished Figma file -- rough frames work fine
- To remember previous decisions -- blueprints persist across sessions, so Watson always knows where you left off

### About blueprints

Every Watson prototype has a blueprint -- a small set of files that capture your design decisions: the scenario, layout, component choices, and interactions. The blueprint persists across sessions. If you close Claude Code and come back tomorrow, Watson reads the blueprint and picks up exactly where you left off.

You generally do not need to touch the blueprint directly. Watson maintains it as you make decisions through the conversation. But it is plain Markdown in your prototype's `blueprint/` folder if you want to review or hand-edit anything.
