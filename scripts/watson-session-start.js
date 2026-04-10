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

// Decline marker cleanup — ensure "don't ask again" resets each session
const DECLINE_FILE = '/tmp/watson-declined.json';
if (fs.existsSync(DECLINE_FILE)) {
  try {
    fs.unlinkSync(DECLINE_FILE);
  } catch (e) {
    // Non-critical — marker will be stale but won't cause errors
  }
}

// Session recovery check — notify if Watson was active before /clear
const ACTIVE_FILE = '/tmp/watson-active.json';
if (fs.existsSync(ACTIVE_FILE)) {
  console.log('\u26a1 Watson was active before /clear. Run /watson:resume to pick up where you left off.');
}
