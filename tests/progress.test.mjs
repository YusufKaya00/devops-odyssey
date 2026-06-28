import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateLevel } from '../server/progress.js';

test('maps initial Git progress to Git Apprentice level', () => {
  assert.deepEqual(calculateLevel(940), {
    level: 2,
    title: 'Git Apprentice',
    nextLevelXp: 2500
  });
});

test('keeps Git Apprentice title until Linux threshold is reached', () => {
  assert.deepEqual(calculateLevel(1000), {
    level: 2,
    title: 'Git Apprentice',
    nextLevelXp: 2500
  });
});

test('assigns Docker Operator title at containerization module threshold', () => {
  assert.deepEqual(calculateLevel(11000), {
    level: 6,
    title: 'Docker Operator',
    nextLevelXp: 13000
  });
});
