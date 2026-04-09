---
name: watson:init
description: Initialize a prototype's blueprint/ directory with template scaffold, branch operations for session management
---

# Utility: watson-init

## Purpose

Creates the five blueprint files (CONTEXT.md, LAYOUT.md, DESIGN.md, INTERACTION.md, STATUS.md) inside a prototype's `blueprint/` directory. Each file is initialized with section headings and placeholder text — not empty files. This is required before any Watson agent runs because agents use Edit-based writes (section replacement) rather than full overwrites. The placeholder text (`_Not yet defined._`) provides valid targets for the Edit tool.

Also handles single-file prototype promotion: if a prototype exists as `MyPage.tsx`, watson-init converts it to `MyPage/index.tsx` and creates `MyPage/blueprint/`.

Also provides branch operations for session management: branch creation, branch listing, branch switching, and collaboration fork logic.

---

## Input

| Parameter | Type | Description |
|-----------|------|-------------|
| targetFilePath | string | Path to prototype file or directory (e.g., `src/pages/MyPrototype/` or `src/pages/MyPrototype.tsx`) |
| prototype_name | string | Human-readable prototype name (collected by SKILL.md before invocation) |
| slug | string | Kebab-case slug derived from prototype_name by SKILL.md |
| operation | string | Optional. "branch-list" for Path B (continue existing) flow. "direct-input" for flexible continue. Omit for Path A (new prototype) flow. |
| userInput | string | Optional. Raw text the user pasted — a branch name, Playground URL, slug, or directory path. Used with operation: "direct-input". |
| offerConversion | boolean | Optional. If true, offer watson/* branch conversion for non-watson inputs. Used by SKILL.md Path B. Default: false. |

---

## Phase 0: Branch Setup (new prototype path)

Invoked when `operation` is not "branch-list" — i.e., SKILL.md Path A dispatched watson-init with `prototype_name` and `slug`.

**Receives:** `prototype_name` (human-readable name) and `slug` (kebab-case) from SKILL.md.

Execute Branch Creation (see Branch Operations — Branch Creation). Then continue to Single-File Detection and blueprint scaffold below, using `prototype_name` to populate STATUS.md template fields.

---

## Phase 0B: Branch List (continue existing path)

Invoked when `operation` is "branch-list" — i.e., SKILL.md Path B dispatched watson-init.

Execute Branch List and Switching sequence from Branch Operations. After successful branch switch, return control to SKILL.md for context summary display and intent classification.

---

## Phase 0C: Direct Input (flexible continue)

Invoked when `operation` is "direct-input" — the user pasted a branch name, URL, slug, or path instead of selecting from the branch list.

**Step 1: Classify the input**

Parse `userInput` to determine its type. Check in this order:

1. **watson/* branch name:** Input starts with `watson/` or matches a known watson/* branch (`git branch --list "watson/${userInput}" 2>/dev/null`). → Type: `watson-branch`
2. **Playground URL:** Input contains `playground` or matches a URL pattern (contains `://` or starts with `http`). Extract the slug from the URL path — typically the last path segment after `/pages/` or the prototype identifier. → Type: `url`
3. **Directory path:** Input starts with `/`, `./`, `../`, or `~`, OR input contains `/` and resolves to an existing directory (`test -d "{userInput}"`). → Type: `directory`
4. **Prototype slug:** Input is a simple string (no slashes, no protocol). Attempt case-insensitive resolution: `find src/pages/ -maxdepth 1 -iname "{userInput}" -type d 2>/dev/null | head -1`. → Type: `slug` if found, `unknown` if not.
5. **Unknown:** None of the above matched. → Type: `unknown`

**Step 2: Resolve blueprint path based on type**

- **watson-branch:** Run Auto-Commit Guard. `git checkout watson/{slug}` (or the full branch name). Discover blueprint path via Blueprint Discovery (filesystem variant). If found, set `blueprintPath` and return. If not found, offer scaffold.
- **url:** Extract slug from URL path (last path segment, strip query params). Then:
  1. Search all local branches for the slug: `git branch --list "*${slug}*" 2>/dev/null`. Filter results to branches that contain the slug as a path segment (not substring noise).
  2. If exactly one branch matches: Run Auto-Commit Guard. `git checkout {matched_branch}`. Discover blueprint path via Blueprint Discovery (filesystem variant). If found, set `blueprintPath` and proceed to Step 3. If no blueprint, offer scaffold (same as directory handler pattern).
  3. If multiple branches match: AskUserQuestion — header: "Multiple matches", question: "Found multiple branches matching '{slug}':", options: [list of matching branch names, "None of these"]. On selection, checkout and discover blueprint. On "None of these", fall through to filesystem.
  4. If no branch matches: fall through to slug filesystem resolution below.
- **directory:** Check `{userInput}/blueprint/STATUS.md` exists. If yes, set `blueprintPath = {userInput}/blueprint`. If no, check `{userInput}` itself for STATUS.md patterns. If no blueprint found: AskUserQuestion — header: "Blueprint", question: "No blueprint found at {userInput}. Create one here?", options: ["Yes, create blueprint", "Cancel"]. If yes, scaffold 5 template files in `{userInput}/blueprint/`, set `blueprintPath`.
- **slug:** First search git branches: `git branch --list "*${userInput}*" 2>/dev/null`. Filter to branches containing the slug as a path segment.
  1. If exactly one branch matches: checkout and discover blueprint (same as url handler step 2).
  2. If multiple matches: present selection (same as url handler step 3).
  3. If no branch matches: attempt filesystem resolution: `find src/pages/ -maxdepth 1 -iname "{userInput}" -type d 2>/dev/null | head -1`. If found, follow directory logic. If not found, fall through to unknown handler.
- **unknown:** AskUserQuestion — header: "Not Found", question: "I couldn't resolve '{userInput}' to a prototype. What would you like to do?", options: ["Try a different input", "Show the branch list", "Cancel"]. "Show the branch list" → fall back to branch-list operation. "Try a different input" → ask for new input. "Cancel" → exit.

**Step 3: Conversion offer (full Watson flow only)**

If the caller passed `offerConversion: true` AND the resolved prototype is NOT on a watson/* branch:
- AskUserQuestion — header: "Convert?", question: "This prototype isn't tracked by Watson yet. Want to convert it to a Watson prototype for full tracking?", options: ["Yes, convert to watson/* branch", "No, work in place"]
- "Yes, convert": Infer prototype name from directory name or STATUS.md `prototype_name`. Derive slug. Run Branch Creation (Phase 0) to create watson/{slug} from main, then copy the existing blueprint/ content to the new branch. Set `blueprintPath` on the new branch.
- "No, work in place": Use `blueprintPath` as-is. No branch switch.

**Step 4: Update state and return**

- Set `blueprintPath` as the resolved path
- If on a watson/* branch: update `/tmp/watson-active.json` with `"branch": "{branch}"` and `"actions": []` if not present
- Return to caller with `blueprintPath`

---

## Single-File Detection and Promotion

When `targetFilePath` is provided, apply this detection logic before creating blueprint/:

**Step 1: Determine input type**

- If `targetFilePath` ends in `.tsx` (e.g., `src/pages/MyPrototype.tsx`):
  - Derive the directory name: strip the `.tsx` extension to get `MyPrototype`
  - Check if `src/pages/MyPrototype/` directory already exists
    - If YES: return error — "Directory MyPrototype/ already exists. Specify the directory path directly (e.g., src/pages/MyPrototype/)."
  - Create the `MyPrototype/` directory
  - Move `MyPrototype.tsx` to `MyPrototype/index.tsx`
  - Set working directory to `MyPrototype/`

- If `targetFilePath` ends in `/` or is a directory path (e.g., `src/pages/MyPrototype/`):
  - Verify the directory exists
    - If NOT: return error — "Directory {targetFilePath} does not exist. Create the prototype directory first."
  - Set working directory to that directory

**Step 2: Create blueprint/**

Create a `blueprint/` subdirectory inside the working directory determined in Step 1.

---

## Template Content

Create the following five files inside `blueprint/`. Every file must contain content — never write empty files.

### blueprint/CONTEXT.md

```
# CONTEXT: [Prototype Name]

## Problem Statement
_Not yet defined._

## Hypotheses
_Not yet defined._

## Solution Intent
_Not yet defined._

## Design Decisions
_Not yet defined._

## PDP Stage
_Not yet defined._

## Constraints
_Not yet defined._
```

Replace `[Prototype Name]` with the prototype directory name (e.g., `ProductQuickView`).

### blueprint/LAYOUT.md

```
# LAYOUT: [Prototype Name]

_No sections analyzed yet. Run loupe or add layout specs manually._
```

Replace `[Prototype Name]` with the prototype directory name.

Note: LAYOUT.md starts minimal because its section structure is created per-section by the layout agent. Each section adds a `## {SectionName}` block. The consolidated blueprint has no line budget — it grows as sections are added.

### blueprint/DESIGN.md

```
# DESIGN: [Prototype Name]

_No sections analyzed yet. Run loupe or add design specs manually._
```

Replace `[Prototype Name]` with the prototype directory name.

Note: Same rationale as LAYOUT.md — section structure is built incrementally by the design agent.

### blueprint/INTERACTION.md

```
# INTERACTION: [Prototype Name]

## States

### Tier 1: Design System States
_Not yet defined._

### Tier 2: Custom States
_Not yet defined._

### Tier 3: Net-New Interactions
_Not yet defined._

## Transitions
_Not yet defined._

## User Flows
_Not yet defined._

## Responsive Behavior
_Not yet defined._
```

Replace `[Prototype Name]` with the prototype directory name.

Note: INTERACTION.md has full section headings because the interaction agent and discuss subskill write it holistically (not per-section). The full structure is present from the start so agents can Edit individual sections without needing to know the complete schema at write time.

### blueprint/STATUS.md

```
---
prototype_name: "[Prototype Name]"
prototype_slug: "[prototype-slug]"
owner: "[Owner Full Name]"
owner_github: "[githubusername]"
created_at: "[YYYY-MM-DD]"
sections_built: []
pending_decisions: []
last_discussed: ""
last_activity: "[YYYY-MM-DD]"
branch: ""
drafts: []
sessions: []
---

# STATUS: [Prototype Name]

## Build Summary
_No sections built yet._

## Pending Decisions
_None._

## Session Log
_No sessions recorded._
```

Replace `[Prototype Name]` with the prototype directory name, `[prototype-slug]` with the kebab-case version of the prototype name, and `[Owner Full Name]`/`[githubusername]` with values from the Setup Flow. `[YYYY-MM-DD]` is the current date at scaffold time.

Note: STATUS.md uses YAML frontmatter as the primary machine-readable section. Agents update frontmatter fields via Edit tool — never overwrite STATUS.md with Write. The markdown body is a human-readable summary derived from frontmatter. `drafts` and `sessions` are empty array stubs for Phase 7 and Phase 8 consumers respectively.

---

## Section Heading Design Rationale

| File | Initialization Strategy | Reason |
|------|------------------------|--------|
| CONTEXT.md | Full section headings + placeholders | Written holistically by discuss. Agents replace individual sections using Edit tool. |
| LAYOUT.md | Minimal (one placeholder line) | Built section-by-section by layout agent. Sections added incrementally as loupe pipeline runs. |
| DESIGN.md | Minimal (one placeholder line) | Built section-by-section by design agent. Same pattern as LAYOUT.md. |
| INTERACTION.md | Full section headings + placeholders | Written holistically by interaction agent. Three-tier state model requires all sections present for agents to pattern-match against. |
| STATUS.md | YAML frontmatter + minimal markdown body | Machine state file. YAML frontmatter is the primary data store (updated by agents via Edit). Markdown body is human-readable summary. Stubs included for Phase 7 (drafts) and Phase 8 (sessions). |

---

## Verification

After creating all files, confirm:

1. `blueprint/` directory exists inside the working directory
2. All five files exist and have content (use Read tool on each file to verify non-empty)
3. If single-file promotion occurred: original `.tsx` file no longer exists at the old path; `index.tsx` exists at the new path inside the prototype directory

If any check fails, report the specific failure and the corrective action taken (or required).

---

## Branch Operations

This section contains the git mechanics referenced by SKILL.md's 2-path fork. SKILL.md routes to these operations; all git commands live here.

### Auto-Commit Guard

Before any branch switch, check for uncommitted changes:

```
git status --porcelain
```

Only commit if output is non-empty:

```
git add -A && git commit -m "watson: checkpoint before switching to {slug}"
```

Never use `--allow-empty`. If `git status --porcelain` returns empty, skip the commit entirely.

---

### Branch Creation (new prototype)

Receives `prototype_name` and `slug` from SKILL.md Path A.

1. Run Auto-Commit Guard
2. **CRITICAL — pull latest main before branching:** `git checkout main && git pull origin main`. This ensures the new branch includes all upstream changes (e.g., dependency updates, design system additions). Skipping this step causes the new branch to miss recent changes to main. **Do not proceed to step 3 until the pull completes successfully.** If pull fails (e.g., merge conflicts on main), surface the error to the user before continuing.
3. Check if branch already exists: `git branch --list "watson/{slug}"`
4. **If branch exists:** AskUserQuestion — header: "Branch exists", question: "watson/{slug} already exists.", options: ["Switch to existing branch", "Create watson/{slug}-2"]
   - "Switch to existing branch": discover blueprint path via Blueprint Discovery, run `git show watson/{slug}:{blueprintPath}/STATUS.md` and display `prototype_name` field for confirmation, then `git checkout watson/{slug}`. Skip blueprint scaffold (blueprint already exists).
   - "Create watson/{slug}-2": use `{slug}-2` as the new slug, continue branch creation below.
5. **If branch does not exist:** `git checkout -b watson/{slug}`
6. Continue to blueprint scaffold (Single-File Detection + Template Content sections)
7. After scaffold: Do NOT commit. The scaffold files remain uncommitted. The first commit happens organically when discuss, loupe, or save-blueprint writes and commits their changes — those commits sweep up the scaffold files via `git add blueprint/`.

   Exception: If `src/config/contributors.ts` was modified (new user added during Setup Flow), commit it immediately: `git add src/config/contributors.ts && git commit -m "watson: add contributor {github_username}"`. This is shared state, not blueprint scaffolding.
8. Update STATUS.md `branch:` field via Edit tool: replace `branch: ""` with `branch: "watson/{slug}"`
9. Update `/tmp/watson-active.json` via Edit tool: add `"branch": "watson/{slug}"` and `"actions": []`

---

### Blueprint Discovery

To find the blueprint path on a branch, run: `git ls-tree -r --name-only {branch} | grep 'blueprint/STATUS.md$' | head -1`. Strip the `/STATUS.md` suffix to get the blueprint directory path. Store this as `blueprintPath` for the branch.

If the grep returns empty, the branch has no blueprint. This is expected for fresh branches — fall back to branch name for display.

For the checked-out branch, use the filesystem instead: `find . -path '*/blueprint/STATUS.md' -not -path './.git/*' | head -1`.

**All references to `blueprint/STATUS.md`, `blueprint/CONTEXT.md`, etc. below must use the discovered `blueprintPath`, not a hardcoded root-relative path.**

---

### Branch List and Switching (continue existing prototype)

1. Run `git branch --list 'watson/*'` to get local branches

   Performance: Gather all branch data in a single bash script where possible. Combine `git branch --list`, per-branch `git show` for STATUS.md, and `git log` for last commit dates into one bash invocation to minimize visible terminal blocks (ACTV-06).
2. For each branch:
   - Discover blueprint path: run `git ls-tree -r --name-only watson/{slug} | grep 'blueprint/STATUS.md$' | head -1` — strip `/STATUS.md` to get `blueprintPath`. If empty, no blueprint exists for this branch.
   - Read context: `git show watson/{slug}:{blueprintPath}/STATUS.md` using the discovered path (graceful fallback to branch name if discovery or git show fails)
   - Get last commit date: `git log watson/{slug} --max-count=1 --format="%cd" --date=short`
   - Determine ownership: use STATUS.md `owner_github` field as primary, fall back to `git config --get user.name`
   - Tag inactive branches (30+ days since last commit) with [INACTIVE] prefix
3. Display "Your prototypes:" group (owned branches, sorted by last activity desc), then "Browse other prototypes" expandable option for other owners' branches
4. If 2+ inactive branches: also include "Clean up all inactive" option in the list
5. User selects a branch:
   - **Inactive branch selected:** AskUserQuestion — header: "Inactive", question: "{name} hasn't had activity in {N} days.", options: ["Continue working on it", "Delete branch", "Reset inactivity timer"]
     - "Delete branch": confirm with user, run `git branch -d watson/{slug}` and `git push origin --delete watson/{slug}` (catch remote delete errors silently), return to branch list
     - "Reset inactivity timer": update STATUS.md `last_activity` field via Edit tool with today's date, return to branch list
     - "Continue working on it": proceed with switch below
   - **Active branch selected:** proceed with switch below
6. **Branch switch sequence:**
   - Run Auto-Commit Guard
   - Attempt: `git checkout watson/{slug}`
   - **If checkout fails (branch missing locally):** try `git checkout -b watson/{slug} origin/watson/{slug}` to recover from remote
   - **If recovery also fails (gone from both local and remote):** inform user: "{slug} no longer exists locally or on the remote." AskUserQuestion — header: "Branch Missing", question: "watson/{slug} is no longer available.", options: ["Create a fresh branch with this name", "Return to branch list"]
     - "Create a fresh branch with this name": `git checkout main && git checkout -b watson/{slug}`, then re-scaffold via Phase 0 branch creation + blueprint scaffold
     - "Return to branch list": re-enter Branch List and Switching from step 1
   - **Health check after switch:** discover blueprint path via Blueprint Discovery (filesystem variant since branch is now checked out). Verify `{blueprintPath}/STATUS.md` exists. If STATUS.md is missing or blueprint path could not be discovered:
     AskUserQuestion — header: "Missing Blueprint", question: "This branch doesn't have a blueprint yet. Would you like to create one?", options: ["Yes, create blueprint", "Cancel"]
     - "Yes, create blueprint": determine prototype directory from branch name (strip `watson/` prefix, find matching directory in `src/pages/`). If directory found, scaffold 5 template files in `{protoDir}/blueprint/` using the Template Content section. Set `blueprintPath`. If no matching directory, ask user for the prototype path.
     - "Cancel": return to branch list.
7. Update `/tmp/watson-active.json` via Edit tool: add `"branch": "watson/{slug}"` (and `"actions": []` if not present)

---

### Collaboration Fork (branching from another user's prototype)

This is the ONE exception to "always branch from main." Used when a user wants to riff on another user's prototype.

**Receives:** `source_branch` (e.g., `watson/their-slug`), `prototype_name` (user's name for their fork), `slug` (derived from their name).

1. From the source branch: `git checkout -b watson/{slug}` (inherits all blueprint files from source branch)
2. Create new STATUS.md with current user as owner (use Setup Flow data)
3. Add to STATUS.md frontmatter via Edit tool:
   - `forked_from: "watson/{source-slug}"`
   - `forked_from_owner: "{their-github-username}"`
4. Commit: `git add blueprint/ && git commit -m "watson: fork {prototype_name} from watson/{source-slug}"`
5. Update `/tmp/watson-active.json` via Edit tool: `"branch": "watson/{slug}"`, `"actions": []`
