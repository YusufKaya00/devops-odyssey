import { createConceptQuiz, createModule } from './helpers';

export const cicdModule = createModule({
  id: 9,
  title: 'CI/CD Pipelines',
  icon: 'git-commit',
  description: 'Build safe delivery pipelines with tests, artifacts, secrets, approvals, and rollback.',
  detailedInfo: 'CI/CD automates verification and delivery so changes move through repeatable gates.',
  outcomes: [
    'Design build, test, scan, artifact, deploy, and rollback stages.',
    'Read failed job logs.',
    'Use secrets and environments safely.'
  ],
  resources: [
    { name: 'GitHub Actions Docs', url: 'https://docs.github.com/en/actions', free: true }
  ],
  quests: [],
  quiz: createConceptQuiz('CI/CD', [])
});

