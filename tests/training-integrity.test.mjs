import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadTrainingData, validateTrainingData } from '../scripts/validate-training-data.mjs';

const data = await loadTrainingData();
const fixture = () => ({
  scenarioModules: structuredClone(data.scenarioModules),
  roadmapModules: structuredClone(data.roadmapModules)
});

test('all 12 runtime modules have populated quests, steps, quizzes, and propagated metadata', () => {
  const result = validateTrainingData(data);
  assert.deepEqual(result.errors, []);
  for (const modules of Object.values(result.stats)) {
    assert.equal(modules.length, 12);
    assert.equal(new Set(modules.map(module => module.id)).size, 12);
    for (const module of modules) {
      assert.ok(module.quests > 0);
      assert.ok(module.steps >= module.quests);
      assert.ok(module.quiz >= 8);
    }
  }
});

test('each module is checked at runtime, not just by source-file tokens', async context => {
  for (let index = 0; index < 12; index++) {
    await context.test('empty module ' + (index + 1), () => {
      const broken = fixture();
      broken.scenarioModules[index].quests = [];
      broken.roadmapModules[index].quests = [];
      const { errors } = validateTrainingData(broken);
      assert.ok(errors.some(error => error.includes('scenarioModules[' + index + '].quests: needs at least')));
      assert.ok(errors.some(error => error.includes('roadmapModules[' + index + '].quests: needs at least')));
    });
  }
});

test('Git requires the established 11 quests in both catalogs', () => {
  const broken = fixture();
  broken.scenarioModules[0].quests = broken.scenarioModules[0].quests.slice(0, 10);
  broken.roadmapModules[0].quests = broken.roadmapModules[0].quests.slice(0, 10);
  const { errors } = validateTrainingData(broken);
  assert.match(errors.join('\n'), /scenarioModules\[0\]\.quests: needs at least 11 entries; found 10/);
  assert.match(errors.join('\n'), /roadmapModules\[0\]\.quests: needs at least 11 entries; found 10/);
});

test('the actual first five Git quests allow intentionally silent git diff output', () => {
  const quests = data.scenarioModules[0].quests.slice(0, 5);
  assert.equal(quests.length, 5);
  const steps = quests.flatMap(quest => quest.interactiveSteps);
  assert.ok(steps.some(step => step.expectedCommand === 'git diff' && step.mockOutput === ''));
  for (const step of steps) assert.equal(typeof step.mockOutput, 'string');
  assert.deepEqual(validateTrainingData(data).errors, []);
});

test('quiz rotation preserves original answer identity and options without mutating inputs', () => {
  for (const optionCount of [2, 3, 4, 5]) {
    for (let originalAnswerIndex = 0; originalAnswerIndex < optionCount; originalAnswerIndex++) {
      const originals = Array.from({ length: optionCount * 2 + 1 }, (_, index) => Object.freeze({
        question: 'Question ' + index,
        options: Object.freeze(Array.from({ length: optionCount }, (_, option) => 'Option ' + option)),
        answerIndex: originalAnswerIndex,
        explanation: 'Original explanation'
      }));
      Object.freeze(originals);
      const before = structuredClone(originals);
      const rotated = data.createConceptQuiz('Topic', originals);
      const distribution = Array(optionCount).fill(0);
      rotated.forEach((question, index) => {
        const original = originals[index];
        assert.equal(question.options[question.answerIndex], original.options[original.answerIndex]);
        assert.deepEqual([...question.options].sort(), [...original.options].sort());
        assert.equal(question.question, original.question);
        assert.equal(question.explanation, 'Topic: ' + original.explanation);
        assert.equal(question.answerIndex, index % optionCount);
        const offset = original.options.indexOf(question.options[0]);
        assert.deepEqual(question.options, [...original.options.slice(offset), ...original.options.slice(0, offset)]);
        distribution[question.answerIndex]++;
      });
      assert.ok(Math.max(...distribution) - Math.min(...distribution) <= 1);
      assert.deepEqual(originals, before);
      assert.deepEqual(data.createConceptQuiz('Topic', originals), rotated);
    }
  }
});

test('quiz rotation preserves mixed original answer positions and does not conceal invalid answers', () => {
  const originals = [3, 0, 2, 1, 0, 3, 1, 2].map((answerIndex, index) => ({
    question: 'Mixed question ' + index, options: ['First', 'Second', 'Third', 'Fourth'],
    answerIndex, explanation: 'Explanation'
  }));
  const rotated = data.createConceptQuiz('Mixed', originals);
  assert.deepEqual(rotated.map(question => question.answerIndex), [0, 1, 2, 3, 0, 1, 2, 3]);
  rotated.forEach((question, index) => {
    assert.equal(question.options[question.answerIndex], originals[index].options[originals[index].answerIndex]);
  });
  for (const answerIndex of [-1, 4, 0.5, NaN]) {
    const [invalid] = data.createConceptQuiz('Invalid', [{ ...originals[0], answerIndex }]);
    assert.equal(invalid.answerIndex, answerIndex);
    assert.deepEqual(invalid.options, originals[0].options);
  }
  const [empty] = data.createConceptQuiz('Empty', [{ ...originals[0], options: [], answerIndex: 0 }]);
  assert.deepEqual(empty.options, []);
  assert.equal(empty.answerIndex, 0);
  assert.deepEqual(data.createConceptQuiz('Empty', []), []);
});

test('runtime concept quizzes have balanced answer positions stable across process reloads', () => {
  const conceptModules = data.scenarioModules.filter(module => module.id !== 1);
  assert.equal(conceptModules.length, 11);
  for (const module of conceptModules) {
    assert.ok(module.quiz.every(question => question.options.length === 4));
    const distribution = Array(4).fill(0);
    module.quiz.forEach(question => distribution[question.answerIndex]++);
    assert.ok(distribution.every(count => count === 2), 'module ' + module.id);
  }
  const scriptUrl = new URL('../scripts/validate-training-data.mjs', import.meta.url).href;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e',
    'const { loadTrainingData } = await import(' + JSON.stringify(scriptUrl) + ');' +
    'const data = await loadTrainingData(); console.log(JSON.stringify(data.scenarioModules.map(module => module.quiz)));'
  ], { cwd: tmpdir(), encoding: 'utf8', timeout: 30000 });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), data.scenarioModules.map(module => module.quiz));
  assert.deepEqual(validateTrainingData(data).warnings, []);
});

const mutations = [
  ['missing module', modules => modules.pop(), /missing module ID 12/],
  ['duplicate module', modules => { modules[1].id = 1; }, /duplicate module ID 1/],
  ['invalid module ID', modules => { modules[0].id = 13; }, /invalid module ID 13/],
  ['duplicate quest across modules', modules => { modules[1].quests[0].id = modules[0].quests[0].id; }, /duplicate quest ID/],
  ['duplicate progress key', modules => { modules[1].quests[0].validatorKey = modules[0].quests[0].validatorKey; }, /duplicate validatorKey/],
  ['missing prerequisite', modules => { modules[1].quests[0].prerequisites = ['missing_quest']; }, /unknown prerequisite missing_quest/],
  ['duplicate prerequisite', modules => { const [first, second] = modules[1].quests; second.prerequisites = [first.id, first.id]; }, /prerequisites: contains duplicate/],
  ['self prerequisite', modules => { const quest = modules[1].quests[0]; quest.prerequisites = [quest.id]; }, /prerequisite cycle/],
  ['cross-module cycle', modules => {
    const first = modules[0].quests[0];
    const second = modules[1].quests[0];
    first.prerequisites = [second.id];
    second.prerequisites = [first.id];
  }, /prerequisite cycle/],
  ['invalid difficulty', modules => { modules[1].quests[0].difficulty = 'Expert'; }, /invalid difficulty/],
  ['invalid tier', modules => { modules[1].quests[0].tier = 'Expert'; }, /invalid tier/],
  ['empty quiz', modules => { modules[0].quiz = []; }, /quiz: needs at least 8/],
  ['out-of-range answer', modules => { modules[0].quiz[0].answerIndex = 99; }, /answerIndex must select/],
  ['fractional answer', modules => { modules[0].quiz[0].answerIndex = 0.5; }, /answerIndex must select/],
  ['duplicate option', modules => { modules[0].quiz[0].options[1] = modules[0].quiz[0].options[0]; }, /options: contains duplicate/],
  ['duplicate question', modules => { modules[0].quiz[1] = modules[0].quiz[0]; }, /duplicate quiz question/],
  ['empty command', modules => { modules[1].quests[0].interactiveSteps[0].expectedCommand = ' '; }, /expectedCommand: must be/],
  ['empty steps', modules => { modules[1].quests[0].interactiveSteps = []; }, /interactiveSteps: needs at least 1/],
  ['missing output', modules => { delete modules[1].quests[0].interactiveSteps[0].mockOutput; }, /mockOutput must be a string/],
  ['malformed command aliases', modules => { modules[1].quests[0].interactiveSteps[0].acceptedCommands = 'python'; }, /acceptedCommands: must be an array/],
  ['blank flag description', modules => { modules[1].quests[0].interactiveSteps[0].commandFlags = [{ flag: '-x', description: '' }]; }, /description: must be/],
  ['malformed cheat sheet', modules => { modules[0].commandCheatSheet = {}; }, /commandCheatSheet: must be an array/],
  ['unsafe resource URL', modules => { modules[0].resources[0].url = 'javascript:alert(1)'; }, /absolute HTTP\(S\) URL/],
  ['duplicate resource', modules => { modules[0].resources.push(modules[0].resources[0]); }, /duplicate resource URL/],
  ['malformed module', modules => { modules[0] = null; }, /must be an object/],
  ['malformed quest', modules => { modules[0].quests[0] = null; }, /must be an object/],
  ['malformed quiz', modules => { modules[0].quiz[0] = null; }, /must be an object/]
];

for (const [name, mutate, expected] of mutations) {
  test('rejects ' + name, () => {
    const broken = fixture();
    mutate(broken.scenarioModules);
    assert.match(validateTrainingData(broken).errors.join('\n'), expected);
  });
}

test('accepts silent output, repeated diagnostic commands, and acyclic cross-module prerequisites', () => {
  const valid = fixture();
  const quest = valid.scenarioModules[1].quests[0];
  quest.interactiveSteps[0].mockOutput = '';
  quest.stepsLinux.push(quest.stepsLinux[0]);
  quest.stepsWindows.push(quest.stepsWindows[0]);
  quest.prerequisites = [valid.scenarioModules[0].quests[0].id];
  valid.roadmapModules[1].quests = valid.roadmapModules[1].quests.map(existing => existing.id === quest.id ? quest : existing);
  assert.deepEqual(validateTrainingData(valid).errors, []);
});

test('detects missing source quests even when roadmap quest counts stay unchanged', () => {
  const broken = fixture();
  const quest = broken.roadmapModules[1].quests.find(quest => quest.id === broken.scenarioModules[1].quests[0].id);
  quest.id = 'renamed_quest';
  quest.validatorKey = 'renamed_quest';
  assert.match(validateTrainingData(broken).errors.join('\n'), /missing or changed quests entry/);
});

test('detects dropped module and step metadata after roadmap expansion', () => {
  const broken = fixture();
  delete broken.roadmapModules[0].keyConcepts;
  delete broken.roadmapModules[0].quests[0].interactiveSteps[0].bestPractices;
  const { errors } = validateTrainingData(broken);
  assert.match(errors.join('\n'), /lost or changed keyConcepts metadata/);
  assert.match(errors.join('\n'), /missing or changed quests entry/);
});

test('createQuest preserves every supported enrichment field and separates local and progress keys', () => {
  const input = {
    id: 'test_quest', title: 'Test', tier: 'Foundation', difficulty: 'Beginner',
    objective: 'Inspect state', prerequisites: ['earlier_quest'], skillOutcomes: ['Explain state'],
    conceptSummary: 'State summary', learningObjectives: ['Inspect state'],
    architectureDiagram: 'client -> server', realWorldScenario: 'Diagnose an outage',
    localValidatorKey: 'legacy_validator', hint: 'Inspect before changing',
    commands: [{
      title: 'Inspect', explanation: 'Read state', command: 'tool status', output: '', hint: 'Read status',
      acceptedCommands: ['tool inspect'], commonMistakes: [{ commandPattern: 'delete', feedback: 'Inspect first' }],
      commandFlags: [{ flag: '-v', description: 'Verbose' }], realWorldContext: 'Incident triage',
      bestPractices: ['Read logs'], warnings: ['Do not delete state']
    }]
  };
  const quest = data.createQuest(input);
  for (const field of ['conceptSummary', 'learningObjectives', 'architectureDiagram', 'realWorldScenario', 'prerequisites', 'skillOutcomes', 'localValidatorKey', 'hint']) {
    assert.deepEqual(quest[field], input[field]);
  }
  const { command, output, ...metadata } = input.commands[0];
  assert.deepEqual(quest.interactiveSteps[0], { ...metadata, expectedCommand: command, mockOutput: output });
  assert.equal(quest.validatorKey, input.id);
  assert.notEqual(quest.validatorKey, input.localValidatorKey);
  assert.match(quest.verificationCommand, /reference only, not verification/);
  const withoutLocalValidator = data.createQuest({ ...input, localValidatorKey: undefined });
  assert.match(withoutLocalValidator.verificationCommand, /no local execution is verified/);
});

test('expansion is idempotent, enriches Git, and retains legacy-only content and existing quiz questions', () => {
  const modules = structuredClone(data.roadmapModules);
  const extraQuestion = { question: 'Existing custom question?', options: ['Yes', 'No'], answerIndex: 0, explanation: 'Keep authored content.' };
  modules[1].quiz.unshift(extraQuestion);
  const before = structuredClone(modules);
  const expanded = data.expandRoadmapModules(modules);
  assert.deepEqual(modules, before, 'must not mutate the caller');
  assert.deepEqual(data.expandRoadmapModules(expanded), expanded);
  assert.ok(expanded[1].quests.some(quest => quest.id === 'py_health'));
  assert.ok(expanded[1].quiz.some(question => question.question === extraQuestion.question));
  assert.deepEqual(expanded[0].keyConcepts, data.scenarioModules[0].keyConcepts);
  assert.deepEqual(expanded[0].quests, data.scenarioModules[0].quests);
  const emptyQuiz = data.expandRoadmapModules([{ ...modules[1], quiz: [] }])[0];
  assert.deepEqual(emptyQuiz.quiz, data.scenarioModules[1].quiz);
  const unknownModule = { ...modules[0], id: 99 };
  assert.equal(data.expandRoadmapModules([unknownModule])[0], unknownModule);
});

test('CLI works outside the workspace and reports its actual runtime totals', () => {
  const script = fileURLToPath(new URL('../scripts/validate-training-data.mjs', import.meta.url));
  const result = spawnSync(process.execPath, [script], { cwd: tmpdir(), encoding: 'utf8', timeout: 30000 });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Total: 12 modules, \d+ quests, \d+ steps, \d+ quiz questions/);
  assert.match(result.stdout, /Runtime training integrity passed/);
});
