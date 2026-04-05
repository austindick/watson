---
type: chapter
title: "Dev Workflow"
last_updated: "2026-03-31"
---

# Dev Workflow

## Dev Server

```bash
yarn nx start prototype-playground
```

Runs at http://localhost:3000. If port 3000 is in use, kill the existing process first.

PREFER: Check that dev server is not already running before starting a new instance.

## Installing Dependencies

MUST: Use focused install only — NEVER run `yarn` or `yarn install` for a full monorepo install.

```bash
yarn workspaces focus @faire/prototype-playground
```

## Thumbnail Generation

MUST: Every prototype must have a thumbnail before publishing.
MUST: Dev server must be running before generating thumbnails.

```bash
yarn nx thumbnails prototype-playground
# OR:
yarn nx generate-thumbnails prototype-playground
```

Verify file created at `public/images/thumbnails/[prototype-id].png`.

## Committing

MUST: Always use `--no-verify` to skip git hooks (hooks fail for non-engineers):

```bash
git commit --no-verify -m "feat: Add [Name] prototype"
```

PREFER: Commit message format: `feat: Add [Prototype Name] prototype` for new prototypes.

Feed date updates: Prototype "last updated" dates auto-track when the creator commits changes. To skip date update for refactors: include `[skip-date]` in commit message.

## Publishing Workflow (PR Creation)

MUST: Follow all steps in order. NEVER create a PR until build passes and thumbnail is generated.

```bash
# Step 1: Update from main
git fetch origin main
git rebase origin/main

# Step 2: Verify build passes
yarn nx build prototype-playground
# If it fails: fix issues, run again, repeat until passing

# Step 3: Generate thumbnail
yarn nx thumbnails prototype-playground
# Verify: public/images/thumbnails/[id].png exists

# Step 4: Commit and push
git add .
git commit --no-verify -m "feat: Add [Prototype Name] prototype"
git push

# Step 5: Create PR
gh pr create
```

After merging to main, prototypes are live at theplayground.design.

## Preview Deployments

Vercel creates a preview deployment for every push to any branch. Share preview URLs for teammate feedback before merging. Production URL (main branch) is the stable link.

## Live Reload Issues

If you have to restart the server to see file changes, the file watcher may have hit the "too many open files" limit. The project uses `WATCHPACK_POLLING=1000` in `.env.development`. Restart the server once — after that, hot-reload should work.

## Shared Code Policy

MUST: Keep all prototype-specific code in your prototype's own page file(s).
NEVER: Modify another designer's prototype files.
NEVER: Modify shared components (`src/components/shared/`, `src/components/design-system/`) without intentional, coordinated changes.
NEVER: Add prototype-specific navigation items to shared `BrandPortalSidebar.tsx` — use `navOverrides` prop.

SHOULD: If a shared component needs an enhancement that benefits all prototypes, coordinate before changing — these are shared infrastructure.

When a shared component does need updating (new SlateTable cell type, fix in shared layout, etc.):
- Explicitly state "I'm updating the shared [component] system"
- Modify `src/components/shared/[Component].tsx` and related shared files
- Test that existing prototypes are unaffected

## Testing Locally

```bash
# Start dev server
yarn nx start prototype-playground

# Navigate to your prototype
# http://localhost:3000/[prototype-path]

# Check Feed
# http://localhost:3000/

# Check Workspace
# http://localhost:3000/workspaces/[YourFirstName]
```

Troubleshooting:
- Prototype not in Feed: verify `owner` matches `name` in contributors.ts exactly, `category` is `'experimental'`, thumbnail exists
- Route not working: check App.tsx has import and route, verify path matches between App.tsx and prototypes.ts
- Images not loading: some prototypes use Figma MCP assets that require the MCP server
