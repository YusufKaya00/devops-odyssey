import { createConceptQuiz, createModule } from './helpers';

export const iacModule = createModule({
  id: 8,
  title: 'Infrastructure as Code',
  icon: 'layers',
  description: 'Provision, review, and repair infrastructure through declarative code.',
  detailedInfo: 'Infrastructure as Code makes environments repeatable, reviewable, and auditable.',
  outcomes: [
    'Review Terraform plans before apply.',
    'Understand state, drift, variables, modules, and providers.',
    'Use Ansible-style configuration automation concepts.'
  ],
  resources: [
    { name: 'Terraform Tutorials', url: 'https://developer.hashicorp.com/terraform/tutorials', free: true },
    { name: 'Ansible Getting Started', url: 'https://docs.ansible.com/ansible/latest/getting_started/', free: true }
  ],
  quests: [],
  quiz: createConceptQuiz('Infrastructure as Code', [])
});

