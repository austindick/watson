#!/usr/bin/env node
// watson-session-start.js — SessionStart hook for Watson plugin
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
    console.log('\u2699\ufe0f Watson ambient rule removed \u2014 Watson is now opt-in only.');
  } catch (e) {
    console.error('Warning: Could not remove old Watson ambient rule:', e.message);
  }
}

// Session recovery check — notify if Watson was active before /clear
const ACTIVE_FILE = '/tmp/watson-active.json';
if (fs.existsSync(ACTIVE_FILE)) {
  console.log('\u26a1 Watson was active before /clear. Run /watson to reactivate.');
}
