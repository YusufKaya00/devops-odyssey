import { createConceptQuiz, createModule } from './helpers';

export const containersModule = createModule({
  id: 6,
  title: 'Containers (Docker)',
  icon: 'package',
  description: 'Package, run, network, debug, and optimize containerized services.',
  detailedInfo: 'Containers make applications portable by packaging code, runtime, libraries, and configuration into repeatable images.',
  outcomes: [
    'Build and tag images.',
    'Debug container runtime, logs, networks, and volumes.',
    'Use Compose for multi-service local stacks.'
  ],
  resources: [
    { name: 'Docker Docs', url: 'https://docs.docker.com/', free: true }
  ],
  quests: [],
  quiz: createConceptQuiz('Containers', [])
});

