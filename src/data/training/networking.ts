import { createConceptQuiz, createModule } from './helpers';

export const networkingModule = createModule({
  id: 4,
  title: 'Networking & Security',
  icon: 'shield',
  description: 'Understand DNS, ports, HTTP, TLS, firewalls, and secure service exposure.',
  detailedInfo: 'Networking knowledge lets DevOps engineers diagnose traffic paths from users to services and protect exposed systems.',
  outcomes: [
    'Trace failures across DNS, TCP, TLS, and HTTP.',
    'Model firewall and subnet rules.',
    'Identify unsafe network exposure.'
  ],
  resources: [
    { name: 'How DNS Works', url: 'https://howdns.works/', free: true },
    { name: 'How HTTPS Works', url: 'https://howhttps.works/', free: true }
  ],
  quests: [],
  quiz: createConceptQuiz('Networking and Security', [])
});

