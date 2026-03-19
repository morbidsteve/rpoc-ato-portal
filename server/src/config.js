'use strict';

const path = require('node:path');

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,

  complianceDir:
    process.env.COMPLIANCE_DIR ||
    path.join(__dirname, '..', '..', 'compliance', 'raise'),

  page: {
    format: 'Letter',
    width: '8.5in',
    height: '11in',
    margin: {
      top: '0.85in',
      bottom: '0.85in',
      left: '0.75in',
      right: '0.75in',
    },
  },

  cuiBanner: 'CUI // SP-RAISE',

  requestTimeoutMs: 120_000,

  puppeteerExecutablePath:
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    findChromium(),
};

/**
 * Try common Chromium / Chrome paths for local development.
 * In Docker the env var will be set explicitly.
 */
function findChromium() {
  const fs = require('node:fs');
  const candidates = [
    '/usr/bin/chromium-browser',        // Alpine
    '/usr/bin/chromium',                 // Debian/Ubuntu
    '/usr/bin/google-chrome-stable',     // Chrome on Linux
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
  ];
  for (const p of candidates) {
    try {
      fs.accessSync(p, fs.constants.X_OK);
      return p;
    } catch {
      // not found, try next
    }
  }
  // Fall back — Puppeteer will throw a clear error if nothing works
  return '/usr/bin/chromium-browser';
}

module.exports = config;
