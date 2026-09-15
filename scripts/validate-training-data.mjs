import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'vite';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const moduleIds = Array.from({ length: 12 }, (_, index) => index + 1);
const tiers = new Set(['Foundation', 'Operator', 'Senior', 'Capstone']);
const difficulties = new Set(['Beginner', 'Intermediate', 'Advanced']);
const moduleMetadata = ['keyConcepts', 'commandCheatSheet', 'learningPath', 'modulePrerequisites'];
const minimumQuests = [11, 10, 12, 11, 10, 12, 14, 12, 12, 11, 12, 11];

export async function loadTrainingData() {
  const entry = 'virtual:training-audit';
  // Use the installed compiler, without the app config, a server, or disk output.
  const result = await build({
    root: projectRoot,
    configFile: false,
    logLevel: 'silent',
    plugins: [{
      name: 'training-audit-entry',
      resolveId(id) { if (id === entry) return '\0' + entry; },
      load(id) {
        if (id !== '\0' + entry) return;
        return [
          'export { scenarioModules } from "/src/data/training/index.ts";',
          'export { roadmapModules } from "/src/data/roadmapData.ts";',
          'export { expandRoadmapModules } from "/src/data/additionalTraining.ts";',
          'export { createQuest, createConceptQuiz, createModule } from "/src/data/training/helpers.ts";'
        ].join('\n');
      }
    }],
    build: {
      write: false,
      minify: false,
      rolldownOptions: { input: entry },
      lib: { entry, formats: ['es'], fileName: 'training-audit' }
    }
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap(bundle => bundle.output);
  const chunks = outputs.filter(output => output.type === 'chunk');
  if (chunks.length !== 1 || chunks[0].imports.length || chunks[0].dynamicImports.length) {
    throw new Error('Training audit requires one self-contained data bundle.');
  }
  return import('data:text/javascript;base64,' + Buffer.from(chunks[0].code).toString('base64'));
}

export function validateTrainingData({ scenarioModules, roadmapModules }) {
  const errors = [];
  const warnings = [];
  const fail = (location, message) => errors.push(location + ': ' + message);
  const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const text = (value, location) => {
    if (typeof value !== 'string' || !value.trim()) fail(location, 'must be a non-empty string');
  };
  const object = (value, location) => {
    if (isObject(value)) return true;
    fail(location, 'must be an object');
    return false;
  };
  const array = (value, location, minimum = 0) => {
    if (!Array.isArray(value)) {
      fail(location, 'must be an array');
      return [];
    }
    if (value.length < minimum) fail(location, 'needs at least ' + minimum + ' entries; found ' + value.length);
    return value;
  };
  const strings = (value, location, minimum = 0, unique = true) => {
    const items = array(value, location, minimum);
    items.forEach((item, index) => text(item, location + '[' + index + ']'));
    if (unique && new Set(items).size !== items.length) fail(location, 'contains duplicate entries');
    return items;
  };
  const fields = (value, names, location) => names.forEach(name => text(value[name], location + '.' + name));
  const optionalFields = (value, names, location) => names.forEach(name => {
    if (value[name] !== undefined) text(value[name], location + '.' + name);
  });
  const records = (value, names, location, minimum = 0) => {
    const items = array(value, location, minimum);
    items.forEach((item, index) => {
      if (object(item, location + '[' + index + ']')) fields(item, names, location + '[' + index + ']');
    });
    return items;
  };

  function validateCatalog(catalog, name, scenario) {
    const modules = array(catalog, name, 12);
    const seenModules = new Set();
    const seenQuests = new Map();
    const seenValidators = new Set();
    const summary = [];
    for (const [moduleIndex, module] of modules.entries()) {
      const location = name + '[' + moduleIndex + ']';
      if (!object(module, location)) continue;
      if (!moduleIds.includes(module.id)) fail(location, 'invalid module ID ' + module.id + '; expected 1-12');
      if (seenModules.has(module.id)) fail(location, 'duplicate module ID ' + module.id);
      seenModules.add(module.id);
      fields(module, ['title', 'icon', 'description', 'detailedInfo'], location);
      if (scenario) strings(module.outcomes, location + '.outcomes', 1);
      optionalFields(module, ['learningPath'], location);
      if (module.modulePrerequisites !== undefined) strings(module.modulePrerequisites, location + '.modulePrerequisites');
      if (module.keyConcepts !== undefined) records(module.keyConcepts, ['title', 'description'], location + '.keyConcepts', 1);
      if (module.commandCheatSheet !== undefined) {
        const entries = records(module.commandCheatSheet, ['command', 'description'], location + '.commandCheatSheet', 1);
        entries.forEach((entry, index) => {
          if (isObject(entry)) optionalFields(entry, ['example'], location + '.commandCheatSheet[' + index + ']');
        });
      }
      const resources = array(module.resources, location + '.resources', 1);
      const resourceUrls = new Set();
      resources.forEach((resource, index) => {
        const resourceLocation = location + '.resources[' + index + ']';
        if (!object(resource, resourceLocation)) return;
        fields(resource, ['name', 'url'], resourceLocation);
        if (typeof resource.free !== 'boolean') fail(resourceLocation, 'free must be a boolean');
        try {
          const url = new URL(resource.url);
          if (!['http:', 'https:'].includes(url.protocol)) throw new Error('not a web URL');
        } catch { fail(resourceLocation, 'url must be an absolute HTTP(S) URL'); }
        if (resourceUrls.has(resource.url)) fail(resourceLocation, 'duplicate resource URL');
        resourceUrls.add(resource.url);
      });

      const questions = array(module.quiz, location + '.quiz', 8);
      const seenQuestions = new Set();
      questions.forEach((question, index) => {
        const questionLocation = location + '.quiz[' + index + ']';
        if (!object(question, questionLocation)) return;
        fields(question, ['question', 'explanation'], questionLocation);
        const options = strings(question.options, questionLocation + '.options', 2);
        if (!Number.isInteger(question.answerIndex) || question.answerIndex < 0 || question.answerIndex >= options.length) {
          fail(questionLocation, 'answerIndex must select an existing option');
        }
        if (seenQuestions.has(question.question)) fail(questionLocation, 'duplicate quiz question');
        seenQuestions.add(question.question);
      });
      if (scenario && questions.length && questions.every(question => isObject(question) && question.answerIndex === questions[0].answerIndex)) {
        warnings.push('Module ' + module.id + ': every quiz answer uses the same option index; review assessment quality.');
      }

      const quests = array(module.quests, location + '.quests', minimumQuests[module.id - 1] ?? 1);
      let stepCount = 0;
      quests.forEach((quest, index) => {
        const questLocation = location + '.quests[' + index + '] (' + (quest?.id ?? '?') + ')';
        if (!object(quest, questLocation)) return;
        fields(quest, ['id', 'title', 'objective', 'verificationCommand', 'validatorKey'], questLocation);
        if (seenQuests.has(quest.id)) fail(questLocation, 'duplicate quest ID ' + quest.id);
        seenQuests.set(quest.id, { quest, location: questLocation });
        if (seenValidators.has(quest.validatorKey)) fail(questLocation, 'duplicate validatorKey ' + quest.validatorKey);
        seenValidators.add(quest.validatorKey);
        if (!difficulties.has(quest.difficulty)) fail(questLocation, 'invalid difficulty ' + quest.difficulty);
        if (scenario || quest.tier !== undefined) {
          if (!tiers.has(quest.tier)) fail(questLocation, 'invalid tier ' + quest.tier);
          strings(quest.prerequisites, questLocation + '.prerequisites');
          strings(quest.skillOutcomes, questLocation + '.skillOutcomes', 1);
        } else if (quest.prerequisites !== undefined) {
          strings(quest.prerequisites, questLocation + '.prerequisites');
        }
        strings(quest.stepsWindows, questLocation + '.stepsWindows', 1, false);
        strings(quest.stepsLinux, questLocation + '.stepsLinux', 1, false);
        optionalFields(quest, ['hint', 'localValidatorKey', 'conceptSummary', 'architectureDiagram', 'realWorldScenario'], questLocation);
        if (quest.learningObjectives !== undefined) strings(quest.learningObjectives, questLocation + '.learningObjectives', 1);
        const steps = array(quest.interactiveSteps, questLocation + '.interactiveSteps', 1);
        stepCount += steps.length;
        steps.forEach((step, stepIndex) => {
          const stepLocation = questLocation + '.interactiveSteps[' + stepIndex + ']';
          if (!object(step, stepLocation)) return;
          fields(step, ['title', 'explanation', 'expectedCommand', 'hint'], stepLocation);
          // Real commands can succeed silently; empty mock output is valid.
          if (typeof step.mockOutput !== 'string') fail(stepLocation, 'mockOutput must be a string');
          if (step.acceptedCommands !== undefined) strings(step.acceptedCommands, stepLocation + '.acceptedCommands');
          optionalFields(step, ['realWorldContext'], stepLocation);
          for (const field of ['bestPractices', 'warnings']) {
            if (step[field] !== undefined) strings(step[field], stepLocation + '.' + field);
          }
          if (step.commandFlags !== undefined) records(step.commandFlags, ['flag', 'description'], stepLocation + '.commandFlags');
          if (step.commonMistakes !== undefined) records(step.commonMistakes, ['commandPattern', 'feedback'], stepLocation + '.commonMistakes');
        });
      });
      summary.push({ id: module.id, title: module.title, quests: quests.length, steps: stepCount, quiz: questions.length });
    }
    for (const id of moduleIds) if (!seenModules.has(id)) fail(name, 'missing module ID ' + id);

    // Resolve edges across the entire catalog before checking cycles.
    const visited = new Set();
    const visiting = new Set();
    function visit(id, trail = []) {
      if (visiting.has(id)) {
        fail(name, 'prerequisite cycle: ' + [...trail, id].join(' -> '));
        return;
      }
      if (visited.has(id)) return;
      const node = seenQuests.get(id);
      if (!node) return;
      visiting.add(id);
      for (const dependency of Array.isArray(node.quest.prerequisites) ? node.quest.prerequisites : []) {
        if (!seenQuests.has(dependency)) fail(node.location, 'unknown prerequisite ' + dependency);
        else visit(dependency, [...trail, id]);
      }
      visiting.delete(id);
      visited.add(id);
    }
    for (const id of seenQuests.keys()) visit(id);
    return summary;
  }

  const stats = {
    scenarioModules: validateCatalog(scenarioModules, 'scenarioModules', true),
    roadmapModules: validateCatalog(roadmapModules, 'roadmapModules', false)
  };
  if (Array.isArray(scenarioModules) && Array.isArray(roadmapModules)) {
    for (const source of scenarioModules.filter(isObject)) {
      const target = roadmapModules.find(module => isObject(module) && module.id === source.id);
      if (!target) continue;
      for (const field of moduleMetadata) {
        if (source[field] !== undefined && !isDeepStrictEqual(source[field], target[field])) {
          fail('roadmap module ' + source.id, 'lost or changed ' + field + ' metadata');
        }
      }
      // Compare complete records, including optional metadata, not source tokens.
      for (const [field, key] of [['quests', 'id'], ['quiz', 'question'], ['resources', 'url']]) {
        if (!Array.isArray(source[field]) || !Array.isArray(target[field])) continue;
        for (const entry of source[field].filter(isObject)) {
          const actual = target[field].find(candidate => isObject(candidate) && candidate[key] === entry[key]);
          if (!isDeepStrictEqual(entry, actual)) fail('roadmap module ' + source.id, 'missing or changed ' + field + ' entry ' + entry[key]);
        }
      }
    }
  }
  return { errors, warnings, stats };
}

async function main() {
  const result = validateTrainingData(await loadTrainingData());
  for (const [name, modules] of Object.entries(result.stats)) {
    console.log('\n' + name + ':');
    for (const module of modules) console.log('  ' + module.id + '. ' + module.title + ': ' + module.quests + ' quests, ' + module.steps + ' steps, ' + module.quiz + ' quiz questions');
    const total = modules.reduce((sum, module) => ({ quests: sum.quests + module.quests, steps: sum.steps + module.steps, quiz: sum.quiz + module.quiz }), { quests: 0, steps: 0, quiz: 0 });
    console.log('  Total: ' + modules.length + ' modules, ' + total.quests + ' quests, ' + total.steps + ' steps, ' + total.quiz + ' quiz questions');
  }
  for (const warning of result.warnings) console.warn('WARNING: ' + warning);
  if (result.errors.length) {
    for (const error of result.errors) console.error('ERROR: ' + error);
    process.exitCode = 1;
  } else {
    console.log('\nRuntime training integrity passed. This does not verify command execution or curriculum mastery.');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error('Training data could not be loaded: ' + error.message);
    process.exitCode = 1;
  });
}

