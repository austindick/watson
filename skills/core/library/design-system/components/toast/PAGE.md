---
type: page
title: Toast Component
last_updated: "2026-03-31"
---

# Toast Component

Toasts contain information directly related to an action performed.

**Import:** `import { Toast } from "@faire/slate/components/toast"`

**Note:** Toast is NOT a React component -- it is an object with static methods.

## API

### Toast.create(props) => Id

Shows a toast notification. Returns a toast Id.

| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| description | string | -- | Yes | Toast message content |
| Icon | React.FC<SVGIconProps> | -- | No | Leading icon |
| cta | string | -- | No | CTA button text; replaces close button |
| onCtaClick | () => void | -- | No | CTA click callback (web) |
| onDismiss | () => void | -- | No | Callback when toast is closed or CTA actioned (web) |

### Toast.dismiss(id)

Closes a toast by its Id.

## Variants

- **Without CTA** -- auto-dismisses after 4 seconds, shows close button
- **With CTA** -- auto-dismisses after 6 seconds, shows CTA button instead of close

## Gotchas

- Only one toast can be shown at a time; creating a new toast dismisses the current one
- Uses react-toastify under the hood; requires ToastContainer in the app
- Separate containers for desktop (`TOAST_CONTAINER_DESKTOP_ID`) and mobile (`TOAST_CONTAINER_MOBILE_ID`)
- Toast is an imperative API, not a declarative component
