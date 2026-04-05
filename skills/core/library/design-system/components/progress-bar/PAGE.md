---
type: page
title: ProgressBar Component
last_updated: "2026-03-31"
---

# ProgressBar Component

A progress bar indicates progress of a task.

**Import:** `import { ProgressBar } from "@faire/slate/components/progress-bar"`

## Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| progress | number | -- | Yes | Current progress value (0-1) |
| variant | "success" \| "neutral" | "success" | No | Visual variant |
| showIcon | boolean | false | No | Show checkmark icon when progress=1 (success variant only) |

## Variants

| Variant | CSS Class | Description |
|---------|-----------|-------------|
| success | `fs-progress-bar--success` | Green progress indicator |
| neutral | `fs-progress-bar--neutral` | Neutral color progress indicator |

## Gotchas

- `showIcon` only works with variant="success" and progress=1
- Progress value is 0-1 (not 0-100); internally multiplied by 100
