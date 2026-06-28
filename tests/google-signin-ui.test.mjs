import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const appSource = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const cssSource = fs.readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');

test('Google sign-in fallback uses dedicated neutral styling instead of primary CTA styling', () => {
  assert.match(appSource, /google-fallback-button/);
  assert.match(appSource, /compact \? 'compact' : 'profile'/);
  assert.match(appSource, /<GoogleFallbackButton compact \/>/);
  assert.match(appSource, /<GoogleFallbackButton \/>/);
  assert.doesNotMatch(appSource, /Sign in with Google[\s\S]{0,160}className="btn btn-primary"/);
});

test('Google sign-in UI copy remains English-only', () => {
  assert.doesNotMatch(appSource, /Google ile|Giriş|giriş|oturum|Çıkış|Profilim/);
});

test('Google sign-in styling is defined for compact and profile contexts', () => {
  assert.match(cssSource, /\.google-signin-slot/);
  assert.match(cssSource, /\.google-fallback-button\.compact/);
  assert.match(cssSource, /\.google-fallback-button\.profile/);
});
