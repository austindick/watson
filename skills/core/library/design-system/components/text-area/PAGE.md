---
type: page
title: TextArea Component
last_updated: "2026-03-31"
---

# TextArea Component

A Text Area provides users with a free-form space to enter and edit long strings of text.

**Import:** `import { TextArea } from "@faire/slate/components/text-area"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| characterLimit | number | -- | No | Max characters; shows counter when defined |
| disabled | boolean | -- | No | Whether the textarea is disabled |
| error | boolean \| string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Error state; string/LocalMsg displays in helper text |
| helper | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Helper text below textarea |
| label | string | -- | No | Textarea label |
| optional | boolean | false | No | Appends "(optional)" to label |
| placeholder | string | -- | No | Placeholder text |
| resize | boolean | true | No | Whether textarea is resizable |
| tooltipText | string \| StrictLocalMsg \| ServerSideLocalMsg | -- | No | Tooltip in the label |
| value | string | -- | No | Textarea value |
| rows | number | -- | No | Initial visible lines (minimum 2, web) |
| id | string | auto-generated | No | Textarea element id (web) |
| name | string | -- | No | Textarea name attribute (web) |
| onChange | ChangeEventHandler | -- | No | Change handler (web) |
| onInput | FormEventHandler | -- | No | Input handler (web) |
| ref | Ref<HTMLTextAreaElement> | -- | No | Textarea ref (web) |

## States

- **default** -- standard textarea
- **disabled** -- grayed out, non-interactive
- **error** -- error styling with message in helper area
- **with character limit** -- shows character counter (current/max)
- **resizable/non-resizable** -- controlled by `resize` prop

## Gotchas

- `characterLimit` both sets `maxLength` on the textarea AND shows the character counter
- Rows below 2 are ignored (minimum 2 rows)
