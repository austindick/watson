---
type: page
title: Modal Component
last_updated: "2026-03-31"
---

# Modal Component

Three modal variants for different use cases.

## BaseModal

Used for the majority of modality use cases (overflow text, forms).

**Import:** `import { BaseModal, BaseModalHeader, BaseModalBody, BaseModalFooter } from "@faire/slate/components/modal/base"`

### BaseModal Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| open | boolean | -- | No | Whether the modal is open |
| size | ModalSizeVariant | "small" | No | Modal size variant |
| disableAnimations | boolean | -- | No | Disable open/close animations |
| onClose | () => void | -- | No | Close callback (web) |

### Composition

Children must be: BaseModalHeader (required), BaseModalBody, BaseModalFooter. Modal provides overlay, scroll area, and close button automatically.

## PromptModal

Used for simple binary actions (confirm destructive action, alert).

**Import:** `import { PromptModal } from "@faire/slate/components/modal/prompt"`

### PromptModal Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| open | boolean | -- | No | Whether the modal is open |
| title | string | -- | Conditional | Prompt title (required if no aria-label) |
| aria-label | string | -- | Conditional | Accessible label (required if no title) |
| description | string | -- | Yes | Prompt description text |
| destructive | boolean | -- | No | Makes primary button destructive |
| primaryButton | Button element | -- | Yes | Primary action button |
| secondaryButton | Button element | -- | No | Secondary action button |

### Gotchas

- PromptModal has NO close button, is NOT dismissed by clicking background or pressing Escape
- Open state must be controlled by parent component
- Must provide either `title` or `aria-label`
- Only accepts Button components for primaryButton/secondaryButton

## MarketingModal

Used for marketing-centric information (programs, CTAs).

**Import:** `import { MarketingModal, MarketingModalHeader, MarketingModalBody, MarketingModalFooter } from "@faire/slate/components/modal/marketing"`

### MarketingModal Props

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| open | boolean | -- | No | Whether the modal is open |
| onClose | () => void | -- | No | Close callback (web) |

### Composition

Children must be: MarketingModalHeader (required, supports title + logo), MarketingModalBody, MarketingModalFooter. Close button renders as IconButton.
