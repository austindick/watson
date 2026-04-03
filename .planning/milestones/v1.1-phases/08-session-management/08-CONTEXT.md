# Phase 8: Session Management - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Watson manages prototype git branches on behalf of the user — new prototypes get a dedicated branch off main, returning sessions switch to the right branch, and orphaned branches are surfaced for cleanup. This phase also replaces the current blueprint gate routing with a clear 2-path fork at session start. It does NOT change discuss behavior, builder logic, or the draft/commit model (Phase 7).

</domain>

<decisions>
## Implementation Decisions

### Session start 2-path fork (replaces blueprint gate)
- Watson activation always presents two clear paths: "Start a new prototype" / "Continue working on an existing prototype"
- This replaces the current blueprint gate routing entirely — the 2-path fork becomes THE entry point after Watson is ON
- If no existing watson/* branches exist, "Continue existing" is absent or disabled
- Both paths lead to branch operations, then context summary + intent choices (discuss / build from Figma / just explore)

### Branch creation flow (new prototype path)
- Branch created during watson-init, inline in the setup summary — one confirmation step bundled with scaffold info
- Watson asks prototype name as a plain text question (not AskUserQuestion) — name only, no description (discuss captures that later)
- Always branches from main — never branch off own branches for new prototypes
- Watson pulls latest main before branching
- If uncommitted changes exist on current branch, Watson auto-commits: `watson: checkpoint before switching to {new-prototype}`
- After branch + blueprint scaffold, Watson presents standard intent choices (discuss / build from Figma / just explore)

### Branch naming convention
- All Watson branches follow `watson/{prototype-slug}` — no exceptions
- Slug derived from user-provided prototype name (kebab-case)
- STATUS.md `branch:` field populated immediately on creation
- State file `/tmp/watson-active.json` also tracks active branch name (for status line and /clear recovery)

### Branch conflict handling
- If `watson/{slug}` already exists when creating a new prototype, Watson flags it
- Offers two options: switch to the existing branch to continue working, or create a new branch with a number suffix
- Watson NEVER suggests erasing/starting fresh within an existing branch — that's only done manually via direct user prompting, never as a Watson suggestion

### Push to remote
- Watson does NOT push to GitHub immediately after branch creation
- Push happens on first build (when loupe produces output) — that's when there's meaningful code to share and a Vercel preview URL is useful
- Discuss-only sessions stay local

### Branch switching (continue existing path)
- "Continue existing" shows a list of watson/* branches with context: prototype name + last activity date
- Branches organized in two groups: user's own branches (primary), then "Browse other prototypes" expandable option for other users' branches
- Branch ownership determined at Claude's discretion (git config user vs STATUS.md owner_github)
- Auto-commit `watson: checkpoint` before switching (same pattern as new prototype)
- After switch: context summary (name, sections built, pending amendments, last session) + intent choices
- Light health check on switch: verify blueprint/ and STATUS.md exist; if missing, inform user and offer to re-scaffold

### Mid-session prototype switching
- Supported via intent classification — new entry in the intent table for "switch prototype / work on something else / open {name}"
- Watson auto-commits current work, switches branch, shows context summary for the new prototype
- Watson stays ON throughout the switch

### Collaboration (other users' branches)
- Browsing another user's prototype always creates a fork — never direct edits to another user's branch
- Fork uses standard `watson/{your-slug}` naming (user names their riff like a new prototype)
- Fork inherits all blueprint files from the source branch
- New STATUS.md created with current user as owner
- STATUS.md frontmatter tracks fork origin: `forked_from: watson/their-slug` and `forked_from_owner: theirusername`
- This is the ONE exception to "never branch off branches" — forking another user's work requires branching off their branch

### Missing branch recovery
- If a watson/* branch listed in STATUS.md no longer exists locally or remotely, Watson informs the user
- Offers alternatives: create a fresh branch with the same name, or go back to the branch list
- No silent fallback or auto-recreation

### Inactive branch cleanup
- Inactive = 30+ days with no commits on a watson/* branch
- Surfaced in the "Continue existing" branch list — inactive branches tagged visually, not a separate prompt
- Per-branch options when selecting an inactive branch: delete, continue working, reset inactive timer (resets the 30-day clock)
- Batch "clean up all inactive" option also available in the branch list
- Delete removes both local and remote branches (with confirmation)

### Session history tracking
- STATUS.md `sessions:` array tracks session entries (max 10, oldest dropped)
- Each entry records: timestamp (start), what was done (brief auto-generated summary), who (GitHub username)
- Session entry written on session end (deactivation via /watson off, prototype switch, or SessionEnd hook)
- "What was done" inferred from actions taken — each subskill/agent appends to an `actions` array in `/tmp/watson-active.json` during the session; compiled into summary at end
- Returning-prototype context summary shows last session only: "Last session: [date] by [user] — [what was done]"

### Claude's Discretion
- Branch ownership detection mechanism (git config user vs STATUS.md owner_github — pick the most reliable)
- Exact inactive branch visual tagging in the branch list
- How actions are appended to /tmp/watson-active.json by subskills (format and granularity)
- Session summary compilation logic (how raw actions become a readable one-liner)
- How the "Browse other prototypes" expandable option is presented (AskUserQuestion flow)
- Exact wording for branch conflict, missing branch, and health check messages

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SKILL.md` Routing section (lines 13-46): Currently has blueprint gate + STATUS.md routing — will be replaced by 2-path fork
- `watson-init.md`: Already scaffolds blueprint/ with STATUS.md including `branch: ""` and `sessions: []` stubs
- `STATUS-EXAMPLE.md`: Artifact schema with branch, sessions, and forked_from fields ready for Phase 8
- `/tmp/watson-active.json`: State file pattern — already tracks Watson ON/OFF and pendingWarningShown; will add branch name and actions array
- Status line script: Already shows "Watson: ON" — can extend to show active branch name
- Intent classification table in SKILL.md: Existing Tier 0/1/2/3 system — new "switch prototype" entry fits naturally

### Established Patterns
- Auto-commit pattern: `watson: checkpoint` message format for session management commits
- AskUserQuestion for routing decisions with 2-4 options
- YAML frontmatter in STATUS.md for machine-parseable state
- SessionEnd hook for cleanup (already deletes state file — extend to write session entry)
- Edit tool for STATUS.md frontmatter updates (never Write tool overwrite)

### Integration Points
- `SKILL.md`: Routing section rewritten from blueprint gate to 2-path fork; new intent classification entry for mid-session switching; branch operations before intent dispatch
- `watson-init.md`: Branch creation added after scaffold; prototype name prompt added before scaffold; STATUS.md branch field populated
- `/tmp/watson-active.json`: Gains `branch` field and `actions` array
- `STATUS.md` schema: `branch:`, `sessions:[]`, and `forked_from:`/`forked_from_owner:` fields populated
- SessionEnd hook: Extended to write session entry to STATUS.md before cleanup
- Status line script: Extended to show active branch name
- Subskills (discuss.md, loupe.md): Each appends to state file actions array when invoked

</code_context>

<specifics>
## Specific Ideas

- The 2-path fork is a deliberate UX improvement over the current flow which biases toward returning prototypes and makes starting fresh clunky
- "Never suggest erasing/starting fresh within an existing branch" is a hard guardrail — only manual user action can destroy branch work
- Collaboration is fork-based: you can see anyone's prototype but always work in your own branch. Origin tracked in STATUS.md for lineage
- Session history is lightweight and automatic — no user input required, actions inferred from what Watson did during the session
- The 30-day inactive threshold is generous — prototypes waiting for feedback or stakeholder review won't be prematurely flagged

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-session-management*
*Context gathered: 2026-04-02*
