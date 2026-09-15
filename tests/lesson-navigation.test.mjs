import test from 'node:test';
import assert from 'node:assert/strict';
import { completeLessonStep, getLessonNavigation, mergeLessonProgress } from '../src/lessonNavigation.ts';

const emptyProgress = () => ({ completedQuests: [], completedSteps: [], experiencePoints: 0, stepNotes: {} });
const navigate = (progress, selectedIndex = null, count = 4) => getLessonNavigation('lab', count, progress, selectedIndex);

test('opens the first uncompleted step while ignoring progress from other quests', () => {
  const progress = { ...emptyProgress(), completedSteps: ['other:1', 'lab:0', 'lab:3'] };
  assert.equal(navigate(progress).activeStepIndex, 1);
  assert.deepEqual(navigate(progress).stepCompleted, [true, false, false, true]);
});

test('previous, next, and arbitrary selection do not complete skipped steps or award XP', () => {
  const progress = emptyProgress();
  const before = structuredClone(progress);
  for (const index of [1, 3, 0, 2]) {
    const state = navigate(progress, index);
    assert.equal(state.activeStepIndex, index);
    assert.equal(state.completedCount, 0);
    assert.equal(state.allStepsComplete, false);
  }
  assert.deepEqual(progress, before);
});

test('navigation clamps boundary indices and exposes disabled previous/next controls', () => {
  assert.equal(navigate(emptyProgress(), -1).activeStepIndex, 0);
  assert.equal(navigate(emptyProgress(), 99).activeStepIndex, 3);
  assert.equal(navigate(emptyProgress(), NaN).activeStepIndex, 0);
  assert.equal(navigate(emptyProgress(), 0).canGoPrevious, false);
  assert.equal(navigate(emptyProgress(), 0).canGoNext, true);
  assert.equal(navigate(emptyProgress(), 3).canGoNext, false);
});

test('successful last step alone does not complete a quest with skipped steps', () => {
  const progress = completeLessonStep(emptyProgress(), 'lab', 4, 3);
  assert.deepEqual(progress.completedSteps, ['lab:3']);
  assert.deepEqual(progress.completedQuests, []);
  assert.equal(progress.experiencePoints, 20);
  assert.equal(navigate(progress, 3).allStepsComplete, false);
});

test('out-of-order completion finishes only when every real step is complete', () => {
  let progress = emptyProgress();
  for (const step of [3, 1, 0]) {
    progress = completeLessonStep(progress, 'lab', 4, step);
    assert.equal(navigate(progress, 3).allStepsComplete, false);
  }
  progress = completeLessonStep(progress, 'lab', 4, 2);
  assert.equal(navigate(progress, 1).allStepsComplete, true);
  assert.equal(navigate(progress, 1).activeStepIndex, 1);
  assert.equal(progress.experiencePoints, 80);
});

test('repeating a completed step is idempotent and cannot duplicate rewards', () => {
  const progress = completeLessonStep(emptyProgress(), 'lab', 4, 1);
  assert.equal(completeLessonStep(progress, 'lab', 4, 1), progress);
  assert.equal(progress.experiencePoints, 20);
});

test('invalid completion callbacks and zero-step lessons do not award progress', () => {
  const progress = emptyProgress();
  for (const step of [-1, 4, NaN, 1.5, Infinity]) {
    assert.equal(completeLessonStep(progress, 'lab', 4, step), progress);
  }
  assert.equal(completeLessonStep(progress, 'lab', 0, 0), progress);
  const state = navigate(progress, null, 0);
  assert.equal(state.activeStepIndex, null);
  assert.equal(state.noteKey, null);
  assert.equal(state.allStepsComplete, false);
  assert.equal(state.canGoPrevious, false);
  assert.equal(state.canGoNext, false);
});

test('completed quests remain freely reviewable including legacy quest-only progress', () => {
  const progress = { ...emptyProgress(), completedQuests: ['lab'], experiencePoints: 100 };
  assert.equal(navigate(progress).activeStepIndex, 0);
  assert.equal(navigate(progress, 2).activeStepIndex, 2);
  assert.equal(navigate(progress, 2).allStepsComplete, true);
  assert.equal(completeLessonStep(progress, 'lab', 4, 2), progress);
});

test('selection stays on the same step when progress changes', () => {
  const progress = completeLessonStep(emptyProgress(), 'lab', 4, 0);
  assert.equal(navigate(progress, 0).activeStepIndex, 0);
  assert.equal(navigate(progress, 2).activeStepIndex, 2);
  assert.equal(navigate(progress, 1).noteKey, 'lab:1');
});

test('notes follow selection, not first incomplete step, and remain isolated by quest', () => {
  const progress = { ...emptyProgress(), stepNotes: { 'lab:0': 'draft A', 'lab:3': 'draft B', 'other:3': 'other' } };
  for (const [index, text] of [[3, 'draft B'], [0, 'draft A'], [3, 'draft B']]) {
    assert.equal(progress.stepNotes[navigate(progress, index).noteKey], text);
  }
  assert.equal(getLessonNavigation('other', 4, progress, 3).noteKey, 'other:3');
  assert.deepEqual(progress.completedSteps, []);
});

test('late server responses preserve newer progress, edited notes, and deleted note text', () => {
  const incoming = { ...emptyProgress(), completedSteps: ['lab:0'], experiencePoints: 20,
    stepNotes: { 'lab:0': 'old draft', 'lab:1': 'deleted text', 'remote:0': 'remote note' } };
  const current = { ...emptyProgress(), completedSteps: ['lab:0', 'lab:3'], experiencePoints: 40,
    stepNotes: { 'lab:0': 'current draft', 'lab:1': '', 'lab:3': 'unsynced draft' } };
  const merged = mergeLessonProgress(current, incoming);
  assert.deepEqual(merged.completedSteps, ['lab:0', 'lab:3']);
  assert.equal(merged.experiencePoints, 40);
  assert.deepEqual(merged.stepNotes, {
    'lab:0': 'current draft', 'lab:1': '', 'remote:0': 'remote note', 'lab:3': 'unsynced draft',
  });
  assert.equal(navigate(merged, 3).allStepsComplete, false);
  assert.equal(current.stepNotes['remote:0'], undefined);
});

test('a verification response merges quest completion without losing unrelated progress', () => {
  const current = { ...emptyProgress(), completedQuests: ['other'], completedSteps: ['lab:2'], experiencePoints: 120 };
  const incoming = { ...emptyProgress(), completedQuests: ['lab'], completedSteps: ['lab:0'], experiencePoints: 200 };
  const merged = mergeLessonProgress(current, incoming);
  assert.deepEqual(merged.completedQuests, ['lab', 'other']);
  assert.deepEqual(merged.completedSteps, ['lab:0', 'lab:2']);
  assert.equal(merged.experiencePoints, 200);
});
