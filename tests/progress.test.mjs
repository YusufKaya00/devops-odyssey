import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateLevel } from '../server/progress.js';

test('maps advanced Git progress to a version-control level instead of Docker', () => {
  assert.deepEqual(calculateLevel(940), {
    level: 3,
    title: 'Version Control Operator',
    nextLevelXp: 1000
  });
});

test('moves Docker title to the post-Git threshold', () => {
  assert.deepEqual(calculateLevel(1000), {
    level: 4,
    title: 'Docker Operator',
    nextLevelXp: 1800
  });
});
