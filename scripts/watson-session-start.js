#!/usr/bin/env node
// watson-session-start.js — SessionStart hook for Design Toolkit plugin
// Removes old ambient rule on upgrade, then performs session recovery check.

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// Ambient rule removal — runs on every session start to clean up legacy installs
const AMBIENT_RULE = path.join(os.homedir(), '.claude', 'rules', 'watson-ambient.md');
if (fs.existsSync(AMBIENT_RULE)) {
  try {
    fs.unlinkSync(AMBIENT_RULE);
    console.log('\u2699\ufe0f Legacy ambient rule removed \u2014 Design Toolkit is now opt-in only.');
  } catch (e) {
    console.error('Warning: Could not remove old ambient rule:', e.message);
  }
}

// Decline marker cleanup — ensure "don't ask again" resets each session
const DECLINE_FILE = '/tmp/dt-declined.json';
if (fs.existsSync(DECLINE_FILE)) {
  try {
    fs.unlinkSync(DECLINE_FILE);
  } catch (e) {
    // Non-critical — marker will be stale but won't cause errors
  }
}

// Session recovery check — notify if session was active before /clear
const ACTIVE_FILE = '/tmp/dt-active.json';
if (fs.existsSync(ACTIVE_FILE)) {
  console.log('\u26a1 Session was active before /clear. Run /play continue to pick up where you left off.');
}
