---
type: page
title: PasswordInput Component
last_updated: "2026-03-31"
---

# PasswordInput Component

A Password Input allows users to enter and edit their passwords.

**Import:** `import { PasswordInput } from "@faire/slate/components/password-input"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| disabled | boolean | -- | No | Whether the input is disabled |
| error | boolean \| string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Error state; string/LocalMsg displays in helper text |
| helper | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Helper text below input |
| label | string | -- | No | Input label |
| optional | boolean | false | No | Appends "(optional)" to label |
| tooltipText | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Tooltip in the label |
| value | string | -- | No | Input value |
| id | string | auto-generated | No | Input element id (web) |
| name | string | -- | No | Input name attribute (web) |
| onChange | ChangeEventHandler | -- | No | Change handler (web) |

## States

- **password mode** -- input type is "password" (obscured)
- **plaintext mode** -- toggle button switches input to type "text" (visible)
- **disabled** -- grayed out, non-interactive
- **error** -- error styling with message in helper area

## Gotchas

- Has `spellCheck={false}` and `autoComplete="off"` by default
- Includes a show/hide toggle button built in
