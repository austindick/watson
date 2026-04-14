# Codebase-Map Scanning Reference

Scanning instructions for the Librarian agent when generating or updating **codebase-map** library books. Use this reference instead of `source-scanning.md` whenever the `outputBookPath` contains `codebase-map`.

---

## 1. Source Packages

Codebase-map books always scan exactly these three source directories. These are locked and must not be inferred from `sourcePaths` input.

| Source Package | Chapter ID | Chapter Title |
|----------------|------------|---------------|
| `@repo/packages/brand-portal/brand-portal/src/maker/` | `brand-portal` | Brand Portal |
| `@repo/packages/retailer/` | `retailer` | Retailer |
| `@repo/packages/marketplace/` | `logged-out` | Logged Out |

**Note:** The source package for the Logged Out chapter is `marketplace/`. The user-facing label is "Logged Out" everywhere — the word "Marketplace" must not appear as a chapter title or section heading. The source path retains `marketplace` because that is the real directory name.

---

## 2. Sub-Scan: Surface Entry Discovery

For each source package directory, run the following discovery process:

**Step 1 — List top-level subdirectories**

List all immediate subdirectory names within the source package root.

**Step 2 — Apply the skip list**

Exclude directories whose name matches any entry in the skip list below. Do not recurse into skipped directories.

**Skip list (exact matches):**
```
utils, hooks, helpers, lib, types, constants, __tests__, __mocks__, assets, i18n, styles
```

**Step 3 — Each remaining directory = one section**

For each non-skipped directory:

a. **Humanize** the directory name: kebab-case → Title Case.
   - `my-shop` → "My Shop"
   - `orders` → "Orders"
   - `brand-analytics` → "Brand Analytics"
   - Single-word lowercase → capitalize: `catalog` → "Catalog"

b. **List `.tsx` files** within the directory:
   - If the directory contains >150 files: scan depth 1 only (direct children of the section directory).
   - If the directory contains <50 files: scan depth 1 and one level of subdirectories.
   - In either case, apply the surface heuristic (Section 3) to filter for surface entries.

c. **For each surface file**, extract the 5-column entry (see Section 4).

d. **Write the section** as an H2 heading followed by a 5-column table (see Section 5).

---

## 3. Surface vs Utility File Heuristic

Include a `.tsx` file as a surface entry if ALL of the following are true:

- It has a **default export** (look for `export default` in the file)
- Its name does **not** start with `use` — not a custom hook (`useOrderFilters.tsx` → skip)
- Its name does **not** start with a **lowercase letter** — not a utility function (`formatCurrency.tsx` → skip)
- It is **not** named `index.tsx` — skip index files unless it is the **sole** `.tsx` file in the directory (in that case, include it and derive the surface name from the directory name)

**When a directory has both a primary component and a Container wrapper:**
Prefer the file whose name matches the surface intent:
- `OrderDetail.tsx` over `OrderDetailContainer.tsx`
- `ShopSettings.tsx` over `ShopSettingsContainer.tsx`
If only a `*Container.tsx` file exists, use it and note "container" in the description.

**Edge case — ambiguous directories:**
If a directory contains a mix of surface and utility files, include the directory as a section and apply the heuristic per file. Do not skip the entire directory because of utility files.

---

## 4. Entry Format

Each surface entry has exactly **5 columns**. Do not add, remove, or reorder columns.

### Name
Human-readable surface name derived from the component name.

- PascalCase to spaced: `OrderDetail` → "Order Detail"
- `ShopSettings` → "Shop Settings"
- `BrandAnalyticsDashboard` → "Brand Analytics Dashboard"

### Route
Production URL path. Use the full path users see in their browser bar.

**Priority:**
1. **Explicit route declaration in the file**: Look for `path:` prop in `<Route>`, React Router `useMatch`, or exported route constants. Use this value verbatim.
2. **Derive from directory + file path**: Map the source directory structure to the route pattern:
   - Brand Portal: `@repo/packages/brand-portal/brand-portal/src/maker/{section}/{File}.tsx` → `/maker/{section-slug}/{file-slug}`
   - Retailer: `@repo/packages/retailer/src/{section}/{File}.tsx` → `/{section-slug}/{file-slug}`
   - Logged Out: `@repo/packages/marketplace/src/{section}/{File}.tsx` → `/{section-slug}/{file-slug}`
3. If the route is derived (not found explicitly), append `(derived)` to the value: `/maker/orders/:id (derived)`

### Description
One sentence, user perspective. Maximum 80 characters (truncate with ellipsis if needed).

**Priority:**
1. **JSDoc `@description` tag** on the default export — use verbatim.
2. **JSDoc `@file` or module-level comment** — extract the first sentence.
3. **Display name + primary props** — synthesize one sentence: `OrderDetail` + `orderId` prop → "Order detail view for a specific order."
4. **Directory name + route** (Claude's Discretion) — derive from context: `orders/` + `/maker/orders/:id` → "Single order detail with line items and fulfillment actions."

Write from the **user's perspective**, not the developer's. "Seller's shop home page" not "ShopOverview component container."

### File Path
`@repo`-prefixed absolute path to the primary component file.

- Always use `@repo/` prefix — never use absolute filesystem paths.
- Example: `@repo/packages/brand-portal/brand-portal/src/maker/orders/OrderDetail.tsx`

### Last Verified
ISO date (YYYY-MM-DD) when the Librarian confirmed this file path exists.

- Written at scan time.
- Consumers should treat this as a hint for staleness judgment, not a validity guarantee. Source agents verify paths at runtime (RSLV-04).

---

## 5. Chapter Output Format

Each chapter is a `CHAPTER.md` file with **no PAGE.md files**. Codebase-map books are always 2-level.

### Frontmatter

```yaml
---
type: chapter
title: {App Name}
last_updated: {ISO date}
---
```

### Body Structure

```markdown
# {App Name}

{App description} surfaces from `{source_path}`.

<!-- Seed entries below. Run Librarian generate mode from faire/frontend to populate with real data. -->

## {Section Name}

| Name | Route | Description | File Path | Last Verified |
|------|-------|-------------|-----------|---------------|
| {Surface Name} | {/path} | {Description} | {File Path} | {YYYY-MM-DD} |
```

**Rules:**
- One H2 section per non-skipped source directory.
- Section headings are humanized directory names (kebab-case → Title Case).
- One table row per surface file passing the heuristic.
- Table has exactly 5 columns with exact headers: `Name`, `Route`, `Description`, `File Path`, `Last Verified`.
- No sub-tables, no nested sections, no H3 headings.

---

## 6. Book Structure Rules

Codebase-map books **always** use:

- **Exactly 3 chapters** for faire/frontend: `brand-portal`, `retailer`, `logged-out`.
- **Two-level structure**: BOOK.md → CHAPTER.md with inline tables. No PAGE.md files.
- **book_type: source-derived** in BOOK.md frontmatter.
- **source_hash**: sha256 of the concatenated file contents from all source packages (alphabetical order).

This **overrides** the general book structure rules in `source-scanning.md`. Do not apply the "three-level for many discrete entries" rule to codebase-map books — always 2-level regardless of entry count.

---

## 7. Anti-Patterns

The following are explicit errors for codebase-map scanning. Do not do these:

- **Do NOT create PAGE.md files** — the 2-level structure is locked. PAGE.md files will break downstream consumers.
- **Do NOT index brand-sdk as a chapter or section** — source agents follow imports from brand-portal into brand-sdk at runtime. No separate scanning of brand-sdk.
- **Do NOT add columns beyond the 5 specified** — the column set is fixed (Name, Route, Description, File Path, Last Verified). Adding columns requires coordinated changes in all downstream consumers.
- **Do NOT use absolute filesystem paths** — all File Path values must use `@repo/` prefix.
- **Do NOT include utility files as surface entries** — files starting with `use`, files starting with a lowercase letter, and `index.tsx` files (except as sole-file fallback) are excluded.
- **Do NOT label the Logged Out chapter "Marketplace"** — the chapter title and section headings must use "Logged Out" (and humanized section names from the `marketplace/` package), not "Marketplace".
- **Do NOT trust last_verified as a validity guarantee** — it is a staleness hint only. Document this in BOOK.md.
