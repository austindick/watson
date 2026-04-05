# Source Scanning Reference

Instructions for the Librarian agent's source file scanning step. Read this during generate mode Step 2 and update mode Step 2.

---

## Sub-Scans

Run all four. Skip and log unparseable files (record them in `skipped_files`).

### Components

For each file in component directories:
1. Extract component name and export type (named/default)
2. Extract all props from TypeScript interfaces/types or PropTypes
3. For each prop: name, type, required/optional, default value
4. Identify variant/size enums from union types or constant objects
5. Identify states from conditional styling (disabled, active, selected, error, loading)
6. Note slots: children, render props, named slots
7. Note composition patterns and responsive behavior if applicable
8. Flag deprecated components (`@deprecated` JSDoc) — exclude entirely from output
9. Record gotchas: TODO/HACK comments, props that don't behave as typed

### Tokens

For each token/variable definition file:
1. Extract variable name (CSS custom property or JS/TS constant)
2. Extract resolved value (follow references: `var(--x)` to actual value)
3. Group by category: colors, spacing, radii, shadows, typography, z-index, layout
4. If Tailwind config exists, map tokens to Tailwind utility classes
5. Identify token hierarchy: primitive to semantic mappings

Supported formats: CSS custom properties, SCSS variables, JS/TS token objects, JSON token files, Tailwind config.

### Typography

Look for named text styles in:
- Dedicated typography files (typography.ts, text-styles.css)
- Component files for Text/Heading/Typography components
- Token files with typography-related variables

Extract per preset: name, font family, size, weight, line-height, letter-spacing.

### Icons

1. Extract icon names (named exports, component names, SVG file names)
2. Note import path for each
3. Group by category if source organizes them (navigation, actions, status)
4. Identify external icon libraries from package.json dependencies
5. For external libraries: scan codebase for actual imports to list only icons in use

---

## Book Structure Determination

Map scanned sections to chapters based on what was found.

### Design system books

| Scanned Data | Chapter | Level |
|---|---|---|
| Tokens + typography | `global-theme/` | Two-level (inline CHAPTER.md) |
| Components | `components/` | Three-level (CHAPTER.md + PAGE.md per component) |
| Icons | `icons/` | Two-level (inline CHAPTER.md) |
| Composition patterns | `patterns/` | Two-level (inline CHAPTER.md) |

### Other source-derived books

Infer chapters from source directory structure. Top-level subdirectories become chapters. Files within a directory become pages if there are many (>5); otherwise inline content in a single chapter.

### Two-level vs three-level rule

- Three levels when a chapter has many discrete entries (e.g., one page per component)
- Two levels when a chapter's content fits as a single document
- Design system `components/` always uses three levels. All other chapters use two levels.
