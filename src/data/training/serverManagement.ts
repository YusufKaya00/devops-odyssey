import { createConceptQuiz, createModule } from './helpers';

export const serverManagementModule = createModule({
  id: 5,
  title: 'Server Management',
  icon: 'server',
  description: 'Operate web servers, reverse proxies, logs, reloads, and rollout safety.',
  detailedInfo: 'Server management connects application runtime, proxy configuration, logging, performance, and reliability practices.',
  outcomes: [
    'Configure reverse proxies and upstreams.',
    'Read web server logs during incidents.',
    'Reload and roll out configuration safely.'
  ],
  resources: [
    { name: 'The NGINX Handbook', url: 'https://www.freecodecamp.org/news/the-nginx-handbook/', free: true }
  ],
  quests: [],
  quiz: createConceptQuiz('Server Management', [])
});

