> **Beta** — internal Faire tool. DM Austin in Slack with questions.

# Watson

Watson helps you design and prototype UI components in the Faire Prototype Playground using Claude Code.

## Prerequisites

- Claude Code installed and working
- Figma MCP configured (see [Figma MCP Setup](#figma-mcp-setup) below)

## Install

Run these commands inside Claude Code:

```
/plugin marketplace add austindick/austins-stuff
/plugin install watson@austins-stuff
```

Then **quit and restart Claude Code**. `/watson` will not appear until after a full restart — `/reload-plugins` alone is not enough.

## Usage

Type `/watson` in Claude Code to start. Watson will ask whether you're starting a new prototype or continuing an existing one.

Other commands: `/watson:discuss`, `/watson:loupe`, `/watson:status`, `/watson:resume`, `/watson:off`.

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

**Watson does not respond to `/watson`**
Run `/reload-plugins`. If Watson is still missing, restart Claude Code completely.

**Figma MCP errors**
Make sure the Figma MCP server is running. Ask Claude "can you access Figma?" to diagnose — the response will indicate whether the MCP connection is live.
