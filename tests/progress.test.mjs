import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateLevel } from '../server/progress.js';

test('maps initial Git progress to Git Apprentice level', () => {
  // 940 XP is within Git Apprentice range (350-1799)
  assert.deepEqual(calculateLevel(940), {
    level: 2,
    title: 'Git Apprentice',
    nextLevelXp: 1800
  });
});

test('keeps Git Apprentice title until Code Scribe threshold is reached', () => {
  // 1000 XP is still Git Apprentice (350-1799)
  assert.deepEqual(calculateLevel(1000), {
    level: 2,
    title: 'Git Apprentice',
    nextLevelXp: 1800
  });
});

test('assigns Docker Operator title at containerization module threshold', () => {
  // 18000 XP is in Docker Operator range (16000-19999)
  assert.deepEqual(calculateLevel(18000), {
    level: 7,
    title: 'Docker Operator',
    nextLevelXp: 20000
  });
});

test('level 1 DevOps Novice for brand new users', () => {
  assert.deepEqual(calculateLevel(0), {
    level: 1,
    title: 'DevOps Novice',
    nextLevelXp: 350
  });
});

test('level 12 DevOps Grandmaster for max XP', () => {
  assert.deepEqual(calculateLevel(38000), {
    level: 12,
    title: 'DevOps Grandmaster',
    nextLevelXp: 40000
  });
});

test('transitions correctly at each boundary', () => {
  // Just below and at each threshold
  assert.equal(calculateLevel(349).level, 1);
  assert.equal(calculateLevel(350).level, 2);
  assert.equal(calculateLevel(1799).level, 2);
  assert.equal(calculateLevel(1800).level, 3);
  assert.equal(calculateLevel(4499).level, 3);
  assert.equal(calculateLevel(4500).level, 4);
  assert.equal(calculateLevel(7999).level, 4);
  assert.equal(calculateLevel(8000).level, 5);
  assert.equal(calculateLevel(11999).level, 5);
  assert.equal(calculateLevel(12000).level, 6);
  assert.equal(calculateLevel(15999).level, 6);
  assert.equal(calculateLevel(16000).level, 7);
  assert.equal(calculateLevel(19999).level, 7);
  assert.equal(calculateLevel(20000).level, 8);
  assert.equal(calculateLevel(24499).level, 8);
  assert.equal(calculateLevel(24500).level, 9);
  assert.equal(calculateLevel(27999).level, 9);
  assert.equal(calculateLevel(28000).level, 10);
  assert.equal(calculateLevel(31999).level, 10);
  assert.equal(calculateLevel(32000).level, 11);
  assert.equal(calculateLevel(35999).level, 11);
  assert.equal(calculateLevel(36000).level, 12);
});
