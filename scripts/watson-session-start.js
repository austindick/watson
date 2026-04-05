#!/usr/bin/env node
// watson-session-start.js — SessionStart hook for Watson plugin
// Responsibilities:
//   1. Recovery notification (existing behavior, ported from settings.json bash one-liner)
//   2. First-run: auto-copy watson-ambient.md to ~/.claude/rules/ if missing
//   3. First-run: auto-write statusLine to ~/.claude/settings.json if not already configured

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// ── 1. Recovery notification ──────────────────────────────────────────────────
const ACTIVE_FILE = '/tmp/watson-active.json';
if (fs.existsSync(ACTIVE_FILE)) {
  console.log('\u26a1 Watson was active before /clear. Run /watson to reactivate.');
}

// ── 2. Ambient rule auto-copy ─────────────────────────────────────────────────
// Source lives in the plugin's skill references directory.
// Use __dirname (reliable regardless of how this script is invoked) rather than
// CLAUDE_PLUGIN_ROOT env var (substituted in command string only, not exported to process.env).
const RULES_DIR = path.join(os.homedir(), '.claude', 'rules');
const RULE_TARGET = path.join(RULES_DIR, 'watson-ambient.md');
const RULE_SOURCE = path.join(__dirname, '..', 'skills', 'watson', 'references', 'watson-ambient.md');

if (!fs.existsSync(RULE_TARGET) && fs.existsSync(RULE_SOURCE)) {
  try {
    fs.mkdirSync(RULES_DIR, { recursive: true });
    fs.copyFileSync(RULE_SOURCE, RULE_TARGET);
    console.log('Watson: installed ambient rule \u2192 ~/.claude/rules/watson-ambient.md');
  } catch (e) {
    console.error('Watson: failed to install ambient rule:', e.message);
  }
}
// else: target exists or source missing — silent skip

// ── 3. StatusLine auto-write ──────────────────────────────────────────────────
// Auto-write only if:
//   (a) statusLine is missing entirely, OR
//   (b) statusLine currently points to share-proto-statusline.js (author migration case)
// If it already points to watson-statusline.js or any other custom script — skip.
const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');
const PLUGIN_ROOT = path.resolve(__dirname, '..');
const WATSON_STATUSLINE_CMD = `node "${PLUGIN_ROOT}/scripts/watson-statusline.js"`;

let settings = {};
try {
  settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
} catch (e) {
  if (e.code === 'ENOENT') {
    // No settings file yet — start fresh
    settings = {};
  } else if (e instanceof SyntaxError) {
    // Corrupt settings.json — do not overwrite, log and bail
    console.error('Watson: settings.json parse error — skipping statusLine auto-write:', e.message);
    process.exit(0);
  } else {
    throw e;
  }
}

const currentCmd = settings.statusLine?.command || '';
const alreadyWatson = currentCmd.includes('watson-statusline');
const isShareProto = currentCmd.includes('share-proto-statusline');
const isMissing = !settings.statusLine;

if (isMissing || isShareProto) {
  settings.statusLine = {
    type: 'command',
    command: WATSON_STATUSLINE_CMD
  };
  try {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n');
    console.log('Watson: statusLine configured \u2192 ' + WATSON_STATUSLINE_CMD);
  } catch (e) {
    console.error('Watson: failed to write statusLine config:', e.message);
  }
}
// else: already points to watson-statusline.js or other custom script — silent skip
