#!/usr/bin/env node
// watson-session-start.js — SessionStart hook for Watson plugin
// Lightweight recovery check only. Watson activates on-demand via /watson.

'use strict';

const fs = require('fs');

const ACTIVE_FILE = '/tmp/watson-active.json';
if (fs.existsSync(ACTIVE_FILE)) {
  console.log('\u26a1 Watson was active before /clear. Run /watson to reactivate.');
}
