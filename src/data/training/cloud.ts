import { createConceptQuiz, createModule } from './helpers';

export const cloudModule = createModule({
  id: 11,
  title: 'Cloud Provider',
  icon: 'cloud',
  description: 'Operate IAM, networking, compute, storage, managed services, cost, and reliability in cloud environments.',
  detailedInfo: 'Cloud providers expose infrastructure through APIs, identity boundaries, managed services, and global networks.',
  outcomes: [
    'Apply least-privilege IAM thinking.',
    'Design basic cloud networks and service environments.',
    'Connect cost, security, and reliability practices.'
  ],
  resources: [
    { name: 'AWS Well-Architected', url: 'https://aws.amazon.com/architecture/well-architected/', free: true }
  ],
  quests: [],
  quiz: createConceptQuiz('Cloud', [])
});

