import { createConceptQuiz, createModule } from './helpers';

export const softwarePracticesModule = createModule({
  id: 12,
  title: 'Software Engineering Practices',
  icon: 'users',
  description: 'Connect DevOps work to SDLC, agile flow, tests, releases, incidents, and delivery metrics.',
  detailedInfo: 'DevOps is a socio-technical practice: tooling only works when teams can plan, review, release, observe, and improve together.',
  outcomes: [
    'Model delivery flow from backlog to release.',
    'Use tests and reviews as quality gates.',
    'Learn from incidents and measure delivery performance.'
  ],
  resources: [
    { name: 'What is Scrum?', url: 'https://www.atlassian.com/agile/scrum', free: true },
    { name: 'DORA', url: 'https://dora.dev/', free: true }
  ],
  quests: [],
  quiz: createConceptQuiz('Software Engineering Practices', [])
});

