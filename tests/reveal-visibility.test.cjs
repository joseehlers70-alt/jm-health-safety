'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets', 'site.css'), 'utf8');

test('page content is never hidden by default pending JavaScript', () => {
  assert.match(html, /html\.js \[data-reveal\]\{opacity:1;transform:none;/);
  assert.doesNotMatch(html, /html\.js \[data-reveal\]\{opacity:0;/);
  assert.match(css, /html\.js \[data-reveal\]\.visible\{opacity:1;transform:none\}/);
});

test('reveal motion respects reduced-motion preferences', () => {
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)/);
  assert.match(css, /html\.js \[data-reveal\]\.visible\{animation:none\}/);
});

test('hero and safety gallery image references are in place', () => {
  assert.match(html, /class="safety-art" src="\/assets\/safety-team\.webp"/);
  assert.match(html, /class="photo-stories"/);
  assert.match(html, /class="photo-story"/);
});
