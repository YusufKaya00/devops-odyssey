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

const programmingSource = fs.readFileSync(path.join(root, 'src/data/training/programming.ts'), 'utf8');
const programmingQuestIds = [
  'prog_cli_exit_codes',
  'prog_log_parser',
  'prog_json_health_report',
  'prog_yaml_validator',
  'prog_http_retry_checker',
  'prog_config_drift',
  'prog_concurrent_checker',
  'prog_deploy_report',
  'prog_script_unit_tests',
  'prog_incident_triage_capstone'
];

const missingProgrammingQuests = programmingQuestIds.filter(id => !programmingSource.includes(id));
if (missingProgrammingQuests.length > 0) {
  console.error('Missing programming quests:');
  for (const id of missingProgrammingQuests) {
    console.error(`- ${id}`);
  }
  process.exit(1);
}

const programmingQuestionCount = (programmingSource.match(/question:/g) || []).length;
if (programmingQuestionCount < 8) {
  console.error(`Programming module needs at least 8 quiz questions, found ${programmingQuestionCount}.`);
  process.exit(1);
}

const linuxSource = fs.readFileSync(path.join(root, 'src/data/training/linux.ts'), 'utf8');
const linuxQuestIds = [
  'linux_paths_filesystem',
  'linux_permissions_deep',
  'linux_process_triage',
  'linux_disk_memory',
  'linux_text_pipeline',
  'linux_bash_strict_mode',
  'linux_cron_logs',
  'linux_systemd_unit',
  'linux_ssh_keys',
  'linux_backup_restore',
  'linux_failure_modes',
  'linux_service_capstone'
];

const missingLinuxQuests = linuxQuestIds.filter(id => !linuxSource.includes(id));
if (missingLinuxQuests.length > 0) {
  console.error('Missing Linux quests:');
  for (const id of missingLinuxQuests) {
    console.error(`- ${id}`);
  }
  process.exit(1);
}

const linuxQuestionCount = (linuxSource.match(/question:/g) || []).length;
if (linuxQuestionCount < 8) {
  console.error(`Linux module needs at least 8 quiz questions, found ${linuxQuestionCount}.`);
  process.exit(1);
}

console.log('Training data scaffolding validation passed.');
