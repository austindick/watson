# Phase 8: Session Management — Research

**Researched:** 2026-04-02
**Domain:** Watson skill git branch lifecycle, session history tracking, STATUS.md schema population
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Session start 2-path fork (replaces blueprint gate):**
- Watson activation always presents two clear paths: "Start a new prototype" / "Continue working on an existing prototype"
- This replaces the current blueprint gate routing entirely — the 2-path fork becomes THE entry point after Watson is ON
- If no existing watson/* branches exist, "Continue existing" is absent or disabled
- Both paths lead to branch operations, then context summary + intent choices (discuss / build from Figma / just explore)

**Branch creation flow (new prototype path):**
- Branch created during watson-init, inline in the setup summary — one confirmation step bundled with scaffold info
- Watson asks prototype name as a plain text question (not AskUserQuestion) — name only, no description (discuss captures that later)
- Always branches from main — never branch off own branches for new prototypes
- Watson pulls latest main before branching
- If uncommitted changes exist on current branch, Watson auto-commits: `watson: checkpoint before switching to {new-prototype}`
- After branch + blueprint scaffold, Watson presents standard intent choices (discuss / build from Figma / just explore)

**Branch naming convention:**
- All Watson branches follow `watson/{prototype-slug}` — no exceptions
- Slug derived from user-provided prototype name (kebab-case)
- STATUS.md `branch:` field populated immediately on creation
- State file `/tmp/watson-active.json` also tracks active branch name (for status line and /clear recovery)

**Branch conflict handling:**
- If `watson/{slug}` already exists when creating a new prototype, Watson flags it
- Offers two options: switch to the existing branch to continue working, or create a new branch with a number suffix
- Watson NEVER suggests erasing/starting fresh within an existing branch — only manual user action can destroy branch work

**Push to remote:**
- Watson does NOT push to GitHub immediately after branch creation
- Push happens on first build (when loupe produces output) — that's when there's meaningful code to share
- Discuss-only sessions stay local

**Branch switching (continue existing path):**
- "Continue existing" shows a list of watson/* branches with context: prototype name + last activity date
- Branches organized in two groups: user's own branches (primary), then "Browse other prototypes" expandable option
- Branch ownership: Claude's discretion (git config user vs STATUS.md owner_github)
- Auto-commit `watson: checkpoint` before switching (same pattern as new prototype)
- After switch: context summary (name, sections built, pending amendments, last session) + intent choices
- Light health check on switch: verify blueprint/ and STATUS.md exist; if missing, inform user and offer to re-scaffold

**Mid-session prototype switching:**
- Supported via intent classification — new entry in the intent table for "switch prototype / work on something else / open {name}"
- Watson auto-commits current work, switches branch, shows context summary for the new prototype
- Watson stays ON throughout the switch

**Collaboration (other users' branches):**
- Browsing another user's prototype always creates a fork — never direct edits to another user's branch
- Fork uses standard `watson/{your-slug}` naming (user names their riff like a new prototype)
- Fork inherits all blueprint files from the source branch
- New STATUS.md created with current user as owner
- STATUS.md frontmatter tracks fork origin: `forked_from: watson/their-slug` and `forked_from_owner: theirusername`
- This is the ONE exception to "never branch off branches" — forking another user's work requires branching off their branch

**Missing branch recovery:**
- If a watson/* branch no longer exists locally or remotely, Watson informs the user
- Offers alternatives: create a fresh branch with the same name, or go back to the branch list
- No silent fallback or auto-recreation

**Inactive branch cleanup:**
- Inactive = 30+ days with no commits on a watson/* branch
- Surfaced in the "Continue existing" branch list — inactive branches tagged visually, not a separate prompt
- Per-branch options when selecting an inactive branch: delete, continue working, reset inactive timer
- Batch "clean up all inactive" option also available
- Delete removes both local and remote branches (with confirmation)

**Session history tracking:**
- STATUS.md `sessions:` array tracks session entries (max 10, oldest dropped)
- Each entry records: timestamp (start), what was done (brief auto-generated summary), who (GitHub username)
- Session entry written on session end (deactivation via /watson off, prototype switch, or SessionEnd hook)
- "What was done" inferred from actions: subskills append to `actions` array in `/tmp/watson-active.json` during session; compiled into summary at end
- Returning-prototype context summary shows last session only: "Last session: [date] by [user] — [what was done]"

### Claude's Discretion

- Branch ownership detection mechanism (git config user vs STATUS.md owner_github — pick the most reliable)
- Exact inactive branch visual tagging in the branch list
- How actions are appended to /tmp/watson-active.json by subskills (format and granularity)
- Session summary compilation logic (how raw actions become a readable one-liner)
- How the "Browse other prototypes" expandable option is presented (AskUserQuestion flow)
- Exact wording for branch conflict, missing branch, and health check messages

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SESS-01 | Watson creates a new git branch for a new prototype session with user confirmation | Branch creation happens in watson-init after prototype name prompt; one bundled confirmation step covers both scaffold and branch creation |
| SESS-02 | Watson switches to an existing prototype branch when returning to a prototype, with user confirmation | 2-path fork "Continue existing" path shows watson/* branch list; switching requires explicit user selection; AskUserQuestion confirmation gate before git checkout |
| SESS-03 | Watson uses a consistent branch naming convention (`watson/{prototype-slug}`) | Slug derived from prototype name; STATUS.md `prototype_slug` field is the canonical source; enforced at creation time with conflict detection |
| SESS-04 | On new session start, Watson surfaces existing Watson branches and offers cleanup of inactive ones | "Continue existing" path lists all watson/* branches; inactive (30+ day) branches tagged; per-branch and batch delete options presented |
</phase_requirements>

---

## Summary

Phase 8 is fundamentally a git branch lifecycle management layer bolted onto the Watson session start flow. The implementation surface is concentrated in three files: SKILL.md (routing replacement from blueprint gate to 2-path fork), watson-init.md (branch creation added to new prototype setup), and the SessionEnd hook in `~/.claude/settings.json` (extend to write session entry before cleaning up state file). A fourth file, loupe.md, gets a small addition: push on first successful build.

The git operations themselves are straightforward bash commands Claude will execute inline — `git pull origin main`, `git checkout -b watson/{slug}`, `git checkout watson/{slug}`, `git log`, `git branch -d`, `git push origin --delete`. No external libraries or tools are needed beyond what already exists. The complexity is in the orchestration: detecting which branch to switch to, handling conflicts, tagging inactive branches, and writing session history atomically.

The most significant architectural decision is the SKILL.md routing rewrite. The current "blueprint gate" entry (check for blueprint/ directory first, then route) is replaced by a 2-path fork at the Watson-ON level. This is a clean cut: everything before intent classification changes; everything from intent classification onward is unchanged. The Phase 7 draft/commit additions (pending surfacing, soft build warning) are preserved verbatim — the 2-path fork wraps above them, not inside them.

**Primary recommendation:** Implement in three waves. Wave 1: SKILL.md routing rewrite (2-path fork replaces blueprint gate). Wave 2: watson-init.md branch creation + STATUS.md `branch:` population + loupe.md push-on-first-build. Wave 3: SessionEnd hook extension + subskill actions array pattern + session history write. Wave ordering ensures that routing works correctly before branch operations are wired, and branch operations are tested before session history depends on them.

---

## Standard Stack

### Core

| Component | Current State | Phase 8 Role | Notes |
|-----------|--------------|--------------|-------|
| `SKILL.md` | 179 lines, blueprint gate routing | Routing rewritten: 2-path fork replaces blueprint gate | Hard limit: 200 lines; Phase 7 left ~21-line buffer |
| `watson-init.md` | Scaffolds 5 blueprint files | Branch creation added after scaffold; prototype name prompt added before scaffold | Already has `branch: ""` stub in STATUS.md template |
| `blueprint/STATUS.md` (per-prototype) | `branch: ""` and `sessions: []` stubs from Phase 6 | `branch:` populated at creation; `sessions:` populated at session end | Edit tool only — never Write overwrite |
| `/tmp/watson-active.json` | Tracks ON/OFF + `pendingWarningShown` | Gains `branch` field and `actions` array | Written by Watson subskills during session |
| `~/.claude/settings.json` SessionEnd hook | `rm -f /tmp/watson-active.json` | Extend: write session entry to STATUS.md before cleanup | Must be idempotent — watson-active.json may not exist |
| `share-proto-statusline.js` | Shows `Watson: ON` when state file exists | Extend to show active branch name from state file | Already reads `/tmp/watson-active.json` |
| `loupe.md` | No git operations | Add push-on-first-build after loupe produces output | Push triggered once; subsequent builds skip push |

### Git Operations Reference

All operations run via Bash tool. No git library is needed — these are simple shell commands.

| Operation | Command | When Used |
|-----------|---------|-----------|
| Pull latest main | `git pull origin main` | Before branching for new prototype |
| Check for uncommitted changes | `git status --porcelain` | Before auto-commit or branch switch |
| Auto-commit checkpoint | `git add -A && git commit -m "watson: checkpoint before switching to {slug}"` | When uncommitted changes exist before switch |
| Create new branch | `git checkout -b watson/{slug}` | New prototype path, after pull |
| Switch to existing branch | `git checkout watson/{slug}` | Continue existing path |
| List watson/* branches | `git branch --list 'watson/*'` | Continue existing path — local branches |
| List remote watson/* branches | `git branch -r --list 'origin/watson/*'` | For "Browse other prototypes" |
| Get last commit date per branch | `git log watson/{slug} --max-count=1 --format="%cd" --date=short` | Inactive branch detection |
| Delete local branch | `git branch -d watson/{slug}` | Inactive branch cleanup |
| Delete remote branch | `git push origin --delete watson/{slug}` | Inactive branch cleanup |
| Push new branch | `git push -u origin watson/{slug}` | Push on first build (loupe output exists) |
| Get git config user | `git config --get user.name` or `git config --get user.email` | Branch ownership detection |

### Existing Patterns (Do Not Reinvent)

| Pattern | Where Defined | Phase 8 Reuse |
|---------|--------------|---------------|
| AskUserQuestion for routing decisions | SKILL.md routing | 2-path fork prompt; branch switch confirmation |
| Auto-commit `watson: checkpoint` | CONTEXT.md decision | Same format for both new and continue paths |
| Edit tool for STATUS.md frontmatter | watson-init.md note, Phase 6 research | All STATUS.md updates use Edit tool |
| `/tmp/watson-active.json` JSON state | SKILL.md on-load write | Extend with `branch` and `actions` fields |
| SessionEnd hook cleanup | `~/.claude/settings.json` | Extend before rm -f line |
| `pendingWarningShown` state flag | Phase 7 plan 02 | Pattern for session-local flags |

---

## Architecture Patterns

### Recommended File Change Map

```
Files modified in Phase 8:
├── ~/.claude/skills/watson/SKILL.md          — routing replacement (largest change)
├── ~/.claude/skills/watson/utilities/watson-init.md — branch creation + name prompt
├── ~/.claude/skills/watson/skills/loupe.md   — push on first build
├── ~/.claude/skills/watson/skills/discuss.md — actions array append
├── ~/.claude/hooks/share-proto-statusline.js — show active branch in status line
└── ~/.claude/settings.json                   — extend SessionEnd hook
```

Note: `blueprint/STATUS.md` per-prototype files already have `branch:` and `sessions:` stubs from Phase 6/7 — no schema change needed.

### Pattern 1: 2-Path Fork Routing (SKILL.md Replacement)

**What:** The blueprint gate (check blueprint/ exists → check STATUS.md → branch based on presence) is replaced by a 2-path fork that runs immediately after Watson-ON confirmation. The fork is the primary entry point; branch operations happen before intent classification.

**Current blueprint gate structure (lines 19-47 of SKILL.md, to be replaced):**
```
Entry point: blueprint gate
1. Check for blueprint/ directory...
2. Check if message is Tier 0...
3. Check for blueprint/STATUS.md...
```

**Replacement 2-path fork structure:**
```
Entry point: 2-path fork

Present two options (AskUserQuestion):
  header: "Watson"
  question: "What would you like to work on?"
  options: ["Start a new prototype", "Continue working on {existing}"] | ["Start a new prototype"] if no watson/* branches

Path A: Start a new prototype
  → Ask prototype name (plain text, not AskUserQuestion)
  → Check for uncommitted changes → auto-commit if needed
  → Pull origin main
  → Run watson-init (scaffold + branch creation)
  → Confirm: "[Name] — branch watson/{slug} created. Blueprint scaffolded."
  → Proceed to Intent Classification

Path B: Continue working on existing
  → List watson/* branches with context (name, last activity, pending amendments)
  → Tag inactive branches (30+ days since last commit)
  → User selects branch (AskUserQuestion)
  → Confirm switch + health check
  → Auto-commit if uncommitted changes
  → git checkout watson/{slug}
  → Load context from STATUS.md → show context summary
  → Proceed to Intent Classification
```

**Tier 0 passthrough (preserved from Phase 6/7, inserted before fork):**
- Pure coding/git/config with no design intent → stay silent, defer to default Claude
- Check: does current directory have any watson/* branches or a blueprint/ directory? If not and not /watson invocation → stay silent

**Intent Classification and Routing (from line ~82 onward) — UNCHANGED**

**SKILL.md line budget check:**
- Current: 179 lines
- Blueprint gate section (lines ~19-47): ~28 lines removed
- New 2-path fork section: ~45 lines added (the fork is more complex than the gate)
- Net: +17 lines → estimated 196 lines
- This is within the 200-line limit but tight. Keep fork description terse — move detailed subpath logic to watson-init.md where possible.

### Pattern 2: Branch Creation in watson-init.md

**What:** watson-init.md gains a new Phase 0 before its existing Single-File Detection step: a prototype name prompt and branch operations.

**When to use:** Only on the "Start a new prototype" path. watson-init is already invoked from SKILL.md Setup Flow; Phase 8 extends that invocation to include branch operations.

**New watson-init flow:**
```
Phase 0: Prototype name (already asked by SKILL.md 2-path fork)
  → SKILL.md passes prototype_name as a parameter (or it's collected inline)

Phase 0.5: Branch creation (NEW)
  1. Derive slug: kebab-case of prototype_name
  2. Check for uncommitted changes on current branch
     → If found: git add -A && git commit -m "watson: checkpoint before switching to {slug}"
  3. git pull origin main
  4. Check if watson/{slug} already exists (git branch --list "watson/{slug}")
     → If exists: AskUserQuestion — "Branch watson/{slug} exists. Switch to it or create watson/{slug}-2?"
     → If not exists: git checkout -b watson/{slug}
  5. Update STATUS.md branch: field (Edit tool)
  6. Update /tmp/watson-active.json: add "branch": "watson/{slug}" (Edit tool)

[Existing Single-File Detection and blueprint scaffold continues here]

Final step (NEW): Confirmation message
  "[Prototype Name] — branch watson/{slug} created. Blueprint scaffolded at blueprint/."
```

**Key design note:** The prototype name is collected ONCE (in SKILL.md 2-path fork as plain text question), then passed to watson-init as a parameter. watson-init does NOT ask for prototype name again — it receives it. This keeps the new prototype flow as a single confirmation step as locked in CONTEXT.md.

### Pattern 3: Session History Write Pattern

**What:** At session end, the actions array in `/tmp/watson-active.json` is compiled into a one-line summary and appended to STATUS.md `sessions:` array.

**State file structure (extended for Phase 8):**
```json
{
  "pendingWarningShown": false,
  "branch": "watson/checkout-flow",
  "actions": [
    "discussed checkout layout options",
    "built Header section",
    "discussed payment form states"
  ]
}
```

**Session entry format (STATUS.md sessions: array):**
```yaml
sessions:
  - timestamp: "2026-04-02T14:30:00Z"
    summary: "Discussed checkout layout, built Header section, discussed payment form"
    who: "austindick"
```

**Session entry write sequence (SessionEnd hook + Watson deactivation):**
1. Check if `/tmp/watson-active.json` exists (hook may fire even when Watson was OFF)
2. Read `branch` field → find which STATUS.md to update
3. Read `actions` array → compile into one-line summary (join, truncate if needed)
4. Read current `sessions:` from STATUS.md
5. Prepend new entry; if array length > 10, drop the oldest
6. Edit tool: update `sessions:` array in STATUS.md frontmatter
7. `rm -f /tmp/watson-active.json` (existing cleanup)

**SessionEnd hook limitation:** The SessionEnd hook in `settings.json` runs a bash command, not a Claude instruction. The session history write requires reading files and constructing a summary — this is Claude logic, not pure bash.

**Resolution:** The hook triggers a signal; the actual session write happens WITHIN the Watson conversation, not the hook. Specifically:
- `/watson off` deactivation → Watson writes session entry inline before responding "Watson deactivated"
- Mid-session prototype switch → Watson writes session entry for the leaving prototype before switching
- Hard session end (tab close, /clear) → The SessionEnd hook gets a best-effort bash write

For the hard-end case, the hook can write a minimal session entry using Node.js:
```bash
node -e "
  const fs = require('fs');
  const stateFile = '/tmp/watson-active.json';
  if (!fs.existsSync(stateFile)) process.exit(0);
  // Minimal session record — Claude couldn't compile summary
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  // Write to /tmp/watson-session-end.json for Watson to pick up next session
  fs.writeFileSync('/tmp/watson-session-end.json', JSON.stringify({branch: state.branch, actions: state.actions || [], timestamp: new Date().toISOString()}));
  fs.unlinkSync(stateFile);
"
```

On next Watson activation, check for `/tmp/watson-session-end.json` and write the session entry to the appropriate STATUS.md. This defers the Claude-level logic (summary compilation) to the next session start.

### Pattern 4: Action Tracking by Subskills

**What:** discuss.md and loupe.md append to the `actions` array in `/tmp/watson-active.json` when invoked.

**How:** Each subskill adds a brief action string at the START of its execution (not end, to capture it even if the subskill exits early).

```
discuss.md on activation (after the "Watson ► Design Discussion" header):
  Read /tmp/watson-active.json
  Append to actions array: "discussed {topic}" (topic = first user message or blueprint context)
  Edit tool: write updated actions array back

loupe.md on activation:
  Read /tmp/watson-active.json
  Append to actions array: "built {sections} section(s)"
  Edit tool: write updated actions array back
```

**Format discipline (Claude's discretion area):** Keep action strings to 5-8 words, past tense, no punctuation. Examples: "discussed checkout layout options", "built Header and CartSummary sections", "reviewed pending amendments". Session summary compilation joins actions with ", " and truncates at ~80 chars.

### Pattern 5: Branch List Display for Continue Existing

**What:** When the user selects "Continue working on existing", Watson lists watson/* branches with context.

**Data gathering sequence:**
```bash
# 1. Get all local watson/* branches
git branch --list 'watson/*'

# 2. For each branch, get last commit date
git log watson/{slug} --max-count=1 --format="%cd" --date=short

# 3. For each branch, read STATUS.md prototype_name and owner_github
# (git show watson/{slug}:blueprint/STATUS.md — reads file from branch without checkout)

# 4. Compute days since last commit
# Inactive threshold: 30 days
```

**Display format:**
```
Your prototypes:
  1. Checkout Flow — last active 2026-03-28 (3 days ago)
  2. [INACTIVE] Product Quick View — last active 2026-01-15 (78 days ago)

Browse other prototypes (shows other users' watson/* branches)
```

**Ownership detection (Claude's discretion):** Use `git config --get user.name` and compare against STATUS.md `owner_github`. If git config email matches a known pattern, prefer that. If neither is deterministic, group by STATUS.md `owner_github` field — Watson branches with the current user's GitHub handle go in "Your prototypes"; others go in "Browse other prototypes".

### Pattern 6: Inactive Branch Cleanup UX

**When:** User selects an INACTIVE-tagged branch in the continue list.

**Per-branch options:**
```
AskUserQuestion:
  header: "Inactive"
  question: "Product Quick View hasn't had activity in 78 days."
  options: ["Continue working on it", "Delete branch", "Reset inactivity timer"]
```

- "Continue working on it" → switch to branch normally
- "Delete branch" → confirmation → `git branch -d watson/{slug}` + `git push origin --delete watson/{slug}`
- "Reset inactivity timer" → write a no-op commit to the branch (or update STATUS.md `last_activity` field)

**Batch cleanup (from top-level branch list):**
```
AskUserQuestion:
  header: "Cleanup"
  question: "2 branches are inactive (30+ days). Delete all inactive branches?"
  options: ["Yes, delete all", "Review individually", "Skip cleanup"]
```

### Anti-Patterns to Avoid

- **Branching from current branch for new prototypes:** Always pull main and branch from main, even if the user is on a watson/* branch when starting new. Branching from watson/old-prototype contaminates the new one.
- **Using Write tool to update STATUS.md sessions: array:** Edit tool targets specific frontmatter fields. Write would overwrite the entire file and stomp concurrent changes.
- **Asking for prototype name twice:** SKILL.md 2-path fork collects the name as a plain text question; watson-init receives it as a parameter. Do not add a second name prompt inside watson-init.
- **Pushing immediately on branch creation:** Push happens on first loupe build output, not on branch creation. Discuss-only sessions stay local.
- **Silent auto-recovery for missing branches:** CONTEXT.md locks: no silent fallback or auto-recreation. If the branch is gone, inform the user and offer explicit choices.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Branch existence check | Custom file scan | `git branch --list 'watson/*'` | One command, handles local and remote separately |
| Reading file from another branch | git checkout + read | `git show watson/{slug}:blueprint/STATUS.md` | No working-tree pollution; no re-checkout needed |
| Inactive branch detection | Custom date math | `git log --format="%cd" --date=short` + compare to today | git has reliable date parsing; no external deps |
| Session history max-10 enforcement | Separate log file | YAML array slice in STATUS.md | Consistent with all other Watson state; Edit-in-place |
| Slug derivation | Custom string logic | Kebab-case: `toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')` | Three-line bash or inline Claude; no library needed |

**Key insight:** All git operations in Phase 8 are read-branch-info + create/switch/delete branch commands. Claude can run these inline via Bash tool without any wrapper abstraction.

---

## Common Pitfalls

### Pitfall 1: SKILL.md 2-path fork exceeds 200-line limit

**What goes wrong:** The 2-path fork routing section is more verbose than the blueprint gate it replaces. Adding full sub-path logic for new prototype and continue existing paths pushes SKILL.md over 200 lines.

**Why it happens:** The blueprint gate was ~28 lines. The 2-path fork with branch operations described inline would be 50+ lines. The Routing section that follows (Tier 1, Tier 2, Tier 3, Help) is ~28 lines and cannot be compressed.

**How to avoid:** The 2-path fork section in SKILL.md should contain ROUTING DECISIONS ONLY — which path, what branch operations, which intent choices. Detailed branch operation mechanics belong in watson-init.md (for new prototype) and are referenced by path in SKILL.md ("Watson switches branches and loads context — see continue path below"). Target: 2-path fork section ≤ 38 lines. Total SKILL.md ≤ 198 lines.

**Warning signs:** SKILL.md draft exceeds 185 lines during planning. Tighten fork section by removing prose, keeping only the decision tree.

### Pitfall 2: SessionEnd hook cannot run Claude logic

**What goes wrong:** Session history write (compile actions → one-liner summary → Edit STATUS.md) requires Claude to process natural language and make file edits. The SessionEnd hook runs bash only. If the hook tries to do this, it either does nothing or produces malformed YAML.

**Why it happens:** SessionEnd hook is defined in `~/.claude/settings.json` as a command string. It has no access to Claude's conversation context.

**How to avoid:** Two-channel approach:
1. In-session writes: `/watson off` and prototype switch trigger Watson to write the session entry inline before exiting
2. Hard-end writes: SessionEnd hook writes `/tmp/watson-session-end.json` with raw `{branch, actions, timestamp}`. Next Watson session start checks for this file, compiles the summary, updates STATUS.md, and deletes the temp file.

This ensures session history is never lost, even on hard session ends, while keeping Claude-level logic in Claude context.

**Warning signs:** STATUS.md `sessions:` array is never populated despite multiple sessions. Check if SessionEnd hook JSON write is working and if next-session recovery check is in SKILL.md.

### Pitfall 3: Auto-commit creates spurious commits on clean branches

**What goes wrong:** Watson auto-commits with "watson: checkpoint" before every branch switch, even when the working tree is clean. Repository history becomes polluted with empty or near-empty commits.

**Why it happens:** The auto-commit guard (`git status --porcelain`) is skipped or always returns output on some platforms.

**How to avoid:** Always gate auto-commit on `git status --porcelain` returning non-empty output:
```bash
# Only commit if there are changes
if [ -n "$(git status --porcelain)" ]; then
  git add -A && git commit -m "watson: checkpoint before switching to {slug}"
fi
```
Never use `git commit --allow-empty`.

**Warning signs:** Git log shows multiple "watson: checkpoint" commits with identical parent trees.

### Pitfall 4: Branch slug collision with existing prototypes

**What goes wrong:** User creates "Checkout Flow" → slug `checkout-flow` → branch `watson/checkout-flow` already exists. Watson offers "switch to existing or create `watson/checkout-flow-2`". User chooses the numbered suffix. Later, a second `checkout-flow-2` slug collision creates `checkout-flow-3`. Branch names diverge from actual prototype intent.

**Why it happens:** Suffix generation is mechanical and doesn't consult what the existing branch actually is.

**How to avoid:** When a collision is detected, before offering the numbered suffix option, check `git show watson/{slug}:blueprint/STATUS.md` and display the existing branch's prototype_name to the user. This helps them decide whether it's truly a different prototype or the same one they want to continue.

**Warning signs:** Multiple `watson/checkout-flow-N` branches in the branch list.

### Pitfall 5: `git show branch:path` fails when blueprint hasn't been committed yet

**What goes wrong:** When displaying the "Continue existing" branch list, Watson reads STATUS.md from each branch via `git show watson/{slug}:blueprint/STATUS.md`. If a branch was created but the blueprint was never committed (session ended before first commit), git show returns an error.

**Why it happens:** `git show` requires the file to exist in at least one commit on that branch. A fresh branch with uncommitted files has no committed content for git show to read.

**How to avoid:** After watson-init scaffolds the blueprint files, immediately commit them: `git add blueprint/ && git commit -m "watson: initialize {name} blueprint"`. This ensures every watson/* branch always has at least one commit with blueprint content. Watson-init should include this commit as its final step.

**Warning signs:** "Continue existing" branch list shows branches without prototype names (git show failed, graceful fallback to branch name only).

### Pitfall 6: STATUS.md sessions: array gets YAML formatting errors

**What goes wrong:** The Edit tool targets `sessions: []` in STATUS.md frontmatter and tries to append an entry. The YAML array format for empty vs populated arrays is different, causing parse errors.

**Why it happens:** `sessions: []` is a compact empty array. Adding entries requires changing it to a multi-line block sequence. Edit tool replaces an exact string — if the format changes, subsequent edits break.

**How to avoid:** Watson-init should scaffold `sessions:` in block sequence format from the start, not compact format:
```yaml
sessions: []
```
When writing the first session entry, replace `sessions: []` with:
```yaml
sessions:
  - timestamp: "..."
    summary: "..."
    who: "..."
```
Document this format transition explicitly in the session write instructions.

---

## Code Examples

### Branch Creation Sequence (watson-init, Phase 0.5)

```bash
# Source: 08-CONTEXT.md decisions — branch creation in watson-init
# Assume prototype_name = "Checkout Flow", slug = "checkout-flow"

SLUG="checkout-flow"
BRANCH="watson/${SLUG}"

# Step 1: Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  git add -A && git commit -m "watson: checkpoint before switching to ${SLUG}"
fi

# Step 2: Pull latest main
git checkout main && git pull origin main

# Step 3: Check for existing branch
if git branch --list "${BRANCH}" | grep -q .; then
  # Branch exists — present conflict options
  echo "Branch ${BRANCH} already exists"
else
  # Create new branch
  git checkout -b "${BRANCH}"
fi

# Step 4: Commit initial blueprint after scaffold
# (watson-init scaffold creates blueprint/ files here)
git add blueprint/ && git commit -m "watson: initialize Checkout Flow blueprint"
```

### Branch List with Context

```bash
# Source: 08-CONTEXT.md decisions — branch list for continue-existing path
# List local watson/* branches with last commit date

for branch in $(git branch --list 'watson/*' | sed 's/\* //'); do
  slug=${branch#watson/}
  last_date=$(git log "$branch" --max-count=1 --format="%cd" --date=short 2>/dev/null)
  # Read prototype_name from committed STATUS.md on that branch
  name=$(git show "$branch:blueprint/STATUS.md" 2>/dev/null | grep 'prototype_name:' | sed 's/prototype_name: //')
  echo "$branch | $name | $last_date"
done
```

### /tmp/watson-active.json Extended Schema

```json
// Source: 08-CONTEXT.md decisions
{
  "pendingWarningShown": false,
  "branch": "watson/checkout-flow",
  "actions": [
    "discussed checkout layout",
    "built Header section"
  ]
}
```

Watson writes this on activation using Edit tool to add the `branch` and `actions` fields. Subskills use Edit tool to append to `actions`.

### STATUS.md sessions: Population

```yaml
# Source: 08-CONTEXT.md decisions — session entry format
sessions:
  - timestamp: "2026-04-02T14:30:00Z"
    summary: "Discussed checkout layout, built Header section"
    who: "austindick"
  - timestamp: "2026-04-01T10:15:00Z"
    summary: "Initial blueprint scaffolding, discussed problem statement"
    who: "austindick"
```

Max 10 entries — when writing a new entry, if length >= 10, drop the last item before prepending.

### SessionEnd Hook Extension (settings.json)

```json
// Source: 08-CONTEXT.md decisions — hard-end fallback via temp file
"SessionEnd": [
  {
    "hooks": [
      {
        "type": "command",
        "command": "node -e \"const fs=require('fs'); const f='/tmp/watson-active.json'; if(!fs.existsSync(f)) process.exit(0); try { const s=JSON.parse(fs.readFileSync(f,'utf8')); if(s.branch) fs.writeFileSync('/tmp/watson-session-end.json', JSON.stringify({branch:s.branch,actions:s.actions||[],timestamp:new Date().toISOString()})); fs.unlinkSync(f); } catch(e) { try { fs.unlinkSync(f); } catch(e2) {} }\""
      }
    ]
  }
]
```

### status line Extension (share-proto-statusline.js)

```javascript
// Source: Existing share-proto-statusline.js watson indicator (line ~103-106)
// Extend to show branch name:
let watson = '';
if (fs.existsSync('/tmp/watson-active.json')) {
  try {
    const state = JSON.parse(fs.readFileSync('/tmp/watson-active.json', 'utf8'));
    const branch = state.branch ? ` (${state.branch.replace('watson/', '')})` : '';
    watson = ` \x1b[2m│\x1b[0m \x1b[36mWatson: ON${branch}\x1b[0m`;
  } catch (e) {
    watson = ` \x1b[2m│\x1b[0m \x1b[36mWatson: ON\x1b[0m`;
  }
}
```

### Session Recovery Check (SKILL.md — next-session start)

```
# Source: 08-CONTEXT.md decisions — hard-end recovery
On Watson activation (after writing /tmp/watson-active.json):
  Check if /tmp/watson-session-end.json exists
  If yes:
    Read {branch, actions, timestamp} from file
    Find STATUS.md at {branch} checkout or via git show
    Compile actions into summary (join with ", ", truncate at 80 chars)
    Prepend new sessions: entry (dropping oldest if count >= 10)
    Delete /tmp/watson-session-end.json
    Continue with normal activation flow
```

---

## State of the Art

| Old Approach | Phase 8 Approach | Impact |
|--------------|------------------|--------|
| Blueprint gate: check blueprint/ exists | 2-path fork: new vs continue as primary navigation | Cleaner UX — users always know which path they're on |
| No git branch management | watson/* branch per prototype | Prototype work is isolated; safe to experiment |
| STATUS.md `branch: ""` stub | STATUS.md `branch: "watson/{slug}"` populated at creation | Branch always traceable from prototype state |
| STATUS.md `sessions: []` stub | sessions: array populated at each session end | Session history surfaced at returning-prototype start |
| Watson shows "Watson: ON" in status line | Watson shows "Watson: ON (checkout-flow)" | Active branch visible without running git branch |
| Session end: rm state file only | Session end: write session entry then rm state file | History preserved across sessions |

**Deprecated after Phase 8:**
- The blueprint gate as primary entry point: replaced by the 2-path fork. Blueprint gate logic (check blueprint/ directory first) moves INSIDE the new prototype path as a validation step, not the routing entry.

---

## Open Questions

1. **SKILL.md line budget under the new fork**
   - What we know: Current SKILL.md is 179 lines; hard limit is 200; 2-path fork adds ~17 net lines by estimate
   - What's unclear: Exactly how much prose the fork section requires to be unambiguous
   - Recommendation: Draft SKILL.md changes first in Wave 1; count lines before committing. If over 195, compress the intent classification table (currently 7 lines) or move health check logic to watson-init.

2. **Branch ownership: git config vs STATUS.md**
   - What we know: Both signals are available; CONTEXT.md leaves this to Claude's discretion
   - What's unclear: Which is more reliable in a Faire team context where multiple engineers use the same machine
   - Recommendation: Use STATUS.md `owner_github` as primary — it was explicitly set by the prototype's creator and doesn't depend on machine-level git config. Fall back to git config if STATUS.md is missing or owner_github is empty.

3. **"Browse other prototypes" UX when no remote branches exist**
   - What we know: Remote watson/* branches require git fetch before listing
   - What's unclear: Whether Watson should auto-fetch or prompt to fetch
   - Recommendation: Auto-fetch with `git fetch --prune` before showing the remote branch list. If fetch fails (no network), show message: "Couldn't reach remote — showing local branches only."

4. **watson-init parameter API: who asks for prototype name?**
   - What we know: CONTEXT.md says "plain text question, not AskUserQuestion" for prototype name; watson-init currently doesn't collect prototype name
   - What's unclear: Whether the name is collected in SKILL.md before invoking watson-init, or watson-init now asks it internally
   - Recommendation: SKILL.md 2-path fork collects the name as a plain text Q before dispatching watson-init. Watson-init receives it as a parameter. This keeps SKILL.md's routing as the single entry point for user interaction.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — Watson is a Claude skill, behavioral testing only |
| Config file | none |
| Quick run command | Manual invocation in Playground |
| Full suite command | Manual E2E walkthrough of both paths |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SESS-01 | New prototype flow creates watson/{slug} branch with confirmation | manual-only | Start new prototype, observe branch creation with confirmation step | N/A |
| SESS-02 | Continue existing flow switches to correct watson/* branch with confirmation | manual-only | Select existing prototype from list, observe checkout with confirmation | N/A |
| SESS-03 | All branches follow watson/{slug} convention without exception | shell-verify | `git branch --list 'watson/*' \| grep -v '^watson/'` returns empty | N/A |
| SESS-04 | New session start surfaces watson/* branches; inactive ones tagged; delete offered | manual-only | With 30+ day inactive branch, observe tagging and delete option in list | N/A |

**Automated SESS-03 check:** Can be run after any branch creation to confirm naming compliance.

### Sampling Rate

- **Per task:** Manual spot-check — create a branch, verify name format and STATUS.md branch: field
- **Per wave:** Full E2E: new prototype (branch created from main) + continue existing (branch switch + context summary) + inactive cleanup (delete flow)
- **Phase gate:** Both paths demonstrably functional and all SESS requirements met before `/gsd:verify-work`

### Wave 0 Gaps

None — no automated test infrastructure needed. Watson skill behavioral tests are observational.

---

## Sources

### Primary (HIGH confidence)

- `/Users/austindick/.claude/skills/watson/SKILL.md` — Current implementation (179 lines), blueprint gate being replaced; existing /tmp/watson-active.json patterns
- `/Users/austindick/.claude/skills/watson/utilities/watson-init.md` — Blueprint scaffolding utility; receives new branch creation responsibility
- `/Users/austindick/.claude/settings.json` — SessionEnd hook (`rm -f /tmp/watson-active.json`); statusLine command configuration
- `/Users/austindick/.claude/hooks/share-proto-statusline.js` — Watson: ON indicator (lines 103-106); receives branch name extension
- `/Users/austindick/watson/.planning/phases/08-session-management/08-CONTEXT.md` — All locked decisions for Phase 8
- `/Users/austindick/watson/.planning/artifact-schemas/STATUS-EXAMPLE.md` — Canonical STATUS.md schema with branch: and sessions: stubs
- `/Users/austindick/watson/.planning/phases/07-draft-commit-amendment-model/07-02-PLAN.md` — Confirms SKILL.md at 179 lines post-Phase-7; pendingWarningShown pattern; /tmp/watson-active.json Edit tool pattern

### Secondary (MEDIUM confidence)

- `/Users/austindick/watson/.planning/phases/06-ambient-activation-status-md-schema/06-RESEARCH.md` — paths glob activation, STATUS.md schema rationale, Edit-not-Write constraint
- `/Users/austindick/watson/.planning/REQUIREMENTS.md` — SESS-01 through SESS-04 requirement definitions
- Git CLI documentation (confirmed via knowledge): `git branch --list`, `git show branch:path`, `--porcelain` flag behavior are stable, well-documented git features

### Tertiary (LOW confidence)

- None — all critical claims verified against project files or stable git CLI behavior

---

## Metadata

**Confidence breakdown:**
- Git operations and commands: HIGH — standard git CLI, no exotic flags
- SKILL.md routing replacement strategy: HIGH — derived directly from locked CONTEXT.md decisions
- SessionEnd hook two-channel approach: HIGH — constraint (hook is bash only) is verified from settings.json; solution is derived from constraint
- SKILL.md line budget: MEDIUM — estimate is based on counting; actual draft may differ by ±10 lines
- Branch ownership detection recommendation: MEDIUM — STATUS.md owner_github is more reliable in theory; actual Faire team workflow not tested

**Research date:** 2026-04-02
**Valid until:** 2026-06-01 (stable git CLI + stable Watson patterns)
