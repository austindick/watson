---
name: mid-build
type: reference
description: "Mid-build behavior for /think — adaptive re-entry, hybrid intent detection, summary and confirmation"
---

# Reference: Mid-Build Behavior

This reference file is loaded by /think's SKILL.md. It contains behavior for when /think is invoked during an active prototype build — intent detection, question reduction, summary and confirmation, and the suggest-not-dispatch handoff pattern.

---

## Phase 8: Mid-Build Adaptive Behavior

/think can be invoked at any point during an active prototype build. The same conversation engine applies — no separate mid-build mode. Existing decisions reduce question count naturally.

**Hybrid intent detection:** When invoked mid-build, infer intent from the user's message and recent context before opening the conversation.

- If intent is clear (user says "I want to rethink the sidebar navigation") → confirm it: *"It sounds like you want to rethink the sidebar — is that right, or something else?"*
- If intent is ambiguous → use AskUserQuestion:
  ```
  - header: "Focus"
  - question: "What would you like to work through?"
  - options: ["Rethink a specific section", "Add a new feature or state", "Revisit a design decision", "Something else"]
  ```

**Mid-build question reduction:** Before asking any question, check the blueprint and built code. If a decision is already made and implemented, skip it. If a decision is made but not built, note the gap — don't re-discuss unless the user wants to change it.

**After mid-build design discussion concludes:** Ask the user what to do with the amendments:
```
- header: "Next step"
- question: "Want me to rebuild the affected section(s) now, or save the changes for later?"
- options: ["Rebuild now", "Save for later"]
```

"Rebuild now" → return status `ready_for_build`. Display: "Run `/design` to rebuild the affected section(s)."
"Save for later" → return status `discussion_only`. Amendments persist as `[PENDING]` in blueprint files.

Amendments persist in the blueprint regardless of when the rebuild happens.

---

## Phase 9: Summary and Confirmation

The conversation ends when:
- The user says "let's build", "that's enough", "start building", or similar
- All core questions are answered and no obvious gaps remain
- /think proactively detects sufficient decision coverage (enough for a complete prototype) and surfaces the "ready to build?" question

Before ending, summarize all decisions in a concise list:

> Here's what we've decided:
> - **Scenario:** [scenario in one sentence]
> - **Flow:** [primary user flow]
> - **Interactions:** [key interaction patterns, named from design system book]
> - **States:** [states to handle, if applicable]
> - **Data:** [mock data shape, if applicable]
> - **Components:** [specific components from design system book, if decided]
> - **Layout:** [layout approach]

Then confirm:
```
- header: "Ready?"
- question: "Look good? Ready to build?"
- options: ["Let's build", "I want to change something"]
```

If "I want to change something" — ask what to revisit and loop back to the relevant question.
