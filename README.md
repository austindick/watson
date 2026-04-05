> **Beta** — internal Faire tool. DM Austin in Slack with questions.

# Watson

Watson helps you design and prototype UI components in the Faire Prototype Playground using Claude Code.

## Prerequisites

- Claude Code installed and working
- Figma MCP configured (see [Figma MCP Setup](#figma-mcp-setup) below)

## Install

Run these three commands inside Claude Code:

```
/plugin marketplace add austindick/austindick-skills
/plugin install watson@austindick-skills
/reload-plugins
```

Then restart Claude Code for the skill to appear.

Copy the ambient rule so Watson activates automatically when you open the Playground:

```bash
cp ~/.claude/plugins/cache/austindick-skills/watson/*/skills/core/references/watson-ambient.md ~/.claude/rules/watson-ambient.md
```

> Note: the `*` in the path handles any version number in the cache directory.

## Figma MCP Setup

1. Install the Figma MCP server from the [Figma Plugin Marketplace](https://www.figma.com/community/plugin/mcp).
2. Add Figma MCP to your Claude Code settings — open `~/.claude/settings.json` and add `"figma"` to the `mcpServers` block.
3. Verify the connection: ask Claude "can you access Figma?" — it should confirm the MCP is active.

## Auto-Update (Optional)

To receive future Watson updates automatically:

```
/plugin -> Marketplaces tab -> select "watson" -> Enable auto-update
```

Or update manually at any time:

```
/plugin marketplace update watson
```

## Versioning

Watson version bumps on every push to main — patch for fixes (1.2.0 → 1.2.1), minor for new features (1.2.1 → 1.3.0). If auto-update is enabled, updates apply silently. If not, run `/plugin marketplace update watson` to pull the latest version. You will only hear from Austin in Slack for breaking changes (e.g., a required Figma MCP version bump).

## Troubleshooting

**`/watson` not found after install**
Run `/reload-plugins`. If Watson is still missing, restart Claude Code and try `/reload-plugins` again.

**Watson does not suggest itself in the Playground**
Check that `~/.claude/rules/watson-ambient.md` exists. If missing, re-run the `cp` command from the Install section above.

**Figma MCP errors**
Make sure the Figma MCP server is running. Ask Claude "can you access Figma?" to diagnose — the response will indicate whether the MCP connection is live.
