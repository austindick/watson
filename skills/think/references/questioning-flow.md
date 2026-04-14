---
name: questioning-flow
type: reference
description: "Conversation engine for /think — question discipline, gentle challenges, core questions, contextual questions, pattern research"
---

# Reference: Questioning Flow

This reference file is loaded by /think's SKILL.md. It contains the full conversation engine for design discussion — question discipline, challenge patterns, core and contextual questions, and pattern research.

---

## Phase 3: AskUserQuestion Discipline

Use AskUserQuestion throughout the conversation to present concrete options. This keeps the conversation focused, fast, and action-oriented.

**Rules (apply without exception):**
- **2–4 options** per question — concrete and specific, not generic categories
- **Headers max 12 characters** — abbreviate if needed (e.g., "Interactions" → "Interact", "Components" → "Comp")
- **"Other" is added automatically** — users can reference options by number (e.g., "#2 but without the modal")
- **Freeform escape:** If the user picks "Other" and wants to explain freely ("let me describe it"), switch to plain text follow-up. Resume AskUserQuestion after processing their response.
- **Don't interrogate.** Ask one question at a time. Follow the thread of what the user is saying. Build on answers — don't walk a checklist.
- **Skip obvious questions.** If the answer is clear from blueprint state or conversation context, don't ask.

**Format example:**
```
- header: "Scenario"
- question: "What's the core user problem this explores?"
- options: ["Browse + compare products", "Manage orders in bulk", "Configure account settings"]
```

---

## Phase 4: Gentle Challenges

Act as a thoughtful design partner — not just a question-asker. Selectively challenge decisions when it adds value.

**Challenge when:**
- The designer picks a more complex pattern when a simpler one would work (drawer vs full page, tabs vs scroll, drag-drop vs reorder buttons)
- There's an accessibility implication they may not have considered (keyboard navigation, screen reader semantics, touch targets)
- A content decision is missing that will visibly affect the prototype (empty state copy, CTA labels, error messages)

**Don't challenge when:**
- The choice is standard for the context (a table for tabular data, a modal for confirmation)
- The designer gives a reason with their choice — accept it and move on
- It would just be noise that slows down the conversation

**When challenging,** present the alternative as an AskUserQuestion option alongside their choice:
```
- header: "Layout"
- question: "Tabs could work — though with only 3 sections, would a single scrollable page be simpler?"
- options: ["Tabs", "Scrollable page"]
```

**Tone:** Curious, not confrontational. If the designer has a clear reason, move on — don't belabor the point.

---

## Phase 5: Core Questions (always ask — unless already answered in blueprint)

Work through these using AskUserQuestion. Present concrete options based on what you know about the prototype. Ground options in library book data: name real components, reference real conventions.

**1. Scenario**
```
- header: "Scenario"
- question: "What's the core user problem this prototype explores?"
- options: [2–3 likely scenarios based on the request context, "Let me describe it"]
```

**2. User Flow**
```
- header: "Flow"
- question: "What's the primary user flow?"
- options: [2–3 concrete flow patterns relevant to the scenario, "Let me walk through it"]
```

Example for an orders prototype:
- options: ["List → detail drawer", "Dashboard → drill-down page", "Wizard (multi-step creation)", "Let me walk through it"]

**3. Interactions**
```
- header: "Interactions"
- question: "What interaction patterns matter most?"
- options: [2–3 relevant patterns from the design system book, "Let me describe them"]
```

Example drawing from library: ["DataTable row selection + bulk actions", "Slide-in drawer with detail panel", "Inline editing on row cells", "Let me describe them"]

**DS state override challenge (Phase 5.3):** When the user describes an interaction behavior that skips or overrides a known DS component default state (e.g., "skip the loading state on the button"), surface a gentle challenge using AskUserQuestion before accepting. This follows the Phase 4 Gentle Challenges pattern.

Example:
```
- header: "DS State"
- question: "Button has a built-in Loading state — want to skip it here?"
- options: ["Use DS loading state", "Skip it for this prototype"]
```

This challenge fires only when the design-system book is loaded (available from on-demand loading in Phase 0). If the designer confirms the override, record it in `interactionContext.customStates` with a clear `override` description. The interaction agent trusts discuss output — no re-validation at agent time.

**Library grounding for core questions:**
- Name real components from the loaded design system book (e.g., "DataTable with sortable columns" not "a table")
- Reference playground conventions for feasible patterns (e.g., "multi-variant layout" if the conventions book describes it)
- Use design language, not import syntax (e.g., "Card with bordered variant and elevated shadow" not "`<Card bordered elevated>`")

---

## Phase 6: Contextual Questions (ask when relevant — skip when obvious)

Only ask what's relevant. Skip anything obvious from blueprint state or conversation context.

**States** (ask when the prototype has dynamic content):
```
- header: "States"
- question: "What states should we handle?"
- multiSelect: true
- options: ["Empty state", "Loading skeletons", "Error state", "Content overflow"]
```

**Data** (ask when showing tables or lists):
```
- header: "Data"
- question: "What kind of mock data tells the story best?"
- options: [2–3 specific data scenarios relevant to the prototype, "Let me describe it"]
```

**Variants** (ask when exploring multiple concepts):
```
- header: "Variants"
- question: "Are we exploring multiple concepts?"
- options: ["Single concept", "2–3 variants to compare", "Let me explain"]
```

**Layout:**
```
- header: "Layout"
- question: "Any layout preference?"
- options: [2–3 concrete layouts based on the flow and component options from library, "Let me describe it"]
```

**Components** (when there's a meaningful choice between design system options):
```
- header: "Components"
- question: "Any specific UI patterns you have in mind?"
- multiSelect: true
- options: [3–4 real component patterns from the loaded design system book]
```

**Library grounding for contextual questions:**
- Every component suggestion must come from the loaded design system book
- If the design system book isn't loaded yet and the conversation has reached component-level specifics, load it now
- Proactive suggestions: when a component fits naturally, offer it with key variants and composition context. Example: "DataTable supports sortable columns, row selection, and a sticky header. You could pair it with a FilterBar component above for search + facets."
- When user wants something not in the design system: acknowledge the gap clearly ("There's no DS pagination component yet"), then suggest the closest available alternative and let the user decide

---

## Phase 7: Pattern Research (optional — offer after scenario question)

After landing on the scenario, offer competitive research:

```
- header: "Research"
- question: "Want me to look at how other companies have handled this?"
- options: ["Yes, show me examples", "No, I know what I want"]
```

If yes: use web search to research how 3–5 well-known products approach the same UX problem. Focus on:
- Common UI patterns and interaction models used
- How they handle edge cases and empty states
- Layout and information hierarchy choices
- Anything surprising or clever worth borrowing

Present findings as a quick summary, not a full report. Example format:

> **How others handle order management:**
> - **Shopify:** Compact table with inline status tags, bulk actions toolbar appears on selection
> - **Square:** Card-based layout on mobile, table on desktop, persistent search + filters
> - **Stripe:** Dense data table with expandable rows for detail, keyboard navigation

Then use AskUserQuestion to land on a direction:

```
- header: "Direction"
- question: "Any of these feel like a good starting point?"
- options: ["Shopify-style (compact table)", "Square-style (card-based)", "Stripe-style (dense + expandable)", "Mix and match", "None — I have my own idea"]
```

Research informs the conversation — it's context, not a prescription. The designer makes all decisions.
