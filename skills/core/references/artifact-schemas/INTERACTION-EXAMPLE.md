# INTERACTION: Product Quick View
Reference: figma
<!-- Reference values: figma | prod-clone | discuss-only -->

## States

### Tier 1: Design System States

States handled natively by the design system. No prototype-level overrides needed — the design system's default behavior applies.

| Component | States | Notes |
|-----------|--------|-------|
| Button (primary) | Default, Hover, Focus, Active, Disabled, Loading | Add-to-cart button uses all states; Loading state shown during cart mutation |
| Card | Default, Hover, Focus | Product grid cards; Hover state reveals Quick View trigger |
| Badge | Default only | Price badge and "New" label — static, no interaction states needed |
| Input (select) | Default, Hover, Focus, Disabled | Size and color selectors inside the panel |
| Overlay / Backdrop | Visible, Hidden | Panel backdrop; opacity transition handled by design system overlay utility |

### Tier 2: Custom States

Prototype-specific state overrides or extensions layered on top of design system defaults.

| Element | State | Override |
|---------|-------|---------|
| ProductCard | Selected (panel open) | Grid card gains a selected ring (--ds-color-border-focus outline at 2px) while its Quick View panel is open — not a design system default |
| ProductGrid | Dimmed | Grid container opacity drops to 0.5 when panel is open; no design system default for this context-dimming behavior |
| QuickViewTrigger | Visible | "Quick View" trigger on card is hidden by default, revealed on card hover/focus via CSS — hover state triggers visibility, not a design system component |

### Tier 3: Net-New Interactions

Novel behaviors with no design system equivalent. These require custom implementation.

| Element | State / Behavior | Implementation |
|---------|-----------------|----------------|
| QuickViewPanel | Slide-in / Slide-out | Panel animates in from right (translateX 100% → 0) on open; reverses on close. CSS transition on transform property (see Transitions table). No design system panel component exists. |
| ImageCarousel | Swipe / Dot navigation | Horizontal swipe gesture and dot-indicator navigation through product images inside the panel. Custom implementation — the design system's Card image display is static. |
| SizeSelector | Tap-to-select with visual confirmation | Pill-shaped size buttons toggle selected state with a filled background. Separate from Input (select) — closer to a button group but with single-select semantics. |

---

## Transitions

| Trigger | From | To | Animation | Duration |
|---------|------|----|-----------|---------|
| Quick View button click | Panel hidden (off-screen right) | Panel visible (on-screen) | `transform: translateX(100%) → translateX(0)`, ease-out | 250ms |
| Backdrop click / Escape key | Panel visible | Panel hidden (off-screen right) | `transform: translateX(0) → translateX(100%)`, ease-in | 200ms |
| Card hover | QuickViewTrigger hidden | QuickViewTrigger visible | `opacity: 0 → 1`, linear | 120ms |

---

## User Flows

### Quick View Browse

Step-by-step sequence for a user evaluating a product via the quick view panel.

```
User hovers product card
  → QuickViewTrigger becomes visible (120ms fade)
  → User clicks "Quick View" trigger
    → Panel slides in from right (250ms, ease-out)
    → Grid dims to 50% opacity
    → Panel shows: image carousel, product name, price, size selector, color selector, Add to Cart button
      → User selects size
        → Size pill shows selected state
      → User selects color
        → Color swatch shows selected state
      → User clicks "Add to Cart"
        → Button enters Loading state
        → Cart mutation fires
        → Button returns to Default state with success feedback (toast notification — separate flow)
          OR
      → User clicks "View Full Details" link
        → Panel closes (200ms, ease-in)
        → Full-page navigation to PDP
          OR
      → User clicks backdrop / presses Escape
        → Panel slides out (200ms, ease-in)
        → Grid returns to full opacity
        → User continues browsing
```

---

## Responsive Behavior

| Breakpoint | Behavior |
|------------|---------|
| Desktop (≥ 1024px) | Panel anchors to right edge of viewport, 480px wide. Grid visible and scrollable behind dimmed backdrop. |
| Tablet (768px – 1023px) | Panel takes 60% viewport width. Grid still visible behind backdrop but grid scroll is locked while panel is open. |
| Mobile (< 768px) | Panel becomes a bottom sheet (full width, 85vh height, slides up from bottom). Grid completely obscured. Close handle visible at top of sheet. |
