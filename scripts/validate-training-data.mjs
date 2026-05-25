import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'src/data/training/types.ts',
  'src/data/training/helpers.ts',
  'src/data/training/index.ts',
  'src/data/training/git.ts',
  'src/data/training/programming.ts',
  'src/data/training/linux.ts',
  'src/data/training/networking.ts',
  'src/data/training/serverManagement.ts',
  'src/data/training/containers.ts',
  'src/data/training/kubernetes.ts',
  'src/data/training/iac.ts',
  'src/data/training/cicd.ts',
  'src/data/training/observability.ts',
  'src/data/training/cloud.ts',
  'src/data/training/softwarePractices.ts'
];

const missing = requiredFiles.filter(file => !fs.existsSync(path.join(root, file)));

if (missing.length > 0) {
  console.error('Missing training files:');
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

const typesSource = fs.readFileSync(path.join(root, 'src/data/training/types.ts'), 'utf8');
const requiredTypeNames = [
  'ScenarioTier',
  'ScenarioQuest',
  'ScenarioModule',
  'ScenarioStep',
  'ScenarioQuizQuestion',
  'CommandExpectation'
];

const missingTypes = requiredTypeNames.filter(name => !typesSource.includes(name));
if (missingTypes.length > 0) {
  console.error(`Missing training type exports: ${missingTypes.join(', ')}`);
  process.exit(1);
}

const helpersSource = fs.readFileSync(path.join(root, 'src/data/training/helpers.ts'), 'utf8');
for (const helper of ['createQuest', 'createConceptQuiz']) {
  if (!helpersSource.includes(helper)) {
    console.error(`Missing helper: ${helper}`);
    process.exit(1);
  }
}

console.log('Training data scaffolding validation passed.');
