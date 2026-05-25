import { createConceptQuiz, createModule } from './helpers';

export const linuxModule = createModule({
  id: 3,
  title: 'Linux & Scripting',
  icon: 'terminal',
  description: 'Operate Linux systems and automate routine administration tasks.',
  detailedInfo: 'Linux is the runtime foundation for most servers, containers, CI runners, and Kubernetes nodes.',
  outcomes: [
    'Inspect files, processes, permissions, logs, and services.',
    'Use shell pipelines for operational investigation.',
    'Automate repeatable administration tasks safely.'
  ],
  resources: [
    { name: 'Bash Reference Manual', url: 'https://www.gnu.org/software/bash/manual/', free: true },
    { name: 'Linux Command Handbook', url: 'https://www.freecodecamp.org/news/the-linux-commands-handbook/', free: true }
  ],
  quests: [],
  quiz: createConceptQuiz('Linux and Scripting', [])
});

