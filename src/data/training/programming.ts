import { createConceptQuiz, createModule } from './helpers';

export const programmingModule = createModule({
  id: 2,
  title: 'Programming Language',
  icon: 'code',
  description: 'Write reliable automation scripts for DevOps workflows.',
  detailedInfo: 'DevOps engineers use programming to automate checks, parse logs, call APIs, generate reports, and build operational tools.',
  outcomes: [
    'Write CLI scripts with useful output and exit behavior.',
    'Parse logs and structured files.',
    'Build small automation tools that can run inside CI/CD.'
  ],
  resources: [
    { name: 'Automate the Boring Stuff with Python', url: 'https://automatetheboringstuff.com/', free: true },
    { name: 'Python Crash Course', url: 'https://ehmatthes.github.io/pcc/', free: true },
    { name: 'Go by Example', url: 'https://gobyexample.com/', free: true }
  ],
  quests: [],
  quiz: createConceptQuiz('Programming for DevOps', [])
});

