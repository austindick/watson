#!/usr/bin/env node
// watson-statusline.js — Forked from ~/.claude/hooks/share-proto-statusline.js
// Changes: removed standalone local dev server block (was lines 75-87 of original)
// Keeps: OSC 8 link helper, portOpen, stdin parsing, context bar, share-proto tunnel links,
//        git branch, DT active indicator, stdout.write
const fs = require('fs');
const path = require('path');
const net = require('net');

// OSC 8 clickable link helper
const link = (url, label) => `\x1b]8;;${url}\x07${label}\x1b]8;;\x07`;

// Quick TCP port check (resolves true/false)
function portOpen(port) {
  return new Promise(resolve => {
    const sock = net.createConnection({ port, timeout: 150 }, () => {
      sock.destroy();
      resolve(true);
    });
    sock.on('error', () => resolve(false));
    sock.on('timeout', () => { sock.destroy(); resolve(false); });
  });
}

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', async () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const model = data.model?.display_name || 'Claude';
    const dir = path.basename(data.workspace?.current_dir || process.cwd());
    const remaining = data.context_window?.remaining_percentage;

    // Context bar
    let ctx = '';
    if (remaining != null) {
      const bufferPct = 16.5;
      const usable = Math.max(0, ((remaining - bufferPct) / (100 - bufferPct)) * 100);
      const used = Math.max(0, Math.min(100, Math.round(100 - usable)));
      const filled = Math.floor(used / 10);
      const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(10 - filled);
      const color = used < 50 ? '32' : used < 65 ? '33' : used < 80 ? '38;5;208' : '5;31';
      ctx = ` \x1b[${color}m${bar} ${used}%\x1b[0m`;
    }

    // Share-proto links (only show after /share-proto has been run in THIS tab)
    let proto = '';
    const stateFile = '/tmp/share-proto.json';

    if (fs.existsSync(stateFile)) {
      try {
        const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));

        // Only show links if this tab created the tunnel
        if (state.claudePid === process.ppid && state.port && state.deepLinkUrl) {
          const protoPath = state.deepLinkUrl.replace(/https?:\/\/[^/]+/, '');
          const localUrl = `http://localhost:${state.port}${protoPath}`;
          const localUp = await portOpen(state.port);

          // Check if tunnel process is still alive
          let tunnelAlive = false;
          if (state.pid) {
            try { process.kill(state.pid, 0); tunnelAlive = true; } catch (e) {}
          }

          if (localUp && tunnelAlive) {
            proto = ` \x1b[2m│\x1b[0m \x1b[36m${link(localUrl, 'Local')} \x1b[2m│\x1b[0m ${link(state.deepLinkUrl, 'Public preview')}\x1b[0m`;
          } else if (localUp) {
            proto = ` \x1b[2m│\x1b[0m \x1b[36m${link(localUrl, 'Local')}\x1b[0m`;
          }
        }
      } catch (e) {}
    }

    // Git branch (best-effort, skip all locks)
    let branch = '';
    try {
      const cwd = data.workspace?.current_dir || process.cwd();
      const { execSync } = require('child_process');
      const raw = execSync('git -c core.fsmonitor="" -c gc.auto=0 symbolic-ref --short HEAD 2>/dev/null', {
        cwd,
        timeout: 500,
        stdio: ['ignore', 'pipe', 'ignore']
      }).toString().trim();
      if (raw) branch = ` \x1b[2m│\x1b[0m \x1b[35m${raw}\x1b[0m`;
    } catch (e) {}

    // DT active indicator
    let dtActive = '';
    if (fs.existsSync('/tmp/dt-active.json')) {
      try {
        const state = JSON.parse(fs.readFileSync('/tmp/dt-active.json', 'utf8'));
        const branchLabel = state.branch ? ` (${state.branch.replace('dt/', '')})` : '';
        dtActive = ` \x1b[2m│\x1b[0m \x1b[36mDT: ON${branchLabel}\x1b[0m`;
      } catch (e) {
        dtActive = ` \x1b[2m│\x1b[0m \x1b[36mDT: ON\x1b[0m`;
      }
    }

    process.stdout.write(`\x1b[2m${model}\x1b[0m \x1b[2m│\x1b[0m \x1b[2m${dir}\x1b[0m${branch}${ctx}${proto}${dtActive}`);
  } catch (e) {}
});
