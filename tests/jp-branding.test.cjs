'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'assets/site.css'), 'utf8');
const logo = fs.readFileSync(path.join(root, 'assets/jm-official-logo.webp'));

test('the exact business-card-derived JM logo asset is shipped', () => {
  assert.equal(logo.subarray(0,4).toString('ascii'), 'RIFF');
  assert.equal(logo.subarray(8,12).toString('ascii'), 'WEBP');
  assert.match(html, /class="official-brand-img" src="\/assets\/jm-official-logo.webp"/);
});

test('new business-card contact and office details appear', () => {
  assert.match(html, /Johannes Pieterse/);
  assert.match(html, /Managing Director/);
  assert.match(html, /Moreletapark, Pretoria East/);
  assert.match(html, /href="tel:\+27711342523"/);
  assert.match(html, /href="mailto:johannes.healthandsafety@gmail.com"/);
  assert.match(html, /wa\.me\/27711342523/);
  assert.match(html, /JMHealthAndSafetyConsultants/);
});

test('official brand social icons are present without guessing profile links', () => {
  assert.match(html, /facebook-icon/);
  assert.match(html, /instagram-icon/);
  assert.doesNotMatch(html, /href="https:\/\/(?:www\.)?(?:facebook|instagram)\.com\/JMHealthAndSafetyConsultants/);
});

test('business-card focus areas and services remain', () => {
  for(const title of ['Health &amp; Safety', 'Compliance &amp;', 'Construction', 'Risk Assessments', 'Site-specific', 'PPE', 'Occupational', 'training']) {
    assert.ok(html.includes(title), title);
  }
});

test('new sections have desktop and mobile styling; old reveal bug is absent', () => {
  assert.match(css, /\.jp-profile-layout/);
  assert.match(css, /\.jp-capabilities-grid/);
  assert.match(css, /@media\(max-width:520px\)/);
  assert.doesNotMatch(html, /html\.js \[data-reveal\]\{opacity:0/);
});
