#!/usr/bin/env node
// watson-session-end.js — SessionEnd hook for Watson plugin
// Ported from inline Node.js one-liner in settings.json to a proper readable script.
// Preserves branch+actions state to /tmp/watson-session-end.json and cleans up the active file.

'use strict';

const fs = require('fs');

const ACTIVE_FILE = '/tmp/watson-active.json';
const SESSION_END_FILE = '/tmp/watson-session-end.json';

// No active session — nothing to do
if (!fs.existsSync(ACTIVE_FILE)) {
  process.exit(0);
}

try {
  const raw = fs.readFileSync(ACTIVE_FILE, 'utf8');
  const state = JSON.parse(raw);

  // Preserve branch and actions for post-session context
  if (state.branch) {
    fs.writeFileSync(SESSION_END_FILE, JSON.stringify({
      branch: state.branch,
      actions: state.actions || [],
      timestamp: new Date().toISOString()
    }));
  }

  // Clean up the active file
  fs.unlinkSync(ACTIVE_FILE);
} catch (e) {
  // On any error — still attempt to clean up the active file to avoid stale state
  try {
    fs.unlinkSync(ACTIVE_FILE);
  } catch (e2) {
    // Ignore cleanup failure
  }
}
